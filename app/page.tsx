'use client';

import { useEffect, useState } from 'react';
import { Plus, Calendar, Menu } from 'lucide-react';
import { supabase } from './lib/supabase';
import Link from 'next/link';
import type { AreaOfLife, AreaWithCounts } from './lib/types';
import { AreaCard } from './components/cards/AreaCard';
import { SortableAreaCard } from './components/cards/SortableAreaCard';
import { RunningItemsCard } from './components/cards/RunningItemsCard';
import { RunningProjectsCard } from './components/cards/RunningProjectsCard';
import { TodaysFocusCard } from './components/cards/TodaysFocusCard';
import { RemindersCard } from './components/cards/RemindersCard';
import { TodaysTasksCard } from './components/cards/TodaysTasksCard';
import { TomorrowsTasksCard } from './components/cards/TomorrowsTasksCard';
import { CompletedTasksCard } from './components/cards/CompletedTasksCard';
import { InboxCard } from './components/cards/InboxCard';
import { AddAreaModal } from './components/modals/AddAreaModal';
import { AddDomainModalStandalone } from './components/modals/AddDomainModalStandalone';
import { AddTaskModalStandalone } from './components/modals/AddTaskModalStandalone';
import { EditTaskModal } from './components/modals/EditTaskModal';
import { EditTodaysFocusModal } from './components/modals/EditTodaysFocusModal';
import { EditGoalsModal } from './components/modals/EditGoalsModal';
import { EditAreaGoalsModal } from './components/modals/EditAreaGoalsModal';
import { EditAreaModal } from './components/modals/EditAreaModal';
import { AddReminderModal } from './components/modals/AddReminderModal';
import { EditReminderModal } from './components/modals/EditReminderModal';
import { EmptyState } from './components/ui/EmptyState';
import { ToastContainer, useToast } from './components/ui/Toast';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { MobileMenu } from './components/ui/MobileMenu';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Edit3 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface FocusItem {
  id: string;
  areaId: string;
  areaName: string;
  areaColor: string;
  areaIcon: string;
}

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  created_at: string;
}

