/**
 * Clause Extraction and Classification Service
 * Segments contract text into clauses and classifies them
 */

const natural = require('natural');
const compromise = require('compromise');
const logger = require('../config/logger');

// Common clause type patterns
const CLAUSE_PATTERNS = {
  confidentiality: [
    /confidential(ity)?/i,
    /non-disclosure/i,
    /proprietary information/i,
    /trade secret/i,
    /sensitive information/i
  ],
  termination: [
    /terminat(e|ion)/i,
    /cancel(lation)?/i,
    /end of (the )?agreement/i,
    /notice period/i,
    /expir(e|ation)/i
  ],
  liability: [
    /liabilit(y|ies)/i,
    /indemnif(y|ication)/i,
    /damages/i,
    /limitation of liability/i,
    /hold harmless/i
  ],
  payment: [
    /payment/i,
    /fee(s)?/i,
    /compensation/i,
    /invoice/i,
    /price/i,
    /cost/i
  ],
  intellectual_property: [
    /intellectual property/i,
    /copyright/i,
    /patent/i,
    /trademark/i,
    /ownership/i,
    /license/i
  ],
  governing_law: [
    /governing law/i,
    /jurisdiction/i,
    /applicable law/i,
    /venue/i,
    /dispute resolution/i
  ],
  warranty: [
    /warrant(y|ies)/i,
    /representation/i,
    /guarantee/i,
    /assurance/i
  ],
  force_majeure: [
    /force majeure/i,
    /act of god/i,
    /unforeseeable/i,
    /beyond.*control/i
  ],
  assignment: [
    /assignment/i,
    /transfer/i,
    /successor/i,
    /assign.*rights/i
  ],
  amendment: [
    /amendment/i,
    /modification/i,
    /change.*agreement/i,
    /written consent/i
  ],
  entire_agreement: [
    /entire agreement/i,
    /complete agreement/i,
    /supersede/i,
    /prior agreement/i
  ],
  severability: [
    /severabilit(y)?/i,
    /invalid.*provision/i,
    /unenforceable/i
  ]
};

/**
 * Segment contract text into clauses
 * @param {string} text - Contract text
 * @returns {Array} Array of clause objects
 */
function segmentClauses(text) {
  logger.info('Segmenting contract into clauses');

  const clauses = [];
  
  // Split by common section patterns
  // Pattern 1: Numbered sections (1., 2., 3. or 1.1, 1.2, etc.)
  const numberedSections = text.split(/\n\s*(\d+\.(?:\d+\.?)?)\s+/);
  
  if (numberedSections.length > 3) {
    // We found numbered sections
    for (let i = 1; i < numberedSections.length; i += 2) {
      const sectionNumber = numberedSections[i];
      const sectionText = numberedSections[i + 1];
      
      if (sectionText && sectionText.trim().length > 20) {
        clauses.push({
          section_number: sectionNumber,
          text: sectionText.trim(),
          position: Math.floor(i / 2)
        });
      }
    }
  } else {
    // Fallback: Split by paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    
    paragraphs.forEach((para, index) => {
      const trimmed = para.trim();
      
      // Skip very short paragraphs (likely headers or whitespace)
      if (trimmed.length > 50) {
        clauses.push({
          section_number: null,
          text: trimmed,
          position: index
        });
      }
    });
  }

  // If still no clauses found, split by sentences
  if (clauses.length === 0) {
    const tokenizer = new natural.SentenceTokenizer();
    const sentences = tokenizer.tokenize(text);
    
    // Group sentences into logical clauses (3-5 sentences each)
    const sentencesPerClause = 3;
    for (let i = 0; i < sentences.length; i += sentencesPerClause) {
      const clauseText = sentences.slice(i, i + sentencesPerClause).join(' ');
      
      if (clauseText.trim().length > 50) {
        clauses.push({
          section_number: null,
          text: clauseText.trim(),
          position: Math.floor(i / sentencesPerClause)
        });
      }
    }
  }

  logger.info(`Segmented contract into ${clauses.length} clauses`);
  return clauses;
}

/**
 * Classify a clause based on its content
 * @param {string} text - Clause text
 * @returns {Object} Classification result
 */
