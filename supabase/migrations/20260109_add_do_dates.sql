-- Add do_date fields to tasks, features, and bugs tables
-- Created: 2026-01-09

-- Add do_date to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS do_date DATE;

-- Add do_date to features table
ALTER TABLE features ADD COLUMN IF NOT EXISTS do_date DATE;

-- Add do_date to bugs table
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS do_date DATE;

-- Create index for faster date queries
CREATE INDEX IF NOT EXISTS idx_tasks_do_date ON tasks(do_date);
CREATE INDEX IF NOT EXISTS idx_features_do_date ON features(do_date);
CREATE INDEX IF NOT EXISTS idx_bugs_do_date ON bugs(do_date);
