import { readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { VideoModel } from '../models/Video.model.js';

function retentionMilliseconds(name: string, fallbackHours: number): number {
  const hours = Number(process.env[name] ?? fallbackHours);
  return (Number.isFinite(hours) && hours > 0 ? hours : fallbackHours) * 3_600_000;
}

export async function cleanupLocalArtifacts(): Promise<{ removed: number }> {
  const defaultRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../storage/generated-videos',
  );
  const root = path.resolve(
    process.env.LOCAL_STORAGE_ROOT?.trim() || defaultRoot,
  );
  const protectedKeys = new Set(
    VideoModel.all().filter((video) => video.status === 'completed').flatMap((video) =>
      video.storageKey ? [path.normalize(video.storageKey)] : [],
    ),
  );
  const now = Date.now();
  const pendingRetention = retentionMilliseconds('TEMP_ARTIFACT_RETENTION_HOURS', 24);
  const orphanRetention = retentionMilliseconds('FAILED_ARTIFACT_RETENTION_HOURS', 72);
  let removed = 0;

  async function visit(directory: string): Promise<void> {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) { await visit(absolute); continue; }
      const relative = path.normalize(path.relative(root, absolute));
      if (protectedKeys.has(relative)) continue;
      const age = now - (await stat(absolute)).mtimeMs;
      const retention = entry.name.includes('.pending-') ? pendingRetention : orphanRetention;
      if (age >= retention) { await rm(absolute, { force: true }); removed += 1; }
    }
  }

  await visit(root);
  return { removed };
}
