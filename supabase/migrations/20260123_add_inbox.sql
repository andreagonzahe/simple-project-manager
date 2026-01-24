-- Add inbox table for quick task capture
-- Tasks can be added to inbox without area/project and organized later

CREATE TABLE IF NOT EXISTS inbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_inbox_created_at ON inbox(created_at DESC);

-- Create trigger for updated_at
CREATE TRIGGER update_inbox_updated_at BEFORE UPDATE ON inbox
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE inbox ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (personal use)
CREATE POLICY "Enable all operations for everyone" ON inbox FOR ALL USING (true) WITH CHECK (true);
