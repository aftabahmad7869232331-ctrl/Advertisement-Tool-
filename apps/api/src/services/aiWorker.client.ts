export interface AIVideoGenerationRequest {
  jobId: string;
  prompts: string[];
  format: 'mp4' | 'webm' | 'mov';
  quality: '720p' | '1080p' | '4k';
  aspectRatio: '16:9' | '9:16' | '1:1';
  language: string;
  provider: string;
  model: string;
}

export interface AIWorkerAcceptedResponse {
  jobId: string;
  status: string;
  promptCount: number;
  provider: string;
  model: string;
}

const aiWorkerUrl =
  process.env.AI_WORKER_URL ?? 'http://127.0.0.1:8100';

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
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const message = await response.text();

    throw new Error(
      `AI worker request failed (${response.status}): ${message}`,
    );
  }

  return response.json() as Promise<AIWorkerAcceptedResponse>;
}
