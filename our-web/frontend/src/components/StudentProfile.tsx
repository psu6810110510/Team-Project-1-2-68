/* ไฟล์: src/components/StudentProfile.tsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/LoginTheme.css'; 
import '../styles/ProfileTheme.css'; 
import { Search, ShoppingCart, Menu, User, BookOpen, Heart, LogOut, Edit3, Camera, ChevronLeft, FileText, MonitorPlay, CheckSquare } from 'lucide-react'; // เพิ่ม CheckSquare
import fullLogo from '../assets/name.png';

export default function StudentProfile() {
  const navigate = useNavigate();

  // --- Mock Data: ข้อมูลผู้ใช้ ---
  const [userData, setUserData] = useState({
    firstName: 'น้องบอร์น',
    lastName: 'ทูโค้ด',
    nickname: 'บอร์น',
    email: 'born2code@psu.ac.th',
    phone: '081-234-5678',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200',
    description: '“สู้ดิวะ!!!!!”'
  });

  // --- Mock Data: คอร์สเรียนของฉัน ---
  const myCourses = [
    {
      id: 1,
      title: 'Data Science with Python',
      instructor: 'นายอาร์ม ตัวจริง',
      startDate: '1 ก.พ. 67',
      expireDate: '31 ม.ค. 68',
      lastAccess: '1 วันที่แล้ว',
      progress: 30,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 2,
      title: 'Data Visualization',
      instructor: 'นายอาร์ม ตัวจริง',
      startDate: '1 ก.พ. 67',
      expireDate: '31 ม.ค. 68',
      lastAccess: '5 วันที่แล้ว',
      progress: 15,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80'
    }
  ];

  // --- Mock Data: สิ่งที่ถูกใจ ---
  const favoriteCourses = [
    {
      id: 101,
      title: 'Data Structures & Algorithms',
      category: 'Computer Science',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 102,
      title: 'C Programming',
      category: 'Programming Language',
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 103,
      title: 'OOP Concept',
      category: 'Object Oriented',
      image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=300&q=80'
    }
  ];

  // --- Mock Data: ประวัติการซื้อ (เพิ่มใหม่) ---
  const purchasedHistory = [
    {
      id: 201,
      title: 'Data Structures & Algorithms',
      date: '12 ม.ค. 67',
      price: '฿1,290',
      image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 202,
      title: 'C Programming',
      date: '10 ธ.ค. 66',
      price: '฿990',
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 203,
      title: 'OOP Concept',
      date: '5 พ.ย. 66',
      price: '฿1,590',
      image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=300&q=80'
    }
  ];

  // --- States ---
  // ตั้ง default เป็น 'purchases' เพื่อให้คุณเห็นผลลัพธ์ทันที
  const [activeMenu, setActiveMenu] = useState('purchases'); 
  const [activeEditMode, setActiveEditMode] = useState<string>('none');
  const [editFormData, setEditFormData] = useState(userData);

  // --- Helper Functions ---
  const handleEditClick = (mode: string) => { setEditFormData(userData); setActiveEditMode(mode); };
  const handleCloseModal = () => { setActiveEditMode('none'); };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, value } = e.target; setEditFormData({ ...editFormData, [name]: value }); };
  const handleSave = () => { setUserData(editFormData); setActiveEditMode('none'); };
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="page-container">
       <nav className="navbar" style={{ background: '#081324' }}>
        <div className="nav-logo">
          <img src={fullLogo} alt="Born2Code Logo" style={{ height: '60px', width: 'auto' }} />
        </div>
        <div className="nav-icons">
          <Search className="nav-icon" size={24} />
          <ShoppingCart className="nav-icon" size={24} />
          <Menu className="nav-icon" size={24} />
          <User className="nav-icon" size={24} />
        </div>
      </nav>

      <div className="profile-page" style={{ flexDirection: 'column', alignItems: 'center', display: 'flex' }}>
        
        {/* Back Button */}
        <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '1.5rem' }}>
          <div 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#94a3b8', fontWeight: '500', fontSize: '1rem' }}
            onClick={() => navigate('/dashboard')}
          >
            <div style={{ background: '#cbd5e1', borderRadius: '50%', padding: '6px', display: 'flex' }}>
               <ChevronLeft size={20} color="white" strokeWidth={3} />
            </div>
            <span>กลับหน้าหลัก</span>
          </div>
        </div>

        <div className="profile-container">
          
          {/* --- Sidebar --- */}
          <aside className="profile-sidebar">
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
               <img src={userData.image} alt="Profile" className="sidebar-avatar" />
               <div style={{ position: 'absolute', bottom: '10px', right: '0', background: 'white', borderRadius: '50%', padding: '6px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex' }}>
                  <Camera size={14} color="#64748b"/>
               </div>
            </div>
            <h2 className="sidebar-name" style={{ marginBottom: '0.2rem' }}>{userData.firstName} {userData.lastName}</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>{userData.email}</p>
            <p style={{ fontSize: '1rem', color: '#334155', fontWeight: '600', marginBottom: '2rem' }}>{userData.description}</p>

            <ul className="sidebar-menu">
              <li className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`} onClick={() => setActiveMenu('profile')}>
                <User size={20} /> ข้อมูลส่วนตัว
              </li>
              <li className={`menu-item ${activeMenu === 'courses' ? 'active' : ''}`} onClick={() => setActiveMenu('courses')}>
                <BookOpen size={20} /> คอร์สเรียนของฉัน
              </li>
              <li className={`menu-item ${activeMenu === 'favorites' ? 'active' : ''}`} onClick={() => setActiveMenu('favorites')}>
                <Heart size={20} /> สิ่งที่ถูกใจ
              </li>
              {/* เปลี่ยนเมนูที่ 4 เป็น "ประวัติการซื้อ" */}
              <li className={`menu-item ${activeMenu === 'purchases' ? 'active' : ''}`} onClick={() => setActiveMenu('purchases')}>
                <CheckSquare size={20} /> ประวัติการซื้อ
              </li>
              <li className="menu-item logout" onClick={handleLogout}><LogOut size={20} /> ออกจากระบบ</li>
            </ul>
          </aside>


          {/* --- Main Content Area --- */}
          <main className="profile-content">
            
            {/* 1. ข้อมูลส่วนตัว */}
            {activeMenu === 'profile' && (
              <>
                <div className="content-header"><span className="content-title">ข้อมูลส่วนตัว</span></div>
                <div className="profile-details">
                  <div className="info-row"><span className="info-label">ชื่อ</span><span className="info-value">{userData.firstName}</span><button className="edit-btn" onClick={() => handleEditClick('name')}><Edit3 size={18} /></button></div>
                  <div className="info-row"><span className="info-label">นามสกุล</span><span className="info-value">{userData.lastName}</span><button className="edit-btn" onClick={() => handleEditClick('name')}><Edit3 size={18} /></button></div>
                  <div className="info-row"><span className="info-label">ชื่อเล่น</span><span className="info-value">{userData.nickname}</span><button className="edit-btn" onClick={() => handleEditClick('nickname')}><Edit3 size={18} /></button></div>
                  <div className="info-row"><span className="info-label">อีเมล</span><span className="info-value" style={{color: '#94a3b8'}}>{userData.email}</span></div>
                  <div className="info-row"><span className="info-label">เบอร์โทรศัพท์</span><span className="info-value">{userData.phone}</span><button className="edit-btn" onClick={() => handleEditClick('phone')}><Edit3 size={18} /></button></div>
                  <div className="info-row"><span className="info-label">รหัสผ่าน</span><span className="info-value">••••••••</span><button className="edit-btn" onClick={() => handleEditClick('password')}><Edit3 size={18} /></button></div>
                </div>
              </>
            )}

            {/* 2. คอร์สเรียนของฉัน */}
            {activeMenu === 'courses' && (
              <>
                <div className="section-header"><span className="section-title-text">บริการสำหรับผู้เรียน</span></div>
                <div className="services-grid">
                  <div className="service-card"><div className="service-icon-box"><FileText size={32} /></div><div className="service-text">คลังโจทย์</div></div>
                  <div className="service-card"><div className="service-icon-box"><MonitorPlay size={32} /></div><div className="service-text">ระบบสอบออนไลน์</div></div>
                </div>
                <div className="section-header"><span className="section-title-text">คอร์สเรียนของฉัน</span></div>
                {myCourses.map((course) => (
                  <div key={course.id} className="course-card">
                    <img src={course.image} alt={course.title} className="course-img" />
                    <div className="course-info">
                      <h3 className="course-title">{course.title}</h3>
                      <p className="course-meta">อาจารย์ : <b>{course.instructor}</b></p>
                      <p className="course-meta">เริ่มเรียน : {course.startDate} &nbsp;&nbsp; หมดเวลาเรียน : {course.expireDate}</p>
                      <div className="course-progress-section">
                        <div className="progress-container"><div className="progress-fill" style={{ width: `${course.progress}%` }}></div></div>
                        <span style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: 'bold' }}>{course.progress}% Completed</span>
                        <button className="btn-continue">เรียนต่อ</button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 3. สิ่งที่ถูกใจ */}
            {activeMenu === 'favorites' && (
              <>
                <div className="favorites-header-container">
                  <div className="favorites-title-box">
                    <Heart size={24} fill="#ef4444" color="#ef4444" />
                    <span>สิ่งที่ถูกใจ</span>
                  </div>
                </div>
                <div className="favorites-grid">
                  {favoriteCourses.map((course) => (
                    <div key={course.id} className="fav-card">
                      <div className="fav-card-heart"><Heart size={18} fill="#ef4444" color="#ef4444" /></div>
                      <img src={course.image} alt={course.title} className="fav-card-img" />
                      <h3 className="fav-card-title">{course.title}</h3>
                      <p className="fav-card-desc">{course.category}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 4. ประวัติการซื้อ (เพิ่มใหม่) */}
            {activeMenu === 'purchases' && (
              <>
                {/* Header ตรงกลางแบบแคปซูล พร้อมไอคอนรถเข็น */}
                <div className="favorites-header-container">
                  <div className="favorites-title-box">
                    <ShoppingCart size={24} color="#1e293b" />
                    <span>ประวัติการซื้อ</span>
                  </div>
                </div>

                {/* Grid แสดงประวัติการซื้อ (ใช้ดีไซน์เดิม) */}
                <div className="favorites-grid">
                  {purchasedHistory.map((item) => (
                    <div key={item.id} className="fav-card">
                      {/* อาจจะใส่ไอคอนมุมขวาบนก็ได้ เช่น เครื่องหมายถูก */}
                      <div className="fav-card-heart" style={{cursor:'default'}}>
                        <CheckSquare size={18} color="#0284c7" />
                      </div>
                      
                      <img src={item.image} alt={item.title} className="fav-card-img" />
                      
                      <h3 className="fav-card-title">{item.title}</h3>
                      <p className="fav-card-desc" style={{marginBottom: '0.5rem'}}>
                        วันที่ซื้อ: {item.date}
                      </p>
                      <p style={{color: '#0284c7', fontWeight: 'bold', marginBottom: '1rem'}}>
                        {item.price}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

          </main>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content" style={{ flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
             <img src={fullLogo} alt="Logo" style={{ height: '35px' }} />
            <span style={{ fontSize: '1rem', fontWeight: '500', color: '#fff' }}>“Born2Code ตัวช่วยที่จะทำให้คุณประสบความสำเร็จทางด้านคอมพิวเตอร์”</span>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem', width: '100%' }}>
            <div><h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>ที่อยู่</h4><p style={{ marginBottom: '0.3rem' }}>สถาบันบอร์นทูโค้ด เลขที่ 15 ถ.กาญจนวณิชย์</p><p style={{ marginBottom: '1.5rem' }}>อ.หาดใหญ่ จ.สงขลา 90110</p><h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>เวลาเปิดทำการ</h4><p style={{ marginBottom: '0.3rem' }}>จ.-ศ. 16.00 - 21.00</p><p>ส.-อา. 8.00 - 21.00</p></div>
            <div><h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>ช่องทางการติดต่อ</h4><p style={{ marginBottom: '0.3rem' }}>เบอร์โทรศัพท์ 03 3333 3333</p><p>อีเมล Born2Code@coe.co.th</p></div>
          </div>
        </div>
      </footer>

      {/* Modal - คงเดิม */}
      {activeEditMode !== 'none' && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3 className="modal-header">{activeEditMode === 'name' ? 'แก้ไขชื่อ-นามสกุล' : activeEditMode === 'nickname' ? 'แก้ไขชื่อเล่น' : activeEditMode === 'phone' ? 'แก้ไขเบอร์โทรศัพท์' : 'เปลี่ยนรหัสผ่าน'}</h3>
            <form>
              {activeEditMode === 'name' && (<><div className="form-group"><label className="form-label">ชื่อ</label><input type="text" name="firstName" className="form-input-edit" value={editFormData.firstName} onChange={handleInputChange} /></div><div className="form-group"><label className="form-label">นามสกุล</label><input type="text" name="lastName" className="form-input-edit" value={editFormData.lastName} onChange={handleInputChange} /></div></>)}
              {activeEditMode === 'nickname' && (<div className="form-group"><label className="form-label">ชื่อเล่น</label><input type="text" name="nickname" className="form-input-edit" value={editFormData.nickname} onChange={handleInputChange} /></div>)}
              {activeEditMode === 'phone' && (<div className="form-group"><label className="form-label">เบอร์โทรศัพท์</label><input type="tel" name="phone" className="form-input-edit" value={editFormData.phone} onChange={handleInputChange} /></div>)}
              {activeEditMode === 'password' && (<><div className="form-group"><label className="form-label">รหัสผ่านเดิม</label><input type="password" className="form-input-edit" placeholder="กรอกรหัสผ่านเดิม" /></div><div className="form-group"><label className="form-label">รหัสผ่านใหม่</label><input type="password" className="form-input-edit" placeholder="กรอกรหัสผ่านใหม่" /></div></>)}
              <div className="modal-actions"><button type="button" className="btn btn-cancel" onClick={handleCloseModal}>ยกเลิก</button><button type="button" className="btn btn-save" onClick={handleSave}>บันทึก</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}