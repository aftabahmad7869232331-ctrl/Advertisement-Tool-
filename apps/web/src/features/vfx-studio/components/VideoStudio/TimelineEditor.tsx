// ============================================================
// TIMELINE EDITOR — VFX Multi-clip Editor
// ============================================================
// Features:
//   - Drag-drop clip reordering
//   - Trim handles (start/end)
//   - Speed ramp (0.25x-4x)
//   - Color filters (6 cinematic presets)
//   - Transitions between clips (7 types)
//   - Mute per clip
//   - Volume per clip
//   - Render to single output video
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTimeline } from '../../hooks/useTimeline';
import type { TimelineClip, TransitionType, ClipFilter, SpeedPreset } from '../../types/video.types';
import { useVideoStudio } from '../../hooks/useVideoStudio';

const TRANSITIONS: { value: TransitionType; label: string; emoji: string }[] = [
  { value: 'none',       label: 'Cut',        emoji: '✂️' },
  { value: 'fade',       label: 'Fade',        emoji: '🌫️' },
  { value: 'dissolve',   label: 'Dissolve',    emoji: '💧' },
  { value: 'zoom_in',    label: 'Zoom In',     emoji: '🔍' },
  { value: 'zoom_out',   label: 'Zoom Out',    emoji: '🔎' },
  { value: 'slide_left', label: 'Slide Left',  emoji: '⬅️' },
  { value: 'slide_right',label: 'Slide Right', emoji: '➡️' },
  { value: 'whip_pan',   label: 'Whip Pan',    emoji: '💨' },
];

const FILTERS: { value: ClipFilter | 'none'; label: string; color: string }[] = [
  { value: 'none',      label: 'Original', color: '#888'    },
  { value: 'cinematic', label: 'Cinematic', color: '#8B6914' },
  { value: 'warm',      label: 'Warm',      color: '#C45C1A' },
  { value: 'cold',      label: 'Cold',      color: '#1A6BC4' },
  { value: 'noir',      label: 'Noir',      color: '#333'    },
  { value: 'vintage',   label: 'Vintage',   color: '#8B7355' },
  { value: 'vivid',     label: 'Vivid',     color: '#C41AC4' },
];

const SPEEDS: { value: SpeedPreset; label: string }[] = [
  { value: 0.25, label: '0.25x 🐢' },
  { value: 0.5,  label: '0.5x'     },
  { value: 0.75, label: '0.75x'    },
  { value: 1.0,  label: '1x ▶'     },
  { value: 1.25, label: '1.25x'    },
  { value: 1.5,  label: '1.5x'     },
  { value: 2.0,  label: '2x ⚡'    },
  { value: 4.0,  label: '4x 🚀'   },
];

// Format seconds as M:SS
function fmtSec(s: number) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const TIMELINE_PX_PER_SEC = 60; // base zoom

