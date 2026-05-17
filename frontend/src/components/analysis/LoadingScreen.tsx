import { motion } from 'framer-motion';
import { Check, FileText, LoaderCircle } from 'lucide-react';

const steps = [
  { start: 0.8, done: 1.4, label: 'Extracting text and structure...', time: '0.6s' },
  { start: 1.4, done: 2.1, label: 'Identifying clauses and headings...', time: '0.7s' },
  { start: 2.1, done: 2.9, label: 'Cross-referencing Indian contract law...', time: '0.8s' },
  { start: 2.9, done: 3.6, label: 'Scoring risk per clause...', time: '0.7s' },
  { start: 3.6, done: 4.2, label: 'Generating plain English summaries...', time: '0.6s' },
  { start: 4.2, done: 4.6, label: 'Compiling final report...', time: '0.4s' },
];

type LoadingScreenProps = {
  elapsed: number;
  fileName: string;
};

export const LoadingScreen = ({ elapsed, fileName }: LoadingScreenProps) => {
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0A] px-5 text-parchment"
      initial={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,168,76,0.18),transparent_30rem)]" />
      <div className="relative w-full max-w-2xl">
        <motion.div
          className="border border-gold/20 bg-coal/80 p-5 shadow-deep-panel"
          initial={{ opacity: 0, y: -90 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center border border-gold/30 bg-gold/10 text-gold">
              <FileText className="h-7 w-7" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-xl text-parchment">{fileName}</p>
              <p className="mt-1 text-sm text-muted">6 pages · 2,400 words</p>
            </div>
            <motion.div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-obsidian"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={elapsed >= 0.6 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            >
              <Check className="h-5 w-5" aria-hidden="true" />
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-8 space-y-3">
          {steps.map((step) => {
            const active = elapsed >= step.start && elapsed < step.done;
            const done = elapsed >= step.done;
            return (
              <motion.div
                key={step.label}
                className="flex items-center justify-between border border-parchment/10 bg-black/30 px-4 py-3"
                initial={{ opacity: 0, x: -20 }}
                animate={elapsed >= step.start ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center text-gold">
                    {done ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <LoaderCircle className={`h-4 w-4 ${active ? 'animate-spin' : 'opacity-25'}`} aria-hidden="true" />
                    )}
                  </div>
                  <span className={done ? 'text-parchment' : 'text-muted'}>{step.label}</span>
                </div>
                <span className="text-sm text-gold">{done ? step.time : ''}</span>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          className="mt-8 text-center font-display text-3xl text-gold"
          initial={{ opacity: 0, y: 18 }}
          animate={elapsed >= 4.6 ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.45 }}
        >
          Analysis complete — 14 clauses reviewed
        </motion.p>
      </div>
    </motion.div>
  );
};
