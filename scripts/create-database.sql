-- Create database schema for IntelliClaim AI system

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'processing',
    extracted_text TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Decisions table
CREATE TABLE IF NOT EXISTS decisions (
    id SERIAL PRIMARY KEY,
    query TEXT NOT NULL,
    parsed_query JSONB,
    decision VARCHAR(20) NOT NULL,
    confidence DECIMAL(3,2),
    amount INTEGER DEFAULT 0,
    justification TEXT,
    relevant_clauses JSONB,
    processing_time VARCHAR(10),
    documents_searched INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clauses table for policy rules
CREATE TABLE IF NOT EXISTS clauses (
    id SERIAL PRIMARY KEY,
    clause_id VARCHAR(20) UNIQUE NOT NULL,
    document_id INTEGER REFERENCES documents(id),
    title VARCHAR(255),
    content TEXT NOT NULL,
    category VARCHAR(100),
    page_number INTEGER,
    relevance_keywords TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit trail table
CREATE TABLE IF NOT EXISTS audit_trail (
    id SERIAL PRIMARY KEY,
    decision_id INTEGER REFERENCES decisions(id),
    action VARCHAR(100) NOT NULL,
    user_id VARCHAR(100),
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_decisions_decision ON decisions(decision);
CREATE INDEX IF NOT EXISTS idx_decisions_created_at ON decisions(created_at);
CREATE INDEX IF NOT EXISTS idx_clauses_clause_id ON clauses(clause_id);
CREATE INDEX IF NOT EXISTS idx_clauses_category ON clauses(category);
CREATE INDEX IF NOT EXISTS idx_audit_trail_decision_id ON audit_trail(decision_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_timestamp ON audit_trail(timestamp);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_documents_text_search ON documents USING gin(to_tsvector('english', extracted_text));
CREATE INDEX IF NOT EXISTS idx_clauses_content_search ON clauses USING gin(to_tsvector('english', content));
