'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Floating sparkle decorations */}
      <div className="sparkle-star sparkle-star-1" aria-hidden="true">✨</div>
      <div className="sparkle-star sparkle-star-2" aria-hidden="true">⭐</div>
      <div className="sparkle-star sparkle-star-3" aria-hidden="true">💫</div>
      <div className="sparkle-star sparkle-star-4" aria-hidden="true">✨</div>
      <div className="sparkle-star sparkle-star-5" aria-hidden="true">⭐</div>
      <div className="sparkle-star sparkle-star-6" aria-hidden="true">💫</div>

      {/* Menu Button - Fixed position */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-3 glass glass-hover rounded-xl transition-all shadow-lg"
        style={{ 
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)'
        }}
        title="Open menu"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content */}
      <main className="min-h-screen relative z-10">
        {children}
      </main>
    </>
  );
}
