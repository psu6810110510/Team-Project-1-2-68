import apiClient from './authAPI';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
}

export const userAPI = {
  getDashboardStats: () =>
    apiClient.get<DashboardStats>('/users/dashboard/stats'),
};

export default userAPI;
