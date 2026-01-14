# Commitment Level Feature - Complete

## Overview

This feature adds a **commitment level** to each task, bug, and feature in the project manager. Items can be marked as either:

- **Must Do**: Critical tasks that must be completed
- **Optional**: Tasks that can be deferred if needed

## Implementation Summary

### 1. Database Changes

**Migration File**: `supabase/migrations/20260113_add_commitment_level.sql`

- Created `commitment_level` enum type with values: `must_do`, `optional`
- Added `commitment_level` column to `tasks`, `bugs`, and `features` tables
- Set default value to `must_do` for all existing items
- Created indexes for efficient filtering by commitment level

### 2. TypeScript Types

**File**: `app/lib/types.ts`

- Added `CommitmentLevel` type: `'must_do' | 'optional'`
- Updated `Task`, `Bug`, and `Feature` interfaces to include `commitment_level` field
- Updated `ItemFormData` interface to support commitment level

### 3. UI Components

#### CommitmentBadge Component
**File**: `app/components/badges/CommitmentBadge.tsx`

- New badge component to display commitment level
- Red badge for "Must Do" tasks
- Gray badge for "Optional" tasks
- Consistent styling with existing badge components

#### Updated Display Components

The following components now display the commitment badge:

1. **TaskCard** (`app/components/cards/TaskCard.tsx`)
   - Shows commitment badge alongside status and priority

2. **Project Detail Page** (`app/projects/[areaId]/[domainId]/page.tsx`)
   - Displays commitment level for all tasks in project view

3. **Area Page** (`app/projects/[areaId]/page.tsx`)
   - Shows commitment level for area-level tasks and project tasks

### 4. Form Modals

#### AddTaskModalStandalone
**File**: `app/components/modals/AddTaskModalStandalone.tsx`

- Added commitment level dropdown selector
- Defaults to "Must Do" for new tasks
- Includes helpful description text

#### EditTaskModal
**File**: `app/components/modals/EditTaskModal.tsx`

- Added commitment level field for editing existing tasks
- Preserves existing commitment level when editing

#### RunningItemsCard
**File**: `app/components/cards/RunningItemsCard.tsx`

- Updated to include commitment_level when fetching task data for editing

## How to Apply the Migration

### Option 1: Using Supabase CLI (Recommended)

If you have the Supabase CLI installed:

```bash
cd /Users/andreagonzalezh/Desktop/simple-project-manager
supabase db push
```

### Option 2: Using the Migration Script

```bash
node scripts/run-commitment-migration.mjs
```

**Note**: This requires `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` file.

### Option 3: Manual SQL Execution

1. Open your Supabase Dashboard
2. Go to the SQL Editor
3. Copy the contents of `supabase/migrations/20260113_add_commitment_level.sql`
4. Execute the SQL

## Usage Guide

### Creating a New Task

1. Click "Add Task" button
2. Fill in task details
3. Select commitment level from dropdown:
   - **Must Do** (default): For critical, non-negotiable tasks
   - **Optional**: For tasks that can be deferred

### Editing Existing Tasks

1. Click on any task to open edit modal
2. Change the commitment level as needed
3. Save changes

### Visual Indicators

- **Must Do** tasks display a red badge
- **Optional** tasks display a gray badge
- Badges appear alongside priority and status badges

## Benefits

1. **Better Prioritization**: Clearly distinguish between critical and optional work
2. **Improved Planning**: Easily identify tasks that can be deferred when time is limited
3. **Visual Clarity**: Color-coded badges make commitment levels immediately visible
4. **Flexible Workflows**: Supports both strict must-do items and nice-to-have tasks

## Default Behavior

- All new tasks default to "Must Do"
- Existing tasks (after migration) are set to "Must Do" to maintain current priorities
- Users can change commitment level at any time through the edit modal

## Technical Notes

- The commitment level is stored as an enum in PostgreSQL for data integrity
- Database indexes ensure efficient filtering by commitment level
- The feature is fully integrated with recurring tasks and all item types (tasks, bugs, features)
- Changes are backward compatible with existing functionality

## Files Modified

1. `supabase/migrations/20260113_add_commitment_level.sql` - New
2. `app/lib/types.ts` - Updated
3. `app/components/badges/CommitmentBadge.tsx` - New
4. `app/components/cards/TaskCard.tsx` - Updated
5. `app/components/modals/AddTaskModalStandalone.tsx` - Updated
6. `app/components/modals/EditTaskModal.tsx` - Updated
7. `app/components/cards/RunningItemsCard.tsx` - Updated
8. `app/projects/[areaId]/page.tsx` - Updated
9. `app/projects/[areaId]/[domainId]/page.tsx` - Updated
10. `scripts/run-commitment-migration.mjs` - New

## Future Enhancements

Potential future improvements:
- Filter tasks by commitment level
- Sort tasks by commitment level
- Dashboard metrics for must-do vs optional task completion
- Commitment level statistics per area/project
