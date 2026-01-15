'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/app/lib/supabase';
import { Folder, ChevronRight } from 'lucide-react';
import { StatusBadge } from '../badges/StatusBadge';
import type { ItemStatus } from '@/app/lib/types';
import Link from 'next/link';

interface RunningProject {
  id: string;
  name: string;
  description?: string;
  status: ItemStatus;
  color: string;
  area_id: string;
  area_name: string;
  area_color: string;
  created_at: string;
  taskCount: number;
  activeItems: number;
}

type SortOption = 'created_at' | 'name' | 'status' | 'area';

export function RunningProjectsCard() {
  const [projects, setProjects] = useState<RunningProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<RunningProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('created_at');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    applySort();
  }, [projects, sortBy]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);

      // Fetch active projects (not complete or dismissed)
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          status,
          color,
          area_id,
          created_at,
          areas_of_life(
            id,
            name,
            color
          )
        `)
        .not('status', 'in', '(completed)')
        .order('created_at', { ascending: false });

      if (projectsData) {
        // Fetch task counts for each project
        const projectsWithCounts = await Promise.all(
          projectsData.map(async (project: any) => {
            const [tasks, bugs, features] = await Promise.all([
              supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', project.id),
              supabase
                .from('bugs')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', project.id),
              supabase
                .from('features')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', project.id),
            ]);

            const totalTasks = (tasks.count || 0) + (bugs.count || 0) + (features.count || 0);

            // Get active items
            const [activeTasks, activeBugs, activeFeatures] = await Promise.all([
              supabase
                .from('tasks')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', project.id)
                .not('status', 'in', '(completed)'),
              supabase
                .from('bugs')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', project.id)
                .not('status', 'in', '(completed)'),
              supabase
                .from('features')
                .select('*', { count: 'exact', head: true })
                .eq('project_id', project.id)
                .not('status', 'in', '(completed)'),
            ]);

            const activeItems = (activeTasks.count || 0) + (activeBugs.count || 0) + (activeFeatures.count || 0);

            return {
              id: project.id,
              name: project.name,
              description: project.description,
              status: project.status,
              color: project.color,
              area_id: project.area_id,
              area_name: project.areas_of_life?.name || 'Unknown',
              area_color: project.areas_of_life?.color || '#8B5CF6',
              created_at: project.created_at,
              taskCount: totalTasks,
              activeItems: activeItems,
            };
          })
        );

        setProjects(projectsWithCounts);
      }
    } catch (error) {
      console.error('Error fetching running projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySort = () => {
    let sorted = [...projects];

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'area':
          return a.area_name.localeCompare(b.area_name);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredProjects(sorted);
  };

  return (
    <div className="glass rounded-3xl p-8 border-2 h-fit" style={{ borderColor: 'var(--color-border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ 
              background: 'rgba(123, 159, 255, 0.15)',
              border: '1.5px solid rgba(123, 159, 255, 0.3)',
            }}
          >
            <Folder size={24} strokeWidth={2.5} style={{ color: '#7B9FFF' }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
              Running Projects
            </h2>
            <p className="text-sm font-light" style={{ color: 'var(--color-text-tertiary)' }}>
              {filteredProjects.length} active {filteredProjects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          SORT BY
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-sm"
          style={{ 
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <option value="created_at">Created Date</option>
          <option value="name">Name</option>
          <option value="status">Status</option>
          <option value="area">Area</option>
        </select>
      </div>

      {/* Projects List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 glass rounded-2xl"></div>
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <Folder size={48} className="mx-auto mb-4 opacity-30" style={{ color: 'var(--color-text-tertiary)' }} />
          <p className="text-base font-light" style={{ color: 'var(--color-text-secondary)' }}>
            No active projects
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/projects/${project.area_id}/${project.id}`}>
                <div 
                  className="glass glass-hover rounded-2xl p-4 group cursor-pointer transition-all"
                  style={{ borderLeft: `3px solid ${project.color}` }}
                >
                  {/* Project Info */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold mb-1 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                        {project.name}
                        <ChevronRight 
                          size={16} 
                          className="opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" 
                          style={{ color: 'var(--color-text-tertiary)' }}
                        />
                      </h3>
                      {project.description && (
                        <p className="text-sm line-clamp-1 mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge status={project.status} />
                        <div 
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ 
                            background: `${project.area_color}20`,
                            color: project.area_color,
                          }}
                        >
                          {project.area_name}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: project.color }}></span>
                      <span>{project.taskCount} tasks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400/50"></span>
                      <span>{project.activeItems} active</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
