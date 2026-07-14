import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { afterEach, describe, expect, it } from 'vitest';

import { initializeDatabase } from '../database/connection.js';
import { VideoModel } from '../models/Video.model.js';
import { cleanupLocalArtifacts } from './artifactCleanup.service.js';
import { getStorageProvider } from './storage/storageRegistry.js';

initializeDatabase();
const videoIds: string[] = [];

afterEach(() => {
  for (const id of videoIds.splice(0)) VideoModel.delete(id);
});

describe('temporary media retention', () => {
  it('finds expired temporary media and preserves explicitly saved media', () => {
    const id = randomUUID();
    videoIds.push(id);
    VideoModel.create({
      id,
      url: `/api/videos/${id}/content`,
      status: 'completed',
      temporary: true,
      expiresAt: new Date(Date.now() - 60_000),
    });
    expect(VideoModel.findExpiredTemporary().some((video) => video.id === id)).toBe(true);

    const saved = VideoModel.markSaved(id);
    expect(saved).toMatchObject({ temporary: false, expiresAt: null });
    expect(VideoModel.findExpiredTemporary().some((video) => video.id === id)).toBe(false);
  });

  it('deletes expired temporary media from storage and database', async () => {
    const id = randomUUID();
    videoIds.push(id);
    const storage = getStorageProvider();
    const key = storage.createObjectKey(id, 'mp4');
    const stored = await storage.save(key, Readable.from(Buffer.from('temporary-media')), 1024);
    VideoModel.create({
      id,
      url: `/api/videos/${id}/content`,
      storageKey: stored.key,
      storageProvider: stored.provider,
      status: 'completed',
      temporary: true,
      expiresAt: new Date(Date.now() - 60_000),
    });

    const result = await cleanupLocalArtifacts();
    expect(result.expiredVideos).toBeGreaterThanOrEqual(1);
    expect(VideoModel.findById(id)).toBeUndefined();
    await expect(storage.stat(key)).rejects.toThrow();
  });
});
