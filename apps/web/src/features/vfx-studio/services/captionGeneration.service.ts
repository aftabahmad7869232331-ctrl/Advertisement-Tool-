// ============================================================
// CAPTION GENERATION SERVICE
// ============================================================

import type { CaptionGenerationRequest, CaptionGenerationResponse, Caption, CaptionFormat } from '../types/caption.types';
import { formatCaptions } from '../utils/captionFormatter.util';
import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

class CaptionGenerationService {
  async generateCaptions(request: CaptionGenerationRequest): Promise<CaptionGenerationResponse> {
    const res = await fetch(`${API_BASE}/api/captions/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`Caption generation failed: ${res.statusText}`);
    return res.json();
  }

  async getCaptions(videoId: string, language: string): Promise<Caption | null> {
    const res = await fetch(`${API_BASE}/api/captions/${videoId}?language=${language}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch captions');
    return res.json();
  }

  async saveCaptions(caption: Caption): Promise<Caption> {
    const res = await fetch(`${API_BASE}/api/captions/${caption.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(caption),
    });
    if (!res.ok) throw new Error('Failed to save captions');
    return res.json();
  }

  async translateCaptions(captionId: string, targetLanguages: string[]): Promise<Record<string, Caption>> {
    const res = await fetch(`${API_BASE}/api/captions/${captionId}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetLanguages }),
    });
    if (!res.ok) throw new Error('Translation failed');
    return res.json();
  }

  async exportCaptions(caption: Caption, format: CaptionFormat): Promise<string> {
    return formatCaptions(caption.entries, format);
  }
}

export const captionGenerationService = new CaptionGenerationService();
