import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { courseAPI, type Course } from '../api/courseAPI';
import courseLeftImage from '../assets/courseleftimage.png';
import courseRightImage from '../assets/courserightimage.png';
import '../styles/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await courseAPI.getAllCourses();
        setCourses(response.data.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        if (err.response?.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
        } else {
          setError('ไม่สามารถโหลดข้อมูลคอร์สได้');
        }
        setLoading(false);
      }
    };

    fetchCourses();
  }, [navigate]);

  // Filter courses based on search term
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleCourseClick = (courseId: string) => {
    // Navigate to course detail page (to be implemented)
    console.log('Selected course:', courseId);
    // navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="courses-page">
        <Header />
        <div className="courses-container">
          <div className="loading">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-page">
        <Header />
        <div className="courses-container">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-page">
      <Header />
      <div className="color-banner">
        <img src={courseLeftImage} alt="Course Left" className="banner-left-image" />
        <h1 className="banner-title">คอร์สทั้งหมด</h1>
        <img src={courseRightImage} alt="Course Right" className="banner-right-image" />
      </div>
      <div className="courses-container">
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาคอร์สเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <div className="filter-dropdown">
            <button
              className="filter-button"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              ตัวกรอง
              <svg className={`chevron ${showFilters ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showFilters && (
              <div className="filter-menu">
                <p className="filter-placeholder">ตัวกรองจะถูกเพิ่มในภายหลัง</p>
                {/* Filters will be added here */}
              </div>
            )}
          </div>
        </div>

        <div className="courses-header">
          <p className="courses-count">
            {searchTerm ? `พบ ${filteredCourses.length} จาก ${courses.length} คอร์ส` : `มีทั้งหมด ${courses.length} คอร์ส`}
          </p>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <p>{searchTerm ? 'ไม่พบคอร์สที่ค้นหา' : 'ยังไม่มีคอร์สในระบบ'}</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className={`course-card ${!course.is_active ? 'inactive' : ''}`}
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="course-thumbnail">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} />
                  ) : (
                    <div className="no-thumbnail">
                      <span>📚</span>
                    </div>
                  )}
                  {!course.is_active && (
                    <div className="inactive-badge">ปิดการใช้งาน</div>
                  )}
                </div>
                <div className="course-info">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">
                    {course.description || 'ไม่มีคำอธิบาย'}
                  </p>
                  <div className="course-footer">
                    <span className="course-date">
                      สร้างเมื่อ: {new Date(course.created_at).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
