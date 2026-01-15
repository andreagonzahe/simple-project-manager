// Utility functions

/**
 * Utility function for conditionally joining classNames
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get color for a status value
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'backlog':
      return '#6B7280';
    case 'in_progress':
      return '#3B82F6';
    case 'completed':
      return '#10B981';
    // Project/domain statuses
    case 'planning':
      return '#8B5CF6';
    case 'active':
      return '#10B981';
    case 'paused':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
}

/**
 * Get color for a priority value
 */
export function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return '#EF4444';
    case 'high':
      return '#F97316';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
    default:
      return '#6B7280';
  }
}

/**
 * Get color for a severity value (for bugs)
 */
export function getSeverityColor(severity: string): string {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return '#EF4444';
    case 'major':
      return '#F97316';
    case 'minor':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
}

/**
 * Format a date string to a more readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Calculate the next due date for a recurring task based on the recurrence pattern
 */
export function calculateNextDueDate(
  currentDate: Date,
  pattern: 'daily' | 'weekly' | 'monthly' | 'yearly'
): Date {
  const nextDate = new Date(currentDate);
  
  switch (pattern) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
}

/**
 * Handle completing a recurring task
 * Returns the update data for the task
 */
export async function handleRecurringTaskCompletion(
  task: {
    is_recurring?: boolean;
    recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrence_end_date?: string;
    next_due_date?: string;
  },
  completionDate: Date = new Date()
): Promise<{
  status: string;
  last_completed_date: string;
  next_due_date: string | null;
  date_completed?: string | null;
}> {
  // If not recurring, just mark as completed
  if (!task.is_recurring || !task.recurrence_pattern) {
    return {
      status: 'completed',
      last_completed_date: completionDate.toISOString().split('T')[0],
      next_due_date: null,
      date_completed: completionDate.toISOString().split('T')[0],
    };
  }

  // Calculate next due date
  const nextDue = calculateNextDueDate(completionDate, task.recurrence_pattern);
  
  // Check if we've passed the end date
  if (task.recurrence_end_date) {
    const endDate = new Date(task.recurrence_end_date);
    if (nextDue > endDate) {
      // End date reached, mark as completed
      return {
        status: 'completed',
        last_completed_date: completionDate.toISOString().split('T')[0],
        next_due_date: null,
        date_completed: completionDate.toISOString().split('T')[0],
      };
    }
  }

  // Task continues recurring
  return {
    status: 'backlog', // Reset to backlog for next occurrence
    last_completed_date: completionDate.toISOString().split('T')[0],
    next_due_date: nextDue.toISOString().split('T')[0],
    date_completed: null, // Clear date_completed since task continues
  };
}