export function TimelineEditor() {
  const { project } = useVideoStudio();
  const tl = useTimeline();

  const [dragFrom, setDragFrom]   = useState<number | null>(null);
  const [dragOver, setDragOver]   = useState<number | null>(null);
  const [trimMode, setTrimMode]   = useState<{ id: string; side: 'start' | 'end' } | null>(null);
  const trimStartX = useRef<number>(0);
  const trimStartVal = useRef<number>(0);

  // Level 2 Phase C1: Timeline virtualization — 450 clips ke liye
  // saare DOM mein render karna slow/laggy ho jaata tha. Ab sirf wo
  // clips render hote hain jo abhi visible viewport (+ ek chhota
  // buffer) ke andar hain — scroll karte waqt zaroorat ke hisaab se
  // aur clips render/unrender hote hain.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ scrollLeft: 0, width: 0 });

  const updateViewport = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setViewport({ scrollLeft: el.scrollLeft, width: el.clientWidth });
  }, []);

  useEffect(() => {
    updateViewport();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateViewport, { passive: true });
    const resizeObserver = new ResizeObserver(updateViewport);
    resizeObserver.observe(el);
    return () => {
      el.removeEventListener('scroll', updateViewport);
      resizeObserver.disconnect();
    };
  }, [updateViewport]);

  const label: React.CSSProperties = {
    fontSize: '11px', fontWeight: 500,
    color: 'var(--vs-text-secondary)', display: 'block', marginBottom: '4px',
  };

  // Drag-drop handlers
  function onDragStart(idx: number) { setDragFrom(idx); }
  function onDragOver(e: React.DragEvent, idx: number) { e.preventDefault(); setDragOver(idx); }
  function onDrop(idx: number) {
    if (dragFrom !== null && dragFrom !== idx) tl.reorderClips(dragFrom, idx);
    setDragFrom(null); setDragOver(null);
  }

  // Trim mouse events (pixel-based drag)
  function onTrimMouseDown(e: React.MouseEvent, id: string, side: 'start' | 'end') {
    e.stopPropagation();
    const clip = tl.clips.find(c => c.id === id)!;
    setTrimMode({ id, side });
    trimStartX.current   = e.clientX;
    trimStartVal.current = side === 'start' ? clip.trimStart : clip.trimEnd;

    const onMove = (ev: MouseEvent) => {
      const delta = (ev.clientX - trimStartX.current) / (TIMELINE_PX_PER_SEC * tl.zoom);
      if (side === 'start') {
        tl.setTrimStart(id, Math.max(0, trimStartVal.current + delta));
      } else {
        tl.setTrimEnd(id, Math.max(0, trimStartVal.current - delta));
      }
    };
    const onUp = () => {
      setTrimMode(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  // Add all generated videos to timeline
  function handleAddAllVideos() {
    project.videos.forEach(v => tl.addClip(v));
  }

  const px = TIMELINE_PX_PER_SEC * tl.zoom;

  // Sirf viewport (+ buffer) ke andar wali clips render karo
  const VIRTUALIZATION_BUFFER_PX = 400;
  const visibleRangeStart = viewport.scrollLeft - VIRTUALIZATION_BUFFER_PX;
  const visibleRangeEnd   = viewport.scrollLeft + viewport.width + VIRTUALIZATION_BUFFER_PX;
  const visibleClips = tl.clips
    .map((clip, idx) => ({ clip, idx }))
    .filter(({ clip }) => {
      const leftPx  = clip.startTime * px;
      const rightPx = leftPx + clip.duration * px;
      // viewport.width === 0 matlab abhi measure nahi hua — sab render karo
      // (avoids empty flash on first paint before ResizeObserver fires)
      return viewport.width === 0 || (rightPx >= visibleRangeStart && leftPx <= visibleRangeEnd);
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
            🎬 Timeline Editor
          </h3>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--vs-text-muted)' }}>
            {tl.clips.length} clips · {fmtSec(tl.totalDuration)} total
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {/* Zoom controls */}
          <button onClick={() => tl.setZoom(z => Math.max(0.25, z - 0.25))}
            style={{ padding: '4px 8px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '6px', color: 'var(--vs-text-secondary)', cursor: 'pointer', fontSize: '12px' }}>
            −
          </button>
          <span style={{ fontSize: '11px', color: 'var(--vs-text-muted)', lineHeight: '26px' }}>{tl.zoom.toFixed(2)}x</span>
          <button onClick={() => tl.setZoom(z => Math.min(4, z + 0.25))}
            style={{ padding: '4px 8px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '6px', color: 'var(--vs-text-secondary)', cursor: 'pointer', fontSize: '12px' }}>
            +
          </button>
        </div>
      </div>

      {/* Add clips toolbar */}
      {project.videos.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={handleAddAllVideos}
            style={{ padding: '6px 12px', background: 'rgba(99,102,241,0.1)', border: '1px solid #6366f1', borderRadius: '8px', color: '#6366f1', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            + Sab Videos Add Karo
          </button>
          {project.videos.map((v, i) => (
            <button key={v.id} onClick={() => tl.addClip(v)}
              style={{ padding: '5px 10px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '7px', fontSize: '11px', color: 'var(--vs-text-secondary)', cursor: 'pointer' }}>
              + Video {i + 1} ({fmtSec(v.duration)})
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {tl.clips.length === 0 && (
        <div style={{ padding: '32px 16px', textAlign: 'center', border: '2px dashed var(--vs-border)', borderRadius: '10px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎞️</div>
          <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
            Timeline empty hai
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
            Upar se clips add karo — phir drag karo, trim karo, effects lagao
          </p>
        </div>
      )}

      {/* ── TIMELINE TRACK ── */}
      {tl.clips.length > 0 && (
        <div ref={scrollContainerRef} style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          <div style={{ position: 'relative', height: '80px', minWidth: `${tl.totalDuration * px + 40}px` }}>

            {/* Time ruler — pehle HAR second ka tick render hota tha.
                Ab tick interval zoom ke hisaab se adjust hota
                hai, aur sirf visible range ke ticks render hote hain. */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '18px', background: 'var(--vs-bg)', borderBottom: '0.5px solid var(--vs-border)' }}>
              {(() => {
                // Kam se kam ~50px gap rakhne wala tick interval choose karo
                const rawInterval = 50 / px;
                const niceIntervals = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
                const interval = niceIntervals.find(n => n >= rawInterval) ?? 900;
                const startTick = Math.max(0, Math.floor(visibleRangeStart / px / interval) * interval);
                const endTick   = Math.min(tl.totalDuration, Math.ceil(visibleRangeEnd / px / interval) * interval + interval);
                const ticks: number[] = [];
                for (let t = startTick; t <= endTick; t += interval) ticks.push(t);
                return ticks.map(t => (
                  <div key={t} style={{ position: 'absolute', left: `${t * px}px`, top: 0, height: '100%', borderLeft: '0.5px solid var(--vs-border)' }}>
                    <span style={{ fontSize: '9px', color: 'var(--vs-text-muted)', marginLeft: '2px', lineHeight: '18px' }}>{fmtSec(t)}</span>
                  </div>
                ));
              })()}
            </div>

            {/* Clip blocks */}
            {visibleClips.map(({ clip, idx }) => {
              const clipPx  = clip.duration * px;
              const leftPx  = clip.startTime * px;
              const isSelected = clip.id === tl.selectedClipId;
              const isDragOver = dragOver === idx;

              return (
                <div key={clip.id}
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={e => onDragOver(e, idx)}
                  onDrop={() => onDrop(idx)}
                  onClick={() => tl.setSelectedId(isSelected ? null : clip.id)}
                  style={{
                    position: 'absolute',
                    top: '22px', left: `${leftPx}px`,
                    width: `${Math.max(clipPx - 2, 24)}px`,
                    height: '52px',
                    background: isDragOver
                      ? 'rgba(99,102,241,0.25)'
                      : isSelected
                        ? 'rgba(99,102,241,0.18)'
                        : 'var(--vs-bg-elevated)',
                    border: `1.5px solid ${isSelected ? '#6366f1' : 'var(--vs-border)'}`,
                    borderRadius: '6px',
                    cursor: 'grab',
                    overflow: 'hidden',
                    userSelect: 'none',
                    transition: 'border-color .12s, background .12s',
                    boxSizing: 'border-box',
                  }}
                >
                  {/* Thumbnail bg */}
                  {clip.thumbnailUrl && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      backgroundImage: `url(${clip.thumbnailUrl})`,
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      opacity: 0.25,
                    }} />
                  )}

                  {/* Clip label */}
                  <div style={{ position: 'relative', padding: '3px 6px' }}>
                    <p style={{ margin: 0, fontSize: '10px', fontWeight: 600, color: 'var(--vs-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {clip.label} {clip.filter !== 'none' ? `· ${clip.filter}` : ''} {clip.speed !== 1 ? `· ${clip.speed}x` : ''}
                    </p>
                    <p style={{ margin: 0, fontSize: '9px', color: 'var(--vs-text-muted)' }}>
                      {fmtSec(clip.duration)} {clip.isMuted ? '🔇' : ''}
                    </p>
                  </div>

                  {/* Transition badge (right edge) */}
                  {clip.transition !== 'none' && (
                    <div style={{
                      position: 'absolute', right: '-1px', top: '50%', transform: 'translateY(-50%)',
                      background: '#6366f1', color: '#fff', fontSize: '9px',
                      padding: '2px 4px', borderRadius: '4px 0 0 4px',
                    }}>
                      {TRANSITIONS.find(t => t.value === clip.transition)?.emoji}
                    </div>
                  )}

                  {/* Trim handle — start */}
                  <div
                    onMouseDown={e => onTrimMouseDown(e, clip.id, 'start')}
                    style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: '8px',
                      background: 'rgba(99,102,241,0.5)', cursor: 'col-resize',
                      opacity: isSelected ? 1 : 0, transition: 'opacity .15s',
                    }}
                  />
                  {/* Trim handle — end */}
                  <div
                    onMouseDown={e => onTrimMouseDown(e, clip.id, 'end')}
                    style={{
                      position: 'absolute', right: 0, top: 0, bottom: 0, width: '8px',
                      background: 'rgba(99,102,241,0.5)', cursor: 'col-resize',
                      opacity: isSelected ? 1 : 0, transition: 'opacity .15s',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SELECTED CLIP INSPECTOR ── */}
      {tl.selectedClip && (
        <div style={{
          background: 'var(--vs-bg)', border: '1px solid var(--vs-border)',
          borderRadius: '10px', padding: '12px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
              🎛️ {tl.selectedClip.label}
            </p>
            <button
              onClick={() => tl.removeClip(tl.selectedClip!.id)}
              style={{ padding: '3px 8px', background: 'var(--bg-danger, #FCEBEB)', border: '1px solid var(--border-danger)', borderRadius: '6px', color: 'var(--text-danger)', fontSize: '11px', cursor: 'pointer' }}>
              🗑 Remove
            </button>
          </div>

          {/* Trim */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={label}>Trim Start — {tl.selectedClip.trimStart.toFixed(1)}s</label>
              <input type="range" min={0} max={tl.selectedClip.sourceDuration - tl.selectedClip.trimEnd - 0.5} step={0.1}
                value={tl.selectedClip.trimStart}
                onChange={e => tl.setTrimStart(tl.selectedClip!.id, Number(e.target.value))}
                style={{ width: '100%' }} />
            </div>
            <div>
              <label style={label}>Trim End — {tl.selectedClip.trimEnd.toFixed(1)}s</label>
              <input type="range" min={0} max={tl.selectedClip.sourceDuration - tl.selectedClip.trimStart - 0.5} step={0.1}
                value={tl.selectedClip.trimEnd}
                onChange={e => tl.setTrimEnd(tl.selectedClip!.id, Number(e.target.value))}
                style={{ width: '100%' }} />
            </div>
          </div>

          {/* Speed */}
          <div>
            <label style={label}>Speed</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {SPEEDS.map(s => (
                <button key={s.value}
                  onClick={() => tl.updateClip(tl.selectedClip!.id, { speed: s.value as SpeedPreset })}
                  style={{
                    padding: '4px 9px', fontSize: '11px', cursor: 'pointer',
                    background: tl.selectedClip!.speed === s.value ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg-elevated)',
                    border: `1px solid ${tl.selectedClip!.speed === s.value ? '#6366f1' : 'var(--vs-border)'}`,
                    borderRadius: '6px',
                    color: tl.selectedClip!.speed === s.value ? '#6366f1' : 'var(--vs-text-secondary)',
                    fontWeight: tl.selectedClip!.speed === s.value ? 600 : 400,
                  }}
                >{s.label}</button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <label style={label}>Color Filter</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {FILTERS.map(f => (
                <button key={f.value}
                  onClick={() => tl.updateClip(tl.selectedClip!.id, { filter: f.value as ClipFilter })}
                  style={{
                    padding: '4px 9px', fontSize: '11px', cursor: 'pointer',
                    background: tl.selectedClip!.filter === f.value ? f.color + '22' : 'var(--vs-bg-elevated)',
                    border: `1px solid ${tl.selectedClip!.filter === f.value ? f.color : 'var(--vs-border)'}`,
                    borderRadius: '6px',
                    color: tl.selectedClip!.filter === f.value ? f.color : 'var(--vs-text-secondary)',
                    fontWeight: tl.selectedClip!.filter === f.value ? 600 : 400,
                  }}
                >{f.label}</button>
              ))}
            </div>
          </div>

          {/* Transition (next clip ke liye) */}
          <div>
            <label style={label}>Transition → Next Clip</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {TRANSITIONS.map(t => (
                <button key={t.value}
                  onClick={() => tl.updateClip(tl.selectedClip!.id, { transition: t.value as TransitionType })}
                  style={{
                    padding: '4px 9px', fontSize: '11px', cursor: 'pointer',
                    background: tl.selectedClip!.transition === t.value ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg-elevated)',
                    border: `1px solid ${tl.selectedClip!.transition === t.value ? '#6366f1' : 'var(--vs-border)'}`,
                    borderRadius: '6px',
                    color: tl.selectedClip!.transition === t.value ? '#6366f1' : 'var(--vs-text-secondary)',
                    fontWeight: tl.selectedClip!.transition === t.value ? 600 : 400,
                  }}
                >{t.emoji} {t.label}</button>
              ))}
            </div>
            {tl.selectedClip.transition !== 'none' && (
              <div style={{ marginTop: '6px' }}>
                <label style={label}>Duration — {tl.selectedClip.transitionDuration}s</label>
                <input type="range" min={0.2} max={2} step={0.1}
                  value={tl.selectedClip.transitionDuration}
                  onChange={e => tl.updateClip(tl.selectedClip!.id, { transitionDuration: Number(e.target.value) })}
                  style={{ width: '100%' }} />
              </div>
            )}
          </div>

          {/* Volume + Mute */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => tl.updateClip(tl.selectedClip!.id, { isMuted: !tl.selectedClip!.isMuted })}
              style={{
                padding: '5px 10px', fontSize: '12px', cursor: 'pointer', flexShrink: 0,
                background: tl.selectedClip.isMuted ? 'var(--bg-danger, #FCEBEB)' : 'var(--vs-bg-elevated)',
                border: `1px solid ${tl.selectedClip.isMuted ? 'var(--border-danger)' : 'var(--vs-border)'}`,
                borderRadius: '7px',
                color: tl.selectedClip.isMuted ? 'var(--text-danger)' : 'var(--vs-text-secondary)',
              }}
            >{tl.selectedClip.isMuted ? '🔇 Muted' : '🔊 Mute'}</button>
            <div style={{ flex: 1 }}>
              <label style={{ ...label, marginBottom: '2px' }}>Volume {Math.round(tl.selectedClip.volume * 100)}%</label>
              <input type="range" min={0} max={150} value={Math.round(tl.selectedClip.volume * 100)}
                onChange={e => tl.updateClip(tl.selectedClip!.id, { volume: Number(e.target.value) / 100 })}
                disabled={tl.selectedClip.isMuted}
                style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

      {/* ── RENDER BUTTON ── */}
      {tl.clips.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tl.isRendering ? (
            <>
              <div style={{ height: '6px', background: 'var(--vs-border)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${tl.renderProgress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width .5s' }} />
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--vs-text-muted)', textAlign: 'center' }}>
                {tl.renderStep} — {tl.renderProgress}%
              </p>
            </>
          ) : tl.outputUrl ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <a href={`${import.meta.env.VITE_API_URL || ''}${tl.outputUrl}`} download
                style={{ flex: 1, padding: '10px', textAlign: 'center', background: 'linear-gradient(135deg, #1D9E75, #16856A)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                ⬇️ Final Video Download Karo
              </a>
            </div>
          ) : null}

          {!tl.isRendering && (
            <button onClick={() => tl.renderTimeline()} disabled={tl.isRendering}
              style={{
                padding: '11px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none', borderRadius: '9px', color: '#fff',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>
              🎬 Timeline Render Karo ({tl.clips.length} clips · {fmtSec(tl.totalDuration)})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
