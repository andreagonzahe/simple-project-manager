-- Add due_time column to reminders table
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS due_time TIME;

-- Create index for sorting by due time
CREATE INDEX IF NOT EXISTS idx_reminders_due_time ON reminders(due_time);
