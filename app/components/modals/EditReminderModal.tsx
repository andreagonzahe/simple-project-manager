'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { Modal } from './Modal';

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
}

interface EditReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reminder: Reminder | null;
}

export function EditReminderModal({ isOpen, onClose, onSuccess, reminder }: EditReminderModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update form when reminder changes
  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title,
        description: reminder.description || '',
        due_date: reminder.due_date || '',
        due_time: reminder.due_time || '',
      });
      setError('');
    }
  }, [reminder]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!reminder) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('reminders')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          due_date: formData.due_date || null,
          due_time: formData.due_time || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reminder.id);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating reminder:', err);
      setError('Failed to update reminder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!reminder) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Reminder">
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

          <div className="grid grid-cols-2 gap-3">
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

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Time (Optional)
              </label>
              <input
                type="time"
                value={formData.due_time}
                onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                className="w-full px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400/50"
                style={{ 
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                }}
              />
            </div>
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
