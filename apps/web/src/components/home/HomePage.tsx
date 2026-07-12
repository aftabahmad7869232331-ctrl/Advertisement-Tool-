import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CheckCircle2,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Layers,
  Pause,
  Play,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Video
} from "lucide-react";
import type { Campaign } from "../../types";
import { useHomePage, type HomeProjectItem, type HomeProjectTab } from "../../hooks/useHomePage";
import StudioCoreCard from "./StudioCoreCard";
import "../../styles/glass.css";

interface HomePageProps {
  campaigns: Campaign[];
  onSelectCampaign: (camp: Campaign) => void;
  onNavigateToCreate: () => void;
  onToggleStatus: (id: string) => void;
}

const categoryIcons = {
  BarChart3,
  BookOpen,
  Briefcase,
  CreditCard,
  Image: ImageIcon,
  Layers,
  Shield: ShieldCheck,
  Sparkles
};

const tabs: { id: HomeProjectTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "prebuilt", label: "Prebuilt" }
];

function ProjectCard({
  project,
  onSelectCampaign,
  onNavigateToCreate,
  onToggleStatus
}: {
  project: HomeProjectItem;
  onSelectCampaign: (camp: Campaign) => void;
  onNavigateToCreate: () => void;
  onToggleStatus: (id: string) => void;
}) {
  const isActive = project.status.toLowerCase() === "active";

  return (
    <article className="glass-prism glass-prism-hover rounded-lg p-4 sm:p-5">
      <div className="mb-3 sm:mb-4 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface)] text-[var(--primary-color)] sm:h-11 sm:w-11">
          {project.isPrebuilt ? <FileText size={18} /> : <ImageIcon size={18} />}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase sm:px-2.5 sm:py-1 ${isActive ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}>
          {project.isPrebuilt ? "Template" : project.status}
        </span>
      </div>

      <h3 className="line-clamp-1 text-base font-black text-[var(--text-body)] sm:text-lg">{project.title}</h3>
      <p className="mt-1.5 line-clamp-2 min-h-[40px] text-xs leading-5 text-[var(--text-muted)] sm:mt-2 sm:text-sm sm:leading-6">{project.description}</p>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--border-soft)] pt-3 text-[11px] sm:mt-5 sm:pt-4 sm:text-xs">
        <span className="font-bold uppercase tracking-widest text-[var(--text-subtle)]">{project.impressions} views</span>
        {project.rawCampaign ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => onToggleStatus(project.rawCampaign!.id)} className="inline-flex items-center gap-1.5 font-bold text-[var(--primary-color)]">
              {isActive ? <Pause size={12} /> : <Play size={12} />}
              {isActive ? "Pause" : "Activate"}
            </button>
            <button onClick={() => onSelectCampaign(project.rawCampaign!)} className="font-bold text-[var(--text-muted)] hover:text-[var(--primary-color)]">
              Edit
            </button>
          </div>
        ) : (
          <button onClick={onNavigateToCreate} className="inline-flex items-center gap-1.5 font-bold text-[var(--primary-color)]">
            Use <ArrowRight size={12} />
          </button>
        )}
      </div>
    </article>
  );
}

