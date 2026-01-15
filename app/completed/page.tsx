'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, SlidersHorizontal, ChevronDown, Trash2 } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';
import { PriorityBadge } from '@/app/components/badges/PriorityBadge';
import { CommitmentBadge } from '@/app/components/badges/CommitmentBadge';
import { DeleteConfirmModal } from '@/app/components/modals/DeleteConfirmModal';
import type { ItemPriority, CommitmentLevel } from '@/app/lib/types';

interface CompletedTask {
  id: string;
  title: string;
  description?: string;
  priority: ItemPriority;
  commitment_level: CommitmentLevel;
  type: 'task' | 'bug' | 'feature';
  date_completed: string;
  area_id: string;
  area_name: string;
  area_color: string;
  project_id?: string;
  project_name?: string;
}

interface Area {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

type SortOption = 'date_completed' | 'priority' | 'type';
type FilterType = 'all' | 'task' | 'bug' | 'feature';

export default function CompletedTasksPage() {
  const [tasks, setTasks] = useState<CompletedTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<CompletedTask[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date_completed');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; type: 'task' | 'bug' | 'feature'; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCompletedTasks();
    fetchAreas();
    fetchProjects();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, sortBy, filterType, filterArea, filterProject]);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas_of_life')
        .select('id, name')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

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

  const fetchCompletedTasks = async () => {
    try {
      setIsLoading(true);
      const allTasks: CompletedTask[] = [];

      const fetchFromTable = async (tableName: 'tasks' | 'bugs' | 'features', type: 'task' | 'bug' | 'feature') => {
        const { data, error } = await supabase
          .from(tableName)
          .select(`
            id,
            title,
            description,
            priority,
            commitment_level,
            date_completed,
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
          .eq('status', 'completed')
          .order('date_completed', { ascending: false });

        if (error) throw error;

        if (data) {
          data.forEach((item: any) => {
            const area = item.areas_of_life || item.projects?.areas_of_life;
            if (area && item.date_completed) {
              allTasks.push({
                id: item.id,
                title: item.title,
                description: item.description,
                priority: item.priority,
                commitment_level: item.commitment_level || 'optional',
                type: type,
                date_completed: item.date_completed,
                area_id: area.id,
                area_name: area.name,
                area_color: area.color,
                project_id: item.project_id || undefined,
                project_name: item.projects?.name || undefined,
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
      console.error('Error fetching completed tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Apply area filter
    if (filterArea !== 'all') {
      filtered = filtered.filter(t => t.area_id === filterArea);
    }

    // Apply project filter
    if (filterProject !== 'all') {
      filtered = filtered.filter(t => t.project_id === filterProject);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_completed':
          return new Date(b.date_completed).getTime() - new Date(a.date_completed).getTime();
        case 'priority':
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleDeleteClick = (e: React.MouseEvent, task: CompletedTask) => {
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
      fetchCompletedTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return '✓';
      case 'bug': return '🐛';
      case 'feature': return '✨';
      default: return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return '#3B82F6';
      case 'bug': return '#EF4444';
      case 'feature': return '#10B981';
      default: return '#6B7280';
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
                <CheckCircle2 size={24} className="text-green-400" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  ✅ Completed Tasks 🎉
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {filteredTasks.length} of {tasks.length} completed {tasks.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all"
              style={{
                background: showFilters ? 'var(--color-accent)' : 'var(--color-bg-secondary)',
                color: showFilters ? '#fff' : 'var(--color-text-primary)',
                border: `1.5px solid ${showFilters ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}
            >
              <SlidersHorizontal size={18} />
              <span className="font-medium">Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <label className="text-xs font-medium mr-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 rounded-xl text-sm font-medium cursor-pointer appearance-none pr-8"
                style={{
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '1.5px solid var(--color-border)',
                }}
              >
                <option value="date_completed">Recently Completed</option>
                <option value="priority">Priority</option>
                <option value="type">Type</option>
              </select>
              <ChevronDown 
                size={16} 
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ borderColor: 'var(--color-border)' }}>
                  {/* Type Filter */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      Task Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as FilterType)}
                      className="w-full px-3 py-2 rounded-xl text-sm font-medium cursor-pointer"
                      style={{
                        background: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-primary)',
                        border: '1.5px solid var(--color-border)',
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="task">Tasks</option>
                      <option value="bug">Bugs</option>
                      <option value="feature">Features</option>
                    </select>
                  </div>

                  {/* Area Filter */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      Area
                    </label>
                    <select
                      value={filterArea}
                      onChange={(e) => setFilterArea(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm font-medium cursor-pointer"
                      style={{
                        background: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-primary)',
                        border: '1.5px solid var(--color-border)',
                      }}
                    >
                      <option value="all">All Areas</option>
                      {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project Filter */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      Project
                    </label>
                    <select
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm font-medium cursor-pointer"
                      style={{
                        background: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-primary)',
                        border: '1.5px solid var(--color-border)',
                      }}
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
                {(filterType !== 'all' || filterArea !== 'all' || filterProject !== 'all') && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setFilterArea('all');
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-lg mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              {tasks.length === 0 
                ? 'No completed tasks yet. Keep going!' 
                : 'No tasks match your filters.'}
            </p>
            {tasks.length > 0 && (filterType !== 'all' || filterArea !== 'all' || filterProject !== 'all') && (
              <button
                onClick={() => {
                  setFilterType('all');
                  setFilterArea('all');
                  setFilterProject('all');
                }}
                className="text-sm px-4 py-2 rounded-xl hover:opacity-80 transition-opacity mt-2"
                style={{
                  background: 'var(--color-accent)',
                  color: '#fff',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass rounded-2xl p-6 border hover:border-opacity-50 transition-all group"
                style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Type Badge & Area/Project Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1"
                        style={{
                          background: `${getTypeColor(task.type)}20`,
                          color: getTypeColor(task.type),
                          border: `1px solid ${getTypeColor(task.type)}40`,
                        }}
                      >
                        <span>{getTypeIcon(task.type)}</span>
                        <span className="capitalize">{task.type}</span>
                      </div>
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
                    <h3 className="text-lg font-semibold mb-2 line-through" style={{ color: 'var(--color-text-primary)', opacity: 0.7 }}>
                      {task.title}
                    </h3>

                    {/* Description */}
                    {task.description && (
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>
                        {task.description}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                      <PriorityBadge priority={task.priority} />
                      {task.type === 'task' && task.commitment_level && (
                        <CommitmentBadge commitmentLevel={task.commitment_level} />
                      )}
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        ✓ Completed
                      </span>
                    </div>
                  </div>

                  {/* Completion Date & Delete Button */}
                  <div className="flex flex-col items-end gap-3">
                    <button
                      onClick={(e) => handleDeleteClick(e, task)}
                      className="p-2 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                      }}
                      title="Delete task permanently"
                    >
                      <Trash2 size={16} style={{ color: '#EF4444' }} />
                    </button>
                    <div className="text-right text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                      <div className="mb-1 font-medium">Completed</div>
                      <div>
                        {new Date(task.date_completed).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Completed Task"
        message={`Are you sure you want to permanently delete "${taskToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
