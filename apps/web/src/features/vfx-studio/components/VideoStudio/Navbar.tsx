// ============================================================
// NAVBAR COMPONENT
// ============================================================
// Fix: pehle koi Navbar component exist hi nahi karta tha, isliye
// "voice button click -> Voice Lab open" wala flow tutta tha.
// Ye component VideoStudioContext se seedha activeTab/selectedLanguage
// state use karta hai (koi duplicate/local state nahi) — isi wajah se
// glitch hota tha jab alag-alag local state se tabs control hote the.
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { useVideoStudioContext } from '../../context/VideoStudioContext';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  onOpenSettings?: () => void;
}

export function Navbar({ onOpenSettings }: NavbarProps) {
  const { activeTab, setActiveTab, generationStatus, generationProgress } = useVideoStudioContext();
  type StudioUser = {
    photoURL?: string | null;
    email?: string | null;
  };

  const getStudioUser = (): StudioUser | null => null;
  const user = getStudioUser();

  const authEnabled = Boolean(
    import.meta.env.VITE_VFX_AUTH_ENABLED
  );

  const signOutUser = async (): Promise<void> => {
    return Promise.resolve();
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Settings dropdown ke bahar click karne par close ho jaye
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navButtons: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: 'prompts', label: 'Prompts', icon: '📝' },
    { id: 'voice', label: 'Voice', icon: '🎙️' },
    { id: 'captions', label: 'Captions', icon: '💬' },
    { id: 'bgremove', label: 'BG Remove', icon: '🪄' },
    { id: 'export', label: 'Export', icon: '⬇️' },
  ];

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'var(--vs-bg-secondary)',
        borderBottom: '1px solid var(--vs-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '22px' }}>🎬</span>
        <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--vs-text-primary)' }}>
          Video Studio
        </span>
      </div>

      {/* Center nav buttons — Voice / Captions / Prompts / Export */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {navButtons.map(btn => {
          const isActive = activeTab === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => setActiveTab(btn.id)}
              aria-pressed={isActive}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: isActive ? 'var(--vs-primary)' : 'transparent',
                color: isActive ? '#fff' : 'var(--vs-text-secondary)',
                transition: 'all 150ms ease',
              }}
            >
              <span>{btn.icon}</span>
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Right side: language, status, settings/edit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Language selector — same context-driven hook, so selecting
            a language here is instantly reflected in Voice Lab & Captions */}
        <LanguageSelector compact />

        <div style={{ width: '1px', height: '26px', background: 'var(--vs-border)' }} />

        <div style={{ fontSize: '12px', minWidth: '90px', textAlign: 'right' }}>
          {generationStatus === 'ready' && <span style={{ color: 'var(--vs-success)' }}>✓ Ready</span>}
          {generationStatus === 'generating' && (
            <span style={{ color: 'var(--vs-primary)' }}>⚡ {Math.round(generationProgress)}%</span>
          )}
          {generationStatus === 'error' && <span style={{ color: 'var(--vs-error)' }}>✗ Error</span>}
          {generationStatus === 'idle' && <span style={{ color: 'var(--vs-text-muted)' }}>Idle</span>}
        </div>

        {/* Settings / Edit button */}
        <div ref={settingsRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(o => !o);
            }}
            aria-haspopup="true"
            aria-expanded={settingsOpen}
            title="Settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              border: `1px solid ${settingsOpen ? 'var(--vs-primary)' : 'var(--vs-border)'}`,
              borderRadius: '8px',
              background: 'var(--vs-bg-elevated)',
              cursor: 'pointer',
              fontSize: '15px',
            }}
          >
            ⚙
          </button>

          {settingsOpen && (
            <div
              className="vs-animate-scale-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '200px',
                background: 'var(--vs-bg-card)',
                border: '1px solid var(--vs-border)',
                borderRadius: '10px',
                boxShadow: 'var(--vs-shadow-lg)',
                overflow: 'hidden',
                zIndex: 100,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab('export');
                  setSettingsOpen(false);
                }}
                style={menuItemStyle}
              >
                ⬇️ Export Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('voice');
                  setSettingsOpen(false);
                }}
                style={menuItemStyle}
              >
                🎙️ Voice Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('captions');
                  setSettingsOpen(false);
                }}
                style={menuItemStyle}
              >
                💬 Caption Settings
              </button>
              <button
                type="button"
                onClick={() => {
                  onOpenSettings?.();
                  setSettingsOpen(false);
                }}
                style={menuItemStyle}
              >
                🔧 App Preferences
              </button>
            </div>
          )}
        </div>

        {authEnabled && user && (
          <>
            <div style={{ width: '1px', height: '26px', background: 'var(--vs-border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
              ) : (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', background: 'var(--vs-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff',
                }}>
                  {(user.email ?? '?').charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => signOutUser()}
                title="Logout"
                style={{
                  fontSize: '12px', padding: '6px 10px', borderRadius: '8px',
                  border: '1px solid var(--vs-border)', background: 'var(--vs-bg-elevated)',
                  color: 'var(--vs-text-secondary)', cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '10px 14px',
  fontSize: '13px',
  border: 'none',
  background: 'transparent',
  color: 'var(--vs-text-primary)',
  cursor: 'pointer',
};

export default Navbar;


