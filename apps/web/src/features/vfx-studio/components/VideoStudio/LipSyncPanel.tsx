// ============================================================
// LIP SYNC PANEL
// ============================================================
// 3 input modes:
//   Mode A: Studio video + Studio audio (seedha IDs se)
//   Mode B: Studio video + Text type karo (TTS auto-generate)
//   Mode C: New video upload + Studio audio / Text
//
// Steps: Configure → Processing → Done → Download
// ============================================================

import React, { useState, useRef } from 'react';
import {
  lipSyncFrontendService,
  SYNC_MODELS,
  STATUS_LABELS,
  type LipSyncStatus,
  type SyncLabsModel,
  type LipSyncJobStatus,
} from '../../services/lipSync.service';

interface LipSyncPanelProps {
  currentVideoId:  string | null;
  currentAudioId?: string | null;
  availableVoices?: { id: string; name: string }[];
  onSyncComplete?:  (outputUrl: string) => void;
}

type InputMode = 'existing' | 'text' | 'upload';
type Step = 'configure' | 'processing' | 'done';

export function LipSyncPanel({
  currentVideoId,
  currentAudioId,
  availableVoices = [],
  onSyncComplete,
}: LipSyncPanelProps) {
  const [step,        setStep]        = useState<Step>('configure');
  const [inputMode,   setInputMode]   = useState<InputMode>('existing');
  const [model,       setModel]       = useState<SyncLabsModel>('sync-1.8.0');
  const [ttsText,     setTtsText]     = useState('');
  const [ttsVoiceId,  setTtsVoiceId]  = useState(availableVoices[0]?.id || '');
  const [uploadFile,  setUploadFile]  = useState<File | null>(null);
  const [uploadPrev,  setUploadPrev]  = useState<string | null>(null);
  const [uploadPct,   setUploadPct]   = useState(0);
  const [jobStatus,   setJobStatus]   = useState<LipSyncJobStatus | null>(null);
  const [outputUrl,   setOutputUrl]   = useState<string | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [isStarting,  setIsStarting]  = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const label: React.CSSProperties = {
    fontSize: '12px', fontWeight: 500,
    color: 'var(--vs-text-secondary)', display: 'block', marginBottom: '5px',
  };
  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '8px 11px',
    background: 'var(--vs-bg)', border: '1px solid var(--vs-border)',
    borderRadius: '8px', color: 'var(--vs-text-primary)',
    fontSize: '13px', outline: 'none',
  };

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadFile(f);
    setUploadPrev(URL.createObjectURL(f));
  }

  async function handleStart() {
    if (!currentVideoId && inputMode !== 'upload') {
      setError('Pehle studio mein video generate karo'); return;
    }
    if (inputMode === 'text' && !ttsText.trim()) {
      setError('Text likhna zaroori hai'); return;
    }
    if (inputMode === 'upload' && !uploadFile) {
      setError('Video file select karo'); return;
    }
    if (inputMode === 'existing' && !currentAudioId) {
      setError('Studio mein pehle voice generate karo'); return;
    }

    setError(null);
    setIsStarting(true);

    try {
      let jobId: string;

      if (inputMode === 'upload' && uploadFile) {
        const result = await lipSyncFrontendService.startWithUpload(
          {
            videoFile: uploadFile,
            ...(currentAudioId ? { audioId: currentAudioId } : {}),
            ...(ttsText.trim() ? { text: ttsText.trim() } : {}),
            ...(ttsText.trim() ? { voiceId: ttsVoiceId } : {}),
            model,
          },
          setUploadPct
        );
        jobId = result.jobId;
      } else {
        const result = await lipSyncFrontendService.startWithIds({
          videoId: currentVideoId!,
          ...(inputMode === 'existing' && currentAudioId
            ? { audioId: currentAudioId }
            : {}),
          ...(inputMode === 'text' && ttsText.trim()
            ? { text: ttsText.trim(), voiceId: ttsVoiceId }
            : {}),
          model,
        });
        jobId = result.jobId;
      }

      setStep('processing');
      setIsStarting(false);

      const finalStatus = await lipSyncFrontendService.waitForCompletion(
        jobId,
        s => setJobStatus(s)
      );

      if (finalStatus.status === 'done' && finalStatus.outputUrl) {
        setOutputUrl(finalStatus.outputUrl);
        setStep('done');
        onSyncComplete?.(finalStatus.outputUrl);
      } else {
        throw new Error(finalStatus.error || 'Sync fail ho gayi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
      setStep('configure');
      setIsStarting(false);
    }
  }

  function handleReset() {
    setStep('configure');
    setJobStatus(null);
    setOutputUrl(null);
    setError(null);
    setUploadPct(0);
    setUploadFile(null);
    setUploadPrev(null);
  }

  const progressPct = jobStatus?.progress ?? 0;
  const statusKey   = jobStatus?.status as LipSyncStatus | undefined;

  // ── Configure step ──
  if (step === 'configure') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          🗣️ Lip Sync
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Face video + voice → AI lips ko voice ke saath sync karo
        </p>
      </div>

      {/* Input mode tabs */}
      <div style={{ display: 'flex', background: 'var(--vs-bg)', borderRadius: '8px', padding: '3px', border: '1px solid var(--vs-border)' }}>
        {([
          { id: 'existing', label: '🎬 Studio Audio' },
          { id: 'text',     label: '✍️ Text → Voice' },
          { id: 'upload',   label: '📤 Upload Video' },
        ] as { id: InputMode; label: string }[]).map(m => (
          <button key={m.id} onClick={() => setInputMode(m.id)} style={{
            flex: 1, padding: '7px 4px',
            background: inputMode === m.id ? 'var(--vs-bg-elevated)' : 'transparent',
            border: 'none', borderRadius: '6px',
            color: inputMode === m.id ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)',
            fontSize: '12px', fontWeight: inputMode === m.id ? 600 : 400,
            cursor: 'pointer', transition: 'all .15s',
          }}>{m.label}</button>
        ))}
      </div>

      {/* Mode A: Studio video + Studio audio */}
      {inputMode === 'existing' && (
        <div style={{ padding: '10px 12px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', borderRadius: '9px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--vs-text-secondary)' }}>Video:</span>
            <span style={{ color: currentVideoId ? 'var(--text-success)' : 'var(--text-danger)', fontWeight: 500 }}>
              {currentVideoId ? `✓ ${currentVideoId}` : '✗ Video generate karo pehle'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '6px' }}>
            <span style={{ color: 'var(--vs-text-secondary)' }}>Audio:</span>
            <span style={{ color: currentAudioId ? 'var(--text-success)' : 'var(--text-danger)', fontWeight: 500 }}>
              {currentAudioId ? `✓ ${currentAudioId}` : '✗ Voice tab se audio generate karo'}
            </span>
          </div>
        </div>
      )}

      {/* Mode B: Studio video + Text (TTS) */}
      {inputMode === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={label}>Bolne wala text *</label>
            <textarea
              placeholder="Jo bolna hai wo yahan likho — AI character is text ko bolega..."
              value={ttsText}
              onChange={e => setTtsText(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit', lineHeight: 1.5 }}
              onFocus={e  => (e.target.style.borderColor = '#6366f1')}
              onBlur={e   => (e.target.style.borderColor = 'var(--vs-border)')}
            />
            <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
              {ttsText.length} characters
            </p>
          </div>
          {availableVoices.length > 0 && (
            <div>
              <label style={label}>Voice select karo</label>
              <select value={ttsVoiceId} onChange={e => setTtsVoiceId(e.target.value)} style={{ ...inputStyle }}>
                {availableVoices.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Mode C: Video upload */}
      {inputMode === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${uploadFile ? '#6366f1' : 'var(--vs-border)'}`,
              borderRadius: '10px', padding: '16px', textAlign: 'center',
              cursor: 'pointer', background: uploadFile ? 'rgba(99,102,241,0.04)' : 'transparent',
            }}
          >
            {uploadPrev ? (
              <video src={uploadPrev} muted style={{ width: '100%', maxHeight: '120px', borderRadius: '6px', objectFit: 'contain' }} />
            ) : (
              <>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>🎥</div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--vs-text-secondary)' }}>Face wala video upload karo</p>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--vs-text-muted)' }}>MP4, MOV · Face clearly visible hona chahiye</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm"
            onChange={handleFileSelect} style={{ display: 'none' }} />
          {uploadFile && (
            <div style={{ fontSize: '12px', color: 'var(--vs-text-muted)' }}>
              ✓ {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(1)} MB)
            </div>
          )}
          <div>
            <label style={label}>Bolne wala text (TTS)</label>
            <textarea
              placeholder="Text likho — ye voice ban kar lips se sync hogi..."
              value={ttsText} onChange={e => setTtsText(e.target.value)}
              rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
              onFocus={e  => (e.target.style.borderColor = '#6366f1')}
              onBlur={e   => (e.target.style.borderColor = 'var(--vs-border)')}
            />
          </div>
        </div>
      )}

      {/* Model selector */}
      <div>
        <label style={label}>SyncLabs Model</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SYNC_MODELS.map(m => (
            <div key={m.value}
              onClick={() => setModel(m.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 12px', cursor: 'pointer',
                background: model === m.value ? 'rgba(99,102,241,0.08)' : 'var(--vs-bg)',
                border: `1px solid ${model === m.value ? '#6366f1' : 'var(--vs-border)'}`,
                borderRadius: '8px', transition: 'all .12s',
              }}
            >
              <div style={{
                width: '16px', height: '16px', borderRadius: '50%',
                border: `2px solid ${model === m.value ? '#6366f1' : 'var(--vs-border)'}`,
                background: model === m.value ? '#6366f1' : 'transparent',
                flexShrink: 0,
              }} />
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: model === m.value ? '#6366f1' : 'var(--vs-text-primary)' }}>
                  {m.label}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--vs-text-muted)' }}>{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '9px 12px', borderRadius: '8px', fontSize: '12px', background: 'var(--bg-danger, #FCEBEB)', border: '1px solid var(--border-danger)', color: 'var(--text-danger)', lineHeight: 1.5 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Start button */}
      <button onClick={handleStart} disabled={isStarting} style={{
        padding: '11px',
        background: isStarting ? 'rgba(99,102,241,0.6)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        border: 'none', borderRadius: '9px', color: '#fff',
        fontSize: '13px', fontWeight: 600, cursor: isStarting ? 'wait' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      }}>
        {isStarting ? (
          <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> Shuru ho raha hai...</>
        ) : '🗣️ Lip Sync Shuru Karo'}
      </button>

      <div style={{ padding: '10px 12px', borderRadius: '8px', fontSize: '11px', background: 'var(--vs-bg)', border: '1px solid var(--vs-border)', color: 'var(--vs-text-muted)', lineHeight: 1.6 }}>
        <strong>Powered by SyncLabs</strong> — best results ke liye face clearly visible aur well-lit hona chahiye. Occlusion (mask, hand) se quality drop hoti hai.
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // ── Processing step ──
  if (step === 'processing') return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 0' }}>
      <div>
        <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          🗣️ Lip Sync
        </h3>
      </div>
      <div style={{ textAlign: 'center', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '36px' }}>🎭</div>
        <div>
          <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
            {statusKey ? STATUS_LABELS[statusKey] : 'Processing...'}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
            SyncLabs AI lips sync kar raha hai — 1-3 min lag sakte hain
          </p>
        </div>
        <div style={{ height: '6px', background: 'var(--vs-border)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width .5s ease' }} />
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>{progressPct}% complete</p>
      </div>
    </div>
  );

  // ── Done step ──
  if (step === 'done' && outputUrl) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h3 style={{ margin: '0 0 3px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          🗣️ Lip Sync
        </h3>
      </div>
      <div style={{ padding: '12px', borderRadius: '10px', background: 'var(--bg-success, #EAF3DE)', border: '1px solid var(--border-success)', textAlign: 'center' }}>
        <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: 600, color: 'var(--text-success)' }}>✅ Lip sync complete!</p>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-success)' }}>SyncLabs ne lips ko voice ke saath sync kar diya</p>
      </div>
      <video src={`${import.meta.env.VITE_API_URL || ''}${outputUrl}`} controls style={{ width: '100%', borderRadius: '10px', background: '#000', maxHeight: '240px' }} />
      <div style={{ display: 'flex', gap: '8px' }}>
        <a href={`${import.meta.env.VITE_API_URL || ''}${outputUrl}`} download
          style={{ flex: 1, padding: '10px', textAlign: 'center', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
          ⬇️ Download
        </a>
        <button onClick={handleReset} style={{ flex: 1, padding: '10px', background: 'var(--vs-bg-elevated)', border: '1px solid var(--vs-border)', borderRadius: '8px', fontSize: '13px', color: 'var(--vs-text-secondary)', cursor: 'pointer' }}>
          🔄 Naya Sync
        </button>
      </div>
    </div>
  );

  return null;
}

