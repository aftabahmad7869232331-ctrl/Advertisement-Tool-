// ============================================================
// VIDEO DROPZONE — Regenerate Existing Video
// ============================================================
// 3 steps:
//   Step 1: Video drop karo / select karo → preview + analysis
//   Step 2: Prompt likho ("cinematic banao", "color grading improve karo")
//   Step 3: Veo 3.1 se regenerate → progress bar → download
// ============================================================

import React, { useState, useRef, useCallback } from 'react';
import {
  videoRegenerateService,
  type UploadAnalysis,
  type RegenerateStatus,
} from '../../services/videoRegenerate.service';

interface VideoDropzoneProps {
  onRegenerated?: (outputUrl: string) => void;
}

type Step = 'drop' | 'configure' | 'generating' | 'done';

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function VideoDropzone({ onRegenerated }: VideoDropzoneProps) {
  const [step,         setStep]         = useState<Step>('drop');
  const [isDragging,   setIsDragging]   = useState(false);
  const [uploadPct,    setUploadPct]    = useState(0);
  const [isUploading,  setIsUploading]  = useState(false);
  const [analysis,     setAnalysis]     = useState<UploadAnalysis | null>(null);
  const [prompt,       setPrompt]       = useState('');
  const [regenStatus,  setRegenStatus]  = useState<RegenerateStatus | null>(null);
  const [outputUrl,    setOutputUrl]    = useState<string | null>(null);
  const [error,        setError]        = useState<string | null>(null);

  const fileRef  = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px',
    background: 'var(--vs-bg, var(--surface-0))',
    border: '1px solid var(--vs-border, var(--border))',
    borderRadius: '8px',
    color: 'var(--vs-text-primary)',
    fontSize: '13px', outline: 'none',
  };

  const label: React.CSSProperties = {
    fontSize: '12px', fontWeight: 500,
    color: 'var(--vs-text-secondary)',
    display: 'block', marginBottom: '5px',
  };

  async function handleFile(file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '')) {
      setError('Sirf MP4, WebM, MOV, AVI ya MKV files allowed hain');
      return;
    }
    setError(null);
    setIsUploading(true);

    try {
      const result = await videoRegenerateService.uploadVideo(file, setUploadPct);
      setAnalysis(result);
      setStep('configure');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fail ho gaya');
    } finally {
      setIsUploading(false);
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  async function handleRegenerate() {
    if (!analysis || !prompt.trim()) return;
    setError(null);
    setStep('generating');

    try {
      await videoRegenerateService.startRegenerate({
        jobId:       analysis.jobId,
        prompt:      prompt.trim(),
        aspectRatio: analysis.aspectRatio,
      });

      const finalStatus = await videoRegenerateService.waitForCompletion(
        analysis.jobId,
        status => setRegenStatus(status)
      );

      if (finalStatus.status === 'done' && finalStatus.outputUrl) {
        setOutputUrl(finalStatus.outputUrl);
        setStep('done');
        onRegenerated?.(finalStatus.outputUrl);
      } else {
        throw new Error(finalStatus.error || 'Regeneration fail ho gayi');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regeneration fail ho gayi');
      setStep('configure');
    }
  }

  function handleReset() {
    setStep('drop');
    setAnalysis(null);
    setPrompt('');
    setRegenStatus(null);
    setOutputUrl(null);
    setError(null);
    setUploadPct(0);
  }

  const progressPct = regenStatus?.progress ?? 0;
  const progressLabel: Record<string, string> = {
    pending:    'Ready ho raha hai...',
    analyzing:  'Video analyze kar raha hai...',
    generating: 'Veo 3.1 se regenerate ho raha hai...',
    done:       'Ho gaya!',
    error:      'Error aa gayi',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          🎞️ Video Regenerate
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Existing video drop karo → Veo 3.1 se enhance / regenerate karo
        </p>
      </div>

      {/* ── STEP 1: DROP ── */}
      {step === 'drop' && (
        <>
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#6366f1' : 'var(--vs-border)'}`,
              borderRadius: '12px',
              padding: '32px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? 'rgba(99,102,241,0.05)' : 'transparent',
              transition: 'all .15s',
            }}
          >
            {isUploading ? (
              <>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>⬆️</div>
                <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
                  Upload ho raha hai... {uploadPct}%
                </p>
                <div style={{
                  height: '4px', background: 'var(--vs-border)',
                  borderRadius: '2px', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: `${uploadPct}%`,
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                    transition: 'width .3s',
                  }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                  {isDragging ? '📂' : '🎬'}
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
                  {isDragging ? 'Chhod do!' : 'Video yahan drop karo'}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
                  MP4, WebM, MOV · Click karke bhi select kar sakte ho
                </p>
              </>
            )}
          </div>
          <input
            ref={fileRef} type="file"
            accept="video/mp4,video/webm,video/quicktime,video/avi,video/x-matroska"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />

          {/* How it works */}
          <div style={{
            padding: '10px 12px', borderRadius: '8px', fontSize: '11px',
            background: 'var(--vs-bg, var(--surface-0))',
            border: '1px solid var(--vs-border)',
            color: 'var(--vs-text-muted)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'var(--vs-text-secondary)' }}>Kaise kaam karta hai:</strong><br />
            ≤3 sec clip → Veo video reference lega (motion copy)<br />
            &gt;3 sec clip → First frame → Veo image reference (style/color copy)
          </div>
        </>
      )}

      {/* ── STEP 2: CONFIGURE ── */}
      {step === 'configure' && analysis && (
        <>
          {/* Video preview */}
          <div style={{
            position: 'relative', background: '#000',
            borderRadius: '10px', overflow: 'hidden',
            aspectRatio: analysis.aspectRatio === '9:16' ? '9/16' : analysis.aspectRatio === '1:1' ? '1/1' : '16/9',
            maxHeight: '200px',
          }}>
            <video
              ref={videoRef}
              src={`${import.meta.env.VITE_API_URL || ''}${analysis.previewUrl}`}
              controls muted
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Analysis badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {[
              { label: analysis.aspectRatio },
              { label: `${analysis.width}×${analysis.height}` },
              { label: formatDuration(analysis.duration) },
              {
                label: analysis.duration <= 3
                  ? '📹 Video ref'
                  : '🖼️ Frame ref',
              },
            ].map((b, i) => (
              <span key={i} style={{
                padding: '3px 9px', borderRadius: '20px', fontSize: '11px',
                background: 'var(--vs-bg-elevated)',
                border: '1px solid var(--vs-border)',
                color: 'var(--vs-text-secondary)',
              }}>
                {b.label}
              </span>
            ))}
          </div>

          {/* Info note from server */}
          <p style={{
            margin: 0, padding: '8px 10px', fontSize: '11px',
            background: 'rgba(99,102,241,0.06)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: '7px', color: '#6366f1', lineHeight: 1.5,
          }}>
            ℹ️ {analysis.message}
          </p>

          {/* Prompt */}
          <div>
            <label style={label}>
              Prompt — Veo ko kya karna hai batao *
            </label>
            <textarea
              placeholder={
                'e.g. "Make it more cinematic with golden hour lighting"\n' +
                '"Same scene but with dramatic color grading"\n' +
                '"Convert to anime style with vibrant colors"'
              }
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', minHeight: '72px', fontFamily: 'inherit', lineHeight: 1.5 }}
              onFocus={e  => (e.target.style.borderColor = '#6366f1')}
              onBlur={e   => (e.target.style.borderColor = 'var(--vs-border)')}
            />
            <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
              {prompt.length}/500 characters
            </p>
          </div>

          {error && (
            <div style={{
              padding: '9px 12px', borderRadius: '8px', fontSize: '12px',
              background: 'var(--bg-danger, #FCEBEB)',
              border: '1px solid var(--border-danger)',
              color: 'var(--text-danger)', lineHeight: 1.5,
            }}>⚠️ {error}</div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleReset} style={{
              flex: 1, padding: '10px',
              background: 'var(--vs-bg-elevated)',
              border: '1px solid var(--vs-border)',
              borderRadius: '8px', fontSize: '13px',
              color: 'var(--vs-text-secondary)', cursor: 'pointer',
            }}>
              ← Wapas
            </button>
            <button
              onClick={handleRegenerate}
              disabled={!prompt.trim()}
              style={{
                flex: 2, padding: '10px',
                background: !prompt.trim()
                  ? 'var(--vs-bg-elevated)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none', borderRadius: '8px',
                color: !prompt.trim() ? 'var(--vs-text-muted)' : '#fff',
                fontSize: '13px', fontWeight: 600,
                cursor: !prompt.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              ✨ Veo se Regenerate Karo
            </button>
          </div>
        </>
      )}

      {/* ── STEP 3: GENERATING ── */}
      {step === 'generating' && (
        <div style={{
          padding: '24px 16px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          <div style={{ fontSize: '36px' }}>🎬</div>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
              {progressLabel[regenStatus?.status || 'pending']}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
              Veo 3.1 regenerate kar raha hai — 1-3 min lag sakte hain
            </p>
          </div>

          {/* Progress bar */}
          <div style={{
            height: '6px', background: 'var(--vs-border)',
            borderRadius: '3px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              transition: 'width .5s ease',
            }} />
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
            {progressPct}% complete
          </p>
        </div>
      )}

      {/* ── STEP 4: DONE ── */}
      {step === 'done' && outputUrl && (
        <>
          <div style={{
            padding: '12px', borderRadius: '10px',
            background: 'var(--bg-success, #EAF3DE)',
            border: '1px solid var(--border-success)',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 600, color: 'var(--text-success, #3B6D11)' }}>
              ✅ Video regenerate ho gayi!
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-success)' }}>
              Veo 3.1 ne naya version bana diya
            </p>
          </div>

          {/* Preview regenerated video */}
          <video
            src={`${import.meta.env.VITE_API_URL || ''}${outputUrl}`}
            controls
            style={{
              width: '100%', borderRadius: '10px',
              background: '#000', maxHeight: '220px',
            }}
          />

          {/* Download + Reset */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={`${import.meta.env.VITE_API_URL || ''}${outputUrl}`}
              download
              style={{
                flex: 1, padding: '10px', textAlign: 'center',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                borderRadius: '8px', color: '#fff',
                fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', display: 'block',
              }}
            >
              ⬇️ Download
            </a>
            <button onClick={handleReset} style={{
              flex: 1, padding: '10px',
              background: 'var(--vs-bg-elevated)',
              border: '1px solid var(--vs-border)',
              borderRadius: '8px', fontSize: '13px',
              color: 'var(--vs-text-secondary)', cursor: 'pointer',
            }}>
              🔄 Naya Video
            </button>
          </div>
        </>
      )}
    </div>
  );
}
