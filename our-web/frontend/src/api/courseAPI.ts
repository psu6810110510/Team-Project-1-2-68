import apiClient from './authAPI';

export const CourseLevel = {
  BEGINNER: 'beginner' as const,
  INTERMEDIATE: 'intermediate' as const,
  HARD: 'hard' as const,
};
export type CourseLevel = typeof CourseLevel[keyof typeof CourseLevel];

export const CourseStatus = {
  REQUEST_CREATE: 'REQUEST_CREATE' as const,
  DRAFTING: 'DRAFTING' as const,
  PENDING_REVIEW: 'PENDING_REVIEW' as const,
  PUBLISHED: 'PUBLISHED' as const,
  REJECTED: 'REJECTED' as const,
};
export type CourseStatus = typeof CourseStatus[keyof typeof CourseStatus];

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  status: CourseStatus;
  price?: number;
  level?: CourseLevel;
  students_enrolled: number;
  instructor_id?: string;
  instructor_name?: string;
  tags?: string;
  is_onsite: boolean;
  onsite_seats?: number;
  onsite_days?: string[];
  onsite_time_start?: string;
  onsite_time_end?: string;
  onsite_duration?: string;
  onsite_exam_schedule?: string;
  is_online: boolean;
  online_expiry?: string;
  rejection_reason?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  instructor?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface CreateCourseRequestDto {
  title: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  price?: number;
  level?: CourseLevel;
  instructor_id: string;
  instructor_name?: string;
  tags?: string;
  is_onsite?: boolean;
  onsite_seats?: number;
  onsite_days?: string[];
  onsite_time_start?: string;
  onsite_time_end?: string;
  onsite_duration?: string;
  onsite_exam_schedule?: string;
  is_online?: boolean;
  online_expiry?: string;
}

export interface UpdateCourseDto {
  title?: string;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  price?: number;
  level?: CourseLevel;
  instructor_name?: string;
  tags?: string;
  is_onsite?: boolean;
  onsite_seats?: number;
  onsite_days?: string[];
  onsite_time_start?: string;
  onsite_time_end?: string;
  onsite_duration?: string;
  onsite_exam_schedule?: string;
  is_online?: boolean;
  online_expiry?: string;
  is_active?: boolean;
}

export interface Lesson {
  id?: string;
  course_id: string;
  topic_name: string;
  content?: string;
  video_url?: string;
  pdf_url?: string;
  sequence_order?: number;
}

interface CreateLessonDto {
  topic_name: string;
  content?: string;
  video_url?: string;
  pdf_url?: string;
  sequence_order?: number;
}

export interface CoursesResponse {
  data: Course[];
  total: number;
  limit: number;
  offset: number;
}

export const courseAPI = {
  // ==========================================
  // Public Course Endpoints
  // ==========================================
  getAllCourses: (limit = 100, offset = 0, status?: CourseStatus) => {
    const statusParam = status ? `&status=${status}` : '';
    return apiClient.get<CoursesResponse>(`/courses?limit=${limit}&offset=${offset}${statusParam}`);
  },

  getCourseById: (id: string) =>
    apiClient.get<Course>(`/courses/${id}`),

  // ==========================================
  // Teacher Course Request & Management
  // ==========================================
  createCourseRequest: (data: CreateCourseRequestDto) =>
    apiClient.post<{ id: string; title: string; status: CourseStatus; message: string }>('/courses/request', data),

  updateCourseDetails: (id: string, data: UpdateCourseDto) =>
    apiClient.patch<{ id: string; title: string; status: CourseStatus; message: string }>(`/courses/${id}`, data),

  submitForReview: (id: string) =>
    apiClient.post<{ id: string; status: CourseStatus; message: string }>(`/courses/${id}/submit-review`),

  getCoursesByInstructor: (instructorId: string, limit = 50, offset = 0) =>
    apiClient.get<CoursesResponse>(`/courses/by-instructor/${instructorId}?limit=${limit}&offset=${offset}`),

  deleteCourse: (id: string) =>
    apiClient.delete<{ message: string }>(`/courses/${id}`),

  // ==========================================
  // Admin Approval & Management
  // ==========================================
  approveCreateRequest: (id: string) =>
    apiClient.post<{ id: string; status: CourseStatus; message: string }>(`/courses/${id}/approve-create`),

  rejectCreateRequest: (id: string, reason?: string) =>
    apiClient.post<{ id: string; status: CourseStatus; message: string }>(`/courses/${id}/reject-create`, { reason }),

  approvePublish: (id: string) =>
    apiClient.post<{ id: string; status: CourseStatus; message: string }>(`/courses/${id}/approve-publish`),

  rejectPublish: (id: string, reason?: string) =>
    apiClient.post<{ id: string; status: CourseStatus; message: string }>(`/courses/${id}/reject-publish`, { reason }),

  getCoursesByStatus: (status: CourseStatus, limit = 50, offset = 0) =>
    apiClient.get<CoursesResponse>(`/courses/by-status/${status}?limit=${limit}&offset=${offset}`),

  // ==========================================
  // Lesson Management
  // ==========================================
  createLesson: (courseId: string, data: CreateLessonDto) =>
    apiClient.post<{ id: string; topic_name: string; message: string }>(`/courses/${courseId}/lessons`, data),

  getLessonsByCourse: (courseId: string, limit = 50, offset = 0) =>
    apiClient.get<{ data: Lesson[]; total: number; course_id: string }>(`/courses/${courseId}/lessons?limit=${limit}&offset=${offset}`),

  getLessonById: (lessonId: string) =>
    apiClient.get<Lesson>(`/courses/lessons/${lessonId}`),

  updateLesson: (lessonId: string, data: Partial<CreateLessonDto>) =>
    apiClient.put<{ id: string; message: string }>(`/courses/lessons/${lessonId}`, data),

  // ==========================================
  // File Upload
  // ==========================================
  uploadVideo: async (file: File): Promise<{ url: string; filename: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{ url: string; filename: string; message: string }>(
      '/upload/video',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  getOnsiteBookedCount: (courseId: string) =>
    apiClient.get<{ count: number }>(`/bookings/course/${courseId}/onsite-count`),

  uploadPdf: async (file: File): Promise<{ url: string; filename: string; message: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<{ url: string; filename: string; message: string }>(
      '/upload/pdf',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

export default courseAPI;
