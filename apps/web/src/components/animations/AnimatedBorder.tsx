import { motion } from "framer-motion";
import { ReactNode } from "react";

type AnimatedBorderProps = { children: ReactNode; className?: string };

export default function AnimatedBorder({ children, className = "" }: AnimatedBorderProps) {
  return (
    <div className={`relative rounded-3xl p-px ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-3xl bg-[conic-gradient(from_0deg,rgba(250,204,21,.9),rgba(59,130,246,.8),rgba(168,85,247,.8),rgba(250,204,21,.9))]"
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />
      <div className="relative rounded-3xl bg-slate-950/90">{children}</div>
    </div>
  );
}
