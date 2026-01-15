-- ============================================================================
-- 🎯 ONE-CLICK DEMO DATABASE SETUP
-- ============================================================================
-- This script does EVERYTHING: schema + seed data
-- Just copy/paste this entire file into Supabase SQL Editor and click Run!
-- Created: 2026-01-15
-- ============================================================================

-- ============================================================================
-- PART 1: CLEAN SLATE (Drop everything)
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
-- PART 2: CREATE ENUMS
-- ============================================================================
CREATE TYPE item_status AS ENUM ('backlog', 'in_progress', 'completed');
CREATE TYPE item_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE bug_severity AS ENUM ('minor', 'major', 'critical');
CREATE TYPE commitment_level AS ENUM ('must_do', 'optional');
CREATE TYPE domain_status AS ENUM ('planning', 'active', 'paused', 'completed');

-- ============================================================================
-- PART 3: CREATE TABLES
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
-- PART 4: CREATE INDEXES
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
-- PART 5: CREATE TRIGGERS
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
-- PART 6: ENABLE ROW LEVEL SECURITY & CREATE POLICIES
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
-- PART 7: INSERT DEMO DATA
-- ============================================================================

-- =============================================================================
-- AREAS OF LIFE (with diverse examples)
-- =============================================================================

INSERT INTO areas_of_life (id, name, color, icon, sort_order, description, goals) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Career', '#3B82F6', 'Briefcase', 1, 'Professional development and work projects', '["Build successful career and side projects"]'),
    ('a2222222-2222-2222-2222-222222222222', 'Health & Fitness', '#10B981', 'Heart', 2, 'Physical and mental wellness goals', '["Stay active and healthy"]'),
    ('a3333333-3333-3333-3333-333333333333', 'Personal Projects', '#EC4899', 'Sparkles', 3, 'Creative and personal endeavors', '["Create and share knowledge"]'),
    ('a4444444-4444-4444-4444-444444444444', 'Home & Garden', '#F97316', 'Home', 4, 'House maintenance and improvements', '["Maintain a comfortable home"]'),
    ('a5555555-5555-5555-5555-555555555555', 'Learning', '#8B5CF6', 'BookOpen', 5, 'Education and skill development', '["Continuous learning and growth"]');

-- =============================================================================
-- PROJECTS (formerly called domains)
-- =============================================================================

