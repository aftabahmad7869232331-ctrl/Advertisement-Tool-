// ============================================================
// WATERMARK PANEL
// ============================================================
// Do modes:
//   1. Image/Logo  — PNG/JPG upload → position + opacity + scale
//   2. Text        — brand name likho → font size + color + opacity
//
// Generated video ID leta hai aur watermarked version return karta hai.
// ============================================================

import React, { useState, useRef } from 'react';
import {
  watermarkService,
  POSITION_OPTIONS,
  type WatermarkPosition,
} from '../../services/watermark.service';

interface WatermarkPanelProps {
  videoId: string | null;
  onWatermarkApplied: (outputUrl: string, outputId: string) => void;
}

export function WatermarkPanel({ videoId, onWatermarkApplied }: WatermarkPanelProps) {
  const [mode,         setMode]         = useState<'image' | 'text'>('image');
  const [position,     setPosition]     = useState<WatermarkPosition>('bottom-right');
  const [opacity,      setOpacity]      = useState(0.85);
  const [scale,        setScale]        = useState(0.15);
  const [marginPx,     setMarginPx]     = useState(20);

  // Logo upload state
  const [logoFile,     setLogoFile]     = useState<File | null>(null);
  const [logoPreview,  setLogoPreview]  = useState<string | null>(null);
  const [logoId,       setLogoId]       = useState<string | null>(null);
  const [uploadPct,    setUploadPct]    = useState(0);
  const [isUploading,  setIsUploading]  = useState(false);

  // Text watermark state
  const [wmText,   setWmText]   = useState('');
  const [fontSize, setFontSize] = useState(28);
  const [color,    setColor]    = useState('#ffffff');

  // Apply state
  const [isApplying, setIsApplying] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const label: React.CSSProperties = {
    fontSize: '12px', fontWeight: 500,
    color: 'var(--vs-text-secondary, var(--text-secondary))',
    display: 'block', marginBottom: '5px',
  };

  const input: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 11px',
    background: 'var(--vs-bg, var(--surface-0))',
    border: '1px solid var(--vs-border, var(--border))',
    borderRadius: '8px',
    color: 'var(--vs-text-primary, var(--text-primary))',
    fontSize: '13px', outline: 'none',
  };

  // Logo file select
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoId(null);
    setLogoPreview(URL.createObjectURL(file));
  }

  // Logo upload to backend
  async function handleLogoUpload() {
    if (!logoFile) return;
    setIsUploading(true);
    setError(null);
    try {
      const result = await watermarkService.uploadLogo(logoFile, setUploadPct);
      setLogoId(result.logoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logo upload fail ho gaya');
    } finally {
      setIsUploading(false);
    }
  }

  // Apply watermark to video
  async function handleApply() {
    if (!videoId) { setError('Pehle video generate karo'); return; }
    if (mode === 'image' && !logoId) { setError('Pehle logo upload karo'); return; }
    if (mode === 'text' && !wmText.trim()) { setError('Watermark text likhna zaroori hai'); return; }

    setIsApplying(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await watermarkService.applyWatermark(videoId, {
        type: mode, position, opacity, marginPx,
        ...(mode === 'image'
          ? { logoId: logoId!, scale }
          : { text: wmText.trim(), fontSize, color }),
      });
      onWatermarkApplied(result.url, result.outputId);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Watermark apply fail ho gaya');
    } finally {
      setIsApplying(false);
    }
  }

  const canApply = videoId && (mode === 'text' ? wmText.trim() : logoId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          🏷️ Watermark / Logo
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Generated video par apna brand ya logo lagao
        </p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', background: 'var(--vs-bg, var(--surface-0))', borderRadius: '8px', padding: '3px', border: '1px solid var(--vs-border, var(--border))' }}>
        {(['image', 'text'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: '7px',
            background: mode === m ? 'var(--vs-bg-elevated, var(--surface-1))' : 'transparent',
            border: 'none', borderRadius: '6px',
            color: mode === m ? 'var(--vs-text-primary)' : 'var(--vs-text-muted)',
            fontSize: '13px', fontWeight: mode === m ? 600 : 400,
            cursor: 'pointer', transition: 'all .15s',
          }}>
            {m === 'image' ? '🖼️ Logo/Image' : '✏️ Text'}
          </button>
        ))}
      </div>

      {/* Image mode */}
      {mode === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${logoPreview ? 'var(--vs-primary, #6366f1)' : 'var(--vs-border, var(--border))'}`,
              borderRadius: '10px', padding: '16px',
              textAlign: 'center', cursor: 'pointer',
              background: logoPreview ? 'rgba(99,102,241,0.04)' : 'transparent',
              transition: 'all .15s',
            }}
          >
            {logoPreview ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                <img src={logoPreview} alt="logo preview"
                  style={{ height: '48px', maxWidth: '120px', objectFit: 'contain', borderRadius: '4px' }} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--vs-text-primary)' }}>
                    {logoFile?.name}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
                    {logoId ? '✅ Uploaded' : 'Click to change'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '28px', marginBottom: '6px' }}>🖼️</div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--vs-text-secondary)' }}>
                  Click karke logo select karo
                </p>
                <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
                  PNG (transparent) best hai · Max 5MB
                </p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp"
            onChange={handleFileChange} style={{ display: 'none' }} />

          {/* Upload button */}
          {logoFile && !logoId && (
            <button onClick={handleLogoUpload} disabled={isUploading} style={{
              padding: '9px', background: '#6366f1', border: 'none',
              borderRadius: '8px', color: '#fff', fontSize: '13px',
              fontWeight: 600, cursor: isUploading ? 'wait' : 'pointer',
            }}>
              {isUploading
                ? `Uploading... ${uploadPct}%`
                : '⬆️ Logo Upload Karo'}
            </button>
          )}

          {/* Scale slider */}
          <div>
            <label style={label}>Logo Size — {Math.round(scale * 100)}% of video width</label>
            <input type="range" min="5" max="40" value={Math.round(scale * 100)}
              onChange={e => setScale(Number(e.target.value) / 100)}
              style={{ width: '100%' }} />
          </div>
        </div>
      )}

      {/* Text mode */}
      {mode === 'text' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={label}>Watermark Text *</label>
            <input type="text" placeholder="© YourBrand 2026"
              value={wmText} onChange={e => setWmText(e.target.value)}
              style={input} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={label}>Font Size — {fontSize}px</label>
              <input type="range" min="14" max="72" value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                style={{ width: '100%' }} />
            </div>
            <div>
              <label style={label}>Color</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  style={{ width: '40px', height: '34px', padding: '2px', border: '1px solid var(--vs-border)', borderRadius: '6px', cursor: 'pointer' }} />
                <input type="text" value={color} onChange={e => setColor(e.target.value)}
                  style={{ ...input, flex: 1 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shared options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Position */}
        <div>
          <label style={label}>Position</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {POSITION_OPTIONS.map(p => (
              <button key={p.value} onClick={() => setPosition(p.value)} style={{
                padding: '6px 10px',
                background: position === p.value ? 'rgba(99,102,241,0.12)' : 'var(--vs-bg, var(--surface-0))',
                border: `1px solid ${position === p.value ? '#6366f1' : 'var(--vs-border, var(--border))'}`,
                borderRadius: '20px', fontSize: '12px', cursor: 'pointer',
                color: position === p.value ? '#6366f1' : 'var(--vs-text-secondary)',
                fontWeight: position === p.value ? 600 : 400,
                transition: 'all .12s',
              }}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <label style={label}>Opacity — {Math.round(opacity * 100)}%</label>
          <input type="range" min="10" max="100" value={Math.round(opacity * 100)}
            onChange={e => setOpacity(Number(e.target.value) / 100)}
            style={{ width: '100%' }} />
        </div>

        {/* Margin */}
        <div>
          <label style={label}>Edge Margin — {marginPx}px</label>
          <input type="range" min="5" max="60" value={marginPx}
            onChange={e => setMarginPx(Number(e.target.value))}
            style={{ width: '100%' }} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '9px 12px', borderRadius: '8px', fontSize: '12px',
          background: 'var(--bg-danger, #FCEBEB)',
          border: '1px solid var(--border-danger, #F09595)',
          color: 'var(--text-danger, #A32D2D)',
        }}>⚠️ {error}</div>
      )}

      {/* Apply button */}
      <button onClick={handleApply} disabled={!canApply || isApplying} style={{
        padding: '11px',
        background: success
          ? 'var(--bg-success, #EAF3DE)'
          : !canApply
            ? 'var(--vs-bg-elevated)'
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        border: success ? '1px solid var(--border-success)' : 'none',
        borderRadius: '9px',
        color: success ? 'var(--text-success, #3B6D11)' : !canApply ? 'var(--vs-text-muted)' : '#fff',
        fontSize: '13px', fontWeight: 600,
        cursor: !canApply || isApplying ? 'not-allowed' : 'pointer',
        transition: 'all .2s',
      }}>
        {success
          ? '✅ Watermark apply ho gaya!'
          : isApplying
            ? '⏳ FFmpeg processing...'
            : !videoId
              ? '🎬 Pehle video generate karo'
              : '🏷️ Watermark Apply Karo'}
      </button>

      {!videoId && (
        <p style={{ margin: 0, textAlign: 'center', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
          Video generate hone ke baad watermark lag sakta hai
        </p>
      )}
    </div>
  );
}
