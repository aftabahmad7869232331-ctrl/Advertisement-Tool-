export interface AIVideoGenerationRequest {
  jobId: string;
  prompts: string[];
  format: 'mp4' | 'webm' | 'mov';
  quality: '720p' | '1080p' | '4k';
  aspectRatio: '16:9' | '9:16' | '1:1';
  language: string;
  provider: string;
  model: string;
  providerApiKey?: string;
  duration?: number;
  seed?: number;
  negativePrompt?: string;
}

export interface AIWorkerAcceptedResponse {
  jobId: string;
  status: string;
  promptCount: number;
  provider: string;
  model: string;
}

export interface AIWorkerHealthResponse {
  status: string;
  service: string;
  model: string;
  localWanReady: boolean;
  modelExists: boolean;
  torchInstalled: boolean;
  cudaAvailable: boolean;
  device: string;
  reason: string;
  queueDepth?: number;
  activeJobs?: number;
}

const aiWorkerUrl =
  process.env.AI_WORKER_URL ?? 'http://127.0.0.1:8100';

export async function getAIWorkerHealth():
Promise<AIWorkerHealthResponse | null> {
  try {
    const response = await fetch(`${aiWorkerUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3_000),
    });

    if (!response.ok) {
      return null;
    }

    const data =
      (await response.json()) as AIWorkerHealthResponse;

    if (
      data.status !== 'ok' ||
      data.service !== 'ai-worker'
    ) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function checkAIWorkerHealth():
Promise<boolean> {
  const health = await getAIWorkerHealth();

  return health !== null;
}

export async function checkLocalWanReady():
Promise<boolean> {
  const health = await getAIWorkerHealth();

  return health?.localWanReady === true;
}

export async function dispatchVideoGeneration(
  input: AIVideoGenerationRequest,
): Promise<AIWorkerAcceptedResponse> {
  const response = await fetch(`${aiWorkerUrl}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      job_id: input.jobId,
      prompts: input.prompts,
      format: input.format,
      quality: input.quality,
      aspect_ratio: input.aspectRatio,
      language: input.language,
      provider: input.provider,
      model: input.model,
      provider_api_key: input.providerApiKey,
      duration: input.duration,
      seed: input.seed,
      negative_prompt: input.negativePrompt,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(
      `AI worker request failed (${response.status}).`,
    );
  }

  return response.json() as Promise<AIWorkerAcceptedResponse>;
}

export async function cancelVideoGeneration(jobId: string): Promise<boolean> {
  try {
    const response = await fetch(`${aiWorkerUrl}/jobs/${encodeURIComponent(jobId)}/cancel`, {
      method: 'POST',
      headers: { 'x-ai-worker-token': process.env.AI_WORKER_CALLBACK_TOKEN ?? 'local-dev-ai-worker' },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return false;
    const data = await response.json() as { cancelRequested?: boolean };
    return data.cancelRequested === true;
  } catch { return false; }
}
