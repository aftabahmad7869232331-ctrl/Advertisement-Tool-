import { useMemo, useState } from "react";
import type { Campaign } from "../types";

export type HomeProjectTab = "all" | "live" | "prebuilt";

export interface HomeProjectItem {
  id: string;
  title: string;
  description: string;
  category: string;
  impressions: string;
  status: string;
  isPrebuilt: boolean;
  rawCampaign?: Campaign;
}

export const HOME_CLIENT_LOGOS = [
  { name: "OBSIDIAN LABS", slogan: "Structural Integrity" },
  { name: "GOLD-VEIN ATELIER", slogan: "Luxury Masonry" },
  { name: "FORMWORK GLOBAL", slogan: "Architectural Precision" },
  { name: "APEX MONUMENTS", slogan: "Bespoke Facades" },
  { name: "COSMIC PAVILIONS", slogan: "Sustainable Engineering" },
  { name: "INTEGRITY BRICKS", slogan: "Timeless Craft" }
];

export const HOME_WHY_CHOOSE_ITEMS = [
  {
    title: "Professional Templates",
    description: "Handcrafted designs optimized for real estate, schools, restaurants, retail, and enterprise campaigns.",
    badge: "Curated"
  },
  {
    title: "Fast Design Workflow",
    description: "A focused editor flow for creating, styling, saving, and revisiting campaigns without clutter.",
    badge: "Productive"
  },
  {
    title: "Premium Quality Output",
    description: "Polished ad layouts with strong hierarchy, print-ready proportions, and campaign-friendly copy blocks.",
    badge: "Ultra HD"
  },
  {
    title: "Local Workspace",
    description: "Campaigns stay organized in this browser and are ready for cloud wiring when the platform is hosted.",
    badge: "Local"
  }
];

export const HOME_POPULAR_CATEGORIES = [
  { name: "Business Promotion", count: "142 Templates", icon: "Briefcase" },
  { name: "School Admission", count: "89 Templates", icon: "BookOpen" },
  { name: "Restaurant", count: "115 Templates", icon: "CreditCard" },
  { name: "Real Estate", count: "204 Templates", icon: "Layers" },
  { name: "Healthcare", count: "73 Templates", icon: "Shield" },
  { name: "Festival Offers", count: "96 Templates", icon: "Sparkles" },
  { name: "Corporate", count: "158 Templates", icon: "BarChart3" },
  { name: "Retail", count: "110 Templates", icon: "Image" }
];

const PRE_BUILT_PROJECTS: HomeProjectItem[] = [
  {
    id: "sample-flyer",
    title: "Business Flyer",
    description: "Obsidian facade release blueprint layout.",
    category: "Business Promotion",
    impressions: "1.2K",
    status: "Active",
    isPrebuilt: true
  },
  {
    id: "sample-brochure",
    title: "Corporate Brochure",
    description: "Enterprise structural capabilities presentation.",
    category: "Corporate",
    impressions: "2.5K",
    status: "Active",
    isPrebuilt: true
  },
  {
    id: "sample-menu",
    title: "Restaurant Menu",
    description: "Premium dining catalog and offer layout.",
    category: "Restaurant",
    impressions: "840",
    status: "Active",
    isPrebuilt: true
  },
  {
    id: "sample-school",
    title: "School Admission",
    description: "Clean admission announcement with trust-focused hierarchy.",
    category: "School Admission",
    impressions: "1.9K",
    status: "Active",
    isPrebuilt: true
  }
];

const getCampaignText = (campaign: Campaign, key: string, fallback = "") => {
  const value = (campaign as any)[key];
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
};

const getCampaignNumber = (campaign: Campaign, key: string) => {
  const value = (campaign as any)[key];
  return typeof value === "number" ? value : 0;
};

const normalizeStatus = (status: unknown) => String(status || "").toLowerCase();

export function useHomePage(campaigns: Campaign[]) {
  const [activeTab, setActiveTab] = useState<HomeProjectTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const liveProjects = useMemo<HomeProjectItem[]>(
    () =>
      campaigns.map((campaign) => ({
        id: campaign.id,
        title: getCampaignText(campaign, "productName", campaign.name),
        description: getCampaignText(campaign, "description", "Custom campaign layout ready for editing."),
        category: (campaign as any).pamphlet?.ctaTitle || "Flyer Designer",
        impressions: getCampaignNumber(campaign, "impressions").toLocaleString(),
        status: String(campaign.status),
        isPrebuilt: false,
        rawCampaign: campaign
      })),
    [campaigns]
  );

  const displayedProjects = useMemo(() => {
    if (activeTab === "live") return liveProjects;
    if (activeTab === "prebuilt") return PRE_BUILT_PROJECTS;
    return [...liveProjects, ...PRE_BUILT_PROJECTS];
  }, [activeTab, liveProjects]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return displayedProjects;
    return displayedProjects.filter((project) =>
      [project.title, project.description, project.category, project.status]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [displayedProjects, searchQuery]);

  const stats = useMemo(() => {
    const activeCampaigns = campaigns.filter((campaign) => normalizeStatus(campaign.status) === "active").length;
    const impressions = campaigns.reduce((sum, campaign) => sum + getCampaignNumber(campaign, "impressions"), 0);
    const clicks = campaigns.reduce((sum, campaign) => sum + getCampaignNumber(campaign, "clicks"), 0);
    return {
      activeCampaigns,
      impressions: impressions.toLocaleString(),
      clicks: clicks.toLocaleString(),
      templateCount: PRE_BUILT_PROJECTS.length + HOME_POPULAR_CATEGORIES.length
    };
  }, [campaigns]);

  return {
    activeTab,
    clientLogos: HOME_CLIENT_LOGOS,
    filteredProjects,
    popularCategories: HOME_POPULAR_CATEGORIES,
    searchQuery,
    setActiveTab,
    setSearchQuery,
    stats,
    whyChooseItems: HOME_WHY_CHOOSE_ITEMS
  };
}
