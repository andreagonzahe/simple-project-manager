// Database enums
export type ItemStatus = 'backlog' | 'in_progress' | 'completed';
export type ItemPriority = 'low' | 'medium' | 'high';
export type BugSeverity = 'minor' | 'major' | 'critical';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type CommitmentLevel = 'must_do' | 'optional';
export type DomainStatus = 'planning' | 'active' | 'paused' | 'completed';

// Simplified Hierarchy: Area -> Project -> Task

// Database table types
export interface AreaOfLife {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sort_order: number;
  goals?: string[];
  map_x?: number;
  map_y?: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  area_id: string;
  name: string;
  description?: string;
  goal?: string;
  color: string;
  status: DomainStatus;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  project_id: string | null;
  area_id: string | null;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: ItemPriority;
  commitment_level: CommitmentLevel;
  due_date?: string;
  do_date?: string;
  date_started?: string;
  date_completed?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_end_date?: string;
  last_completed_date?: string;
  next_due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Bug {
  id: string;
  project_id: string | null;
  area_id: string | null;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: ItemPriority;
  severity: BugSeverity;
  commitment_level: CommitmentLevel;
  due_date?: string;
  do_date?: string;
  date_started?: string;
  date_completed?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_end_date?: string;
  last_completed_date?: string;
  next_due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string | null;
  area_id: string | null;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: ItemPriority;
  commitment_level: CommitmentLevel;
  due_date?: string;
  do_date?: string;
  date_started?: string;
  date_completed?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_end_date?: string;
  last_completed_date?: string;
  next_due_date?: string;
  created_at: string;
  updated_at: string;
}

// Extended types with counts for UI
export interface AreaWithCounts extends AreaOfLife {
  projectCount: number;
  totalItems: number;
}

export interface ProjectWithCounts extends Project {
  taskCount: number;
  activeItems: number;
}

// Form types
export interface AreaFormData {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sort_order: number;
}

export interface ProjectFormData {
  area_id: string;
  name: string;
  description?: string;
  color: string;
  status?: DomainStatus;
}

export interface ItemFormData {
  title: string;
  description?: string;
  status?: ItemStatus;
  priority?: ItemPriority;
  severity?: BugSeverity; // Only for bugs
  commitment_level?: CommitmentLevel;
  due_date?: string;
  do_date?: string;
}

// Union type for all item types
export type ItemUnion = (Task & { item_type: 'task' }) | 
                        (Bug & { item_type: 'bug' }) | 
                        (Feature & { item_type: 'feature' });
