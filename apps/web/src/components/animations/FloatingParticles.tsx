import { motion } from "framer-motion";
import { useMemo } from "react";

type FloatingParticlesProps = { count?: number; className?: string };

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }

export default function FloatingParticles({ count = 90, className = "" }: FloatingParticlesProps) {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: rand(0, 100),
    top: rand(0, 100),
    size: rand(2, 6),
    delay: rand(0, 8),
    duration: rand(8, 22),
    x: rand(-80, 80),
    y: rand(-70, 70),
  })), [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-yellow-300 shadow-[0_0_18px_rgba(250,204,21,.9)]"
          style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size }}
          animate={{ x: [0, p.x, 0], y: [0, p.y, 0], opacity: [0.15, 1, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
