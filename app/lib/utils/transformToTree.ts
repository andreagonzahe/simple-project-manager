import type { AreaOfLife, Project, Task, Bug, Feature } from '../types';

export interface TreeNode {
  id: string;
  name: string;
  type: 'area' | 'project' | 'task' | 'bug' | 'feature';
  level: number;
  color: string;
  icon?: string;
  status?: string;
  priority?: string;
  children: TreeNode[];
  // Preserve original data
  originalData: AreaOfLife | Project | Task | Bug | Feature;
}

interface TransformInput {
  areas: AreaOfLife[];
  projects: Project[];
  tasks?: Task[];
  bugs?: Bug[];
  features?: Feature[];
}

/**
 * Transforms flat arrays of areas, projects, and tasks into a hierarchical tree structure
 * @param input - Flat arrays with FK relationships
 * @returns Hierarchical tree with children arrays at each level
 */
export function transformToTree(input: TransformInput): TreeNode[] {
  const { areas, projects, tasks = [], bugs = [], features = [] } = input;

  // Combine all items (tasks, bugs, features)
  const allItems = [
    ...tasks.map(task => ({ ...task, item_type: 'task' as const })),
    ...bugs.map(bug => ({ ...bug, item_type: 'bug' as const })),
    ...features.map(feature => ({ ...feature, item_type: 'feature' as const })),
  ];

  // Build tree starting from areas
  const tree: TreeNode[] = areas.map(area => {
    // Find projects for this area
    const areaProjects = projects.filter(p => p.area_id === area.id);

    const areaNode: TreeNode = {
      id: area.id,
      name: area.name,
      type: 'area',
      level: 0,
      color: area.color,
      icon: area.icon,
      children: [],
      originalData: area,
    };

    // Build project nodes
    areaNode.children = areaProjects.map(project => {
      // Find items for this project
      const projectItems = allItems.filter(item => item.project_id === project.id);

      const projectNode: TreeNode = {
        id: project.id,
        name: project.name,
        type: 'project',
        level: 1,
        color: project.color,
        status: project.status,
        children: [],
        originalData: project,
      };

      // Build item nodes
      projectNode.children = projectItems.map(item => {
        const itemNode: TreeNode = {
          id: item.id,
          name: item.title,
          type: item.item_type,
          level: 2,
          color: project.color, // Inherit project color
          status: item.status,
          priority: item.priority,
          children: [],
          originalData: item,
        };

        return itemNode;
      });

      return projectNode;
    });

    return areaNode;
  });

  return tree;
}

/**
 * Flattens a tree structure into an array with level information
 * Useful for layout calculations
 */
export function flattenTree(tree: TreeNode[]): TreeNode[] {
  const result: TreeNode[] = [];

  function traverse(nodes: TreeNode[], level: number) {
    nodes.forEach(node => {
      result.push({ ...node, level });
      if (node.children && node.children.length > 0) {
        traverse(node.children, level + 1);
      }
    });
  }

  traverse(tree, 0);
  return result;
}

/**
 * Calculates positions for tree layout
 * Returns node positions for rendering
 */
export interface NodePosition {
  id: string;
  x: number;
  y: number;
  node: TreeNode;
}

export function calculateTreeLayout(
  tree: TreeNode[],
  config = {
    horizontalSpacing: 0, // No horizontal offset for children
    verticalSpacing: 180, // Increased spacing between nodes
    areaSpacing: 600, // Wide spacing between areas
    startX: 0,
    startY: 0,
  }
): NodePosition[] {
  const positions: NodePosition[] = [];
  const { verticalSpacing, areaSpacing, startX, startY } = config;

  tree.forEach((area, areaIndex) => {
    // Position area horizontally
    const areaX = startX + areaIndex * areaSpacing;
    const areaY = startY;
    
    positions.push({ id: area.id, x: areaX, y: areaY, node: area });

    // Track vertical position for children
    let currentY = areaY + verticalSpacing;

    // Process projects (level 1)
    if (area.children && area.children.length > 0) {
      area.children.forEach((project) => {
        const projectX = areaX; // Center align with area
        const projectY = currentY;
        
        positions.push({ id: project.id, x: projectX, y: projectY, node: project });
        
        currentY += verticalSpacing;

        // Process items (level 2)
        if (project.children && project.children.length > 0) {
          project.children.forEach((item) => {
            const itemX = areaX; // Center align with area and project
            const itemY = currentY;
            
            positions.push({ id: item.id, x: itemX, y: itemY, node: item });
            
            currentY += verticalSpacing;
          });
        }
      });
    }
  });

  return positions;
}
