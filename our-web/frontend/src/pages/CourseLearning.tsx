import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/LoginTheme.css';
import { ChevronLeft, PlayCircle, CheckCircle, FileText, MonitorPlay, Download } from 'lucide-react';
import { paymentAPI } from '../api/paymentAPI';
import { courseAPI } from '../api/courseAPI';

export default function CourseLearning() {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();

    const [accessStatus, setAccessStatus] = useState<'checking' | 'allowed' | 'denied' | 'pending'>('checking');
    const [realLessons, setRealLessons] = useState<any[]>([]);
    const [realCourseTitle, setRealCourseTitle] = useState<string>('');

    useEffect(() => {
        const checkAccess = async () => {
            const storedUser = localStorage.getItem('user');
            if (!storedUser || !courseId) {
                setAccessStatus('denied');
                return;
            }
            const user = JSON.parse(storedUser);
            try {
                const res = await paymentAPI.checkCourseAccess(user.id, courseId);
                if (res.data.has_access) {
                    setAccessStatus('allowed');
                    // Load actual course lessons
                    try {
                        const [courseRes, lessonsRes] = await Promise.all([
                            courseAPI.getCourseById(courseId),
                            courseAPI.getLessonsByCourse(courseId),
                        ]);
                        setRealCourseTitle(courseRes.data.title || '');
                        setRealLessons(lessonsRes.data.data || []);
                    } catch {
                        // Fall back to mock data if fetch fails
                    }
                } else {
                    // Check if user has a PENDING/SUBMITTED payment
                    const paymentsRes = await paymentAPI.getUserPayments(user.id);
                    const hasPending = paymentsRes.data.data.some(
                        p => p.course_ids.includes(courseId) &&
                            (p.status === 'PAYMENT_SUBMITTED' || p.status === 'PENDING_PAYMENT')
                    );
                    setAccessStatus(hasPending ? 'pending' : 'denied');
                }
            } catch {
                setAccessStatus('denied');
            }
        };
        checkAccess();
    }, [courseId]);

    let courseTitle = realCourseTitle || (courseId === '1' ? 'Data Science with Python' : 'Data Visualization');
    let instructorName = 'นายอาร์ม ตัวจริง';
    let videoUrl = '';

    try {
        const savedCourses = localStorage.getItem('teacherCourses');
        if (savedCourses) {
            const parsed = JSON.parse(savedCourses);
            const matched = parsed.find((c: any) => c.id.toString() === courseId);
            if (matched) {
                if (!realCourseTitle) courseTitle = matched.title;
                instructorName = matched.instructor || instructorName;
                videoUrl = matched.videoUrl || '';
            }
        }
    } catch (e) { }

    // Mock course data
    const course = {
        title: courseTitle,
        instructor: instructorName,
        progress: courseId === '1' ? 30 : 15,
        modules: [
            {
                id: 1,
                title: 'บทที่ 1: แนะนำวิชาเรียน',
                lessons: [
                    { id: 101, title: 'Introduction to Course', duration: '5:30', isCompleted: true, type: 'video' },
                    { id: 102, title: 'Course Setup', duration: '12:00', isCompleted: true, type: 'video' },
                ]
            },
            {
                id: 2,
                title: 'บทที่ 2: พื้นฐาน (Fundamentals)',
                lessons: [
                    { id: 201, title: 'Variables and Data Types', duration: '18:45', isCompleted: false, type: 'video', isCurrent: true },
                    { id: 202, title: 'Control Structures', duration: '25:10', isCompleted: false, type: 'video' },
                    { id: 203, title: 'แบบฝึกหัดท้ายบท', duration: '10 mins', isCompleted: false, type: 'quiz' },
                ]
            }
        ]
    };

    const initialLesson = course.modules.flatMap(m => m.lessons).find(l => l.isCurrent) || course.modules[0].lessons[0];
    const [activeLesson, setActiveLesson] = useState(initialLesson);
    const [downloadingModule, setDownloadingModule] = useState<string | null>(null);

    // ---- Access gate ----
    if (accessStatus === 'checking') {
        return (
            <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
                <Header />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem' }}>⏳</div>
                    <p>กำลังตรวจสอบสิทธิ์การเข้าถึง...</p>
                </div>
            </div>
        );
    }

    if (accessStatus === 'pending') {
        return (
            <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
                <Header />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '20px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem' }}>⏳</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0A1C39' }}>รอการยืนยันการชำระเงิน</h2>
                    <p style={{ color: '#64748b', maxWidth: '400px', lineHeight: 1.7 }}>
                        คำขอชำระเงินของคุณอยู่ระหว่างการตรวจสอบ<br />
                        เมื่อแอดมินยืนยันแล้ว คุณจะสามารถเข้าถึงคอร์สนี้ได้ทันที
                    </p>
                    <button
                        onClick={() => navigate('/courses')}
                        style={{ padding: '12px 28px', background: '#0A1C39', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        กลับหน้าคอร์ส
                    </button>
                </div>
            </div>
        );
    }

    if (accessStatus === 'denied') {
        return (
            <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
                <Header />
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '20px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem' }}>🔒</div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0A1C39' }}>คุณยังไม่ได้ลงทะเบียนคอร์สนี้</h2>
                    <p style={{ color: '#64748b', maxWidth: '400px', lineHeight: 1.7 }}>
                        กรุณาซื้อคอร์สก่อน แล้วรอการยืนยันจากแอดมิน<br />
                        จากนั้นคุณจะสามารถเข้าถึงวิดีโอและเอกสารทั้งหมดได้
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => navigate(`/courses/${courseId}`)}
                            style={{ padding: '12px 28px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            ดูรายละเอียดคอร์ส
                        </button>
                        <button
                            onClick={() => navigate('/courses')}
                            style={{ padding: '12px 28px', background: '#0A1C39', color: 'white', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            คอร์สทั้งหมด
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleDownloadSheet = (targetModuleTitle: string) => {
        setDownloadingModule(targetModuleTitle);
        setTimeout(() => {
            // สร้างไฟล์ PDF จำลองสำหรับดาวน์โหลด
            const link = document.createElement('a');
            link.href = 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLU31jBQsTAz1DMyhHDBtZABlweTzi1PzSjQyzSxN9UwNDZQMlYrzU1IqFQIyE0syqxKTS5RzFQrzc3LylZISy1JzE+EaKgAAs/sYMQplbmRzdHJlYW0KZW5kb2JqCgozIDAgb2JqCjgwCmVuZG9iagoKNCAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L0ZvbnQ8PC9GMCA2IDAgUj4+Pj4vQ29udGVudHMgMiAwIFIvUGFyZW50IDUgMCBSPj4KZW5kb2JqCgo1IDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzQgMCBSXT4+CmVuZG9iagoKNiAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9UaW1lcy1Sb21hbj4+CmVuZG9iagoKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNSAwIFI+PgplbmRvYmoKCjcgMCBvYmoKPDwvUHJvZHVjZXIoQ291cnNlIExlYXJuaW5nIE1vY2svQW50aWdyYXZpdHkpL0NyZWF0aW9uRGF0ZShEOjIwMjYwMzEwMDAwMDAwWik+PgplbmRvYmoKCnhyZWYKMCA4CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDI5NCAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxNjYgMDAwMDAgbiAKMDAwMDAwMDE4NSAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCjAwMDAwMDAxMTAgMDAwMDAgbiAKMDAwMDAwMDIxMCAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgOC9Sb290IDEgMCBSL0luZm8gNyAwIFI+PgpzdGFydHhyZWYKMzEwCiUlRU9GCg==';
            link.download = `sheet_${targetModuleTitle.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setDownloadingModule(null);
        }, 1000);
    };

    return (
        <div className="page-container" style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Header />

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', paddingTop: '84px' }}>
                {/* Breadcrumb & Navigation */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#64748b' }}
                        onClick={() => navigate(-1)}
                    >
                        <div style={{ background: '#cbd5e1', borderRadius: '50%', padding: '6px', display: 'flex' }}>
                            <ChevronLeft size={20} color="white" />
                        </div>
                        <span>ย้อนกลับ</span>
                    </div>
                    <span style={{ color: '#cbd5e1' }}>|</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>{course.title}</span>
                </div>

                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                    {/* Main Video Area */}
                    <div style={{ flex: '1 1 800px' }}>
                        {/* Video Player */}
                        <div style={{
                            width: '100%',
                            aspectRatio: '16/9',
                            background: '#0f172a',
                            borderRadius: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: 'white',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            overflow: 'hidden'
                        }}>
                            {activeLesson.type === 'video' ? (
                                videoUrl ? (
                                    <video
                                        src={videoUrl}
                                        controls
                                        autoPlay
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black' }}
                                    />
                                ) : (
                                    <>
                                        <MonitorPlay size={64} color="#3b82f6" style={{ marginBottom: '16px' }} />
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>
                                            กำลังเล่น: {activeLesson.title}
                                        </h2>
                                        <p style={{ color: '#94a3b8', marginTop: '8px' }}>
                                            กรุณากดเล่นวิดีโอเพื่อเริ่มเรียน
                                        </p>
                                    </>
                                )
                            ) : (
                                <>
                                    <FileText size={64} color="#3b82f6" style={{ marginBottom: '16px' }} />
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center' }}>
                                        กำลังทำแบบทดสอบ: {activeLesson.title}
                                    </h2>
                                    <p style={{ color: '#94a3b8', marginTop: '8px' }}>
                                        คลิกเพื่อเริ่มทำแบบทดสอบ
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Current Lesson Info */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginTop: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                                {activeLesson.title}
                            </h1>
                            <p style={{ color: '#64748b', marginBottom: '16px' }}>สอนโดย {course.instructor}</p>

                            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontWeight: 'bold', color: '#334155', marginBottom: '8px' }}>รายละเอียดเนื้อหา</h3>
                                <p style={{ color: '#475569', lineHeight: '1.6' }}>
                                    {activeLesson.type === 'quiz' ? 'แบบฝึกหัดสำหรับทดสอบความเข้าใจในบทเรียนนี้' : 'ในบทนี้เราจะมาเรียนรู้เกี่ยวกับตัวแปรและประเภทข้อมูลที่เป็นพื้นฐานสำคัญในการเขียนโปรแกรม การทำความเข้าใจโครงสร้างข้อมูลพื้นฐานจะช่วยให้สามารถเขียนโปรแกรมได้อย่างมีประสิทธิภาพมากขึ้น'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Course Content */}
                    <div style={{ flex: '1 1 350px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px', height: 'fit-content' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px' }}>เนื้อหาคอร์สเรียน</h2>

                        {realLessons.length > 0 ? (
                          /* Real lessons from API */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {realLessons.map((lesson, idx) => (
                              <div key={lesson.id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{ background: '#f1f5f9', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                                  <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>
                                    บทที่ {lesson.sequence_order || idx + 1}: {lesson.topic_name}
                                  </span>
                                </div>
                                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                  {lesson.video_url ? (
                                    <a
                                      href={lesson.video_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e40af', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'none' }}
                                    >
                                      <PlayCircle size={18} color="#3b82f6" />
                                      วิดีโอบทเรียน
                                    </a>
                                  ) : (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                      <PlayCircle size={18} />
                                      ยังไม่มีวิดีโอ
                                    </span>
                                  )}
                                  {lesson.pdf_url ? (
                                    <a
                                      href={lesson.pdf_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#92400e', fontSize: '0.9rem', fontWeight: '500', textDecoration: 'none' }}
                                    >
                                      <Download size={18} color="#f59e0b" />
                                      เอกสาร PDF
                                    </a>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                                <span>ความคืบหน้า</span>
                                <span style={{ fontWeight: 'bold', color: '#0284c7' }}>{course.progress}%</span>
                            </div>
                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${course.progress}%`, background: '#38bdf8', height: '100%', borderRadius: '4px' }}></div>
                            </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {course.modules.map(module => (
                                <div key={module.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                                        <span style={{ fontWeight: 'bold', color: '#334155' }}>{module.title}</span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownloadSheet(module.title); }}
                                            disabled={downloadingModule === module.title}
                                            style={{
                                                background: 'white',
                                                border: '1px solid #cbd5e1',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                cursor: downloadingModule === module.title ? 'not-allowed' : 'pointer',
                                                color: '#3b82f6',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                opacity: downloadingModule === module.title ? 0.5 : 1
                                            }}
                                            title={`ดาวน์โหลดชีท ${module.title}`}
                                        >
                                            <Download size={14} />
                                            {downloadingModule === module.title ? 'กำลังโหลด...' : 'ชีทเรียน'}
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        {module.lessons.map(lesson => {
                                            const isSelected = activeLesson.id === lesson.id;
                                            return (
                                                <div
                                                    key={lesson.id}
                                                    onClick={() => setActiveLesson(lesson)}
                                                    style={{
                                                        padding: '12px 16px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        background: isSelected ? '#ebf8ff' : 'white',
                                                        borderLeft: isSelected ? '4px solid #0ea5e9' : '4px solid transparent',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {lesson.isCompleted ? (
                                                        <CheckCircle size={20} color="#10b981" style={{ flexShrink: 0 }} />
                                                    ) : lesson.type === 'video' ? (
                                                        <PlayCircle size={20} color={isSelected ? '#0ea5e9' : '#94a3b8'} style={{ flexShrink: 0 }} />
                                                    ) : (
                                                        <FileText size={20} color={isSelected ? '#0ea5e9' : '#94a3b8'} style={{ flexShrink: 0 }} />
                                                    )}
                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                        <p style={{
                                                            color: isSelected ? '#0369a1' : (lesson.isCompleted ? '#475569' : '#64748b'),
                                                            fontWeight: isSelected ? '600' : 'normal',
                                                            fontSize: '0.9rem',
                                                            whiteSpace: 'nowrap',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis'
                                                        }}>
                                                            {lesson.title}
                                                        </p>
                                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>{lesson.duration}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            </div>
                          </>
                        )} {/* end ternary realLessons */}
                    </div>
                </div>
            </div>
        </div>
    );
}
