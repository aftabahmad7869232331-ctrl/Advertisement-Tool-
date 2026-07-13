import { motion, type HTMLMotionProps, type MotionStyle } from "framer-motion";
import { ReactNode } from "react";
import useMagnetic from "../../hooks/useMagnetic";

type MagneticButtonProps = HTMLMotionProps<"button"> & { children: ReactNode; strength?: number };

export default function MagneticButton({ children, strength = 0.25, className = "", ...props }: MagneticButtonProps) {
  const magnetic = useMagnetic<HTMLButtonElement>({ strength });

  return (
    <motion.button
      {...props}
      ref={magnetic.ref}
      style={magnetic.style as MotionStyle}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <motion.span className="absolute inset-y-0 -left-1/2 w-1/2 bg-white/20 blur-xl" animate={{ x: ["0%", "320%"] }} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2 }} />
    </motion.button>
  );
}
