-- Rename domains to projects throughout the database
-- This improves clarity and aligns database schema with business terminology

-- Step 1: Rename the main table
ALTER TABLE domains RENAME TO projects;

-- Step 2: Rename foreign key columns in tasks table
ALTER TABLE tasks RENAME COLUMN domain_id TO project_id;

-- Step 3: Rename foreign key columns in bugs table
ALTER TABLE bugs RENAME COLUMN domain_id TO project_id;

-- Step 4: Rename foreign key columns in features table
ALTER TABLE features RENAME COLUMN domain_id TO project_id;

-- Step 5: Rename constraints (PostgreSQL auto-renames foreign keys when table is renamed)
-- But we'll explicitly rename the check constraints for clarity
ALTER TABLE tasks RENAME CONSTRAINT tasks_domain_or_area_check TO tasks_project_or_area_check;
ALTER TABLE bugs RENAME CONSTRAINT bugs_domain_or_area_check TO bugs_project_or_area_check;
ALTER TABLE features RENAME CONSTRAINT features_domain_or_area_check TO features_project_or_area_check;

-- Step 6: Rename indexes for better clarity
ALTER INDEX IF EXISTS idx_tasks_domain_id RENAME TO idx_tasks_project_id;
ALTER INDEX IF EXISTS idx_bugs_domain_id RENAME TO idx_bugs_project_id;
ALTER INDEX IF EXISTS idx_features_domain_id RENAME TO idx_features_project_id;

-- Note: Foreign key constraints are automatically updated when the parent table is renamed
-- The foreign keys pointing to projects(id) will continue to work correctly
