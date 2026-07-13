import { RefObject, useCallback, useRef, useState } from "react";

export interface MagneticTransform {
  x: number;
  y: number;
}

export interface UseMagneticOptions {
  strength?: number;
  resetSpeed?: number;
}

export interface UseMagneticReturn<T extends HTMLElement> {
  ref: RefObject<T | null>;
  transform: MagneticTransform;
  onMouseMove: (event: React.MouseEvent<T>) => void;
  onMouseLeave: () => void;
  style: React.CSSProperties;
}

export function useMagnetic<T extends HTMLElement = HTMLButtonElement>({
  strength = 0.35,
  resetSpeed = 180,
}: UseMagneticOptions = {}): UseMagneticReturn<T> {
  const ref = useRef<T>(null);
  const [transform, setTransform] = useState<MagneticTransform>({ x: 0, y: 0 });

  const onMouseMove = useCallback(
    (event: React.MouseEvent<T>) => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * strength;
      const y = (event.clientY - rect.top - rect.height / 2) * strength;
      setTransform({ x, y });
    },
    [strength]
  );

  const onMouseLeave = useCallback(() => setTransform({ x: 0, y: 0 }), []);

  return {
    ref,
    transform,
    onMouseMove,
    onMouseLeave,
    style: {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      transition: `transform ${resetSpeed}ms ease`,
    },
  };
}

export default useMagnetic;
