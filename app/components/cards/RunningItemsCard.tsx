'use client';

import { useState, useEffect } from 'react';
import { ArrowUpDown, Filter, Calendar, Tag, AlertCircle, CheckCircle2, Circle } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

interface RunningItem {
  id: string;
  title: string;
  type: 'task' | 'bug' | 'feature';
  status: string;
  priority: string;
  due_date: string | null;
  do_date: string | null;
  created_at: string;
  area_id: string;
  area_name: string;
  area_color: string;
  area_icon: string;
  subdomain_id: string;
}

type SortOption = 'date' | 'area' | 'type' | 'priority' | 'status' | 'due_date' | 'do_date';
type FilterType = 'all' | 'task' | 'bug' | 'feature';
type FilterStatus = 'all' | 'todo' | 'in_progress' | 'blocked';
type FilterPriority = 'all' | 'low' | 'medium' | 'high' | 'critical';

export function RunningItemsCard() {
  const [items, setItems] = useState<RunningItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<RunningItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('do_date');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('executing');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterArea, setFilterArea] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [areas, setAreas] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchItems();
    fetchAreas();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [items, sortBy, filterType, filterStatus, filterPriority, filterArea]);

  const fetchAreas = async () => {
    const { data } = await supabase
      .from('areas_of_life')
      .select('id, name')
      .order('name');
    if (data) setAreas(data);
  };

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const allItems: RunningItem[] = [];

      // Fetch tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          status,
          priority,
          due_date,
          do_date,
          created_at,
          domain_id,
          area_id,
          domains(
            id,
            areas_of_life(
              id,
              name,
              color,
              icon
            )
          ),
          areas_of_life(
            id,
            name,
            color,
            icon
          )
        `);

      if (tasks) {
        tasks.forEach((task: any) => {
          // Get area from either direct link or through domain
          const area = task.areas_of_life || task.domains?.areas_of_life;
          if (area) {
            allItems.push({
              id: task.id,
              title: task.title,
              type: 'task',
              status: task.status,
              priority: task.priority,
              due_date: task.due_date,
              do_date: task.do_date,
              created_at: task.created_at,
              area_id: area.id,
              area_name: area.name,
              area_color: area.color,
              area_icon: area.icon,
              subdomain_id: task.domain_id,
            });
          }
        });
      }

      // Fetch bugs
      const { data: bugs } = await supabase
        .from('bugs')
        .select(`
          id,
          title,
          status,
          severity,
          due_date,
          do_date,
          created_at,
          domain_id,
          area_id,
          domains(
            id,
            areas_of_life(
              id,
              name,
              color,
              icon
            )
          ),
          areas_of_life(
            id,
            name,
            color,
            icon
          )
        `);

      if (bugs) {
        bugs.forEach((bug: any) => {
          // Get area from either direct link or through domain
          const area = bug.areas_of_life || bug.domains?.areas_of_life;
          if (area) {
            allItems.push({
              id: bug.id,
              title: bug.title,
              type: 'bug',
              status: bug.status,
              priority: bug.severity, // Map severity to priority for consistency
              due_date: bug.due_date,
              do_date: bug.do_date,
              created_at: bug.created_at,
              area_id: area.id,
              area_name: area.name,
              area_color: area.color,
              area_icon: area.icon,
              subdomain_id: bug.domain_id,
            });
          }
        });
      }

      // Fetch features
      const { data: features } = await supabase
        .from('features')
        .select(`
          id,
          title,
          status,
          priority,
          due_date,
          do_date,
          created_at,
          domain_id,
          area_id,
          domains(
            id,
            areas_of_life(
              id,
              name,
              color,
              icon
            )
          ),
          areas_of_life(
            id,
            name,
            color,
            icon
          )
        `);

      if (features) {
        features.forEach((feature: any) => {
          // Get area from either direct link or through domain
          const area = feature.areas_of_life || feature.domains?.areas_of_life;
          if (area) {
            allItems.push({
              id: feature.id,
              title: feature.title,
              type: 'feature',
              status: feature.status,
              priority: feature.priority,
              due_date: feature.due_date,
              do_date: feature.do_date,
              created_at: feature.created_at,
              area_id: area.id,
              area_name: area.name,
              area_color: area.color,
              area_icon: area.icon,
              subdomain_id: feature.domain_id,
            });
          }
        });
      }

      setItems(allItems);
    } catch (error) {
      console.error('Error fetching running items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...items];

    // Apply filters
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === filterPriority);
    }

    if (filterArea !== 'all') {
      filtered = filtered.filter(item => item.area_id === filterArea);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'due_date':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'do_date':
          if (!a.do_date && !b.do_date) return 0;
          if (!a.do_date) return 1;
          if (!b.do_date) return -1;
          return new Date(a.do_date).getTime() - new Date(b.do_date).getTime();
        case 'area':
          return a.area_name.localeCompare(b.area_name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) - 
                 (priorityOrder[b.priority as keyof typeof priorityOrder] || 4);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return <CheckCircle2 size={14} />;
      case 'bug': return <AlertCircle size={14} />;
      case 'feature': return <Circle size={14} />;
      default: return <Circle size={14} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return '#EF4444';
      case 'high': return '#F97316';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return 'var(--color-text-tertiary)';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const convertIconName = (iconName: string) => {
    if (!iconName) return null;
    return iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass rounded-3xl p-8 h-fit sticky top-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          Running Items
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg transition-all ${showFilters ? 'glass' : ''}`}
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <Filter size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Sort Dropdown */}
      <div className="mb-6">
        <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-tertiary)' }}>
          SORT BY
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="w-full px-4 py-3 glass rounded-xl text-sm font-medium focus:outline-none transition-all"
          style={{ 
            color: 'var(--color-text-primary)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <option value="date">Date</option>
          <option value="due_date">Due Date</option>
          <option value="do_date">Do Date</option>
          <option value="area">Area</option>
          <option value="type">Type</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6 space-y-4"
          >
            {/* Type Filter */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-tertiary)' }}>
                TYPE
              </label>
              <div className="flex gap-2">
                {(['all', 'task', 'bug', 'feature'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 ${
                      filterType === type ? 'glass' : 'opacity-50 hover:opacity-100'
                    }`}
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-tertiary)' }}>
                STATUS
              </label>
              <div className="flex gap-2">
                {(['all', 'backlog', 'idea', 'idea_validation', 'exploration', 'planning', 'executing', 'complete', 'dismissed'] as FilterStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 ${
                      filterStatus === status ? 'glass' : 'opacity-50 hover:opacity-100'
                    }`}
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {status === 'idea_validation' ? 'Idea Val.' : status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-tertiary)' }}>
                PRIORITY
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'low', 'medium', 'high', 'critical'] as FilterPriority[]).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setFilterPriority(priority)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      filterPriority === priority ? 'glass' : 'opacity-50 hover:opacity-100'
                    }`}
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Area Filter */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--color-text-tertiary)' }}>
                AREA
              </label>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full px-3 py-2 glass rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <option value="all">All Areas</option>
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items Count */}
      <div className="mb-4 text-sm font-light" style={{ color: 'var(--color-text-secondary)' }}>
        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
      </div>

      {/* Items List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="glass rounded-xl p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              No items found
            </p>
          </div>
        ) : (
          filteredItems.map((item, index) => {
            const iconName = convertIconName(item.area_icon || '');
            const AreaIcon = iconName && (Icons as any)[iconName] 
              ? (Icons as any)[iconName] 
              : Icons.Circle;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="glass glass-hover rounded-xl p-4 cursor-pointer transition-all"
              >
                {/* Item Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div 
                      className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: `${item.area_color}20`, border: `1px solid ${item.area_color}40` }}
                    >
                      <AreaIcon size={14} style={{ color: item.area_color }} strokeWidth={2} />
                    </div>
                    <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text-tertiary)' }}>
                      {item.area_name}
                    </span>
                  </div>
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
                    style={{ 
                      color: getPriorityColor(item.priority),
                      background: `${getPriorityColor(item.priority)}20`
                    }}
                  >
                    {getTypeIcon(item.type)}
                    <span className="capitalize">{item.type}</span>
                  </div>
                </div>

                {/* Item Title */}
                <h4 className="text-sm font-semibold mb-2 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
                  {item.title}
                </h4>

                {/* Item Footer */}
                <div className="flex items-center justify-between text-xs">
                  <span 
                    className="px-2 py-1 rounded-md font-medium capitalize"
                    style={{ 
                      background: 'var(--color-bg-glass)',
                      color: 'var(--color-text-secondary)'
                    }}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    {item.do_date && (
                      <div className="flex items-center gap-1" style={{ color: 'var(--color-text-tertiary)' }} title="Do Date">
                        <Calendar size={12} />
                        <span className="font-medium">{formatDate(item.do_date)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1" style={{ color: item.due_date ? 'var(--color-text-tertiary)' : 'var(--color-text-tertiary)' }} title="Due Date">
                      <Calendar size={12} />
                      <span>{formatDate(item.due_date)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
