import apiClient from './authAPI';

export const PaymentStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT' as const,
  PAYMENT_SUBMITTED: 'PAYMENT_SUBMITTED' as const,
  CONFIRMED: 'CONFIRMED' as const,
  REJECTED: 'REJECTED' as const,
};
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface PaymentRecord {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  course_ids: string[];
  course_titles: string[];
  course_prices?: number[];
  total_amount: number;
  status: PaymentStatus;
  reject_reason?: string;
  slip_url?: string;
  created_at: string;
}

export interface CreatePaymentDto {
  user_id: string;
  user_name?: string;
  user_email?: string;
  course_ids: string[];
  course_titles: string[];
  course_prices?: number[];
  total_amount: number;
}

export const paymentAPI = {
  createPayment: (dto: CreatePaymentDto) =>
    apiClient.post<{ id: string; status: PaymentStatus; total_amount: number; message: string }>('/payments', dto),

  submitPayment: (id: string, slipFile: File) => {
    const formData = new FormData();
    formData.append('slip', slipFile);
    return apiClient.post<{ id: string; status: PaymentStatus; slip_url?: string; message: string }>(
      `/payments/${id}/submit`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
  },

  getAllPayments: () =>
    apiClient.get<{ data: PaymentRecord[]; total: number }>('/payments'),

  getUserPayments: (userId: string) =>
    apiClient.get<{ data: PaymentRecord[]; total: number; user_id: string }>(`/payments/user/${userId}`),

  checkCourseAccess: (userId: string, courseId: string) =>
    apiClient.get<{ has_access: boolean }>(`/payments/user/${userId}/course/${courseId}/access`),

  confirmPayment: (id: string) =>
    apiClient.put<{ id: string; status: PaymentStatus; message: string }>(`/payments/${id}/confirm`),

  rejectPayment: (id: string, reason?: string) =>
    apiClient.put<{ id: string; status: PaymentStatus; message: string }>(`/payments/${id}/reject`, { reason }),
};

export default paymentAPI;
