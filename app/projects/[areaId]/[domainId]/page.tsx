'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, Edit2, Plus, Filter, Trash2, CheckCircle2, AlertCircle, Circle } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { ToastContainer, useToast } from '@/app/components/ui/Toast';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';
import { EditGoalsModal } from '@/app/components/modals/EditGoalsModal';
import { AddTaskModalStandalone } from '@/app/components/modals/AddTaskModalStandalone';
import { EditTaskModal } from '@/app/components/modals/EditTaskModal';
import { DeleteConfirmModal } from '@/app/components/modals/DeleteConfirmModal';
import { StatusBadge } from '@/app/components/badges/StatusBadge';
import { PriorityBadge } from '@/app/components/badges/PriorityBadge';
import type { ItemStatus, ItemPriority } from '@/app/lib/types';
import { motion } from 'framer-motion';

interface Domain {
  id: string;
  name: string;
  description: string;
  color: string;
  goals: string[];
  area_id: string;
}

interface Area {
  id: string;
  name: string;
}

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: ItemPriority;
  type: 'task' | 'bug' | 'feature';
  due_date?: string;
  do_date?: string;
  severity?: 'minor' | 'major' | 'critical';
  created_at: string;
}

export default function DomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const areaId = params.areaId as string;
  const domainId = params.domainId as string;

  const [area, setArea] = useState<Area | null>(null);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'task' | 'bug' | 'feature'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ItemStatus>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'do_date' | 'due_date' | 'priority' | 'status'>('created_at');
  const { toasts, showToast, removeToast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch area
      const { data: areaData, error: areaError } = await supabase
        .from('areas_of_life')
        .select('id, name')
        .eq('id', areaId)
        .single();

      if (areaError) throw areaError;
      setArea(areaData);

      // Fetch domain
      const { data: domainData, error: domainError } = await supabase
        .from('domains')
        .select('*')
        .eq('id', domainId)
        .single();

      if (domainError) throw domainError;
      setDomain({
        ...domainData,
        goals: domainData.goals || [],
      });

      // Fetch all tasks, bugs, and features for this domain
      await fetchTasks();
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load domain', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async () => {
    const allTasks: TaskItem[] = [];

    // Fetch tasks
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .eq('domain_id', domainId);

    if (tasksData) {
      allTasks.push(...tasksData.map(t => ({ ...t, type: 'task' as const })));
    }

    // Fetch bugs
    const { data: bugsData } = await supabase
      .from('bugs')
      .select('*')
      .eq('domain_id', domainId);

    if (bugsData) {
      allTasks.push(...bugsData.map(b => ({ ...b, type: 'bug' as const })));
    }

    // Fetch features
    const { data: featuresData } = await supabase
      .from('features')
      .select('*')
      .eq('domain_id', domainId);

    if (featuresData) {
      allTasks.push(...featuresData.map(f => ({ ...f, type: 'feature' as const })));
    }

    setTasks(allTasks);
  };

  useEffect(() => {
    fetchData();
  }, [areaId, domainId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, filterType, filterStatus, sortBy]);

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
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
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'status':
          return a.status.localeCompare(b.status);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredTasks(filtered);
  };

  const handleGoalsSuccess = async () => {
    showToast('Goals updated successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 300));
    await fetchData();
  };

  const handleTaskSuccess = async () => {
    showToast('Task created successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 300));
    await fetchTasks();
  };

  const handleEditClick = (task: TaskItem) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleEditSuccess = async () => {
    showToast('Task updated successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 300));
    await fetchTasks();
    setIsEditTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleDeleteClick = (task: TaskItem) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTask) return;

    try {
      const tableName = selectedTask.type === 'task' ? 'tasks' : selectedTask.type === 'bug' ? 'bugs' : 'features';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', selectedTask.id);

      if (error) throw error;

      showToast('Task deleted successfully!', 'success');
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchTasks();
      setIsDeleteModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      showToast('Failed to delete task', 'error');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle2 size={16} />;
      case 'bug': return <AlertCircle size={16} />;
      case 'feature': return <Circle size={16} />;
      default: return <Circle size={16} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 glass rounded-xl w-96"></div>
            <div className="h-12 glass rounded-xl w-[500px]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!area || !domain) {
    return (
      <div className="min-h-screen p-12">
        <div className="max-w-[1600px] mx-auto">
          <p style={{ color: 'var(--color-text-primary)' }}>Domain not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="max-w-[1600px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Andrea's Project Manager
            </h1>
          </Link>
          <ThemeToggle />
        </div>

        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: area.name, href: `/projects/${areaId}` },
            { label: domain.name },
          ]}
        />

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 mt-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <button
                onClick={() => router.push(`/projects/${areaId}`)}
                className="p-3 glass glass-hover rounded-2xl transition-all"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-medium px-3 py-1 rounded-xl glass" style={{ color: 'var(--color-text-tertiary)' }}>
                    Project
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {domain.name}
                </h1>
                {domain.description && (
                  <p className="text-lg font-light" style={{ color: 'var(--color-text-secondary)' }}>
                    {domain.description}
                  </p>
                )}
              </div>
            </div>
            <ThemeToggle />
          </div>
        </motion.div>

        {/* Goals Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="relative glass rounded-3xl p-8 border-2" style={{ 
            borderColor: `${domain.color}40`,
            background: `linear-gradient(135deg, ${domain.color}08, transparent)`,
          }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ 
                    background: `${domain.color}20`,
                    border: `1.5px solid ${domain.color}40`,
                  }}
                >
                  <Target size={24} style={{ color: domain.color }} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  Project Goals
                </h2>
              </div>
              <button
                onClick={() => setIsGoalsModalOpen(true)}
                className="px-5 py-3 glass glass-hover rounded-2xl text-sm font-medium transition-all flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Edit2 size={16} strokeWidth={2.5} />
                <span>Edit Goals</span>
              </button>
            </div>

            {domain.goals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  No goals set yet. Define up to 3 goals for this project.
                </p>
                <button
                  onClick={() => setIsGoalsModalOpen(true)}
                  className="px-6 py-3 rounded-2xl transition-all font-medium inline-flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${domain.color}80, ${domain.color}60)`,
                    color: 'white',
                  }}
                >
                  <Plus size={20} strokeWidth={2.5} />
                  Add Goals
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {domain.goals.map((goal, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-5 glass rounded-2xl"
                  >
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: `${domain.color}25`,
                        border: `1.5px solid ${domain.color}35`,
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: domain.color }}>
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-base font-light flex-1" style={{ color: 'var(--color-text-primary)' }}>
                      {goal}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* Tasks Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass rounded-3xl p-8 border-2" style={{ borderColor: 'var(--color-border)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Tasks
                </h3>
                <span className="text-sm px-3 py-1 rounded-xl glass" style={{ color: 'var(--color-text-tertiary)' }}>
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 glass glass-hover rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${showFilters ? 'opacity-100' : 'opacity-70'}`}
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <Filter size={16} />
                  Filters
                </button>
                <button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(123, 159, 255, 0.8), rgba(155, 110, 255, 0.8))',
                    color: 'white',
                  }}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  Add Task
                </button>
              </div>
            </div>

            {/* Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-5 glass rounded-2xl space-y-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Type
                    </label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="w-full px-3 py-2 glass rounded-xl outline-none text-sm"
                      style={{ 
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <option value="all">All Types</option>
                      <option value="task">Task</option>
                      <option value="bug">Bug</option>
                      <option value="feature">Feature</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full px-3 py-2 glass rounded-xl outline-none text-sm"
                      style={{ 
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="backlog">Backlog</option>
                      <option value="idea">Idea</option>
                      <option value="idea_validation">Idea Validation</option>
                      <option value="exploration">Exploration</option>
                      <option value="planning">Planning</option>
                      <option value="executing">Executing</option>
                      <option value="complete">Complete</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="w-full px-3 py-2 glass rounded-xl outline-none text-sm"
                      style={{ 
                        color: 'var(--color-text-primary)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      <option value="created_at">Created Date</option>
                      <option value="do_date">Do Date</option>
                      <option value="due_date">Due Date</option>
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Task List */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  {tasks.length === 0 ? 'No tasks yet. Create your first task to get started.' : 'No tasks match the selected filters.'}
                </p>
                {tasks.length === 0 && (
                  <button
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="px-6 py-3 rounded-2xl transition-all font-medium inline-flex items-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(123, 159, 255, 0.8), rgba(155, 110, 255, 0.8))',
                      color: 'white',
                    }}
                  >
                    <Plus size={20} strokeWidth={2.5} />
                    Create Your First Task
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-2xl p-5 group hover:scale-[1.02] transition-all cursor-pointer relative"
                    onClick={() => handleEditClick(task)}
                  >
                    {/* Type Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 px-2 py-1 rounded-lg glass text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {getTypeIcon(task.type)}
                        <span className="capitalize">{task.type}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(task);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 glass glass-hover rounded-lg transition-all"
                        style={{ color: '#EF4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <h4 className="text-base font-semibold mb-2 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {task.description}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>

                    {/* Dates */}
                    {(task.do_date || task.due_date) && (
                      <div className="text-xs space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                        {task.do_date && <div>Do: {new Date(task.do_date).toLocaleDateString()}</div>}
                        {task.due_date && <div>Due: {new Date(task.due_date).toLocaleDateString()}</div>}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Edit Goals Modal */}
      <EditGoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        onSuccess={handleGoalsSuccess}
        domainId={domainId}
        domainName={domain.name}
        currentGoals={domain.goals}
      />

      {/* Add Task Modal */}
      <AddTaskModalStandalone
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSuccess={handleTaskSuccess}
        preselectedAreaId={areaId}
        preselectedDomainId={domainId}
      />

      {/* Edit Task Modal */}
      {selectedTask && (
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onSuccess={handleEditSuccess}
          taskId={selectedTask.id}
          taskType={selectedTask.type}
          initialData={{
            title: selectedTask.title,
            description: selectedTask.description,
            status: selectedTask.status,
            priority: selectedTask.priority,
            due_date: selectedTask.due_date,
            do_date: selectedTask.do_date,
            severity: selectedTask.severity,
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {selectedTask && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedTask(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Task"
          message={`Are you sure you want to delete "${selectedTask.title}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
}
