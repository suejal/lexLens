import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Download, Share2 } from 'lucide-react';

type ExportShareBarProps = {
  toast: string | null;
  onAction: () => void;
};

export const ExportShareBar = ({ toast, onAction }: ExportShareBarProps) => {
  return (
    <>
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold/20 bg-[#0A0A0A]/90 px-4 py-4 backdrop-blur-xl"
        initial={{ y: 120 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.8 }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={onAction} className="inline-flex items-center justify-center gap-2 border border-gold bg-gold px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-obsidian">
            <Download className="h-4 w-4" aria-hidden="true" />
            Download Full Report (PDF)
          </button>
          <button type="button" onClick={onAction} className="inline-flex items-center justify-center gap-2 border border-gold/40 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-gold">
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share with Client
          </button>
          <button type="button" onClick={onAction} className="inline-flex items-center justify-center gap-2 border border-parchment/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.16em] text-parchment">
            Analyze Another Contract
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-28 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 border border-gold/30 bg-coal px-5 py-4 text-center text-parchment shadow-deep-panel"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
