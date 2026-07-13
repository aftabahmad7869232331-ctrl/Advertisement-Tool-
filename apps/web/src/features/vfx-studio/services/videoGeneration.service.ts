// ============================================================
// VIDEO GENERATION SERVICE
// ============================================================

import type { VideoGenerationRequest, VideoGenerationResponse } from '../types/video.types';
import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

class VideoGenerationService {
  async generate(
    request: VideoGenerationRequest,
    onProgress?: (percent: number) => void,
    onAccepted?: (jobId: string) => void,
    idempotencyKey?: string,
  ): Promise<VideoGenerationResponse> {
    const response = await fetch(`${API_BASE}/api/video/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Generation failed: ${response.statusText}`);
    const data: VideoGenerationResponse = await response.json();
    if (data.jobId) onAccepted?.(data.jobId);

    // Poll for progress
    if (data.jobId) {
      await this.pollJobStatus(data.jobId, onProgress);
    }
    return data;
  }

  async cancel(jobId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/video/jobs/${jobId}/cancel`, { method: 'POST' });
    if (!response.ok) throw new Error('Cancellation request failed');
  }

  async pollJobStatus(jobId: string, onProgress?: (p: number) => void): Promise<VideoGenerationResponse> {
    // Level 2 Phase B1: pehle sirf 120 attempts x 2 sec = 4 minute tak
    // hi poll hota tha, phir "timed out" throw ho jaata tha. Provider
    // queues kabhi-kabhi slow ho sakti hain. Ab jab tak job DB mein 'ready'
    // ya 'error' status na de, poll chalta rehta hai (jobs ab Phase A1
    // ki wajah se DB-persisted hain, isliye hamesha terminate honge).
    let lastProgress = 0;
    for (;;) {
      await new Promise(r => setTimeout(r, 2000));
      const res = await fetch(`${API_BASE}/api/video/jobs/${jobId}`);
      const data: VideoGenerationResponse = await res.json();
      if (typeof data.progress === 'number') lastProgress = data.progress;
      onProgress?.(lastProgress);
      if (data.status === 'ready') { onProgress?.(100); return data; }
      if (data.status === 'error') throw new Error(data.error ?? 'Generation error');
      if (data.status === 'failed' || data.status === 'cancelled' || data.status === 'timed_out') {
        throw new Error(data.error ?? `Generation ${data.status}`);
      }
    }
  }

  async getJobStatus(jobId: string): Promise<VideoGenerationResponse> {
    const res = await fetch(`${API_BASE}/api/video/jobs/${jobId}`);
    if (!res.ok) throw new Error('Failed to fetch job status');
    return res.json();
  }

  async deleteVideo(videoId: string): Promise<void> {
    await fetch(`${API_BASE}/api/video/${videoId}`, { method: 'DELETE' });
  }
}

export const videoGenerationService = new VideoGenerationService();
