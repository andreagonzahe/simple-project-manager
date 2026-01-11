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
import { AddAreaModal } from './components/modals/AddAreaModal';
import { AddDomainModalStandalone } from './components/modals/AddDomainModalStandalone';
import { AddTaskModalStandalone } from './components/modals/AddTaskModalStandalone';
import { EditTodaysFocusModal } from './components/modals/EditTodaysFocusModal';
import { EditGoalsModal } from './components/modals/EditGoalsModal';
import { EditAreaGoalsModal } from './components/modals/EditAreaGoalsModal';
import { EditAreaModal } from './components/modals/EditAreaModal';
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

export default function HomePage() {
  const [areas, setAreas] = useState<AreaWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddDomainModalOpen, setIsAddDomainModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditFocusModalOpen, setIsEditFocusModalOpen] = useState(false);
  const [isEditAreaGoalsModalOpen, setIsEditAreaGoalsModalOpen] = useState(false);
  const [isEditAreaModalOpen, setIsEditAreaModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [todaysFocus, setTodaysFocus] = useState<FocusItem[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<AreaWithCounts | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

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

  const fetchAreas = async () => {
    try {
      setIsLoading(true);
      const { data: areasData, error: areasError } = await supabase
        .from('areas_of_life')
        .select('*')
        .order('sort_order', { ascending: true });

      if (areasError) throw areasError;

      const areasWithCounts = await Promise.all(
        (areasData || []).map(async (area) => {
          // Get domain count
          const { count: domainCount } = await supabase
            .from('domains')
            .select('*', { count: 'exact', head: true })
            .eq('area_id', area.id);

          // Get domains to calculate total items
          const { data: domains } = await supabase
            .from('domains')
            .select('id')
            .eq('area_id', area.id);

          let totalItems = 0;
          if (domains) {
            for (const domain of domains) {
              const [features, bugs, tasks] = await Promise.all([
                supabase.from('features').select('*', { count: 'exact', head: true }).eq('domain_id', domain.id),
                supabase.from('bugs').select('*', { count: 'exact', head: true }).eq('domain_id', domain.id),
                supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('domain_id', domain.id),
              ]);
              totalItems += (features.count || 0) + (bugs.count || 0) + (tasks.count || 0);
            }
          }

          return {
            ...area,
            domainCount: domainCount || 0,
            totalItems,
          };
        })
      );

      setAreas(areasWithCounts);
    } catch (error) {
      console.error('Error fetching areas:', error);
      showToast('Failed to load areas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                Andrea's Project Manager
              </h1>
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

              {/* Right Column - Today's Focus + Running Items (XL+ sidebar, mobile full-width) */}
              <div className="w-full xl:w-[400px] space-y-4 sm:space-y-6">
                {/* Today's Focus - Compact Version */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  {/* Dark gradient background for distinction */}
                  <div 
                    className="absolute inset-0 rounded-3xl opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, rgba(155, 110, 255, 0.15), rgba(255, 159, 202, 0.15))',
                    }}
                  />
                  
                  <div className="relative glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2" style={{ borderColor: 'rgba(155, 110, 255, 0.25)' }}>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                        Today's Focus
                      </h2>
                      <button
                        onClick={() => setIsEditFocusModalOpen(true)}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 glass glass-hover rounded-lg sm:rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 sm:gap-2"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        <Edit3 size={14} strokeWidth={2.5} />
                        <span>Edit</span>
                      </button>
                    </div>

                    {todaysFocus.length === 0 ? (
                      <div className="text-center py-6 sm:py-8">
                        <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                          No focus domains yet. Add up to 3.
                        </p>
                        <button
                          onClick={() => setIsEditFocusModalOpen(true)}
                          className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all font-medium inline-flex items-center gap-2 text-xs sm:text-sm"
                          style={{
                            background: 'linear-gradient(135deg, rgba(123, 159, 255, 0.8), rgba(155, 110, 255, 0.8))',
                            color: 'white',
                          }}
                        >
                          <Plus size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4" />
                          Add Domains
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {todaysFocus.map((item) => {
                          // Convert icon name to PascalCase
                          const convertIconName = (iconName: string) => {
                            if (!iconName) return null;
                            return iconName
                              .split('-')
                              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                              .join('');
                          };

                          const iconName = convertIconName(item.areaIcon || '');
                          const IconComponent = iconName && (Icons as any)[iconName]
                            ? (Icons as any)[iconName]
                            : Icons.Circle;

                          return (
                            <Link
                              key={item.id}
                              href={`/projects/${item.areaId}`}
                              className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass glass-hover rounded-xl sm:rounded-2xl transition-all"
                            >
                              <div 
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0" 
                                style={{ 
                                  background: `linear-gradient(135deg, ${item.areaColor}25, ${item.areaColor}15)`,
                                  border: `1.5px solid ${item.areaColor}35`,
                                  boxShadow: `0 4px 16px ${item.areaColor}20`,
                                }}
                              >
                                <IconComponent size={18} style={{ color: item.areaColor }} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-semibold text-xs sm:text-sm block" style={{ color: 'var(--color-text-primary)' }}>
                                  {item.areaName}
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.section>

                {/* Running Items Card */}
                <RunningItemsCard />

                {/* Running Projects Card */}
                <RunningProjectsCard />
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
