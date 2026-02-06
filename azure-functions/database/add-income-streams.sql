-- Income Streams Table Migration
-- Run this to add income_streams table to your PostgreSQL database

CREATE TABLE IF NOT EXISTS income_streams (
    income_stream_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_id INTEGER REFERENCES accounts(account_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    frequency VARCHAR(50) NOT NULL DEFAULT 'monthly',
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

-- Display success
SELECT 'Income Streams table created successfully!' AS status;
