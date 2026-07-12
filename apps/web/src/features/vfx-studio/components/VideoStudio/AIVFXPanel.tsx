// ============================================================
// AI VFX PANEL — Phase 3
// ============================================================
// 3 tabs:
//   🎥 Auto B-Roll    — Script → Gemini → Veo → B-roll clips
//   🖌️ Style Transfer — Video → Veo image ref → anime/art style
//   🌅 AI Background  — BG-removed video + prompt → Veo BG
// ============================================================

import React, { useState } from 'react';
import { aiVFXService, STYLE_OPTIONS, type VisualStyle, type AIVFXJobStatus } from '../../services/aiVFX.service';

interface AIVFXPanelProps {
  videoId:     string | null;
  mainScript?: string;
  onBRollReady?: (clips: { index: number; scene: string; url: string }[]) => void;
  onStyleDone?:  (url: string) => void;
  onBGDone?:     (url: string) => void;
}

type Tab = 'broll' | 'style' | 'bg';

function JobProgress({ status, type }: { status: AIVFXJobStatus | null; type: string }) {
  if (!status) return null;
  const labels: Record<string, string> = {
    pending: 'Queue mein hai...', processing: 'AI processing...', done: 'Complete!', error: 'Error',
  };
  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ height: '5px', background: 'var(--vs-border)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${status.progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width .5s' }} />
      </div>
      <p style={{ margin: '4px 0 0', fontSize: '11px', color: status.status === 'error' ? 'var(--text-danger)' : 'var(--vs-text-muted)' }}>
        {status.status === 'error' ? `⚠️ ${status.error}` : `${labels[status.status]} (${status.progress}%)`}
      </p>
    </div>
  );
}

