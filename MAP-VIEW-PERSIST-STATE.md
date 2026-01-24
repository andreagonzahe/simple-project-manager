# Map View - Persist State After Task Completion

## Issue
When a task was marked as completed in the map view:
1. The edit modal would close immediately
2. All expanded nodes would collapse
3. User lost their place in the hierarchy

This disrupted workflow and made it difficult to complete multiple tasks in sequence.

## Solution

### 1. Keep Modal Open After Completion
**Before:**
```typescript
onSuccess={() => {
  setEditTaskModal({ isOpen: false, taskId: '', taskType: 'task', taskData: null });
  if (onDataChanged) {
    onDataChanged();
  }
}}
```

**After:**
```typescript
onSuccess={() => {
  // Keep modal open - don't close it
  // Just refresh the data in the background
  if (onDataChanged) {
    onDataChanged();
  }
}
```

**Benefit:** User can review the completed task, make additional edits, or manually close when ready.

### 2. Preserve Expanded Nodes State
**Before:**
```typescript
useEffect(() => {
  // Start collapsed
  setExpandedNodes(new Set());
}, [tree]); // Resets every time tree changes
```

**After:**
```typescript
useEffect(() => {
  // Start collapsed - only run once on mount
  setExpandedNodes(new Set());
}, []); // Empty dependency array - only run once
```

**Benefit:** Expanded nodes stay expanded even when data refreshes.

## Behavior Changes

### Task Completion Flow

**Old Behavior:**
1. User clicks task → Modal opens
2. User marks task as complete
3. ❌ Modal closes immediately
4. ❌ All nodes collapse
5. ❌ User must re-expand to find next task

**New Behavior:**
1. User clicks task → Modal opens
2. User marks task as complete
3. ✅ Modal stays open
4. ✅ Nodes stay expanded
5. ✅ User can close modal when ready or edit more
6. ✅ Task disappears from view (filtered out as completed)

### Data Refresh Behavior

**What Happens:**
- Background data refresh occurs when task is saved
- Completed task is filtered out (no longer shown in map)
- Modal remains open but shows data for now-completed task
- User can:
  - Review what they just completed
  - Make additional changes if needed
  - Close modal manually with X or Cancel
  - Click another task (closes this modal, opens new one)

**Expanded Nodes:**
- Nodes that were expanded stay expanded
- Even after multiple data refreshes
- Only reset when user:
  - Refreshes the page
  - Clicks "COLLAPSE ALL" button
  - Manually collapses individual nodes

## User Workflows Enabled

### Batch Completion Workflow
```
1. Expand area with many tasks
2. Click first task
3. Mark as complete (modal stays open)
4. Close modal
5. Click next task
6. Mark as complete
7. Repeat...
(Area stays expanded throughout)
```

### Review While Completing
```
1. Click task
2. Mark as complete
3. Modal stays open
4. Review completion
5. Add completion notes in description
6. Close when satisfied
```

### Quick Edit Then Complete
```
1. Click task
2. Update priority to "high"
3. Mark as complete
4. Both changes saved
5. Modal still open to verify
6. Close manually
```

## Technical Details

### Modal State Management
The modal now has two ways to close:
1. **User action**: Click X, Cancel, or outside modal
2. **Navigation**: Click another task (closes current, opens new)

The modal does NOT close on:
- Task save/update
- Status change to completed
- Any field change

### Expanded State Persistence
```typescript
// State persists across:
✅ Data refreshes (onDataChanged)
✅ Task completions
✅ Task edits
✅ Filter toggles (hide empty projects)
✅ Auto-arrange

// State resets only on:
❌ Page reload/mount
❌ User clicks "COLLAPSE ALL"
❌ User manually collapses nodes
```

### Completed Task Visibility
Important note: When a task is marked as completed:
- It will disappear from the map (due to completed filter)
- The modal showing that task stays open
- User sees the completed task data in the modal
- But won't see it in the tree behind the modal

This is expected behavior combining:
1. "Hide completed items" feature
2. "Keep modal open" feature

## Edge Cases

### Modal Open for Completed Task
**Scenario:** Modal is open for a task that was just completed

**Behavior:**
- Modal displays the task data (including "completed" status)
- Task is removed from the map tree view
- User can still edit the task (change status back, etc.)
- Closing modal shows updated map without that task

### All Tasks Completed in Project
**Scenario:** User completes last task in a project

**Behavior:**
- Project now has 0 tasks
- If "HIDE EMPTY" is enabled, project disappears too
- Modal stays open for the completed task
- Tree updates to show project gone (if hide empty enabled)

### Rapid Completion
**Scenario:** User marks task complete, quickly clicks another

**Behavior:**
- First modal closes (navigation to new task)
- Second modal opens
- Expanded state preserved
- No visual glitches or state conflicts

## Files Changed

```
app/components/map/
  └── MapCanvas.tsx    (UPDATED - modal persistence, expanded state)
```

## Testing

### Test Cases
✅ Complete task → Modal stays open
✅ Complete task → Nodes stay expanded
✅ Complete multiple tasks → Smooth workflow
✅ Close modal manually → Works as expected
✅ Click another task while modal open → Switches tasks
✅ Complete last task in project → Correct behavior
✅ Refresh data multiple times → Expanded state persists
✅ Toggle hide empty while expanded → State preserved

### Verification Steps
1. Open map view
2. Expand an area with projects
3. Expand a project with tasks
4. Click a task (modal opens)
5. Mark task as complete
6. Verify:
   - Modal stays open
   - Area still expanded
   - Project still expanded
   - Task disappears from tree (completed filter)
7. Close modal manually
8. Repeat with another task

## User Benefits

✅ **Faster workflow** - No need to re-expand after each completion
✅ **Better context** - Can review completed task before closing
✅ **Less clicking** - Don't have to re-navigate hierarchy
✅ **More control** - User decides when to close modal
✅ **Batch operations** - Complete multiple tasks efficiently
✅ **Error recovery** - Can undo completion if needed (modal still open)

---

**Status**: ✅ Fixed
**Date**: January 24, 2026
**Version**: v1.6 (Map View - Persist State)
