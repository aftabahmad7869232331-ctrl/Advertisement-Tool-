import type { FastifyInstance } from 'fastify';

import { db } from '../../database/connection.js';
import { getAIWorkerHealth } from '../../services/aiWorker.client.js';
import { getStorageProvider } from '../../services/storage/storageRegistry.js';
import { getStartupState } from '../../runtime/startupState.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/config/limits', async () => {
    const provider = (process.env.VIDEO_PROVIDER ?? 'local-wan').toLowerCase();
    const isPaidCloud = provider.includes('veo');
    return {
      maxClipCount: Number(process.env.MAX_PROMPTS_PER_JOB ?? 5),
      clipDurationSeconds: Number(process.env.DEFAULT_CLIP_DURATION_SECONDS ?? 6),
      provider: isPaidCloud ? 'veo' : provider.includes('huggingface') ? 'hf' : 'local',
      veoModel: isPaidCloud ? (process.env.VEO_MODEL ?? 'veo-3.1') : null,
      costPerSecondUsd: isPaidCloud ? Number(process.env.VEO_COST_PER_SECOND_USD ?? 0) : 0,
      costNote: isPaidCloud
        ? 'Paid cloud provider estimate; final credits actual usage par settle honge.'
        : 'Local/open-source engine: provider API charge nahi, server/GPU usage credits apply honge.',
    };
  });

  app.get('/api/health', async () => {
    db.prepare('SELECT 1').get();
    return {
      status: 'ok', service: 'api', database: 'ready',
      orphanedJobsReconciled: getStartupState().orphanedJobsReconciled,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  });

  app.get('/api/ready', async (_request, reply) => {
    let database = false;
    let storage = false;
    try { db.prepare('SELECT 1').get(); database = true; } catch { database = false; }
    try { getStorageProvider(); storage = true; } catch { storage = false; }
    const worker = await getAIWorkerHealth();
    const ready = database && storage;
    return reply.status(ready ? 200 : 503).send({
      status: ready ? 'ready' : 'not_ready',
      checks: {
        databaseReady: database,
        storageWritable: storage,
        workerReachable: worker !== null,
        localWanReady: worker?.localWanReady === true,
        queueDepth: worker?.queueDepth ?? null,
        activeJobs: worker?.activeJobs ?? null,
        cloudConfigured: Boolean(process.env.HF_TOKEN?.trim()),
        paidCloudEnabled: ['1','true','yes','on'].includes((process.env.ALLOW_PAID_CLOUD ?? 'false').toLowerCase()),
      },
      timestamp: new Date().toISOString(),
    });
  });
}
