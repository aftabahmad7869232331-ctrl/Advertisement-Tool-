// ============================================================
// PRO STUDIO PANEL — VFX Phase 4
// ============================================================
// 3 tabs:
//   🎛️ Audio Mix    — Multiple audio tracks + voice mix
//   💥 SFX Triggers — Frame-specific sound effects
//   📦 Batch Render — Multiple videos ek saath process
// ============================================================

import React, { useState } from 'react';
import { VIDEO_STUDIO_CONFIG } from '../../constants/videoStudioConfig';

const API_BASE = VIDEO_STUDIO_CONFIG.api.baseUrl;

interface ProStudioPanelProps {
  videoId:   string | null;
  videoIds?: string[];
  onDone?:   (url: string) => void;
}

type Tab = 'audio' | 'sfx' | 'batch';

interface AudioTrackRow {
  id:       string;
  audioId:  string;
  label:    string;
  volume:   number;
  delay:    number;
  fadeIn:   number;
  fadeOut:  number;
  loop:     boolean;
  isMuted:  boolean;
}

interface SFXRow {
  id:      string;
  audioId: string;
  label:   string;
  atSec:   number;
  volume:  number;
}

let _rid = 0;
function rid() { return `row-${Date.now()}-${++_rid}`; }

export function ProStudioPanel({ videoId, videoIds = [], onDone }: ProStudioPanelProps) {
  const [tab, setTab] = useState<Tab>('audio');

  // Audio Mix state
  const [audioTracks, setAudioTracks] = useState<AudioTrackRow[]>([
    { id: rid(), audioId: '', label: 'Voice Track', volume: 1.0, delay: 0, fadeIn: 0, fadeOut: 0, loop: false, isMuted: false },
    { id: rid(), audioId: '', label: 'Music Track', volume: 0.3, delay: 0, fadeIn: 1.5, fadeOut: 2.0, loop: true, isMuted: false },
  ]);
  const [mixRunning,  setMixRunning]  = useState(false);
  const [mixOutput,   setMixOutput]   = useState<string | null>(null);

  // SFX state
  const [sfxRows,    setSfxRows]    = useState<SFXRow[]>([
    { id: rid(), audioId: '', label: 'SFX 1', atSec: 0, volume: 1.0 },
  ]);
  const [sfxRunning, setSfxRunning] = useState(false);
  const [sfxOutput,  setSfxOutput]  = useState<string | null>(null);

  // Batch state
  const [batchIds,    setBatchIds]    = useState(videoIds.join('\n'));
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResult,  setBatchResult]  = useState<{ batchId: string; total: number } | null>(null);
  const [batchStatus,  setBatchStatus]  = useState<{ completed: number; failed: number; status: string } | null>(null);

  const [error, setError] = useState<string | null>(null);

  const label: React.CSSProperties = { fontSize: '11px', fontWeight: 500, color: 'var(--vs-text-secondary)', display: 'block', marginBottom: '4px' };
  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '7px 9px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '7px', color: 'var(--vs-text-primary)', fontSize: '12px', outline: 'none' };

  // ── Audio Mix ────────────────────────────────────────────
  async function handleAudioMix() {
    if (!videoId) { setError('Pehle video generate karo'); return; }
    const active = audioTracks.filter(t => t.audioId.trim());
    if (!active.length) { setError('Kam se kam 1 audio track ID daalo'); return; }
    setError(null); setMixRunning(true); setMixOutput(null);
    try {
      const res = await fetch(`${API_BASE}/api/pro/audio-mix`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, tracks: active.map(t => ({ audioId: t.audioId, volume: t.volume, delay: t.delay, fadeIn: t.fadeIn, fadeOut: t.fadeOut, loop: t.loop, isMuted: t.isMuted })) }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const data = await res.json();
      setMixOutput(data.url);
      onDone?.(data.url);
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setMixRunning(false); }
  }

  // ── SFX Triggers ────────────────────────────────────────
  async function handleSFX() {
    if (!videoId) { setError('Pehle video generate karo'); return; }
    const active = sfxRows.filter(s => s.audioId.trim());
    if (!active.length) { setError('Kam se kam 1 SFX audio ID daalo'); return; }
    setError(null); setSfxRunning(true); setSfxOutput(null);
    try {
      const res = await fetch(`${API_BASE}/api/pro/sfx`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, triggers: active.map(s => ({ audioId: s.audioId, atSec: s.atSec, volume: s.volume })) }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const data = await res.json();
      setSfxOutput(data.url);
      onDone?.(data.url);
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setSfxRunning(false); }
  }

  // ── Batch Render ─────────────────────────────────────────
  async function handleBatch() {
    const ids = batchIds.split('\n').map(s => s.trim()).filter(Boolean);
    if (!ids.length) { setError('Kam se kam 1 video ID daalo'); return; }
    if (ids.length > 10) { setError('Max 10 videos'); return; }
    setError(null); setBatchRunning(true); setBatchResult(null); setBatchStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/pro/batch-render`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds: ids }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const data = await res.json();
      setBatchResult({ batchId: data.batchId, total: data.total });

      // Poll
      const deadline = Date.now() + 15 * 60 * 1000;
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 4000));
        const poll = await fetch(`${API_BASE}/api/pro/batch/${data.batchId}`);
        const s = await poll.json();
        setBatchStatus({ completed: s.completed, failed: s.failed, status: s.status });
        if (s.status === 'done' || s.status === 'error') break;
      }
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); }
    finally { setBatchRunning(false); }
  }

  const BASE = import.meta.env.VITE_API_URL || '';

  const Spinner = () => (
    <span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>⚙️ Pro Studio</h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>Multi-track audio · SFX triggers · Batch render</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--vs-bg)', borderRadius: '8px', padding: '3px', border: '1px solid var(--vs-border)' }}>
        {([{ id: 'audio', label: '🎛️ Audio Mix' }, { id: 'sfx', label: '💥 SFX' }, { id: 'batch', label: '📦 Batch' }] as { id: Tab; label: string }[]).map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setError(null); }} style={{ flex: 1, padding: '7px 4px', background: tab === t.id ? 'var(--vs-bg-elevated)' : 'transparent', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: tab === t.id ? 600 : 400, color: tab === t.id ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)', cursor: 'pointer' }}>{t.label}</button>
        ))}
      </div>

      {/* ── AUDIO MIX TAB ── */}
      {tab === 'audio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)', lineHeight: 1.5 }}>
            Multiple audio tracks ko video ke saath mix karo. Har track ka volume, delay, fade alag set karo.
          </p>

          {audioTracks.map((track, i) => (
            <div key={track.id} style={{ padding: '10px', background: 'var(--vs-bg)', border: `1px solid ${track.isMuted ? 'var(--vs-border)' : 'var(--vs-border)'}`, borderRadius: '9px', opacity: track.isMuted ? 0.5 : 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-primary)', flex: 1 }}>Track {i + 1}</span>
                <button onClick={() => setAudioTracks(p => p.map(t => t.id === track.id ? { ...t, isMuted: !t.isMuted } : t))}
                  style={{ padding: '2px 8px', fontSize: '10px', cursor: 'pointer', background: track.isMuted ? 'var(--bg-danger, #FCEBEB)' : 'var(--vs-bg-elevated)', border: '1px solid var(--vs-border)', borderRadius: '5px', color: track.isMuted ? 'var(--text-danger)' : 'var(--vs-text-muted)' }}>
                  {track.isMuted ? '🔇 Muted' : '🔊'}
                </button>
                {audioTracks.length > 1 && (
                  <button onClick={() => setAudioTracks(p => p.filter(t => t.id !== track.id))}
                    style={{ padding: '2px 6px', fontSize: '12px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--vs-text-muted)' }}>×</button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label style={label}>Audio File ID</label>
                  <input type="text" value={track.audioId} onChange={e => setAudioTracks(p => p.map(t => t.id === track.id ? { ...t, audioId: e.target.value } : t))}
                    style={inp} placeholder="e.g. voice_abc123.mp3" />
                </div>
                <div>
                  <label style={label}>Volume — {Math.round(track.volume * 100)}%</label>
                  <input type="range" min={0} max={200} value={Math.round(track.volume * 100)}
                    onChange={e => setAudioTracks(p => p.map(t => t.id === track.id ? { ...t, volume: Number(e.target.value) / 100 } : t))}
                    style={{ width: '100%', marginTop: '4px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px' }}>
                {[
                  { label: 'Delay', key: 'delay', val: track.delay, max: 30 },
                  { label: 'Fade In', key: 'fadeIn', val: track.fadeIn, max: 5 },
                  { label: 'Fade Out', key: 'fadeOut', val: track.fadeOut, max: 5 },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ ...label, fontSize: '10px' }}>{f.label} {f.val}s</label>
                    <input type="range" min={0} max={f.max} step={0.5} value={f.val}
                      onChange={e => setAudioTracks(p => p.map(t => t.id === track.id ? { ...t, [f.key]: Number(e.target.value) } : t))}
                      style={{ width: '100%' }} />
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
                  <button onClick={() => setAudioTracks(p => p.map(t => t.id === track.id ? { ...t, loop: !t.loop } : t))}
                    style={{ width: '100%', padding: '5px 4px', fontSize: '10px', cursor: 'pointer', background: track.loop ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg-elevated)', border: `1px solid ${track.loop ? '#6366f1' : 'var(--vs-border)'}`, borderRadius: '5px', color: track.loop ? '#6366f1' : 'var(--vs-text-muted)' }}>
                    🔁 Loop {track.loop ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => setAudioTracks(p => [...p, { id: rid(), audioId: '', label: `Track ${p.length + 1}`, volume: 1.0, delay: 0, fadeIn: 0, fadeOut: 0, loop: false, isMuted: false }])}
            style={{ padding: '7px', fontSize: '12px', background: 'transparent', border: '1px dashed var(--vs-border)', borderRadius: '7px', color: 'var(--vs-text-muted)', cursor: 'pointer' }}>
            + Track Add Karo
          </button>

          {mixOutput && (
            <a href={`${BASE}${mixOutput}`} download style={{ padding: '10px', textAlign: 'center', background: 'var(--bg-success, #EAF3DE)', border: '1px solid var(--border-success)', borderRadius: '8px', color: 'var(--text-success)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
              ✅ Mixed Audio Download Karo
            </a>
          )}

          <button onClick={handleAudioMix} disabled={!videoId || mixRunning}
            style={{ padding: '11px', background: !videoId ? 'var(--vs-bg-elevated)' : mixRunning ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '9px', color: !videoId ? 'var(--vs-text-muted)' : '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {mixRunning ? <><Spinner /> Mixing...</> : !videoId ? '🎬 Pehle video generate karo' : '🎛️ Multi-track Mix Karo'}
          </button>
        </div>
      )}

      {/* ── SFX TAB ── */}
      {tab === 'sfx' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)', lineHeight: 1.5 }}>
            Specific frames par sound effects inject karo — whoosh, impact, transitions ke liye.
          </p>

          {sfxRows.map((s, i) => (
            <div key={s.id} style={{ padding: '10px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '9px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-primary)', flex: 1 }}>SFX {i + 1}</span>
                {sfxRows.length > 1 && (
                  <button onClick={() => setSfxRows(p => p.filter(r => r.id !== s.id))}
                    style={{ padding: '2px 6px', fontSize: '12px', cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--vs-text-muted)' }}>×</button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={label}>Audio File ID</label>
                  <input type="text" value={s.audioId} onChange={e => setSfxRows(p => p.map(r => r.id === s.id ? { ...r, audioId: e.target.value } : r))}
                    style={inp} placeholder="whoosh.mp3" />
                </div>
                <div>
                  <label style={label}>At Second — {s.atSec}s</label>
                  <input type="number" value={s.atSec} min={0} step={0.1}
                    onChange={e => setSfxRows(p => p.map(r => r.id === s.id ? { ...r, atSec: Number(e.target.value) } : r))}
                    style={{ ...inp }} />
                </div>
                <div>
                  <label style={label}>Volume — {Math.round(s.volume * 100)}%</label>
                  <input type="range" min={10} max={200} value={Math.round(s.volume * 100)}
                    onChange={e => setSfxRows(p => p.map(r => r.id === s.id ? { ...r, volume: Number(e.target.value) / 100 } : r))}
                    style={{ width: '100%', marginTop: '4px' }} />
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => setSfxRows(p => [...p, { id: rid(), audioId: '', label: `SFX ${p.length + 1}`, atSec: 0, volume: 1.0 }])}
            style={{ padding: '7px', fontSize: '12px', background: 'transparent', border: '1px dashed var(--vs-border)', borderRadius: '7px', color: 'var(--vs-text-muted)', cursor: 'pointer' }}>
            + SFX Trigger Add Karo
          </button>

          {sfxOutput && (
            <a href={`${BASE}${sfxOutput}`} download style={{ padding: '10px', textAlign: 'center', background: 'var(--bg-success, #EAF3DE)', border: '1px solid var(--border-success)', borderRadius: '8px', color: 'var(--text-success)', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
              ✅ SFX Video Download Karo
            </a>
          )}

          <button onClick={handleSFX} disabled={!videoId || sfxRunning}
            style={{ padding: '11px', background: !videoId ? 'var(--vs-bg-elevated)' : sfxRunning ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '9px', color: !videoId ? 'var(--vs-text-muted)' : '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {sfxRunning ? <><Spinner /> SFX apply ho raha hai...</> : !videoId ? '🎬 Pehle video generate karo' : '💥 SFX Triggers Apply Karo'}
          </button>
        </div>
      )}

      {/* ── BATCH TAB ── */}
      {tab === 'batch' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)', lineHeight: 1.5 }}>
            Multiple video IDs ek saath process karo — har video par same operations apply honge.
          </p>
          <div>
            <label style={label}>Video IDs (ek line mein ek, max 10)</label>
            <textarea value={batchIds} onChange={e => setBatchIds(e.target.value)}
              rows={5} placeholder="video_abc123.mp4&#10;video_def456.mp4&#10;video_ghi789.mp4"
              style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.6 }} />
            <p style={{ margin: '3px 0 0', fontSize: '10px', color: 'var(--vs-text-muted)' }}>
              {batchIds.split('\n').filter(s => s.trim()).length} videos selected
            </p>
          </div>

          {batchResult && (
            <div style={{ padding: '10px 12px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '8px', fontSize: '12px' }}>
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
                Batch ID: <code style={{ fontSize: '11px' }}>{batchResult.batchId}</code>
              </p>
              {batchStatus && (
                <>
                  <div style={{ height: '5px', background: 'var(--vs-border)', borderRadius: '3px', overflow: 'hidden', margin: '6px 0' }}>
                    <div style={{ height: '100%', width: `${((batchStatus.completed + batchStatus.failed) / batchResult.total) * 100}%`, background: batchStatus.failed > 0 ? '#E24B4A' : '#1D9E75', transition: 'width .5s' }} />
                  </div>
                  <p style={{ margin: 0, color: 'var(--vs-text-muted)' }}>
                    {batchStatus.completed} done · {batchStatus.failed} failed · {batchResult.total - batchStatus.completed - batchStatus.failed} pending
                    {batchStatus.status === 'done' && ' ✅'}
                  </p>
                </>
              )}
            </div>
          )}

          <button onClick={handleBatch} disabled={batchRunning}
            style={{ padding: '11px', background: batchRunning ? 'rgba(99,102,241,.6)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', borderRadius: '9px', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: batchRunning ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {batchRunning ? <><Spinner /> Batch processing...</> : `📦 Batch Render Shuru Karo`}
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
