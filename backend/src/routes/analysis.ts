import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middleware/upload';
import { extractText } from '../services/fileParser';
import { analyzeWithGLM } from '../services/glmService';
import { parseAndScore } from '../services/riskScorer';
import { generateReport } from '../services/reportGenerator';
import { query } from '../db/client';

export const analysisRouter = Router();

analysisRouter.post('/analyze', upload.single('contract'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Log request for rate limiting (200 RPD tracking)
    await query("INSERT INTO request_log (endpoint) VALUES ($1)", ['/api/analyze']);

    let contractText = '';
    let fileName = 'Direct Text Input';
    let fileType = 'text/plain';

    if (req.file) {
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      try {
        const fs = require('fs');
        const os = require('os');
        const path = require('path');
        const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${fileName}`);
        fs.writeFileSync(tmpPath, req.file.buffer);
        
        contractText = await extractText(tmpPath, fileType);
        fs.unlinkSync(tmpPath);
      } catch (e) {
        return res.status(422).json({ error: 'Could not read contract file' });
      }
    } else if (req.body.text) {
      contractText = req.body.text;
    } else {
      return res.status(400).json({ error: 'No contract file or text provided' });
    }

    let glmRawJSON;
    try {
      glmRawJSON = await analyzeWithGLM(contractText);
    } catch (analysisErr: any) {
      console.error('Routeway analysis failed:', analysisErr?.response?.data || analysisErr.message);
      return res.status(502).json({
        error: 'AI service unavailable',
        detail: analysisErr.message || 'All Routeway models failed'
      });
    }

    let parsedResult;
    try {
      parsedResult = parseAndScore(glmRawJSON);
    } catch (parseErr) {
      return res.status(500).json({ error: 'Analysis failed — please try again' });
    }

    // Store in PostgreSQL
    const normalizedFileType = normalizeFileType(fileType, fileName);
    const insertSQL = `
      INSERT INTO analyses (
        contract_type, file_name, file_type, overall_score, fairness_score, 
        clarity_score, enforceability_score, balance_score, verdict,
        parties, analysis_date, jurisdiction, clauses, top_risks, summary, recommendations, raw_contract_text
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id
    `;
    const dbRes = await query(
      insertSQL,
      [
        parsedResult.contractType, fileName, normalizedFileType, parsedResult.overallScore, parsedResult.fairnessScore,
        parsedResult.clarityScore, parsedResult.enforceabilityScore, parsedResult.balanceScore, parsedResult.verdict,
        parsedResult.parties, parsedResult.date, parsedResult.jurisdiction, JSON.stringify(parsedResult.clauses),
        JSON.stringify(parsedResult.topRisks), parsedResult.summary, JSON.stringify(parsedResult.recommendations),
        contractText
      ]
    );

    const analysisId = dbRes.rows[0].id;
    return res.json({ analysisId, provider: 'routeway', routewayModel: glmRawJSON._routewayModel || null, ...parsedResult });

  } catch (err) {
    next(err);
  }
});

function normalizeFileType(fileType: string, fileName: string): string {
  const lowerType = (fileType || '').toLowerCase();
  const lowerName = (fileName || '').toLowerCase();

  if (lowerType.includes('pdf') || lowerName.endsWith('.pdf')) return 'pdf';
  if (lowerType.includes('wordprocessingml') || lowerName.endsWith('.docx')) return 'docx';
  if (lowerType.includes('text/plain') || lowerName.endsWith('.txt')) return 'txt';
  if (!lowerType) return 'unknown';

  return lowerType.slice(0, 100);
}

analysisRouter.get('/analysis/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dbRes = await query("SELECT * FROM analyses WHERE id = $1", [id]);
    if (dbRes.rowCount === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const row = dbRes.rows[0];
    res.json({
      analysisId: row.id,
      contractType: row.contract_type,
      parties: row.parties,
      date: row.analysis_date,
      jurisdiction: row.jurisdiction,
      overallScore: row.overall_score,
      fairnessScore: row.fairness_score,
      clarityScore: row.clarity_score,
      enforceabilityScore: row.enforceability_score,
      balanceScore: row.balance_score,
      verdict: row.verdict,
      clauses: row.clauses,
      topRisks: row.top_risks,
      summary: row.summary,
      recommendations: row.recommendations
    });
  } catch (err) {
    next(err);
  }
});

analysisRouter.get('/report/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const dbRes = await query("SELECT * FROM analyses WHERE id = $1", [id]);
    if (dbRes.rowCount === 0) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    const row = dbRes.rows[0];
    const analysis = {
      contractType: row.contract_type,
      parties: row.parties,
      date: row.analysis_date,
      jurisdiction: row.jurisdiction,
      overallScore: row.overall_score,
      fairnessScore: row.fairness_score,
      clarityScore: row.clarity_score,
      enforceabilityScore: row.enforceability_score,
      balanceScore: row.balance_score,
      verdict: row.verdict,
      clauses: row.clauses,
      topRisks: row.top_risks,
      summary: row.summary,
      recommendations: row.recommendations
    };

    generateReport(analysis as any, res);
  } catch (err) {
    next(err);
  }
});
