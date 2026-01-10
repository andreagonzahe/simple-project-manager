import type { ItemPriority } from '@/app/lib/types';
import { getPriorityColor, capitalize } from '@/app/lib/utils';

interface PriorityBadgeProps {
  priority?: ItemPriority;
  className?: string;
}

export function PriorityBadge({ priority = 'medium', className = '' }: PriorityBadgeProps) {
  const color = getPriorityColor(priority);
  
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {capitalize(priority)}
    </span>
  );
}
