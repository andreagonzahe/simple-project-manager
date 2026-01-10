'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Plus, Trash2, Target } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';

interface EditAreaGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  areaId: string;
  areaName: string;
  currentGoals: string[];
}

export function EditAreaGoalsModal({ isOpen, onClose, onSuccess, areaId, areaName, currentGoals }: EditAreaGoalsModalProps) {
  const [goals, setGoals] = useState<string[]>(currentGoals);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGoals(currentGoals.length > 0 ? currentGoals : ['']);
    }
  }, [isOpen, currentGoals]);

  const addGoal = () => {
    if (goals.length < 3) {
      setGoals([...goals, '']);
    }
  };

  const updateGoal = (index: number, value: string) => {
    const newGoals = [...goals];
    newGoals[index] = value;
    setGoals(newGoals);
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Filter out empty goals
      const validGoals = goals.filter(goal => goal.trim().length > 0);

      const { error: updateError } = await supabase
        .from('areas_of_life')
        .update({ goals: validGoals })
        .eq('id', areaId);

      if (updateError) throw updateError;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goals');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Goals for ${areaName}`} size="lg">
      <div className="space-y-6">
        {error && (
          <div className="p-4 glass rounded-xl text-sm border" style={{ 
            borderColor: 'rgba(255, 107, 107, 0.3)',
            background: 'rgba(255, 107, 107, 0.1)',
            color: '#FCA5A5'
          }}>
            {error}
          </div>
        )}

        <div className="flex items-start gap-3 p-4 glass rounded-2xl" style={{ 
          background: 'rgba(123, 159, 255, 0.1)',
          border: '1.5px solid rgba(123, 159, 255, 0.2)',
        }}>
          <Target size={20} strokeWidth={2.5} style={{ color: 'var(--color-text-primary)', marginTop: '2px' }} />
          <p className="text-sm font-light" style={{ color: 'var(--color-text-secondary)' }}>
            Set up to 3 goals for this area. These help you stay focused on what matters most in your life.
          </p>
        </div>

        <div className="space-y-4">
          {goals.map((goal, index) => (
            <div key={index} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Goal {index + 1}
                </span>
                {goals.length > 1 && (
                  <button
                    onClick={() => removeGoal(index)}
                    className="p-2 rounded-xl glass-hover transition-all"
                    style={{ color: '#FF6B6B' }}
                  >
                    <Trash2 size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>
              <input
                type="text"
                value={goal}
                onChange={(e) => updateGoal(index, e.target.value)}
                placeholder={`e.g., ${index === 0 ? 'Exercise 3x per week' : index === 1 ? 'Eat healthier' : 'Sleep 8 hours nightly'}`}
                className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
              />
              <div className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                {goal.length}/200 characters
              </div>
            </div>
          ))}
        </div>

        {goals.length < 3 && (
          <button
            onClick={addGoal}
            className="w-full px-4 py-3 glass glass-hover rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Goal ({goals.length}/3)
          </button>
        )}

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
            onClick={handleSave}
            className="px-5 py-3 rounded-xl transition-all text-white font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(155, 110, 255, 0.8), rgba(255, 159, 202, 0.8))',
            }}
            disabled={isSubmitting || goals.every(g => !g.trim())}
          >
            {isSubmitting ? 'Saving...' : 'Save Goals'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
