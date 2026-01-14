'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Target, Filter, CheckCircle2, AlertCircle, Sparkles, Repeat, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import type { AreaOfLife, Project, ProjectWithCounts, ItemStatus, Task, Bug, Feature, ItemUnion } from '@/app/lib/types';
import { DomainCard } from '@/app/components/cards/DomainCard';
import { AddDomainModal } from '@/app/components/modals/AddDomainModal';
import { EditDomainModal } from '@/app/components/modals/EditDomainModal';
import { EditTaskModal } from '@/app/components/modals/EditTaskModal';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { LoadingGrid } from '@/app/components/ui/LoadingCard';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { ToastContainer, useToast } from '@/app/components/ui/Toast';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';
import { StatusBadge } from '@/app/components/badges/StatusBadge';
import { PriorityBadge } from '@/app/components/badges/PriorityBadge';
import { CommitmentBadge } from '@/app/components/badges/CommitmentBadge';
import { SeverityBadge } from '@/app/components/badges/SeverityBadge';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { EditGoalsModal } from '@/app/components/modals/EditGoalsModal';
import { EditAreaGoalsModal } from '@/app/components/modals/EditAreaGoalsModal';
import { AddTaskModalStandalone } from '@/app/components/modals/AddTaskModalStandalone';
import { DeleteConfirmModal } from '@/app/components/modals/DeleteConfirmModal';

