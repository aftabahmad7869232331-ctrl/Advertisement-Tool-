import { randomUUID } from 'node:crypto';
import { open } from 'node:fs/promises';
import type { Readable } from 'node:stream';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { ProcessingJobModel } from '../../models/ProcessingJob.model.js';
import { VideoModel } from '../../models/Video.model.js';
import { getStorageProvider } from '../../services/storage/storageRegistry.js';
import { StorageLimitError } from '../../services/storage/types.js';
import { extractVideoMetadata } from '../../services/videoMetadata.service.js';
import { retentionExpiry } from '../../services/mediaRetention.service.js';
import { captureReservedCredits, releaseReservedCredits } from '../../services/creditLedger.service.js';

const callbackSchema = z.object({
  status: z.enum(['processing', 'done', 'error']),
  progress: z.number().min(0).max(100).optional(),
  stage: z.string().trim().min(1).optional(),
  result: z.record(z.string(), z.unknown()).optional(),
  error: z.string().trim().min(1).optional(),
});

export async function internalAIRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.addContentTypeParser(
    'application/octet-stream',
    (_request, payload, done) => done(null, payload),
  );

  app.post<{
    Params: { jobId: string };
  }>('/api/internal/ai/jobs/:jobId/artifact', async (request, reply) => {
    const expectedToken = process.env.AI_WORKER_CALLBACK_TOKEN ?? 'local-dev-ai-worker';
    if (request.headers['x-ai-worker-token'] !== expectedToken) {
      return reply.status(401).send({ status: 'error', error: 'Unauthorized artifact upload.' });
    }

    const job = ProcessingJobModel.findById(request.params.jobId);
    if (!job) return reply.status(404).send({ status: 'error', error: 'Processing job nahi mila.' });
    if (!['queued', 'accepted', 'validating', 'processing', 'uploading', 'retrying'].includes(job.status)) {
      const existing = VideoModel.findByJobId(job.id);
      const suppliedChecksum = request.headers['x-artifact-sha256'];
      if (existing && suppliedChecksum === existing.sha256) {
        return { status: 'ok', videoId: existing.id, sha256: existing.sha256, idempotent: true };
      }
      return reply.status(409).send({ status: 'error', error: 'Job artifact accept state mein nahi hai.' });
    }

    const existing = VideoModel.findByJobId(job.id);
    const suppliedChecksum = request.headers['x-artifact-sha256'];
    if (existing) {
      if (suppliedChecksum === existing.sha256) {
        return { status: 'ok', videoId: existing.id, sha256: existing.sha256, idempotent: true };
      }
      return reply.status(409).send({ status: 'error', error: 'Job artifact already exists.' });
    }

    const rawFilename = String(request.headers['x-artifact-filename'] ?? 'generated.mp4');
    const extension = rawFilename.toLowerCase().endsWith('.webm')
      ? 'webm'
      : rawFilename.toLowerCase().endsWith('.mov') ? 'mov' : 'mp4';
    const safeFilename = `generated-${job.id}.${extension}`;
    const maxMb = Number(process.env.MAX_VIDEO_FILE_SIZE_MB ?? 500);
    const maxBytes = (Number.isFinite(maxMb) && maxMb > 0 ? maxMb : 500) * 1024 * 1024;
    const declaredLength = Number(request.headers['content-length'] ?? 0);
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      return reply.status(413).send({ status: 'error', error: 'Video artifact size limit se bada hai.' });
    }
    const storage = getStorageProvider();
    const key = storage.createObjectKey(job.id, extension);

    try {
      const stored = await storage.save(key, request.body as Readable, maxBytes);
      if (suppliedChecksum && suppliedChecksum !== stored.sha256) {
        await storage.delete(key);
        return reply.status(400).send({ status: 'error', error: 'Artifact checksum mismatch.' });
      }

      const storedStat = await storage.stat(key);
      const handle = await open(storedStat.absolutePath, 'r');
      const signature = Buffer.alloc(12);
      await handle.read(signature, 0, 12, 0);
      await handle.close();
      const isWebm = signature.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
      const isIsoVideo = signature.subarray(4, 8).toString('ascii') === 'ftyp';
      if (!isWebm && !isIsoVideo) {
        await storage.delete(key);
        return reply.status(415).send({ status: 'error', error: 'Artifact valid supported video nahi hai.' });
      }
      const mimeType = isWebm ? 'video/webm' : extension === 'mov' ? 'video/quicktime' : 'video/mp4';
      const metadata = extractVideoMetadata(storedStat.absolutePath);
      const videoId = randomUUID();
      const video = VideoModel.create({
        id: videoId,
        userId: job.userId,
        jobId: job.id,
        projectId: job.projectId ?? 'default-project',
        originalFilename: safeFilename,
        provider: job.provider,
        model: job.model,
        url: `/api/videos/${videoId}/content`,
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
        expiresAt: retentionExpiry('GENERATED_VIDEO_RETENTION_HOURS', 24),
        metadata: metadata.warning ? { custom: { metadataWarning: metadata.warning } } : {},
      });

      return reply.status(201).send({
        status: 'ok', videoId: video.id, sha256: video.sha256,
        sizeBytes: video.fileSize, mimeType: video.mimeType,
      });
    } catch (error) {
      if (error instanceof StorageLimitError) {
        return reply.status(413).send({ status: 'error', error: error.message });
      }
      request.log.error({ err: error, jobId: job.id }, 'Artifact ingestion failed');
      return reply.status(500).send({ status: 'error', error: 'Artifact ingestion fail hui.' });
    }
  });

  app.post<{
    Params: {
      jobId: string;
    };
  }>(
    '/api/internal/ai/jobs/:jobId/update',
    async (request, reply) => {
      const expectedToken =
        process.env.AI_WORKER_CALLBACK_TOKEN ??
        'local-dev-ai-worker';

      const receivedToken =
        request.headers['x-ai-worker-token'];

      if (receivedToken !== expectedToken) {
        return reply.status(401).send({
          status: 'error',
          error: 'AI worker callback unauthorized hai.',
        });
      }

      const parsed = callbackSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.status(400).send({
          status: 'error',
          error: 'AI worker callback payload invalid hai.',
          details: parsed.error.flatten(),
        });
      }

      const job = ProcessingJobModel.findById(
        request.params.jobId,
      );

      if (!job) {
        return reply.status(404).send({
          status: 'error',
          error: 'Processing job nahi mila.',
        });
      }

      const update = parsed.data;

      if (update.status === 'processing') {
        if (update.stage === 'retrying') {
          ProcessingJobModel.transition(job.id, 'retrying', 'retrying');
          const retryCount = update.result?.retryCount;
          if (typeof retryCount === 'number') ProcessingJobModel.setRetryCount(job.id, retryCount);
        } else {
          ProcessingJobModel.updateProgress(job.id, update.progress ?? job.progress, update.stage ?? 'processing');
        }
      }

      if (update.status === 'done') {
        ProcessingJobModel.markDone(
          job.id,
          update.result ?? {},
        );
        const actualCredits = update.result?.actualCredits;
        captureReservedCredits(
          job.id,
          typeof actualCredits === 'number' && Number.isFinite(actualCredits)
            ? actualCredits
            : undefined,
        );
      }

      if (update.status === 'error') {
        if (update.result?.errorCode === 'cancelled') {
          ProcessingJobModel.transition(job.id, 'cancelled', 'cancelled');
          releaseReservedCredits(job.id, 'worker_cancelled');
        } else {
          ProcessingJobModel.markError(job.id, update.error ?? 'AI worker processing fail ho gayi.', update.result);
          releaseReservedCredits(job.id, 'worker_failed');
        }
      }

      const updatedJob = ProcessingJobModel.findById(job.id);

      return {
        status: 'ok',
        jobId: job.id,
        jobStatus: updatedJob?.status,
        progress: updatedJob?.progress,
        stage: updatedJob?.stage,
      };
    },
  );
}
