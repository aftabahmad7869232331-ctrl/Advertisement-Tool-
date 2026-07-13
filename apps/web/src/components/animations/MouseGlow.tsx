import { motion } from "framer-motion";
import useGlowCursor from "../../hooks/useGlowCursor";

type MouseGlowProps = { className?: string; size?: number };

export default function MouseGlow({ className = "", size = 360 }: MouseGlowProps) {
  const cursor = useGlowCursor();

  return (
    <motion.div
      className={`pointer-events-none fixed left-0 top-0 z-10 rounded-full bg-purple-500/20 blur-3xl ${className}`}
      animate={{ x: cursor.x - size / 2, y: cursor.y - size / 2, opacity: cursor.visible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 90, damping: 24 }}
      style={{ width: size, height: size }}
    />
  );
}
