import { motion } from "framer-motion";
import { ReactNode } from "react";

type PageTransitionProps = { children: ReactNode; className?: string };

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, scale: 0.985, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.985, y: -12 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}
