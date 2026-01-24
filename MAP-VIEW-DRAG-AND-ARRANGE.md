# Map View Drag and Auto-Arrange Feature

## Overview
Enhanced map view with drag-to-reposition areas and auto-arrange functionality for horizontal line layouts.

## What Was Added

### 1. Database Changes
**Migration**: `supabase/migrations/20260124_add_map_positions.sql`
- Added `map_x` and `map_y` columns to `areas_of_life` table
- Stores custom position coordinates for each area in map view
- Nullable fields (defaults to calculated layout if not set)

### 2. Completed Items Filtering
**Behavior**: 
- Projects with status `'completed'` are excluded from map view
- Tasks, bugs, and features with status `'completed'` are excluded from map view
- Map view shows only active/in-progress work
- Keeps the visualization focused on current priorities

### 3. Drag-to-Move Areas
**Functionality**:
- Click and drag any area node to reposition it on the canvas
- Visual feedback: cursor changes to `grab`/`grabbing`, node scales up while dragging
- Positions are automatically saved to the database when you release
- Smart click detection: distinguishes between clicking to navigate vs. dragging to move
  - If you drag more than 5px, it's treated as a drag (won't navigate)
  - If you release without moving, it navigates to the area

**Implementation Details**:
- Drag state tracked at canvas level (`draggedAreaId`, `hasMovedDuringDrag`)
- Mouse position delta calculated with zoom compensation
- Real-time position updates during drag
- Async database save on mouse up

### 4. Auto-Arrange Button
**Location**: Bottom-right controls panel (above expand/collapse buttons)

**Functionality**:
- Arranges all areas in a single horizontal line
- Children (projects and tasks) naturally extend vertically below their parent areas
- Wide spacing (400px horizontal) to accommodate children below without overlap
- Automatically saves all new positions to database
- Instant visual update

**Layout Algorithm**:
```javascript
const SPACING_X = 400; // Wide spacing for children
const START_Y = 0;     // All areas at same Y (horizontal line)

For each area at index i:
  x = i * (AREA_WIDTH + SPACING_X)
  y = START_Y
```

**Result**: Areas form a horizontal row across the top, with their project/task hierarchies flowing down vertically beneath each area.

### 5. Updated Components

#### MapCanvas.tsx
**New State**:
- `draggedAreaId`: Currently dragged area (or null)
- `draggedAreaStart`: Starting mouse position for drag
- `areaPositions`: Map of area IDs to custom {x, y} positions
- `hasMovedDuringDrag`: Flag to distinguish drag from click

**New Functions**:
- `loadAreaPositions()`: Loads saved positions from database on mount
- `saveAreaPosition()`: Saves area position to database
- `handleAutoArrange()`: Calculates and applies grid layout
- `handleAreaDragStart()`: Initiates area drag
- `calculatePositions()`: Merges stored positions with calculated layout

**Updated Functions**:
- `handleMouseMove()`: Added area drag logic with zoom compensation
- `handleMouseUp()`: Saves area position on drag end
- `handleNodeClick()`: Checks `hasMovedDuringDrag` to prevent navigation after drag

#### AreaNode.tsx
**New Props**:
- `onDragStart?: (e: React.MouseEvent) => void`: Drag initiation callback
- `isDragging?: boolean`: Visual state during drag

