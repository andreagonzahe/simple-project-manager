# Map View - Completed Items Filter Update

## Overview
Map view now automatically hides completed projects and items, keeping the visualization focused on active work.

## What Changed

### MapView.tsx - Data Fetching
**Before**:
```typescript
supabase.from('projects').select('*')
supabase.from('tasks').select('*')
supabase.from('bugs').select('*')
supabase.from('features').select('*')
```

**After**:
```typescript
supabase.from('projects').select('*').neq('status', 'completed')
supabase.from('tasks').select('*').neq('status', 'completed')
supabase.from('bugs').select('*').neq('status', 'completed')
supabase.from('features').select('*').neq('status', 'completed')
```

### Behavior
- **Projects** with `status = 'completed'` are excluded
- **Tasks** with `status = 'completed'` are excluded
- **Bugs** with `status = 'completed'` are excluded
- **Features** with `status = 'completed'` are excluded
- **Areas** are always shown (areas don't have a status)

### Benefits
1. **Cleaner visualization**: Only shows work that needs attention
2. **Better focus**: Removes visual clutter from finished items
3. **Current priorities**: Map reflects what's actively being worked on
4. **Automatic**: No toggle needed - works out of the box

## User Experience

### What Users See
- Map view displays only active and in-progress items
- Completed projects and their children automatically disappear
- Individual completed tasks within active projects are hidden
- Areas always visible (even if all their projects are completed)

### Empty Areas
If an area has only completed projects:
- The area node still appears
- It shows no children when expanded
- This indicates "completed area" status

## Technical Details

### Query Filter
Uses Supabase's `.neq()` (not equal) operator:
```typescript
.neq('status', 'completed')
```

This filters at the database level, so:
- ✅ Efficient (no client-side filtering needed)
- ✅ Fast (reduced data transfer)
- ✅ Scalable (works with large datasets)

### Status Values
The filter excludes items where status is `'completed'`. Other statuses still appear:
- `'backlog'` - shown
- `'in_progress'` - shown
- `'planning'` - shown (projects only)
- `'active'` - shown (projects only)
- `'paused'` - shown (projects only)

## Edge Cases

### Empty Tree
If all projects and items are completed:
- Map view shows "No data to display" message
- Areas are not included in the tree if they have no active projects

### Mixed Status
An area with 3 projects (2 completed, 1 active):
- Shows the area
- Shows only the 1 active project
- The 2 completed projects are hidden

### Newly Completed Items
When you mark an item as completed:
- It immediately disappears from map view
- The map re-fetches data via `onDataChanged()` callback
- No page refresh needed

## Header Update
Updated subtitle to reflect filtered view:
- **Before**: "Visual overview of your entire project hierarchy"
- **After**: "Visual overview of your active project hierarchy"

## Compatibility
- ✅ Works with existing drag-to-move functionality
- ✅ Works with auto-arrange
- ✅ Works with expand/collapse
- ✅ Non-breaking change (backward compatible)

## Testing

### Test Scenarios
1. **All active**: Map shows everything normally
2. **Some completed**: Completed items hidden, others visible
3. **All completed**: "No data to display" message
4. **Mark as complete**: Item disappears immediately
5. **Area with mixed projects**: Only active projects shown

### Verification
```sql
-- Check what map view will show
SELECT * FROM projects WHERE status != 'completed';
SELECT * FROM tasks WHERE status != 'completed';
SELECT * FROM bugs WHERE status != 'completed';
SELECT * FROM features WHERE status != 'completed';
```

## Future Enhancements (Optional)
- [ ] Toggle to show/hide completed items
- [ ] "Show completed" button (temporary view)
- [ ] Completed items counter badge
- [ ] Completed items in different visual style (grayed out, smaller)
- [ ] Filter by date range (show recently completed)

---

**Status**: ✅ Complete
**Date**: January 24, 2026
**Version**: v1.3 (Map View - Completed Filter)
