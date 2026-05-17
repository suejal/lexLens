import { useEffect, useState } from 'react';

type Point = { x: number; y: number };

export const useMousePosition = () => {
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    const update = (event: PointerEvent) => {
      setPoint({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('pointermove', update, { passive: true });
    return () => window.removeEventListener('pointermove', update);
  }, []);

  return point;
};
