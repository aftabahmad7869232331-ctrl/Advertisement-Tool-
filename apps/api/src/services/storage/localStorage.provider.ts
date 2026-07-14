import { createHash, randomUUID } from 'node:crypto';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, rename, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Transform, type Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

import type { StorageObjectStat, StorageProvider, StoredObject } from './types.js';
import { StorageLimitError } from './types.js';

const defaultRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../storage/generated-videos',
);

export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local' as const;
  readonly root = path.resolve(process.env.LOCAL_STORAGE_ROOT?.trim() || defaultRoot);

  createObjectKey(jobId: string, extension: string): string {
    const safeJob = jobId.replace(/[^A-Za-z0-9_-]/g, '-').slice(0, 80);
    const safeExtension = [
      'mp4', 'webm', 'mov',
      'png', 'jpg', 'jpeg', 'webp',
      'mp3', 'wav', 'm4a', 'aac', 'ogg',
    ].includes(extension) ? extension : 'bin';
    return `generated/${safeJob}/${randomUUID()}.${safeExtension}`;
  }

  private resolveKey(key: string): string {
    const resolved = path.resolve(this.root, key);
    const relative = path.relative(this.root, resolved);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Invalid storage key.');
    }
    return resolved;
  }

  async save(key: string, source: Readable, maxBytes: number): Promise<StoredObject> {
    const destination = this.resolveKey(key);
    await mkdir(path.dirname(destination), { recursive: true });
    const temporary = `${destination}.pending-${randomUUID()}`;
    const hash = createHash('sha256');
    let sizeBytes = 0;
    const limiter = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        sizeBytes += chunk.length;
        if (sizeBytes > maxBytes) {
          callback(new StorageLimitError('Video artifact size limit se bada hai.'));
          return;
        }
        hash.update(chunk);
        callback(null, chunk);
      },
    });

    try {
      await pipeline(source, limiter, createWriteStream(temporary, { flags: 'wx' }));
      await rename(temporary, destination);
    } catch (error) {
      await rm(temporary, { force: true });
      throw error;
    }

    return { provider: this.name, key, sizeBytes, sha256: hash.digest('hex') };
  }

  read(key: string, range?: { start: number; end: number }): Readable {
    return createReadStream(this.resolveKey(key), range);
  }

  async stat(key: string): Promise<StorageObjectStat> {
    const absolutePath = this.resolveKey(key);
    const info = await stat(absolutePath);
    return { provider: this.name, key, sizeBytes: info.size, sha256: '', absolutePath };
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolveKey(key), { force: true });
  }
}
