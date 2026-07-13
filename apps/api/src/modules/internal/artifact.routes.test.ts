import { createHash, randomUUID } from 'node:crypto';
import Fastify from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';

import { initializeDatabase } from '../../database/connection.js';
import { ProcessingJobModel } from '../../models/ProcessingJob.model.js';
import { VideoModel } from '../../models/Video.model.js';
import { getStorageProvider } from '../../services/storage/storageRegistry.js';
import { internalAIRoutes } from './internalAI.routes.js';
import { videoRoutes } from '../video/video.routes.js';

initializeDatabase();
const createdVideoIds: string[] = [];
const createdStorageKeys: string[] = [];

afterEach(async () => {
  delete process.env.MAX_VIDEO_FILE_SIZE_MB;
  for (const id of createdVideoIds.splice(0)) VideoModel.delete(id);
  for (const key of createdStorageKeys.splice(0)) await getStorageProvider().delete(key);
});

function createJob(): string {
  const id = randomUUID();
  ProcessingJobModel.create({
    id,
    jobType: 'video_generation',
    projectId: 'default-project',
    provider: 'huggingface',
    model: 'test/model',
  });
  ProcessingJobModel.updateProgress(id, 50, 'generating');
  return id;
}

const videoBytes = Buffer.concat([
  Buffer.from([0, 0, 0, 24]), Buffer.from('ftypisom'), Buffer.from('mock-video-content'),
]);

describe('worker artifact ingestion and delivery', () => {
  it('rejects unauthorized and oversized uploads', async () => {
    const app = Fastify({ logger: false });
    await app.register(internalAIRoutes);
    const jobId = createJob();
    const unauthorized = await app.inject({
      method: 'POST', url: `/api/internal/ai/jobs/${jobId}/artifact`,
      headers: { 'content-type': 'application/octet-stream' }, payload: videoBytes,
    });
    expect(unauthorized.statusCode).toBe(401);

    process.env.MAX_VIDEO_FILE_SIZE_MB = '0.000001';
    const oversized = await app.inject({
      method: 'POST', url: `/api/internal/ai/jobs/${jobId}/artifact`,
      headers: {
        'content-type': 'application/octet-stream',
        'x-ai-worker-token': 'local-dev-ai-worker',
      }, payload: videoBytes,
    });
    expect(oversized.statusCode).toBe(413);
    await app.close();
  });

  it('stores checksum idempotently and serves byte ranges without paths', async () => {
    const app = Fastify({ logger: false });
    await app.register(internalAIRoutes);
    await app.register(videoRoutes);
    const jobId = createJob();
    const sha256 = createHash('sha256').update(videoBytes).digest('hex');
    const headers = {
      'content-type': 'application/octet-stream',
      'x-ai-worker-token': 'local-dev-ai-worker',
      'x-artifact-filename': '../../prompt-controlled.mp4',
      'x-artifact-sha256': sha256,
    };
    const uploaded = await app.inject({
      method: 'POST', url: `/api/internal/ai/jobs/${jobId}/artifact`, headers, payload: videoBytes,
    });
    expect(uploaded.statusCode).toBe(201);
    const videoId = uploaded.json().videoId as string;
    createdVideoIds.push(videoId);
    const stored = VideoModel.findById(videoId)!;
    createdStorageKeys.push(stored.storageKey!);
    expect(stored.sha256).toBe(sha256);
    expect(stored.originalFilename).not.toContain('..');
    expect(stored.duration).toBeNull();

    const duplicate = await app.inject({
      method: 'POST', url: `/api/internal/ai/jobs/${jobId}/artifact`, headers, payload: videoBytes,
    });
    expect(duplicate.statusCode).toBe(200);
    expect(duplicate.json().idempotent).toBe(true);

    const ranged = await app.inject({
      method: 'GET', url: `/api/videos/${videoId}/content`, headers: { range: 'bytes=4-7' },
    });
    expect(ranged.statusCode).toBe(206);
    expect(ranged.rawPayload).toEqual(videoBytes.subarray(4, 8));

    const job = await app.inject({ method: 'GET', url: `/api/video/jobs/${jobId}` });
    expect(job.body).not.toContain(stored.storageKey!);
    expect(job.body).not.toContain('generated-videos');
    await app.close();
  });
});
