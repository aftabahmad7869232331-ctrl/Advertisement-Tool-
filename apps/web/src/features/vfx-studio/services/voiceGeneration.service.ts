// ============================================================
// VOICE GENERATION SERVICE
// ============================================================

import type { VoiceGenerationRequest, VoiceGenerationResponse, Voice, ClonedVoice } from '../types/voice.types';
import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

class VoiceGenerationService {
  async getVoices(languageCode?: string): Promise<Voice[]> {
    const url = languageCode
      ? `${API_BASE}/api/voice/list?language=${languageCode}`
      : `${API_BASE}/api/voice/list`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch voices');
    return res.json();
  }

  async generateVoice(request: VoiceGenerationRequest): Promise<VoiceGenerationResponse> {
    const res = await fetch(`${API_BASE}/api/voice/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error(`Voice generation failed: ${res.statusText}`);
    return res.json();
  }

  async previewVoice(voiceId: string, text: string, languageCode: string): Promise<string> {
    const res = await fetch(`${API_BASE}/api/voice/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceId, text, languageCode }),
    });
    if (!res.ok) throw new Error('Preview failed');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  async mergeVoiceWithVideo(videoId: string, audioUrl: string, volume = 1.0): Promise<{ url: string }> {
    const res = await fetch(`${API_BASE}/api/voice/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId, audioUrl, volume }),
    });
    if (!res.ok) throw new Error('Merge failed');
    return res.json();
  }

  // ── AI Voice Cloning ──────────────────────────────────────
  async cloneVoice(name: string, sampleFiles: File[]): Promise<ClonedVoice> {
    const form = new FormData();
    form.append('name', name);
    sampleFiles.forEach(f => form.append('samples', f));

    const res = await fetch(`${API_BASE}/api/voice/clone`, { method: 'POST', body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Voice cloning failed' }));
      throw new Error(err.error || 'Voice cloning failed');
    }
    return res.json();
  }

  async listClonedVoices(): Promise<ClonedVoice[]> {
    const res = await fetch(`${API_BASE}/api/voice/clone/list`);
    if (!res.ok) throw new Error('Failed to fetch cloned voices');
    const data = await res.json();
    return data.voices;
  }

  async deleteClonedVoice(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/voice/clone/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete cloned voice');
  }
}

export const voiceGenerationService = new VoiceGenerationService();
