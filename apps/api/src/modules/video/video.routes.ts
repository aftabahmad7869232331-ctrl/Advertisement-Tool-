import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { ProcessingJobModel } from '../../models/ProcessingJob.model.js';
import { dispatchVideoGeneration } from '../../services/aiWorker.client.js';

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
});

export async function videoRoutes(app: FastifyInstance): Promise<void> {
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
      typeof prompt === 'string' ? prompt : prompt.text,
    );

    ProcessingJobModel.create({
      id: jobId,
      jobType: 'video_generation',
      projectId: 'default-project',
      provider: 'local-ai-worker',
      model: 'wan2.1',
      payload: {
        prompts: promptTexts,
        format: input.format,
        quality: input.quality,
        aspectRatio: input.aspectRatio,
        language: input.language,
      },
    });

    try {
      await dispatchVideoGeneration({
        jobId,
        prompts: promptTexts,
        format: input.format,
        quality: input.quality,
        aspectRatio: input.aspectRatio,
        language: input.language,
        provider: 'local-ai-worker',
        model: 'wan2.1',
      });

      ProcessingJobModel.updateProgress(
        jobId,
        1,
        'accepted_by_ai_worker',
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'AI worker connection failed';

      ProcessingJobModel.markError(jobId, message);

      return reply.status(503).send({
        jobId,
        status: 'error',
        estimatedTime: 0,
        progress: 0,
        error: message,
      });
    }

    return reply.status(202).send({
      jobId,
      status: 'generating',
      estimatedTime: promptTexts.length * 15,
      progress: 1,
    });
  });

  app.get<{
    Params: {
      jobId: string;
    };
  }>('/api/video/jobs/:jobId', async (request, reply) => {
    const job = ProcessingJobModel.findById(request.params.jobId);

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
          : job.status === 'processing' || job.status === 'pending'
            ? 'generating'
            : 'error',
      estimatedTime: 0,
      progress: job.progress,
      stage: job.stage,
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
