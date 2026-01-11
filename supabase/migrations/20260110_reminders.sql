-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for sorting
CREATE INDEX IF NOT EXISTS idx_reminders_created_at ON reminders(created_at DESC);

-- Add RLS policies
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view reminders (adjust based on your auth setup)
CREATE POLICY "Enable read access for all users" ON reminders
  FOR SELECT USING (true);

-- Policy: Anyone can insert reminders
CREATE POLICY "Enable insert access for all users" ON reminders
  FOR INSERT WITH CHECK (true);

-- Policy: Anyone can update reminders
CREATE POLICY "Enable update access for all users" ON reminders
  FOR UPDATE USING (true);

-- Policy: Anyone can delete reminders
CREATE POLICY "Enable delete access for all users" ON reminders
  FOR DELETE USING (true);
