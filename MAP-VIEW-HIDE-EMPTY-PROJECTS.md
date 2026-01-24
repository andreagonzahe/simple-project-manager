# Map View - Hide Empty Projects Filter

## Overview
Added a toggle button to hide projects that have no tasks, making the map view cleaner and more focused on active work.

## Feature Description

### What It Does
- Hides projects that have zero children (no tasks, bugs, or features)
- Shows only projects that contain at least one item
- Toggle is persistent during the session (resets on page reload)
- Updates layout dynamically without page refresh

### Use Cases
1. **Planning Phase**: Many projects created but not yet populated with tasks
2. **Archive View**: Projects completed with all tasks moved/deleted
3. **Focus Mode**: See only projects with active work
4. **Clean Presentation**: Share map view without empty placeholders

## Implementation

### State Management
```typescript
const [hideEmptyProjects, setHideEmptyProjects] = useState(false);
```

### Filtering Logic
```typescript
const getFilteredTree = (): TreeNode[] => {
  if (!hideEmptyProjects) return tree;
  
  return tree.map(area => ({
    ...area,
    children: area.children.filter(project => 
      project.children && project.children.length > 0
    ),
  }));
};

const filteredTree = getFilteredTree();
```

### What Gets Filtered
- **Areas**: Always visible (even if all projects are empty)
- **Projects**: Hidden if `children.length === 0`
- **Tasks/Bugs/Features**: Always visible (if their parent project is visible)

### Filter Application
The filtered tree is used in:
- Position calculation (`calculateTreeLayout`)
- Visible positions (`getVisiblePositions`)
- Auto-arrange function
- Expand all function

## User Interface

### Toggle Button
**Location**: Bottom-right controls panel (below AUTO-ARRANGE)

**States**:
- **Off** (default): `☐ HIDE EMPTY` - Shows all projects
- **On**: `☑ HIDE EMPTY` - Hides empty projects

**Visual Feedback**:
- Unchecked: Gray text, no ring
- Checked: Purple/accent color text, purple ring

**Interaction**:
- Click to toggle on/off
- State changes immediately
- Layout recalculates and animates

### Button Styling
```typescript
className={`glass glass-hover rounded-xl ${
  hideEmptyProjects ? 'ring-2 ring-purple-500/50' : ''
}`}
style={{ 
  color: hideEmptyProjects 
    ? 'var(--color-accent)' 
    : 'var(--color-text-primary)' 
}}
```

## Behavior Examples

### Before Toggle (All Projects Visible)
```
[Area: Health]
  ├─ [Project: Gym Routine] (3 tasks)
  ├─ [Project: Diet Plan] (0 tasks) ← Empty
  └─ [Project: Sleep Schedule] (2 tasks)

[Area: Work]
  ├─ [Project: Q1 Goals] (0 tasks) ← Empty
  └─ [Project: Team Meeting] (5 tasks)
```

### After Toggle (Empty Projects Hidden)
```
[Area: Health]
  ├─ [Project: Gym Routine] (3 tasks)
  └─ [Project: Sleep Schedule] (2 tasks)

[Area: Work]
  └─ [Project: Team Meeting] (5 tasks)
```

### Edge Case: All Projects Empty
```
[Area: Future Ideas]
  (no projects shown)

The area remains visible but shows no children when expanded.
```

## Technical Details

### Performance
- Filtering is O(n) where n = number of projects
- Happens on every render (minimal overhead)
- No database queries needed
- Uses existing tree structure

### State Persistence
- **Session-level**: Toggle state persists during session
- **Not saved**: Resets to "off" on page reload
- **Future enhancement**: Could save to localStorage or user preferences

### Layout Recalculation
When toggle changes:
1. `filteredTree` updates immediately
2. `calculatePositions()` runs with new tree
3. `getVisiblePositions()` reflects filtered tree
4. Framer Motion animates position changes
5. Connection lines update smoothly

## Integration

### Works With Other Features
✅ **Drag to move**: Only visible areas can be dragged  
✅ **Auto-arrange**: Arranges only visible nodes  
✅ **Expand/collapse**: Expands only visible projects  
✅ **Completed filter**: Stacks with completed items filter  
✅ **Zoom/pan**: Layout adjusts properly at all zoom levels  

### Filter Combination
Can combine with completed items filter:
1. Hide completed items (from MapView.tsx)
2. Hide empty projects (from MapCanvas.tsx)
3. Result: Only shows active projects with active tasks

## User Instructions

### How to Use
1. Open map view
2. Click "☐ HIDE EMPTY" button (bottom-right)
3. Empty projects disappear
4. Click "☑ HIDE EMPTY" to show them again

### When to Use
- **Hide**: During active work, demos, presentations
- **Show**: During planning, reviewing all projects, comprehensive overview

## Files Changed

```
app/components/map/
  └── MapCanvas.tsx    (UPDATED - added filter toggle and logic)
```

## Future Enhancements

Optional improvements:
- [ ] Save toggle state to localStorage
- [ ] Add to user preferences (database)
- [ ] Filter by other criteria (status, priority)
- [ ] Show count of hidden projects
- [ ] Keyboard shortcut (e.g., 'H' to toggle)
- [ ] Filter empty areas too
- [ ] Threshold filter (hide projects with < N tasks)
- [ ] Multiple filter options (dropdown menu)

## Testing

### Test Cases
✅ Toggle off → All projects visible  
✅ Toggle on → Empty projects hidden  
✅ Toggle on → Projects with 1+ tasks still visible  
✅ Empty area → Area visible but no children  
✅ Toggle changes → Layout animates smoothly  
✅ Works with drag functionality  
✅ Works with auto-arrange  
✅ Works with expand/collapse  
✅ Works with zoom/pan  

### Verification Steps
1. Create area with 3 projects
2. Leave 1 project empty (no tasks)
3. Add tasks to other 2 projects
4. Toggle "HIDE EMPTY" on
5. Empty project should disappear
6. Toggle "HIDE EMPTY" off
7. Empty project should reappear

---

**Status**: ✅ Complete
**Date**: January 24, 2026
**Version**: v1.5 (Map View - Hide Empty Projects)
