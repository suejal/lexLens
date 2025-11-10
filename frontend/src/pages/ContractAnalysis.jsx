import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { contractAPI, clauseAPI } from '../utils/api';

const ContractAnalysis = () => {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [clauses, setClauses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedClause, setSelectedClause] = useState(null);

  useEffect(() => {
    fetchContractData();
  }, [id]);

  const fetchContractData = async () => {
    try {
      setLoading(true);

      // Fetch contract details, clauses, and summary in parallel
      const [contractRes, clausesRes, summaryRes] = await Promise.all([
        contractAPI.getById(id),
        clauseAPI.getAll(id),
        clauseAPI.getSummary(id)
      ]);

      setContract(contractRes.data);
      setClauses(clausesRes.data.clauses);
      setSummary(summaryRes.data);

    } catch (error) {
      console.error('Failed to fetch contract data:', error);
      toast.error('Failed to load contract analysis');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeClass = (riskLevel) => {
    const classes = {
      high: 'badge bg-danger-200 text-danger-700',
      medium: 'badge bg-primary-200 text-primary-700',
      low: 'badge bg-success-200 text-success-700'
    };
    return classes[riskLevel] || classes.low;
  };

  const getClauseTypeColor = (type) => {
    const colors = {
      confidentiality: 'bg-purple-100 text-purple-700',
      termination: 'bg-red-100 text-red-700',
      liability: 'bg-orange-100 text-orange-700',
      payment: 'bg-green-100 text-green-700',
      intellectual_property: 'bg-blue-100 text-blue-700',
      governing_law: 'bg-indigo-100 text-indigo-700',
      warranty: 'bg-yellow-100 text-yellow-700',
      general: 'bg-neutral-100 text-neutral-700'
    };
    return colors[type] || colors.general;
  };

  const filteredClauses = clauses.filter(clause => {
    if (filter === 'all') return true;
    if (filter === 'risky') return clause.risk_level === 'high' || clause.risk_level === 'medium';
    return clause.risk_level === filter;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-neutral-600">Loading contract analysis...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-neutral-600">Contract not found</p>
          <Link to="/contracts" className="btn btn-primary mt-4">
            Back to Contracts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">
              {contract.original_filename}
            </h1>
            <p className="text-neutral-600">Clause-by-clause analysis and risk assessment</p>
          </div>
          <Link to="/contracts" className="btn btn-secondary">
            Back to Contracts
          </Link>
        </div>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card bg-gradient-to-br from-primary-50 to-primary-100"
          >
            <div className="text-sm text-neutral-600 mb-1">Total Clauses</div>
            <div className="text-3xl font-bold text-primary-700">
              {summary.statistics.total_clauses}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card bg-gradient-to-br from-danger-50 to-danger-100"
          >
            <div className="text-sm text-neutral-600 mb-1">High Risk</div>
            <div className="text-3xl font-bold text-danger-700">
              {summary.statistics.high_risk_count}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card bg-gradient-to-br from-primary-50 to-primary-100"
          >
            <div className="text-sm text-neutral-600 mb-1">Medium Risk</div>
            <div className="text-3xl font-bold text-primary-700">
              {summary.statistics.medium_risk_count}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="card bg-gradient-to-br from-success-50 to-success-100"
          >
            <div className="text-sm text-neutral-600 mb-1">Requires Review</div>
            <div className="text-3xl font-bold text-success-700">
              {summary.statistics.requires_review_count}
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-neutral-700">Filter:</span>
          {['all', 'risky', 'high', 'medium', 'low'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                filter === filterOption
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Clauses List */}
      <div className="space-y-4">
        {filteredClauses.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-neutral-600">No clauses match the selected filter</p>
          </div>
        ) : (
          filteredClauses.map((clause, index) => (
            <motion.div
              key={clause.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card hover:shadow-soft-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedClause(selectedClause?.id === clause.id ? null : clause)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {clause.section_number && (
                      <span className="text-sm font-mono text-neutral-500">
                        {clause.section_number}
                      </span>
                    )}
                    <h3 className="text-lg font-semibold text-neutral-800">
                      {clause.title || `Clause ${clause.position + 1}`}
                    </h3>
                    <span className={`badge ${getClauseTypeColor(clause.clause_type)}`}>
                      {clause.clause_type.replace(/_/g, ' ')}
                    </span>
                    <span className={getRiskBadgeClass(clause.risk_level)}>
                      {clause.risk_level} risk
                    </span>
                  </div>

                  <p className="text-neutral-700 line-clamp-2 mb-2">
                    {clause.text}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-neutral-600">
                    <span>📊 {clause.word_count} words</span>
                    <span>🎯 {Math.round(clause.confidence * 100)}% confidence</span>
                    {clause.requires_review && (
                      <span className="text-danger-600 font-medium">⚠️ Requires Review</span>
                    )}
                  </div>

                  {/* Expanded View */}
                  {selectedClause?.id === clause.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-neutral-200"
                    >
                      <h4 className="font-semibold text-neutral-800 mb-2">Full Text:</h4>
                      <p className="text-neutral-700 mb-4 whitespace-pre-wrap">
                        {clause.text}
                      </p>

                      {clause.risk_flags && clause.risk_flags.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-neutral-800 mb-2">Risk Flags:</h4>
                          <div className="space-y-2">
                            {clause.risk_flags.map((flag, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg ${
                                  flag.severity === 'high'
                                    ? 'bg-danger-50 border border-danger-200'
                                    : 'bg-primary-50 border border-primary-200'
                                }`}
                              >
                                <div className="font-medium text-sm">
                                  {flag.severity === 'high' ? '🚨' : '⚠️'} {flag.message}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {clause.entities && (
                        <div>
                          <h4 className="font-semibold text-neutral-800 mb-2">Extracted Entities:</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {clause.entities.dates?.length > 0 && (
                              <div>
                                <div className="text-sm text-neutral-600">Dates:</div>
                                <div className="text-sm">{clause.entities.dates.join(', ')}</div>
                              </div>
                            )}
                            {clause.entities.money?.length > 0 && (
                              <div>
                                <div className="text-sm text-neutral-600">Money:</div>
                                <div className="text-sm">{clause.entities.money.join(', ')}</div>
                              </div>
                            )}
                            {clause.entities.organizations?.length > 0 && (
                              <div>
                                <div className="text-sm text-neutral-600">Organizations:</div>
                                <div className="text-sm">{clause.entities.organizations.join(', ')}</div>
                              </div>
                            )}
                            {clause.entities.people?.length > 0 && (
                              <div>
                                <div className="text-sm text-neutral-600">People:</div>
                                <div className="text-sm">{clause.entities.people.join(', ')}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContractAnalysis;

