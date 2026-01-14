'use client';

import { motion } from 'framer-motion';
import type { Task } from '@/app/lib/types';
import { StatusBadge } from '../badges/StatusBadge';
import { PriorityBadge } from '../badges/PriorityBadge';
import { formatDate, truncate } from '@/app/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm transition-all hover:shadow-md border border-gray-200 cursor-pointer"
    >
      <div className="mb-3">
        <h4 className="text-base font-semibold text-gray-900 mb-2">{task.title}</h4>
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {truncate(task.description, 120)}
          </p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
        {task.commitment_level === 'optional' && (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: 'rgba(107, 114, 128, 0.15)',
              color: '#9CA3AF',
              border: '1px solid rgba(107, 114, 128, 0.3)',
            }}
          >
            Optional
          </span>
        )}
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <div>
          {task.date_started && (
            <span>Started: {formatDate(task.date_started)}</span>
          )}
        </div>
        {task.date_completed && (
          <span>Completed: {formatDate(task.date_completed)}</span>
        )}
      </div>
    </motion.div>
  );
}
