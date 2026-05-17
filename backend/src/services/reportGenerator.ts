import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { AnalysisResult } from './riskScorer';

export function generateReport(analysis: AnalysisResult, res: Response) {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=LexLens-Report.pdf`);

  doc.pipe(res);

  // Header
  doc.fontSize(24).font('Helvetica-Bold').text('LexLens Analysis Report', { align: 'center' });
  doc.moveDown();

  // Overview
  doc.fontSize(16).fillColor('#333333').text('Contract Overview');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').fillColor('#000000');
  doc.text(`Type: ${analysis.contractType}`);
  doc.text(`Parties: ${analysis.parties}`);
  doc.text(`Jurisdiction: ${analysis.jurisdiction}`);
  doc.text(`Date: ${analysis.date}`);
  doc.moveDown();

  // Scores
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#333333').text('Risk Scores (1-10)');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica');
  doc.text(`Overall Score: ${analysis.overallScore}`);
  doc.text(`Fairness: ${analysis.fairnessScore} | Clarity: ${analysis.clarityScore} | Enforceability: ${analysis.enforceabilityScore} | Balance: ${analysis.balanceScore}`);
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(`Verdict: ${analysis.verdict}`);
  doc.moveDown();

  // Summary
  doc.fontSize(16).fillColor('#333333').text('Summary');
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').fillColor('#000000').text(analysis.summary);
  doc.moveDown();

  // Top Risks
  if (analysis.topRisks && analysis.topRisks.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#333333').text('Top Risks');
    doc.moveDown(0.5);
    analysis.topRisks.forEach((risk, i) => {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#d9534f').text(`${i + 1}. ${risk.title} (${risk.severity})`);
      doc.font('Helvetica').fillColor('#000000').text(risk.description);
      doc.font('Helvetica-Oblique').text(`Action: ${risk.action}`);
      doc.moveDown(0.5);
    });
    doc.moveDown();
  }

  // Recommendations
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#333333').text('Recommendations');
    doc.moveDown(0.5);
    analysis.recommendations.forEach((rec, i) => {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#5bc0de').text(`[${rec.priority}] Clause: ${rec.clause}`);
      doc.font('Helvetica').fillColor('#000000').text(rec.action);
      doc.moveDown(0.5);
    });
  }

  doc.end();
}
