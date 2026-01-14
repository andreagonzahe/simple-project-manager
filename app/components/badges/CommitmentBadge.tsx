import type { CommitmentLevel } from '@/app/lib/types';

interface CommitmentBadgeProps {
  commitmentLevel?: CommitmentLevel;
  className?: string;
}

export function CommitmentBadge({ commitmentLevel = 'optional', className = '' }: CommitmentBadgeProps) {
  const isMustDo = commitmentLevel === 'must_do';
  
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
      style={{
        backgroundColor: isMustDo ? 'rgba(239, 68, 68, 0.15)' : 'rgba(147, 197, 253, 0.15)',
        color: isMustDo ? '#EF4444' : '#60A5FA',
        border: `1px solid ${isMustDo ? 'rgba(239, 68, 68, 0.3)' : 'rgba(147, 197, 253, 0.3)'}`,
      }}
    >
      {isMustDo ? '⚡ Must-do' : '✨ Optional'}
    </span>
  );
}
