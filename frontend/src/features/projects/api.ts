import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Project, ProjectForm, ProjectMember, DashboardStats } from '@/types';

export const projectApi = {
  getAll: async (page = 1, limit = 10) => {
    const res = await api.get<PaginatedResponse<Project>>(`/projects?page=${page}&limit=${limit}`);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get<ApiResponse<{ project: Project }>>(`/projects/${id}`);
    return res.data.data.project;
  },

  create: async (data: ProjectForm) => {
    const res = await api.post<ApiResponse<{ project: Project }>>('/projects', data);
    return res.data.data.project;
  },

  update: async (id: number, data: Partial<ProjectForm> & { status?: string }) => {
    const res = await api.put<ApiResponse<{ project: Project }>>(`/projects/${id}`, data);
    return res.data.data.project;
  },

  delete: async (id: number) => {
    await api.delete(`/projects/${id}`);
  },

  getMembers: async (projectId: number) => {
    const res = await api.get<ApiResponse<ProjectMember[]>>(`/projects/${projectId}/members`);
    return res.data.data;
  },

  addMember: async (projectId: number, userId: number, role = 'MEMBER') => {
    const res = await api.post(`/projects/${projectId}/members`, { userId, role });
    return res.data;
  },

  removeMember: async (projectId: number, userId: number) => {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  },

  getDashboardStats: async () => {
    const res = await api.get<ApiResponse<DashboardStats>>('/projects/dashboard/stats');
    return res.data.data;
  },
};
