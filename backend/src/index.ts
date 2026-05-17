import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { analysisRouter } from './routes/analysis';
import { healthRouter } from './routes/health';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { ensureDatabaseSchema } from './db/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply strict rate limiting directly to analyze
app.use('/api/analyze', rateLimiter);
app.use('/api', analysisRouter);
app.use('/api', healthRouter);

app.use(errorHandler);

async function startServer() {
  await ensureDatabaseSchema();

  app.listen(port, () => {
    console.log(`LexLens backend started on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start LexLens backend', err);
  process.exit(1);
});
