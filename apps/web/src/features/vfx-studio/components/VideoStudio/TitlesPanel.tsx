// ============================================================
// TITLES PANEL — Animated Text Overlay Builder
// ============================================================
// Multiple text layers add karo — har layer ka:
//   text, timing, animation, position, font size, color, bg
// Apply → FFmpeg se video mein burn ho jaata hai
// ============================================================

import React, { useState } from 'react';

type TextAnimation = 'none' | 'fade_in' | 'fade_out' | 'fade_in_out' | 'slide_up' | 'slide_down' | 'slide_left' | 'slide_right' | 'zoom_in' | 'typewriter';
type TextPosition  = 'top-left' | 'top-center' | 'top-right' | 'middle-left' | 'center' | 'middle-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'lower-third';

interface TextLayer {
  id:           string;
  text:         string;
  startSec:     number;
  endSec:       number;
  animation:    TextAnimation;
  position:     TextPosition;
  fontSize:     number;
  color:        string;
  bgColor?:     string;
  bgOpacity?:   number;
  bold?:        boolean;
  animDuration?: number;
}

interface TitlesPanelProps {
  videoId:      string | null;
  videoDuration: number;
  onApplied?:   (outputUrl: string) => void;
}

const ANIMATIONS: { value: TextAnimation; label: string; emoji: string }[] = [
  { value: 'none',        label: 'Static',      emoji: '⬛' },
  { value: 'fade_in',     label: 'Fade In',     emoji: '🌅' },
  { value: 'fade_out',    label: 'Fade Out',    emoji: '🌇' },
  { value: 'fade_in_out', label: 'Fade In/Out', emoji: '✨' },
  { value: 'slide_up',    label: 'Slide Up',    emoji: '⬆️' },
  { value: 'slide_down',  label: 'Slide Down',  emoji: '⬇️' },
  { value: 'slide_left',  label: 'Slide Left',  emoji: '⬅️' },
  { value: 'slide_right', label: 'Slide Right', emoji: '➡️' },
  { value: 'zoom_in',     label: 'Zoom In',     emoji: '🔍' },
  { value: 'typewriter',  label: 'Typewriter',  emoji: '⌨️' },
];

const POSITIONS: { value: TextPosition; label: string }[] = [
  { value: 'top-left',      label: '↖ Top Left'      },
  { value: 'top-center',    label: '↑ Top Center'    },
  { value: 'top-right',     label: '↗ Top Right'     },
  { value: 'middle-left',   label: '← Mid Left'      },
  { value: 'center',        label: '⊙ Center'        },
  { value: 'middle-right',  label: '→ Mid Right'     },
  { value: 'bottom-left',   label: '↙ Bottom Left'   },
  { value: 'bottom-center', label: '↓ Bottom Center' },
  { value: 'bottom-right',  label: '↘ Bottom Right'  },
  { value: 'lower-third',   label: '📺 Lower Third'  },
];

// Quick presets
const PRESETS: { label: string; layer: Partial<TextLayer> }[] = [
  { label: '🎬 Title Card',   layer: { fontSize: 56, animation: 'fade_in_out', position: 'center', color: '#ffffff', bold: true } },
  { label: '📺 Lower Third',  layer: { fontSize: 32, animation: 'slide_up',    position: 'lower-third', color: '#ffffff', bgColor: '#000000', bgOpacity: 0.6 } },
  { label: '⚡ CTA',          layer: { fontSize: 42, animation: 'zoom_in',     position: 'bottom-center', color: '#FFD700', bold: true } },
  { label: '⌨️ Typewriter',   layer: { fontSize: 36, animation: 'typewriter',  position: 'center', color: '#00FF88' } },
  { label: '💬 Subtitle',     layer: { fontSize: 28, animation: 'fade_in_out', position: 'bottom-center', color: '#ffffff', bgColor: '#000000', bgOpacity: 0.5 } },
];

let _lid = 0;
function newLayerId() { return `layer-${Date.now()}-${++_lid}`; }

function defaultLayer(overrides: Partial<TextLayer> = {}): TextLayer {
  return {
    id:           newLayerId(),
    text:         'Your Text Here',
    startSec:     0,
    endSec:       5,
    animation:    'fade_in_out',
    position:     'bottom-center',
    fontSize:     36,
    color:        '#ffffff',
    bold:         false,
    animDuration: 0.4,
    ...overrides,
  };
}

