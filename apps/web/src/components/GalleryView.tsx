import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Filter,
  Heart,
  Eye,
  Download,
  Copy,
  Share2,
  Plus,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  Palette,
  FileText,
  Video as VideoIcon,
  Globe,
  Briefcase,
  Gem,
  Check,
  X,
  Sliders,
  Calendar,
  HardDrive,
  Info,
  SlidersHorizontal,
  FolderPlus,
  Play,
  Pause,
  CopyCheck,
  Layout,
  Layers,
  Sparkle,
  Bookmark,
  TrendingUp,
  Award,
  BookOpen,
  QrCode,
  CheckCircle2,
  Flame,
  User,
  Hash,
  ChevronRight,
  Maximize2,
  Trash2,
  ArrowRight,
  Menu,
  Zap,
  MousePointerClick
} from "lucide-react";
import { GalleryAsset } from "../types";
import { getGalleryAssetsFromDb, saveGalleryAssetToDb, deleteGalleryAssetFromDb } from "../localStore";

// ─────────────────────────────────────────────────────────────────────────────
// STATIC/MOCK DIGITAL ASSETS WITH RICH AND ACCURATE CATEGORIZATION
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_ASSETS: GalleryAsset[] = [
  // 🌐 WEBSITE DEMOS
  {
    id: "web-1",
    name: "Golden Stone Estate Landing",
    category: "Website Demos",
    subCategory: "Landing Pages",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
    resolution: "Responsive Web",
    size: "4.2 MB",
    createdAt: "2026-06-24",
    downloads: 1420,
    views: 5400,
    isPremium: true,
    isFavorite: true,
    tags: ["Landing Pages", "Real Estate", "Luxury", "Tailwind"],
    description: "An ultra-premium real estate landing page focusing on interlocking masonry blocks and sustainable concrete villas. Built with responsive grid animations and gorgeous dark typography.",
    colors: ["#F8B400", "#0B0B0B", "#1A1A1A", "#FDFBF7"],
    fonts: ["Outfit", "Inter"],
    demoUrl: "https://luxury-estate-demo.brickmaker.studio",
    codeSnippet: `import React from 'react';\n\nexport default function EstateHero() {\n  return (\n    <section className="min-h-screen bg-[#0B0B0B] text-[#FDFBF7] flex items-center justify-center relative px-6">\n      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(248,180,0,0.08)_0%,transparent_70%)]" />\n      <div className="max-w-5xl mx-auto text-center z-10 space-y-6">\n        <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase">Solid Luxury Structures</h1>\n        <p className="text-gray-400 max-w-xl mx-auto">Designing the solid future of smart luxury interlocking terracotta architectural modules.</p>\n        <button className="px-8 py-4 bg-[#F8B400] text-[#0B0B0B] font-bold tracking-widest uppercase rounded-xl hover:bg-[#FF9800] transition-all">Explore Pavilion</button>\n      </div>\n    </section>\n  );\n}`
  },
  {
    id: "web-2",
    name: "Corporate Masonry Portal",
    category: "Website Demos",
    subCategory: "Corporate Websites",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
    resolution: "Framer/HTML",
    size: "8.5 MB",
    createdAt: "2026-06-20",
    downloads: 850,
    views: 3100,
    isPremium: true,
    isFavorite: false,
    tags: ["Business Websites", "Corporate", "Clean", "Gold Accents"],
    description: "Enterprise SaaS interface showcase. Implements fluid responsive containers, beautiful geometric dividers, and custom interactive modular calculation spreadsheets.",
    colors: ["#10B981", "#080808", "#27272A", "#FAFAFA"],
    fonts: ["Space Grotesk", "Inter"],
    demoUrl: "https://corporate-portal.brickmaker.studio",
    codeSnippet: `// Corporate Container layout\nexport const Container = ({ children }) => {\n  return (\n    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">\n      <div className="border border-white/5 bg-[#090909] rounded-2xl p-8 shadow-2xl">\n        {children}\n      </div>\n    </div>\n  );\n}`
  },
  {
    id: "web-3",
    name: "Eco-Modular School Platform",
    category: "Website Demos",
    subCategory: "School Websites",
    thumbnail: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80",
    resolution: "Responsive Web",
    size: "6.1 MB",
    createdAt: "2026-06-18",
    downloads: 420,
    views: 1200,
    isPremium: false,
    isFavorite: false,
    tags: ["School Websites", "Education", "Eco-Friendly", "Green"],
    description: "An educational platform designed for sustainable architecture schools and modular construction bootcamps. Clear tables, curriculum maps, and visual material libraries.",
    colors: ["#10B981", "#047857", "#020604", "#ECFDF5"],
    fonts: ["Outfit", "Inter"]
  },
  {
    id: "web-4",
    name: "Gourmet Brick Hearth Menu",
    category: "Website Demos",
    subCategory: "Restaurant Websites",
    thumbnail: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
    resolution: "Interactive UI",
    size: "3.7 MB",
    createdAt: "2026-06-15",
    downloads: 910,
    views: 2800,
    isPremium: true,
    isFavorite: true,
    tags: ["Restaurant Websites", "Menu", "Luxury", "Dark Slate"],
    description: "Steakhouse and artisanal brick-oven pizzeria digital portal. Showcases high-contrast close-ups of premium hearth modular stone ovens, with custom booking and visual reservation slots.",
    colors: ["#FF9800", "#121212", "#0E0E0E", "#FFF"],
    fonts: ["Playfair Display", "Inter"]
  },

  // 🎬 VIDEOS
  {
    id: "vid-1",
    name: "Interlocking Terracotta Glide",
    category: "Videos",
    subCategory: "Promotional Videos",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
    resolution: "4K UHD • 60 FPS",
    size: "248 MB",
    createdAt: "2026-06-25",
    downloads: 1890,
    views: 7400,
    isPremium: true,
    isFavorite: true,
    duration: "0:10",
    tags: ["Promotional Videos", "Drone Glide", "Terracotta", "Golden Light"],
    description: "Elite 4K slow motion glide over custom terracotta modular block arrays. Beautiful golden sunset rays shimmering off precisely interlocking block channels."
  },
  {
    id: "vid-2",
    name: "Sustainable Villa Build Timelapse",
    category: "Videos",
    subCategory: "Business Videos",
    thumbnail: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
    resolution: "1080p • 30 FPS",
    size: "112 MB",
    createdAt: "2026-06-22",
    downloads: 1320,
    views: 4800,
    isPremium: true,
    isFavorite: false,
    duration: "0:30",
    tags: ["Business Videos", "Timelapse", "Construction", "Villa"],
    description: "Ultra high speed photographic assembly sequence of a two-story luxury modular family cottage built on-site within 24 hours using raw ecological bricks."
  },
  {
    id: "vid-3",
    name: "Golden Particles Brand Outro",
    category: "Videos",
    subCategory: "Outro Videos",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    resolution: "4K • 24 FPS",
    size: "84 MB",
    createdAt: "2026-06-19",
    downloads: 2450,
    views: 9200,
    isPremium: false,
    isFavorite: true,
    duration: "0:08",
    tags: ["Outro Videos", "Logo Reveal", "Gold Particles", "Logo"],
    description: "Spectacular cinematic end screen with golden sand particles consolidating into your custom business logo with gorgeous sub-surface scattering."
  },

  // 📄 TEMPLATES
  {
    id: "temp-1",
    name: "Modular Masonry Brand Brochure",
    category: "Templates",
    subCategory: "Brochures",
    thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
    resolution: "A4 Print Ready",
    size: "18.4 MB",
    createdAt: "2026-06-23",
    downloads: 1205,
    views: 4200,
    isPremium: true,
    isFavorite: true,
    tags: ["Brochures", "Print", "InDesign", "Corporate Guide"],
    description: "A gorgeous 16-page landscape brand showcase pamphlet. Complete grid layout, preconfigured typography scale, customizable color swatches, and structural layout grids.",
    colors: ["#F8B400", "#111111", "#F3F4F6"],
    fonts: ["Outfit", "Inter"]
  },
  {
    id: "temp-2",
    name: "Architectural Elite Business Card",
    category: "Templates",
    subCategory: "Business Cards",
    thumbnail: "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&q=80",
    resolution: "3.5x2 inch Vector",
    size: "2.4 MB",
    createdAt: "2026-06-12",
    downloads: 2980,
    views: 8900,
    isPremium: false,
    isFavorite: true,
    tags: ["Business Cards", "Premium Gold", "Minimal", "Print"],
    description: "Sleek card design with a deep matte black background on one side and golden geometric interlocking joint lines on the other. Completely editable SVG vectors.",
    colors: ["#000000", "#F8B400", "#FFFFFF"]
  },
  {
    id: "temp-3",
    name: "Sustainability Achievement Award",
    category: "Templates",
    subCategory: "Certificates",
    thumbnail: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80",
    resolution: "US Letter Vector",
    size: "1.9 MB",
    createdAt: "2026-06-08",
    downloads: 730,
    views: 1900,
    isPremium: true,
    isFavorite: false,
    tags: ["Certificates", "Eco Green", "Award", "Aesthetic"],
    description: "Official corporate recognition certificate recognizing outstanding ecological architecture standards and zero-emission masonry deployment."
  },

  // 🖼 IMAGES
  {
    id: "img-1",
    name: "Terracotta Block Sunrise Close-up",
    category: "Images",
    subCategory: "Architecture",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    resolution: "6000 x 4000",
    size: "12.8 MB",
    createdAt: "2026-06-25",
    downloads: 3200,
    views: 11200,
    isPremium: false,
    isFavorite: true,
    tags: ["Nature", "Architecture", "Terracotta", "Sunrise"],
    description: "High resolution macro shot of a interlocking bio-composite brick block showcasing porous textures and glittering golden specks reflecting beautiful sunrise lights."
  },
  {
    id: "img-2",
    name: "High-Rise Glass & Masonry Tower",
    category: "Images",
    subCategory: "Technology",
    thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    resolution: "5800 x 3800",
    size: "11.1 MB",
    createdAt: "2026-06-21",
    downloads: 1900,
    views: 6500,
    isPremium: true,
    isFavorite: false,
    tags: ["Business", "Technology", "Skyscraper", "Urban"],
    description: "Stunning wide-angle architectural perspective of a massive corporate headquarters featuring interlocking solar active modular glass wall grids."
  },
  {
    id: "img-3",
    name: "Elite Blueprint Drafting Table",
    category: "Images",
    subCategory: "Business",
    thumbnail: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
    resolution: "4500 x 3000",
    size: "7.4 MB",
    createdAt: "2026-06-14",
    downloads: 840,
    views: 2900,
    isPremium: false,
    isFavorite: false,
    tags: ["Business", "Education", "Blueprints", "Creative"],
    description: "Atmospheric overhead workspace layout showcasing custom structural blueprints, mechanical locking rulers, and premium concrete block miniature prototypes."
  },

  // 🎨 LOGOS & BRAND ASSETS
  {
    id: "logo-1",
    name: "Golden Brick Core Identity",
    category: "Logos",
    subCategory: "Business Logos",
    thumbnail: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=600&q=80",
    resolution: "SVG / EPS Vector",
    size: "450 KB",
    createdAt: "2026-06-22",
    downloads: 4200,
    views: 15400,
    isPremium: true,
    isFavorite: true,
    tags: ["Business Logos", "Identity", "Golden", "Monogram"],
    description: "A professional and prestigious modular block emblem forming a stylized 'B'. Perfect for high-end civil engineering corporations and premium construction suites.",
    colors: ["#F8B400", "#1A1A1A", "#FFFFFF"]
  },
  {
    id: "logo-2",
    name: "EcoBrick Tech Branding Kit",
    category: "Brand Kits",
    subCategory: "Brand Guidelines",
    thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&q=80",
    resolution: "Full Figma File",
    size: "34.5 MB",
    createdAt: "2026-06-11",
    downloads: 1450,
    views: 5200,
    isPremium: true,
    isFavorite: true,
    tags: ["Brand Kits", "Guidelines", "Color Palettes", "Fonts"],
    description: "Comprehensive sustainable identity design package. Includes typography hierarchy rules, UI design systems, custom responsive logos, and premium marketing layouts.",
    colors: ["#10B981", "#1E293B", "#64748B", "#F8FAFC"],
    fonts: ["Space Grotesk", "Inter"]
  },

  // 🎙 VOICE SAMPLES & AUDIO
  {
    id: "aud-1",
    name: "Sovereign Blueprints Ambient",
    category: "Audio & Music",
    subCategory: "Corporate Videos",
    thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80",
    resolution: "High Fidelity WAV",
    size: "42 MB",
    createdAt: "2026-06-25",
    downloads: 980,
    views: 3400,
    isPremium: true,
    isFavorite: true,
    duration: "3:45",
    tags: ["Audio & Music", "Ambient", "Luxury", "Soundtrack"],
    description: "A gorgeous, deep, relaxing background track featuring subtle cello strings and modular synthesizer wave pulses. Ideal for luxury showcasing and architectural walkthroughs."
  },
  {
    id: "vox-1",
    name: "Elite Executive Voice Sample",
    category: "Voice Samples",
    subCategory: "Corporate Videos",
    thumbnail: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80",
    resolution: "48kHz WAV Mono",
    size: "14 MB",
    createdAt: "2026-06-24",
    downloads: 510,
    views: 1800,
    isPremium: true,
    isFavorite: false,
    duration: "0:45",
    voicesTag: "Male • Warm • Prestigious",
    tags: ["Voice Samples", "Voice Lab", "Narrator", "Proud"],
    description: "A warm, deeply resonate and authoritative male voice over narrating: 'Designing the solid future of smart luxury structures.' Perfect for brand trailers."
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// LISTS & CONFIGURATIONS REQUIRED BY THE USER REQUEST
// ─────────────────────────────────────────────────────────────────────────────

const MAIN_CATEGORIES = [
  { id: "all", name: "All Library", icon: "💎" },
  { id: "Images", name: "Images", icon: "🖼" },
  { id: "Logos", name: "Logos", icon: "🎨" },
  { id: "Templates", name: "Templates", icon: "📄" },
  { id: "Videos", name: "Videos", icon: "🎬" },
  { id: "Website Demos", name: "Website Demos", icon: "🌐" },
  { id: "Social Media Designs", name: "Social Media Designs", icon: "📱" },
  { id: "Project Assets", name: "Project Assets", icon: "📦" },
  { id: "Icons", name: "Icons", icon: "🎭" },
  { id: "Backgrounds", name: "Backgrounds", icon: "🖌" },
  { id: "Illustrations", name: "Illustrations", icon: "✨" },
  { id: "Mockups", name: "Mockups", icon: "🏷" },
  { id: "Audio & Music", name: "Audio & Music", icon: "🎵" },
  { id: "Voice Samples", name: "Voice Samples", icon: "🎙" },
  { id: "Brand Kits", name: "Brand Kits", icon: "📂" },
  { id: "Infographics", name: "Infographics", icon: "📊" },
  { id: "Brochures", name: "Brochures", icon: "📖" },
  { id: "Business Cards", name: "Business Cards", icon: "🪪" },
  { id: "Certificates", name: "Certificates", icon: "📜" },
  { id: "Advertisement Designs", name: "Advertisement Designs", icon: "📢" },
  { id: "Collections", name: "Collections", icon: "🎁" }
];

// Subcategory Lists to display as high-fidelity filter lists or sub-groups
const WEBSITE_DEMOS_SUBCATS = [
  "Landing Pages", "Business Websites", "School Websites", "Restaurant Websites",
  "Hospital Websites", "Portfolio Websites", "Corporate Websites", "Agency Websites",
  "E-Commerce Websites", "Dashboard UI", "Admin Panels"
];

const VIDEO_LIBRARY_SUBCATS = [
  "Business Videos", "Promotional Videos", "School Videos", "Festival Videos",
  "Corporate Videos", "Product Showcase", "Social Media Reels", "Intro Videos",
  "Outro Videos", "Motion Graphics"
];

const TEMPLATE_LIBRARY_SUBCATS = [
  "Pamphlets", "Flyers", "Posters", "Brochures", "Business Cards", "Certificates",
  "Invitations", "Banners", "Letterheads", "Social Media Posts", "YouTube Thumbnails",
  "Instagram Reels Covers", "Facebook Posts"
];

const IMAGE_LIBRARY_SUBCATS = [
  "Nature", "Business", "Technology", "Education", "Healthcare", "Restaurant",
  "Travel", "Fashion", "Festival", "Architecture"
];

const BRAND_ASSETS_SUBCATS = [
  "Business Logos", "Fonts", "Icons", "Color Palettes", "QR Codes", "Brand Guidelines"
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN REUSABLE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function GalleryView() {
  const [assets, setAssets] = useState<GalleryAsset[]>(MOCK_ASSETS);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Load gallery assets from Firestore on mount
  useEffect(() => {
    async function loadCloudAssets() {
      try {
        const cloudAssets = await getGalleryAssetsFromDb();
        if (cloudAssets.length > 0) {
          setAssets((prev) => {
            // Keep unique assets (avoid duplicate ids if any)
            const uniqueCloud = cloudAssets.filter(
              (ca) => !prev.some((p) => p.id === ca.id)
            );
            return [...uniqueCloud, ...prev];
          });
        }
      } catch (error) {
        console.error("Failed to load cloud gallery assets:", error);
      }
    }
    loadCloudAssets();
  }, []);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  
  // Filtering toggles
  const [filterPremium, setFilterPremium] = useState<"All" | "Premium" | "Free">("All");
  const [sortOrder, setSortOrder] = useState<"latest" | "popular" | "downloads" | "favorites">("latest");
  
  // Interactive UI states
  const [selectedAsset, setSelectedAsset] = useState<GalleryAsset | null>(null);
  const [isPrevewingCode, setIsPreviewingCode] = useState<boolean>(false);
  const [activeAudioPlaying, setActiveAudioPlaying] = useState<string | null>(null);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState<number>(30);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  
  // Toast overlay
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Custom Asset Creator upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadCategory, setUploadCategory] = useState("Images");

  // Project targets for "Add to Project" quick action simulation
  const [showProjectModal, setShowProjectModal] = useState<GalleryAsset | null>(null);
  const [activeProjects, setActiveProjects] = useState([
    { id: "proj-1", name: "Premium Golden Estate Campaign", assetCount: 6 },
    { id: "proj-2", name: "Sustainability Townhouse Launch", assetCount: 3 },
    { id: "proj-3", name: "Silicon Skyline Elite Website", assetCount: 2 }
  ]);
  const [newProjectName, setNewProjectName] = useState("");

  const showToast = (message: string) => {
    setToastMsg(message);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FILTERING AND SORTING LOGIC
  // ─────────────────────────────────────────────────────────────────────────────
  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        // Category Filter
        if (selectedCategory !== "all" && asset.category !== selectedCategory) {
          return false;
        }
        // SubCategory Filter
        if (selectedSubCategory !== "All" && asset.subCategory !== selectedSubCategory) {
          return false;
        }
        // Search query filter
        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          const matchName = (asset.name ?? "").toLowerCase().includes(query);
          const matchDesc = asset.description.toLowerCase().includes(query);
          const matchTags = (asset.tags ?? []).some(t => t.toLowerCase().includes(query));
          const matchSub = asset.subCategory.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchTags && !matchSub) {
            return false;
          }
        }
        // Premium Filter
        if (filterPremium === "Premium" && !asset.isPremium) return false;
        if (filterPremium === "Free" && asset.isPremium) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === "latest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOrder === "popular") {
          return b.views - a.views;
        }
        if (sortOrder === "downloads") {
          return b.downloads - a.downloads;
        }
        if (sortOrder === "favorites") {
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        }
        return 0;
      });
  }, [assets, selectedCategory, selectedSubCategory, searchQuery, filterPremium, sortOrder]);

  // Dynamic lists of subcategories based on what is selected
  const activeSubcategories = useMemo(() => {
    if (selectedCategory === "Website Demos") return WEBSITE_DEMOS_SUBCATS;
    if (selectedCategory === "Videos") return VIDEO_LIBRARY_SUBCATS;
    if (selectedCategory === "Templates") return TEMPLATE_LIBRARY_SUBCATS;
    if (selectedCategory === "Images") return IMAGE_LIBRARY_SUBCATS;
    if (selectedCategory === "Logos" || selectedCategory === "Brand Kits") return BRAND_ASSETS_SUBCATS;
    return [];
  }, [selectedCategory]);

  // Reset subcategory if we change the parent category
  useEffect(() => {
    setSelectedSubCategory("All");
  }, [selectedCategory]);

  // Audio waveform playback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeAudioPlaying) {
      interval = setInterval(() => {
        setAudioPlaybackProgress((prev) => {
          if (prev >= 100) {
            setActiveAudioPlaying(null);
            return 0;
          }
          return prev + 1;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [activeAudioPlaying]);

  // ─────────────────────────────────────────────────────────────────────────────
  // INTERACTIVE ACTION SIMULATORS
  // ─────────────────────────────────────────────────────────────────────────────

  const handleFavoriteToggle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAssets((prev) =>
      prev.map((asset) => {
        if (asset.id === id) {
          const nextFav = !asset.isFavorite;
          showToast(nextFav ? `❤️ Added "${asset.name}" to favorites.` : `💔 Removed "${asset.name}" from favorites.`);
          return { ...asset, isFavorite: nextFav };
        }
        return asset;
      })
    );
  };

  const handleDeleteAsset = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const assetToDelete = assets.find((a) => a.id === id);
    if (!assetToDelete) return;

    setAssets((prev) => prev.filter((a) => a.id !== id));
    showToast(`🗑️ Removed "${assetToDelete.name}" from active workspace.`);

    if (id.startsWith("user-")) {
      try {
        await deleteGalleryAssetFromDb(id);
        console.log(`Successfully deleted custom asset ${id} from local storage`);
      } catch (err) {
        console.error("Failed to delete local asset:", err);
      }
    }
  };

  const handleDownload = (asset: GalleryAsset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const anchor = document.createElement("a");
    anchor.href = asset.thumbnail;
    anchor.download = (asset.name ?? asset.id).replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
    setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, downloads: a.downloads + 1 } : a));
    showToast(`Download opened for "${asset.name}".`);
  };

  const handleDuplicate = (asset: GalleryAsset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newAsset: GalleryAsset = {
      ...asset,
      id: `${asset.id}-copy-${Date.now()}`,
      name: `${asset.name} (Duplicate Copy)`,
      createdAt: new Date().toISOString().split("T")[0],
      downloads: 0,
      views: 0,
      isFavorite: false
    };
    setAssets(prev => [newAsset, ...prev]);
    void saveGalleryAssetToDb(newAsset);
    showToast(`Duplicated "${asset.name}" and saved it to the workspace.`);
  };

  const handleShare = (asset: GalleryAsset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/gallery?asset=${encodeURIComponent(asset.id)}`;
    void navigator.clipboard.writeText(shareUrl);
    setCopiedText(asset.id);
    showToast(`Copied a gallery link for "${asset.name}".`);
    setTimeout(() => setCopiedText(null), 3000);
  };

  const handleAddProject = (asset: GalleryAsset, projectName: string) => {
    setActiveProjects(prev =>
      prev.map(p => p.name === projectName ? { ...p, assetCount: p.assetCount + 1 } : p)
    );
    showToast(`📦 Successfully added "${asset.name}" directly to project "${projectName}"!`);
    setShowProjectModal(null);
  };

  const handleCreateProjectAndAdd = (asset: GalleryAsset) => {
    if (newProjectName.trim() === "") return;
    setActiveProjects(prev => [
      ...prev,
      { id: `proj-${Date.now()}`, name: newProjectName, assetCount: 1 }
    ]);
    showToast(`🚀 Created new project "${newProjectName}" and injected "${asset.name}".`);
    setNewProjectName("");
    setShowProjectModal(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FILE UPLOAD SIMULATOR (Drag and Drop)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processUploadedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    setIsUploading(true);
    setUploadedFileName(file.name);
    setUploadProgress(10);
    
    // Smooth progress simulation
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const formattedSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
            const newAsset: GalleryAsset = {
              id: `user-${Date.now()}`,
              name: file.name.replace(/\.[^/.]+$/, ""),
              category: uploadCategory,
              subCategory: uploadCategory === "Images" ? "Business" : "Raw Resource",
              thumbnail: uploadCategory === "Images" 
                ? "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&q=80"
                : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
              resolution: uploadCategory === "Images" ? "4000 x 3000" : "SaaS Object",
              size: formattedSize,
              createdAt: new Date().toISOString().split("T")[0],
              downloads: 0,
              views: 1,
              isPremium: false,
              isFavorite: false,
              tags: ["User Uploaded", uploadCategory],
              description: `A custom-uploaded workspace digital asset. File name: ${file.name}. Saved into secure workspace tenant bucket.`
            };
            setAssets(prev => [newAsset, ...prev]);
            
            // Persist metadata locally first and sync through the workspace API when available.
            saveGalleryAssetToDb(newAsset).catch(err => {
              console.error("Failed to sync uploaded asset metadata:", err);
            });
            setIsUploading(false);
            setUploadProgress(0);
            showToast(`Saved "${file.name}" metadata to the workspace. Original file remains on this device.`);
          }, 400);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  // Sidebar metrics and stats helper
  const sidebarAddedRecently = useMemo(() => assets.slice(0, 3), [assets]);
  const sidebarMostDownloaded = useMemo(() => [...assets].sort((a,b) => b.downloads - a.downloads).slice(0, 3), [assets]);
  const sidebarFavorites = useMemo(() => assets.filter(a => a.isFavorite).slice(0, 3), [assets]);

  return (
    <div id="gallery-view" className="workspace-page space-y-8 bg-[var(--bg-body)] text-gray-200 rounded-[28px] border border-white/5 p-6 md:p-8 min-h-screen relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)]">
      
      {/* Soft warm luxury golden ambient flares */}
      <div className="absolute top-[-10%] right-[10%] w-[500px] h-[350px] bg-gradient-to-r from-[#F8B400]/10 to-[#FF9800]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-gradient-to-r from-zinc-900 to-black rounded-full blur-[100px] pointer-events-none" />

      {/* ─── TOAST NOTIFICATION LAYER ─── */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-none"
          >
            <div className="px-5 py-4 rounded-2xl bg-[#0F0F0F] border border-[#F8B400]/45 text-xs font-bold text-gray-100 shadow-[0_15px_50px_rgba(0,0,0,0.95)] flex items-center gap-3.5 max-w-sm backdrop-blur-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F8B400] animate-ping" />
              <span>{toastMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PAGE HEADER SECTION ─── */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-6 z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 text-[#F8B400] shadow-[0_0_20px_rgba(248,180,0,0.15)]">
              <Sparkles size={22} className="animate-pulse" />
            </span>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase bg-clip-text bg-gradient-to-r from-white via-gray-200 to-[#F8B400]">
                🖼️ Gallery
              </h1>
              <p className="text-[11px] font-bold text-[#F8B400] uppercase tracking-widest">
                Digital Asset Library
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-2xl">
            Browse, organize and reuse all your creative assets, templates, media and business resources from one professional library.
          </p>
        </div>

        {/* Counter Widget */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-[#121212]/90 border border-white/5 backdrop-blur-md">
          <div className="text-center">
            <span className="block text-lg font-black text-[#F8B400] font-mono leading-none">{assets.length}</span>
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Total Assets</span>
          </div>
          <div className="h-6 w-px bg-white/5" />
          <div className="text-center">
            <span className="block text-lg font-black text-white font-mono leading-none">{assets.filter(a => a.isPremium).length}</span>
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Premium Elite</span>
          </div>
          <div className="h-6 w-px bg-white/5" />
          <div className="text-center">
            <span className="block text-lg font-black text-emerald-400 font-mono leading-none">
              {assets.reduce((sum, item) => sum + item.downloads, 0)}
            </span>
            <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider">Downloads</span>
          </div>
        </div>
      </div>

      {/* ─── FILTERS & SEARCH ROW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center z-10 relative">
        {/* Search Input Box */}
        <div className="lg:col-span-5 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search assets, layouts, blueprints, videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212]/90 border border-white/5 focus:border-[#F8B400]/45 text-white placeholder-gray-500 text-xs rounded-xl py-3.5 pl-11 pr-4 focus:outline-none transition-all focus:shadow-[0_0_20px_rgba(248,180,0,0.05)]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dynamic Filters Options */}
        <div className="lg:col-span-7 flex flex-wrap items-center gap-3 justify-start lg:justify-end">
          
          {/* License Filter */}
          <div className="flex bg-[#121212]/90 border border-white/5 p-1 rounded-xl">
            {(["All", "Premium", "Free"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterPremium(tier)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  filterPremium === tier
                    ? "bg-[#F8B400]/10 text-[#F8B400] border border-[#F8B400]/25"
                    : "text-gray-400 hover:text-white border border-transparent"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          {/* Sorter Selector */}
          <div className="flex items-center gap-2 bg-[#121212]/90 border border-white/5 px-3 py-2 rounded-xl">
            <SlidersHorizontal size={13} className="text-[#F8B400]" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-transparent text-gray-300 font-bold uppercase tracking-wider text-[10px] focus:outline-none cursor-pointer"
            >
              <option value="latest" className="bg-[#121212] text-white">Latest Added</option>
              <option value="popular" className="bg-[#121212] text-white">Most Viewed</option>
              <option value="downloads" className="bg-[#121212] text-white">Most Downloaded</option>
              <option value="favorites" className="bg-[#121212] text-white">Favorited First</option>
            </select>
          </div>

          {/* Quick Clear filters */}
          {(selectedCategory !== "all" || searchQuery !== "" || filterPremium !== "All" || selectedSubCategory !== "All") && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
                setFilterPremium("All");
                setSelectedSubCategory("All");
                showToast("✨ Filters successfully reset.");
              }}
              className="px-3.5 py-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X size={12} />
              Reset Filters
            </button>
          )}

        </div>
      </div>

      {/* ─── MAIN APP GRID LAYOUT ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* LEFT COLUMN: MAIN CATEGORIES SCROLLER / SELECTOR (3 cols) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* CATEGORIES CARD CONTAINER */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#121212]/95 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Sliders size={14} className="text-[#F8B400]" />
                Main Categories
              </h3>
              <span className="text-[10px] text-gray-500 font-mono">Filter Array</span>
            </div>

            {/* Vertical Categories List */}
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1 select-none">
              {MAIN_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.name || (cat.id === "all" && selectedCategory === "all");
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.id === "all") setSelectedCategory("all");
                      else setSelectedCategory(cat.name);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#F8B400]/10 border border-[#F8B400]/25 text-white"
                        : "text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{cat.icon}</span>
                      <span className="font-semibold">{cat.name}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F8B400] shadow-[0_0_8px_#F8B400]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC SUBCATEGORIES SUB-BOX */}
          {activeSubcategories.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl border border-white/5 bg-[#121212]/95 backdrop-blur-md space-y-3"
            >
              <div className="border-b border-white/5 pb-2.5">
                <h4 className="text-xs font-black uppercase text-[#F8B400] tracking-wider">
                  Sub-Collections
                </h4>
                <p className="text-[9px] text-gray-500 mt-0.5">Refined filter options</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedSubCategory("All")}
                  className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedSubCategory === "All"
                      ? "bg-white text-black font-black"
                      : "bg-[#090909] text-gray-400 hover:text-white border border-white/5"
                  }`}
                >
                  All Subcats
                </button>
                {activeSubcategories.map((sub) => {
                  const isSubActive = selectedSubCategory === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubCategory(sub)}
                      className={`px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isSubActive
                          ? "bg-white text-black font-black"
                          : "bg-[#090909] text-gray-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TENANT FILE UPLOAD BOX */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="p-5 rounded-2xl border border-dashed border-white/10 hover:border-[#F8B400]/45 bg-[#121212]/50 backdrop-blur-md transition-all text-center space-y-4 group/upload relative overflow-hidden"
          >
            {/* Shifting background light line */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F8B400]/2 to-transparent pointer-events-none" />

            <div className="space-y-1.5 z-10 relative">
              <span className="mx-auto p-2.5 w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 text-gray-400 group-hover/upload:text-[#F8B400] group-hover/upload:border-[#F8B400]/30 flex items-center justify-center transition-all shadow-inner">
                <Zap size={16} className={isUploading ? "animate-spin text-[#F8B400]" : "transition-transform group-hover/upload:scale-110"} />
              </span>
              <h4 className="text-xs font-black uppercase text-white tracking-wide">
                Interactive Uploader
              </h4>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Drag & drop files here to immediately add custom resources into your digital vault
              </p>
            </div>

            {/* Upload settings category selector */}
            <div className="space-y-1.5 z-10 relative text-left">
              <label className="text-[9px] font-bold uppercase text-gray-500 block">Target Category</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full bg-[#090909] border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] text-gray-300 focus:outline-none focus:border-[#F8B400]/35 cursor-pointer"
              >
                <option value="Images">🖼 Images</option>
                <option value="Logos">🎨 Logos</option>
                <option value="Templates">📄 Templates</option>
                <option value="Videos">🎬 Videos</option>
                <option value="Audio & Music">🎵 Audio & Music</option>
              </select>
            </div>

            <div className="z-10 relative">
              <label className="px-4 py-2.5 rounded-xl bg-[#F8B400] hover:bg-[#FF9800] text-black font-extrabold text-[10px] uppercase tracking-wider block transition-all shadow-[0_4px_12px_rgba(248,180,0,0.15)] cursor-pointer">
                Select File
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*,application/json,audio/*"
                />
              </label>
            </div>

            {/* Upload Progress Bar Overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-4 space-y-3 z-20">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F8B400] animate-ping" />
                <p className="text-[10px] font-bold uppercase text-white tracking-widest truncate max-w-[180px]">
                  Uploading: {uploadedFileName}
                </p>
                <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#F8B400] to-[#FF9800] transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[9px] font-mono text-gray-500">{uploadProgress}% Complete</span>
              </div>
            )}
          </div>

        </div>

        {/* CENTER COLUMN: ACTIVE DIGITAL ASSET LIST (6 cols) */}
        <div className="xl:col-span-6 space-y-6">
          
          {/* SUB-HEADER OR EMPTY VIEW HANDLER */}
          <div className="flex justify-between items-center bg-[#121212]/50 px-4 py-3 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F8B400]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-300">
                Viewing: {selectedCategory === "all" ? "All Platform Assets" : selectedCategory}
              </span>
              {selectedSubCategory !== "All" && (
                <span className="text-[10px] bg-[#F8B400]/10 text-[#F8B400] px-2 py-0.5 rounded-lg font-bold border border-[#F8B400]/20">
                  {selectedSubCategory}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono text-gray-500">
              Showing {filteredAssets.length} of {assets.length}
            </span>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="p-16 rounded-2xl border border-white/5 bg-[#121212]/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto text-gray-500">
                <Info size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase text-white tracking-wider">No assets found</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  We couldn't find matching assets with your active criteria. Try broadening search queries or clearing tag filters.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedSubCategory("All");
                  setSearchQuery("");
                  setFilterPremium("All");
                }}
                className="px-4 py-2 bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider text-white rounded-xl hover:bg-white/10 transition-all cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            /* ASSET GRID LIST */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAssets.map((asset) => {
                const isFavorite = asset.isFavorite;
                const isAudioPlaying = activeAudioPlaying === asset.id;
                
                return (
                  <motion.div
                    key={asset.id}
                    layoutId={`asset-card-${asset.id}`}
                    onClick={() => setSelectedAsset(asset)}
                    className="group/card glass-prism-3d rounded-2xl bg-[#121212]/90 border border-white/5 hover:border-[#F8B400]/25 transition-all overflow-hidden flex flex-col justify-between h-[340px] relative cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_40px_rgba(248,180,0,0.04)]"
                    whileHover={{ y: -6 }}
                  >
                    
                    {/* Glass Reflection effect & Golden Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-white/[0.04] pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[#F8B400] to-[#FF9800] scale-x-0 group-hover/card:scale-x-100 transition-transform origin-left duration-300" />

                    {/* TOP PREVIEW THUMBNAIL */}
                    <div className="relative h-44 w-full bg-black overflow-hidden flex-shrink-0">
                      <img
                        src={asset.thumbnail}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/10 to-transparent" />

                      {/* Header Overlays */}
                      <div className="absolute top-3 inset-x-3 flex items-start justify-between z-10">
                        {/* Premium badge */}
                        {asset.isPremium ? (
                          <span className="px-2 py-1.5 rounded-lg bg-gradient-to-r from-[#F8B400] to-[#FF9800] text-black text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                            <Gem size={8} />
                            Premium
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-white text-[8px] font-black uppercase tracking-widest">
                            Free
                          </span>
                        )}

                        {/* Interactive Favorite Trigger */}
                        <div className="flex items-center gap-1.5">
                          {asset.id.startsWith("user-") && (
                            <button
                              onClick={(e) => handleDeleteAsset(asset.id, e)}
                              className="p-1.5 rounded-lg backdrop-blur-md border bg-black/60 border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                              title="Delete custom upload"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleFavoriteToggle(asset.id, e)}
                            className={`p-1.5 rounded-lg backdrop-blur-md border transition-all cursor-pointer ${
                              isFavorite
                                ? "bg-red-500/10 border-red-500/30 text-red-500"
                                : "bg-black/60 border-white/10 text-gray-400 hover:text-white"
                            }`}
                          >
                            <Heart size={12} fill={isFavorite ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>

                      {/* Dynamic overlays based on category */}
                      {asset.category === "Audio & Music" && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isAudioPlaying) setActiveAudioPlaying(null);
                              else {
                                setActiveAudioPlaying(asset.id);
                                showToast(`🎵 Listening to track sample: "${asset.name}"`);
                              }
                            }}
                            className="w-12 h-12 rounded-full bg-[#F8B400] hover:scale-105 transition-transform flex items-center justify-center text-black font-bold cursor-pointer"
                          >
                            {isAudioPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                          </button>
                        </div>
                      )}

                      {/* Video tag runtime */}
                      {asset.duration && (
                        <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 border border-white/10 text-[8px] font-mono font-bold text-gray-300">
                          {asset.duration}
                        </div>
                      )}

                      {/* Voices specific indicators */}
                      {asset.voicesTag && (
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-[#F8B400]/10 border border-[#F8B400]/30 text-[8px] font-bold text-[#F8B400] uppercase tracking-wider">
                          🎙 {asset.voicesTag}
                        </div>
                      )}
                    </div>

                    {/* DETAILS AND INFO AREA */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-extrabold text-[#F8B400] uppercase tracking-widest">
                            {asset.subCategory}
                          </span>
                          <span className="text-[9px] font-mono text-gray-500">
                            {asset.resolution || asset.size}
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-white group-hover/card:text-[#F8B400] transition-colors line-clamp-1">
                          {asset.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed">
                          {asset.description}
                        </p>
                      </div>

                      {/* CARD QUICK ACTIONS ACTION ROW */}
                      <div className="border-t border-white/5 pt-3 mt-2 flex items-center justify-between text-[10px] font-mono text-gray-500">
                        {/* Downloads and Views specs */}
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye size={10} /> {asset.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download size={10} /> {asset.downloads}
                          </span>
                        </div>

                        {/* Interactive trigger elements */}
                        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5 shadow-inner">
                          {/* Add to Project */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowProjectModal(asset);
                            }}
                            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer hover:scale-105"
                            title="Add to Workspace Project"
                          >
                            <FolderPlus size={11} />
                          </button>

                          {/* Quick duplicate */}
                          <button
                            onClick={(e) => handleDuplicate(asset, e)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer hover:scale-105"
                            title="Clone Asset"
                          >
                            <Copy size={11} />
                          </button>

                          {/* Share asset */}
                          <button
                            onClick={(e) => handleShare(asset, e)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 cursor-pointer hover:scale-105"
                            title="Share Asset"
                          >
                            {copiedText === asset.id ? <CopyCheck size={11} className="text-emerald-400" /> : <Share2 size={11} />}
                          </button>

                          {/* Primary Quick Download */}
                          <button
                            onClick={(e) => handleDownload(asset, e)}
                            className="p-1.5 rounded-md bg-[#F8B400]/10 text-[#F8B400] hover:bg-[#F8B400] hover:text-black transition-all duration-200 cursor-pointer hover:scale-110"
                            title="Download Directly"
                          >
                            <Download size={11} />
                          </button>
                        </div>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

          {/* DYNAMIC HISTORIC ACCORDIONS & DETAILED LISTS AS REQUESTED */}
          <div className="space-y-6 border-t border-white/5 pt-6">
            
            {/* SUB-SECTION 1: WEBSITE DEMOS MAP */}
            <div className="p-5 rounded-2xl border border-white/5 bg-[#121212]/50 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-black uppercase text-[#F8B400] tracking-widest flex items-center gap-1.5">
                  <Globe size={11} />
                  Enterprise Websites & UI
                </span>
                <span className="text-[9px] font-mono text-gray-500">11 interactive mock models</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                {WEBSITE_DEMOS_SUBCATS.map((demo) => (
                  <button
                    key={demo}
                    onClick={() => {
                      setSelectedCategory("Website Demos");
                      setSelectedSubCategory(demo);
                      showToast(`📁 Sorted by subcategory: ${demo}`);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-[#F8B400]/5 border border-white/5 hover:border-[#F8B400]/20 text-[10px] font-bold text-gray-400 hover:text-white transition-all text-left truncate cursor-pointer flex items-center justify-between"
                  >
                    <span>{demo}</span>
                    <ChevronRight size={10} className="text-gray-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* SUB-SECTION 2: VIDEO LIBRARY & OUTROS MAP */}
            <div className="p-5 rounded-2xl border border-white/5 bg-[#121212]/50 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-black uppercase text-[#F8B400] tracking-widest flex items-center gap-1.5">
                  <VideoIcon size={11} />
                  Video Outros & Reels
                </span>
                <span className="text-[9px] font-mono text-gray-500">10 high-speed structures</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {VIDEO_LIBRARY_SUBCATS.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setSelectedCategory("Videos");
                      setSelectedSubCategory(v);
                      showToast(`🎬 Filtered video category: ${v}`);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-950 hover:bg-[#F8B400]/5 border border-white/5 hover:border-[#F8B400]/20 text-[10px] font-bold text-gray-400 hover:text-white transition-all text-left truncate cursor-pointer flex items-center justify-between"
                  >
                    <span>{v}</span>
                    <ChevronRight size={10} className="text-gray-600" />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: RECENTLY ADDED, SAVED COLLECTIONS & STATISTICS (3 cols) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* SIDEBAR COMPONENT 1: METRICS & SAVED ASSET LIST */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#121212]/95 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <TrendingUp size={14} className="text-[#F8B400]" />
                Recently Added
              </h3>
              <span className="text-[9px] font-mono text-gray-500">Live feed</span>
            </div>

            <div className="space-y-3.5 select-none">
              {sidebarAddedRecently.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedAsset(item)}
                  className="flex gap-3 items-center group/side cursor-pointer"
                >
                  <img 
                    src={item.thumbnail} 
                    alt={item.name} 
                    className="w-10 h-10 rounded-lg object-cover bg-black border border-white/10 group-hover/side:border-[#F8B400]/50 transition-all flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-mono uppercase font-black text-[#F8B400] tracking-wider block">
                      {item.category}
                    </span>
                    <h4 className="text-[11px] font-black text-gray-200 group-hover/side:text-white transition-colors truncate">
                      {item.name}
                    </h4>
                    <span className="text-[9px] text-gray-500 font-mono block">
                      {item.size} • {item.createdAt}
                    </span>
                  </div>
                  <ChevronRight size={12} className="text-gray-600 group-hover/side:text-[#F8B400] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR COMPONENT 2: MOST DOWNLOADED RESOURCE PACKS */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#121212]/95 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Award size={14} className="text-[#F8B400]" />
                Most Downloaded
              </h3>
              <span className="text-[9px] font-mono text-gray-500">Elite Rank</span>
            </div>

            <div className="space-y-3.5 select-none">
              {sidebarMostDownloaded.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedAsset(item)}
                  className="flex gap-3 items-center group/side cursor-pointer"
                >
                  <img 
                    src={item.thumbnail} 
                    alt={item.name} 
                    className="w-10 h-10 rounded-lg object-cover bg-black border border-white/10 group-hover/side:border-[#F8B400]/50 transition-all flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] font-mono uppercase font-black text-[#F8B400] tracking-wider block">
                      {item.category}
                    </span>
                    <h4 className="text-[11px] font-black text-gray-200 group-hover/side:text-white transition-colors truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono">
                      <span className="text-emerald-400 font-bold">{item.downloads} downloads</span>
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-gray-600 group-hover/side:text-[#F8B400] transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* SIDEBAR COMPONENT 3: YOUR FAVORITES COLLECTION */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#121212]/95 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                <Heart size={13} className="text-red-500" />
                Your Favorites
              </h3>
              <span className="text-[9px] font-mono text-gray-500">Curated</span>
            </div>

            {sidebarFavorites.length === 0 ? (
              <p className="text-[10px] text-gray-500 text-center py-2 italic leading-relaxed">
                No favorited assets in session yet. Click the heart icon on any card to add.
              </p>
            ) : (
              <div className="space-y-3.5 select-none">
                {sidebarFavorites.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedAsset(item)}
                    className="flex gap-3 items-center group/side cursor-pointer"
                  >
                    <img 
                      src={item.thumbnail} 
                      alt={item.name} 
                      className="w-10 h-10 rounded-lg object-cover bg-black border border-white/10 group-hover/side:border-[#F8B400]/50 transition-all flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[11px] font-black text-gray-200 group-hover/side:text-white transition-colors truncate">
                        {item.name}
                      </h4>
                      <span className="text-[9px] text-gray-500 font-mono block">
                        {item.category}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleFavoriteToggle(item.id, e)}
                      className="p-1 rounded bg-zinc-900 text-red-500 border border-white/5"
                    >
                      <Heart size={9} fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR COMPONENT 4: COLLECTIONS CARD */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#121212]/95 backdrop-blur-md space-y-3">
            <div className="border-b border-white/5 pb-2.5 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                <Bookmark size={13} className="text-[#F8B400]" />
                Static Collections
              </h3>
              <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 text-[8px] font-bold font-mono text-[#F8B400]">
                ACTIVE
              </span>
            </div>

            <div className="space-y-2">
              <button 
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("Luxury");
                  showToast("🎁 Filtered by Luxury Festival Collection!");
                }}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-zinc-900 to-black hover:from-[#F8B400]/10 hover:to-black border border-white/5 text-left text-[10px] font-bold text-gray-300 block hover:text-white transition-all cursor-pointer flex items-center justify-between"
              >
                <span>🎁 Festival & Gold Seasonals</span>
                <span className="text-[8px] text-gray-500 font-mono">14 items</span>
              </button>

              <button 
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("Sustainable");
                  showToast("🎁 Filtered by Eco-Sustainable Architectural Collection!");
                }}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-zinc-900 to-black hover:from-[#F8B400]/10 hover:to-black border border-white/5 text-left text-[10px] font-bold text-gray-300 block hover:text-white transition-all cursor-pointer flex items-center justify-between"
              >
                <span>🏢 Corporate & Sustainable Office</span>
                <span className="text-[8px] text-gray-500 font-mono">9 items</span>
              </button>

              <button 
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("Estate");
                  showToast("🎁 Filtered by Smart Townhouses Collection!");
                }}
                className="w-full p-2.5 rounded-xl bg-gradient-to-r from-zinc-900 to-black hover:from-[#F8B400]/10 hover:to-black border border-white/5 text-left text-[10px] font-bold text-gray-300 block hover:text-white transition-all cursor-pointer flex items-center justify-between"
              >
                <span>🏠 Real Estate Premium Vault</span>
                <span className="text-[8px] text-gray-500 font-mono">12 items</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ─── BOTTOM SECTION: TRENDING & POPULAR ECOSYSTEM ─── */}
      <div className="border-t border-white/5 pt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10">
        
        {/* Module 1: Trending Assets list */}
        <div className="p-5 rounded-2xl bg-[#121212]/50 border border-white/5 space-y-3">
          <h4 className="text-[10px] font-black uppercase text-[#F8B400] tracking-widest flex items-center gap-1.5">
            <Flame size={12} className="text-amber-500" />
            Trending Assets
          </h4>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex justify-between items-center text-[10px]">
              <span className="font-extrabold truncate text-gray-300">Golden Stone Estate Hero Layout</span>
              <span className="text-emerald-400 font-mono font-bold">+182% view spike</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex justify-between items-center text-[10px]">
              <span className="font-extrabold truncate text-gray-300">Terracotta Sunrise High Res</span>
              <span className="text-emerald-400 font-mono font-bold">+94% dls</span>
            </div>
          </div>
        </div>

        {/* Module 2: Popular Downloads */}
        <div className="p-5 rounded-2xl bg-[#121212]/50 border border-white/5 space-y-3">
          <h4 className="text-[10px] font-black uppercase text-[#F8B400] tracking-widest flex items-center gap-1.5">
            <Download size={12} />
            Popular Downloads
          </h4>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex justify-between items-center text-[10px]">
              <span className="font-extrabold truncate text-gray-300">Golden Brick Monogram Emblem</span>
              <span className="text-gray-400 font-mono">4,200 downloads</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex justify-between items-center text-[10px]">
              <span className="font-extrabold truncate text-gray-300">Sustainable Identity Guideline Kit</span>
              <span className="text-gray-400 font-mono">1,450 downloads</span>
            </div>
          </div>
        </div>

        {/* Module 3: Recommended Resources */}
        <div className="p-5 rounded-2xl bg-[#121212]/50 border border-white/5 space-y-3">
          <h4 className="text-[10px] font-black uppercase text-[#F8B400] tracking-widest flex items-center gap-1.5">
            <Sparkle size={12} />
            Recommended Resources
          </h4>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex justify-between items-center text-[10px]">
              <span className="font-extrabold truncate text-gray-300">Sovereign Blueprints Soundtrack</span>
              <span className="text-[#F8B400] font-mono">Recommended by Admin</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex justify-between items-center text-[10px]">
              <span className="font-extrabold truncate text-gray-300">Modular Masonry Brand Brochure</span>
              <span className="text-purple-400 font-mono">Elite Template</span>
            </div>
          </div>
        </div>

        {/* Module 4: Recently Updated */}
        <div className="p-5 rounded-2xl bg-[#121212]/50 border border-white/5 space-y-3">
          <h4 className="text-[10px] font-black uppercase text-[#F8B400] tracking-widest flex items-center gap-1.5">
            <Calendar size={12} />
            Recently Updated
          </h4>
          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex justify-between items-center text-[10px]">
              <span className="font-extrabold truncate text-gray-300">Interlocking Terracotta Glide (4K)</span>
              <span className="text-gray-500 font-mono">Updated June 25, 2026</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 flex justify-between items-center text-[10px]">
              <span className="font-extrabold truncate text-gray-300">Golden Stone Estate Landing Page</span>
              <span className="text-gray-500 font-mono">Updated June 24, 2026</span>
            </div>
          </div>
        </div>

      </div>


      {/* ─── MODAL DIALOG 1: ADVANCED INTERACTIVE PREVIEW DRAWER ─── */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark glass backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => {
                setSelectedAsset(null);
                setIsPreviewingCode(false);
              }}
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-[#121212] border border-[#F8B400]/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col justify-between"
            >
              
              {/* Top Title Bar */}
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#090909]">
                <div className="flex items-center gap-2">
                  <span className="text-[#F8B400] font-mono text-[9px] uppercase font-black px-2.5 py-1.5 rounded-xl bg-[#F8B400]/10 border border-[#F8B400]/25">
                    {selectedAsset.category}
                  </span>
                  <span className="text-[10px] text-gray-500">•</span>
                  <span className="text-gray-400 text-xs font-mono">{selectedAsset.subCategory}</span>
                </div>
                <button
                  onClick={() => {
                    setSelectedAsset(null);
                    setIsPreviewingCode(false);
                  }}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Core Contents */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Advanced Category-Specific Preview Window */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5 flex items-center justify-center">
                  
                  {/* Image and Code representation toggle (for Website Demos) */}
                  {selectedAsset.category === "Website Demos" && isPrevewingCode && selectedAsset.codeSnippet ? (
                    <pre className="w-full h-full p-4 text-[10px] text-amber-400 font-mono overflow-auto text-left bg-black select-text">
                      <code>{selectedAsset.codeSnippet}</code>
                    </pre>
                  ) : selectedAsset.category === "Audio & Music" ? (
                    /* Interactive Audio Waveform Renderer */
                    <div className="w-full px-8 space-y-4 text-center">
                      <div className="flex items-center justify-center">
                        <span className="p-4 rounded-full bg-[#F8B400] text-black">
                          <Palette size={24} className="animate-pulse" />
                        </span>
                      </div>
                      <p className="text-xs font-mono font-bold text-gray-400">
                        {activeAudioPlaying === selectedAsset.id ? "ACTIVE AUDIO WAVEFORM STREAM" : "Sovereign Audio Sample"}
                      </p>
                      
                      {/* Interactive simulated waveform bars */}
                      <div className="flex items-end justify-center gap-1 h-12 w-full max-w-sm mx-auto">
                        {Array.from({ length: 24 }).map((_, i) => {
                          const isPlaying = activeAudioPlaying === selectedAsset.id;
                          const height = isPlaying 
                            ? Math.max(10, Math.sin((i + audioPlaybackProgress) * 0.5) * 44) 
                            : 8;
                          return (
                            <div 
                              key={i}
                              className="w-1.5 bg-[#F8B400] rounded-full transition-all"
                              style={{ height: `${height}px` }}
                            />
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => {
                            if (activeAudioPlaying === selectedAsset.id) {
                              setActiveAudioPlaying(null);
                            } else {
                              setActiveAudioPlaying(selectedAsset.id);
                              setAudioPlaybackProgress(30);
                            }
                          }}
                          className="px-6 py-2 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center gap-1.5"
                        >
                          {activeAudioPlaying === selectedAsset.id ? <Pause size={10} /> : <Play size={10} />}
                          {activeAudioPlaying === selectedAsset.id ? "Pause Sample" : "Play Sample"}
                        </button>
                        <span className="text-[10px] font-mono text-gray-500">
                          {activeAudioPlaying === selectedAsset.id ? `${audioPlaybackProgress}%` : "0:00"} / {selectedAsset.duration}
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Default Visual preview image */
                    <img
                      src={selectedAsset.thumbnail}
                      alt={selectedAsset.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Web Demo toggle code preview overlay bar */}
                  {selectedAsset.category === "Website Demos" && selectedAsset.codeSnippet && (
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button
                        onClick={() => setIsPreviewingCode(!isPrevewingCode)}
                        className="px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white hover:bg-black transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CodeIcon size={11} className="text-[#F8B400]" />
                        {isPrevewingCode ? "Show UI Layout" : "Show Source Code"}
                      </button>
                    </div>
                  )}

                  {/* Absolute positioning specs overlay */}
                  <div className="absolute top-4 left-4 bg-black/60 border border-white/10 px-2 py-1 rounded text-[8px] font-mono text-gray-300">
                    ID: {selectedAsset.id}
                  </div>
                </div>

                {/* Info Metadata grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  
                  {/* Left panel: Title & description */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-black text-white">{selectedAsset.name}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{selectedAsset.description}</p>
                    </div>

                    {/* Tags block */}
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedAsset.tags ?? []).map((t) => (
                        <span 
                          key={t}
                          onClick={() => {
                            setSearchQuery(t);
                            setSelectedAsset(null);
                            showToast(`Tags selected: ${t}`);
                          }}
                          className="px-2 py-1 rounded bg-[#090909] border border-white/5 text-[9px] font-bold text-[#F8B400] hover:border-[#F8B400]/40 transition-all cursor-pointer uppercase tracking-wider"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {/* Color swatches representation (For Brand Kits & Templates) */}
                    {selectedAsset.colors && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase text-gray-500 block">Colors Config Swatch</span>
                        <div className="flex gap-2 items-center">
                          {selectedAsset.colors.map((color: string) => {
                            const isJustCopied = copiedColor === color;
                            return (
                              <button
                                key={color}
                                onClick={() => {
                                  navigator.clipboard.writeText(color);
                                  setCopiedColor(color);
                                  showToast(`📋 Copied color hex code: ${color}`);
                                  setTimeout(() => setCopiedColor(null), 2500);
                                }}
                                className="w-10 h-10 rounded-xl relative border border-white/10 transition-transform hover:scale-105 cursor-pointer group/color flex items-center justify-center"
                                style={{ backgroundColor: color }}
                                title={`Copy hex ${color}`}
                              >
                                <span className="absolute inset-0 bg-black/20 opacity-0 group-hover/color:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-[8px] font-black text-white">
                                  {isJustCopied ? <Check size={12} /> : "Copy"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right panel: File stats */}
                  <div className="md:col-span-4 p-4 rounded-xl bg-zinc-950 border border-white/5 space-y-3 text-xs font-mono text-gray-400">
                    <div className="border-b border-white/5 pb-2">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider block">Resource Properties</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="text-gray-200 font-bold">{selectedAsset.size}</span>
                    </div>
                    {selectedAsset.resolution && (
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="text-gray-200 font-bold">{selectedAsset.resolution}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span className="text-gray-200 font-bold">{selectedAsset.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Downloads:</span>
                      <span className="text-emerald-400 font-bold">{selectedAsset.downloads}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>License:</span>
                      <span className={`font-bold ${selectedAsset.isPremium ? "text-[#F8B400]" : "text-gray-300"}`}>
                        {selectedAsset.isPremium ? "Enterprise Elite" : "Standard Free"}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom Interactive Trigger Buttons */}
              <div className="p-5 border-t border-white/5 bg-[#090909] flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      handleFavoriteToggle(selectedAsset.id);
                    }}
                    className={`px-4 py-2.5 rounded-xl border font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                      selectedAsset.isFavorite
                        ? "bg-red-500/10 border-red-500/30 text-red-400"
                        : "bg-white/5 border-white/5 text-gray-300 hover:text-white"
                    }`}
                  >
                    <Heart size={12} fill={selectedAsset.isFavorite ? "currentColor" : "none"} />
                    {selectedAsset.isFavorite ? "Favorited" : "Add Favorites"}
                  </button>

                  <button
                    onClick={() => {
                      handleDuplicate(selectedAsset);
                      setSelectedAsset(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Copy size={12} />
                    Duplicate
                  </button>

                  <button
                    onClick={() => {
                      setShowProjectModal(selectedAsset);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-300 hover:text-white font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <FolderPlus size={12} />
                    Add to Project
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {selectedAsset.demoUrl && (
                    <a
                      href={selectedAsset.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 border border-white/5"
                    >
                      <ExternalLink size={12} />
                      Live Preview Demo
                    </a>
                  )}

                  <button
                    onClick={() => {
                      handleDownload(selectedAsset);
                      setSelectedAsset(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#F8B400] hover:bg-[#FF9800] text-black font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_4px_12px_rgba(248,180,0,0.15)]"
                  >
                    <Download size={12} />
                    Download Asset
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* ─── MODAL DIALOG 2: SIMULATE ADD TO WORKSPACE PROJECT ─── */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark glass backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85"
              onClick={() => setShowProjectModal(null)}
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#121212] border border-[#F8B400]/30 rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <FolderPlus size={16} className="text-[#F8B400]" />
                  <h3 className="text-xs font-black uppercase text-white tracking-widest">
                    Add Asset to Project
                  </h3>
                </div>
                <button
                  onClick={() => setShowProjectModal(null)}
                  className="text-gray-500 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Inject the resource <strong className="text-white">"{showProjectModal.name}"</strong> directly into your current sandboxed workspace.
                </p>

                {/* Existing projects list */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase text-gray-500 block">Choose Active Project</label>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                    {activeProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleAddProject(showProjectModal, p.name)}
                        className="w-full p-3 rounded-xl bg-zinc-950 hover:bg-[#F8B400]/5 border border-white/5 hover:border-[#F8B400]/20 text-left text-xs text-gray-300 hover:text-white transition-all flex justify-between items-center cursor-pointer"
                      >
                        <span className="font-semibold truncate">{p.name}</span>
                        <span className="text-[10px] font-mono text-gray-500 font-bold">
                          {p.assetCount} assets
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Create new project input form */}
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <label className="text-[9px] font-bold uppercase text-gray-500 block">Or Create New Project</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Autumn Masonry Catalog"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="flex-1 bg-[#090909] border border-white/5 focus:border-[#F8B400]/45 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
                    />
                    <button
                      onClick={() => handleCreateProjectAndAdd(showProjectModal)}
                      disabled={newProjectName.trim() === ""}
                      className="px-4 py-2 rounded-xl bg-[#F8B400] hover:bg-[#FF9800] disabled:opacity-50 disabled:hover:bg-[#F8B400] text-black text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Create & Add
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Reusable simple CodeIcon fallback to avoid Lucide import issues
function CodeIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
