import type { ItemStatus } from '@/app/lib/types';
import { getStatusColor, capitalize } from '@/app/lib/utils';

interface StatusBadgeProps {
  status?: ItemStatus;
  className?: string;
}

export function StatusBadge({ status = 'backlog', className = '' }: StatusBadgeProps) {
  const color = getStatusColor(status);
  
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {status === 'in_progress' ? 'In Progress' : capitalize(status)}
    </span>
  );
}
