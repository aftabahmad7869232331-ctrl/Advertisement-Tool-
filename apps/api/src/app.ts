import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { type FastifyInstance } from 'fastify';

import { getEnvironment } from './config/environment.js';
import { initializeDatabase } from './database/connection.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { internalAIRoutes } from './modules/internal/internalAI.routes.js';
import { videoRoutes } from './modules/video/video.routes.js';
import { workspaceRoutes } from './modules/workspace/workspace.routes.js';
import { applicationPlugin, generateRequestId } from './plugins/application.plugin.js';
import { rateLimitPlugin } from './plugins/rateLimit.plugin.js';

export async function buildApplication(): Promise<FastifyInstance> {
  const environment = getEnvironment();
  initializeDatabase();
  const app = Fastify({
    genReqId: generateRequestId,
    logger: {
      level: environment.LOG_LEVEL,
      redact: {
        paths: [
          'req.headers.x-ai-provider-key', 'req.headers.authorization',
          'request.headers.x-ai-provider-key', 'request.headers.authorization',
          'req.headers.x-ai-worker-token', 'req.headers.cookie',
          'request.headers.x-ai-worker-token', 'request.headers.cookie',
          '*.provider_api_key', '*.token', '*.apiKey',
        ],
        censor: '[REDACTED]',
      },
    },
  });

  await app.register(cors, {
    origin: environment.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true,
  });
  await app.register(helmet);
  await app.register(applicationPlugin);
  await app.register(rateLimitPlugin);
  await app.register(healthRoutes);
  await app.register(videoRoutes);
  await app.register(workspaceRoutes);
  await app.register(internalAIRoutes);
  return app;
}
