-- Make domain_id optional for tasks, bugs, and features
-- This allows creating items directly under areas without requiring a project

ALTER TABLE tasks ALTER COLUMN domain_id DROP NOT NULL;
ALTER TABLE bugs ALTER COLUMN domain_id DROP NOT NULL;
ALTER TABLE features ALTER COLUMN domain_id DROP NOT NULL;

-- Add area_id column to tasks, bugs, and features tables if not already present
-- This creates a direct link to areas even when no project exists

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas_of_life(id) ON DELETE CASCADE;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas_of_life(id) ON DELETE CASCADE;
ALTER TABLE features ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas_of_life(id) ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_area_id ON tasks(area_id);
CREATE INDEX IF NOT EXISTS idx_bugs_area_id ON bugs(area_id);
CREATE INDEX IF NOT EXISTS idx_features_area_id ON features(area_id);

-- Add check constraint to ensure either domain_id or area_id is present
ALTER TABLE tasks ADD CONSTRAINT tasks_domain_or_area_check 
  CHECK (domain_id IS NOT NULL OR area_id IS NOT NULL);

ALTER TABLE bugs ADD CONSTRAINT bugs_domain_or_area_check 
  CHECK (domain_id IS NOT NULL OR area_id IS NOT NULL);

ALTER TABLE features ADD CONSTRAINT features_domain_or_area_check 
  CHECK (domain_id IS NOT NULL OR area_id IS NOT NULL);
