import api from '@/lib/api';
import type { ApiResponse, AuthResponse, LoginForm, RegisterForm, User } from '@/types';

export const authApi = {
  login: async (data: LoginForm) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  register: async (data: RegisterForm) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  getProfile: async () => {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/profile');
    return res.data.data.user;
  },
};