function classifyClause(text) {
  const doc = compromise(text);
  const lowerText = text.toLowerCase();
  
  // Score each clause type
  const scores = {};
  
  for (const [type, patterns] of Object.entries(CLAUSE_PATTERNS)) {
    let score = 0;
    
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        score += 1;
      }
    }
    
    scores[type] = score;
  }
  
  // Find the highest scoring type
  let maxScore = 0;
  let clauseType = 'general';
  
  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      clauseType = type;
    }
  }
  
  // Calculate confidence (0-1)
  const totalMatches = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalMatches > 0 ? maxScore / totalMatches : 0.5;
  
  // Extract key entities
  const entities = {
    dates: doc.dates().out('array'),
    money: doc.money().out('array'),
    organizations: doc.organizations().out('array'),
    people: doc.people().out('array')
  };
  
  return {
    clause_type: clauseType,
    confidence: Math.min(confidence, 1.0),
    entities,
    word_count: text.split(/\s+/).length
  };
}

/**
 * Extract title/heading from clause text
 * @param {string} text - Clause text
 * @returns {string} Extracted title or null
 */
function extractClauseTitle(text) {
  // Look for all-caps titles at the beginning
  const capsMatch = text.match(/^([A-Z][A-Z\s]{3,50})\n/);
  if (capsMatch) {
    return capsMatch[1].trim();
  }
  
  // Look for numbered titles (e.g., "1. CONFIDENTIALITY")
  const numberedMatch = text.match(/^\d+\.?\s+([A-Z][A-Z\s]{3,50})/);
  if (numberedMatch) {
    return numberedMatch[1].trim();
  }
  
  // Look for bold/underlined patterns (common in parsed docs)
  const boldMatch = text.match(/^([A-Z][a-zA-Z\s]{3,50}):/);
  if (boldMatch) {
    return boldMatch[1].trim();
  }
  
  // Fallback: Use first sentence
  const tokenizer = new natural.SentenceTokenizer();
  const sentences = tokenizer.tokenize(text);
  
  if (sentences.length > 0 && sentences[0].length < 100) {
    return sentences[0].substring(0, 50) + '...';
  }
  
  return null;
}

/**
 * Analyze clause for risk indicators
 * @param {string} text - Clause text
 * @param {string} clauseType - Type of clause
 * @returns {Object} Risk analysis
 */
function analyzeClauseRisk(text, clauseType) {
  const lowerText = text.toLowerCase();
  
  const riskIndicators = {
    high: [
      /unlimited liability/i,
      /sole discretion/i,
      /without notice/i,
      /automatic renewal/i,
      /perpetual/i,
      /irrevocable/i,
      /waive.*rights/i,
      /indemnify.*all/i
    ],
    medium: [
      /may terminate/i,
      /at any time/i,
      /without cause/i,
      /exclusive/i,
      /binding/i,
      /non-refundable/i
    ],
    low: [
      /reasonable/i,
      /mutual/i,
      /written consent/i,
      /good faith/i,
      /commercially reasonable/i
    ]
  };
  
  let riskLevel = 'low';
  const flags = [];
  
  // Check for high-risk patterns
  for (const pattern of riskIndicators.high) {
    if (pattern.test(text)) {
      riskLevel = 'high';
      flags.push({
        severity: 'high',
        pattern: pattern.source,
        message: 'This clause contains potentially unfavorable terms'
      });
    }
  }
  
  // Check for medium-risk patterns
  if (riskLevel !== 'high') {
    for (const pattern of riskIndicators.medium) {
      if (pattern.test(text)) {
        riskLevel = 'medium';
        flags.push({
          severity: 'medium',
          pattern: pattern.source,
          message: 'This clause may require careful review'
        });
      }
    }
  }
  
  return {
    risk_level: riskLevel,
    flags,
    requires_review: riskLevel !== 'low'
  };
}

/**
 * Process contract text and extract all clauses with classification
 * @param {string} text - Contract text
 * @returns {Array} Array of processed clauses
 */
async function extractAndClassifyClauses(text) {
  logger.info('Starting clause extraction and classification');
  
  try {
    // Segment into clauses
    const rawClauses = segmentClauses(text);
    
    // Process each clause
    const processedClauses = rawClauses.map((clause, index) => {
      const classification = classifyClause(clause.text);
      const title = extractClauseTitle(clause.text);
      const risk = analyzeClauseRisk(clause.text, classification.clause_type);
      
      return {
        position: clause.position,
        section_number: clause.section_number,
        title: title,
        text: clause.text,
        clause_type: classification.clause_type,
        confidence: classification.confidence,
        entities: classification.entities,
        word_count: classification.word_count,
        risk_level: risk.risk_level,
        risk_flags: risk.flags,
        requires_review: risk.requires_review
      };
    });
    
    logger.info(`Successfully processed ${processedClauses.length} clauses`);
    return processedClauses;
    
  } catch (error) {
    logger.error('Error in clause extraction:', error);
    throw error;
  }
}

module.exports = {
  segmentClauses,
  classifyClause,
  extractClauseTitle,
  analyzeClauseRisk,
  extractAndClassifyClauses
};

