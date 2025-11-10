import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    { label: 'Total Contracts', value: '0', icon: '📄', color: 'primary' },
    { label: 'Analyzed', value: '0', icon: '✅', color: 'success' },
    { label: 'High Risk', value: '0', icon: '⚠️', color: 'danger' },
    { label: 'Comparisons', value: '0', icon: '🔍', color: 'accent' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="card">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">
          Welcome back, {user?.fullName}! 👋
        </h1>
        <p className="text-neutral-600">
          Here's an overview of your contract analysis activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-soft-lg cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-neutral-800">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-bold text-neutral-800 mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-neutral-500">
          <p className="text-5xl mb-4">📭</p>
          <p>No contracts uploaded yet.</p>
          <p className="text-sm mt-2">Upload your first contract to get started!</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.a
          href="/upload"
          whileHover={{ scale: 1.02 }}
          className="card hover:shadow-soft-lg cursor-pointer text-center"
        >
          <div className="text-5xl mb-4">📤</div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">Upload Contract</h3>
          <p className="text-sm text-neutral-600">Upload a new contract for analysis</p>
        </motion.a>

        <motion.a
          href="/contracts"
          whileHover={{ scale: 1.02 }}
          className="card hover:shadow-soft-lg cursor-pointer text-center"
        >
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">View Contracts</h3>
          <p className="text-sm text-neutral-600">Browse all your contracts</p>
        </motion.a>

        <motion.a
          href="/contracts/compare"
          whileHover={{ scale: 1.02 }}
          className="card hover:shadow-soft-lg cursor-pointer text-center"
        >
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">Compare Versions</h3>
          <p className="text-sm text-neutral-600">Compare contract versions</p>
        </motion.a>
      </div>
    </div>
  );
};

export default Dashboard;

