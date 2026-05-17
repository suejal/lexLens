import { motion } from 'framer-motion';
import { contractMeta } from './analysisData';

export const OverviewHeader = () => {
  return (
    <motion.header
      className="border-b border-gold/15 bg-[#0A0A0A]/90 px-5 pt-10 md:px-8"
      initial={{ opacity: 0, y: -28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="mx-auto max-w-7xl pb-8">
        <div className="mb-5 inline-flex border border-gold/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">
          {contractMeta.type}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-[-0.03em] text-parchment md:text-6xl">
              {contractMeta.title}
            </h1>
            <p className="mt-4 max-w-4xl text-lg leading-8 text-muted">{contractMeta.parties}</p>
          </div>
          <dl className="grid gap-3 text-sm text-muted sm:grid-cols-2">
            <div><dt className="text-gold">Date</dt><dd>{contractMeta.date}</dd></div>
            <div><dt className="text-gold">Jurisdiction</dt><dd>{contractMeta.jurisdiction}</dd></div>
            <div className="sm:col-span-2"><dt className="text-gold">Document</dt><dd>{contractMeta.stats}</dd></div>
          </dl>
        </div>
      </div>
    </motion.header>
  );
};
