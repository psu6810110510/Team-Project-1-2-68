/* ไฟล์: src/pages/TeacherDashboard.tsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, Menu, User, LogOut, Edit3, Camera, ChevronLeft, 
  PlusCircle, Clock, AlertCircle, CheckCircle, BookOpen, X, 
  Image as ImageIcon, Video, Edit2, Check
} from 'lucide-react';
import '../styles/LoginTheme.css'; 
import '../styles/ProfileTheme.css'; 
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Course {
  id: number;
  title: string;
  status: 'REQUEST_CREATE' | 'DRAFTING' | 'PENDING_REVIEW' | 'PUBLISHED';
  students: number;
  image: string;
  videoUrl?: string;
  instructor?: string;
  description?: string;
  price?: string;
  tags?: string;
  isOnsite?: boolean;
  onsiteSeats?: string;
  onsiteDays?: string[];
  onsiteTimeStart?: string;
  onsiteTimeEnd?: string;
  onsiteDuration?: string;
  onsiteExamSchedule?: string;
  isOnline?: boolean;
  onlineExpiry?: string;
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('profile'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // ==========================================
  // 1. ระบบข้อมูลส่วนตัว (ดึงจาก localStorage)
  // ==========================================
  const defaultTeacherData = {
    firstName: 'ใจดี', 
    lastName: 'สอนเก่ง',
    email: 'ajarn@gmail.com',
    phone: '081-234-5678',
    role: 'TEACHER',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&h=200',
    description: '“ความรู้คืออาวุธ”'
  };

  const [teacherData, setTeacherData] = useState(() => {
    const savedData = localStorage.getItem('teacherProfileData');
    const mainUser = localStorage.getItem('user');
    
    let initialData = defaultTeacherData;
    if (savedData) {
      initialData = JSON.parse(savedData);
    }
    
    // Override with main user data if it exists and is newer
    if (mainUser) {
      try {
        const userObj = JSON.parse(mainUser);
        if (userObj.full_name) {
          const parts = userObj.full_name.split(' ');
          initialData.firstName = parts[0] || initialData.firstName;
          initialData.lastName = parts.slice(1).join(' ') || initialData.lastName;
        }
        if (userObj.email) initialData.email = userObj.email;
        if (userObj.phone) initialData.phone = userObj.phone;
        if (userObj.image) initialData.image = userObj.image;
        if (userObj.description) initialData.description = userObj.description;
      } catch(e) {}
    }
    
    return initialData;
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState(teacherData);

  const handleProfileInputChange = (e: any) => {
    setEditProfileForm({ ...editProfileForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setTeacherData(editProfileForm); 
    localStorage.setItem('teacherProfileData', JSON.stringify(editProfileForm)); 
    
    // Sync to main user token
    const mainUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (mainUser) {
      try {
        const userObj = JSON.parse(mainUser);
        userObj.full_name = `${editProfileForm.firstName} ${editProfileForm.lastName}`.trim();
        userObj.email = editProfileForm.email;
        userObj.phone = editProfileForm.phone;
        userObj.image = editProfileForm.image;
        userObj.description = editProfileForm.description;
        localStorage.setItem('user', JSON.stringify(userObj));
      } catch(e) {}
    }

    if (token) {
      try {
        await fetch('http://localhost:3000/auth/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            full_name: `${editProfileForm.firstName} ${editProfileForm.lastName}`.trim(),
            email: editProfileForm.email,
            phone: editProfileForm.phone,
            image: editProfileForm.image,
            description: editProfileForm.description
          })
        });
      } catch (err) {
        console.error('Error saving data:', err);
      }
    }

    setIsEditingProfile(false); 
    alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว!');
  };

  const handleCancelEditProfile = () => {
    setEditProfileForm(teacherData); 
    setIsEditingProfile(false); 
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const updatedData = { ...teacherData, image: base64String };
        setTeacherData(updatedData);
        localStorage.setItem('teacherProfileData', JSON.stringify(updatedData)); 

        const token = localStorage.getItem('access_token');

        // Sync to main user token
        const mainUser = localStorage.getItem('user');
        if (mainUser) {
          try {
            const userObj = JSON.parse(mainUser);
            userObj.image = base64String;
            localStorage.setItem('user', JSON.stringify(userObj));
          } catch(e) {}
        }

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

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      alert('กรุณากรอกทั้งรหัสผ่านเดิม และรหัสผ่านใหม่');
      return;
    }
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await fetch('http://localhost:3000/auth/change-password', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword })
        });
        const data = await response.json();
        if (!response.ok) {
          alert(data.message || 'เปลี่ยนรหัสผ่านไม่สำเร็จ ตรวจสอบรหัสผ่านเดิมอีกครั้ง');
          return;
        }
        alert('เปลี่ยนรหัสผ่านสำเร็จ!');
        setIsPasswordModalOpen(false);
        setOldPassword('');
        setNewPassword('');
      } catch (err) {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
      }
    }
  };

  // ==========================================
  // 2. ระบบคอร์สเรียน 
  // ==========================================
  const [myCourses, setMyCourses] = useState<Course[]>(() => {
    const savedCourses = localStorage.getItem('teacherCourses');
    if (savedCourses) {
      try {
        return JSON.parse(savedCourses);
      } catch (e) {
        console.error("Error parsing saved courses:", e);
      }
    }
    return [
      { id: 1, title: 'Advanced Python 2026', status: 'REQUEST_CREATE', students: 0, image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=400&q=80' },
      { id: 2, title: 'React for Beginners', status: 'DRAFTING', students: 0, image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80' },
      { id: 3, title: 'Data Science 101', status: 'PENDING_REVIEW', students: 0, image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80' },
      { id: 4, title: 'Basic HTML/CSS', status: 'PUBLISHED', students: 120, image: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=400&q=80' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('teacherCourses', JSON.stringify(myCourses));
  }, [myCourses]);

  const requestedCourses = myCourses.filter(c => c.status === 'REQUEST_CREATE');
  const draftingCourses = myCourses.filter(c => c.status === 'DRAFTING');
  const pendingReviewCourses = myCourses.filter(c => c.status === 'PENDING_REVIEW');
  const publishedCourses = myCourses.filter(c => c.status === 'PUBLISHED');

  const initialFormState = {
    title: '', 
    instructor: `อ.${teacherData.firstName} ${teacherData.lastName}`, 
    description: '', price: '', tags: '',
    isOnsite: true, onsiteSeats: '', onsiteDays: [] as string[], onsiteTimeStart: '', onsiteTimeEnd: '', onsiteDuration: '', onsiteExamSchedule: '',
    isOnline: true, onlineExpiry: ''
  };

  const [courseForm, setCourseForm] = useState(initialFormState);

  useEffect(() => {
    setCourseForm(prev => ({...prev, instructor: `อ.${teacherData.firstName} ${teacherData.lastName}`}));
  }, [teacherData.firstName, teacherData.lastName]);

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setCourseForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleDay = (day: string) => {
    setCourseForm(prev => {
      const days = prev.onsiteDays?.includes(day) ? prev.onsiteDays.filter(d => d !== day) : [...(prev.onsiteDays || []), day];
      return { ...prev, onsiteDays: days };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFileName(file.name);
    }
  };

  const handleCreateCourse = async () => {
    if (!courseForm.title.trim()) { alert("กรุณากรอกชื่อวิชา"); return; }
    if (!courseForm.price.trim()) { alert("กรุณากรอกราคาคอร์ส"); return; }

    try {
      const finalImage = imagePreview || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80';

      const newCourse: Course = {
        id: Date.now(),
        students: 0,
        status: 'REQUEST_CREATE',
        image: finalImage,
        videoUrl: videoFileName || '', 
        ...courseForm 
      };

      setMyCourses([newCourse, ...myCourses]); 
      closeModal(); 
      alert(`✅ ส่งคำขอเปิดคอร์ส "${courseForm.title}" โดย ${courseForm.instructor} เรียบร้อยแล้ว!`);

    } catch (error) {
      console.error("Error:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleUpdateStatus = (id: number, newStatus: Course['status']) => {
    setMyCourses(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if(newStatus === 'PENDING_REVIEW') alert("ส่งเนื้อหาให้แอดมินตรวจสอบแล้ว!");
  };

  const handleLogout = () => { 
    localStorage.removeItem('access_token'); 
    localStorage.removeItem('user');
    navigate('/login'); 
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCourseForm({...initialFormState, instructor: `อ.${teacherData.firstName} ${teacherData.lastName}`});
    setImagePreview(null);
    setVideoFileName(null);
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

  const renderCourseActions = (course: Course) => {
    switch(course.status) {
      case 'REQUEST_CREATE': return <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>⏳ รอ Admin อนุมัติคำขอ...</span>;
      case 'DRAFTING': return (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate(`/exam-management/${course.id}`)}
            style={{ padding: '8px 20px', background: '#3b82f6', border: 'none', borderRadius: '30px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📝 จัดการข้อสอบ
          </button>
          <button style={{ padding: '8px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '30px', cursor: 'pointer', color: '#334155' }}>✏️ แก้ไขเนื้อหา</button>
          <button onClick={() => handleUpdateStatus(course.id, 'PENDING_REVIEW')} style={{ padding: '8px 20px', background: '#22c55e', border: 'none', borderRadius: '30px', cursor: 'pointer', color: 'white' }}>🚀 ส่งขออนุมัติขาย</button>
        </div>
      );
      case 'PENDING_REVIEW': return <span style={{ color: '#f97316', fontSize: '0.9rem' }}>🕵️‍♀️ กำลังตรวจสอบความถูกต้อง...</span>;
      case 'PUBLISHED': return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate(`/exam-management/${course.id}`)}
            style={{ padding: '8px 20px', background: '#0f172a', border: 'none', borderRadius: '30px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📝 จัดการข้อสอบ
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{course.students}</span>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>นักเรียนที่ลงทะเบียน</span>
          </div>
        </div>
      );
      default: return null;
    }
  };

  const renderCourseList = (courses: Course[], emptyMessage: string) => {
    if (courses.length === 0) return <div style={{ color: '#94a3b8', padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>{emptyMessage}</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {courses.map((course) => (
          <div key={course.id} style={{ display: 'flex', flexWrap: 'wrap', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', gap: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <img 
               src={course.image} 
               alt={course.title} 
               style={{ width: '180px', height: '130px', objectFit: 'cover', borderRadius: '10px' }} 
               onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
            />
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{display:'flex', justifyContent:'space-between'}}><h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{course.title}</h3>{getStatusBadge(course.status)}</div>
              <p style={{ fontSize: '0.9rem', color: '#64748b', margin: '0.5rem 0 1.5rem 0' }}>รหัสคอร์ส: COURSE-{course.id.toString().slice(-4)}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: 'auto' }}>{renderCourseActions(course)}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="navbar" style={{ background: '#081324' }}>
        <div className="nav-logo">
          <img src={logoImage} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />
          <img src={fullLogo} alt="Logo" style={{ height: '50px', width: 'auto' }} />
        </div>
        <div className="nav-icons"><Search className="nav-icon" size={24} /><ShoppingCart className="nav-icon" size={24} /><Menu className="nav-icon" size={24} /><User className="nav-icon" size={24} /></div>
      </nav>

      <div className="profile-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '1.5rem', marginTop: '1rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => navigate('/dashboard')}>
            <div style={{ background: '#cbd5e1', borderRadius: '50%', padding: '6px', display: 'flex' }}><ChevronLeft size={20} color="white" /></div><span>กลับหน้าหลัก</span>
          </div>
        </div>

        <div className="profile-container">
          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
               <img src={teacherData.image} alt="Profile" className="sidebar-avatar" style={{ objectFit: 'cover', width: '120px', height: '120px', borderRadius: '50%' }} />
               <input type="file" id="profile-upload" accept="image/*" style={{ display: 'none' }} onChange={handleProfileImageUpload} />
               <label htmlFor="profile-upload" style={{ position: 'absolute', bottom: '5px', right: '5px', background: 'white', borderRadius: '50%', padding: '8px', border: '1px solid #e2e8f0', display: 'flex', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                 <Camera size={16} color="#475569"/>
               </label>
            </div>
            <h2 className="sidebar-name">{teacherData.firstName} {teacherData.lastName}</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1rem' }}>{teacherData.email}</p>
            <ul className="sidebar-menu">
              <li className={`menu-item ${activeMenu === 'profile' ? 'active' : ''}`} onClick={() => setActiveMenu('profile')}><User size={20} /> ข้อมูลส่วนตัว</li>
              <li className={`menu-item ${activeMenu === 'courses' ? 'active' : ''}`} onClick={() => setActiveMenu('courses')}><BookOpen size={20} /> จัดการคอร์สเรียน</li>
              <li className="menu-item logout" onClick={handleLogout}><LogOut size={20} /> ออกจากระบบ</li>
            </ul>
          </aside>

          <main className="profile-content">
            {/* ==========================================
                ✅ หมวดข้อมูลส่วนตัว (แก้ไขและบันทึกได้)
               ========================================== */}
            {activeMenu === 'profile' && (
              <>
                <div className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="content-title">ข้อมูลอาจารย์</span>
                  
                  {!isEditingProfile ? (
                    <button 
                      onClick={() => setIsEditingProfile(true)} 
                      style={{ background: 'none', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontSize: '0.9rem' }}
                    >
                      <Edit3 size={16} /> แก้ไขข้อมูล
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={handleCancelEditProfile} style={{ background: 'white', border: '1px solid #cbd5e1', padding: '6px 15px', borderRadius: '20px', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem' }}>ยกเลิก</button>
                      <button onClick={handleSaveProfile} style={{ background: '#0f172a', border: 'none', padding: '6px 15px', borderRadius: '20px', cursor: 'pointer', color: 'white', fontSize: '0.9rem' }}>บันทึก</button>
                    </div>
                  )}
                </div>

                <div className="profile-details">
                   {/* ชื่อ-นามสกุล */}
                   <div className="info-row">
                     <span className="info-label">ชื่อ</span>
                     {isEditingProfile ? (
                       <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                         {/* ✅ แก้ไข: เพิ่ม flex: 1 ให้ช่องชื่อและนามสกุลกางออกเต็มพื้นที่ */}
                         <input type="text" name="firstName" value={editProfileForm.firstName} onChange={handleProfileInputChange} placeholder="ชื่อ" style={{...editInputStyle, flex: 1}} />
                         <input type="text" name="lastName" value={editProfileForm.lastName} onChange={handleProfileInputChange} placeholder="นามสกุล" style={{...editInputStyle, flex: 1}} />
                       </div>
                     ) : (
                       <span className="info-value">{teacherData.firstName} {teacherData.lastName}</span>
                     )}
                   </div>
                   
                   {/* อีเมล */}
                   <div className="info-row">
                     <span className="info-label">อีเมล</span>
                     {isEditingProfile ? (
                       <input type="email" name="email" value={editProfileForm.email} onChange={handleProfileInputChange} style={{...editInputStyle, flex: 1}} />
                     ) : (
                       <span className="info-value" style={{color: '#94a3b8'}}>{teacherData.email}</span>
                     )}
                   </div>

                   {/* เบอร์โทร */}
                   <div className="info-row" style={{ borderBottom: '1px solid #e2e8f0' }}>
                     <span className="info-label">เบอร์โทร</span>
                     {isEditingProfile ? (
                       <input type="text" name="phone" value={editProfileForm.phone} onChange={handleProfileInputChange} style={{...editInputStyle, flex: 1}} />
                     ) : (
                       <span className="info-value" style={{color: '#94a3b8'}}>{teacherData.phone}</span>
                     )}
                   </div>

                   {/* รหัสผ่าน */}
                   <div className="info-row" style={{ borderBottom: '1px solid #e2e8f0' }}>
                     <span className="info-label">รหัสผ่าน</span>
                     <span className="info-value">••••••••</span>
                     <button 
                       className="edit-btn" 
                       onClick={() => setIsPasswordModalOpen(true)}
                       style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                     >
                       <Edit3 size={18} />
                     </button>
                   </div>

                   {/* คำอธิบายตัวเอง */}
                   <div className="info-row" style={{ borderBottom: 'none', alignItems: 'flex-start' }}>
                     <span className="info-label" style={{ marginTop: '10px' }}>คำอธิบายตัวเอง</span>
                     {isEditingProfile ? (
                       <textarea
                         name="description"
                         value={editProfileForm.description || ''}
                         onChange={handleProfileInputChange}
                         placeholder="เพิ่มคำอธิบายเกี่ยวกับตัวคุณ..."
                         style={{ ...editInputStyle, flex: 1, minHeight: '80px', resize: 'vertical' }}
                       />
                     ) : (
                       <span className="info-value" style={{ color: '#334155', fontStyle: 'italic', marginTop: '10px', lineHeight: '1.6' }}>
                         {teacherData.description || 'ยังไม่มีคำอธิบายตัวเองเพิ่มเข้ามา'}
                       </span>
                     )}
                   </div>
                </div>
              </>
            )}

            {/* หมวดจัดการคอร์ส */}
            {activeMenu === 'courses' && (
              <>
                <div className="content-header" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                    <span className="content-title">คอร์สเรียนของคุณ</span>
                    <button onClick={() => setIsModalOpen(true)} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                        <PlusCircle size={18} /> ขอเปิดคอร์สใหม่
                    </button>
                </div>

                <div style={{ marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #fef08a', paddingBottom: '0.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#a16207', display:'flex', alignItems:'center', gap:'8px' }}><Clock size={18}/> คอร์สที่รออนุมัติสร้าง</span></div>
                {renderCourseList(requestedCourses, "ไม่มีคอร์สที่รออนุมัติสร้าง")}

                <div style={{ marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '2px solid #bfdbfe', paddingBottom: '0.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1d4ed8', display:'flex', alignItems:'center', gap:'8px' }}><Edit3 size={18}/> คอร์สที่กำลังใส่เนื้อหา</span></div>
                {renderCourseList(draftingCourses, "ไม่มีคอร์สที่กำลังใส่เนื้อหา")}

                <div style={{ marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '2px solid #fed7aa', paddingBottom: '0.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#c2410c', display:'flex', alignItems:'center', gap:'8px' }}><AlertCircle size={18}/> คอร์สที่รออนุมัติขาย</span></div>
                {renderCourseList(pendingReviewCourses, "ไม่มีคอร์สที่รออนุมัติขาย")}

                <div style={{ marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '2px solid #bbf7d0', paddingBottom: '0.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#15803d', display:'flex', alignItems:'center', gap:'8px' }}><CheckCircle size={18}/> คอร์สที่เปิดขายแล้ว</span></div>
                {renderCourseList(publishedCourses, "ไม่มีคอร์สที่เปิดขาย")}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        <div className="footer-content" style={{ flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <img src={logoImage} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />
            <img src={fullLogo} alt="Logo" style={{ height: '50px' }} />
            <span style={{ fontSize: '1rem', fontWeight: '500', color: '#fff' }}>“ ตัวช่วยที่จะทำให้คุณประสบความสำเร็จทางด้านคอมพิวเตอร์”</span>
          </div>
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem', width: '100%' }}>
            <div>
              <h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>ที่อยู่</h4>
              <p style={{ marginBottom: '0.3rem', color: '#94a3b8' }}>สถาบันบอร์นทูโค้ด เลขที่ 15 ถ.กาญจนวณิชย์</p>
              <p style={{ marginBottom: '1.5rem', color: '#94a3b8' }}>อ.หาดใหญ่ จ.สงขลา 90110</p>
            </div>
            <div>
                <h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>ช่องทางการติดต่อ</h4>
                <p style={{color: '#94a3b8'}}>อีเมล Born2Code@coe.co.th</p>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= MODAL POPUP ================= */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{ 
            background: 'white', padding: '30px', borderRadius: '16px', width: '900px', 
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative',
            color: '#1e293b'
          }}>
            
            <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} color="#94a3b8" /></button>

            <div style={{ display: 'flex', gap: '40px' }}>
              
              {/* --- LEFT COLUMN --- */}
              <div style={{ flex: '1', minWidth: '300px' }}>
                <label style={{ cursor: 'pointer', display: 'block', marginBottom: '15px' }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                  <div style={{ 
                    background: '#d1d5db', borderRadius: '8px', height: '220px', display: 'flex', flexDirection: 'column', 
                    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px dashed #9ca3af', position: 'relative'
                  }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <div style={{ background: 'white', padding: '8px 25px', borderRadius: '20px', fontSize: '0.8rem', color: '#374151', border: '1px solid #9ca3af', marginBottom: '15px' }}>อัปโหลดไฟล์</div>
                        <ImageIcon size={50} color="white" />
                      </>
                    )}
                  </div>
                </label>

                <label style={{ display: 'block', width: '100%', marginBottom: '25px', cursor: 'pointer' }}>
                  <input type="file" accept="video/*" style={{ display: 'none' }} onChange={handleVideoUpload} />
                  <div style={{ 
                    width: '100%', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s',
                    background: videoFileName ? '#f0fdf4' : 'white', 
                    border: `1px solid ${videoFileName ? '#22c55e' : '#9ca3af'}`,
                    color: videoFileName ? '#15803d' : '#374151'
                  }}>
                    {videoFileName ? (
                       <>
                         <Check size={18} color="#15803d" />
                         <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{videoFileName}</span>
                       </>
                    ) : (
                       <><Video size={18}/> อัปโหลดไฟล์วิดีโอตัวอย่างการสอน</>
                    )}
                  </div>
                </label>

                {/* On-site Course Section */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#000' }}>คอร์สสอนออนไซต์</h3>
                    <input type="checkbox" name="isOnsite" checked={courseForm.isOnsite} onChange={handleInputChange} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#000' }} />
                  </div>
                  {courseForm.isOnsite && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div className="input-group"><label style={labelSmallStyle}>จำนวนที่นั่ง</label><div style={inputContainerStyle}><input id="onsiteSeats" type="text" name="onsiteSeats" value={courseForm.onsiteSeats} placeholder="กรอกจำนวนที่นั่ง" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onsiteSeats" style={{cursor:'pointer'}}><Edit2 size={14} color="#9ca3af"/></label></div></div>
                        <div className="input-group">
                            <label style={labelSmallStyle}>วันที่เปิดสอน</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((day, idx) => (
                                    <button key={idx} type="button" onClick={() => toggleDay(day)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #d1d5db', background: courseForm.onsiteDays?.includes(day) ? '#374151' : '#f3f4f6', color: courseForm.onsiteDays?.includes(day) ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{day}</button>
                                ))}
                            </div>
                        </div>
                        <div className="input-group"><label style={labelSmallStyle}>เวลาที่เปิดสอน</label><div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><div style={{...inputContainerStyle, width: '130px', justifyContent:'center'}}><input type="time" name="onsiteTimeStart" value={courseForm.onsiteTimeStart} onChange={handleInputChange} style={{...inputStyleClean, textAlign: 'center'}} /></div><span>-</span><div style={{...inputContainerStyle, width: '130px', justifyContent:'center'}}><input type="time" name="onsiteTimeEnd" value={courseForm.onsiteTimeEnd} onChange={handleInputChange} style={{...inputStyleClean, textAlign: 'center'}} /></div></div></div>
                        <div className="input-group"><label style={labelSmallStyle}>ระยะเวลาคอร์ส</label><div style={inputContainerStyle}><input id="onsiteDuration" type="text" name="onsiteDuration" value={courseForm.onsiteDuration} placeholder="กรอกจำนวนวัน" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onsiteDuration" style={{cursor:'pointer'}}><Edit2 size={14} color="#9ca3af"/></label></div></div>
                        <div className="input-group"><label style={labelSmallStyle}>ตารางการเปิดสอบประจำปี</label><div style={inputContainerStyle}><input id="onsiteExamSchedule" type="text" name="onsiteExamSchedule" value={courseForm.onsiteExamSchedule} placeholder="เช่น 2568" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onsiteExamSchedule" style={{cursor:'pointer'}}><Edit2 size={14} color="#9ca3af"/></label></div></div>
                    </div>
                  )}
                </div>

                {/* Online Course Section */}
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0, color: '#000' }}>คอร์สสอนออนไลน์</h3>
                    <input type="checkbox" name="isOnline" checked={courseForm.isOnline} onChange={handleInputChange} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#000' }} />
                  </div>
                  {courseForm.isOnline && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>ชั่วโมงคอร์ส *นับจากคลิปวิดีโอ*</p>
                          <div className="input-group"><label style={labelSmallStyle}>ระยะเวลาหมดอายุคอร์ส</label><div style={inputContainerStyle}><input id="onlineExpiry" type="text" name="onlineExpiry" value={courseForm.onlineExpiry} placeholder="กรอกระยะเวลาหมดอายุ(เดือน)" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onlineExpiry" style={{cursor:'pointer'}}><Edit2 size={14} color="#9ca3af"/></label></div></div>
                      </div>
                  )}
                </div>
              </div>

              {/* --- RIGHT COLUMN --- */}
              <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div className="input-group"><label style={labelStyle}>ชื่อวิชา</label><div style={inputContainerStyle}><input id="title" type="text" name="title" value={courseForm.title} onChange={handleInputChange} placeholder="กรอกชื่อวิชา" style={inputStyleClean} /><label htmlFor="title" style={{cursor:'pointer'}}><Edit2 size={16} color="#9ca3af"/></label></div></div>
                 <div className="input-group"><label style={labelStyle}>ผู้สอน</label><div style={{...inputContainerStyle, background: '#f3f4f6'}}><input type="text" name="instructor" value={courseForm.instructor} readOnly style={{...inputStyleClean, color: '#6b7280', cursor: 'not-allowed'}} /></div></div>
                 <div className="input-group"><label style={labelStyle}>รายละเอียดคอร์ส</label><div style={{...inputContainerStyle, alignItems: 'flex-start'}}><textarea id="description" name="description" value={courseForm.description} rows={4} onChange={handleInputChange} placeholder="กรอกรายละเอียด" style={{ ...inputStyleClean, resize: 'none' }} /><label htmlFor="description" style={{cursor:'pointer', marginTop:'5px'}}><Edit2 size={16} color="#9ca3af"/></label></div></div>
                 <div className="input-group"><label style={labelStyle}>ราคา</label><div style={inputContainerStyle}><input id="price" type="text" name="price" value={courseForm.price} onChange={handleInputChange} placeholder="กรอกราคา" style={inputStyleClean} /><label htmlFor="price" style={{cursor:'pointer'}}><Edit2 size={16} color="#9ca3af"/></label></div></div>
                 <div className="input-group"><label style={labelStyle}>ป้ายกำกับ (เริ่มด้วย #)</label><div style={inputContainerStyle}><input id="tags" type="text" name="tags" value={courseForm.tags} onChange={handleInputChange} placeholder="#กรอกแท็ก #กรอกแท็ก" style={inputStyleClean} /><label htmlFor="tags" style={{cursor:'pointer'}}><Edit2 size={16} color="#9ca3af"/></label></div></div>

                 <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                     <button onClick={handleCreateCourse} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 40px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>ส่งคำขอ</button>
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= PASSWORD MODAL POPUP ================= */}
      {isPasswordModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            background: '#ffffff', padding: '2rem', borderRadius: '12px',
            width: '90%', maxWidth: '380px', position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <button onClick={() => { setIsPasswordModalOpen(false); setOldPassword(''); setNewPassword(''); }} style={{
              position: 'absolute', top: '15px', right: '15px',
              background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex'
            }}>
              <X size={20} color="#94a3b8" />
            </button>
            <h3 style={{ marginBottom: '1.2rem', textAlign: 'center', fontSize: '1.1rem', color: '#0f172a', fontWeight: 'bold' }}>
              เปลี่ยนรหัสผ่านใหม่
            </h3>
            
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

            <input 
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่..."
              style={{
                width: '100%', padding: '10px 15px', borderRadius: '6px',
                border: '1px solid #cbd5e1', marginBottom: '1.5rem',
                fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                backgroundColor: '#ffffff', color: '#334155'
              }}
            />

            <button 
              onClick={handlePasswordChange} 
              style={{ 
                width: '100%', padding: '10px', fontSize: '1rem', 
                backgroundColor: '#0f172a', color: '#ffffff',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500'
              }}
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles Helper ---
const inputContainerStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '4px', padding: '8px 10px', background: 'white' };
const inputStyleClean: React.CSSProperties = { flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: '#374151', background: 'transparent' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#000', fontSize: '1rem' };
const labelSmallStyle: React.CSSProperties = { display: 'block', marginBottom: '3px', fontWeight: 'bold', color: '#000', fontSize: '0.8rem' };

// ✅ บังคับให้พื้นหลังช่องกรอกโปรไฟล์เป็น "สีขาว"
const editInputStyle: React.CSSProperties = {
  border: '1px solid #cbd5e1', 
  borderRadius: '6px', 
  padding: '8px 12px', 
  fontSize: '0.95rem', 
  outline: 'none', 
  color: '#0f172a',
  backgroundColor: '#ffffff', 
  width: '100%',
  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.05)'
};