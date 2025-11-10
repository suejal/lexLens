const Queue = require('bull');
const { query } = require('../database/connection');
const { extractText, getFileSize } = require('./extraction.service');
const { extractAndClassifyClauses } = require('./clause.service');
const { generateEmbedding, formatEmbeddingForDB } = require('./embedding.service');
const logger = require('../utils/logger');

// Create queue for contract processing
const contractQueue = new Queue('contract-processing', process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * Process contract extraction job
 */
contractQueue.process('extract-text', async (job) => {
  const { contractId, filePath, fileType, userId } = job.data;

  try {
    logger.info(`Processing contract ${contractId} for user ${userId}`);

    // Update job status to processing
    await query(
      `UPDATE processing_jobs 
       SET status = 'processing', started_at = NOW() 
       WHERE id = $1`,
      [job.data.jobId]
    );

    // Extract text from file
    const extraction = await extractText(filePath, fileType);
    const fileSize = await getFileSize(filePath);

    // Update contract with extracted data
    await query(
      `UPDATE contracts
       SET
         extracted_text = $1,
         metadata = $2,
         status = 'processing',
         processed_at = NOW()
       WHERE id = $3`,
      [
        extraction.text,
        JSON.stringify(extraction.metadata),
        contractId
      ]
    );

    // Extract and classify clauses
    logger.info(`Extracting clauses from contract ${contractId}`);
    const clauses = await extractAndClassifyClauses(extraction.text);

    // Generate embeddings and save clauses
    logger.info(`Generating embeddings for ${clauses.length} clauses`);
    for (const clause of clauses) {
      try {
        // Generate embedding for clause text
        const embedding = await generateEmbedding(clause.text);
        const embeddingStr = formatEmbeddingForDB(embedding);

        // Insert clause into database
        await query(
          `INSERT INTO clauses
           (contract_id, position, section_number, title, text, clause_type,
            confidence, entities, word_count, risk_level, risk_flags,
            requires_review, embedding, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
          [
            contractId,
            clause.position,
            clause.section_number,
            clause.title,
            clause.text,
            clause.clause_type,
            clause.confidence,
            JSON.stringify(clause.entities),
            clause.word_count,
            clause.risk_level,
            JSON.stringify(clause.risk_flags),
            clause.requires_review,
            embeddingStr
          ]
        );
      } catch (error) {
        logger.error(`Failed to process clause ${clause.position}:`, error);
        // Continue with other clauses
      }
    }

    // Update contract status to analyzed
    await query(
      `UPDATE contracts SET status = 'analyzed' WHERE id = $1`,
      [contractId]
    );

    // Update job status to completed
    await query(
      `UPDATE processing_jobs
       SET
         status = 'completed',
         completed_at = NOW(),
         result = $1
       WHERE id = $2`,
      [
        JSON.stringify({
          success: true,
          textLength: extraction.text.length,
          pages: extraction.metadata.pages,
          wordCount: extraction.metadata.wordCount,
          clauseCount: clauses.length
        }),
        job.data.jobId
      ]
    );

    logger.info(`Successfully processed contract ${contractId} with ${clauses.length} clauses`);

    return {
      success: true,
      contractId,
      textLength: extraction.text.length,
      metadata: extraction.metadata,
      clauseCount: clauses.length
    };

  } catch (error) {
    logger.error(`Failed to process contract ${contractId}:`, error);

    // Update contract status to failed
    await query(
      `UPDATE contracts 
       SET status = 'failed', processed_at = NOW() 
       WHERE id = $1`,
      [contractId]
    );

    // Update job status to failed
    await query(
      `UPDATE processing_jobs 
       SET 
         status = 'failed',
         completed_at = NOW(),
         error = $1
       WHERE id = $2`,
      [error.message, job.data.jobId]
    );

    throw error;
  }
});

/**
 * Add contract to processing queue
 */
async function queueContractExtraction(contractId, filePath, fileType, userId) {
  try {
    // Create job record in database
    const jobResult = await query(
      `INSERT INTO processing_jobs (contract_id, job_type, status, created_at)
       VALUES ($1, 'extraction', 'pending', NOW())
       RETURNING id`,
      [contractId]
    );

    const jobId = jobResult.rows[0].id;

    // Add to Bull queue
    const job = await contractQueue.add('extract-text', {
      contractId,
      filePath,
      fileType,
      userId,
      jobId
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      removeOnComplete: false,
      removeOnFail: false
    });

    logger.info(`Queued contract ${contractId} for extraction (Job ID: ${job.id})`);

    return {
      jobId,
      queueJobId: job.id
    };

  } catch (error) {
    logger.error('Failed to queue contract extraction:', error);
    throw error;
  }
}

/**
 * Get job status
 */
async function getJobStatus(jobId) {
  try {
    const result = await query(
      `SELECT * FROM processing_jobs WHERE id = $1`,
      [jobId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Failed to get job status:', error);
    throw error;
  }
}

/**
 * Clean up old completed jobs (older than 7 days)
 */
async function cleanupOldJobs() {
  try {
    const result = await query(
      `DELETE FROM processing_jobs 
       WHERE status IN ('completed', 'failed') 
       AND completed_at < NOW() - INTERVAL '7 days'
       RETURNING id`
    );

    logger.info(`Cleaned up ${result.rowCount} old jobs`);
    return result.rowCount;
  } catch (error) {
    logger.error('Failed to cleanup old jobs:', error);
    throw error;
  }
}

// Event listeners for queue
contractQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed:`, result);
});

contractQueue.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed:`, err.message);
});

contractQueue.on('error', (error) => {
  logger.error('Queue error:', error);
});

module.exports = {
  contractQueue,
  queueContractExtraction,
  getJobStatus,
  cleanupOldJobs
};

