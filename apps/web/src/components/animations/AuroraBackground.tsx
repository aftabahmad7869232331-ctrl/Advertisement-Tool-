import { motion } from "framer-motion";
import useMouseParallax from "../../hooks/useMouseParallax";

type AuroraBackgroundProps = { className?: string };

export default function AuroraBackground({ className = "" }: AuroraBackgroundProps) {
  const offset = useMouseParallax(20);
  return (
    <motion.div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} animate={{ x: offset.x, y: offset.y }} transition={{ type: "spring", stiffness: 45, damping: 20 }}>
      <motion.div
        className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-purple-600/25 blur-3xl"
        animate={{ x: [0, 90, -40, 0], y: [0, -40, 70, 0], scale: [1, 1.2, 0.95, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-0 top-32 h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-3xl"
        animate={{ x: [0, -80, 40, 0], y: [0, 60, -35, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl"
        animate={{ x: [0, -120, 80, 0], y: [0, -80, 30, 0], scale: [1, 1.25, 0.9, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
