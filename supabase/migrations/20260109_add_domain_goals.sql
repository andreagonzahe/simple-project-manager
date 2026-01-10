-- Add goals column to domains table
-- Each domain can have up to 3 goals stored as JSON array
-- Created: 2026-01-09

-- Add goals column to domains table
ALTER TABLE domains ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_domains_goals ON domains USING GIN (goals);
