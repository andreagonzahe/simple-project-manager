'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { supabase } from '@/app/lib/supabase';
import { handleRecurringTaskCompletion } from '@/app/lib/utils';
import { Confetti } from '@/app/components/ui/Confetti';
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
    commitment_level?: 'must_do' | 'optional';
    due_date?: string;
    do_date?: string;
    severity?: 'minor' | 'major' | 'critical';
    is_recurring?: boolean;
    recurrence_pattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    recurrence_end_date?: string;
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
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData);
      setError(null);
    }
  }, [isOpen, initialData]);

  // Auto-set priority to high when commitment level is set to must_do
  useEffect(() => {
    if (formData.commitment_level === 'must_do' && formData.priority !== 'high') {
      setFormData(prev => ({ ...prev, priority: 'high' }));
    }
  }, [formData.commitment_level]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Check if task is being marked as complete
      const wasCompleted = formData.status === 'complete' && initialData.status !== 'complete';

      let updateData: any = {
        title: formData.title,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        commitment_level: formData.commitment_level || 'optional',
        due_date: formData.due_date || null,
        do_date: formData.do_date || null,
        is_recurring: formData.is_recurring || false,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : null,
        recurrence_end_date: formData.is_recurring && formData.recurrence_end_date ? formData.recurrence_end_date : null,
      };

      if (taskType === 'bug' && formData.severity) {
        updateData.severity = formData.severity;
      }

      // Check if task is being marked as complete and is recurring
      if (wasCompleted) {
        // Task is being completed
        const recurringUpdate = await handleRecurringTaskCompletion({
          is_recurring: formData.is_recurring,
          recurrence_pattern: formData.recurrence_pattern,
          recurrence_end_date: formData.recurrence_end_date,
        });
        
        // Merge the recurring update data
        updateData = { ...updateData, ...recurringUpdate };
      }

      const tableName = taskType === 'task' ? 'tasks' : taskType === 'bug' ? 'bugs' : 'features';
      const { error: updateError } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', taskId);

      if (updateError) throw updateError;

      // Trigger confetti if task was completed
      if (wasCompleted) {
        setShowConfetti(true);
        // Wait a bit for confetti to show before closing
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Confetti trigger={showConfetti} />
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

        {/* Commitment Level */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Commitment Level
          </label>
          <select
            value={formData.commitment_level || 'optional'}
            onChange={(e) => setFormData({ ...formData, commitment_level: e.target.value as 'must_do' | 'optional' })}
            className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-base"
            style={{ 
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
          >
            <option value="optional">Optional</option>
            <option value="must_do">Must Do</option>
          </select>
          <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
            Tasks are optional by default. Mark as Must Do for critical items.
          </p>
        </div>

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
            <div className="space-y-2">
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    setFormData({ ...formData, do_date: today.toISOString().split('T')[0] });
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#A78BFA',
                  }}
                >
                  📅 Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(0, 0, 0, 0);
                    setFormData({ ...formData, do_date: tomorrow.toISOString().split('T')[0] });
                  }}
                  className="flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#A78BFA',
                  }}
                >
                  🗓️ Tomorrow
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Task Section */}
        <div className="glass rounded-2xl p-5 border" style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="is_recurring_edit"
              checked={formData.is_recurring || false}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="is_recurring_edit" className="text-sm font-medium cursor-pointer" style={{ color: 'var(--color-text-primary)' }}>
              Make this a recurring task
            </label>
          </div>

          {formData.is_recurring && (
            <div className="space-y-4 mt-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Repeat
                </label>
                <select
                  value={formData.recurrence_pattern || 'daily'}
                  onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value as any })}
                  className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-base"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.recurrence_end_date || ''}
                  onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                  className="w-full px-4 py-3 glass rounded-xl outline-none transition-all text-base"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                />
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                  Leave blank for tasks that repeat indefinitely
                </p>
              </div>
            </div>
          )}
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
            type="button"
            onClick={async () => {
              setFormData({ ...formData, status: 'complete' });
              // Trigger form submission after state update
              setTimeout(() => {
                const form = document.querySelector('form');
                if (form) form.requestSubmit();
              }, 0);
            }}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl font-medium transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8))',
              color: 'white',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            ✓ Complete
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
    </>
  );
}
