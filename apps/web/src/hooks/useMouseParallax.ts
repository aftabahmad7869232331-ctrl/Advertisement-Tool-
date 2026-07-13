import { useEffect, useState } from "react";

export interface MouseParallaxOffset {
  x: number;
  y: number;
}

export default function useMouseParallax(strength = 18): MouseParallaxOffset {
  const [offset, setOffset] = useState<MouseParallaxOffset>({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame = 0;

    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setOffset({
          x: (event.clientX / window.innerWidth - 0.5) * strength,
          y: (event.clientY / window.innerHeight - 0.5) * strength,
        });
      });
    };

    window.addEventListener("pointermove", move, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, [strength]);

  return offset;
}

export { useMouseParallax };
