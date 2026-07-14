import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { db } from '../../database/connection.js';
import { ApplicationError } from '../../errors/applicationError.js';
import { VideoModel } from '../../models/Video.model.js';
import {
  escapeDrawtext,
  drawtextFontOption,
  getVideoInput,
  hasAudioStream,
  MediaInputError,
  publicVideo,
  runFfmpeg,
  storeProcessedVideo,
  textPosition,
  withMediaTemp,
} from '../../services/localMedia.service.js';
import { resolveUserId } from '../../services/auth.service.js';
import { getStorageProvider } from '../../services/storage/storageRegistry.js';
import { extractVideoMetadata } from '../../services/videoMetadata.service.js';
import { retentionExpiry } from '../../services/mediaRetention.service.js';

const videoIdSchema = z.string().uuid();
const uploadedAssets = new Map<string, { key: string; mimeType: string }>();
const timelineJobs = new Map<string, { status: 'processing' | 'done' | 'error'; progress: number; step: string; outputUrl?: string; error?: string }>();
const dubJobs = new Map<string, { jobId: string; status: 'pending' | 'transcribing' | 'translating' | 'generating_voice' | 'syncing' | 'done' | 'error'; progress: number; outputUrl?: string; originalText?: string; translatedText?: string; error?: string }>();

async function callAIWorker(route: string, init: RequestInit): Promise<Response> {
  const base = (process.env.AI_WORKER_URL ?? 'http://127.0.0.1:8100').replace(/\/$/, '');
  try {
    return await fetch(`${base}${route}`, { ...init, signal: AbortSignal.timeout(15 * 60 * 1000) });
  } catch (error) {
    throw new Error(`AI worker unavailable hai: ${error instanceof Error ? error.message : 'connection failed'}`);
  }
}

function sendError(reply: { status(code: number): { send(value: unknown): unknown } }, error: unknown) {
  const message = error instanceof Error ? error.message : 'Media processing fail ho gayi.';
  return reply.status(error instanceof MediaInputError ? 404 : 500).send({ error: message });
}

async function processSingleVideo(
  videoId: string,
  title: string,
  build: (inputPath: string, outputPath: string) => string[],
) {
  const { video, path: inputPath } = await getVideoInput(videoId);
  return withMediaTemp(async (directory) => {
    const outputPath = path.join(directory, 'output.mp4');
    await runFfmpeg(build(inputPath, outputPath));
    return storeProcessedVideo(outputPath, video, { title });
  });
}

function scaleFilter(quality: string): string {
  const height = quality === '4k' ? 2160 : quality === '720p' ? 720 : 1080;
  return `scale=-2:${height}`;
}

