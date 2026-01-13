'use client';

import { motion } from 'framer-motion';
import { Edit3, Plus, Target } from 'lucide-react';
import Link from 'next/link';
import * as Icons from 'lucide-react';

interface TodaysFocusItem {
  id: string;
  areaId: string;
  areaName: string;
  areaColor: string;
  areaIcon: string | null;
}

interface TodaysFocusCardProps {
  todaysFocus: TodaysFocusItem[];
  onEditFocus: () => void;
}

export function TodaysFocusCard({ todaysFocus, onEditFocus }: TodaysFocusCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
      className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 mb-6 sm:mb-8"
      style={{ 
        borderColor: 'rgba(155, 110, 255, 0.25)',
        background: 'linear-gradient(135deg, rgba(155, 110, 255, 0.15), rgba(255, 159, 202, 0.15))',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(155, 110, 255, 0.3), rgba(255, 159, 202, 0.2))',
              border: '1.5px solid rgba(155, 110, 255, 0.4)',
            }}
          >
            <Target size={18} className="text-purple-400 sm:w-5 sm:h-5" strokeWidth={2.5} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
            Today's Focus
          </h2>
        </div>
        <button
          onClick={onEditFocus}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-1.5 sm:gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(155, 110, 255, 0.2), rgba(255, 159, 202, 0.15))',
            border: '1.5px solid rgba(155, 110, 255, 0.3)',
            color: 'var(--color-text-primary)',
          }}
        >
          <Edit3 size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">Edit Focus</span>
          <span className="sm:hidden">Edit</span>
        </button>
      </div>

      {/* Focus List */}
      {todaysFocus.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <p className="text-xs sm:text-sm mb-3 sm:mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            No focus domains yet. Add up to 3.
          </p>
          <button
            onClick={onEditFocus}
            className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl transition-all font-medium inline-flex items-center gap-2 text-xs sm:text-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(123, 159, 255, 0.8), rgba(155, 110, 255, 0.8))',
              color: 'white',
            }}
          >
            <Plus size={14} strokeWidth={2.5} className="sm:w-4 sm:h-4" />
            Add Domains
          </button>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {todaysFocus.map((item, index) => {
            // Convert icon name to PascalCase
            const convertIconName = (iconName: string) => {
              if (!iconName) return null;
              return iconName
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join('');
            };

            const iconName = convertIconName(item.areaIcon || '');
            const IconComponent = iconName && (Icons as any)[iconName]
              ? (Icons as any)[iconName]
              : Icons.Circle;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Link
                  href={`/projects/${item.areaId}`}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 glass glass-hover rounded-xl sm:rounded-2xl transition-all block"
                >
                  <div 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0" 
                    style={{ 
                      background: `linear-gradient(135deg, ${item.areaColor}25, ${item.areaColor}15)`,
                      border: `1.5px solid ${item.areaColor}35`,
                      boxShadow: `0 4px 16px ${item.areaColor}20`,
                    }}
                  >
                    <IconComponent size={18} style={{ color: item.areaColor }} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm sm:text-base block" style={{ color: 'var(--color-text-primary)' }}>
                      {item.areaName}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
