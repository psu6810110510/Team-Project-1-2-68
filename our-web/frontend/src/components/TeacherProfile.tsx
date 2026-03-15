import React, { useState, useEffect } from 'react';
import { GraduationCap, Award, BookOpen, Mail, Phone, X } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import '../styles/TeacherProfile.css';

interface Teacher {
  id: number;
  name: string;
  bachelorDegree: string;
  masterDegree?: string;
  doctorateDegree?: string;
  expertise: string;
  profileImage?: string;
  email?: string;
  phone?: string;
  description?: string;
}

const TeacherProfile: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  // Mock data สำหรับ demo (ถ้า API ยังไม่พร้อม)
  const mockTeachers: Teacher[] = [
    {
      id: 1,
      name: 'อ.สมชาย ใจดี',
      bachelorDegree: 'วท.บ. วิทยาการคอมพิวเตอร์ มหาวิทยาลัยเชียงใหม่',
      masterDegree: 'วท.ม. วิศวกรรมซอฟต์แวร์ จุฬาลงกรณ์มหาวิทยาลัย',
      expertise: 'Python, Data Science, Machine Learning',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300',
      email: 'somchai@born2code.com',
      phone: '081-234-5678',
      description: 'ผู้เชี่ยวชาญด้าน Data Science และ Machine Learning มีประสบการณ์สอนมากกว่า 10 ปี'
    },
    {
      id: 2,
      name: 'อ.สมหญิง เก่งโค้ด',
      bachelorDegree: 'วท.บ. วิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
      masterDegree: 'วท.ม. เทคโนโลยีสารสนเทศ มหาวิทยาลัยมหิดล',
      doctorateDegree: 'ปร.ด. วิศวกรรมซอฟต์แวร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี',
      expertise: 'React, TypeScript, Frontend Development',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300',
      email: 'somying@born2code.com',
      phone: '082-345-6789',
      description: 'ผู้เชี่ยวชาญด้าน Frontend Development และ UI/UX Design พร้อมประสบการณ์ในอุตสาหกรรมมากกว่า 8 ปี'
    },
    {
      id: 3,
      name: 'อ.วิทย์ วิเคราะห์',
      bachelorDegree: 'วท.บ. สถิติประยุกต์ มหาวิทยาลัยเกษตรศาสตร์',
      masterDegree: 'วท.ม. วิทยาการข้อมูล มหาวิทยาลัยธรรมศาสตร์',
      expertise: 'Data Analysis, Statistics, Data Visualization',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300',
      email: 'wit@born2code.com',
      phone: '083-456-7890',
      description: 'นักวิเคราะห์ข้อมูลมืออาชีพ เชี่ยวชาญด้านการวิเคราะห์เชิงสถิติและ Data Visualization'
    }
  ];

  useEffect(() => {
    // ลอง fetch จาก API ก่อน ถ้าไม่ได้ให้ใช้ mock data
    fetch('/api/teachers')
      .then((response) => response.json())
      .then((data) => {
        setTeachers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.log('Using mock data:', error);
        setTeachers(mockTeachers);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <Header />
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <p>กำลังโหลดข้อมูล...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="teacher-profile-page">
      <Header />
      
      {/* Hero Section */}
      <section className="teacher-hero">
        <div className="teacher-hero-content">
          <GraduationCap size={60} className="hero-icon" />
          <h1>ทีมอาจารย์ผู้เชี่ยวชาญ</h1>
          <p>พบกับทีมผู้สอนมืออาชีพที่พร้อมจะนำพาคุณสู่ความสำเร็จ</p>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="teachers-section">
        <div className="teachers-container">
          <div className="teachers-grid">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="teacher-card">
                <div className="teacher-card-header">
                  {teacher.profileImage ? (
                    <img 
                      src={teacher.profileImage} 
                      alt={`${teacher.name}'s profile`}
                      className="teacher-avatar"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setExpandedImage(teacher.profileImage!)}
                    />
                  ) : (
                    <div className="teacher-avatar-placeholder">
                      <GraduationCap size={40} />
                    </div>
                  )}
                  <h2 className="teacher-name">{teacher.name}</h2>
                  {teacher.description && (
                    <p className="teacher-description">{teacher.description}</p>
                  )}
                </div>

                <div className="teacher-card-body">
                  {/* Education */}
                  <div className="teacher-section">
                    <div className="section-title">
                      <Award size={20} />
                      <span>การศึกษา</span>
                    </div>
                    <div className="education-list">
                      <div className="education-item">
                        <span className="degree-badge">ปริญญาตรี</span>
                        <p>{teacher.bachelorDegree}</p>
                      </div>
                      {teacher.masterDegree && (
                        <div className="education-item">
                          <span className="degree-badge master">ปริญญาโท</span>
                          <p>{teacher.masterDegree}</p>
                        </div>
                      )}
                      {teacher.doctorateDegree && (
                        <div className="education-item">
                          <span className="degree-badge doctorate">ปริญญาเอก</span>
                          <p>{teacher.doctorateDegree}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expertise */}
                  <div className="teacher-section">
                    <div className="section-title">
                      <BookOpen size={20} />
                      <span>ความเชี่ยวชาญ</span>
                    </div>
                    <div className="expertise-tags">
                      {teacher.expertise.split(',').map((skill, index) => (
                        <span key={index} className="expertise-tag">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  {(teacher.email || teacher.phone) && (
                    <div className="teacher-section">
                      <div className="section-title">
                        <Mail size={20} />
                        <span>ติดต่อ</span>
                      </div>
                      <div className="contact-info">
                        {teacher.email && (
                          <div className="contact-item">
                            <Mail size={16} />
                            <span>{teacher.email}</span>
                          </div>
                        )}
                        {teacher.phone && (
                          <div className="contact-item">
                            <Phone size={16} />
                            <span>{teacher.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Modal Popup สำหรับดูรูปโปรไฟล์ขนาดเต็ม --- */}
      {expandedImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }} onClick={() => setExpandedImage(null)}>
          <button style={{
            position: 'absolute', top: '20px', right: '30px', background: 'none',
            border: 'none', color: 'white', cursor: 'pointer', padding: '10px'
          }} onClick={() => setExpandedImage(null)}>
            <X size={40} />
          </button>
          <img 
            src={expandedImage} 
            alt="Expanded Profile" 
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'cover', borderRadius: '50%', aspectRatio: '1/1' }} 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default TeacherProfile;