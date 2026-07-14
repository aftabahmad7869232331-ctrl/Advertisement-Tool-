import { execFile, spawnSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';

import { VideoModel, type VideoRecord } from '../models/Video.model.js';
import { getStorageProvider } from './storage/storageRegistry.js';
import { extractVideoMetadata } from './videoMetadata.service.js';
import { isExpiredTemporaryMedia, retentionExpiry } from './mediaRetention.service.js';

const execFileAsync = promisify(execFile);

export class MediaInputError extends Error {}

export async function runFfmpeg(args: string[]): Promise<void> {
  try {
    await execFileAsync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], {
      windowsHide: true,
      maxBuffer: 4 * 1024 * 1024,
      timeout: Number(process.env.FFMPEG_TIMEOUT_MS ?? 15 * 60 * 1000),
    });
  } catch (error) {
    const stderr = typeof error === 'object' && error && 'stderr' in error
      ? String(error.stderr).trim()
      : '';
    throw new Error(stderr || 'FFmpeg processing fail ho gayi.');
  }
}

export function hasAudioStream(filePath: string): boolean {
  const executable = process.env.FFPROBE_PATH?.trim() || 'ffprobe';
  const result = spawnSync(executable, [
    '-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=index', '-of', 'csv=p=0', filePath,
  ], { encoding: 'utf8', timeout: 15_000, windowsHide: true });
  return result.status === 0 && result.stdout.trim().length > 0;
}

export async function getVideoInput(videoId: string): Promise<{ video: VideoRecord; path: string }> {
  const video = VideoModel.findById(videoId);
  if (!video?.storageKey) throw new MediaInputError('Video nahi mila ya local file available nahi hai.');
  if (isExpiredTemporaryMedia(video)) throw new MediaInputError('Temporary video expire ho chuka hai.');
  const info = await getStorageProvider().stat(video.storageKey);
  return { video, path: info.absolutePath };
}

export async function withMediaTemp<T>(fn: (directory: string) => Promise<T>): Promise<T> {
  const directory = await mkdtemp(path.join(tmpdir(), 'bricks-media-'));
  try {
    return await fn(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function storeProcessedVideo(
  outputPath: string,
  source: VideoRecord,
  options: { title: string; extension?: 'mp4' | 'webm' | 'mov' },
): Promise<VideoRecord> {
  const extension = options.extension ?? 'mp4';
  const id = randomUUID();
  const storage = getStorageProvider();
  const key = storage.createObjectKey(id, extension);
  const maxMb = Number(process.env.MAX_VIDEO_FILE_SIZE_MB ?? 500);
  const stored = await storage.save(key, createReadStream(outputPath), maxMb * 1024 * 1024);
  const info = await storage.stat(key);
  const metadata = extractVideoMetadata(info.absolutePath);
  const mimeType = extension === 'webm' ? 'video/webm' : extension === 'mov' ? 'video/quicktime' : 'video/mp4';

  return VideoModel.create({
    id,
    userId: source.userId,
    projectId: source.projectId,
    title: options.title,
    originalFilename: `${options.title.replace(/[^A-Za-z0-9_-]/g, '-')}.${extension}`,
    sourceType: 'processed',
    provider: 'local-ffmpeg',
    model: 'ffmpeg',
    url: `/api/videos/${id}/content`,
    storageProvider: stored.provider,
    storageKey: stored.key,
    sha256: stored.sha256,
    mimeType,
    fileSize: stored.sizeBytes,
    format: extension,
    duration: metadata.durationSeconds,
    width: metadata.width,
    height: metadata.height,
    fps: metadata.fps,
    codec: metadata.codec,
    status: 'completed',
    temporary: true,
    expiresAt: retentionExpiry('PROCESSED_VIDEO_RETENTION_HOURS', 24),
    metadata: { custom: { derivedFrom: source.id, processor: 'ffmpeg' } },
  });
}

export function publicVideo(video: VideoRecord) {
  return {
    id: video.id,
    projectId: video.projectId,
    url: video.url,
    thumbnailUrl: video.thumbnailUrl,
    duration: video.duration ?? 0,
    format: video.format,
    quality: video.quality,
    aspectRatio: video.aspectRatio,
    fileSize: video.fileSize,
    createdAt: video.createdAt.toISOString(),
    temporary: video.temporary,
    expiresAt: video.expiresAt?.toISOString() ?? null,
  };
}

export function escapeDrawtext(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll(':', '\\:')
    .replaceAll("'", "\\'")
    .replaceAll('%', '\\%')
    .replaceAll(',', '\\,')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]');
}

export function drawtextFontOption(): string {
  const configured = process.env.FFMPEG_FONT_FILE?.trim();
  const fontPath = configured || (process.platform === 'win32' ? 'C:/Windows/Fonts/arial.ttf' : '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf');
  const escaped = fontPath.replaceAll('\\', '/').replace(':', '\\:').replaceAll("'", "\\'");
  return `fontfile='${escaped}':`;
}

export function textPosition(position: string): { x: string; y: string } {
  const horizontal = position.includes('left') ? '24'
    : position.includes('right') ? 'w-text_w-24' : '(w-text_w)/2';
  const vertical = position.startsWith('top') ? '24'
    : position === 'center' || position.startsWith('middle') ? '(h-text_h)/2'
      : position === 'lower-third' ? 'h*0.72' : 'h-text_h-24';
  return { x: horizontal, y: vertical };
}
