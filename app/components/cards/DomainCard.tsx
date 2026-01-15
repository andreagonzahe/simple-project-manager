'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { ProjectWithCounts } from '@/app/lib/types';
import { ChevronRight, Edit2, Target, Trash2 } from 'lucide-react';
import { StatusBadge } from '../badges/StatusBadge';

interface DomainCardProps {
  domain: ProjectWithCounts;
  areaId: string;
  onEdit?: (domain: ProjectWithCounts) => void;
  onEditGoals?: (domain: ProjectWithCounts) => void;
  onDelete?: (domain: ProjectWithCounts) => void;
}

export function DomainCard({ domain, areaId, onEdit, onEditGoals, onDelete }: DomainCardProps) {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(domain);
    }
  };

  const handleEditGoals = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEditGoals) {
      onEditGoals(domain);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(domain);
    }
  };

  const goals = domain.goal ? [domain.goal] : [];

  return (
    <Link href={`/projects/${areaId}/${domain.id}`} className="block group h-full">
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative glass glass-hover p-6 min-h-[180px] h-full flex flex-col"
        style={{ 
          borderLeft: `3px solid ${domain.color}`,
          borderRadius: '20px',
        }}
      >
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all z-10">
          {onEditGoals && (
            <button
              onClick={handleEditGoals}
              className="p-2 rounded-xl glass"
              style={{
                background: 'rgba(155, 110, 255, 0.15)',
                border: '1.5px solid rgba(155, 110, 255, 0.3)',
              }}
              aria-label="Edit goals"
              title="Edit Goals"
            >
              <Target size={14} strokeWidth={2.5} style={{ color: 'var(--color-text-primary)' }} />
            </button>
          )}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-2 rounded-xl glass"
              style={{
                background: 'rgba(123, 159, 255, 0.15)',
                border: '1.5px solid rgba(123, 159, 255, 0.3)',
              }}
              aria-label="Edit project"
            >
              <Edit2 size={14} strokeWidth={2.5} style={{ color: 'var(--color-text-primary)' }} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl glass"
              style={{
                background: 'rgba(255, 107, 107, 0.15)',
                border: '1.5px solid rgba(255, 107, 107, 0.3)',
              }}
              aria-label="Delete project"
              title="Delete Project"
            >
              <Trash2 size={14} strokeWidth={2.5} className="text-red-400" />
            </button>
          )}
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex-1">
            <div className="mb-3">
              <h3 className="text-lg font-bold tracking-tight mb-2 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                {domain.name}
                <ChevronRight 
                  size={18} 
                  className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" 
                  style={{ color: 'var(--color-text-tertiary)' }}
                  strokeWidth={2.5}
                />
              </h3>
              {domain.description && (
                <p className="text-sm font-light line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {domain.description}
                </p>
              )}
              {/* Status Badge */}
              <div className="mt-2">
                <StatusBadge status={domain.status} />
              </div>
            </div>

            {/* Goals Section */}
            {goals.length > 0 && (
              <div className="mb-3 space-y-1">
                {goals.slice(0, 2).map((goal, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    <Target size={12} className="mt-0.5 flex-shrink-0" style={{ color: domain.color }} />
                    <span className="line-clamp-1">{goal}</span>
                  </div>
                ))}
                {goals.length > 2 && (
                  <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    +{goals.length - 2} more
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-auto flex gap-4 text-sm font-light pt-3 border-t" style={{ 
            color: 'var(--color-text-tertiary)',
            borderColor: 'var(--color-border-glass)'
          }}>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: domain.color }}></span>
              <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>{domain.taskCount || 0}</span>
              <span className="text-xs">tasks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400/50"></span>
              <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>{domain.activeItems}</span>
              <span className="text-xs">active</span>
            </div>
            {goals.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Target size={12} style={{ color: 'var(--color-text-tertiary)' }} />
                <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>{goals.length}</span>
                <span className="text-xs">goals</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
