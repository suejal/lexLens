const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const logger = require('../utils/logger');

/**
 * Extract text from PDF file
 */
async function extractFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);

    return {
      text: data.text,
      metadata: {
        pages: data.numpages,
        info: data.info || {},
        version: data.version
      }
    };
  } catch (error) {
    logger.error('PDF extraction failed:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file
 */
async function extractFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    
    // Count approximate pages (assuming ~500 words per page)
    const wordCount = result.value.split(/\s+/).length;
    const estimatedPages = Math.ceil(wordCount / 500);

    return {
      text: result.value,
      metadata: {
        pages: estimatedPages,
        wordCount: wordCount,
        messages: result.messages // Any warnings from mammoth
      }
    };
  } catch (error) {
    logger.error('DOCX extraction failed:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

/**
 * Extract metadata from contract text
 */
function extractContractMetadata(text) {
  const metadata = {
    parties: [],
    dates: [],
    documentType: 'Unknown'
  };

  // Extract potential parties (lines with "between", "party", etc.)
  const partyPatterns = [
    /between\s+([A-Z][A-Za-z\s&,\.]+?)\s+(?:and|&)/gi,
    /party[:\s]+([A-Z][A-Za-z\s&,\.]+?)(?:\n|,)/gi,
    /(?:entered into by|made by)\s+([A-Z][A-Za-z\s&,\.]+?)(?:\n|and)/gi
  ];

  partyPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 100) {
        metadata.parties.push(match[1].trim());
      }
    }
  });

  // Remove duplicates
  metadata.parties = [...new Set(metadata.parties)].slice(0, 5);

  // Extract dates
  const datePattern = /\b(?:dated?|effective|executed)?\s*:?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/gi;
  const dateMatches = text.matchAll(datePattern);
  for (const match of dateMatches) {
    metadata.dates.push(match[1].trim());
  }
  metadata.dates = [...new Set(metadata.dates)].slice(0, 3);

  // Detect document type
  const typeKeywords = {
    'NDA': /non-disclosure|confidentiality agreement/i,
    'Service Agreement': /service agreement|services agreement/i,
    'Employment Contract': /employment agreement|employment contract/i,
    'Lease Agreement': /lease agreement|rental agreement/i,
    'Purchase Agreement': /purchase agreement|sale agreement/i,
    'License Agreement': /license agreement|licensing agreement/i,
    'Partnership Agreement': /partnership agreement/i,
    'Consulting Agreement': /consulting agreement/i
  };

  for (const [type, pattern] of Object.entries(typeKeywords)) {
    if (pattern.test(text)) {
      metadata.documentType = type;
      break;
    }
  }

  return metadata;
}

/**
 * Main extraction function - routes to appropriate extractor
 */
async function extractText(filePath, fileType) {
  logger.info(`Extracting text from ${fileType} file: ${filePath}`);

  let result;
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf' || fileType === 'application/pdf') {
    result = await extractFromPDF(filePath);
  } else if (ext === '.docx' || ext === '.doc' || fileType.includes('wordprocessingml')) {
    result = await extractFromDOCX(filePath);
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  // Extract additional metadata from text
  const contractMetadata = extractContractMetadata(result.text);

  return {
    text: result.text,
    metadata: {
      ...result.metadata,
      ...contractMetadata,
      characterCount: result.text.length,
      wordCount: result.text.split(/\s+/).length
    }
  };
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    logger.error('Failed to get file size:', error);
    return 0;
  }
}

module.exports = {
  extractText,
  extractFromPDF,
  extractFromDOCX,
  extractContractMetadata,
  getFileSize
};

