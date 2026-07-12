// ============================================================
// TABS COMPONENT
// ============================================================

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

export function Tabs({ tabs, activeTab, onChange, variant = 'default', size = 'md' }: TabsProps) {
  const sizeClasses = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };

  const baseTabStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '6px',
    border: 'none', cursor: 'pointer', fontWeight: 500,
    transition: 'all 150ms ease', borderRadius: '8px',
    padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '10px 20px' : '8px 16px',
    fontSize: size === 'sm' ? '12px' : size === 'lg' ? '16px' : '14px',
  };

  return (
    <div style={{ display: 'flex', gap: '4px', background: 'var(--vs-bg-secondary)', borderRadius: '10px', padding: '4px' }}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            style={{
              ...baseTabStyle,
              background: isActive ? 'var(--vs-primary)' : 'transparent',
              color: isActive ? '#fff' : 'var(--vs-text-secondary)',
              opacity: tab.disabled ? 0.4 : 1,
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {tab.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--vs-primary)',
                color: '#fff', borderRadius: '10px', padding: '1px 6px',
                fontSize: '10px', fontWeight: 700, minWidth: '18px', textAlign: 'center',
              }}>
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
