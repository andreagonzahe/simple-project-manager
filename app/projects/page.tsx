'use client';

import { useEffect, useState, useMemo } from 'react';
import { FolderKanban, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';
import { StatusBadge } from '@/app/components/badges/StatusBadge';

interface ProjectWithArea {
  id: string;
  name: string;
  description?: string;
  color: string;
  status: string;
  area_id: string;
  area_name: string;
  area_color: string;
  task_count: number;
  created_at?: string;
}

interface Area {
  id: string;
  name: string;
  color: string;
}

type SortOption = 'name' | 'created' | 'status' | 'area' | 'items';
type FilterStatus = 'all' | 'backlog' | 'in_progress' | 'completed';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithArea[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('created');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterArea, setFilterArea] = useState<string>('all');

  useEffect(() => {
    fetchProjects();
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas_of_life')
        .select('id, name, color')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          color,
          status,
          area_id,
          created_at,
          areas_of_life(
            id,
            name,
            color
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithCounts = await Promise.all(
        (data || []).map(async (project: any) => {
          const [features, bugs, tasks] = await Promise.all([
            supabase.from('features').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
            supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
            supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
          ]);

          return {
            id: project.id,
            name: project.name,
            description: project.description,
            color: project.color,
            status: project.status,
            area_id: project.area_id,
            area_name: project.areas_of_life.name,
            area_color: project.areas_of_life.color,
            task_count: (features.count || 0) + (bugs.count || 0) + (tasks.count || 0),
            created_at: project.created_at,
          };
        })
      );

      setProjects(projectsWithCounts);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    // Apply filters
    if (filterStatus !== 'all') {
      result = result.filter(p => p.status === filterStatus);
    }

    if (filterArea !== 'all') {
      result = result.filter(p => p.area_id === filterArea);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'status':
          const statusOrder = { 'in_progress': 0, 'backlog': 1, 'completed': 2 };
          return (statusOrder[a.status as keyof typeof statusOrder] || 3) - 
                 (statusOrder[b.status as keyof typeof statusOrder] || 3);
        case 'area':
          return a.area_name.localeCompare(b.area_name);
        case 'items':
          return b.task_count - a.task_count;
        default:
          return 0;
      }
    });

    return result;
  }, [projects, filterStatus, filterArea, sortBy]);

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
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.15))',
                  border: '1.5px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                <FolderKanban size={24} className="text-purple-400" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  📁 All Projects ✨
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {filteredAndSortedProjects.length} of {projects.length} {projects.length === 1 ? 'project' : 'projects'}
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter & Sort Controls */}
        <div className="mb-6 glass rounded-2xl p-4 border" style={{ borderColor: 'var(--color-border)' }}>
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
                <option value="created">Newest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="status">Status</option>
                <option value="area">Area</option>
                <option value="items">Most Items</option>
              </select>
              <ChevronDown 
                size={16} 
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            </div>

            {/* Active Filter Count */}
            {(filterStatus !== 'all' || filterArea !== 'all') && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
                  {[filterStatus !== 'all' ? 1 : 0, filterArea !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)} active filter(s)
                </span>
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterArea('all');
                  }}
                  className="text-xs px-2 py-1 rounded-lg hover:opacity-80 transition-opacity"
                  style={{
                    background: 'var(--color-accent)',
                    color: '#fff',
                  }}
                >
                  Clear All
                </button>
              </div>
            )}
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
                <div className="pt-4 mt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ borderColor: 'var(--color-border)' }}>
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                      Status
                    </label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                      className="w-full px-3 py-2 rounded-xl text-sm font-medium cursor-pointer"
                      style={{
                        background: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-primary)',
                        border: '1.5px solid var(--color-border)',
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="in_progress">In Progress</option>
                      <option value="backlog">Backlog</option>
                      <option value="completed">Completed</option>
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse h-48"></div>
            ))}
          </div>
        ) : filteredAndSortedProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              {projects.length === 0 
                ? 'No projects yet. Create your first project!' 
                : 'No projects match your filters.'}
            </p>
            {projects.length > 0 && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterArea('all');
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/projects/${project.area_id}/${project.id}`}>
                  <div
                    className="glass rounded-2xl p-6 border-2 hover:scale-105 transition-all cursor-pointer"
                    style={{ borderColor: `${project.color}30` }}
                  >
                    {/* Area Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: `${project.area_color}20`,
                          color: project.area_color,
                          border: `1px solid ${project.area_color}40`,
                        }}
                      >
                        {project.area_name}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                      {project.name}
                    </h3>
                    
                    {project.description && (
                      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <StatusBadge status={project.status as any} />
                      <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        <span className="font-semibold">{project.task_count}</span> items
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
