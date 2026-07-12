import { VIDEO_STUDIO_CONFIG } from '../constants/videoStudioConfig';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

export type VisualStyle =
  | 'anime' | 'oil_painting' | 'watercolor' | 'pencil_sketch'
  | 'neon_cyberpunk' | 'claymation' | 'pixel_art' | 'comic_book'
  | '3d_render' | 'impressionist';

export interface AIVFXJobStatus {
  jobId:    string;
  type:     string;
  status:   'pending' | 'processing' | 'done' | 'error';
  progress: number;
  result?:  unknown;
  error?:   string;
}

class AIVFXService {
  async startBRoll(opts: { mainScript: string; clipCount?: number; style?: string; aspectRatio?: string }): Promise<string> {
    const res = await fetch(`${API_BASE}/api/ai-vfx/broll`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error); }
    return (await res.json()).jobId;
  }

  async startStyleTransfer(opts: { videoId: string; style: VisualStyle; prompt?: string; aspectRatio?: string }): Promise<string> {
    const res = await fetch(`${API_BASE}/api/ai-vfx/style-transfer`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error); }
    return (await res.json()).jobId;
  }

  async startAIBackground(opts: { videoId: string; bgPrompt: string; aspectRatio?: string }): Promise<string> {
    const res = await fetch(`${API_BASE}/api/ai-vfx/ai-background`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({ error: res.statusText })); throw new Error(e.error); }
    return (await res.json()).jobId;
  }

  async pollStatus(jobId: string): Promise<AIVFXJobStatus> {
    const res = await fetch(`${API_BASE}/api/ai-vfx/${jobId}/status`);
    if (!res.ok) throw new Error('Status check failed');
    return res.json();
  }

  async waitForCompletion(jobId: string, onUpdate: (s: AIVFXJobStatus) => void, interval = 5000): Promise<AIVFXJobStatus> {
    const deadline = Date.now() + 12 * 60 * 1000;
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, interval));
      const s = await this.pollStatus(jobId);
      onUpdate(s);
      if (s.status === 'done' || s.status === 'error') return s;
    }
    throw new Error('AI VFX timeout (12 min)');
  }
}

export const aiVFXService = new AIVFXService();

export const STYLE_OPTIONS: { value: VisualStyle; label: string; emoji: string; desc: string }[] = [
  { value: 'anime',          label: 'Anime',          emoji: '🎌', desc: 'Studio Ghibli aesthetic' },
  { value: 'oil_painting',   label: 'Oil Painting',   emoji: '🖼️', desc: 'Classical brushstroke art' },
  { value: 'watercolor',     label: 'Watercolor',     emoji: '🎨', desc: 'Soft gentle washes' },
  { value: 'pencil_sketch',  label: 'Pencil Sketch',  emoji: '✏️', desc: 'Monochrome drawing' },
  { value: 'neon_cyberpunk', label: 'Cyberpunk',      emoji: '🌆', desc: 'Neon futuristic look' },
  { value: 'claymation',     label: 'Claymation',     emoji: '🧸', desc: 'Stop-motion clay style' },
  { value: 'pixel_art',      label: 'Pixel Art',      emoji: '👾', desc: 'Retro 16-bit style' },
  { value: 'comic_book',     label: 'Comic Book',     emoji: '💥', desc: 'Bold outlines, flat colors' },
  { value: '3d_render',      label: '3D Render',      emoji: '🔮', desc: 'Photorealistic CGI' },
  { value: 'impressionist',  label: 'Impressionist',  emoji: '🌸', desc: 'Monet-like painting' },
];
