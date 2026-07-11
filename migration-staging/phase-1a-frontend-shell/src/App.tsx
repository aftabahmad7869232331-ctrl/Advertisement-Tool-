import React, { Suspense, lazy, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "./components/TopBar";
import { Navbar } from "./components/Navbar";
import { ViewType } from "./components/Sidebar";
import { INITIAL_CAMPAIGNS } from "./data";
import { Campaign } from "./types";
import { Database, CheckCircle2, AlertTriangle, Info, AlertOctagon } from "lucide-react";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useServiceWorker } from "./hooks/useServiceWorker";

const DashboardPage = lazy(() => import("./pages/Dashboard"));
const AdsPage = lazy(() => import("./pages/AdsPage"));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage"));
const VideoPage = lazy(() => import("./pages/VideoPage"));
const CaptionPage = lazy(() => import("./pages/CaptionPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const GrowthPage = lazy(() => import("./pages/GrowthPage"));
const PremiumPage = lazy(() => import("./pages/PremiumPage"));
const SupportPage = lazy(() => import("./pages/SupportPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AnimationPage = lazy(() => import("./pages/AnimationPage"));

function PageLoader() {
  return (
    <motion.div
      className="min-h-[360px] flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <motion.div
        className="rounded-2xl border border-amber-400/20 bg-black/50 px-6 py-5 text-xs font-bold uppercase tracking-[0.22em] text-amber-300 shadow-2xl backdrop-blur-xl"
        animate={{
          y: [0, -8, 0],
          boxShadow: [
            "0 0 0 rgba(245, 158, 11, 0)",
            "0 0 35px rgba(245, 158, 11, 0.25)",
            "0 0 0 rgba(245, 158, 11, 0)"
          ]
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Loading workspace
      </motion.div>
    </motion.div>
  );
}

const pageVariants = {
  initial: { opacity: 0, y: 24, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -18, scale: 0.985 }
};

export default function App() {
  const isOnline = useOnlineStatus();
  const { isReady: isOfflineReady } = useServiceWorker();
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" | "warning" } | null>(null);
  const toastTimerRef = useRef<number | undefined>(undefined);

  const triggerToast = useCallback((msg: string, type: "success" | "error" | "info" | "warning" = "info") => {
    if (toastTimerRef.current !== undefined) window.clearTimeout(toastTimerRef.current);
    setToast({ msg, type });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = undefined;
    }, 3500);
  }, []);

  useEffect(() => () => {
    if (toastTimerRef.current !== undefined) window.clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        setIsLoadingCampaigns(true);
        const { getCampaignsFromDb } = await import("./localStore");
        const data = await getCampaignsFromDb();
        setCampaigns(data);
      } catch (err) {
        console.error("Failed to load campaigns:", err);
      } finally {
        setIsLoadingCampaigns(false);
      }
    }

    // The dashboard can render immediately from local seed data. Hydrate cloud
    // data only after the browser has completed its first paint, keeping the
    // Firebase SDK off the critical loading path.
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const idleHandle = idleWindow.requestIdleCallback?.(
      () => void loadCampaigns(),
      { timeout: 2_000 },
    );
    const timeoutHandle = idleHandle === undefined
      ? window.setTimeout(() => void loadCampaigns(), 500)
      : undefined;

    return () => {
      if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, []);

  const handleToggleStatus = async (id: string) => {
    let nextStatus: "Active" | "Paused" = "Active";

    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          nextStatus = c.status === "Active" ? "Paused" : "Active";
          return { ...c, status: nextStatus };
        }
        return c;
      })
    );

    try {
      const { updateCampaignStatusInDb } = await import("./localStore");
      await updateCampaignStatusInDb(id, nextStatus);
    } catch (err) {
      console.error("Failed to save status update locally:", err);
    }
  };

  const handleSelectCampaign = (camp: Campaign) => {
    setSelectedCampaign(camp);
    setActiveView("flyer");
  };

  const handleSetSelectedCampaign = (camp: Campaign | null) => {
    setSelectedCampaign(camp);
  };

  const handleNavigateToCreate = () => {
    setSelectedCampaign(null);
    setActiveView("flyer");
  };

  const handleSaveCampaign = async (savedCampaign: Campaign) => {
    setCampaigns((prev) => {
      const exists = prev.some((c) => c.id === savedCampaign.id);
      return exists
        ? prev.map((c) => (c.id === savedCampaign.id ? savedCampaign : c))
        : [savedCampaign, ...prev];
    });

    setSelectedCampaign(savedCampaign);

    try {
      const { saveCampaignToDb } = await import("./localStore");
      await saveCampaignToDb(savedCampaign);
    } catch (err) {
      console.error("Failed to save campaign locally:", err);
    }
  };

  const isDashboardView = activeView === "dashboard";

  const renderActivePage = () => {
    if (activeView === "dashboard") {
      return (
        <DashboardPage
          campaigns={campaigns}
          onSelectCampaign={handleSelectCampaign}
          onNavigateToCreate={handleNavigateToCreate}
          onToggleStatus={handleToggleStatus}
        />
      );
    }

    if (activeView === "flyer") {
      return (
        <TemplatesPage
          campaigns={campaigns}
          onSaveCampaign={handleSaveCampaign}
          selectedCampaign={selectedCampaign}
          onSelectCampaign={handleSetSelectedCampaign}
          triggerToast={triggerToast}
        />
      );
    }

    if (activeView === "ads") {
      return (
        <AdsPage
          campaigns={campaigns}
          onSaveCampaign={handleSaveCampaign}
          selectedCampaign={selectedCampaign}
          onSelectCampaign={handleSetSelectedCampaign}
          triggerToast={triggerToast}
        />
      );
    }

    if (activeView === "video") return <VideoPage setActiveView={setActiveView} />;
    if (activeView === "caption") return <CaptionPage />;
    if (activeView === "analytics") return <AnalyticsPage campaigns={campaigns} />;
    if (activeView === "projects") return <ProjectsPage />;
    if (activeView === "studio") return <StudioPage setActiveView={setActiveView} />;
    if (activeView === "gallery") return <GalleryPage />;
    if (activeView === "growth") return <GrowthPage />;
    if (activeView === "premium") return <PremiumPage />;
    if (activeView === "support") return <SupportPage triggerToast={triggerToast} />;
    if (activeView === "animation") return <AnimationPage />;

    if (activeView === "login") {
      return <LoginPage setActiveView={setActiveView} triggerToast={triggerToast} />;
    }

    return null;
  };

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-x-hidden transition-all duration-500 selection:bg-[var(--primary-color)]/30 selection:text-[var(--text-body)]"
      style={{
        background: "var(--page-theme-background, var(--bg-body))",
        color: "var(--text-body)",
        fontFamily: "var(--font-family-current)"
      }}
    >
      <motion.div
        className="pointer-events-none fixed inset-0 z-0 opacity-70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-0 -right-32 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      </motion.div>

      <motion.div
        className={`fixed left-3 bottom-3 z-50 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-xl backdrop-blur-xl ${
          isOnline
            ? "border-emerald-400/25 bg-emerald-950/80 text-emerald-300"
            : "border-amber-400/25 bg-amber-950/90 text-amber-200"
        }`}
        role="status"
        initial={{ opacity: 0, x: -24, y: 24 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {isOnline ? (isOfflineReady ? "Online • Offline ready" : "Online") : "Offline • Cached mode"}
      </motion.div>

      <motion.div
        className="relative z-[100]"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <TopBar activeView={activeView} setActiveView={setActiveView} />
      </motion.div>

      <motion.div
        className="relative z-40"
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
      >
        <Navbar activeView={activeView} setActiveView={setActiveView} />
      </motion.div>

      <motion.main
        className="relative z-10 flex-1 w-full min-h-[120vh] max-w-none mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-8 sm:py-10 lg:py-12 pb-20 sm:pb-24"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              className="min-h-[120vh] w-full"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {renderActivePage()}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </motion.main>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 pointer-events-auto"
            initial={{ opacity: 0, x: 90, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 90, scale: 0.92 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <motion.div
              className="px-5 py-4 rounded-2xl bg-black/95 border border-amber-500/30 text-xs font-bold text-gray-200 shadow-2xl flex items-center gap-3 max-w-sm backdrop-blur-xl"
              animate={{
                boxShadow: [
                  "0 20px 55px rgba(0,0,0,0.45)",
                  "0 20px 70px rgba(245,158,11,0.22)",
                  "0 20px 55px rgba(0,0,0,0.45)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {toast.type === "success" && <CheckCircle2 size={16} className="text-emerald-400" />}
              {toast.type === "error" && <AlertTriangle size={16} className="text-red-400" />}
              {toast.type === "info" && <Info size={16} className="text-blue-400" />}
              {toast.type === "warning" && <AlertOctagon size={16} className="text-amber-500" />}
              <span>{toast.msg}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.footer
        className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 gap-2 sm:gap-3 mt-auto"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.18 }}
      >
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block animate-pulse" />
            <span>Brick-Maker Studio • Advertisement & Marketing Platform © 2026</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
            <Database size={10} className="animate-pulse" />
            <span>Local workspace active • Cloud sync available after hosting</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="hover:text-gray-400 cursor-pointer transition-colors">Security Protocol</span>
          <span className="hover:text-gray-400 cursor-pointer transition-colors">Client SLAs</span>
          <span className="hover:text-gray-400 cursor-pointer transition-colors">Specs API v3.5</span>
        </div>
      </motion.footer>
    </div>
  );
}
