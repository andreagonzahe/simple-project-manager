# Area Page - Items Reorganization

**Date**: January 12, 2026  
**Status**: Complete ✅

## Summary

Reorganized the area page to show a better hierarchy of tasks:
1. **Area Goals** - Strategic objectives for the area
2. **All Area Items** - Tasks that belong to the area but not to any project
3. **Items by Project** - Tasks grouped under their respective projects
4. **Projects Grid** - Project cards for navigation

## New Layout Structure

```
Area Page
├── Breadcrumb & Header
├── Area Goals Section
├── All Area Items Section (area-level tasks)
├── Items Grouped by Project
│   ├── Project 1 Name (X items)
│   │   └── Task cards
│   ├── Project 2 Name (Y items)
│   │   └── Task cards
│   └── ...
└── Projects Grid (clickable project cards)
```

## What Changed

### Data Fetching

**Area-Level Items:**
- Fetches tasks/bugs/features where `domain_id IS NULL`
- These are tasks directly under the area

**Project-Level Items:**
- Fetches tasks/bugs/features where `domain_id IS NOT NULL`
- Includes project name via join
- Groups items by `domain_id`
- Stores in Map structure: `projectId => { projectName, items[] }`

### UI Sections

**1. Area Goals** (unchanged)
- Shows up to 3 strategic goals
- Edit button available

**2. All Area Items** (renamed from "Area Tasks")
- Shows tasks without a project
- Count displayed in header
- Grid layout for cards
- Only appears if items exist

**3. Items Grouped by Project** (NEW!)
- Each project gets its own section
- Project name as section header
- Item count shown
- All project items displayed in grid
- Repeats for each project with items

**4. Projects Grid** (moved to bottom)
- Clickable project cards
- Navigate to project detail page
- Shows project metadata (status, task counts)

## Visual Design

### Section Headers:
- **All Area Items**: CheckCircle2 icon
- **Project Sections**: Sparkles icon
- Consistent styling with area color
- Item counts for context

### Item Cards:
- Same design across all sections
- Type indicator (task/bug/feature)
- Title and description
- Status, priority, severity badges
- Recurring indicator if applicable
- Due/do dates

### Hierarchy Clarity:
- Clear separation between area and project items
- Project names prominently displayed
- Consistent spacing and styling

## Benefits

1. **Better Organization**
   - Clear distinction between area-level and project-level work
   - Easy to see what belongs where

2. **Improved Context**
   - See all tasks for a project without clicking
   - Understand project progress at a glance

3. **Flexible Workflow**
   - Can work at area level (general tasks)
   - Can work at project level (focused work)
   - Both patterns supported

4. **Reduced Navigation**
   - Less clicking to see project tasks
   - Everything visible on one page
   - Projects grid still available for detail view

## Data Structure

### State Management:
```typescript
const [areaItems, setAreaItems] = useState<ItemUnion[]>([]);
const [projectItems, setProjectItems] = useState<
  Map<string, { projectName: string; items: ItemUnion[] }>
>(new Map());
```

### Grouping Logic:
```typescript
allProjectItems.forEach((item: any) => {
  if (item.domain_id && item.projectName) {
    if (!itemsByProject.has(item.domain_id)) {
      itemsByProject.set(item.domain_id, {
        projectName: item.projectName,
        items: [],
      });
    }
    itemsByProject.get(item.domain_id)!.items.push(item);
  }
});
```

## Use Cases

### Area-Level Tasks:
- "Check email" - daily recurring
- "Review finances" - monthly task
- General to-dos not tied to specific project

### Project-Level Tasks:
- "E-commerce Website" project
  - "Implement payment gateway"
  - "Design product page"
  - "Set up database"

### Mixed Workflow:
- User has both area tasks and project tasks
- All visible and organized on one page
- Clear separation of concerns

## Performance

- Single page load fetches all data
- Efficient queries with proper joins
- Map structure for O(1) project lookups
- Sorted by creation date

## Responsive Design

- Grid adapts to screen size
- 1 column on mobile
- 2 columns on tablet
- 3 columns on desktop
- Smooth animations on scroll

## Files Modified

- `app/projects/[areaId]/page.tsx`
  - Added `projectItems` state
  - Modified `fetchData` to fetch project items
  - Added grouping logic
  - Updated UI to show grouped sections
  - Renamed "Area Tasks" to "All Area Items"
  - Added project sections before project grid

## Testing Checklist

- [x] Area items show in "All Area Items" section
- [x] Project items grouped by project name
- [x] Each project section shows correct count
- [x] Items display with all badges and info
- [x] Empty states work correctly
- [x] Layout responsive on all screen sizes
- [x] Animations smooth
- [x] No duplicate items
- [x] Projects grid still accessible

## Future Enhancements (Optional)

- Collapsible project sections
- Filter/sort within project sections
- Drag and drop between sections
- Click to navigate to project detail
- Show project status in section header
- Add "Add Task" button per project section

---

The area page now provides a complete view of all work organized by scope! 📊✨
