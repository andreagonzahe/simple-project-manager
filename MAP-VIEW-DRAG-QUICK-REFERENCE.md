# Map View Drag & Arrange - Quick Reference

## User Guide

### Moving Areas
1. **Drag to move**: Click and hold an area card, then drag to reposition
2. **Click to open**: Click quickly without dragging to navigate to that area
3. **Auto-arrange**: Click "AUTO-ARRANGE" button for instant horizontal line layout

### Controls (Bottom-Right)
- **AUTO-ARRANGE** → Align all areas in horizontal line (children flow below)
- **EXPAND ALL** → Show all projects/tasks
- **COLLAPSE ALL** → Show only areas
- **+ / −** → Zoom in/out
- **RESET** → Return to default view

### Tips
- Drag empty space to pan the canvas
- Scroll to zoom
- Your positions are saved automatically
- Use Auto-Arrange for clean horizontal layout with hierarchies below
- Completed items are hidden from map view automatically

## Developer Guide

### Database Schema
```sql
-- Migration: 20260124_add_map_positions.sql
ALTER TABLE areas_of_life 
ADD COLUMN map_x INTEGER,
ADD COLUMN map_y INTEGER;
```

### Key Components

**MapCanvas.tsx**
- Manages drag state and position storage
- Loads/saves positions from/to database
- Handles auto-arrange grid calculation

**AreaNode.tsx**
- Accepts `onDragStart` and `isDragging` props
- Shows visual feedback during drag (scale, cursor)
- Prevents drag on button clicks

### API

**Load positions**:
```typescript
const { data } = await supabase
  .from('areas_of_life')
  .select('id, map_x, map_y');
```

**Save position**:
```typescript
await supabase
  .from('areas_of_life')
  .update({ map_x: x, map_y: y })
  .eq('id', areaId);
```

### Drag Logic

**Start**:
```typescript
onMouseDown={(e) => {
  setDraggedAreaId(areaId);
  setDraggedAreaStart({ x: e.clientX, y: e.clientY });
}}
```

**Move**:
```typescript
const deltaX = (e.clientX - start.x) / zoom;
const deltaY = (e.clientY - start.y) / zoom;
setAreaPositions(prev => 
  new Map(prev).set(areaId, { x: pos.x + deltaX, y: pos.y + deltaY })
);
```

**End**:
```typescript
onMouseUp={() => {
  if (hasMovedDuringDrag) {
    saveAreaPosition(areaId, x, y);
  }
  setDraggedAreaId(null);
}}
```

### Auto-Arrange Algorithm

```typescript
const SPACING_X = 400; // Wide horizontal spacing
const START_Y = 0;     // All areas at same Y position

areas.forEach((area, i) => {
  const x = i * (AREA_WIDTH + SPACING_X);
  const y = START_Y;
  
  positions.set(area.id, { x, y });
});
```

**Result**: Areas arranged in a horizontal line, with children flowing vertically below each area.

## Migration

**For Existing Databases**:
Run `20260124_add_map_positions.sql` in Supabase SQL Editor

**For New Databases**:
Columns already included in:
- `DEMO_ONE_CLICK_SETUP.sql`
- `DEMO_COMPLETE_SETUP.sql`

## Troubleshooting

**Areas don't move when dragging**
- Check if `map_x`/`map_y` columns exist
- Verify no console errors
- Check Supabase RLS policies allow updates

**Positions not saved**
- Check Supabase connection
- Verify `update` permission in RLS policies
- Check browser console for errors

**Click navigates even after drag**
- Drag threshold is 5px
- Move more than 5px to trigger drag mode

**Auto-arrange doesn't work**
- Check console for database errors
- Verify Supabase credentials
- Try manual drag first to test save functionality

## Performance

- ✅ Positions loaded once on mount
- ✅ Updates only on drag end (not during)
- ✅ Local state updates immediately (smooth)
- ✅ Database saves async (non-blocking)

## Compatibility

- ✅ Works with existing map view features
- ✅ Backward compatible (areas without positions use calculated layout)
- ✅ Non-breaking change to database schema (nullable columns)

---

**Version**: v1.2
**Last Updated**: January 24, 2026
