'use client';

import { motion } from 'framer-motion';
import { Layers, Trash2 } from 'lucide-react';
import type { TreeNode } from '@/app/lib/utils/transformToTree';

interface ProjectNodeProps {
  node: TreeNode;
  onClick?: (e: React.MouseEvent) => void;
  onToggleExpand?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  hasChildren?: boolean;
  isExpanded?: boolean;
}

export function ProjectNode({ node, onClick, onToggleExpand, onDelete, hasChildren, isExpanded }: ProjectNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="cursor-pointer group relative"
      style={{ width: '160px', height: '96px' }}
    >
      <div
        className="w-full h-full rounded-2xl glass flex flex-col items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${node.color}28, ${node.color}12)`,
          border: `1.5px solid ${node.color}35`,
          boxShadow: `0 6px 24px ${node.color}15`,
          opacity: 0.8,
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
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 relative z-10"
          style={{
            background: `${node.color}20`,
            border: `1px solid ${node.color}30`,
          }}
        >
          <Layers size={20} style={{ color: node.color }} strokeWidth={2.5} />
        </div>

        {/* Name */}
        <div
          className="text-base font-semibold text-center line-clamp-2 relative z-10"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {node.name}
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center glass glass-hover transition-all opacity-0 group-hover:opacity-100 z-20"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <Trash2 size={12} className="text-red-400" strokeWidth={2.5} />
          </button>
        )}

        {/* Status indicator */}
        {node.status && (
          <div
            className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{
              background: node.status === 'active' ? '#10B981' : 
                          node.status === 'paused' ? '#F59E0B' : 
                          node.status === 'completed' ? '#8B5CF6' : '#6B7280',
            }}
          />
        )}

        {/* Expand/Collapse button */}
        {hasChildren && onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center glass glass-hover transition-all z-20"
            style={{
              background: `${node.color}25`,
              border: `1.5px solid ${node.color}40`,
            }}
          >
            <span className="text-sm font-bold" style={{ color: node.color }}>
              {isExpanded ? '−' : '+'}
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
