-- ============================================================================
-- COMPLETE DEMO DATABASE SETUP
-- ============================================================================
-- This script sets up the entire database schema for the demo version
-- Run this in your DEMO Supabase SQL Editor
-- Created: 2026-01-15
-- ============================================================================

-- ============================================================================
-- STEP 1: CLEAN SLATE (Drop everything)
-- ============================================================================
DROP TABLE IF EXISTS daily_flow_completions CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS subtasks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS bugs CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS subdomains CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS areas_of_life CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS commitment_level CASCADE;
DROP TYPE IF EXISTS domain_status CASCADE;
DROP TYPE IF EXISTS item_status CASCADE;
DROP TYPE IF EXISTS item_priority CASCADE;
DROP TYPE IF EXISTS bug_severity CASCADE;
DROP TYPE IF EXISTS parent_type CASCADE;

-- ============================================================================
-- STEP 2: CREATE ENUMS
-- ============================================================================
CREATE TYPE item_status AS ENUM ('backlog', 'in_progress', 'completed');
CREATE TYPE item_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE bug_severity AS ENUM ('minor', 'major', 'critical');
CREATE TYPE commitment_level AS ENUM ('must_do', 'optional');
CREATE TYPE domain_status AS ENUM ('planning', 'active', 'paused', 'completed');

-- ============================================================================
-- STEP 3: CREATE TABLES
-- ============================================================================

-- Areas of Life table
CREATE TABLE areas_of_life (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    icon TEXT,
    goals JSONB DEFAULT '[]'::jsonb,
    sort_order INTEGER NOT NULL DEFAULT 0,
    map_x INTEGER,
    map_y INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects table (formerly domains)
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID NOT NULL REFERENCES areas_of_life(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT,
    color TEXT NOT NULL DEFAULT '#5E5592',
    status domain_status DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Features table
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    area_id UUID REFERENCES areas_of_life(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status item_status DEFAULT 'backlog',
    priority item_priority DEFAULT 'medium',
    commitment_level commitment_level DEFAULT 'optional',
    due_date DATE,
    do_date DATE,
    date_started TIMESTAMPTZ,
    date_completed TIMESTAMPTZ,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
    recurrence_end_date DATE,
    last_completed_date DATE,
    next_due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT features_project_or_area_check CHECK (project_id IS NOT NULL OR area_id IS NOT NULL)
);

-- Bugs table
CREATE TABLE bugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    area_id UUID REFERENCES areas_of_life(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status item_status DEFAULT 'backlog',
    priority item_priority DEFAULT 'medium',
    severity bug_severity DEFAULT 'minor',
    commitment_level commitment_level DEFAULT 'optional',
    due_date DATE,
    do_date DATE,
    date_started TIMESTAMPTZ,
    date_completed TIMESTAMPTZ,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
    recurrence_end_date DATE,
    last_completed_date DATE,
    next_due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT bugs_project_or_area_check CHECK (project_id IS NOT NULL OR area_id IS NOT NULL)
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    area_id UUID REFERENCES areas_of_life(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status item_status DEFAULT 'backlog',
    priority item_priority DEFAULT 'medium',
    commitment_level commitment_level DEFAULT 'optional',
    due_date DATE,
    do_date DATE,
    date_started TIMESTAMPTZ,
    date_completed TIMESTAMPTZ,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly')),
    recurrence_end_date DATE,
    last_completed_date DATE,
    next_due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT tasks_project_or_area_check CHECK (project_id IS NOT NULL OR area_id IS NOT NULL)
);

-- Reminders table
CREATE TABLE reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily Flow Completions table
CREATE TABLE daily_flow_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_key TEXT NOT NULL,
    completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(item_key, completed_date)
);

-- ============================================================================
-- STEP 4: CREATE INDEXES
-- ============================================================================

-- Areas of Life indexes
CREATE INDEX idx_areas_of_life_goals ON areas_of_life USING GIN (goals);

-- Projects indexes
CREATE INDEX idx_projects_area_id ON projects(area_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_goal ON projects(goal);

-- Features indexes
CREATE INDEX idx_features_project_id ON features(project_id);
CREATE INDEX idx_features_area_id ON features(area_id);
CREATE INDEX idx_features_status ON features(status);
CREATE INDEX idx_features_due_date ON features(due_date);
CREATE INDEX idx_features_do_date ON features(do_date);
CREATE INDEX idx_features_commitment_level ON features(commitment_level);
CREATE INDEX idx_features_is_recurring ON features(is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX idx_features_next_due_date ON features(next_due_date) WHERE is_recurring = TRUE;

-- Bugs indexes
CREATE INDEX idx_bugs_project_id ON bugs(project_id);
CREATE INDEX idx_bugs_area_id ON bugs(area_id);
CREATE INDEX idx_bugs_status ON bugs(status);
CREATE INDEX idx_bugs_due_date ON bugs(due_date);
CREATE INDEX idx_bugs_do_date ON bugs(do_date);
CREATE INDEX idx_bugs_commitment_level ON bugs(commitment_level);
CREATE INDEX idx_bugs_is_recurring ON bugs(is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX idx_bugs_next_due_date ON bugs(next_due_date) WHERE is_recurring = TRUE;

-- Tasks indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_area_id ON tasks(area_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_do_date ON tasks(do_date);
CREATE INDEX idx_tasks_commitment_level ON tasks(commitment_level);
CREATE INDEX idx_tasks_is_recurring ON tasks(is_recurring) WHERE is_recurring = TRUE;
CREATE INDEX idx_tasks_next_due_date ON tasks(next_due_date) WHERE is_recurring = TRUE;

-- Reminders indexes
CREATE INDEX idx_reminders_created_at ON reminders(created_at DESC);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);

-- Daily Flow indexes
CREATE INDEX idx_daily_flow_completions_date ON daily_flow_completions(completed_date);
CREATE INDEX idx_daily_flow_completions_item ON daily_flow_completions(item_key);

-- ============================================================================
-- STEP 5: CREATE TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_areas_of_life_updated_at 
    BEFORE UPDATE ON areas_of_life
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_updated_at 
    BEFORE UPDATE ON features
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bugs_updated_at 
    BEFORE UPDATE ON bugs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at 
    BEFORE UPDATE ON reminders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY & CREATE POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE areas_of_life ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_flow_completions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo use)
CREATE POLICY "Enable all operations for everyone" ON areas_of_life FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON features FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON bugs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for everyone" ON daily_flow_completions FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- DONE! Now run demo_seed_data.sql to populate with demo data
-- ============================================================================
