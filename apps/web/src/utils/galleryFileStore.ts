const DB_NAME = 'brick-maker-gallery-files';
const STORE_NAME = 'files';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) database.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Gallery file database could not be opened.'));
  });
}

async function runRequest<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Gallery file operation failed.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Gallery file transaction failed.'));
    };
  });
}

export function saveGalleryFile(id: string, file: Blob): Promise<IDBValidKey> {
  return runRequest('readwrite', (store) => store.put(file, id));
}

export function getGalleryFile(id: string): Promise<Blob | undefined> {
  return runRequest('readonly', (store) => store.get(id));
}

export function deleteGalleryFile(id: string): Promise<undefined> {
  return runRequest('readwrite', (store) => store.delete(id));
}