export function HomePage({ campaigns, onSelectCampaign, onNavigateToCreate, onToggleStatus }: HomePageProps) {
  const home = useHomePage(campaigns);

  return (
    <div
      className="home-depth-scene relative space-y-16 overflow-hidden text-[var(--text-body)] sm:space-y-20"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background: "radial-gradient(700px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(248, 180, 0, 0.05), transparent 78%)"
        }}
      />

      <section className="relative grid min-h-[640px] grid-cols-1 items-center gap-8 py-8 sm:min-h-[700px] sm:py-10 lg:min-h-[calc(100vh-150px)] lg:grid-cols-12 lg:gap-12 lg:py-12 xl:min-h-[760px]" aria-labelledby="hero-heading">
        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-[var(--bg-panel)]/70 px-3.5 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[var(--primary-color)] sm:px-4 sm:py-2" role="status">
            <Sparkles size={13} aria-hidden="true" />
            Version 4.0 Platform Release
          </div>

          <h1 id="hero-heading" className="mt-5 max-w-4xl text-[42px] font-black leading-[1.02] text-[var(--text-body)] sm:mt-6 sm:text-5xl md:text-6xl lg:text-[68px] xl:text-[76px]">
            Build Your Brand.
            <span className="block text-gradient-shimmer">Create Without Limits.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--text-muted)] sm:text-lg sm:leading-8 lg:text-xl">
            Everything you need to create professional marketing materials, promotional videos, business designs, branding assets, and campaign content in one workspace.
          </p>

          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
            <button onClick={onNavigateToCreate} className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm sm:px-6 sm:py-3.5" aria-label="Start creating new campaign">
              <Plus size={17} aria-hidden="true" />
              Start Creating
            </button>
            <button
              onClick={() => document.getElementById("home-projects-section")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-ghost inline-flex items-center gap-2 px-5 py-3 text-sm font-bold sm:px-6 sm:py-3.5"
              aria-label="Explore templates section"
            >
              Explore Templates
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:mt-10 sm:gap-4 sm:grid-cols-4" role="region" aria-label="Platform statistics">
            {[
              ["Active", home.stats.activeCampaigns],
              ["Impressions", home.stats.impressions],
              ["Clicks", home.stats.clicks],
              ["Tool Kits", home.stats.templateCount]
            ].map(([label, value]) => (
              <div key={label} className="glass-prism-media rounded-lg p-4">
                <div className="text-xl font-black text-[var(--text-body)] sm:text-2xl">{value}</div>
                <div className="mt-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-subtle)]">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="lg:col-span-6"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          <StudioCoreCard />
        </motion.div>
      </section>

      <section className="relative overflow-hidden border-y border-[var(--border-soft)] py-6">
        <div className="marquee-track gap-4">
          {[...home.clientLogos, ...home.clientLogos].map((client, index) => (
            <div key={`${client.name}-${index}`} className="glass-prism-media min-w-56 rounded-lg px-5 py-3">
              <div className="text-xs font-black uppercase tracking-widest text-[var(--text-body)]">{client.name}</div>
              <div className="mt-1 text-[10px] text-[var(--text-subtle)]">{client.slogan}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="popular-categories-section" className="relative" aria-labelledby="categories-heading">
        <div className="mb-4 flex items-end justify-between gap-3 sm:mb-6">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary-color)]">Template tools</div>
            <h2 id="categories-heading" className="mt-2 text-2xl font-black text-[var(--text-body)] sm:text-3xl">Popular Categories</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {home.popularCategories.map((category) => {
            const Icon = categoryIcons[category.icon as keyof typeof categoryIcons] || FileText;
            return (
              <button key={category.name} onClick={onNavigateToCreate} className="glass-prism glass-prism-hover rounded-lg p-4 text-left sm:p-5" aria-label={`Browse ${category.name} templates`}>
                <Icon className="text-[var(--primary-color)]" size={22} aria-hidden="true" />
                <div className="mt-4 text-sm font-black text-[var(--text-body)] sm:mt-5 sm:text-base">{category.name}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-widest text-[var(--text-subtle)]">{category.count}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section id="home-projects-section" className="relative" aria-labelledby="projects-heading">
        <div className="mb-4 flex flex-col justify-between gap-3 lg:flex-row lg:items-end sm:mb-5">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-[var(--primary-color)]">Project workspace</div>
            <h2 id="projects-heading" className="mt-2 text-2xl font-black text-[var(--text-body)] sm:text-3xl">Recent Projects</h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" size={15} aria-hidden="true" />
              <input
                value={home.searchQuery}
                onChange={(event) => home.setSearchQuery(event.target.value)}
                placeholder="Search projects"
                className="input-dark w-full min-w-56 pl-9 sm:min-w-64"
                aria-label="Search projects"
              />
            </label>
            <div className="flex rounded-lg border border-[var(--border-soft)] bg-[var(--bg-surface)] p-1" role="tablist" aria-label="Project filters">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => home.setActiveTab(tab.id)}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-black uppercase tracking-widest transition sm:px-4 sm:py-2 sm:text-xs ${home.activeTab === tab.id ? "bg-[var(--primary-color)] text-[var(--btn-text)]" : "text-[var(--text-muted)] hover:text-[var(--text-body)]"}`}
                  role="tab"
                  aria-selected={home.activeTab === tab.id}
                  aria-controls="projects-grid"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div id="projects-grid" className="grid grid-cols-1 gap-3 lg:grid-cols-3 sm:gap-4" role="tabpanel">
          {home.filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onNavigateToCreate={onNavigateToCreate}
              onSelectCampaign={onSelectCampaign}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      </section>

      <section className="relative grid grid-cols-1 gap-3 lg:grid-cols-4 sm:gap-4" aria-labelledby="why-choose-heading">
        <div className="col-span-full">
          <h2 id="why-choose-heading" className="sr-only">Why Choose Brick-Maker Studio</h2>
        </div>
        {home.whyChooseItems.map((item) => (
          <div key={item.title} className="glass-prism-media rounded-lg p-4 sm:p-5">
            <div className="inline-flex rounded-full bg-[var(--primary-color)]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[var(--primary-color)] sm:px-2.5 sm:py-1">
              {item.badge}
            </div>
            <h3 className="mt-3 text-base font-black text-[var(--text-body)] sm:mt-4 sm:text-lg">{item.title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-[var(--text-muted)] sm:mt-2 sm:text-sm sm:leading-6">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="glass-prism-gold relative rounded-[18px] p-6 sm:p-8 sm:p-10" aria-labelledby="cta-heading">
        <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[var(--primary-color)] sm:text-xs">
              <CheckCircle2 size={15} aria-hidden="true" />
              Home tool created
            </div>
            <h2 id="cta-heading" className="mt-2 text-2xl font-black text-[var(--text-body)] sm:mt-3 sm:text-3xl sm:text-4xl">Create a campaign without restarting the app.</h2>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--text-muted)] sm:mt-3 sm:text-sm sm:leading-7">
              The home page is now isolated as a reusable component with a dedicated hook, so edits stay cleaner and easier to debug.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <button onClick={onNavigateToCreate} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:px-6 sm:py-3 sm:text-sm" aria-label="Open studio to create campaign">
              Open Studio
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
