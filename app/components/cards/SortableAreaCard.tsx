'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AreaCard } from './AreaCard';
import type { AreaWithCounts } from '@/app/lib/types';
import { useRouter } from 'next/navigation';

interface SortableAreaCardProps {
  area: AreaWithCounts;
  onDelete: (id: string) => void;
  onAddProject?: (areaId: string) => void;
  onEditGoals?: (areaId: string) => void;
  onEdit?: (areaId: string) => void;
}

export function SortableAreaCard({ area, onDelete, onAddProject, onEditGoals, onEdit }: SortableAreaCardProps) {
  const router = useRouter();
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
    cursor: isDragging ? 'grabbing' : 'grab',
    pointerEvents: isDragging ? 'none' : 'auto',
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only navigate if we're not dragging
    if (!isDragging) {
      router.push(`/projects/${area.id}`);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style as any}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className="min-h-[240px]"
    >
      <AreaCard 
        area={area} 
        onDelete={onDelete} 
        onAddProject={onAddProject}
        onEditGoals={onEditGoals}
        onEdit={onEdit}
        isInDragContext={true} 
      />
    </div>
  );
}
