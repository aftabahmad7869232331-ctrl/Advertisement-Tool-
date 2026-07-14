// ============================================================
// MUSIC SERVICE - Frontend
// ============================================================

import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';
import { authenticatedFetch } from '../../../services/auth';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

export type MusicMood =
  | 'energetic' | 'cinematic' | 'corporate'
  | 'emotional' | 'upbeat'    | 'dramatic'
  | 'chill'     | 'luxury';

export interface MusicTrack {
  id:          string;
  name:        string;
  mood:        MusicMood;
  bpm:         number;
  durationSec: number;
  file:        string;
  tags:        string[];
  source:      string;
  available:   boolean;
}

export interface MusicApplyOptions {
  videoId:     string;
  trackId:     string;
  musicVolume: number;
  voiceVolume: number;
  autoDuck:    boolean;
  fadeInSec:   number;
  fadeOutSec:  number;
  loop:        boolean;
}

class MusicService {
  async getTracks(mood?: MusicMood): Promise<MusicTrack[]> {
    const url = mood
      ? `${API_BASE}/api/music/tracks?mood=${mood}`
      : `${API_BASE}/api/music/tracks`;
    const res = await authenticatedFetch(url);
    if (!res.ok) throw new Error('Track list load nahi ho paya');
    const data = await res.json();
    return data.tracks;
  }

  async applyMusic(opts: MusicApplyOptions): Promise<{ outputId: string; url: string }> {
    const res = await authenticatedFetch(`${API_BASE}/api/music/apply`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(opts),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Music apply failed: ${res.statusText}`);
    }
    return res.json();
  }
}

export const musicService = new MusicService();

export const MOOD_OPTIONS: { value: MusicMood; label: string; emoji: string }[] = [
  { value: 'energetic', label: 'Energetic', emoji: '⚡' },
  { value: 'upbeat',    label: 'Upbeat',    emoji: '🎉' },
  { value: 'cinematic', label: 'Cinematic', emoji: '🎬' },
  { value: 'corporate', label: 'Corporate', emoji: '💼' },
  { value: 'emotional', label: 'Emotional', emoji: '❤️' },
  { value: 'dramatic',  label: 'Dramatic',  emoji: '🌩️' },
  { value: 'chill',     label: 'Chill',     emoji: '🌅' },
  { value: 'luxury',    label: 'Luxury',    emoji: '✨' },
];
