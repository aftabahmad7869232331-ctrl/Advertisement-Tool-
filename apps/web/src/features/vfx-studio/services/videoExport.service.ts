// ============================================================
// VIDEO EXPORT SERVICE
// ============================================================

import type { VideoExportOptions } from '../types/video.types';
import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

class VideoExportService {
  async export(videoId: string, options: VideoExportOptions): Promise<void> {
    const res = await fetch(`${API_BASE}/api/video/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, options }),
    });
    if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);
    const { downloadUrl, filename } = await res.json();
    this.triggerDownload(downloadUrl, filename);
  }

  async getExportFormats(): Promise<{ format: string; label: string }[]> {
    const res = await fetch(`${API_BASE}/api/video/export/formats`);
    if (!res.ok) throw new Error('Failed to fetch export formats');
    return res.json();
  }

  private triggerDownload(url: string, filename: string): void {
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
  }

  async estimateExportSize(videoId: string, options: VideoExportOptions): Promise<number> {
    const res = await fetch(`${API_BASE}/api/video/export/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, options }),
    });
    if (!res.ok) return 0;
    const { estimatedSizeBytes } = await res.json();
    return estimatedSizeBytes;
  }
}

export const videoExportService = new VideoExportService();
