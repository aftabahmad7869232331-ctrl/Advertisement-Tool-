import { motion } from "framer-motion";

type AnimatedGridProps = { className?: string; opacity?: number };

export default function AnimatedGrid({ className = "", opacity = 0.18 }: AnimatedGridProps) {
  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        backgroundImage:
          "linear-gradient(rgba(59,130,246,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,.25) 1px, transparent 1px)",
        backgroundSize: "90px 90px",
      }}
      animate={{ backgroundPosition: ["0px 0px", "90px 90px"] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
    />
  );
}
