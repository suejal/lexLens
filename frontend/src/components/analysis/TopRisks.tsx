import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { topRisks } from './analysisData';

export const TopRisks = () => {
  const [open, setOpen] = useState(0);

  return (
    <section className="px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, x: -54 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">AI Flagged</p>
          <h2 className="mt-4 font-display text-4xl text-parchment md:text-6xl">Top Risks</h2>
        </motion.div>

        <div className="mt-10 space-y-5">
          {topRisks.map((risk, index) => {
            const expanded = open === index;
            return (
              <motion.article
                key={risk.title}
                className="border border-parchment/10 bg-coal/70"
                style={{ borderLeft: `4px solid ${risk.color}` }}
                initial={{ opacity: 0, x: -70 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <button type="button" className="flex w-full items-center justify-between gap-4 p-6 text-left" onClick={() => setOpen(expanded ? -1 : index)}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Risk {index + 1} — {risk.severity}</p>
                    <h3 className="mt-3 font-display text-2xl text-parchment">{risk.title}</h3>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gold transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="border-t border-parchment/10 p-6 pt-4">
                        <p className="leading-8 text-muted">{risk.body}</p>
                        <p className="mt-4 leading-8 text-parchment"><span className="text-gold">Action: </span>{risk.action}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
