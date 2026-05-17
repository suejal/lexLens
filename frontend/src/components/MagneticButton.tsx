import { motion, type HTMLMotionProps } from 'framer-motion';
import type { MouseEvent } from 'react';
import { useRef } from 'react';

type MagneticButtonProps = HTMLMotionProps<'a'> & {
  href: string;
  variant?: 'gold' | 'ghost' | 'dark';
};

const styles = {
  gold: 'border-gold bg-gold text-obsidian hover:bg-gold-soft hover:border-gold-soft',
  ghost: 'border-gold/40 bg-transparent text-parchment hover:border-gold hover:text-gold',
  dark: 'border-obsidian bg-obsidian text-parchment hover:bg-crimson hover:border-crimson',
};

export const MagneticButton = ({ variant = 'gold', className = '', ...props }: MagneticButtonProps) => {
  const ref = useRef<HTMLAnchorElement | null>(null);

  const handleMove = (event: MouseEvent<HTMLAnchorElement>) => {
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * 0.16;
    const y = (event.clientY - rect.top - rect.height / 2) * 0.2;
    element.style.setProperty('--mx', `${x}px`);
    element.style.setProperty('--my', `${y}px`);
  };

  const reset = () => {
    const element = ref.current;
    if (!element) return;
    element.style.setProperty('--mx', '0px');
    element.style.setProperty('--my', '0px');
  };

  const classes = `magnetic inline-flex min-h-12 items-center justify-center border px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${styles[variant]} ${className}`;

  return (
    <motion.a
      ref={ref}
      className={classes}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      whileTap={{ scale: 0.98 }}
      {...props}
    />
  );
};
