import { useEffect, useState } from "react";

export interface GlowCursorState {
  x: number;
  y: number;
  visible: boolean;
}

export default function useGlowCursor(): GlowCursorState {
  const [cursor, setCursor] = useState<GlowCursorState>({ x: -200, y: -200, visible: false });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const move = ({ clientX: x, clientY: y }: PointerEvent) => {
      setCursor({ x, y, visible: true });
    };

    const hide = () => {
      setCursor((value) => ({ ...value, visible: false }));
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", hide);

    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", hide);
    };
  }, []);

  return cursor;
}

export { useGlowCursor };
