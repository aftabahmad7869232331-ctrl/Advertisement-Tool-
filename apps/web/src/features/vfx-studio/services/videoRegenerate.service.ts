// ============================================================
// VIDEO REGENERATE SERVICE - Frontend
// ============================================================

import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

export interface UploadAnalysis {
  jobId:       string;
  filename:    string;
  duration:    number;
  width:       number;
  height:      number;
  aspectRatio: string;
  previewUrl:  string;
  message:     string;
}

export interface RegenerateStatus {
  jobId:      string;
  status:     'pending' | 'analyzing' | 'generating' | 'done' | 'error';
  progress:   number;
  outputUrl?: string;
  error?:     string;
}

class VideoRegenerateService {
  async uploadVideo(
    file:       File,
    onProgress: (p: number) => void
  ): Promise<UploadAnalysis> {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('video', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/api/regenerate/upload`);
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status === 200
          ? resolve(JSON.parse(xhr.responseText))
          : reject(new Error(`Upload failed: ${xhr.statusText}`));
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  }

  async startRegenerate(opts: {
    jobId:        string;
    prompt:       string;
    aspectRatio?: string;
  }): Promise<{ jobId: string; status: string }> {
    const res = await fetch(`${API_BASE}/api/regenerate/start`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(opts),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Regeneration start fail ho gayi');
    }
    return res.json();
  }

  async pollStatus(jobId: string): Promise<RegenerateStatus> {
    const res = await fetch(`${API_BASE}/api/regenerate/${jobId}/status`);
    if (!res.ok) throw new Error('Status check failed');
    return res.json();
  }

  // Poll until done or error (max 6 min)
  async waitForCompletion(
    jobId:      string,
    onProgress: (status: RegenerateStatus) => void,
    intervalMs  = 4000
  ): Promise<RegenerateStatus> {
    const deadline = Date.now() + 6 * 60 * 1000;
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, intervalMs));
      const status = await this.pollStatus(jobId);
      onProgress(status);
      if (status.status === 'done' || status.status === 'error') return status;
    }
    throw new Error('Regeneration timeout — 6 min se zyada lag gaya');
  }
}

export const videoRegenerateService = new VideoRegenerateService();
