import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse, Task, TaskForm } from '@/types';

interface TaskFilters {
  status?: string;
  priority?: string;
  assigned_to?: number | string;
  project_id?: number | string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export const taskApi = {
  getAll: async (filters: TaskFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const res = await api.get<PaginatedResponse<Task>>(`/tasks?${params.toString()}`);
    return res.data;
  },

  getById: async (id: number) => {
    const res = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
    return res.data.data.task;
  },

  getByProject: async (projectId: number, filters: TaskFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
    const res = await api.get<PaginatedResponse<Task>>(`/tasks/project/${projectId}?${params.toString()}`);
    return res.data;
  },

  create: async (data: TaskForm) => {
    const res = await api.post<ApiResponse<{ task: Task }>>('/tasks', data);
    return res.data.data.task;
  },

  update: async (id: number, data: Partial<TaskForm>) => {
    const res = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, data);
    return res.data.data.task;
  },

  delete: async (id: number) => {
    await api.delete(`/tasks/${id}`);
  },
};
