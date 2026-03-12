import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  ArrowRight,
  Play,
  MessageCircle
} from 'lucide-react';
import Header from './Header';
import '../styles/Home.css';
import homeicon from '../assets/homeicon.png';
import Footer from './Footer';
import { courseAPI, CourseStatus } from '../api/courseAPI';
import type { Course } from '../api/courseAPI';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  useEffect(() => {
    courseAPI.getAllCourses(6, 0, CourseStatus.PUBLISHED)
      .then(res => {
        const courses = res.data?.data ?? [];
        setPopularCourses(courses.slice(0, 3));
      })
      .catch(() => setPopularCourses([]));
  }, []);

  const features = [
    {
      icon: <BookOpen size={40} />,
      title: 'คอร์สออนไลน์คุณภาพ',
      description: 'เรียนรู้จากผู้เชี่ยวชาญด้านต่างๆ ด้วยเนื้อหาที่ออกแบบมาอย่างดี'
    },
    {
      icon: <Users size={40} />,
      title: 'เรียนกับผู้เชี่ยวชาญ',
      description: 'อาจารย์มืออาชีพพร้อมให้คำปรึกษาและแนะนำตลอดการเรียน'
    },
    {
      icon: <Award size={40} />,
      title: 'ใบประกาศนียบัตร',
      description: 'รับใบประกาศนียบัตรหลังจบคอร์สเพื่อเพิ่มมูลค่าให้ CV ของคุณ'
    },
    {
      icon: <Clock size={40} />,
      title: 'เรียนได้ตลอดเวลา',
      description: 'เข้าถึงบทเรียนได้ทุกที่ทุกเวลา เรียนตามจังหวะของคุณเอง'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'นักเรียน' },
    { number: '500+', label: 'คอร์สเรียน' },
    { number: '100+', label: 'อาจารย์' },
    { number: '4.8/5', label: 'คะแนนเฉลี่ย' }
  ];

  return (
    <div className="home-page">
      <Header user={user} />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              เรียนรู้ทักษะใหม่
              <span className="highlight"> เปลี่ยนอนาคต</span>
            </h1>
            <p className="hero-description">
              พัฒนาตัวเองด้วยคอร์สออนไลน์คุณภาพสูง จากผู้เชี่ยวชาญมืออาชีพ
              เรียนได้ทุกที่ทุกเวลา พร้อมรับใบประกาศนียบัตร
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-primary"
                onClick={() => navigate('/courses')}
              >
                <Play size={20} />
                เริ่มเรียนเลย
              </button>
            </div>

            {/* Stats */}
            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-image">
            <img src={homeicon} alt="Learning Platform" />
            <div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>ทำไมต้องเลือกเรียนกับเรา?</h2>
          <p>เราให้มากกว่าแค่คอร์สเรียน เรามอบประสบการณ์การเรียนรู้ที่ดีที่สุด</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="courses-section">
        <div className="section-header">
          <h2>คอร์สยอดนิยม</h2>
          <p>คอร์สเรียนที่ได้รับความนิยมสูงสุดในเดือนนี้</p>
        </div>

        <div className="courses-grid">
          {popularCourses.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', gridColumn: '1/-1' }}>ยังไม่มีคอร์สที่เผยแพร่ในขณะนี้</p>
          ) : (
            popularCourses.map((course) => (
              <div key={course.id} className="course-card" onClick={() => navigate(`/courses/${course.id}`)}>
                <div className="course-image">
                  <img
                    src={course.thumbnail_url || homeicon}
                    alt={course.title}
                    onError={(e) => { (e.target as HTMLImageElement).src = homeicon; }}
                  />
                </div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p className="course-instructor">
                    {course.instructor_name || course.instructor?.full_name || 'ไม่ระบุผู้สอน'}
                  </p>
                  <div className="course-meta">
                    <span className="course-students">
                      <Users size={16} />
                      {(course.students_enrolled ?? 0).toLocaleString()} คน
                    </span>
                  </div>
                  <div className="course-footer">
                    <span className="course-price">
                      {course.price ? `฿${course.price.toLocaleString()}` : 'ฟรี'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="view-all-container">
          <button 
            className="btn-view-all"
            onClick={() => navigate('/courses')}
          >
            ดูคอร์สทั้งหมด
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>พร้อมที่จะเริ่มต้นการเรียนรู้แล้วหรือยัง?</h2>
          <p>เข้าร่วมกับนักเรียนหลายพันคนที่กำลังพัฒนาทักษะของตัวเองทุกวัน</p>
          <div className="cta-buttons">
            <button 
              className="btn-cta-primary"
              onClick={() => user ? navigate('/courses') : navigate('/register')}
            >
              <MessageCircle size={20} />
              {user ? 'เริ่มเรียนเลย' : 'สมัครสมาชิกฟรี'}
            </button>
            <button 
              className="btn-cta-secondary"
              onClick={() => navigate('/courses')}
            >
              ดูตัวอย่างคอร์ส
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
