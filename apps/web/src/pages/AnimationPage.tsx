import { motion } from "framer-motion";
import { Pause, Play, RefreshCw, Sparkles } from "lucide-react";
import { useAnimationEngine, type AnimationLevel } from "../animation/AnimationProvider";
import {
  AnimatedBorder,
  AnimatedGrid,
  AuroraBackground,
  BeamLight,
  CountUp,
  FloatingParticles,
  GlowPulse,
  MagneticButton,
  OrbitSystem,
  ScrollReveal,
  StarField,
} from "../components/animations";

const levels: AnimationLevel[] = ["off", "low", "balanced", "full"];

export default function AnimationPage() {
  const engine = useAnimationEngine();

  return (
    <section className="workspace-page space-y-6" key={engine.restartKey}>
      <header className="rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-panel)] p-6 shadow-2xl">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--primary-color)]">
              <Sparkles size={16} /> Animation Engine
            </div>
            <h1 className="text-3xl font-black text-[var(--text-heading)]">Motion Studio</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
              Preview and control every reusable animation from one runtime engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="rounded-xl border border-[var(--border-soft)] px-4 py-2 text-xs font-bold text-[var(--text-body)]" onClick={engine.togglePaused}>
              {engine.paused ? <Play className="mr-2 inline" size={14} /> : <Pause className="mr-2 inline" size={14} />}
              {engine.paused ? "Play" : "Pause"}
            </button>
            <button className="rounded-xl border border-[var(--border-soft)] px-4 py-2 text-xs font-bold text-[var(--text-body)]" onClick={engine.restart}>
              <RefreshCw className="mr-2 inline" size={14} /> Restart
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => engine.setLevel(level)}
                className="rounded-xl border px-4 py-2 text-xs font-bold capitalize"
                style={{
                  borderColor: engine.level === level ? "var(--primary-color)" : "var(--border-soft)",
                  color: engine.level === level ? "var(--primary-color)" : "var(--text-muted)",
                  background: engine.level === level ? "var(--navbar-active-bg)" : "transparent",
                }}
              >
                {level}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-xs font-bold text-[var(--text-muted)]">
            Speed
            <input
              className="w-full accent-[var(--primary-color)]"
              type="range"
              min="0.25"
              max="2"
              step="0.25"
              value={engine.speed}
              onChange={(event) => engine.setSpeed(Number(event.target.value))}
            />
            <span className="w-10 text-[var(--primary-color)]">{engine.speed}×</span>
          </label>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <Preview title="Ambient Backgrounds">
          <AuroraBackground />
          <AnimatedGrid opacity={0.12} />
          <StarField count={28} />
          <BeamLight />
          <FloatingParticles count={14} />
        </Preview>

        <Preview title="Orbit System">
          <div className="flex min-h-64 items-center justify-center"><OrbitSystem /></div>
        </Preview>

        <Preview title="Interaction Engine">
          <div className="flex min-h-64 flex-col items-center justify-center gap-6">
            <GlowPulse className="rounded-2xl"><div className="rounded-2xl border border-[var(--border-soft)] bg-[var(--bg-elevated)] p-8 font-black text-[var(--text-heading)]">Glow Pulse</div></GlowPulse>
            <MagneticButton className="rounded-xl bg-[image:var(--primary-gradient)] px-6 py-3 font-black text-white">Magnetic Button</MagneticButton>
          </div>
        </Preview>

        <Preview title="Reveal & Counter">
          <div className="flex min-h-64 flex-col items-center justify-center gap-7">
            <ScrollReveal><AnimatedBorder className="rounded-2xl"><div className="rounded-2xl bg-[var(--bg-elevated)] p-8 text-center"><div className="text-4xl font-black text-[var(--primary-color)]"><CountUp end={100} suffix="%" /></div><div className="mt-2 text-xs uppercase tracking-widest text-[var(--text-muted)]">Engine Ready</div></div></AnimatedBorder></ScrollReveal>
            <motion.div animate={engine.animate({ rotate: 360 }, { rotate: 0 })} transition={{ duration: engine.duration(3), repeat: engine.paused ? 0 : Infinity, ease: "linear" }} className="h-10 w-10 rounded-xl bg-[image:var(--primary-gradient)]" />
          </div>
        </Preview>
      </div>
    </section>
  );
}

function Preview({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="relative min-h-80 overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-[var(--bg-panel)] p-5">
      <h2 className="relative z-20 text-xs font-black uppercase tracking-[0.18em] text-[var(--text-heading)]">{title}</h2>
      <div className="relative z-10 mt-3">{children}</div>
    </article>
  );
}
