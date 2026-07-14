// ============================================================
// AUTO-DUB SERVICE - Frontend
// ============================================================

import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';
import { authenticatedFetch } from '../../../services/auth';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

export type DubStatus = 'pending' | 'transcribing' | 'translating' | 'generating_voice' | 'syncing' | 'done' | 'error';

export interface DubJobStatus {
  jobId:           string;
  status:          DubStatus;
  progress:        number;
  outputUrl?:      string;
  originalText?:   string;
  translatedText?: string;
  error?:          string;
}

class AutoDubService {
  async start(opts: {
    videoId: string;
    sourceLanguage?: string;
    targetLanguage: string;
    voiceId?: string;
  }): Promise<{ jobId: string }> {
    const res = await authenticatedFetch(`${API_BASE}/api/dub/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Auto-Dub start failed' }));
      throw new Error(err.error || 'Auto-Dub start failed');
    }
    return res.json();
  }

  async pollStatus(jobId: string): Promise<DubJobStatus> {
    const res = await authenticatedFetch(`${API_BASE}/api/dub/${jobId}`);
    if (!res.ok) throw new Error('Status check failed');
    return res.json();
  }

  async pollUntilDone(jobId: string, onProgress?: (s: DubJobStatus) => void): Promise<DubJobStatus> {
    for (;;) {
      const status = await this.pollStatus(jobId);
      onProgress?.(status);
      if (status.status === 'done' || status.status === 'error') return status;
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

export const autoDubService = new AutoDubService();

export const DUB_LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' }, { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' }, { code: 'pt', name: 'Portuguese' },
  { code: 'ar', name: 'Arabic' }, { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }, { code: 'zh', name: 'Chinese' },
];

export const DUB_STATUS_LABELS: Record<DubStatus, string> = {
  pending:          'Queue mein hai...',
  transcribing:     'Original audio sun raha hai...',
  translating:      'Translate ho raha hai...',
  generating_voice: 'Nayi voice generate ho rahi hai...',
  syncing:          'Lip-sync ho raha hai...',
  done:             'Ho gaya!',
  error:            'Kuch galat ho gaya',
};
