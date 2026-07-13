import { motion } from "framer-motion";
import { ReactNode } from "react";

type OrbitSystemProps = { children?: ReactNode; className?: string };

export default function OrbitSystem({ children, className = "" }: OrbitSystemProps) {
  const rings = [18, 24, 32];
  return (
    <div className={`relative grid place-items-center ${className}`}>
      {rings.map((seconds, index) => (
        <motion.div
          key={seconds}
          className="absolute rounded-full border border-blue-400/50"
          style={{ width: 210 + index * 70, height: 210 + index * 70 }}
          animate={{ rotate: index % 2 ? -360 : 360 }}
          transition={{ duration: seconds, repeat: Infinity, ease: "linear" }}
        >
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(251,191,36,.9)]" />
        </motion.div>
      ))}
      <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2.4, repeat: Infinity }}>
        {children}
      </motion.div>
    </div>
  );
}
