import { RefObject, useEffect, useRef, useState } from "react";

export interface UseIntersectionOptions extends IntersectionObserverInit {
  once?: boolean;
}

export interface UseIntersectionReturn<T extends Element> {
  ref: RefObject<T | null>;
  entry: IntersectionObserverEntry | null;
  isIntersecting: boolean;
}

export function useIntersection<T extends Element = HTMLElement>({
  root = null,
  rootMargin = "0px",
  threshold = 0.18,
  once = true,
}: UseIntersectionOptions = {}): UseIntersectionReturn<T> {
  const ref = useRef<T>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([nextEntry]) => {
        if (!nextEntry) return;
        setEntry(nextEntry);
        if (once && nextEntry.isIntersecting) observer.disconnect();
      },
      { root, rootMargin, threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, root, rootMargin, threshold]);

  return { ref, entry, isIntersecting: Boolean(entry?.isIntersecting) };
}

export default useIntersection;
