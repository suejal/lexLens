import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { clauses, type RiskLevel } from './analysisData';

const badgeStyles: Record<RiskLevel, string> = {
  RED: 'bg-[#8B1A1A] text-[#FFB3B3]',
  AMBER: 'bg-[#7A5200] text-[#FFD580]',
  GREEN: 'bg-[#1A3A1A] text-[#86EFAC]',
};

export const ClauseBreakdown = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Clause-by-Clause Breakdown</p>
          <h2 className="mt-4 font-display text-4xl text-parchment md:text-6xl">
            {clauses.length} Clause{clauses.length === 1 ? '' : 's'} Reviewed
          </h2>
        </motion.div>

        <div className="mt-10 max-h-[42rem] space-y-4 overflow-y-auto pr-2">
          {clauses.map((clause, index) => {
            const expanded = open === clause.number;
            return (
              <motion.article
                key={clause.number}
                className="border border-parchment/10 bg-coal/70"
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                  onClick={() => setOpen(expanded ? null : clause.number)}
                  aria-expanded={expanded}
                >
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Clause {clause.number}</span>
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] ${badgeStyles[clause.badge]}`}>{clause.badge === 'RED' ? 'Red Flag' : clause.badge === 'AMBER' ? 'Watch Out' : 'Fair'}</span>
                    </div>
                    <h3 className="font-display text-2xl text-parchment">{clause.title}</h3>
                    <p className="mt-2 line-clamp-1 text-muted">{clause.plainEnglish}</p>
                  </div>
                  <ChevronDown className={`h-5 w-5 shrink-0 text-gold transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.32 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-parchment/10 p-5 pt-4">
                        <p className="leading-8 text-parchment/90">{clause.plainEnglish}</p>
                        <div className="mt-5 border-l-2 border-gold pl-4 text-muted">
                          <span className="font-bold text-gold">{clause.concern ? 'Concern: ' : 'Positive: '}</span>
                          {clause.concern || clause.positive}
                        </div>
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