export function TitlesPanel({ videoId, videoDuration, onApplied }: TitlesPanelProps) {
  const [layers,     setLayers]     = useState<TextLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);

  const selected = layers.find(l => l.id === selectedId) ?? null;

  const label: React.CSSProperties = { fontSize: '11px', fontWeight: 500, color: 'var(--vs-text-secondary)', display: 'block', marginBottom: '4px' };
  const inp:   React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '7px 10px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '7px', color: 'var(--vs-text-primary)', fontSize: '12px', outline: 'none' };

  function addLayer(overrides: Partial<TextLayer> = {}) {
    const l = defaultLayer({
      startSec: 0,
      endSec:   Math.min(videoDuration || 8, 6),
      ...overrides,
    });
    setLayers(prev => [...prev, l]);
    setSelectedId(l.id);
  }

  function removeLayer(id: string) {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateLayer(id: string, patch: Partial<TextLayer>) {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  }

  async function handleApply() {
    if (!videoId)     { setError('Pehle video generate karo'); return; }
    if (!layers.length) { setError('Kam se kam 1 text layer add karo'); return; }
    setError(null);
    setIsApplying(true);

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_BASE}/api/titles/apply`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ videoId, layers }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Apply fail ho gaya');
      }
      const data = await res.json();
      setSuccess(true);
      onApplied?.(data.url);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          🔤 Animated Titles
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Text layers add karo — animations, positions, colors sab customize karo
        </p>
      </div>

      {/* Quick presets */}
      <div>
        <p style={{ ...label, marginBottom: '6px' }}>Quick Presets</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => addLayer(p.layer)}
              style={{ padding: '5px 10px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '7px', fontSize: '11px', color: 'var(--vs-text-secondary)', cursor: 'pointer', transition: 'all .12s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--vs-border)'; e.currentTarget.style.color = 'var(--vs-text-secondary)'; }}
            >{p.label}</button>
          ))}
          <button onClick={() => addLayer()}
            style={{ padding: '5px 10px', background: 'rgba(99,102,241,0.1)', border: '1px solid #6366f1', borderRadius: '7px', fontSize: '11px', color: '#6366f1', fontWeight: 600, cursor: 'pointer' }}>
            + Custom Layer
          </button>
        </div>
      </div>

      {/* Layers list */}
      {layers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {layers.map((l, i) => (
            <div key={l.id}
              onClick={() => setSelectedId(l.id === selectedId ? null : l.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 10px', cursor: 'pointer',
                background: selectedId === l.id ? 'rgba(99,102,241,0.08)' : 'var(--vs-bg)',
                border: `1px solid ${selectedId === l.id ? '#6366f1' : 'var(--vs-border)'}`,
                borderRadius: '8px', transition: 'all .12s',
              }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color, flexShrink: 0, border: '1px solid rgba(0,0,0,0.2)' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: selectedId === l.id ? '#6366f1' : 'var(--vs-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.text || '(empty)'}
                </p>
                <p style={{ margin: 0, fontSize: '10px', color: 'var(--vs-text-muted)' }}>
                  {ANIMATIONS.find(a => a.value === l.animation)?.emoji} {l.animation} · {l.startSec}s → {l.endSec}s · {l.position}
                </p>
              </div>
              <button onClick={e => { e.stopPropagation(); removeLayer(l.id); }}
                style={{ background: 'transparent', border: 'none', color: 'var(--vs-text-muted)', cursor: 'pointer', fontSize: '14px', padding: '0 2px' }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {layers.length === 0 && (
        <div style={{ padding: '20px', textAlign: 'center', border: '2px dashed var(--vs-border)', borderRadius: '10px' }}>
          <div style={{ fontSize: '24px', marginBottom: '6px' }}>🔤</div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>Preset choose karo ya Custom Layer add karo</p>
        </div>
      )}

      {/* ── SELECTED LAYER EDITOR ── */}
      {selected && (
        <div style={{ background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
            ✏️ Layer Edit — <span style={{ color: '#6366f1' }}>{layers.indexOf(selected) + 1}/{layers.length}</span>
          </p>

          {/* Text */}
          <div>
            <label style={label}>Text *</label>
            <input type="text" value={selected.text}
              onChange={e => updateLayer(selected.id, { text: e.target.value })}
              style={inp} placeholder="Apna text yahan likho..."
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e  => (e.target.style.borderColor = 'var(--vs-border)')} />
          </div>

          {/* Timing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <label style={label}>Start — {selected.startSec}s</label>
              <input type="range" min={0} max={Math.max(videoDuration - 0.5, 1)} step={0.5}
                value={selected.startSec}
                onChange={e => updateLayer(selected.id, { startSec: Number(e.target.value) })}
                style={{ width: '100%' }} />
            </div>
            <div>
              <label style={label}>End — {selected.endSec}s</label>
              <input type="range" min={selected.startSec + 0.5} max={videoDuration || 30} step={0.5}
                value={selected.endSec}
                onChange={e => updateLayer(selected.id, { endSec: Number(e.target.value) })}
                style={{ width: '100%' }} />
            </div>
          </div>

          {/* Animation */}
          <div>
            <label style={label}>Animation</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {ANIMATIONS.map(a => (
                <button key={a.value} onClick={() => updateLayer(selected.id, { animation: a.value })}
                  style={{ padding: '4px 8px', fontSize: '11px', cursor: 'pointer',
                    background: selected.animation === a.value ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg-elevated)',
                    border: `1px solid ${selected.animation === a.value ? '#6366f1' : 'var(--vs-border)'}`,
                    borderRadius: '6px', color: selected.animation === a.value ? '#6366f1' : 'var(--vs-text-secondary)',
                    fontWeight: selected.animation === a.value ? 600 : 400 }}>
                  {a.emoji} {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div>
            <label style={label}>Position</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
              {POSITIONS.slice(0, 9).map(p => (
                <button key={p.value} onClick={() => updateLayer(selected.id, { position: p.value })}
                  style={{ padding: '5px 4px', fontSize: '10px', cursor: 'pointer', textAlign: 'center',
                    background: selected.position === p.value ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg-elevated)',
                    border: `1px solid ${selected.position === p.value ? '#6366f1' : 'var(--vs-border)'}`,
                    borderRadius: '5px', color: selected.position === p.value ? '#6366f1' : 'var(--vs-text-secondary)',
                    fontWeight: selected.position === p.value ? 600 : 400 }}>
                  {p.label}
                </button>
              ))}
            </div>
            <button onClick={() => updateLayer(selected.id, { position: 'lower-third' })}
              style={{ marginTop: '4px', width: '100%', padding: '5px', fontSize: '11px', cursor: 'pointer',
                background: selected.position === 'lower-third' ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg-elevated)',
                border: `1px solid ${selected.position === 'lower-third' ? '#6366f1' : 'var(--vs-border)'}`,
                borderRadius: '5px', color: selected.position === 'lower-third' ? '#6366f1' : 'var(--vs-text-secondary)',
                fontWeight: selected.position === 'lower-third' ? 600 : 400 }}>
              📺 Lower Third
            </button>
          </div>

          {/* Style */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            <div>
              <label style={label}>Font Size — {selected.fontSize}px</label>
              <input type="range" min={16} max={96} value={selected.fontSize}
                onChange={e => updateLayer(selected.id, { fontSize: Number(e.target.value) })}
                style={{ width: '100%' }} />
            </div>
            <div>
              <label style={label}>Text Color</label>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input type="color" value={selected.color}
                  onChange={e => updateLayer(selected.id, { color: e.target.value })}
                  style={{ width: '36px', height: '30px', padding: '1px', border: '1px solid var(--vs-border)', borderRadius: '5px', cursor: 'pointer' }} />
                <span style={{ fontSize: '10px', color: 'var(--vs-text-muted)' }}>{selected.color}</span>
              </div>
            </div>
            <div>
              <label style={label}>BG Color</label>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <input type="color" value={selected.bgColor || '#000000'}
                  onChange={e => updateLayer(selected.id, { bgColor: e.target.value, bgOpacity: selected.bgOpacity ?? 0.5 })}
                  style={{ width: '36px', height: '30px', padding: '1px', border: '1px solid var(--vs-border)', borderRadius: '5px', cursor: 'pointer' }} />
                {selected.bgColor && (
                  <button onClick={() => updateLayer(selected.id, { bgColor: '' })}
                    style={{ fontSize: '10px', padding: '2px 5px', background: 'transparent', border: '1px solid var(--vs-border)', borderRadius: '4px', color: 'var(--vs-text-muted)', cursor: 'pointer' }}>
                    none
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bold toggle */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button onClick={() => updateLayer(selected.id, { bold: !selected.bold })}
              style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                background: selected.bold ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg-elevated)',
                border: `1px solid ${selected.bold ? '#6366f1' : 'var(--vs-border)'}`,
                borderRadius: '6px', color: selected.bold ? '#6366f1' : 'var(--vs-text-secondary)' }}>
              B Bold
            </button>
            <span style={{ fontSize: '11px', color: 'var(--vs-text-muted)' }}>
              Duration: {selected.startSec}s → {selected.endSec}s ({(selected.endSec - selected.startSec).toFixed(1)}s)
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--bg-danger, #FCEBEB)', border: '1px solid var(--border-danger)', color: 'var(--text-danger)', lineHeight: 1.5 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Apply button */}
      <button onClick={handleApply} disabled={!videoId || !layers.length || isApplying}
        style={{
          padding: '11px',
          background: success ? 'var(--bg-success, #EAF3DE)' : !videoId || !layers.length ? 'var(--vs-bg-elevated)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          border: success ? '1px solid var(--border-success)' : 'none',
          borderRadius: '9px',
          color: success ? 'var(--text-success)' : !videoId || !layers.length ? 'var(--vs-text-muted)' : '#fff',
          fontSize: '13px', fontWeight: 600,
          cursor: !videoId || !layers.length || isApplying ? 'not-allowed' : 'pointer',
          transition: 'all .2s',
        }}>
        {success ? '✅ Titles apply ho gayi!' : isApplying ? '⏳ FFmpeg processing...' : !videoId ? '🎬 Pehle video generate karo' : !layers.length ? '🔤 Layers add karo' : `🔤 ${layers.length} Titles Apply Karo`}
      </button>
    </div>
  );
}

