'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { AreaOfLife, Project } from '@/app/lib/types';
import { supabase } from '@/app/lib/supabase';

interface AddTaskModalStandaloneProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedAreaId?: string;
  preselectedProjectId?: string;
}

export function AddTaskModalStandalone({ isOpen, onClose, onSuccess, preselectedAreaId, preselectedProjectId }: AddTaskModalStandaloneProps) {
  const [areas, setAreas] = useState<AreaOfLife[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [selectedAreaId, setSelectedAreaId] = useState(preselectedAreaId || '');
  const [selectedProjectId, setSelectedProjectId] = useState(preselectedProjectId || '');
  
  const [formData, setFormData] = useState({
    type: 'task' as 'task' | 'bug' | 'feature',
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'idea' as 'backlog' | 'idea' | 'idea_validation' | 'exploration' | 'planning' | 'executing' | 'complete' | 'dismissed',
    severity: 'minor' as 'minor' | 'major' | 'critical', // Only for bugs
    due_date: '',
    do_date: '',
    is_recurring: false,
    recurrence_pattern: 'daily' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    recurrence_end_date: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch areas when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAreas();
      // Set preselected values if provided
      if (preselectedAreaId) {
        setSelectedAreaId(preselectedAreaId);
      }
      if (preselectedProjectId) {
        setSelectedProjectId(preselectedProjectId);
      }
    }
  }, [isOpen, preselectedAreaId, preselectedProjectId]);

  // Fetch projects when area changes
  useEffect(() => {
    if (selectedAreaId) {
      fetchProjects(selectedAreaId);
    } else {
      setProjects([]);
      setSelectedProjectId('');
    }
  }, [selectedAreaId]);

  const fetchAreas = async () => {
    try {
      const { data, error } = await supabase
        .from('areas_of_life')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setAreas(data || []);
    } catch (err) {
      console.error('Error fetching areas:', err);
    }
  };

  const fetchProjects = async (areaId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('area_id', areaId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching domains:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    
    if (!selectedAreaId) {
      setError('Please select an area');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const baseData = {
        project_id: selectedProjectId || null,
        area_id: selectedAreaId,
        title: formData.title,
        description: formData.description || null,
        priority: formData.priority,
        status: formData.status,
        due_date: formData.due_date || null,
        do_date: formData.do_date || null,
        is_recurring: formData.is_recurring,
        recurrence_pattern: formData.is_recurring ? formData.recurrence_pattern : null,
        recurrence_end_date: formData.is_recurring && formData.recurrence_end_date ? formData.recurrence_end_date : null,
        next_due_date: formData.is_recurring && formData.do_date ? formData.do_date : null,
      };


      // Save to the appropriate table based on type
      let insertError;
      if (formData.type === 'bug') {
        const bugData = {
          ...baseData,
          severity: formData.severity,
        };
        const result = await supabase.from('bugs').insert([bugData as any]);
        insertError = result.error;
      } else if (formData.type === 'feature') {
        const result = await supabase.from('features').insert([baseData as any]);
        insertError = result.error;
      } else {
        const result = await supabase.from('tasks').insert([baseData as any]);
        insertError = result.error;
      }


      if (insertError) throw insertError;

      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        type: 'task',
        title: '',
        description: '',
        priority: 'medium',
        status: 'idea',
        severity: 'minor',
        due_date: '',
        do_date: '',
        is_recurring: false,
        recurrence_pattern: 'daily',
        recurrence_end_date: '',
      });
      setSelectedAreaId('');
      setSelectedProjectId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Item" size="lg">
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

        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-3 text-white">
            Type *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'task', label: 'Task', icon: '✓', color: '#3B82F6' },
              { value: 'bug', label: 'Bug', icon: '⚠', color: '#EF4444' },
              { value: 'feature', label: 'Feature', icon: '✨', color: '#10B981' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value as any })}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  formData.type === type.value
                    ? 'ring-2 ring-offset-2 ring-offset-gray-900'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  background: formData.type === type.value 
                    ? `linear-gradient(135deg, ${type.color}30, ${type.color}20)`
                    : 'rgba(255, 255, 255, 0.05)',
                  borderColor: type.color,
                  border: '1px solid',
                  color: type.color,
                }}
              >
                <span className="text-lg">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Area Selection */}
        <div>
          <label htmlFor="area" className="block text-sm font-medium mb-3 text-white">
            Area *
          </label>
          <select
            id="area"
            value={selectedAreaId}
            onChange={(e) => setSelectedAreaId(e.target.value)}
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

        {/* Project Selection */}
        {selectedAreaId && (
          <div>
            <label htmlFor="project" className="block text-sm font-medium mb-3 text-white">
              Project (Optional)
            </label>
            <select
              id="project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No project (area only)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id} className="bg-gray-800">
                  {project.name}
                </option>
              ))}
            </select>
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
              Leave blank to create an area-level task without a specific project
            </p>
          </div>
        )}

        {/* Task Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-3 text-white">
            {formData.type === 'task' ? 'Task' : formData.type === 'bug' ? 'Bug' : 'Feature'} Title *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 glass rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={
              formData.type === 'task' 
                ? 'e.g., Complete design mockups'
                : formData.type === 'bug'
                ? 'e.g., Fix login button alignment'
                : 'e.g., Add dark mode toggle'
            }
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
            placeholder="Add task details..."
            rows={3}
          />
        </div>

        {/* Priority and Status (or Severity for bugs) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-3 text-white">
              Priority
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low" className="bg-gray-800">Low</option>
              <option value="medium" className="bg-gray-800">Medium</option>
              <option value="high" className="bg-gray-800">High</option>
            </select>
          </div>

          {formData.type === 'bug' ? (
            <div>
              <label htmlFor="severity" className="block text-sm font-medium mb-3 text-white">
                Severity
              </label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="minor" className="bg-gray-800">Minor</option>
                <option value="major" className="bg-gray-800">Major</option>
                <option value="critical" className="bg-gray-800">Critical</option>
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-3 text-white">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="backlog" className="bg-gray-800">Backlog</option>
                <option value="idea" className="bg-gray-800">Idea</option>
                <option value="idea_validation" className="bg-gray-800">Idea Validation</option>
                <option value="exploration" className="bg-gray-800">Exploration</option>
                <option value="planning" className="bg-gray-800">Planning</option>
                <option value="executing" className="bg-gray-800">Executing</option>
                <option value="complete" className="bg-gray-800">Complete</option>
                <option value="dismissed" className="bg-gray-800">Dismissed</option>
              </select>
            </div>
          )}
        </div>

        {/* Due Date and Do Date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium mb-3 text-white">
              Due Date (Optional)
            </label>
            <input
              type="date"
              id="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="do_date" className="block text-sm font-medium mb-3 text-white">
              Do Date (Optional)
            </label>
            <input
              type="date"
              id="do_date"
              value={formData.do_date}
              onChange={(e) => setFormData({ ...formData, do_date: e.target.value })}
              className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Recurring Task Section */}
        <div className="glass rounded-2xl p-5 border" style={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="is_recurring"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-500 focus:ring-purple-500"
            />
            <label htmlFor="is_recurring" className="text-sm font-medium text-white cursor-pointer">
              Make this a recurring task
            </label>
          </div>

          {formData.is_recurring && (
            <div className="space-y-4 mt-4 pt-4 border-t border-white/10">
              <div>
                <label htmlFor="recurrence_pattern" className="block text-sm font-medium mb-3 text-white">
                  Repeat
                </label>
                <select
                  id="recurrence_pattern"
                  value={formData.recurrence_pattern}
                  onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value as any })}
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily" className="bg-gray-800">Daily</option>
                  <option value="weekly" className="bg-gray-800">Weekly</option>
                  <option value="monthly" className="bg-gray-800">Monthly</option>
                  <option value="yearly" className="bg-gray-800">Yearly</option>
                </select>
              </div>

              <div>
                <label htmlFor="recurrence_end_date" className="block text-sm font-medium mb-3 text-white">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  id="recurrence_end_date"
                  value={formData.recurrence_end_date}
                  onChange={(e) => setFormData({ ...formData, recurrence_end_date: e.target.value })}
                  className="w-full px-4 py-3 glass rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)' }}>
                  Leave blank for tasks that repeat indefinitely
                </p>
              </div>
            </div>
          )}
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
            {isSubmitting ? 'Creating...' : `Create ${formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
