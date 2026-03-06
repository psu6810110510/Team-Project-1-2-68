/* ไฟล์: src/components/StudentProfile.tsx */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from './Header';
import '../styles/LoginTheme.css'; 
import '../styles/ProfileTheme.css'; 
import { Search, ShoppingCart, Menu, User, BookOpen, Heart, LogOut, Edit3, Camera, ChevronLeft, FileText, MonitorPlay, CheckSquare, Clock, Calendar, Award, X } from 'lucide-react';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';


export default function StudentProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. State ข้อมูลผู้ใช้ ---
  const [userData, setUserData] = useState({
    firstName: 'กำลังโหลด...',
    lastName: '',
    email: '',
    phone: '',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200',
    description: '' 
  });

  const [activeMenu, setActiveMenu] = useState('courses'); // ตั้งค่าเริ่มต้นหน้าคอร์ส (ตามที่คุณต้องการ)
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // --- 2. Mock Data ข้อมูลจำลอง (อยู่ครบ) ---
  const myCourses = [
    { 
      id: 1, 
      title: 'Data Science with Python', 
      instructor: 'นายอาร์ม ตัวจริง', 
      startDate: '1 ก.พ. 67', 
      expireDate: '31 ม.ค. 68', 
      lastAccess: '1 วันที่แล้ว', 
      progress: 30, 
      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=400&q=80' 
    },
    { 
      id: 2, 
      title: 'Data Visualization', 
      instructor: 'นายอาร์ม ตัวจริง', 
      startDate: '1 ก.พ. 67', 
      expireDate: '31 ม.ค. 68', 
      lastAccess: '5 วันที่แล้ว', 
      progress: 15, 
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80' 
    }
  ];

  const favoriteCourses = [
    { id: 101, title: 'Data Structures & Algorithms', category: 'Computer Science', image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=300&q=80' },
    { id: 102, title: 'C Programming', category: 'Programming Language', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80' }
  ];

  const purchasedHistory = [
    { id: 201, title: 'Data Structures & Algorithms', date: '12 ม.ค. 67', price: '฿1,290', image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=300&q=80' },
    { id: 202, title: 'C Programming', date: '10 ธ.ค. 66', price: '฿990', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80' }
  ];

  // --- 3. ดึงข้อมูลผู้ใช้ ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      if (storedUser) {
         const userObj = JSON.parse(storedUser);
         setUserData(prev => ({
           ...prev,
           firstName: userObj.full_name || userObj.firstName || 'ไม่ได้ระบุชื่อ', 
           email: userObj.email || '',
           phone: userObj.phone || prev.phone,
           description: userObj.description || prev.description,
           image: userObj.image || prev.image 
         }));
      }
    };
    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
      localStorage.clear();
      navigate('/login');
  };

  // --- 4. ฟังก์ชันจัดการการแก้ไข + บันทึก (เพิ่มฟังก์ชันจำข้อมูล) ---
  const openEditModal = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const closeModal = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleSaveEdit = async () => {
    if (!editingField) return;

    // 1. อัปเดตหน้าจอทันที
    setUserData(prev => ({ ...prev, [editingField]: editValue }));

    // 2. แปลงชื่อ Field ให้ตรงกับ Database
    let dbField = editingField;
    if (editingField === 'firstName') dbField = 'full_name';

    // 3. 🔥 บันทึกลง LocalStorage (เพื่อให้รีเฟรชแล้วยังจำค่าได้)
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      parsed[dbField] = editValue;
      localStorage.setItem('user', JSON.stringify(parsed)); // บันทึกทับ
    }

    // 4. (ถ้ามี Backend) ยิง API ไปอัปเดต
    if (token) {
      try {
        await fetch('http://localhost:3000/auth/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ [dbField]: editValue })
        });
      } catch (err) {
        console.error('Error saving data:', err);
      }
    }
    closeModal(); 
  };

  const getModalTitle = () => {
    switch (editingField) {
      case 'firstName': return 'เปลี่ยนชื่อ';
      case 'description': return 'เปลี่ยน Bio (แนะนำตัว)';
      case 'phone': return 'เปลี่ยนเบอร์โทรศัพท์';
      case 'password': return 'เปลี่ยนรหัสผ่านใหม่';
      default: return 'แก้ไขข้อมูล';
    }
  };

  // --- 5. ฟังก์ชันเปลี่ยนรูป + บันทึก (เพิ่มฟังก์ชันจำรูป) ---
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // อัปเดตหน้าจอ
        setUserData(prev => ({ ...prev, image: base64String }));
        
        // 🔥 บันทึกลง LocalStorage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.image = base64String;
          localStorage.setItem('user', JSON.stringify(parsed));
        }

        // ยิง API
        if (token) {
          try {
            await fetch('http://localhost:3000/auth/profile', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ image: base64String })
            });
          } catch (err) { console.error(err); }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 6. ส่วนการแสดงผล (UI) ---
  return (
    <div className="page-container">
       {/* ใช้ Header component แทน navbar เดิม */}
       <Header user={{
         email: userData.email,
         role: 'student',
         id: 0, // หรือใช้ ID จริงถ้ามีใน localStorage
         profileImage: userData.image
       }} />

      <div className="profile-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => navigate('/dashboard')}>
            <div style={{ background: '#cbd5e1', borderRadius: '50%', padding: '6px', display: 'flex' }}><ChevronLeft size={20} color="white" /></div><span>กลับหน้าหลัก</span>
          </div>
        </div>

        <div className="profile-container">
          {/* --- Sidebar ด้านซ้าย --- */}
          <aside className="profile-sidebar">
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
               <img src={userData.image} alt="Profile" className="sidebar-avatar" style={{ objectFit: 'cover' }} />
               {/* ปุ่มเปลี่ยนรูป */}
               <div 
                  onClick={handleCameraClick}
                  style={{ 
                    position: 'absolute', bottom: '10px', right: '0', background: 'white', 
                    borderRadius: '50%', padding: '6px', cursor: 'pointer', 
                    border: '1px solid #e2e8f0', display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
               >
                 <Camera size={16} color="#475569"/>
               </div>
               <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
            </div>
            
            <h2 className="sidebar-name" style={{ marginBottom: '0.2rem' }}>{userData.firstName} {userData.lastName}</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>{userData.email}</p>
            <p style={{ fontSize: '1rem', color: '#334155', fontWeight: '600', marginBottom: '2rem' }}>
              {userData.description || 'ยังไม่มีคำแนะนำตัว'}
            </p>

            <ul className="sidebar-menu">
              <li className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`} onClick={() => setActiveMenu('profile')}><User size={20} /> ข้อมูลส่วนตัว</li>
              <li className={`menu-item ${activeMenu === 'courses' ? 'active' : ''}`} onClick={() => setActiveMenu('courses')}><BookOpen size={20} /> คอร์สเรียนของฉัน</li>
              <li className={`menu-item ${activeMenu === 'favorites' ? 'active' : ''}`} onClick={() => setActiveMenu('favorites')}><Heart size={20} /> สิ่งที่ถูกใจ</li>
              <li className={`menu-item ${activeMenu === 'purchases' ? 'active' : ''}`} onClick={() => setActiveMenu('purchases')}><CheckSquare size={20} /> ประวัติการซื้อ</li>
              <li className="menu-item logout" onClick={handleLogout}><LogOut size={20} /> ออกจากระบบ</li>
            </ul>
          </aside>

          {/* --- Content ด้านขวา --- */}
          <main className="profile-content">
            
            {/* 1. หน้าข้อมูลส่วนตัว */}
            {activeMenu === 'profile' && (
              <>
                <div className="content-header"><span className="content-title">ข้อมูลส่วนตัว</span></div>
                <div className="profile-details">
                  <div className="info-row">
                    <span className="info-label">ชื่อ</span>
                    <span className="info-value">{userData.firstName}</span>
                    <button className="edit-btn" onClick={() => openEditModal('firstName', userData.firstName)}><Edit3 size={18} /></button>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Bio (แนะนำตัว)</span>
                    <span className="info-value">{userData.description || 'ยังไม่ระบุ'}</span>
                    <button className="edit-btn" onClick={() => openEditModal('description', userData.description || '')}><Edit3 size={18} /></button>
                  </div>
                  <div className="info-row">
                    <span className="info-label">อีเมล</span>
                    <span className="info-value" style={{color: '#94a3b8'}}>{userData.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">เบอร์โทรศัพท์</span>
                    <span className="info-value">{userData.phone || 'ยังไม่ระบุ'}</span>
                    <button className="edit-btn" onClick={() => openEditModal('phone', userData.phone || '')}><Edit3 size={18} /></button>
                  </div>
                  <div className="info-row">
                    <span className="info-label">รหัสผ่าน</span>
                    <span className="info-value">••••••••</span>
                    <button className="edit-btn" onClick={() => openEditModal('password', '')}><Edit3 size={18} /></button>
                  </div>
                </div>
              </>
            )}

            {/* 2. หน้าคอร์สเรียนของฉัน */}
            {activeMenu === 'courses' && (
              <>
                <div className="section-header"><span className="section-title-text">บริการสำหรับผู้เรียน</span></div>
                <div className="services-grid">
                  <div className="service-card"><div className="service-icon-box"><FileText size={32} /></div><div className="service-text">คลังโจทย์</div></div>
                  <div className="service-card"><div className="service-icon-box"><MonitorPlay size={32} /></div><div className="service-text">ระบบสอบออนไลน์</div></div>
                </div>
                
                <div className="section-header"><span className="section-title-text">คอร์สเรียนของฉัน</span></div>
                
                {/* การ์ดแนวนอน (Horizontal Card) - อยู่ครบ! */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {myCourses.map((course) => (
                    <div key={course.id} style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        background: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px', 
                        padding: '1.2rem',
                        gap: '1.5rem',
                        alignItems: 'flex-start',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}>
                      <img src={course.image} alt={course.title} style={{ 
                          width: '180px', 
                          height: '130px', 
                          objectFit: 'cover', 
                          borderRadius: '10px',
                          flexShrink: 0
                      }} />

                      <div style={{ flex: 1, width: '100%', minWidth: '250px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.8rem', color: '#0f172a' }}>{course.title}</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
                           <div>อาจารย์ : <span style={{color:'#334155', fontWeight:'500'}}>{course.instructor}</span></div>
                           <div>เริ่มเรียน : {course.startDate}</div>
                           <div>หมดเวลาเรียน : {course.expireDate}</div>
                           <div>เรียนล่าสุด : {course.lastAccess}</div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: 'auto', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: '150px' }}>
                              <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: `${course.progress}%`, background: '#38bdf8', height: '100%', borderRadius: '4px' }}></div>
                              </div>
                              <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: '600', marginTop: '6px' }}>
                                {course.progress}% Completed
                              </div>
                          </div>
                          <button style={{ 
                              padding: '8px 24px', 
                              background: '#1e293b', 
                              color: 'white', 
                              borderRadius: '30px', 
                              border: 'none', 
                              cursor: 'pointer',
                              fontWeight: '500',
                              fontSize: '0.9rem',
                          }} 
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          >
                            เรียนต่อ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="section-header" style={{ marginTop: '3rem' }}>
                  <span className="section-title-text">สถิติการเรียนรู้</span>
                </div>
                <div className="stats-grid">
                  <div className="stat-box"><Clock size={32} color="#64748b" style={{ margin: '0 auto' }} /><div className="stat-number">120 ชม.</div><div className="stat-label">ชั่วโมงเรียน</div></div>
                  <div className="stat-box"><Calendar size={32} color="#64748b" style={{ margin: '0 auto' }} /><div className="stat-number">2</div><div className="stat-label">คอร์สที่เรียน</div></div>
                  <div className="stat-box"><Award size={32} color="#64748b" style={{ margin: '0 auto' }} /><div className="stat-number">2</div><div className="stat-label">ใบประกาศ</div></div>
                </div>
              </>
            )}

            {/* 3. หน้าสิ่งที่ถูกใจ */}
            {activeMenu === 'favorites' && (
              <>
                <div className="content-header"><span className="content-title">สิ่งที่ถูกใจ</span></div>
                <div className="favorites-grid">
                  {favoriteCourses.map((course) => (
                    <div key={course.id} className="fav-card">
                      <div className="fav-card-heart"><Heart size={18} fill="#ef4444" color="#ef4444" /></div>
                      <img src={course.image} alt={course.title} className="fav-card-img" />
                      <h3 className="fav-card-title">{course.title}</h3>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 4. หน้าประวัติการซื้อ */}
            {activeMenu === 'purchases' && (
              <>
                <div className="content-header"><span className="content-title">ประวัติการซื้อ</span></div>
                <div className="favorites-grid">
                  {purchasedHistory.map((item) => (
                    <div key={item.id} className="fav-card">
                      <div className="fav-card-heart" style={{cursor:'default'}}><CheckSquare size={18} color="#0284c7" /></div>
                      <img src={item.image} alt={item.title} className="fav-card-img" />
                      <h3 className="fav-card-title">{item.title}</h3>
                      <p style={{color: '#0284c7', fontWeight: 'bold', marginTop: '0.5rem'}}>{item.price}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* --- Footer ด้านล่าง --- */}
      <footer className="footer">
        <div className="footer-content" style={{ flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {/* โลโก้คู่ (footer) */}
            <img src={logoImage} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />
            <img src={fullLogo} alt="Logo" style={{ height: '50px' }} />
            <span style={{ fontSize: '1rem', fontWeight: '500', color: '#fff' }}>
              “ ตัวช่วยที่จะทำให้คุณประสบความสำเร็จทางด้านคอมพิวเตอร์”
            </span>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem', width: '100%' }}>
            <div>
              <h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>ที่อยู่</h4>
              <p style={{ marginBottom: '0.3rem' }}>สถาบันบอร์นทูโค้ด เลขที่ 15 ถ.กาญจนวณิชย์</p>
              <p style={{ marginBottom: '1.5rem' }}>อ.หาดใหญ่ จ.สงขลา 90110</p>
              <h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>เวลาเปิดทำการ</h4>
              <p style={{ marginBottom: '0.3rem' }}>จ.-ศ. 16.00 - 21.00</p>
              <p>ส.-อา. 8.00 - 21.00</p>
            </div>
            <div>
                <h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>ช่องทางการติดต่อ</h4>
                <p style={{ marginBottom: '0.3rem' }}>เบอร์โทรศัพท์ 03 3333 3333</p>
                <p>อีเมล Born2Code@coe.co.th</p>
            </div>
          </div>
        </div>
      </footer>

      {/* --- Modal Popup สำหรับแก้ไขข้อมูล --- */}
      {editingField && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: '#ffffff', padding: '2rem', borderRadius: '12px',
            width: '90%', maxWidth: '380px', position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <button onClick={closeModal} style={{
              position: 'absolute', top: '15px', right: '15px',
              background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex'
            }}>
              <X size={20} color="#94a3b8" />
            </button>
            <h3 style={{ marginBottom: '1.2rem', textAlign: 'center', fontSize: '1.1rem', color: '#0f172a', fontWeight: 'bold' }}>
              {getModalTitle()}
            </h3>
            <input 
              type={editingField === 'password' ? 'password' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={`กรอก${getModalTitle().replace('เปลี่ยน', '')}...`}
              style={{
                width: '100%', padding: '10px 15px', borderRadius: '6px',
                border: '1px solid #cbd5e1', marginBottom: '1.5rem',
                fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                backgroundColor: '#ffffff', color: '#334155'
              }}
            />
            <button 
              onClick={handleSaveEdit} 
              style={{ 
                width: '100%', padding: '10px', fontSize: '1rem', 
                backgroundColor: '#0284c7', color: '#ffffff',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
              }}
            >
              บันทึก
            </button>
          </div>
        </div>
      )}
    </div>
  );
}