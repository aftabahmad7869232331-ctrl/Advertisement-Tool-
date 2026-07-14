import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { workspaceApi, type LocalActionRecord } from "../services/workspaceApi";
import { downloadFile } from "../utils/downloadFile";
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
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activityMode, setActivityMode] = useState<"queue" | "history">("queue");
  const [activityRecords, setActivityRecords] = useState<LocalActionRecord[]>(() => workspaceApi.localActions("growth"));

  const showToast = (msg: string, action = "ui-action", payload: Record<string, unknown> = {}) => {
    setToastMessage(msg);
    void workspaceApi.action("growth", action, { ...payload, message: msg }).catch(() => undefined);
    setActivityRecords(workspaceApi.localActions("growth"));
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openActivity = (mode: "queue" | "history") => {
    setActivityMode(mode);
    setActivityRecords(workspaceApi.localActions("growth"));
    window.setTimeout(() => document.getElementById("growth-activity")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  };

  const handleWorkspaceControl = (action: string) => {
    if (action === "Publishing Queue") {
      openActivity("queue");
      return;
    }
    if (action === "Promotion History") {
      openActivity("history");
      return;
    }
    if (action === "Campaign Manager") {
      setActiveCategory("marketing");
      showToast("Campaign Manager opened in the Marketing workspace.", "campaign-manager-opened");
      return;
    }

    const scheduledFor = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    showToast("Promotion scheduled locally for one hour from now.", "promotion-scheduled", {
      channel: selectedChannel ?? "all-connected",
      scheduledFor,
    });
    openActivity("queue");
  };

  const handleBusinessTool = async (toolName: string) => {
    const timestamp = new Date().toISOString();

    if (toolName === "QR Generator") {
      const value = window.prompt("QR code ke liye URL ya text enter karein:", window.location.origin);
      if (!value?.trim()) return;
      const { default: QRCode } = await import("qrcode");
      const dataUrl = await QRCode.toDataURL(value.trim(), {
        width: 1024,
        margin: 2,
        color: { dark: "#090909", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      const anchor = document.createElement("a");
      anchor.href = dataUrl;
      anchor.download = "brick-maker-qr.png";
      anchor.click();
      showToast("QR code generated and downloaded locally.", "business-tool-generated", { tool: toolName, value });
      return;
    }

    if (toolName === "Barcode Generator") {
      const value = window.prompt("Barcode ke liye product code enter karein:", "BRICK-2026-001");
      if (!value?.trim()) return;
      const { default: JsBarcode } = await import("jsbarcode");
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      JsBarcode(svg, value.trim(), { format: "CODE128", displayValue: true, background: "#ffffff", lineColor: "#090909", margin: 24 });
      downloadFile("brick-maker-barcode.svg", new XMLSerializer().serializeToString(svg), "image/svg+xml;charset=utf-8");
      showToast("CODE128 barcode generated and downloaded locally.", "business-tool-generated", { tool: toolName, value });
      return;
    }

    if (toolName === "Digital Visiting Card") {
      downloadFile("brick-maker-contact.vcf", [
        "BEGIN:VCARD", "VERSION:3.0", "FN:Brick-Maker Studio", "ORG:Brick-Maker Studio",
        "TITLE:Creative Business Workspace", "EMAIL:contact@brickmaker.studio",
        `URL:${window.location.origin}`, "END:VCARD", "",
      ].join("\r\n"), "text/vcard;charset=utf-8");
    } else if (toolName === "Invoice Generator") {
      downloadFile("invoice-template.csv", "Invoice ID,Date,Customer,Description,Quantity,Unit Price,Tax,Total,Status\nINV-NEW,,,,1,0,0,0,Draft\n", "text/csv;charset=utf-8");
    } else if (toolName === "Business Profile") {
      downloadFile("business-profile.json", JSON.stringify({
        businessName: "Brick-Maker Studio", industry: "", email: "", phone: "", website: window.location.origin,
        address: "", description: "", updatedAt: timestamp,
      }, null, 2), "application/json;charset=utf-8");
    } else if (toolName === "Business Documents") {
      downloadFile("business-documents-checklist.md", "# Business Documents Checklist\n\n- [ ] Business registration\n- [ ] Tax registration\n- [ ] Brand guidelines\n- [ ] Product catalogue\n- [ ] Price list\n- [ ] Terms and conditions\n- [ ] Privacy policy\n- [ ] Invoice template\n");
    } else if (toolName === "Marketing Reports") {
      const rows = workspaceApi.localActions("growth").map((item) => [item.createdAt, item.action, item.synced ? "synced" : "local"]);
      downloadFile("growth-activity-report.csv", ["created_at,action,status", ...rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))].join("\n"), "text/csv;charset=utf-8");
    } else {
      downloadFile("brick-maker-download-center.json", JSON.stringify({ exportedAt: timestamp, actions: workspaceApi.localActions() }, null, 2), "application/json;charset=utf-8");
    }

    showToast(`${toolName} file generated and downloaded locally.`, "business-tool-generated", { tool: toolName });
  };

  const handlePublishAll = () => {
    showToast("Promotion saved to the local queue. Connect a platform before publishing externally.", "campaign-publish-queued", {
      channel: selectedChannel ?? "unassigned",
    });
    openActivity("queue");
  };

  // Connected Channel Categories (no platform names as strictly forbidden)
  const connectedChannels = ["Social Channels", "Video Channels", "Messaging Channels", "Business Listings", "Website Channels", "Community Channels", "Email Channels", "Custom Channels"].map((name, index) => ({
    id: `channel-${index + 1}`, name, status: "Not connected", accounts: 0, queue: 0, reach: "—", glow: "rgba(248,180,0,0.15)",
  }));

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
                    onClick={() => showToast("Connector setup request saved. Platforms can be authorized from Admin Settings.", "connector-setup-requested")}
                    className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-[10px] tracking-wider uppercase transition-all cursor-pointer border border-white/5"
                  >
                    Connect Platforms
                  </button>
                  <button 
                    onClick={handlePublishAll}
                    className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-[10px] tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(248,180,0,0.2)] cursor-pointer"
                  >
                    Queue Promotion
                  </button>
                </div>
              </div>

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
                      <span className="w-2 h-2 rounded-full bg-gray-600" />
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
                    onClick={() => handleWorkspaceControl(action)}
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
                        onClick={() => showToast(`Print quote request saved for ${srv.name}.`, "print-quote-requested", { service: srv.name, price: srv.price, speed: srv.speed })}
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
                        onClick={() => showToast(`Consultation request saved for ${srv.name}.`, "branding-service-requested", { service: srv.name })}
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
                        onClick={() => showToast(`Website service request saved for ${srv.name}.`, "website-service-requested", { service: srv.name })}
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
                        onClick={() => showToast(`Strategy task saved for ${srv.name}.`, "marketing-strategy-scheduled", { service: srv.name })}
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
                onClick={() => showToast("Enterprise access request saved for administrator review.", "admin-access-requested")}
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
                  onClick={() => { void handleBusinessTool(tool.name); }}
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
          <div id="growth-activity" className="p-5 rounded-xl border border-white/5 bg-black/40 text-left space-y-4 scroll-mt-28">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">
                Outbound Activity
              </h4>
              <div className="flex gap-1">
                <button type="button" onClick={() => openActivity("queue")} className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${activityMode === "queue" ? "bg-amber-500 text-black" : "bg-white/5 text-gray-400"}`}>Queue</button>
                <button type="button" onClick={() => openActivity("history")} className={`px-2 py-1 rounded text-[8px] font-bold uppercase ${activityMode === "history" ? "bg-amber-500 text-black" : "bg-white/5 text-gray-400"}`}>History</button>
              </div>
            </div>

            <div className="space-y-3">
              {(activityMode === "queue" ? activityRecords.filter((item) => !item.synced) : activityRecords).slice(0, 8).map((item) => {
                const payload = item.payload && typeof item.payload === "object" ? item.payload as Record<string, unknown> : {};
                return (
                <div key={item.id} className="p-3 rounded-lg bg-zinc-950/80 border border-white/5 text-[10px] space-y-1">
                  <div className="flex justify-between font-bold text-gray-200">
                    <span className="truncate max-w-[165px]">{String(payload.message ?? item.action)}</span>
                    <span className={`text-[8px] font-mono ${item.synced ? "text-emerald-400" : "text-amber-400"}`}>{item.synced ? "SYNCED" : "LOCAL"}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-500">
                    <span className="truncate max-w-[130px]">{item.action.replaceAll("-", " ")}</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              );})}
              {(activityMode === "queue" ? activityRecords.filter((item) => !item.synced) : activityRecords).length === 0 && (
                <div className="p-4 rounded-lg border border-dashed border-white/10 text-[10px] text-gray-500 text-center">
                  {activityMode === "queue" ? "No pending local tasks." : "No growth activity recorded yet."}
                </div>
              )}
            </div>
          </div>

          {/* D. LOCAL ACTIVITY METRICS */}
          <div className="p-5 rounded-xl border border-white/5 bg-black/60 text-left space-y-3.5">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2.5">
              Local Promotion Activity
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <span className="block text-lg font-black text-white">{activityRecords.length}</span>
                <span className="block text-[8px] text-gray-500 uppercase tracking-widest">Recorded Actions</span>
              </div>
              <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                <span className="block text-lg font-black text-amber-400">{activityRecords.filter((item) => !item.synced).length}</span>
                <span className="block text-[8px] text-gray-500 uppercase tracking-widest">Pending Locally</span>
              </div>
            </div>

            <p className="text-[9px] text-gray-500">External reach and impression analytics will appear only after a publishing connector is configured.</p>
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
