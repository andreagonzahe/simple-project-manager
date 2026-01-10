-- Simplify hierarchy: Domain -> Project -> Task (remove subdomains)
-- Created: 2026-01-09

-- Step 1: Add domain_id directly to tasks, bugs, and features
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id) ON DELETE CASCADE;
ALTER TABLE bugs ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id) ON DELETE CASCADE;
ALTER TABLE features ADD COLUMN IF NOT EXISTS domain_id UUID REFERENCES domains(id) ON DELETE CASCADE;

-- Step 2: Create indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_tasks_domain_id ON tasks(domain_id);
CREATE INDEX IF NOT EXISTS idx_bugs_domain_id ON bugs(domain_id);
CREATE INDEX IF NOT EXISTS idx_features_domain_id ON features(domain_id);

-- Step 3: Drop the old subdomain foreign key constraints and columns
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_subdomain_id_fkey;
ALTER TABLE bugs DROP CONSTRAINT IF EXISTS bugs_subdomain_id_fkey;
ALTER TABLE features DROP CONSTRAINT IF EXISTS features_subdomain_id_fkey;

ALTER TABLE tasks DROP COLUMN IF EXISTS subdomain_id;
ALTER TABLE bugs DROP COLUMN IF EXISTS subdomain_id;
ALTER TABLE features DROP COLUMN IF EXISTS subdomain_id;

-- Step 4: Drop subdomains table entirely
DROP TABLE IF EXISTS subdomains CASCADE;

-- Step 5: Drop subtasks table as it's tied to the complex hierarchy
DROP TABLE IF EXISTS subtasks CASCADE;

-- Note: This will delete all existing projects and tasks in Career and other domains
-- The user confirmed this is acceptable
