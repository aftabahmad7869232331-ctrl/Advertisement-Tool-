// ============================================================
// VFX PANEL — Phase 2 (Color Grading + Visual Effects)
// ============================================================
// 4 sections:
//   🎨 Color Grading — 8 LUT presets + intensity slider
//   💨 Motion Blur   — subtle / medium / strong
//   🔍 Ken Burns     — 8 zoom/pan directions
//   📽️ Cinematic     — vignette + grain + film gate + halation
//
// "Render All" — sab ek saath apply karta hai
// ============================================================

import React, { useState } from 'react';

interface VFXPanelProps {
  videoId:  string | null;
  onApplied?: (url: string) => void;
}

type LUTPreset =
  | 'cinematic_orange_teal' | 'film_noir' | 'golden_hour'
  | 'cold_blue' | 'vintage_fade' | 'high_contrast'
  | 'matte_green' | 'sunset_warm';

type KenBurnsDir =
  | 'zoom_in_center' | 'zoom_out_center'
  | 'zoom_in_top_left' | 'zoom_in_bottom_right'
  | 'pan_left' | 'pan_right' | 'pan_up' | 'pan_down';

const LUT_PRESETS: { value: LUTPreset; label: string; emoji: string; desc: string }[] = [
  { value: 'cinematic_orange_teal', label: 'Orange & Teal', emoji: '🎬', desc: 'Hollywood blockbuster look' },
  { value: 'film_noir',             label: 'Film Noir',     emoji: '🎩', desc: 'Black & white classic' },
  { value: 'golden_hour',           label: 'Golden Hour',   emoji: '🌅', desc: 'Warm sunset tones' },
  { value: 'cold_blue',             label: 'Cold Blue',     emoji: '❄️', desc: 'Cool modern look' },
  { value: 'vintage_fade',          label: 'Vintage Fade',  emoji: '📷', desc: 'Faded film texture' },
  { value: 'high_contrast',         label: 'High Contrast', emoji: '⚡', desc: 'Punchy dramatic look' },
  { value: 'matte_green',           label: 'Matte Green',   emoji: '🌿', desc: 'Desaturated green' },
  { value: 'sunset_warm',           label: 'Sunset Warm',   emoji: '🌇', desc: 'Rich warm tones' },
];

const KB_DIRECTIONS: { value: KenBurnsDir; label: string; emoji: string }[] = [
  { value: 'zoom_in_center',        label: 'Zoom In',        emoji: '🔍' },
  { value: 'zoom_out_center',       label: 'Zoom Out',       emoji: '🔎' },
  { value: 'zoom_in_top_left',      label: 'Zoom Top-Left',  emoji: '↖️' },
  { value: 'zoom_in_bottom_right',  label: 'Zoom Bot-Right', emoji: '↘️' },
  { value: 'pan_left',              label: 'Pan Left',       emoji: '⬅️' },
  { value: 'pan_right',             label: 'Pan Right',      emoji: '➡️' },
  { value: 'pan_up',                label: 'Pan Up',         emoji: '⬆️' },
  { value: 'pan_down',              label: 'Pan Down',       emoji: '⬇️' },
];

