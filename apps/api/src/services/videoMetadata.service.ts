import { spawnSync } from 'node:child_process';

export interface VideoTechnicalMetadata {
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  fps: number | null;
  codec: string | null;
  warning?: string;
}

function finite(value: unknown): number | null {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function fps(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const [top, bottom] = value.split('/').map(Number);
  if (top === undefined || bottom === undefined || !Number.isFinite(top) || !Number.isFinite(bottom) || !bottom) return null;
  return top / bottom;
}

export function extractVideoMetadata(filePath: string): VideoTechnicalMetadata {
  const empty = { durationSeconds: null, width: null, height: null, fps: null, codec: null };
  const executable = process.env.FFPROBE_PATH?.trim() || 'ffprobe';
  const result = spawnSync(executable, [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height,avg_frame_rate:format=duration',
    '-of', 'json', filePath,
  ], { encoding: 'utf8', timeout: 15_000, windowsHide: true });

  if (result.error || result.status !== 0) {
    return { ...empty, warning: 'ffprobe unavailable ya metadata extraction fail hui.' };
  }

  try {
    const parsed = JSON.parse(result.stdout) as {
      streams?: Array<Record<string, unknown>>;
      format?: Record<string, unknown>;
    };
    const stream = parsed.streams?.[0];
    return {
      durationSeconds: finite(parsed.format?.duration),
      width: finite(stream?.width),
      height: finite(stream?.height),
      fps: fps(stream?.avg_frame_rate),
      codec: typeof stream?.codec_name === 'string' ? stream.codec_name : null,
    };
  } catch {
    return { ...empty, warning: 'ffprobe metadata response invalid thi.' };
  }
}
