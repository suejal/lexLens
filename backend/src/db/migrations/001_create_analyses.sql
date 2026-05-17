-- migrations/001_create_analyses.sql

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_type VARCHAR(100),
  file_name VARCHAR(255),
  file_type VARCHAR(10),
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
);

CREATE TABLE IF NOT EXISTS request_log (
  id SERIAL PRIMARY KEY,
  endpoint VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_request_log_created ON request_log(created_at);
