import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

export type Platform = 'youtube' | 'instagram' | 'tiktok';

export interface PublishOptions {
  videoId:     string;
  platform:    Platform;
  title:       string;
  description?: string;
  tags?:       string[];
  privacy?:    'public' | 'private' | 'unlisted';
  aspectRatio?: string;
}

export interface PublishResult {
  platform:  Platform;
  postId:    string;
  postUrl:   string;
  status:    'published' | 'scheduled' | 'processing';
}

export interface PublishRecord {
  id:          string;
  videoId:     string;
  platform:    Platform;
  title:       string;
  postId?:     string;
  postUrl?:    string;
  status:      string;
  publishedAt: string;
  error?:      string;
}

class DistributionService {
  async publish(opts: PublishOptions): Promise<PublishResult> {
    const res = await fetch(`${API_BASE}/api/distribute/publish`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error); }
    return res.json();
  }

  async getShareLink(videoId: string): Promise<string> {
    const res = await fetch(`${API_BASE}/api/distribute/share`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId }),
    });
    if (!res.ok) throw new Error('Share link generate nahi hua');
    const data = await res.json();
    return data.shareUrl;
  }

  async schedule(opts: PublishOptions & { scheduledAt: string }): Promise<{ jobId: string; message: string }> {
    const res = await fetch(`${API_BASE}/api/distribute/schedule`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error); }
    return res.json();
  }

  async abTest(opts: { videoIdA: string; videoIdB: string; platform: Platform; titleA?: string; titleB?: string }): Promise<unknown> {
    const res = await fetch(`${API_BASE}/api/distribute/ab-test`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error); }
    return res.json();
  }

  async getHistory(platform?: Platform): Promise<PublishRecord[]> {
    const url = platform ? `${API_BASE}/api/distribute/history?platform=${platform}` : `${API_BASE}/api/distribute/history`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('History load nahi hua');
    return (await res.json()).records;
  }
}

export const distributionService = new DistributionService();

export const PLATFORMS: { value: Platform; label: string; emoji: string; color: string; ratios: string[] }[] = [
  { value: 'youtube',   label: 'YouTube',   emoji: '▶️', color: '#FF0000', ratios: ['16:9', '9:16'] },
  { value: 'instagram', label: 'Instagram', emoji: '📸', color: '#E1306C', ratios: ['9:16', '1:1', '16:9'] },
  { value: 'tiktok',    label: 'TikTok',    emoji: '🎵', color: '#010101', ratios: ['9:16'] },
];
