import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractText(filePath: string, fileType: string): Promise<string> {
  let rawText = '';

  if (fileType === 'application/pdf' || filePath.endsWith('.pdf')) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    rawText = data.text;
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filePath.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ path: filePath });
    rawText = result.value;
  } else {
    throw new Error('Unsupported file format. Only PDF and DOCX are allowed.');
  }

  return preprocessText(rawText);
}

function preprocessText(text: string): string {
  // 1. Strip excessive whitespace (collapse 3+ newlines to 2)
  let processed = text.replace(/\n{3,}/g, '\n\n');
  
  // 2. Remove simple repeating page headers/footers (Optional, simple regex for Page X of Y or standalone numbers)
  processed = processed.replace(/^\s*\d+\s*$/gm, '');
  processed = processed.replace(/^.*Page \d+ of \d+.*$/gm, '');

  // 3. Truncate to 80,000 characters MAX
  const MAX_CHARS = 80000;
  if (processed.length > MAX_CHARS) {
    processed = processed.substring(0, MAX_CHARS) + '\n[NOTE: Contract truncated at 80,000 characters for analysis]';
  }

  return processed;
}
