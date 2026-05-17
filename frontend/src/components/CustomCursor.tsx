import { useEffect, useRef } from 'react';

const TRAIL_LENGTH = 10;

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<Array<HTMLDivElement | null>>([]);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const trail = useRef(Array.from({ length: TRAIL_LENGTH }, () => ({ x: 0, y: 0 })));

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    target.current = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    current.current = { ...target.current };
    trail.current = trail.current.map(() => ({ ...target.current }));

    let frame = 0;

    const handlePointerMove = (event: PointerEvent) => {
      target.current.x = event.clientX;
      target.current.y = event.clientY;
      document.body.classList.add('cursor-ready');
    };

    const tick = () => {
      current.current.x += (target.current.x - current.current.x) * 0.32;
      current.current.y += (target.current.y - current.current.y) * 0.32;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%) scale(var(--cursor-scale))`;
      }

      trail.current.forEach((dot, index) => {
        const leader = index === 0 ? current.current : trail.current[index - 1];
        dot.x += (leader.x - dot.x) * 0.36;
        dot.y += (leader.y - dot.y) * 0.36;

        const element = trailRefs.current[index];
        if (element) {
          const scale = 1 - index * 0.065;
          element.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%) scale(${scale})`;
          element.style.opacity = `${Math.max(0.08, 0.34 - index * 0.026)}`;
        }
      });

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  useEffect(() => {
    const hoverables = 'a, button, [data-cursor="hover"]';
    const onOver = (event: PointerEvent) => {
      if ((event.target as Element).closest(hoverables)) document.body.classList.add('cursor-hover');
    };
    const onOut = (event: PointerEvent) => {
      if ((event.target as Element).closest(hoverables)) document.body.classList.remove('cursor-hover');
    };
    const onDown = () => document.documentElement.style.setProperty('--cursor-scale', '0.76');
    const onUp = () => document.documentElement.style.setProperty('--cursor-scale', '1');

    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);
    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <>
      {Array.from({ length: TRAIL_LENGTH }).map((_, index) => (
        <div
          key={index}
          ref={(element) => {
            trailRefs.current[index] = element;
          }}
          className="cursor-trail hidden md:block"
          aria-hidden="true"
        />
      ))}
      <div ref={cursorRef} className="custom-cursor hidden md:block" aria-hidden="true" />
    </>
  );
};
