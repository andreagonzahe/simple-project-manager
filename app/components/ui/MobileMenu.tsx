'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar as CalendarIcon, Edit3 } from 'lucide-react';
import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNewArea: () => void;
  onNewProject: () => void;
  onNewItem: () => void;
  onEditFocus: () => void;
}

export function MobileMenu({ 
  isOpen, 
  onClose, 
  onNewArea, 
  onNewProject, 
  onNewItem,
  onEditFocus 
}: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Slide-out Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[280px] glass border-l-2 z-50 flex flex-col"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Menu
              </h2>
              <button
                onClick={onClose}
                className="p-2 glass glass-hover rounded-xl transition-all"
                aria-label="Close menu"
              >
                <X size={20} strokeWidth={2.5} style={{ color: 'var(--color-text-primary)' }} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <Link
                href="/focus"
                onClick={onClose}
                className="w-full px-4 py-3.5 glass glass-hover rounded-xl text-sm font-medium transition-all flex items-center gap-3"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))',
                  color: 'var(--color-text-primary)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span>Focus Mode</span>
              </Link>

              <Link
                href="/calendar"
                onClick={onClose}
                className="w-full px-4 py-3.5 glass glass-hover rounded-xl text-sm font-medium transition-all flex items-center gap-3"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))',
                  color: 'var(--color-text-primary)'
                }}
              >
                <CalendarIcon size={20} strokeWidth={2} />
                <span>Calendar View</span>
              </Link>

              <button
                onClick={() => {
                  onNewArea();
                  onClose();
                }}
                className="w-full px-4 py-3.5 glass glass-hover rounded-xl text-sm font-medium transition-all flex items-center gap-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Plus size={20} strokeWidth={2} />
                <span>New Area</span>
              </button>

              <button
                onClick={() => {
                  onNewProject();
                  onClose();
                }}
                className="w-full px-4 py-3.5 glass glass-hover rounded-xl text-sm font-medium transition-all flex items-center gap-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Plus size={20} strokeWidth={2} />
                <span>New Project</span>
              </button>

              <button
                onClick={() => {
                  onNewItem();
                  onClose();
                }}
                className="w-full px-4 py-3.5 glass glass-hover rounded-xl text-sm font-medium transition-all flex items-center gap-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Plus size={20} strokeWidth={2} />
                <span>New Item</span>
              </button>

              <button
                onClick={() => {
                  onEditFocus();
                  onClose();
                }}
                className="w-full px-4 py-3.5 glass glass-hover rounded-xl text-sm font-medium transition-all flex items-center gap-3"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Edit3 size={20} strokeWidth={2} />
                <span>Edit Today's Focus</span>
              </button>
            </div>

            {/* Footer Info */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                Andrea's Project Manager
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
