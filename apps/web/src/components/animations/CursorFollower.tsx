import { motion } from "framer-motion";
import useCursor from "../../hooks/useCursor";

export default function CursorFollower() {
  const cursor = useCursor();
  return <motion.div className="pointer-events-none fixed left-0 top-0 z-[9999] h-9 w-9 rounded-full border border-yellow-300/70 mix-blend-screen" animate={{ x: cursor.x - 18, y: cursor.y - 18, opacity: cursor.isVisible ? 1 : 0, scale: cursor.isPointer ? 1.35 : 1 }} transition={{ type: "spring", stiffness: 220, damping: 22 }} />;
}
