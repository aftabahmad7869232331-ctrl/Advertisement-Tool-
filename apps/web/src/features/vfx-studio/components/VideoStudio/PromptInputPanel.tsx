// ============================================================
// PROMPT INPUT PANEL - 20 Prompt Boxes Container
// ============================================================

import React, { useCallback, useRef } from 'react';
import { PromptBox } from './PromptBox';
import { AIScriptGenerator } from './AIScriptGenerator';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import { MAX_PROMPT_COUNT } from '../../constants/videoFormats';

export function PromptInputPanel() {
  const { project, addPrompt, removePrompt, updatePrompt, reorderPrompts, canAddPrompt, validPromptCount } = useVideoStudio();
  const dragFromIndex = useRef<number>(-1);

  const handleDragStart = useCallback((index: number) => {
    dragFromIndex.current = index;
  }, []);

  const handleDrop = useCallback((toIndex: number) => {
    if (dragFromIndex.current !== -1 && dragFromIndex.current !== toIndex) {
      reorderPrompts(dragFromIndex.current, toIndex);
    }
    dragFromIndex.current = -1;
  }, [reorderPrompts]);

  // AI se generate hue prompts ko existing boxes mein fill karta hai
  const handleAIPromptsGenerated = useCallback(
    (aiPrompts: { index: number; text: string; style?: string; mood?: string }[]) => {
      aiPrompts.forEach(ap => {
        const existing = project.prompts[ap.index];
        if (existing) {
          updatePrompt(existing.id, {
            text: ap.text,
            ...(ap.style ? { style: ap.style } : {}),
            ...(ap.mood ? { mood: ap.mood } : {}),
          });
        }
      });
    },
    [project.prompts, updatePrompt]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* AI Script Generator — prompt boxes ke upar */}
      <AIScriptGenerator
        onPromptsGenerated={handleAIPromptsGenerated}
        clipCount={project.prompts.length || MAX_PROMPT_COUNT}
      />

      {/* Panel Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
            Video Prompts
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--vs-text-muted)' }}>
            {project.prompts.length}/{MAX_PROMPT_COUNT} clips · {validPromptCount} valid
          </p>
        </div>
        {canAddPrompt && (
          <button
            onClick={addPrompt}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px',
              background: 'var(--vs-bg-elevated)',
              border: '1px dashed var(--vs-border)',
              borderRadius: '8px',
              color: 'var(--vs-text-secondary)',
              fontSize: '13px', cursor: 'pointer',
              transition: 'all var(--vs-transition-fast)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--vs-primary)';
              e.currentTarget.style.color = 'var(--vs-primary)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--vs-border)';
              e.currentTarget.style.color = 'var(--vs-text-secondary)';
            }}
          >
            <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span>
            Add Clip
          </button>
        )}
      </div>

      {/* Empty State */}
      {project.prompts.length === 0 && (
        <div
          onClick={addPrompt}
          style={{
            border: '2px dashed var(--vs-border)',
            borderRadius: 'var(--vs-radius-lg)',
            padding: '40px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all var(--vs-transition-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--vs-primary)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--vs-border)')}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎬</div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
            Start Your Video
          </p>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--vs-text-muted)' }}>
            AI se generate karo ya manually likho — up to {MAX_PROMPT_COUNT} clips.
          </p>
        </div>
      )}

      {/* Prompt Boxes */}
      <div className="vs-stagger" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {project.prompts.map((prompt, index) => (
          <div key={prompt.id} className="vs-animate-slide-up">
            <PromptBox
              prompt={prompt}
              index={index}
              onUpdate={updatePrompt}
              onRemove={removePrompt}
              canRemove={project.prompts.length > 1}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          </div>
        ))}
      </div>

      {/* Add more button (bottom) */}
      {project.prompts.length > 0 && canAddPrompt && (
        <button
          onClick={addPrompt}
          style={{
            width: '100%', padding: '10px',
            background: 'transparent',
            border: '1px dashed var(--vs-border)',
            borderRadius: '8px',
            color: 'var(--vs-text-muted)',
            fontSize: '13px', cursor: 'pointer',
            transition: 'all var(--vs-transition-fast)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--vs-primary)';
            e.currentTarget.style.color = 'var(--vs-primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--vs-border)';
            e.currentTarget.style.color = 'var(--vs-text-muted)';
          }}
        >
          + Add Another Clip ({project.prompts.length}/{MAX_PROMPT_COUNT})
        </button>
      )}

      {/* Max reached notice */}
      {!canAddPrompt && (
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--vs-text-muted)', margin: 0 }}>
          Maximum {MAX_PROMPT_COUNT} clips reached. Remove a clip to add another.
        </p>
      )}
    </div>
  );
}