export async function mediaRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', async (request) => {
    if (request.method === 'GET' && request.url.includes('/content')) return;
    const userId = resolveUserId(request);
    const params = request.params as { videoId?: string } | undefined;
    const body = request.body as { videoId?: string; clips?: Array<{ videoId?: string }> } | undefined;
    const ids = [params?.videoId, body?.videoId, ...(body?.clips?.map((clip) => clip.videoId) ?? [])]
      .filter((id): id is string => typeof id === 'string');
    for (const id of ids) {
      const video = VideoModel.findById(id);
      if (video && video.userId !== userId && video.userId !== 'default') {
        throw new ApplicationError('video_not_found', 'Video nahi mila.', 404);
      }
    }
  });

  app.delete<{ Params: { videoId: string } }>('/api/video/:videoId', async (request, reply) => {
    const parsed = videoIdSchema.safeParse(request.params.videoId);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid video id.' });
    const video = VideoModel.findById(parsed.data);
    if (!video) return reply.status(404).send({ error: 'Video nahi mila.' });
    if (video.storageKey) await getStorageProvider().delete(video.storageKey);
    VideoModel.delete(video.id);
    return reply.status(204).send();
  });

  app.post<{ Params: { videoId: string } }>('/api/videos/:videoId/save', async (request, reply) => {
    const parsed = videoIdSchema.safeParse(request.params.videoId);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid video id.' });
    const video = VideoModel.findById(parsed.data);
    if (!video) return reply.status(404).send({ error: 'Video nahi mila.' });
    if (video.userId !== resolveUserId(request) && video.userId !== 'default') {
      return reply.status(403).send({ error: 'Video access allowed nahi hai.' });
    }
    const saved = VideoModel.markSaved(video.id);
    return {
      status: 'saved',
      videoId: saved?.id,
      temporary: saved?.temporary,
      savedAt: saved?.savedAt?.toISOString(),
    };
  });

  app.post('/api/video/upload', async (request, reply) => {
    const part = await request.file({ limits: { fileSize: Number(process.env.MAX_VIDEO_FILE_SIZE_MB ?? 500) * 1024 * 1024, files: 1 } });
    if (!part) return reply.status(400).send({ error: 'Video file required hai.' });
    const extension = path.extname(part.filename).slice(1).toLowerCase();
    if (!['mp4', 'webm', 'mov'].includes(extension)) return reply.status(415).send({ error: 'MP4, WebM ya MOV file upload karein.' });
    const id = randomUUID();
    const storage = getStorageProvider();
    const key = storage.createObjectKey(id, extension);
    const stored = await storage.save(key, part.file, Number(process.env.MAX_VIDEO_FILE_SIZE_MB ?? 500) * 1024 * 1024);
    const info = await storage.stat(key);
    const metadata = extractVideoMetadata(info.absolutePath);
    const video = VideoModel.create({
      id, userId: resolveUserId(request), title: part.filename, originalFilename: part.filename, sourceType: 'uploaded',
      url: `/api/videos/${id}/content`, storageKey: stored.key, storageProvider: stored.provider,
      sha256: stored.sha256, fileSize: stored.sizeBytes, format: extension,
      mimeType: part.mimetype, duration: metadata.durationSeconds, width: metadata.width,
      height: metadata.height, fps: metadata.fps, codec: metadata.codec, status: 'completed',
      temporary: true, expiresAt: retentionExpiry('IMPORTED_VIDEO_RETENTION_HOURS', 24),
    });
    return { videoId: video.id, url: video.url, temporary: true, expiresAt: video.expiresAt?.toISOString() };
  });

  app.post('/api/video/edit', async (request, reply) => {
    const parsed = z.object({
      videoId: videoIdSchema,
      operations: z.array(z.object({ type: z.enum(['trim', 'crop', 'speed', 'text_overlay']), params: z.record(z.string(), z.unknown()) })).min(1).max(12),
    }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid video edit request.' });
    try {
      const result = await processSingleVideo(parsed.data.videoId, 'edited-video', (input, output) => {
        const args: string[] = [];
        const videoFilters: string[] = [];
        const audioFilters: string[] = [];
        let trimStart: number | undefined;
        let trimEnd: number | undefined;
        for (const operation of parsed.data.operations) {
          const p = operation.params;
          if (operation.type === 'trim') {
            trimStart = Number(p.start ?? 0); trimEnd = Number(p.end ?? 0);
          } else if (operation.type === 'crop') {
            const values = [p.width, p.height, p.x, p.y].map(Number);
            if (values.every(Number.isFinite)) videoFilters.push(`crop=${values.join(':')}`);
          } else if (operation.type === 'speed') {
            const speed = Math.max(0.5, Math.min(2, Number(p.factor ?? 1)));
            videoFilters.push(`setpts=${(1 / speed).toFixed(5)}*PTS`);
            audioFilters.push(`atempo=${speed}`);
          } else if (operation.type === 'text_overlay') {
            const text = escapeDrawtext(String(p.text ?? ''));
            const start = Number(p.start ?? 0); const end = Number(p.end ?? 5);
            videoFilters.push(`drawtext=${drawtextFontOption()}text='${text}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=h-text_h-30:enable='between(t,${start},${end})'`);
          }
        }
        if (trimStart !== undefined) args.push('-ss', String(Math.max(0, trimStart)));
        if (trimEnd !== undefined && trimEnd > (trimStart ?? 0)) args.push('-to', String(trimEnd));
        args.push('-i', input);
        if (videoFilters.length) args.push('-vf', videoFilters.join(','));
        if (audioFilters.length && hasAudioStream(input)) args.push('-af', audioFilters.join(','));
        args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-movflags', '+faststart', output);
        return args;
      });
      return publicVideo(result);
    } catch (error) { return sendError(reply, error); }
  });

  app.post('/api/video/merge', async (request, reply) => {
    const parsed = z.object({ videoIds: z.array(videoIdSchema).min(2).max(20) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Kam se kam 2 valid videos required hain.' });
    try {
      const sources = await Promise.all(parsed.data.videoIds.map(getVideoInput));
      const result = await withMediaTemp(async (directory) => {
        const args: string[] = []; const filters: string[] = [];
        sources.forEach((source, index) => {
          args.push('-i', source.path);
          filters.push(`[${index}:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1[v${index}]`);
        });
        filters.push(`${sources.map((_source, index) => `[v${index}]`).join('')}concat=n=${sources.length}:v=1:a=0[outv]`);
        const output = path.join(directory, 'merged.mp4');
        await runFfmpeg([...args, '-filter_complex', filters.join(';'), '-map', '[outv]', '-an', '-c:v', 'libx264', '-crf', '20', output]);
        return storeProcessedVideo(output, sources[0]!.video, { title: 'merged-video' });
      });
      return publicVideo(result);
    } catch (error) { return sendError(reply, error); }
  });

  app.post('/api/titles/apply', async (request, reply) => {
    const layerSchema = z.object({
      text: z.string().min(1).max(500), startSec: z.number().min(0), endSec: z.number().positive(),
      position: z.string(), fontSize: z.number().min(12).max(160), color: z.string().regex(/^#[0-9a-f]{6}$/i),
      bgColor: z.string().regex(/^#[0-9a-f]{6}$/i).optional(), bgOpacity: z.number().min(0).max(1).optional(),
    });
    const parsed = z.object({ videoId: videoIdSchema, layers: z.array(layerSchema).min(1).max(20) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid title layers.' });
    try {
      const result = await processSingleVideo(parsed.data.videoId, 'titled-video', (input, output) => {
        const filters = parsed.data.layers.map((layer) => {
          const pos = textPosition(layer.position);
          const box = layer.bgColor ? `:box=1:boxcolor=${layer.bgColor}@${layer.bgOpacity ?? 0.5}:boxborderw=12` : '';
          return `drawtext=${drawtextFontOption()}text='${escapeDrawtext(layer.text)}':fontcolor=${layer.color}:fontsize=${layer.fontSize}:x=${pos.x}:y=${pos.y}:enable='between(t,${layer.startSec},${layer.endSec})'${box}`;
        });
        return ['-i', input, '-vf', filters.join(','), '-c:v', 'libx264', '-crf', '20', '-c:a', 'copy', '-movflags', '+faststart', output];
      });
      return { outputId: result.id, url: result.url };
    } catch (error) { return sendError(reply, error); }
  });

  app.post('/api/captions/burn', async (request, reply) => {
    const entrySchema = z.object({ text: z.string().min(1).max(1000), startTime: z.number().min(0), endTime: z.number().positive() });
    const parsed = z.object({
      videoId: videoIdSchema,
      entries: z.array(entrySchema).min(1).max(500),
      style: z.object({ fontSize: z.number().min(12).max(96).default(30), color: z.string().default('#ffffff'), position: z.enum(['top', 'middle', 'bottom']).default('bottom') }).passthrough(),
    }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid caption burn request.' });
    try {
      const result = await processSingleVideo(parsed.data.videoId, 'captioned-video', (input, output) => {
        const y = parsed.data.style.position === 'top' ? '30' : parsed.data.style.position === 'middle' ? '(h-text_h)/2' : 'h-text_h-36';
        const filters = parsed.data.entries.map((entry) => {
          const start = entry.startTime / 1000; const end = entry.endTime / 1000;
          return `drawtext=${drawtextFontOption()}text='${escapeDrawtext(entry.text)}':fontcolor=${parsed.data.style.color}:fontsize=${parsed.data.style.fontSize}:x=(w-text_w)/2:y=${y}:box=1:boxcolor=black@0.55:boxborderw=10:enable='between(t,${start},${end})'`;
        });
        return ['-i', input, '-vf', filters.join(','), '-c:v', 'libx264', '-crf', '20', '-c:a', 'copy', '-movflags', '+faststart', output];
      });
      return { outputId: result.id, url: result.url };
    } catch (error) { return sendError(reply, error); }
  });

  app.post('/api/captions/generate', async (request, reply) => {
    const parsed = z.object({ videoId: videoIdSchema, language: z.string().optional() }).passthrough().safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid caption generation request.' });
    try {
      const { path: videoPath } = await getVideoInput(parsed.data.videoId);
      const response = await callAIWorker('/captions/transcribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_path: videoPath, language: parsed.data.language }),
      });
      const payload = await response.json() as { entries?: unknown[]; language?: string; detail?: string };
      if (!response.ok) return reply.status(response.status).send({ error: payload.detail ?? 'Transcription fail ho gayi.' });
      const captionId = randomUUID();
      return { captionId, entries: payload.entries ?? [], format: 'srt', language: payload.language, downloadUrls: {} };
    } catch (error) { return sendError(reply, error); }
  });

  app.post('/api/vfx/render', async (request, reply) => {
    const parsed = z.object({ videoId: videoIdSchema }).passthrough().safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid VFX request.' });
    try {
      const result = await processSingleVideo(parsed.data.videoId, 'vfx-video', (input, output) => {
        const filters: string[] = [];
        const lut = parsed.data.lut as { preset?: string; intensity?: number } | undefined;
        if (lut) {
          const presets: Record<string, string> = {
            film_noir: 'hue=s=0,eq=contrast=1.25', golden_hour: 'colorbalance=rs=.12:gs=.04:bs=-.08',
            cold_blue: 'colorbalance=bs=.14:rs=-.05', vintage_fade: 'curves=preset=vintage', vivid: 'eq=saturation=1.35:contrast=1.08',
            cinematic_orange_teal: 'colorbalance=rs=.08:bs=.08',
          };
          filters.push(presets[lut.preset ?? ''] ?? 'eq=contrast=1.05:saturation=1.1');
        }
        if (parsed.data.motionBlur) filters.push('tmix=frames=3:weights=1 2 1');
        if (parsed.data.kenBurns) filters.push('scale=iw*1.04:ih*1.04,crop=iw/1.04:ih/1.04');
        const cinematic = parsed.data.cinematic as { vignette?: boolean; filmGrain?: boolean; grainStrength?: number; filmGate?: boolean } | undefined;
        if (cinematic?.vignette) filters.push('vignette=PI/5');
        if (cinematic?.filmGrain) filters.push(`noise=alls=${Math.min(30, cinematic.grainStrength ?? 8)}:allf=t`);
        if (cinematic?.filmGate) filters.push('drawbox=x=0:y=0:w=iw:h=ih*0.08:color=black:t=fill,drawbox=x=0:y=ih*0.92:w=iw:h=ih*0.08:color=black:t=fill');
        return ['-i', input, ...(filters.length ? ['-vf', filters.join(',')] : []), '-c:v', 'libx264', '-crf', '20', '-c:a', 'copy', output];
      });
      return { outputId: result.id, url: result.url };
    } catch (error) { return sendError(reply, error); }
  });

  app.post('/api/watermark/upload', async (request, reply) => {
    const part = await request.file({ limits: { fileSize: 10 * 1024 * 1024, files: 1 } });
    if (!part) return reply.status(400).send({ error: 'Logo file required hai.' });
    const extension = path.extname(part.filename).slice(1).toLowerCase();
    if (!['png', 'jpg', 'jpeg', 'webp'].includes(extension)) return reply.status(415).send({ error: 'PNG, JPG ya WebP logo upload karein.' });
    const id = randomUUID(); const storage = getStorageProvider(); const key = storage.createObjectKey(id, extension);
    await storage.save(key, part.file, 10 * 1024 * 1024); uploadedAssets.set(id, { key, mimeType: part.mimetype });
    return { logoId: id, url: `/api/media-assets/${id}` };
  });

  app.get<{ Params: { assetId: string } }>('/api/media-assets/:assetId', async (request, reply) => {
    const asset = uploadedAssets.get(request.params.assetId);
    if (!asset) return reply.status(404).send({ error: 'Asset nahi mila.' });
    reply.header('Content-Type', asset.mimeType); return reply.send(getStorageProvider().read(asset.key));
  });

  app.post('/api/watermark/apply', async (request, reply) => {
    const parsed = z.object({
      videoId: videoIdSchema, type: z.enum(['image', 'text']), position: z.string(), opacity: z.number().min(0).max(1),
      logoId: z.string().uuid().optional(), text: z.string().max(300).optional(), fontSize: z.number().min(12).max(160).optional(),
      color: z.string().optional(), marginPx: z.number().min(0).max(500).optional(), scale: z.number().min(0.02).max(1).optional(),
    }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid watermark request.' });
    try {
      const opts = parsed.data;
      const result = await processSingleVideo(opts.videoId, 'watermarked-video', (input, output) => {
        if (opts.type === 'text') {
          const pos = textPosition(opts.position); const text = escapeDrawtext(opts.text ?? '');
          return ['-i', input, '-vf', `drawtext=${drawtextFontOption()}text='${text}':fontcolor=${opts.color ?? 'white'}@${opts.opacity}:fontsize=${opts.fontSize ?? 32}:x=${pos.x}:y=${pos.y}`, '-c:v', 'libx264', '-crf', '20', '-c:a', 'copy', output];
        }
        const asset = opts.logoId ? uploadedAssets.get(opts.logoId) : undefined;
        if (!asset) throw new MediaInputError('Uploaded logo nahi mila. Dobara upload karein.');
        const logoPathPromise = getStorageProvider().stat(asset.key);
        throw Object.assign(new Error('IMAGE_WATERMARK_ASYNC'), { logoPathPromise, input, output, opts });
      }).catch(async (error: unknown) => {
        if (!(error instanceof Error) || error.message !== 'IMAGE_WATERMARK_ASYNC') throw error;
        const details = error as Error & { logoPathPromise: ReturnType<ReturnType<typeof getStorageProvider>['stat']>; input: string; output: string; opts: typeof opts };
        const logo = await details.logoPathPromise;
        const { video } = await getVideoInput(opts.videoId);
        return withMediaTemp(async (directory) => {
          const output = path.join(directory, 'watermark.mp4');
          const scale = opts.scale ?? 0.18; const position = opts.position;
          const overlay = position.includes('left') ? '20' : position.includes('right') ? 'main_w-overlay_w-20' : '(main_w-overlay_w)/2';
          const y = position.startsWith('top') ? '20' : position === 'center' ? '(main_h-overlay_h)/2' : 'main_h-overlay_h-20';
          await runFfmpeg(['-i', details.input, '-i', logo.absolutePath, '-filter_complex', `[1:v]scale=iw*${scale}:-1,format=rgba,colorchannelmixer=aa=${opts.opacity}[wm];[0:v][wm]overlay=${overlay}:${y}`, '-c:v', 'libx264', '-crf', '20', '-c:a', 'copy', output]);
          return storeProcessedVideo(output, video, { title: 'watermarked-video' });
        });
      });
      return { outputId: result.id, url: result.url };
    } catch (error) { return sendError(reply, error); }
  });

  app.get('/api/video/export/formats', async () => [
    { format: 'mp4', label: 'MP4 (H.264)' }, { format: 'webm', label: 'WebM (VP9)' }, { format: 'mov', label: 'MOV' },
  ]);

  app.post('/api/video/export/estimate', async (request, reply) => {
    const parsed = z.object({ videoId: videoIdSchema, options: z.object({ quality: z.string() }).passthrough() }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid export estimate.' });
    const video = VideoModel.findById(parsed.data.videoId); if (!video) return reply.status(404).send({ error: 'Video nahi mila.' });
    const factor = parsed.data.options.quality === '4k' ? 2.4 : parsed.data.options.quality === '720p' ? 0.65 : 1;
    return { estimatedSizeBytes: Math.round(video.fileSize * factor) };
  });

  app.post('/api/video/export', async (request, reply) => {
    const parsed = z.object({ videoId: videoIdSchema, options: z.object({ format: z.enum(['mp4', 'webm', 'mov']), quality: z.enum(['720p', '1080p', '4k']) }).passthrough() }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid export request.' });
    try {
      const { format, quality } = parsed.data.options;
      const { video, path: input } = await getVideoInput(parsed.data.videoId);
      const result = await withMediaTemp(async (directory) => {
        const output = path.join(directory, `export.${format}`);
        const codec = format === 'webm' ? ['-c:v', 'libvpx-vp9', '-c:a', 'libopus'] : ['-c:v', 'libx264', '-c:a', 'aac'];
        await runFfmpeg(['-i', input, '-vf', scaleFilter(quality), ...codec, '-movflags', '+faststart', output]);
        return storeProcessedVideo(output, video, { title: 'exported-video', extension: format });
      });
      return { downloadUrl: result.url, filename: `bricks-maker-${result.id}.${format}`, videoId: result.id };
    } catch (error) { return sendError(reply, error); }
  });

  app.post('/api/timeline/render', async (request, reply) => {
    const clipSchema = z.object({ videoId: videoIdSchema, trimStart: z.number().min(0).default(0), trimEnd: z.number().min(0).default(0), speed: z.number().min(0.25).max(4).default(1) });
    const parsed = z.object({ clips: z.array(clipSchema).min(1).max(30), quality: z.enum(['720p', '1080p', '4k']).default('1080p') }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid timeline request.' });
    const jobId = randomUUID(); timelineJobs.set(jobId, { status: 'processing', progress: 2, step: 'validating' });
    void (async () => {
      try {
        const sources = await Promise.all(parsed.data.clips.map((clip) => getVideoInput(clip.videoId)));
        timelineJobs.set(jobId, { status: 'processing', progress: 20, step: 'preparing clips' });
        const result = await withMediaTemp(async (directory) => {
          const args: string[] = []; const filters: string[] = [];
          sources.forEach((source, index) => {
            args.push('-i', source.path); const clip = parsed.data.clips[index]!;
            const duration = Math.max(0.1, (source.video.duration ?? 10) - clip.trimStart - clip.trimEnd);
            filters.push(`[${index}:v]trim=start=${clip.trimStart}:duration=${duration},setpts=(PTS-STARTPTS)/${clip.speed},${scaleFilter(parsed.data.quality)},setsar=1[v${index}]`);
          });
          filters.push(`${sources.map((_source, index) => `[v${index}]`).join('')}concat=n=${sources.length}:v=1:a=0[outv]`);
          const output = path.join(directory, 'timeline.mp4');
          await runFfmpeg([...args, '-filter_complex', filters.join(';'), '-map', '[outv]', '-an', '-c:v', 'libx264', '-crf', '20', '-movflags', '+faststart', output]);
          return storeProcessedVideo(output, sources[0]!.video, { title: 'timeline-render' });
        });
        timelineJobs.set(jobId, { status: 'done', progress: 100, step: 'completed', outputUrl: result.url });
      } catch (error) {
        timelineJobs.set(jobId, { status: 'error', progress: 0, step: 'failed', error: error instanceof Error ? error.message : 'Timeline render fail ho gayi.' });
      }
    })();
    return reply.status(202).send({ jobId, status: 'processing' });
  });

  app.get<{ Params: { jobId: string } }>('/api/timeline/:jobId/status', async (request, reply) => {
    const job = timelineJobs.get(request.params.jobId); if (!job) return reply.status(404).send({ error: 'Timeline job nahi mila.' });
    return job;
  });

  app.get('/api/music/tracks', async (request) => {
    const mood = (request.query as { mood?: string }).mood;
    const musicRoot = path.resolve(process.env.LOCAL_MUSIC_ROOT?.trim() || 'storage/music');
    let names: string[] = []; try { names = await readdir(musicRoot); } catch { /* empty library */ }
    const tracks = names.filter((name) => /\.(mp3|wav|m4a|aac|ogg)$/i.test(name)).map((name) => ({
      id: Buffer.from(name).toString('base64url'), name: path.parse(name).name, mood: mood ?? 'cinematic', bpm: 0,
      durationSec: 0, file: name, tags: [], source: 'local', available: true,
    }));
    return { tracks };
  });

  app.post('/api/music/apply', async (request, reply) => {
    const parsed = z.object({
      videoId: videoIdSchema, trackId: z.string().min(1), musicVolume: z.number().min(0).max(1),
      voiceVolume: z.number().min(0).max(1), autoDuck: z.boolean(), fadeInSec: z.number().min(0).max(30),
      fadeOutSec: z.number().min(0).max(30), loop: z.boolean(),
    }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid music mix request.' });
    try {
      const filename = Buffer.from(parsed.data.trackId, 'base64url').toString('utf8');
      if (path.basename(filename) !== filename || !/\.(mp3|wav|m4a|aac|ogg)$/i.test(filename)) throw new MediaInputError('Music track invalid hai.');
      const musicRoot = path.resolve(process.env.LOCAL_MUSIC_ROOT?.trim() || 'storage/music');
      const trackPath = path.resolve(musicRoot, filename);
      if (path.dirname(trackPath) !== musicRoot) throw new MediaInputError('Music track invalid hai.');
      const { video, path: input } = await getVideoInput(parsed.data.videoId);
      const result = await withMediaTemp(async (directory) => {
        const output = path.join(directory, 'music-mix.mp4');
        const duration = video.duration ?? 30;
        const fadeOutStart = Math.max(0, duration - parsed.data.fadeOutSec);
        const musicFilters = [`volume=${parsed.data.musicVolume}`];
        if (parsed.data.fadeInSec > 0) musicFilters.push(`afade=t=in:st=0:d=${parsed.data.fadeInSec}`);
        if (parsed.data.fadeOutSec > 0) musicFilters.push(`afade=t=out:st=${fadeOutStart}:d=${parsed.data.fadeOutSec}`);
        const hasVoice = hasAudioStream(input);
        const audioFilter = hasVoice
          ? `[0:a]volume=${parsed.data.voiceVolume}[voice];[1:a]${musicFilters.join(',')}[music];[voice][music]amix=inputs=2:duration=first:dropout_transition=2[aout]`
          : `[1:a]${musicFilters.join(',')}[aout]`;
        await runFfmpeg(['-i', input, ...(parsed.data.loop ? ['-stream_loop', '-1'] : []), '-i', trackPath, '-filter_complex', audioFilter, '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', ...(parsed.data.loop ? ['-shortest'] : []), output]);
        return storeProcessedVideo(output, video, { title: 'music-mix' });
      });
      return { outputId: result.id, url: result.url };
    } catch (error) { return sendError(reply, error); }
  });

  app.get('/api/pro/analytics', async (request) => {
    const days = Math.max(1, Math.min(365, Number((request.query as { days?: string }).days ?? 30)));
    const since = `-${days} days`;
    const summary = db.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(actual_cost_usd),0) AS cost, SUM(CASE WHEN status='ready' THEN 1 ELSE 0 END) AS succeeded FROM processing_jobs WHERE created_at >= datetime('now', ?)").get(since) as { total: number; cost: number; succeeded: number };
    const byType = db.prepare("SELECT job_type AS type, COALESCE(SUM(actual_cost_usd),0) AS cost FROM processing_jobs WHERE created_at >= datetime('now', ?) GROUP BY job_type").all(since) as Array<{ type: string; cost: number }>;
    const byModel = db.prepare("SELECT COALESCE(model,'local') AS model, COUNT(*) AS count FROM processing_jobs WHERE created_at >= datetime('now', ?) GROUP BY model").all(since) as Array<{ model: string; count: number }>;
    const dailyActivity = db.prepare("SELECT date(created_at) AS date, COUNT(*) AS count, COALESCE(SUM(actual_cost_usd),0) AS cost FROM processing_jobs WHERE created_at >= datetime('now', ?) GROUP BY date(created_at) ORDER BY date(created_at)").all(since) as Array<{ date: string; count: number; cost: number }>;
    const totalCostUSD = Number(summary.cost.toFixed(3));
    const veoModels = Object.fromEntries(byModel.map((row) => [row.model, row.count]));
    return {
      period: { days, since: new Date(Date.now() - days * 86400000).toISOString() },
      summary: { totalEvents: summary.total, totalCostUSD, totalCostINR: Math.round(totalCostUSD * Number(process.env.USD_TO_INR ?? 83)), successRate: summary.total ? Math.round((summary.succeeded / summary.total) * 100) : 100 },
      byType, byModel, dailyActivity, veoModels,
    };
  });

  app.post('/api/image-generator/generate', async (request, reply) => {
    const parsed = z.object({ prompt: z.string().trim().min(1).max(2000) }).passthrough().safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Image prompt required hai.' });
    try {
      const response = await callAIWorker('/image/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data),
      });
      const payload = await response.json() as Record<string, unknown> & { detail?: string };
      if (!response.ok) return reply.status(response.status).send({ error: payload.detail ?? 'Image generation fail ho gayi.' });
      return payload;
    } catch (error) { return sendError(reply, error); }
  });

  app.get('/api/voice/list', async () => [
    { id: 'local-female', name: 'Local Female', gender: 'female', style: 'professional', language: 'English', languageCode: 'en', provider: 'local', isPremium: false, tags: ['offline', 'SpeechT5'] },
    { id: 'local-male', name: 'Local Male', gender: 'male', style: 'professional', language: 'English', languageCode: 'en', provider: 'local', isPremium: false, tags: ['offline', 'SpeechT5'] },
    { id: 'local-hindi', name: 'Local Hindi', gender: 'neutral', style: 'professional', language: 'Hindi', languageCode: 'hi', provider: 'local', isPremium: false, tags: ['offline', 'Meta MMS'] },
  ]);

  async function synthesizeVoice(body: unknown): Promise<Buffer> {
    const parsed = z.object({ text: z.string().trim().min(1).max(1000), voiceId: z.string().optional(), languageCode: z.string().optional() }).passthrough().parse(body);
    const response = await callAIWorker('/voice/synthesize', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: parsed.text, voice_id: parsed.voiceId ?? 'local-female', language_code: parsed.languageCode ?? 'en' }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({})) as { detail?: string };
      throw new Error(payload.detail ?? 'Voice synthesis fail ho gayi.');
    }
    return Buffer.from(await response.arrayBuffer());
  }

  app.post('/api/voice/preview', async (request, reply) => {
    try {
      const audio = await synthesizeVoice(request.body);
      reply.header('Content-Type', 'audio/wav'); reply.header('Content-Length', audio.length); return reply.send(audio);
    } catch (error) { return sendError(reply, error); }
  });

  app.post('/api/voice/generate', async (request, reply) => {
    try {
      const body = request.body as { text?: string; language?: string; voiceSettings?: { voiceId?: string } };
      const audio = await synthesizeVoice({ text: body.text, languageCode: body.language, voiceId: body.voiceSettings?.voiceId });
      const id = randomUUID(); const storage = getStorageProvider(); const key = storage.createObjectKey(id, 'wav');
      const stored = await storage.save(key, Readable.from(audio), 50 * 1024 * 1024);
      uploadedAssets.set(id, { key: stored.key, mimeType: 'audio/wav' });
      return { audioUrl: `/api/media-assets/${id}`, duration: 0, fileSize: stored.sizeBytes, format: 'wav' };
    } catch (error) { return sendError(reply, error); }
  });

  app.post('/api/voice/merge', async (request, reply) => {
    const parsed = z.object({ videoId: videoIdSchema, audioUrl: z.string(), volume: z.number().min(0).max(2).default(1) }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Invalid voice merge request.' });
    const assetId = /\/api\/media-assets\/([^/?]+)/.exec(parsed.data.audioUrl)?.[1];
    const asset = assetId ? uploadedAssets.get(assetId) : undefined;
    if (!asset) return reply.status(404).send({ error: 'Generated voice audio nahi mila.' });
    try {
      const { video, path: videoPath } = await getVideoInput(parsed.data.videoId); const audioInfo = await getStorageProvider().stat(asset.key);
      const result = await withMediaTemp(async (directory) => {
        const output = path.join(directory, 'voice-merge.mp4');
        await runFfmpeg(['-i', videoPath, '-i', audioInfo.absolutePath, '-filter:a', `volume=${parsed.data.volume}`, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-shortest', output]);
        return storeProcessedVideo(output, video, { title: 'voice-merged-video' });
      });
      return { url: result.url, outputId: result.id };
    } catch (error) { return sendError(reply, error); }
  });

  app.post('/api/dub/start', async (request, reply) => {
    const parsed = z.object({
      videoId: videoIdSchema, sourceLanguage: z.string().optional(),
      targetLanguage: z.enum(['en', 'hi']), voiceId: z.string().optional(),
    }).safeParse(request.body);
    if (!parsed.success) return reply.status(400).send({ error: 'Local Auto-Dub abhi English aur Hindi support karta hai.' });
    const jobId = randomUUID();
    dubJobs.set(jobId, { jobId, status: 'pending', progress: 1 });
    void (async () => {
      try {
        const { video, path: videoPath } = await getVideoInput(parsed.data.videoId);
        dubJobs.set(jobId, { jobId, status: 'transcribing', progress: 15 });
        const transcriptionResponse = await callAIWorker('/captions/transcribe', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ video_path: videoPath, language: parsed.data.sourceLanguage }),
        });
        const transcription = await transcriptionResponse.json() as { entries?: Array<{ text?: string }>; language?: string; detail?: string };
        if (!transcriptionResponse.ok) throw new Error(transcription.detail ?? 'Transcription fail ho gayi.');
        const originalText = (transcription.entries ?? []).map((entry) => entry.text ?? '').join(' ').trim();
        if (!originalText) throw new Error('Video mein speech detect nahi hui.');
        const sourceLanguage = parsed.data.sourceLanguage ?? transcription.language ?? 'en';
        let translatedText = originalText;
        if (sourceLanguage.split('-')[0] !== parsed.data.targetLanguage) {
          dubJobs.set(jobId, { jobId, status: 'translating', progress: 40, originalText });
          const translationResponse = await callAIWorker('/translate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: originalText, source_language: sourceLanguage, target_language: parsed.data.targetLanguage }),
          });
          const translation = await translationResponse.json() as { text?: string; detail?: string };
          if (!translationResponse.ok || !translation.text) throw new Error(translation.detail ?? 'Translation fail ho gayi.');
          translatedText = translation.text;
        }
        dubJobs.set(jobId, { jobId, status: 'generating_voice', progress: 65, originalText, translatedText });
        const audio = await synthesizeVoice({
          text: translatedText, voiceId: parsed.data.voiceId ?? (parsed.data.targetLanguage === 'hi' ? 'local-hindi' : 'local-female'),
          languageCode: parsed.data.targetLanguage,
        });
        const audioId = randomUUID(); const storage = getStorageProvider(); const audioKey = storage.createObjectKey(audioId, 'wav');
        await storage.save(audioKey, Readable.from(audio), 100 * 1024 * 1024); const audioInfo = await storage.stat(audioKey);
        dubJobs.set(jobId, { jobId, status: 'syncing', progress: 85, originalText, translatedText });
        const result = await withMediaTemp(async (directory) => {
          const output = path.join(directory, 'auto-dub.mp4');
          await runFfmpeg(['-i', videoPath, '-i', audioInfo.absolutePath, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-shortest', output]);
          return storeProcessedVideo(output, video, { title: 'auto-dubbed-video' });
        });
        await storage.delete(audioKey);
        dubJobs.set(jobId, { jobId, status: 'done', progress: 100, outputUrl: result.url, originalText, translatedText });
      } catch (error) {
        dubJobs.set(jobId, { jobId, status: 'error', progress: 0, error: error instanceof Error ? error.message : 'Auto-Dub fail ho gaya.' });
      }
    })();
    return reply.status(202).send({ jobId });
  });

  app.get<{ Params: { jobId: string } }>('/api/dub/:jobId', async (request, reply) => {
    const job = dubJobs.get(request.params.jobId);
    if (!job) return reply.status(404).send({ error: 'Auto-Dub job nahi mila.' });
    return job;
  });
}
