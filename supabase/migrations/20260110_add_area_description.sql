-- Add description column to areas_of_life table
-- This allows areas to have optional descriptions just like projects

ALTER TABLE areas_of_life ADD COLUMN IF NOT EXISTS description TEXT;

-- No index needed for description as it's not used for queries
