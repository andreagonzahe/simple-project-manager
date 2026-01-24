'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Inbox, Trash2, ArrowRight, Plus, FolderOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { OrganizeInboxModal } from '../components/modals/OrganizeInboxModal';
import { EmptyState } from '../components/ui/EmptyState';
import { ToastContainer, useToast } from '../components/ui/Toast';

interface InboxItem {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export default function InboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [organizeModalOpen, setOrganizeModalOpen] = useState(false);
  const [itemToOrganize, setItemToOrganize] = useState<InboxItem | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    fetchInboxItems();
  }, []);

  const fetchInboxItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('inbox')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching inbox items:', error);
      showToast('Failed to load inbox items', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('inbox')
        .insert([{
          title: newItemTitle.trim(),
        }]);

      if (error) throw error;

      setNewItemTitle('');
      showToast('Item added to inbox!', 'success');
      fetchInboxItems();
    } catch (error) {
      console.error('Error adding item:', error);
      showToast('Failed to add item', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setItemToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('inbox')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      showToast('Item deleted', 'success');
      setDeleteModalOpen(false);
      setItemToDelete(null);
      fetchInboxItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('Failed to delete item', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOrganizeClick = (item: InboxItem) => {
    setItemToOrganize(item);
    setOrganizeModalOpen(true);
  };

  const handleOrganizeSuccess = () => {
    showToast('Item organized successfully!', 'success');
    setOrganizeModalOpen(false);
    setItemToOrganize(null);
    fetchInboxItems();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-6 sm:py-8 lg:py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-10 glass rounded-xl w-64"></div>
            <div className="h-16 glass rounded-2xl"></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 glass rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-40 py-6 sm:py-8 lg:py-12">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Inbox', color: '#A78BFA' }
          ]}
        />

        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))',
                border: '1.5px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 4px 16px rgba(139, 92, 246, 0.15)',
              }}
            >
              <Inbox size={26} style={{ color: '#A78BFA' }} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Inbox
              </h1>
              <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-tertiary)' }}>
                {items.length} {items.length === 1 ? 'item' : 'items'} to organize
              </p>
            </div>
          </div>
        </motion.header>

        {/* Quick Add Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div 
            className="glass rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08))',
              border: '1.5px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Quick capture... (Press Enter)"
                className="flex-1 px-4 py-3 glass rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/50"
                style={{
                  color: 'var(--color-text-primary)',
                  background: 'var(--color-bg-elevated)',
                }}
                disabled={isSubmitting}
              />
              <button
                onClick={handleAddItem}
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
          </div>
        </motion.div>

        {/* Inbox Items */}
        {items.length === 0 ? (
          <EmptyState
            title="Inbox is empty"
            description="Start capturing your thoughts and tasks. They'll appear here for you to organize later."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-2xl p-5 group hover:border-purple-400/30 transition-all"
                style={{ border: '1.5px solid var(--color-border)' }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOrganizeClick(item)}
                      className="p-2.5 glass glass-hover rounded-xl transition-all"
                      style={{ color: '#A78BFA' }}
                      title="Organize"
                    >
                      <FolderOpen size={18} strokeWidth={2} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id, item.title)}
                      className="p-2.5 glass glass-hover rounded-xl transition-all"
                      style={{ color: '#EF4444' }}
                      title="Delete"
                    >
                      <Trash2 size={18} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Inbox Item"
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
      />

      {/* Organize Modal */}
      {itemToOrganize && (
        <OrganizeInboxModal
          isOpen={organizeModalOpen}
          onClose={() => {
            setOrganizeModalOpen(false);
            setItemToOrganize(null);
          }}
          onSuccess={handleOrganizeSuccess}
          inboxItem={itemToOrganize}
        />
      )}
    </div>
  );
}
