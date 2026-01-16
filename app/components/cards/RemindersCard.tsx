'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Plus, Pencil, Trash2, X } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  created_at: string;
}

interface RemindersCardProps {
  onAddReminder: () => void;
  onEditReminder: (reminder: Reminder) => void;
  onDeleteReminder: (id: string, title: string) => void;
  reminders: Reminder[];
}

export function RemindersCard({ 
  onAddReminder, 
  onEditReminder, 
  onDeleteReminder,
  reminders 
}: RemindersCardProps) {
  // Helper function to check if a date is overdue (ignoring time)
  const isOverdue = (dueDate: string | null, dueTime: string | null): boolean => {
    if (!dueDate) return false;
    
    const now = new Date();
    const due = new Date(dueDate + 'T' + (dueTime || '23:59:59'));
    
    return due < now;
  };

  // Helper function to format date and time nicely
  const formatDueDateTime = (dueDate: string | null, dueTime: string | null): string => {
    if (!dueDate) return '';
    
    const date = new Date(dueDate + 'T00:00:00');
    
    // Format: "Friday, January 16"
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
    
    // If time is provided, format it as "at 4 pm"
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':').map(Number);
      const period = hours >= 12 ? 'pm' : 'am';
      const displayHours = hours % 12 || 12;
      const timeStr = minutes > 0 
        ? `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
        : `${displayHours} ${period}`;
      
      return `${dateStr} at ${timeStr}`;
    }
    
    return dateStr;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 mb-6 sm:mb-8"
      style={{ 
        borderColor: 'rgba(239, 68, 68, 0.2)',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.03))',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <AlertCircle size={18} className="text-red-400 sm:w-5 sm:h-5" strokeWidth={2.5} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Important Reminders
          </h2>
        </div>
        <button
          onClick={onAddReminder}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
            border: '1.5px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--color-text-primary)',
          }}
        >
          <Plus size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Add Reminder</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Reminders List */}
      {reminders.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            No reminders yet. Add important items you need to remember.
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          <AnimatePresence mode="popLayout">
            {reminders.map((reminder, index) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="group glass rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all hover:border-red-400/30"
                style={{ 
                  borderColor: 'rgba(239, 68, 68, 0.15)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {reminder.title}
                    </h3>
                    {reminder.description && (
                      <p className="text-xs sm:text-sm line-clamp-2 mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {reminder.description}
                      </p>
                    )}
                    {reminder.due_date && (
                      <p className="text-xs flex items-center gap-1.5" style={{ 
                        color: isOverdue(reminder.due_date, reminder.due_time) ? '#ef4444' : 'var(--color-text-tertiary)' 
                      }}>
                        <span>📅</span>
                        <span>
                          {formatDueDateTime(reminder.due_date, reminder.due_time)}
                          {isOverdue(reminder.due_date, reminder.due_time) && ' (overdue)'}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEditReminder(reminder)}
                      className="p-1.5 sm:p-2 rounded-lg glass transition-all"
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                      }}
                      aria-label="Edit reminder"
                    >
                      <Pencil size={14} className="text-blue-400 sm:w-4 sm:h-4" strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => onDeleteReminder(reminder.id, reminder.title)}
                      className="p-1.5 sm:p-2 rounded-lg glass transition-all"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                      }}
                      aria-label="Delete reminder"
                    >
                      <Trash2 size={14} className="text-red-400 sm:w-4 sm:h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
