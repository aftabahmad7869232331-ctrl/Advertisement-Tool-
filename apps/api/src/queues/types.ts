export type QueueJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface QueueJob<TPayload extends Record<string, unknown>> {
  id: string;
  type: string;
  payload: TPayload;
  status: QueueJobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
}

export interface JobQueue {
  enqueue<TPayload extends Record<string, unknown>>(
    type: string,
    payload: TPayload,
    options?: { id?: string; maxAttempts?: number },
  ): Promise<QueueJob<TPayload>>;
  cancel(jobId: string): Promise<boolean>;
}

