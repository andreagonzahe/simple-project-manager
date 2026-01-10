-- Add goals column to areas_of_life table
-- Each area can have up to 3 goals stored as JSON array
-- Created: 2026-01-09

-- Add goals column to areas_of_life table
ALTER TABLE areas_of_life ADD COLUMN IF NOT EXISTS goals JSONB DEFAULT '[]'::jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_areas_of_life_goals ON areas_of_life USING GIN (goals);
