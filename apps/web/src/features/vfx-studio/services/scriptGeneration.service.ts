// ============================================================
// SCRIPT GENERATION SERVICE
// ============================================================

import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

export type VideoTone =
  | 'energetic' | 'professional' | 'emotional'
  | 'humorous'  | 'luxury'       | 'urgent'
  | 'casual'    | 'dramatic';

export type VideoPlatform =
  | 'instagram_reel' | 'youtube_short' | 'youtube_ad'
  | 'facebook_ad'    | 'tiktok'        | 'linkedin_ad'
  | 'tv_commercial';

export interface ScriptGenerationRequest {
  productName:       string;
  targetAudience:    string;
  tone:              VideoTone;
  platform:          VideoPlatform;
  clipCount?:        number;
  additionalContext?: string;
}

export interface GeneratedScenePrompt {
  index: number;
  text:  string;
  style: string;
  mood:  string;
}

export interface ScriptGenerationResponse {
  prompts: GeneratedScenePrompt[];
  meta: {
    productName:   string;
    targetAudience: string;
    tone:          string;
    platform:      string;
    aspectRatio:   string;
    clipCount:     number;
    styleInfo:     { style: string; mood: string };
  };
}

class ScriptGenerationService {
  async generate(
    request: ScriptGenerationRequest
  ): Promise<ScriptGenerationResponse> {
    const res = await fetch(`${API_BASE}/api/script/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(request),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Script generation failed: ${res.statusText}`);
    }

    return res.json();
  }
}

export const scriptGenerationService = new ScriptGenerationService();

// Tone aur Platform ke human-readable labels (UI ke liye)
export const TONE_OPTIONS: { value: VideoTone; label: string; emoji: string }[] = [
  { value: 'energetic',    label: 'Energetic',    emoji: '⚡' },
  { value: 'professional', label: 'Professional',  emoji: '💼' },
  { value: 'emotional',    label: 'Emotional',     emoji: '❤️' },
  { value: 'humorous',     label: 'Humorous',      emoji: '😄' },
  { value: 'luxury',       label: 'Luxury',        emoji: '✨' },
  { value: 'urgent',       label: 'Urgent',        emoji: '🔥' },
  { value: 'casual',       label: 'Casual',        emoji: '😊' },
  { value: 'dramatic',     label: 'Dramatic',      emoji: '🎬' },
];

export const PLATFORM_OPTIONS: { value: VideoPlatform; label: string; ratio: string }[] = [
  { value: 'instagram_reel', label: 'Instagram Reel', ratio: '9:16' },
  { value: 'youtube_short',  label: 'YouTube Short',  ratio: '9:16' },
  { value: 'tiktok',         label: 'TikTok',         ratio: '9:16' },
  { value: 'youtube_ad',     label: 'YouTube Ad',     ratio: '16:9' },
  { value: 'facebook_ad',    label: 'Facebook Ad',    ratio: '1:1'  },
  { value: 'linkedin_ad',    label: 'LinkedIn Ad',    ratio: '16:9' },
  { value: 'tv_commercial',  label: 'TV Commercial',  ratio: '16:9' },
];
