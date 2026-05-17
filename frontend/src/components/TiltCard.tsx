import type { MouseEvent, PropsWithChildren } from 'react';
import { useRef } from 'react';

type TiltCardProps = PropsWithChildren<{
  className?: string;
}>;

export const TiltCard = ({ children, className = '' }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const ry = ((x / rect.width) - 0.5) * 8;
    const rx = ((y / rect.height) - 0.5) * -8;
    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
  };

  const reset = () => {
    const card = ref.current;
    if (!card) return;
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  };

  return (
    <div
      ref={ref}
      data-cursor="hover"
      className={`tilt-card transition-transform duration-200 ease-out ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </div>
  );
};