export default function HomePage() {
  const [areas, setAreas] = useState<AreaWithCounts[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditFocusModalOpen, setIsEditFocusModalOpen] = useState(false);
  const [isEditAreaGoalsModalOpen, setIsEditAreaGoalsModalOpen] = useState(false);
  const [isEditAreaModalOpen, setIsEditAreaModalOpen] = useState(false);
  const [isAddReminderModalOpen, setIsAddReminderModalOpen] = useState(false);
  const [isEditReminderModalOpen, setIsEditReminderModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reminderDeleteModalOpen, setReminderDeleteModalOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<{ id: string; name: string } | null>(null);
  const [reminderToDelete, setReminderToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [todaysFocus, setTodaysFocus] = useState<FocusItem[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<AreaWithCounts | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Task edit modal state
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string; type: 'task' | 'bug' | 'feature' } | null>(null);
  const [editTaskData, setEditTaskData] = useState<any>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*');

      if (error) throw error;
      
      // Sort reminders: due date ascending (soonest first), nulls last, then by created_at
      const sorted = (data || []).sort((a, b) => {
        // If both have due dates, sort by due date
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        // Reminders with due dates come before those without
        if (a.due_date && !b.due_date) return -1;
        if (!a.due_date && b.due_date) return 1;
        // If neither has due date, sort by created_at (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setReminders(sorted);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const fetchAreas = async () => {
    try {
      setIsLoading(true);
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/8abf4c45-0339-46f9-abf0-cf617fbf166c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:138',message:'fetchAreas started',data:{timestamp:new Date().toISOString()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const { data: areasData, error: areasError } = await supabase
        .from('areas_of_life')
        .select('*')
        .order('sort_order', { ascending: true });

      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/8abf4c45-0339-46f9-abf0-cf617fbf166c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:143',message:'areas query result',data:{hasData:!!areasData,dataCount:areasData?.length||0,error:areasError?.message||null,errorCode:areasError?.code||null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      if (areasError) throw areasError;

      const areasWithCounts = await Promise.all(
        (areasData || []).map(async (area) => {
          // Get project count
          const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('area_id', area.id);

          // Get projects to calculate total items
          const { data: projects } = await supabase
            .from('projects')
            .select('id')
            .eq('area_id', area.id);

          let totalItems = 0;
          if (projects) {
            for (const project of projects) {
              // #region agent log
              fetch('http://127.0.0.1:7245/ingest/8abf4c45-0339-46f9-abf0-cf617fbf166c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:162',message:'fetching items for project',data:{projectId:project.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              const [features, bugs, tasks] = await Promise.all([
                supabase.from('features').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
                supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
                supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('project_id', project.id),
              ]);
              // #region agent log
              fetch('http://127.0.0.1:7245/ingest/8abf4c45-0339-46f9-abf0-cf617fbf166c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:168',message:'items fetched',data:{featuresCount:features.count||0,bugsCount:bugs.count||0,tasksCount:tasks.count||0,featuresError:features.error?.message||null,bugsError:bugs.error?.message||null,tasksError:tasks.error?.message||null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'D'})}).catch(()=>{});
              // #endregion
              totalItems += (features.count || 0) + (bugs.count || 0) + (tasks.count || 0);
            }
          }

          return {
            ...area,
            projectCount: projectCount || 0,
            totalItems,
          };
        })
      );

      setAreas(areasWithCounts);
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/8abf4c45-0339-46f9-abf0-cf617fbf166c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:179',message:'fetchAreas completed',data:{areasCount:areasWithCounts.length,firstArea:areasWithCounts[0]?.name||null},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      console.error('Error fetching areas:', error);
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/8abf4c45-0339-46f9-abf0-cf617fbf166c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'page.tsx:183',message:'fetchAreas ERROR',data:{errorMessage:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      showToast('Failed to load areas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
    fetchReminders();
    loadTodaysFocus();
  }, []);

  const loadTodaysFocus = async () => {
    try {
      const saved = localStorage.getItem('todaysFocus');
      if (saved) {
        setTodaysFocus(JSON.parse(saved));
      } else {
        // Set default focus items: Health, Immigration, Housing (in this order)
        const defaultAreaNames = ['Health', 'Immigration', 'Housing'];
        const { data: defaultAreas, error } = await supabase
          .from('areas_of_life')
          .select('id, name, color, icon')
          .in('name', defaultAreaNames);

        if (!error && defaultAreas && defaultAreas.length > 0) {
          // Sort to maintain the specified order: Health, Immigration, Housing
          const sortedAreas = defaultAreaNames
            .map(name => defaultAreas.find(area => area.name === name))
            .filter(area => area !== undefined);

          const defaultFocusItems: FocusItem[] = sortedAreas.map((area) => ({
            id: `default-${area.id}`,
            areaId: area.id,
            areaName: area.name,
            areaColor: area.color,
            areaIcon: area.icon || '',
          }));

          setTodaysFocus(defaultFocusItems);
          // Save to localStorage
          localStorage.setItem('todaysFocus', JSON.stringify(defaultFocusItems));
        }
      }
    } catch (error) {
      console.error('Error loading today\'s focus:', error);
    }
  };

  const refreshTodaysFocus = async () => {
    try {
      const saved = localStorage.getItem('todaysFocus');
      if (!saved) return;

      const currentFocus: FocusItem[] = JSON.parse(saved);
      const areaIds = currentFocus.map(item => item.areaId);

      // Fetch fresh data from database
      const { data: freshAreas, error } = await supabase
        .from('areas_of_life')
        .select('id, name, color, icon')
        .in('id', areaIds);

      if (!error && freshAreas) {
        // Update focus items with fresh data while maintaining order
        const updatedFocus = currentFocus.map(item => {
          const freshArea = freshAreas.find(a => a.id === item.areaId);
          if (freshArea) {
            return {
              ...item,
              areaName: freshArea.name,
              areaColor: freshArea.color,
              areaIcon: freshArea.icon || '',
            };
          }
          return item;
        });

        setTodaysFocus(updatedFocus);
        localStorage.setItem('todaysFocus', JSON.stringify(updatedFocus));
      }
    } catch (error) {
      console.error('Error refreshing today\'s focus:', error);
    }
  };

  const handleAddSuccess = async () => {
    showToast('Area created successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchAreas();
  };

  const handleAddDomainSuccess = async () => {
    showToast('Project created successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchAreas();
  };

  const handleAddTaskSuccess = async () => {
    showToast('Item created successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchAreas();
  };

  const handleEditFocusSuccess = () => {
    showToast('Today\'s Focus updated!', 'success');
    loadTodaysFocus();
  };

  const handleDeleteClick = (id: string) => {
    const area = areas.find(a => a.id === id);
    if (area) {
      setAreaToDelete({ id: area.id, name: area.name });
      setDeleteModalOpen(true);
    }
  };

  const handleAddProjectFromCard = (areaId: string) => {
    setSelectedAreaId(areaId);
    setIsAddDomainModalOpen(true);
  };

  const handleEditAreaGoals = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    if (area) {
      setSelectedArea(area);
      setIsEditAreaGoalsModalOpen(true);
    }
  };

  const handleEditArea = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    if (area) {
      setSelectedArea(area);
      setIsEditAreaModalOpen(true);
    }
  };

  const handleAreaEditSuccess = async () => {
    showToast('Area updated successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchAreas();
  };

  const handleAreaGoalsSuccess = async () => {
    showToast('Goals updated successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchAreas();
  };

  const handleDeleteConfirm = async () => {
    if (!areaToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('areas_of_life')
        .delete()
        .eq('id', areaToDelete.id);

      if (error) throw error;

      showToast('Area deleted successfully!', 'success');
      setDeleteModalOpen(false);
      setAreaToDelete(null);
      fetchAreas();
    } catch (error) {
      console.error('Error deleting area:', error);
      showToast('Failed to delete area', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = areas.findIndex((area) => area.id === active.id);
    const newIndex = areas.findIndex((area) => area.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Optimistically update UI
    const newAreas = arrayMove(areas, oldIndex, newIndex);
    setAreas(newAreas);

    // Update sort_order in database
    try {
      const updates = newAreas.map((area, index) => ({
        id: area.id,
        sort_order: index,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('areas_of_life')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      showToast('Order updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating order:', error);
      showToast('Failed to update order', 'error');
      // Revert on error
      fetchAreas();
    }
  };

  const handleReminderSuccess = () => {
    fetchReminders();
    showToast('Reminder saved successfully', 'success');
  };

  const handleDeleteReminderClick = (id: string, title: string) => {
    setReminderToDelete({ id, title });
    setReminderDeleteModalOpen(true);
  };

  const handleConfirmReminderDelete = async () => {
    if (!reminderToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderToDelete.id);

      if (error) throw error;

      showToast(`"${reminderToDelete.title}" deleted`, 'success');
      fetchReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      showToast('Failed to delete reminder', 'error');
    } finally {
      setIsDeleting(false);
      setReminderDeleteModalOpen(false);
      setReminderToDelete(null);
    }
  };

  const handleEditReminder = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setIsEditReminderModalOpen(true);
  };

  const handleTaskClick = async (task: any) => {
    try {
      // Fetch full task data
      const tableName = task.type === 'task' ? 'tasks' : task.type === 'bug' ? 'bugs' : 'features';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', task.id)
        .single();

      if (error) throw error;

      if (data) {
        setEditTaskData({
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          commitment_level: data.commitment_level || 'optional',
          due_date: data.due_date,
          do_date: data.do_date,
          severity: data.severity,
          is_recurring: data.is_recurring,
          recurrence_pattern: data.recurrence_pattern,
          recurrence_end_date: data.recurrence_end_date,
        });
        setSelectedTask({ id: task.id, type: task.type });
        setIsEditTaskModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching task data:', error);
      showToast('Failed to load task', 'error');
    }
  };

  const handleEditTaskSuccess = () => {
    setIsEditTaskModalOpen(false);
    setSelectedTask(null);
    setEditTaskData(null);
    showToast('Task updated successfully!', 'success');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-6 sm:py-8 lg:py-12">
          <div className="animate-pulse">
            <div className="h-10 sm:h-12 glass rounded-xl w-full max-w-sm mb-4 sm:mb-6"></div>
            <div className="h-6 sm:h-7 glass rounded-lg w-full max-w-md mb-8 sm:mb-12"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-60 sm:h-72 lg:h-80 glass rounded-3xl min-h-[240px]"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4 sm:py-6 lg:py-8"
        >
          <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-center justify-between">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  Andrea's Project Manager
                </h1>
              </Link>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {/* Hamburger Menu Button - Mobile Only */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden p-2.5 glass glass-hover rounded-xl transition-all"
                  aria-label="Open menu"
                >
                  <Menu size={20} strokeWidth={2.5} style={{ color: 'var(--color-text-primary)' }} />
                </button>
              </div>
            </div>
            {/* Desktop Action Buttons - Hidden on Mobile */}
            <div className="hidden lg:flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href="/focus"
                className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 glass glass-hover rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))',
                  color: 'var(--color-text-primary)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>Focus Mode</span>
              </Link>
              <Link
                href="/map"
                className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 glass glass-hover rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(139, 92, 246, 0.2))',
                  color: 'var(--color-text-primary)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-[18px] sm:h-[18px]">
                  <circle cx="5" cy="5" r="3" />
                  <circle cx="19" cy="5" r="3" />
                  <circle cx="5" cy="19" r="3" />
                  <circle cx="19" cy="19" r="3" />
                  <line x1="8" y1="5" x2="16" y2="5" />
                  <line x1="8" y1="19" x2="16" y2="19" />
                  <line x1="5" y1="8" x2="5" y2="16" />
                  <line x1="19" y1="8" x2="19" y2="16" />
                </svg>
                <span>Map View</span>
              </Link>
              <Link
                href="/calendar"
                className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 glass glass-hover rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                  color: 'var(--color-text-primary)'
                }}
              >
                <Calendar size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                <span>Calendar</span>
              </Link>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 glass glass-hover rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Plus size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                <span>Area</span>
              </button>
              <button
                onClick={() => setIsAddDomainModalOpen(true)}
                className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 glass glass-hover rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Plus size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                <span>Project</span>
              </button>
              <button 
                onClick={() => setIsAddTaskModalOpen(true)}
                className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 glass glass-hover rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Plus size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                <span>Item</span>
              </button>
              <button 
                onClick={() => setIsEditFocusModalOpen(true)}
                className="px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 glass glass-hover rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Edit3 size={16} strokeWidth={2} className="sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Edit Focus</span>
                <span className="sm:hidden">Focus</span>
              </button>
            </div>
          </div>
        </motion.header>

        {/* Today's Focus Card */}
        <TodaysFocusCard
          todaysFocus={todaysFocus}
          onEditFocus={() => setIsEditFocusModalOpen(true)}
        />

        {/* Inbox Quick Capture Card */}
        <InboxCard />

        {/* Important Reminders Card */}
        <RemindersCard
          reminders={reminders}
          onAddReminder={() => setIsAddReminderModalOpen(true)}
          onEditReminder={handleEditReminder}
          onDeleteReminder={handleDeleteReminderClick}
        />

        {/* Today's Tasks Card */}
        <TodaysTasksCard onTaskClick={handleTaskClick} />

        {/* Tomorrow's Tasks Card */}
        <TomorrowsTasksCard onTaskClick={handleTaskClick} />

        {/* Running Items Card */}
        <RunningItemsCard />

        {/* Spacer for breathing room */}
        <div className="h-8 sm:h-10 lg:h-12"></div>

        {/* Areas Grid */}
        {areas.length === 0 ? (
          <EmptyState
            title="No areas yet"
            description="Create your first area to start organizing your projects."
            action={
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                <Plus size={20} />
                <span>Create Your First Area</span>
              </button>
            }
          />
        ) : (
          <>
            {/* Responsive Layout: Two columns on XL+, Single column on mobile/tablet */}
            <div className="flex flex-col xl:flex-row gap-6 sm:gap-8 items-start">
              {/* Left Column - Areas Grid */}
              <div className="flex-1 w-full">
                {/* All Areas Header */}
                <motion.h2 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl sm:text-3xl font-bold tracking-tight mb-6 sm:mb-8" 
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  All Areas
                </motion.h2>
                
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={areas.map(area => area.id)}
                    strategy={rectSortingStrategy}
                  >
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                    >
                      {areas.map((area, index) => (
                        <motion.div
                          key={area.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <SortableAreaCard 
                            area={area} 
                            onDelete={handleDeleteClick}
                            onAddProject={handleAddProjectFromCard}
                            onEditGoals={handleEditAreaGoals}
                            onEdit={handleEditArea}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Right Column - Running Items (XL+ sidebar, mobile full-width) */}
              <div className="w-full xl:w-[400px] space-y-4 sm:space-y-6">
                {/* Running Projects Card */}
                <RunningProjectsCard />

                {/* Completed Tasks */}
                <CompletedTasksCard />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <AddAreaModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      <AddDomainModalStandalone
        isOpen={isAddDomainModalOpen}
        onClose={() => {
          setIsAddDomainModalOpen(false);
          setSelectedAreaId('');
        }}
        onSuccess={handleAddDomainSuccess}
        preselectedAreaId={selectedAreaId}
      />

      <AddTaskModalStandalone
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSuccess={handleAddTaskSuccess}
      />

      <EditTodaysFocusModal
        isOpen={isEditFocusModalOpen}
        onClose={() => setIsEditFocusModalOpen(false)}
        onSuccess={handleEditFocusSuccess}
        currentFocus={todaysFocus}
      />

      <EditAreaGoalsModal
        isOpen={isEditAreaGoalsModalOpen}
        onClose={() => {
          setIsEditAreaGoalsModalOpen(false);
          setSelectedArea(null);
        }}
        onSuccess={handleAreaGoalsSuccess}
        areaId={selectedArea?.id || ''}
        areaName={selectedArea?.name || ''}
        currentGoals={selectedArea?.goals || []}
      />

      {selectedArea && (
        <EditAreaModal
          isOpen={isEditAreaModalOpen}
          onClose={() => {
            setIsEditAreaModalOpen(false);
            setSelectedArea(null);
          }}
          onSuccess={handleAreaEditSuccess}
          area={selectedArea}
        />
      )}

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAreaToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Area"
        message={`Are you sure you want to delete "${areaToDelete?.name}"? This will also delete all domains, projects, and items within this area. This action cannot be undone.`}
      />

      <DeleteConfirmModal
        isOpen={reminderDeleteModalOpen}
        onClose={() => {
          setReminderDeleteModalOpen(false);
          setReminderToDelete(null);
        }}
        onConfirm={handleConfirmReminderDelete}
        isDeleting={isDeleting}
        title="Delete Reminder"
        message={`Are you sure you want to delete "${reminderToDelete?.title}"? This action cannot be undone.`}
      />

      <AddReminderModal
        isOpen={isAddReminderModalOpen}
        onClose={() => setIsAddReminderModalOpen(false)}
        onSuccess={handleReminderSuccess}
      />

      {selectedReminder && (
        <EditReminderModal
          isOpen={isEditReminderModalOpen}
          onClose={() => {
            setIsEditReminderModalOpen(false);
            setSelectedReminder(null);
          }}
          onSuccess={handleReminderSuccess}
          reminder={selectedReminder}
        />
      )}

      {/* Edit Task Modal */}
      {selectedTask && editTaskData && (
        <EditTaskModal
          isOpen={isEditTaskModalOpen}
          onClose={() => {
            setIsEditTaskModalOpen(false);
            setSelectedTask(null);
            setEditTaskData(null);
          }}
          onSuccess={handleEditTaskSuccess}
          taskId={selectedTask.id}
          taskType={selectedTask.type}
          initialData={editTaskData}
        />
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onNewArea={() => setIsAddModalOpen(true)}
        onNewProject={() => setIsAddDomainModalOpen(true)}
        onNewItem={() => setIsAddTaskModalOpen(true)}
        onEditFocus={() => setIsEditFocusModalOpen(true)}
      />
    </div>
  );
}
