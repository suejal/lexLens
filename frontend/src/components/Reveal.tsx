import { motion, type Variants } from 'framer-motion';
import type { PropsWithChildren } from 'react';

const variants: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
}>;

export const Reveal = ({ children, className, delay = 0, as = 'div' }: RevealProps) => {
  const Component = motion[as as 'div'];

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-90px' }}
      variants={{
        ...variants,
        visible: {
          ...variants.visible,
          transition: { duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </Component>
  );
};
