'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { supabase } from '@/app/lib/supabase';
import type { ItemStatus, ItemPriority } from '@/app/lib/types';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: string;
  taskType: 'task' | 'bug' | 'feature';
  initialData: {
    title: string;
    description?: string;
    status: ItemStatus;
    priority: ItemPriority;
    due_date?: string;
    do_date?: string;
    severity?: 'minor' | 'major' | 'critical';
  };
}

export function EditTaskModal({
  isOpen,
  onClose,
  onSuccess,
  taskId,
  taskType,
  initialData,
}: EditTaskModalProps) {
  const [formData, setFormData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setError(null);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updateData: any = {
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        due_date: formData.due_date || null,
        do_date: formData.do_date || null,
      };

      if (taskType === 'bug' && formData.severity) {
        updateData.severity = formData.severity;
      }

      const tableName = taskType === 'task' ? 'tasks' : taskType === 'bug' ? 'bugs' : 'features';
      const { error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', taskId);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${taskType.charAt(0).toUpperCase() + taskType.slice(1)}`} size="lg">
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

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-base"
            style={{ 
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
            placeholder="Enter title..."
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Description (Optional)
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-base resize-none"
            style={{ 
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
            placeholder="Add details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as ItemPriority })}
              className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-base"
              style={{ 
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ItemStatus })}
              className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-base"
              style={{ 
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <option value="backlog">Backlog</option>
              <option value="idea">Idea</option>
              <option value="idea_validation">Idea Validation</option>
              <option value="exploration">Exploration</option>
              <option value="planning">Planning</option>
              <option value="executing">Executing</option>
              <option value="complete">Complete</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
        </div>

        {/* Severity (only for bugs) */}
        {taskType === 'bug' && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Severity
            </label>
            <select
              value={formData.severity || 'minor'}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value as 'minor' | 'major' | 'critical' })}
              className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-base"
              style={{ 
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.due_date || ''}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-base"
              style={{ 
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            />
          </div>

          {/* Do Date */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Do Date (Optional)
            </label>
            <input
              type="date"
              value={formData.do_date || ''}
              onChange={(e) => setFormData({ ...formData, do_date: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-base"
              style={{ 
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 glass glass-hover rounded-xl font-medium transition-all"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(123, 159, 255, 0.8), rgba(155, 110, 255, 0.8))',
              color: 'white',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting ? 'Updating...' : 'Update'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
