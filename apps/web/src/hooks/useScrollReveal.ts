import { useRef } from "react";
import { useInView, type UseInViewOptions } from "framer-motion";

export interface ScrollRevealOptions {
  once?: boolean;
  amount?: number | "some" | "all";
  margin?: UseInViewOptions["margin"];
}

export default function useScrollReveal(options: ScrollRevealOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const viewOptions: UseInViewOptions = {
    once: options.once ?? true,
    amount: options.amount ?? 0.18,
    ...(options.margin === undefined ? {} : { margin: options.margin }),
  };
  const isInView = useInView(ref, viewOptions);
  return { ref, isInView };
}

export { useScrollReveal };
