// ============================================================
// MUSIC PANEL
// ============================================================
// Mood filter → Track list → Mixer controls → Apply
// Auto-duck: voice aane par music volume auto-kam hota hai
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  musicService,
  MOOD_OPTIONS,
  type MusicTrack,
  type MusicMood,
} from '../../services/music.service';

interface MusicPanelProps {
  videoId: string | null;
  onMusicApplied: (outputUrl: string, outputId: string) => void;
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MusicPanel({ videoId, onMusicApplied }: MusicPanelProps) {
  const [mood,         setMood]         = useState<MusicMood | 'all'>('all');
  const [tracks,       setTracks]       = useState<MusicTrack[]>([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [selectedId,   setSelectedId]   = useState<string | null>(null);

  // Mixer settings
  const [musicVolume,  setMusicVolume]  = useState(0.30);
  const [voiceVolume,  setVoiceVolume]  = useState(1.0);
  const [autoDuck,     setAutoDuck]     = useState(true);
  const [fadeIn,       setFadeIn]       = useState(1.5);
  const [fadeOut,      setFadeOut]      = useState(2.0);

  const [isApplying,   setIsApplying]   = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [success,      setSuccess]      = useState(false);

  const label: React.CSSProperties = {
    fontSize: '12px', fontWeight: 500,
    color: 'var(--vs-text-secondary, var(--text-secondary))',
    display: 'block', marginBottom: '4px',
  };

  // Load tracks
  useEffect(() => {
    setIsLoading(true);
    musicService
      .getTracks(mood === 'all' ? undefined : mood)
      .then(setTracks)
      .catch(() => setError('Track list load nahi ho paya'))
      .finally(() => setIsLoading(false));
  }, [mood]);

  const selectedTrack = tracks.find(t => t.id === selectedId);

  async function handleApply() {
    if (!videoId)    { setError('Pehle video generate karo'); return; }
    if (!selectedId) { setError('Ek track select karo'); return; }
    if (!selectedTrack?.available) {
      setError(`Track file server par nahi hai — backend/storage/music/${selectedTrack?.file} mein rakho`);
      return;
    }

    setIsApplying(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await musicService.applyMusic({
        videoId,
        trackId:     selectedId,
        musicVolume,
        voiceVolume,
        autoDuck,
        fadeInSec:   fadeIn,
        fadeOutSec:  fadeOut,
        loop:        true,
      });
      onMusicApplied(result.url, result.outputId);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Music apply fail ho gaya');
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          🎵 Background Music
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Video par royalty-free music lagao — voice ke saath auto-mix
        </p>
      </div>

      {/* Mood filter */}
      <div>
        <label style={label}>Mood / Genre</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          <button
            onClick={() => setMood('all')}
            style={{
              padding: '5px 11px', fontSize: '12px', cursor: 'pointer',
              background: mood === 'all' ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg)',
              border: `1px solid ${mood === 'all' ? '#6366f1' : 'var(--vs-border)'}`,
              borderRadius: '20px',
              color: mood === 'all' ? '#6366f1' : 'var(--vs-text-secondary)',
              fontWeight: mood === 'all' ? 600 : 400,
              transition: 'all .12s',
            }}
          >All</button>
          {MOOD_OPTIONS.map(m => (
            <button key={m.value} onClick={() => setMood(m.value)} style={{
              padding: '5px 11px', fontSize: '12px', cursor: 'pointer',
              background: mood === m.value ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg)',
              border: `1px solid ${mood === m.value ? '#6366f1' : 'var(--vs-border)'}`,
              borderRadius: '20px',
              color: mood === m.value ? '#6366f1' : 'var(--vs-text-secondary)',
              fontWeight: mood === m.value ? 600 : 400,
              transition: 'all .12s',
            }}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Track list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--vs-text-muted)', fontSize: '13px', padding: '20px 0' }}>
            ⏳ Tracks load ho rahe hain...
          </p>
        ) : tracks.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--vs-text-muted)', fontSize: '13px', padding: '20px 0' }}>
            Is mood mein koi track nahi mila
          </p>
        ) : tracks.map(track => (
          <div
            key={track.id}
            onClick={() => setSelectedId(track.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 12px',
              background: selectedId === track.id
                ? 'rgba(99,102,241,0.08)'
                : 'var(--vs-bg, var(--surface-0))',
              border: `1px solid ${selectedId === track.id ? '#6366f1' : 'var(--vs-border)'}`,
              borderRadius: '9px', cursor: 'pointer',
              transition: 'all .12s',
              opacity: track.available ? 1 : 0.5,
            }}
          >
            {/* Play icon / selected */}
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: selectedId === track.id
                ? '#6366f1'
                : 'var(--vs-bg-elevated)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', flexShrink: 0,
              color: selectedId === track.id ? '#fff' : 'var(--vs-text-muted)',
            }}>
              {selectedId === track.id ? '♪' : '▶'}
            </div>

            {/* Track info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
                  {track.name}
                </span>
                {!track.available && (
                  <span style={{
                    fontSize: '10px', padding: '1px 6px', borderRadius: '10px',
                    background: 'var(--bg-warning)', color: 'var(--text-warning)',
                  }}>file missing</span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--vs-text-muted)', marginTop: '2px' }}>
                {MOOD_OPTIONS.find(m => m.value === track.mood)?.emoji} {track.mood} · {track.bpm} BPM · {formatDuration(track.durationSec)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mixer controls — sirf tab dikhao jab track selected ho */}
      {selectedTrack && (
        <div style={{
          background: 'var(--vs-bg, var(--surface-0))',
          border: '1px solid var(--vs-border)',
          borderRadius: '10px', padding: '14px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
            🎛️ Mixer — {selectedTrack.name}
          </p>

          {/* Music volume */}
          <div>
            <label style={label}>
              Music Volume — {Math.round(musicVolume * 100)}%
              <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
                (30% recommended)
              </span>
            </label>
            <input type="range" min="5" max="100" value={Math.round(musicVolume * 100)}
              onChange={e => setMusicVolume(Number(e.target.value) / 100)}
              style={{ width: '100%' }} />
          </div>

          {/* Voice volume */}
          <div>
            <label style={label}>Voice Volume — {Math.round(voiceVolume * 100)}%</label>
            <input type="range" min="50" max="150" value={Math.round(voiceVolume * 100)}
              onChange={e => setVoiceVolume(Number(e.target.value) / 100)}
              style={{ width: '100%' }} />
          </div>

          {/* Auto-duck toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--vs-text-primary)' }}>
                Auto-Duck
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
                Voice aane par music automatic km ho jata hai
              </p>
            </div>
            <button
              onClick={() => setAutoDuck(!autoDuck)}
              style={{
                width: '44px', height: '24px', borderRadius: '12px', border: 'none',
                background: autoDuck ? '#6366f1' : 'var(--vs-border)',
                position: 'relative', cursor: 'pointer', transition: 'background .2s',
              }}
            >
              <span style={{
                position: 'absolute', top: '2px',
                left: autoDuck ? '22px' : '2px',
                width: '20px', height: '20px', borderRadius: '50%',
                background: '#fff', transition: 'left .2s',
              }} />
            </button>
          </div>

          {/* Fade controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={label}>Fade In — {fadeIn}s</label>
              <input type="range" min="0" max="5" step="0.5" value={fadeIn}
                onChange={e => setFadeIn(Number(e.target.value))}
                style={{ width: '100%' }} />
            </div>
            <div>
              <label style={label}>Fade Out — {fadeOut}s</label>
              <input type="range" min="0" max="5" step="0.5" value={fadeOut}
                onChange={e => setFadeOut(Number(e.target.value))}
                style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '9px 12px', borderRadius: '8px', fontSize: '12px',
          background: 'var(--bg-danger, #FCEBEB)',
          border: '1px solid var(--border-danger, #F09595)',
          color: 'var(--text-danger, #A32D2D)',
          lineHeight: 1.5,
        }}>⚠️ {error}</div>
      )}

      {/* Apply button */}
      <button onClick={handleApply} disabled={!videoId || !selectedId || isApplying} style={{
        padding: '11px',
        background: success
          ? 'var(--bg-success, #EAF3DE)'
          : !videoId || !selectedId
            ? 'var(--vs-bg-elevated)'
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        border: success ? '1px solid var(--border-success)' : 'none',
        borderRadius: '9px',
        color: success ? 'var(--text-success)' : !videoId || !selectedId ? 'var(--vs-text-muted)' : '#fff',
        fontSize: '13px', fontWeight: 600,
        cursor: !videoId || !selectedId || isApplying ? 'not-allowed' : 'pointer',
        transition: 'all .2s',
      }}>
        {success
          ? '✅ Music apply ho gaya!'
          : isApplying
            ? '⏳ FFmpeg audio mixing...'
            : !videoId
              ? '🎬 Pehle video generate karo'
              : !selectedId
                ? '🎵 Track select karo'
                : `🎵 "${selectedTrack?.name}" Apply Karo`}
      </button>

      {/* Music files note */}
      <div style={{
        padding: '10px 12px', borderRadius: '8px', fontSize: '11px',
        background: 'var(--vs-bg, var(--surface-0))',
        border: '1px solid var(--vs-border)',
        color: 'var(--vs-text-muted)', lineHeight: 1.6,
      }}>
        📁 <strong>Music files:</strong> Royalty-free MP3 tracks{' '}
        <code style={{ fontSize: '10px' }}>backend/storage/music/</code> mein rakho.{' '}
        Free sources: <strong>Pixabay</strong>, <strong>Mixkit</strong>, <strong>Bensound</strong>
      </div>
    </div>
  );
}
