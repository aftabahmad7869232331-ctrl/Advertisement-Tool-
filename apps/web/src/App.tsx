import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TopBar } from './components/TopBar';
import type { ViewType } from './types';

export function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  return (
    <div className="app-root">
      <TopBar
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <main className="app-shell">
        <section className="status-card">
          <p className="eyebrow">Large-scale foundation</p>
          <h1>Bricks Maker Advertisement Studio</h1>
          <p>
            The web workspace is connected and ready for controlled migration.
          </p>
          <p>
            Active view: <strong>{activeView}</strong>
          </p>
        </section>
      </main>
    </div>
  );
}
