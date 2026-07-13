import { motion } from "framer-motion";
import { useMemo } from "react";

type StarFieldProps = { count?: number; className?: string };

export default function StarField({ count = 70, className = "" }: StarFieldProps) {
  const stars = useMemo(() => Array.from({ length: count }, (_, i) => ({ id: i, left: Math.random() * 100, top: Math.random() * 100, delay: Math.random() * 5 })), [count]);
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute h-1 w-1 rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%` }}
          animate={{ opacity: [0.1, 1, 0.15], scale: [0.7, 1.4, 0.7] }}
          transition={{ duration: 2.5, delay: s.delay, repeat: Infinity }}
        />
      ))}
    </div>
  );
}
