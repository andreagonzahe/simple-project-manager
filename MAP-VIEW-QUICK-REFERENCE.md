# Map View - Quick Reference

## Access Map View
- **Desktop**: Click "Map View" button in header navigation
- **Mobile**: Open hamburger menu → tap "Map View"
- **Direct URL**: `/map`

## Controls

### Navigation
- **Drag**: Click and drag anywhere to pan the canvas
- **Zoom In**: Mouse wheel up OR click `+` button
- **Zoom Out**: Mouse wheel down OR click `−` button
- **Reset View**: Click `RESET` button (bottom-right)

### Interaction
- **Click Node**: Navigate to detail view
  - Area → Projects page
  - Project → Items page
  - Task → (no navigation yet)
- **Expand/Collapse**: Click nodes with `+` or `−` indicator

## Visual Legend

### Node Sizes
- **Large (192×128px)**: Areas (root level)
- **Medium (160×96px)**: Projects (branch level)
- **Small (128×64px)**: Tasks/Bugs/Features (leaf level)

### Status Indicators
- **Green dot**: Active/Completed
- **Orange dot**: In Progress
- **Gray dot**: Backlog/Planning
- **Red dot** (small, top-right): High priority

### Node Types
- **Folder icon**: Area of Life
- **Layers icon**: Project
- **CheckCircle icon**: Task
- **Bug icon**: Bug
- **AlertCircle icon**: Feature

## Semantic Zoom Levels

### Zoom < 50%
Shows: **Areas only**
Use for: Overview of all life areas

### Zoom 50-80%
Shows: **Areas + Projects**
Use for: Understanding project distribution

### Zoom > 80%
Shows: **Full hierarchy**
Use for: Detailed task-level exploration

## Tips
1. Start zoomed out to get the big picture
2. Zoom in on specific areas of interest
3. Drag to center nodes you want to focus on
4. Use RESET to return to starting position
5. Look for the `+` indicator to find expandable nodes

## Troubleshooting

### Nothing appears
- Check that you have areas/projects created
- Go back to home page and create content
- Refresh the page

### Can't see all nodes
- Zoom out using mouse wheel or `−` button
- Drag the canvas to explore different areas

### Zoom not working
- Try clicking directly on the canvas (not on nodes)
- Use the zoom buttons instead of mouse wheel

### Performance issues
- Zoom out to reduce visible nodes
- Close other heavy applications
- Refresh the browser

## Keyboard (Future)
Currently no keyboard shortcuts implemented. Coming soon:
- Arrow keys for navigation
- `+`/`-` for zoom
- `R` for reset
- `Space` + drag for pan
