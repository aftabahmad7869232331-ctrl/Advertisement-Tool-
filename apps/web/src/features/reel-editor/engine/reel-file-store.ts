const DB_NAME = 'brick-maker-reel-files';
const STORE_NAME = 'sources';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Reel source database could not be opened.'));
  });
}

async function runRequest<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Reel source operation failed.'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('Reel source transaction failed.'));
    };
  });
}

export const saveReelSource = (id: string, file: Blob): Promise<IDBValidKey> =>
  runRequest('readwrite', (store) => store.put(file, id));

export const getReelSource = (id: string): Promise<Blob | undefined> =>
  runRequest('readonly', (store) => store.get(id));

export const deleteReelSource = (id: string): Promise<undefined> =>
  runRequest('readwrite', (store) => store.delete(id));
