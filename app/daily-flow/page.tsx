'use client';

import { useEffect, useState } from 'react';
import { Heart, Sparkles, Coffee, Pill, UtensilsCrossed, Zap, Dumbbell, Music, Brain, Moon } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';

interface DailyFlowItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
}

const dailyFlowItems: DailyFlowItem[] = [
  {
    key: 'breakfast',
    label: 'Breakfast',
    icon: <Coffee size={24} />,
    color: '#F59E0B',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 146, 60, 0.15))',
  },
  {
    key: 'am_supplements',
    label: 'AM Supplements and Meds',
    icon: <Pill size={24} />,
    color: '#EC4899',
    bgGradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.15))',
  },
  {
    key: 'lunch',
    label: 'Lunch',
    icon: <UtensilsCrossed size={24} />,
    color: '#10B981',
    bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.15))',
  },
  {
    key: 'productivity_1',
    label: 'Productivity Block 1 (must-do)',
    icon: <Zap size={24} />,
    color: '#8B5CF6',
    bgGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.15))',
  },
  {
    key: 'gym',
    label: 'Gym',
    icon: <Dumbbell size={24} />,
    color: '#EF4444',
    bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))',
  },
  {
    key: 'relax',
    label: 'Relax',
    icon: <Music size={24} />,
    color: '#06B6D4',
    bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.15))',
  },
  {
    key: 'productivity_2',
    label: 'Productivity Block 2 (must-do or, if done, optional)',
    icon: <Brain size={24} />,
    color: '#F97316',
    bgGradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.15))',
  },
  {
    key: 'dinner',
    label: 'Dinner',
    icon: <Sparkles size={24} />,
    color: '#A855F7',
    bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.15))',
  },
  {
    key: 'wind_down',
    label: 'Wind Down for Sleep',
    icon: <Moon size={24} />,
    color: '#6366F1',
    bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(79, 70, 229, 0.15))',
  },
];

export default function DailyFlowPage() {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCompletedItems();
  }, []);

  const fetchCompletedItems = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('daily_flow_completions')
        .select('item_key')
        .eq('completed_date', today);

      if (error) throw error;

      const completed = new Set(data?.map(item => item.item_key) || []);
      setCompletedItems(completed);
    } catch (error) {
      console.error('Error fetching completed items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItem = async (itemKey: string) => {
    const isCompleted = completedItems.has(itemKey);
    const today = new Date().toISOString().split('T')[0];

    // Add to animating set
    setAnimatingItems(prev => new Set(prev).add(itemKey));

    try {
      if (isCompleted) {
        // Uncomplete the item
        const { error } = await supabase
          .from('daily_flow_completions')
          .delete()
          .eq('item_key', itemKey)
          .eq('completed_date', today);

        if (error) throw error;

        setCompletedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
          return newSet;
        });
      } else {
        // Complete the item
        const { error } = await supabase
          .from('daily_flow_completions')
          .insert([
            {
              item_key: itemKey,
              completed_date: today,
            },
          ]);

        if (error) throw error;

        setCompletedItems(prev => new Set(prev).add(itemKey));
      }
    } catch (error) {
      console.error('Error toggling item:', error);
    } finally {
      // Remove from animating set after animation completes
      setTimeout(() => {
        setAnimatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
          return newSet;
        });
      }, 500);
    }
  };

  const completedCount = completedItems.size;
  const totalCount = dailyFlowItems.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-elevated)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.15))',
                  border: '1.5px solid rgba(236, 72, 153, 0.3)',
                }}
              >
                <Heart size={24} className="text-pink-400" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  💖 Daily Flow ✨
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {completedCount} of {totalCount} completed today
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-secondary)' }}>
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  background: 'linear-gradient(90deg, #EC4899, #F59E0B, #10B981, #8B5CF6)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 animate-pulse h-20"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Celebration when all done */}
            <AnimatePresence>
              {completedCount === totalCount && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mb-8 text-center py-8 glass rounded-2xl border-2"
                  style={{ 
                    borderColor: 'rgba(236, 72, 153, 0.4)',
                    background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))',
                  }}
                >
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Amazing Work! 🌟
                  </h2>
                  <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                    You've completed your entire daily flow! ✨
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Daily Flow Items */}
            <div className="space-y-3">
              {dailyFlowItems.map((item, index) => {
                const isCompleted = completedItems.has(item.key);
                const isAnimating = animatingItems.has(item.key);

                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => handleToggleItem(item.key)}
                      className="w-full text-left glass rounded-2xl p-5 sm:p-6 border-2 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                      style={{ 
                        borderColor: isCompleted ? `${item.color}60` : 'var(--color-border)',
                        background: isCompleted ? item.bgGradient : undefined,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}
                        <motion.div
                          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all"
                          style={{
                            borderColor: isCompleted ? item.color : 'var(--color-border)',
                            background: isCompleted ? `${item.color}20` : 'var(--color-bg-secondary)',
                          }}
                          animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {isCompleted && (
                            <motion.svg
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 180 }}
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M4 10L8 14L16 6"
                                stroke={item.color}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </motion.svg>
                          )}
                        </motion.div>

                        {/* Icon */}
                        <div
                          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                          style={{
                            background: `${item.color}20`,
                            border: `2px solid ${item.color}40`,
                            color: item.color,
                          }}
                        >
                          {item.icon}
                        </div>

                        {/* Label */}
                        <div className="flex-1">
                          <h3
                            className={`text-lg sm:text-xl font-bold transition-all ${
                              isCompleted ? 'line-through opacity-60' : ''
                            }`}
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {item.label}
                          </h3>
                        </div>

                        {/* Sparkle effect when completed */}
                        {isCompleted && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="flex-shrink-0"
                          >
                            <Sparkles size={24} style={{ color: item.color }} />
                          </motion.div>
                        )}
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
