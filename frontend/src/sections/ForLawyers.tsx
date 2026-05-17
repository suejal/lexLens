import { motion } from 'framer-motion';
import { BriefcaseBusiness, Clock, FileCheck2, Library, ListChecks } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';

const lawyerFeatures = [
  ['Bulk contract review', BriefcaseBusiness],
  ['Client-ready summary reports', FileCheck2],
  ['Clause library and precedent matching', Library],
  ['Flag non-standard terms automatically', ListChecks],
  ['Time tracking integration (coming soon)', Clock],
];

export const ForLawyers = () => {
  const isMobile = useIsMobile();
  const distance = isMobile ? 40 : 100;

  return (
    <section id="for-lawyers" className="section-shell bg-obsidian">
      <div className="mx-auto grid max-w-7xl overflow-hidden border border-gold/15 lg:grid-cols-2">
        <motion.div
          className="bg-coal p-8 will-change-transform md:p-12 lg:p-16"
          initial={{ opacity: 0, x: -distance }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">For Lawyers</p>
          <h2 className="mt-5 font-display text-5xl font-semibold leading-none tracking-[-0.03em] text-parchment md:text-7xl">
            Your AI Junior Associate.
          </h2>
          <motion.div
            className="mt-12 border border-parchment/10 bg-obsidian p-5 will-change-transform"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.55 }}
          >
            <div className="mb-5 flex items-center justify-between border-b border-parchment/10 pb-4 text-xs uppercase tracking-[0.2em] text-muted">
              <span>Dashboard</span>
              <span className="text-gold">Analyzing</span>
            </div>
            <div className="space-y-4 text-sm leading-7 text-muted">
              <p className="rounded-none bg-parchment p-4 font-display text-lg text-obsidian">
                Section 9.2: Indemnity survives termination and applies to indirect losses.
              </p>
              <p className="border-l-2 border-crimson pl-4 text-crimson">High risk · uncapped liability</p>
              <p className="border-l-2 border-gold pl-4">Suggested revision: cap exposure at fees paid in prior 12 months.</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="paper-texture p-8 text-obsidian will-change-transform md:p-12 lg:p-16"
          initial={{ opacity: 0, x: distance }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h3 className="font-display text-4xl font-semibold">Review faster. Advise sharper.</h3>
          <motion.div
            className="mt-10 space-y-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.4 } },
            }}
          >
            {lawyerFeatures.map(([label, Icon]) => (
              <motion.div
                key={label as string}
                className="flex items-start gap-4 border-b border-obsidian/10 pb-5 will-change-transform"
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
                  },
                }}
              >
                <Icon className="mt-1 h-5 w-5 shrink-0 text-crimson" aria-hidden="true" />
                <p className="text-lg font-medium">{label as string}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
