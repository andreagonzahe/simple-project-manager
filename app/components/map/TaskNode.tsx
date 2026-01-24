'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Bug as BugIcon, Trash2 } from 'lucide-react';
import type { TreeNode } from '@/app/lib/utils/transformToTree';

interface TaskNodeProps {
  node: TreeNode;
  onClick?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
}

export function TaskNode({ node, onClick, onDelete }: TaskNodeProps) {
  const getIcon = () => {
    if (node.type === 'bug') return BugIcon;
    if (node.type === 'feature') return AlertCircle;
    return CheckCircle;
  };

  const Icon = getIcon();

  const getStatusColor = () => {
    if (node.status === 'completed') return '#10B981';
    if (node.status === 'in_progress') return '#F59E0B';
    return '#6B7280';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="cursor-pointer group relative"
      style={{ width: '128px', height: '64px' }}
    >
      <div
        className="w-full h-full rounded-xl glass flex items-center gap-2 px-3 py-2 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${node.color}20, ${node.color}08)`,
          border: `1px solid ${node.color}25`,
          boxShadow: `0 4px 16px ${node.color}10`,
          opacity: 0.6,
        }}
      >
        {/* Glow effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, ${node.color}, transparent)`,
          }}
        />

        {/* Icon with status */}
        <div className="relative flex-shrink-0 z-10">
          <Icon size={16} style={{ color: getStatusColor() }} strokeWidth={2.5} />
        </div>

        {/* Name */}
        <div
          className="text-sm font-normal line-clamp-2 flex-1 relative z-10"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {node.name}
        </div>

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center glass glass-hover transition-all opacity-0 group-hover:opacity-100 z-20 flex-shrink-0"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <Trash2 size={10} className="text-red-400" strokeWidth={2.5} />
          </button>
        )}

        {/* Priority indicator */}
        {node.priority === 'high' && (
          <div
            className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full"
            style={{ background: '#EF4444' }}
          />
        )}
      </div>
    </motion.div>
  );
}
