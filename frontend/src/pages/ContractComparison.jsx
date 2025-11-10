import { motion } from 'framer-motion';

const ContractComparison = () => {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Compare Contracts</h1>
        <p className="text-neutral-600">Side-by-side comparison of contract versions</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="text-center py-16 text-neutral-500">
          <p className="text-6xl mb-4">⚖️</p>
          <p className="text-lg">Comparison view coming soon</p>
          <p className="text-sm mt-2">Will be implemented in Days 9-10</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ContractComparison;

