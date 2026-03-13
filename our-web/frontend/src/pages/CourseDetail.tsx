import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingForm from '../components/BookingForm';
import { PlayCircle, FileText, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { courseAPI, type Course, type Lesson } from '../api/courseAPI';
import paymentAPI from '../api/paymentAPI';
import bookingAPI, { type Schedule } from '../api/bookingAPI';
import '../styles/CourseDetail.css';

interface CartItem {
  id: string;
  title: string;
  instructor_name?: string;
  price: number;
  thumbnail_url?: string;
  is_online: boolean;
  is_onsite: boolean;
  selectedType?: 'online' | 'onsite';
  schedule_id?: string;
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [cartMsg, setCartMsg] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'online' | 'onsite' | null>(null);
  const [onsiteBooked, setOnsiteBooked] = useState<number | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingMsg, setBookingMsg] = useState('');
  const [lessons, setLessons] = useState<any[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<{ [key: string]: boolean }>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    if (!courseId) return;

    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          courseAPI.getCourseById(courseId),
          courseAPI.getLessonsByCourse(courseId)
        ]);
        
        setCourse(courseRes.data);
        if (courseRes.data.is_onsite) {
          try {
            const seatRes = await courseAPI.getOnsiteBookedCount(courseId);
            setOnsiteBooked(seatRes.data.count);
            
            // Fetch schedules for booking
            const schedRes = await bookingAPI.getSchedulesByCourse(courseId);
            setSchedules(schedRes.data.data || []);
          } catch {
            setOnsiteBooked(0);
          }
        }

        // Group lessons
        const rawLessons = lessonsRes.data.data;
        if (rawLessons && rawLessons.length > 0) {
          const grouped: any[] = [];
          const chapterMap: { [key: string]: any } = {};

          rawLessons.forEach((lesson: Lesson) => {
            const fullTopic = lesson.topic_name.trim();
            
            let chapterLabel = '';
            let chapterName = '';
            let displayTitle = fullTopic;

            // 1. ตรวจสอบรูปแบบ "บทที่ X"
            const chapterMatch = fullTopic.match(/บทที่\s*(\d+)/i);
            
            if (chapterMatch) {
              const chapterNum = chapterMatch[1];
              chapterLabel = `บทที่ ${chapterNum}`;
              
              // หาข้อความหลังจาก "บทที่ X"
              const remainder = fullTopic.substring(chapterMatch.index! + chapterMatch[0].length).trim()
                .replace(/^[:\-]/, '').trim(); // ลบ : หรือ - ที่ติดมาข้างหน้า

              if (remainder.includes(' - ')) {
                // รูปแบบ "บทที่ 1: ชื่อบท - หัวข้อย่อย"
                const parts = remainder.split(' - ');
                chapterName = parts[0].trim();
                displayTitle = parts.slice(1).join(' - ').trim();
              } else {
                // รูปแบบ "บทที่ 1: หัวข้อย่อย" หรือ "บทที่ 1"
                chapterName = ''; // ถ้าไม่มีส่วนแยก ให้ปล่อยว่างเพื่อให้แสดงแค่ Label
                displayTitle = remainder || chapterLabel;
              }
            } else if (fullTopic.includes(' - ')) {
              // 2. กรณีไม่มี "บทที่" แต่มี " - " เช่น "Workshop - หัวข้อย่อย"
              const parts = fullTopic.split(' - ');
              chapterLabel = parts[0].trim();
              chapterName = '';
              displayTitle = parts.slice(1).join(' - ').trim();
            } else {
              // 3. รูปแบบอื่นๆ
              chapterLabel = 'เนื้อหาหลัก';
              chapterName = '';
              displayTitle = fullTopic;
            }

            // ปรับแต่ง Chapter Name หากไปซ้ำกับ displayTitle (กรณีชื่อบทกับชื่อบทเรียนเหมือนกัน)
            if (chapterName === displayTitle) {
              chapterName = '';
            }

            if (!chapterMap[chapterLabel]) {
              chapterMap[chapterLabel] = {
                title: chapterLabel,
                name: chapterName,
                lessons: [],
                seenTopics: new Set() // ใช้สำหรับ deduplication ในระดับบท
              };
              grouped.push(chapterMap[chapterLabel]);
            }

            // 4. Deduplication: ถ้าหัวข้อย่อยซ้ำกันในบทเดิม ไม่ต้องแสดงเพิ่ม
            if (!chapterMap[chapterLabel].seenTopics.has(displayTitle)) {
              chapterMap[chapterLabel].seenTopics.add(displayTitle);
              chapterMap[chapterLabel].lessons.push({
                ...lesson,
                displayTitle: displayTitle
              });
            }
          });
          setLessons(grouped);
          
          if (grouped.length > 0) {
            setExpandedChapters({ [grouped[0].title]: true });
          }
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        } else {
          setError('ไม่สามารถโหลดข้อมูลคอร์สได้');
        }
      } finally {
        setLoading(false);
      }
    };
    
    const checkAccess = async () => {
      if (!isLoggedIn || !courseId) {
        setCheckingAccess(false);
        return;
      }

      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          // Admin และ Instructor ของคอร์สนี้ เข้าดูได้เลย
          if (user.role === 'ADMIN' || (course && (user.id === course.instructor_id))) {
            setIsEnrolled(true);
            setCheckingAccess(false);
            return;
          }

          const res = await paymentAPI.checkCourseAccess(user.id, courseId);
          setIsEnrolled(res.data.has_access);
        }
      } catch (err) {
        console.error('Error checking access:', err);
      } finally {
        setCheckingAccess(false);
      }
    };

    fetchData();
    checkAccess();
  }, [courseId, navigate, isLoggedIn, course?.instructor_id]); // เพิ่ม dep ของ instructor_id เพื่อเช็คสิทธิ์ครู

  // Sync favorites from API & cart state from localStorage
  useEffect(() => {
    if (!courseId) return;
    const loadFavorites = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const favoritesRes = await courseAPI.getMyFavorites();
          const favoriteIds = favoritesRes.data.favorites.map((c: Course) => c.id);
          setIsWishlisted(favoriteIds.includes(courseId));
        } catch (err) {
          console.error('Error loading favorites:', err);
        }
      }
    };
    loadFavorites();
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    setInCart(cart.some((c) => c.id === courseId));
  }, [courseId]);

  const handleWishlist = async () => {
    if (!courseId) return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await courseAPI.removeFromFavorites(courseId);
      } else {
        await courseAPI.addToFavorites(courseId);
      }
      setIsWishlisted(!isWishlisted);
    } catch (err) {
      console.error('Error updating favorites:', err);
    }
  };

  const handleAddToCart = () => {
    if (!course || !courseId) return;
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.some((c) => c.id === courseId)) {
      setCartMsg('คอร์สนี้อยู่ในตะกร้าแล้ว');
      setTimeout(() => setCartMsg(''), 2500);
      return;
    }
    // เปิด modal ยืนยัน
    setShowCartModal(true);
    // ถ้ามีแค่ประเภทเดียว auto-select
    if (course.is_online && !course.is_onsite) {
      setSelectedType('online');
    } else if (course.is_onsite && !course.is_online) {
      setSelectedType('onsite');
    } else {
      setSelectedType(null);
    }
  };

  const handleConfirmAddToCart = () => {
    if (!course || !courseId) return;
    // ถ้ามีทั้ง online และ onsite ต้องเลือก
    if (course.is_online && course.is_onsite && !selectedType) {
      alert('กรุณาเลือกประเภทการเรียน');
      return;
    }
    
    // ตรวจสอบว่าถ้าเลือก onsite หรือมีแต่ onsite ต้องเลือกรอบเวลาเรียน
    const isChoosingOnsite = selectedType === 'onsite' || (!course.is_online && course.is_onsite);
    if (isChoosingOnsite && !selectedScheduleId) {
      alert('กรุณาเลือกรอบเวลาเรียน');
      return;
    }
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const item: CartItem = {
      id: courseId,
      title: course.title,
      instructor_name: course.instructor_name || course.instructor?.full_name,
      price: typeof course.price === 'number' ? course.price : parseFloat(course.price as any) || 0,
      thumbnail_url: course.thumbnail_url,
      is_online: course.is_online,
      is_onsite: course.is_onsite,
      selectedType: selectedType || undefined,
      schedule_id: selectedScheduleId || undefined,
    };
    localStorage.setItem('cart', JSON.stringify([...cart, item]));
    // แจ้งเตือน Header ให้อัปเดตจำนวนตะกร้า
    window.dispatchEvent(new Event('cart-updated'));
    
    setInCart(true);
    setCartMsg('เพิ่มลงตะกร้าแล้ว!');
    setTimeout(() => setCartMsg(''), 2500);
    setShowCartModal(false);
    setSelectedScheduleId(null);
  };

  const formatPrice = (price?: number | string) => {
    if (price === null || price === undefined || price === '') return 'ฟรี';
    const num = typeof price === 'number' ? price : parseFloat(price as string);
    if (isNaN(num) || num === 0) return 'ฟรี';
    return `฿${num.toLocaleString('th-TH')}`;
  };

  const formatDays = (days?: string[]) => {
    if (!days || days.length === 0) return null;
    const map: Record<string, string> = {
      monday: 'จันทร์', tuesday: 'อังคาร', wednesday: 'พุธ',
      thursday: 'พฤหัสบดี', friday: 'ศุกร์', saturday: 'เสาร์', sunday: 'อาทิตย์',
    };
    return days.map((d) => map[d.toLowerCase()] ?? d).join(', ');
  };

  const parseTags = (raw?: string): string[] => {
    if (!raw) return [];
    return raw.split(/[\s,]+/).filter((t) => t.startsWith('#'));
  };

  if (loading) {
    return (
      <div className="cd-page">
        <Header />
        <div className="cd-loading">กำลังโหลด...</div>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="cd-page">
        <Header />
        <div className="cd-error">{error || 'ไม่พบคอร์สนี้'}</div>
        <Footer />
      </div>
    );
  }

  const instructorName = course.instructor_name || course.instructor?.full_name || '—';
  const tags = parseTags(course.tags);

  return (
    <div className="cd-page">
      <Header />

      {/* Back */}
      <div className="cd-back-bar">
        <button className="cd-back-btn" onClick={() => navigate('/courses')}>
          ← กลับหน้าคอร์สทั้งหมด
        </button>
      </div>

      <div className="cd-container">
        {/* Left: media & info */}
        <div className="cd-main">

          {/* Video / thumbnail */}
          <div className="cd-media">
            {course.video_url ? (
              <video
                className="cd-video"
                controls
                poster={course.thumbnail_url || undefined}
                key={course.video_url}
              >
                <source src={course.video_url} />
                เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
              </video>
            ) : course.thumbnail_url ? (
              <img className="cd-thumbnail" src={course.thumbnail_url} alt={course.title} />
            ) : (
              <div className="cd-no-media">📚</div>
            )}
          </div>

          {/* Title & meta */}
          <h1 className="cd-title">{course.title}</h1>
          <p className="cd-instructor-sub"> {instructorName}</p>

          {tags.length > 0 && (
            <div className="cd-tags">
              {tags.map((t) => (
                <span key={t} className="cd-tag">{t}</span>
              ))}
            </div>
          )}

          {course.description && (
            <div className="cd-section">
              <h2 className="cd-section-title">เกี่ยวกับคอร์สนี้</h2>
              <p className="cd-description">{course.description}</p>
            </div>
          )}

          {/* Lesson Content Section */}
          {lessons.length > 0 && (
            <div className="cd-section">
              <h2 className="cd-section-title">เนื้อหาของคอร์ส</h2>
              <div className="cd-syllabus">
                {lessons.map((chapter: { title: string; name?: string; lessons: any[] }, cIdx: number) => (
                  <div key={cIdx} className="cd-chapter-group">
                    <button 
                      className="cd-chapter-header"
                      onClick={() => setExpandedChapters(prev => ({
                        ...prev,
                        [chapter.title]: !prev[chapter.title]
                      }))}
                    >
                      <div className="cd-chapter-info">
                        <span className="cd-chapter-label">{chapter.title}:</span>
                        {chapter.name && <span className="cd-chapter-name">{chapter.name}</span>}
                      </div>
                      <div className="cd-chapter-meta">
                        <span className="cd-lesson-count">{chapter.lessons.length} บทเรียน</span>
                        {expandedChapters[chapter.title] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    
                    {expandedChapters[chapter.title] && (
                      <div className="cd-sublesson-list">
                        {chapter.lessons.map((sub: any, sIdx: number) => {
                          const isLocked = !isEnrolled && !checkingAccess;
                          
                          return (
                            <div 
                              key={sub.id || sIdx} 
                              className={`cd-sublesson-item ${isLocked ? 'cd-sublesson-locked' : ''}`}
                              onClick={() => {
                                if (!isLocked) {
                                  navigate(`/learning/${courseId}?lessonId=${sub.id}`);
                                }
                              }}
                            >
                              <div className="cd-sublesson-main">
                                {isLocked ? (
                                  <span className="cd-lock-icon">🔒</span>
                                ) : sub.video_url ? (
                                  <PlayCircle size={18} className="cd-icon-video" />
                                ) : (
                                  <FileText size={18} className="cd-icon-text" />
                                )}
                                <span className="cd-sublesson-title">{sub.displayTitle}</span>
                              </div>
                              <div className="cd-sublesson-actions">
                                {sub.pdf_url && (
                                  <a 
                                    href={isLocked ? '#' : sub.pdf_url} 
                                    target={isLocked ? '_self' : '_blank'} 
                                    rel="noopener noreferrer"
                                    className={`cd-pdf-link ${isLocked ? 'disabled' : ''}`}
                                    onClick={(e) => {
                                      if (isLocked) e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                  >
                                    <Download size={16} />
                                    <span>เอกสาร</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details grid */}
          <div className="cd-section">
            <h2 className="cd-section-title">รายละเอียด</h2>

            {/* Online sub-section */}
            {course.is_online && (
              <div className="cd-type-section cd-type-section--online">
                <div className="cd-type-section-header">
                  <span className="cd-type-section-icon">🖥️</span>
                  ข้อมูลคอร์สออนไลน์
                </div>
                <div className="cd-details-grid">
                  <div className="cd-detail-item">
                    <span className="cd-detail-icon">🌐</span>
                    <div>
                      <p className="cd-detail-label">รูปแบบ</p>
                      <p className="cd-detail-value">ออนไลน์</p>
                    </div>
                  </div>
                  {course.online_expiry && (
                    <div className="cd-detail-item">
                      <span className="cd-detail-icon">⏳</span>
                      <div>
                        <p className="cd-detail-label">อายุการเข้าถึง</p>
                        <p className="cd-detail-value">{course.online_expiry}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Onsite sub-section */}
            {course.is_onsite && (
              <div className="cd-type-section cd-type-section--onsite">
                <div className="cd-type-section-header">
                  <span className="cd-type-section-icon">🏫</span>
                  ข้อมูลคอร์สออนไซต์
                </div>
                <div className="cd-details-grid">
                  <div className="cd-detail-item">
                    <span className="cd-detail-icon">📍</span>
                    <div>
                      <p className="cd-detail-label">รูปแบบ</p>
                      <p className="cd-detail-value">ออนไซต์</p>
                    </div>
                  </div>

                  {course.onsite_days && course.onsite_days.length > 0 && (
                    <div className="cd-detail-item">
                      <span className="cd-detail-icon">📅</span>
                      <div>
                        <p className="cd-detail-label">วันเรียน</p>
                        <p className="cd-detail-value">{formatDays(course.onsite_days)}</p>
                      </div>
                    </div>
                  )}

                  {course.onsite_time_start && course.onsite_time_end && (
                    <div className="cd-detail-item">
                      <span className="cd-detail-icon">🕐</span>
                      <div>
                        <p className="cd-detail-label">เวลาเรียน</p>
                        <p className="cd-detail-value">{course.onsite_time_start} – {course.onsite_time_end}</p>
                      </div>
                    </div>
                  )}

                  {course.onsite_duration && (
                    <div className="cd-detail-item">
                      <span className="cd-detail-icon">⏱️</span>
                      <div>
                        <p className="cd-detail-label">ระยะเวลา</p>
                        <p className="cd-detail-value">{course.onsite_duration}</p>
                      </div>
                    </div>
                  )}

                  {course.onsite_seats && (
                    <div className="cd-detail-item">
                      <span className="cd-detail-icon">💺</span>
                      <div>
                        <p className="cd-detail-label">ที่นั่ง</p>
                        <p className="cd-detail-value">
                          {onsiteBooked !== null ? `${onsiteBooked}/` : ''}{course.onsite_seats} ที่นั่ง
                        </p>
                      </div>
                    </div>
                  )}

                  {course.onsite_exam_schedule && (
                    <div className="cd-detail-item">
                      <span className="cd-detail-icon">📝</span>
                      <div>
                        <p className="cd-detail-label">กำหนดสอบ</p>
                        <p className="cd-detail-value">{course.onsite_exam_schedule}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: action card */}
        <div className="cd-sidebar">
          <div className="cd-action-card">
            {/* price big */}
            <p className="cd-action-price">{formatPrice(course.price)}</p>

            <div className="cd-type-badges-row">
              <div className="cd-type-badges">
                {course.is_online && <span className="cd-type-badge online">🖥️ ออนไลน์</span>}
                {course.is_onsite && <span className="cd-type-badge onsite">🏫 ออนไซต์</span>}
              </div>
              {isLoggedIn && (
                <button
                  className={`cd-heart-btn ${isWishlisted ? 'liked' : ''}`}
                  onClick={handleWishlist}
                  title={isWishlisted ? 'นำออกจากสิ่งที่ถูกใจ' : 'บันทึกสิ่งที่ถูกใจ'}
                >
                  <Heart size={20} stroke={isWishlisted ? '#ef4444' : '#475569'} fill={isWishlisted ? '#ef4444' : 'none'} strokeWidth={2} />
                </button>
              )}
            </div>

            {checkingAccess ? (
              <div style={{ textAlign: 'center', padding: '10px', color: '#64748b' }}>กำลังตรวจสอบสิทธิ์...</div>
            ) : !isLoggedIn ? (
              <button className="cd-login-btn" onClick={() => navigate('/login')}>
                เข้าสู่ระบบเพื่อลงทะเบียน
              </button>
            ) : (
              <div className="cd-action-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                {!isEnrolled ? (
                  <button
                    className={`cd-cart-btn ${inCart ? 'in-cart' : ''}`}
                    onClick={handleAddToCart}
                    disabled={inCart}
                    style={{ width: '100%' }}
                  >
                    {inCart ? '✓ อยู่ในตะกร้าแล้ว' : '🛒 สมัครเรียน'}
                  </button>
                ) : (
                  <>
                    <div className="cd-enrolled-badge" style={{ textAlign: 'center', padding: '10px', background: '#ecfdf5', color: '#059669', borderRadius: '8px', fontWeight: 'bold' }}>
                      ✨ คุณสมัครคอร์สนี้แล้ว
                    </div>
                    <button
                      className="cd-booking-btn"
                      onClick={() => setShowBookingForm(true)}
                      style={{ width: '100%' }}
                    >
                      📅 จองการเรียนเพิ่มเติม
                    </button>
                  </>
                )}
              </div>
            )}

            {cartMsg && <p className="cd-cart-msg">{cartMsg}</p>}

            {bookingMsg && <p className="cd-booking-msg">{bookingMsg}</p>}

            {inCart && isLoggedIn && (
              <button className="cd-go-cart-btn" onClick={() => navigate('/cart')}>
                ไปที่ตะกร้า →
              </button>
            )}

            <div className="cd-instructor-block">
              <p className="cd-instructor-label">ผู้สอน</p>
              <p className="cd-instructor-name">{instructorName}</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Cart confirmation modal */}
      {showCartModal && course && (
        <div className="cd-modal-overlay" onClick={() => setShowCartModal(false)}>
          <div className="cd-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cd-modal-close" onClick={() => setShowCartModal(false)}>✕</button>
            
            <h2 className="cd-modal-title">เพิ่มคอร์สเข้าตะกร้า</h2>
            
            <div className="cd-modal-content">
              <div className="cd-modal-course-info">
                <p className="cd-modal-label">ชื่อคอร์ส</p>
                <p className="cd-modal-value">{course.title}</p>
              </div>
              
              <div className="cd-modal-course-info">
                <p className="cd-modal-label">อาจารย์</p>
                <p className="cd-modal-value">{instructorName}</p>
              </div>
              
              <div className="cd-modal-course-info">
                <p className="cd-modal-label">ราคา</p>
                <p className="cd-modal-value cd-modal-price">{formatPrice(course.price)}</p>
              </div>

              {/* ถ้ามีทั้ง online และ onsite ให้เลือก */}
              {course.is_online && course.is_onsite ? (
                <div className="cd-modal-course-info">
                  <p className="cd-modal-label">เลือกประเภทการเรียน <span style={{ color: '#ef4444' }}>*</span></p>
                  <div className="cd-modal-type-options">
                    <label className={`cd-modal-type-option ${selectedType === 'online' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="courseType"
                        value="online"
                        checked={selectedType === 'online'}
                        onChange={() => setSelectedType('online')}
                      />
                      <span className="cd-modal-type-label">
                        <span className="cd-modal-type-icon">🖥️</span>
                        ออนไลน์
                        {course.online_expiry && <span className="cd-modal-type-detail">{course.online_expiry}</span>}
                      </span>
                    </label>
                    <label className={`cd-modal-type-option ${selectedType === 'onsite' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="courseType"
                        value="onsite"
                        checked={selectedType === 'onsite'}
                        onChange={() => setSelectedType('onsite')}
                      />
                      <span className="cd-modal-type-label">
                        <span className="cd-modal-type-icon">🏫</span>
                        ออนไซต์
                        {course.onsite_days && course.onsite_days.length > 0 && (
                          <span className="cd-modal-type-detail">{formatDays(course.onsite_days)}</span>
                        )}
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="cd-modal-course-info">
                  <p className="cd-modal-label">ประเภทการเรียน</p>
                  <div className="cd-modal-type-display">
                    {course.is_online && <span className="cd-type-badge online">🖥️ ออนไลน์</span>}
                    {course.is_onsite && <span className="cd-type-badge onsite">🏫 ออนไซต์</span>}
                  </div>
                </div>
              )}

              {/* Schedule Selection if onsite is selected */}
              {(selectedType === 'onsite' || (!course.is_online && course.is_onsite)) && (
                <div className="cd-modal-course-info" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <p className="cd-modal-label" style={{ minWidth: 'auto', marginBottom: '8px' }}>เลือกรอบเวลาเรียน <span style={{ color: '#ef4444' }}>*</span></p>
                  
                  {schedules.length === 0 ? (
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>ไม่มีรอบเวลาเปิดรับในขณะนี้</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      {schedules.map((schedule) => {
                        const date = new Date(schedule.start_time);
                        const formattedDate = date.toLocaleDateString('th-TH', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                        const timeStart = new Date(schedule.start_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                        const timeEnd = new Date(schedule.end_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                          <label key={schedule.id} style={{
                            display: 'flex', alignItems: 'center', padding: '10px 12px',
                            border: `1px solid ${selectedScheduleId === schedule.id ? '#0A1C39' : '#e2e8f0'}`,
                            borderRadius: '8px', cursor: 'pointer',
                            background: selectedScheduleId === schedule.id ? '#f8fafc' : 'white'
                          }}>
                            <input
                              type="radio"
                              name="scheduleSelection"
                              value={schedule.id}
                              checked={selectedScheduleId === schedule.id}
                              onChange={() => setSelectedScheduleId(schedule.id)}
                              style={{ marginRight: '10px' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.95rem', fontWeight: '500', color: '#0f172a' }}>
                                📅 {formattedDate} ({timeStart} - {timeEnd})
                              </div>
                              {schedule.room_location && (
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                                  📍 ห้อง: {schedule.room_location}
                                </div>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="cd-modal-actions">
              <button className="cd-modal-btn cd-modal-btn-cancel" onClick={() => setShowCartModal(false)}>
                ยกเลิก
              </button>
              <button className="cd-modal-btn cd-modal-btn-confirm" onClick={handleConfirmAddToCart}>
                เพิ่มเข้าตะกร้า
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking form modal */}
      {showBookingForm && course && (
        <div className="cd-modal-overlay" onClick={() => setShowBookingForm(false)}>
          <div className="cd-modal cd-booking-modal" onClick={(e) => e.stopPropagation()}>
            <BookingForm
              courseId={courseId || ''}
              isOnline={course.is_online}
              isOnsite={course.is_onsite}
              onBookingComplete={(bookingId: string) => {
                console.log('Booking complete for:', bookingId);
                setShowBookingForm(false);
                setBookingMsg('✓ จองการเรียนสำเร็จแล้ว!');
                setTimeout(() => setBookingMsg(''), 3000);
              }}
              onClose={() => setShowBookingForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
