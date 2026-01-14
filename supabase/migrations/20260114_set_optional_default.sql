-- Update default commitment level to optional
-- Created: 2026-01-14

-- Change default value for tasks table to 'optional'
ALTER TABLE tasks 
ALTER COLUMN commitment_level SET DEFAULT 'optional';

-- Change default value for bugs table to 'optional'
ALTER TABLE bugs 
ALTER COLUMN commitment_level SET DEFAULT 'optional';

-- Change default value for features table to 'optional'
ALTER TABLE features 
ALTER COLUMN commitment_level SET DEFAULT 'optional';

-- Optional: Update all existing 'must_do' tasks to 'optional'
-- Uncomment these lines if you want to change ALL existing tasks to optional:
-- UPDATE tasks SET commitment_level = 'optional' WHERE commitment_level = 'must_do';
-- UPDATE bugs SET commitment_level = 'optional' WHERE commitment_level = 'must_do';
-- UPDATE features SET commitment_level = 'optional' WHERE commitment_level = 'must_do';
