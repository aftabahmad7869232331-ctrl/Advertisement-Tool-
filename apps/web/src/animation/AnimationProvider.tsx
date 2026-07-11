import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useReducedMotion, type TargetAndTransition, type Transition } from "framer-motion";

export type AnimationLevel = "off" | "low" | "balanced" | "full";

type MotionValue = TargetAndTransition | undefined;

interface AnimationEngine {
  level: AnimationLevel;
  setLevel: (level: AnimationLevel) => void;
  enabled: boolean;
  intensity: number;
  paused: boolean;
  speed: number;
  restartKey: number;
  setPaused: (paused: boolean) => void;
  togglePaused: () => void;
  setSpeed: (speed: number) => void;
  restart: () => void;
  duration: (seconds: number) => number;
  repeat: number;
  transition: (seconds?: number, extra?: Transition) => Transition;
  animate: (value: MotionValue, fallback?: MotionValue) => MotionValue;
  hover: (value: MotionValue) => MotionValue;
  tap: (value: MotionValue) => MotionValue;
}

const STORAGE_KEY = "brick-maker-animation-level";

const LEVEL_INTENSITY: Record<AnimationLevel, number> = {
  off: 0,
  low: 0.35,
  balanced: 0.7,
  full: 1,
};

const AnimationContext = createContext<AnimationEngine | undefined>(undefined);

function readInitialLevel(): AnimationLevel {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as AnimationLevel | null;
    if (saved && saved in LEVEL_INTENSITY) return saved;
  } catch {
    // localStorage can fail in private browsing.
  }
  return "balanced";
}

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion();
  const [selectedLevel, setSelectedLevel] = useState<AnimationLevel>(readInitialLevel);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const [restartKey, setRestartKey] = useState(0);
  const level = selectedLevel;
  const intensity = LEVEL_INTENSITY[level];
  const enabled = intensity > 0;

  const setLevel = useCallback((nextLevel: AnimationLevel) => {
    setSelectedLevel(nextLevel);
    try {
      localStorage.setItem(STORAGE_KEY, nextLevel);
    } catch {
      // Keep runtime setting even if persistence is unavailable.
    }
  }, []);
  const togglePaused = useCallback(() => setPaused((value) => !value), []);
  const setSpeed = useCallback((value: number) => {
    setSpeedState(Math.min(2, Math.max(0.25, value)));
  }, []);
  const restart = useCallback(() => setRestartKey((value) => value + 1), []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.motion = level;
    root.style.setProperty("--motion-intensity", String(intensity));
    root.style.setProperty("--motion-duration-scale", enabled ? String(0.35 + intensity * 0.65) : "0");
    root.dataset.prefersReducedMotion = prefersReducedMotion ? "true" : "false";
    root.dataset.motionPaused = paused ? "true" : "false";
    root.style.setProperty("--motion-speed", String(speed));
    root.style.setProperty("--motion-play-state", paused ? "paused" : "running");
  }, [enabled, intensity, level, paused, prefersReducedMotion, speed]);

  const engine = useMemo<AnimationEngine>(() => {
    const duration = (seconds: number) => {
      if (!enabled) return 0.01;
      return Math.max(0.08, (seconds * (0.35 + intensity * 0.65)) / speed);
    };

    return {
      level,
      setLevel,
      enabled,
      intensity,
      paused,
      speed,
      restartKey,
      setPaused,
      togglePaused,
      setSpeed,
      restart,
      duration,
      repeat: enabled && level === "full" ? Infinity : 0,
      transition: (seconds = 0.35, extra = {}) => ({
        duration: duration(seconds),
        ease: [0.22, 1, 0.36, 1],
        ...extra,
      }),
      animate: (value, fallback) => (enabled && !paused ? value : fallback),
      hover: (value) => (enabled && !paused && intensity >= 0.55 ? value : undefined),
      tap: (value) => (enabled && !paused ? value : undefined),
    };
  }, [enabled, intensity, level, paused, restart, restartKey, setLevel, setSpeed, speed, togglePaused]);

  return <AnimationContext.Provider value={engine}>{children}</AnimationContext.Provider>;
}

export function useAnimationEngine() {
  const context = useContext(AnimationContext);
  if (!context) throw new Error("useAnimationEngine must be used within AnimationProvider");
  return context;
}
