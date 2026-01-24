'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import type { AreaOfLife, Project, ItemStatus, ItemPriority, CommitmentLevel, RecurrencePattern } from '@/app/lib/types';

interface InboxItem {
  id: string;
  title: string;
  description: string | null;
}

interface OrganizeInboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inboxItem: InboxItem;
}

export function OrganizeInboxModal({ isOpen, onClose, onSuccess, inboxItem }: OrganizeInboxModalProps) {
  const [areas, setAreas] = useState<AreaOfLife[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [formData, setFormData] = useState({
    type: 'task' as 'task' | 'bug' | 'feature',
    title: inboxItem.title,
    description: inboxItem.description || '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'backlog' as ItemStatus,
    severity: 'minor' as 'minor' | 'major' | 'critical',
    commitment_level: 'optional' as 'must_do' | 'optional',
    due_date: '',
    do_date: '',
    is_recurring: false,
    recurrence_pattern: 'daily' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurrence_end_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAreas();
      setFormData({
        type: 'task',
        title: inboxItem.title,
        description: inboxItem.description || '',
        priority: 'medium',
        status: 'backlog',
        severity: 'minor',
        commitment_level: 'optional',
        due_date: '',
        do_date: '',
        is_recurring: false,
        recurrence_pattern: 'daily',
        recurrence_end_date: '',
      });
    }
  }, [isOpen, inboxItem]);

  useEffect(() => {
    if (selectedAreaId) {
      fetchProjects(selectedAreaId);
    } else {
      setProjects([]);
      setSelectedProjectId('');
    }
  }, [selectedAreaId]);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas_of_life')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setAreas(data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
    }
  };

  const fetchProjects = async (areaId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('area_id', areaId)
        .order('name', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAreaId) {
      setError('Please select an area');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const baseData = {
        project_id: selectedProjectId || null,
        area_id: selectedAreaId,
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        status: formData.status,
        commitment_level: formData.commitment_level,
        due_date: formData.due_date || null,
        do_date: formData.do_date || null,
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : null,
        recurrence_end_date: formData.is_recurring && formData.recurrence_end_date ? formData.recurrence_end_date : null,
        next_due_date: formData.is_recurring && formData.do_date ? formData.do_date : null,
      };

      // Save to the appropriate table based on type
      let insertError;
      if (formData.type === 'bug') {
        const bugData = {
          ...baseData,
          severity: formData.severity,
        };
        const result = await supabase.from('bugs').insert([bugData as any]);
        insertError = result.error;
      } else if (formData.type === 'feature') {
        const result = await supabase.from('features').insert([baseData as any]);
        insertError = result.error;
      } else {
        const result = await supabase.from('tasks').insert([baseData as any]);
        insertError = result.error;
      }

      if (insertError) throw insertError;

      // Delete from inbox
      const { error: deleteError } = await supabase
        .from('inbox')
        .delete()
        .eq('id', inboxItem.id);

      if (deleteError) throw deleteError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error organizing item:', err);
      setError('Failed to organize item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl glass rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
          style={{ border: '1.5px solid var(--color-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
                  border: '1.5px solid rgba(139, 92, 246, 0.3)',
                }}
              >
                <FolderOpen size={22} style={{ color: '#A78BFA' }} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  Organize Item
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                  Convert to a task and assign to area/project
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 glass glass-hover rounded-xl transition-all"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Type
              </label>
              <div className="flex gap-2">
                {(['task', 'bug', 'feature'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className="flex-1 px-4 py-3 rounded-xl font-medium capitalize transition-all"
                    style={{
                      background: formData.type === type
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))'
                        : 'var(--color-bg-elevated)',
                      color: 'var(--color-text-primary)',
                      border: `1.5px solid ${formData.type === type ? 'rgba(139, 92, 246, 0.5)' : 'var(--color-border)'}`,
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                style={{
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-elevated)',
                }}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50 resize-none"
                style={{
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-elevated)',
                }}
              />
            </div>

            {/* Area Selection */}
            <div>
              <label htmlFor="area" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Area *
              </label>
              <select
                id="area"
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="w-full px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                style={{
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-elevated)',
                }}
                required
              >
                <option value="">Select an area</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Selection */}
            <div>
              <label htmlFor="project" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Project (Optional)
              </label>
              <select
                id="project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                style={{
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-elevated)',
                }}
                disabled={!selectedAreaId}
              >
                <option value="">No project (area only)</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                Leave blank to create an area-level task
              </p>
            </div>

            {/* Priority & Commitment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Priority
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  style={{
                    color: 'var(--color-text-primary)',
                    background: 'var(--color-bg-elevated)',
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="commitment" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Commitment
                </label>
                <select
                  id="commitment"
                  value={formData.commitment_level}
                  onChange={(e) => setFormData({ ...formData, commitment_level: e.target.value as any })}
                  className="w-full px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                  style={{
                    color: 'var(--color-text-primary)',
                    background: 'var(--color-bg-elevated)',
                  }}
                >
                  <option value="optional">Optional</option>
                  <option value="must_do">Must Do</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 glass glass-hover rounded-xl font-medium transition-all"
                style={{ color: 'var(--color-text-primary)' }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedAreaId}
                className="flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.4))',
                  color: 'var(--color-text-primary)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Organizing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} strokeWidth={2} />
                    <span>Organize</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
