import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { ProcessingJobModel } from '../../models/ProcessingJob.model.js';
import {
  selectAIProvider,
  type AIProviderName,
} from '../../services/aiProvider.router.js';
import {
  getAIWorkerHealth,
  dispatchVideoGeneration,
} from '../../services/aiWorker.client.js';

const providerSchema = z.enum([
  'auto',
  'local-wan',
  'huggingface',
  'google',
  'openai',
]);

const promptSchema = z.union([
  z.string().trim().min(1),
  z.object({
    id: z.string().optional(),
    text: z.string().trim().min(1),
    duration: z.number().positive().optional(),
  }),
]);

const generationRequestSchema = z.object({
  prompts: z.array(promptSchema).min(1).max(5),
  format: z.enum(['mp4', 'webm', 'mov']).default('mp4'),
  quality: z.enum(['720p', '1080p', '4k']).default('1080p'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
  language: z.string().trim().min(2).default('en'),
  provider: providerSchema.optional(),
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

function getNumberEnvironmentValue(
  name: string,
  defaultValue = 0,
): number {
  const value = Number(process.env[name] ?? defaultValue);

  return Number.isFinite(value)
    ? value
    : defaultValue;
}

export async function videoRoutes(
  app: FastifyInstance,
): Promise<void> {
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
      projectId: 'default-project',
      provider: 'pending-selection',
      model: 'pending-selection',
      payload: {
        prompts: promptTexts,
        format: input.format,
        quality: input.quality,
        aspectRatio: input.aspectRatio,
        language: input.language,
        requestedProvider,
      },
    });

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

      const selection = selectAIProvider({
        requestedProvider,
        localWorkerAvailable: localWanReady,
        allowPaidCloud: getBooleanEnvironmentValue(
          'ALLOW_PAID_CLOUD',
          false,
        ),
        estimatedCostUsd: getNumberEnvironmentValue(
          'AI_ESTIMATED_COST_USD',
          0,
        ),
        remainingBudgetUsd: getNumberEnvironmentValue(
          'AI_REMAINING_BUDGET_USD',
          0,
        ),
      });

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

      /*
       * Cloud adapters abhi implement nahi hue hain.
       * Isliye paid request ko silently kisi galat provider par
       * dispatch nahi karenge.
       */
      if (selection.provider !== 'local-wan') {
        const message =
          `${selection.provider} provider select hua, ` +
          'lekin iska generation adapter abhi implement nahi hua.';

        ProcessingJobModel.markError(jobId, message);

        return reply.status(501).send({
          jobId,
          status: 'error',
          progress: 0,
          provider: selection.provider,
          model: selection.model,
          error: message,
        });
      }

      await dispatchVideoGeneration({
        jobId,
        prompts: promptTexts,
        format: input.format,
        quality: input.quality,
        aspectRatio: input.aspectRatio,
        language: input.language,
        provider: selection.provider,
        model: selection.model,
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
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'AI provider selection ya dispatch fail ho gaya.';

      ProcessingJobModel.markError(jobId, message);

      return reply.status(503).send({
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

    return {
      jobId: job.id,
      status:
        job.status === 'done'
          ? 'ready'
          : job.status === 'processing' ||
              job.status === 'pending'
            ? 'generating'
            : 'error',
      estimatedTime: 0,
      progress: job.progress,
      stage: job.stage,
      provider: job.provider,
      model: job.model,
      videoUrl:
        typeof result?.videoUrl === 'string'
          ? result.videoUrl
          : undefined,
      failedClips: Array.isArray(result?.failedClips)
        ? result.failedClips
        : undefined,
      error: job.error ?? undefined,
    };
  });
}