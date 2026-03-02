'use client';

import { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { projectApi } from '@/features/projects/api';
import { taskApi } from '@/features/tasks/api';
import { useAuth } from '@/context/AuthContext';
import type { DashboardStats, Task } from '@/types';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import {
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineLightningBolt,
} from 'react-icons/hi';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tasksData] = await Promise.all([
          projectApi.getDashboardStats(),
          taskApi.getAll({ limit: 5, sortBy: 'created_at', sortOrder: 'DESC' }),
        ]);
        setStats(statsData);
        setRecentTasks(tasksData.data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = stats
    ? [
        { label: 'Total Projects', value: stats.projectCount, icon: HiOutlineFolder, color: 'from-primary-500 to-primary-700', bgLight: 'bg-primary-50' },
        { label: 'Total Tasks', value: stats.totalTasks, icon: HiOutlineClipboardList, color: 'from-blue-500 to-blue-700', bgLight: 'bg-blue-50' },
        { label: 'In Progress', value: stats.inProgressTasks, icon: HiOutlineLightningBolt, color: 'from-amber-500 to-amber-700', bgLight: 'bg-amber-50' },
        { label: 'Completed', value: stats.doneTasks, icon: HiOutlineCheckCircle, color: 'from-emerald-500 to-emerald-700', bgLight: 'bg-emerald-50' },
        { label: 'To Do', value: stats.todoTasks, icon: HiOutlineClock, color: 'from-surface-500 to-surface-700', bgLight: 'bg-surface-100' },
        { label: 'Overdue', value: stats.overdueTasks, icon: HiOutlineExclamationCircle, color: 'from-red-500 to-red-700', bgLight: 'bg-red-50' },
      ]
    : [];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-surface-900 mb-1">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-surface-500">Here&apos;s an overview of your workspace</p>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading dashboard..." />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {statCards.map((card, i) => (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl p-4 border border-surface-100 hover:shadow-lg hover:shadow-surface-200/50 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`w-10 h-10 ${card.bgLight} rounded-xl flex items-center justify-center mb-3`}>
                    <card.icon className={`w-5 h-5 ${
                      card.label === 'Total Projects' ? 'text-primary-600' :
                      card.label === 'Total Tasks' ? 'text-blue-600' :
                      card.label === 'In Progress' ? 'text-amber-600' :
                      card.label === 'Completed' ? 'text-emerald-600' :
                      card.label === 'Overdue' ? 'text-red-600' : 'text-surface-600'
                    }`} />
                  </div>
                  <p className="text-2xl font-bold text-surface-900">{card.value}</p>
                  <p className="text-xs text-surface-500 font-medium mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-surface-900">Recent Tasks</h2>
                <Link
                  href="/tasks"
                  className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
                >
                  View all →
                </Link>
              </div>

              {recentTasks.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <HiOutlineClipboardList className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                  <p className="text-surface-500 text-sm">No tasks yet. Create your first task to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-100">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="px-6 py-4 hover:bg-surface-50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 truncate">{task.title}</p>
                        <p className="text-xs text-surface-400 mt-0.5">
                          {task.project?.name}
                          {task.assignee ? ` · ${task.assignee.name}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
