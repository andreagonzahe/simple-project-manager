'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import Link from 'next/link';

interface InboxItem {
  id: string;
  title: string;
  created_at: string;
}

interface InboxCardProps {
  onSuccess?: () => void;
}

export function InboxCard({ onSuccess }: InboxCardProps) {
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentItems, setRecentItems] = useState<InboxItem[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!newItemTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('inbox')
        .insert([{
          title: newItemTitle.trim(),
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to recent items
      if (data) {
        setRecentItems(prev => [data, ...prev].slice(0, 3));
      }

      setNewItemTitle('');
      setShowRecent(true);
      onSuccess?.();
      
      // Focus input again for quick entry
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error('Error adding to inbox:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6 sm:mb-8"
    >
      <div 
        className="glass rounded-3xl p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08))',
          border: '1.5px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
                border: '1.5px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.15)',
              }}
            >
              <Inbox size={22} style={{ color: '#A78BFA' }} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Quick Capture
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                Brain dump your tasks, organize later
              </p>
            </div>
          </div>
          <Link
            href="/inbox"
            className="px-4 py-2 glass glass-hover rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <span className="hidden sm:inline">View Inbox</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Quick Input */}
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type anything... (Press Enter to add)"
            className="flex-1 px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50"
            style={{
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg-elevated)',
            }}
            disabled={isSubmitting}
          />
          <button
            onClick={handleSubmit}
            disabled={!newItemTitle.trim() || isSubmitting}
            className="px-5 py-3 glass glass-hover rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: newItemTitle.trim() 
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))'
                : undefined,
              color: 'var(--color-text-primary)',
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>

        {/* Recent Items Preview */}
        <AnimatePresence>
          {showRecent && recentItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-2"
            >
              {recentItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-4 py-2 glass rounded-lg text-sm flex items-center gap-2"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#A78BFA' }}
                  />
                  <span className="flex-1 truncate">{item.title}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    Just added
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
