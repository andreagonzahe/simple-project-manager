'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { ProjectWithCounts } from '@/app/lib/types';
import { supabase } from '@/app/lib/supabase';

interface EditDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  domain: ProjectWithCounts | null;
}

const defaultColors = [
  '#7B9FFF', // Blue
  '#FFB088', // Orange
  '#88DFAB', // Green
  '#B195FF', // Purple
  '#FF9FCA', // Pink
  '#FFD88D', // Yellow
  '#FF6B6B', // Red
  '#88D4F5', // Cyan
];

export function EditDomainModal({ isOpen, onClose, onSuccess, domain }: EditDomainModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: defaultColors[0],
    status: 'idea' as any,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (domain && isOpen) {
      setFormData({
        name: domain.name,
        description: domain.description || '',
        color: domain.color || defaultColors[0],
        status: domain.status || 'idea',
      });
    }
  }, [domain, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          name: formData.name,
          description: formData.description || null,
          color: formData.color,
          status: formData.status,
        })
        .eq('id', domain.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!domain) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Project">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 glass rounded-xl text-sm border" style={{ 
            borderColor: 'rgba(255, 107, 107, 0.3)',
            background: 'rgba(255, 107, 107, 0.1)',
            color: '#FCA5A5'
          }}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Website Redesign"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Description (Optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Brief description of this project..."
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Status *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Color *
          </label>
          <div className="grid grid-cols-8 gap-3">
            {defaultColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-12 h-12 rounded-2xl transition-all ${
                  formData.color === color
                    ? 'ring-2 ring-offset-2 ring-offset-gray-900 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 btn-ghost rounded-2xl transition-all"
            style={{ color: 'var(--color-text-primary)' }}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl transition-all font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(123, 159, 255, 0.8), rgba(155, 110, 255, 0.8))',
              color: 'white',
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
