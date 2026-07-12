// ============================================================
// LOADING SPINNER COMPONENT
// ============================================================

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  label?: string;
  fullScreen?: boolean;
}

const sizes = { sm: 16, md: 24, lg: 40, xl: 64 };

export function LoadingSpinner({ size = 'md', color, label, fullScreen }: LoadingSpinnerProps) {
  const px = sizes[size];

  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <svg
        width={px} height={px}
        viewBox="0 0 24 24"
        style={{ animation: 'vs-spin 0.8s linear infinite' }}
      >
        <circle cx="12" cy="12" r="10" fill="none"
          stroke={color ?? 'var(--vs-primary)'} strokeWidth="3"
          strokeDasharray="40 20" strokeLinecap="round" />
      </svg>
      {label && (
        <span style={{ color: 'var(--vs-text-secondary)', fontSize: '14px' }}>{label}</span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15,15,19,0.8)', backdropFilter: 'blur(4px)',
        zIndex: 'var(--vs-z-modal)' as never,
      }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function SkeletonLine({ width = '100%', height = 16 }: { width?: string | number; height?: number }) {
  return (
    <div className="vs-skeleton" style={{ width, height, borderRadius: '4px' }} />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}
