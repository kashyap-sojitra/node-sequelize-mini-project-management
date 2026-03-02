import api from '@/lib/api';
import type { User } from '@/types';

export const userApi = {
  getAll: async () => {
    const res = await api.get<{ status: string; data: User[] }>('/users');
    return res.data.data;
  },

  getById: async (id: number) => {
    const res = await api.get<{ status: string; data: { user: User } }>(`/users/${id}`);
    return res.data.data.user;
  },
};
