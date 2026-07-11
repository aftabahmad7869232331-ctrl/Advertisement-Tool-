import React, { createContext, useContext, useState, useEffect } from "react";

export interface ThemeConfig {
  id: string;
  name: string;
  icon: string;
  primary: string;
  hover: string;
  gradient: string;
  btnGradient: string;
  navbarBorder: string;
  navbarActiveBg: string;
  shimmer1: string;
  shimmer2: string;
  shimmer3: string;
  glow: string;
  btnText: string;
  bgBody: string;
  bgElevated: string;
  bgPanel: string;
  bgSurface: string;
  borderSoft: string;
  textBody: string;
  textMuted: string;
  textSubtle: string;
  fontFamily: string;
}

export type ThemeMode = "light" | "dark";

function createTheme(
  id: string,
  name: string,
  icon: string,
  primary: string,
  secondary: string,
  accent: string,
  bgBody: string,
  bgPanel: string,
  textBody: string,
  textMuted: string,
): ThemeConfig {
  return {
    id,
    name,
    icon,
    primary,
    hover: accent,
    gradient: `linear-gradient(135deg, ${accent} 0%, ${primary} 48%, ${secondary} 100%)`,
    btnGradient: `linear-gradient(to right, ${primary}, ${secondary})`,
    navbarBorder: `${primary}55`,
    navbarActiveBg: `${primary}22`,
    shimmer1: accent,
    shimmer2: primary,
    shimmer3: secondary,
    glow: `${primary}66`,
    btnText: textBody,
    bgBody,
    bgElevated: bgPanel,
    bgPanel,
    bgSurface: bgBody,
    borderSoft: `${primary}3d`,
    textBody,
    textMuted,
    textSubtle: textMuted,
    fontFamily: '"Inter", "Roboto", "Poppins", sans-serif',
  };
}

export const THEMES: Record<string, ThemeConfig> = {
  sunrise: {
    id: "sunrise",
    name: "Gold",
    icon: "G",
    primary:        "#F8B400",
    hover:          "#FFCC4D",
    gradient:       "linear-gradient(135deg, #FFF1A8 0%, #F8B400 45%, #B7791F 100%)",
    btnGradient:    "linear-gradient(to right, #F8B400, #B7791F)",
    navbarBorder:   "rgba(248, 180, 0, 0.30)",
    navbarActiveBg: "rgba(248, 180, 0, 0.13)",
    shimmer1:       "#FFF1A8",
    shimmer2:       "#F8B400",
    shimmer3:       "#B7791F",
    glow:           "rgba(248, 180, 0, 0.42)",
    btnText:        "#120E05",
    bgBody:         "#070604",
    bgElevated:     "#11100B",
    bgPanel:        "#19150C",
    bgSurface:      "#0D0B07",
    borderSoft:     "rgba(248, 180, 0, 0.20)",
    textBody:       "#FFF9E8",
    textMuted:      "#D7C89E",
    textSubtle:     "#968865",
    fontFamily:     '"Outfit", "Inter", sans-serif',
  },
  black: {
    id: "black",
    name: "Midnight Black",
    icon: "⚫",
    primary:        "#D4D4D8",
    hover:          "#F4F4F5",
    gradient:       "linear-gradient(135deg, #FFFFFF 0%, #A1A1AA 50%, #52525B 100%)",
    btnGradient:    "linear-gradient(to right, #27272A, #52525B)",
    navbarBorder:   "rgba(255, 255, 255, 0.20)",
    navbarActiveBg: "rgba(255, 255, 255, 0.08)",
    shimmer1:       "#FFFFFF",
    shimmer2:       "#A1A1AA",
    shimmer3:       "#52525B",
    glow:           "rgba(255, 255, 255, 0.20)",
    btnText:        "#FFFFFF",
    bgBody:         "#080808",
    bgElevated:     "#111113",
    bgPanel:        "#18181B",
    bgSurface:      "#0C0C0E",
    borderSoft:     "rgba(255, 255, 255, 0.14)",
    textBody:       "#FAFAFA",
    textMuted:      "#C9C9CF",
    textSubtle:     "#8C8C94",
    fontFamily:     '"Space Grotesk", "Inter", sans-serif',
  },
  ocean: createTheme("ocean", "Ocean", "🌊", "#38BDF8", "#0369A1", "#22D3EE", "#071827", "#0F2744", "#E0F2FE", "#7DD3FC"),
  forest: createTheme("forest", "Forest", "🌿", "#4ADE80", "#15803D", "#BEF264", "#071A0D", "#0D2818", "#DCFCE7", "#86EFAC"),
  sunset: createTheme("sunset", "Sunset", "🌅", "#FB923C", "#C2410C", "#FCD34D", "#1C0A00", "#2D1200", "#FFF7ED", "#FDBA74"),
  rose: createTheme("rose", "Rose", "🌹", "#FB7185", "#BE123C", "#FDA4AF", "#190008", "#26000E", "#FFF1F2", "#FDA4AF"),
  "high-contrast": createTheme("high-contrast", "High Contrast", "◐", "#FFFFFF", "#A3A3A3", "#FFFF00", "#000000", "#0A0A0A", "#FFFFFF", "#E5E5E5"),
  dyslexia: {
    ...createTheme("dyslexia", "Dyslexia Friendly", "📖", "#9A9ACA", "#6A6AAA", "#CA9ACA", "#1A1A0A", "#2A2A1A", "#FEFBF0", "#C0B890"),
    fontFamily: '"OpenDyslexic", "Comic Sans MS", sans-serif',
  },
  grape: createTheme("grape", "Grape", "🍇", "#C084FC", "#7E22CE", "#F0ABFC", "#12081F", "#1E1033", "#F3E8FF", "#C084FC"),
  ember: createTheme("ember", "Ember", "🔥", "#F87171", "#991B1B", "#FB923C", "#120303", "#1F0808", "#FEF2F2", "#FCA5A5"),
  sand: createTheme("sand", "Sand", "🌾", "#D6A75F", "#854D0E", "#EAB676", "#181209", "#241B0F", "#F5ECD7", "#C2AB84"),
  cyber: createTheme("cyber", "Cyber", "💎", "#2DD4BF", "#0F766E", "#FF36AB", "#000000", "#0A0F0E", "#E6FFFB", "#5EEAD4"),
  mint: createTheme("mint", "Mint", "🍃", "#5EEAD4", "#0B8457", "#2DD4BF", "#03130D", "#082018", "#D7F9EC", "#7DFCD0"),
};

