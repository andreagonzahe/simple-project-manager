'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { supabase } from '@/app/lib/supabase';
import type { AreaOfLife } from '@/app/lib/types';
import { Pencil } from 'lucide-react';

interface EditAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  area: AreaOfLife;
}

interface AreaFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export default function EditAreaModal({ isOpen, onClose, onSuccess, area }: EditAreaModalProps) {
  const [formData, setFormData] = useState<AreaFormData>({
    name: area.name,
    description: area.description || '',
    icon: area.icon || '',
    color: area.color,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when area changes
  useEffect(() => {
    setFormData({
      name: area.name,
      description: area.description || '',
      icon: area.icon || '',
      color: area.color,
    });
  }, [area]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('areas_of_life')
        .update({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          color: formData.color,
        })
        .eq('id', area.id);

      if (updateError) throw updateError;

      // Wait a bit for database to update
      setTimeout(() => {
        onSuccess();
        onClose();
        setLoading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to update area');
      setLoading(false);
    }
  };

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Indigo', value: '#6366F1' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Area">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Area Name */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Area Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Health, Career, Finance"
            className="w-full px-4 py-3 rounded-xl text-base font-light outline-none transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of this area..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-base font-light outline-none transition-all resize-none"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Icon */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Icon (Lucide icon name)
          </label>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="e.g., heart, briefcase, home, dumbbell"
            className="w-full px-4 py-3 rounded-xl text-base font-light outline-none transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-text-primary)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              e.target.style.boxShadow = '0 0 0 4px rgba(139, 92, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            Use kebab-case for multi-word icons (e.g., "hand-coins", "trophy-star")
          </p>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Color
          </label>
          <div className="grid grid-cols-4 gap-3">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className="relative p-4 rounded-xl transition-all"
                style={{
                  background: `${color.value}20`,
                  border: formData.color === color.value 
                    ? `2px solid ${color.value}` 
                    : '2px solid transparent',
                  boxShadow: formData.color === color.value 
                    ? `0 0 0 3px ${color.value}30` 
                    : 'none',
                }}
              >
                <div
                  className="w-full h-8 rounded-lg"
                  style={{ background: color.value }}
                />
                <p className="text-xs mt-2 text-center font-medium" style={{ color: color.value }}>
                  {color.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
            }}
          >
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1.5px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
            style={{
              background: loading 
                ? 'rgba(139, 92, 246, 0.3)' 
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.8))',
              border: '1.5px solid rgba(139, 92, 246, 0.4)',
              color: 'var(--color-text-primary)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
