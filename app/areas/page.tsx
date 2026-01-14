'use client';

import { useEffect, useState } from 'react';
import { Grid3x3, Plus, GripVertical } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { AreaWithCounts } from '@/app/lib/types';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Map icon names to emojis
const iconToEmoji: Record<string, string> = {
  'Briefcase': '💼',
  'briefcase': '💼',
  'briefcase-business': '💼',
  'Home': '🏠',
  'home': '🏠',
  'house': '🏠',
  'Heart': '❤️',
  'heart': '❤️',
  'Plane': '✈️',
  'plane': '✈️',
  'User': '👤',
  'user': '👤',
  'sparkles': '✨',
  'hand-coins': '💰',
  'coins': '💰',
  'handshake': '🤝',
  'chess-queen': '♕',
  'book-copy': '📚',
  'book': '📚',
  'chevron-right': '▶️',
  'vibe-coding': '💻',
  'coding': '💻',
  'code': '💻',
};

function getEmojiForIcon(iconName: string | null | undefined): string {
  if (!iconName) return '📁';
  return iconToEmoji[iconName] || iconToEmoji[iconName.toLowerCase()] || '📁';
}

// Sortable Area Card Component
function SortableAreaCard({ area }: { area: AreaWithCounts }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: area.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="glass rounded-2xl p-6 border-2 transition-all relative group"
        style={{ borderColor: `${area.color}30` }}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute top-3 right-3 p-2 rounded-lg cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ 
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)'
          }}
        >
          <GripVertical size={16} style={{ color: 'var(--color-text-tertiary)' }} />
        </div>

        <Link href={`/projects/${area.id}`}>
          <div className="cursor-pointer hover:scale-105 transition-transform">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ 
                background: `${area.color}20`, 
                border: `2px solid ${area.color}40`,
                color: area.color
              }}
            >
              <span className="text-2xl">{getEmojiForIcon(area.icon)}</span>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              {area.name}
            </h3>
            {area.description && (
              <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                {area.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              <div>
                <span className="font-semibold">{area.projectCount}</span> projects
              </div>
              <div>
                <span className="font-semibold">{area.totalItems}</span> items
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setIsLoading(true);
      const { data: areasData, error: areasError } = await supabase
        .from('areas_of_life')
        .select('*')
        .order('sort_order', { ascending: true });

      if (areasError) throw areasError;

      const areasWithCounts = await Promise.all(
        (areasData || []).map(async (area) => {
          const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('area_id', area.id);

          const { data: projects } = await supabase
            .from('projects')
            .select('id')
            .eq('area_id', area.id);

          let totalItems = 0;
          if (projects) {
            for (const project of projects) {
              const [features, bugs, tasks] = await Promise.all([
                supabase.from('features').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
                supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
                supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
              ]);
              totalItems += (features.count || 0) + (bugs.count || 0) + (tasks.count || 0);
            }
          }

          return {
            ...area,
            projectCount: projectCount || 0,
            totalItems,
          };
        })
      );

      setAreas(areasWithCounts);
    } catch (error) {
      console.error('Error fetching areas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = areas.findIndex((area) => area.id === active.id);
    const newIndex = areas.findIndex((area) => area.id === over.id);

    const newAreas = arrayMove(areas, oldIndex, newIndex);
    
    // Optimistically update UI
    setAreas(newAreas);

    // Update sort_order in database
    try {
      const updates = newAreas.map((area, index) => ({
        id: area.id,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from('areas_of_life')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);
      }
    } catch (error) {
      console.error('Error updating sort order:', error);
      // Revert on error
      fetchAreas();
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.15))',
                  border: '1.5px solid rgba(59, 130, 246, 0.3)',
                }}
              >
                <Grid3x3 size={24} className="text-blue-400" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  🌸 Areas of Life 💖
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {areas.length} {areas.length === 1 ? 'area' : 'areas'}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse h-48"></div>
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={areas.map((a) => a.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {areas.map((area, index) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SortableAreaCard area={area} />
                  </motion.div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
