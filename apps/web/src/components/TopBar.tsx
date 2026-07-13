import React, { useState } from "react";
import { ViewType } from "./Sidebar";
import brandLogo from "../assets/brick-maker-brand.png";
import { Sparkles, ShieldCheck, ChevronDown, Check, Rocket, Palette, Video, FileText, TrendingUp, Globe, Zap } from "lucide-react";
import { useTheme, ThemeConfig } from "../ThemeContext";

// ─── Props Interface ─────────────────────────────────────────────────────────
interface TopBarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

// ─── Custom Dynamic Keyframe Stylesheets ─────────────────────────────────────
const KEYFRAMES = `
  @keyframes topbarShineEffect {
    0% { transform: translate(-100%, -50%) rotate(25deg); }
    40%, 100% { transform: translate(160%, -50%) rotate(25deg); }
  }
  @keyframes goldTextShimmerEffect {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes particleFloating {
    0%, 100% { opacity: 0.15; transform: translateY(0) scale(0.9); }
    50% { opacity: 0.65; transform: translateY(-6px) scale(1.1); }
  }
  @keyframes lineLightSlideEffect {
    0% { left: -50%; }
    100% { left: 100%; }
  }
  @keyframes logoPulseEffect {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px var(--accent-glow)); }
    50% { transform: scale(1.02); filter: drop-shadow(0 0 14px var(--accent-glow)); }
  }
  @keyframes adminBtnShimmer {
    0% { left: -100%; }
    100% { left: 150%; }
  }
  .animate-topbar-glow-shimmer::after {
    content: '';
    position: absolute;
    top: 50%;
    left: -150%;
    width: 50%;
    height: 300%;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.03) 30%,
      color-mix(in srgb, var(--primary-color) 12%, transparent) 50%,
      rgba(255, 255, 255, 0.03) 70%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: translate(-50%, -50%) rotate(25deg);
    animation: topbarShineEffect 10s cubic-bezier(0.4, 0, 0.2, 1) infinite;
    pointer-events: none;
  }
  .shimmer-active {
    background-size: 200% auto;
    animation: goldTextShimmerEffect 4s ease infinite;
  }
  .logo-glow-pulsing {
    animation: logoPulseEffect 5s ease-in-out infinite;
  }
  .light-strip-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
  }
  .light-strip-shimmer {
    position: absolute;
    top: 0;
    height: 100%;
    width: 40%;
    background: linear-gradient(90deg, transparent, var(--primary-color), transparent);
    animation: lineLightSlideEffect 4s linear infinite;
  }

  /* Universal Accent and Color Overrides to theme the entire UI instantly */
  .text-amber-400, .text-amber-300, .group-hover\\:text-amber-300:hover, .group-hover\\:text-amber-400:hover {
    color: var(--primary-color) !important;
  }
  .bg-amber-400, .bg-amber-500 {
    background-color: var(--primary-color) !important;
  }
  .bg-amber-500\\/10 {
    background-color: color-mix(in srgb, var(--primary-color) 10%, transparent) !important;
  }
  .bg-amber-500\\/15 {
    background-color: color-mix(in srgb, var(--primary-color) 15%, transparent) !important;
  }
  .bg-amber-400\\/10 {
    background-color: color-mix(in srgb, var(--primary-color) 10%, transparent) !important;
  }
  .border-amber-400, .border-amber-500 {
    border-color: var(--primary-color) !important;
  }
  .border-amber-500\\/10 {
    border-color: color-mix(in srgb, var(--primary-color) 10%, transparent) !important;
  }
  .border-amber-500\\/20 {
    border-color: color-mix(in srgb, var(--primary-color) 20%, transparent) !important;
  }
  .hover\\:border-amber-400:hover {
    border-color: var(--primary-color) !important;
  }
  .hover\\:bg-amber-400:hover {
    background-color: var(--primary-color) !important;
  }
  .shadow-amber-400\\/10 {
    box-shadow: 0 4px 12px color-mix(in srgb, var(--primary-color) 10%, transparent) !important;
  }
  .text-amber-500\\/40 {
    color: color-mix(in srgb, var(--primary-color) 40%, transparent) !important;
  }
  .from-\\[\\#1c1305\\] {
    --tw-gradient-from: color-mix(in srgb, var(--primary-color) 10%, #030303) !important;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, var(--tw-gradient-from)) !important;
  }
  .via-\\[\\#100b03\\] {
    --tw-gradient-via: color-mix(in srgb, var(--primary-color) 3%, #030303) !important;
    --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to, var(--tw-gradient-via)) !important;
  }
  .to-\\[\\#1c1305\\] {
    --tw-gradient-to: color-mix(in srgb, var(--primary-color) 10%, #030303) !important;
  }
  
  /* Support for Navbar elements and custom inline styling replacements */
  [style*="rgb(253, 211, 77)"], [style*="rgb(253,211,77)"] {
    color: var(--primary-color) !important;
  }
  [style*="rgba(251, 191, 36, 0.12)"], [style*="rgba(251,191,36,0.12)"] {
    background: var(--navbar-active-bg) !important;
  }
  [style*="rgba(251, 191, 36, 0.35)"], [style*="rgba(251,191,36,0.35)"] {
    border-color: var(--navbar-border) !important;
  }
  [style*="rgba(251, 191, 36, 0.18)"], [style*="rgba(251,191,36,0.18)"] {
    border-color: var(--navbar-border) !important;
  }
  [style*="rgba(251, 191, 36, 0.30)"], [style*="rgba(251,191,36,0.30)"] {
    border-color: var(--navbar-border) !important;
  }
  [style*="rgba(251, 191, 36, 0.10)"], [style*="rgba(251,191,36,0.10)"] {
    background: var(--navbar-active-bg) !important;
  }
  [style*="rgba(251, 191, 36, 0.08)"], [style*="rgba(251,191,36,0.08)"] {
    background: var(--navbar-active-bg) !important;
  }
  [style*="rgba(251, 191, 36, 0.65)"], [style*="rgba(251,191,36,0.65)"] {
    background: var(--primary-color) !important;
  }
  [style*="rgba(251, 191, 36, 0.25)"], [style*="rgba(251,191,36,0.25)"] {
    background: var(--primary-hover) !important;
  }
  [style*="rgba(251, 191, 36, 0.08)"], [style*="rgba(251,191,36,0.08)"] {
    box-shadow: 0 4px 24px var(--accent-glow) !important;
  }
  @keyframes marqueeScrollEffect {
    0% { transform: translate3d(0, 0, 0); }
    100% { transform: translate3d(-50%, 0, 0); }
  }
  .marquee-content-track {
    display: flex;
    width: max-content;
    animation: marqueeScrollEffect 28s linear infinite;
  }
  .marquee-content-track:hover {
    animation-play-state: paused;
  }
`;

