-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'client' CHECK (role IN ('admin', 'lawyer', 'client')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    extracted_text TEXT,
    page_count INTEGER,
    status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'analyzed', 'failed')),
    parent_contract_id INTEGER REFERENCES contracts(id) ON DELETE SET NULL,
    version INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clauses table
CREATE TABLE IF NOT EXISTS clauses (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    clause_text TEXT NOT NULL,
    clause_type VARCHAR(100),
    position INTEGER NOT NULL,
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high')),
    risk_explanation TEXT,
    confidence_score DECIMAL(3, 2),
    key_entities JSONB DEFAULT '[]',
    embedding vector(384),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis results table
CREATE TABLE IF NOT EXISTS analysis_results (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    summary TEXT,
    main_obligations JSONB DEFAULT '[]',
    payment_terms JSONB DEFAULT '{}',
    key_risks JSONB DEFAULT '[]',
    renewal_terms TEXT,
    termination_terms TEXT,
    overall_risk_score DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comparison results table
CREATE TABLE IF NOT EXISTS comparison_results (
    id SERIAL PRIMARY KEY,
    contract_v1_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    contract_v2_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    added_clauses JSONB DEFAULT '[]',
    removed_clauses JSONB DEFAULT '[]',
    modified_clauses JSONB DEFAULT '[]',
    change_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contract_v1_id, contract_v2_id)
);

-- Processing jobs table
CREATE TABLE IF NOT EXISTS processing_jobs (
    id SERIAL PRIMARY KEY,
    contract_id INTEGER REFERENCES contracts(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('extraction', 'analysis', 'comparison')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_clauses_contract_id ON clauses(contract_id);
CREATE INDEX idx_clauses_type ON clauses(clause_type);
CREATE INDEX idx_clauses_risk_level ON clauses(risk_level);
CREATE INDEX idx_analysis_contract_id ON analysis_results(contract_id);
CREATE INDEX idx_comparison_contracts ON comparison_results(contract_v1_id, contract_v2_id);
CREATE INDEX idx_jobs_contract_id ON processing_jobs(contract_id);
CREATE INDEX idx_jobs_status ON processing_jobs(status);

-- Create vector similarity search index
CREATE INDEX ON clauses USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

