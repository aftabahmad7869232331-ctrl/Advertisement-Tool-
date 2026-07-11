import React, { useState } from "react";
import { 
  Menu, 
  X, 
  Sparkles,
} from "lucide-react";
import { ViewType } from "./Sidebar";
import { useTheme } from "../ThemeContext";
import { navbarTools } from "../tools";

// ─── Props Interface ─────────────────────────────────────────────────────────
interface NavbarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
}

// ─── Navbar Keyframes & Special Custom Classes ────────────────────────────────
const KEYFRAMES = `
  @keyframes lineLightSlide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(250%); }
  }
  .navbar-light-shimmer {
    animation: lineLightSlide 4s linear infinite;
  }
  
  /* Underline animation from center outwards */
  .underline-hover-effect {
    position: relative;
  }
  .underline-hover-effect::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--primary-color);
    transition: width 0.3s ease, left 0.3s ease;
    border-radius: 99px;
    box-shadow: 0 0 8px var(--accent-glow);
  }
  .underline-hover-effect:hover::after {
    width: 60%;
    left: 20%;
  }
`;

export function Navbar({ activeView, setActiveView }: NavbarProps) {
  const { theme, currentTheme: activeThemeConfig } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Custom message state for clicking non-views like Support / Services
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Luxury menu navigation items config
  const navItems = navbarTools;

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* ─── MAIN NAVBAR CONTAINER (64px) ────────────────────────────────────── */}
      <nav
        id="premium-luxury-navbar"
        className="w-full sticky top-0 z-40 backdrop-blur-md flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-all duration-300 select-none"
        style={{
          height: "64px",
          backgroundColor: "color-mix(in srgb, var(--bg-elevated) 94%, transparent)",
          borderBottom: "1px solid var(--navbar-border)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.95), 0 0 18px var(--accent-glow)"
        }}
      >
        {/* Soft Theme Glow at the bottom of navbar */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[8px] bg-gradient-to-t from-[var(--primary-color)]/5 to-transparent pointer-events-none"
        />

        {/* Desktop Menu - Centered horizontal navigation with perfect spacing */}
        <div className="hidden md:flex items-center justify-center w-full max-w-none h-full gap-2.5 overflow-visible">
          {navItems.map((item, idx) => {
            const isCustomAction = !!item.action;
            const isCurrentlyActive = !isCustomAction && activeView === item.view;
            
            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    setActiveView(item.view);
                  }
                }}
                className={`flex flex-shrink-0 items-center gap-2 px-4 py-2.5 rounded-[14px] border border-[var(--border-soft)] bg-[var(--bg-panel)]/55 text-[15px] font-bold tracking-[0.2px] transition-all duration-300 relative group cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${
                  isCurrentlyActive
                    ? "bg-[var(--navbar-active-bg)]"
                    : "text-[var(--text-muted)] hover:text-[var(--primary-color)] hover:bg-[var(--navbar-active-bg)] hover:border-[var(--primary-color)]/45 hover:shadow-[0_0_15px_var(--accent-glow)]"
                } underline-hover-effect`}
                style={{
                  // Overwrite background and text dynamically for active/theme coherence
                  backgroundColor: isCurrentlyActive ? "var(--navbar-active-bg)" : undefined,
                  boxShadow: isCurrentlyActive ? "inset 0 0 8px var(--accent-glow), 0 0 10px var(--accent-glow)" : undefined
                }}
              >
                {/* Icon wrapper - scales up slightly on hover */}
                <span className="transform group-hover:scale-110 transition-transform duration-300 text-[var(--primary-color)]">
                  {item.icon}
                </span>

                {/* Text Label - Golden gradient if active, otherwise #EAEAEA */}
                <span 
                  className={`transition-colors duration-300`}
                  style={{
                    backgroundImage: isCurrentlyActive ? "var(--primary-gradient)" : "none",
                    WebkitBackgroundClip: isCurrentlyActive ? "text" : "unset",
                    WebkitTextFillColor: isCurrentlyActive ? "transparent" : "unset"
                  }}
                >
                  {item.label}
                </span>

                {/* 2px glowing golden underline for Active item */}
                {isCurrentlyActive && (
                  <span 
                    className="absolute bottom-1 left-[15%] right-[15%] h-[2px] rounded-full"
                    style={{
                      background: "var(--primary-color)",
                      boxShadow: "0 0 10px var(--primary-color)"
                    }}
                  />
                )}

                {/* Subtle glass highlight reflection inside hover button */}
                <span className="absolute inset-0 rounded-[12px] bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            );
          })}
        </div>

        {/* Mobile View Header - Hamburger icon & Brand Trigger */}
        <div className="flex md:hidden items-center justify-between w-full relative z-50">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-black tracking-widest text-transparent bg-clip-text bg-[image:var(--primary-gradient)]">
              BRICK-MAKER
            </span>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/5">
              Suite
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-lg border border-[var(--primary-color)]/30 bg-[var(--bg-panel)] text-[var(--text-body)] hover:text-[var(--primary-color)] hover:border-[var(--primary-color)] transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile Menu Dropdown Panel (Slide down glass black) ──────────────── */}
        {mobileMenuOpen && (
          <div 
            className="absolute top-[64px] left-0 w-full bg-[var(--bg-elevated)]/98 backdrop-blur-2xl border-b border-[var(--primary-color)]/30 py-4 px-6 flex flex-col gap-2.5 md:hidden z-40 shadow-2xl animate-fade-in"
            style={{
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.95)"
            }}
          >
            {navItems.map((item, idx) => {
              const isCustomAction = !!item.action;
              const isCurrentlyActive = !isCustomAction && activeView === item.view;
              
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setActiveView(item.view);
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all duration-200"
                  style={{
                    backgroundColor: isCurrentlyActive ? "var(--navbar-active-bg)" : "transparent",
                    color: isCurrentlyActive ? "var(--primary-color)" : "var(--text-muted)",
                    borderLeft: isCurrentlyActive ? "3px solid var(--primary-color)" : "3px solid transparent"
                  }}
                >
                  <span className="text-[var(--primary-color)]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Premium Light Strip: Moving left to right under the navbar (2px height) ── */}
        <div 
          className="absolute bottom-0 left-0 w-full h-[2px] overflow-hidden bg-transparent"
        >
          <div 
            className="navbar-light-shimmer absolute top-0 bottom-0 w-[120px]"
            style={{
              background: `linear-gradient(90deg, transparent, var(--primary-color), var(--primary-hover), transparent)`,
              animation: "lineLightSlide 4s linear infinite"
            }}
          />
        </div>
      </nav>

      {/* ─── TOAST NOTIFICATION ──────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-none">
          <div className="px-5 py-3.5 rounded-2xl bg-[var(--bg-body)] border border-[var(--primary-color)]/40 text-xs font-bold text-gray-200 shadow-2xl flex items-center gap-3 max-w-sm backdrop-blur-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)] animate-ping" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}
