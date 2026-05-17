import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { HelpCircle, Send, ShieldAlert, Signature } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

const clientFeatures = [
  ['Understand what you’re signing', Signature],
  ['Know which clauses put you at risk', ShieldAlert],
  ['Ask questions about any section in plain English', HelpCircle],
  ['Share with your lawyer pre-reviewed', Send],
];

const ScoreNumber = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const value = useMotionValue(0);
  const display = useTransform(value, (latest) => latest.toFixed(1));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(value, 6.4, { duration: 1.4, ease: [0.25, 0.1, 0.25, 1] });
    return controls.stop;
  }, [inView, value]);

  return <motion.span ref={ref}>{display}</motion.span>;
};

export const ForClients = () => {
  const isMobile = useIsMobile();
  const distance = isMobile ? 40 : 100;

  return (
    <section id="for-clients" className="section-shell bg-[#090909]">
      <div className="mx-auto grid max-w-7xl overflow-hidden border border-gold/15 lg:grid-cols-2">
        <motion.div
          className="paper-texture p-8 text-obsidian will-change-transform md:p-12 lg:p-16 lg:order-1"
          initial={{ opacity: 0, x: -distance }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-crimson">For Clients</p>
          <h2 className="mt-5 font-display text-5xl font-semibold leading-none tracking-[-0.03em] md:text-7xl">
            Sign With Confidence.
          </h2>
          <motion.div
            className="mt-10 space-y-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.56 } },
            }}
          >
            {clientFeatures.map(([label, Icon]) => (
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

        <motion.div
          className="bg-coal p-8 will-change-transform md:p-12 lg:p-16 lg:order-2"
          initial={{ opacity: 0, x: distance }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="border border-parchment/10 bg-obsidian p-6 shadow-deep-panel">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Contract Score</p>
                <h3 className="mt-3 font-display text-6xl text-parchment"><ScoreNumber /><span className="text-2xl text-muted">/10</span></h3>
              </div>
              <span className="border border-gold/40 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gold">Watch Out</span>
            </div>
            <div className="mt-12 space-y-5">
              {[
                ['Fair terms', '42%', 'bg-[#2ecc71]'],
                ['Watch out', '38%', 'bg-gold'],
                ['Red flag', '20%', 'bg-crimson'],
              ].map(([label, value, color], index) => (
                <div key={label}>
                  <div className="mb-2 flex justify-between text-sm text-muted">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-2 bg-parchment/10">
                    <motion.div
                      className={`h-full ${color}`}
                      initial={{ width: '0%' }}
                      whileInView={{ width: value }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{
                        duration: 0.7,
                        delay: 0.18 + index * 0.14,
                        ease: [0.25, 0.1, 0.25, 1],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-10 border-l-2 border-crimson pl-4 leading-7 text-muted">
              Three clauses need attention before signature: termination, indemnity, and non-compete scope.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
