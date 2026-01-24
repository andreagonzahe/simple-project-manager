-- Add map position fields to areas_of_life table
ALTER TABLE areas_of_life 
ADD COLUMN map_x INTEGER,
ADD COLUMN map_y INTEGER;

-- Add comment explaining the fields
COMMENT ON COLUMN areas_of_life.map_x IS 'X coordinate for map view positioning';
COMMENT ON COLUMN areas_of_life.map_y IS 'Y coordinate for map view positioning';
