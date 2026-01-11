-- Add due_date column to reminders table
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS due_date DATE;

-- Create index for sorting by due date
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON reminders(due_date);
