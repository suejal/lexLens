import { motion } from 'framer-motion';
import { CheckCircle2, FileText, Globe2, Scale, ShieldCheck } from 'lucide-react';
import { TiltCard } from '../components/TiltCard';

const cardBase = 'border border-parchment/10 bg-coal/70 p-6 shadow-deep-panel';
const heading = 'Built For Legal Pressure.';
const cardVariant = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const WhyLexLens = () => {
  return (
    <section id="features" className="section-shell bg-[#090909]">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="flex flex-col justify-between gap-8 md:flex-row md:items-end"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Why LexLens?</p>
            <h2 className="mt-5 max-w-3xl font-display text-5xl font-semibold leading-none tracking-[-0.03em] text-parchment md:text-7xl">
              {heading.split('').map((char, index) => (
                <motion.span
                  key={`${char}-${index}`}
                  className="inline-block will-change-transform"
                  variants={{
                    hidden: { opacity: 0, y: 26, rotateX: 70 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      rotateX: 0,
                      transition: {
                        duration: 0.7,
                        delay: index * 0.03,
                        ease: [0.25, 0.1, 0.25, 1],
                      },
                    },
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </h2>
          </div>
          <motion.p
            className="max-w-md leading-7 text-muted"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.7, delay: heading.length * 0.03 } },
            }}
          >
            LexLens turns dense legal language into a structured risk map: faster for attorneys, clearer for clients, and precise enough to act on.
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-16 grid auto-rows-[15rem] gap-5 md:grid-cols-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1, delayChildren: 0.18 } },
          }}
        >
          <motion.div className="will-change-transform md:col-span-4 md:row-span-2" variants={cardVariant}>
            <TiltCard className={`${cardBase} h-full border-gold/35 bg-[linear-gradient(135deg,rgba(201,168,76,0.14),rgba(21,21,21,0.9))]`}>
              <Scale className="h-9 w-9 text-gold" />
              <h3 className="mt-10 max-w-xl font-display text-4xl text-parchment md:text-5xl">Trained on 10,000+ legal documents</h3>
              <p className="mt-6 max-w-xl leading-7 text-muted">
                Clauses are evaluated against patterns from real-world agreements, dispute triggers, and attorney-reviewed contract structures.
              </p>
            </TiltCard>
          </motion.div>

          <motion.div className="will-change-transform md:col-span-2" variants={cardVariant}>
            <TiltCard className={`${cardBase} h-full`}>
              <ShieldCheck className="h-8 w-8 text-gold" />
              <h3 className="mt-8 font-display text-2xl text-parchment">Risk scoring from 1–10 per clause</h3>
            </TiltCard>
          </motion.div>

          <motion.div className="will-change-transform md:col-span-2" variants={cardVariant}>
            <TiltCard className={`${cardBase} h-full`}>
              <p className="font-display text-2xl italic text-gold">Plain English explanations</p>
              <div className="mt-8 space-y-3 text-sm text-muted">
                <p className="border-l border-gold pl-4">“This termination clause lets the other party exit without meaningful notice.”</p>
                <p className="border-l border-crimson pl-4">“Ask for a 30-day cure period before breach remedies apply.”</p>
              </div>
            </TiltCard>
          </motion.div>

          <motion.div className="will-change-transform md:col-span-2" variants={cardVariant}>
            <TiltCard className={`${cardBase} h-full bg-parchment text-obsidian`}>
              <FileText className="h-8 w-8 text-crimson" />
              <h3 className="mt-8 font-display text-2xl">Client-ready reports in one click</h3>
              <div className="mt-6 h-16 border border-obsidian/15 bg-white/60 p-3 text-xs text-graphite">
                LexLens Report · Risk Index · Clause Notes
              </div>
            </TiltCard>
          </motion.div>

          <motion.div className="will-change-transform md:col-span-2" variants={cardVariant}>
            <TiltCard className={`${cardBase} h-full`}>
              <Globe2 className="h-8 w-8 text-gold" />
              <h3 className="mt-8 font-display text-2xl text-parchment">Jurisdiction-aware analysis</h3>
            </TiltCard>
          </motion.div>

          <motion.div className="will-change-transform md:col-span-2" variants={cardVariant}>
            <TiltCard className={`${cardBase} h-full`}>
              <CheckCircle2 className="h-8 w-8 text-gold" />
              <h3 className="mt-8 font-display text-2xl text-parchment">Attorney-reviewed AI outputs</h3>
              <span className="mt-5 inline-flex border border-gold/40 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-gold">
                Verified by legal experts
              </span>
            </TiltCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
