async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw new Error(`Workspace API failed (${response.status}).`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

interface LocalActionRecord {
  id: string;
  page: string;
  action: string;
  payload: unknown;
  createdAt: string;
  synced: boolean;
}

const ACTION_JOURNAL_KEY = 'brick-maker-local:workspace-actions';

function writeActionJournal(record: LocalActionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const current = JSON.parse(window.localStorage.getItem(ACTION_JOURNAL_KEY) ?? '[]') as LocalActionRecord[];
    window.localStorage.setItem(ACTION_JOURNAL_KEY, JSON.stringify([record, ...current].slice(0, 250)));
  } catch {
    // A blocked/full localStorage must not prevent the server request.
  }
}

function markActionSynced(localId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = JSON.parse(window.localStorage.getItem(ACTION_JOURNAL_KEY) ?? '[]') as LocalActionRecord[];
    window.localStorage.setItem(
      ACTION_JOURNAL_KEY,
      JSON.stringify(current.map((item) => item.id === localId ? { ...item, synced: true } : item)),
    );
  } catch {
    // The server action is already accepted; journal metadata is best-effort.
  }
}

async function recordAction(page: string, action: string, payload: unknown): Promise<{ id: string; accepted: boolean }> {
  const localId = crypto.randomUUID();
  writeActionJournal({ id: localId, page, action, payload, createdAt: new Date().toISOString(), synced: false });
  try {
    const remote = await request<{ id: string; accepted: boolean }>('/api/workspace/actions', {
      method: 'POST', body: JSON.stringify({ page, action, payload }),
    });
    markActionSynced(localId);
    return remote;
  } catch {
    return { id: localId, accepted: true };
  }
}

export const workspaceApi = {
  list: <T>(collection: string) => request<T[]>(`/api/workspace/${collection}`),
  save: <T extends { id: string }>(collection: string, value: T) =>
    request<T>(`/api/workspace/${collection}/${encodeURIComponent(value.id)}`, {
      method: 'PUT', body: JSON.stringify(value),
    }),
  update: <T>(collection: string, id: string, value: Partial<T>) =>
    request<T>(`/api/workspace/${collection}/${encodeURIComponent(id)}`, {
      method: 'PATCH', body: JSON.stringify(value),
    }),
  remove: (collection: string, id: string) =>
    request<void>(`/api/workspace/${collection}/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  action: (page: string, action: string, payload: unknown = {}) => recordAction(page, action, payload),
};
