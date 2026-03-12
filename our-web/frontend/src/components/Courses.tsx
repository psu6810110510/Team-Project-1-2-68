import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { courseAPI, CourseLevel, CourseStatus, type Course } from '../api/courseAPI';
import courseLeftImage from '../assets/courseleftimage.png';
import courseRightImage from '../assets/courserightimage.png';
import '../styles/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<CourseLevel[]>([]);
  const [filterOnline, setFilterOnline] = useState(false);
  const [filterOnsite, setFilterOnsite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch only PUBLISHED courses for students
        const response = await courseAPI.getAllCourses(100, 0, CourseStatus.PUBLISHED);
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

    const price = typeof course.price === 'number' ? course.price : parseFloat(course.price as any);
    const matchesMinPrice = priceMin === '' || (!isNaN(price) && price >= parseFloat(priceMin));
    const matchesMaxPrice = priceMax === '' || (!isNaN(price) && price <= parseFloat(priceMax));

    const tags = (course.tags || '').toLowerCase();
    const tagArray = tags.split(/[\s,]+/).filter(t => t.startsWith('#'));
    const matchesLevel =
      selectedLevels.length === 0 ||
      selectedLevels.some((lvl) => tagArray.includes(`#${lvl}`));

    const matchesDelivery =
      (!filterOnline && !filterOnsite) ||
      (filterOnline && course.is_online) ||
      (filterOnsite && course.is_onsite);

    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesLevel && matchesDelivery;
  });

  const toggleLevel = (level: CourseLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const hasActiveFilters =
    priceMin !== '' || priceMax !== '' || selectedLevels.length > 0 || filterOnline || filterOnsite;

  const resetFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedLevels([]);
    setFilterOnline(false);
    setFilterOnsite(false);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
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
              className={`filter-button ${hasActiveFilters ? 'filter-active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              ตัวกรอง
              {hasActiveFilters && <span className="filter-badge" />}
              <svg className={`chevron ${showFilters ? 'open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showFilters && (
              <div className="filter-menu">
                {/* Price Range */}
                <div className="filter-section">
                  <p className="filter-section-title">ช่วงราคา (บาท)</p>
                  <div className="price-range-row">
                    <input
                      type="number"
                      placeholder="ต่ำสุด"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className="price-input"
                      min="0"
                    />
                    <span className="price-separator">–</span>
                    <input
                      type="number"
                      placeholder="สูงสุด"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className="price-input"
                      min="0"
                    />
                  </div>
                </div>

                {/* Level */}
                <div className="filter-section">
                  <p className="filter-section-title">ระดับ</p>
                  <div className="checkbox-group">
                    {([
                      { value: CourseLevel.BEGINNER, label: 'Beginner' },
                      { value: CourseLevel.INTERMEDIATE, label: 'Intermediate' },
                      { value: CourseLevel.HARD, label: 'Hard' },
                    ] as const).map(({ value, label }) => (
                      <label key={value} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedLevels.includes(value)}
                          onChange={() => toggleLevel(value)}
                          className="filter-checkbox"
                        />
                        <span className={`level-badge level-${value}`}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Delivery Mode */}
                <div className="filter-section">
                  <p className="filter-section-title">รูปแบบการเรียน</p>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filterOnline}
                        onChange={(e) => setFilterOnline(e.target.checked)}
                        className="filter-checkbox"
                      />
                      <span>🖥️ ออนไลน์</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={filterOnsite}
                        onChange={(e) => setFilterOnsite(e.target.checked)}
                        className="filter-checkbox"
                      />
                      <span>🏫 ออนไซต์</span>
                    </label>
                  </div>
                </div>

                {hasActiveFilters && (
                  <button className="reset-filters-btn" onClick={resetFilters}>
                    ล้างตัวกรองทั้งหมด
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="courses-header">
          <p className="courses-count">
            {(searchTerm || hasActiveFilters)
              ? `พบ ${filteredCourses.length} จาก ${courses.length} คอร์ส`
              : `มีทั้งหมด ${courses.length} คอร์ส`}
          </p>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="no-courses">
            <p>{(searchTerm || hasActiveFilters) ? 'ไม่พบคอร์สที่ตรงกับเงื่อนไข' : 'ยังไม่มีคอร์สในระบบ'}</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => {
              const price = typeof course.price === 'number' ? course.price : parseFloat(course.price as any);
              const formattedPrice = isNaN(price) || price === 0 ? 'ฟรี' : `฿${price.toLocaleString('th-TH')}`;
              const instructorName = course.instructor_name || course.instructor?.full_name || 'ไม่ระบุ';
              
              // Parse tags properly to check for level
              const tags = (course.tags || '').toLowerCase();
              const tagArray = tags.split(/[\s,]+/).filter(t => t.startsWith('#'));
              
              let level: string | null = null;
              if (tagArray.includes('#beginner')) {
                level = 'Beginner';
              } else if (tagArray.includes('#intermediate')) {
                level = 'Intermediate';
              } else if (tagArray.includes('#hard')) {
                level = 'Hard';
              }
              
              const enrolledCount = course.students_enrolled ?? 0;

              return (
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
                    {level && (
                      <div className={`course-level-badge level-${level.toLowerCase()}`}>
                        {level}
                      </div>
                    )}
                  </div>
                  <div className="course-info">
                    <h3 className="course-title">{course.title}</h3>
                    
                    <div className="course-instructor">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>{instructorName}</span>
                    </div>

                    <p className="course-description">
                      {course.description || 'ไม่มีคำอธิบาย'}
                    </p>

                    <div className="course-meta">
                      <div className="course-delivery-badges">
                        {course.is_online && <span className="delivery-badge online">🖥️ ออนไลน์</span>}
                        {course.is_onsite && <span className="delivery-badge onsite">🏫 ออนไซต์</span>}
                      </div>
                      <div className="course-enrolled">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>{enrolledCount.toLocaleString('th-TH')}</span>
                      </div>
                    </div>

                    <div className="course-footer">
                      <span className="course-price">{formattedPrice}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Courses;
