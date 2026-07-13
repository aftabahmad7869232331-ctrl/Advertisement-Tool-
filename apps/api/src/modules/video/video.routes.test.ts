import Fastify from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { videoRoutes } from './video.routes.js';

afterEach(() => vi.restoreAllMocks());

describe('provider validation API', () => {
  it('never exposes the API key in a successful response', async () => {
    const secret = 'hf_request_scoped_secret';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ name: 'safe-user', type: 'user' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )));

    const app = Fastify({ logger: false });
    await app.register(videoRoutes);
    const response = await app.inject({
      method: 'POST',
      url: '/api/video/providers/validate',
      headers: { 'x-ai-provider-key': secret },
      payload: { provider: 'huggingface' },
    });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.body).not.toContain(secret);
    expect(response.json()).toMatchObject({
      provider: 'huggingface',
      credentialSource: 'byok',
    });
  });

  it('returns 409 when an Idempotency-Key is reused with a different request', async () => {
    process.env.MAX_ACTIVE_JOBS_PER_CLIENT = '999';
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ name: 'safe-user', type: 'user' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ jobId: 'worker-job', status: 'queued', promptCount: 1, provider: 'huggingface', model: 'test' }), { status: 200 })));
    const app = Fastify({ logger: false });
    await app.register(videoRoutes);
    const base = {
      method: 'POST' as const, url: '/api/video/generate',
      headers: { 'x-ai-provider-key': 'hf_test', 'idempotency-key': `idem-${Date.now()}` },
    };
    const first = await app.inject({ ...base, payload: { prompts: ['first prompt'], provider: 'huggingface' } });
    expect(first.statusCode).toBe(202);
    const reused = await app.inject({ ...base, payload: { prompts: ['first prompt'], provider: 'huggingface' } });
    expect(reused.statusCode).toBe(200);
    expect(reused.json().reused).toBe(true);
    const conflict = await app.inject({ ...base, payload: { prompts: ['different prompt'], provider: 'huggingface' } });
    expect(conflict.statusCode).toBe(409);
    await app.close();
    delete process.env.MAX_ACTIVE_JOBS_PER_CLIENT;
  });
});
