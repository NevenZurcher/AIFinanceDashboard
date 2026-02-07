-- Income Streams Table Migration
-- Run this to add income_streams table to your PostgreSQL database

-- Drop existing table if it exists (for clean re-creation)
DROP TABLE IF EXISTS income_streams CASCADE;

CREATE TABLE income_streams (
    income_stream_id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    account_id UUID NOT NULL REFERENCES accounts(account_id),
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    frequency VARCHAR(20) NOT NULL, -- 'weekly', 'bi-weekly', 'monthly',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_deposit_date TIMESTAMP,
    next_deposit_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries by user
CREATE INDEX IF NOT EXISTS idx_income_streams_user_id ON income_streams(user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_income_streams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS income_streams_updated_at ON income_streams;
CREATE TRIGGER income_streams_updated_at
    BEFORE UPDATE ON income_streams
    FOR EACH ROW
    EXECUTE FUNCTION update_income_streams_updated_at();
