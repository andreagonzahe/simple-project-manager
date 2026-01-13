# Running Items - Show Project Name Feature

**Date**: January 12, 2026  
**Status**: Complete ✅

## Summary

Updated the Running Items card to display the project (domain) name for each task, making it easier to see which project a task belongs to without navigating away.

## What Changed

### Running Items Card (`app/components/cards/RunningItemsCard.tsx`)

**Data Structure:**
- Updated `RunningItem` interface to include:
  - `domain_id: string | null` - Project ID
  - `domain_name: string | null` - Project name
- Removed old `subdomain_id` field (renamed to `domain_id`)

**Database Queries:**
- Modified queries for tasks, bugs, and features to fetch:
  - `domain_id`
  - `domains.name` (project name)
- Queries now include project name in the join

**UI Changes:**
- Area and project names now displayed in a stacked layout
- Area name shown on first line (bold)
- Project name shown on second line (lighter, smaller)
- Project name only appears if task belongs to a project
- Area-only tasks show just the area name

## Visual Layout

**Before:**
```
[Icon] Area Name          [Type Badge]
Task Title
Status | Dates
```

**After:**
```
[Icon] Area Name          [Type Badge]
       Project Name
Task Title
Status | Dates
```

## UI Design

### Hierarchy Display:
1. **Area icon** - Color-coded, shows area at a glance
2. **Area name** - Primary label, full opacity
3. **Project name** - Secondary label, 70% opacity, lighter weight
4. **Task title** - Main content below

### Styling:
- Project name uses lighter font weight (`font-light`)
- Reduced opacity (70%) to show hierarchy
- Truncates with ellipsis if too long
- Aligns with area name for clean vertical stack

### Conditional Rendering:
- Project name only shows when `item.domain_name` exists
- Area-only tasks remain clean without empty space
- Maintains consistent layout regardless of project presence

## Data Flow

### Query Enhancement:
```typescript
.select(`
  id,
  title,
  status,
  priority,
  domain_id,
  domains(
    id,
    name,              // ← Added: Fetch project name
    areas_of_life(...)
  ),
  areas_of_life(...)
`)
```

### Data Mapping:
```typescript
allItems.push({
  // ... other fields
  domain_id: task.domain_id,
  domain_name: task.domains?.name || null,  // ← New field
});
```

## Use Cases

**Project-linked tasks:**
- Shows: "Personal → Budget Tracker"
- User immediately knows which project

**Area-only tasks:**
- Shows: "Personal" (no project line)
- Clean, uncluttered

**Complex setup:**
- User with many projects in one area
- Can now differentiate tasks at a glance
- No need to click to see project

## Technical Details

### Responsive Design:
- `flex-col` for vertical stacking
- `min-w-0` prevents overflow issues
- `truncate` handles long names gracefully
- `flex-1` allows flexible sizing

### Type Safety:
- `domain_name: string | null` - Properly typed
- Conditional rendering checks for null
- No type errors or undefined values

### Performance:
- Single query fetches all data
- No additional requests needed
- Efficient join with domains table

## Files Modified

- `app/components/cards/RunningItemsCard.tsx`
  - Updated `RunningItem` interface
  - Modified all three fetch queries (tasks, bugs, features)
  - Updated UI rendering for area/project display
  - Added conditional project name rendering

## Benefits

1. **Better Context**
   - See which project a task belongs to
   - Understand task organization at a glance

2. **Improved Navigation**
   - Know where to go to see related tasks
   - Understand project relationships

3. **Cleaner Workflow**
   - Less clicking to understand context
   - More information density without clutter

4. **Visual Hierarchy**
   - Clear parent-child relationship
   - Area → Project → Task is visible

## Examples

**Software Development Area:**
```
[💻] Software Development
     E-commerce Website
Implement payment gateway
```

**Personal Area (no project):**
```
[👤] Personal
Check email
```

**Multiple tasks from same project:**
```
[💼] Work
     Q1 Report
Write executive summary

[💼] Work
     Q1 Report
Create data visualizations
```

## Testing Checklist

- [x] Project name appears for project-linked tasks
- [x] Project name hidden for area-only tasks
- [x] Truncation works for long project names
- [x] Layout remains consistent with/without project
- [x] Works for tasks, bugs, and features
- [x] No layout breaks or overflow issues
- [x] Proper vertical alignment
- [x] Color and styling consistent

## Future Enhancements (Optional)

- Add project color indicator
- Make project name clickable (navigate to project)
- Add project icon or emoji
- Show project status badge
- Add tooltip with full project name on hover
- Filter by project

---

The Running Items view now provides complete context showing both area and project for each task! 📋✨
