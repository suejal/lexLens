import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

export async function ensureDatabaseSchema() {
  await query('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  await query(`
    CREATE TABLE IF NOT EXISTS analyses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      contract_type VARCHAR(100),
      file_name VARCHAR(255),
      file_type VARCHAR(100),
      overall_score DECIMAL(3,1),
      fairness_score DECIMAL(3,1),
      clarity_score DECIMAL(3,1),
      enforceability_score DECIMAL(3,1),
      balance_score DECIMAL(3,1),
      verdict TEXT,
      parties TEXT,
      analysis_date VARCHAR(100),
      jurisdiction TEXT,
      clauses JSONB,
      top_risks JSONB,
      summary TEXT,
      recommendations JSONB,
      raw_contract_text TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS request_log (
      id SERIAL PRIMARY KEY,
      endpoint VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await query('ALTER TABLE analyses ALTER COLUMN file_type TYPE VARCHAR(100)');
  await query('ALTER TABLE analyses ALTER COLUMN verdict TYPE TEXT');
  await query('ALTER TABLE analyses ALTER COLUMN parties TYPE TEXT');
  await query('ALTER TABLE analyses ALTER COLUMN jurisdiction TYPE TEXT');
  await query('ALTER TABLE analyses ALTER COLUMN summary TYPE TEXT');

  await query('CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at)');
  await query('CREATE INDEX IF NOT EXISTS idx_request_log_created ON request_log(created_at)');
}
