'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

interface TaskItem {
  id: string;
  title: string;
  type: 'task' | 'feature' | 'bug';
  status: string;
  priority: string;
  due_date: string;
  do_date: string | null;
  area_name: string;
  area_color: string;
  project_name: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get all days in the current month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  // Fetch tasks for the current month
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const { firstDay, lastDay } = getDaysInMonth(currentDate);
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          status,
          priority,
          due_date,
          do_date,
          domain_id,
          domains!inner(name, area_id, areas_of_life!inner(name, color))
        `)
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .not('due_date', 'is', null);

      // Fetch features
      const { data: featuresData } = await supabase
        .from('features')
        .select(`
          id,
          title,
          status,
          priority,
          due_date,
          do_date,
          domain_id,
          domains!inner(name, area_id, areas_of_life!inner(name, color))
        `)
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .not('due_date', 'is', null);

      // Fetch bugs
      const { data: bugsData } = await supabase
        .from('bugs')
        .select(`
          id,
          title,
          status,
          priority,
          due_date,
          do_date,
          domain_id,
          domains!inner(name, area_id, areas_of_life!inner(name, color))
        `)
        .gte('due_date', startDate)
        .lte('due_date', endDate)
        .not('due_date', 'is', null);

      // Combine and format all items
      const allTasks: TaskItem[] = [
        ...(tasksData || []).map((t: any) => ({
          id: t.id,
          title: t.title,
          type: 'task' as const,
          status: t.status,
          priority: t.priority,
          due_date: t.due_date,
          do_date: t.do_date,
          area_name: t.domains.areas_of_life.name,
          area_color: t.domains.areas_of_life.color,
          project_name: t.domains.name,
        })),
        ...(featuresData || []).map((f: any) => ({
          id: f.id,
          title: f.title,
          type: 'feature' as const,
          status: f.status,
          priority: f.priority,
          due_date: f.due_date,
          do_date: f.do_date,
          area_name: f.domains.areas_of_life.name,
          area_color: f.domains.areas_of_life.color,
          project_name: f.domains.name,
        })),
        ...(bugsData || []).map((b: any) => ({
          id: b.id,
          title: b.title,
          type: 'bug' as const,
          status: b.status,
          priority: b.priority,
          due_date: b.due_date,
          do_date: b.do_date,
          area_name: b.domains.areas_of_life.name,
          area_color: b.domains.areas_of_life.color,
          project_name: b.domains.name,
        })),
      ];

      setTasks(allTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [currentDate]);

  // Get tasks for a specific date
  const getTasksForDate = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];
    
    return tasks.filter(task => task.due_date === dateStr);
  };

  // Get tasks for selected date
  const selectedDateTasks = getTasksForDate(selectedDate.getDate()).filter(
    task => selectedDate.getMonth() === currentDate.getMonth()
  );

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelectedDate = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="min-h-screen">
      <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-10">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold mb-2 flex items-center gap-3" style={{ color: 'var(--color-text-primary)' }}>
                <CalendarIcon size={32} className="text-blue-400" />
                Calendar
              </h1>
              <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                View and manage your tasks by date
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className="px-4 py-2.5 glass glass-hover text-white rounded-xl text-sm font-medium transition-all"
              >
                Today
              </button>
              <Link
                href="/"
                className="px-4 py-2.5 glass glass-hover text-white rounded-xl text-sm font-medium transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">{/* Calendar View */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl p-6 sm:p-8"
            >
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 glass-hover rounded-lg transition-all"
                  >
                    <ChevronLeft size={20} style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                  <button
                    onClick={goToNextMonth}
                    className="p-2 glass-hover rounded-lg transition-all"
                  >
                    <ChevronRight size={20} style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-4">
                {dayNames.map(day => (
                  <div
                    key={day}
                    className="text-center text-xs sm:text-sm font-medium py-2"
                    style={{ color: 'var(--color-text-tertiary)' }}
                  >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 1)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dayTasks = getTasksForDate(day);
                  const hasHighPriority = dayTasks.some(t => t.priority === 'high');

                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`aspect-square rounded-lg p-1 sm:p-2 text-xs sm:text-sm font-medium transition-all relative ${
                        isToday(day)
                          ? 'bg-blue-600 text-white'
                          : isSelectedDate(day)
                          ? 'glass ring-2 ring-blue-400'
                          : dayTasks.length > 0
                          ? 'glass'
                          : 'hover:glass'
                      }`}
                      style={{
                        color: isToday(day) || isSelectedDate(day) ? 'white' : 'var(--color-text-primary)'
                      }}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span>{day}</span>
                        {dayTasks.length > 0 && (
                          <div className="flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                            <div 
                              className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                                hasHighPriority ? 'bg-red-400' : 'bg-blue-400'
                              }`}
                            />
                            <span className="text-[10px] sm:text-xs text-gray-400">{dayTasks.length}</span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Tasks for Selected Date */}
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6 xl:sticky xl:top-8"
            >
              <h3 className="text-base sm:text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </h3>

              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon size={48} className="mx-auto mb-3" style={{ color: 'var(--color-text-tertiary)' }} />
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>No tasks for this day</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {selectedDateTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-all"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: task.area_color }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium mb-1 truncate" style={{ color: 'var(--color-text-primary)' }}>
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                            <span className="capitalize">{task.type}</span>
                            <span>•</span>
                            <span className={`capitalize ${
                              task.priority === 'high' ? 'text-red-400' : 
                              task.priority === 'medium' ? 'text-yellow-400' : 
                              ''
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <div className="mt-2 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                            {task.area_name} → {task.project_name}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded inline-block ${
                        task.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                        task.status === 'in_progress' ? 'bg-blue-600/20 text-blue-400' :
                        'bg-gray-600/20 text-gray-400'
                      }`}>
                        {task.status === 'in_progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
