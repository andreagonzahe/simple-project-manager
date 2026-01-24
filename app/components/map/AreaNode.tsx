'use client';

import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Trash2 } from 'lucide-react';
import type { TreeNode } from '@/app/lib/utils/transformToTree';

interface AreaNodeProps {
  node: TreeNode;
  onClick?: (e: React.MouseEvent) => void;
  onToggleExpand?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  hasChildren?: boolean;
  isExpanded?: boolean;
  isDragging?: boolean;
}

export function AreaNode({ node, onClick, onToggleExpand, onDelete, onDragStart, hasChildren, isExpanded, isDragging }: AreaNodeProps) {
  // Convert icon name to PascalCase
  const convertIconName = (iconName?: string) => {
    if (!iconName) return null;
    return iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };

  const iconName = convertIconName(node.icon);
  const IconComponent = iconName && (Icons as any)[iconName] 
    ? (Icons as any)[iconName] 
    : Icons.Folder;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: isDragging ? 1.1 : 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: isDragging ? 1.1 : 1.05 }}
      onClick={onClick}
      onMouseDown={onDragStart}
      className="cursor-move group relative"
      style={{ 
        width: '192px', 
        height: '128px',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
    >
      <div
        className="w-full h-full rounded-3xl glass flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${node.color}30, ${node.color}15)`,
          border: `2px solid ${node.color}40`,
          boxShadow: `0 8px 32px ${node.color}20`,
        }}
      >
        {/* Glow effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, ${node.color}, transparent)`,
          }}
        />

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 relative z-10"
          style={{
            background: `${node.color}25`,
            border: `1.5px solid ${node.color}35`,
          }}
        >
          <IconComponent size={24} style={{ color: node.color }} strokeWidth={2.5} />
        </div>

        {/* Name */}
        <div
          className="text-lg font-bold text-center line-clamp-2 relative z-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {node.name}
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center glass glass-hover transition-all opacity-0 group-hover:opacity-100 z-20"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <Trash2 size={14} className="text-red-400" strokeWidth={2.5} />
          </button>
        )}

        {/* Expand/Collapse button */}
        {hasChildren && onToggleExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(e);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center glass glass-hover transition-all z-20"
            style={{
              background: `${node.color}25`,
              border: `1.5px solid ${node.color}40`,
            }}
          >
            <span className="text-base font-bold" style={{ color: node.color }}>
              {isExpanded ? '−' : '+'}
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
