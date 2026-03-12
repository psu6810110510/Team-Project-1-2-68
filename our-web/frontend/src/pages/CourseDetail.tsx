import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingForm from '../components/BookingForm';
import { courseAPI, type Course } from '../api/courseAPI';
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

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);

    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        const res = await courseAPI.getCourseById(courseId);
        setCourse(res.data);
        if (res.data.is_onsite) {
          try {
            const seatRes = await courseAPI.getOnsiteBookedCount(courseId);
            setOnsiteBooked(seatRes.data.count);
          } catch {
            setOnsiteBooked(0);
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

    fetchCourse();
  }, [courseId, navigate]);

  // Sync wishlist & cart state from localStorage
  useEffect(() => {
    if (!courseId) return;
    const wishlist: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsWishlisted(wishlist.includes(courseId));
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    setInCart(cart.some((c) => c.id === courseId));
  }, [courseId]);

  const handleWishlist = () => {
    if (!courseId) return;
    const wishlist: string[] = JSON.parse(localStorage.getItem('wishlist') || '[]');
    let updated: string[];
    if (isWishlisted) {
      updated = wishlist.filter((id) => id !== courseId);
    } else {
      updated = [...wishlist, courseId];
    }
    localStorage.setItem('wishlist', JSON.stringify(updated));
    setIsWishlisted(!isWishlisted);
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
    };
    localStorage.setItem('cart', JSON.stringify([...cart, item]));
    setInCart(true);
    setCartMsg('เพิ่มลงตะกร้าแล้ว!');
    setTimeout(() => setCartMsg(''), 2500);
    setShowCartModal(false);
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

            <div className="cd-type-badges">
              {course.is_online && <span className="cd-type-badge online">🖥️ ออนไลน์</span>}
              {course.is_onsite && <span className="cd-type-badge onsite">🏫 ออนไซต์</span>}
            </div>

            {!isLoggedIn ? (
              <button className="cd-login-btn" onClick={() => navigate('/login')}>
                เข้าสู่ระบบเพื่อลงทะเบียน
              </button>
            ) : (
              <div className="cd-action-buttons">
                <button
                  className={`cd-cart-btn ${inCart ? 'in-cart' : ''}`}
                  onClick={handleAddToCart}
                  disabled={inCart}
                >
                  {inCart ? '✓ อยู่ในตะกร้าแล้ว' : '🛒 เพิ่มเข้าตะกร้า'}
                </button>

                <button
                  className="cd-booking-btn"
                  onClick={() => setShowBookingForm(true)}
                >
                  📅 จองการเรียน
                </button>

                <button
                  className={`cd-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                  onClick={handleWishlist}
                  title={isWishlisted ? 'นำออกจากสิ่งที่ถูกใจ' : 'บันทึกสิ่งที่ถูกใจ'}
                >
                  {isWishlisted ? '❤️' : '🤍'}
                </button>
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
              onBookingComplete={(bookingId) => {
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
