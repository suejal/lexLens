import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { ArrowDownRight } from 'lucide-react';
import { ParticleField } from '../components/ParticleField';

const HeroScene = lazy(() => import('../three/HeroScene'));

const contracts = ['NDA', 'Employment Contract', 'Lease Agreement', 'Partnership Deed'];
const heroContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};
const heroChild: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const Hero = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % contracts.length), 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-obsidian pt-28">
      <ParticleField />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(201,168,76,0.18),transparent_30rem)]" />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-7rem)] max-w-7xl items-center gap-10 px-5 pb-20 md:px-8 lg:grid-cols-[1.04fr_0.96fr]">
        <motion.div className="max-w-4xl" initial="hidden" animate="visible" variants={heroContainer}>
          <motion.h1
            variants={heroChild}
            className="font-display text-[4rem] font-semibold leading-[0.92] tracking-[-0.04em] text-parchment md:text-[6rem] lg:text-[7.1rem]"
          >
            Every Clause. Every Risk. Exposed.
          </motion.h1>

          <motion.p
            variants={heroChild}
            className="mt-8 max-w-2xl text-lg leading-8 text-muted md:text-xl"
          >
            LexLens uses AI to read contracts the way a senior partner would — and tells you what to watch out for.
          </motion.p>

          <motion.div
            variants={heroChild}
            className="mt-12 flex items-center gap-4 text-sm text-muted"
          >
            <ArrowDownRight className="h-5 w-5 text-gold" aria-hidden="true" />
            Reviewing now:{' '}
            <span className="relative inline-flex min-w-[12rem] overflow-hidden text-gold">
              <motion.span
                key={contracts[active]}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -24, opacity: 0 }}
                transition={{ duration: 0.45 }}
              >
                {contracts[active]}
              </motion.span>
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.32 }}
          className="relative h-[24rem] min-h-[24rem] overflow-hidden border border-gold/10 bg-black/20 shadow-gold md:h-[36rem]"
          aria-label="Floating contract analysis scene"
        >
          <Suspense fallback={<div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.2em] text-gold">Summoning evidence</div>}>
            <HeroScene />
          </Suspense>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(245,240,232,0.08),transparent_35%,rgba(201,168,76,0.1))]" />
        </motion.div>
      </div>
    </section>
  );
};
