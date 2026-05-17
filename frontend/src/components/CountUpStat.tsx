import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

type CountUpStatProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
};

export const CountUpStat = ({ value, suffix = '', prefix = '', decimals = 0, label }: CountUpStatProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${prefix}${latest.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(count, value, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [count, inView, value]);

  return (
    <div ref={ref} className="border border-obsidian/15 bg-white/30 p-6 shadow-[0_16px_40px_rgba(13,13,15,0.08)] md:p-8">
      <motion.div className="font-display text-5xl font-semibold text-obsidian md:text-7xl">{rounded}</motion.div>
      <p className="mt-5 max-w-xs text-sm leading-6 text-graphite/75">{label}</p>
    </div>
  );
};
