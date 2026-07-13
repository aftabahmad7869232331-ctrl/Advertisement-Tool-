import { motion } from "framer-motion";
import { ReactNode } from "react";
import useScrollReveal from "../../hooks/useScrollReveal";

type ScrollRevealProps = { children: ReactNode; className?: string; delay?: number };

export default function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const { ref, isInView } = useScrollReveal();
  return (
    <motion.div
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.75, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
