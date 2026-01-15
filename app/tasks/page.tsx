'use client';

import { useEffect, useState } from 'react';
import { CheckSquare, Filter, SortAsc, Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';
import { StatusBadge } from '@/app/components/badges/StatusBadge';
import { PriorityBadge } from '@/app/components/badges/PriorityBadge';
import { CommitmentBadge } from '@/app/components/badges/CommitmentBadge';
import { EditTaskModal } from '@/app/components/modals/EditTaskModal';
import { DeleteConfirmModal } from '@/app/components/modals/DeleteConfirmModal';
import { AddTaskModalStandalone } from '@/app/components/modals/AddTaskModalStandalone';
import type { ItemStatus, ItemPriority, CommitmentLevel } from '@/app/lib/types';

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: ItemPriority;
  commitment_level: CommitmentLevel;
  type: 'task' | 'bug' | 'feature';
  do_date?: string;
  due_date?: string;
  area_name: string;
  area_color: string;
  project_name?: string;
  project_id?: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

type SortOption = 'created_at' | 'do_date' | 'due_date' | 'priority' | 'status';
type FilterCommitment = 'all' | 'must_do' | 'optional';
type FilterStatus = 'all' | ItemStatus;
type FilterPriority = 'all' | ItemPriority;
type FilterDoDate = 'all' | 'today' | 'tomorrow' | 'other';

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ 
    id: string; 
    type: 'task' | 'bug' | 'feature';
    initialData: {
      title: string;
      description?: string;
      status: ItemStatus;
      priority: ItemPriority;
      commitment_level?: CommitmentLevel;
      due_date?: string;
      do_date?: string;
    };
  } | null>(null);
  
  // Add task modal state
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; type: 'task' | 'bug' | 'feature'; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filters
  const [filterCommitment, setFilterCommitment] = useState<FilterCommitment>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterDoDate, setFilterDoDate] = useState<FilterDoDate>('all');
  const [sortBy, setSortBy] = useState<SortOption>('created_at');

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, filterCommitment, filterStatus, filterPriority, filterProject, filterDoDate, sortBy]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const allTasks: TaskItem[] = [];

      const fetchFromTable = async (tableName: 'tasks' | 'bugs' | 'features', type: 'task' | 'bug' | 'feature') => {
        const { data, error } = await supabase
          .from(tableName)
          .select(`
            id,
            title,
            description,
            status,
            priority,
            commitment_level,
            do_date,
            due_date,
            created_at,
            area_id,
            project_id,
            projects(
              id,
              name,
              areas_of_life(
                id,
                name,
                color
              )
            ),
            areas_of_life(
              id,
              name,
              color
            )
          `)
          .neq('status', 'completed');

        if (error) throw error;

        if (data) {
          data.forEach((item: any) => {
            const area = item.areas_of_life || item.projects?.areas_of_life;
            if (area) {
              allTasks.push({
                id: item.id,
                title: item.title,
                description: item.description,
                status: item.status,
                priority: item.priority,
                commitment_level: item.commitment_level || 'optional',
                type: type,
                do_date: item.do_date,
                due_date: item.due_date,
                area_name: area.name,
                area_color: area.color,
                project_name: item.projects?.name || undefined,
                project_id: item.project_id || undefined,
                created_at: item.created_at,
              });
            }
          });
        }
      };

      await Promise.all([
        fetchFromTable('tasks', 'task'),
        fetchFromTable('bugs', 'bug'),
        fetchFromTable('features', 'feature'),
      ]);

      setTasks(allTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Apply do date filter
    if (filterDoDate !== 'all') {
      filtered = filtered.filter(t => {
        if (!t.do_date) return false;
        
        switch (filterDoDate) {
          case 'today':
            return t.do_date === todayStr;
          case 'tomorrow':
            return t.do_date === tomorrowStr;
          case 'other':
            return t.do_date !== todayStr && t.do_date !== tomorrowStr;
          default:
            return true;
        }
      });
    }

    // Apply commitment filter
    if (filterCommitment !== 'all') {
      filtered = filtered.filter(t => t.commitment_level === filterCommitment);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    // Apply project filter
    if (filterProject !== 'all') {
      filtered = filtered.filter(t => t.project_id === filterProject);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'do_date':
          if (!a.do_date && !b.do_date) return 0;
          if (!a.do_date) return 1;
          if (!b.do_date) return -1;
          return new Date(a.do_date).getTime() - new Date(b.do_date).getTime();
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'priority':
          const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleEditClick = (task: TaskItem) => {
    setSelectedTask({ 
      id: task.id, 
      type: task.type,
      initialData: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        commitment_level: task.commitment_level,
        due_date: task.due_date,
        do_date: task.do_date,
      }
    });
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchTasks();
  };

  const handleAddSuccess = () => {
    fetchTasks();
  };

  const handleDeleteClick = (e: React.MouseEvent, task: TaskItem) => {
    e.stopPropagation();
    setTaskToDelete({ id: task.id, type: task.type, title: task.title });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      const tableName = taskToDelete.type === 'task' ? 'tasks' : 
                       taskToDelete.type === 'bug' ? 'bugs' : 'features';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', taskToDelete.id);

      if (error) throw error;

      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                  border: '1.5px solid rgba(16, 185, 129, 0.3)',
                }}
              >
                <CheckSquare size={24} className="text-green-400" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  ✅ All Tasks 💫
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {filteredTasks.length} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAddTaskModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(124, 58, 237, 0.8))',
                  color: '#fff',
                }}
              >
                <Plus size={20} strokeWidth={2.5} />
                <span className="hidden sm:inline">Add Task</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl transition-all ${showFilters ? 'glass' : 'glass-hover'}`}
                title="Toggle filters"
              >
                <Filter size={20} strokeWidth={2} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b overflow-hidden"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    <SortAsc size={16} className="inline mr-2" />
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full px-4 py-2 glass rounded-xl"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <option value="created_at">Date Created</option>
                    <option value="do_date">Do Date</option>
                    <option value="due_date">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                {/* Do Date Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    📅 Do Date
                  </label>
                  <select
                    value={filterDoDate}
                    onChange={(e) => setFilterDoDate(e.target.value as FilterDoDate)}
                    className="w-full px-4 py-2 glass rounded-xl"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="tomorrow">Tomorrow</option>
                    <option value="other">Other Dates</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Priority
                  </label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
                    className="w-full px-4 py-2 glass rounded-xl"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Commitment Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Commitment
                  </label>
                  <select
                    value={filterCommitment}
                    onChange={(e) => setFilterCommitment(e.target.value as FilterCommitment)}
                    className="w-full px-4 py-2 glass rounded-xl"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <option value="all">All</option>
                    <option value="must_do">Must Do</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>

                {/* Project Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Project
                  </label>
                  <select
                    value={filterProject}
                    onChange={(e) => setFilterProject(e.target.value)}
                    className="w-full px-4 py-2 glass rounded-xl"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <option value="all">All Projects</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              {(filterDoDate !== 'all' || filterCommitment !== 'all' || filterStatus !== 'all' || filterPriority !== 'all' || filterProject !== 'all') && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setFilterDoDate('all');
                      setFilterCommitment('all');
                      setFilterStatus('all');
                      setFilterPriority('all');
                      setFilterProject('all');
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: 'var(--color-accent)',
                      color: '#fff',
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse h-32"></div>
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
              No tasks found matching your filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass rounded-2xl p-6 border hover:border-opacity-50 transition-all cursor-pointer group"
                style={{ borderColor: 'var(--color-border)' }}
                onClick={() => handleEditClick(task)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Area/Project Info */}
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: `${task.area_color}20`,
                          color: task.area_color,
                          border: `1px solid ${task.area_color}40`,
                        }}
                      >
                        {task.area_name}
                      </div>
                      {task.project_name && (
                        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                          • {task.project_name}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      {task.title}
                    </h3>

                    {/* Description */}
                    {task.description && (
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {task.description}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <CommitmentBadge commitmentLevel={task.commitment_level} />
                    </div>
                  </div>

                  {/* Dates & Action Buttons */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(e, task);
                        }}
                        className="p-2 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                        title="Delete task"
                      >
                        <Trash2 size={16} style={{ color: '#EF4444' }} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(task);
                        }}
                        className="p-2 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                        style={{
                          background: 'var(--color-bg-secondary)',
                          border: '1px solid var(--color-border)',
                        }}
                        title="Edit task"
                      >
                        <Pencil size={16} style={{ color: 'var(--color-text-secondary)' }} />
                      </button>
                    </div>
                    
                    <div className="text-right text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                      {task.do_date && (
                        <div className="mb-1">
                          📅 Do: {new Date(task.do_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                      {task.due_date && (
                        <div>
                          ⏰ Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTask(null);
          }}
          onSuccess={handleEditSuccess}
          taskId={selectedTask.id}
          taskType={selectedTask.type}
          initialData={selectedTask.initialData}
        />
      )}

      {/* Add Task Modal */}
      <AddTaskModalStandalone
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
