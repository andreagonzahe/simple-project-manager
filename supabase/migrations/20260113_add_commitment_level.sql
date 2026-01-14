-- Add commitment_level to tasks, bugs, and features
-- Created: 2026-01-13

-- Create enum for commitment level
CREATE TYPE commitment_level AS ENUM ('must_do', 'optional');

-- Add commitment_level column to tasks table (default to must_do for existing tasks)
ALTER TABLE tasks 
ADD COLUMN commitment_level commitment_level DEFAULT 'must_do';

-- Add commitment_level column to bugs table (default to must_do for existing bugs)
ALTER TABLE bugs 
ADD COLUMN commitment_level commitment_level DEFAULT 'must_do';

-- Add commitment_level column to features table (default to must_do for existing features)
ALTER TABLE features 
ADD COLUMN commitment_level commitment_level DEFAULT 'must_do';

-- Create indexes for filtering by commitment level
CREATE INDEX idx_tasks_commitment_level ON tasks(commitment_level);
CREATE INDEX idx_bugs_commitment_level ON bugs(commitment_level);
CREATE INDEX idx_features_commitment_level ON features(commitment_level);
