import { useEffect, useState } from "react";

export default function useCounter(target: number, duration = 1400, active = true): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (typeof window === "undefined") {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, active]);

  return value;
}

export { useCounter };
