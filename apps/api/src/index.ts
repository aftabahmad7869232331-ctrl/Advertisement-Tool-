import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { initializeDatabase } from './database/connection.js';
import { ProcessingJobModel } from './models/ProcessingJob.model.js';
import { videoRoutes } from './modules/video/video.routes.js';

initializeDatabase();

const orphanedJobs = ProcessingJobModel.reconcileOrphanedJobs();

const app = Fastify({
  logger: true,
});

await app.register(cors, {
  origin: true,
});

await app.register(helmet);
await app.register(videoRoutes);

app.get('/api/health', async () => {
  return {
    status: 'ok',
    service: 'api',
    database: 'ready',
    orphanedJobsReconciled: orphanedJobs,
    timestamp: new Date().toISOString(),
  };
});

const port = Number(process.env.API_PORT ?? 3000);
const host = process.env.API_HOST ?? '127.0.0.1';

try {
  await app.listen({ port, host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
