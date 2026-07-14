// ============================================================
// LIP SYNC SERVICE - Frontend
// ============================================================

import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';
import { authenticatedFetch } from '../../../services/auth';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

export type LipSyncStatus = 'pending' | 'tts' | 'syncing' | 'done' | 'error';

export type SyncLabsModel = 'sync-1.6.0' | 'sync-1.7.1' | 'sync-1.8.0';

export interface LipSyncJobStatus {
  jobId:      string;
  status:     LipSyncStatus;
  progress:   number;
  outputUrl?: string;
  error?:     string;
}

export type LipSyncInputMode = 'video+audio' | 'video+text' | 'upload+audio';

class LipSyncFrontendService {
  // Start sync — videoId + audioId (existing files)
  async startWithIds(opts: {
    videoId:  string;
    audioId?: string;
    text?:    string;
    voiceId?: string;
    model?:   SyncLabsModel;
  }): Promise<{ jobId: string }> {
    const res = await authenticatedFetch(`${API_BASE}/api/lipsync/start`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(opts),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Lip sync start fail ho gayi');
    }
    return res.json();
  }

  // Start sync — video file upload + audioId / text
  async startWithUpload(opts: {
    videoFile: File;
    audioId?:  string;
    text?:     string;
    voiceId?:  string;
    model?:    SyncLabsModel;
  }, onProgress?: (p: number) => void): Promise<{ jobId: string }> {
    const formData = new FormData();
    formData.append('video', opts.videoFile);
    if (opts.audioId) formData.append('audioId', opts.audioId);
    if (opts.text)    formData.append('text', opts.text);
    if (opts.voiceId) formData.append('voiceId', opts.voiceId);
    if (opts.model)   formData.append('model', opts.model);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/api/lipsync/start`);
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status === 200
          ? resolve(JSON.parse(xhr.responseText))
          : reject(new Error(`Upload failed: ${xhr.statusText}`));
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.send(formData);
    });
  }

  async pollStatus(jobId: string): Promise<LipSyncJobStatus> {
    const res = await authenticatedFetch(`${API_BASE}/api/lipsync/${jobId}`);
    if (!res.ok) throw new Error('Status check failed');
    return res.json();
  }

  async waitForCompletion(
    jobId:      string,
    onProgress: (s: LipSyncJobStatus) => void,
    intervalMs  = 5000
  ): Promise<LipSyncJobStatus> {
    const deadline = Date.now() + 12 * 60 * 1000; // 12 min max
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, intervalMs));
      const status = await this.pollStatus(jobId);
      onProgress(status);
      if (status.status === 'done' || status.status === 'error') return status;
    }
    throw new Error('Lip sync timeout ho gayi (12 min)');
  }
}

export const lipSyncFrontendService = new LipSyncFrontendService();

export const STATUS_LABELS: Record<LipSyncStatus, string> = {
  pending: 'Queue mein hai...',
  tts:     'Voice generate ho rahi hai...',
  syncing: 'Lips sync ho rahe hain...',
  done:    'Sync complete!',
  error:   'Error aa gayi',
};

export const SYNC_MODELS: { value: SyncLabsModel; label: string; desc: string }[] = [
  { value: 'sync-1.8.0', label: 'Sync 1.8 (Best)',   desc: 'Latest model — best quality, natural movement' },
  { value: 'sync-1.7.1', label: 'Sync 1.7 (Fast)',   desc: 'Faster processing, slightly lower quality' },
  { value: 'sync-1.6.0', label: 'Sync 1.6 (Legacy)', desc: 'Oldest, fastest — basic use ke liye' },
];
