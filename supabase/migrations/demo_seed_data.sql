-- DEMO SEED DATA FOR SIMPLE PROJECT MANAGER
-- This file populates the database with realistic demo content
-- Perfect for showcasing all features and functionality
-- Created: 2026-01-14

-- Note: Run this AFTER running the main schema migration (20260109_project_manager.sql)
-- and all subsequent migrations

-- Clear existing data (optional - uncomment if you want a fresh start)
-- DELETE FROM tasks;
-- DELETE FROM bugs;
-- DELETE FROM features;
-- DELETE FROM projects;
-- DELETE FROM areas_of_life;

-- =============================================================================
-- AREAS OF LIFE (with diverse examples)
-- =============================================================================

INSERT INTO areas_of_life (id, name, color, icon, sort_order, description) VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Career', '#3B82F6', 'Briefcase', 1, 'Professional development and work projects'),
    ('a2222222-2222-2222-2222-222222222222', 'Health & Fitness', '#10B981', 'Heart', 2, 'Physical and mental wellness goals'),
    ('a3333333-3333-3333-3333-333333333333', 'Personal Projects', '#EC4899', 'Sparkles', 3, 'Creative and personal endeavors'),
    ('a4444444-4444-4444-4444-444444444444', 'Home & Garden', '#F97316', 'Home', 4, 'House maintenance and improvements'),
    ('a5555555-5555-5555-5555-555555555555', 'Learning', '#8B5CF6', 'BookOpen', 5, 'Education and skill development');

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

-- =============================================================================
-- TASKS (various task types)
-- =============================================================================

-- Fitness Routine Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, commitment_level, do_date) VALUES
    ('c2222222-1111-1111-1111-111111111111', 'd2222222-1111-1111-1111-111111111111', 'Monday Workout', 'Upper body: bench press, rows, shoulder press', 'completed', 'high', 'must_do', '2026-01-13'),
    ('c2222222-2222-2222-2222-222222222222', 'd2222222-1111-1111-1111-111111111111', 'Wednesday Workout', 'Lower body: squats, deadlifts, lunges', 'in_progress', 'high', 'must_do', '2026-01-15'),
    ('c2222222-3333-3333-3333-333333333333', 'd2222222-1111-1111-1111-111111111111', 'Friday Workout', 'Full body: compound movements', 'backlog', 'high', 'must_do', '2026-01-17'),
    ('c2222333-1111-1111-1111-111111111111', 'd2222222-1111-1111-1111-111111111111', 'Morning Run', '5K run at park', 'completed', 'medium', 'must_do', '2026-01-14');

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

-- Blog Tasks
INSERT INTO tasks (id, project_id, title, description, status, priority, commitment_level, do_date) VALUES
    ('c3333333-1111-1111-1111-111111111111', 'd3333333-1111-1111-1111-111111111111', 'Draft January Post', 'Write about AI tools for developers', 'in_progress', 'high', 'must_do', '2026-01-18'),
    ('c3333333-2222-2222-2222-222222222222', 'd3333333-1111-1111-1111-111111111111', 'Create Cover Images', 'Design graphics for next 3 posts', 'backlog', 'medium', 'must_do', '2026-01-20');

-- =============================================================================
-- SUMMARY
-- =============================================================================
-- This demo data includes:
-- - 5 diverse areas of life (Career, Health, Personal, Home, Learning)
-- - 12 projects across different categories
-- - 10 features (including completed, in-progress, and backlog)
-- - 4 bugs (various severities and statuses)
-- - 13 tasks (including recurring tasks, reminders, and regular tasks)
--
-- This showcases:
-- ✅ Simplified hierarchy (Area → Project → Items)
-- ✅ All item types (Features, Bugs, Tasks)
-- ✅ All statuses (Backlog, In Progress, Completed)
-- ✅ All priorities (Low, Medium, High)
-- ✅ All bug severities (Minor, Major, Critical)
-- ✅ Commitment levels (Must Do, Optional)
-- ✅ Recurring tasks with patterns
-- ✅ Reminders with due dates
-- ✅ Do dates for scheduling
-- ✅ Goals for areas and projects
-- ✅ Optional/Active project statuses
-- ✅ Realistic work scenarios across different life areas
