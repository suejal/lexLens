import { motion } from 'framer-motion';
import { clauses } from './analysisData';

export const RiskSummary = () => {
  const totals = {
    RED: clauses.filter((clause) => clause.badge === 'RED'),
    AMBER: clauses.filter((clause) => clause.badge === 'AMBER'),
    GREEN: clauses.filter((clause) => clause.badge === 'GREEN'),
  };
  const totalCount = clauses.length || 1;
  const stats = [
    {
      label: 'RED flags',
      value: `${totals.RED.length} clause${totals.RED.length === 1 ? '' : 's'}`,
      detail: totals.RED.length ? totals.RED.map((clause) => clause.number).join(', ') : 'None',
      color: '#8B1A1A',
      width: (totals.RED.length / totalCount) * 100,
    },
    {
      label: 'AMBER warnings',
      value: `${totals.AMBER.length} clause${totals.AMBER.length === 1 ? '' : 's'}`,
      detail: totals.AMBER.length ? totals.AMBER.map((clause) => clause.number).join(', ') : 'None',
      color: '#7A5200',
      width: (totals.AMBER.length / totalCount) * 100,
    },
    {
      label: 'GREEN / fair',
      value: `${totals.GREEN.length} clause${totals.GREEN.length === 1 ? '' : 's'}`,
      detail: totals.GREEN.length ? totals.GREEN.map((clause) => clause.number).join(', ') : 'None',
      color: '#1A3A1A',
      width: (totals.GREEN.length / totalCount) * 100,
    },
  ];

  return (
    <section className="px-5 py-16 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.h2
          className="font-display text-4xl text-parchment md:text-6xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          Risk Distribution
        </motion.h2>

        <motion.div
          className="mt-10 flex h-5 overflow-hidden bg-parchment/10"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ transformOrigin: 'left' }}
        >
          {stats.map((item) => (
            <div key={item.label} style={{ width: `${item.width}%`, backgroundColor: item.color }} />
          ))}
        </motion.div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              className="border border-parchment/10 bg-coal/70 p-6"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: index * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p className="text-sm uppercase tracking-[0.2em]" style={{ color: item.color === '#1A3A1A' ? '#86EFAC' : item.color === '#8B1A1A' ? '#FFB3B3' : '#FFD580' }}>{item.label}</p>
              <p className="mt-4 font-display text-4xl text-parchment">{item.value}</p>
              <p className="mt-2 text-muted">Clauses {item.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
