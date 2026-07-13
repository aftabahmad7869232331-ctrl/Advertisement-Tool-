import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { HomePage } from './components/home/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import VideoStudioPage from './features/vfx-studio/pages/VideoStudioPage';
import TemplatesPage from './pages/TemplatesPage';
import VideoPage from './pages/VideoPage';
import GalleryPage from './pages/GalleryPage';
import GrowthPage from './pages/GrowthPage';
import PremiumPage from './pages/PremiumPage';
import SupportPage from './pages/SupportPage';
import LoginPage from './pages/LoginPage';
import AnimationPage from './pages/AnimationPage';
import CaptionPage from './pages/CaptionPage';
import { Navbar } from './components/Navbar';
import { TopBar } from './components/TopBar';
import { INITIAL_CAMPAIGNS } from './data';
import {
  getCampaignsFromDb,
  saveCampaignToDb,
  updateCampaignStatusInDb,
} from './localStore';
import type { Campaign, ViewType } from './types';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface AppToast {
  id: number;
  message: string;
  type: ToastType;
}

const VIEW_PATHS: Record<ViewType, string> = {
  dashboard: '/', projects: '/projects', studio: '/studio', flyer: '/templates',
  ads: '/ads', video: '/video', caption: '/language', analytics: '/analytics',
  gallery: '/gallery', growth: '/growth', premium: '/premium', support: '/support',
  login: '/login', animation: '/motion',
};

const PATH_VIEWS = Object.fromEntries(
  Object.entries(VIEW_PATHS).map(([view, path]) => [path, view]),
) as Record<string, ViewType>;

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeView = PATH_VIEWS[location.pathname] ?? 'dashboard';
  const setActiveView = (view: ViewType) => navigate(VIEW_PATHS[view]);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [toast, setToast] = useState<AppToast | null>(null);

  useEffect(() => {
    let active = true;
    void getCampaignsFromDb().then((savedCampaigns) => {
      if (active && savedCampaigns.length > 0) setCampaigns(savedCampaigns);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const triggerToast = (message: string, type: ToastType = 'info') => {
    setToast({ id: Date.now(), message, type });
  };

  const handleToggleStatus = (campaignId: string) => {
    const campaign = campaigns.find((item) => item.id === campaignId);
    if (!campaign) {
      triggerToast('Campaign could not be found.', 'error');
      return;
    }
    const nextStatus = campaign.status === 'Active' ? 'Paused' : 'Active';
    setCampaigns((currentCampaigns) =>
      currentCampaigns.map((campaign) =>
        campaign.id === campaignId
          ? {
              ...campaign,
              status: nextStatus,
              updatedAt: new Date(),
            }
          : campaign,
      ),
    );
    void updateCampaignStatusInDb(campaignId, nextStatus).then(
      () => triggerToast(`Campaign ${nextStatus.toLowerCase()}.`, 'success'),
      () => triggerToast('Campaign changed for this session, but could not be saved.', 'warning'),
    );
  };

  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setActiveView('flyer');
  };

  const handleNavigateToCreate = () => {
    setActiveView('studio');
  };

  return (
    <div className="app-root relative">
      {/* Cosmic Nebula Background & Starry Particles */}
      <div className="galaxy-nebula-bg" />
      <div className="galaxy-particles" />

      <header className="site-header-shell">
        <TopBar
          activeView={activeView}
          setActiveView={setActiveView}
        />

        <Navbar
          activeView={activeView}
          setActiveView={setActiveView}
        />
      </header>

      <main className="app-main">
        {activeView === 'dashboard' ? (
          <HomePage
            campaigns={campaigns}
            onSelectCampaign={handleSelectCampaign}
            onNavigateToCreate={handleNavigateToCreate}
            onToggleStatus={handleToggleStatus}
          />
        ) : activeView === 'projects' ? (
          <ProjectsPage />
        ) : activeView === 'studio' ? (
          <VideoStudioPage />
        ) : activeView === 'flyer' || activeView === 'ads' ? (
          <TemplatesPage
            campaigns={campaigns}
            selectedCampaign={selectedCampaign}
            onSaveCampaign={(campaign) => {
              setCampaigns((currentCampaigns) => {
                const existingIndex = currentCampaigns.findIndex(
                  (item) => item.id === campaign.id,
                );

                if (existingIndex === -1) {
                  return [campaign, ...currentCampaigns];
                }

                return currentCampaigns.map((item) =>
                  item.id === campaign.id ? campaign : item,
                );
              });
              setSelectedCampaign(campaign);
              void saveCampaignToDb(campaign).then(
                () => triggerToast('Campaign saved.', 'success'),
                () => triggerToast('Campaign saved for this session only.', 'warning'),
              );
            }}
            onSelectCampaign={setSelectedCampaign}
            triggerToast={triggerToast}
          />
        ) : activeView === 'video' ? (
          <VideoPage setActiveView={setActiveView} />
        ) : activeView === 'gallery' ? (
          <GalleryPage />
        ) : activeView === 'growth' || activeView === 'analytics' ? (
          <GrowthPage />
        ) : activeView === 'premium' ? (
          <PremiumPage />
        ) : activeView === 'support' ? (
          <SupportPage triggerToast={triggerToast} />
        ) : activeView === 'login' ? (
          <LoginPage setActiveView={setActiveView} triggerToast={triggerToast} />
        ) : activeView === 'animation' ? (
          <AnimationPage />
        ) : activeView === 'caption' ? (
          <CaptionPage />
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

      {toast && (
        <div className="toast-container" role="status" aria-live="polite">
          <div key={toast.id} className={`app-toast app-toast--${toast.type}`}>
            <span className="app-toast__dot" aria-hidden="true" />
            <span>{toast.message}</span>
            <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">×</button>
          </div>
        </div>
      )}
    </div>
  );
}




