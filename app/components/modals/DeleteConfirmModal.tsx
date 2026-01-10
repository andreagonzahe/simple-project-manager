'use client';

import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-800 rounded-xl">
          <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={24} />
          <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-gray-300 hover:bg-gray-800 rounded-xl transition-colors font-medium"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 font-medium shadow-lg"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
