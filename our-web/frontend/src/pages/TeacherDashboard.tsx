/* ไฟล์: src/pages/TeacherDashboard.tsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, User, LogOut, Edit3, Camera, ChevronLeft, PlusCircle, Clock, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import '../styles/LoginTheme.css'; 
import '../styles/ProfileTheme.css'; 
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';

// ✅ ดึงค่าจาก .env (อย่าลืมเติม VITE_ ในไฟล์ .env นะครับ)
const API_URL = import.meta.env.VITE_API_URL;

interface Course {
  id: number;
  title: string;
  status: 'REQUEST_CREATE' | 'DRAFTING' | 'PENDING_REVIEW' | 'PUBLISHED';
  students: number;
  image: string;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const [teacherData] = useState({
    firstName: 'อาจารย์ใจดี',
    lastName: 'สอนเก่ง',
    email: 'ajarn@gmail.com',
    role: 'TEACHER',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&h=200',
    description: '“ความรู้คืออาวุธ”'
  });

  const [activeMenu, setActiveMenu] = useState('courses');

  const [myCourses, setMyCourses] = useState<Course[]>([
    { id: 1, title: 'Advanced Python 2026', status: 'REQUEST_CREATE', students: 0, image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=400&q=80' },
    { id: 2, title: 'React for Beginners', status: 'DRAFTING', students: 0, image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80' },
    { id: 3, title: 'Data Science 101', status: 'PENDING_REVIEW', students: 0, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80' },
    { id: 4, title: 'Basic HTML/CSS', status: 'PUBLISHED', students: 120, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&q=80' }
  ]);

  // ✅ ฟังก์ชันอัปเดตสถานะคอร์ส (จำลองการเชื่อมต่อ API_URL)
  const handleUpdateStatus = (id: number, newStatus: Course['status']) => {
    console.log(`Connecting to ${API_URL}/courses/${id}`); // ทดสอบดึงค่า API_URL มาใช้
    setMyCourses(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    if (newStatus === 'PENDING_REVIEW') {
      alert("ส่งเนื้อหาให้แอดมินตรวจสอบเรียบร้อยแล้ว!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUEST_CREATE': return <span style={{color: '#eab308', background: '#fefce8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px'}}><Clock size={14}/> รออนุมัติสร้าง</span>;
      case 'DRAFTING': return <span style={{color: '#3b82f6', background: '#eff6ff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px'}}><Edit3 size={14}/> กำลังใส่เนื้อหา</span>;
      case 'PENDING_REVIEW': return <span style={{color: '#f97316', background: '#fff7ed', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px'}}><AlertCircle size={14}/> รออนุมัติขาย</span>;
      case 'PUBLISHED': return <span style={{color: '#22c55e', background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px'}}><CheckCircle size={14}/> วางขายแล้ว</span>;
      default: return null;
    }
  };

  return (
    <div className="page-container">
       <nav className="navbar" style={{ background: '#081324' }}>
        <div className="nav-logo">
          <img src={logoImage} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />
          <img src={fullLogo} alt="Born2Code Logo" style={{ height: '50px', width: 'auto' }} />
        </div>
        <div className="nav-icons">
          <Search className="nav-icon" size={24} /><ShoppingCart className="nav-icon" size={24} /><Menu className="nav-icon" size={24} /><User className="nav-icon" size={24} />
        </div>
      </nav>

      <div className="profile-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => navigate('/dashboard')}>
            <div style={{ background: '#cbd5e1', borderRadius: '50%', padding: '6px', display: 'flex' }}><ChevronLeft size={20} color="white" /></div><span>กลับหน้าหลัก</span>
          </div>
        </div>

        <div className="profile-container">
          <aside className="profile-sidebar">
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
               <img src={teacherData.image} alt="Profile" className="sidebar-avatar" style={{ objectFit: 'cover' }} />
               <div style={{ position: 'absolute', bottom: '10px', right: '0', background: 'white', borderRadius: '50%', padding: '6px', border: '1px solid #e2e8f0', display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                 <Camera size={16} color="#475569"/>
               </div>
            </div>
            <h2 className="sidebar-name">{teacherData.firstName}</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>{teacherData.email}</p>
            <ul className="sidebar-menu">
              <li className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`} onClick={() => setActiveMenu('profile')}><User size={20} /> ข้อมูลส่วนตัว</li>
              <li className={`menu-item ${activeMenu === 'courses' ? 'active' : ''}`} onClick={() => setActiveMenu('courses')}><BookOpen size={20} /> จัดการคอร์สเรียน</li>
              <li className="menu-item logout" onClick={handleLogout}><LogOut size={20} /> ออกจากระบบ</li>
            </ul>
          </aside>

          <main className="profile-content">
            {activeMenu === 'profile' && (
              <>
                <div className="content-header"><span className="content-title">ข้อมูลอาจารย์</span></div>
                <div className="profile-details">
                  <div className="info-row"><span className="info-label">ชื่อ</span><span className="info-value">{teacherData.firstName} {teacherData.lastName}</span><button className="edit-btn"><Edit3 size={18} /></button></div>
                  <div className="info-row"><span className="info-label">อีเมล</span><span className="info-value" style={{color: '#94a3b8'}}>{teacherData.email}</span></div>
                </div>
              </>
            )}

            {activeMenu === 'courses' && (
              <>
                <div className="content-header" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                    <span className="content-title">คอร์สเรียนของคุณ</span>
                    <button style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                        <PlusCircle size={18} /> ขอเปิดคอร์สใหม่
                    </button>
                </div>

                <div className="section-header"><span className="section-title-text">รายการคอร์สทั้งหมด</span></div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {myCourses.map((course) => (
                    <div key={course.id} style={{ display: 'flex', flexWrap: 'wrap', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', gap: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <img src={course.image} alt={course.title} style={{ width: '180px', height: '130px', objectFit: 'cover', borderRadius: '10px' }} />

                      <div style={{ flex: 1, minWidth: '250px' }}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{course.title}</h3>
                            {getStatusBadge(course.status)}
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.5rem 0 1.5rem 0' }}>รหัสคอร์ส: COURSE-{course.id.toString().padStart(4, '0')}</p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          
                          {/* ✅ Logic ปุ่มกดตามสถานะ */}
                          {course.status === 'REQUEST_CREATE' && <span style={{ color: '#94a3b8' }}>⏳ รอ Admin อนุมัติ...</span>}

                          {course.status === 'DRAFTING' && (
                            <>
                              <button style={{ padding: '8px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '30px', cursor: 'pointer' }}>✏️ แก้ไขเนื้อหา</button>
                              <button 
                                onClick={() => handleUpdateStatus(course.id, 'PENDING_REVIEW')}
                                style={{ padding: '8px 20px', background: '#3b82f6', border: 'none', borderRadius: '30px', cursor: 'pointer', color: 'white' }}
                              >
                                🚀 ส่งขออนุมัติขาย
                              </button>
                            </>
                          )}

                          {course.status === 'PENDING_REVIEW' && <span style={{ color: '#f97316' }}>🕵️‍♀️ กำลังตรวจสอบ...</span>}

                          {course.status === 'PUBLISHED' && (
                             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{course.students}</div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>นักเรียนที่ลงทะเบียน</div>
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}