export function AIVFXPanel({ videoId, mainScript = '', onBRollReady, onStyleDone, onBGDone }: AIVFXPanelProps) {
  const [tab, setTab] = useState<Tab>('broll');

  // B-Roll state
  const [brollScript,   setBrollScript]   = useState(mainScript);
  const [brollCount,    setBrollCount]    = useState(3);
  const [brollStyle,    setBrollStyle]    = useState('cinematic professional');
  const [brollStatus,   setBrollStatus]   = useState<AIVFXJobStatus | null>(null);
  const [brollRunning,  setBrollRunning]  = useState(false);
  const [brollResults,  setBrollResults]  = useState<{ index: number; scene: string; url: string }[]>([]);

  // Style Transfer state
  const [stylePreset,   setStylePreset]   = useState<VisualStyle>('anime');
  const [stylePrompt,   setStylePrompt]   = useState('');
  const [styleStatus,   setStyleStatus]   = useState<AIVFXJobStatus | null>(null);
  const [styleRunning,  setStyleRunning]  = useState(false);
  const [styleOutput,   setStyleOutput]   = useState<string | null>(null);

  // AI Background state
  const [bgPrompt,      setBgPrompt]      = useState('');
  const [bgStatus,      setBgStatus]      = useState<AIVFXJobStatus | null>(null);
  const [bgRunning,     setBgRunning]     = useState(false);
  const [bgOutput,      setBgOutput]      = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const label: React.CSSProperties = { fontSize: '11px', fontWeight: 500, color: 'var(--vs-text-secondary)', display: 'block', marginBottom: '4px' };
  const inp:   React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '8px 10px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '7px', color: 'var(--vs-text-primary)', fontSize: '12px', outline: 'none' };

  // ── B-Roll ───────────────────────────────────────────────
  async function handleBRoll() {
    if (!brollScript.trim()) { setError('Script/description zaroori hai'); return; }
    setError(null); setBrollRunning(true); setBrollStatus(null); setBrollResults([]);
    try {
      const jobId = await aiVFXService.startBRoll({ mainScript: brollScript, clipCount: brollCount, style: brollStyle });
      const final = await aiVFXService.waitForCompletion(jobId, setBrollStatus);
      if (final.status === 'done' && final.result) {
        const clips = (final.result as any).clips || [];
        setBrollResults(clips);
        onBRollReady?.(clips);
      } else throw new Error(final.error || 'B-roll generation fail');
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setBrollRunning(false); }
  }

  // ── Style Transfer ───────────────────────────────────────
  async function handleStyleTransfer() {
    if (!videoId) { setError('Pehle video generate karo'); return; }
    setError(null); setStyleRunning(true); setStyleStatus(null); setStyleOutput(null);
    try {
      const trimmedStylePrompt = stylePrompt.trim();

      const jobId = await aiVFXService.startStyleTransfer({
        videoId,
        style: stylePreset,
        ...(trimmedStylePrompt ? { prompt: trimmedStylePrompt } : {}),
      });
      const final = await aiVFXService.waitForCompletion(jobId, setStyleStatus);
      if (final.status === 'done' && final.result) {
        const url = (final.result as any).url;
        setStyleOutput(url);
        onStyleDone?.(url);
      } else throw new Error(final.error || 'Style transfer fail');
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setStyleRunning(false); }
  }

  // ── AI Background ────────────────────────────────────────
  async function handleAIBG() {
    if (!videoId) { setError('Pehle BG-removed video chahiye'); return; }
    if (!bgPrompt.trim()) { setError('Background description zaroori hai'); return; }
    setError(null); setBgRunning(true); setBgStatus(null); setBgOutput(null);
    try {
      const jobId = await aiVFXService.startAIBackground({ videoId, bgPrompt });
      const final = await aiVFXService.waitForCompletion(jobId, setBgStatus);
      if (final.status === 'done' && final.result) {
        const url = (final.result as any).url;
        setBgOutput(url);
        onBGDone?.(url);
      } else throw new Error(final.error || 'AI background fail');
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setBgRunning(false); }
  }

  const BASE = import.meta.env.VITE_API_URL || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          🤖 AI VFX — Phase 3
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Gemini + Veo 3.1 powered visual effects
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--vs-bg)', borderRadius: '8px', padding: '3px', border: '1px solid var(--vs-border)' }}>
        {([
          { id: 'broll', label: '🎥 Auto B-Roll' },
          { id: 'style', label: '🖌️ Style Transfer' },
          { id: 'bg',    label: '🌅 AI Background' },
        ] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setError(null); }} style={{
            flex: 1, padding: '7px 4px', background: tab === t.id ? 'var(--vs-bg-elevated)' : 'transparent',
            border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: tab === t.id ? 600 : 400,
            color: tab === t.id ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)', cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── B-ROLL TAB ── */}
      {tab === 'broll' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={label}>Main Video Script / Description *</label>
            <textarea value={brollScript} onChange={e => setBrollScript(e.target.value)}
              placeholder="Apne main video ka script ya description likho — Gemini iske liye B-roll scenes suggest karega..."
              rows={4} style={{ ...inp, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', lineHeight: 1.5 }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e  => (e.target.style.borderColor = 'var(--vs-border)')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={label}>Clips — {brollCount}</label>
              <input type="range" min={1} max={5} value={brollCount} onChange={e => setBrollCount(Number(e.target.value))} style={{ width: '100%' }} />
              <p style={{ margin: '2px 0 0', fontSize: '10px', color: 'var(--vs-text-muted)' }}>
                Max 5 · ~₹{Math.round(brollCount * 8 * 0.12 * 95)} (Fast tier)
              </p>
            </div>
            <div>
              <label style={label}>Visual Style</label>
              <input type="text" value={brollStyle} onChange={e => setBrollStyle(e.target.value)} style={{ ...inp }} placeholder="cinematic professional" />
            </div>
          </div>

          {brollStatus && <JobProgress status={brollStatus} type="broll" />}

          {brollResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--text-success)' }}>
                ✅ {brollResults.length} B-roll clips ready!
              </p>
              {brollResults.map(c => (
                <div key={c.index} style={{ padding: '8px 10px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 3px', fontSize: '11px', color: 'var(--vs-text-muted)' }}>Clip {c.index + 1}</p>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'var(--vs-text-primary)', lineHeight: 1.4 }}>{c.scene}</p>
                  <a href={`${BASE}${c.url}`} download style={{ fontSize: '11px', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
                    ⬇️ Download B-roll {c.index + 1}
                  </a>
                </div>
              ))}
            </div>
          )}

          <button onClick={handleBRoll} disabled={brollRunning}
            style={{ padding: '11px', background: brollRunning ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: brollRunning ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {brollRunning ? <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Gemini + Veo processing...</> : `🎥 ${brollCount} B-Roll Clips Generate Karo`}
          </button>
        </div>
      )}

      {/* ── STYLE TRANSFER TAB ── */}
      {tab === 'style' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {STYLE_OPTIONS.map(s => (
              <div key={s.value} onClick={() => setStylePreset(s.value)}
                style={{ padding: '9px 10px', cursor: 'pointer', borderRadius: '8px', background: stylePreset === s.value ? 'rgba(99,102,241,0.1)' : 'var(--vs-bg)', border: `1px solid ${stylePreset === s.value ? '#6366f1' : 'var(--vs-border)'}`, transition: 'all .12s' }}>
                <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: stylePreset === s.value ? 600 : 400, color: stylePreset === s.value ? '#6366f1' : 'var(--vs-text-primary)' }}>
                  {s.emoji} {s.label}
                </p>
                <p style={{ margin: 0, fontSize: '10px', color: 'var(--vs-text-muted)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div>
            <label style={label}>Extra prompt (optional)</label>
            <input type="text" value={stylePrompt} onChange={e => setStylePrompt(e.target.value)}
              style={inp} placeholder="e.g. add rain, dark moody atmosphere..."
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e  => (e.target.style.borderColor = 'var(--vs-border)')} />
          </div>

          {styleStatus && <JobProgress status={styleStatus} type="style" />}

          {styleOutput && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href={`${BASE}${styleOutput}`} download
                style={{ flex: 1, padding: '9px', textAlign: 'center', background: 'var(--bg-success, #EAF3DE)', border: '1px solid var(--border-success)', borderRadius: '8px', color: 'var(--text-success)', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                ✅ Download {stylePreset} video
              </a>
            </div>
          )}

          <button onClick={handleStyleTransfer} disabled={!videoId || styleRunning}
            style={{ padding: '11px', background: !videoId ? 'var(--vs-bg-elevated)' : styleRunning ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '9px', color: !videoId ? 'var(--vs-text-muted)' : '#fff', fontSize: '13px', fontWeight: 600, cursor: !videoId || styleRunning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {!videoId ? '🎬 Pehle video generate karo' : styleRunning ? <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Veo style transfer ho rahi hai...</> : `🖌️ ${STYLE_OPTIONS.find(s => s.value === stylePreset)?.label} Style Apply Karo`}
          </button>

          <div style={{ padding: '8px 10px', borderRadius: '7px', fontSize: '11px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', color: 'var(--vs-text-muted)', lineHeight: 1.6 }}>
            💡 Veo Quality tier use hoga — best results ke liye. Cost ~₹{Math.round(8 * 0.30 * 95)}/clip.
          </div>
        </div>
      )}

      {/* ── AI BACKGROUND TAB ── */}
      {tab === 'bg' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '10px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', fontSize: '12px', color: '#6366f1', lineHeight: 1.6 }}>
            ℹ️ Pehle <strong>🪄 BG Remove</strong> tab se subject ko isolate karo, phir yahan aao — AI naya background generate karega aur composite karega.
          </div>
          <div>
            <label style={label}>New Background Description *</label>
            <textarea value={bgPrompt} onChange={e => setBgPrompt(e.target.value)}
              placeholder="e.g. 'Futuristic Tokyo city at night with neon lights'\n'Tropical beach sunset with golden waves'\n'Modern minimalist office interior'"
              rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
              onFocus={e => (e.target.style.borderColor = '#6366f1')}
              onBlur={e  => (e.target.style.borderColor = 'var(--vs-border)')} />
          </div>

          {/* Quick BG presets */}
          <div>
            <label style={label}>Quick Presets</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {[
                '🌆 Futuristic city night', '🏖️ Tropical beach sunset',
                '🌲 Forest with light rays', '🏢 Modern office interior',
                '🌌 Space nebula background', '⛩️ Japanese zen garden',
                '🏔️ Snowy mountain peaks', '🌃 Paris at night',
              ].map(p => (
                <button key={p} onClick={() => setBgPrompt(p.slice(3))}
                  style={{ padding: '4px 8px', fontSize: '11px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '6px', color: 'var(--vs-text-secondary)', cursor: 'pointer' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {bgStatus && <JobProgress status={bgStatus} type="bg" />}

          {bgOutput && (
            <a href={`${BASE}${bgOutput}`} download
              style={{ padding: '10px', textAlign: 'center', background: 'var(--bg-success, #EAF3DE)', border: '1px solid var(--border-success)', borderRadius: '8px', color: 'var(--text-success)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
              ✅ Composite Video Download Karo
            </a>
          )}

          <button onClick={handleAIBG} disabled={!videoId || !bgPrompt.trim() || bgRunning}
            style={{ padding: '11px', background: !videoId || !bgPrompt.trim() ? 'var(--vs-bg-elevated)' : bgRunning ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '9px', color: !videoId || !bgPrompt.trim() ? 'var(--vs-text-muted)' : '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {bgRunning ? <><span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Veo background generate kar raha hai...</> : '🌅 AI Background Generate + Composite Karo'}
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--bg-danger, #FCEBEB)', border: '1px solid var(--border-danger)', color: 'var(--text-danger)' }}>
          ⚠️ {error}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

