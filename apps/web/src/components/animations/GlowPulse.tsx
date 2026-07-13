import { motion } from "framer-motion";
import { ReactNode } from "react";

type GlowPulseProps = { children?: ReactNode; className?: string };

export default function GlowPulse({ children, className = "" }: GlowPulseProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{ scale: [1, 1.035, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.span className="absolute inset-0 rounded-[inherit] bg-yellow-300/20 blur-xl" animate={{ opacity: [0.25, 0.8, 0.25] }} transition={{ duration: 2, repeat: Infinity }} />
      <span className="relative z-10">{children}</span>
    </motion.div>
  );
}