**Updated Styling**:
- Cursor changes: `grab` → `grabbing` during drag
- Scale animation: 1.05 on hover, 1.1 while dragging
- Mouse down event triggers drag (doesn't interfere with click)

**Button Updates**:
- Delete and expand buttons now call `e.stopPropagation()` on both `onClick` and `onMouseDown`
- Prevents accidental dragging when clicking buttons

#### Types (types.ts)
**Updated Interface**:
```typescript
export interface AreaOfLife {
  // ... existing fields
  map_x?: number;
  map_y?: number;
  // ... rest
}
```

### 6. User Experience Flow

**First Time User** (no saved positions):
1. Opens map view
2. Sees active areas in default tree layout (completed items hidden)
3. Can drag areas to customize positions
4. Or clicks "AUTO-ARRANGE" for instant horizontal line layout with children flowing below

**Returning User** (with saved positions):
1. Opens map view
2. Areas appear exactly where they were last positioned
3. Can continue to adjust by dragging
4. "AUTO-ARRANGE" resets to clean horizontal line if things get messy

**Interaction Pattern**:
- **Pan canvas**: Drag empty space
- **Move area**: Drag an area node
- **Navigate**: Click area without dragging
- **Expand/collapse**: Click + / − button
- **Delete**: Click trash icon
- **Horizontal line reset**: Click "AUTO-ARRANGE"

## Visual Design

### Auto-Arrange Button
- Icon: `Grid3x3` (3×3 grid)
- Style: Matches other control buttons (glass, rounded-xl)
- Text: "AUTO-ARRANGE" in semibold, small caps
- Position: Top of controls column (most frequently used)

### Drag Feedback
- Cursor: `grab` → `grabbing`
- Scale: 1.0 → 1.1 (10% larger while dragging)
- Smooth transitions via Framer Motion

### Instructions Update
Bottom-left overlay now shows:
```
Controls
Drag canvas to pan • Scroll to zoom
Drag areas to move • Click to navigate
Use Auto-Arrange for neat layout
```

## Technical Details

### Position Storage
- Stored as integers (rounded on save)
- Nullable (allows fallback to calculated layout)
- Updated on every drag end
- Loaded on component mount

### Zoom Compensation
When dragging, mouse delta is divided by zoom level:
```javascript
const deltaX = (e.clientX - draggedAreaStart.x) / zoom;
const deltaY = (e.clientY - draggedAreaStart.y) / zoom;
```
This ensures consistent drag speed regardless of zoom level.

### Drag Threshold
5px movement threshold prevents accidental navigation blocking:
```javascript
if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
  setHasMovedDuringDrag(true);
}
```

### Database Schema
```sql
ALTER TABLE areas_of_life 
ADD COLUMN map_x INTEGER,
ADD COLUMN map_y INTEGER;
```

## Performance Considerations

- Position updates are debounced (only saved on drag end, not during drag)
- Auto-arrange batch updates (sequential await, not Promise.all to avoid rate limits)
- Local state updated immediately for responsive feel
- Database save happens async in background

## Edge Cases Handled

1. **First load (no saved positions)**: Falls back to calculated tree layout
2. **Mixed state (some areas have positions, others don't)**: Merges stored + calculated
3. **Dragging with high zoom**: Delta compensated by zoom level
4. **Rapid drag-release**: Threshold prevents false navigation
5. **Button clicks during drag**: `onMouseDown` stopPropagation prevents drag initiation

## Future Enhancements (Optional)

- [ ] Snap-to-grid option
- [ ] Undo/redo for position changes
- [ ] Named layouts (save multiple arrangements)
- [ ] Export/import layout configurations
- [ ] Align/distribute tools (align left, center, distribute evenly)
- [ ] Keyboard shortcuts (arrow keys to nudge selected area)
- [ ] Multi-select and bulk move
- [ ] Auto-arrange with custom spacing controls

## Testing Checklist

✅ Drag area node → position updates in real-time
✅ Release drag → position saved to database
✅ Reload page → area appears at saved position
✅ Click area without dragging → navigates to projects page
✅ Drag <5px then release → still navigates (not treated as drag)
✅ Click "AUTO-ARRANGE" → all areas snap to grid
✅ Zoom in/out while dragging → movement speed consistent
✅ Drag from canvas → canvas pans (doesn't interfere with area drag)
✅ Click delete button → area deleted (no drag initiated)
✅ Click expand button → children appear (no drag initiated)

## Files Changed

```
supabase/migrations/
  ├── 20260124_add_map_positions.sql     (NEW - migration for map_x/map_y)
  ├── DEMO_ONE_CLICK_SETUP.sql           (UPDATED - added map columns)
  └── DEMO_COMPLETE_SETUP.sql            (UPDATED - added map columns)

app/lib/
  └── types.ts                           (UPDATED - added map_x, map_y to AreaOfLife)

app/components/map/
  ├── MapView.tsx                        (UPDATED - filter completed items)
  ├── MapCanvas.tsx                      (UPDATED - drag logic, auto-arrange)
  └── AreaNode.tsx                       (UPDATED - drag handlers, visual feedback)
```

## Usage Instructions

### For Users
1. Open map view (click "Map View" from home)
2. First time: Areas appear in default layout
3. **To move an area**: Click and drag it to desired position
4. **To arrange neatly**: Click "AUTO-ARRANGE" button (bottom-right)
5. **To navigate**: Click area without dragging
6. Positions are saved automatically

### For Developers
Apply the migration:
```sql
-- Run this in Supabase SQL Editor
-- (or it will be included in next full schema setup)
ALTER TABLE areas_of_life 
ADD COLUMN map_x INTEGER,
ADD COLUMN map_y INTEGER;
```

For fresh databases, the columns are already included in:
- `DEMO_ONE_CLICK_SETUP.sql`
- `DEMO_COMPLETE_SETUP.sql`

## Implementation Notes

- Works with existing map view (non-breaking change)
- Areas without saved positions use calculated layout
- Drag only works on areas (projects/tasks use click-only)
- Canvas pan and area drag are mutually exclusive
- Auto-arrange preserves area order (by sort_order)

---

**Status**: ✅ Complete and tested
**Date**: January 24, 2026
**Version**: v1.2 (Map View Enhancement)
