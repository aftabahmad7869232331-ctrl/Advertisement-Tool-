// ============================================================
// VIDEO FORMATS & QUALITY SETTINGS
// ============================================================

import type { VideoFormat, VideoQuality, VideoAspectRatio } from '../types/video.types';

export interface VideoFormatInfo {
  format: VideoFormat;
  label: string;
  mimeType: string;
  extension: string;
  description: string;
  maxSize: number;  // bytes
}

export interface VideoQualityInfo {
  quality: VideoQuality;
  label: string;
  width: number;
  height: number;
  bitrate: number;  // kbps
  fps: number;
}

export interface AspectRatioInfo {
  ratio: VideoAspectRatio;
  label: string;
  width: number;
  height: number;
  description: string;
  useCase: string;
}

export const VIDEO_FORMATS: VideoFormatInfo[] = [
  { format: 'mp4',  label: 'MP4',  mimeType: 'video/mp4',       extension: '.mp4',  description: 'Universal format, best compatibility', maxSize: 2147483648 },
  { format: 'webm', label: 'WebM', mimeType: 'video/webm',      extension: '.webm', description: 'Web-optimized, smaller file size',     maxSize: 1073741824 },
  { format: 'mov',  label: 'MOV',  mimeType: 'video/quicktime',  extension: '.mov',  description: 'Apple QuickTime, high quality',         maxSize: 2147483648 },
  { format: 'avi',  label: 'AVI',  mimeType: 'video/x-msvideo', extension: '.avi',  description: 'Windows format, broad support',         maxSize: 2147483648 },
  { format: 'mkv',  label: 'MKV',  mimeType: 'video/x-matroska', extension: '.mkv', description: 'Open format, multiple streams',         maxSize: 4294967296 },
];

export const VIDEO_QUALITIES: VideoQualityInfo[] = [
  { quality: '360p',  label: '360p SD',  width: 640,  height: 360,  bitrate: 800,   fps: 30 },
  { quality: '480p',  label: '480p SD',  width: 854,  height: 480,  bitrate: 1500,  fps: 30 },
  { quality: '720p',  label: '720p HD',  width: 1280, height: 720,  bitrate: 3000,  fps: 30 },
  { quality: '1080p', label: '1080p FHD', width: 1920, height: 1080, bitrate: 6000, fps: 30 },
  { quality: '4k',    label: '4K UHD',   width: 3840, height: 2160, bitrate: 25000, fps: 60 },
];

export const ASPECT_RATIOS: AspectRatioInfo[] = [
  { ratio: '16:9',  label: 'Landscape (16:9)', width: 1920, height: 1080, description: 'Standard widescreen',   useCase: 'YouTube, TV, Desktop' },
  { ratio: '9:16',  label: 'Portrait (9:16)',  width: 1080, height: 1920, description: 'Vertical mobile video', useCase: 'Reels, TikTok, Shorts' },
  { ratio: '1:1',   label: 'Square (1:1)',     width: 1080, height: 1080, description: 'Square format',         useCase: 'Instagram, Facebook' },
  { ratio: '4:3',   label: 'Classic (4:3)',    width: 1440, height: 1080, description: 'Traditional TV ratio',  useCase: 'Presentations, Legacy' },
  { ratio: '21:9',  label: 'Cinematic (21:9)', width: 2560, height: 1080, description: 'Ultra-wide cinematic',  useCase: 'Cinema, Streaming' },
];

export const DEFAULT_FORMAT: VideoFormat = 'mp4';
export const DEFAULT_QUALITY: VideoQuality = '1080p';
export const DEFAULT_ASPECT_RATIO: VideoAspectRatio = '16:9';
// Level 2 Phase A3: pehle hardcoded the — ab .env se configurable
// (VITE_MAX_CLIP_COUNT / VITE_CLIP_DURATION_SECONDS). In values ko
// backend ke .env (MAX_CLIP_COUNT / CLIP_DURATION_SECONDS) ke saath
// match rakho, warna backend zyada strict clamp kar dega.
export const MAX_PROMPT_COUNT = Math.min(Number(import.meta.env.VITE_MAX_CLIP_COUNT) || 5, 5);
export const MAX_PROMPT_LENGTH = 500;
export const MIN_PROMPT_LENGTH = 10;
export const DEFAULT_CLIP_DURATION = Math.min(Number(import.meta.env.VITE_CLIP_DURATION_SECONDS) || 6, 6);
export const MAX_VIDEO_DURATION = 30;
