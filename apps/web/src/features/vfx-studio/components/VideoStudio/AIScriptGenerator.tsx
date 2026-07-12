// ============================================================
// AI SCRIPT GENERATOR
// ============================================================
// User sirf 4 fields bharta hai:
//   1. Product / Brand name
//   2. Target audience
//   3. Tone (8 options)
//   4. Platform (7 options)
// Gemini automatically 20 scene prompts generate karta hai
// jo seedha prompt boxes mein fill ho jaate hain.
// ============================================================

import React, { useState } from 'react';
import {
  scriptGenerationService,
  TONE_OPTIONS,
  PLATFORM_OPTIONS,
  type VideoTone,
  type VideoPlatform,
} from '../../services/scriptGeneration.service';
import type { VideoPrompt } from '../../types/video.types';

interface AIScriptGeneratorProps {
  onPromptsGenerated: (prompts: Pick<VideoPrompt, 'index' | 'text' | 'style' | 'mood'>[]) => void;
  clipCount: number;
}

export function AIScriptGenerator({ onPromptsGenerated, clipCount }: AIScriptGeneratorProps) {
  const [isOpen,     setIsOpen]     = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [success,    setSuccess]    = useState(false);

  const [productName,       setProductName]       = useState('');
  const [targetAudience,    setTargetAudience]    = useState('');
  const [tone,              setTone]              = useState<VideoTone>('energetic');
  const [platform,          setPlatform]          = useState<VideoPlatform>('instagram_reel');
  const [additionalContext, setAdditionalContext] = useState('');

  const selectedPlatform = PLATFORM_OPTIONS.find(p => p.value === platform);

  async function handleGenerate() {
    if (!productName.trim() || !targetAudience.trim()) {
      setError('Product name aur target audience dono zaroori hain');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const trimmedAdditionalContext = additionalContext.trim();

      const result = await scriptGenerationService.generate({
        productName: productName.trim(),
        targetAudience: targetAudience.trim(),
        tone,
        platform,
        clipCount,
        ...(trimmedAdditionalContext
          ? { additionalContext: trimmedAdditionalContext }
          : {}),
      });

      onPromptsGenerated(result.prompts);
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Script generation fail ho gayi');
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    background: 'var(--vs-bg-elevated, var(--surface-1))',
    border: '1px solid var(--vs-border, var(--border))',
    borderRadius: '8px',
    color: 'var(--vs-text-primary, var(--text-primary))',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color .15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--vs-text-secondary, var(--text-secondary))',
    marginBottom: '5px',
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Trigger Button */}
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '11px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span style={{ fontSize: '16px' }}>✨</span>
          AI se Script Generate Karo
          <span style={{
            fontSize: '11px', fontWeight: 400, opacity: 0.85,
            background: 'rgba(255,255,255,0.2)',
            padding: '2px 8px', borderRadius: '20px',
          }}>
            {clipCount} clips
          </span>
        </button>
      ) : (
        /* Expanded Generator Panel */
        <div style={{
          background: 'var(--vs-bg-elevated, var(--surface-1))',
          border: '1px solid var(--vs-border, var(--border))',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {/* Panel Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '15px' }}>✨</span>
              <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                AI Script Generator
              </span>
              <span style={{
                fontSize: '11px', color: 'rgba(255,255,255,0.8)',
                background: 'rgba(255,255,255,0.15)',
                padding: '2px 8px', borderRadius: '20px',
              }}>
                Gemini
              </span>
            </div>
            <button
              onClick={() => { setIsOpen(false); setError(null); }}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '6px', color: '#fff',
                width: '24px', height: '24px',
                cursor: 'pointer', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Form */}
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Row 1: Product + Audience */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Product / Brand *</label>
                <input
                  type="text"
                  placeholder="e.g. Nike Air Max, Zomato, iPhone 16"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  style={inputStyle}
                  onFocus={e  => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e   => (e.target.style.borderColor = 'var(--vs-border, var(--border))')}
                />
              </div>
              <div>
                <label style={labelStyle}>Target Audience *</label>
                <input
                  type="text"
                  placeholder="e.g. 18-25 urban youth, working moms"
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  style={inputStyle}
                  onFocus={e  => (e.target.style.borderColor = '#6366f1')}
                  onBlur={e   => (e.target.style.borderColor = 'var(--vs-border, var(--border))')}
                />
              </div>
            </div>

            {/* Row 2: Platform */}
            <div>
              <label style={labelStyle}>Platform</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {PLATFORM_OPTIONS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    style={{
                      padding: '6px 11px',
                      background: platform === p.value
                        ? 'rgba(99,102,241,0.12)'
                        : 'var(--vs-bg, var(--surface-0))',
                      border: `1px solid ${platform === p.value ? '#6366f1' : 'var(--vs-border, var(--border))'}`,
                      borderRadius: '20px',
                      color: platform === p.value
                        ? '#6366f1'
                        : 'var(--vs-text-secondary, var(--text-secondary))',
                      fontSize: '12px',
                      fontWeight: platform === p.value ? 600 : 400,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      transition: 'all .12s',
                    }}
                  >
                    {p.label}
                    <span style={{
                      fontSize: '10px', opacity: 0.7,
                      background: platform === p.value
                        ? 'rgba(99,102,241,0.15)'
                        : 'var(--vs-bg-elevated, var(--surface-1))',
                      padding: '1px 5px', borderRadius: '10px',
                    }}>
                      {p.ratio}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Tone */}
            <div>
              <label style={labelStyle}>Tone / Vibe</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {TONE_OPTIONS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTone(t.value)}
                    style={{
                      padding: '6px 11px',
                      background: tone === t.value
                        ? 'rgba(99,102,241,0.12)'
                        : 'var(--vs-bg, var(--surface-0))',
                      border: `1px solid ${tone === t.value ? '#6366f1' : 'var(--vs-border, var(--border))'}`,
                      borderRadius: '20px',
                      color: tone === t.value
                        ? '#6366f1'
                        : 'var(--vs-text-secondary, var(--text-secondary))',
                      fontSize: '12px',
                      fontWeight: tone === t.value ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all .12s',
                    }}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Additional context (optional) */}
            <div>
              <label style={labelStyle}>
                Extra Context{' '}
                <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span>
              </label>
              <textarea
                placeholder="e.g. Diwali sale hai, 50% off show karna hai, festive mood..."
                value={additionalContext}
                onChange={e => setAdditionalContext(e.target.value)}
                rows={2}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  minHeight: '56px',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                }}
                onFocus={e  => (e.target.style.borderColor = '#6366f1')}
                onBlur={e   => (e.target.style.borderColor = 'var(--vs-border, var(--border))')}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '9px 12px',
                background: 'var(--bg-danger, #FCEBEB)',
                border: '1px solid var(--border-danger, #F09595)',
                borderRadius: '8px',
                color: 'var(--text-danger, #A32D2D)',
                fontSize: '12px',
                lineHeight: 1.5,
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || success}
              style={{
                width: '100%',
                padding: '11px',
                background: success
                  ? 'var(--bg-success, #EAF3DE)'
                  : isLoading
                    ? 'rgba(99,102,241,0.6)'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: success ? '1px solid var(--border-success)' : 'none',
                borderRadius: '9px',
                color: success ? 'var(--text-success, #3B6D11)' : '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isLoading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'all .2s',
              }}
            >
              {success ? (
                <>✅ {clipCount} scenes generate ho gayi — prompt boxes mein fill ho gayi!</>
              ) : isLoading ? (
                <>
                  <span style={{
                    width: '14px', height: '14px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Gemini se {clipCount} scene prompts generate ho rahi hain...
                </>
              ) : (
                <>✨ {clipCount} Scene Prompts Generate Karo ({selectedPlatform?.ratio})</>
              )}
            </button>

            {/* Info note */}
            {!isLoading && !success && (
              <p style={{
                margin: 0, fontSize: '11px', textAlign: 'center',
                color: 'var(--vs-text-muted, var(--text-muted))',
                lineHeight: 1.5,
              }}>
                Gemini AI {clipCount} visual scene descriptions banayega →
                seedha prompt boxes mein fill ho jayenge →
                phir Veo 3.1 se video generate karo
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

