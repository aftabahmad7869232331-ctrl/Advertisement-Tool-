import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { ProcessingJobModel } from '../../models/ProcessingJob.model.js';

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
        ProcessingJobModel.updateProgress(
          job.id,
          update.progress ?? job.progress,
          update.stage ?? 'processing',
        );
      }

      if (update.status === 'done') {
        ProcessingJobModel.markDone(
          job.id,
          update.result ?? {},
        );
      }

      if (update.status === 'error') {
        ProcessingJobModel.markError(
          job.id,
          update.error ?? 'AI worker processing fail ho gayi.',
        );
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