'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { DomainFormData, AreaOfLife } from '@/app/lib/types';
import { supabase } from '@/app/lib/supabase';

interface AddDomainModalStandaloneProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedAreaId?: string;
}

const defaultColors = [
  '#3B82F6', // Blue
  '#F97316', // Orange
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Yellow
];

export function AddDomainModalStandalone({ isOpen, onClose, onSuccess, preselectedAreaId }: AddDomainModalStandaloneProps) {
  const [areas, setAreas] = useState<AreaOfLife[]>([]);
  const [formData, setFormData] = useState<DomainFormData>({
    area_id: preselectedAreaId || '',
    name: '',
    description: '',
    color: defaultColors[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch areas when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAreas();
      // Set preselected area if provided
      if (preselectedAreaId) {
        setFormData(prev => ({ ...prev, area_id: preselectedAreaId }));
      }
    }
  }, [isOpen, preselectedAreaId]);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas_of_life')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setAreas(data || []);
      
      // Set first area as default
      if (data && data.length > 0 && !formData.area_id) {
        setFormData(prev => ({ ...prev, area_id: data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching areas:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.area_id) {
      setError('Please select an area');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('domains')
        .insert([formData as any]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
      setFormData({ area_id: '', name: '', description: '', color: defaultColors[0] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create domain');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Project">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-4 glass rounded-xl text-sm border" style={{ 
            borderColor: 'rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#FCA5A5'
          }}>
            {error}
          </div>
        )}

        {/* Area Selection */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium mb-3 text-white">
            Area *
          </label>
          <select
            id="area"
            value={formData.area_id}
            onChange={(e) => setFormData({ ...formData, area_id: e.target.value })}
            className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select an area</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id} className="bg-gray-800">
                {area.name}
              </option>
            ))}
          </select>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-3 text-white">
            Project Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Sparken, Freelancing"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-3 text-white">
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

        {/* Color Picker */}
        <div>
          <label className="block text-sm font-medium mb-3 text-white">
            Color *
          </label>
          <div className="grid grid-cols-6 gap-3">
            {defaultColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({ ...formData, color })}
                className={`w-12 h-12 rounded-xl transition-all ${
                  formData.color === color
                    ? 'ring-2 ring-offset-2 ring-offset-gray-900 scale-110'
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                }`}
                style={{ 
                  backgroundColor: color,
                }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 btn-ghost rounded-xl transition-all text-white"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-3 rounded-xl transition-all text-white font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8))',
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
