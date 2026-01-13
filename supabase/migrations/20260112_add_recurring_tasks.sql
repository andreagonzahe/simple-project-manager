-- Add recurring task functionality
-- This allows tasks, bugs, and features to repeat on a schedule

-- Add recurrence fields to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly'));
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_completed_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS next_due_date DATE;

-- Add recurrence fields to bugs
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly'));
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS last_completed_date DATE;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS next_due_date DATE;

-- Add recurrence fields to features
ALTER TABLE features ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE features ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly'));
ALTER TABLE features ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE features ADD COLUMN IF NOT EXISTS last_completed_date DATE;
ALTER TABLE features ADD COLUMN IF NOT EXISTS next_due_date DATE;

-- Add indexes for better query performance on recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_is_recurring ON tasks(is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_bugs_is_recurring ON bugs(is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_features_is_recurring ON features(is_recurring) WHERE is_recurring = TRUE;

CREATE INDEX IF NOT EXISTS idx_tasks_next_due_date ON tasks(next_due_date) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_bugs_next_due_date ON bugs(next_due_date) WHERE is_recurring = TRUE;
CREATE INDEX IF NOT EXISTS idx_features_next_due_date ON features(next_due_date) WHERE is_recurring = TRUE;
