/* ไฟล์: src/pages/ExamManagement.tsx */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search, ShoppingCart, Menu, User, ChevronLeft, PlusCircle, Edit3, Trash2,
  BookOpen, AlertCircle, X, Save, FileText, CheckCircle, Clock
} from 'lucide-react';
import examAPI from '../api/examAPI';
import type { Exam, Question, Choice } from '../api/examAPI';
import courseAPI from '../api/courseAPI';
import '../styles/LoginTheme.css';
import '../styles/Dashboard.css';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';
import Footer from '../components/Footer';

export default function ExamManagement() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  
  // States
  const [exams, setExams] = useState<Exam[]>([]);
  const [courseName, setCourseName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Exam Form States
  const [examForm, setExamForm] = useState({
    title: '',
    description: '',
    type: 'QUIZ' as 'PRETEST' | 'POSTTEST' | 'MIDTERM' | 'FINAL' | 'QUIZ',
    total_score: 100
  });

  // Question & Choice States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: '',
    type: 'MULTIPLE_CHOICE' as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY',
    score_points: 10,
    sequence_order: 1
  });
  const [choices, setChoices] = useState<Choice[]>([]);
  const [newChoice, setNewChoice] = useState({
    choice_label: 'A',
    choice_text: '',
    is_correct: false
  });

  // Load data on mount
  useEffect(() => {
    if (courseId) {
      loadCourseData();
      loadExams();
    }
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const response = await courseAPI.getCourseById(courseId!);
      setCourseName(response.data.title || 'คอร์สเรียน');
    } catch (error) {
      console.error('Error loading course:', error);
    }
  };

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examAPI.getExamsByCourse(courseId!);
      setExams(response.data.data || []);
    } catch (error) {
      console.error('Error loading exams:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อสอบ');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (examId: string) => {
    try {
      const response = await examAPI.getQuestionsByExam(examId);
      setQuestions(response.data.data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadChoices = async (questionId: string) => {
    try {
      const response = await examAPI.getChoicesByQuestion(questionId);
      setChoices(response.data.data || []);
    } catch (error) {
      console.error('Error loading choices:', error);
    }
  };

  // ==================== EXAM CRUD ====================
  const handleCreateExam = async () => {
    if (!examForm.title.trim()) {
      alert('กรุณากรอกชื่อข้อสอบ');
      return;
    }

    try {
      console.log('Creating exam with data:', {
        course_id: courseId,
        ...examForm
      });
      
      const response = await examAPI.createExam({
        course_id: courseId!,
        ...examForm
      });
      
      console.log('Exam created successfully:', response.data);
      alert('✅ สร้างข้อสอบเรียบร้อยแล้ว!');
      closeExamModal();
      loadExams();
    } catch (error: any) {
      console.error('Error creating exam:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'เกิดข้อผิดพลาดในการสร้างข้อสอบ';
      
      alert(`❌ ไม่สามารถสร้างข้อสอบได้\n\nรายละเอียด: ${errorMessage}\n\n💡 กรุณาตรวจสอบ:\n- Backend Server กำลังทำงานอยู่หรือไม่?\n- CourseId: ${courseId}`);
    }
  };

  const handleUpdateExam = async () => {
    if (!selectedExam) return;

    try {
      await examAPI.updateExam(selectedExam.id, examForm);
      alert('✅ แก้ไขข้อสอบเรียบร้อยแล้ว!');
      closeExamModal();
      loadExams();
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไขข้อสอบ');
    }
  };

  const handleDeleteExam = async (examId: string, examTitle: string) => {
    if (!confirm(`คุณต้องการลบข้อสอบ "${examTitle}" ใช่หรือไม่?\n\n⚠️ การลบจะลบคำถามและตัวเลือกทั้งหมดด้วย`)) {
      return;
    }

    try {
      await examAPI.deleteExam(examId);
      alert('✅ ลบข้อสอบเรียบร้อยแล้ว!');
      loadExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อสอบ');
    }
  };

  const openExamModal = (exam?: Exam) => {
    if (exam) {
      // Edit mode
      setEditMode(true);
      setSelectedExam(exam);
      setExamForm({
        title: exam.title,
        description: exam.description || '',
        type: exam.type,
        total_score: exam.total_score
      });
    } else {
      // Create mode
      setEditMode(false);
      setSelectedExam(null);
      setExamForm({
        title: '',
        description: '',
        type: 'QUIZ',
        total_score: 100
      });
    }
    setIsExamModalOpen(true);
  };

  const closeExamModal = () => {
    setIsExamModalOpen(false);
    setEditMode(false);
    setSelectedExam(null);
  };

  // ==================== QUESTION & CHOICE MANAGEMENT ====================
  const openQuestionModal = async (exam: Exam) => {
    setSelectedExam(exam);
    await loadQuestions(exam.id);
    setIsQuestionModalOpen(true);
  };

  const handleCreateQuestion = async () => {
    if (!selectedExam || !currentQuestion.question_text.trim()) {
      alert('กรุณากรอกคำถาม');
      return;
    }

    try {
      await examAPI.createQuestion(selectedExam.id, currentQuestion);
      alert('✅ เพิ่มคำถามเรียบร้อยแล้ว!');
      
      // Reset form
      setCurrentQuestion({
        question_text: '',
        type: 'MULTIPLE_CHOICE',
        score_points: 10,
        sequence_order: questions.length + 2
      });
      
      // Reload questions
      loadQuestions(selectedExam.id);
    } catch (error) {
      console.error('Error creating question:', error);
      alert('เกิดข้อผิดพลาดในการสร้างคำถาม');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('คุณต้องการลบคำถามนี้ใช่หรือไม่?\n\n⚠️ การลบจะลบตัวเลือกทั้งหมดด้วย')) {
      return;
    }

    try {
      await examAPI.deleteQuestion(questionId);
      alert('✅ ลบคำถามเรียบร้อยแล้ว!');
      if (selectedExam) {
        loadQuestions(selectedExam.id);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('เกิดข้อผิดพลาดในการลบคำถาม');
    }
  };

  const handleCreateChoice = async (questionId: string) => {
    if (!newChoice.choice_text.trim()) {
      alert('กรุณากรอกข้อความตัวเลือก');
      return;
    }

    try {
      await examAPI.createChoice(questionId, newChoice);
      
      // Reset form
      setNewChoice({
        choice_label: String.fromCharCode(newChoice.choice_label.charCodeAt(0) + 1),
        choice_text: '',
        is_correct: false
      });
      
      // Reload choices for this question
      loadChoices(questionId);
      alert('✅ เพิ่มตัวเลือกเรียบร้อยแล้ว!');
    } catch (error) {
      console.error('Error creating choice:', error);
      alert('เกิดข้อผิดพลาดในการสร้างตัวเลือก');
    }
  };

  const handleDeleteChoice = async (choiceId: string, questionId: string) => {
    if (!confirm('คุณต้องการลบตัวเลือกนี้ใช่หรือไม่?')) {
      return;
    }

    try {
      await examAPI.deleteChoice(choiceId);
      loadChoices(questionId);
      alert('✅ ลบตัวเลือกเรียบร้อยแล้ว!');
    } catch (error) {
      console.error('Error deleting choice:', error);
      alert('เกิดข้อผิดพลาดในการลบตัวเลือก');
    }
  };

  const getExamTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      PRETEST: 'Pre-Test',
      POSTTEST: 'Post-Test',
      MIDTERM: 'สอบกลางภาค',
      FINAL: 'สอบปลายภาค',
      QUIZ: 'แบบทดสอบ'
    };
    return types[type] || type;
  };

  const getExamTypeBadge = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      PRETEST: { bg: '#eff6ff', text: '#3b82f6' },
      POSTTEST: { bg: '#f0fdf4', text: '#22c55e' },
      MIDTERM: { bg: '#fff7ed', text: '#f97316' },
      FINAL: { bg: '#fef2f2', text: '#ef4444' },
      QUIZ: { bg: '#fefce8', text: '#eab308' }
    };
    const color = colors[type] || { bg: '#f1f5f9', text: '#64748b' };

    return (
      <span style={{
        background: color.bg,
        color: color.text,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600'
      }}>
        {getExamTypeLabel(type)}
      </span>
    );
  };

  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="navbar" style={{ background: '#081324' }}>
        <div className="nav-logo">
          <img src={logoImage} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />
          <img src={fullLogo} alt="Logo" style={{ height: '50px', width: 'auto' }} />
        </div>
        <div className="nav-icons">
          <Search className="nav-icon" size={24} />
          <ShoppingCart className="nav-icon" size={24} />
          <Menu className="nav-icon" size={24} />
          <User className="nav-icon" size={24} />
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ minHeight: 'calc(100vh - 160px)', padding: '2rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Back Button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#64748b' }}
              onClick={() => navigate('/teacher-dashboard')}
            >
              <div style={{ background: '#cbd5e1', borderRadius: '50%', padding: '6px', display: 'flex' }}>
                <ChevronLeft size={20} color="white" />
              </div>
              <span>กลับหน้าแดชบอร์ด</span>
            </div>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.5rem' }}>
                <BookOpen size={28} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle' }} />
                จัดการข้อสอบ
              </h1>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>{courseName}</p>
            </div>
            <button
              onClick={() => openExamModal()}
              style={{
                background: '#0f172a',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              <PlusCircle size={20} /> สร้างข้อสอบใหม่
            </button>
          </div>

          {/* Exam List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Clock size={48} style={{ marginBottom: '1rem' }} />
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : exams.length === 0 ? (
            <div style={{
              background: 'white',
              border: '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '3rem',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <AlertCircle size={48} style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem' }}>ยังไม่มีข้อสอบในคอร์สนี้</p>
              <p style={{ fontSize: '0.9rem' }}>คลิกปุ่ม "สร้างข้อสอบใหม่" เพื่อเริ่มต้น</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                          {exam.title}
                        </h3>
                        {getExamTypeBadge(exam.type)}
                      </div>
                      {exam.description && (
                        <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '0.5rem 0' }}>
                          {exam.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '15px', marginTop: '0.8rem', fontSize: '0.9rem', color: '#64748b' }}>
                        <span>📊 คะแนนเต็ม: <strong>{exam.total_score}</strong></span>
                        <span>📝 จำนวนคำถาม: <strong>-</strong></span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => openQuestionModal(exam)}
                        style={{
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.9rem'
                        }}
                      >
                        <FileText size={16} /> จัดการคำถาม
                      </button>
                      <button
                        onClick={() => openExamModal(exam)}
                        style={{
                          background: 'white',
                          color: '#64748b',
                          border: '1px solid #cbd5e1',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.9rem'
                        }}
                      >
                        <Edit3 size={16} /> แก้ไข
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam.id, exam.title)}
                        style={{
                          background: '#fef2f2',
                          color: '#ef4444',
                          border: '1px solid #fecaca',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.9rem'
                        }}
                      >
                        <Trash2 size={16} /> ลบ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <div className="footer-content">
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>
            © 2026 Born2Code. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ============= EXAM MODAL ============= */}
      {isExamModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            width: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              onClick={closeExamModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={24} color="#94a3b8" />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#0f172a' }}>
              {editMode ? '✏️ แก้ไขข้อสอบ' : '➕ สร้างข้อสอบใหม่'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                  ชื่อข้อสอบ *
                </label>
                <input
                  type="text"
                  value={examForm.title}
                  onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                  placeholder="เช่น Quiz 1: Python Basics"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                  คำอธิบาย
                </label>
                <textarea
                  value={examForm.description}
                  onChange={(e) => setExamForm({ ...examForm, description: e.target.value })}
                  placeholder="คำอธิบายเกี่ยวกับข้อสอบ"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                  ประเภทข้อสอบ *
                </label>
                <select
                  value={examForm.type}
                  onChange={(e) => setExamForm({ ...examForm, type: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                >
                  <option value="QUIZ">แบบทดสอบ (Quiz)</option>
                  <option value="PRETEST">Pre-Test</option>
                  <option value="POSTTEST">Post-Test</option>
                  <option value="MIDTERM">สอบกลางภาค</option>
                  <option value="FINAL">สอบปลายภาค</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>
                  คะแนนเต็ม *
                </label>
                <input
                  type="number"
                  value={examForm.total_score}
                  onChange={(e) => setExamForm({ ...examForm, total_score: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button
                  onClick={closeExamModal}
                  style={{
                    flex: 1,
                    background: 'white',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  ยกเลิก
                </button>
                <button
                  onClick={editMode ? handleUpdateExam : handleCreateExam}
                  style={{
                    flex: 1,
                    background: '#0f172a',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Save size={18} /> {editMode ? 'บันทึกการแก้ไข' : 'สร้างข้อสอบ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============= QUESTION MANAGEMENT MODAL ============= */}
      {isQuestionModalOpen && selectedExam && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            width: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsQuestionModalOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                border: 'none',
                background: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={24} color="#94a3b8" />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#0f172a' }}>
              📝 จัดการคำถาม
            </h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{selectedExam.title}</p>

            {/* Create Question Form */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>
                ➕ เพิ่มคำถามใหม่
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <textarea
                  value={currentQuestion.question_text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })}
                  placeholder="กรอกคำถาม..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as any })}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  >
                    <option value="MULTIPLE_CHOICE">ปรนัย (Multiple Choice)</option>
                    <option value="TRUE_FALSE">ถูก/ผิด</option>
                    <option value="SHORT_ANSWER">คำตอบสั้น</option>
                    <option value="ESSAY">อัตนัย</option>
                  </select>
                  <input
                    type="number"
                    value={currentQuestion.score_points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, score_points: parseInt(e.target.value) || 0 })}
                    placeholder="คะแนน"
                    min="0"
                    style={{
                      width: '120px',
                      padding: '10px 12px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '0.95rem',
                      outline: 'none'
                    }}
                  />
                  <button
                    onClick={handleCreateQuestion}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    + เพิ่มคำถาม
                  </button>
                </div>
              </div>
            </div>

            {/* Question List */}
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#334155' }}>
                📋 รายการคำถาม ({questions.length})
              </h3>
              {questions.length === 0 ? (
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#94a3b8'
                }}>
                  <p>ยังไม่มีคำถาม</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {questions.map((question, index) => (
                    <QuestionItem
                      key={question.id}
                      question={question}
                      index={index}
                      onDelete={handleDeleteQuestion}
                      onLoadChoices={loadChoices}
                      onCreateChoice={handleCreateChoice}
                      onDeleteChoice={handleDeleteChoice}
                      choices={choices}
                      newChoice={newChoice}
                      setNewChoice={setNewChoice}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============== QUESTION ITEM COMPONENT ===============
interface QuestionItemProps {
  question: Question;
  index: number;
  onDelete: (questionId: string) => void;
  onLoadChoices: (questionId: string) => void;
  onCreateChoice: (questionId: string) => void;
  onDeleteChoice: (choiceId: string, questionId: string) => void;
  choices: Choice[];
  newChoice: { choice_label: string; choice_text: string; is_correct: boolean };
  setNewChoice: React.Dispatch<React.SetStateAction<{ choice_label: string; choice_text: string; is_correct: boolean }>>;
}

function QuestionItem({
  question,
  index,
  onDelete,
  onLoadChoices,
  onCreateChoice,
  onDeleteChoice,
  choices,
  newChoice,
  setNewChoice
}: QuestionItemProps) {
  const [showChoices, setShowChoices] = useState(false);
  const [loadedQuestionId, setLoadedQuestionId] = useState<string | null>(null);

  const toggleChoices = async () => {
    if (!showChoices) {
      await onLoadChoices(question.id);
      setLoadedQuestionId(question.id);
    }
    setShowChoices(!showChoices);
  };

  const displayedChoices = loadedQuestionId === question.id ? choices : [];

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '15px',
      background: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: '#0f172a',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: '600'
            }}>
              Q{index + 1}
            </span>
            <span style={{
              background: '#f1f5f9',
              color: '#64748b',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              {question.type}
            </span>
            <span style={{
              background: '#fef3c7',
              color: '#92400e',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              {question.score_points} คะแนน
            </span>
          </div>
          <p style={{ color: '#0f172a', fontSize: '0.95rem', margin: '8px 0' }}>
            {question.question_text}
          </p>
          {question.type === 'MULTIPLE_CHOICE' && (
            <button
              onClick={toggleChoices}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                marginTop: '8px'
              }}
            >
              {showChoices ? '▼ ซ่อนตัวเลือก' : '▶ แสดงตัวเลือก'}
            </button>
          )}
        </div>
        <button
          onClick={() => onDelete(question.id)}
          style={{
            background: '#fef2f2',
            color: '#ef4444',
            border: '1px solid #fecaca',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          <Trash2 size={14} style={{ verticalAlign: 'middle' }} /> ลบ
        </button>
      </div>

      {/* Choices Section */}
      {showChoices && question.type === 'MULTIPLE_CHOICE' && (
        <div style={{
          marginTop: '15px',
          paddingTop: '15px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px', color: '#334155' }}>
            ตัวเลือก:
          </h4>
          
          {/* Add Choice Form */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={newChoice.choice_label}
              onChange={(e) => setNewChoice({ ...newChoice, choice_label: e.target.value })}
              placeholder="A"
              maxLength={1}
              style={{
                width: '50px',
                padding: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}
            />
            <input
              type="text"
              value={newChoice.choice_text}
              onChange={(e) => setNewChoice({ ...newChoice, choice_text: e.target.value })}
              placeholder="ข้อความตัวเลือก..."
              style={{
                flex: 1,
                padding: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              <input
                type="checkbox"
                checked={newChoice.is_correct}
                onChange={(e) => setNewChoice({ ...newChoice, is_correct: e.target.checked })}
                style={{ width: '16px', height: '16px' }}
              />
              ถูกต้อง
            </label>
            <button
              onClick={() => onCreateChoice(question.id)}
              style={{
                background: '#22c55e',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap'
              }}
            >
              + เพิ่ม
            </button>
          </div>

          {/* Choice List */}
          {displayedChoices.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
              ยังไม่มีตัวเลือก
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {displayedChoices.map((choice) => (
                <div
                  key={choice.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: choice.is_correct ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${choice.is_correct ? '#86efac' : '#e2e8f0'}`,
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                  }}
                >
                  <span style={{
                    fontWeight: 'bold',
                    minWidth: '25px',
                    textAlign: 'center',
                    color: choice.is_correct ? '#16a34a' : '#64748b'
                  }}>
                    {choice.choice_label}.
                  </span>
                  <span style={{ flex: 1, color: '#334155' }}>{choice.choice_text}</span>
                  {choice.is_correct && (
                    <span style={{
                      background: '#22c55e',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      <CheckCircle size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      คำตอบ
                    </span>
                  )}
                  <button
                    onClick={() => onDeleteChoice(choice.id, question.id)}
                    style={{
                      background: 'transparent',
                      color: '#ef4444',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
