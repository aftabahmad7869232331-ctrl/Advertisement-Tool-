// ============================================================
// PLATFORM TEMPLATES CONFIG
// ============================================================
// Har platform ka apna aspect ratio, duration, quality,
// Veo model recommendation, aur prompt style hai.
// AIScriptGenerator aur VideoStudio dono yahan se data lete hain.
// ============================================================

import type { VideoFormat, VideoQuality, VideoAspectRatio } from '../types/video.types';

export interface PlatformTemplate {
  id:              string;
  name:            string;
  emoji:           string;
  platform:        string;
  aspectRatio:     VideoAspectRatio;
  format:          VideoFormat;
  quality:         VideoQuality;
  width:           number;
  height:          number;
  maxDurationSec:  number;   // total video max
  clipDurationSec: number;   // per clip (Veo max = 8)
  recommendedClips: number;
  veoModel:        string;
  description:     string;
  tips:            string[];
  tags:            string[];
  bgColor:         string;   // UI card color
}

export const PLATFORM_TEMPLATES: PlatformTemplate[] = [
  {
    id:               'instagram-reel',
    name:             'Instagram Reel',
    emoji:            '📸',
    platform:         'Instagram',
    aspectRatio:      '9:16',
    format:           'mp4',
    quality:          '1080p',
    width:            1080,
    height:           1920,
    maxDurationSec:   90,
    clipDurationSec:  8,
    recommendedClips: 10,
    veoModel:         'veo-3.1-fast-generate-001',
    description:      'Vertical short-form — 9:16, 90 sec max',
    tips: [
      'Hook pehle 2 second mein daalo',
      'Captions zaroori hain (80% muted dekha jata hai)',
      'Trending audio use karo ya Veo native audio rakho',
    ],
    tags:    ['vertical', 'short', 'social', 'trending'],
    bgColor: '#833AB4',
  },
  {
    id:               'youtube-short',
    name:             'YouTube Short',
    emoji:            '▶️',
    platform:         'YouTube',
    aspectRatio:      '9:16',
    format:           'mp4',
    quality:          '1080p',
    width:            1080,
    height:           1920,
    maxDurationSec:   60,
    clipDurationSec:  8,
    recommendedClips: 7,
    veoModel:         'veo-3.1-fast-generate-001',
    description:      'Vertical 60 sec — subscribe CTA end mein',
    tips: [
      '60 second max — tight rakho',
      'End mein strong CTA daalo',
      'First frame thumbnail ban jata hai',
    ],
    tags:    ['vertical', 'short', 'youtube'],
    bgColor: '#FF0000',
  },
  {
    id:               'tiktok',
    name:             'TikTok',
    emoji:            '🎵',
    platform:         'TikTok',
    aspectRatio:      '9:16',
    format:           'mp4',
    quality:          '1080p',
    width:            1080,
    height:           1920,
    maxDurationSec:   60,
    clipDurationSec:  8,
    recommendedClips: 8,
    veoModel:         'veo-3.1-fast-generate-001',
    description:      'Vertical fast-paced — hook is everything',
    tips: [
      'Pehle 0.5 second mein hook',
      'Fast cuts — 3-4 sec per scene ideal',
      'Text overlay har clip pe daalo',
    ],
    tags:    ['vertical', 'viral', 'fast', 'trendy'],
    bgColor: '#010101',
  },
  {
    id:               'youtube-ad',
    name:             'YouTube Ad',
    emoji:            '🎬',
    platform:         'YouTube',
    aspectRatio:      '16:9',
    format:           'mp4',
    quality:          '1080p',
    width:            1920,
    height:           1080,
    maxDurationSec:   30,
    clipDurationSec:  8,
    recommendedClips: 4,
    veoModel:         'veo-3.1-generate-preview',   // quality tier recommended
    description:      'Landscape 16:9 — 5 sec skip point dhyan raho',
    tips: [
      'Skip button 5 sec ke baad aata hai — pehle hook zaroori',
      'Brand 3 sec ke andar dikhao',
      'Strong CTA last 5 sec mein',
    ],
    tags:    ['horizontal', 'ad', 'skippable', 'pre-roll'],
    bgColor: '#FF6B35',
  },
  {
    id:               'facebook-ad',
    name:             'Facebook / Meta Ad',
    emoji:            '📘',
    platform:         'Facebook',
    aspectRatio:      '1:1',
    format:           'mp4',
    quality:          '1080p',
    width:            1080,
    height:           1080,
    maxDurationSec:   30,
    clipDurationSec:  8,
    recommendedClips: 4,
    veoModel:         'veo-3.1-fast-generate-001',
    description:      'Square 1:1 — feed aur stories dono mein fit',
    tips: [
      'Square format — feed + story dono pe chalta hai',
      'Text overlay must (muted scroll)',
      'First 3 sec mein product dikhao',
    ],
    tags:    ['square', 'feed', 'social', 'meta'],
    bgColor: '#1877F2',
  },
  {
    id:               'linkedin-ad',
    name:             'LinkedIn Ad',
    emoji:            '💼',
    platform:         'LinkedIn',
    aspectRatio:      '16:9',
    format:           'mp4',
    quality:          '1080p',
    width:            1920,
    height:           1080,
    maxDurationSec:   30,
    clipDurationSec:  8,
    recommendedClips: 4,
    veoModel:         'veo-3.1-fast-generate-001',
    description:      'Professional landscape — B2B targeting',
    tips: [
      'Professional aur clean look',
      'Data / results dikhao (B2B audience)',
      'Subtitles zaroori (office mein muted)',
    ],
    tags:    ['horizontal', 'professional', 'b2b', 'corporate'],
    bgColor: '#0A66C2',
  },
  {
    id:               'tv-commercial',
    name:             'TV Commercial',
    emoji:            '📺',
    platform:         'TV / OTT',
    aspectRatio:      '16:9',
    format:           'mp4',
    quality:          '4k',
    width:            3840,
    height:           2160,
    maxDurationSec:   30,
    clipDurationSec:  8,
    recommendedClips: 4,
    veoModel:         'veo-3.1-generate-preview',   // best quality for broadcast
    description:      '4K landscape — broadcast quality',
    tips: [
      '4K quality — Veo Quality tier use karo',
      'Cinematic style best lagti hai',
      '30 sec standard TVC format',
    ],
    tags:    ['horizontal', 'broadcast', '4k', 'cinematic'],
    bgColor: '#1A1A2E',
  },
  {
    id:               'whatsapp-status',
    name:             'WhatsApp Status',
    emoji:            '💬',
    platform:         'WhatsApp',
    aspectRatio:      '9:16',
    format:           'mp4',
    quality:          '720p',
    width:            720,
    height:           1280,
    maxDurationSec:   30,
    clipDurationSec:  8,
    recommendedClips: 4,
    veoModel:         'veo-3.1-lite-generate-preview',  // lite enough for status
    description:      'Vertical 30 sec — WhatsApp status size limit',
    tips: [
      '30 sec max — WA status ki limit',
      'File size chhoti rakho (720p best)',
      'Lite model kaafi hai is quality ke liye',
    ],
    tags:    ['vertical', 'short', 'whatsapp', 'status'],
    bgColor: '#25D366',
  },
];

// Template ID se dhundhne ke liye helper
export function getTemplate(id: string): PlatformTemplate | undefined {
  return PLATFORM_TEMPLATES.find(t => t.id === id);
}

// Aspect ratio se filter
export function getTemplatesByRatio(ratio: VideoAspectRatio): PlatformTemplate[] {
  return PLATFORM_TEMPLATES.filter(t => t.aspectRatio === ratio);
}
