'use client';

import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="mb-6 rounded-xl p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-subtle)' }}>
        {icon || <Inbox size={48} strokeWidth={1.5} style={{ color: 'var(--color-text-tertiary)' }} />}
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
      {description && (
        <p className="text-base text-center max-w-md mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
