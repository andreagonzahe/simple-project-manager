'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { AreaWithCounts } from '@/app/lib/types';
import * as Icons from 'lucide-react';
import { Trash2, ChevronRight, Plus, Target, Pencil } from 'lucide-react';

interface AreaCardProps {
  area: AreaWithCounts;
  onDelete?: (id: string) => void;
  onAddProject?: (areaId: string) => void;
  onEditGoals?: (areaId: string) => void;
  onEdit?: (areaId: string) => void;
  isInDragContext?: boolean;
}

export function AreaCard({ area, onDelete, onAddProject, onEditGoals, onEdit, isInDragContext = false }: AreaCardProps) {
  // Convert icon name to PascalCase (e.g., "hand-coins" -> "HandCoins")
  const convertIconName = (iconName: string) => {
    if (!iconName) return null;
    return iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };

  const iconName = convertIconName(area.icon || '');
  const IconComponent = iconName && (Icons as any)[iconName] 
    ? (Icons as any)[iconName] 
    : Icons.Circle;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(area.id);
    }
  };

  const handleAddProject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddProject) {
      onAddProject(area.id);
    }
  };

  const handleEditGoals = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEditGoals) {
      onEditGoals(area.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(area.id);
    }
  };

  const goals = Array.isArray(area.goals) ? area.goals : [];

  // Get glow class based on color
  const getGlowClass = () => {
    const colorMap: Record<string, string> = {
      '#3B82F6': 'glow-blue',
      '#7B9FFF': 'glow-blue',
      '#5B85FF': 'glow-blue',
      '#F97316': 'glow-orange',
      '#FFB088': 'glow-orange',
      '#FF8C5A': 'glow-orange',
      '#10B981': 'glow-green',
      '#88DFAB': 'glow-green',
      '#5FD68A': 'glow-green',
      '#8B5CF6': 'glow-purple',
      '#B195FF': 'glow-purple',
      '#9B6EFF': 'glow-purple',
      '#EC4899': 'glow-pink',
      '#FF9FCA': 'glow-pink',
      '#FF7AB8': 'glow-pink',
    };
    return colorMap[area.color] || 'glow-blue';
  };

  const cardContent = (
    <motion.div
      whileHover={!isInDragContext ? { scale: 1.02, y: -8 } : {}}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      className={`relative glass glass-hover p-12 min-h-[280px] ${getGlowClass()} h-full flex flex-col`}
    >
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
        {onEdit && (
          <button
            onClick={handleEdit}
            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl glass"
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1.5px solid rgba(59, 130, 246, 0.3)',
            }}
            aria-label="Edit area"
            title="Edit Area"
          >
            <Pencil size={16} strokeWidth={2.5} style={{ color: 'var(--color-text-primary)' }} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        )}
        {onEditGoals && (
          <button
            onClick={handleEditGoals}
            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl glass"
            style={{
              background: 'rgba(155, 110, 255, 0.15)',
              border: '1.5px solid rgba(155, 110, 255, 0.3)',
            }}
            aria-label="Edit goals"
            title="Edit Goals"
          >
            <Target size={16} strokeWidth={2.5} style={{ color: 'var(--color-text-primary)' }} className="sm:w-[18px] sm:h-[18px]" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl glass"
            style={{
              background: 'rgba(255, 107, 107, 0.15)',
              border: '1.5px solid rgba(255, 107, 107, 0.3)',
            }}
            aria-label="Delete area"
          >
            <Trash2 size={16} strokeWidth={2.5} className="text-red-400 sm:w-[18px] sm:h-[18px]" />
          </button>
        )}
      </div>

      {/* Icon + Title */}
      <div className="flex items-start gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-12">
        <div 
          className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center flex-shrink-0 glass transition-all duration-400 group-hover:scale-110"
          style={{ 
            background: `linear-gradient(135deg, ${area.color}25, ${area.color}15)`,
            border: `1.5px solid ${area.color}35`,
            boxShadow: `0 8px 24px ${area.color}20`,
          }}
        >
          <IconComponent size={28} style={{ color: area.color }} strokeWidth={2.5} className="sm:w-8 sm:h-8 lg:w-9 lg:h-9" />
        </div>
        <div className="flex-1 min-w-0 pt-1 sm:pt-2">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2 sm:gap-3" style={{ color: 'var(--color-text-primary)' }}>
            {area.name}
            <ChevronRight 
              size={20} 
              className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-2 sm:w-6 sm:h-6" 
              style={{ color: 'var(--color-text-tertiary)' }}
              strokeWidth={2.5}
            />
          </h3>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="text-base sm:text-lg lg:text-xl font-light" style={{ color: 'var(--color-text-secondary)' }}>
              {area.domainCount} {area.domainCount === 1 ? 'project' : 'projects'}
            </div>
            {area.totalItems > 0 && (
              <div className="text-sm sm:text-base font-light" style={{ color: 'var(--color-text-tertiary)' }}>
                {area.totalItems} {area.totalItems === 1 ? 'item' : 'items'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Goals Section */}
      {goals.length > 0 && (
        <div className="mb-8 space-y-2">
          {goals.slice(0, 3).map((goal, index) => (
            <div key={index} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              <Target size={14} className="mt-0.5 flex-shrink-0" style={{ color: area.color }} />
              <span className="line-clamp-1 font-light">{goal}</span>
            </div>
          ))}
        </div>
      )}

      {/* Status - Removed fake blocked items count */}
      {area.totalItems > 0 && (
        <div className="text-base font-light mb-12" style={{ color: 'var(--color-text-secondary)' }}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: area.color }}></span>
            {area.totalItems} {area.totalItems === 1 ? 'item' : 'items'} total
          </span>
        </div>
      )}

      {area.domainCount === 0 && (
        <div className="text-sm sm:text-base font-light mb-6 sm:mb-8 lg:mb-12 flex items-center gap-1.5 sm:gap-2" style={{ color: 'var(--color-text-tertiary)' }}>
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: area.color, opacity: 0.5 }}></span>
          No projects yet
        </div>
      )}

      {/* Ghost Buttons */}
      <div className="flex items-center justify-between gap-3 sm:gap-4 lg:gap-6 mt-auto">
        <div className="flex-1 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 btn-ghost rounded-xl sm:rounded-2xl text-xs sm:text-sm lg:text-base font-medium text-center transition-all">
          View Projects
        </div>
        <button 
          onClick={handleAddProject}
          className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 btn-ghost rounded-xl sm:rounded-2xl text-xs sm:text-sm lg:text-base font-medium transition-all flex items-center gap-1.5 sm:gap-2"
        >
          <Plus size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
          Add
          <ChevronRight size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      </div>
    </motion.div>
  );

  // If in drag context, don't wrap with Link
  if (isInDragContext) {
    return <div className="block group h-full">{cardContent}</div>;
  }

  return (
    <Link href={`/projects/${area.id}`} className="block group h-full">
      {cardContent}
    </Link>
  );
}
