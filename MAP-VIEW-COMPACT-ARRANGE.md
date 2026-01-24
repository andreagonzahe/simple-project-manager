# Map View - Auto-Arrange Closer Spacing

## Change
Updated the auto-arrange feature to place areas next to each other with minimal gaps instead of spreading them far apart.

## Implementation

### Before
```typescript
const AREA_SPACING = 600; // Wide spacing
areas.forEach((area, index) => {
  const x = index * AREA_SPACING; // Areas 600px apart
  const y = START_Y;
});
```

**Result:** Areas spread across 600px intervals
- Area 1: x = 0
- Area 2: x = 600
- Area 3: x = 1200
- Area 4: x = 1800
- etc.

### After
```typescript
const AREA_WIDTH = 192;  // Width of area node
const AREA_GAP = 80;     // Small gap between areas
areas.forEach((area, index) => {
  const x = index * (AREA_WIDTH + AREA_GAP); // Areas 272px apart
  const y = START_Y;
});
```

**Result:** Areas placed closely together
- Area 1: x = 0
- Area 2: x = 272 (192 + 80)
- Area 3: x = 544 (272 × 2)
- Area 4: x = 816 (272 × 3)
- etc.

## Spacing Breakdown

### Area Dimensions
- **Width**: 192px
- **Height**: 128px

### Gap Calculation
- **Previous gap**: 600px - 192px = 408px of empty space
- **New gap**: 80px of empty space
- **Reduction**: 80% less spacing (408px → 80px)

### Visual Comparison

**Before (600px spacing):**
```
[Area 1]            <-408px gap->            [Area 2]            <-408px gap->            [Area 3]
```

**After (80px gap):**
```
[Area 1] <80px> [Area 2] <80px> [Area 3]
```

## Benefits

### 1. Compact Layout
- Areas grouped together visually
- Easier to see all areas at once
- Less horizontal scrolling needed

### 2. Better Use of Space
- More areas visible on screen
- Reduced canvas size
- Faster navigation

### 3. Clearer Hierarchy
- Children still extend vertically below
- 80px gap is enough to distinguish between areas
- Still plenty of room for connection lines

## Layout Configuration

### Spacing Constants
```typescript
AREA_WIDTH = 192px   // Fixed (node size)
AREA_GAP = 80px      // Configurable gap
Total = 272px        // Per area (width + gap)
```

### Example Positions (5 Areas)
```
Area 1: (0, 0)      → Right edge at 192px
Area 2: (272, 0)    → Right edge at 464px
Area 3: (544, 0)    → Right edge at 736px
Area 4: (816, 0)    → Right edge at 1008px
Area 5: (1088, 0)   → Right edge at 1280px

Total width: 1280px (vs. 3000px with old spacing)
```

## Hierarchy Still Works

The closer spacing doesn't affect the vertical hierarchy:

```
[Area 1]  [Area 2]  [Area 3]  <- Close together horizontally

   |         |         |        <- Each has its own vertical space
   
[Proj 1] [Proj 2] [Proj 3]    <- Projects below their areas
   
   |         |         |
   
[Tasks]  [Tasks]  [Tasks]     <- Tasks below their projects
```

## User Experience

### What Changed for Users
- Click "AUTO-ARRANGE" button
- Areas snap into a compact horizontal line
- Much closer together than before
- All areas visible without much panning

### Compatibility
✅ Works with drag-to-move (can still drag areas apart)
✅ Works with hide empty projects
✅ Works with expand/collapse
✅ Works with zoom/pan
✅ Maintains vertical hierarchy spacing (180px)

## Technical Details

### Why 80px Gap?
- **Minimum readable**: Areas clearly separated
- **Not overlapping**: Enough space for hover effects
- **Visual balance**: Matches node padding/margins
- **Room for expansion**: Hover scale (1.05×) = ~10px per side = 20px total

### Calculation Logic
```typescript
// Position for area at index i:
x = i × (192 + 80)
x = i × 272

// Example:
Area 0: 0 × 272 = 0
Area 1: 1 × 272 = 272
Area 2: 2 × 272 = 544
```

### Database Storage
Positions saved as integers:
```typescript
map_x: Math.round(x)  // e.g., 0, 272, 544, 816
map_y: Math.round(0)  // All areas at y=0
```

## Adjusting the Gap

If you want to adjust spacing further, change `AREA_GAP`:

```typescript
// More compact (minimum):
const AREA_GAP = 40;  // 232px per area

// Current (balanced):
const AREA_GAP = 80;  // 272px per area

// More spacious:
const AREA_GAP = 150; // 342px per area

// Original wide spacing:
const AREA_GAP = 408; // 600px per area
```

## Files Changed

```
app/components/map/
  └── MapCanvas.tsx    (UPDATED - auto-arrange spacing)
```

## Testing

### Visual Tests
✅ Areas arranged close together
✅ 80px gap visible between areas
✅ No overlap or collision
✅ Hover effects work (scale doesn't cause overlap)
✅ Children extend properly below
✅ Connection lines don't overlap areas

### Functional Tests
✅ Auto-arrange applies new spacing
✅ Manual drag still works after auto-arrange
✅ Works with 1 area
✅ Works with 10+ areas
✅ Saved positions persist after reload

## Performance

**Improved:**
- Smaller canvas size (1280px vs 3000px for 5 areas)
- Faster rendering (fewer pixels)
- Less pan distance needed
- More areas fit in viewport

---

**Status**: ✅ Complete
**Date**: January 24, 2026
**Version**: v1.7 (Map View - Compact Auto-Arrange)
