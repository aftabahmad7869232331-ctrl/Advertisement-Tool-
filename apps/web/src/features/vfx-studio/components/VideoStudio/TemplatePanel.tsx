// ============================================================
// TEMPLATE PANEL
// ============================================================
// 8 platform templates mein se ek select karo.
// Select hone par:
//   - Aspect ratio, quality, Veo model auto-set hota hai
//   - Generate button ke saath template info badge dikhta hai
//   - AIScriptGenerator bhi usi platform ke liye pre-set ho jata hai
// ============================================================

import React, { useState } from 'react';
import { useVideoStudio } from '../../hooks/useVideoStudio';
import type { PlatformTemplate } from '../../config/platformTemplates.config';

export function TemplatePanel() {
  const { templates, activeTemplate, setActiveTemplate } = useVideoStudio();
  const [expanded, setExpanded] = useState<string | null>(null);

  function handleSelect(t: PlatformTemplate) {
    setActiveTemplate(activeTemplate?.id === t.id ? null : t);
    setExpanded(null);
  }

  const ratioGroups = {
    '9:16': { label: 'Vertical (9:16)', emoji: '📱', templates: templates.filter(t => t.aspectRatio === '9:16') },
    '16:9': { label: 'Landscape (16:9)', emoji: '🖥️', templates: templates.filter(t => t.aspectRatio === '16:9') },
    '1:1':  { label: 'Square (1:1)',    emoji: '⬛',  templates: templates.filter(t => t.aspectRatio === '1:1') },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <div>
        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--vs-text-primary)' }}>
          🎯 Platform Templates
        </h3>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--vs-text-muted)' }}>
          Platform choose karo — aspect ratio, quality, Veo model sab auto-set ho jayega
        </p>
      </div>

      {/* Active template badge */}
      {activeTemplate && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 12px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid #6366f1',
          borderRadius: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>{activeTemplate.emoji}</span>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#6366f1' }}>
                {activeTemplate.name} selected
              </p>
              <p style={{ margin: '1px 0 0', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
                {activeTemplate.aspectRatio} · {activeTemplate.quality} · {activeTemplate.recommendedClips} clips
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTemplate(null)}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--vs-text-muted)', fontSize: '18px',
              cursor: 'pointer', lineHeight: 1, padding: '0 4px',
            }}
          >×</button>
        </div>
      )}

      {/* Templates grouped by ratio */}
      {Object.entries(ratioGroups).map(([ratio, group]) => (
        <div key={ratio}>
          <p style={{
            margin: '0 0 8px', fontSize: '11px', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '.06em',
            color: 'var(--vs-text-muted)',
          }}>
            {group.emoji} {group.label}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {group.templates.map(t => {
              const isActive   = activeTemplate?.id === t.id;
              const isExpanded = expanded === t.id;

              return (
                <div key={t.id} style={{
                  border: `1px solid ${isActive ? '#6366f1' : 'var(--vs-border)'}`,
                  borderRadius: '10px',
                  background: isActive
                    ? 'rgba(99,102,241,0.06)'
                    : 'var(--vs-bg, var(--surface-0))',
                  overflow: 'hidden',
                  transition: 'border-color .15s',
                }}>
                  {/* Card header */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: '10px', padding: '10px 12px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSelect(t)}
                  >
                    {/* Platform color dot */}
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '8px',
                      background: t.bgColor,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '16px',
                      flexShrink: 0,
                    }}>
                      {t.emoji}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '13px', fontWeight: 600,
                          color: isActive ? '#6366f1' : 'var(--vs-text-primary)',
                        }}>
                          {t.name}
                        </span>
                        {isActive && (
                          <span style={{
                            fontSize: '10px', padding: '1px 6px',
                            background: '#6366f1', color: '#fff',
                            borderRadius: '10px',
                          }}>Active</span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--vs-text-muted)' }}>
                        {t.description}
                      </span>
                    </div>

                    {/* Info toggle */}
                    <button
                      onClick={e => { e.stopPropagation(); setExpanded(isExpanded ? null : t.id); }}
                      style={{
                        background: 'transparent', border: 'none',
                        color: 'var(--vs-text-muted)', fontSize: '16px',
                        cursor: 'pointer', padding: '2px 6px',
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                        transition: 'transform .15s',
                      }}
                    >
                      ▾
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div style={{
                      padding: '0 12px 12px',
                      borderTop: '1px solid var(--vs-border)',
                    }}>
                      {/* Specs */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '8px', marginTop: '10px', marginBottom: '10px',
                      }}>
                        {[
                          { label: 'Ratio',    value: t.aspectRatio },
                          { label: 'Quality',  value: t.quality },
                          { label: 'Clips',    value: `${t.recommendedClips} clips` },
                          { label: 'Max',      value: `${t.maxDurationSec}s` },
                          { label: 'Per clip', value: `${t.clipDurationSec}s` },
                          { label: 'Veo',      value: t.veoModel.includes('lite') ? 'Lite' : t.veoModel.includes('quality') || t.veoModel.includes('preview') && !t.veoModel.includes('fast') ? 'Quality' : 'Fast' },
                        ].map(spec => (
                          <div key={spec.label} style={{
                            padding: '6px 8px', borderRadius: '6px',
                            background: 'var(--vs-bg-elevated)',
                            textAlign: 'center',
                          }}>
                            <p style={{ margin: 0, fontSize: '10px', color: 'var(--vs-text-muted)' }}>
                              {spec.label}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', fontWeight: 600, color: 'var(--vs-text-primary)' }}>
                              {spec.value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Tips */}
                      <div>
                        <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'var(--vs-text-secondary)' }}>
                          💡 Tips
                        </p>
                        {t.tips.map((tip, i) => (
                          <p key={i} style={{
                            margin: '0 0 4px', fontSize: '11px',
                            color: 'var(--vs-text-muted)', lineHeight: 1.5,
                          }}>
                            • {tip}
                          </p>
                        ))}
                      </div>

                      {/* Select button */}
                      <button
                        onClick={() => handleSelect(t)}
                        style={{
                          marginTop: '10px', width: '100%',
                          padding: '8px',
                          background: isActive
                            ? 'var(--bg-danger, #FCEBEB)'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          border: isActive ? '1px solid var(--border-danger)' : 'none',
                          borderRadius: '7px',
                          color: isActive ? 'var(--text-danger)' : '#fff',
                          fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {isActive ? '✕ Template Hataao' : `✓ ${t.name} Use Karo`}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* No template note */}
      {!activeTemplate && (
        <p style={{
          margin: 0, fontSize: '11px', textAlign: 'center',
          color: 'var(--vs-text-muted)', lineHeight: 1.5,
        }}>
          Template select karo ya skip karo — default 16:9, 1080p, MP4 use hoga
        </p>
      )}
    </div>
  );
}
