// ============================================================
// VIDEO EDITING SERVICE
// ============================================================

import type { VideoEditRequest, GeneratedVideo } from '../types/video.types';
import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';
import { authenticatedFetch } from '../../../services/auth';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

class VideoEditingService {
  async applyEdits(request: VideoEditRequest): Promise<GeneratedVideo> {
    const res = await authenticatedFetch(`${API_BASE}/api/video/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`Edit failed: ${res.statusText}`);
    return res.json();
  }

  async trimVideo(videoId: string, startSec: number, endSec: number): Promise<GeneratedVideo> {
    return this.applyEdits({ videoId, operations: [{ type: 'trim', params: { start: startSec, end: endSec } }] });
  }

  async cropVideo(videoId: string, x: number, y: number, width: number, height: number): Promise<GeneratedVideo> {
    return this.applyEdits({ videoId, operations: [{ type: 'crop', params: { x, y, width, height } }] });
  }

  async changeSpeed(videoId: string, speed: number): Promise<GeneratedVideo> {
    return this.applyEdits({ videoId, operations: [{ type: 'speed', params: { factor: speed } }] });
  }

  async addTextOverlay(videoId: string, text: string, startSec: number, endSec: number, style: Record<string, unknown>): Promise<GeneratedVideo> {
    return this.applyEdits({ videoId, operations: [{ type: 'text_overlay', params: { text, start: startSec, end: endSec, style } }] });
  }

  async mergeVideos(videoIds: string[]): Promise<GeneratedVideo> {
    const res = await authenticatedFetch(`${API_BASE}/api/video/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoIds }),
    });
    if (!res.ok) throw new Error('Merge failed');
    return res.json();
  }

  async uploadVideo(file: File, onProgress?: (p: number) => void): Promise<{ videoId: string; url: string }> {
    const formData = new FormData();
    formData.append('video', file);
    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.upload.onprogress = e => onProgress?.(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
        else reject(new Error(`Upload failed: ${xhr.statusText}`));
      };
      xhr.onerror = () => reject(new Error('Upload error'));
      xhr.open('POST', `${API_BASE}/api/video/upload`);
      xhr.send(formData);
    });
  }
}

export const videoEditingService = new VideoEditingService();
