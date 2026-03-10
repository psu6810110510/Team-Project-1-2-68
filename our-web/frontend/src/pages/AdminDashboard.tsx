import React, { useState } from 'react';
import { 
  Search, User, Settings, CreditCard, BookOpen, FileText, Home, Users,
  ArrowUp, TrendingUp, MonitorPlay, LogOut, ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';
import '../styles/LoginTheme.css'; 
import Footer from '../components/Footer';

interface Course {
  id: number;
  title: string;
  status: 'REQUEST_CREATE' | 'DRAFTING' | 'PENDING_REVIEW' | 'PUBLISHED';
  students: number;
  image: string;
  instructor?: string;
  price?: string;
}

// ==========================================
// Mock Data 
// ==========================================
const enrollmentData = [
  { name: 'ก.ย.', students: 0 },
  { name: 'ต.ค.', students: 50 },
  { name: 'พ.ย.', students: 10 },
  { name: 'ธ.ค.', students: 100 },
  { name: 'ม.ค.', students: 10 },
  { name: 'ก.พ.', students: 100 },
];

const instructorData = [
  { name: 'Full-time', value: 20 },
  { name: 'Part-time', value: 12 },
];
const COLORS = ['#3b82f6', '#cbd5e1'];

const recentOrders = [
  { id: '#ORD-2026-001', name: 'น.ส.ธัญชนก', course: 'Python101 (Online)', date: '10 ก.พ. 69', amount: '฿2,000', status: 'PAID' },
  { id: '#ORD-2026-002', name: 'นายสเหมียน', course: 'Python101 (Online)', date: '10 ก.พ. 69', amount: '฿2,000', status: 'PAID' },
  { id: '#ORD-2026-003', name: 'น.ส.สุวรรณา', course: 'Python101 (Online)', date: '10 ก.พ. 69', amount: '฿2,000', status: 'PENDING' },
  { id: '#ORD-2026-004', name: 'น.ส.ปทุมพร', course: 'Python101 (Online)', date: '10 ก.พ. 69', amount: '฿2,000', status: 'PAID' },
  { id: '#ORD-2026-005', name: 'น.ส.ศิรพี', course: 'Python101 (Online)', date: '10 ก.พ. 69', amount: '฿2,000', status: 'PENDING' },
  { id: '#ORD-2026-006', name: 'นายปิตานุช', course: 'Python101 (Online)', date: '10 ก.พ. 69', amount: '฿2,000', status: 'PAID' },
  { id: '#ORD-2026-007', name: 'น.ส.ศศิกานต์', course: 'Python101 (Online)', date: '10 ก.พ. 69', amount: '฿2,000', status: 'PENDING' },
];

const mockTeachers = [
  { id: 'T001', name: 'อ. สมพงษ์ จันทร', email: 'sompong@b2c.com', status: 'Active', courses: 3 },
  { id: 'T002', name: 'อ. วนิดา เรืองรอง', email: 'wanida@b2c.com', status: 'Active', courses: 2 },
  { id: 'T003', name: 'อ. กิตติพงษ์ ใจดี', email: 'kittipong@b2c.com', status: 'Inactive', courses: 0 },
];

const mockStudents = [
  { id: 'S001', name: 'น.ส. นภาภรณ์ สมใจ', email: 'napaporn@test.com', coursesEnrolled: 2 },
  { id: 'S002', name: 'นาย ปฏิภาณ ธรรมดี', email: 'patipan@test.com', coursesEnrolled: 1 },
  { id: 'S003', name: 'นาย วิทยา เก่งกาจ', email: 'vittaya@test.com', coursesEnrolled: 4 },
];

const mockExams = [
  { id: 'EX-001', title: 'แบบทดสอบ Python พื้นฐาน', course: 'Python101', questions: 30, timeLimit: '60 นาที' },
  { id: 'EX-002', title: 'ข้อสอบกลางภาค Java OOP', course: 'Java OOP', questions: 50, timeLimit: '90 นาที' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('home');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // ==========================================
  // Course Management State
  // ==========================================
  const [adminCourses, setAdminCourses] = useState<Course[]>(() => {
    const savedCourses = localStorage.getItem('teacherCourses');
    if (savedCourses) {
      try {
        return JSON.parse(savedCourses);
      } catch (e) {
        console.error("Error parsing saved courses:", e);
      }
    }
    return [];
  });

  const handleApproveCourse = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'REQUEST_CREATE' ? 'DRAFTING' : 'PUBLISHED';
    const updatedCourses = adminCourses.map(c => c.id === id ? { ...c, status: newStatus as any } : c);
    
    setAdminCourses(updatedCourses);
    localStorage.setItem('teacherCourses', JSON.stringify(updatedCourses));
    alert('อนุมัติคอร์สเรียนเรียบร้อยแล้ว!');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderBadge = (status: string) => {
    if (status === 'PAID') return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>ชำระแล้ว</span>;
    if (status === 'PENDING') return <span style={{ background: '#fef08a', color: '#ca8a04', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>รอตรวจสอบ</span>;
    return null;
  };

  return (
    <div className="page-container">
      
      {/* Top Section (Sidebar + Main Content) */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* ==========================================
            SIDEBAR (Left) 
            ========================================== */}
        <aside style={{ width: '260px', backgroundColor: '#1e3a5f', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        {/* Logo Area */}
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a' }}>
           <img src={logoImage} alt="Logo" style={{ height: '35px' }} />
           <img src={fullLogo} alt="Logo text" style={{ height: '30px' }} />
        </div>

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            
            <li onClick={() => setActiveMenu('home')} style={{ ...sidebarItemStyle, background: activeMenu === 'home' ? '#2c5282' : 'transparent', borderLeft: activeMenu === 'home' ? '4px solid #60a5fa' : '4px solid transparent' }}>
              <Home size={20} /> หน้าหลัก
            </li>
            
            <li onClick={() => setActiveMenu('courses')} style={{ ...sidebarItemStyle, background: activeMenu === 'courses' ? '#2c5282' : 'transparent', borderLeft: activeMenu === 'courses' ? '4px solid #60a5fa' : '4px solid transparent' }}>
              <BookOpen size={20} /> จัดการคอร์สเรียน
            </li>

            <li style={{ padding: 0 }}>
               <div onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} style={{ ...sidebarItemStyle, cursor: 'pointer' }}>
                  <Users size={20} /> จัดการผู้ใช้งาน
                  <span style={{ marginLeft: 'auto', transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }}>▼</span>
               </div>
               {isUserMenuOpen && (
                 <ul style={{ listStyle: 'none', padding: '0 0 0 45px', margin: 0, backgroundColor: '#1a3052' }}>
                   <li onClick={() => setActiveMenu('teachers')} style={{ padding: '10px 0', cursor: 'pointer', fontSize: '0.9rem', color: activeMenu === 'teachers' ? '#60a5fa' : '#cbd5e1' }}>อาจารย์</li>
                   <li onClick={() => setActiveMenu('students')} style={{ padding: '10px 0', cursor: 'pointer', fontSize: '0.9rem', color: activeMenu === 'students' ? '#60a5fa' : '#cbd5e1' }}>นักเรียน</li>
                 </ul>
               )}
            </li>

            <li onClick={() => setActiveMenu('exams')} style={{ ...sidebarItemStyle, background: activeMenu === 'exams' ? '#2c5282' : 'transparent', borderLeft: activeMenu === 'exams' ? '4px solid #60a5fa' : '4px solid transparent' }}>
              <FileText size={20} /> คลังข้อสอบ
            </li>

            <li onClick={() => setActiveMenu('finance')} style={{ ...sidebarItemStyle, background: activeMenu === 'finance' ? '#2c5282' : 'transparent', borderLeft: activeMenu === 'finance' ? '4px solid #60a5fa' : '4px solid transparent' }}>
              <CreditCard size={20} /> การเงินและคำสั่งซื้อ
            </li>

            <li onClick={() => setActiveMenu('settings')} style={{ ...sidebarItemStyle, background: activeMenu === 'settings' ? '#2c5282' : 'transparent', borderLeft: activeMenu === 'settings' ? '4px solid #60a5fa' : '4px solid transparent', marginTop: '20px' }}>
              <Settings size={20} /> ตั้งค่าระบบ
            </li>

          </ul>
        </nav>

         {/* Logout Button at Bottom */}
         <div style={{ padding: '20px', borderTop: '1px solid #1e293b' }}>
           <button onClick={handleLogout} style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
             <LogOut size={18} /> ออกจากระบบ
           </button>
         </div>
      </aside>


      {/* ==========================================
          MAIN CONTENT AREA 
          ========================================== */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Navbar */}
        <header style={{ height: '70px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 30px', color: 'white', gap: '20px' }}>
             {/* Search */}
             <div style={{ position: 'relative' }}>
                <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="ค้นหา..." style={{ background: 'transparent', border: '1px solid #334155', borderRadius: '20px', padding: '8px 15px 8px 35px', color: 'white', outline: 'none', width: '250px' }} />
             </div>
             
             {/* Admin Profile */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <User size={20} color="#475569" />
                </div>
                <span style={{ fontSize: '0.9rem' }}>Admin</span>
             </div>
        </header>


        {/* Dashboard Content */}
        <div style={{ padding: '30px', overflowY: 'auto' }}>
          
          <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#94a3b8' }} onClick={() => navigate('/dashboard')}>
              <div style={{ background: '#cbd5e1', borderRadius: '50%', padding: '6px', display: 'flex' }}><ChevronLeft size={20} color="white" /></div><span>กลับหน้าหลัก</span>
            </div>
          </div>

          {/* ==========================================
              HOME MENU (Dashboard)
              ========================================== */}
          {activeMenu === 'home' && (
            <>
              {/* Stats Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {/* Card 1 */}
              <div style={cardStyle}>
                 <ArrowUp size={40} color="#22c55e" style={{ marginRight: '15px' }} />
                 <div>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 5px 0' }}>รายได้รวม (เดือนนี้)</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 5px 0' }}>฿452,000</p>
                    <p style={{ fontSize: '0.8rem', color: '#22c55e', margin: 0, fontWeight: '500' }}>+12% จากเดือนที่แล้ว</p>
                 </div>
              </div>

              {/* Card 2 */}
              <div style={cardStyle}>
                 <Users size={40} color="#0ea5e9" style={{ marginRight: '15px' }} />
                 <div>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 5px 0' }}>นักเรียนทั้งหมด</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 5px 0' }}>1,250 คน</p>
                    <p style={{ fontSize: '0.8rem', color: '#22c55e', margin: 0, fontWeight: '500' }}>+45 คน ในเดือนนี้</p>
                 </div>
              </div>

              {/* Card 3 */}
              <div style={cardStyle}>
                 <MonitorPlay size={40} color="#ef4444" style={{ marginRight: '15px' }} />
                 <div>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 5px 0' }}>คอร์สที่เปิดสอน</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 5px 0' }}>15 คอร์ส</p>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>( Online 10 / Onsite 5 )</p>
                 </div>
              </div>

              {/* Card 4 */}
              <div style={cardStyle}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
                    <User size={24} color="#fff" />
                 </div>
                 <div>
                    <h3 style={{ fontSize: '0.9rem', color: '#64748b', margin: '0 0 5px 0' }}>ที่นั่ง Onsite (ว่าง)</h3>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ef4444', margin: '0 0 5px 0' }}>12/50 ที่นั่ง</p>
                 </div>
              </div>
          </div>


          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
             
             {/* Line Chart */}
             <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>ยอดสมัครเรียน</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#64748b' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div> นักเรียนใหม่
                  </div>
                </div>
                <div style={{ width: '100%', height: '220px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Donut Chart */}
             <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 20px 0' }}>อาจารย์ผู้สอน</h3>
                
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '15px' }}>
                    {/* Avatar icon representation */}
                    <div style={{ background: '#fef08a', padding: '10px', borderRadius: '12px' }}>
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" alt="avatar" style={{ width: '60px', height: '60px' }} />
                    </div>
                    <div>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>32 ท่าน</p>
                    </div>
                </div>

                <div style={{ width: '100%', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[0] }}></div> Full-time : 20 ท่าน
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[1] }}></div> Part-time : 12 ท่าน
                       </div>
                    </div>
                    <div style={{ width: '100px', height: '100px' }}>
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie data={instructorData} innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value" stroke="none">
                             {instructorData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                             ))}
                           </Pie>
                         </PieChart>
                       </ResponsiveContainer>
                    </div>
                </div>
             </div>

          </div>


          {/* Table Section */}
          <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px' }}>
             <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '0 0 20px 0', fontWeight: 'bold' }}>รายการซื้อล่าสุด</h3>
             
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead>
                 <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>รหัสสั่งซื้อ</th>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>ชื่อ</th>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>คอร์ส</th>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>วันที่</th>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>ยอดเงิน</th>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>สถานะ</th>
                 </tr>
               </thead>
               <tbody>
                 {recentOrders.map((order, idx) => (
                   <tr key={idx} style={{ borderBottom: idx !== recentOrders.length - 1 ? '1px solid #f1f5f9' : 'none', color: '#334155', fontSize: '0.9rem' }}>
                     <td style={{ padding: '12px 0' }}>{order.id}</td>
                     <td style={{ padding: '12px 0' }}>{order.name}</td>
                     <td style={{ padding: '12px 0' }}>{order.course}</td>
                     <td style={{ padding: '12px 0' }}>{order.date}</td>
                     <td style={{ padding: '12px 0', fontWeight: '500' }}>{order.amount}</td>
                     <td style={{ padding: '12px 0' }}>{renderBadge(order.status)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
            </>
          )}

          {/* ==========================================
              COURSES MENU (คำขอสร้างคอร์ส / อนุมัติขาย)
              ========================================== */}
          {activeMenu === 'courses' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '20px', fontWeight: 'bold' }}>จัดการคอร์สเรียน</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* Section 1: รออนุมัติสร้างคอร์ส */}
                <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                   <div style={{ width: '100%', borderBottom: '2px solid #fef08a', paddingBottom: '10px', marginBottom: '15px' }}>
                     <h3 style={{ fontSize: '1.1rem', color: '#a16207', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        ⏳ คำขอเปิดคอร์สใหม่ (รออนุมัติ) 
                     </h3>
                   </div>
                   
                   <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {adminCourses.filter(c => c.status === 'REQUEST_CREATE').length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>ไม่มีคำขอสร้างคอร์สใหม่</p>
                      ) : (
                        adminCourses.filter(c => c.status === 'REQUEST_CREATE').map(course => (
                          <div key={course.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', alignItems: 'center', background: '#f8fafc' }}>
                             <img 
                               src={course.image} 
                               alt={course.title} 
                               style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' }} 
                               onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
                             />
                             <div style={{ flex: 1 }}>
                               <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0f172a' }}>{course.title}</h4>
                               <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>ผู้สอน: {course.instructor || 'ไม่ระบุ'}</p>
                             </div>
                             <button 
                               onClick={() => handleApproveCourse(course.id, course.status)}
                               style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                             >
                               อนุมัติสร้างคอร์ส
                             </button>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                {/* Section 2: รออนุมัติขาย */}
                <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                   <div style={{ width: '100%', borderBottom: '2px solid #fed7aa', paddingBottom: '10px', marginBottom: '15px' }}>
                     <h3 style={{ fontSize: '1.1rem', color: '#c2410c', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🚀 คำขอเปิดขายคอร์ส (รอตรวจสอบเนื้อหา)
                     </h3>
                   </div>
                   
                   <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {adminCourses.filter(c => c.status === 'PENDING_REVIEW').length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>ไม่มีคำขอเปิดขายคอร์ส</p>
                      ) : (
                        adminCourses.filter(c => c.status === 'PENDING_REVIEW').map(course => (
                          <div key={course.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', alignItems: 'center', background: '#fff7ed' }}>
                             <img 
                               src={course.image} 
                               alt={course.title} 
                               style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' }} 
                               onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
                             />
                             <div style={{ flex: 1 }}>
                               <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0f172a' }}>{course.title}</h4>
                               <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>ผู้สอน: {course.instructor || 'ไม่ระบุ'} • ราคา: {course.price || 'ฟรี'} บาท</p>
                             </div>
                             <div style={{ display: 'flex', gap: '10px' }}>
                               <button style={{ background: 'white', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                 ตรวจสอบเนื้อหา
                               </button>
                               <button 
                                 onClick={() => handleApproveCourse(course.id, course.status)}
                                 style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                               >
                                 อนุมัติวางขาย
                               </button>
                             </div>
                          </div>
                        ))
                      )}
                   </div>
                </div>

              </div>
            </div>
          )}

          {/* ==========================================
              USERS MENU (อาจารย์ / นักเรียน)
              ========================================== */}
          {activeMenu === 'teachers' && (
            <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px', width: '100%' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '20px', fontWeight: 'bold' }}>รายชื่ออาจารย์ทั้งหมด</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>รหัสประจำตัว</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>ชื่อ-นามสกุล</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>อีเมล</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>จำนวนคอร์สที่สอน</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTeachers.map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 0' }}>{t.id}</td>
                      <td style={{ padding: '12px 0' }}>{t.name}</td>
                      <td style={{ padding: '12px 0' }}>{t.email}</td>
                      <td style={{ padding: '12px 0' }}>{t.courses} คอร์ส</td>
                      <td style={{ padding: '12px 0' }}>
                         <span style={{ color: t.status === 'Active' ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>{t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeMenu === 'students' && (
            <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px', width: '100%' }}>
              <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '20px', fontWeight: 'bold' }}>รายชื่อนักเรียนทั้งหมด</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>รหัสประจำตัว</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>ชื่อ-นามสกุล</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>อีเมล</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>จำนวนคอร์สที่ลงเรียน</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStudents.map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 0' }}>{s.id}</td>
                      <td style={{ padding: '12px 0' }}>{s.name}</td>
                      <td style={{ padding: '12px 0' }}>{s.email}</td>
                      <td style={{ padding: '12px 0' }}>{s.coursesEnrolled} คอร์ส</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ==========================================
              EXAMS MENU
              ========================================== */}
          {activeMenu === 'exams' && (
            <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '20px' }}>
                 <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0, fontWeight: 'bold' }}>คลังข้อสอบส่วนกลาง</h2>
                 <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ สร้างชุดข้อสอบ</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>รหัสข้อสอบ</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>ชื่อชุดข้อสอบ</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>วิชา/คอร์ส</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>จำนวนข้อ</th>
                    <th style={{ padding: '12px 0', fontWeight: '500' }}>เวลาทำสอบ</th>
                  </tr>
                </thead>
                <tbody>
                  {mockExams.map((e, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem' }}>
                      <td style={{ padding: '12px 0' }}>{e.id}</td>
                      <td style={{ padding: '12px 0' }}>{e.title}</td>
                      <td style={{ padding: '12px 0' }}>{e.course}</td>
                      <td style={{ padding: '12px 0' }}>{e.questions} ข้อ</td>
                      <td style={{ padding: '12px 0' }}>{e.timeLimit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ==========================================
              FINANCE MENU
              ========================================== */}
          {activeMenu === 'finance' && (
            <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '20px' }}>
                 <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0, fontWeight: 'bold' }}>รายการรับชำระเงินทั้งหมด</h2>
                 <button style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>ส่งออก CSV</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead>
                 <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>รหัสสั่งซื้อ</th>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>ชื่อ</th>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>คอร์ส</th>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>วันที่</th>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>ยอดเงิน</th>
                   <th style={{ padding: '12px 0', fontWeight: '500' }}>สถานะ</th>
                 </tr>
               </thead>
               <tbody>
                 {recentOrders.map((order, idx) => (
                   <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem' }}>
                     <td style={{ padding: '12px 0' }}>{order.id}</td>
                     <td style={{ padding: '12px 0' }}>{order.name}</td>
                     <td style={{ padding: '12px 0' }}>{order.course}</td>
                     <td style={{ padding: '12px 0' }}>{order.date}</td>
                     <td style={{ padding: '12px 0', fontWeight: '500', color: '#16a34a' }}>{order.amount}</td>
                     <td style={{ padding: '12px 0' }}>{renderBadge(order.status)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
            </div>
          )}

          {/* ==========================================
              SETTINGS
              ========================================== */}
          {activeMenu === 'settings' && (
            <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px', width: '100%' }}>
               <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '20px', fontWeight: 'bold' }}>ตั้งค่าระบบเบื้องต้น</h2>
               <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   
                   <div>
                     <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>ชื่อสถาบัน / แพลตฟอร์ม</label>
                     <input type="text" defaultValue="Born2Code Institute" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
                   </div>

                   <div>
                     <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '8px' }}>อีเมลสำหรับติดต่อผู้ดูแล</label>
                     <input type="email" defaultValue="admin@born2code.com" style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
                   </div>

                   <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <input type="checkbox" id="allowReg" defaultChecked />
                      <label htmlFor="allowReg" style={{ color: '#334155', fontSize: '0.9rem' }}>อนุญาตให้สมัครสมาชิกใหม่ (นักเรียน)</label>
                   </div>

                   <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>บันทึกการตั้งค่า</button>
               </div>
            </div>
          )}

        </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="footer" style={{ marginTop: 'auto', background: '#0f172a', padding: '3rem 5%' }}>
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

    </div>
  );
}

// --- Styles Helper ---
const sidebarItemStyle: React.CSSProperties = {
  padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', color: '#f8fafc',
  cursor: 'pointer', transition: 'background 0.2s', fontSize: '0.95rem'
};

const cardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'
};
