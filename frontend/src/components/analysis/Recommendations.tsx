import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { recommendations } from './analysisData';

export const Recommendations = () => {
  return (
    <section className="px-5 py-16 pb-36 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Action Items</p>
          <h2 className="mt-4 font-display text-4xl text-parchment md:text-6xl">Recommended Amendments</h2>
        </motion.div>

        <motion.ol
          className="mt-10 space-y-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {recommendations.map((item, index) => (
            <motion.li
              key={item.label}
              className="grid gap-4 border border-parchment/10 bg-coal/70 p-5 md:grid-cols-[4rem_1fr]"
              variants={{
                hidden: { opacity: 0, y: 28 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center border border-gold/35 text-gold">
                {index + 1}
              </div>
              <div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <p className="font-bold text-parchment">{item.label}</p>
                </div>
                {item.detail && <p className="mt-2 pl-8 text-muted">{item.detail}</p>}
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
};
