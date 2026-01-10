-- Add status column to domains table
-- Uses the same item_status enum as tasks
ALTER TABLE domains ADD COLUMN IF NOT EXISTS status item_status DEFAULT 'idea';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
