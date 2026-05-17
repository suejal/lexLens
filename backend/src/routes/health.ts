import { Router, Request, Response } from 'express';
import { query } from '../db/client';

export const healthRouter = Router();

healthRouter.get('/health', async (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    model: 'glm-4.5-air:free',
    timestamp: new Date().toISOString()
  });
});

healthRouter.get('/usage', async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    // This looks for all requests grouped by current day.
    const result = await query(
      `SELECT count(*) as count FROM request_log WHERE created_at::date = $1`,
      [today]
    );
    const count = parseInt(result.rows[0].count, 10);
    
    // resetAt tomorrow midnight UTC
    const now = new Date();
    const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));

    res.json({
      requestsToday: count,
      remaining: Math.max(0, 200 - count),
      resetAt: reset.toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Storage error' });
  }
});
