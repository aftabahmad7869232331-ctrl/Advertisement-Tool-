import Fastify from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { initializeDatabase } from '../../database/connection.js';
import { mediaRoutes } from './media.routes.js';

initializeDatabase();
afterEach(() => vi.restoreAllMocks());

describe('local media API', () => {
  it('advertises real local export formats', async () => {
    const app = Fastify({ logger: false });
    await app.register(mediaRoutes);
    const response = await app.inject({ method: 'GET', url: '/api/video/export/formats' });
    await app.close();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(expect.arrayContaining([
      expect.objectContaining({ format: 'mp4' }),
      expect.objectContaining({ format: 'webm' }),
    ]));
  });

  it('validates edit requests before invoking FFmpeg', async () => {
    const app = Fastify({ logger: false });
    await app.register(mediaRoutes);
    const response = await app.inject({ method: 'POST', url: '/api/video/edit', payload: { videoId: 'invalid', operations: [] } });
    await app.close();
    expect(response.statusCode).toBe(400);
  });

  it('returns analytics in the dashboard contract', async () => {
    const app = Fastify({ logger: false });
    await app.register(mediaRoutes);
    const response = await app.inject({ method: 'GET', url: '/api/pro/analytics?days=7' });
    await app.close();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      period: { days: 7 },
      summary: { totalEvents: expect.any(Number), successRate: expect.any(Number) },
      byType: expect.any(Array),
      byModel: expect.any(Array),
      dailyActivity: expect.any(Array),
    });
  });

  it('proxies local image generation results from the AI worker', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      images: [{ id: 'image-1', imageUrl: 'data:image/png;base64,AA==' }], provider: 'local-tiny-sd',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })));
    const app = Fastify({ logger: false });
    await app.register(mediaRoutes);
    const response = await app.inject({ method: 'POST', url: '/api/image-generator/generate', payload: { prompt: 'brick house' } });
    await app.close();
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ provider: 'local-tiny-sd', images: [{ id: 'image-1' }] });
  });
});
