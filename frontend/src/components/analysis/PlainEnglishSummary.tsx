import { motion } from 'framer-motion';
import { overallConfig } from './analysisData';

export const PlainEnglishSummary = () => {
  return (
    <section className="paper-texture px-5 py-20 text-obsidian md:px-8">
      <motion.div
        className="mx-auto max-w-5xl"
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-crimson">Plain English Summary</p>
        <div className="mt-8 border-l-4 border-gold pl-6 font-display text-2xl leading-relaxed md:text-3xl">
          <p>{overallConfig.summary}</p>
          <p className="mt-7 text-crimson">
            Overall verdict: {overallConfig.verdict}
          </p>
        </div>
      </motion.div>
    </section>
  );
};
