import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';

import { ApplicationError } from '../errors/applicationError.js';

export async function applicationPlugin(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  app.setNotFoundHandler((request, reply) => reply.status(404).send({
    status: 'error',
    code: 'route_not_found',
    error: 'Requested API route nahi mili.',
    requestId: request.id,
  }));

  app.setErrorHandler((error, request, reply) => {
    const known = error instanceof ApplicationError;
    const statusCode = known ? error.statusCode : 500;
    request.log.error({ err: error, requestId: request.id }, 'API request failed');
    return reply.status(statusCode).send({
      status: 'error',
      code: known ? error.code : 'internal_error',
      error: known && error.expose ? error.message : 'Internal server error.',
      requestId: request.id,
    });
  });
}

export function generateRequestId(request: { headers: Record<string, unknown> }): string {
  const supplied = request.headers['x-request-id'];
  return typeof supplied === 'string' && /^[A-Za-z0-9._-]{8,128}$/.test(supplied)
    ? supplied
    : randomUUID();
}

