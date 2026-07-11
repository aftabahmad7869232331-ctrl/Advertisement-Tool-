import type { ReactNode } from "react";
import { HelmetProvider } from "react-helmet-async";
import { AnimationProvider } from "../animation/AnimationProvider";
import { ThemeProvider } from "../ThemeContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AnimationProvider>
          {children}
        </AnimationProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
