'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import type { AreaOfLife, Project, Task, Bug, Feature } from '@/app/lib/types';
import { transformToTree, type TreeNode } from '@/app/lib/utils/transformToTree';
import { MapCanvas } from './MapCanvas';

export function MapView() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel, filtering out completed items
      const [areasResult, projectsResult, tasksResult, bugsResult, featuresResult] = await Promise.all([
        supabase.from('areas_of_life').select('*').order('sort_order', { ascending: true }),
        supabase.from('projects').select('*').neq('status', 'completed'),
        supabase.from('tasks').select('*').neq('status', 'completed'),
        supabase.from('bugs').select('*').neq('status', 'completed'),
        supabase.from('features').select('*').neq('status', 'completed'),
      ]);

      // Check for errors
      if (areasResult.error) throw areasResult.error;
      if (projectsResult.error) throw projectsResult.error;
      if (tasksResult.error) throw tasksResult.error;
      if (bugsResult.error) throw bugsResult.error;
      if (featuresResult.error) throw featuresResult.error;

      // Transform to tree
      const treeData = transformToTree({
        areas: areasResult.data || [],
        projects: projectsResult.data || [],
        tasks: tasksResult.data || [],
        bugs: bugsResult.data || [],
        features: featuresResult.data || [],
      });

      setTree(treeData);
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load map data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataChanged = () => {
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin" style={{ color: 'var(--color-text-primary)' }} />
          <div className="text-lg font-medium" style={{ color: 'var(--color-text-secondary)' }}>
            Loading map view...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-3xl max-w-md text-center">
          <div className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Failed to load map
          </div>
          <div className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            {error}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 glass glass-hover rounded-xl font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="glass p-8 rounded-3xl max-w-md text-center">
          <div className="text-xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            No data to display
          </div>
          <div className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Create some areas and projects to see them in map view.
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 glass glass-hover rounded-xl font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 px-8 py-6 glass"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-3 glass glass-hover rounded-xl"
              aria-label="Back to home"
            >
              <ArrowLeft size={20} style={{ color: 'var(--color-text-primary)' }} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
                Map View
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                Visual overview of your active project hierarchy
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 px-6 py-3 glass rounded-xl">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500/30 border border-purple-500/40"></div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Areas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/30 border border-blue-500/40"></div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Projects</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/40"></div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Tasks</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Map Canvas */}
      <div className="flex-1 overflow-hidden">
        <MapCanvas tree={tree} onDataChanged={handleDataChanged} />
      </div>
    </div>
  );
}
