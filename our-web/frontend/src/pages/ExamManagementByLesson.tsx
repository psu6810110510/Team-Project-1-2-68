/* ไฟล์: src/pages/ExamManagementByLesson.tsx */
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Search, ShoppingCart, Menu, User, ChevronLeft, PlusCircle, Trash2,
  BookOpen, Eye, HelpCircle, Save
} from 'lucide-react';
import examAPI from '../api/examAPI';
import type { Question, Choice } from '../api/examAPI';
import courseAPI from '../api/courseAPI';
import '../styles/LoginTheme.css';
import '../styles/Dashboard.css';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';

interface Lesson {
  id: string;
  topic_name: string;
  questions?: Array<Question & { choices?: Choice[] }>;
  passing_score?: number;
}

export default function ExamManagementByLesson() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isReadOnly = searchParams.get('readonly') === 'true';

  // States
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonPassingScores, setLessonPassingScores] = useState<{ [key: string]: number }>({});
  const [courseName, setCourseName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [courseExam, setCourseExam] = useState<any>(null);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load course data
      const courseResponse = await courseAPI.getCourseById(courseId!);
      setCourseName(courseResponse.data.title || 'คอร์สเรียน');

      // Load lessons
      const lessonsResponse = await courseAPI.getLessonsByCourse(courseId!);
      const allLessons = lessonsResponse.data.data || [];
      console.log('All lessons from API:', allLessons);

      // Group lessons by parent topic
      const groupedLessons: { [key: string]: Lesson } = {};
      
      allLessons.forEach((lesson: any) => {
        const parts = lesson.topic_name.split(' - ');
        const parentName = parts[0];
        
        if (!groupedLessons[parentName]) {
          groupedLessons[parentName] = {
            id: lesson.id,
            topic_name: parentName,
            questions: []
          };
        }
      });

      const lessonsArray = Object.values(groupedLessons);
      console.log('Grouped lessons:', lessonsArray);
      setLessons(lessonsArray);

      // Load passing scores from API
      const initialPassingScores: { [key: string]: number } = {};
      lessonsArray.forEach((lesson) => {
        const rawLesson = allLessons.find((l: any) => l.id === lesson.id);
        initialPassingScores[lesson.id] = rawLesson?.passing_score ?? 0;
      });
      setLessonPassingScores(initialPassingScores);

      // Load or create exam
      const exam = await loadOrCreateCourseExam(courseId!);
      console.log('Course exam loaded:', exam);
      
      // Load questions for all lessons
      if (exam) {
        await loadQuestionsForLessons(lessonsArray, exam.id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const loadOrCreateCourseExam = async (courseId: string) => {
    try {
      const response = await examAPI.getExamsByCourse(courseId);
      const exams = response.data.data || response.data || [];

      let exam;
      if (exams.length > 0) {
        // ใช้ exam เก่าสุด (สร้างก่อน) เสมอ เพื่อป้องกันปัญหา exam ซ้ำ
        exam = exams[0];
      } else {
        // สร้าง exam ใหม่เฉพาะเมื่อยังไม่มีเลย
        const createResponse = await examAPI.createExam({
          course_id: courseId,
          title: 'ข้อสอบคอร์ส',
          description: 'ข้อสอบของคอร์สนี้',
          type: 'QUIZ',
          total_score: 100
        });
        exam = createResponse.data.data || createResponse.data;
      }

      setCourseExam(exam);
      return exam;
    } catch (error) {
      console.error('Error loading/creating course exam:', error);
      return null;
    }
  };

  const loadQuestionsForLessons = async (_lessonsArray: Lesson[], examId: string) => {
    try {
      console.log('Loading questions for exam:', examId);
      const response = await examAPI.getQuestionsByExam(examId);
      console.log('Questions response:', response);
      const allQuestions = response.data.data || response.data || [];
      console.log('All questions loaded:', allQuestions);

      // Group questions by lesson_id
      const questionsByLessonId: { [key: string]: Array<Question & { choices?: Choice[] }> } = {};

      for (const question of allQuestions) {
        console.log('Processing question:', question);
        if (question.lesson_id) {
          if (!questionsByLessonId[question.lesson_id]) {
            questionsByLessonId[question.lesson_id] = [];
          }

          // Load choices for each question
          try {
            const choicesResponse = await examAPI.getChoicesByQuestion(question.id);
            const choices = choicesResponse.data.data || choicesResponse.data || [];
            console.log(`Choices for question ${question.id}:`, choices);
            questionsByLessonId[question.lesson_id].push({
              ...question,
              choices: choices
            });
          } catch (error) {
            console.error(`Error loading choices for question ${question.id}:`, error);
            questionsByLessonId[question.lesson_id].push(question);
          }
        }
      }

      console.log('Questions grouped by lesson:', questionsByLessonId);

      // Update lessons with questions
      setLessons(prev => {
        const updated = prev.map(lesson => ({
          ...lesson,
          questions: questionsByLessonId[lesson.id] || []
        }));
        console.log('Lessons updated with questions:', updated);
        return updated;
      });
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleAddQuestion = async (lessonId: string) => {
    if (!courseExam) {
      alert('ไม่พบข้อสอบของคอร์ส กรุณาลองใหม่อีกครั้ง');
      return;
    }

    try {
      console.log('Creating question for lesson:', lessonId);
      console.log('Course exam ID:', courseExam.id);
      
      const response = await examAPI.createQuestion(courseExam.id, {
        question_text: 'คำถามใหม่',
        type: 'MULTIPLE_CHOICE',
        score_points: 1,
        lesson_id: lessonId
      });

      console.log('Question creation response:', response);
      
      // Handle different response structures
      const newQuestion = response.data.data || response.data;
      
      if (!newQuestion || !newQuestion.id) {
        console.error('Invalid question response:', response);
        alert('เกิดข้อผิดพลาด: ไม่สามารถสร้างคำถามได้');
        return;
      }

      console.log('New question created:', newQuestion);

      // Add default choices for MULTIPLE_CHOICE
      const choiceLabels = ['A', 'B', 'C', 'D'];
      const newChoices: Choice[] = [];

      for (let i = 0; i < 4; i++) {
        const choiceData = {
          choice_label: choiceLabels[i],
          choice_text: `ตัวเลือก ${choiceLabels[i]}`,
          is_correct: i === 0
        };
        try {
          const choiceResponse = await examAPI.createChoice(newQuestion.id, choiceData);
          const responseData = choiceResponse.data.data || choiceResponse.data;
          // merge response with original data to ensure choice_text and is_correct are set
          const newChoice = { ...choiceData, question_id: newQuestion.id, ...responseData };
          if (newChoice.id) {
            newChoices.push(newChoice);
          }
        } catch (error) {
          console.error(`Error creating choice ${i}:`, error);
        }
      }

      console.log('All choices created:', newChoices);

      // Auto-expand the lesson
      setExpandedLessons(prev => {
        const newSet = new Set(prev);
        newSet.add(lessonId);
        return newSet;
      });

      // Update state with new question including choices
      setLessons(prev => {
        const updated = prev.map(lesson =>
          lesson.id === lessonId
            ? {
                ...lesson,
                questions: [
                  ...(lesson.questions || []),
                  { ...newQuestion, choices: newChoices }
                ]
              }
            : lesson
        );
        console.log('Updated lessons state:', updated);
        return updated;
      });
    } catch (error: any) {
      console.error('Error adding question:', error);
      console.error('Error response:', error.response?.data);
      alert(`เกิดข้อผิดพลาดในการเพิ่มคำถาม: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateQuestion = async (
    lessonId: string,
    questionIndex: number,
    field: string,
    value: any
  ) => {
    const lesson = lessons.find(l => l.id === lessonId);
    const question = lesson?.questions?.[questionIndex];
    if (!question) return;

    try {
      // Don't save to API immediately, just update local state

      // If changing question type, update choices accordingly
      if (field === 'type') {
        const oldChoices = question.choices || [];
        
        // Delete old choices
        for (const choice of oldChoices) {
          try {
            await examAPI.deleteChoice(choice.id);
          } catch (error) {
            console.error('Error deleting choice:', error);
          }
        }

        let newChoices: Choice[] = [];

        // Create new choices based on type
        if (value === 'MULTIPLE_CHOICE') {
          const choiceLabels = ['A', 'B', 'C', 'D'];
          for (let i = 0; i < 4; i++) {
            const choiceData = {
              choice_label: choiceLabels[i],
              choice_text: `ตัวเลือก ${choiceLabels[i]}`,
              is_correct: i === 0
            };
            try {
              const choiceResponse = await examAPI.createChoice(question.id, choiceData);
              const responseData = choiceResponse.data.data || choiceResponse.data;
              const newChoice = { ...choiceData, question_id: question.id, ...responseData };
              if (newChoice.id) newChoices.push(newChoice);
            } catch (error) {
              console.error('Error creating choice:', error);
            }
          }
        } else if (value === 'TRUE_FALSE') {
          const tfChoices = [
            { label: 'T', text: 'ถูก', correct: true },
            { label: 'F', text: 'ผิด', correct: false }
          ];
          for (const tf of tfChoices) {
            const choiceData = {
              choice_label: tf.label,
              choice_text: tf.text,
              is_correct: tf.correct
            };
            try {
              const choiceResponse = await examAPI.createChoice(question.id, choiceData);
              const responseData = choiceResponse.data.data || choiceResponse.data;
              const newChoice = { ...choiceData, question_id: question.id, ...responseData };
              if (newChoice.id) newChoices.push(newChoice);
            } catch (error) {
              console.error('Error creating choice:', error);
            }
          }
        }

        // Update state with new choices
        setLessons(prev =>
          prev.map(l =>
            l.id === lessonId
              ? {
                  ...l,
                  questions: l.questions?.map((q, idx) =>
                    idx === questionIndex ? { ...q, [field]: value, choices: newChoices } : q
                  )
                }
              : l
          )
        );
      } else {
        // Update state normally
        setLessons(prev =>
          prev.map(l =>
            l.id === lessonId
              ? {
                  ...l,
                  questions: l.questions?.map((q, idx) =>
                    idx === questionIndex ? { ...q, [field]: value } : q
                  )
                }
              : l
          )
        );
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไขคำถาม');
    }
  };

  const handleSaveLessonQuestions = async (lessonId: string) => {
    try {
      const lesson = lessons.find(l => l.id === lessonId);
      if (!lesson || !lesson.questions || lesson.questions.length === 0) {
        alert('ไม่มีคำถามในบทนี้');
        return;
      }

      let savedCount = 0;
      let errorCount = 0;

      // Loop through questions in this lesson only
      for (const question of lesson.questions) {
        try {
          // Save question to API
          await examAPI.updateQuestion(question.id, {
            question_text: question.question_text,
            type: question.type,
            score_points: question.score_points
          });

          // Save all choices
          if (question.choices) {
            for (const choice of question.choices) {
              await examAPI.updateChoice(choice.id, {
                choice_text: choice.choice_text,
                is_correct: choice.is_correct
              });
            }
          }

          savedCount++;
        } catch (error) {
          console.error('Error saving question:', question.id, error);
          errorCount++;
        }
      }

      // Save passing score for this lesson
      const passingScore = lessonPassingScores[lessonId] ?? 0;
      try {
        await courseAPI.updateLesson(lessonId, { passing_score: passingScore });
      } catch (error) {
        console.error('Error saving passing score:', error);
      }

      if (errorCount === 0) {
        alert(`✅ บันทึกคำถามทั้งหมดในบทนี้เรียบร้อยแล้ว (${savedCount} คำถาม)`);
      } else {
        alert(`⚠️ บันทึกเสร็จสิ้น: สำเร็จ ${savedCount} คำถาม, ล้มเหลว ${errorCount} คำถาม`);
      }
    } catch (error) {
      console.error('Error saving lesson questions:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกคำถาม');
    }
  };

  const handleDeleteQuestion = async (lessonId: string, questionIndex: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    const question = lesson?.questions?.[questionIndex];
    if (!question) return;

    if (!confirm('คุณต้องการลบคำถามนี้ใช่หรือไม่?')) return;

    try {
      await examAPI.deleteQuestion(question.id);

      // Update state
      setLessons(prev =>
        prev.map(l =>
          l.id === lessonId
            ? {
                ...l,
                questions: l.questions?.filter((_, idx) => idx !== questionIndex)
              }
            : l
        )
      );

      alert('✅ ลบคำถามเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('เกิดข้อผิดพลาดในการลบคำถาม');
    }
  };

  const handleUpdateChoice = async (
    lessonId: string,
    questionIndex: number,
    choiceIndex: number,
    field: string,
    value: any
  ) => {
    const lesson = lessons.find(l => l.id === lessonId);
    const question = lesson?.questions?.[questionIndex];
    const choice = question?.choices?.[choiceIndex];
    if (!choice) return;

    // Don't save to API immediately, just update local state
    setLessons(prev =>
      prev.map(l =>
        l.id === lessonId
          ? {
              ...l,
              questions: l.questions?.map((q, qIdx) =>
                qIdx === questionIndex
                  ? {
                      ...q,
                      choices: q.choices?.map((c, cIdx) =>
                        cIdx === choiceIndex ? { ...c, [field]: value } : c
                      )
                    }
                  : q
              )
            }
          : l
      )
    );
  };

  const toggleLessonExpanded = (lessonId: string) => {
    setExpandedLessons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const handleBackToDashboard = () => {
    navigate('/teacher-dashboard');
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                color: '#64748b'
              }}
              onClick={handleBackToDashboard}
            >
              <div style={{ background: '#cbd5e1', borderRadius: '50%', padding: '6px', display: 'flex' }}>
                <ChevronLeft size={20} color="white" />
              </div>
              <span>กลับหน้าแดชบอร์ด</span>
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <BookOpen size={28} style={{ color: '#3b82f6' }} />
              <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
                {isReadOnly ? 'ดูข้อสอบคอร์ส' : 'จัดการข้อสอบคอร์ส'}
              </h1>
              {isReadOnly && (
                <Eye size={24} style={{ color: '#64748b' }} />
              )}
            </div>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>{courseName}</p>
            {isReadOnly && (
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '8px',
                padding: '10px 15px',
                marginTop: '10px',
                color: '#92400e',
                fontSize: '0.9rem'
              }}>
                ⚠️ คอร์สนี้ถูกเผยแพร่แล้ว - คุณสามารถดูข้อสอบได้เท่านั้น ไม่สามารถแก้ไขได้
              </div>
            )}
          </div>

          {/* Lessons List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <p>กำลังโหลดข้อมูล...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div
              style={{
                background: 'white',
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '3rem',
                textAlign: 'center',
                color: '#94a3b8'
              }}
            >
              <p style={{ fontSize: '1.1rem' }}>ยังไม่มีบทเรียนในคอร์สนี้</p>
              <p style={{ fontSize: '0.9rem' }}>กรุณาเพิ่มเนื้อหาบทเรียนก่อนจัดการข้อสอบ</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {lessons.map((lesson, lessonIdx) => {
                const isExpanded = expandedLessons.has(lesson.id);
                const questionCount = lesson.questions?.length || 0;
                const totalScore = lesson.questions?.reduce((sum, q) => sum + (q.score_points || 0), 0) || 0;
                const passingScore = lessonPassingScores[lesson.id] || 0;

                return (
                  <div
                    key={lesson.id}
                    style={{
                      background: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Lesson Header */}
                    <div
                      style={{
                        background: '#f8fafc',
                        padding: '20px',
                        borderBottom: '2px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                      onClick={() => toggleLessonExpanded(lesson.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            borderRadius: '8px',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {lessonIdx + 1}
                        </div>
                        <div>
                          <h3
                            style={{
                              fontSize: '1.2rem',
                              fontWeight: 'bold',
                              color: '#0f172a',
                              margin: 0
                            }}
                          >
                            {lesson.topic_name}
                          </h3>
                          <div style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0', display: 'flex', gap: '15px' }}>
                            <span>{questionCount} คำถาม</span>
                            <span>📊 คะแนนเต็ม: <strong style={{ color: '#0f172a' }}>{totalScore}</strong></span>
                            <span>✓ คะแนนผ่าน: <strong style={{ color: '#10b981' }}>{passingScore}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {!isReadOnly && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddQuestion(lesson.id);
                            }}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 16px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <PlusCircle size={16} />
                            เพิ่มคำถาม
                          </button>
                        )}
                        <span style={{ fontSize: '1.2rem', color: '#64748b' }}>
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                    </div>

                    {/* Questions */}
                    {isExpanded && (
                      <div style={{ padding: '20px' }}>
                        {/* Passing Score Input */}
                        {!isReadOnly && (
                          <div style={{ marginBottom: '20px', padding: '15px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #93c5fd' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e40af', marginBottom: '8px', display: 'block' }}>
                              🎯 คะแนนผ่านขั้นต่ำ (จากคะแนนเต็ม {totalScore})
                            </label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <input
                                type="number"
                                min="0"
                                max={totalScore}
                                value={passingScore}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 0;
                                  setLessonPassingScores(prev => ({ ...prev, [lesson.id]: value }));
                                }}
                                style={{
                                  width: '120px',
                                  padding: '8px 12px',
                                  fontSize: '0.95rem',
                                  border: '1px solid #3b82f6',
                                  borderRadius: '6px',
                                  outline: 'none'
                                }}
                              />
                              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ {totalScore}</span>
                            </div>
                          </div>
                        )}
                        {questionCount === 0 ? (
                          <div
                            style={{
                              padding: '40px',
                              textAlign: 'center',
                              color: '#94a3b8',
                              background: '#f8fafc',
                              borderRadius: '8px',
                              border: '2px dashed #e2e8f0'
                            }}
                          >
                            <HelpCircle size={48} style={{ marginBottom: '10px', display: 'inline-block' }} />
                            <p>ยังไม่มีคำถามในบทนี้</p>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                              {lesson.questions?.map((question, qIdx) => (
                                <div
                                  key={question.id}
                                  style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '15px'
                                  }}
                                >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                  <span
                                    style={{
                                      background: '#3b82f6',
                                      color: 'white',
                                      borderRadius: '4px',
                                      padding: '4px 10px',
                                      fontSize: '0.8rem',
                                      fontWeight: 'bold',
                                      minWidth: '30px',
                                      textAlign: 'center'
                                    }}
                                  >
                                    {qIdx + 1}
                                  </span>
                                  <div style={{ flex: 1 }}>
                                    {isReadOnly ? (
                                      <div
                                        style={{
                                          padding: '10px',
                                          fontSize: '0.95rem',
                                          color: '#0f172a',
                                          background: 'white',
                                          borderRadius: '6px',
                                          border: '1px solid #e2e8f0'
                                        }}
                                      >
                                        {question.question_text}
                                      </div>
                                    ) : (
                                      <textarea
                                        value={question.question_text}
                                        onChange={(e) =>
                                          handleUpdateQuestion(lesson.id, qIdx, 'question_text', e.target.value)
                                        }
                                        placeholder="พิมพ์คำถามที่นี่..."
                                        style={{
                                          width: '100%',
                                          padding: '10px',
                                          fontSize: '0.95rem',
                                          border: '1px solid #cbd5e1',
                                          borderRadius: '6px',
                                          outline: 'none',
                                          background: '#ffffff',
                                          color: '#0f172a',
                                          boxSizing: 'border-box',
                                          minHeight: '80px',
                                          resize: 'vertical'
                                        }}
                                      />
                                    )}
                                    <div style={{ marginTop: '8px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                                      {!isReadOnly ? (
                                        <>
                                          <div>
                                            <label style={{ fontSize: '0.75rem', color: '#64748b', marginRight: '5px' }}>ประเภท:</label>
                                            <select
                                              value={question.type}
                                              onChange={(e) => handleUpdateQuestion(lesson.id, qIdx, 'type', e.target.value)}
                                              style={{
                                                padding: '4px 8px',
                                                fontSize: '0.75rem',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '4px',
                                                outline: 'none'
                                              }}
                                            >
                                              <option value="MULTIPLE_CHOICE">ปรนัย</option>
                                              <option value="TRUE_FALSE">ถูก/ผิด</option>
                                            </select>
                                          </div>
                                          <div>
                                            <label style={{ fontSize: '0.75rem', color: '#64748b', marginRight: '5px' }}>คะแนน:</label>
                                            <input
                                              type="number"
                                              min="1"
                                              value={question.score_points}
                                              onChange={(e) => handleUpdateQuestion(lesson.id, qIdx, 'score_points', parseInt(e.target.value) || 1)}
                                              style={{
                                                width: '60px',
                                                padding: '4px 8px',
                                                fontSize: '0.75rem',
                                                border: '1px solid #cbd5e1',
                                                borderRadius: '4px',
                                                outline: 'none'
                                              }}
                                            />
                                          </div>
                                        </>
                                      ) : (
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                          คะแนน: {question.score_points} | ประเภท:{' '}
                                          {question.type === 'MULTIPLE_CHOICE' ? 'ปรนัย' : 'ถูก/ผิด'}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  {!isReadOnly && (
                                    <button
                                      onClick={() => handleDeleteQuestion(lesson.id, qIdx)}
                                      style={{
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '6px 10px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                      }}
                                      title="ลบคำถาม"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>

                                {/* Choices for MULTIPLE_CHOICE */}
                                {question.type === 'MULTIPLE_CHOICE' && question.choices && (
                                  <div style={{ marginLeft: '40px', marginTop: '12px' }}>
                                    <div
                                      style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        color: '#475569',
                                        marginBottom: '8px'
                                      }}
                                    >
                                      ตัวเลือก:
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {question.choices.map((choice, cIdx) => (
                                        <div key={choice.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                          {!isReadOnly && (
                                            <input
                                              type="radio"
                                              name={`correct-${lesson.id}-${qIdx}`}
                                              checked={choice.is_correct}
                                              onChange={() => {
                                                // Update all choices in this question
                                                question.choices?.forEach((_ch, chIdx) => {
                                                  handleUpdateChoice(lesson.id, qIdx, chIdx, 'is_correct', chIdx === cIdx);
                                                });
                                              }}
                                              style={{ cursor: 'pointer' }}
                                            />
                                          )}
                                          {isReadOnly && choice.is_correct && (
                                            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                                          )}
                                          <span
                                            style={{
                                              fontWeight: 'bold',
                                              color: choice.is_correct ? '#22c55e' : '#64748b',
                                              minWidth: '20px'
                                            }}
                                          >
                                            {choice.choice_label}.
                                          </span>
                                          {isReadOnly ? (
                                            <div
                                              style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                fontSize: '0.9rem',
                                                border: choice.is_correct ? '2px solid #22c55e' : '1px solid #e2e8f0',
                                                borderRadius: '6px',
                                                background: choice.is_correct ? '#f0fdf4' : '#ffffff',
                                                color: '#0f172a'
                                              }}
                                            >
                                              {choice.choice_text}
                                            </div>
                                          ) : (
                                            <input
                                              type="text"
                                              value={choice.choice_text}
                                              onChange={(e) =>
                                                handleUpdateChoice(lesson.id, qIdx, cIdx, 'choice_text', e.target.value)
                                              }
                                              placeholder={`ตัวเลือก ${choice.choice_label}`}
                                              style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                fontSize: '0.9rem',
                                                border: choice.is_correct ? '2px solid #22c55e' : '1px solid #cbd5e1',
                                                borderRadius: '6px',
                                                outline: 'none',
                                                background: choice.is_correct ? '#f0fdf4' : '#ffffff',
                                                color: '#0f172a',
                                                boxSizing: 'border-box'
                                              }}
                                            />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                    {!isReadOnly && (
                                      <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                                        * เลือกวงกลมเพื่อกำหนดคำตอบที่ถูกต้อง
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Choices for TRUE_FALSE */}
                                {question.type === 'TRUE_FALSE' && question.choices && (
                                  <div style={{ marginLeft: '40px', marginTop: '12px' }}>
                                    <div
                                      style={{
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        color: '#475569',
                                        marginBottom: '8px'
                                      }}
                                    >
                                      ตัวเลือก:
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {question.choices.map((choice, cIdx) => (
                                        <div key={choice.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                          {!isReadOnly && (
                                            <input
                                              type="radio"
                                              name={`correct-tf-${lesson.id}-${qIdx}`}
                                              checked={choice.is_correct}
                                              onChange={() => {
                                                // Update all choices in this question
                                                question.choices?.forEach((_ch, chIdx) => {
                                                  handleUpdateChoice(lesson.id, qIdx, chIdx, 'is_correct', chIdx === cIdx);
                                                });
                                              }}
                                              style={{ cursor: 'pointer' }}
                                            />
                                          )}
                                          {isReadOnly && choice.is_correct && (
                                            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✓</span>
                                          )}
                                          <div
                                            style={{
                                              flex: 1,
                                              padding: '8px 12px',
                                              fontSize: '0.9rem',
                                              border: choice.is_correct ? '2px solid #22c55e' : '1px solid #cbd5e1',
                                              borderRadius: '6px',
                                              background: choice.is_correct ? '#f0fdf4' : '#ffffff',
                                              color: '#64748b',
                                              fontWeight: 'normal'
                                            }}
                                          >
                                            {choice.choice_text}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    {!isReadOnly && (
                                      <div style={{ marginTop: '8px', fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                                        * เลือกวงกลมเพื่อกำหนดคำตอบที่ถูกต้อง
                                      </div>
                                    )}
                                  </div>
                                )}

                                </div>
                              ))}
                            </div>
                            
                            {/* Save Button for this lesson */}
                            {!isReadOnly && (
                              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleSaveLessonQuestions(lesson.id)}
                                  style={{
                                    background: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '12px 24px',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.2s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                                  }}
                                >
                                  <Save size={18} />
                                  บันทึกคำถามทั้งหมดในบทนี้
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <div className="footer-content">
          <p style={{ color: '#94a3b8', textAlign: 'center' }}>© 2026 Born2Code. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
