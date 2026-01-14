'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Focus, CheckCircle2, AlertCircle, Sparkles, X, Home, Calendar, Filter, SortAsc, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { EditTaskModal } from '@/app/components/modals/EditTaskModal';
import { DeleteConfirmModal } from '@/app/components/modals/DeleteConfirmModal';
import { Confetti } from '@/app/components/ui/Confetti';
import { CommitmentBadge } from '@/app/components/badges/CommitmentBadge';
import type { ItemStatus, ItemPriority } from '@/app/lib/types';

interface FocusTask {
  id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: ItemPriority;
  commitment_level: 'must_do' | 'optional';
  type: 'task' | 'bug' | 'feature';
  do_date: string | null;
  due_date: string | null;
  area_name: string;
  area_color: string;
  project_id: string | null;
  project_name: string | null;
}

interface Project {
  id: string;
  name: string;
}

type SortOption = 'priority' | 'do_date' | 'status' | 'area';
type FilterStatus = 'all' | ItemStatus;
type FilterCommitment = 'all' | 'must_do' | 'optional';

export default function FocusModePage() {
  const [tasks, setTasks] = useState<FocusTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<FocusTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCommitment, setFilterCommitment] = useState<FilterCommitment>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [showConfetti, setShowConfetti] = useState(false);
  
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
      commitment_level?: 'must_do' | 'optional';
      due_date?: string;
      do_date?: string;
    };
  } | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; type: 'task' | 'bug' | 'feature'; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMustDoTasks();
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, sortBy, filterStatus, filterCommitment, filterProject]);

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

  const fetchMustDoTasks = async () => {
    try {
      setIsLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const allTasks: FocusTask[] = [];

      // Fetch tasks with do_date = today OR overdue (removed commitment level filter)
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
          .not('do_date', 'is', null)
          .neq('status', 'complete')
          .neq('status', 'dismissed')
          .or(`do_date.eq.${todayStr},do_date.lt.${todayStr}`);

        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          return;
        }

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
                project_id: item.project_id || null,
                project_name: item.projects?.name || null,
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
      console.error('Error fetching must-do tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered = [...tasks];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Apply commitment filter
    if (filterCommitment !== 'all') {
      filtered = filtered.filter(t => t.commitment_level === filterCommitment);
    }

    // Apply project filter
    if (filterProject !== 'all') {
      filtered = filtered.filter(t => t.project_id === filterProject);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aRolledOver = a.do_date && new Date(a.do_date) < today;
      const bRolledOver = b.do_date && new Date(b.do_date) < today;

      switch (sortBy) {
        case 'priority':
          // Rolled over first, then by priority
          if (aRolledOver && !bRolledOver) return -1;
          if (!aRolledOver && bRolledOver) return 1;
          
          const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
        
        case 'do_date':
          if (!a.do_date && !b.do_date) return 0;
          if (!a.do_date) return 1;
          if (!b.do_date) return -1;
          return new Date(a.do_date).getTime() - new Date(b.do_date).getTime();
        
        case 'status':
          return a.status.localeCompare(b.status);
        
        case 'area':
          return a.area_name.localeCompare(b.area_name);
        
        default:
          // Default: rolled over first, then by priority
          if (aRolledOver && !bRolledOver) return -1;
          if (!aRolledOver && bRolledOver) return 1;
          const pOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
          return (pOrder[a.priority] || 4) - (pOrder[b.priority] || 4);
      }
    });

    setFilteredTasks(filtered);
  };

  const handleCompleteTask = async (taskId: string, taskType: 'task' | 'bug' | 'feature') => {
    try {
      const tableName = taskType === 'task' ? 'tasks' : taskType === 'bug' ? 'bugs' : 'features';
      
      const { error } = await supabase
        .from(tableName)
        .update({ status: 'complete' })
        .eq('id', taskId);

      if (error) throw error;

      // Trigger confetti celebration
      setShowConfetti(true);

      // Add to completed set for animation
      setCompletedTasks(prev => new Set(prev).add(taskId));

      // Remove from list after animation
      setTimeout(() => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }, 500);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle2 size={18} />;
      case 'bug': return <AlertCircle size={18} />;
      case 'feature': return <Sparkles size={18} />;
      default: return <CheckCircle2 size={18} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    const date = new Date(dueDate);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isRolledOver = (doDate: string | null) => {
    if (!doDate) return false;
    const date = new Date(doDate);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleEditClick = (task: FocusTask) => {
    setSelectedTask({ 
      id: task.id, 
      type: task.type,
      initialData: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        commitment_level: task.commitment_level,
        due_date: task.due_date || undefined,
        do_date: task.do_date || undefined,
      }
    });
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchMustDoTasks();
  };

  const handleDeleteClick = (e: React.MouseEvent, task: FocusTask) => {
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
      fetchMustDoTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const remainingTasks = filteredTasks.filter(t => !completedTasks.has(t.id));

  return (
    <>
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="w-full border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.15))',
                  border: '1.5px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                <Focus size={24} className="text-purple-400" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  🎯 Focus Mode ✨
                </h1>
                <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                  {remainingTasks.length} of {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} for today
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 sm:p-3 rounded-xl transition-all ${showFilters ? 'glass' : 'glass-hover'}`}
                title="Toggle filters"
              >
                <Filter size={20} strokeWidth={2} style={{ color: 'var(--color-text-secondary)' }} />
              </button>
              <Link
                href="/calendar"
                className="p-2.5 sm:p-3 glass glass-hover rounded-xl transition-all"
                title="Calendar"
              >
                <Calendar size={20} strokeWidth={2} style={{ color: 'var(--color-text-secondary)' }} />
              </Link>
              <Link
                href="/"
                className="p-2.5 sm:p-3 glass glass-hover rounded-xl transition-all"
                title="Back to Dashboard"
              >
                <Home size={20} strokeWidth={2} style={{ color: 'var(--color-text-secondary)' }} />
              </Link>
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <option value="priority">Priority</option>
                    <option value="do_date">Do Date</option>
                    <option value="status">Status</option>
                    <option value="area">Area</option>
                  </select>
                </div>

                {/* Commitment Level Filter */}
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

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="w-full px-4 py-2 glass rounded-xl"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    <option value="all">All</option>
                    <option value="backlog">Backlog</option>
                    <option value="idea">Idea</option>
                    <option value="idea_validation">Idea Validation</option>
                    <option value="exploration">Exploration</option>
                    <option value="planning">Planning</option>
                    <option value="executing">Executing</option>
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
              {(filterCommitment !== 'all' || filterStatus !== 'all' || filterProject !== 'all') && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setFilterCommitment('all');
                      setFilterStatus('all');
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-xl p-4 animate-pulse h-24"></div>
            ))}
          </div>
        ) : remainingTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 sm:py-24"
          >
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
                border: '2px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              <CheckCircle2 size={48} className="text-green-400" strokeWidth={2} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              All Done! 🎉
            </h2>
            <p className="text-base sm:text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
              You've completed all your tasks for today.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(124, 58, 237, 0.8))',
                color: 'white',
              }}
            >
              <Home size={18} />
              Back to Dashboard
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {remainingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: 100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="glass rounded-xl p-4 sm:p-5 border-2 hover:border-opacity-50 transition-all group"
                  style={{ 
                    borderColor: isOverdue(task.due_date) 
                      ? 'rgba(239, 68, 68, 0.3)' 
                      : isRolledOver(task.do_date) 
                        ? 'rgba(251, 146, 60, 0.3)' 
                        : 'var(--color-border)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div 
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ 
                          background: `${task.area_color}20`, 
                          border: `2px solid ${task.area_color}40`,
                          color: task.area_color 
                        }}
                      >
                        {getTypeIcon(task.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                          {task.area_name}
                          {task.project_name && <span className="opacity-70"> • {task.project_name}</span>}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="px-1.5 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: `${getPriorityColor(task.priority)}20`,
                              color: getPriorityColor(task.priority),
                              border: `1px solid ${getPriorityColor(task.priority)}40`,
                            }}
                          >
                            {task.priority}
                          </span>
                          <CommitmentBadge commitmentLevel={task.commitment_level} />
                          {isOverdue(task.due_date) && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{
                              background: 'rgba(239, 68, 68, 0.15)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                            }}>
                              Overdue
                            </span>
                          )}
                          {!isOverdue(task.due_date) && isRolledOver(task.do_date) && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-medium" style={{
                              background: 'rgba(251, 146, 60, 0.15)',
                              color: '#fb923c',
                              border: '1px solid rgba(251, 146, 60, 0.3)',
                            }}>
                              Rolled Over
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(e, task);
                        }}
                        className="flex-shrink-0 p-2 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                        title="Delete task"
                      >
                        <Trash2 size={16} style={{ color: '#EF4444' }} />
                      </button>
                      <button
                        onClick={() => handleEditClick(task)}
                        className="flex-shrink-0 p-2 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                        style={{
                          background: 'var(--color-bg-secondary)',
                          border: '1px solid var(--color-border)',
                        }}
                        title="Edit task"
                      >
                        <Pencil size={16} style={{ color: 'var(--color-text-secondary)' }} />
                      </button>
                      <button
                        onClick={() => handleCompleteTask(task.id, task.type)}
                        className="flex-shrink-0 p-2 rounded-lg transition-all hover:scale-110"
                        style={{
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.1))',
                          border: '2px solid rgba(16, 185, 129, 0.3)',
                        }}
                        title="Mark as complete"
                      >
                        <CheckCircle2 size={20} className="text-green-400" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Task Title */}
                  <h2 className="text-base sm:text-lg font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {task.title}
                  </h2>

                  {/* Description */}
                  {task.description && (
                    <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {task.description}
                    </p>
                  )}

                  {/* Dates */}
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>Do: {new Date(task.do_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-1">
                        <span>⏰</span>
                        <span>Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
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
    </>
  );
}
