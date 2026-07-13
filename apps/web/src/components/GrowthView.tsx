import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { workspaceApi } from "../services/workspaceApi";
import { 
  Sparkles, 
  Send, 
  Printer, 
  Palette, 
  Globe, 
  Briefcase, 
  TrendingUp, 
  Sliders, 
  Layers, 
  Database, 
  Activity, 
  Bell, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Plus, 
  Settings, 
  ShieldCheck,
  FileText,
  Mail,
  Smartphone,
  QrCode,
  Download,
  BarChart3,
  Users,
  Lock,
  ChevronRight,
  Eye
} from "lucide-react";

export function GrowthView() {
  const [activeCategory, setActiveCategory] = useState<"all" | "promo" | "print" | "branding" | "web" | "marketing">("all");
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    void workspaceApi.action("growth", "ui-action", { message: msg }).catch(() => undefined);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePublishAll = () => {
    setIsPublishing(true);
    setPublishProgress(0);
    const interval = setInterval(() => {
      setPublishProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsPublishing(false);
            setPublishProgress(0);
            showToast("Campaign publish request saved to the workspace queue.");
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  // Connected Channel Categories (no platform names as strictly forbidden)
  const connectedChannels = [
    { id: "social", name: "Social Channels", status: "Active", accounts: 12, queue: 4, reach: "142.5K", glow: "rgba(248,180,0,0.15)" },
    { id: "video", name: "Video Channels", status: "Active", accounts: 5, queue: 2, reach: "98.2K", glow: "rgba(255,152,0,0.15)" },
    { id: "msg", name: "Messaging Channels", status: "Active", accounts: 8, queue: 0, reach: "45.0K", glow: "rgba(16,185,129,0.15)" },
    { id: "listing", name: "Business Listings", status: "Active", accounts: 14, queue: 1, reach: "18.4K", glow: "rgba(59,130,246,0.15)" },
    { id: "web", name: "Website Channels", status: "Active", accounts: 3, queue: 0, reach: "320.1K", glow: "rgba(139,92,246,0.15)" },
    { id: "community", name: "Community Channels", status: "Pending", accounts: 6, queue: 0, reach: "12.7K", glow: "rgba(236,72,153,0.15)" },
    { id: "email", name: "Email Channels", status: "Active", accounts: 4, queue: 8, reach: "55.8K", glow: "rgba(244,63,94,0.15)" },
    { id: "custom", name: "Custom Channels", status: "Active", accounts: 2, queue: 0, reach: "8.1K", glow: "rgba(100,116,139,0.15)" }
  ];

  // Printing Service Products
  const printServices = [
    { name: "Pamphlet Printing", price: "₹2.50 / copy", speed: "24h delivery" },
    { name: "Flyer Printing", price: "₹1.80 / copy", speed: "Same-day available" },
    { name: "Poster Printing", price: "₹22.00 / copy", speed: "High gloss 4K" },
    { name: "Banner Printing", price: "₹180.00 / copy", speed: "Waterproof vinyl" },
    { name: "Flex Printing", price: "₹15.00 / sq.ft", speed: "Outdoor matte" },
    { name: "Business Cards", price: "₹350 / 100 pcs", speed: "Velvet touch" },
    { name: "Letterheads", price: "₹450 / 100 pcs", speed: "Premium watermark" },
    { name: "Brochures", price: "₹8.50 / copy", speed: "Tri-fold 300GSM" },
    { name: "Certificates", price: "₹12.00 / copy", speed: "Gold foil stamp" },
    { name: "Invitation Cards", price: "₹15.00 / copy", speed: "Enclosure styling" },
    { name: "Menu Cards", price: "₹45.00 / copy", speed: "Laminated scratchproof" },
    { name: "Catalogues", price: "₹120 / copy", speed: "Perfect binding" },
    { name: "Packaging Design", price: "Bespoke quote", speed: "Eco-friendly board" },
    { name: "Sticker Printing", price: "₹0.90 / piece", speed: "Die-cut custom" },
    { name: "Large Format Printing", price: "Bespoke quote", speed: "Eco-solvent ink" }
  ];

  // Branding Service Products
  const brandingServices = [
    { name: "Logo Design", desc: "Award-winning elite brand symbol creation." },
    { name: "Brand Identity", desc: "Complete visual story & brand essence system." },
    { name: "Brand Guidelines", desc: "Digital handbook detailing alignment rules." },
    { name: "Brand Kit", desc: "Pre-rendered SVG vectors & typography files." },
    { name: "Color Palette", desc: "Psychological color harmony generation." },
    { name: "Typography", desc: "Signature digital type hierarchy pairing." },
    { name: "Stationery Design", desc: "Cohesive letterheads, envelopes & folders." },
    { name: "Marketing Materials", desc: "Custom templates for commercial setups." },
    { name: "Business Presentation", desc: "Ultra-premium 16:9 pitch decks." },
    { name: "Corporate Branding", desc: "Mass-scale enterprise transformation." }
  ];

  // Website Service Products
  const websiteServices = [
    { name: "Landing Pages", desc: "High-conversion single-screen layouts." },
    { name: "Business Websites", desc: "Complete multi-page service showcases." },
    { name: "Portfolio Websites", desc: "Stunning aesthetic showcase for creators." },
    { name: "School Websites", desc: "Integrated portal for educational setups." },
    { name: "Restaurant Websites", desc: "Interactive digital menu & reservation systems." },
    { name: "Hospital Websites", desc: "Sleek, trusted patient appointment systems." },
    { name: "Corporate Websites", desc: "Elite multi-regional global web architectures." },
    { name: "Agency Websites", desc: "High-impact portfolio & proposal systems." },
    { name: "Website Publishing", desc: "One-click deployment to global edge CDN." },
    { name: "Domain Setup", desc: "Bespoke domain configuration with DNS security." },
    { name: "Hosting Integration", desc: "Scalable hosting with 99.99% availability guarantee." },
    { name: "Website Maintenance", desc: "Automated updates, backups & speed audits." }
  ];

  // Marketing Service Products
  const marketingServices = [
    { name: "Business Promotion", desc: "Targeted localized promotion campaigns." },
    { name: "Advertisement Campaigns", desc: "High-ROI digital ad creatives & copies." },
    { name: "Festival Campaigns", desc: "Seasonal marketing templates & automation." },
    { name: "Social Media Campaigns", desc: "Staggered interactive audience engagement." },
    { name: "Email Campaigns", desc: "High-open-rate newsletters & workflows." },
    { name: "SMS Campaigns", desc: "Sleek SMS notifications & alerts." },
    { name: "QR Marketing", desc: "Physical-to-digital touchpoint integrations." },
    { name: "Coupon Campaigns", desc: "Custom printable & digital discount coupons." },
    { name: "Lead Generation", desc: "Lead magnet landing page flow & forms." },
    { name: "Business Growth Strategy", desc: "Comprehensive structural expansion planning." }
  ];

  // Business Tools
  const businessTools = [
    { name: "Digital Visiting Card", icon: <Smartphone size={16} /> },
    { name: "QR Generator", icon: <QrCode size={16} /> },
    { name: "Barcode Generator", icon: <Sliders size={16} /> },
    { name: "Invoice Generator", icon: <FileText size={16} /> },
    { name: "Business Profile", icon: <Briefcase size={16} /> },
    { name: "Business Documents", icon: <Layers size={16} /> },
    { name: "Marketing Reports", icon: <BarChart3 size={16} /> },
    { name: "Download Center", icon: <Download size={16} /> }
  ];

  return (
    <div className="workspace-page space-y-10 text-white pb-16 animate-fade-in" id="growth-center-view">
      
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2 text-left">
          <span className="text-[#F8B400] text-xs font-black tracking-widest uppercase block flex items-center gap-1.5">
            <Sparkles size={12} className="animate-pulse" />
            ENTERPRISE SERVICES
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            💼 Business Growth Center
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-light max-w-2xl">
            Manage branding, promotion, publishing, printing and business growth services from one professional workspace.
          </p>
        </div>

        {/* Quick category filter tabs */}
        <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-white/5 self-start md:self-center overflow-x-auto max-w-full">
          {[
            { id: "all", label: "All Services" },
            { id: "promo", label: "Promotion" },
            { id: "print", label: "Printing" },
            { id: "branding", label: "Branding" },
            { id: "web", label: "Websites" },
            { id: "marketing", label: "Marketing" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === tab.id ? "bg-[#F8B400] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── THREE-COLUMN HIGH-FIDELITY LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT 9 COLS: Workspace & Service Modules */}
        <div className="lg:col-span-8 space-y-10">

          {/* 1. DIGITAL PROMOTION CENTER */}
          {(activeCategory === "all" || activeCategory === "promo") && (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[18px] border border-amber-500/10 bg-gradient-to-br from-[#121212] via-[#090909] to-[#121212] relative overflow-hidden"
              id="digital-promotion-center-panel"
            >
              {/* Glass background reflection glow */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-amber-500/[0.02] blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-6">
                <div className="text-left space-y-1">
                  <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest">
                    Omnichannel Syndicate
                  </span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    Digital Promotion Center
                  </h3>
                  <p className="text-xs text-gray-500 font-light">
                    Promote your completed projects through connected digital channels with one click.
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => showToast("Channel refresh request saved. Connectors will run when configured.")}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer border border-white/5"
                  >
                    Connect Platforms
                  </button>
                  <button 
                    onClick={handlePublishAll}
                    disabled={isPublishing}
                    className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-[10px] tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(248,180,0,0.2)] disabled:opacity-50 cursor-pointer"
                  >
                    {isPublishing ? "Publishing..." : "Publish Now"}
                  </button>
                </div>
              </div>

              {/* Progress Bar for Bulk Posting */}
              {isPublishing && (
                <div className="mb-6 p-4 rounded-xl bg-black border border-amber-500/10 animate-pulse">
                  <div className="flex justify-between text-[10px] mb-2">
                    <span className="text-amber-400 font-bold uppercase tracking-wider">Syncing Outbound Streams</span>
                    <span className="font-extrabold text-white">{publishProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${publishProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Connected Channels Grid (No social media names allowed!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {connectedChannels.map((chan) => (
                  <div 
                    key={chan.id}
                    className="p-4 rounded-xl border border-white/5 bg-zinc-950/40 relative group transition-all duration-300 hover:scale-[1.02] text-left"
                    style={{
                      boxShadow: selectedChannel === chan.id ? `inset 0 0 10px ${chan.glow}` : undefined,
                      borderColor: selectedChannel === chan.id ? "rgba(248,180,0,0.3)" : undefined
                    }}
                    onClick={() => setSelectedChannel(chan.id)}
                  >
                    {/* Active Status indicator */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${chan.status === "Active" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" : "bg-pink-400 animate-pulse"}`} />
                      <span className="text-[8px] font-black uppercase text-gray-500">{chan.status}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">
                          {chan.name}
                        </h4>
                        <p className="text-[9px] text-gray-500 font-mono">
                          {chan.accounts} Connected Accounts • {chan.queue} in Queue
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[10px]">
                        <span className="text-gray-400">Total Reach Potential</span>
                        <span className="text-[#F8B400] font-black">{chan.reach}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Digital controls drawer */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/5">
                {[
                  "Schedule Promotion",
                  "Campaign Manager",
                  "Publishing Queue",
                  "Promotion History"
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => showToast(`${action} task saved to the workspace.`)}
                    className="p-2.5 rounded-lg bg-black text-[9px] font-extrabold uppercase tracking-widest text-gray-400 hover:text-white border border-white/5 hover:border-amber-500/20 transition-all cursor-pointer text-center"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </motion.section>
          )}

          {/* 2. PRINTING SERVICES */}
          {(activeCategory === "all" || activeCategory === "print") && (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="text-left space-y-1">
                <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Printer size={12} />
                  Heavy Printing Machinery
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  High-Quality Commercial Printing
                </h3>
                <p className="text-xs text-gray-400 font-light max-w-xl">
                  Order professional hard copies of your brand flyers, pamphlets, certificates, and marketing sheets directly from our heavy industrial presses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {printServices.map((srv, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl border border-white/5 bg-[#121212]/40 hover:border-amber-500/20 transition-all duration-300 group hover:scale-[1.02] text-left relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/[0.02] to-transparent pointer-events-none" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          {srv.name}
                        </h4>
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/10 whitespace-nowrap">
                          {srv.speed}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono">Starting at <strong className="text-gray-300 font-black">{srv.price}</strong></p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-[9px]">
                      <span className="text-gray-600 uppercase font-bold">Industrial Press</span>
                      <button 
                        onClick={() => showToast(`Print quote request saved for ${srv.name}.`)}
                        className="text-amber-500 hover:text-amber-400 font-black tracking-widest uppercase flex items-center gap-0.5 cursor-pointer"
                      >
                        Order Hard Copy
                        <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* 3. BRANDING SERVICES */}
          {(activeCategory === "all" || activeCategory === "branding") && (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="text-left space-y-1">
                <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Palette size={12} />
                  Creative Atelier
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  Elite Branding & Identity
                </h3>
                <p className="text-xs text-gray-400 font-light max-w-xl">
                  Construct your signature commercial presence with custom-made brand guidelines, vector logos, corporate kits, and stationery templates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brandingServices.map((srv, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl border border-white/5 bg-[#121212]/30 hover:border-amber-500/15 transition-all duration-300 group text-left flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                      <Palette size={14} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{srv.name}</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-light">{srv.desc}</p>
                      <button 
                        onClick={() => showToast(`Consultation request saved for ${srv.name}.`)}
                        className="text-[9px] text-amber-500 hover:underline pt-1.5 block font-bold cursor-pointer"
                      >
                        Launch Service Setup
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* 4. WEBSITE SERVICES */}
          {(activeCategory === "all" || activeCategory === "web") && (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="text-left space-y-1">
                <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Globe size={12} />
                  Domain & Cloud Nodes
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  Enterprise Web Publishing
                </h3>
                <p className="text-xs text-gray-400 font-light max-w-xl">
                  Deploy ultra-fast responsive landing pages, portfolio networks, agency portals, or educational websites backed by gold-standard security.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {websiteServices.map((srv, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl border border-white/5 bg-[#121212]/30 hover:border-amber-500/15 transition-all duration-300 group text-left flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                      <Globe size={14} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{srv.name}</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-light">{srv.desc}</p>
                      <button 
                        onClick={() => showToast(`Website service request saved for ${srv.name}.`)}
                        className="text-[9px] text-amber-500 hover:underline pt-1.5 block font-bold cursor-pointer"
                      >
                        Deploy Live Node
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* 5. MARKETING SERVICES */}
          {(activeCategory === "all" || activeCategory === "marketing") && (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="text-left space-y-1">
                <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <Briefcase size={12} />
                  Growth Hacking Syndicate
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  Marketing Campaigns & Strategy
                </h3>
                <p className="text-xs text-gray-400 font-light max-w-xl">
                  Launch targeted advertisement campaigns, QR campaigns, SMS alerts, or festival promos connected directly with elite analytics pipelines.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {marketingServices.map((srv, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-xl border border-white/5 bg-[#121212]/30 hover:border-amber-500/15 transition-all duration-300 group text-left flex items-start gap-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                      <Briefcase size={14} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">{srv.name}</h4>
                      <p className="text-[10px] text-gray-500 leading-relaxed font-light">{srv.desc}</p>
                      <button 
                        onClick={() => showToast(`Analytics task saved for ${srv.name}.`)}
                        className="text-[9px] text-amber-500 hover:underline pt-1.5 block font-bold cursor-pointer"
                      >
                        Schedule Strategy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

        </div>

        {/* RIGHT 4 COLS: Connected Sidebar & Tools */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* A. SYSTEM ADMIN SECURITY BANNER */}
          <div className="p-4 rounded-xl border border-[#F8B400]/25 bg-gradient-to-br from-[#1b1507] to-black/80 text-left space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#F8B400]/5 blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 text-[#F8B400]">
              <Lock size={14} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Admin Dashboard Connected</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Platform connections, posting thresholds, scheduling engines, watermarks, API keys, and posting permissions are hidden securely behind the <strong>Admin Console</strong>.
            </p>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[8px] font-mono text-gray-600">Secure AES-256</span>
              <button 
                onClick={() => showToast("Enterprise access request saved for administrator review.")}
                className="text-[9px] font-bold text-amber-400 hover:underline cursor-pointer"
              >
                Configure Settings →
              </button>
            </div>
          </div>

          {/* B. BUSINESS TOOLS DECK */}
          <div className="p-5 rounded-xl border border-white/5 bg-black/60 text-left space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2.5">
              Instant Business Tools
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {businessTools.map((tool, idx) => (
                <button
                  key={idx}
                  onClick={() => showToast(`${tool.name} task saved. No paid service was called.`)}
                  className="p-3 rounded-lg bg-zinc-950 border border-white/5 hover:border-amber-500/20 text-[#EAEAEA] hover:text-amber-400 transition-all flex items-center gap-2.5 cursor-pointer text-left group"
                >
                  <span className="text-amber-500 group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate">
                    {tool.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* C. CAMPAIGN REAL-TIME STATUS & QUEUE */}
          <div className="p-5 rounded-xl border border-white/5 bg-black/40 text-left space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">
                Outbound Activity
              </h4>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-mono border border-amber-500/10">
                100% HEALTH
              </span>
            </div>

            <div className="space-y-3">
              {[
                { title: "Metropolitan Billboard Flyer", category: "Social Channels", time: "In Queue (14 mins left)" },
                { title: "Volcanic Stone Brochure Pack", category: "Social Channels", time: "Published 2h ago" },
                { title: "Gold Masonry Presentation", category: "Email Channels", time: "Draft Saved" }
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-zinc-950/80 border border-white/5 text-[10px] space-y-1">
                  <div className="flex justify-between font-bold text-gray-200">
                    <span className="truncate max-w-[150px]">{item.title}</span>
                    <span className="text-amber-400 text-[8px] font-mono">{item.category}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500">
                    <span>Campaign Asset ID #{4800 + idx}</span>
                    <span>{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D. LIVE ANALYTICS MINICHART */}
          <div className="p-5 rounded-xl border border-white/5 bg-black/60 text-left space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2.5">
              Promotion Reach Analytics
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <span className="block text-lg font-black text-white">482.5K</span>
                <span className="block text-[8px] text-gray-500 uppercase tracking-widest">Total Impressions</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <span className="block text-lg font-black text-emerald-400">+14.2%</span>
                <span className="block text-[8px] text-gray-500 uppercase tracking-widest">Weekly Reach</span>
              </div>
            </div>

            {/* Simulated Micro Bar Chart */}
            <div className="h-10 flex items-end gap-1 px-1 pt-2">
              {[30, 45, 35, 60, 75, 50, 90, 85, 100].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-[#F8B400] rounded-sm group relative"
                  style={{ height: `${h}%`, opacity: 0.3 + (h/100)*0.7 }}
                >
                  {/* Tooltip on hover */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 bg-black border border-white/10 px-1 py-0.5 rounded text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none mb-1">
                    Day {i+1}: {h*10}K
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ─── TOAST FEEDBACK ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-none"
          >
            <div className="px-5 py-3.5 rounded-2xl bg-[#090909] border border-amber-500/40 text-xs font-bold text-gray-100 shadow-2xl flex items-center gap-3 max-w-sm backdrop-blur-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
