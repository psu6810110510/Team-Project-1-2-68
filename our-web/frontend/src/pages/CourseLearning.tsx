import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/LoginTheme.css';
import { ChevronLeft, PlayCircle, FileText, MonitorPlay, Download, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { paymentAPI } from '../api/paymentAPI';
import { courseAPI, type Lesson } from '../api/courseAPI';

export default function CourseLearning() {
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();

    const [accessStatus, setAccessStatus] = useState<'checking' | 'allowed' | 'denied' | 'pending'>('checking');
    const [realLessons, setRealLessons] = useState<any[]>([]);
    const [realCourse, setRealCourse] = useState<any>(null);
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [expandedChapters, setExpandedChapters] = useState<{ [key: string]: boolean }>({});
    const [completedLessons, setCompletedLessons] = useState<string[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Load progress from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && courseId) {
            const user = JSON.parse(storedUser);
            setCurrentUserId(user.id);
            const savedProgress = localStorage.getItem(`progress_${user.id}_${courseId}`);
            if (savedProgress) {
                setCompletedLessons(JSON.parse(savedProgress));
            }
        }
    }, [courseId]);

    const handleVideoEnded = () => {
        if (activeLesson && activeLesson.id && currentUserId && courseId) {
            if (!completedLessons.includes(activeLesson.id)) {
                const newCompleted = [...completedLessons, activeLesson.id];
                setCompletedLessons(newCompleted);
                localStorage.setItem(`progress_${currentUserId}_${courseId}`, JSON.stringify(newCompleted));
                console.log('✅ Marked lesson as completed:', activeLesson.topic_name);
            }
        }
    };

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
                    try {
                        const [courseRes, lessonsRes] = await Promise.all([
                            courseAPI.getCourseById(courseId),
                            courseAPI.getLessonsByCourse(courseId),
                        ]);
                        setRealCourse(courseRes.data);
                        
                        const rawLessons = lessonsRes.data.data;
                        if (rawLessons && rawLessons.length > 0) {
                            const grouped: any[] = [];
                            const chapterMap: { [key: string]: any } = {};

                            rawLessons.forEach((lesson: Lesson) => {
                                const parts = lesson.topic_name.split(' - ');
                                const chapterName = parts.length > 1 ? parts[0] : 'ทั่วไป';
                                const subTitle = parts.length > 1 ? parts.slice(1).join(' - ') : lesson.topic_name;

                                if (!chapterMap[chapterName]) {
                                    chapterMap[chapterName] = {
                                        title: chapterName,
                                        lessons: []
                                    };
                                    grouped.push(chapterMap[chapterName]);
                                }

                                // Deduplicate sub-lessons by subTitle
                                const existingLesson = chapterMap[chapterName].lessons.find((l: any) => l.displayTitle === subTitle);
                                
                                if (existingLesson) {
                                    // Prefer the one with more content
                                    const hasOldContent = !!existingLesson.content || !!existingLesson.video_url;
                                    const hasNewContent = !!lesson.content || !!lesson.video_url;
                                    
                                    if (!hasOldContent && hasNewContent) {
                                        // Replace with the new one that has content
                                        Object.assign(existingLesson, {
                                            ...lesson,
                                            displayTitle: subTitle
                                        });
                                    }
                                } else {
                                    chapterMap[chapterName].lessons.push({
                                        ...lesson,
                                        displayTitle: subTitle
                                    });
                                }
                            });
                            setRealLessons(grouped);
                            setExpandedChapters({ [grouped[0].title]: true });
                            setActiveLesson(grouped[0].lessons[0]);
                        }
                    } catch (e) {
                        console.error('Error fetching course data:', e);
                    }
                } else {
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
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f172a' }}>{realCourse?.title || 'กำลังโหลด...'}</span>
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
                            {activeLesson ? (
                                activeLesson.video_url ? (
                                    <video
                                        src={activeLesson.video_url}
                                        controls
                                        autoPlay
                                        onEnded={handleVideoEnded}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black' }}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center' }}>
                                        <FileText size={64} color="#3b82f6" style={{ marginBottom: '16px' }} />
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>เอกสารประกอบการเรียน</h2>
                                        <p style={{ color: '#94a3b8', marginTop: '8px' }}>บทเรียนนี้ไม่มีวิดีโอ กรุณาดูเอกสารประกอบ</p>
                                    </div>
                                )
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <MonitorPlay size={64} color="#3b82f6" style={{ marginBottom: '16px' }} />
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>กรุณาเลือกบทเรียน</h2>
                                </div>
                            )}
                        </div>

                        {/* Current Lesson Info */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginTop: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>
                                {activeLesson?.topic_name || activeLesson?.displayTitle || 'เลือกบทเรียน'}
                            </h1>
                            <p style={{ color: '#64748b', marginBottom: '16px' }}>สอนโดย {realCourse?.instructor_name || realCourse?.instructor?.full_name || 'อาจารย์ผู้สอน'}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {realCourse?.description && (
                                    <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <h3 style={{ fontWeight: 'bold', color: '#0369a1', marginBottom: '12px', fontSize: '1.1rem' }}>รายละเอียดวิชา (Course Description)</h3>
                                        <p style={{ color: '#0c4a6e', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '1rem' }}>
                                            {realCourse.description}
                                        </p>
                                    </div>
                                )}

                                {!realCourse?.description && (
                                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
                                        <p>ไม่มีรายละเอียดเพิ่มเติมสำหรับคอร์สนี้</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Course Content */}
                    <div style={{ flex: '1 1 350px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '20px', height: 'fit-content' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>เนื้อหาคอร์สเรียน</h2>
                                {realLessons.length > 0 && (
                                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#16a34a' }}>
                                        {Math.round((completedLessons.length / realLessons.reduce((acc, ch) => acc + ch.lessons.length, 0)) * 100) || 0}%
                                    </span>
                                )}
                            </div>
                            
                            {/* Progress Bar */}
                            {realLessons.length > 0 && (
                                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div 
                                        style={{ 
                                            width: `${(completedLessons.length / realLessons.reduce((acc, ch) => acc + ch.lessons.length, 0)) * 100}%`,
                                            height: '100%',
                                            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                                            transition: 'width 0.5s ease-in-out'
                                        }} 
                                    />
                                </div>
                            )}
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                                เรียนไปแล้ว {completedLessons.length} จาก {realLessons.reduce((acc, ch) => acc + ch.lessons.length, 0)} บทเรียน
                            </p>
                        </div>

                        {realLessons.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {realLessons.map((chapter: any, cIdx: number) => (
                                    <div key={cIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                        <button 
                                            onClick={() => setExpandedChapters(prev => ({ ...prev, [chapter.title]: !prev[chapter.title] }))}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                background: '#f8fafc',
                                                padding: '14px 16px',
                                                border: 'none',
                                                borderBottom: expandedChapters[chapter.title] ? '1px solid #e2e8f0' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = '#f8fafc')}
                                        >
                                            <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>
                                                {chapter.title}
                                            </span>
                                            {expandedChapters[chapter.title] ? <ChevronUp size={18} color="#64748b" /> : <ChevronDown size={18} color="#64748b" />}
                                        </button>
                                        
                                        {expandedChapters[chapter.title] && (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                {chapter.lessons.map((lesson: any, sIdx: number) => {
                                                    const isSelected = activeLesson?.id === lesson.id;
                                                    return (
                                                        <div
                                                            key={lesson.id || sIdx}
                                                            onClick={() => setActiveLesson(lesson)}
                                                            style={{
                                                                padding: '12px 16px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '12px',
                                                                background: isSelected ? '#eff6ff' : 'white',
                                                                borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                                                                borderBottom: '1px solid #f1f5f9',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                            onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = '#f8fafc')}
                                                            onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'white')}
                                                        >
                                                            {lesson.video_url ? (
                                                                <PlayCircle size={18} color={isSelected ? '#3b82f6' : '#94a3b8'} />
                                                            ) : (
                                                                <FileText size={18} color={isSelected ? '#3b82f6' : '#94a3b8'} />
                                                            )}
                                                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                                                <p style={{
                                                                    fontSize: '0.85rem',
                                                                    fontWeight: isSelected ? '600' : '500',
                                                                    color: isSelected ? '#1e40af' : '#475569',
                                                                    whiteSpace: 'nowrap',
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis'
                                                                }}>
                                                                    {lesson.displayTitle}
                                                                </p>
                                                            </div>
                                                            {completedLessons.includes(lesson.id) && (
                                                                <CheckCircle size={16} color="#16a34a" style={{ marginLeft: '4px' }} />
                                                            )}
                                                            {lesson.pdf_url && (
                                                                <a 
                                                                    href={lesson.pdf_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{ color: '#94a3b8', display: 'flex' }}
                                                                    title="ดาวน์โหลด PDF"
                                                                >
                                                                    <Download size={16} />
                                                                </a>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                                <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                                <p>ยังไม่มีเนื้อหาในบทเรียนนี้</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
