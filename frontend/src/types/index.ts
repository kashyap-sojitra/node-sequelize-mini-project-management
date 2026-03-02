// ─── User ───
export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ─── Project ───
export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';
  owner_id: number;
  owner: User;
  members: ProjectMemberUser[];
  created_at: string;
  updated_at: string;
}

export interface ProjectMemberUser extends User {
  ProjectMember: {
    role: 'OWNER' | 'ADMIN' | 'MEMBER';
  };
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: User;
}

// ─── Task ───
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date: string | null;
  project_id: number;
  assigned_to: number | null;
  created_by: number;
  assignee: User | null;
  creator: User;
  project: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

// ─── API ───
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  projectCount: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  overdueTasks: number;
}

// ─── Forms ───
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export interface ProjectForm {
  name: string;
  description?: string;
  memberIds?: number[];
}

export interface TaskForm {
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date?: string | null;
  project_id: number;
  assigned_to?: number | null;
}