-- Career Projects
INSERT INTO projects (id, area_id, name, description, color, status, goal) VALUES
    ('d1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'SaaS Product', 'Building a project management tool', '#5E5592', 'active', 'Launch MVP by Q2 2026'),
    ('d1111111-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Freelance Clients', 'Client work and consulting', '#3B82F6', 'active', 'Maintain 3 active clients'),
    ('d1111111-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Side Hustle', 'Online course creation', '#06B6D4', 'planning', 'Launch first course');

-- Health & Fitness Projects
INSERT INTO projects (id, area_id, name, description, color, status, goal) VALUES
    ('d2222222-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'Fitness Routine', 'Exercise and strength training', '#10B981', 'active', 'Work out 4x per week'),
    ('d2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'Nutrition', 'Meal planning and healthy eating', '#84CC16', 'active', 'Prep meals for the week'),
    ('d2222222-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'Mental Health', 'Mindfulness and self-care', '#14B8A6', 'active', 'Daily meditation practice');

-- Personal Projects
INSERT INTO projects (id, area_id, name, description, color, status, goal) VALUES
    ('d3333333-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'Blog', 'Personal tech blog', '#EC4899', 'active', 'Publish 2 posts per month'),
    ('d3333333-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'Photography', 'Learning portrait photography', '#F472B6', 'planning', 'Build portfolio'),
    ('d3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Open Source', 'Contributing to OSS projects', '#DB2777', 'active', 'Make 10 contributions');

-- Home & Garden Projects
INSERT INTO projects (id, area_id, name, description, color, status, goal) VALUES
    ('d4444444-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'Kitchen Remodel', 'Updating kitchen space', '#F97316', 'planning', 'Complete by summer'),
    ('d4444444-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'Garden Project', 'Vegetable garden setup', '#22C55E', 'active', 'Grow fresh vegetables');

-- Learning Projects
INSERT INTO projects (id, area_id, name, description, color, status, goal) VALUES
    ('d5555555-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'Spanish Language', 'Conversational Spanish', '#8B5CF6', 'active', 'Achieve B2 level'),
    ('d5555555-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 'Web3 Development', 'Learning blockchain and smart contracts', '#7C3AED', 'planning', 'Deploy first dApp');

-- =============================================================================
-- FEATURES (with realistic scenarios)
-- =============================================================================

-- SaaS Product Features
INSERT INTO features (id, project_id, title, description, status, priority, commitment_level, date_started, do_date) VALUES
    ('f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'User Authentication', 'Implement email/password login and signup', 'completed', 'high', 'must_do', '2026-01-01', NULL),
    ('f1111111-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'OAuth Integration', 'Add Google and GitHub OAuth providers', 'in_progress', 'high', 'must_do', '2026-01-10', '2026-01-15'),
    ('f1111111-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111', 'Analytics Dashboard', 'Display user activity with beautiful charts', 'in_progress', 'high', 'must_do', '2026-01-12', '2026-01-16'),
    ('f1111111-4444-4444-4444-444444444444', 'd1111111-1111-1111-1111-111111111111', 'Team Collaboration', 'Real-time collaboration features', 'backlog', 'low', 'optional', NULL, NULL);

-- Freelance Client Features
INSERT INTO features (id, project_id, title, description, status, priority, commitment_level, date_started, do_date) VALUES
    ('f1111222-1111-1111-1111-111111111111', 'd1111111-2222-2222-2222-222222222222', 'Homepage Redesign', 'Modern, responsive homepage', 'completed', 'high', 'must_do', '2025-12-01', NULL),
    ('f1111222-2222-2222-2222-222222222222', 'd1111111-2222-2222-2222-222222222222', 'Services Page', 'Showcase company services', 'in_progress', 'high', 'must_do', '2026-01-08', '2026-01-15'),
    ('f1111222-3333-3333-3333-333333333333', 'd1111111-2222-2222-2222-222222222222', 'Contact Form', 'Lead capture form with validation', 'backlog', 'medium', 'must_do', NULL, '2026-01-17');

-- Blog Features
INSERT INTO features (id, project_id, title, description, status, priority, commitment_level, do_date) VALUES
    ('f3333333-1111-1111-1111-111111111111', 'd3333333-1111-1111-1111-111111111111', 'Next.js 15 Tutorial Series', 'Comprehensive guide to Next.js 15', 'in_progress', 'high', 'must_do', '2026-01-18'),
    ('f3333333-2222-2222-2222-222222222222', 'd3333333-1111-1111-1111-111111111111', 'TypeScript Best Practices', 'Advanced TypeScript patterns', 'backlog', 'medium', 'must_do', '2026-01-25');

-- Open Source Features
INSERT INTO features (id, project_id, title, description, status, priority, commitment_level) VALUES
    ('f3333444-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 'Fix Navigation Bug', 'Contribute fix for routing issue', 'in_progress', 'medium', 'must_do'),
    ('f3333444-2222-2222-2222-222222222222', 'd3333333-3333-3333-3333-333333333333', 'Add Dark Mode', 'Implement dark theme for project', 'backlog', 'low', 'optional');

-- Learning Features
INSERT INTO features (id, project_id, title, description, status, priority, commitment_level) VALUES
    ('f5555555-1111-1111-1111-111111111111', 'd5555555-2222-2222-2222-222222222222', 'Smart Contract Tutorial', 'Complete Solidity basics course', 'in_progress', 'high', 'must_do'),
    ('f5555555-2222-2222-2222-222222222222', 'd5555555-2222-2222-2222-222222222222', 'Build NFT Marketplace', 'Create basic marketplace dApp', 'backlog', 'medium', 'optional');

-- =============================================================================
-- BUGS (realistic bug scenarios)
-- =============================================================================

-- SaaS Product Bugs
INSERT INTO bugs (id, project_id, title, description, status, priority, severity, commitment_level, date_started) VALUES
    ('b1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Login Fails on Safari', 'Users report login button not working in Safari browser', 'completed', 'high', 'major', 'must_do', '2026-01-05'),
    ('b1111111-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'Session Timeout Too Short', 'Users being logged out after 5 minutes', 'in_progress', 'medium', 'minor', 'must_do', '2026-01-13'),
    ('b1111111-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111', 'Chart Data Not Loading', 'Analytics charts show blank on first load', 'backlog', 'high', 'major', 'must_do', NULL);

-- Freelance Client Bugs
INSERT INTO bugs (id, project_id, title, description, status, priority, severity, commitment_level) VALUES
    ('b1111222-1111-1111-1111-111111111111', 'd1111111-2222-2222-2222-222222222222', 'Contact Form Spam Issue', 'Receiving too many spam submissions', 'backlog', 'medium', 'minor', 'optional');

-- Blog Bugs
INSERT INTO bugs (id, project_id, title, description, status, priority, severity, commitment_level) VALUES
    ('b3333333-1111-1111-1111-111111111111', 'd3333333-1111-1111-1111-111111111111', 'Mobile Layout Broken', 'Blog posts not rendering correctly on mobile', 'in_progress', 'high', 'major', 'must_do');

-- Photography Bugs
INSERT INTO bugs (id, project_id, title, description, status, priority, severity, commitment_level) VALUES
    ('b3333222-1111-1111-1111-111111111111', 'd3333333-2222-2222-2222-222222222222', 'Image Export Quality', 'Exported images losing quality', 'backlog', 'medium', 'minor', 'optional');

-- =============================================================================
-- TASKS (various task types)
-- =============================================================================

-- Fitness Routine Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, commitment_level, do_date) VALUES
    ('c2222222-1111-1111-1111-111111111111', 'd2222222-1111-1111-1111-111111111111', 'Monday Workout', 'Upper body: bench press, rows, shoulder press', 'completed', 'high', 'must_do', '2026-01-13'),
    ('c2222222-2222-2222-2222-222222222222', 'd2222222-1111-1111-1111-111111111111', 'Wednesday Workout', 'Lower body: squats, deadlifts, lunges', 'in_progress', 'high', 'must_do', '2026-01-15'),
    ('c2222222-3333-3333-3333-333333333333', 'd2222222-1111-1111-1111-111111111111', 'Friday Workout', 'Full body: compound movements', 'backlog', 'high', 'must_do', '2026-01-17'),
    ('c2222333-1111-1111-1111-111111111111', 'd2222222-1111-1111-1111-111111111111', 'Morning Run', '5K run at park', 'completed', 'medium', 'must_do', '2026-01-14');

-- Nutrition Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, commitment_level, do_date) VALUES
    ('c2222444-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 'Meal Prep Sunday', 'Prepare lunches for the week', 'in_progress', 'high', 'must_do', '2026-01-19'),
    ('c2222444-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', 'Grocery Shopping', 'Buy ingredients for healthy meals', 'backlog', 'high', 'must_do', '2026-01-18');

-- Mental Health Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, commitment_level) VALUES
    ('c2222555-1111-1111-1111-111111111111', 'd2222222-3333-3333-3333-333333333333', 'Morning Meditation', '15 minutes guided meditation', 'in_progress', 'high', 'must_do'),
    ('c2222555-2222-2222-2222-222222222222', 'd2222222-3333-3333-3333-333333333333', 'Gratitude Journal', 'Write 3 things I''m grateful for', 'backlog', 'medium', 'optional');

-- Spanish Language Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, commitment_level, do_date) VALUES
    ('c5555555-1111-1111-1111-111111111111', 'd5555555-1111-1111-1111-111111111111', 'Duolingo Daily Practice', 'Complete daily lesson (20 min)', 'in_progress', 'high', 'must_do', '2026-01-15'),
    ('c5555555-2222-2222-2222-222222222222', 'd5555555-1111-1111-1111-111111111111', 'Conversation Practice', 'iTalki session with tutor', 'backlog', 'high', 'must_do', '2026-01-16'),
    ('c5555555-3333-3333-3333-333333333333', 'd5555555-1111-1111-1111-111111111111', 'Watch Spanish Movie', 'Practice listening comprehension', 'backlog', 'medium', 'optional', '2026-01-20');

-- Kitchen Remodel Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, commitment_level) VALUES
    ('c4444444-1111-1111-1111-111111111111', 'd4444444-1111-1111-1111-111111111111', 'Get Contractor Quotes', 'Contact 3 contractors for estimates', 'in_progress', 'high', 'must_do'),
    ('c4444444-2222-2222-2222-222222222222', 'd4444444-1111-1111-1111-111111111111', 'Choose Cabinet Style', 'Visit showroom to select cabinets', 'backlog', 'high', 'must_do'),
    ('c4444444-3333-3333-3333-333333333333', 'd4444444-1111-1111-1111-111111111111', 'Pick Paint Colors', 'Decide on wall and cabinet colors', 'backlog', 'medium', 'must_do');

-- Garden Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, commitment_level) VALUES
    ('c4444555-1111-1111-1111-111111111111', 'd4444444-2222-2222-2222-222222222222', 'Build Raised Beds', 'Construct 3 raised garden beds', 'in_progress', 'high', 'must_do'),
    ('c4444555-2222-2222-2222-222222222222', 'd4444444-2222-2222-2222-222222222222', 'Buy Seeds', 'Purchase tomato, pepper, and herb seeds', 'backlog', 'high', 'must_do'),
    ('c4444555-3333-3333-3333-333333333333', 'd4444444-2222-2222-2222-222222222222', 'Test Soil pH', 'Check soil acidity levels', 'backlog', 'medium', 'optional');

-- Blog Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, commitment_level, do_date) VALUES
    ('c3333333-1111-1111-1111-111111111111', 'd3333333-1111-1111-1111-111111111111', 'Draft January Post', 'Write about AI tools for developers', 'in_progress', 'high', 'must_do', '2026-01-18'),
    ('c3333333-2222-2222-2222-222222222222', 'd3333333-1111-1111-1111-111111111111', 'Create Cover Images', 'Design graphics for next 3 posts', 'backlog', 'medium', 'must_do', '2026-01-20');

-- Photography Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, commitment_level) VALUES
    ('c3333444-1111-1111-1111-111111111111', 'd3333333-2222-2222-2222-222222222222', 'Practice Portrait Lighting', '2 hour practice session with model', 'in_progress', 'high', 'must_do'),
    ('c3333444-2222-2222-2222-222222222222', 'd3333333-2222-2222-2222-222222222222', 'Edit Portfolio Photos', 'Retouch best 20 shots', 'backlog', 'medium', 'must_do');

-- ============================================================================
-- 🎉 DONE! Your demo database is ready!
-- ============================================================================
-- Summary:
-- ✅ 5 Areas of Life
-- ✅ 12 Projects across all areas
-- ✅ 14 Features (various statuses)
-- ✅ 6 Bugs (various severities)
-- ✅ 22 Tasks (realistic scenarios)
-- 
-- Total: 43 items showcasing all features!
-- ============================================================================
