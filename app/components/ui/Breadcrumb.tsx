'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  color?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm mb-6 overflow-x-auto" style={{ color: 'var(--color-text-tertiary)' }}>
      {/* Home Icon */}
      <Link 
        href="/" 
        className="flex items-center gap-1.5 hover:text-blue-400 transition-colors flex-shrink-0"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <Home size={16} strokeWidth={2} />
        <span>Home</span>
      </Link>

      {/* Breadcrumb Items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 flex-shrink-0">
          <ChevronRight size={16} strokeWidth={2} style={{ color: 'var(--color-text-tertiary)' }} />
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-blue-400 transition-colors truncate max-w-[200px]"
              style={{ color: item.color || 'var(--color-text-secondary)' }}
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className="font-medium truncate max-w-[200px]"
              style={{ color: item.color || 'var(--color-text-primary)' }}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
