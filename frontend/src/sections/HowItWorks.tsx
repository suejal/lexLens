import { motion, useInView } from 'framer-motion';
import { FileUp, ShieldCheck, Share2 } from 'lucide-react';
import { useRef } from 'react';

const steps = [
  {
    icon: FileUp,
    title: 'Upload your contract',
    body: 'PDF, DOCX, or paste text. LexLens prepares the document for clause-level review.',
  },
  {
    icon: ShieldCheck,
    title: 'AI analyzes clauses',
    body: 'Risks are flagged, fairness is scored, and non-standard terms are isolated.',
  },
  {
    icon: Share2,
    title: 'Get a clear report',
    body: 'Highlight, export, or share the verdict with your client in minutes.',
  },
];

export const HowItWorks = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" className="section-shell bg-obsidian">
      <motion.div
        className="mx-auto max-w-7xl overflow-hidden will-change-[clip-path]"
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">How LexLens Works</p>
          <h2 className="mt-5 font-display text-5xl font-semibold tracking-[-0.03em] text-parchment md:text-7xl">
            The Verdict, In Seconds.
          </h2>
        </div>

        <motion.div
          ref={ref}
          className="relative mt-20 grid gap-8 lg:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.25, delayChildren: 0.12 } },
          }}
        >
          <svg className="absolute left-[16%] right-[16%] top-10 hidden h-8 w-[68%] lg:block" viewBox="0 0 900 40" fill="none" aria-hidden="true">
            <motion.path
              d="M 5 20 C 220 20, 230 20, 445 20 S 670 20, 895 20"
              stroke="#C9A84C"
              strokeWidth="2"
              strokeDasharray="900"
              strokeDashoffset="900"
              initial={{ strokeDashoffset: 900, opacity: 0 }}
              animate={inView ? { strokeDashoffset: 0, opacity: 0.8 } : { strokeDashoffset: 900, opacity: 0 }}
              transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </svg>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                className="relative border border-gold/15 bg-coal/70 p-7 shadow-deep-panel will-change-transform"
                variants={{
                  hidden: { opacity: 0, y: 80 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
                  },
                }}
              >
                  <div className="mb-8 flex h-16 w-16 items-center justify-center border border-gold/35 bg-gold/10 text-gold">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <span className="font-display text-5xl italic text-gold/25">0{index + 1}</span>
                  <h3 className="mt-4 font-display text-2xl text-parchment">{step.title}</h3>
                  <p className="mt-4 leading-7 text-muted">{step.body}</p>
              </motion.article>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
};
