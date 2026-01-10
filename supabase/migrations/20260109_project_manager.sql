-- Simple Personal Project Manager Database Schema
-- Created: 2026-01-09

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS bugs CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS subdomains CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS areas_of_life CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS item_status CASCADE;
DROP TYPE IF EXISTS item_priority CASCADE;
DROP TYPE IF EXISTS bug_severity CASCADE;
DROP TYPE IF EXISTS parent_type CASCADE;

-- Create enums
CREATE TYPE item_status AS ENUM ('backlog', 'in_progress', 'completed');
CREATE TYPE item_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE bug_severity AS ENUM ('minor', 'major', 'critical');
CREATE TYPE parent_type AS ENUM ('feature', 'bug');

-- Areas of Life table
CREATE TABLE areas_of_life (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Domains table
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID NOT NULL REFERENCES areas_of_life(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#5E5592',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subdomains table (now called "Projects" in UI)
CREATE TABLE subdomains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain_id UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Features table
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain_id UUID NOT NULL REFERENCES subdomains(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status item_status DEFAULT 'backlog',
    priority item_priority DEFAULT 'medium',
    date_started TIMESTAMPTZ,
    date_completed TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bugs table
CREATE TABLE bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain_id UUID NOT NULL REFERENCES subdomains(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status item_status DEFAULT 'backlog',
    priority item_priority DEFAULT 'medium',
    severity bug_severity DEFAULT 'minor',
    date_started TIMESTAMPTZ,
    date_completed TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain_id UUID NOT NULL REFERENCES subdomains(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status item_status DEFAULT 'backlog',
    priority item_priority DEFAULT 'medium',
    date_started TIMESTAMPTZ,
    date_completed TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subtasks table (for features and bugs only)
CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_type parent_type NOT NULL,
    parent_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status item_status DEFAULT 'backlog',
    priority item_priority DEFAULT 'medium',
    date_started TIMESTAMPTZ,
    date_completed TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_domains_area_id ON domains(area_id);
CREATE INDEX idx_subdomains_domain_id ON subdomains(domain_id);
CREATE INDEX idx_features_subdomain_id ON features(subdomain_id);
CREATE INDEX idx_features_status ON features(status);
CREATE INDEX idx_bugs_subdomain_id ON bugs(subdomain_id);
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_tasks_subdomain_id ON tasks(subdomain_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_subtasks_parent ON subtasks(parent_type, parent_id);
CREATE INDEX idx_subtasks_status ON subtasks(status);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_areas_of_life_updated_at BEFORE UPDATE ON areas_of_life
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subdomains_updated_at BEFORE UPDATE ON subdomains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at BEFORE UPDATE ON features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bugs_updated_at BEFORE UPDATE ON bugs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - for personal use, allow all operations
ALTER TABLE areas_of_life ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (personal use)
CREATE POLICY "Enable all operations for everyone" ON areas_of_life FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON domains FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON subdomains FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON features FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON bugs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON subtasks FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data to get started
INSERT INTO areas_of_life (name, color, icon, sort_order) VALUES
    ('Career', '#3B82F6', 'Briefcase', 1),
    ('Housing', '#F97316', 'Home', 2),
    ('Health', '#10B981', 'Heart', 3),
    ('Immigration', '#8B5CF6', 'Plane', 4),
    ('Personal', '#EC4899', 'User', 5);

-- Add some sample domains for Career
INSERT INTO domains (area_id, name, description, color)
SELECT id, 'Sparken', 'Neuromarketing agency', '#5E5592'
FROM areas_of_life WHERE name = 'Career';

INSERT INTO domains (area_id, name, description, color)
SELECT id, 'Freelancing', 'Independent projects', '#10B981'
FROM areas_of_life WHERE name = 'Career';

-- Add sample subdomains for Sparken
INSERT INTO subdomains (domain_id, name, description)
SELECT id, 'Neuromarketing', 'Core neuromarketing services'
FROM domains WHERE name = 'Sparken';

INSERT INTO subdomains (domain_id, name, description)
SELECT id, 'Client Portal', 'Internal client management system'
FROM domains WHERE name = 'Sparken';
