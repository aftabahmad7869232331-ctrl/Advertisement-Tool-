import type { StorageProvider } from './types.js';
import { LocalStorageProvider } from './localStorage.provider.js';

const local = new LocalStorageProvider();

export function getStorageProvider(): StorageProvider {
  const configured = process.env.STORAGE_PROVIDER?.trim() || 'local';
  if (configured !== 'local') {
    throw new Error('Configured storage provider supported nahi hai.');
  }
  return local;
}

