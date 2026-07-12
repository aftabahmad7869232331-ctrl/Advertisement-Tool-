import { useState } from 'react';
import { HomePage } from './components/home/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import { Navbar } from './components/Navbar';
import { TopBar } from './components/TopBar';
import { INITIAL_CAMPAIGNS } from './data';
import type { Campaign, ViewType } from './types';

export function App() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);

  const handleToggleStatus = (campaignId: string) => {
    setCampaigns((currentCampaigns) =>
      currentCampaigns.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              status: campaign.status === 'Active' ? 'Paused' : 'Active',
              updatedAt: new Date(),
            }
          : campaign,
      ),
    );
  };

  const handleSelectCampaign = (_campaign: Campaign) => {
    setActiveView('projects');
  };

  const handleNavigateToCreate = () => {
    setActiveView('studio');
  };

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

      <main>
        {activeView === 'dashboard' ? (
          <HomePage
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
            onNavigateToCreate={handleNavigateToCreate}
            onToggleStatus={handleToggleStatus}
          />
        ) : activeView === 'projects' ? (
          <ProjectsPage />
        ) : (
          <section className="app-shell">
            <div className="status-card">
              <p className="eyebrow">Controlled migration</p>
              <h1>{activeView}</h1>
              <p>This page will be connected in its migration batch.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

