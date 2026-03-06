import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import { courseAPI, type Course } from '../api/courseAPI';
import '../styles/Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      <div className="courses-container">
        <div className="courses-header">
          <h1>คอร์สทั้งหมด</h1>
          <p className="courses-count">มีทั้งหมด {courses.length} คอร์ส</p>
        </div>

        {courses.length === 0 ? (
          <div className="no-courses">
            <p>ยังไม่มีคอร์สในระบบ</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
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
    </div>
  );
};

export default Courses;
