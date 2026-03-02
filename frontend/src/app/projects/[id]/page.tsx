'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import Modal from '@/components/Modal';
import { StatusBadge } from '@/components/Badges';
import KanbanBoard from '@/components/KanbanBoard';
import { projectApi } from '@/features/projects/api';
import { taskApi } from '@/features/tasks/api';
import { userApi } from '@/features/users/api';
import type { Project, Task, User, ProjectMember } from '@/types';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  HiOutlinePlus,
  HiOutlineUserAdd,
  HiOutlineX,
} from 'react-icons/hi';

const STATUS_COLUMNS = [
  { key: 'TODO' as const, label: 'To Do', color: 'bg-surface-400' },
  { key: 'IN_PROGRESS' as const, label: 'In Progress', color: 'bg-amber-500' },
  { key: 'DONE' as const, label: 'Done', color: 'bg-emerald-500' },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'TODO' as string,
    priority: 'MEDIUM' as string,
    due_date: '',
    assigned_to: '' as string,
  });

  const [addUserId, setAddUserId] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [proj, tasksRes, membersRes] = await Promise.all([
        projectApi.getById(projectId),
        taskApi.getByProject(projectId, { limit: 100 }),
        projectApi.getMembers(projectId),
      ]);
      setProject(proj);
      setTasks(tasksRes.data);
      setMembers(membersRes);
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fetchUsers = async () => {
    try {
      const users = await userApi.getAll();
      setAllUsers(users);
    } catch {
      console.error('Failed to load users');
    }
  };

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', due_date: '', assigned_to: '' });
    fetchUsers();
    setShowTaskModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || '',
      assigned_to: task.assigned_to?.toString() || '',
    });
    fetchUsers();
    setShowTaskModal(true);
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: {
        title: string;
        description?: string;
        status: Task['status'];
        priority: Task['priority'];
        due_date: string | null;
        assigned_to: number | null;
      } = {
        title: taskForm.title,
        description: taskForm.description || undefined,
        status: taskForm.status as Task['status'],
        priority: taskForm.priority as Task['priority'],
        due_date: taskForm.due_date || null,
        assigned_to: taskForm.assigned_to ? parseInt(taskForm.assigned_to) : null,
      };

      if (editingTask) {
        await taskApi.update(editingTask.id, payload);
        toast.success('Task updated!');
      } else {
        await taskApi.create({ ...payload, project_id: projectId });
        toast.success('Task created!');
      }

      setShowTaskModal(false);
      fetchAll();
    } catch (err) {
      toast.error((err as AxiosError<{ message: string }>).response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      // Optimistic update for smooth drag-and-drop UX
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t))
      );
      await taskApi.update(taskId, { status: newStatus as Task['status'] });
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
      fetchAll(); // Revert
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskApi.delete(taskId);
      toast.success('Task deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleAddMember = async () => {
    if (!addUserId) return;
    try {
      await projectApi.addMember(projectId, parseInt(addUserId));
      toast.success('Member added!');
      setAddUserId('');
      fetchAll();
    } catch (err) {
      toast.error((err as AxiosError<{ message: string }>).response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Remove this member?')) return;
    try {
      await projectApi.removeMember(projectId, userId);
      toast.success('Member removed');
      fetchAll();
    } catch (err) {
      toast.error((err as AxiosError<{ message: string }>).response?.data?.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinner text="Loading project..." />
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-surface-500">Project not found</p>
        </div>
      </AppLayout>
    );
  }

  const tasksByStatus = STATUS_COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.key),
  }));
  void tasksByStatus; // referenced by KanbanBoard via tasks prop

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Project Header */}
        <div className="bg-white rounded-2xl border border-surface-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-surface-900">{project.name}</h1>
                <StatusBadge status={project.status} />
              </div>
              {project.description && (
                <p className="text-surface-500 text-sm">{project.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { fetchUsers(); setShowMemberModal(true); }}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-surface-600 bg-surface-50 hover:bg-surface-100 rounded-xl transition-colors cursor-pointer"
              >
                <HiOutlineUserAdd className="w-4 h-4" />
                Members ({members.length})
              </button>
              <button
                onClick={openCreateTask}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/25 cursor-pointer"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          </div>
        </div>

        {/* Kanban Board with Drag & Drop */}
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEdit={openEditTask}
          onDelete={handleDeleteTask}
        />

        {/* Create/Edit Task Modal */}
        <Modal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          title={editingTask ? 'Edit Task' : 'Create Task'}
          size="lg"
        >
          <form onSubmit={handleTaskSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Title</label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Task title"
                required
                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Description..."
                rows={3}
                className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-colors cursor-pointer"
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

        {/* Members Modal */}
        <Modal
          isOpen={showMemberModal}
          onClose={() => setShowMemberModal(false)}
          title="Project Members"
        >
          <div className="space-y-4">
            {/* Add Member */}
            <div className="flex gap-2">
              <select
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">Select user to add...</option>
                {allUsers
                  .filter((u) => !members.some((m) => m.user_id === u.id))
                  .map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
              </select>
              <button
                onClick={handleAddMember}
                disabled={!addUserId}
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                Add
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between px-3 py-3 bg-surface-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {member.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">{member.user?.name}</p>
                      <p className="text-xs text-surface-400">{member.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-surface-500 bg-surface-200 px-2 py-1 rounded-lg">
                      {member.role}
                    </span>
                    {member.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        className="p-1 text-surface-400 hover:text-red-600 rounded cursor-pointer"
                      >
                        <HiOutlineX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
