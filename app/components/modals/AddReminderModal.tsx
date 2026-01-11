'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { Modal } from './Modal';

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddReminderModal({ isOpen, onClose, onSuccess }: AddReminderModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ title: '', description: '', due_date: '' });
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('reminders')
        .insert([{
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          due_date: formData.due_date || null,
        }]);

      if (insertError) throw insertError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating reminder:', err);
      setError('Failed to create reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Reminder">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400/50"
              style={{ 
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
              }}
              placeholder="e.g., Follow up with client"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400/50 resize-none"
              style={{ 
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
              }}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400/50"
              style={{ 
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
              }}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 glass glass-hover rounded-xl text-sm font-medium transition-all"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.8))',
                color: 'white',
              }}
            >
              {isSubmitting ? 'Adding...' : 'Add Reminder'}
            </button>
          </div>
        </form>
      </Modal>
    );
  }