interface ThemeContextType {
  theme: string;
  setTheme: (id: string) => void;
  mode: ThemeMode;
  toggleMode: () => void;
  themes: Record<string, ThemeConfig>;
  currentTheme: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(config: ThemeConfig, themeId: string, mode: ThemeMode) {
  const root = document.documentElement;
  const pageBackground = [
    `radial-gradient(circle at 12% 0%, color-mix(in srgb, ${config.primary} 22%, transparent), transparent 34rem)`,
    `radial-gradient(circle at 88% 14%, color-mix(in srgb, ${config.hover} 16%, transparent), transparent 30rem)`,
    `linear-gradient(145deg, color-mix(in srgb, ${config.bgPanel} 72%, ${config.bgBody}), ${config.bgBody} 58%)`,
  ].join(", ");
  const variables: Record<string, string> = {
    "--primary-color": config.primary,
    "--primary-hover": config.hover,
    "--primary-gradient": config.gradient,
    "--primary-btn-gradient": config.btnGradient,
    "--navbar-border": config.navbarBorder,
    "--navbar-active-bg": config.navbarActiveBg,
    "--text-shimmer-color1": config.shimmer1,
    "--text-shimmer-color2": config.shimmer2,
    "--text-shimmer-color3": config.shimmer3,
    "--accent-glow": config.glow,
    "--btn-text": config.btnText,
    "--bg-body": config.bgBody,
    "--bg-elevated": config.bgElevated,
    "--bg-panel": config.bgPanel,
    "--bg-surface": config.bgSurface,
    "--border-soft": config.borderSoft,
    "--text-body": config.textBody,
    "--text-muted": config.textMuted,
    "--text-subtle": config.textSubtle,
    "--font-family-current": config.fontFamily,
    "--page-theme-background": pageBackground,
    /* Shared aliases used by the newer page and component system. */
    "--color-primary": config.primary,
    "--color-secondary": config.hover,
    "--color-accent": config.shimmer1,
    "--color-background": config.bgBody,
    "--color-surface": config.bgPanel,
    "--color-text": config.textBody,
    "--color-text-muted": config.textMuted,
    "--color-border": config.borderSoft,
    "--font-family": config.fontFamily,
  };

  Object.entries(variables).forEach(([property, value]) => root.style.setProperty(property, value));
  root.style.background = pageBackground;
  root.style.color = config.textBody;
  root.style.fontFamily = config.fontFamily;
  document.body.style.background = pageBackground;
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.color = config.textBody;
  document.body.style.fontFamily = config.fontFamily;
  root.style.colorScheme = mode;
  root.dataset.theme = themeId;
  root.dataset.mode = mode;
  root.classList.toggle("dark", mode === "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("brick-maker-theme");
      if (saved === "gold") return "sunrise";
      return saved && THEMES[saved] ? saved : "black";
    } catch { return "black"; }
  });
  const [mode, setMode] = useState<ThemeMode>(() => {
    return "dark";
  });

  const setTheme = (id: string) => {
    const nextTheme = THEMES[id];
    if (!nextTheme) return;
    applyTheme(nextTheme, id, mode);
    setThemeState(id);
    try { localStorage.setItem("brick-maker-theme", id); }
    catch { /* private browsing */ }
  };
  const toggleMode = () => setMode((current) => current === "dark" ? "light" : "dark");

  const baseTheme = THEMES[theme] ?? THEMES.black;
  const currentTheme: ThemeConfig = baseTheme;

  useEffect(() => {
    applyTheme(currentTheme, theme, mode);

    try { localStorage.setItem("brick-maker-theme", theme); }
    catch { /* private browsing */ }
    try { localStorage.setItem("brick-maker-theme-mode", mode); }
    catch { /* private browsing */ }
  }, [theme, mode, currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mode, toggleMode, themes: THEMES, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
