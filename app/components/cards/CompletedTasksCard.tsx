'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';
import { StatusBadge } from '../badges/StatusBadge';

interface CompletedTask {
  id: string;
  title: string;
  type: 'task' | 'feature' | 'bug';
  area_name: string;
  area_color: string;
  project_name: string | null;
  completed_date: string;
}

export function CompletedTasksCard() {
  const [tasks, setTasks] = useState<CompletedTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    setIsLoading(true);
    try {
      const allTasks: CompletedTask[] = [];

      // Fetch completed tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          updated_at,
          area_id,
          project_id,
          areas_of_life!tasks_area_id_fkey (
            name,
            color
          ),
          projects (
            name
          )
        `)
        .eq('status', 'complete')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (tasks) {
        tasks.forEach((task: any) => {
          const area = task.areas_of_life || task.projects?.areas_of_life;
          if (area) {
            allTasks.push({
              id: task.id,
              title: task.title,
              type: 'task',
              area_name: area.name,
              area_color: area.color,
              project_name: task.projects?.name || null,
              completed_date: task.updated_at,
            });
          }
        });
      }

      // Fetch completed bugs
      const { data: bugs, error: bugsError } = await supabase
        .from('bugs')
        .select(`
          id,
          title,
          updated_at,
          area_id,
          project_id,
          areas_of_life!bugs_area_id_fkey (
            name,
            color
          ),
          projects (
            name
          )
        `)
        .eq('status', 'complete')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (bugs) {
        bugs.forEach((bug: any) => {
          const area = bug.areas_of_life || bug.projects?.areas_of_life;
          if (area) {
            allTasks.push({
              id: bug.id,
              title: bug.title,
              type: 'bug',
              area_name: area.name,
              area_color: area.color,
              project_name: bug.projects?.name || null,
              completed_date: bug.updated_at,
            });
          }
        });
      }

      // Fetch completed features
      const { data: features, error: featuresError } = await supabase
        .from('features')
        .select(`
          id,
          title,
          updated_at,
          area_id,
          project_id,
          areas_of_life!features_area_id_fkey (
            name,
            color
          ),
          projects (
            name
          )
        `)
        .eq('status', 'complete')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (features) {
        features.forEach((feature: any) => {
          const area = feature.areas_of_life || feature.projects?.areas_of_life;
          if (area) {
            allTasks.push({
              id: feature.id,
              title: feature.title,
              type: 'feature',
              area_name: area.name,
              area_color: area.color,
              project_name: feature.projects?.name || null,
              completed_date: feature.updated_at,
            });
          }
        });
      }

      // Sort by completion date
      allTasks.sort((a, b) => new Date(b.completed_date).getTime() - new Date(a.completed_date).getTime());

      setTasks(allTasks.slice(0, 20));
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return '✓';
      case 'feature': return '✨';
      case 'bug': return '🐛';
      default: return '•';
    }
  };

  if (isLoading) {
    return (
      <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 animate-pulse" style={{ borderColor: 'var(--color-border)' }}>
        <div className="h-6 glass rounded w-48 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 glass rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return null; // Don't show card if no completed tasks
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4 sm:mb-6 group"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.15))',
              border: '1.5px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <CheckCircle2 size={18} className="text-green-400 sm:w-5 sm:h-5" strokeWidth={2.5} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Completed Tasks
          </h2>
          <span className="text-xs sm:text-sm px-2 py-1 rounded-lg" style={{ 
            background: 'rgba(34, 197, 94, 0.1)',
            color: 'var(--color-text-secondary)' 
          }}>
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            {isExpanded ? 'Hide' : 'Show'}
          </span>
          {isExpanded ? (
            <ChevronUp size={20} style={{ color: 'var(--color-text-tertiary)' }} className="group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronDown size={20} style={{ color: 'var(--color-text-tertiary)' }} className="group-hover:scale-110 transition-transform" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-2 sm:space-y-3"
        >
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border hover:border-green-400/20 transition-all"
              style={{ 
                borderColor: 'var(--color-border)',
                opacity: 0.7,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs">{getTypeIcon(task.type)}</span>
                    <h3 className="text-sm sm:text-base font-medium line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>
                      {task.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-xs px-2 py-0.5 rounded-lg"
                      style={{ 
                        background: `${task.area_color}20`,
                        color: task.area_color,
                      }}
                    >
                      {task.area_name}
                    </span>
                    {task.project_name && (
                      <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        • {task.project_name}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      • {new Date(task.completed_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <StatusBadge status="complete" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
