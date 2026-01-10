import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ItemStatus, ItemPriority, BugSeverity } from './types';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get color for status
 */
export function getStatusColor(status?: ItemStatus): string {
  switch (status) {
    case 'backlog':
      return '#6B7280'; // Gray
    case 'in_progress':
      return '#3B82F6'; // Blue
    case 'completed':
      return '#10B981'; // Green
    default:
      return '#6B7280';
  }
}

/**
 * Get color for priority
 */
export function getPriorityColor(priority?: ItemPriority): string {
  switch (priority) {
    case 'low':
      return '#9CA3AF'; // Light gray
    case 'medium':
      return '#F59E0B'; // Yellow
    case 'high':
      return '#EF4444'; // Red
    default:
      return '#9CA3AF';
  }
}

/**
 * Get color for bug severity
 */
export function getSeverityColor(severity?: BugSeverity): string {
  switch (severity) {
    case 'minor':
      return '#FBBF24'; // Yellow
    case 'major':
      return '#F97316'; // Orange
    case 'critical':
      return '#DC2626'; // Dark red
    default:
      return '#FBBF24';
  }
}

/**
 * Format date to readable string
 */
export function formatDate(date?: string): string {
  if (!date) return 'Not set';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date?: string): string {
  if (!date) return 'Never';
  
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(date);
}

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Calculate completion percentage for a list of items
 */
export function calculateCompletion(total: number, completed: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Sort comparator function for items
 */
export function sortByField<T>(field: keyof T, ascending: boolean = true) {
  return (a: T, b: T) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    const comparison = aVal < bVal ? -1 : 1;
    return ascending ? comparison : -comparison;
  };
}

/**
 * Get icon name from lucide-react based on area name
 */
export function getDefaultIcon(areaName: string): string {
  const iconMap: Record<string, string> = {
    'Career': 'Briefcase',
    'Housing': 'Home',
    'Health': 'Heart',
    'Immigration': 'Plane',
    'Personal': 'User',
  };
  return iconMap[areaName] || 'Circle';
}

/**
 * Validate hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Generate a random pastel color
 */
export function generatePastelColor(): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Local storage helpers with type safety
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
};
