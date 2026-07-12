// ============================================================
// PROMPT BOX COMPONENT - Single prompt input box
// ============================================================

import React, { useRef, useCallback } from 'react';
import { validatePrompt } from '../../utils/promptValidator.util';
import type { VideoPrompt } from '../../types/video.types';
import { MAX_PROMPT_LENGTH } from '../../constants/videoFormats';

interface PromptBoxProps {
  prompt: VideoPrompt;
  index: number;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  onDragStart?: (index: number) => void;
  onDrop?: (index: number) => void;
}

export function PromptBox({ prompt, index, onUpdate, onRemove, canRemove, onDragStart, onDrop }: PromptBoxProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const validation = validatePrompt(prompt.text);
  const isDragging = useRef(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_PROMPT_LENGTH) onUpdate(prompt.id, val);
  }, [prompt.id, onUpdate]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${Math.min(el.scrollHeight, 200)}px`; }
  }, []);

  const borderColor = prompt.text.length === 0
    ? 'var(--vs-border)'
    : validation.isValid ? 'var(--vs-prompt-valid)' : 'var(--vs-prompt-invalid)';

  return (
    <div
      draggable
      onDragStart={() => { isDragging.current = true; onDragStart?.(index); }}
      onDragEnd={() => { isDragging.current = false; }}
      onDragOver={e => e.preventDefault()}
      onDrop={() => onDrop?.(index)}
      style={{
        background: 'var(--vs-prompt-bg)',
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--vs-radius-md)',
        padding: '12px',
        transition: 'border-color var(--vs-transition-fast)',
        cursor: 'grab',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '22px', height: '22px',
            background: 'var(--vs-primary)', color: '#fff',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, flexShrink: 0,
          }}>{index + 1}</span>
          <span style={{ fontSize: '12px', color: 'var(--vs-text-muted)' }}>
            Clip {index + 1} Prompt
          </span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {prompt.text.length > 0 && (
            <span style={{
              fontSize: '11px',
              color: validation.isValid ? 'var(--vs-success)' : 'var(--vs-error)',
            }}>
              {validation.isValid ? '✓ Valid' : validation.errors[0]}
            </span>
          )}
          {canRemove && (
            <button
              onClick={() => onRemove(prompt.id)}
              title="Remove prompt"
              style={{
                background: 'transparent', border: 'none',
                color: 'var(--vs-text-muted)', cursor: 'pointer',
                padding: '2px 6px', borderRadius: '4px', fontSize: '16px',
                transition: 'color var(--vs-transition-fast)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--vs-error)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--vs-text-muted)')}
            >×</button>
          )}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={prompt.text}
        onChange={handleChange}
        onInput={autoResize}
        placeholder={`Describe scene ${index + 1}... e.g. "A product displayed on a modern desk with soft lighting and a clean background"`}
        rows={3}
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'var(--vs-bg-primary)',
          border: '1px solid var(--vs-border)',
          borderRadius: '6px',
          color: 'var(--vs-text-primary)',
          fontSize: '13px', lineHeight: 1.6,
          padding: '8px 10px',
          resize: 'none', outline: 'none',
          fontFamily: 'inherit',
          transition: 'border-color var(--vs-transition-fast)',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--vs-primary)')}
        onBlur={e => (e.target.style.borderColor = 'var(--vs-border)')}
      />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {validation.warnings.map((w, i) => (
            <span key={i} style={{ fontSize: '11px', color: 'var(--vs-warning)' }}>⚠ {w}</span>
          ))}
        </div>
        <span style={{
          fontSize: '11px',
          color: prompt.charCount > MAX_PROMPT_LENGTH * 0.9 ? 'var(--vs-warning)' : 'var(--vs-text-muted)',
        }}>
          {prompt.charCount}/{MAX_PROMPT_LENGTH}
        </span>
      </div>
    </div>
  );
}
