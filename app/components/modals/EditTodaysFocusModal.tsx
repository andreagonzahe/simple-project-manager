'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { supabase } from '@/app/lib/supabase';
import { Plus, Trash2 } from 'lucide-react';

interface FocusItem {
  id: string;
  areaId: string;
  areaName: string;
  areaColor: string;
  areaIcon: string;
}

interface EditTodaysFocusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentFocus: FocusItem[];
}

export function EditTodaysFocusModal({ isOpen, onClose, onSuccess, currentFocus }: EditTodaysFocusModalProps) {
  const [areas, setAreas] = useState<any[]>([]);
  const [focusItems, setFocusItems] = useState<FocusItem[]>(currentFocus);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAreas();
      setFocusItems(currentFocus);
    }
  }, [isOpen, currentFocus]);

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

  const addFocusItem = () => {
    if (focusItems.length >= 3) return;
    
    const firstArea = areas[0];
    if (!firstArea) return;

    setFocusItems([
      ...focusItems,
      {
        id: Date.now().toString(),
        areaId: firstArea.id,
        areaName: firstArea.name,
        areaColor: firstArea.color,
        areaIcon: firstArea.icon || 'Circle',
      },
    ]);
  };

  const updateFocusItem = (id: string, areaId: string) => {
    setFocusItems(
      focusItems.map((item) => {
        if (item.id !== id) return item;

        const area = areas.find((a) => a.id === areaId);
        if (area) {
          return {
            ...item,
            areaId: areaId,
            areaName: area.name,
            areaColor: area.color,
            areaIcon: area.icon || 'Circle',
          };
        }

        return item;
      })
    );
  };

  const removeFocusItem = (id: string) => {
    setFocusItems(focusItems.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('todaysFocus', JSON.stringify(focusItems));
    onSuccess();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Today's Focus" size="lg">
      <div className="space-y-6">
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Select up to 3 domains that you want to focus on today.
        </p>

        <div className="space-y-4">
          {focusItems.map((item, index) => (
            <div key={item.id} className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Domain {index + 1}
                </span>
                <button
                  onClick={() => removeFocusItem(item.id)}
                  className="p-2 rounded-xl glass-hover transition-all"
                  style={{ color: '#FF6B6B' }}
                >
                  <Trash2 size={18} strokeWidth={2.5} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  Select Domain
                </label>
                <select
                  value={item.areaId}
                  onChange={(e) => updateFocusItem(item.id, e.target.value)}
                  className="w-full px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {areas.map((area) => (
                    <option key={area.id} value={area.id} className="bg-gray-800">
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {focusItems.length < 3 && (
          <button
            onClick={addFocusItem}
            className="w-full px-5 py-4 btn-ghost rounded-2xl text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Plus size={20} strokeWidth={2.5} />
            Add Domain ({focusItems.length}/3)
          </button>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 btn-ghost rounded-2xl transition-all"
            style={{ color: 'var(--color-text-primary)' }}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-2xl transition-all font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(123, 159, 255, 0.8), rgba(155, 110, 255, 0.8))',
              color: 'white',
            }}
            disabled={isSubmitting}
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
