'use client';

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export type SortField = 'status' | 'priority' | 'date_started' | 'date_completed' | 'created_at';
export type SortDirection = 'asc' | 'desc';

interface SortControlsProps {
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
}

export function SortControls({ sortField, sortDirection, onSortChange }: SortControlsProps) {
  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'date_started', label: 'Date Started' },
    { value: 'date_completed', label: 'Date Completed' },
    { value: 'created_at', label: 'Created' },
  ];

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700">Sort by:</span>
      <select
        value={sortField}
        onChange={(e) => onSortChange(e.target.value as SortField, sortDirection)}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
      >
        {sortDirection === 'asc' ? (
          <ArrowUp size={16} className="text-gray-600" />
        ) : (
          <ArrowDown size={16} className="text-gray-600" />
        )}
      </button>
    </div>
  );
}
