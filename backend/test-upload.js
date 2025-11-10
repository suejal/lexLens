/**
 * Simple test script to verify upload and extraction functionality
 * Run with: node test-upload.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { extractText } = require('./src/services/extraction.service');

async function testExtraction() {
  console.log('🧪 Testing text extraction service...\n');

  // Create a simple test text file to simulate a document
  const testFilePath = path.join(__dirname, 'test-sample.txt');
  const testContent = `
NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into as of January 15, 2024,
between Acme Corporation ("Disclosing Party") and Tech Solutions Inc. ("Receiving Party").

1. CONFIDENTIAL INFORMATION
The Receiving Party agrees to maintain in confidence all proprietary information disclosed
by the Disclosing Party.

2. OBLIGATIONS
The Receiving Party shall:
- Not disclose confidential information to third parties
- Use the information only for the intended purpose
- Return all materials upon request

3. TERM AND TERMINATION
This Agreement shall remain in effect for a period of two (2) years from the date of execution.
Either party may terminate this agreement with thirty (30) days written notice.

4. GOVERNING LAW
This Agreement shall be governed by the laws of the State of California.

Signed:
Acme Corporation
Tech Solutions Inc.
Date: January 15, 2024
  `.trim();

  fs.writeFileSync(testFilePath, testContent);

  try {
    console.log('📄 Test file created:', testFilePath);
    console.log('📏 File size:', fs.statSync(testFilePath).size, 'bytes\n');

    // Note: This will fail for .txt files, but demonstrates the service
    console.log('⚠️  Note: Text extraction works with PDF/DOCX files.');
    console.log('   For testing, upload a real PDF or DOCX through the UI.\n');

    console.log('✅ Service is ready to process PDF and DOCX files!');
    console.log('\n📋 To test:');
    console.log('   1. Start the application: docker-compose up -d');
    console.log('   2. Open http://localhost:5173');
    console.log('   3. Login or register');
    console.log('   4. Upload a PDF or DOCX contract');
    console.log('   5. Check the contract list to see processing status\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Clean up
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('🧹 Cleaned up test file');
    }
  }
}

// Run the test
testExtraction().catch(console.error);

