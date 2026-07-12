// ============================================================
// CAPTION FORMATTER UTILITY
// ============================================================

import type { CaptionEntry, CaptionFormat } from '../types/caption.types';

function msToSrtTime(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const ms2 = ms % 1000;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms2).padStart(3,'0')}`;
}

function msToVttTime(ms: number): string {
  return msToSrtTime(ms).replace(',', '.');
}

export function toSRT(entries: CaptionEntry[]): string {
  return entries.map((e, i) =>
    `${i + 1}\n${msToSrtTime(e.startTime)} --> ${msToSrtTime(e.endTime)}\n${e.text}\n`
  ).join('\n');
}

export function toVTT(entries: CaptionEntry[]): string {
  const body = entries.map(e =>
    `${msToVttTime(e.startTime)} --> ${msToVttTime(e.endTime)}\n${e.text}`
  ).join('\n\n');
  return `WEBVTT\n\n${body}`;
}

export function toJSON(entries: CaptionEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function formatCaptions(entries: CaptionEntry[], format: CaptionFormat): string {
  switch (format) {
    case 'srt':  return toSRT(entries);
    case 'vtt':  return toVTT(entries);
    case 'json': return toJSON(entries);
    default:     return toSRT(entries);
  }
}

export function parseSRT(srtContent: string): CaptionEntry[] {
  const blocks = srtContent.trim().split(/\n\n+/);
  return blocks.map((block, i) => {
    const lines = block.split('\n');
    const timeParts = lines[1]?.split(' --> ') ?? [];
    const parseTime = (t: string): number => {
      const [hms = '0:0:0', ms = '0'] = t.split(',');
      const [h = 0, m = 0, s = 0] = hms
        .split(':')
        .map(Number)
        .map(value => Number.isFinite(value) ? value : 0);

      const milliseconds = Number(ms);
      return (
        (h * 3600 + m * 60 + s) * 1000 +
        (Number.isFinite(milliseconds) ? milliseconds : 0)
      );
    };
    return {
      id: `entry-${i}`, index: i,
      startTime: parseTime(timeParts[0] ?? '0:0:0,0'),
      endTime:   parseTime(timeParts[1] ?? '0:0:5,0'),
      text: lines.slice(2).join('\n'),
    };
  });
}

export function downloadCaptions(content: string, filename: string, format: CaptionFormat): void {
  const mimeMap: Record<string, string> = { srt: 'text/srt', vtt: 'text/vtt', json: 'application/json' };
  const blob = new Blob([content], { type: mimeMap[format] ?? 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

