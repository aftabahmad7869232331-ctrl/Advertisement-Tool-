// ============================================================
// VOICE LAB COMPONENT
// ============================================================

import React, { useState } from 'react';
import { useVoiceLab } from '../../hooks/useVoiceLab';
import { LoadingSpinner } from '../Common/LoadingSpinner';
import { VOICE_SPEED_OPTIONS, VOICE_STYLES } from '../../constants/voiceSettings';

export function VoiceLab() {
  const {
    voices, selectedVoice, settings, previewText, isGenerating, isPlaying,
    selectVoice, updateSettings, preview, stopAudio, setPreviewText,
    error,
    clonedVoices, cloning, cloneError, cloneVoice, deleteClonedVoice, voiceCloningAvailable,
  } = useVoiceLab();

  const [cloneName, setCloneName] = useState('');
  const [sampleFiles, setSampleFiles] = useState<File[]>([]);

  async function handleCloneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cloneName.trim() || sampleFiles.length === 0) return;
    await cloneVoice(cloneName.trim(), sampleFiles);
    setCloneName('');
    setSampleFiles([]);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* AI Voice Cloning */}
      <section style={{ background: 'var(--vs-bg-elevated)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--vs-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🎙️ Clone My Voice
        </h4>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          {voiceCloningAvailable
            ? 'Apni voice ke 1-3 clean sample recordings upload karo — AI usi voice mein bol payega.'
            : 'Voice cloning model/provider abhi configured nahi hai. Normal English/Hindi voice generation available hai.'}
        </p>

        {clonedVoices.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {clonedVoices.map(cv => (
              <div key={cv.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 10px', background: 'var(--vs-bg-card)', borderRadius: '6px',
              }}>
                <span style={{ fontSize: '12px', color: 'var(--vs-text-primary)' }}>
                  🎙️ {cv.name} {cv.status !== 'ready' && `(${cv.status})`}
                </span>
                <button
                  onClick={() => deleteClonedVoice(cv.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--vs-error)', cursor: 'pointer', fontSize: '11px' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleCloneSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text" placeholder="Voice ka naam (e.g. My Voice)" value={cloneName}
            disabled={!voiceCloningAvailable}
            onChange={e => setCloneName(e.target.value)}
            style={{
              padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--vs-border)',
              background: 'var(--vs-bg-card)', color: 'var(--vs-text-primary)', fontSize: '13px',
            }}
          />
          <input
            type="file" accept="audio/*" multiple
            disabled={!voiceCloningAvailable}
            onChange={e => setSampleFiles(Array.from(e.target.files ?? []).slice(0, 3))}
            style={{ fontSize: '12px', color: 'var(--vs-text-secondary)' }}
          />
          {sampleFiles.length > 0 && (
            <span style={{ fontSize: '11px', color: 'var(--vs-text-muted)' }}>
              {sampleFiles.length} file{sampleFiles.length > 1 ? 's' : ''} selected
            </span>
          )}
          <button
            type="submit"
            disabled={!voiceCloningAvailable || cloning || !cloneName.trim() || sampleFiles.length === 0}
            style={{
              padding: '9px', borderRadius: '6px', border: 'none',
              background: 'var(--vs-primary)', color: '#fff', fontSize: '13px', fontWeight: 600,
              cursor: cloning ? 'not-allowed' : 'pointer',
              opacity: !voiceCloningAvailable || cloning || !cloneName.trim() || sampleFiles.length === 0 ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {cloning ? <><LoadingSpinner size="sm" /> Cloning...</> : 'Clone Voice'}
          </button>
          {cloneError && <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-error)' }}>{cloneError}</p>}
        </form>
      </section>

      {/* Voice selector */}
      <section>
        <h4 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: 'var(--vs-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Voice
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {voices.map(voice => (
            <button key={voice.id}
              onClick={() => selectVoice(voice)}
              style={{
                padding: '10px 12px', border: '1px solid',
                borderColor: selectedVoice?.id === voice.id ? 'var(--vs-primary)' : 'var(--vs-border)',
                borderRadius: '8px', cursor: 'pointer',
                background: selectedVoice?.id === voice.id ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg-elevated)',
                textAlign: 'left', transition: 'all var(--vs-transition-fast)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{voice.gender === 'male' ? '👨' : voice.gender === 'female' ? '👩' : '🤖'}</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
                    {voice.name}
                    {voice.isPremium && <span style={{ marginLeft: '4px', fontSize: '10px', background: 'var(--vs-warning)', color: '#000', padding: '1px 4px', borderRadius: '3px' }}>PRO</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--vs-text-muted)' }}>{voice.style} · {voice.language}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Settings */}
      {selectedVoice && (
        <section style={{ background: 'var(--vs-bg-elevated)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--vs-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Voice Settings
          </h4>

          {/* Speed */}
          <div>
            <label style={{ fontSize: '13px', color: 'var(--vs-text-secondary)', display: 'block', marginBottom: '6px' }}>
              Speed: {settings.speed}x
            </label>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {VOICE_SPEED_OPTIONS.map(opt => (
                <button key={opt.value}
                  onClick={() => updateSettings({ speed: opt.value })}
                  style={{
                    padding: '4px 10px', fontSize: '12px',
                    background: settings.speed === opt.value ? 'var(--vs-primary)' : 'var(--vs-bg-card)',
                    border: '1px solid var(--vs-border)', borderRadius: '4px',
                    color: settings.speed === opt.value ? '#fff' : 'var(--vs-text-secondary)',
                    cursor: 'pointer',
                  }}>
                  {opt.value}x
                </button>
              ))}
            </div>
          </div>

          {/* Pitch */}
          <div>
            <label style={{ fontSize: '13px', color: 'var(--vs-text-secondary)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Pitch</span>
              <span style={{ color: 'var(--vs-text-primary)' }}>{settings.pitch > 0 ? `+${settings.pitch}` : settings.pitch}</span>
            </label>
            <input type="range" min={-10} max={10} step={1} value={settings.pitch}
              onChange={e => updateSettings({ pitch: Number(e.target.value) })}
              style={{ width: '100%', accentColor: 'var(--vs-primary)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--vs-text-muted)' }}>
              <span>Lower</span><span>Higher</span>
            </div>
          </div>
        </section>
      )}

      {/* Preview */}
      <section>
        <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: 600, color: 'var(--vs-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Preview
        </h4>
        <textarea
          value={previewText}
          onChange={e => setPreviewText(e.target.value)}
          placeholder="Type text to preview voice..."
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'var(--vs-bg-elevated)', border: '1px solid var(--vs-border)',
            borderRadius: '8px', padding: '10px 12px',
            color: 'var(--vs-text-primary)', fontSize: '13px',
            resize: 'vertical', outline: 'none', fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={isPlaying ? stopAudio : preview}
            disabled={!selectedVoice || isGenerating}
            style={{
              flex: 1, padding: '10px',
              background: isPlaying ? 'var(--vs-error)' : 'var(--vs-primary)',
              border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '14px', fontWeight: 500,
              cursor: !selectedVoice ? 'not-allowed' : 'pointer',
              opacity: !selectedVoice ? 0.5 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {isGenerating ? <><LoadingSpinner size="sm" /> Generating...</>
              : isPlaying ? '⏹ Stop'
              : '▶ Preview Voice'}
          </button>
        </div>
        {error && (
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--vs-error)' }}>{error}</p>
        )}
      </section>
    </div>
  );
}
