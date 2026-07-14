// ============================================================
// WATERMARK SERVICE - Frontend
// ============================================================

import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';
import AuthService, { authenticatedFetch } from '../../../services/auth';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

export type WatermarkPosition =
  | 'top-left' | 'top-right'
  | 'bottom-left' | 'bottom-right'
  | 'center';

export interface WatermarkOptions {
  type:       'image' | 'text';
  position:   WatermarkPosition;
  opacity:    number;
  // image watermark
  logoId?:    string;
  scale?:     number;
  // text watermark
  text?:      string;
  fontSize?:  number;
  color?:     string;
  marginPx?:  number;
}

class WatermarkService {
  async uploadLogo(file: File, onProgress?: (p: number) => void): Promise<{ logoId: string; url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    const token = await AuthService.getValidToken();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/api/watermark/upload`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during logo upload'));
      xhr.send(formData);
    });
  }

  async applyWatermark(
    videoId: string,
    opts: WatermarkOptions
  ): Promise<{ outputId: string; url: string }> {
    const res = await authenticatedFetch(`${API_BASE}/api/watermark/apply`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ videoId, ...opts }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Watermark failed: ${res.statusText}`);
    }
    return res.json();
  }
}

export const watermarkService = new WatermarkService();

export const POSITION_OPTIONS: { value: WatermarkPosition; label: string }[] = [
  { value: 'bottom-right', label: 'Neeche Right ↘' },
  { value: 'bottom-left',  label: 'Neeche Left ↙'  },
  { value: 'top-right',    label: 'Upar Right ↗'   },
  { value: 'top-left',     label: 'Upar Left ↖'    },
  { value: 'center',       label: 'Center ⊙'        },
];
