// ============================================================
// LANGUAGE SELECTOR COMPONENT - 30 Languages
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';
import { useLanguage } from '../../hooks/useLanguage';

interface LanguageSelectorProps {
  onlyVoiceSupported?: boolean;
  compact?: boolean;
}

export function LanguageSelector({ onlyVoiceSupported = false, compact = false }: LanguageSelectorProps) {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = onlyVoiceSupported
    ? SUPPORTED_LANGUAGES.filter(l => l.voiceSupported)
    : SUPPORTED_LANGUAGES;

  const filtered = languages.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false); setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: compact ? '6px 10px' : '8px 14px',
          background: 'var(--vs-bg-elevated)',
          border: `1px solid ${isOpen ? 'var(--vs-primary)' : 'var(--vs-border)'}`,
          borderRadius: '8px', cursor: 'pointer',
          color: 'var(--vs-text-primary)', fontSize: '13px',
          transition: 'all var(--vs-transition-fast)',
          minWidth: compact ? 'auto' : '160px',
        }}
      >
        <span style={{ fontSize: '18px' }}>{currentLanguage.flag}</span>
        {!compact && (
          <>
            <span style={{ flex: 1, textAlign: 'left' }}>{currentLanguage.name}</span>
            <span style={{ color: 'var(--vs-text-muted)', fontSize: '10px' }}>
              {isOpen ? '▲' : '▼'}
            </span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="vs-animate-scale-in" style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          width: '240px', maxHeight: '320px',
          background: 'var(--vs-bg-card)',
          border: '1px solid var(--vs-border)',
          borderRadius: '10px',
          boxShadow: 'var(--vs-shadow-lg)',
          zIndex: 100,
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Search */}
          <div style={{ padding: '8px' }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search languages..."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'var(--vs-bg-elevated)',
                border: '1px solid var(--vs-border)',
                borderRadius: '6px', padding: '6px 10px',
                color: 'var(--vs-text-primary)', fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Language list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--vs-text-muted)', fontSize: '13px' }}>
                No languages found
              </div>
            )}
            {filtered.map(lang => (
              <button key={lang.code}
                onClick={() => { changeLanguage(lang.code); setIsOpen(false); setSearch(''); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', border: 'none', cursor: 'pointer',
                  background: lang.code === currentLanguage.code ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: lang.code === currentLanguage.code ? 'var(--vs-primary)' : 'var(--vs-text-primary)',
                  fontSize: '13px', textAlign: 'left',
                  transition: 'background var(--vs-transition-fast)',
                }}
                onMouseEnter={e => { if (lang.code !== currentLanguage.code) e.currentTarget.style.background = 'var(--vs-bg-hover)'; }}
                onMouseLeave={e => { if (lang.code !== currentLanguage.code) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>{lang.flag}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{lang.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--vs-text-muted)' }}>{lang.nativeName}</div>
                </div>
                {lang.code === currentLanguage.code && (
                  <span style={{ color: 'var(--vs-primary)', fontSize: '12px' }}>✓</span>
                )}
                {!lang.voiceSupported && (
                  <span title="No voice support" style={{ fontSize: '10px', color: 'var(--vs-text-muted)' }}>🔇</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ padding: '8px 12px', borderTop: '1px solid var(--vs-border)', fontSize: '11px', color: 'var(--vs-text-muted)' }}>
            {filtered.length} of {languages.length} languages
          </div>
        </div>
      )}
    </div>
  );
}
