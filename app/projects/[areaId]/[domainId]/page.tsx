'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, Edit2, Plus } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { Breadcrumb } from '@/app/components/ui/Breadcrumb';
import { ToastContainer, useToast } from '@/app/components/ui/Toast';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';
import { EditGoalsModal } from '@/app/components/modals/EditGoalsModal';
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

export default function DomainDetailPage() {
  const params = useParams();
  const router = useRouter();
  const areaId = params.areaId as string;
  const domainId = params.domainId as string;

  const [area, setArea] = useState<Area | null>(null);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
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
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load domain', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [areaId, domainId]);

  const handleGoalsSuccess = async () => {
    showToast('Goals updated successfully!', 'success');
    await new Promise(resolve => setTimeout(resolve, 300));
    await fetchData();
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
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Areas', href: '/' },
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

        {/* Future: Subdomains section would go here */}

        {/* Tasks Section - Empty State */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass rounded-3xl p-10 text-center">
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
              No tasks yet
            </h3>
            <p className="text-base mb-8 font-light" style={{ color: 'var(--color-text-secondary)' }}>
              Create your first task to start tracking work in this project.
            </p>
            <button
              className="px-6 py-3 rounded-2xl transition-all font-medium inline-flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, rgba(123, 159, 255, 0.8), rgba(155, 110, 255, 0.8))',
                color: 'white',
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
              Create Your First Task
            </button>
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
    </div>
  );
}
