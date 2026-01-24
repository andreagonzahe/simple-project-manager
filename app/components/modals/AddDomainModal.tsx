'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import type { ProjectFormData } from '@/app/lib/types';
import { supabase } from '@/app/lib/supabase';

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  areaId: string;
}

const defaultColors = [
  '#5E5592', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F97316', // Orange
  '#EC4899', // Pink
  '#F59E0B', // Yellow
];

export function AddDomainModal({ isOpen, onClose, onSuccess, areaId }: AddDomainModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    area_id: areaId,
    name: '',
    description: '',
    color: defaultColors[0],
    status: 'active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const insertData = {
        area_id: areaId,
        name: formData.name,
        description: formData.description || null,
        color: formData.color,
        status: formData.status,
      };
      
      console.log('Attempting to insert project:', insertData);
      
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([insertData])
        .select();

      console.log('Insert result:', { data, error: insertError });

      if (insertError) {
        console.error('Insert error:', insertError);
        console.error('Insert error details:', JSON.stringify({
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        }, null, 2));
        throw insertError;
      }

      onSuccess();
      onClose();
      setFormData({ area_id: areaId, name: '', description: '', color: defaultColors[0], status: 'active' });
    } catch (err) {
      console.error('Error creating project:', err);
      console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
      const errorMessage = err && typeof err === 'object' && 'message' in err 
        ? (err as any).message 
        : 'Failed to create project';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Sparken, Freelancing"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of this project..."
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color *
          </label>
          <div className="grid grid-cols-6 gap-2">
            {defaultColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-10 h-10 rounded-lg transition-all ${
                  formData.color === color
                    ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
