'use client';

import { cn } from '@/app/lib/utils';

export type TabValue = 'features' | 'bugs' | 'tasks';

interface Tab {
  value: TabValue;
  label: string;
  count?: number;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

export function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-xs',
                  activeTab === tab.value
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
