'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import type { AreaFormData } from '@/app/lib/types';
import { supabase } from '@/app/lib/supabase';

interface AddAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const defaultColors = [
  '#3B82F6', // Blue
  '#F97316', // Orange
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#06B6D4', // Cyan
];

export function AddAreaModal({ isOpen, onClose, onSuccess }: AddAreaModalProps) {
  const [formData, setFormData] = useState<AreaFormData>({
    name: '',
    color: defaultColors[0],
    icon: '',
    sort_order: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('areas_of_life')
        .insert([formData as any]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
      setFormData({ name: '', color: defaultColors[0], icon: '', sort_order: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create area');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Area of Life">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-900/30 border border-red-800 rounded-xl text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-3">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-[#0A0A0B] border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
            placeholder="e.g., Career, Housing, Health"
            required
          />
        </div>

        <div>
          <label htmlFor="icon" className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Icon (Lucide React name)
          </label>
          <input
            type="text"
            id="icon"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., briefcase, home, heart, hand-coins"
          />
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
            Visit <a href="https://lucide.dev" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">lucide.dev</a> for icon names. Use lowercase with hyphens (e.g., hand-coins, credit-card)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Color *
          </label>
          <div className="grid grid-cols-8 gap-3">
            {defaultColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-12 h-12 rounded-xl transition-all ${
                  formData.color === color
                    ? 'ring-2 ring-offset-2 ring-offset-[#18181B] ring-white scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="sort_order" className="block text-sm font-medium text-gray-300 mb-3">
            Sort Order
          </label>
          <input
            type="number"
            id="sort_order"
            value={formData.sort_order}
            onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 bg-[#0A0A0B] border border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
            min="0"
          />
        </div>

        <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium shadow-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Area'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
