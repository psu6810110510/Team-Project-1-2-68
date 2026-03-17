/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Search, User, Settings, CreditCard, BookOpen, Home, Users,
  ArrowUp, MonitorPlay, LogOut, ChevronLeft, Calendar, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';
import '../styles/LoginTheme.css';
import Footer from '../components/Footer';
import { courseAPI, CourseStatus, type Course as APICourse } from '../api/courseAPI';
import { paymentAPI, type PaymentRecord } from '../api/paymentAPI';
import examAPI from '../api/examAPI';
import userAPI, { type UserRecord, type DashboardStats } from '../api/userAPI';

// ==========================================
// Constants & Mocks
// ==========================================
const COLORS = ['#3b82f6', '#cbd5e1'];

const BStatus = {
  CONFIRMED: 'CONFIRMED',
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED'
};

const bookingAPI = {
  confirmBooking: async (_id: string) => Promise.resolve(),
  cancelBooking: async (_id: string) => Promise.resolve(),
  getAllBookings: async () => Promise.resolve({ data: { data: [] } })
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('home');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // ==========================================
  // States
  // ==========================================
  // Course
  const [adminCourses, setAdminCourses] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<APICourse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Payment
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [homePayments, setHomePayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  // Users
  const [teachers, setTeachers] = useState<UserRecord[]>([]);
  const [students, setStudents] = useState<UserRecord[]>([]);

  // Exams
  const [exams, setExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [isExamCourseModalOpen, setIsExamCourseModalOpen] = useState(false);

  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Bookings & Calendar
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any | null>(null);

  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // ==========================================
  // Fetch Functions
  // ==========================================
  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await bookingAPI.getAllBookings();
      setBookings(res.data?.data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadSchedules = async () => {
    setLoadingSchedules(true);
    try {
      setAllSchedules([]);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleDeleteUser = async (id: string, role: 'TEACHER' | 'STUDENT') => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? การกระทำนี้ไม่สามารถย้อนกลับได้')) return;
    try {
      await userAPI.deleteUser(id);
      alert('ลบผู้ใช้สำเร็จ!');
      if (role === 'TEACHER') {
        setTeachers(prev => prev.filter(u => u.id !== id));
      } else {
        setStudents(prev => prev.filter(u => u.id !== id));
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  const handleApproveTeacher = async (teacherId: string) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการอนุมัติอาจารย์ท่านนี้?')) return;
    try {
      await userAPI.approveTeacher(teacherId);
      alert('อนุมัติอาจารย์สําเร็จ!');
      setTeachers(prev => prev.map(t => t.teacher_id === teacherId ? { ...t, is_approved: true } : t));
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const refreshCourses = async () => {
    try {
      const [requested, drafting, pending, published] = await Promise.all([
        courseAPI.getCoursesByStatus(CourseStatus.REQUEST_CREATE),
        courseAPI.getCoursesByStatus(CourseStatus.DRAFTING),
        courseAPI.getCoursesByStatus(CourseStatus.PENDING_REVIEW),
        courseAPI.getCoursesByStatus(CourseStatus.PUBLISHED),
      ]);

      const allCourses = [
        ...requested.data.data,
        ...drafting.data.data,
        ...pending.data.data,
        ...published.data.data,
      ];
      setAdminCourses(allCourses);
    } catch (error) {
      console.error('Error refreshing courses:', error);
    }
  };

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const res = await paymentAPI.getAllPayments();
      setPayments(res.data.data);
      setHomePayments(res.data.data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadExams = async () => {
    setLoadingExams(true);
    try {
      const res = await examAPI.getAllExams();
      setExams(res.data.data);
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getDashboardStats();
      setDashboardStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([
        refreshCourses(),
        loadPayments(),
        fetchDashboardStats(),
        loadBookings(),
        loadSchedules()
      ]);
      try {
        const [teachersRes, studentsRes] = await Promise.all([
          userAPI.getUsersByRole('TEACHER'),
          userAPI.getUsersByRole('STUDENT'),
        ]);
        setTeachers(teachersRes.data.data);
        setStudents(studentsRes.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      setLoading(false);
    };
    initData();
  }, []);

  // ==========================================
  // Handlers
  // ==========================================
  const handleDeleteExam = async (id: string, title: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อสอบ "${title}"?\nหากลบแล้วจะไม่สามารถกู้คืนได้`)) {
      try {
        await examAPI.deleteExam(id);
        alert('ลบข้อสอบสำเร็จ');
        loadExams();
      } catch (error) {
        console.error('Error deleting exam:', error);
        alert('เกิดข้อผิดพลาดในการลบข้อสอบ');
      }
    }
  };

  const handleConfirmPayment = async (id: string) => {
    try {
      await paymentAPI.confirmPayment(id);
      await loadPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleRejectPayment = async (id: string) => {
    const reason = prompt('ระบุเหตุผลในการปฏิเสธ (ถ้ามี):');
    if (reason === null) return;
    try {
      await paymentAPI.rejectPayment(id, reason);
      await loadPayments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleApproveCourse = async (id: string, currentStatus: CourseStatus) => {
    try {
      if (currentStatus === CourseStatus.REQUEST_CREATE) {
        await courseAPI.approveCreateRequest(id);
        alert('อนุมัติการสร้างคอร์สเรียบร้อยแล้ว! อาจารย์สามารถเริ่มใส่เนื้อหาได้');
      } else if (currentStatus === CourseStatus.PENDING_REVIEW) {
        await courseAPI.approvePublish(id);
        alert('อนุมัติการขายคอร์สเรียบร้อยแล้ว! คอร์สจะปรากฏในหน้ารวมคอร์ส');
      }
      await refreshCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleRejectCourse = async (id: string, currentStatus: CourseStatus) => {
    const reason = prompt('กรุณาระบุเหตุผลในการปฏิเสธ:');
    if (!reason) return;
    try {
      if (currentStatus === CourseStatus.REQUEST_CREATE) {
        await courseAPI.rejectCreateRequest(id, reason);
        alert('ปฏิเสธคำขอสร้างคอร์สแล้ว');
      } else if (currentStatus === CourseStatus.PENDING_REVIEW) {
        await courseAPI.rejectPublish(id, reason);
        alert('ส่งคอร์สกลับไปแก้ไขแล้ว');
      }
      setIsModalOpen(false);
      setSelectedCourse(null);
      await refreshCourses();
    } catch (error: any) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const openCourseDetailModal = async (course: APICourse) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
    setLoadingLessons(true);
    try {
      const response = await courseAPI.getLessonsByCourse(course.id);
      setCourseLessons(response.data.data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
      setCourseLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleDeleteCourse = async (id: string, title: string, status: CourseStatus) => {
    if (status === CourseStatus.PUBLISHED) {
      alert('ไม่สามารถลบคอร์สที่เปิดขายแล้ว\nกรุณาใช้ปุ่ม "ปิดการใช้งาน" แทน');
      return;
    }
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคอร์ส "${title}"?\n\nการลบคอร์สจะลบข้อมูลทั้งหมดรวมถึงบทเรียน แบบทดสอบ และข้อมูลนักเรียนที่ลงทะเบียน`)) return;
    try {
      await courseAPI.deleteCourse(id);
      alert('ลบคอร์สเรียบร้อยแล้ว');
      await refreshCourses();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบคอร์ส');
    }
  };

  const handleToggleCourseActive = async (id: string, title: string, currentActive: boolean) => {
    const action = currentActive ? 'ปิดการขาย' : 'เปิดการขาย';
    if (!window.confirm(`คุณต้องการ${action}คอร์ส "${title}" หรือไม่?\n\n${currentActive ? 'คอร์สจะไม่แสดงในหน้ารวมคอร์สอีกต่อไป' : 'คอร์สจะกลับมาแสดงในหน้ารวมคอร์สอีกครั้ง'}`)) return;
    try {
      await courseAPI.updateCourseDetails(id, { is_active: !currentActive });
      alert(`${action}คอร์สเรียบร้อยแล้ว`);
      await refreshCourses();
    } catch (error: any) {
      console.error('Error toggling course active:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setIsModalOpen(false);
    setCourseLessons([]);
  };


  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderBadge = (status: string) => {
    if (status === 'CONFIRMED' || status === 'PAID') return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>ชำระแล้ว</span>;
    if (status === 'PAYMENT_SUBMITTED' || status === 'PENDING') return <span style={{ background: '#fef08a', color: '#ca8a04', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>รอตรวจสอบ</span>;
    if (status === 'WAITLIST') return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #cbd5e1' }}>รอคิว</span>;
    return null;
  };

  // ==========================================
  // Computed Stats for Home Dashboard
  // ==========================================
  const confirmedPayments = homePayments.filter(p => p.status === 'CONFIRMED');
  const totalRevenueVal = confirmedPayments.reduce((sum, p) => sum + Number(p.total_amount), 0);
  const totalStudentsVal = dashboardStats?.totalStudents || students.length || 0;
  const totalTeachersCountVal = dashboardStats?.totalTeachers || teachers.length || 0;
  const publishedCoursesList = adminCourses.filter(c => c.status === CourseStatus.PUBLISHED);
  const totalPublishedCourses = publishedCoursesList.length;
  const onlineCoursesCount = publishedCoursesList.filter(c => c.is_online).length;
  const onsiteCoursesCount = publishedCoursesList.filter(c => c.is_onsite).length;
  const hybridCoursesCount = publishedCoursesList.filter((c: any) => c.is_hybrid).length;
  const recentPaymentsList = [...homePayments].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 7);

  const getLast6MonthsRevenueData = () => {
    const data = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('th-TH', { month: 'short' });
      const yearStr = d.toLocaleDateString('th-TH', { year: '2-digit' });

      const revenue = confirmedPayments.filter(p => {
        const pDate = new Date(p.created_at);
        return pDate.getMonth() === d.getMonth() && pDate.getFullYear() === d.getFullYear();
      }).reduce((sum, p) => sum + Number(p.total_amount), 0);

      data.push({ name: `${monthStr} ${yearStr}`, revenue });
    }
    return data;
  };

  const realRevenueData = getLast6MonthsRevenueData();

  const realInstructorData = [
    { name: 'Active', value: teachers.filter(t => t.is_active).length },
    { name: 'Inactive', value: teachers.filter(t => !t.is_active).length }
  ];

  return (
    <div className="page-container" style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Top Section */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* ==========================================
            SIDEBAR (Left) 
            ========================================== */}
        <aside style={{ width: '260px', backgroundColor: '#1e3a5f', color: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a' }}>
            <img src={logoImage} alt="Logo" style={{ height: '35px' }} />
            <img src={fullLogo} alt="Logo text" style={{ height: '30px' }} />
          </div>

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
              <li onClick={() => { setActiveMenu('finance'); loadPayments(); }} style={{ ...sidebarItemStyle, background: activeMenu === 'finance' ? '#2c5282' : 'transparent', borderLeft: activeMenu === 'finance' ? '4px solid #60a5fa' : '4px solid transparent' }}>
                <CreditCard size={20} /> การเงินและคำสั่งซื้อ
              </li>
              <li onClick={() => setActiveMenu('settings')} style={{ ...sidebarItemStyle, background: activeMenu === 'settings' ? '#2c5282' : 'transparent', borderLeft: activeMenu === 'settings' ? '4px solid #60a5fa' : '4px solid transparent', marginTop: '20px' }}>
                <Settings size={20} /> ตั้งค่าระบบ
              </li>
            </ul>
          </nav>

          <div style={{ padding: '20px', borderTop: '1px solid #1e293b' }}>
            <button onClick={handleLogout} style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              <LogOut size={18} /> ออกจากระบบ
            </button>
          </div>
        </aside>

        {/* ==========================================
            MAIN CONTENT AREA 
            ========================================== */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <header style={{ height: '70px', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 30px', color: 'white', gap: '20px', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="ค้นหา..." style={{ background: 'transparent', border: '1px solid #334155', borderRadius: '20px', padding: '8px 15px 8px 35px', color: 'white', outline: 'none', width: '250px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <User size={20} color="#475569" />
              </div>
              <span style={{ fontSize: '0.9rem' }}>Admin</span>
            </div>
          </header>

          <div style={{ padding: '30px', overflowY: 'auto', background: '#f1f5f9', flex: 1 }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                  <div style={cardStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>รายรับรวม (ตลอดกาล)</p>
                      <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#0f172a', fontWeight: '800' }}>฿{totalRevenueVal.toLocaleString('th-TH')}</h2>
                      <p style={{ fontSize: '0.8rem', color: '#22c55e', margin: 0, fontWeight: '500', marginTop: '5px' }}>{confirmedPayments.length} รายการที่ยืนยัน</p>
                    </div>
                    <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '12px' }}>
                      <ArrowUp size={24} color="#16a34a" />
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>นักเรียนทั้งหมด</p>
                      <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#0f172a', fontWeight: '800' }}>{totalStudentsVal.toLocaleString('th-TH')} <span style={{ fontSize: '1rem', color: '#64748b' }}>คน</span></h2>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, marginTop: '5px' }}>จากฐานข้อมูล</p>
                    </div>
                    <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '12px' }}>
                      <Users size={24} color="#0284c7" />
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>คอร์สที่เปิดสอน</p>
                      <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#0f172a', fontWeight: '800' }}>{totalPublishedCourses} <span style={{ fontSize: '1rem', color: '#64748b' }}>คอร์ส</span></h2>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>
                        ( Online {onlineCoursesCount} / Onsite {onsiteCoursesCount} / Hybrid {hybridCoursesCount} )
                      </p>
                    </div>
                    <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '12px' }}>
                      <MonitorPlay size={24} color="#dc2626" />
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>อาจารย์ทั้งหมด</p>
                      <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#0f172a', fontWeight: '800' }}>{totalTeachersCountVal} <span style={{ fontSize: '1rem', color: '#64748b' }}>ท่าน</span></h2>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>Active {teachers.filter(t => t.is_active).length} ท่าน</p>
                    </div>
                    <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px' }}>
                      <User size={24} color="#d97706" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>สรุปคอร์สตามสถานะ</h3>
                    </div>
                    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
                      <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#a16207' }}>{adminCourses.filter(c => c.status === CourseStatus.REQUEST_CREATE).length}</p>
                        <p style={{ fontSize: '0.8rem', color: '#a16207', margin: '5px 0 0 0' }}>รอสร้าง</p>
                      </div>
                      <div style={{ background: '#e0e7ff', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#4338ca' }}>{adminCourses.filter(c => c.status === CourseStatus.DRAFTING).length}</p>
                        <p style={{ fontSize: '0.8rem', color: '#4338ca', margin: '5px 0 0 0' }}>กำลังร่าง</p>
                      </div>
                      <div style={{ background: '#fed7aa', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#c2410c' }}>{adminCourses.filter(c => c.status === CourseStatus.PENDING_REVIEW).length}</p>
                        <p style={{ fontSize: '0.8rem', color: '#c2410c', margin: '5px 0 0 0' }}>รอตรวจ</p>
                      </div>
                      <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#15803d' }}>{publishedCoursesList.length}</p>
                        <p style={{ fontSize: '0.8rem', color: '#15803d', margin: '5px 0 0 0' }}>เปิดขาย</p>
                      </div>
                    </div>
                    <div style={{ marginTop: '20px', width: '100%' }}>
                      <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 10px 0' }}>ยอดรับรวม (บาท)</h3>
                      <div style={{ width: '100%', height: '220px' }}>
                        {/* @ts-ignore */}
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={realRevenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <RechartsTooltip />
                            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0 0 20px 0' }}>อาจารย์ผู้สอน</h3>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '15px' }}>
                      <div style={{ background: '#fef08a', padding: '10px', borderRadius: '12px' }}>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" alt="avatar" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>{totalTeachersCountVal} <span style={{ fontSize: '1rem', color: '#64748b' }}>ท่าน</span></p>
                      </div>
                    </div>

                    <div style={{ width: '100%', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[0] }}></div> Active : {teachers.filter(t => t.is_active).length} ท่าน
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[1] }}></div> Inactive : {teachers.filter(t => !t.is_active).length} ท่าน
                        </div>
                      </div>
                      <div style={{ width: '100px', height: '100px' }}>
                        {/* @ts-ignore */}
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={realInstructorData} innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value" stroke="none">
                              {realInstructorData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px' }}>
                  <h3 style={{ fontSize: '1.2rem', color: '#0f172a', margin: '0 0 20px 0', fontWeight: 'bold' }}>รายการซื้อล่าสุด</h3>
                  {recentPaymentsList.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0', width: '100%' }}>ยังไม่มีรายการซื้อ</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 0', fontWeight: '500' }}>ชื่อ</th>
                          <th style={{ padding: '12px 0', fontWeight: '500' }}>คอร์ส</th>
                          <th style={{ padding: '12px 0', fontWeight: '500' }}>วันที่</th>
                          <th style={{ padding: '12px 0', fontWeight: '500' }}>ยอดเงิน</th>
                          <th style={{ padding: '12px 0', fontWeight: '500' }}>สถานะ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPaymentsList.map((p, idx) => (
                          <tr key={p.id} style={{ borderBottom: idx !== recentPaymentsList.length - 1 ? '1px solid #f1f5f9' : 'none', color: '#334155', fontSize: '0.9rem' }}>
                            <td style={{ padding: '12px 0' }}>{p.user_name || p.user_email || '-'}</td>
                            <td style={{ padding: '12px 0' }}>{p.course_titles?.join(', ') || '-'}</td>
                            <td style={{ padding: '12px 0' }}>{new Date(p.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}</td>
                            <td style={{ padding: '12px 0', fontWeight: '500' }}>฿{Number(p.total_amount).toLocaleString()}</td>
                            <td style={{ padding: '12px 0' }}>{renderBadge(p.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}

            {/* ==========================================
                CALENDAR MENU (Global Schedule)
                ========================================== */}
            {activeMenu === 'calendar' && (
              <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '30px', width: '100%', minHeight: '500px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '30px', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.6rem', color: '#0f172a', margin: 0, fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#e0f2fe', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                      <Calendar size={28} color="#0284c7" />
                    </div>
                    ปฏิทินรอบเรียนทั้งหมด
                  </h3>
                </div>

                {loadingSchedules ? (
                  <div style={{ padding: '60px', textAlign: 'center', width: '100%', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                    <div className="loader" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    <span>กำลังโหลดข้อมูลปฏิทิน...</span>
                  </div>
                ) : allSchedules.length === 0 ? (
                  <div style={{ padding: '60px', textAlign: 'center', width: '100%', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                    <div style={{ margin: '0 auto 15px auto', opacity: 0.5 }}>
                      <Calendar size={48} />
                    </div>
                    <p style={{ fontSize: '1.1rem', margin: 0 }}>ไม่มีรอบเรียนในระบบ</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', width: '100%' }}>
                    {allSchedules.map((schedule, idx) => {
                      const startDate = new Date(schedule.start_time);
                      const endDate = new Date(schedule.end_time);
                      const dayStr = startDate.toLocaleDateString('th-TH', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                      const timeStr = `${startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`;
                      const isOnsite = schedule.course?.learning_mode === 'ONSITE' || schedule.course?.is_onsite || schedule.room_location;

                      return (
                        <div key={schedule.id || idx} style={{
                          background: 'white', borderRadius: '20px', padding: '25px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9',
                          display: 'flex', flexDirection: 'column', gap: '15px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ background: isOnsite ? '#fffbeb' : '#eff6ff', color: isOnsite ? '#b45309' : '#1d4ed8', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Calendar size={16} /> {dayStr}
                            </div>
                            <span style={{ background: isOnsite ? '#fef3c7' : '#dbeafe', color: isOnsite ? '#d97706' : '#2563eb', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {isOnsite ? 'Onsite' : 'Online'}
                            </span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: '800' }}>{schedule.course?.title || 'ไม่มีชื่อคอร์ส'}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#475569', fontSize: '0.95rem', background: '#f8fafc', padding: '10px', borderRadius: '10px' }}>
                                <Clock size={18} color="#64748b" />
                                <span style={{ fontWeight: '500' }}>{timeStr}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
              COURSES MENU
              ========================================== */}
            {activeMenu === 'courses' && (
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '20px', fontWeight: 'bold' }}>จัดการคอร์สเรียน</h2>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>⏳ กำลังโหลดข้อมูลคอร์ส...</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    
                    {/* Section 1: รออนุมัติสร้างคอร์ส */}
                    <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ width: '100%', borderBottom: '2px solid #fef08a', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#a16207', margin: 0 }}>⏳ คำขอเปิดคอร์สใหม่ (รออนุมัติ)</h3>
                      </div>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {adminCourses.filter(c => c.status === CourseStatus.REQUEST_CREATE).length === 0 ? (
                          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>ไม่มีคำขอสร้างคอร์สใหม่</p>
                        ) : (
                          adminCourses.filter(c => c.status === CourseStatus.REQUEST_CREATE).map(course => (
                            <div key={course.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', alignItems: 'center', background: '#f8fafc' }}>
                              <img
                                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                                alt={course.title}
                                style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                              />
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0f172a' }}>{course.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>ผู้สอน: {course.instructor_name || course.instructor?.full_name || 'ไม่ระบุ'}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  onClick={() => openCourseDetailModal(course)}
                                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  📋 ดูรายละเอียด
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Section 2: รออนุมัติขาย */}
                    <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ width: '100%', borderBottom: '2px solid #fed7aa', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#c2410c', margin: 0 }}>🚀 คำขอเปิดขายคอร์ส (รอตรวจสอบเนื้อหา)</h3>
                      </div>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {adminCourses.filter(c => c.status === CourseStatus.PENDING_REVIEW).length === 0 ? (
                          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>ไม่มีคำขอเปิดขายคอร์ส</p>
                        ) : (
                          adminCourses.filter(c => c.status === CourseStatus.PENDING_REVIEW).map(course => (
                            <div key={course.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', alignItems: 'center', background: '#fff7ed' }}>
                              <img
                                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                                alt={course.title}
                                style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                              />
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0f172a' }}>{course.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>ผู้สอน: {course.instructor_name || course.instructor?.full_name || 'ไม่ระบุ'} • ราคา: {course.price || 'ฟรี'} บาท</p>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  onClick={() => openCourseDetailModal(course)}
                                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  📋 ดูรายละเอียด
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Section 3: Drafting */}
                    <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ width: '100%', borderBottom: '2px solid #e0e7ff', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#4338ca', margin: 0 }}>✍️ คอร์สที่กำลังใส่เนื้อหา ({adminCourses.filter(c => c.status === CourseStatus.DRAFTING).length} คอร์ส)</h3>
                      </div>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {adminCourses.filter(c => c.status === CourseStatus.DRAFTING).length === 0 ? (
                          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>ไม่มีคอร์สที่กำลังร่าง</p>
                        ) : (
                          adminCourses.filter(c => c.status === CourseStatus.DRAFTING).map(course => (
                            <div key={course.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', alignItems: 'center', background: '#f8fafc' }}>
                              <img
                                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                                alt={course.title}
                                style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                              />
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0f172a' }}>{course.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                  ผู้สอน: {course.instructor_name || course.instructor?.full_name || 'ไม่ระบุ'} • ราคา: {course.price ? `฿${course.price.toLocaleString('th-TH')}` : 'ฟรี'}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  onClick={() => openCourseDetailModal(course)}
                                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  📋 ดูรายละเอียด
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(course.id, course.title, course.status)}
                                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  🗑️ ลบ
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Section 4: Published */}
                    <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ width: '100%', borderBottom: '2px solid #bbf7d0', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#15803d', margin: 0 }}>🛒 คอร์สที่เปิดขายอยู่ ({adminCourses.filter(c => c.status === CourseStatus.PUBLISHED && c.is_active).length} คอร์ส)</h3>
                      </div>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {adminCourses.filter(c => c.status === CourseStatus.PUBLISHED && c.is_active).length === 0 ? (
                          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>ยังไม่มีคอร์สที่เปิดขาย</p>
                        ) : (
                          adminCourses.filter(c => c.status === CourseStatus.PUBLISHED && c.is_active).map(course => (
                            <div key={course.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', alignItems: 'center', background: '#f0fdf4' }}>
                              <img
                                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                                alt={course.title}
                                style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                              />
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0f172a' }}>{course.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                  ผู้สอน: {course.instructor_name || course.instructor?.full_name || 'ไม่ระบุ'} • ราคา: {course.price ? `฿${course.price.toLocaleString('th-TH')}` : 'ฟรี'}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  onClick={() => openCourseDetailModal(course)}
                                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  📋 ดูรายละเอียด
                                </button>
                                <button
                                  onClick={() => handleToggleCourseActive(course.id, course.title, course.is_active)}
                                  style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  ⏸️ ปิดการขาย
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Section 5: Closed */}
                    <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ width: '100%', borderBottom: '2px solid #f87171', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#dc2626', margin: 0 }}>⏸️ คอร์สที่ปิดการขาย ({adminCourses.filter(c => c.status === CourseStatus.PUBLISHED && !c.is_active).length} คอร์ส)</h3>
                      </div>
                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {adminCourses.filter(c => c.status === CourseStatus.PUBLISHED && !c.is_active).length === 0 ? (
                          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>ไม่มีคอร์สที่ปิดการขาย</p>
                        ) : (
                          adminCourses.filter(c => c.status === CourseStatus.PUBLISHED && !c.is_active).map(course => (
                            <div key={course.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', alignItems: 'center', background: '#f8fafc' }}>
                              <img
                                src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                                alt={course.title}
                                style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px', opacity: 0.7 }}
                              />
                              <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#475569' }}>{course.title}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                  ผู้สอน: {course.instructor_name || course.instructor?.full_name || 'ไม่ระบุ'} • ราคา: {course.price ? `฿${course.price.toLocaleString('th-TH')}` : 'ฟรี'}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  onClick={() => openCourseDetailModal(course)}
                                  style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  📋 ดูรายละเอียด
                                </button>
                                <button
                                  onClick={() => handleToggleCourseActive(course.id, course.title, course.is_active)}
                                  style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                  ▶️ เปิดการขาย
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
              USERS MENU (TEACHERS & STUDENTS)
              ========================================== */}
            {activeMenu === 'teachers' && (
              <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px', width: '100%' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '20px', fontWeight: 'bold' }}>รายชื่ออาจารย์ทั้งหมด ({teachers.length} ท่าน)</h2>
                {teachers.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0', width: '100%' }}>ยังไม่มีอาจารย์ในระบบ</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>ชื่อ-นามสกุล</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>อีเมล</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>เบอร์โทร</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>สถานะ</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>วันที่สมัคร</th>
                        <th style={{ padding: '12px 0', fontWeight: '500', textAlign: 'center' }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem' }}>
                          <td style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={t.image && t.image.trim() !== '' ? (t.image.startsWith('http') || t.image.startsWith('data:') ? t.image : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${t.image.startsWith('/') ? '' : '/'}${t.image}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.full_name || t.id}&backgroundColor=b6e3f4`} alt="Teacher" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.full_name || t.id}&backgroundColor=b6e3f4`; }} />
                            <span>{t.full_name || '-'}</span>
                          </td>
                          <td style={{ padding: '12px 0' }}>{t.email}</td>
                          <td style={{ padding: '12px 0' }}>{t.phone || '-'}</td>
                          <td style={{ padding: '12px 0' }}>
                            <span style={{ color: t.is_active ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>{t.is_active ? 'Active' : 'Inactive'}</span>
                            {t.is_approved === false && <span style={{ display: 'block', fontSize: '0.75rem', color: '#ca8a04' }}>(รอตรวจสอบ)</span>}
                            {t.is_approved === true && <span style={{ display: 'block', fontSize: '0.75rem', color: '#16a34a' }}>(อนุมัติแล้ว)</span>}
                          </td>
                          <td style={{ padding: '12px 0' }}>{new Date(t.created_at).toLocaleDateString('th-TH')}</td>
                          <td style={{ padding: '12px 0', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              {t.is_approved === false && t.teacher_id && (
                                <button onClick={() => handleApproveTeacher(t.teacher_id!)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>อนุมัติ</button>
                              )}
                              <button onClick={() => handleDeleteUser(t.id, 'TEACHER')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>ลบ</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeMenu === 'students' && (
              <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px', width: '100%' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '20px', fontWeight: 'bold' }}>รายชื่อนักเรียนทั้งหมด ({students.length} คน)</h2>
                {students.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0', width: '100%' }}>ยังไม่มีนักเรียนในระบบ</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>ชื่อ-นามสกุล</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>อีเมล</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>สถานะ</th>
                        <th style={{ padding: '12px 0', fontWeight: '500', textAlign: 'center' }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem' }}>
                          <td style={{ padding: '12px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={s.image && s.image.trim() !== '' ? (s.image.startsWith('http') || s.image.startsWith('data:') ? s.image : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${s.image.startsWith('/') ? '' : '/'}${s.image}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.full_name || s.id}&backgroundColor=d1fae5`} alt="Student" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.full_name || s.id}&backgroundColor=d1fae5`; }} />
                            <span>{s.full_name || '-'}</span>
                          </td>
                          <td style={{ padding: '12px 0' }}>{s.email}</td>
                          <td style={{ padding: '12px 0' }}>
                            <span style={{ color: s.is_active ? '#16a34a' : '#ef4444', fontWeight: 'bold' }}>{s.is_active ? 'Active' : 'Inactive'}</span>
                          </td>
                          <td style={{ padding: '12px 0', textAlign: 'center' }}>
                            <button onClick={() => handleDeleteUser(s.id, 'STUDENT')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>ลบ</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ==========================================
              EXAMS MENU
              ========================================== */}
            {activeMenu === 'exams' && (
              <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0, fontWeight: 'bold' }}>คลังข้อสอบส่วนกลาง ({exams.length} ชุด)</h2>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={loadExams} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🔄 โหลดข้อมูล</button>
                    <button onClick={() => setIsExamCourseModalOpen(true)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>+ สร้างชุดข้อสอบ</button>
                  </div>
                </div>
                {loadingExams ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', width: '100%' }}>⏳ กำลังโหลดข้อมูล...</div>
                ) : exams.length === 0 ? (
                  <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0', width: '100%' }}>ยังไม่มีข้อสอบในระบบ</p>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 10px', fontWeight: '500' }}>ชื่อชุดข้อสอบ</th>
                        <th style={{ padding: '12px 10px', fontWeight: '500' }}>คอร์สที่เกี่ยวข้อง</th>
                        <th style={{ padding: '12px 10px', fontWeight: '500' }}>ประเภท</th>
                        <th style={{ padding: '12px 10px', fontWeight: '500', textAlign: 'right' }}>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map((e: any) => (
                        <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem' }}>
                          <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>{e.title}</td>
                          <td style={{ padding: '12px 10px' }}>{e.course_title || e.course_name}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{ background: e.type === 'PRETEST' ? '#fef08a' : e.type === 'POSTTEST' ? '#bbf7d0' : '#e0e7ff', color: e.type === 'PRETEST' ? '#ca8a04' : e.type === 'POSTTEST' ? '#16a34a' : '#4338ca', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {e.type}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => navigate(`/exam-management/${e.course_id}`)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>จัดการ</button>
                              <button onClick={() => handleDeleteExam(e.id, e.title)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>ลบ</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ==========================================
              FINANCE MENU
              ========================================== */}
            {activeMenu === 'finance' && (
              <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.5rem', color: '#0f172a', margin: 0, fontWeight: 'bold' }}>รายการรับชำระเงินทั้งหมด</h2>
                  <button onClick={loadPayments} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🔄 โหลดข้อมูล</button>
                </div>

                {loadingPayments ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', width: '100%' }}>⏳ กำลังโหลดข้อมูล...</div>
                ) : payments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', width: '100%' }}>ยังไม่มีรายการชำระเงิน</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 8px', fontWeight: '500' }}>ชื่อผู้ชำระ</th>
                        <th style={{ padding: '12px 8px', fontWeight: '500' }}>ยอดเงิน</th>
                        <th style={{ padding: '12px 8px', fontWeight: '500' }}>สลิปโอนเงิน</th>
                        <th style={{ padding: '12px 8px', fontWeight: '500' }}>สถานะ</th>
                        <th style={{ padding: '12px 8px', fontWeight: '500' }}>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p, idx) => (
                        <tr key={p.id} style={{ borderBottom: idx !== payments.length - 1 ? '1px solid #f1f5f9' : 'none', color: '#334155', fontSize: '0.9rem' }}>
                          <td style={{ padding: '12px 8px' }}>
                            <div style={{ fontWeight: '500' }}>{p.user_name || '-'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{p.user_email || ''}</div>
                          </td>
                          <td style={{ padding: '12px 8px', fontWeight: '600', color: '#16a34a' }}>฿{Number(p.total_amount).toLocaleString()}</td>
                          <td style={{ padding: '12px 8px' }}>
                            {p.slip_url ? (
                              <img
                                src={p.slip_url.startsWith('http') ? p.slip_url : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${p.slip_url}`}
                                alt="สลิปโอนเงิน"
                                style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e2e8f0', cursor: 'pointer' }}
                                onClick={() => setSelectedSlip(p.slip_url!.startsWith('http') ? p.slip_url! : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/${p.slip_url}`)}
                              />
                            ) : (<span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>ไม่มี</span>)}
                          </td>
                          <td style={{ padding: '12px 8px' }}>{renderBadge(p.status)}</td>
                          <td style={{ padding: '12px 8px' }}>
                            {p.status === 'PAYMENT_SUBMITTED' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleConfirmPayment(p.id)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>✅ ยืนยัน</button>
                                <button onClick={() => handleRejectPayment(p.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>❌ ปฏิเสธ</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ==========================================
              BOOKINGS MENU (รายการจอง)
              ========================================== */}
            {activeMenu === 'bookings' && (
              <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '25px', width: '100%' }}>
                <h2 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '20px', fontWeight: 'bold' }}>รายการจองออฟไลน์ทั้งหมด</h2>
                {loadingBookings ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', width: '100%' }}>กำลังโหลดข้อมูลการจอง...</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>รหัสการจอง</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>ชื่อผู้จอง</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>คอร์สเรียน</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>สถานะ</th>
                        <th style={{ padding: '12px 0', fontWeight: '500', textAlign: 'right' }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>ไม่มีข้อมูลการจอง</td></tr>
                      ) : (
                        bookings.map((b, idx) => (
                          <tr key={b.id || idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem' }}>
                            <td style={{ padding: '12px 0' }}>{b.id?.substring(0, 8)}...</td>
                            <td style={{ padding: '12px 0' }}>
                              <div>{b.user_name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.user_email}</div>
                            </td>
                            <td style={{ padding: '12px 0' }}>{b.course_name}</td>
                            <td style={{ padding: '12px 0' }}>
                              {b.status === BStatus.CONFIRMED && <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>ยืนยันแล้ว</span>}
                              {b.status === BStatus.PENDING && <span style={{ background: '#fef08a', color: '#ca8a04', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>รอยืนยัน</span>}
                              {b.status === BStatus.CANCELLED && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>ยกเลิกแล้ว</span>}
                            </td>
                            <td style={{ padding: '12px 0', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              {/* ------------------------------- */}
                              {/* แก้ไข onClick ให้ทำงานเปิด Modal ได้ */}
                              {/* ------------------------------- */}
                              <button
                                onClick={() => {
                                  setSelectedBookingDetails(b);
                                  setIsBookingModalOpen(true);
                                }}
                                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                title="ดูรายละเอียดการจอง"
                              >
                                🔎
                              </button>
                              {b.status === BStatus.PENDING && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('ยืนยันอนุญาตการจองคอร์สนี้?')) {
                                      try {
                                        // เรียกใช้ API อัปเดต Mock
                                        await bookingAPI.confirmBooking(b.id);
                                        loadBookings();
                                      } catch (err) {
                                        alert('ยืนยันไม่สำเร็จ');
                                      }
                                    }
                                  }}
                                  style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  ✅ ยืนยัน
                                </button>
                              )}
                              {(b.status === BStatus.PENDING || b.status === BStatus.CONFIRMED) && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm('ยืนยันยกเลิกการจองนี้?')) {
                                      try {
                                        // เรียกใช้ API อัปเดต Mock
                                        await bookingAPI.cancelBooking(b.id);
                                        loadBookings();
                                      } catch (err) {
                                        alert('ยกเลิกไม่สำเร็จ');
                                      }
                                    }
                                  }}
                                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  ❌ ยกเลิก
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ==========================================
              SETTINGS MENU
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

      {/* ==========================================
          MODALS AREA
          ========================================== */}
      
      {/* Course Detail Modal */}
      {isModalOpen && selectedCourse && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ padding: '20px 30px', borderBottom: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>📋 รายละเอียดคอร์ส</h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <div style={{ padding: '30px' }}>
              <div style={{ marginBottom: '25px' }}>
                <img
                  src={selectedCourse.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                  alt={selectedCourse.title}
                  style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
                />
              </div>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>📚 ชื่อคอร์ส</label>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{selectedCourse.title}</div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>👨‍🏫 ผู้สอน</label>
                  <div style={{ color: '#0f172a' }}>{selectedCourse.instructor_name || selectedCourse.instructor?.full_name || 'ไม่ระบุ'}</div>
                </div>
                {selectedCourse.description && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>📝 คำอธิบาย</label>
                    <div style={{ color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{selectedCourse.description}</div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>💰 ราคา</label>
                    <div style={{ color: '#0f172a' }}>{selectedCourse.price ? `฿${selectedCourse.price.toLocaleString('th-TH')}` : 'ฟรี'}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>📊 ระดับ</label>
                    <div style={{ color: '#0f172a' }}>{selectedCourse.level || 'ไม่ระบุ'}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>🖥️ ออนไลน์</label>
                    <div style={{ color: '#0f172a' }}>{selectedCourse.is_online ? `✅ มี${selectedCourse.online_expiry ? ` (หมดอายุ ${selectedCourse.online_expiry} วัน)` : ''}` : '❌ ไม่มี'}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>🏫 ออนไซต์</label>
                    <div style={{ color: '#0f172a' }}>{selectedCourse.is_onsite ? `✅ มี (${selectedCourse.onsite_seats || '-'} ที่นั่ง)` : '❌ ไม่มี'}</div>
                  </div>
                </div>
                {selectedCourse.tags && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>🏷️ แท็ก</label>
                    <div style={{ color: '#0f172a' }}>{selectedCourse.tags}</div>
                  </div>
                )}
                {selectedCourse.video_url && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}>🎬 วีดีโอตัวอย่าง</label>
                    <video src={selectedCourse.video_url} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '200px' }} />
                  </div>
                )}
                {selectedCourse.rejection_reason && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#dc2626', marginBottom: '4px', fontWeight: 'bold' }}>❌ เหตุผลที่ปฏิเสธก่อนหน้า</label>
                    <div style={{ color: '#991b1b' }}>{selectedCourse.rejection_reason}</div>
                  </div>
                )}
                {courseLessons.length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}>📖 บทเรียน ({courseLessons.length} บท)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                      {courseLessons.map((lesson: any, idx: number) => (
                        <div key={lesson.id} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.9rem', color: '#334155' }}>
                          {idx + 1}. {lesson.topic_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {loadingLessons && <div style={{ color: '#64748b', textAlign: 'center' }}>⏳ กำลังโหลดบทเรียน...</div>}
              </div>
            </div>
            <div style={{ padding: '20px 30px', borderTop: '2px solid #e2e8f0', display: 'flex', gap: '12px', justifyContent: 'flex-end', background: '#f8fafc', flexWrap: 'wrap' }}>
              {(selectedCourse.status === CourseStatus.REQUEST_CREATE || selectedCourse.status === CourseStatus.PENDING_REVIEW) && (
                <>
                  <button
                    onClick={() => handleRejectCourse(selectedCourse.id, selectedCourse.status)}
                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ❌ ปฏิเสธ
                  </button>
                  <button
                    onClick={() => { handleApproveCourse(selectedCourse.id, selectedCourse.status); closeModal(); }}
                    style={{ background: '#22c55e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    ✅ อนุมัติ
                  </button>
                </>
              )}
              <button onClick={closeModal} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>ปิด</button>
            </div>
          </div>
        </div>
      )}

      {/* Select Course for Exam Modal */}
      {isExamCourseModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>เลือกคอร์สเพื่อสร้างชุดข้อสอบ</h2>
              <button onClick={() => setIsExamCourseModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {adminCourses.map(course => (
                <div key={course.id} onClick={() => navigate(`/exam-management/${course.id}`)} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', marginBottom: '10px' }}>
                  <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'} alt="" style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flex: 1 }}><h4 style={{ margin: 0, color: '#0f172a' }}>{course.title}</h4></div>
                  <div style={{ color: '#3b82f6' }}>▶</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slip Viewer Modal */}
      {selectedSlip && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }} onClick={() => setSelectedSlip(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '15px', maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>สลิปโอนเงิน</h3>
              <button onClick={() => setSelectedSlip(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>✕</button>
            </div>
            <img src={selectedSlip} alt="สลิปโอนเงินแบบเต็ม" style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {isBookingModalOpen && selectedBookingDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }} onClick={() => setIsBookingModalOpen(false)}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '600px', width: '100%', padding: '25px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '15px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>รายละเอียดการจอง</h2>
              <button onClick={() => setIsBookingModalOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', fontSize: '0.95rem' }}>
              <div style={{ color: '#64748b', fontWeight: 'bold' }}>รหัสการจอง:</div>
              <div style={{ color: '#0f172a' }}>{selectedBookingDetails.id}</div>
              
              <div style={{ color: '#64748b', fontWeight: 'bold' }}>ชื่อผู้จอง:</div>
              <div style={{ color: '#0f172a' }}>{selectedBookingDetails.user_name}</div>
              
              <div style={{ color: '#64748b', fontWeight: 'bold' }}>อีเมล:</div>
              <div style={{ color: '#0f172a' }}>{selectedBookingDetails.user_email}</div>
              
              <div style={{ color: '#64748b', fontWeight: 'bold' }}>คอร์สเรียน:</div>
              <div style={{ color: '#0f172a' }}>{selectedBookingDetails.course_name}</div>
              
              <div style={{ color: '#64748b', fontWeight: 'bold' }}>รูปแบบ:</div>
              <div style={{ color: '#0f172a' }}>{selectedBookingDetails.learning_mode}</div>
              
              <div style={{ color: '#64748b', fontWeight: 'bold' }}>วันที่จอง:</div>
              <div style={{ color: '#0f172a' }}>{new Date(selectedBookingDetails.created_at || Date.now()).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
              <button onClick={() => setIsBookingModalOpen(false)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
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