export function VFXPanel({ videoId, onApplied }: VFXPanelProps) {
  // Color Grading
  const [lutEnabled,   setLutEnabled]   = useState(false);
  const [lutPreset,    setLutPreset]    = useState<LUTPreset>('cinematic_orange_teal');
  const [lutIntensity, setLutIntensity] = useState(0.85);

  // Motion Blur
  const [blurEnabled,  setBlurEnabled]  = useState(false);
  const [blurStrength, setBlurStrength] = useState<'subtle' | 'medium' | 'strong'>('medium');

  // Ken Burns
  const [kbEnabled,    setKbEnabled]    = useState(false);
  const [kbDirection,  setKbDirection]  = useState<KenBurnsDir>('zoom_in_center');

  // Cinematic
  const [cinEnabled,   setCinEnabled]   = useState(false);
  const [vignette,     setVignette]     = useState(true);
  const [filmGrain,    setFilmGrain]    = useState(true);
  const [grainStr,     setGrainStr]     = useState(8);
  const [filmGate,     setFilmGate]     = useState(false);
  const [filmRatio,    setFilmRatio]    = useState<'2.35:1' | '2.39:1' | '1.85:1'>('2.39:1');
  const [halation,     setHalation]     = useState(false);

  const [isRendering,  setIsRendering]  = useState(false);
  const [progress,     setProgress]     = useState('');
  const [error,        setError]        = useState<string | null>(null);
  const [outputUrl,    setOutputUrl]    = useState<string | null>(null);

  const label: React.CSSProperties = { fontSize: '11px', fontWeight: 500, color: 'var(--vs-text-secondary)', display: 'block', marginBottom: '4px' };

  const anyEnabled = lutEnabled || blurEnabled || kbEnabled || cinEnabled;

  function SectionToggle({ enabled, onToggle, title, icon }: { enabled: boolean; onToggle: () => void; title: string; icon: string }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enabled ? '10px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ fontSize: '16px' }}>{icon}</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: enabled ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)' }}>{title}</span>
        </div>
        <button onClick={onToggle} style={{
          width: '40px', height: '22px', borderRadius: '11px', border: 'none',
          background: enabled ? '#6366f1' : 'var(--vs-border)', position: 'relative', cursor: 'pointer', transition: 'background .2s',
        }}>
          <span style={{ position: 'absolute', top: '2px', left: enabled ? '20px' : '2px', width: '18px', height: '18px', borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
        </button>
      </div>
    );
  }

  async function handleRender() {
    if (!videoId) { setError('Pehle video generate karo'); return; }
    if (!anyEnabled) { setError('Kam se kam 1 effect enable karo'); return; }
    setError(null);
    setIsRendering(true);
    setOutputUrl(null);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      setProgress('VFX pipeline shuru ho rahi hai...');

      const body: Record<string, unknown> = { videoId };
      if (lutEnabled)  body.lut       = { preset: lutPreset, intensity: lutIntensity };
      if (blurEnabled) body.motionBlur = { strength: blurStrength };
      if (kbEnabled)   body.kenBurns  = { direction: kbDirection };
      if (cinEnabled)  body.cinematic = { vignette, filmGrain, grainStrength: grainStr, filmGate, filmGateRatio: filmRatio, halation };

      const res = await fetch(`${API_BASE}/api/vfx/render`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'VFX render fail ho gayi');
      }

      const data = await res.json();
      setOutputUrl(data.url);
      onApplied?.(data.url);
      setProgress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsRendering(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          🎨 VFX — Phase 2
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Cinema-grade color, motion, zoom, cinematic texture
        </p>
      </div>

      {/* ── COLOR GRADING ── */}
      <div style={{ padding: '12px', background: 'var(--vs-bg)', border: `1px solid ${lutEnabled ? '#6366f1' : 'var(--vs-border)'}`, borderRadius: '10px', transition: 'border-color .15s' }}>
        <SectionToggle enabled={lutEnabled} onToggle={() => setLutEnabled(!lutEnabled)} title="Color Grading / LUT" icon="🎨" />
        {lutEnabled && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              {LUT_PRESETS.map(l => (
                <div key={l.value}
                  onClick={() => setLutPreset(l.value)}
                  style={{
                    padding: '8px 10px', cursor: 'pointer', borderRadius: '8px',
                    background: lutPreset === l.value ? 'rgba(99,102,241,0.1)' : 'var(--vs-bg-elevated)',
                    border: `1px solid ${lutPreset === l.value ? '#6366f1' : 'var(--vs-border)'}`,
                    transition: 'all .12s',
                  }}>
                  <p style={{ margin: '0 0 1px', fontSize: '12px', fontWeight: 500, color: lutPreset === l.value ? '#6366f1' : 'var(--vs-text-primary)' }}>
                    {l.emoji} {l.label}
                  </p>
                  <p style={{ margin: 0, fontSize: '10px', color: 'var(--vs-text-muted)' }}>{l.desc}</p>
                </div>
              ))}
            </div>
            <label style={label}>Intensity — {Math.round(lutIntensity * 100)}%</label>
            <input type="range" min={10} max={100} value={Math.round(lutIntensity * 100)}
              onChange={e => setLutIntensity(Number(e.target.value) / 100)}
              style={{ width: '100%' }} />
          </>
        )}
      </div>

      {/* ── MOTION BLUR ── */}
      <div style={{ padding: '12px', background: 'var(--vs-bg)', border: `1px solid ${blurEnabled ? '#6366f1' : 'var(--vs-border)'}`, borderRadius: '10px', transition: 'border-color .15s' }}>
        <SectionToggle enabled={blurEnabled} onToggle={() => setBlurEnabled(!blurEnabled)} title="Motion Blur" icon="💨" />
        {blurEnabled && (
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['subtle', 'medium', 'strong'] as const).map(s => (
              <button key={s} onClick={() => setBlurStrength(s)}
                style={{
                  flex: 1, padding: '8px', fontSize: '12px', cursor: 'pointer',
                  background: blurStrength === s ? 'rgba(99,102,241,0.1)' : 'var(--vs-bg-elevated)',
                  border: `1px solid ${blurStrength === s ? '#6366f1' : 'var(--vs-border)'}`,
                  borderRadius: '7px', color: blurStrength === s ? '#6366f1' : 'var(--vs-text-secondary)',
                  fontWeight: blurStrength === s ? 600 : 400,
                }}>
                {s === 'subtle' ? '🌊 Subtle' : s === 'medium' ? '💨 Medium' : '🌀 Strong'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── KEN BURNS ── */}
      <div style={{ padding: '12px', background: 'var(--vs-bg)', border: `1px solid ${kbEnabled ? '#6366f1' : 'var(--vs-border)'}`, borderRadius: '10px', transition: 'border-color .15s' }}>
        <SectionToggle enabled={kbEnabled} onToggle={() => setKbEnabled(!kbEnabled)} title="Ken Burns / Zoom-Pan" icon="🔍" />
        {kbEnabled && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {KB_DIRECTIONS.map(d => (
              <button key={d.value} onClick={() => setKbDirection(d.value)}
                style={{
                  padding: '7px', fontSize: '11px', cursor: 'pointer',
                  background: kbDirection === d.value ? 'rgba(99,102,241,0.1)' : 'var(--vs-bg-elevated)',
                  border: `1px solid ${kbDirection === d.value ? '#6366f1' : 'var(--vs-border)'}`,
                  borderRadius: '7px', color: kbDirection === d.value ? '#6366f1' : 'var(--vs-text-secondary)',
                  fontWeight: kbDirection === d.value ? 600 : 400,
                }}>
                {d.emoji} {d.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CINEMATIC STYLE ── */}
      <div style={{ padding: '12px', background: 'var(--vs-bg)', border: `1px solid ${cinEnabled ? '#6366f1' : 'var(--vs-border)'}`, borderRadius: '10px', transition: 'border-color .15s' }}>
        <SectionToggle enabled={cinEnabled} onToggle={() => setCinEnabled(!cinEnabled)} title="Cinematic Style" icon="📽️" />
        {cinEnabled && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { label: '🌑 Vignette', value: vignette, set: setVignette },
              { label: '📷 Film Grain', value: filmGrain, set: setFilmGrain },
              { label: '🎬 Film Gate (Letterbox)', value: filmGate, set: setFilmGate },
              { label: '✨ Halation (Highlight Glow)', value: halation, set: setHalation },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--vs-text-secondary)' }}>{item.label}</span>
                <button onClick={() => item.set(!item.value)} style={{
                  width: '36px', height: '20px', borderRadius: '10px', border: 'none',
                  background: item.value ? '#6366f1' : 'var(--vs-border)', position: 'relative', cursor: 'pointer', transition: 'background .2s',
                }}>
                  <span style={{ position: 'absolute', top: '2px', left: item.value ? '18px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
                </button>
              </div>
            ))}
            {filmGrain && (
              <div>
                <label style={label}>Grain Strength — {grainStr}</label>
                <input type="range" min={1} max={25} value={grainStr}
                  onChange={e => setGrainStr(Number(e.target.value))}
                  style={{ width: '100%' }} />
              </div>
            )}
            {filmGate && (
              <div style={{ display: 'flex', gap: '6px' }}>
                {(['2.35:1', '2.39:1', '1.85:1'] as const).map(r => (
                  <button key={r} onClick={() => setFilmRatio(r)}
                    style={{
                      flex: 1, padding: '5px', fontSize: '11px', cursor: 'pointer',
                      background: filmRatio === r ? 'rgba(99,102,241,0.1)' : 'var(--vs-bg-elevated)',
                      border: `1px solid ${filmRatio === r ? '#6366f1' : 'var(--vs-border)'}`,
                      borderRadius: '6px', color: filmRatio === r ? '#6366f1' : 'var(--vs-text-secondary)',
                      fontWeight: filmRatio === r ? 600 : 400,
                    }}>{r}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--bg-danger, #FCEBEB)', border: '1px solid var(--border-danger)', color: 'var(--text-danger)', lineHeight: 1.5 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Output preview */}
      {outputUrl && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <a href={`${import.meta.env.VITE_API_URL || ''}${outputUrl}`} download
            style={{ flex: 1, padding: '10px', textAlign: 'center', background: 'var(--bg-success, #EAF3DE)', border: '1px solid var(--border-success)', borderRadius: '8px', color: 'var(--text-success)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
            ✅ VFX Ready — Download Karo
          </a>
        </div>
      )}

      {/* Render button */}
      <button onClick={handleRender} disabled={!videoId || !anyEnabled || isRendering}
        style={{
          padding: '11px',
          background: !videoId || !anyEnabled ? 'var(--vs-bg-elevated)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          border: 'none', borderRadius: '9px',
          color: !videoId || !anyEnabled ? 'var(--vs-text-muted)' : '#fff',
          fontSize: '13px', fontWeight: 600,
          cursor: !videoId || !anyEnabled || isRendering ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
        {isRendering ? (
          <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
          FFmpeg VFX processing...</>
        ) : !videoId ? '🎬 Pehle video generate karo'
          : !anyEnabled ? '🎨 Koi effect enable karo'
          : `🎨 VFX Render Karo (${[lutEnabled, blurEnabled, kbEnabled, cinEnabled].filter(Boolean).length} effects)`}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
