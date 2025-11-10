import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { contractAPI } from '../utils/api';
import { format } from 'date-fns';

const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContracts();
  }, [filter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await contractAPI.getAll(params);
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contract?')) return;

    try {
      await contractAPI.delete(id);
      toast.success('Contract deleted successfully');
      fetchContracts();
    } catch (error) {
      console.error('Failed to delete contract:', error);
      toast.error('Failed to delete contract');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      uploaded: 'badge bg-neutral-200 text-neutral-700',
      processing: 'badge bg-primary-200 text-primary-700',
      analyzed: 'badge bg-success-200 text-success-700',
      failed: 'badge bg-danger-200 text-danger-700'
    };
    return badges[status] || badges.uploaded;
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="card mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">My Contracts</h1>
            <p className="text-neutral-600">View and manage your uploaded contracts</p>
          </div>
          <Link to="/upload" className="btn btn-primary">
            Upload New Contract
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex space-x-2">
          {['all', 'uploaded', 'processing', 'analyzed', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-neutral-600">Loading contracts...</p>
        </div>
      ) : contracts.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center py-12"
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-neutral-800 mb-2">No contracts yet</h3>
          <p className="text-neutral-600 mb-6">
            Upload your first contract to get started with AI-powered analysis
          </p>
          <Link to="/upload" className="btn btn-primary">
            Upload Contract
          </Link>
        </motion.div>
      ) : (
        /* Contract List */
        <div className="space-y-4">
          {contracts.map((contract, index) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-soft-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-neutral-800">
                      {contract.original_filename}
                    </h3>
                    <span className={getStatusBadge(contract.status)}>
                      {contract.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-neutral-600">
                    <span>📊 {formatFileSize(contract.file_size)}</span>
                    <span>📅 {format(new Date(contract.uploaded_at), 'MMM dd, yyyy')}</span>
                    {contract.metadata?.documentType && (
                      <span>📋 {contract.metadata.documentType}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {contract.status === 'analyzed' && (
                    <Link
                      to={`/contracts/${contract.id}/analysis`}
                      className="btn btn-primary"
                    >
                      View Analysis
                    </Link>
                  )}
                  {contract.status === 'processing' && (
                    <button className="btn btn-secondary" disabled>
                      Processing...
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(contract.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractList;

