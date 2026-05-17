import { motion } from 'framer-motion';
import { overallConfig, scoreBreakdown } from './analysisData';

const radius = 78;
const circumference = 2 * Math.PI * radius;

export const RiskScore = () => {
  const score = Number(overallConfig.score) || 5;

  return (
    <section className="px-5 py-16 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <motion.div
          className="flex flex-col items-center border border-gold/15 bg-coal/60 p-8 shadow-deep-panel"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <svg viewBox="0 0 200 200" className="h-64 w-64 -rotate-90">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(245,240,232,0.08)" strokeWidth="18" />
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#C9A84C"
              strokeWidth="18"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - score / 10) }}
              transition={{ duration: 1.2, delay: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </svg>
          <div className="-mt-40 flex h-40 flex-col items-center justify-center">
            <div className="font-display text-6xl text-parchment">{score.toFixed(1)}</div>
            <div className="text-sm uppercase tracking-[0.2em] text-muted">/ 10</div>
          </div>
          <p className="mt-10 text-center font-display text-2xl text-gold">{overallConfig.verdict || 'Review before signing'}</p>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15, delayChildren: 0.85 } } }}
        >
          {scoreBreakdown.map((item) => (
            <motion.div
              key={item.label}
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
              }}
            >
              <div className="mb-2 flex justify-between text-sm text-muted">
                <span>{item.label}</span>
                <span className="text-gold">{item.value.toFixed(1)} / 10</span>
              </div>
              <div className="h-3 bg-parchment/10">
                <motion.div
                  className="h-full bg-gold"
                  initial={{ width: '0%' }}
                  animate={{ width: `${item.value * 10}%` }}
                  transition={{ duration: 0.85, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
