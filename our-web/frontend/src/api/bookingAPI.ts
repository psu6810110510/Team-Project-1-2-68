import apiClient from './authAPI';

export const LearningMode = {
  ONLINE: 'ONLINE',
  ONSITE: 'ONSITE',
  HYBRID: 'HYBRID',
} as const;
export type LearningMode = typeof LearningMode[keyof typeof LearningMode];

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;
export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export interface Schedule {
  id: string;
  course_id: string;
  start_time: string;
  end_time: string;
  max_onsite_seats: number | null;
  room_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleStats {
  schedule_id: string;
  online_count: number;
  onsite_count: number;
  hybrid_count: number;
  available_seats: number;
}

export interface Booking {
  id: string;
  user_id: string;
  schedule_id: string;
  learning_mode: LearningMode;
  status: BookingStatus;
  booking_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CreateBookingDto {
  user_id: string;
  schedule_id: string;
  learning_mode: LearningMode;
  notes?: string;
}

export const bookingAPI = {
  // Create booking
  createBooking: (data: CreateBookingDto) =>
    apiClient.post<{ id: string; status: BookingStatus; learning_mode: LearningMode; message: string }>('/bookings', data),

  // Get booking by ID
  getBooking: (id: string) =>
    apiClient.get<Booking>(`/bookings/${id}`),

  // Get all bookings for a user
  getBookingsByUser: (userId: string) =>
    apiClient.get<{ data: Booking[]; total: number; user_id: string }>(`/bookings/user/${userId}`),

  // Get all bookings for a schedule
  getBookingsBySchedule: (scheduleId: string) =>
    apiClient.get<{ data: Booking[]; total: number; schedule_id: string }>(`/bookings/schedule/${scheduleId}`),

  // Get booking statistics for a schedule
  getScheduleStats: (scheduleId: string) =>
    apiClient.get<ScheduleStats>(`/bookings/schedule/${scheduleId}/stats`),

  // Confirm booking
  confirmBooking: (id: string) =>
    apiClient.put<{ id: string; status: BookingStatus; message: string }>(`/bookings/${id}/confirm`),

  // Cancel booking
  cancelBooking: (id: string) =>
    apiClient.put<{ id: string; status: BookingStatus; message: string }>(`/bookings/${id}/cancel`),

  // Get available schedules for a course
  getSchedulesByCourse: (courseId: string) =>
    apiClient.get<{ data: Schedule[] }>(`/schedules/course/${courseId}`),
};

export default bookingAPI;
