import apiClient from './authAPI';

export interface UserRecord {
  id: string;
  email: string;
  full_name?: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  is_active: boolean;
  phone?: string;
  created_at: string;
  image?: string;
  is_approved?: boolean;
  teacher_id?: string;
}

export interface UsersResponse {
  data: UserRecord[];
  total: number;
  limit: number;
  offset: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
}

// ✅ รวมทุก API ไว้ใน userAPI ก้อนเดียว
export const userAPI = {
  getAllUsers: (limit = 100, offset = 0) =>
    apiClient.get<UsersResponse>(`/users?limit=${limit}&offset=${offset}`),

  getUsersByRole: (role: 'STUDENT' | 'TEACHER' | 'ADMIN', limit = 100, offset = 0) =>
    apiClient.get<UsersResponse>(`/users?role=${role}&limit=${limit}&offset=${offset}`),

  getUserById: (id: string) =>
    apiClient.get(`/users/${id}`),

  getDashboardStats: () =>
    apiClient.get<DashboardStats>('/users/dashboard/stats'),

  deleteUser: (id: string) =>
    apiClient.delete<{ message: string }>(`/users/${id}`),

  approveTeacher: (teacherId: string) =>
    apiClient.post<any>(`/teachers/${teacherId}/approve`),
};

export default userAPI;