export default function DomainsPage() {
  const params = useParams();
  const router = useRouter();
  const areaId = params.areaId as string;

  const [area, setArea] = useState<AreaOfLife | null>(null);
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithCounts[]>([]);
  const [areaItems, setAreaItems] = useState<ItemUnion[]>([]);
  const [projectItems, setProjectItems] = useState<Map<string, { projectName: string; items: ItemUnion[] }>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditGoalsModalOpen, setIsEditGoalsModalOpen] = useState(false);
  const [isEditAreaGoalsModalOpen, setIsEditAreaGoalsModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithCounts | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemUnion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | ItemStatus>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'name' | 'status'>('created_at');
  const { toasts, showToast, removeToast } = useToast();

  const fetchData = async () => {
    try{
      setIsLoading(true);

      // Fetch area
      const { data: areaData, error: areaError } = await supabase
        .from('areas_of_life')
        .select('*')
        .eq('id', areaId)
        .single();

      if (areaError) throw areaError;
      setArea(areaData);

      // Fetch projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('area_id', areaId)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch counts for each project
      const projectsWithCounts = await Promise.all(
        (projectsData || []).map(async (project) => {
          // Get task count (all item types)
          const [features, bugs, tasks] = await Promise.all([
            supabase
              .from('features')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id),
            supabase
              .from('bugs')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id),
            supabase
              .from('tasks')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id),
          ]);

          const totalTasks = (features.count || 0) + (bugs.count || 0) + (tasks.count || 0);

          // Get active items (not complete or dismissed)
          const [activeFeat, activeBugs, activeTasks] = await Promise.all([
            supabase
              .from('features')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id)
              .not('status', 'in', '(complete,dismissed)'),
            supabase
              .from('bugs')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id)
              .not('status', 'in', '(complete,dismissed)'),
            supabase
              .from('tasks')
              .select('*', { count: 'exact', head: true })
              .eq('project_id', project.id)
              .not('status', 'in', '(complete,dismissed)'),
          ]);

          const activeItems = (activeFeat.count || 0) + (activeBugs.count || 0) + (activeTasks.count || 0);

          return {
            ...project,
            goals: project.goals || [], // Ensure goals is always an array
            taskCount: totalTasks,
            activeItems,
          };
        })
      );

      setProjects(projectsWithCounts);

      // Fetch area-level items (tasks without a project_id)
      const [areaTasksData, areaBugsData, areaFeaturesData] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('area_id', areaId)
          .is('project_id', null)
          .neq('status', 'complete')
          .neq('status', 'dismissed')
          .order('created_at', { ascending: false }),
        supabase
          .from('bugs')
          .select('*')
          .eq('area_id', areaId)
          .is('project_id', null)
          .neq('status', 'complete')
          .neq('status', 'dismissed')
          .order('created_at', { ascending: false }),
        supabase
          .from('features')
          .select('*')
          .eq('area_id', areaId)
          .is('project_id', null)
          .neq('status', 'complete')
          .neq('status', 'dismissed')
          .order('created_at', { ascending: false }),
      ]);

      // Combine all items with type annotation
      const allAreaItems: ItemUnion[] = [
        ...(areaTasksData.data || []).map(task => ({ ...task, item_type: 'task' as const })),
        ...(areaBugsData.data || []).map(bug => ({ ...bug, item_type: 'bug' as const })),
        ...(areaFeaturesData.data || []).map(feature => ({ ...feature, item_type: 'feature' as const })),
      ];

      // Sort by created_at
      allAreaItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAreaItems(allAreaItems);

      // Fetch project-level items (tasks with a project_id)
      const [projectTasksData, projectBugsData, projectFeaturesData] = await Promise.all([
        supabase
          .from('tasks')
          .select(`
            *,
            projects(id, name)
          `)
          .eq('area_id', areaId)
          .not('project_id', 'is', null)
          .neq('status', 'complete')
          .neq('status', 'dismissed')
          .order('created_at', { ascending: false }),
        supabase
          .from('bugs')
          .select(`
            *,
            projects(id, name)
          `)
          .eq('area_id', areaId)
          .not('project_id', 'is', null)
          .neq('status', 'complete')
          .neq('status', 'dismissed')
          .order('created_at', { ascending: false }),
        supabase
          .from('features')
          .select(`
            *,
            projects(id, name)
          `)
          .eq('area_id', areaId)
          .not('project_id', 'is', null)
          .neq('status', 'complete')
          .neq('status', 'dismissed')
          .order('created_at', { ascending: false }),
      ]);

      // Group items by project
      const itemsByProject = new Map<string, { projectName: string; items: ItemUnion[] }>();
      
      const allProjectItems = [
        ...(projectTasksData.data || []).map((task: any) => ({ ...task, item_type: 'task' as const, projectName: task.projects?.name })),
        ...(projectBugsData.data || []).map((bug: any) => ({ ...bug, item_type: 'bug' as const, projectName: bug.projects?.name })),
        ...(projectFeaturesData.data || []).map((feature: any) => ({ ...feature, item_type: 'feature' as const, projectName: feature.projects?.name })),
      ];

      allProjectItems.forEach((item: any) => {
        if (item.project_id && item.projectName) {
          if (!itemsByProject.has(item.project_id)) {
            itemsByProject.set(item.project_id, {
              projectName: item.projectName,
              items: [],
            });
          }
          itemsByProject.get(item.project_id)!.items.push(item);
        }
      });

      setProjectItems(itemsByProject);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load domains', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [areaId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [projects, filterStatus, sortBy]);

  const applyFiltersAndSort = () => {
    let filtered = [...projects];

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(d => d.status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredProjects(filtered);
  };

  const handleAddSuccess = async () => {
    showToast('Project created successfully!', 'success');
    // Small delay to ensure database transaction completes
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchData();
  };

  const handleEditClick = (project: ProjectWithCounts) => {
    setSelectedProject(project);
    setIsEditModalOpen(true);
  };

  const handleEditGoalsClick = (project: ProjectWithCounts) => {
    setSelectedProject(project);
    setIsEditGoalsModalOpen(true);
  };

  const handleDeleteClick = (project: ProjectWithCounts) => {
    setSelectedProject(project);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProject) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', selectedProject.id);

      if (error) throw error;

      showToast('Project deleted successfully!', 'success');
      setIsDeleteModalOpen(false);
      setSelectedProject(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
      showToast('Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = async () => {
    showToast('Project updated successfully!', 'success');
    // Small delay to ensure database transaction completes
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchData();
  };

  const handleGoalsSuccess = async () => {
    showToast('Goals updated successfully!', 'success');
    // Small delay to ensure database transaction completes
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchData();
  };

  const handleAreaGoalsSuccess = async () => {
    showToast('Area goals updated successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchData();
  };

  const handleAddTaskSuccess = async () => {
    showToast('Task created successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchData();
  };

  const handleEditItem = (item: ItemUnion) => {
    setSelectedItem(item);
    setIsEditTaskModalOpen(true);
  };

  const handleDeleteItem = (item: ItemUnion) => {
    setSelectedItem(item);
    setIsDeleteItemModalOpen(true);
  };

  const handleDeleteItemConfirm = async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      const tableName = selectedItem.item_type === 'task' ? 'tasks' : selectedItem.item_type === 'bug' ? 'bugs' : 'features';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', selectedItem.id);

      if (error) throw error;

      showToast('Item deleted successfully!', 'success');
      setIsDeleteItemModalOpen(false);
      setSelectedItem(null);
      await fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('Failed to delete item', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditItemSuccess = async () => {
    showToast('Item updated successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <LoadingGrid count={3} />
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <EmptyState title="Area not found" description="The area you're looking for doesn't exist." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="max-w-[1600px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Areas', href: '/' },
            { label: area.name },
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
                onClick={() => router.push('/')}
                className="p-3 glass glass-hover rounded-2xl transition-all"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <ArrowLeft size={20} strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {area.name}
                </h1>
                <p className="text-lg font-light flex gap-4" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
                  {areaItems.length > 0 && (
                    <span>• {areaItems.length} area {areaItems.length === 1 ? 'task' : 'tasks'}</span>
                  )}
                </p>
              </div>
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
                onClick={() => setIsEditAreaGoalsModalOpen(true)}
                className="px-4 py-2 glass glass-hover rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Target size={16} />
                Edit Goals
              </button>
              <button
                onClick={() => setIsAddTaskModalOpen(true)}
                className="px-4 py-2 glass glass-hover rounded-xl text-sm font-medium transition-all flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Plus size={16} strokeWidth={2.5} />
                New Task
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-5 py-3 glass glass-hover rounded-2xl text-sm font-medium transition-all flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>New Project</span>
              </button>
              <ThemeToggle />
            </div>
          </div>
        </motion.div>

        {/* Area Goals Section */}
        {area.goals && area.goals.length > 0 ? (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="glass rounded-3xl p-8 border-2" style={{ borderColor: 'rgba(155, 110, 255, 0.25)' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Target size={20} style={{ color: area.color || '#8B5CF6' }} />
                  Area Goals
                </h2>
                <button
                  onClick={() => setIsEditAreaGoalsModalOpen(true)}
                  className="px-4 py-2 glass glass-hover rounded-xl text-sm font-medium transition-all"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Edit Goals
                </button>
              </div>
              <div className="space-y-3">
                {area.goals.map((goal, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: `${area.color || '#8B5CF6'}25`,
                        border: `1.5px solid ${area.color || '#8B5CF6'}35`,
                      }}
                    >
                      <span className="text-sm font-bold" style={{ color: area.color || '#8B5CF6' }}>
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-base font-light flex-1 pt-1" style={{ color: 'var(--color-text-primary)' }}>
                      {goal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="glass rounded-3xl p-8 border-2" style={{ borderColor: 'rgba(155, 110, 255, 0.25)' }}>
              <div className="flex flex-col items-center text-center py-6">
                <Target size={40} className="mb-3" style={{ color: area?.color || '#8B5CF6', opacity: 0.5 }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  No goals set yet
                </h3>
                <p className="text-sm mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                  Define up to 3 goals to guide your work in this area
                </p>
                <button
                  onClick={() => setIsEditAreaGoalsModalOpen(true)}
                  className="px-5 py-3 glass glass-hover rounded-2xl text-sm font-medium transition-all flex items-center gap-2"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Set Goals
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-5 glass rounded-2xl"
          >
            <div className="grid grid-cols-2 gap-4">
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
                  <option value="name">Name</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Area-Level Items Section */}
        {areaItems.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h2 className="text-xl font-bold tracking-tight mb-5 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
              <CheckCircle2 size={20} style={{ color: area?.color || '#8B5CF6' }} />
              All Area Items ({areaItems.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {areaItems.map((item, index) => (
                <motion.div
                  key={`${item.item_type}-${item.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl p-5 border transition-all hover:shadow-lg relative group"
                  style={{ 
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {/* Action buttons - visible on hover */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditItem(item)}
                      className="p-2 glass glass-hover rounded-lg transition-all"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item)}
                      className="p-2 glass glass-hover rounded-lg transition-all text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {item.item_type === 'task' && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1.5px solid rgba(59, 130, 246, 0.3)',
                        }}>
                          <CheckCircle2 size={16} style={{ color: '#3B82F6' }} />
                        </div>
                      )}
                      {item.item_type === 'bug' && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1.5px solid rgba(239, 68, 68, 0.3)',
                        }}>
                          <AlertCircle size={16} style={{ color: '#EF4444' }} />
                        </div>
                      )}
                      {item.item_type === 'feature' && (
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1.5px solid rgba(16, 185, 129, 0.3)',
                        }}>
                          <Sparkles size={16} style={{ color: '#10B981' }} />
                        </div>
                      )}
                      <span className="text-xs font-medium uppercase tracking-wider" style={{ 
                        color: item.item_type === 'task' ? '#3B82F6' : item.item_type === 'bug' ? '#EF4444' : '#10B981' 
                      }}>
                        {item.item_type}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={item.status} />
                    <PriorityBadge priority={item.priority} />
                    {item.item_type === 'task' && item.commitment_level && (
                      <CommitmentBadge commitmentLevel={item.commitment_level} />
                    )}
                    {item.item_type === 'bug' && 'severity' in item && (
                      <SeverityBadge severity={item.severity} />
                    )}
                    {item.is_recurring && (
                      <div className="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1" style={{
                        background: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        color: '#A78BFA',
                      }}>
                        <Repeat size={12} />
                        {item.recurrence_pattern}
                      </div>
                    )}
                  </div>

                  {(item.due_date || item.do_date) && (
                    <div className="mt-3 pt-3 border-t flex gap-3 text-xs" style={{ borderColor: 'var(--color-border)' }}>
                      {item.do_date && (
                        <div>
                          <span style={{ color: 'var(--color-text-tertiary)' }}>Do: </span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            {new Date(item.do_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {item.due_date && (
                        <div>
                          <span style={{ color: 'var(--color-text-tertiary)' }}>Due: </span>
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            {new Date(item.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Items Grouped by Project */}
        {projectItems.size > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 space-y-8"
          >
            {Array.from(projectItems.entries()).map(([projectId, { projectName, items }], projectIndex) => (
              <div key={projectId}>
                <h2 className="text-xl font-bold tracking-tight mb-5 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                  <Sparkles size={20} style={{ color: area?.color || '#8B5CF6' }} />
                  {projectName} ({items.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.item_type}-${item.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="glass rounded-2xl p-5 border transition-all hover:shadow-lg cursor-pointer"
                      style={{ 
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {item.item_type === 'task' && (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                              background: 'rgba(59, 130, 246, 0.15)',
                              border: '1.5px solid rgba(59, 130, 246, 0.3)',
                            }}>
                              <CheckCircle2 size={16} style={{ color: '#3B82F6' }} />
                            </div>
                          )}
                          {item.item_type === 'bug' && (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                              background: 'rgba(239, 68, 68, 0.15)',
                              border: '1.5px solid rgba(239, 68, 68, 0.3)',
                            }}>
                              <AlertCircle size={16} style={{ color: '#EF4444' }} />
                            </div>
                          )}
                          {item.item_type === 'feature' && (
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ 
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1.5px solid rgba(16, 185, 129, 0.3)',
                            }}>
                              <Sparkles size={16} style={{ color: '#10B981' }} />
                            </div>
                          )}
                          <span className="text-xs font-medium uppercase tracking-wider" style={{ 
                            color: item.item_type === 'task' ? '#3B82F6' : item.item_type === 'bug' ? '#EF4444' : '#10B981' 
                          }}>
                            {item.item_type}
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        {item.title}
                      </h3>
                      
                      {item.description && (
                        <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={item.status} />
                        <PriorityBadge priority={item.priority} />
                        {item.item_type === 'task' && item.commitment_level && (
                          <CommitmentBadge commitmentLevel={item.commitment_level} />
                        )}
                        {item.item_type === 'bug' && 'severity' in item && (
                          <SeverityBadge severity={item.severity} />
                        )}
                        {item.is_recurring && (
                          <div className="px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1" style={{
                            background: 'rgba(139, 92, 246, 0.15)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            color: '#A78BFA',
                          }}>
                            <Repeat size={12} />
                            {item.recurrence_pattern}
                          </div>
                        )}
                      </div>

                      {(item.due_date || item.do_date) && (
                        <div className="mt-3 pt-3 border-t flex gap-3 text-xs" style={{ borderColor: 'var(--color-border)' }}>
                          {item.do_date && (
                            <div>
                              <span style={{ color: 'var(--color-text-tertiary)' }}>Do: </span>
                              <span style={{ color: 'var(--color-text-secondary)' }}>
                                {new Date(item.do_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {item.due_date && (
                            <div>
                              <span style={{ color: 'var(--color-text-tertiary)' }}>Due: </span>
                              <span style={{ color: 'var(--color-text-secondary)' }}>
                                {new Date(item.due_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>
        )}

        {/* Projects Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold tracking-tight mb-5 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
            All Projects ({projects.length})
          </h2>
          
        {filteredProjects.length === 0 ? (
          projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start organizing work."
              action={
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-3 px-6 py-4 glass glass-hover rounded-2xl font-medium transition-all"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(123, 159, 255, 0.8), rgba(155, 110, 255, 0.8))',
                  color: 'white',
                }}
              >
              <Plus size={20} strokeWidth={2.5} />
              <span>Create Your First Project</span>
            </button>
          }
        />
          ) : (
            <EmptyState
              title="No matching projects"
              description="Try adjusting your filters to see more results."
            />
          )
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DomainCard 
                  domain={project} 
                  areaId={areaId} 
                  onEdit={handleEditClick}
                  onEditGoals={handleEditGoalsClick}
                  onDelete={handleDeleteClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
        </motion.section>
      </div>

      {/* Add Domain Modal */}
      <AddDomainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        areaId={areaId}
      />

      {/* Edit Domain Modal */}
      <EditDomainModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        onSuccess={handleEditSuccess}
        domain={selectedProject}
      />

      {/* Edit Goals Modal */}
      <EditGoalsModal
        isOpen={isEditGoalsModalOpen}
        onClose={() => {
          setIsEditGoalsModalOpen(false);
          setSelectedProject(null);
        }}
        onSuccess={handleGoalsSuccess}
        domainId={selectedProject?.id || ''}
        domainName={selectedProject?.name || ''}
        currentGoals={selectedProject?.goals || []}
      />

      {/* Delete Project Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Project"
        message={`Are you sure you want to delete "${selectedProject?.name}"? This will also delete all tasks, bugs, and features within this project. This action cannot be undone.`}
      />

      {/* Edit Area Goals Modal */}
      <EditAreaGoalsModal
        isOpen={isEditAreaGoalsModalOpen}
        onClose={() => setIsEditAreaGoalsModalOpen(false)}
        onSuccess={handleAreaGoalsSuccess}
        areaId={areaId}
        areaName={area?.name || ''}
        currentGoals={area?.goals || []}
      />

      {/* Add Task Modal */}
      <AddTaskModalStandalone
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSuccess={handleAddTaskSuccess}
        preselectedAreaId={areaId}
      />

      {/* Edit Task Modal */}
      {selectedItem && (
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setSelectedItem(null);
          }}
          onSuccess={handleEditItemSuccess}
          taskId={selectedItem.id}
          taskType={selectedItem.item_type}
          initialData={{
            title: selectedItem.title,
            description: selectedItem.description || undefined,
            status: selectedItem.status as any,
            priority: selectedItem.priority as any,
            commitment_level: selectedItem.commitment_level,
            severity: (selectedItem as any).severity,
            is_recurring: selectedItem.is_recurring,
            recurrence_pattern: selectedItem.recurrence_pattern as any,
            recurrence_end_date: selectedItem.recurrence_end_date,
          }}
        />
      )}

      {/* Delete Item Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteItemModalOpen}
        onClose={() => {
          setIsDeleteItemModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDeleteItemConfirm}
        isDeleting={isDeleting}
        title="Delete Item"
        message={`Are you sure you want to delete "${selectedItem?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