export function TopBar({ activeView, setActiveView }: TopBarProps) {
  const { theme: activeTheme, setTheme: setActiveTheme, themes: THEMES, currentTheme: activeThemeConfig } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Items for bottom strip marquee
  const stripItems = [
    { icon: <Rocket size={14} className="text-[var(--primary-color)]" />, label: "Fast Performance" },
    { icon: <Palette size={14} className="text-[var(--primary-color)]" />, label: "Professional Templates" },
    { icon: <Video size={14} className="text-[var(--primary-color)]" />, label: "Video Creator" },
    { icon: <FileText size={14} className="text-[var(--primary-color)]" />, label: "Pamphlet Designer" },
    { icon: <TrendingUp size={14} className="text-[var(--primary-color)]" />, label: "Marketing Analytics" },
    { icon: <Globe size={14} className="text-[var(--primary-color)]" />, label: "Multi-Language Support" },
    { icon: <Zap size={14} className="text-[var(--primary-color)]" />, label: "Cloud Workspace" },
  ];

  // Repeat items for seamless continuous looping marquee
  const doubledItems = [...stripItems, ...stripItems, ...stripItems, ...stripItems];

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ─── MAIN 78PX ENTERPRISE TOPBAR ──────────────────────────────────────── */}
      <header
        id="premium-enterprise-topbar"
        className="w-full relative bg-[var(--bg-body)] backdrop-blur-2xl flex items-center justify-between gap-2 px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-16 z-50 animate-topbar-glow-shimmer transition-all duration-300"
        style={{
          height: "78px",
          borderBottom: `1px solid ${activeThemeConfig.navbarBorder}`,
          boxShadow: "0 8px 40px rgba(0, 0, 0, 0.95), inset 0 1px 0 0 rgba(255, 255, 255, 0.04), 0 0 0 1px rgba(255, 255, 255, 0.02)"
        }}
      >
        {/* Enhanced Soft Golden/Theme Reflection Backdrop Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary-color)]/4 to-transparent opacity-50 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--primary-color) 4%, transparent) 50%, transparent 100%)"
          }}
        />

        {/* Tiny Ambient Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
          <div
            className="absolute top-4 left-[20%] w-[1.5px] h-[1.5px] bg-[var(--primary-color)] rounded-full"
            style={{ animation: "particleFloating 6s infinite ease-in-out" }}
          />
          <div
            className="absolute bottom-5 left-[42%] w-[2px] h-[2px] bg-[var(--primary-color)] rounded-full"
            style={{ animation: "particleFloating 5s infinite ease-in-out", animationDelay: "1.5s" }}
          />
          <div
            className="absolute top-5 right-[35%] w-[1.5px] h-[1.5px] bg-[var(--primary-color)] rounded-full"
            style={{ animation: "particleFloating 7s infinite ease-in-out", animationDelay: "3s" }}
          />
          <div
            className="absolute bottom-4 right-[15%] w-[2px] h-[2px] bg-[var(--primary-color)] rounded-full"
            style={{ animation: "particleFloating 4s infinite ease-in-out", animationDelay: "0.8s" }}
          />
        </div>

        {/* ── LEFT SECTION: Brand Logo & Title stack (With 20px horizontal gap) ── */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 lg:gap-5 relative z-10" id="topbar-left-section">
          
          {/* Logo container with enhanced radial background glow */}
          <div className="relative flex-shrink-0">
            {/* Enhanced radial glow behind logo with pulsing effect */}
            <div
              className="absolute inset-0 rounded-full blur-[20px] opacity-60 transition-all duration-500 animate-pulse-slow"
              style={{
                background: `radial-gradient(circle, var(--primary-color) 0%, transparent 75%)`
              }}
            />

            {/* Official 56x56 Metallic Logo with enhanced border and glow */}
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl bg-[#030303] border-2 border-[var(--primary-color)]/40 flex items-center justify-center overflow-hidden shadow-2xl logo-glow-pulsing relative group transition-all duration-300 hover:scale-105 hover:border-[var(--primary-color)]/60"
              style={{
                boxShadow: "inset 0 0 12px rgba(0, 0, 0, 0.95), 0 0 20px rgba(0, 0, 0, 0.6), 0 0 30px var(--accent-glow)"
              }}
            >
              <img
                src={brandLogo}
                alt="Brick-Maker Studio Logo"
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Typography Grid Stack */}
          <div className="flex min-w-0 flex-col justify-center text-left">
            {/* Brand Title: 34px, weight 800, metallic gradient with enhanced glow */}
            <h1
              className="block truncate whitespace-nowrap bg-clip-text text-[17px] font-extrabold leading-none tracking-tight text-transparent select-none shimmer-active sm:text-[22px] lg:text-[34px]"
              style={{
                textShadow: "0 0 25px rgba(248, 180, 0, 0.5), 0 0 40px rgba(248, 180, 0, 0.3)",
                backgroundImage: "linear-gradient(135deg, var(--text-shimmer-color1) 0%, var(--text-shimmer-color2) 50%, var(--text-shimmer-color3) 100%)",
                filter: "drop-shadow(0 0 8px var(--accent-glow))"
              }}
            >
              BRICK-MAKER STUDIO
            </h1>
            
            {/* Subtitle: 16px, weight 600, enhanced color with glow */}
            <span
              className="mt-1.5 hidden truncate whitespace-nowrap text-[11px] font-semibold leading-none tracking-[1px] text-[#D4D4D4] min-[520px]:block lg:mt-2 lg:text-[16px] lg:tracking-[1.5px]"
              style={{
                textShadow: "0 0 10px rgba(255, 255, 255, 0.15)"
              }}
            >
              All-in-One Creative Business Platform
            </span>

          </div>

        </div>

        {/* ── CENTER SECTION: Perfectly Empty, High-End Luxury SaaS Negative Space ── */}
        <div className="hidden lg:flex flex-1 items-center justify-center" id="topbar-center-section">
          {/* Kept fully empty for clean enterprise whitespace elegance */}
        </div>

        {/* ── RIGHT SECTION: Actions (Only Theme Dropdown and Admin Button) ──── */}
        <div className="flex flex-shrink-0 items-center gap-2 lg:gap-4 relative z-10" id="topbar-right-section">
          
          {/* 1. Theme Button Trigger with enhanced styling */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="relative flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-xl border px-0 text-[13px] font-bold transition-all duration-300 hover:scale-105 hover:border-[var(--primary-color)] hover:shadow-[0_0_20px_var(--accent-glow),_0_4px_12px_rgba(0,0,0,0.3)] sm:w-[116px] sm:justify-between sm:px-3 lg:h-[46px] lg:w-[140px] lg:rounded-[14px] lg:px-4"
              style={{
                backgroundColor: "var(--bg-elevated)",
                borderColor: "var(--border-soft)",
                color: "var(--text-body)",
                boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 2px 8px rgba(0,0,0,0.2)"
              }}
              aria-label="Choose theme"
            >
              {/* Enhanced glass sheen effect */}
              <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-white/[0.06] transition-all" />
              
              <div className="flex items-center gap-2.5 relative z-10">
                <span
                  className="h-4 w-4 rounded-full border-2 border-white/40 shadow-[0_0_15px_var(--accent-glow)] group-hover:scale-110 transition-transform"
                  style={{ background: activeThemeConfig.gradient }}
                />
                <span className="hidden tracking-wide sm:inline">{activeThemeConfig.name.split(" ")[0]}</span>
              </div>
              <ChevronDown 
                size={14} 
                className={`relative z-10 hidden text-gray-400 transition-transform duration-300 group-hover:text-[var(--primary-color)] sm:block ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Premium Theme Dropdown Dialog with Glass Morphism */}
            {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2.5 max-h-[min(72vh,620px)] w-[280px] overflow-y-auto rounded-[14px] border backdrop-blur-xl py-2.5 shadow-2xl shadow-black/90 z-[9999] animate-fade-in"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--bg-elevated) 94%, transparent)",
                    borderColor: "var(--border-soft)",
                    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.95), inset 0 1px 0 0 rgba(255, 255, 255, 0.03)"
                  }}
                >
                  <div className="px-3.5 py-1.5 border-b border-[var(--border-soft)] mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Theme Palette</span>
                    <Sparkles size={11} className="text-[var(--primary-color)] animate-pulse" />
                  </div>

                  {Object.values(THEMES).map((t: ThemeConfig) => {
                    const isSelected = activeTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setActiveTheme(t.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-[calc(100%-12px)] mx-1.5 px-3 py-2.5 rounded-lg text-xs flex items-center justify-between text-left transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-white/[0.04] text-[var(--primary-color)] font-bold border border-[var(--primary-color)]/10" 
                            : "text-[var(--text-muted)] hover:text-[var(--text-body)] hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className="h-7 w-7 rounded-lg border border-white/10 shadow-inner"
                            style={{ background: t.gradient }}
                          />
                          <span className="flex flex-col min-w-0">
                            <span className="font-bold truncate">{t.name}</span>
                            <span className="text-[10px] font-medium text-[var(--text-subtle)] truncate">
                              {t.fontFamily.includes("Space") ? "Sharp workspace" : "Warm studio"}
                            </span>
                          </span>
                        </div>
                        {isSelected && (
                          <Check size={14} className="text-[var(--primary-color)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
            )}
          </div>

          {/* 2. Admin Button with enhanced styling */}
          <button
            onClick={() => setActiveView("dashboard")}
            className="relative flex h-11 w-11 cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-xl px-0 text-[13px] font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 sm:w-auto sm:px-4 lg:h-[50px] lg:rounded-[14px] lg:px-8"
            style={{
              background: "var(--primary-btn-gradient)",
              color: "var(--btn-text)",
              letterSpacing: "1.2px",
              boxShadow: "0 6px 24px var(--accent-glow), inset 0 1px 0 0 rgba(255, 255, 255, 0.25), 0 2px 8px rgba(0,0,0,0.3)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 10px 30px var(--accent-glow), inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 4px 12px rgba(0,0,0,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 6px 24px var(--accent-glow), inset 0 1px 0 0 rgba(255, 255, 255, 0.25), 0 2px 8px rgba(0,0,0,0.3)";
            }}
          >
            {/* Shimmer reflection highlight moving across admin button */}
            <div 
              className="absolute top-0 bottom-0 left-[-100%] w-[40px] bg-white/25 skew-x-[-25deg] transition-all pointer-events-none"
              style={{
                animation: "adminBtnShimmer 2.5s infinite linear",
                animationDelay: "0.5s"
              }}
            />

            <ShieldCheck size={15} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

        </div>

        {/* ── Animated 2px Golden/Theme-colored Light Strip below Topbar ─────── */}
        <div className="light-strip-container">
          <div className="light-strip-shimmer" />
        </div>
      </header>

      {/* ─── BOTTOM 40PX PREMIUM MARQUEE STRIP ────────────────────────────────── */}
      <section 
        id="premium-marquee-strip"
        className="w-full relative bg-[var(--bg-body)] border-b border-[var(--primary-color)]/15 flex items-center overflow-hidden z-40"
        style={{ 
          height: "40px" 
        }}
      >
        <div className="w-full h-full flex items-center relative overflow-hidden">
          
          {/* Outer track wrapper */}
          <div className="marquee-content-track pl-6">
            {doubledItems.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 px-7 py-1 select-none flex-shrink-0"
              >
                {/* Golden / Theme-colored Icon */}
                <span className="flex-shrink-0 transform scale-105">
                  {item.icon}
                </span>
                
                {/* Silver Label */}
                <span className="text-[11px] font-bold text-[#BDBDBD] uppercase tracking-wider whitespace-nowrap">
                  {item.label}
                </span>
                
                {/* Small Spacer Dot */}
                <span className="w-1 h-1 bg-[var(--primary-color)]/30 rounded-full ml-4" />
              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
