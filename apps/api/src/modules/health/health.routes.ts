import type { FastifyInstance } from 'fastify';

import { db } from '../../database/connection.js';
import { getAIWorkerHealth } from '../../services/aiWorker.client.js';
import { getStorageProvider } from '../../services/storage/storageRegistry.js';
import { getStartupState } from '../../runtime/startupState.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
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
