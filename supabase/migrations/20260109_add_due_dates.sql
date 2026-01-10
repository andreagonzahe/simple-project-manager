-- Add due_date fields to tasks, features, and bugs tables for calendar view
-- Created: 2026-01-09

-- Add due_date to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add due_date to features table
ALTER TABLE features ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add due_date to bugs table
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS due_date DATE;

-- Create index for faster date queries
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_features_due_date ON features(due_date);
CREATE INDEX IF NOT EXISTS idx_bugs_due_date ON bugs(due_date);
