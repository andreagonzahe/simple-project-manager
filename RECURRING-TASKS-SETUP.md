# Recurring Tasks Feature - Setup Guide

This guide will help you add recurring task functionality to your project manager.

## Overview

The recurring tasks feature allows you to create tasks that repeat on a schedule (daily, weekly, monthly, or yearly). When you mark a recurring task as complete, it automatically creates a new instance for the next occurrence instead of permanently completing.

## Features Added

1. **UI Changes:**
   - Checkbox to enable recurring tasks in Add/Edit task modals
   - Recurrence pattern selector (daily, weekly, monthly, yearly)
   - Optional end date for recurring tasks
   - Visual indicator (badge) showing recurrence pattern on task cards

2. **Database Changes:**
   - `is_recurring`: Boolean flag to mark recurring tasks
   - `recurrence_pattern`: Pattern for repetition (daily/weekly/monthly/yearly)
   - `recurrence_end_date`: Optional date to stop recurring
   - `last_completed_date`: Tracks when task was last completed
   - `next_due_date`: Scheduled date for next occurrence

3. **Logic:**
   - When a recurring task is marked complete, it automatically resets to "backlog" status
   - The `next_due_date` is calculated based on the recurrence pattern
   - If an end date is set and reached, the task is permanently completed
   - Non-recurring tasks work as before (marked as complete)

## Setup Instructions

### Step 1: Run the Database Migration

You need to apply the SQL migration to add the new fields to your database.

**Option A: Using the migration script (if you have .env.local set up)**

```bash
node scripts/run-recurring-migration.mjs
```

**Option B: Run SQL directly in Supabase Dashboard**

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase/migrations/20260112_add_recurring_tasks.sql`
4. Click "Run" to execute the migration

The migration will add the following columns to `tasks`, `bugs`, and `features` tables:
- `is_recurring` (boolean, default false)
- `recurrence_pattern` (text with CHECK constraint)
- `recurrence_end_date` (date, nullable)
- `last_completed_date` (date, nullable)
- `next_due_date` (date, nullable)

### Step 2: Restart Your Development Server

If your dev server is running, restart it to pick up the new changes:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 3: Test the Feature

1. Navigate to any area (e.g., "Adulting")
2. Click "New Task" in the top right
3. Fill in the task details:
   - Title: "Check email"
   - Type: Task
   - Check "Make this a recurring task"
   - Select "Daily" from the recurrence pattern
   - (Optional) Set an end date if you want it to stop recurring after a certain date
4. Click "Create Task"

The task should now appear in the "Area Tasks" section with a purple "daily" badge showing it's recurring.

### Step 4: Test Completing a Recurring Task

1. Click on a recurring task to edit it
2. Change the status to "Complete"
3. Click "Update"

**Expected behavior:**
- The task status should reset to "Backlog" (not stay at "Complete")
- The `last_completed_date` is updated to today
- The `next_due_date` is calculated (today + 1 day for daily tasks)
- The task remains in your task list, ready to be done again tomorrow

**For tasks without recurrence:**
- Task status stays as "Complete"
- Task is marked as done and doesn't reset

## Usage Examples

### Daily Task
- **Example:** "Check email", "Take vitamins", "Review calendar"
- **Pattern:** Daily
- **Behavior:** Resets every day after completion

### Weekly Task
- **Example:** "Grocery shopping", "Laundry", "Team meeting"
- **Pattern:** Weekly
- **Behavior:** Resets 7 days after completion

### Monthly Task
- **Example:** "Pay rent", "Review finances", "Car maintenance"
- **Pattern:** Monthly
- **Behavior:** Resets to same day next month

### Yearly Task
- **Example:** "File taxes", "Birthday celebration", "Annual checkup"
- **Pattern:** Yearly
- **Behavior:** Resets to same date next year

### Recurring Task with End Date
- **Example:** "Take medication" for a 30-day prescription
- **Pattern:** Daily
- **End Date:** 30 days from now
- **Behavior:** Resets daily until end date, then permanently completes

## File Changes Made

### Database Migration
- `supabase/migrations/20260112_add_recurring_tasks.sql` - New migration file

### Type Definitions
- `app/lib/types.ts` - Added `RecurrencePattern` type and recurring fields to Task, Bug, Feature interfaces

### Utilities
- `app/lib/utils.ts` - Added `calculateNextDueDate()` and `handleRecurringTaskCompletion()` functions

### Components
- `app/components/modals/AddTaskModalStandalone.tsx` - Added recurring task UI
- `app/components/modals/EditTaskModal.tsx` - Added recurring task UI and completion logic
- `app/projects/[areaId]/page.tsx` - Added recurring badge to task display

### Scripts
- `scripts/run-recurring-migration.mjs` - Migration runner script

## Troubleshooting

### Migration Fails
- **Issue:** SQL errors when running migration
- **Solution:** Check if columns already exist. If so, the migration may have already run.

### Recurring Tasks Don't Reset
- **Issue:** Tasks stay completed instead of resetting
- **Solution:** Verify the migration ran successfully and all fields exist in the database

### Can't See Recurring Option
- **Issue:** Checkbox doesn't appear in modal
- **Solution:** Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R) to clear cache

## Notes

- Recurring tasks automatically reset when marked complete
- You can edit a recurring task at any time to change its recurrence pattern
- You can disable recurrence by unchecking "Make this a recurring task"
- The next due date is calculated from the completion date, not the previous due date
- Recurring badges appear with a purple color and repeat icon

## Future Enhancements (Optional)

Potential improvements you could add later:
- Custom recurrence patterns (e.g., every 3 days, every 2 weeks)
- Specific days of the week for weekly tasks
- Task history/completion log
- Notifications for upcoming recurring tasks
- Bulk operations on recurring tasks

---

Enjoy your new recurring tasks feature! 🎉
