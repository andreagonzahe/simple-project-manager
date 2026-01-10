import type { BugSeverity } from '@/app/lib/types';
import { getSeverityColor, capitalize } from '@/app/lib/utils';

interface SeverityBadgeProps {
  severity?: BugSeverity;
  className?: string;
}

export function SeverityBadge({ severity = 'minor', className = '' }: SeverityBadgeProps) {
  const color = getSeverityColor(severity);
  
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      {capitalize(severity)}
    </span>
  );
}
