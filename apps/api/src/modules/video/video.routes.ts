import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { ProcessingJobModel } from '../../models/ProcessingJob.model.js';
import { VideoModel } from '../../models/Video.model.js';
import { getStorageProvider } from '../../services/storage/storageRegistry.js';
import { db } from '../../database/connection.js';
import { cancelVideoGeneration } from '../../services/aiWorker.client.js';
import { enforceGenerationPolicy, recordUsage } from '../../services/generationPolicy.service.js';
import { findIdempotency, requestHash, saveIdempotency } from '../../services/idempotency.service.js';
import {
  selectAIProvider,
  type AIProviderName,
} from '../../services/aiProvider.router.js';
import {
  getAIWorkerHealth,
  dispatchVideoGeneration,
} from '../../services/aiWorker.client.js';
import { resolveHuggingFaceCredential } from '../../services/providerCredential.service.js';
import { getProviderAdapter } from '../../services/providers/providerRegistry.js';
import {
  InvalidProviderCredentialError,
  ProviderUnavailableError,
} from '../../services/providers/types.js';

const providerSchema = z.enum([
  'auto',
  'local-wan',
  'huggingface',
]);

const promptSchema = z.union([
  z.string().trim().min(1).max(2000),
  z.object({
    id: z.string().optional(),
    text: z.string().trim().min(1).max(2000),
    duration: z.number().positive().optional(),
  }),
]);

