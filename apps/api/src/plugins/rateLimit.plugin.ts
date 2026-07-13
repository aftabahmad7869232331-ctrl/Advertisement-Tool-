import type { FastifyInstance } from 'fastify';

const buckets = new Map<string, { count: number; resetAt: number }>();

export async function rateLimitPlugin(app: FastifyInstance): Promise<void> {
  app.addHook('onRequest', async (request, reply) => {
    const internal = request.url.startsWith('/api/internal/');
    const protectedRoute = internal || request.url.startsWith('/api/video/generate') || request.url.includes('/providers/validate') || request.url.endsWith('/cancel');
    if (!protectedRoute) return;
    const windowMs = 60_000;
    const limit = internal ? 120 : 30;
    const key = `${internal ? 'internal' : request.ip}:${Math.floor(Date.now() / windowMs)}`;
    const bucket = buckets.get(key) ?? { count: 0, resetAt: Date.now() + windowMs };
    bucket.count += 1; buckets.set(key, bucket);
    if (bucket.count > limit) return reply.status(429).send({ status: 'error', error: 'Rate limit exceeded.', requestId: request.id });
  });
}
