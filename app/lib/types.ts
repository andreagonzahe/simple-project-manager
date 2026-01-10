// Database enums
export type ItemStatus = 'backlog' | 'todo' | 'in_progress' | 'completed' | 'blocked';
export type ItemPriority = 'low' | 'medium' | 'high' | 'critical';
export type BugSeverity = 'minor' | 'major' | 'critical';

// Simplified Hierarchy: Domain -> Project -> Task

// Database table types
export interface AreaOfLife {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sort_order: number;
  goals?: string[];
  created_at: string;
  updated_at: string;
}

export interface Domain {
  id: string;
  area_id: string;
  name: string;
  description?: string;
  color: string;
  goals?: string[];
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  domain_id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: ItemPriority;
  due_date?: string;
  do_date?: string;
  date_started?: string;
  date_completed?: string;
  created_at: string;
  updated_at: string;
}

export interface Bug {
  id: string;
  domain_id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: ItemPriority;
  severity: BugSeverity;
  due_date?: string;
  do_date?: string;
  date_started?: string;
  date_completed?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  domain_id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: ItemPriority;
  due_date?: string;
  do_date?: string;
  date_started?: string;
  date_completed?: string;
  created_at: string;
  updated_at: string;
}

// Extended types with counts for UI
export interface AreaWithCounts extends AreaOfLife {
  domainCount: number;
  totalItems: number;
}

export interface DomainWithCounts extends Domain {
  taskCount: number;
  activeItems: number;
}

// Form types
export interface AreaFormData {
  name: string;
  color: string;
  icon?: string;
  sort_order: number;
}

export interface DomainFormData {
  area_id: string;
  name: string;
  description?: string;
  color: string;
}

export interface ItemFormData {
  title: string;
  description?: string;
  status?: ItemStatus;
  priority?: ItemPriority;
  severity?: BugSeverity; // Only for bugs
  due_date?: string;
  do_date?: string;
}
