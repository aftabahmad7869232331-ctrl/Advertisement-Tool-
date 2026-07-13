import { motion } from "framer-motion";

type BeamLightProps = { className?: string };

export default function BeamLight({ className = "" }: BeamLightProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute left-[-20%] top-1/3 h-px w-[140%] bg-gradient-to-r from-transparent via-blue-400/80 to-transparent shadow-[0_0_24px_rgba(59,130,246,.8)]"
        animate={{ rotate: [10, -8, 10], y: [-80, 140, -80], opacity: [0.15, 0.75, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
