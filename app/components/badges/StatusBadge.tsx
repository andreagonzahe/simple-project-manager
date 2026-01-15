import type { ItemStatus, DomainStatus } from '@/app/lib/types';
import { getStatusColor, capitalize } from '@/app/lib/utils';

interface StatusBadgeProps {
  status?: ItemStatus | DomainStatus;
  className?: string;
}

export function StatusBadge({ status = 'backlog', className = '' }: StatusBadgeProps) {
  const color = getStatusColor(status);
  
  // Format status label
  const getStatusLabel = (status: ItemStatus | DomainStatus): string => {
    switch (status) {
      // ItemStatus values
      case 'backlog':
        return 'Backlog';
      case 'in_progress':
        return 'In Progress';
      // DomainStatus values
      case 'planning':
        return 'Planning';
      case 'active':
        return 'Active';
      case 'paused':
        return 'Paused';
      // Shared value
      case 'completed':
        return 'Completed';
      default:
        return capitalize(status);
    }
  };
  
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {getStatusLabel(status)}
    </span>
  );
}
