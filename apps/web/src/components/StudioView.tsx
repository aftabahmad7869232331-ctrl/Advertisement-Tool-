import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Sparkles,
  UploadCloud,
  FileText,
  Image,
  Video,
  Briefcase,
  Layers,
  Activity,
  Star,
  Clock,
  FileDown,
  Share2,
  Trash2,
  Copy,
  Check,
  Search,
  Plus,
  Compass,
  Type,
  Maximize2,
  Layout,
  QrCode,
  Sliders,
  Database,
  Grid,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Folder,
  CheckCircle2,
  Bookmark
} from "lucide-react";
import { ViewType } from "./Sidebar";

interface StudioViewProps {
  setActiveView: (view: ViewType) => void;
}

// Preset assets for the Asset Library
const PRESET_ASSETS = [
  { id: "asset-1", name: "Brick Studio Gold Logo", category: "Logos", size: "450 KB", type: "image/svg+xml", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80" },
  { id: "asset-2", name: "Luxury Black Marble Texture", category: "Backgrounds", size: "4.2 MB", type: "image/jpeg", url: "https://images.unsplash.com/photo-1502481851512-e9e2529bbbf9?w=300&q=80" },
  { id: "asset-3", name: "Golden Glow Ambient Light", category: "Backgrounds", size: "3.1 MB", type: "image/jpeg", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&q=80" },
  { id: "asset-4", name: "Minimalist Business Card Front", category: "Uploads", size: "1.2 MB", type: "image/png", url: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=300&q=80" },
  { id: "asset-5", name: "Premium Food Presentation", category: "Images", size: "2.8 MB", type: "image/jpeg", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=80" },
  { id: "asset-6", name: "Elite Corporate Headshot", category: "Images", size: "1.5 MB", type: "image/jpeg", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&q=80" },
  { id: "asset-7", name: "Branding Abstract Vector", category: "Illustrations", size: "890 KB", type: "image/svg+xml", url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=300&q=80" },
  { id: "asset-8", name: "Luxury Hospitality Promo", category: "Videos", size: "18.4 MB", type: "video/mp4", url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=150&q=80" },
  { id: "asset-9", name: "Intro Synth Soundscape", category: "Audio", size: "3.5 MB", type: "audio/mp3", url: "" },
  { id: "asset-10", name: "Brand Guidelines Guide", category: "Documents", size: "5.4 MB", type: "application/pdf", url: "" },
  { id: "asset-11", name: "Signature Typography Assets", category: "Brand Files", size: "720 KB", type: "font/otf", url: "" }
];

// Quick Start Designs Config
const QUICK_START_CARDS = [
  { id: "flyer-designer", title: "Pamphlet & Flyer Designer", desc: "Craft ultra-premium visual pamphlets and marketing flyers with absolute layout precision.", icon: "📄", targetView: "flyer" },
  { id: "video-creator", title: "Video Creator", desc: "Build cinematic promo videos with animated overlays, high-end transitions and gold branding.", icon: "🎬", targetView: "video" },
  { id: "banner-designer", title: "Banner & Poster Designer", desc: "Large-scale display flyers, luxury billboards, and corporate high-contrast event posters.", icon: "🖼", targetView: "ads" },
  { id: "social-designer", title: "Social Media Designer", desc: "Stunning Instagram squares, Facebook covers, and LinkedIn posts tailored to luxury niches.", icon: "📱", targetView: "ads" },
  { id: "brochure-designer", title: "Brochure Designer", desc: "Detailed corporate profile booklets, product catalogs, and multi-page tri-fold menus.", icon: "📖", targetView: "flyer" },
  { id: "bizcard-designer", title: "Business Card Designer", desc: "Elegant gold-foiled double-sided business card mockups and print-ready layouts.", icon: "💳", targetView: "flyer" },
  { id: "brand-identity", title: "Brand Identity Suite", desc: "Create coherent business logos, custom letterheads, brand style books, and typography presets.", icon: "🏢", targetView: "ads" },
  { id: "marketing-assets", title: "Marketing Assets hub", desc: "Generate promotional catalogs, sticker packs, premium loyalty coupon layouts, and web kits.", icon: "📊", targetView: "ads" }
];

// Preset designs for Recent Designs
const INITIAL_DESIGNS = [
  { id: "des-1", name: "Royal Spice Grand Menu", category: "Brochure", modified: "2 hours ago", size: "Print A4", thumbnail: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80" },
  { id: "des-2", name: "Oakridge Admission Prospectus", category: "Pamphlet", modified: "1 day ago", size: "Web PDF", thumbnail: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=400&q=80" },
  { id: "des-3", name: "Elite Duplex Villa Billboard", category: "Banner", modified: "3 days ago", size: "12ft x 6ft", thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80" },
  { id: "des-4", name: "Luxury Resort Promo Cinematic", category: "Video", modified: "1 week ago", size: "16:9 HD", thumbnail: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80" },
  { id: "des-5", name: "Startup Launch Invitation Card", category: "Business Card", modified: "2 weeks ago", size: "3.5\" x 2.0\"", thumbnail: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=400&q=80" }
];

export function StudioView({ setActiveView }: StudioViewProps) {
  // Navigation tabs or active sub-screens
  const [activeSubTab, setActiveSubTab] = useState<"all" | "brand-kit" | "assets" | "tools">("all");
  const [searchAssetQuery, setSearchAssetQuery] = useState("");
  const [selectedAssetCategory, setSelectedAssetCategory] = useState("All");
  
  // Dynamic design list
  const [designs, setDesigns] = useState(INITIAL_DESIGNS);
  const [recentActivities, setRecentActivities] = useState<Array<{ text: string; time: string; type: string }>>([
    { text: "Studio workspace initialized securely", time: "Just now", type: "system" },
    { text: "Rendered Canvas Mockup preview cache", time: "3 mins ago", type: "render" },
    { text: "Downloaded Royal Spice Menu.pdf", time: "1 hour ago", type: "download" },
    { text: "Duplicated 'Oakridge Prospectus' template", time: "1 day ago", type: "duplicate" }
  ]);

  // Asset uploaded state
  const [assets, setAssets] = useState(PRESET_ASSETS);
  const [dragActive, setDragActive] = useState(false);

  // Creative Toolkit Interactive Modals / Panels
  const [activeTool, setActiveTool] = useState<string | null>(null);

  // QR Code generator state
  const [qrText, setQrText] = useState("https://brickmaker.studio/royalspice");
  const [qrColor, setQrColor] = useState("#F8B400");
  const [qrGenerated, setQrGenerated] = useState(true);

  // Brand Kit Custom States
  const [brandName, setBrandName] = useState("Royal Spice Restaurant");
  const [brandSlogan, setBrandSlogan] = useState("Premium Gastronomy & Elite Hospitality");
  const [brandPrimary, setBrandPrimary] = useState("#F8B400");
  const [brandSecondary, setBrandSecondary] = useState("#0B0B0B");
  const [brandTypography, setBrandTypography] = useState("Outfit, Inter, sans-serif");
  const [brandInfo, setBrandInfo] = useState("Established 2026. Fine dining luxury restaurant specializing in artisanal spices and imperial fusion cuisine.");

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const triggerToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    triggerToast(`Copied values: ${text} to clipboard!`, "success");
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Add activity logs helper
  const logActivity = (text: string, type: string = "info") => {
    const timeNow = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setRecentActivities(prev => [{ text, time: timeNow, type }, ...prev.slice(0, 9)]);
  };

  // Design actions
  const handleDeleteDesign = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from Studio?`)) {
      setDesigns(prev => prev.filter(d => d.id !== id));
      logActivity(`Deleted design: ${name}`, "delete");
      triggerToast(`Removed design "${name}"`, "info");
    }
  };

  const handleDuplicateDesign = (design: typeof INITIAL_DESIGNS[number]) => {
    const duplicated = {
      ...design,
      id: `des-${Date.now()}`,
      name: `${design.name} (Copy)`,
      modified: "Just now"
    };
    setDesigns(prev => [duplicated, ...prev]);
    logActivity(`Duplicated design: ${design.name}`, "duplicate");
    triggerToast(`Duplicated "${design.name}" successfully!`);
  };

  const handleOpenDesign = (name: string, category: string) => {
    triggerToast(`Opening "${name}" in respective dynamic workspace...`, "info");
    logActivity(`Opened workspace: ${name}`, "load");
    
    // Auto redirect to correct page based on type
    if (category === "Video") {
      setActiveView("video");
    } else if (category === "Pamphlet" || category === "Brochure" || category === "Business Card") {
      setActiveView("flyer");
    } else {
      setActiveView("ads");
    }
  };

  // Asset drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = e.dataTransfer.files;
      const uploaded: typeof PRESET_ASSETS = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file) {
          continue;
        }

        let sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
        if (file.size < 1024 * 1024) sizeStr = `${(file.size / 1024).toFixed(0)} KB`;
        
        uploaded.push({
          id: `asset-new-${Date.now()}-${i}`,
          name: file.name,
          category: "Uploads",
          size: sizeStr,
          type: file.type || "unknown",
          url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&q=80"
        });
      }

      setAssets(prev => [...uploaded, ...prev]);
      logActivity(`Uploaded ${files.length} asset files into Studio Library`, "upload");
      triggerToast(`Uploaded ${files.length} assets successfully!`);
    }
  };

  const handleBrandKitSave = () => {
    logActivity(`Updated Brand Kit: ${brandName}`, "brand");
    triggerToast("Brand Kit synced and persistent in secure sandbox.");
  };

  // Filtered Assets
  const filteredAssets = assets.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchAssetQuery.toLowerCase());
    const matchesCategory = selectedAssetCategory === "All" || item.category === selectedAssetCategory;
    return matchesSearch && matchesCategory;
  });

  // Unique categories helper
  const assetCategories = ["All", "Logos", "Images", "Backgrounds", "Illustrations", "Videos", "Audio", "Documents", "Uploads", "Brand Files"];

  return (
    <div className="space-y-12 py-4">
      
      {/* ─── TOAST NOTIFICATION ─── */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-none"
          >
            <div className="px-5 py-3.5 rounded-2xl bg-[#0E0E0E] border border-[#F8B400]/40 text-xs font-bold text-gray-200 shadow-[0_15px_50px_rgba(0,0,0,0.9)] flex items-center gap-3 max-w-sm backdrop-blur-xl">
              <div className={`w-2 h-2 rounded-full animate-ping ${
                toast.type === "info" ? "bg-sky-400" : "bg-[#F8B400]"
              }`} />
              <span>{toast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PAGE HEADER ─── */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/5 bg-gradient-to-r from-zinc-950/80 to-zinc-900/60 p-8 md:p-10 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#F8B400]/5 via-transparent to-transparent opacity-60" />
        
        {/* Shimmer Glass Reflection Lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 bottom-0 w-[200px] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent transform -skew-x-12 translate-x-[-150%] animate-[lineLightSlide_6s_linear_infinite]" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#F8B400]/10 border border-[#F8B400]/20 text-[#F8B400] shadow-[0_0_15px_rgba(248,180,0,0.1)]">
                <Palette size={20} className="animate-pulse" />
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white uppercase bg-clip-text bg-gradient-to-r from-white via-gray-100 to-[#F8B400]">
                Studio
              </h1>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
              Your complete creative workspace for designing, organizing, and managing professional business content.
            </p>
          </div>
          
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => { setActiveView("flyer"); triggerToast("Redirecting to Pamphlet Builder...", "info"); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] border border-[#F8B400]/30 bg-[#F8B400]/5 text-[#F8B400] text-xs font-bold tracking-wide uppercase hover:bg-[#F8B400] hover:text-black hover:shadow-[0_0_20px_rgba(248,180,0,0.25)] transition-all duration-300 cursor-pointer"
            >
              <Plus size={14} />
              New Design
            </button>
            <button
              onClick={() => { setActiveSubTab("assets"); triggerToast("Asset manager workspace activated.", "info"); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer"
            >
              <UploadCloud size={14} />
              Upload Assets
            </button>
            <button
              onClick={() => { setActiveView("projects"); triggerToast("Redirecting to Project Brief Workspace...", "info"); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#0E0E0E] hover:bg-zinc-900 border border-white/5 text-gray-400 hover:text-white text-xs font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer"
            >
              <Folder size={14} />
              My Workspace
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex border-t border-white/5 mt-8 pt-4 gap-1 overflow-x-auto">
          {[
            { id: "all", label: "Creative Dashboard", icon: <Grid size={13} /> },
            { id: "brand-kit", label: "Brand Kit Suite", icon: <Bookmark size={13} /> },
            { id: "assets", label: "Studio Asset Library", icon: <Image size={13} /> },
            { id: "tools", label: "Design Toolkit", icon: <Sliders size={13} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveSubTab(tab.id as any); triggerToast(`Workspace view switched: ${tab.label}`, "info"); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === tab.id 
                  ? "bg-[#F8B400]/10 border border-[#F8B400]/30 text-[#F8B400]" 
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── CREATIVE DASHBOARD ALL-IN-ONE TAB ─── */}
      {activeSubTab === "all" && (
        <div className="space-y-12">
          
          {/* QUICK START SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Sparkles size={16} className="text-[#F8B400]" />
                Start Something New
              </h2>
              <span className="text-[10px] font-mono text-gray-600">8 creative templates active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {QUICK_START_CARDS.map(card => (
                <div
                  key={card.id}
                  onClick={() => { setActiveView(card.targetView as any); triggerToast(`Redirecting to ${card.title} workspace...`, "info"); }}
                  className="group relative p-5 rounded-[18px] border border-white/5 bg-zinc-950/40 hover:border-[#F8B400]/30 hover:bg-[#141208]/20 transition-all duration-300 flex flex-col justify-between min-h-[190px] cursor-pointer hover:-translate-y-1"
                >
                  {/* Corner light shimmer reflection */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[18px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 bottom-0 w-[80px] bg-gradient-to-r from-transparent via-white/[0.02] to-transparent transform -skew-x-12 translate-x-[-150%] animate-[lineLightSlide_3s_linear_infinite]" />
                  </div>

                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F8B400]/10 border border-[#F8B400]/25 flex items-center justify-center text-xl shadow-[0_0_15px_rgba(248,180,0,0.05)] group-hover:scale-105 transition-transform">
                      {card.icon}
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-xs font-black text-gray-100 group-hover:text-[#F8B400] transition-colors uppercase tracking-wider">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 leading-normal font-semibold">
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-1 text-[9px] font-mono text-gray-600 group-hover:text-white transition-colors">
                    <span>Initialize designer</span>
                    <ChevronRight size={10} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TWO COLUMN INTERACTION PANEL: RECENT DESIGNS (LEFT) & EXTRA INFRASTRUCTURES (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            
            {/* LEFT 6.5 COLUMNS: RECENT DESIGNS */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Layout size={15} className="text-[#F8B400]" />
                  Recent Designs
                </h3>
                <span className="text-[10px] font-mono text-gray-500">{designs.length} live project elements</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {designs.map(des => (
                  <div
                    key={des.id}
                    className="group rounded-xl border border-white/5 bg-[#0D0D0D]/90 p-4 space-y-4 hover:border-[#F8B400]/20 hover:bg-[#111] transition-all duration-300 relative"
                  >
                    {/* Thumbnail placeholder with luxury gradient and image preview */}
                    <div className="w-full h-32 rounded-lg overflow-hidden relative border border-white/5 bg-zinc-950">
                      <img 
                        src={des.thumbnail} 
                        alt={des.name} 
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 border border-white/10 text-[9px] font-mono text-gray-300 font-bold uppercase">
                        {des.category}
                      </span>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#F8B400]/10 border border-[#F8B400]/20 text-[9px] font-mono text-[#F8B400] font-bold">
                        {des.size}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-gray-200 group-hover:text-white transition-colors truncate">
                        {des.name}
                      </h4>
                      <p className="text-[9px] font-mono text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        Modified {des.modified}
                      </p>
                    </div>

                    {/* Quick Action buttons */}
                    <div className="flex border-t border-white/5 pt-3 gap-1.5 justify-between">
                      <button
                        onClick={() => handleOpenDesign(des.name, des.category)}
                        className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-[#F8B400] hover:text-black text-gray-300 font-extrabold text-[9px] tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Compass size={11} />
                        Open
                      </button>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDuplicateDesign(des)}
                          title="Duplicate template"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Copy size={11} />
                        </button>
                        <button
                          onClick={() => triggerToast(`Downloading print-ready ${des.name} in target asset folder...`, "info")}
                          title="Export / Download"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                        >
                          <FileDown size={11} />
                        </button>
                        <button
                          onClick={() => handleDeleteDesign(des.id, des.name)}
                          title="Delete design"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT 3.5 COLUMNS: METRICS & SAVED TOOLS */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* BRAND KIT SNEAK PREVIEW */}
              <div className="rounded-[18px] border border-white/5 bg-zinc-950/70 p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Bookmark size={14} className="text-[#F8B400]" />
                    Brand Identity Preset
                  </h4>
                  <button 
                    onClick={() => setActiveSubTab("brand-kit")} 
                    className="text-[9px] text-[#F8B400] font-black uppercase hover:underline cursor-pointer"
                  >
                    Edit Kit
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090909] border border-white/5 space-y-3 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Active Brand:</span>
                    <strong className="text-gray-200">{brandName}</strong>
                  </div>
                  
                  {/* Brand Color Swatches */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-2">
                    <span className="text-gray-500">Color Presets:</span>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full border border-white/20 block" style={{ backgroundColor: brandPrimary }} />
                        <span className="text-[9px] font-mono text-gray-400">{brandPrimary}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full border border-white/20 block" style={{ backgroundColor: brandSecondary }} />
                        <span className="text-[9px] font-mono text-gray-400">{brandSecondary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Font Preset */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-2">
                    <span className="text-gray-500">Typography:</span>
                    <span className="font-mono text-xs text-[#F8B400]">{brandTypography.split(",")[0]}</span>
                  </div>
                </div>
              </div>

              {/* FAVORITE DESIGN TOOLS LIST */}
              <div className="rounded-[18px] border border-white/5 bg-zinc-950/70 p-5 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Star size={14} className="text-[#F8B400]" />
                  Favorite Creative Tools
                </h4>

                <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                  {[
                    { label: "Typography scale", icon: <Type size={12} />, tab: "tools" },
                    { label: "Color Palette", icon: <Palette size={12} />, tab: "tools" },
                    { label: "QR Code engine", icon: <QrCode size={12} />, tab: "tools" },
                    { label: "Brand Asset kit", icon: <Bookmark size={12} />, tab: "brand-kit" }
                  ].map((tool, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setActiveSubTab(tool.tab as any); triggerToast(`Opening favorite tool: ${tool.label}`, "info"); }}
                      className="p-2.5 rounded-xl border border-white/5 bg-[#090909] text-gray-400 hover:text-white hover:border-[#F8B400]/40 transition-all cursor-pointer flex flex-col items-center gap-2"
                    >
                      <span className="p-1.5 rounded-lg bg-white/5 text-[#F8B400]">{tool.icon}</span>
                      <span>{tool.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STUDIO FEEDBACK ACTIVITY */}
              <div className="rounded-[18px] border border-white/5 bg-zinc-950/70 p-5 space-y-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                  <Activity size={14} className="text-[#F8B400]" />
                  Studio Activity Feed
                </h4>

                <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1">
                  {recentActivities.map((act, index) => (
                    <div key={index} className="flex gap-2.5 text-[10px] items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F8B400]/40 mt-1 flex-shrink-0" />
                      <div className="flex-1 space-y-0.5">
                        <p className="text-gray-300 font-semibold leading-normal">{act.text}</p>
                        <span className="text-[8px] font-mono text-gray-600 block">{act.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ─── BRAND KIT SUITE TAB ─── */}
      {activeSubTab === "brand-kit" && (
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          
          {/* LEFT 6 COLUMNS: BRAND SETTINGS & INFO */}
          <div className="lg:col-span-6 rounded-[18px] border border-white/5 bg-zinc-950/70 p-6 md:p-8 space-y-6">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Bookmark size={18} className="text-[#F8B400]" />
                Brand Kit Configuration
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                Establish primary presets, corporate names, typography, and descriptions to auto-feed into your creative design structures.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Business Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090909] border border-white/5 focus:border-[#F8B400]/40 text-xs font-semibold text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Brand Slogan / Tagline</label>
                  <input
                    type="text"
                    value={brandSlogan}
                    onChange={e => setBrandSlogan(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090909] border border-white/5 focus:border-[#F8B400]/40 text-xs font-semibold text-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Color Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Primary Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={brandPrimary}
                      onChange={e => setBrandPrimary(e.target.value)}
                      className="w-10 h-9 rounded bg-[#090909] border border-white/5 p-1 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandPrimary}
                      onChange={e => setBrandPrimary(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#090909] border border-white/5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Dark Body Base Theme Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={brandSecondary}
                      onChange={e => setBrandSecondary(e.target.value)}
                      className="w-10 h-9 rounded bg-[#090909] border border-white/5 p-1 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandSecondary}
                      onChange={e => setBrandSecondary(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#090909] border border-white/5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Font scale and instructions */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Typography Font Family Pair</label>
                <select
                  value={brandTypography}
                  onChange={e => setBrandTypography(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090909] border border-white/5 focus:border-[#F8B400]/40 text-xs font-semibold text-gray-300 focus:outline-none cursor-pointer"
                >
                  <option value="Outfit, Inter, sans-serif">Outfit & Inter (Modern Sans)</option>
                  <option value="Playfair Display, Inter, serif">Playfair Display & Inter (Luxury Serif)</option>
                  <option value="JetBrains Mono, Fira Code, monospace">JetBrains Mono (Technical Mono)</option>
                  <option value="Space Grotesk, sans-serif">Space Grotesk (Tech Forward)</option>
                </select>
              </div>

              {/* Core business statement description */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">Business Profile & About Summary</label>
                <textarea
                  rows={4}
                  value={brandInfo}
                  onChange={e => setBrandInfo(e.target.value)}
                  placeholder="Provide brief outline statement..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#090909] border border-white/5 focus:border-[#F8B400]/40 text-xs leading-relaxed font-mono text-gray-300 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleBrandKitSave}
                  className="px-6 py-3 rounded-[12px] bg-[#F8B400] text-black text-xs font-extrabold tracking-widest uppercase hover:bg-[#FF9800] hover:shadow-[0_0_20px_rgba(248,180,0,0.3)] transition-all duration-300 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 size={13} />
                  Save Brand Kit
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT 4 COLUMNS: BRAND INTERACTIVE CARD PREVIEW */}
          <div className="lg:col-span-4 rounded-[18px] border border-white/5 bg-zinc-950/70 p-6 space-y-6">
            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Live Mockup Preview Card</h4>

            {/* Simulated Luxury Business Card Render */}
            <div 
              className="w-full aspect-[1.6/1] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl transition-all duration-500 border border-white/5 group/kit-card"
              style={{
                backgroundColor: brandSecondary,
                fontFamily: brandTypography.split(",")[0]
              }}
            >
              {/* Glass subtle shimmer line reflection */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 bottom-0 w-[50px] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent transform -skew-x-12 translate-x-[-150%] group-hover/kit-card:animate-[lineLightSlide_2.5s_linear_infinite]" />
              </div>

              {/* Top Bar inside design card */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]" style={{ borderColor: brandPrimary, color: brandPrimary }}>
                    ★
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">{brandName.split(" ")[0]}</span>
                </div>
                <span className="text-[8px] font-mono tracking-widest text-gray-500 uppercase">Studio Spec</span>
              </div>

              {/* Middle Section */}
              <div className="space-y-1 my-3">
                <h3 className="text-sm font-black tracking-tight text-white">{brandName}</h3>
                <p className="text-[8px] tracking-wide text-gray-400">{brandSlogan}</p>
              </div>

              {/* Bottom section with colored visual theme strip */}
              <div className="flex justify-between items-end border-t border-white/5 pt-2">
                <div className="space-y-0.5">
                  <p className="text-[7px] text-gray-500 font-mono">ESTABLISHED 2026</p>
                  <p className="text-[7px] font-semibold text-gray-400">BRICK-MAKER WORKSPACE</p>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center border border-white/5 text-[10px] font-mono text-[#F8B400] font-black">
                  B
                </div>
              </div>
            </div>

            {/* Saved Corporate Assets presets */}
            <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">Brand Identity checklist</span>
              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check size={12} />
                  <span>Primary Logo Synced</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check size={12} />
                  <span>Hex Color Schemes configured</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check size={12} />
                  <span>Typography standards set</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400">
                  <Clock size={12} />
                  <span>Pending Brand assets review</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ─── STUDIO ASSET LIBRARY TAB ─── */}
      {activeSubTab === "assets" && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search size={12} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search resources by title..."
                value={searchAssetQuery}
                onChange={e => setSearchAssetQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-white/5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#F8B400]/40"
              />
            </div>

            {/* Dynamic filter tags */}
            <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {assetCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedAssetCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    selectedAssetCategory === cat 
                      ? "bg-[#F8B400] text-black font-extrabold" 
                      : "bg-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* TWO PANEL: DROPZONE & ASSETS LIST */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            
            {/* LEFT 3.5 COLUMNS: DRAG & DROP ZONE */}
            <div className="lg:col-span-3">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`p-8 rounded-[18px] border-2 border-dashed transition-all duration-300 text-center flex flex-col items-center justify-center gap-4 min-h-[350px] ${
                  dragActive 
                    ? "border-[#F8B400] bg-[#F8B400]/5 shadow-[0_0_20px_rgba(248,180,0,0.1)]" 
                    : "border-white/5 bg-zinc-950/50 hover:border-white/15"
                }`}
              >
                <div className="p-4 rounded-full bg-white/[0.02] border border-white/5 text-[#F8B400] animate-pulse">
                  <UploadCloud size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-extrabold text-gray-200 uppercase tracking-wider">Upload Brand Assets</p>
                  <p className="text-[10px] text-gray-600 font-medium leading-relaxed">
                    Drop logos, banners, food photographs, color guides, letterheads, or reference PDFs directly here.
                  </p>
                </div>
                <button 
                  onClick={() => triggerToast("Browse system dialog triggered under secure sandbox.", "info")}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase text-gray-300 cursor-pointer"
                >
                  Browse Files
                </button>
              </div>
            </div>

            {/* RIGHT 6.5 COLUMNS: GRID LIST */}
            <div className="lg:col-span-7 rounded-[18px] border border-white/5 bg-zinc-950/70 p-5 min-h-[350px] flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4 flex items-center justify-between">
                  <span>Available Brand Resources</span>
                  <span className="font-mono text-[10px] text-gray-600">{filteredAssets.length} items loaded</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAssets.map(asset => (
                    <div 
                      key={asset.id} 
                      className="group/asset p-3 rounded-xl border border-white/5 bg-zinc-950/80 flex flex-col justify-between gap-3 relative hover:border-[#F8B400]/25 hover:bg-[#111] transition-all"
                    >
                      <div className="flex gap-2.5 items-start">
                        {asset.url ? (
                          <div className="w-12 h-12 rounded bg-zinc-900 overflow-hidden flex-shrink-0 border border-white/5 relative">
                            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-[#F8B400]/5 text-[#F8B400] flex items-center justify-center border border-[#F8B400]/10 flex-shrink-0 font-bold text-xs">
                            DOC
                          </div>
                        )}
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-[11px] font-extrabold text-gray-200 truncate group-hover/asset:text-[#F8B400] transition-colors">{asset.name}</h4>
                          <div className="flex gap-1.5 text-[9px] font-mono text-gray-600">
                            <span>{asset.size}</span>
                            <span>•</span>
                            <span className="uppercase text-[8px] text-gray-500 font-bold bg-white/5 px-1 rounded">{asset.category}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <span className="text-[8px] font-mono text-gray-600 truncate max-w-[100px]">{asset.type}</span>
                        <div className="flex gap-1">
                          {asset.url && (
                            <button
                              onClick={() => copyToClipboard(asset.url)}
                              title="Copy Direct URL"
                              className="p-1 rounded bg-white/5 text-gray-400 hover:text-[#F8B400] hover:bg-white/10 transition-colors cursor-pointer"
                            >
                              <Copy size={10} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setAssets(prev => prev.filter(a => a.id !== asset.id));
                              logActivity(`Deleted asset resource: ${asset.name}`, "remove");
                              triggerToast("Asset deleted from library.", "info");
                            }}
                            className="p-1 rounded bg-white/5 text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-colors cursor-pointer"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {filteredAssets.length === 0 && (
                <div className="text-center py-12 space-y-2">
                  <p className="text-xs text-gray-600 font-bold">No assets found matching the query.</p>
                  <button 
                    onClick={() => { setSearchAssetQuery(""); setSelectedAssetCategory("All"); }}
                    className="text-[10px] text-[#F8B400] font-black uppercase hover:underline cursor-pointer"
                  >
                    Reset Filter query
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ─── DESIGN TOOLKIT TAB ─── */}
      {activeSubTab === "tools" && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* TOOL 1: DYNAMIC BRAND COLOURED SWATCH PALETTE */}
            <div className="rounded-[18px] border border-white/5 bg-zinc-950/70 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/25">
                  <Palette size={14} />
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Theme Color Palette Generator</h4>
              </div>
              <p className="text-gray-500 text-[10px] leading-relaxed">
                Click any luxurious design palette below to instantly copy hex color parameters for your brand layouts.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { name: "Luxury Imperial Gold", primary: "#F8B400", secondary: "#141208", list: ["#F8B400", "#FF9800", "#141208", "#0B0B0B"] },
                  { name: "Royal Obsidian Purple", primary: "#A855F7", secondary: "#130E1A", list: ["#A855F7", "#EC4899", "#130E1A", "#08050C"] },
                  { name: "Ocean Deep Blue", primary: "#38BDF8", secondary: "#09111F", list: ["#38BDF8", "#0369A1", "#09111F", "#03070E"] },
                  { name: "Emerald Forest Jade", primary: "#34D399", secondary: "#091F17", list: ["#34D399", "#059669", "#091F17", "#030B07"] }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className="p-3 rounded-xl border border-white/5 bg-[#090909] space-y-2 hover:border-[#F8B400]/25 transition-all cursor-pointer"
                    onClick={() => copyToClipboard(item.list.join(", "))}
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-gray-300 font-bold">{item.name}</span>
                      <span className="text-[8px] text-gray-500 font-mono font-bold uppercase">Click to copy pack</span>
                    </div>
                    <div className="flex gap-1.5">
                      {item.list.map((color, i) => (
                        <div key={i} className="flex-1 h-5 rounded border border-white/10 relative group/color" style={{ backgroundColor: color }}>
                          <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white bg-black/60 opacity-0 group-hover/color:opacity-100 font-mono font-bold transition-opacity">
                            {color}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TOOL 2: PREMIUM DYNAMIC QR CODE ENGINE */}
            <div className="rounded-[18px] border border-white/5 bg-zinc-950/70 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/25">
                  <QrCode size={14} />
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">QR Code Branding Engine</h4>
              </div>
              <p className="text-gray-500 text-[10px] leading-relaxed">
                Render pixel-perfect custom QR code modules dynamically containing business links or promotions.
              </p>

              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">QR Destination Link</label>
                  <input
                    type="text"
                    value={qrText}
                    onChange={e => setQrText(e.target.value)}
                    placeholder="https://yourbrand.com/offer"
                    className="w-full px-3 py-2 rounded-lg bg-[#090909] border border-white/5 text-xs text-white placeholder-gray-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">Accent Color</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["#F8B400", "#A855F7", "#38BDF8", "#34D399"].map(c => (
                      <button
                        key={c}
                        onClick={() => setQrColor(c)}
                        className={`h-6 rounded-md border transition-all cursor-pointer ${
                          qrColor === c ? "border-white scale-105" : "border-white/5 hover:border-white/20"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Simulated interactive QR code rendering */}
                <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 flex flex-col items-center justify-center gap-2 text-center relative group/qr">
                  {qrGenerated ? (
                    <div className="w-32 h-32 bg-white p-2 rounded-lg border flex flex-col justify-between">
                      {/* Generates a high visual fidelity QR representation using table grid aesthetics */}
                      <div className="grid grid-cols-6 gap-1 h-full w-full">
                        {Array.from({ length: 36 }).map((_, i) => {
                          const isEye = (i < 3 || (i % 6 < 3 && i < 18)) || (i >= 33 && i % 6 >= 3) || (i >= 18 && i < 21 && i % 6 < 3);
                          const isCenter = i > 12 && i < 24 && i % 6 > 1 && i % 6 < 5;
                          const fillStyle = isEye ? qrColor : isCenter ? "transparent" : (i * 7 + 13) % 2 === 0 ? qrColor : "#111111";

                          return (
                            <div 
                              key={i} 
                              className="rounded-[1px] transition-colors duration-300"
                              style={{ backgroundColor: fillStyle }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-gray-600 font-mono text-[10px]">Pending regeneration...</div>
                  )}
                  
                  <button
                    onClick={() => {
                      triggerToast("Downloading QR code vector to brand kit asset folder...");
                      logActivity(`Exported branded QR code targeting link: ${qrText}`, "download");
                    }}
                    className="mt-1 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    Download QR (.PNG)
                  </button>
                </div>
              </div>
            </div>

            {/* TOOL 3: MICRO DESIGN SPECS & RATIOS */}
            <div className="rounded-[18px] border border-white/5 bg-zinc-950/70 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <Type size={14} />
                </span>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Standard Design Ratio Scale</h4>
              </div>
              <p className="text-gray-500 text-[10px] leading-relaxed">
                Utilize elite golden ratios and spacing grids directly compiled for premium typography hierarchy.
              </p>

              <div className="space-y-2 pt-2 text-[11px]">
                {[
                  { label: "Golden Ratio Font size Scale", value: "8px • 13px • 21px • 34px • 55px" },
                  { label: "Luxury Card Margins spacing", value: "18px Border-Radius • 24px Padding" },
                  { label: "Banner Billboard ratio", value: "1.618 : 1 Golden Aspect Layout" },
                  { label: "Social post sizing grid", value: "1080px x 1080px (Square Spec)" }
                ].map((spec, i) => (
                  <div 
                    key={i} 
                    className="p-2.5 rounded-lg border border-white/5 bg-[#090909] space-y-1 hover:border-[#F8B400]/20 transition-all cursor-pointer"
                    onClick={() => copyToClipboard(spec.value)}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block">{spec.label}</span>
                    <p className="font-mono text-xs text-gray-300 font-bold">{spec.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ─── EMPTY STATE SAFE GUARD ─── */}
      {designs.length === 0 && activeSubTab === "all" && (
        <div className="rounded-[18px] border border-white/5 bg-zinc-950/80 p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-full bg-[#F8B400]/10 border border-[#F8B400]/25 flex items-center justify-center mx-auto text-[#F8B400] text-xl">
            <Palette size={28} />
          </div>
          <div className="space-y-2">
            <h3 className="text-base font-black text-white uppercase tracking-wider">Welcome to your Studio</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Choose a design tool, configure brand kit assets, and start creating professional creative business content with luxury templates.
            </p>
          </div>
          <button
            onClick={() => { setDesigns(INITIAL_DESIGNS); triggerToast("Studio designs reset successfully!"); }}
            className="px-6 py-2.5 rounded-xl bg-[#F8B400] hover:bg-[#FF9800] text-black text-xs font-black tracking-widest uppercase hover:shadow-[0_0_15px_rgba(248,180,0,0.3)] transition-all cursor-pointer"
          >
            Load Demo Templates
          </button>
        </div>
      )}

    </div>
  );
}


