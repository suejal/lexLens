/**
 * Shared type definitions and constants for LexLens
 */

// User roles
export const UserRole = {
  ADMIN: 'admin',
  LAWYER: 'lawyer',
  CLIENT: 'client'
};

// Contract status
export const ContractStatus = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  ANALYZED: 'analyzed',
  FAILED: 'failed'
};

// Clause types
export const ClauseType = {
  CONFIDENTIALITY: 'confidentiality',
  TERMINATION: 'termination',
  LIABILITY: 'liability',
  INDEMNITY: 'indemnity',
  PAYMENT: 'payment',
  GOVERNING_LAW: 'governing_law',
  DISPUTE_RESOLUTION: 'dispute_resolution',
  INTELLECTUAL_PROPERTY: 'intellectual_property',
  WARRANTY: 'warranty',
  FORCE_MAJEURE: 'force_majeure',
  ASSIGNMENT: 'assignment',
  AMENDMENT: 'amendment',
  NOTICE: 'notice',
  SEVERABILITY: 'severability',
  ENTIRE_AGREEMENT: 'entire_agreement',
  OTHER: 'other'
};

// Risk levels
export const RiskLevel = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

// Job types
export const JobType = {
  EXTRACTION: 'extraction',
  ANALYSIS: 'analysis',
  COMPARISON: 'comparison'
};

// Job status
export const JobStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

module.exports = {
  UserRole,
  ContractStatus,
  ClauseType,
  RiskLevel,
  JobType,
  JobStatus
};

