'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TreeNode, NodePosition } from '@/app/lib/utils/transformToTree';
import { calculateTreeLayout } from '@/app/lib/utils/transformToTree';
import { AreaNode } from './AreaNode';
import { ProjectNode } from './ProjectNode';
import { TaskNode } from './TaskNode';
import { useRouter } from 'next/navigation';
import { supabase } from '@/app/lib/supabase';
import { Trash2, X, Grid3x3 } from 'lucide-react';
import { EditTaskModal } from '../modals/EditTaskModal';
import type { AreaOfLife } from '@/app/lib/types';

interface MapCanvasProps {
  tree: TreeNode[];
  onDataChanged?: () => void;
}

export function MapCanvas({ tree, onDataChanged }: MapCanvasProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    node: TreeNode | null;
    type: 'area' | 'project' | 'task';
  }>({ isOpen: false, node: null, type: 'area' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTaskModal, setEditTaskModal] = useState<{
    isOpen: boolean;
    taskId: string;
    taskType: 'task' | 'bug' | 'feature';
    taskData: any;
  }>({ isOpen: false, taskId: '', taskType: 'task', taskData: null });

  // Area dragging state
  const [draggedAreaId, setDraggedAreaId] = useState<string | null>(null);
  const [draggedAreaStart, setDraggedAreaStart] = useState({ x: 0, y: 0 });
  const [areaPositions, setAreaPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [hasMovedDuringDrag, setHasMovedDuringDrag] = useState(false);

  // Filter state
  const [hideEmptyProjects, setHideEmptyProjects] = useState(false);

  // Filter tree to hide empty projects if enabled
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

  // Calculate node positions (use stored positions for areas if available)
  const calculatePositions = (): NodePosition[] => {
    const basePositions = calculateTreeLayout(filteredTree);
    
    // Override area positions with stored positions
    return basePositions.map(pos => {
      if (pos.node.level === 0 && areaPositions.has(pos.id)) {
        const stored = areaPositions.get(pos.id)!;
        return { ...pos, x: stored.x, y: stored.y };
      }
      return pos;
    });
  };

  const positions = calculatePositions();

  // Load area positions from database on mount
  useEffect(() => {
    const loadAreaPositions = async () => {
      try {
        const { data, error } = await supabase
          .from('areas_of_life')
          .select('id, map_x, map_y');

        if (error) throw error;

        const posMap = new Map<string, { x: number; y: number }>();
        data?.forEach((area: any) => {
          if (area.map_x !== null && area.map_y !== null) {
            posMap.set(area.id, { x: area.map_x, y: area.map_y });
          }
        });
        setAreaPositions(posMap);
      } catch (error) {
        console.error('Error loading area positions:', error);
      }
    };

    loadAreaPositions();
  }, [tree]);

  // Filter positions based on expanded state (not zoom)
  const getVisiblePositions = (): NodePosition[] => {
    const visible: NodePosition[] = [];
    
    function addVisibleNodes(node: TreeNode, parentExpanded: boolean = true) {
      // Find this node's position
      const nodePos = positions.find(p => p.id === node.id);
      if (nodePos && parentExpanded) {
        visible.push(nodePos);
        
        // If this node is expanded, show its children
        const isExpanded = expandedNodes.has(node.id);
        if (isExpanded && node.children) {
          node.children.forEach(child => addVisibleNodes(child, true));
        }
      }
    }
    
    // Start with root level (areas) - always visible
    filteredTree.forEach(area => addVisibleNodes(area, true));
    
    return visible;
  };

  const visiblePositions = getVisiblePositions();

  // Handle mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(zoom * delta, 0.3), 2);
    setZoom(newZoom);
  };

  // Handle mouse drag for panning (only when not dragging an area)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !draggedAreaId) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !draggedAreaId) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
    
    // Handle area dragging
    if (draggedAreaId) {
      const deltaX = (e.clientX - draggedAreaStart.x) / zoom;
      const deltaY = (e.clientY - draggedAreaStart.y) / zoom;
      
      // If we've moved more than 5px, mark as moved
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        setHasMovedDuringDrag(true);
      }
      
      const areaPos = positions.find(p => p.id === draggedAreaId);
      if (areaPos) {
        const newX = areaPos.x + deltaX;
        const newY = areaPos.y + deltaY;
        
        setAreaPositions(prev => new Map(prev).set(draggedAreaId, { x: newX, y: newY }));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Save area position to database if it was dragged
    if (draggedAreaId && hasMovedDuringDrag) {
      const pos = areaPositions.get(draggedAreaId);
      if (pos) {
        saveAreaPosition(draggedAreaId, pos.x, pos.y);
      }
    }
    
    setDraggedAreaId(null);
    setHasMovedDuringDrag(false);
  };

  // Save area position to database
  const saveAreaPosition = async (areaId: string, x: number, y: number) => {
    try {
      const { error } = await supabase
        .from('areas_of_life')
        .update({ map_x: Math.round(x), map_y: Math.round(y) })
        .eq('id', areaId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving area position:', error);
    }
  };

  // Auto-arrange areas in a horizontal line
  const handleAutoArrange = async () => {
    const areas = filteredTree;
    const AREA_WIDTH = 192; // Width of area node
    const AREA_GAP = 80; // Small gap between areas to keep them close
    const START_Y = 0; // All areas at the same Y position (horizontal line)
    
    const newPositions = new Map<string, { x: number; y: number }>();
    
    // Arrange all areas in a single horizontal line, close together
    areas.forEach((area, index) => {
      const x = index * (AREA_WIDTH + AREA_GAP);
      const y = START_Y;
      
      newPositions.set(area.id, { x, y });
    });
    
    setAreaPositions(newPositions);
    
    // Save all positions to database
    try {
      const updates = Array.from(newPositions.entries()).map(([id, pos]) => ({
        id,
        map_x: Math.round(pos.x),
        map_y: Math.round(pos.y),
      }));
      
      for (const update of updates) {
        await supabase
          .from('areas_of_life')
          .update({ map_x: update.map_x, map_y: update.map_y })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error saving auto-arranged positions:', error);
    }
  };

  // Handle area drag start
  const handleAreaDragStart = (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedAreaId(areaId);
    setDraggedAreaStart({ x: e.clientX, y: e.clientY });
    setHasMovedDuringDrag(false);
  };

  // Handle expand/collapse
  const handleToggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Expand all nodes
  const handleExpandAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allNodeIds = new Set<string>();
    
    function collectIds(nodes: TreeNode[]) {
      nodes.forEach(node => {
        allNodeIds.add(node.id);
        if (node.children && node.children.length > 0) {
          collectIds(node.children);
        }
      });
    }
    
    collectIds(filteredTree);
    setExpandedNodes(allNodeIds);
  };

  // Collapse all nodes
  const handleCollapseAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(new Set());
  };

  // Handle delete
  const handleDeleteClick = (node: TreeNode, type: 'area' | 'project' | 'task', e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, node, type });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.node) return;

    setIsDeleting(true);
    try {
      const node = deleteModal.node;
      
      if (deleteModal.type === 'area') {
        const { error } = await supabase
          .from('areas_of_life')
          .delete()
          .eq('id', node.id);
        if (error) throw error;
      } else if (deleteModal.type === 'project') {
        const { error } = await supabase
          .from('projects')
          .delete()
          .eq('id', node.id);
        if (error) throw error;
      } else {
        // Task/Bug/Feature
        const tableName = node.type === 'task' ? 'tasks' : node.type === 'bug' ? 'bugs' : 'features';
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', node.id);
        if (error) throw error;
      }

      // Close modal and refresh data
      setDeleteModal({ isOpen: false, node: null, type: 'area' });
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle node click (only navigate if not dragged)
  const handleNodeClick = async (node: TreeNode, e: React.MouseEvent) => {
    e.stopPropagation();

    // Don't navigate if we just finished dragging an area
    if (node.level === 0 && hasMovedDuringDrag) {
      return;
    }

    // Navigate to detail view based on node type
    if (node.type === 'area') {
      router.push(`/projects/${node.id}`);
    } else if (node.type === 'project') {
      // Get area_id from the project's original data
      const project = node.originalData as any;
      const areaId = project.area_id;
      router.push(`/projects/${areaId}/${node.id}`);
    } else if (node.type === 'task' || node.type === 'bug' || node.type === 'feature') {
      // For items, open edit modal
      try {
        const tableName = node.type === 'task' ? 'tasks' : node.type === 'bug' ? 'bugs' : 'features';
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', node.id)
          .single();

        if (error) throw error;

        if (data) {
          setEditTaskModal({
            isOpen: true,
            taskId: node.id,
            taskType: node.type,
            taskData: {
              title: data.title,
              description: data.description,
              status: data.status,
              priority: data.priority,
              commitment_level: data.commitment_level || 'optional',
              due_date: data.due_date,
              do_date: data.do_date,
              severity: data.severity,
              is_recurring: data.is_recurring,
              recurrence_pattern: data.recurrence_pattern,
              recurrence_end_date: data.recurrence_end_date,
              project_id: data.project_id,
              area_id: data.area_id,
            },
          });
        }
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    }
  };

  // Generate connection lines
  const renderConnections = () => {
    const lines: React.ReactElement[] = [];

    visiblePositions.forEach(pos => {
      if (pos.node.children && pos.node.children.length > 0) {
        pos.node.children.forEach(child => {
          const childPos = visiblePositions.find(p => p.id === child.id);
          if (childPos) {
            // Calculate node dimensions based on type
            const parentHeight = pos.node.level === 0 ? 128 : pos.node.level === 1 ? 96 : 64;
            const parentWidth = pos.node.level === 0 ? 192 : pos.node.level === 1 ? 160 : 128;
            const childWidth = childPos.node.level === 1 ? 160 : childPos.node.level === 2 ? 128 : 64;

            // Start from bottom center of parent
            const x1 = pos.x + parentWidth / 2;
            const y1 = pos.y + parentHeight;
            
            // End at top center of child
            const x2 = childPos.x + childWidth / 2;
            const y2 = childPos.y;

            // Create smooth curved path
            const midY = y1 + (y2 - y1) / 2;
            const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

            lines.push(
              <motion.path
                key={`${pos.id}-${child.id}`}
                d={path}
                stroke="currentColor"
                strokeWidth={2}
                fill="none"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{ color: 'var(--color-text-primary)' }}
              />
            );
          }
        });
      }
    });

    return lines;
  };

  // Initialize with no nodes expanded (only areas visible) - only on first mount
  useEffect(() => {
    // Start collapsed - only run once on mount
    setExpandedNodes(new Set());
  }, []); // Empty dependency array - only run once

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden bg-transparent cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Canvas content */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          width: '5000px',
          height: '5000px',
        }}
      >
        {/* SVG for connections */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ width: '5000px', height: '5000px' }}
        >
          {renderConnections()}
        </svg>

        {/* Render nodes */}
        {visiblePositions.map(pos => {
          const hasChildren = pos.node.children && pos.node.children.length > 0;
          const isExpanded = expandedNodes.has(pos.id);

          return (
            <div
              key={pos.id}
              style={{
                position: 'absolute',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
              }}
            >
              {pos.node.level === 0 && (
                <AreaNode 
                  node={pos.node}
                  hasChildren={hasChildren}
                  isExpanded={isExpanded}
                  onToggleExpand={(e) => handleToggleExpand(pos.id, e)}
                  onClick={(e) => handleNodeClick(pos.node, e)}
                  onDelete={(e) => handleDeleteClick(pos.node, 'area', e)}
                  onDragStart={(e) => handleAreaDragStart(pos.id, e)}
                  isDragging={draggedAreaId === pos.id}
                />
              )}
              {pos.node.level === 1 && (
                <ProjectNode 
                  node={pos.node}
                  hasChildren={hasChildren}
                  isExpanded={isExpanded}
                  onToggleExpand={(e) => handleToggleExpand(pos.id, e)}
                  onClick={(e) => handleNodeClick(pos.node, e)}
                  onDelete={(e) => handleDeleteClick(pos.node, 'project', e)}
                />
              )}
              {pos.node.level === 2 && (
                <TaskNode 
                  node={pos.node}
                  onClick={(e) => handleNodeClick(pos.node, e)}
                  onDelete={(e) => handleDeleteClick(pos.node, 'task', e)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2">
        {/* Auto-Arrange Button */}
        <button
          onClick={handleAutoArrange}
          className="px-4 py-2 glass glass-hover rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <Grid3x3 size={16} />
          AUTO-ARRANGE
        </button>
        
        {/* Hide Empty Projects Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setHideEmptyProjects(!hideEmptyProjects);
          }}
          className={`px-4 py-2 glass glass-hover rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            hideEmptyProjects ? 'ring-2 ring-purple-500/50' : ''
          }`}
          style={{ color: hideEmptyProjects ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
        >
          {hideEmptyProjects ? '☑' : '☐'} HIDE EMPTY
        </button>
        
        <div className="h-2"></div>
        
        {/* Expand/Collapse All */}
        <button
          onClick={handleExpandAll}
          className="px-4 py-2 glass glass-hover rounded-xl text-xs font-semibold whitespace-nowrap"
          style={{ color: 'var(--color-text-primary)' }}
        >
          EXPAND ALL
        </button>
        <button
          onClick={handleCollapseAll}
          className="px-4 py-2 glass glass-hover rounded-xl text-xs font-semibold whitespace-nowrap"
          style={{ color: 'var(--color-text-primary)' }}
        >
          COLLAPSE ALL
        </button>
        
        {/* Zoom Controls */}
        <div className="h-4"></div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom(Math.min(zoom * 1.2, 2));
          }}
          className="w-12 h-12 glass glass-hover rounded-xl flex items-center justify-center text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          +
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom(Math.max(zoom * 0.8, 0.3));
          }}
          className="w-12 h-12 glass glass-hover rounded-xl flex items-center justify-center text-2xl font-bold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          −
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setZoom(0.8);
            setPan({ x: 100, y: 100 });
          }}
          className="w-12 h-12 glass glass-hover rounded-xl flex items-center justify-center text-xs font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          RESET
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-8 right-8 px-4 py-2 glass rounded-xl text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
        {Math.round(zoom * 100)}%
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-8 px-4 py-3 glass rounded-xl text-sm max-w-xs" style={{ color: 'var(--color-text-secondary)' }}>
        <div className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Controls</div>
        <div>Drag canvas to pan • Scroll to zoom</div>
        <div className="mt-1 text-xs">Drag areas to move • Click to navigate</div>
        <div className="mt-1 text-xs">Toggle to hide projects with no tasks</div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && deleteModal.node && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setDeleteModal({ isOpen: false, node: null, type: 'area' })}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="glass rounded-3xl p-8 max-w-md w-full" style={{ border: '2px solid var(--color-border)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    Delete {deleteModal.type === 'area' ? 'Area' : deleteModal.type === 'project' ? 'Project' : 'Task'}
                  </h3>
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, node: null, type: 'area' })}
                    className="p-2 glass glass-hover rounded-xl"
                  >
                    <X size={20} style={{ color: 'var(--color-text-primary)' }} />
                  </button>
                </div>

                {/* Message */}
                <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  Are you sure you want to delete <strong style={{ color: 'var(--color-text-primary)' }}>"{deleteModal.node.name}"</strong>?
                  {deleteModal.type === 'area' && ' This will also delete all projects and items within this area.'}
                  {deleteModal.type === 'project' && ' This will also delete all items within this project.'}
                  {' '}This action cannot be undone.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, node: null, type: 'area' })}
                    className="flex-1 px-6 py-3 glass glass-hover rounded-xl font-medium transition-all"
                    style={{ color: 'var(--color-text-primary)' }}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    className="flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: 'white',
                      opacity: isDeleting ? 0.5 : 1,
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 size={18} />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      {editTaskModal.isOpen && editTaskModal.taskData && (
        <EditTaskModal
          isOpen={editTaskModal.isOpen}
          onClose={() => {
            setEditTaskModal({ isOpen: false, taskId: '', taskType: 'task', taskData: null });
          }}
          onSuccess={() => {
            // Keep modal open - don't close it
            // Just refresh the data in the background
            if (onDataChanged) {
              onDataChanged();
            }
          }}
          taskId={editTaskModal.taskId}
          taskType={editTaskModal.taskType}
          initialData={editTaskModal.taskData}
        />
      )}
    </div>
  );
}
