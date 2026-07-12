// ============================================================
// VIDEO CONVERTER UTILITY
// ============================================================

import type { VideoFormat, VideoQuality } from '../types/video.types';

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function parseDuration(timeStr: string): number {
  const parts = timeStr
    .split(':')
    .map(Number)
    .map(value => Number.isFinite(value) ? value : 0);

  if (parts.length === 3) {
    const [hours = 0, minutes = 0, seconds = 0] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const [minutes = 0, seconds = 0] = parts;
    return minutes * 60 + seconds;
  }

  return parts[0] ?? 0;
}

export function getVideoMimeType(format: VideoFormat): string {
  const map: Record<VideoFormat, string> = {
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
    avi: 'video/x-msvideo', mkv: 'video/x-matroska',
  };
  return map[format] ?? 'video/mp4';
}

export function getQualityDimensions(quality: VideoQuality): { width: number; height: number } {
  const map: Record<VideoQuality, { width: number; height: number }> = {
    '360p': { width: 640, height: 360 },
    '480p': { width: 854, height: 480 },
    '720p': { width: 1280, height: 720 },
    '1080p': { width: 1920, height: 1080 },
    '4k': { width: 3840, height: 2160 },
  };
  return map[quality];
}

export function estimateFileSizeMB(durationSec: number, quality: VideoQuality, format: VideoFormat): number {
  const bitrateMap: Record<VideoQuality, number> = {
    '360p': 800, '480p': 1500, '720p': 3000, '1080p': 6000, '4k': 25000,
  };
  const overhead = format === 'webm' ? 0.85 : 1.0;
  return ((bitrateMap[quality] * durationSec) / 8 / 1024) * overhead;
}

export function generateThumbnailFromVideo(videoEl: HTMLVideoElement, timeSeconds = 0): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas context unavailable'));
    videoEl.currentTime = timeSeconds;
    videoEl.onseeked = () => {
      ctx.drawImage(videoEl, 0, 0, 320, 180);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
}

