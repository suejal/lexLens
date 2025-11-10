/**
 * Embedding Service
 * Generates semantic embeddings for clauses using sentence transformers
 */

const { pipeline } = require('@xenova/transformers');
const logger = require('../config/logger');

// Cache the model pipeline
let embeddingPipeline = null;

/**
 * Initialize the embedding model
 * Uses all-MiniLM-L6-v2 - a lightweight sentence transformer
 */
async function initializeEmbeddingModel() {
  if (embeddingPipeline) {
    return embeddingPipeline;
  }

  try {
    logger.info('Initializing embedding model (all-MiniLM-L6-v2)...');
    
    // Create feature extraction pipeline
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    
    logger.info('Embedding model initialized successfully');
    return embeddingPipeline;
    
  } catch (error) {
    logger.error('Failed to initialize embedding model:', error);
    throw error;
  }
}

/**
 * Mean pooling function to convert token embeddings to sentence embedding
 * @param {Object} output - Model output
 * @param {Object} attention_mask - Attention mask
 * @returns {Array} Pooled embedding
 */
function meanPooling(output, attention_mask) {
  // Get the token embeddings
  const embeddings = output.tolist()[0];
  const mask = attention_mask.tolist()[0];
  
  // Calculate mean of all token embeddings (weighted by attention mask)
  const pooled = new Array(embeddings[0].length).fill(0);
  let count = 0;
  
  for (let i = 0; i < embeddings.length; i++) {
    if (mask[i] === 1) {
      for (let j = 0; j < embeddings[i].length; j++) {
        pooled[j] += embeddings[i][j];
      }
      count++;
    }
  }
  
  // Normalize
  for (let i = 0; i < pooled.length; i++) {
    pooled[i] /= count;
  }
  
  return pooled;
}

/**
 * Generate embedding for a single text
 * @param {string} text - Text to embed
 * @returns {Array} Embedding vector (384 dimensions)
 */
async function generateEmbedding(text) {
  try {
    const model = await initializeEmbeddingModel();
    
    // Truncate text if too long (max 512 tokens)
    const truncatedText = text.substring(0, 2000);
    
    // Generate embedding
    const output = await model(truncatedText, {
      pooling: 'mean',
      normalize: true
    });
    
    // Convert to array
    const embedding = Array.from(output.data);
    
    logger.debug(`Generated embedding of dimension ${embedding.length}`);
    return embedding;
    
  } catch (error) {
    logger.error('Error generating embedding:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {Array<string>} texts - Array of texts to embed
 * @returns {Array<Array>} Array of embedding vectors
 */
async function generateEmbeddingsBatch(texts) {
  try {
    logger.info(`Generating embeddings for ${texts.length} texts`);
    
    const embeddings = [];
    
    // Process in batches to avoid memory issues
    const batchSize = 10;
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      const batchEmbeddings = await Promise.all(
        batch.map(text => generateEmbedding(text))
      );
      
      embeddings.push(...batchEmbeddings);
      
      logger.debug(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);
    }
    
    logger.info(`Successfully generated ${embeddings.length} embeddings`);
    return embeddings;
    
  } catch (error) {
    logger.error('Error generating batch embeddings:', error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two embeddings
 * @param {Array} embedding1 - First embedding vector
 * @param {Array} embedding2 - Second embedding vector
 * @returns {number} Similarity score (0-1)
 */
function cosineSimilarity(embedding1, embedding2) {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings must have the same dimension');
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }
  
  norm1 = Math.sqrt(norm1);
  norm2 = Math.sqrt(norm2);
  
  if (norm1 === 0 || norm2 === 0) {
    return 0;
  }
  
  return dotProduct / (norm1 * norm2);
}

/**
 * Find most similar texts to a query
 * @param {string} queryText - Query text
 * @param {Array} candidateTexts - Array of candidate texts
 * @param {number} topK - Number of results to return
 * @returns {Array} Array of {text, similarity} objects
 */
async function findSimilar(queryText, candidateTexts, topK = 5) {
  try {
    logger.info(`Finding top ${topK} similar texts to query`);
    
    // Generate embeddings
    const queryEmbedding = await generateEmbedding(queryText);
    const candidateEmbeddings = await generateEmbeddingsBatch(candidateTexts);
    
    // Calculate similarities
    const similarities = candidateEmbeddings.map((embedding, index) => ({
      text: candidateTexts[index],
      similarity: cosineSimilarity(queryEmbedding, embedding),
      index
    }));
    
    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Return top K
    return similarities.slice(0, topK);
    
  } catch (error) {
    logger.error('Error finding similar texts:', error);
    throw error;
  }
}

/**
 * Format embedding for PostgreSQL pgvector
 * @param {Array} embedding - Embedding vector
 * @returns {string} Formatted vector string
 */
function formatEmbeddingForDB(embedding) {
  // pgvector expects format: '[0.1, 0.2, 0.3, ...]'
  return '[' + embedding.join(',') + ']';
}

/**
 * Parse embedding from PostgreSQL pgvector
 * @param {string} vectorString - Vector string from database
 * @returns {Array} Embedding array
 */
function parseEmbeddingFromDB(vectorString) {
  // Remove brackets and split by comma
  return vectorString
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map(parseFloat);
}

module.exports = {
  initializeEmbeddingModel,
  generateEmbedding,
  generateEmbeddingsBatch,
  cosineSimilarity,
  findSimilar,
  formatEmbeddingForDB,
  parseEmbeddingFromDB
};

