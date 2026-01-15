'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, AlertCircle, Sparkles, Filter, SortAsc } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { StatusBadge } from '../badges/StatusBadge';
import { PriorityBadge } from '../badges/PriorityBadge';
import type { ItemStatus, ItemPriority, CommitmentLevel } from '@/app/lib/types';

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: ItemStatus;
  priority: ItemPriority;
  commitment_level: CommitmentLevel;
  type: 'task' | 'bug' | 'feature';
  do_date: string | null;
  due_date: string | null;
  area_name: string;
  area_color: string;
  area_icon: string;
  project_name: string | null;
}

interface TodaysTasksCardProps {
  onTaskClick?: (task: TaskItem) => void;
}

type SortOption = 'priority' | 'do_date' | 'status' | 'commitment';
type FilterCommitment = 'all' | 'must_do' | 'optional';
type FilterStatus = 'all' | ItemStatus;

export function TodaysTasksCard({ onTaskClick }: TodaysTasksCardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [filterCommitment, setFilterCommitment] = useState<FilterCommitment>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  useEffect(() => {
    fetchTodaysTasks();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, sortBy, filterCommitment, filterStatus]);

  const fetchTodaysTasks = async () => {
    try {
      setIsLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const allTasks: TaskItem[] = [];

      // Fetch tasks with do_date = today OR overdue (do_date < today and not complete)
      const fetchFromTable = async (tableName: 'tasks' | 'bugs' | 'features', type: 'task' | 'bug' | 'feature') => {
        const { data, error} = await supabase
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
                color,
                icon
              )
            ),
            areas_of_life(
              id,
              name,
              color,
              icon
            )
          `)
          .not('do_date', 'is', null)
          .neq('status', 'completed')
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
                commitment_level: item.commitment_level || 'must_do',
                type: type,
                do_date: item.do_date,
                due_date: item.due_date,
                area_name: area.name,
                area_color: area.color,
                area_icon: area.icon,
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
      console.error('Error fetching today\'s tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let filtered = [...tasks];

    // Apply commitment filter
    if (filterCommitment !== 'all') {
      filtered = filtered.filter(t => (t.commitment_level || 'must_do') === filterCommitment);
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aOverdue = a.do_date && new Date(a.do_date) < today;
      const bOverdue = b.do_date && new Date(b.do_date) < today;

      switch (sortBy) {
        case 'priority':
          // Overdue first, then by commitment, then by priority
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          
          const aCommit = a.commitment_level || 'must_do';
          const bCommit = b.commitment_level || 'must_do';
          if (aCommit === 'must_do' && bCommit === 'optional') return -1;
          if (aCommit === 'optional' && bCommit === 'must_do') return 1;
          
          const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
        
        case 'do_date':
          if (!a.do_date && !b.do_date) return 0;
          if (!a.do_date) return 1;
          if (!b.do_date) return -1;
          return new Date(a.do_date).getTime() - new Date(b.do_date).getTime();
        
        case 'status':
          return a.status.localeCompare(b.status);
        
        case 'commitment':
          const aComm2 = a.commitment_level || 'must_do';
          const bComm2 = b.commitment_level || 'must_do';
          if (aComm2 === 'must_do' && bComm2 === 'optional') return -1;
          if (aComm2 === 'optional' && bComm2 === 'must_do') return 1;
          return 0;
        
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle2 size={14} />;
      case 'bug': return <AlertCircle size={14} />;
      case 'feature': return <Sparkles size={14} />;
      default: return <CheckCircle2 size={14} />;
    }
  };

  const isOverdue = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    date.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 mb-6 sm:mb-8"
      style={{ 
        borderColor: 'rgba(59, 130, 246, 0.2)',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.03))',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.15))',
              border: '1.5px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <Calendar size={18} className="text-blue-400 sm:w-5 sm:h-5" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Today's Tasks
            </h2>
            <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              {filteredTasks.length !== tasks.length && ` of ${tasks.length}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-lg transition-all ${showFilters ? 'glass' : 'glass-hover'}`}
          style={{ color: 'var(--color-text-secondary)' }}
          title="Toggle filters"
        >
          <Filter size={18} strokeWidth={2} />
        </button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="glass rounded-xl p-4 space-y-3">
              {/* Sort */}
              <div>
                <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <SortAsc size={14} className="inline mr-1" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 glass rounded-lg text-sm"
                  style={{ color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                >
                  <option value="priority">Priority (Overdue First)</option>
                  <option value="commitment">Commitment Level</option>
                  <option value="do_date">Do Date</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Commitment Filter */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Commitment
                  </label>
                  <select
                    value={filterCommitment}
                    onChange={(e) => setFilterCommitment(e.target.value as FilterCommitment)}
                    className="w-full px-3 py-2 glass rounded-lg text-sm"
                    style={{ color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="all">All</option>
                    <option value="must_do">Must Do</option>
                    <option value="optional">Optional</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="w-full px-3 py-2 glass rounded-lg text-sm"
                    style={{ color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="all">All</option>
                    <option value="backlog">Backlog</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks List */}
      {isLoading ? (
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-pulse h-20 sm:h-24"></div>
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="text-4xl mb-2">
            {tasks.length === 0 ? '🎉' : '🔍'}
          </div>
          <p className="text-xs sm:text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            {tasks.length === 0 ? 'No tasks scheduled for today!' : 'No tasks match your filters'}
          </p>
          {tasks.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
              Enjoy your free time or set some do dates for your tasks.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                onClick={() => onTaskClick?.(task)}
                className="group glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all hover:border-blue-400/30 cursor-pointer"
                style={{ 
                  borderColor: isOverdue(task.do_date!) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.15)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                {/* Area/Project Info */}
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-xs"
                    style={{ 
                      background: `${task.area_color}20`, 
                      border: `1px solid ${task.area_color}40`,
                      color: task.area_color 
                    }}
                  >
                    {getTypeIcon(task.type)}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                      {task.area_name}
                    </span>
                    {task.project_name && (
                      <span className="text-xs font-light truncate" style={{ color: 'var(--color-text-tertiary)', opacity: 0.7 }}>
                        {task.project_name}
                      </span>
                    )}
                  </div>
                  {isOverdue(task.do_date!) && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444'
                    }}>
                      Overdue
                    </span>
                  )}
                </div>

                {/* Task Title */}
                <h3 className="text-sm sm:text-base font-semibold mb-2 line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>
                  {task.title}
                </h3>

                {/* Description */}
                {task.description && (
                  <p className="text-xs sm:text-sm line-clamp-1 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    {task.description}
                  </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-2">
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

                {/* Dates */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    <span>📅</span>
                    <span>Do: {new Date(task.do_date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {task.due_date && (
                    <div className="flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }}>
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
    </motion.div>
  );
}
