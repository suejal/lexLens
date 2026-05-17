import { motion } from 'framer-motion';
import { CountUpStat } from '../components/CountUpStat';

export const Problem = () => {
  return (
    <section className="section-shell paper-texture text-obsidian">
      <div className="mx-auto max-w-7xl">
        <motion.div
          className="grid gap-8 will-change-transform lg:grid-cols-[0.92fr_1.08fr] lg:items-end"
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="max-w-4xl font-display text-5xl font-semibold leading-[0.98] tracking-[-0.03em] md:text-7xl">
            Contracts Are Designed To Be Confusing.
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-graphite/78">
            For lawyers, the risk is buried in repetition. For clients, it is hidden in language built to intimidate. LexLens brings the pressure points to the surface before the signature becomes a liability.
          </p>
        </motion.div>

        <motion.div
          className="mt-16 grid gap-5 [perspective:1400px] md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {[
            <CountUpStat value={73} suffix="%" label="contracts contain at least one unfavorable clause" />,
            <CountUpStat value={4.2} suffix=" hrs" decimals={1} label="average time a lawyer spends reviewing one contract" />,
            <CountUpStat value={38} prefix="₹" suffix="L" label="average cost of a contract dispute" />,
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="will-change-transform [backface-visibility:hidden] [transform-style:preserve-3d]"
              variants={{
                hidden: { opacity: 0, rotateY: 90 },
                visible: {
                  opacity: 1,
                  rotateY: 0,
                  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
                },
              }}
            >
              {stat}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