const generationRequestSchema = z.object({
  prompts: z.array(promptSchema).min(1).max(10),
  format: z.enum(['mp4', 'webm', 'mov']).default('mp4'),
  quality: z.enum(['720p', '1080p', '4k']).default('1080p'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
  language: z.string().trim().min(2).max(16).default('en'),
  provider: providerSchema.optional(),
  duration: z.number().positive().max(10).default(10),
  seed: z.number().int().nonnegative().optional(),
  negativePrompt: z.string().trim().min(1).max(2000).optional(),
});

function getConfiguredProvider(): AIProviderName {
  const parsed = providerSchema.safeParse(
    process.env.AI_PROVIDER ?? 'auto',
  );

  return parsed.success ? parsed.data : 'auto';
}

function getBooleanEnvironmentValue(
  name: string,
  defaultValue = false,
): boolean {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(
    value.trim().toLowerCase(),
  );
}

export async function videoRoutes(
  app: FastifyInstance,
): Promise<void> {
  app.post('/api/video/providers/validate', async (request, reply) => {
    const body = z.object({ provider: z.string().trim().min(1) }).safeParse(request.body);

    if (!body.success || body.data.provider !== 'huggingface') {
      return reply.status(400).send({
        status: 'error',
        error: 'Unsupported provider.',
      });
    }

    const credential = resolveHuggingFaceCredential({
      ...(request.headers['x-ai-provider-key'] !== undefined
        ? { byokHeader: request.headers['x-ai-provider-key'] }
        : {}),
      allowServerCredential: false,
    });

    if (credential.source !== 'byok' || !credential.value) {
      return reply.status(400).send({
        status: 'error',
        error: 'x-ai-provider-key header required hai.',
      });
    }

    const adapter = getProviderAdapter('huggingface');
    try {
      const validation = await adapter.validateCredential(credential.value);
      return reply.status(200).send({
        status: 'ok',
        ...adapter.getPublicMetadata('byok', validation),
      });
    } catch (error) {
      if (error instanceof InvalidProviderCredentialError) {
        return reply.status(401).send({ status: 'error', error: error.message });
      }
      return reply.status(502).send({
        status: 'error',
        error: error instanceof ProviderUnavailableError
          ? error.message
          : 'Hugging Face credential service unavailable hai.',
      });
    }
  });

  app.post('/api/video/generate', async (request, reply) => {
    const parsed = generationRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        status: 'error',
        error: 'Video generation request invalid hai.',
        details: parsed.error.flatten(),
      });
    }

    const input = parsed.data;
    const maxPrompts = Number(process.env.MAX_PROMPTS_PER_JOB ?? 10);
    if (input.prompts.length > maxPrompts) return reply.status(400).send({ status: 'error', error: 'Prompt count limit exceed hui.' });
    const clientScope = request.ip;
    const rawIdempotencyKey = request.headers['idempotency-key'];
    const idempotencyKey = typeof rawIdempotencyKey === 'string' ? rawIdempotencyKey.trim() : undefined;
    if (idempotencyKey && !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
      return reply.status(400).send({ status: 'error', error: 'Idempotency-Key invalid hai.' });
    }
    const hash = requestHash(input);
    if (idempotencyKey) {
      const existing = findIdempotency(clientScope, idempotencyKey);
      if (existing) {
        if (existing.requestHash !== hash) return reply.status(409).send({ status: 'error', error: 'Idempotency-Key request conflict.' });
        const job = ProcessingJobModel.findById(existing.jobId);
        return reply.status(200).send({ jobId: existing.jobId, status: job?.status ?? 'queued', reused: true });
      }
    }
    const active = (db.prepare("SELECT COUNT(*) AS count FROM processing_jobs WHERE user_id=$scope AND status IN ('queued','accepted','validating','processing','uploading','retrying')").get({ $scope: clientScope }) as { count: number }).count;
    if (active >= Number(process.env.MAX_ACTIVE_JOBS_PER_CLIENT ?? 2)) return reply.status(429).send({ status: 'error', error: 'Active job limit reach ho gayi.' });
    const jobId = randomUUID();

    const promptTexts = input.prompts.map((prompt) =>
      typeof prompt === 'string'
        ? prompt
        : prompt.text,
    );

    const requestedProvider =
      input.provider ?? getConfiguredProvider();

    ProcessingJobModel.create({
      id: jobId,
      jobType: 'video_generation',
      projectId: 'default-project', userId: clientScope,
      provider: 'pending-selection',
      model: 'pending-selection',
      payload: {
        prompts: promptTexts,
        format: input.format,
        quality: input.quality,
        aspectRatio: input.aspectRatio,
        language: input.language,
        requestedProvider,
        ...(input.duration !== undefined ? { duration: input.duration } : {}),
        ...(input.seed !== undefined ? { seed: input.seed } : {}),
        ...(input.negativePrompt !== undefined ? { negativePrompt: input.negativePrompt } : {}),
      },
    });
    if (idempotencyKey) saveIdempotency(clientScope, idempotencyKey, hash, jobId);

    try {
      const shouldCheckLocalWorker =
        requestedProvider === 'auto' ||
        requestedProvider === 'local-wan';

      const workerHealth =
        shouldCheckLocalWorker
          ? await getAIWorkerHealth()
          : null;

      const localWanReady =
        workerHealth?.localWanReady === true;

      if (
        requestedProvider === 'local-wan' &&
        !localWanReady
      ) {
        throw new Error(
          workerHealth?.reason ??
            'Local Wan2.1 worker available nahi hai.',
        );
      }

      const adapter = getProviderAdapter('huggingface');
      const credential = resolveHuggingFaceCredential({
        ...(request.headers['x-ai-provider-key'] !== undefined
          ? { byokHeader: request.headers['x-ai-provider-key'] }
          : {}),
        allowServerCredential: getBooleanEnvironmentValue('ALLOW_PAID_CLOUD', false),
      });

      let validation;
      const shouldValidateHuggingFace =
        requestedProvider === 'huggingface' ||
        (requestedProvider === 'auto' && !localWanReady);

      if (shouldValidateHuggingFace && credential.value) {
        validation = await adapter.validateCredential(credential.value);
      }

      const selection = selectAIProvider({
        requestedProvider,
        localWanReady,
        huggingFaceModel: adapter.model,
        ...(credential.value && validation
          ? { huggingFaceCredential: { source: credential.source as 'byok' | 'server', validation } }
          : {}),
      });
      const estimatedCostUsd = enforceGenerationPolicy({
        credentialSource: selection.credentialSource,
        duration: input.duration,
      });
      recordUsage({ jobId, provider: selection.provider, model: selection.model,
        credentialSource: selection.credentialSource, estimatedCostUsd,
        duration: input.duration, status: 'queued' });

      ProcessingJobModel.setProvider(
        jobId,
        selection.provider,
        selection.model,
      );

      ProcessingJobModel.updateProgress(
        jobId,
        1,
        'provider_selected',
      );

      await dispatchVideoGeneration({
        jobId,
        prompts: promptTexts,
        format: input.format,
        quality: input.quality,
        aspectRatio: input.aspectRatio,
        language: input.language,
        provider: selection.provider,
        model: selection.model,
        ...(selection.provider === 'huggingface' && credential.value
          ? { providerApiKey: credential.value }
          : {}),
        ...(input.duration !== undefined ? { duration: input.duration } : {}),
        ...(input.seed !== undefined ? { seed: input.seed } : {}),
        ...(input.negativePrompt !== undefined ? { negativePrompt: input.negativePrompt } : {}),
      });

      ProcessingJobModel.updateProgress(
        jobId,
        2,
        'accepted_by_ai_worker',
      );

      return reply.status(202).send({
        jobId,
        status: 'generating',
        estimatedTime: promptTexts.length * 15,
        progress: 2,
        provider: selection.provider,
        model: selection.model,
        credentialSource: selection.credentialSource,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'AI provider selection ya dispatch fail ho gaya.';

      ProcessingJobModel.markError(jobId, message);

      const statusCode = error instanceof InvalidProviderCredentialError
        ? 401
        : error instanceof ProviderUnavailableError
          ? 502
          : 503;

      return reply.status(statusCode).send({
        jobId,
        status: 'error',
        estimatedTime: 0,
        progress: 0,
        error: message,
      });
    }
  });

  app.get<{
    Params: {
      jobId: string;
    };
  }>('/api/video/jobs/:jobId', async (request, reply) => {
    const job = ProcessingJobModel.findById(
      request.params.jobId,
    );

    if (!job) {
      return reply.status(404).send({
        status: 'error',
        error: 'Video generation job nahi mila.',
      });
    }

    const result = job.result;
    const video = VideoModel.findByJobId(job.id);

    return {
      jobId: job.id,
      status:
        job.status === 'ready'
          ? 'ready'
          : ['queued','accepted','validating','processing','uploading','retrying'].includes(job.status)
            ? 'generating'
            : job.status,
      estimatedTime: 0,
      progress: job.progress,
      stage: job.stage,
      provider: job.provider,
      model: job.model,
      videoUrl:
        video?.url ?? (typeof result?.videoUrl === 'string' ? result.videoUrl : undefined),
      video: video ? {
        id: video.id,
        url: video.url,
        mimeType: video.mimeType,
        sizeBytes: video.fileSize,
        durationSeconds: video.duration,
        width: video.width,
        height: video.height,
        fps: video.fps,
        codec: video.codec,
      } : undefined,
      failedClips: Array.isArray(result?.failedClips)
        ? result.failedClips
        : undefined,
      error: job.error ?? undefined,
    };
  });

  app.post<{ Params: { jobId: string } }>('/api/video/jobs/:jobId/cancel', async (request, reply) => {
    const job = ProcessingJobModel.findById(request.params.jobId);
    if (!job) return reply.status(404).send({ status: 'error', error: 'Job nahi mila.' });
    if (['ready', 'failed', 'cancelled', 'timed_out'].includes(job.status)) {
      return { status: job.status, jobId: job.id, idempotent: true };
    }
    await cancelVideoGeneration(job.id);
    ProcessingJobModel.transition(job.id, 'cancelled', 'cancelled_by_user');
    return { status: 'cancelled', jobId: job.id };
  });

  app.get<{ Params: { videoId: string } }>(
    '/api/videos/:videoId/content',
    async (request, reply) => {
      const video = VideoModel.findById(request.params.videoId);
      if (!video?.storageKey) return reply.status(404).send({ status: 'error', error: 'Video nahi mila.' });

      try {
        const storage = getStorageProvider();
        const info = await storage.stat(video.storageKey);
        const rangeHeader = request.headers.range;
        reply.header('Accept-Ranges', 'bytes');
        reply.header('Content-Type', video.mimeType);
        reply.header('Content-Disposition', `inline; filename="${video.originalFilename ?? 'video'}"`);

        if (!rangeHeader) {
          reply.header('Content-Length', info.sizeBytes);
          return reply.send(storage.read(video.storageKey));
        }

        const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
        if (!match) return reply.status(416).header('Content-Range', `bytes */${info.sizeBytes}`).send();
        const suffixLength = !match[1] && match[2] ? Number(match[2]) : null;
        const start = suffixLength !== null
          ? Math.max(0, info.sizeBytes - suffixLength)
          : Number(match[1]);
        const requestedEnd = match[1] && match[2] ? Number(match[2]) : info.sizeBytes - 1;
        const end = Math.min(requestedEnd, info.sizeBytes - 1);
        if (start < 0 || end < start || start >= info.sizeBytes || end >= info.sizeBytes) {
          return reply.status(416).header('Content-Range', `bytes */${info.sizeBytes}`).send();
        }
        reply.status(206);
        reply.header('Content-Range', `bytes ${start}-${end}/${info.sizeBytes}`);
        reply.header('Content-Length', end - start + 1);
        return reply.send(storage.read(video.storageKey, { start, end }));
      } catch {
        return reply.status(404).send({ status: 'error', error: 'Video content nahi mila.' });
      }
    },
  );
}
