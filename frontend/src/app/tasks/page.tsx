'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import { StatusBadge, PriorityBadge } from '@/components/Badges';
import { taskApi } from '@/features/tasks/api';
import { projectApi } from '@/features/projects/api';
import { userApi } from '@/features/users/api';
import type { Task, Project, User } from '@/types';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import KanbanBoard from '@/components/KanbanBoard';
import {
  HiOutlineClipboardList,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineFilter,
  HiOutlineCalendar,
  HiOutlineSearch,
  HiOutlineViewBoards,
  HiOutlineViewList,
} from 'react-icons/hi';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [kanbanTasks, setKanbanTasks] = useState<Task[]>([]);

  const [searchInput, setSearchInput] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    project_id: '',
    assigned_to: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    due_date: '',
    assigned_to: '',
    project_id: '',
  });

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }));
      setPage(1);
    }, 400);
  };

  const fetchTasks = useCallback(async () => {
    try {
      setFetching(true);
      if (viewMode === 'kanban') {
        // Fetch all tasks for kanban (no pagination)
        const res = await taskApi.getAll({
          ...filters,
          page: 1,
          limit: 200,
        });
        setKanbanTasks(res.data);
        setTasks(res.data);
        setTotalPages(1);
      } else {
        const res = await taskApi.getAll({
          ...filters,
          page,
          limit: 10,
        });
        setTasks(res.data);
        setTotalPages(res.totalPages);
      }
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setFetching(false);
      setInitialLoading(false);
    }
  }, [page, filters, viewMode]);

  const fetchMeta = useCallback(async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        projectApi.getAll(1, 100),
        userApi.getAll(),
      ]);
      setProjects(projRes.data);
      setAllUsers(usersRes);
    } catch {
      console.error('Failed to load metadata');
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchMeta();
  }, [fetchMeta]);

  const openCreate = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', due_date: '', assigned_to: '', project_id: '' });
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || '',
      assigned_to: task.assigned_to?.toString() || '',
      project_id: task.project_id.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.project_id) {
      toast.error('Please select a project');
      return;
    }
    setSubmitting(true);
    try {
      const payload: {
        title: string;
        description?: string;
        status: Task['status'];
        priority: Task['priority'];
        due_date: string | null;
        assigned_to: number | null;
        project_id: number;
      } = {
        title: taskForm.title,
        description: taskForm.description || undefined,
        status: taskForm.status as Task['status'],
        priority: taskForm.priority as Task['priority'],
        due_date: taskForm.due_date || null,
        assigned_to: taskForm.assigned_to ? parseInt(taskForm.assigned_to) : null,
        project_id: parseInt(taskForm.project_id),
      };

      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
        toast.success('Task updated!');
      } else {
        await taskApi.create(payload);
        toast.success('Task created!');
      }

      setShowModal(false);
      fetchTasks();
    } catch (err) {
      toast.error((err as AxiosError<{ message: string }>).response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskApi.delete(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      // Optimistically update local state immediately for smooth UX
      const updateStatus = (prev: Task[]) =>
        prev.map((t) => (t.id === id ? { ...t, status: status as Task['status'] } : t));
      setTasks(updateStatus);
      setKanbanTasks(updateStatus);

      await taskApi.update(id, { status: status as Task['status'] });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
      // Revert on failure
      fetchTasks();
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({ status: '', priority: '', project_id: '', assigned_to: '', search: '', sortBy: 'created_at', sortOrder: 'DESC' });
    setPage(1);
  };

  const hasActiveFilters = filters.status || filters.priority || filters.project_id || filters.assigned_to || filters.search;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">Tasks</h1>
            <p className="text-surface-500 mt-1">View and manage all your tasks across projects</p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex items-center bg-white border border-surface-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                }`}
                title="Table view"
              >
                <HiOutlineViewList className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                }`}
                title="Kanban board"
              >
                <HiOutlineViewBoards className="w-4 h-4" />
                <span className="hidden sm:inline">Board</span>
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl transition-colors cursor-pointer ${
                hasActiveFilters ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-surface-600 bg-white border border-surface-200 hover:bg-surface-50'
              }`}
            >
              <HiOutlineFilter className="w-4 h-4" />
              Filters {hasActiveFilters && '•'}
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/25 cursor-pointer"
            >
              <HiOutlinePlus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-surface-100 p-5 mb-6 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={filters.status}
                onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
                className="px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <select
                value={filters.priority}
                onChange={(e) => { setFilters({ ...filters, priority: e.target.value }); setPage(1); }}
                className="px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <select
                value={filters.project_id}
                onChange={(e) => { setFilters({ ...filters, project_id: e.target.value }); setPage(1); }}
                className="px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <select
                value={filters.assigned_to}
                onChange={(e) => { setFilters({ ...filters, assigned_to: e.target.value }); setPage(1); }}
                className="px-3 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">All Assignees</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-xs text-primary-600 font-medium hover:text-primary-700 cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Tasks Table */}
        {/* Fetching indicator */}
        {fetching && !initialLoading && (
          <div className="h-1 bg-primary-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-primary-500 rounded-full animate-pulse w-2/3" />
          </div>
        )}

        {initialLoading ? (
          <LoadingSpinner text="Loading tasks..." />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={<HiOutlineClipboardList className="w-8 h-8" />}
            title={hasActiveFilters ? 'No matching tasks' : 'No tasks yet'}
            description={hasActiveFilters ? 'Try adjusting your filters to find what you\'re looking for.' : 'Create your first task to start tracking your work.'}
            action={
              hasActiveFilters ? (
                <button onClick={clearFilters} className="text-sm text-primary-600 font-medium hover:text-primary-700 cursor-pointer">
                  Clear filters
                </button>
              ) : (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary-600/25 cursor-pointer"
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  Create Task
                </button>
              )
            }
          />
        ) : viewMode === 'kanban' ? (
          /* ── Kanban Board View ── */
          <KanbanBoard
            tasks={kanbanTasks}
            onStatusChange={handleStatusChange}
            onEdit={openEdit}
            onDelete={handleDelete}
            showProject
          />
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-100">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Task</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Project</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Priority</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Assignee</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Due Date</th>
                      <th className="text-right px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-surface-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-surface-900">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-surface-400 mt-0.5 truncate max-w-xs">{task.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/projects/${task.project_id}`}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {task.project?.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="text-xs bg-transparent border-0 p-0 focus:outline-none focus:ring-0 cursor-pointer font-semibold"
                            style={{
                              color: task.status === 'TODO' ? '#64748b' : task.status === 'IN_PROGRESS' ? '#d97706' : '#059669'
                            }}
                          >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="px-6 py-4">
                          {task.assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center">
                                <span className="text-[10px] font-bold">
                                  {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </span>
                              </div>
                              <span className="text-sm text-surface-600">{task.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-surface-400">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {task.due_date ? (
                            <span className="flex items-center gap-1 text-sm text-surface-600">
                              <HiOutlineCalendar className="w-3.5 h-3.5 text-surface-400" />
                              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          ) : (
                            <span className="text-sm text-surface-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(task)} className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer">
                              <HiOutlinePencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(task.id)} className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-surface-100">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-surface-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-surface-900">{task.title}</p>
                        <p className="text-xs text-primary-600 mt-0.5">{task.project?.name}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(task)} className="p-1.5 text-surface-400 hover:text-primary-600 cursor-pointer">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="p-1.5 text-surface-400 hover:text-red-600 cursor-pointer">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      {task.assignee && (
                        <span className="text-xs text-surface-500">{task.assignee.name}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-surface-600 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-surface-500">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-surface-600 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Create/Edit Task Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingTask ? 'Edit Task' : 'Create Task'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Project *</label>
              <select
                value={taskForm.project_id}
                onChange={(e) => setTaskForm({ ...taskForm, project_id: e.target.value })}
                required
                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">Select project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Title *</label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Task title"
                required
                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Description..."
                rows={3}
                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Status</label>
                <select
                  value={taskForm.status}
                  onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Assign To</label>
                <select
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                >
                  <option value="">Unassigned</option>
                  {allUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary-600/25 cursor-pointer"
              >
                {submitting ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
