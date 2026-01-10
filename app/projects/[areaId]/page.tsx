'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Target } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import type { AreaOfLife, Domain, DomainWithCounts } from '@/app/lib/types';
import { DomainCard } from '@/app/components/cards/DomainCard';
import { AddDomainModal } from '@/app/components/modals/AddDomainModal';
import { EditDomainModal } from '@/app/components/modals/EditDomainModal';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { LoadingGrid } from '@/app/components/ui/LoadingCard';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { ToastContainer, useToast } from '@/app/components/ui/Toast';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';
import { motion } from 'framer-motion';

import { EditGoalsModal } from '@/app/components/modals/EditGoalsModal';
import { DeleteConfirmModal } from '@/app/components/modals/DeleteConfirmModal';

export default function DomainsPage() {
  const params = useParams();
  const router = useRouter();
  const areaId = params.areaId as string;

  const [area, setArea] = useState<AreaOfLife | null>(null);
  const [domains, setDomains] = useState<DomainWithCounts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditGoalsModalOpen, setIsEditGoalsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainWithCounts | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch area
      const { data: areaData, error: areaError } = await supabase
        .from('areas_of_life')
        .select('*')
        .eq('id', areaId)
        .single();

      if (areaError) throw areaError;
      setArea(areaData);

      // Fetch domains
      const { data: domainsData, error: domainsError } = await supabase
        .from('domains')
        .select('*')
        .eq('area_id', areaId)
        .order('created_at', { ascending: false });

      if (domainsError) throw domainsError;

      // Fetch counts for each domain
      const domainsWithCounts = await Promise.all(
        (domainsData || []).map(async (domain) => {
          // Get task count (all item types)
          const [features, bugs, tasks] = await Promise.all([
            supabase
              .from('features')
              .select('*', { count: 'exact', head: true })
              .eq('domain_id', domain.id),
            supabase
              .from('bugs')
              .select('*', { count: 'exact', head: true })
              .eq('domain_id', domain.id),
            supabase
              .from('tasks')
              .select('*', { count: 'exact', head: true })
              .eq('domain_id', domain.id),
          ]);

          const totalTasks = (features.count || 0) + (bugs.count || 0) + (tasks.count || 0);

          // Get active items (not complete or dismissed)
          const [activeFeat, activeBugs, activeTasks] = await Promise.all([
            supabase
              .from('features')
              .select('*', { count: 'exact', head: true })
              .eq('domain_id', domain.id)
              .not('status', 'in', '(complete,dismissed)'),
            supabase
              .from('bugs')
              .select('*', { count: 'exact', head: true })
              .eq('domain_id', domain.id)
              .not('status', 'in', '(complete,dismissed)'),
            supabase
              .from('tasks')
              .select('*', { count: 'exact', head: true })
              .eq('domain_id', domain.id)
              .not('status', 'in', '(complete,dismissed)'),
          ]);

          const activeItems = (activeFeat.count || 0) + (activeBugs.count || 0) + (activeTasks.count || 0);

          return {
            ...domain,
            goals: domain.goals || [], // Ensure goals is always an array
            taskCount: totalTasks,
            activeItems,
          };
        })
      );

      setDomains(domainsWithCounts);
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

  const handleAddSuccess = async () => {
    showToast('Project created successfully!', 'success');
    // Small delay to ensure database transaction completes
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchData();
  };

  const handleEditClick = (domain: DomainWithCounts) => {
    setSelectedDomain(domain);
    setIsEditModalOpen(true);
  };

  const handleEditGoalsClick = (domain: DomainWithCounts) => {
    setSelectedDomain(domain);
    setIsEditGoalsModalOpen(true);
  };

  const handleDeleteClick = (domain: DomainWithCounts) => {
    setSelectedDomain(domain);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDomain) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', selectedDomain.id);

      if (error) throw error;

      showToast('Project deleted successfully!', 'success');
      setIsDeleteModalOpen(false);
      setSelectedDomain(null);
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
                <p className="text-lg font-light" style={{ color: 'var(--color-text-secondary)' }}>
                  {domains.length} {domains.length === 1 ? 'project' : 'projects'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
        {area.goals && area.goals.length > 0 && (
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
        )}

        {/* Domains Grid */}
        {domains.length === 0 ? (
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {domains.map((domain, index) => (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DomainCard 
                  domain={domain} 
                  areaId={areaId} 
                  onEdit={handleEditClick}
                  onEditGoals={handleEditGoalsClick}
                  onDelete={handleDeleteClick}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
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
          setSelectedDomain(null);
        }}
        onSuccess={handleEditSuccess}
        domain={selectedDomain}
      />

      {/* Edit Goals Modal */}
      <EditGoalsModal
        isOpen={isEditGoalsModalOpen}
        onClose={() => {
          setIsEditGoalsModalOpen(false);
          setSelectedDomain(null);
        }}
        onSuccess={handleGoalsSuccess}
        domainId={selectedDomain?.id || ''}
        domainName={selectedDomain?.name || ''}
        currentGoals={selectedDomain?.goals || []}
      />

      {/* Delete Project Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDomain(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Project"
        message={`Are you sure you want to delete "${selectedDomain?.name}"? This will also delete all tasks, bugs, and features within this project. This action cannot be undone.`}
      />
    </div>
  );
}
