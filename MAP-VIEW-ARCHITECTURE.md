# Map View Architecture

## Component Hierarchy

```
/map (route)
  └── MapView.tsx (main container)
       ├── Header (navigation, legend)
       ├── MapCanvas.tsx (interactive canvas)
       │    ├── SVG Connections (Bezier curves)
       │    └── Positioned Nodes
       │         ├── AreaNode.tsx (level 0)
       │         ├── ProjectNode.tsx (level 1)
       │         └── TaskNode.tsx (level 2)
       ├── Zoom Controls (buttons)
       ├── Zoom Indicator (percentage)
       └── Instructions Overlay
```

## Data Flow

```
Supabase Database
      ↓
  [Fetch Data]
      ↓
  areas[], projects[], tasks[], bugs[], features[]
      ↓
transformToTree() → TreeNode[]
      ↓
calculateTreeLayout() → NodePosition[]
      ↓
  [Filter by Zoom Level]
      ↓
  Render Nodes + Connections
```

## Tree Structure

```
TreeNode {
  id: string
  name: string
  type: 'area' | 'project' | 'task' | 'bug' | 'feature'
  level: 0 | 1 | 2
  color: string
  icon?: string
  status?: string
  priority?: string
  children: TreeNode[]
  originalData: AreaOfLife | Project | Task | Bug | Feature
}
```

## Layout Algorithm

```
Level 0 (Areas):     x = 50
                     y = 50, 130, 210, 290...
                     spacing: 80px vertical

Level 1 (Projects):  x = 250 (50 + 200)
                     y = parent.y + index * 80
                     spacing: 200px horizontal from parent

Level 2 (Tasks):     x = 450 (250 + 200)
                     y = parent.y + index * 80
                     spacing: 200px horizontal from parent
```

## State Management

```
MapCanvas State:
  - zoom: number (0.3 - 2.0)
  - pan: { x, y } (canvas offset)
  - isDragging: boolean
  - dragStart: { x, y }
  - expandedNodes: Set<string> (node IDs)

MapView State:
  - tree: TreeNode[]
  - isLoading: boolean
  - error: string | null
```

## Interaction Flow

### Pan/Drag
```
onMouseDown → setIsDragging(true)
              ↓
onMouseMove → calculate new pan offset
              ↓
onMouseUp → setIsDragging(false)
```

### Zoom
```
onWheel → calculate zoom delta (0.9 or 1.1)
          ↓
        clamp zoom (0.3 - 2.0)
          ↓
        filter visible nodes
```

### Node Click
```
onClick → stopPropagation
          ↓
        toggle expand/collapse
          ↓
        navigate to detail view
```

## Semantic Zoom Logic

```
zoom < 0.5:
  → filter(node.level === 0)
  → Show: Areas only

0.5 ≤ zoom < 0.8:
  → filter(node.level <= 1)
  → Show: Areas + Projects

zoom ≥ 0.8:
  → Show all nodes
  → Show: Full hierarchy
```

## Connection Rendering

```
For each parent node:
  For each child:
    Calculate positions:
      x1 = parent.x + parentWidth
      y1 = parent.y + parentHeight/2
      x2 = child.x
      y2 = child.y + childHeight/2
    
    Create Bezier curve:
      cx1 = x1 + (x2 - x1) * 0.5
      cy1 = y1
      cx2 = x1 + (x2 - x1) * 0.5
      cy2 = y2
    
    Draw SVG path:
      M x1 y1 C cx1 cy1, cx2 cy2, x2 y2
```

## Performance Optimizations

1. **Semantic Zoom**: Reduce DOM nodes at low zoom levels
2. **CSS Transforms**: Pan/zoom uses GPU-accelerated transforms
3. **Event Delegation**: Single canvas handles all interactions
4. **Lazy Rendering**: Only render visible nodes (future enhancement)
5. **Memoization**: Tree calculation runs once, cached in state

## File Dependencies

```
transformToTree.ts
  └── Uses: types.ts (AreaOfLife, Project, Task, Bug, Feature)

AreaNode.tsx, ProjectNode.tsx, TaskNode.tsx
  └── Uses: transformToTree.ts (TreeNode interface)
  └── Uses: lucide-react (icons)
  └── Uses: framer-motion (animations)

MapCanvas.tsx
  └── Uses: transformToTree.ts (TreeNode, calculateTreeLayout)
  └── Uses: AreaNode, ProjectNode, TaskNode
  └── Uses: next/navigation (router)

MapView.tsx
  └── Uses: MapCanvas.tsx
  └── Uses: supabase.ts (data fetching)
  └── Uses: transformToTree.ts (tree transformation)

page.tsx
  └── Uses: MapView.tsx
```

## Styling Approach

- **Colors**: Inherited from parent (area color cascades down)
- **Opacity**: Decreases by level (100% → 80% → 60%)
- **Size**: Decreases by level (192×128 → 160×96 → 128×64)
- **Borders**: Dynamic based on node color
- **Glassmorphism**: Consistent with app theme
- **Animations**: Framer Motion for scale/opacity

## Responsive Design

- **Desktop**: Full-size canvas, all controls visible
- **Tablet**: Same layout, touch-friendly
- **Mobile**: Touch drag for pan, pinch-to-zoom (future)

## Future Architecture Considerations

1. **Virtual Scrolling**: For >1000 nodes
2. **WebGL Rendering**: For >5000 nodes
3. **Web Workers**: Offload layout calculations
4. **IndexedDB Caching**: Cache tree structure locally
5. **Real-time Updates**: Supabase subscriptions for live data
6. **Collaborative Cursors**: Show other users' positions
