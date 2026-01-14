-- Daily Flow Checklist
-- Created: 2026-01-13

-- Create daily_flow_completions table to track completed items per day
CREATE TABLE IF NOT EXISTS daily_flow_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_key TEXT NOT NULL,
    completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(item_key, completed_date)
);

-- Create index for faster queries
CREATE INDEX idx_daily_flow_completions_date ON daily_flow_completions(completed_date);
CREATE INDEX idx_daily_flow_completions_item ON daily_flow_completions(item_key);

-- Enable Row Level Security
ALTER TABLE daily_flow_completions ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (personal use)
CREATE POLICY "Enable all operations for everyone" ON daily_flow_completions FOR ALL USING (true) WITH CHECK (true);
