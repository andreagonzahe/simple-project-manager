# Default to Optional - Quick Summary

## What Changed

**All new tasks now default to "Optional" instead of "Must Do"**

## Why This Matters

- Less overwhelming
- Forces intentional prioritization
- Focus Mode shows only what you've consciously marked as critical
- More realistic and achievable

## Changes Made

### 1. Add Task Modal
- Default: `Optional` (was Must Do)
- Dropdown: Optional listed first
- Help text: "Tasks are optional by default. Mark as Must Do for critical items."

### 2. Edit Task Modal
- Default fallback: `Optional` (was Must Do)
- Dropdown: Optional listed first
- Updated help text

### 3. Database Migration
- New file: `supabase/migrations/20260114_set_optional_default.sql`
- Changes default for all three tables (tasks, bugs, features)
- Existing tasks unchanged (optional bulk update available)

## New Workflow

### Creating Tasks
```
1. Create new task
2. Defaults to "Optional"
3. Review during planning
4. Promote to "Must Do" if critical
```

### Focus Mode
```
1. Empty by default
2. Only shows tasks you mark as "Must Do"
3. Encourages intentional commitment
4. Keep list short (3-5 items max)
```

## UI Changes

**Dropdown Order:**
```
Before:                After:
- Must Do (default)    - Optional (default) ✓
- Optional             - Must Do
```

**Help Text:**
```
"Tasks are optional by default. 
Mark as Must Do for critical items."
```

## Migration Required

Run ONE of these:

```bash
# Option 1: Supabase CLI
supabase db push

# Option 2: Run in Supabase SQL Editor
# Copy contents of: supabase/migrations/20260114_set_optional_default.sql
```

## Existing Tasks

- **Not changed automatically**
- Existing must-dos remain must-do
- You can manually update as needed
- Optional bulk update available in migration (commented out)

## Benefits

✅ Less pressure on every task  
✅ Promotes intentional prioritization  
✅ Focus Mode becomes more meaningful  
✅ More realistic daily commitments  
✅ Better mental model: choose what's truly important  

## Files Modified

1. `app/components/modals/AddTaskModalStandalone.tsx`
2. `app/components/modals/EditTaskModal.tsx`
3. `supabase/migrations/20260114_set_optional_default.sql` (new)
4. Documentation (this file)

## Status: Ready! 🎯

After running the migration, all new tasks will default to Optional!
