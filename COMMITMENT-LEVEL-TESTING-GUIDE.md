# Quick Testing Guide for Commitment Level Feature

## Pre-Testing Setup

Before testing the feature in the UI, you need to apply the database migration:

### Apply the Migration

Choose one of these methods:

**Method 1: Supabase CLI (Recommended)**
```bash
supabase db push
```

**Method 2: Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20260113_add_commitment_level.sql`
4. Click "Run"

**Method 3: Migration Script**
```bash
node scripts/run-commitment-migration.mjs
```
(Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`)

## Testing Checklist

### ✅ Test 1: Create a New Task with Commitment Level

1. Start the dev server: `npm run dev`
2. Navigate to any area or project
3. Click "Add Task" button
4. Fill in the task details
5. **Verify**: Commitment Level dropdown is visible
6. **Verify**: Default value is "Must Do"
7. Change to "Optional" and save
8. **Verify**: Task is created successfully

### ✅ Test 2: View Commitment Badges

1. Navigate to a page with tasks
2. **Verify**: Each task displays a commitment badge
3. **Verify**: "Must Do" tasks show a red badge
4. **Verify**: "Optional" tasks show a gray badge
5. **Verify**: Badge appears alongside status and priority badges

### ✅ Test 3: Edit Task Commitment Level

1. Click on any existing task to edit
2. **Verify**: Commitment Level field is visible in edit modal
3. **Verify**: Current commitment level is selected
4. Change commitment level and save
5. **Verify**: Task updates successfully
6. **Verify**: Badge color changes accordingly

### ✅ Test 4: Test All Item Types

Repeat the above tests for:
- ✅ Tasks
- ✅ Bugs (with severity field)
- ✅ Features

### ✅ Test 5: Verify Display Locations

Check that commitment badges appear in:
- ✅ Task cards
- ✅ Area page (area-level items)
- ✅ Project page (project items)
- ✅ Running Items card (if visible)

### ✅ Test 6: Recurring Tasks

1. Create a recurring task with commitment level set
2. **Verify**: Commitment level is saved correctly
3. Edit the recurring task
4. **Verify**: Commitment level field works with recurring options

## Expected Behavior Summary

### Visual Elements
- Red badge: "Must Do" commitment level
- Gray badge: "Optional" commitment level
- Badges are small, pill-shaped, and consistent with existing badge design

### Form Behavior
- **Add Modal**: Defaults to "Must Do"
- **Edit Modal**: Shows current commitment level
- **All Item Types**: Commitment level works for tasks, bugs, and features

### Data Persistence
- Commitment level is saved to database
- Existing tasks default to "Must Do" after migration
- Changes persist across page refreshes

## Troubleshooting

### Issue: Commitment field not showing
- **Solution**: Make sure the migration has been applied to the database

### Issue: Badges not displaying
- **Solution**: Check browser console for errors, verify TypeScript compilation

### Issue: Error when saving tasks
- **Solution**: Verify database migration completed successfully and column exists

### Issue: Type errors
- **Solution**: Restart TypeScript server or run `npm run dev` again

## Migration Verification

To verify the migration was successful, run this SQL in Supabase:

```sql
-- Check if commitment_level column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name = 'commitment_level';

-- Check existing tasks have default value
SELECT commitment_level, COUNT(*) 
FROM tasks 
GROUP BY commitment_level;
```

Expected results:
- Column should exist with type "USER-DEFINED" (enum)
- All existing tasks should have `commitment_level = 'must_do'`

## Success Criteria

The feature is working correctly when:

1. ✅ Migration applied without errors
2. ✅ Commitment level dropdown appears in add/edit forms
3. ✅ Commitment badges display correctly on all task views
4. ✅ Tasks can be created with both "Must Do" and "Optional" levels
5. ✅ Commitment level can be edited and changes persist
6. ✅ No TypeScript or runtime errors
7. ✅ Feature works for tasks, bugs, and features
8. ✅ Badges have correct colors (red for must do, gray for optional)
