# Optional as Default Commitment Level - Complete ✅

## Overview

Changed the default commitment level for all new tasks from "Must Do" to "Optional". This allows a more relaxed workflow where tasks start as optional, and you can promote them to must-do when needed.

## Philosophy Change

### Before
- **Default**: Must Do
- **Workflow**: All tasks critical by default, mark as optional if flexible
- **Focus**: Assume everything is important

### After
- **Default**: Optional
- **Workflow**: Tasks flexible by default, promote to must-do when critical
- **Focus**: Intentionally choose what's truly important

## Changes Made

### 1. Add Task Modal
**File**: `app/components/modals/AddTaskModalStandalone.tsx`

**Changes:**
- Initial state: `commitment_level: 'optional'`
- Form reset: `commitment_level: 'optional'`
- Dropdown order: "Optional" listed first
- Help text: "Tasks are optional by default. Mark as Must Do for critical items."

### 2. Edit Task Modal
**File**: `app/components/modals/EditTaskModal.tsx`

**Changes:**
- Default fallback: `commitment_level || 'optional'`
- Dropdown order: "Optional" listed first
- Help text: "Tasks are optional by default. Mark as Must Do for critical items."

### 3. Database Migration
**File**: `supabase/migrations/20260114_set_optional_default.sql`

**Changes:**
- ALTER TABLE tasks: SET DEFAULT 'optional'
- ALTER TABLE bugs: SET DEFAULT 'optional'  
- ALTER TABLE features: SET DEFAULT 'optional'
- Optional bulk update (commented out)

## User Experience Impact

### Creating New Tasks
```
Before:
[Commitment Level: Must Do ▼]  ← Default
- Must Do (selected)
- Optional

After:
[Commitment Level: Optional ▼]  ← Default
- Optional (selected)
- Must Do
```

### Editing Existing Tasks
- Tasks without commitment level: Defaults to "Optional"
- Existing must-do tasks: Remain must-do
- Existing optional tasks: Remain optional

### Focus Mode
- Will only show tasks you've explicitly marked as "Must Do"
- Empty by default until you promote tasks
- Encourages intentional prioritization

## Benefits

1. **Less Overwhelming**: Not everything feels critical by default
2. **Intentional Prioritization**: Must consciously choose what's important
3. **Flexible Workflow**: Tasks can exist without pressure
4. **Better Focus Mode**: Only truly important tasks appear
5. **Realistic Expectations**: Not everything needs to be must-do

## Migration Notes

### Automatic Changes
✅ New tasks default to "optional"
✅ Dropdowns show "Optional" first
✅ Help text updated
✅ Database defaults updated

### Optional Bulk Update
The migration includes commented-out SQL to change ALL existing tasks to optional:

```sql
-- Uncomment to update all existing tasks:
-- UPDATE tasks SET commitment_level = 'optional' WHERE commitment_level = 'must_do';
-- UPDATE bugs SET commitment_level = 'optional' WHERE commitment_level = 'must_do';
-- UPDATE features SET commitment_level = 'optional' WHERE commitment_level = 'must_do';
```

**Decision**: Leave existing tasks unchanged
- Existing must-do tasks remain must-do
- You can manually change them as needed
- Preserves your current priorities

## How to Apply Migration

### Option 1: Supabase CLI
```bash
supabase db push
```

### Option 2: Supabase Dashboard
1. Go to SQL Editor
2. Copy contents of `supabase/migrations/20260114_set_optional_default.sql`
3. Run the SQL

### Option 3: Migration Script
```bash
node scripts/run-commitment-migration.mjs
```

## Recommended Workflow

### For New Tasks
1. **Create task** → Defaults to "Optional"
2. **During planning** → Review and promote critical items to "Must Do"
3. **Daily** → Check Focus Mode to see what's truly important

### For Existing Tasks
1. **Review current tasks** → Identify truly critical items
2. **Keep as must-do** → Only for time-sensitive or critical work
3. **Change to optional** → Everything else

### Focus Mode Usage
1. **Intentional** → Only mark must-dos when you mean it
2. **Manageable** → Keep list short (3-5 items max per day)
3. **Achievable** → Focus on what truly matters

## UI Changes

### Form Dropdowns
```
Commitment Level
┌─────────────────┐
│ Optional     ▼ │  ← Default selected
└─────────────────┘
  - Optional (default)
  - Must Do
```

### Help Text
```
"Tasks are optional by default. 
Mark as Must Do for critical items."
```

## Display Behavior

### Task Lists
- **Must Do tasks**: No badge (default expected state)
- **Optional tasks**: Gray "Optional" tag

### Focus Mode
- Shows only tasks marked as "Must Do"
- Empty by default (until you promote tasks)
- Encourages intentional commitment

## Files Modified

1. **`app/components/modals/AddTaskModalStandalone.tsx`**
   - Default value changed
   - Dropdown order changed
   - Help text updated

2. **`app/components/modals/EditTaskModal.tsx`**
   - Default fallback changed
   - Dropdown order changed
   - Help text updated

3. **`supabase/migrations/20260114_set_optional_default.sql`**
   - Database defaults updated

4. **`OPTIONAL-DEFAULT-COMPLETE.md`**
   - This documentation

## Testing

### New Task Creation
1. Open "Add Task" modal
2. Check commitment level dropdown
3. Verify "Optional" is selected by default
4. Create task
5. Verify task is optional

### Focus Mode
1. Navigate to Focus Mode
2. Should be empty (or show only existing must-dos)
3. Edit a task, change to "Must Do"
4. Verify it appears in Focus Mode

### Existing Tasks
1. Edit an existing task
2. If no commitment level set, should default to "Optional"
3. Existing must-dos should remain must-do

## Status: Complete ✅

All new tasks will now default to "Optional" - promoting a healthier, more intentional approach to task management!
