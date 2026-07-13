import { useEffect, useState } from "react";

export interface CursorState {
  x: number;
  y: number;
  isVisible: boolean;
  isPointer: boolean;
}

const INTERACTIVE_SELECTOR = "a, button, input, textarea, select, [role='button'], [data-cursor='pointer']";

export function useCursor(): CursorState {
  const [state, setState] = useState<CursorState>({
    x: -100,
    y: -100,
    isVisible: false,
    isPointer: false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const move = (event: PointerEvent) => {
      const target = event.target as Element | null;
      setState({
        x: event.clientX,
        y: event.clientY,
        isVisible: true,
        isPointer: Boolean(target?.closest(INTERACTIVE_SELECTOR)),
      });
    };

    const hide = () => setState((current) => ({ ...current, isVisible: false }));

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerleave", hide);
    document.documentElement.addEventListener("mouseleave", hide);

    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", hide);
      document.documentElement.removeEventListener("mouseleave", hide);
    };
  }, []);

  return state;
}

export default useCursor;
