/**
 * Clause Routes
 * API endpoints for clause retrieval and analysis
 */

const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const { authenticate } = require('../middleware/auth');
const logger = require('../config/logger');

/**
 * GET /api/clauses/:contractId
 * Get all clauses for a contract
 */
router.get('/:contractId', authenticate, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user.userId;

    // Verify user owns this contract
    const contractResult = await query(
      `SELECT id FROM contracts WHERE id = $1 AND user_id = $2`,
      [contractId, userId]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Get all clauses for this contract
    const clausesResult = await query(
      `SELECT 
        id, contract_id, position, section_number, title, text,
        clause_type, confidence, entities, word_count,
        risk_level, risk_flags, requires_review, created_at
       FROM clauses
       WHERE contract_id = $1
       ORDER BY position ASC`,
      [contractId]
    );

    // Parse JSON fields
    const clauses = clausesResult.rows.map(clause => ({
      ...clause,
      entities: typeof clause.entities === 'string' ? JSON.parse(clause.entities) : clause.entities,
      risk_flags: typeof clause.risk_flags === 'string' ? JSON.parse(clause.risk_flags) : clause.risk_flags
    }));

    res.json({
      contractId,
      clauseCount: clauses.length,
      clauses
    });

  } catch (error) {
    logger.error('Error fetching clauses:', error);
    res.status(500).json({ message: 'Failed to fetch clauses' });
  }
});

/**
 * GET /api/clauses/:contractId/summary
 * Get clause summary statistics
 */
router.get('/:contractId/summary', authenticate, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user.userId;

    // Verify user owns this contract
    const contractResult = await query(
      `SELECT id FROM contracts WHERE id = $1 AND user_id = $2`,
      [contractId, userId]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Get clause statistics
    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_clauses,
        COUNT(CASE WHEN risk_level = 'high' THEN 1 END) as high_risk_count,
        COUNT(CASE WHEN risk_level = 'medium' THEN 1 END) as medium_risk_count,
        COUNT(CASE WHEN risk_level = 'low' THEN 1 END) as low_risk_count,
        COUNT(CASE WHEN requires_review = true THEN 1 END) as requires_review_count,
        SUM(word_count) as total_words
       FROM clauses
       WHERE contract_id = $1`,
      [contractId]
    );

    // Get clause type distribution
    const typeDistResult = await query(
      `SELECT clause_type, COUNT(*) as count
       FROM clauses
       WHERE contract_id = $1
       GROUP BY clause_type
       ORDER BY count DESC`,
      [contractId]
    );

    res.json({
      contractId,
      statistics: statsResult.rows[0],
      typeDistribution: typeDistResult.rows
    });

  } catch (error) {
    logger.error('Error fetching clause summary:', error);
    res.status(500).json({ message: 'Failed to fetch clause summary' });
  }
});

/**
 * GET /api/clauses/:contractId/risky
 * Get high-risk clauses only
 */
router.get('/:contractId/risky', authenticate, async (req, res) => {
  try {
    const { contractId } = req.params;
    const userId = req.user.userId;

    // Verify user owns this contract
    const contractResult = await query(
      `SELECT id FROM contracts WHERE id = $1 AND user_id = $2`,
      [contractId, userId]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Get high and medium risk clauses
    const clausesResult = await query(
      `SELECT 
        id, position, section_number, title, text,
        clause_type, risk_level, risk_flags, requires_review
       FROM clauses
       WHERE contract_id = $1 
       AND risk_level IN ('high', 'medium')
       ORDER BY 
         CASE risk_level 
           WHEN 'high' THEN 1 
           WHEN 'medium' THEN 2 
         END,
         position ASC`,
      [contractId]
    );

    // Parse JSON fields
    const clauses = clausesResult.rows.map(clause => ({
      ...clause,
      risk_flags: typeof clause.risk_flags === 'string' ? JSON.parse(clause.risk_flags) : clause.risk_flags
    }));

    res.json({
      contractId,
      riskyClauseCount: clauses.length,
      clauses
    });

  } catch (error) {
    logger.error('Error fetching risky clauses:', error);
    res.status(500).json({ message: 'Failed to fetch risky clauses' });
  }
});

/**
 * GET /api/clauses/:contractId/type/:clauseType
 * Get clauses by type
 */
router.get('/:contractId/type/:clauseType', authenticate, async (req, res) => {
  try {
    const { contractId, clauseType } = req.params;
    const userId = req.user.userId;

    // Verify user owns this contract
    const contractResult = await query(
      `SELECT id FROM contracts WHERE id = $1 AND user_id = $2`,
      [contractId, userId]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Get clauses of specified type
    const clausesResult = await query(
      `SELECT 
        id, position, section_number, title, text,
        clause_type, confidence, risk_level, risk_flags
       FROM clauses
       WHERE contract_id = $1 AND clause_type = $2
       ORDER BY position ASC`,
      [contractId, clauseType]
    );

    // Parse JSON fields
    const clauses = clausesResult.rows.map(clause => ({
      ...clause,
      risk_flags: typeof clause.risk_flags === 'string' ? JSON.parse(clause.risk_flags) : clause.risk_flags
    }));

    res.json({
      contractId,
      clauseType,
      count: clauses.length,
      clauses
    });

  } catch (error) {
    logger.error('Error fetching clauses by type:', error);
    res.status(500).json({ message: 'Failed to fetch clauses by type' });
  }
});

/**
 * GET /api/clauses/clause/:clauseId
 * Get single clause details
 */
router.get('/clause/:clauseId', authenticate, async (req, res) => {
  try {
    const { clauseId } = req.params;
    const userId = req.user.userId;

    // Get clause with contract ownership check
    const clauseResult = await query(
      `SELECT c.*, ct.user_id
       FROM clauses c
       JOIN contracts ct ON c.contract_id = ct.id
       WHERE c.id = $1`,
      [clauseId]
    );

    if (clauseResult.rows.length === 0) {
      return res.status(404).json({ message: 'Clause not found' });
    }

    const clause = clauseResult.rows[0];

    // Verify ownership
    if (clause.user_id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Parse JSON fields
    clause.entities = typeof clause.entities === 'string' ? JSON.parse(clause.entities) : clause.entities;
    clause.risk_flags = typeof clause.risk_flags === 'string' ? JSON.parse(clause.risk_flags) : clause.risk_flags;

    // Remove user_id from response
    delete clause.user_id;

    res.json({ clause });

  } catch (error) {
    logger.error('Error fetching clause:', error);
    res.status(500).json({ message: 'Failed to fetch clause' });
  }
});

module.exports = router;

