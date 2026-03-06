import apiClient from './authAPI';

// ==================== INTERFACES ====================
export interface Exam {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  type: 'PRETEST' | 'POSTTEST' | 'MIDTERM' | 'FINAL' | 'QUIZ';
  total_score: number;
  start_time?: Date;
  end_time?: Date;
  created_at: Date;
}

export interface Question {
  id: string;
  exam_id: string;
  lesson_id?: string;
  question_text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  score_points: number;
  sequence_order?: number;
}

export interface Choice {
  id: string;
  question_id: string;
  choice_label: string; // 'A', 'B', 'C', 'D'
  choice_text: string;
  is_correct: boolean;
}

export interface CreateExamData {
  course_id: string;
  title: string;
  description?: string;
  type: 'PRETEST' | 'POSTTEST' | 'MIDTERM' | 'FINAL' | 'QUIZ';
  total_score?: number;
  start_time?: Date;
  end_time?: Date;
}

export interface UpdateExamData {
  title?: string;
  description?: string;
  type?: 'PRETEST' | 'POSTTEST' | 'MIDTERM' | 'FINAL' | 'QUIZ';
  total_score?: number;
  start_time?: Date;
  end_time?: Date;
}

export interface CreateQuestionData {
  question_text: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  score_points?: number;
  sequence_order?: number;
  lesson_id?: string;
}

export interface UpdateQuestionData {
  question_text?: string;
  type?: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';
  score_points?: number;
  sequence_order?: number;
  lesson_id?: string;
}

export interface CreateChoiceData {
  choice_label: string;
  choice_text: string;
  is_correct: boolean;
}

export interface UpdateChoiceData {
  choice_label?: string;
  choice_text?: string;
  is_correct?: boolean;
}

// ==================== EXAM APIs ====================
export const examAPI = {
  // ---------- EXAMS ----------
  /**
   * สร้างข้อสอบใหม่
   */
  createExam: (data: CreateExamData) =>
    apiClient.post('/exams', data),

  /**
   * ดูข้อสอบพร้อมคำถามและตัวเลือกทั้งหมด
   */
  getExam: (id: string) =>
    apiClient.get(`/exams/${id}`),

  /**
   * ดูข้อสอบทั้งหมดในคอร์ส
   */
  getExamsByCourse: (courseId: string) =>
    apiClient.get(`/exams/course/${courseId}`),

  /**
   * แก้ไขข้อสอบ
   */
  updateExam: (id: string, data: UpdateExamData) =>
    apiClient.put(`/exams/${id}`, data),

  /**
   * ลบข้อสอบ (จะลบคำถามและตัวเลือกทั้งหมดด้วย)
   */
  deleteExam: (id: string) =>
    apiClient.delete(`/exams/${id}`),

  // ---------- QUESTIONS ----------
  /**
   * สร้างคำถามใหม่ในข้อสอบ
   */
  createQuestion: (examId: string, data: CreateQuestionData) =>
    apiClient.post(`/exams/${examId}/questions`, data),

  /**
   * ดูคำถามทั้งหมดในข้อสอบ
   */
  getQuestionsByExam: (examId: string) =>
    apiClient.get(`/exams/${examId}/questions`),

  /**
   * ดูคำถามเดียวพร้อมตัวเลือก
   */
  getQuestion: (questionId: string) =>
    apiClient.get(`/exams/question/${questionId}`),

  /**
   * แก้ไขคำถาม
   */
  updateQuestion: (questionId: string, data: UpdateQuestionData) =>
    apiClient.put(`/exams/question/${questionId}`, data),

  /**
   * ลบคำถาม (จะลบตัวเลือกทั้งหมดด้วย)
   */
  deleteQuestion: (questionId: string) =>
    apiClient.delete(`/exams/question/${questionId}`),

  // ---------- CHOICES ----------
  /**
   * สร้างตัวเลือกใหม่ในคำถาม
   */
  createChoice: (questionId: string, data: CreateChoiceData) =>
    apiClient.post(`/exams/question/${questionId}/choices`, data),

  /**
   * ดูตัวเลือกทั้งหมดในคำถาม
   */
  getChoicesByQuestion: (questionId: string) =>
    apiClient.get(`/exams/question/${questionId}/choices`),

  /**
   * แก้ไขตัวเลือก
   */
  updateChoice: (choiceId: string, data: UpdateChoiceData) =>
    apiClient.put(`/exams/choice/${choiceId}`, data),

  /**
   * ลบตัวเลือก
   */
  deleteChoice: (choiceId: string) =>
    apiClient.delete(`/exams/choice/${choiceId}`),
};

export default examAPI;
