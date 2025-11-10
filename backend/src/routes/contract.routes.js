const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { query } = require('../database/connection');
const { queueContractExtraction, getJobStatus } = require('../services/queue.service');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * POST /api/contracts/upload
 * Upload a new contract (PDF or DOCX)
 */
router.post('/upload', upload.single('contract'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;
    const userId = req.user.userId;

    logger.info(`User ${userId} uploading contract: ${originalname}`);

    // Insert contract record
    const result = await query(
      `INSERT INTO contracts (
        user_id,
        filename,
        original_filename,
        file_path,
        file_type,
        file_size,
        status,
        uploaded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, 'uploaded', NOW())
      RETURNING id, filename, original_filename, file_size, status, uploaded_at`,
      [userId, filename, originalname, filePath, mimetype, size]
    );

    const contract = result.rows[0];

    // Queue for background processing
    const job = await queueContractExtraction(
      contract.id,
      filePath,
      mimetype,
      userId
    );

    // Update contract with job ID
    await query(
      `UPDATE contracts SET status = 'processing' WHERE id = $1`,
      [contract.id]
    );

    res.status(201).json({
      message: 'Contract uploaded successfully',
      contract: {
        id: contract.id,
        filename: contract.original_filename,
        size: contract.file_size,
        status: 'processing',
        uploadedAt: contract.uploaded_at
      },
      jobId: job.jobId
    });

  } catch (error) {
    logger.error('Upload failed:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

/**
 * GET /api/contracts
 * List all contracts for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT
        id,
        original_filename,
        file_size,
        file_type,
        status,
        uploaded_at,
        processed_at,
        metadata
      FROM contracts
      WHERE user_id = $1
    `;

    const params = [userId];

    // Filter by status if provided
    if (status) {
      queryText += ` AND status = $${params.length + 1}`;
      params.push(status);
    }

    queryText += ` ORDER BY uploaded_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await query(queryText, params);

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM contracts WHERE user_id = $1`,
      [userId]
    );

    res.json({
      contracts: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    logger.error('Failed to list contracts:', error);
    res.status(500).json({
      error: 'Failed to retrieve contracts',
      message: error.message
    });
  }
});

/**
 * GET /api/contracts/:id
 * Get a specific contract by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await query(
      `SELECT
        id,
        original_filename,
        file_size,
        file_type,
        status,
        uploaded_at,
        processed_at,
        extracted_text,
        metadata
      FROM contracts
      WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const contract = result.rows[0];

    // Get processing job status if exists
    const jobResult = await query(
      `SELECT status, created_at, started_at, completed_at, error
       FROM processing_jobs
       WHERE contract_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [id]
    );

    res.json({
      contract,
      job: jobResult.rows[0] || null
    });

  } catch (error) {
    logger.error('Failed to get contract:', error);
    res.status(500).json({
      error: 'Failed to retrieve contract',
      message: error.message
    });
  }
});

/**
 * DELETE /api/contracts/:id
 * Delete a contract
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Get contract to delete file
    const contractResult = await query(
      `SELECT file_path FROM contracts WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const filePath = contractResult.rows[0].file_path;

    // Delete from database (cascades to related tables)
    await query(
      `DELETE FROM contracts WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    // Delete file from disk
    try {
      await fs.unlink(filePath);
      logger.info(`Deleted file: ${filePath}`);
    } catch (fileError) {
      logger.warn(`Failed to delete file ${filePath}:`, fileError.message);
    }

    res.json({ message: 'Contract deleted successfully' });

  } catch (error) {
    logger.error('Failed to delete contract:', error);
    res.status(500).json({
      error: 'Failed to delete contract',
      message: error.message
    });
  }
});

/**
 * GET /api/contracts/:id/status
 * Get processing status of a contract
 */
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify ownership
    const contractResult = await query(
      `SELECT status FROM contracts WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (contractResult.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Get latest job status
    const jobResult = await query(
      `SELECT
        id,
        job_type,
        status,
        created_at,
        started_at,
        completed_at,
        error,
        result
       FROM processing_jobs
       WHERE contract_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [id]
    );

    res.json({
      contractStatus: contractResult.rows[0].status,
      job: jobResult.rows[0] || null
    });

  } catch (error) {
    logger.error('Failed to get contract status:', error);
    res.status(500).json({
      error: 'Failed to retrieve status',
      message: error.message
    });
  }
});

module.exports = router;

