import type { Readable } from 'node:stream';

export interface StoredObject {
  provider: 'local';
  key: string;
  sizeBytes: number;
  sha256: string;
}

export interface StorageObjectStat extends StoredObject {
  absolutePath: string;
}

export interface StorageProvider {
  readonly name: 'local';
  createObjectKey(jobId: string, extension: string): string;
  save(key: string, source: Readable, maxBytes: number): Promise<StoredObject>;
  read(key: string, range?: { start: number; end: number }): Readable;
  stat(key: string): Promise<StorageObjectStat>;
  delete(key: string): Promise<void>;
}

export class StorageLimitError extends Error {}

