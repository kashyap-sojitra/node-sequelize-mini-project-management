'use client';

import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import { StatusBadge } from '@/components/Badges';
import { projectApi } from '@/features/projects/api';
import { userApi } from '@/features/users/api';
import type { Project, User } from '@/types';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  HiOutlineFolder,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUsers,
  HiOutlineCalendar,
} from 'react-icons/hi';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: '', description: '', memberIds: [] as number[] });
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await projectApi.getAll(page, 12);
      setProjects(res.data);
      setTotalPages(res.totalPages);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setInitialLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const fetchUsers = async () => {
    try {
      const users = await userApi.getAll();
      setAllUsers(users);
    } catch {
      console.error('Failed to load users');
    }
  };

  const openCreate = () => {
    setForm({ name: '', description: '', memberIds: [] });
    fetchUsers();
    setShowCreate(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description || '',
      memberIds: project.members?.map((m) => m.id) || [],
    });
    fetchUsers();
    setShowEdit(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await projectApi.create(form);
      toast.success('Project created!');
      setShowCreate(false);
      fetchProjects();
    } catch (err) {
      toast.error((err as AxiosError<{ message: string }>).response?.data?.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setSubmitting(true);
    try {
      await projectApi.update(editingProject.id, {
        name: form.name,
        description: form.description,
      });
      toast.success('Project updated!');
      setShowEdit(false);
      fetchProjects();
    } catch (err) {
      toast.error((err as AxiosError<{ message: string }>).response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project? All tasks in it will also be deleted.')) return;
    try {
      await projectApi.delete(id);
      toast.success('Project deleted');
      fetchProjects();
    } catch (err) {
      toast.error((err as AxiosError<{ message: string }>).response?.data?.message || 'Failed to delete project');
    }
  };

  const toggleMember = (userId: number) => {
    setForm((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter((id) => id !== userId)
        : [...prev.memberIds, userId],
    }));
  };

  const renderFormFields = (isEdit: boolean) => (
    <>
      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">Project Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., Website Redesign"
          required
          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-surface-700 mb-2">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Brief project description..."
          rows={3}
          className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {!isEdit && allUsers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-surface-700 mb-2">Add Members</label>
          <div className="max-h-36 overflow-y-auto space-y-1 border border-surface-200 rounded-xl p-2">
            {allUsers.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={form.memberIds.includes(u.id)}
                  onChange={() => toggleMember(u.id)}
                  className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm font-medium text-surface-900">{u.name}</p>
                  <p className="text-xs text-surface-400">{u.email}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => { setShowCreate(false); setShowEdit(false); }}
          className="px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary-600/25 cursor-pointer"
        >
          {submitting ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </>
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-surface-900">Projects</h1>
            <p className="text-surface-500 mt-1">Manage and organize your team projects</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {initialLoading ? (
          <LoadingSpinner text="Loading projects..." />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<HiOutlineFolder className="w-8 h-8" />}
            title="No projects yet"
            description="Create your first project to start organizing tasks and collaborating with your team."
            action={
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary-600/25 cursor-pointer"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Create Project
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl border border-surface-100 p-5 hover:shadow-lg hover:shadow-surface-200/50 transition-all duration-300 animate-slide-up group"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Link href={`/projects/${project.id}`} className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-surface-900 truncate group-hover:text-primary-600 transition-colors">
                        {project.name}
                      </h3>
                    </Link>
                    <StatusBadge status={project.status} />
                  </div>

                  {project.description && (
                    <p className="text-sm text-surface-500 mb-4 line-clamp-2">{project.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-surface-400 mb-4">
                    <span className="flex items-center gap-1">
                      <HiOutlineUsers className="w-3.5 h-3.5" />
                      {project.owner?.name || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <HiOutlineCalendar className="w-3.5 h-3.5" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      View details →
                    </Link>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(project)}
                        className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-surface-600 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-surface-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm font-medium text-surface-600 bg-white border border-surface-200 rounded-xl hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Modal */}
        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project">
          <form onSubmit={handleCreate} className="space-y-5">
            {renderFormFields(false)}
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Project">
          <form onSubmit={handleUpdate} className="space-y-5">
            {renderFormFields(true)}
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
