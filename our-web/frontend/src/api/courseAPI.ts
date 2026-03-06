import apiClient from './authAPI';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  is_active: boolean;
  created_at: string;
}

export interface CoursesResponse {
  data: Course[];
  total: number;
  limit: number;
  offset: number;
}

export const courseAPI = {
  getAllCourses: (limit = 100, offset = 0) =>
    apiClient.get<CoursesResponse>(`/courses?limit=${limit}&offset=${offset}`),

  getCourseById: (id: string) =>
    apiClient.get(`/courses/${id}`),
};

export default courseAPI;
