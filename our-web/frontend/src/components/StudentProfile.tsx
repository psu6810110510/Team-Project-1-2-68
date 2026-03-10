/* ไฟล์: src/components/StudentProfile.tsx */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Header from './Header';
import '../styles/LoginTheme.css'; 
import '../styles/ProfileTheme.css'; 
import { Search, ShoppingCart, Menu, User, BookOpen, Heart, LogOut, Edit3, Camera, ChevronLeft, FileText, MonitorPlay, CheckSquare, Clock, Calendar, Award, X } from 'lucide-react';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';
import Footer from './Footer';

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
  const [oldPassword, setOldPassword] = useState('');

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

  const completedCourses = [
    {
      id: 301,
      title: 'Data Science with Python',
      instructor: 'นายอาร์ม ตัวจริง',
      completedDate: '31 มกราคม พ.ศ. 2568',
      certId: 'cert-1',
      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 302,
      title: 'Data Visualization',
      instructor: 'นายอาร์ม ตัวจริง',
      completedDate: '31 มกราคม พ.ศ. 2568',
      certId: 'cert-2',
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate('/login');
  };

  // --- ฟังก์ชันพิมพ์เฉพาะใบประกาศ ---
  const printCertificate = (certId: string) => {
    const certEl = document.getElementById(certId);
    if (!certEl) return;
    const html = certEl.outerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ใบประกาศนียบัตร</title>
        <link href="https://fonts.googleapis.com/css2?family=Kanit&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Kanit', sans-serif; padding: 40px; background: white; }
          button { display: none !important; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
  // --- 4. ฟังก์ชันจัดการการแก้ไข + บันทึก (เพิ่มฟังก์ชันจำข้อมูล) ---
  const openEditModal = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const closeModal = () => {
    setEditingField(null);
    setEditValue('');
    setOldPassword('');
  };

  const handleSaveEdit = async () => {
    if (!editingField) return;

    const token = localStorage.getItem('access_token');

    // แยกกรณีถ้ากำลังแก้ไข "รหัสผ่าน"
    if (editingField === 'password') {
      if (!oldPassword || !editValue) {
        alert('กรุณากรอกทั้งรหัสผ่านเดิม และรหัสผ่านใหม่');
        return;
      }
      if (token) {
        try {
          const response = await fetch('http://localhost:3000/auth/change-password', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword: oldPassword, newPassword: editValue })
          });
          const data = await response.json();
          if (!response.ok) {
            alert(data.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ ตรวจสอบรหัสผ่านเดิมอีกครั้ง');
            return;
          }
          alert('เปลี่ยนรหัสผ่านสำเร็จ!');
          closeModal();
          return; // จบการทำงาน ไม่ต้องไปเซฟลง localStorage หรือ state อื่นๆ
        } catch (err) {
          console.error(err);
          alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
          return;
        }
      }
      return;
    }

    // --- สำหรับ Field อื่นๆ (ชื่อ, เบอร์โทร, bio) ---

    // 1. อัปเดตหน้าจอทันที
    setUserData(prev => ({ ...prev, [editingField]: editValue }));

    // 2. แปลงชื่อ Field ให้ตรงกับ Database
    let dbField = editingField;
    if (editingField === 'firstName') dbField = 'full_name';

    // 3. 🔥 บันทึกลง LocalStorage (เพื่อให้รีเฟรชแล้วยังจำค่าได้)
    const storedUser = localStorage.getItem('user');
    
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
              <li className={`menu-item ${activeMenu === 'completed' ? 'active' : ''}`} onClick={() => setActiveMenu('completed')}><CheckSquare size={20} /> เรียนจบแล้ว</li>
              <li className={`menu-item ${activeMenu === 'favorites' ? 'active' : ''}`} onClick={() => setActiveMenu('favorites')}><Heart size={20} /> สิ่งที่ถูกใจ</li>
              <li className={`menu-item ${activeMenu === 'purchases' ? 'active' : ''}`} onClick={() => setActiveMenu('purchases')}><CheckSquare size={20} /> ประวัติการซื้อ</li>
              <li className={`menu-item ${activeMenu === 'certificates' ? 'active' : ''}`} onClick={() => setActiveMenu('certificates')}><Award size={20} /> ใบประกาศ</li>
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

            {/* 2.5. หน้าเรียนจบแล้ว */}
            {activeMenu === 'completed' && (
              <>
                <div className="content-header"><span className="content-title">คอร์สที่เรียนจบแล้ว</span></div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                  {completedCourses.map((course) => (
                    <div key={course.id} style={{
                      display: 'flex', flexWrap: 'wrap', background: 'white',
                      border: '2px solid #bbf7d0', borderRadius: '12px', padding: '1.2rem',
                      gap: '1.5rem', alignItems: 'center', boxShadow: '0 2px 8px rgba(16,185,129,0.08)'
                    }}>
                      {/* Thumbnail */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={course.image} alt={course.title} style={{ width: '180px', height: '130px', objectFit: 'cover', borderRadius: '10px' }} />
                        <div style={{
                          position: 'absolute', bottom: '8px', left: '8px',
                          background: '#16a34a', color: 'white', fontSize: '0.7rem', fontWeight: 'bold',
                          padding: '3px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                          ✓ เรียนจบแล้ว
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.4rem' }}>{course.title}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.3rem' }}>อาจารย์: <span style={{ color: '#334155', fontWeight: '500' }}>{course.instructor}</span></p>
                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.2rem' }}>สำเร็จเมื่อ: <span style={{ color: '#059669', fontWeight: '600' }}>{course.completedDate}</span></p>
                        
                        {/* Progress Full */}
                        <div style={{ marginBottom: '1rem' }}>
                          <div style={{ height: '8px', background: '#dcfce7', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', background: 'linear-gradient(90deg, #16a34a, #22c55e)', height: '100%', borderRadius: '4px' }}></div>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '600', marginTop: '4px' }}>100% Completed 🎉</div>
                        </div>

                        <button
                          onClick={() => setActiveMenu('certificates')}
                          style={{
                            padding: '8px 20px', background: '#f0fdf4',
                            color: '#15803d', border: '1px solid #86efac',
                            borderRadius: '30px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem',
                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          🏆 ดูใบประกาศนียบัตร
                        </button>
                      </div>
                    </div>
                  ))}
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

            {/* 5. หน้าใบประกาศ */}
            {activeMenu === 'certificates' && (
              <>
                <div className="content-header"><span className="content-title">ใบประกาศนียบัตรของฉัน</span></div>
                
                {/* Certificate Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '1rem' }}>
                  
                  {/* Certificate 1 */}
                  <div id="cert-1" style={{
                    border: '8px double #c9a84c',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fff8dc 100%)',
                    padding: '2.5rem',
                    position: 'relative',
                    boxShadow: '0 4px 20px rgba(201,168,76,0.2)',
                    textAlign: 'center',
                    fontFamily: 'Kanit, sans-serif'
                  }}>
                    <div style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '2rem', opacity: 0.15 }}>🏅</div>
                    <div style={{ position: 'absolute', top: '10px', right: '20px', fontSize: '2rem', opacity: 0.15 }}>🏅</div>
                    <p style={{ color: '#a16207', fontSize: '0.85rem', letterSpacing: '4px', fontWeight: '600', marginBottom: '0.5rem' }}>BORN2CODE INSTITUTE</p>
                    <h2 style={{ fontSize: '1.6rem', color: '#78350f', fontWeight: 'bold', marginBottom: '0.3rem' }}>ใบประกาศนียบัตร</h2>
                    <p style={{ color: '#92400e', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Certificate of Completion</p>
                    <div style={{ width: '60px', height: '3px', background: '#c9a84c', margin: '0 auto 1.5rem' }}></div>
                    <p style={{ color: '#78350f', fontSize: '0.95rem', marginBottom: '0.4rem' }}>ขอมอบให้แก่</p>
                    <h3 style={{ fontSize: '1.8rem', color: '#1e3a5f', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                      {userData.firstName}
                    </h3>
                    <p style={{ color: '#78350f', fontSize: '0.95rem', marginBottom: '0.4rem' }}>เพื่อยืนยันว่าได้สำเร็จการเรียนหลักสูตร</p>
                    <h4 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 'bold', margin: '0.5rem 0 1.5rem', padding: '0.6rem 1.5rem', background: '#fef08a', borderRadius: '8px', display: 'inline-block' }}>
                      Data Science with Python
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>ผ่านเมื่อวันที่ 31 มกราคม พ.ศ. 2568</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', alignItems: 'flex-end' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '120px', height: '1px', background: '#c9a84c', marginBottom: '5px' }}></div>
                        <p style={{ fontSize: '0.75rem', color: '#92400e' }}>ผู้อำนวยการสถาบัน</p>
                      </div>
                      <div style={{ width: '60px', height: '60px', border: '2px solid #c9a84c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                        <Award size={28} color="#c9a84c" />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '120px', height: '1px', background: '#c9a84c', marginBottom: '5px' }}></div>
                        <p style={{ fontSize: '0.75rem', color: '#92400e' }}>หัวหน้าหลักสูตร</p>
                      </div>
                    </div>
                    <button
                      onClick={() => printCertificate('cert-1')}
                      style={{ marginTop: '1.5rem', padding: '8px 20px', background: '#1e3a5f', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      🖨️ พิมพ์ / ดาวน์โหลด
                    </button>
                  </div>

                  {/* Certificate 2 */}
                  <div id="cert-2" style={{
                    border: '8px double #6366f1',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)',
                    padding: '2.5rem',
                    position: 'relative',
                    boxShadow: '0 4px 20px rgba(99,102,241,0.2)',
                    textAlign: 'center',
                    fontFamily: 'Kanit, sans-serif'
                  }}>
                    <div style={{ position: 'absolute', top: '10px', left: '20px', fontSize: '2rem', opacity: 0.15 }}>🎓</div>
                    <div style={{ position: 'absolute', top: '10px', right: '20px', fontSize: '2rem', opacity: 0.15 }}>🎓</div>
                    <p style={{ color: '#4338ca', fontSize: '0.85rem', letterSpacing: '4px', fontWeight: '600', marginBottom: '0.5rem' }}>BORN2CODE INSTITUTE</p>
                    <h2 style={{ fontSize: '1.6rem', color: '#3730a3', fontWeight: 'bold', marginBottom: '0.3rem' }}>ใบประกาศนียบัตร</h2>
                    <p style={{ color: '#4338ca', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Certificate of Completion</p>
                    <div style={{ width: '60px', height: '3px', background: '#6366f1', margin: '0 auto 1.5rem' }}></div>
                    <p style={{ color: '#3730a3', fontSize: '0.95rem', marginBottom: '0.4rem' }}>ขอมอบให้แก่</p>
                    <h3 style={{ fontSize: '1.8rem', color: '#1e3a5f', fontWeight: 'bold', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                      {userData.firstName}
                    </h3>
                    <p style={{ color: '#3730a3', fontSize: '0.95rem', marginBottom: '0.4rem' }}>เพื่อยืนยันว่าได้สำเร็จการเรียนหลักสูตร</p>
                    <h4 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 'bold', margin: '0.5rem 0 1.5rem', padding: '0.6rem 1.5rem', background: '#c7d2fe', borderRadius: '8px', display: 'inline-block' }}>
                      Data Visualization
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>ผ่านเมื่อวันที่ 31 มกราคม พ.ศ. 2568</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', alignItems: 'flex-end' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '120px', height: '1px', background: '#6366f1', marginBottom: '5px' }}></div>
                        <p style={{ fontSize: '0.75rem', color: '#4338ca' }}>ผู้อำนวยการสถาบัน</p>
                      </div>
                      <div style={{ width: '60px', height: '60px', border: '2px solid #6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                        <Award size={28} color="#6366f1" />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '120px', height: '1px', background: '#6366f1', marginBottom: '5px' }}></div>
                        <p style={{ fontSize: '0.75rem', color: '#4338ca' }}>หัวหน้าหลักสูตร</p>
                      </div>
                    </div>
                    <button
                      onClick={() => printCertificate('cert-2')}
                      style={{ marginTop: '1.5rem', padding: '8px 20px', background: '#4338ca', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem' }}
                    >
                      🖨️ พิมพ์ / ดาวน์โหลด
                    </button>
                  </div>

                </div>
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />

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
            {editingField === 'password' && (
              <input 
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านเดิม..."
                style={{
                  width: '100%', padding: '10px 15px', borderRadius: '6px',
                  border: '1px solid #cbd5e1', marginBottom: '1rem',
                  fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                  backgroundColor: '#ffffff', color: '#334155'
                }}
              />
            )}
            <input 
              type={editingField === 'password' ? 'password' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={editingField === 'password' ? "กรอกรหัสผ่านใหม่..." : `กรอก${getModalTitle().replace('เปลี่ยน', '')}...`}
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
