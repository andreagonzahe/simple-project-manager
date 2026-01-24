# Map View - Project Navigation Fix

## Issue
Clicking on project nodes in the map view resulted in 404 errors.

## Root Cause
The navigation was attempting to route to `/items/{projectId}`, but this route doesn't exist in the application. The correct route structure is `/projects/{areaId}/{projectId}`.

## Solution

### Before
```typescript
else if (node.type === 'project') {
  router.push(`/items/${node.id}`);
}
```

### After
```typescript
else if (node.type === 'project') {
  // Get area_id from the project's original data
  const project = node.originalData as any;
  const areaId = project.area_id;
  router.push(`/projects/${areaId}/${node.id}`);
}
```

## Implementation Details

### Data Structure
Each `TreeNode` includes an `originalData` property that contains the full database record:

```typescript
interface TreeNode {
  id: string;
  name: string;
  type: 'area' | 'project' | 'task' | 'bug' | 'feature';
  originalData: AreaOfLife | Project | Task | Bug | Feature;
  // ... other fields
}
```

For project nodes, `originalData` contains the full `Project` object including `area_id`.

### Route Structure
```
/projects/{areaId}                    - List of projects in an area
/projects/{areaId}/{projectId}        - Specific project's items/tasks view
```

### Navigation Behavior

| Node Type | Click Action | Route |
|-----------|-------------|--------|
| Area | Navigate to projects list | `/projects/{areaId}` |
| Project | Navigate to project detail | `/projects/{areaId}/{projectId}` |
| Task/Bug/Feature | Open edit modal | Modal (no navigation) |

## Testing

### Test Cases
✅ Click area node → Opens `/projects/{areaId}`
✅ Click project node → Opens `/projects/{areaId}/{projectId}`  
✅ Click task node → Opens edit modal (no navigation)
✅ Drag area → No navigation (drag only)
✅ Multiple projects in same area → Correct area_id used

### Verification
1. Open map view
2. Expand an area to see projects
3. Click on a project node
4. Should navigate to project detail page showing tasks/items
5. URL should be `/projects/{areaId}/{projectId}` format

## Files Changed

```
app/components/map/
  └── MapCanvas.tsx    (FIXED - project navigation route)
```

## Related Context

### Why Tasks Open Modals
Tasks, bugs, and features open edit modals rather than navigating to a separate page because:
- Keeps user in map view context
- Faster interaction (no page load)
- Can edit and return to map immediately
- Consistent with other parts of the app

### Project vs Items Terminology
The app uses "projects" to refer to what were formerly called "domains":
- Areas contain Projects
- Projects contain Items (tasks, bugs, features)
- Route naming reflects this: `/projects/{areaId}/{projectId}`

## Prevention

To prevent similar issues in the future:
1. Always use `originalData` to access full record properties
2. Check route definitions before implementing navigation
3. Test navigation with actual data (not just types)
4. Use `router.push()` with template literals carefully

---

**Status**: ✅ Fixed
**Date**: January 24, 2026
**Issue**: Project navigation 404 errors
**Solution**: Use correct route format with area_id
