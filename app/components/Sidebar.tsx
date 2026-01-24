'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Focus, Grid3x3, FolderKanban, CheckSquare, Home, X, CheckCircle2, Heart, Inbox, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { 
      name: 'Home', 
      path: '/', 
      icon: Home,
      description: 'Dashboard overview'
    },
    { 
      name: 'Inbox', 
      path: '/inbox', 
      icon: Inbox,
      description: 'Quick capture & organize'
    },
    { 
      name: 'Daily Flow', 
      path: '/daily-flow', 
      icon: Heart,
      description: 'Daily routine checklist'
    },
    { 
      name: 'Focus Mode', 
      path: '/focus', 
      icon: Focus,
      description: 'Today\'s must-do tasks'
    },
    { 
      name: 'Map View', 
      path: '/map', 
      icon: Network,
      description: 'Visual hierarchy'
    },
    { 
      name: 'Areas', 
      path: '/areas', 
      icon: Grid3x3,
      description: 'Life areas'
    },
    { 
      name: 'Projects', 
      path: '/projects', 
      icon: FolderKanban,
      description: 'All projects'
    },
    { 
      name: 'Tasks', 
      path: '/tasks', 
      icon: CheckSquare,
      description: 'All tasks'
    },
    { 
      name: 'Completed', 
      path: '/completed', 
      icon: CheckCircle2,
      description: 'Completed tasks'
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-64 border-r z-50"
            style={{ 
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-elevated)'
            }}
          >
            {/* Logo/Title */}
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
              <Link href="/" onClick={onClose} className="block flex-1">
                <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                  🌸 Andrea's Project Manager 🌸
                </h1>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
                  ✨ Your magical workspace ✨
                </p>
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg glass-hover transition-all"
                style={{ color: 'var(--color-text-secondary)' }}
                title="Close menu"
              >
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className="relative block"
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          active ? 'glass' : 'hover:glass'
                        }`}
                        style={{
                          background: active 
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.1))'
                            : undefined,
                          border: active 
                            ? '1px solid rgba(139, 92, 246, 0.3)'
                            : '1px solid transparent',
                        }}
                      >
                        <Icon 
                          size={20} 
                          strokeWidth={2} 
                          style={{ 
                            color: active ? '#A78BFA' : 'var(--color-text-secondary)'
                          }} 
                        />
                        <div className="flex-1">
                          <div 
                            className="text-sm font-medium"
                            style={{ 
                              color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)'
                            }}
                          >
                            {item.name}
                          </div>
                          {active && (
                            <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-xs text-center" style={{ color: 'var(--color-text-tertiary)' }}>
                v1.0.0
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
