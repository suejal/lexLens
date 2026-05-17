import { motion } from 'framer-motion';
import { Linkedin, Twitter } from 'lucide-react';

export const FinalCta = () => {
  return (
    <footer id="final-cta" className="relative overflow-hidden bg-obsidian px-5 py-24 md:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(201,168,76,0.18),transparent_28rem),radial-gradient(circle_at_80%_80%,rgba(139,26,26,0.16),transparent_24rem)]" />
      <div className="absolute inset-0 animate-pulse bg-[linear-gradient(120deg,transparent,rgba(245,240,232,0.04),transparent)]" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          className="max-w-4xl"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div className="relative overflow-hidden">
            <h2 className="font-display text-6xl font-semibold leading-none tracking-[-0.04em] text-parchment md:text-8xl">
            The Court Is In Session.
            </h2>
            <motion.div
              className="absolute inset-0 origin-right bg-gold"
              variants={{
                hidden: { scaleX: 1 },
                visible: {
                  scaleX: 0,
                  transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] },
                },
              }}
            />
          </div>
        </motion.div>

        <div className="mt-24 flex flex-col gap-8 border-t border-parchment/10 pt-8 md:flex-row md:items-center md:justify-between">
          <a href="#home" className="font-display text-2xl text-parchment">LexLens<span className="text-gold">.</span></a>
          <div className="flex flex-wrap gap-5 text-sm text-muted">
            <a href="#features">Features</a>
            <a href="#for-lawyers">For Lawyers</a>
            <a href="#for-clients">For Clients</a>
          </div>
          <div className="flex items-center gap-4 text-muted">
            <a href="https://twitter.com" aria-label="LexLens on X"><Twitter className="h-5 w-5" /></a>
            <a href="https://linkedin.com" aria-label="LexLens on LinkedIn"><Linkedin className="h-5 w-5" /></a>
          </div>
          <p className="text-sm text-muted">© 2025 LexLens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
