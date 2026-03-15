import React, { useState, useEffect } from 'react';
import {
  Search, User, Settings, CreditCard, BookOpen, FileText, Home, Users,
  ArrowUp, MonitorPlay, LogOut, ChevronLeft, Video, File
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
import bookingAPI, { BookingStatus as BStatus } from '../api/bookingAPI';
import examAPI, { type Exam } from '../api/examAPI';
import userAPI, { type DashboardStats } from '../api/userAPI';

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
  // Course Management State (เชื่อมกับ API)
  // ==========================================
  const [adminCourses, setAdminCourses] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedCourse, setSelectedCourse] = useState<APICourse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Payment state
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Booking state
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Exam state
  const [adminExams, setAdminExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [isExamCourseModalOpen, setIsExamCourseModalOpen] = useState(false);

  // Dashboard Stats state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch all courses on mount
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        // Fetch courses from all statuses for admin
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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    const fetchDashboardStats = async () => {
      setLoadingStats(true);
      try {
        const res = await userAPI.getDashboardStats();
        setDashboardStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchAllCourses();
    fetchDashboardStats();
    loadPayments(); // To calculate revenue on dashboard
    loadBookings(); // To calculate seat quota on dashboard
  }, []);

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
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadBookings = async () => {
    setLoadingBookings(true);
    try {
      const res = await bookingAPI.getAllBookings();
      setBookings(res.data.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadExams = async () => {
    setLoadingExams(true);
    try {
      const res = await examAPI.getAllExams();
      setAdminExams(res.data.data);
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleDeleteExam = async (id: string, title: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบข้อสอบ "${title}"?\nหากลบแล้วจะไม่สามารถกู้คืนได้`)) {
      try {
        await examAPI.deleteExam(id);
        alert('ลบข้อสอบสำเร็จ');
        loadExams(); // Refresh list after delete
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
      console.error('Error approving course:', error);
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
      console.error('Error rejecting course:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการปฏิเสธ');
    }
  };

  const openCourseDetailModal = async (course: APICourse) => {
    setSelectedCourse(course);
    setIsModalOpen(true);

    // Load lessons for this course
    setLoadingLessons(true);
    try {
      const response = await courseAPI.getLessonsByCourse(course.id);
      console.log('📚 Loaded lessons:', response.data.data);
      response.data.data?.forEach((lesson, index) => {
        console.log(`  Lesson ${index + 1}:`, {
          topic: lesson.topic_name,
          video_url: lesson.video_url,
          pdf_url: lesson.pdf_url
        });
      });
      setCourseLessons(response.data.data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
      setCourseLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleDeleteCourse = async (id: string, title: string, status: CourseStatus) => {
    // ถ้าเป็นคอร์สที่เปิดขายแล้ว ไม่อนุญาตให้ลบ
    if (status === CourseStatus.PUBLISHED) {
      alert('ไม่สามารถลบคอร์สที่เปิดขายแล้ว\nกรุณาใช้ปุ่ม "ปิดการใช้งาน" แทน');
      return;
    }

    const confirmDelete = window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคอร์ส "${title}"?\n\nการลบคอร์สจะลบข้อมูลทั้งหมดรวมถึงบทเรียน แบบทดสอบ และข้อมูลนักเรียนที่ลงทะเบียน`);

    if (!confirmDelete) return;

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
    const action = currentActive ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน';
    const confirmToggle = window.confirm(`คุณต้องการ${action}คอร์ส "${title}" หรือไม่?\n\n${currentActive ? 'คอร์สจะไม่แสดงในหน้ารวมคอร์สอีกต่อไป' : 'คอร์สจะกลับมาแสดงในหน้ารวมคอร์สอีกครั้ง'}`);

    if (!confirmToggle) return;

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

  const handleApproveFromModal = async () => {
    if (!selectedCourse) return;
    await handleApproveCourse(selectedCourse.id, selectedCourse.status);
    closeModal();
  };

  const handleRejectFromModal = async () => {
    if (!selectedCourse) return;
    await handleRejectCourse(selectedCourse.id, selectedCourse.status);
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
    <div className="page-container" style={{ background: '#f1f5f9', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

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

              <li onClick={() => { setActiveMenu('exams'); loadExams(); }} style={{ ...sidebarItemStyle, background: activeMenu === 'exams' ? '#2c5282' : 'transparent', borderLeft: activeMenu === 'exams' ? '4px solid #60a5fa' : '4px solid transparent' }}>
                <FileText size={20} /> คลังข้อสอบ
              </li>

              <li onClick={() => { setActiveMenu('bookings'); loadBookings(); }} style={{ ...sidebarItemStyle, background: activeMenu === 'bookings' ? '#2c5282' : 'transparent', borderLeft: activeMenu === 'bookings' ? '4px solid #60a5fa' : '4px solid transparent' }}>
                <BookOpen size={20} /> รายการจองออฟไลน์
              </li>

              <li onClick={() => { setActiveMenu('finance'); loadPayments(); }} style={{ ...sidebarItemStyle, background: activeMenu === 'finance' ? '#2c5282' : 'transparent', borderLeft: activeMenu === 'finance' ? '4px solid #60a5fa' : '4px solid transparent' }}>
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
                {/* Stats Cards Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                  {/* Revenue Card */}
                  <div style={cardStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>รายรับรวม (ตลอดกาล)</p>
                      <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#0f172a', fontWeight: '800' }}>฿{totalRevenue.toLocaleString('th-TH')}</h2>
                    </div>
                    <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '12px' }}>
                      <ArrowUp size={24} color="#16a34a" />
                    </div>
                  </div>

                  {/* Users Card */}
                  <div style={cardStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>นักเรียนทั้งหมด</p>
                      <h2 style={{ fontSize: '1.8rem', margin: 0, color: '#0f172a', fontWeight: '800' }}>{totalStudents.toLocaleString('th-TH')} <span style={{ fontSize: '1rem', color: '#64748b' }}>คน</span></h2>
                    </div>
                    <div style={{ background: '#e0f2fe', padding: '12px', borderRadius: '12px' }}>
                      <Users size={24} color="#0284c7" />
                    </div>
                  </div>

                  {/* Courses Card */}
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

                  {/* Quota Card */}
                  <div style={cardStyle}>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 'bold' }}>ที่นั่ง Onsite (ว่าง)</p>
                      <h2 style={{ fontSize: '1.5rem', margin: 0, color: '#ea580c', fontWeight: '800' }}>{availableOnsiteSeats}/{totalOnsiteQuota} <span style={{ fontSize: '1rem', color: '#64748b' }}>ที่นั่ง</span></h2>
                    </div>
                    <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px' }}>
                      <User size={24} color="#d97706" />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>

                  {/* Line Chart */}
                  <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '20px' }}>
                      <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: 0 }}>ยอดขายรับรวม (บาท)</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#64748b' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6' }}></div> รายได้
                      </div>
                    </div>
                    <div style={{ width: '100%', height: '220px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={realRevenueData}>
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
                        <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>{totalTeachersCount} ท่าน</p>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#334155' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: COLORS[0] }}></div> อาจารย์ทั้งหมด : {totalTeachersCount} ท่าน
                        </div>
                      </div>
                      <div style={{ width: '100px', height: '100px' }}>
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

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳</div>
                    <div>กำลังโหลดข้อมูลคอร์ส...</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                    {/* Section 1: รออนุมัติสร้างคอร์ส */}
                    <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ width: '100%', borderBottom: '2px solid #fef08a', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#a16207', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          ⏳ คำขอเปิดคอร์สใหม่ (รออนุมัติ)
                        </h3>
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
                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
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
                        <h3 style={{ fontSize: '1.1rem', color: '#c2410c', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          🚀 คำขอเปิดขายคอร์ส (รอตรวจสอบเนื้อหา)
                        </h3>
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
                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
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

                    {/* Section 3: คอร์สที่กำลังใส่เนื้อหา (Drafting) */}
                    <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ width: '100%', borderBottom: '2px solid #e0e7ff', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#4338ca', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          ✍️ คอร์สที่กำลังใส่เนื้อหา ({adminCourses.filter(c => c.status === CourseStatus.DRAFTING).length} คอร์ส)
                        </h3>
                      </div>

                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {adminCourses.filter(c => c.status === CourseStatus.DRAFTING).length === 0 ? (
                          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>ไม่มีคอร์สที่กำลังร่าง</p>
                        ) : (
                          adminCourses
                            .filter(c => c.status === CourseStatus.DRAFTING)
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map(course => (
                              <div key={course.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', alignItems: 'center', background: '#f8fafc' }}>
                                <img
                                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                                  alt={course.title}
                                  style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{course.title}</h4>
                                    <span style={{
                                      fontSize: '0.75rem',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      background: '#e0e7ff',
                                      color: '#4338ca',
                                      fontWeight: 'bold'
                                    }}>
                                      📝 ร่าง
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                    ผู้สอน: {course.instructor_name || course.instructor?.full_name || 'ไม่ระบุ'} •
                                    ราคา: {course.price ? `฿${course.price.toLocaleString('th-TH')}` : 'ฟรี'}
                                    {!course.is_active && <span style={{ color: '#ef4444', fontWeight: 'bold' }}> • ปิดการใช้งาน</span>}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button
                                    onClick={() => openCourseDetailModal(course)}
                                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                                  >
                                    📋 ดูรายละเอียด
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCourse(course.id, course.title, course.status)}
                                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                                  >
                                    🗑️ ลบ
                                  </button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    {/* Section 4: คอร์สที่เปิดขายแล้ว (Published) */}
                    <div style={{ ...cardStyle, flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ width: '100%', borderBottom: '2px solid #bbf7d0', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '1.1rem', color: '#15803d', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          🛒 คอร์สที่เปิดขายแล้ว (Published) ({adminCourses.filter(c => c.status === CourseStatus.PUBLISHED).length} คอร์ส)
                        </h3>
                      </div>

                      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {adminCourses.filter(c => c.status === CourseStatus.PUBLISHED).length === 0 ? (
                          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>ยังไม่มีคอร์สที่เปิดขาย</p>
                        ) : (
                          adminCourses
                            .filter(c => c.status === CourseStatus.PUBLISHED)
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map(course => (
                              <div key={course.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', alignItems: 'center', background: '#f0fdf4' }}>
                                <img
                                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                                  alt={course.title}
                                  style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{course.title}</h4>
                                    <span style={{
                                      fontSize: '0.75rem',
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      background: '#dcfce7',
                                      color: '#15803d',
                                      fontWeight: 'bold'
                                    }}>
                                      🌐 เปิดขาย
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                                    ผู้สอน: {course.instructor_name || course.instructor?.full_name || 'ไม่ระบุ'} •
                                    ราคา: {course.price ? `฿${course.price.toLocaleString('th-TH')}` : 'ฟรี'} •
                                    นักเรียน: {course.students_enrolled || 0} คน
                                    {!course.is_active && <span style={{ color: '#ef4444', fontWeight: 'bold' }}> • ปิดการใช้งาน</span>}
                                  </p>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button
                                    onClick={() => openCourseDetailModal(course)}
                                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
                                  >
                                    📋 ดูรายละเอียด
                                  </button>
                                  <button
                                    onClick={() => handleToggleCourseActive(course.id, course.title, course.is_active)}
                                    style={{
                                      background: course.is_active ? '#f59e0b' : '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      padding: '8px 20px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontWeight: 'bold',
                                      fontSize: '0.9rem'
                                    }}
                                  >
                                    {course.is_active ? '⏸️ ปิดการใช้งาน' : '▶️ เปิดการใช้งาน'}
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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={loadExams}
                      style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      🔄 โหลดข้อมูล
                    </button>
                    <button 
                      onClick={() => setIsExamCourseModalOpen(true)}
                      style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      + สร้างชุดข้อสอบ
                    </button>
                  </div>
                </div>

                {loadingExams ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', width: '100%' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳</div>
                    <div>กำลังโหลดข้อมูลข้อสอบ...</div>
                  </div>
                ) : adminExams.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', width: '100%' }}>
                    ยังไม่มีข้อสอบในระบบ
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 10px', fontWeight: '500' }}>วันที่สร้าง</th>
                        <th style={{ padding: '12px 10px', fontWeight: '500' }}>ชื่อชุดข้อสอบ</th>
                        <th style={{ padding: '12px 10px', fontWeight: '500' }}>คอร์สที่เกี่ยวข้อง</th>
                        <th style={{ padding: '12px 10px', fontWeight: '500' }}>ประเภท</th>
                        <th style={{ padding: '12px 10px', fontWeight: '500' }}>คะแนนเต็ม</th>
                        <th style={{ padding: '12px 10px', fontWeight: '500', textAlign: 'right' }}>การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminExams.map((e) => (
                        <tr key={e.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem' }}>
                          <td style={{ padding: '12px 10px' }}>{new Date(e.created_at).toLocaleDateString('th-TH')}</td>
                          <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>{e.title}</td>
                          <td style={{ padding: '12px 10px' }}>{e.course_name}</td>
                          <td style={{ padding: '12px 10px' }}>
                            <span style={{ 
                              background: e.type === 'PRETEST' ? '#fef08a' : e.type === 'POSTTEST' ? '#bbf7d0' : '#e0e7ff',
                              color: e.type === 'PRETEST' ? '#ca8a04' : e.type === 'POSTTEST' ? '#16a34a' : '#4338ca',
                              padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' 
                            }}>
                              {e.type}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px' }}>{e.total_score} คะแนน</td>
                          <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => navigate(`/exam-management/${e.course_id}`)}
                                  style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                >
                                  จัดการ
                                </button>
                                <button
                                  onClick={() => handleDeleteExam(e.id, e.title)}
                                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                                >
                                  ลบ
                                </button>
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
                  <button
                    onClick={loadPayments}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🔄 โหลดข้อมูล
                  </button>
                </div>

                {loadingPayments ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', width: '100%' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳</div>
                    <div>กำลังโหลดข้อมูล...</div>
                  </div>
                ) : payments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', width: '100%' }}>
                    ยังไม่มีรายการชำระเงิน
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 8px', fontWeight: '500' }}>ชื่อผู้ชำระ</th>
                        <th style={{ padding: '12px 8px', fontWeight: '500' }}>คอร์สที่ซื้อ</th>
                        <th style={{ padding: '12px 8px', fontWeight: '500' }}>วันที่</th>
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
                          <td style={{ padding: '12px 8px' }}>
                            {p.course_titles.map((title, i) => (
                              <div key={i} style={{ fontSize: '0.85rem', color: '#0f172a' }}>• {title}</div>
                            ))}
                          </td>
                          <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                            {new Date(p.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </td>
                          <td style={{ padding: '12px 8px', fontWeight: '600', color: '#16a34a', whiteSpace: 'nowrap' }}>
                            ฿{Number(p.total_amount).toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            {p.slip_url ? (
                              <a href={p.slip_url} target="_blank" rel="noopener noreferrer" title="ดูสลิปโอนเงิน">
                                <img
                                  src={p.slip_url}
                                  alt="สลิปโอนเงิน"
                                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e2e8f0', cursor: 'pointer' }}
                                />
                              </a>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>ไม่มี</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            {p.status === 'CONFIRMED' && (
                              <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>ยืนยันแล้ว</span>
                            )}
                            {p.status === 'PAYMENT_SUBMITTED' && (
                              <span style={{ background: '#fef08a', color: '#ca8a04', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>รอตรวจสอบ</span>
                            )}
                            {p.status === 'PENDING_PAYMENT' && (
                              <span style={{ background: '#e2e8f0', color: '#64748b', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>รอชำระ</span>
                            )}
                            {p.status === 'REJECTED' && (
                              <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>ปฏิเสธ</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            {p.status === 'PAYMENT_SUBMITTED' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleConfirmPayment(p.id)}
                                  style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                                >
                                  ✅ ยืนยัน
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(p.id)}
                                  style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                                >
                                  ❌ ปฏิเสธ
                                </button>
                              </div>
                            )}
                            {p.status === 'CONFIRMED' && (
                              <span style={{ color: '#16a34a', fontSize: '0.85rem' }}>เข้าถึงได้แล้ว</span>
                            )}
                            {p.status === 'REJECTED' && (
                              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{p.reject_reason || '-'}</span>
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
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', width: '100%' }}>
                    กำลังโหลดข้อมูลการจอง...
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#64748b', fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>รหัสการจอง</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>ชื่อผู้จอง</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>คอร์สเรียน</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>รูปแบบ</th>
                        <th style={{ padding: '12px 0', fontWeight: '500' }}>สถานะ</th>
                        <th style={{ padding: '12px 0', fontWeight: '500', textAlign: 'right' }}>จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>ไม่มีข้อมูลการจอง</td>
                        </tr>
                      ) : (
                        bookings.map((b, idx) => (
                          <tr key={b.id || idx} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.9rem' }}>
                            <td style={{ padding: '12px 0' }}>{b.id?.substring(0, 8)}...</td>
                            <td style={{ padding: '12px 0' }}>
                              <div>{b.user_name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{b.user_email}</div>
                            </td>
                            <td style={{ padding: '12px 0' }}>{b.course_name}</td>
                            <td style={{ padding: '12px 0' }}>{b.learning_mode}</td>
                            <td style={{ padding: '12px 0' }}>
                              {b.status === BStatus.CONFIRMED && <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>ยืนยันแล้ว</span>}
                              {b.status === BStatus.PENDING && <span style={{ background: '#fef08a', color: '#ca8a04', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>รอยืนยัน</span>}
                              {b.status === BStatus.CANCELLED && <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>ยกเลิกแล้ว</span>}
                              {b.status === BStatus.COMPLETED && <span style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>เสร็จสิ้น</span>}
                            </td>
                            <td style={{ padding: '12px 0', textAlign: 'right', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => {
                                  setSelectedBookingDetails(b);
                                  setIsBookingModalOpen(true);
                                }}
                                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)' }}
                                title="ดูรายละเอียดการจอง"
                              >
                                🔎
                              </button>
                              {b.status === BStatus.PENDING && (
                                <button
                                  onClick={async () => {
                                    if (confirm('ยืนยันอนุญาตการจองคอร์สนี้?')) {
                                      try {
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
                                    if (confirm('ยืนยันยกเลิกการจองนี้?')) {
                                      try {
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

      {/* Course Detail Modal */}
      {isModalOpen && selectedCourse && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

            {/* Modal Header */}
            <div style={{ padding: '20px 30px', borderBottom: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#0f172a' }}>📋 รายละเอียดคอร์ส</h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '30px' }}>

              {/* Course Image */}
              <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                <img
                  src={selectedCourse.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
                  alt={selectedCourse.title}
                  style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
                />
              </div>

              {/* Course Info Grid */}
              <div style={{ display: 'grid', gap: '20px' }}>

                {/* Title & Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px', fontWeight: 'bold' }}>📚 ชื่อคอร์ส</label>
                  <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#0f172a' }}>{selectedCourse.title}</div>
                </div>

                {selectedCourse.description && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px', fontWeight: 'bold' }}>📝 รายละเอียด</label>
                    <div style={{ padding: '15px', background: '#f8fafc', borderRadius: '8px', color: '#334155', lineHeight: '1.6' }}>{selectedCourse.description}</div>
                  </div>
                )}

                {/* Instructor & Price */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px', fontWeight: 'bold' }}>👨‍🏫 ผู้สอน</label>
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', color: '#0f172a', fontWeight: '500' }}>{selectedCourse.instructor_name || selectedCourse.instructor?.full_name || 'ไม่ระบุ'}</div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px', fontWeight: 'bold' }}>💰 ราคา</label>
                    <div style={{ padding: '12px', background: '#dcfce7', borderRadius: '8px', color: '#15803d', fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedCourse.price ? `฿${selectedCourse.price.toLocaleString()}` : 'ฟรี'}</div>
                  </div>
                </div>

                {/* Tags */}
                {selectedCourse.tags && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}>🏷️ แท็ก</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedCourse.tags.split(',').map((tag, idx) => (
                        <span key={idx} style={{ background: '#dbeafe', color: '#1e40af', padding: '6px 12px', borderRadius: '20px' }}>{tag.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}>📍 รูปแบบการเรียน</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {selectedCourse.is_online && (
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>🌐 ออนไลน์</span>
                    )}
                    {selectedCourse.is_onsite && (
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>🏫 On-site</span>
                    )}
                  </div>
                </div>

                {/* Onsite Details */}
                {selectedCourse.is_onsite && (
                  <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '10px', border: '2px solid #fde68a' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#92400e', fontSize: '1rem' }}>🏫 รายละเอียดคอร์ส On-site</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      {selectedCourse.onsite_seats && (
                        <div>
                          <label style={{ fontSize: '0.8rem', color: '#78716c' }}>จำนวนที่นั่ง</label>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedCourse.onsite_seats} คน</div>
                        </div>
                      )}
                      {selectedCourse.onsite_schedule && selectedCourse.onsite_schedule.length > 0 && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.8rem', color: '#78716c' }}>วันและเวลาเรียนแต่ละสัปดาห์</label>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>
                            {selectedCourse.onsite_schedule.map((s: {day: string; time_start: string; time_end: string}, idx: number) => (
                              <div key={idx}>• {s.day}: {s.time_start.slice(0, 5)} - {s.time_end.slice(0, 5)} น.</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedCourse.onsite_duration && (
                        <div>
                          <label style={{ fontSize: '0.8rem', color: '#78716c' }}>ระยะเวลา</label>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedCourse.onsite_duration} สัปดาห์</div>
                        </div>
                      )}
                      {selectedCourse.onsite_exam_schedule && (
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ fontSize: '0.8rem', color: '#78716c' }}>กำหนดสอบ</label>
                          <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{selectedCourse.onsite_exam_schedule}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Online Details */}
                {selectedCourse.is_online && selectedCourse.online_expiry && (
                  <div style={{ background: '#eff6ff', padding: '15px', borderRadius: '10px', border: '2px solid #bfdbfe' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#1e40af', marginBottom: '5px' }}>⏰ ระยะเวลาเข้าถึงคอร์สออนไลน์</label>
                    <div style={{ fontWeight: 'bold', color: '#1e3a8a', fontSize: '1.1rem' }}>{selectedCourse.online_expiry} เดือน</div>
                  </div>
                )}

                {/* Course Lessons Section */}
                {(selectedCourse.status === CourseStatus.PENDING_REVIEW || selectedCourse.status === CourseStatus.DRAFTING) && (
                  <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '2px solid #86efac' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#15803d', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={20} />
                      📚 เนื้อหาบทเรียน ({courseLessons.length} รายการ)
                    </h4>

                    {loadingLessons ? (
                      <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                        กำลังโหลดบทเรียน...
                      </div>
                    ) : courseLessons.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', background: '#fef3c7', borderRadius: '8px' }}>
                        ⚠️ ยังไม่มีเนื้อหาบทเรียน
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                        {courseLessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            style={{
                              background: 'white',
                              padding: '15px',
                              borderRadius: '8px',
                              border: '1px solid #d1fae5',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>
                                  บทเรียนที่ {lesson.sequence_order || index + 1}
                                </div>
                                  <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '0.95rem' }}>
                                    {lesson.topic_name.includes(' - ') ? (
                                      <>
                                        <span style={{ color: '#3b82f6', marginRight: '8px' }}>
                                          {lesson.topic_name.split(' - ')[0]}
                                        </span>
                                        <span style={{ color: '#64748b', fontSize: '0.8rem', marginRight: '8px' }}>|</span>
                                        <span style={{ color: '#0f172a' }}>
                                          {lesson.topic_name.split(' - ').slice(1).join(' - ')}
                                        </span>
                                      </>
                                    ) : (
                                      lesson.topic_name
                                    )}
                                  </div>
                              </div>
                            </div>

                            {/* Files Section */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                              {lesson.video_url && lesson.video_url.trim() && (
                                <a
                                  href={lesson.video_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    background: '#dbeafe',
                                    color: '#1e40af',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    border: '1px solid #93c5fd',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#bfdbfe';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#dbeafe';
                                  }}
                                >
                                  <Video size={16} />
                                  <span>📹 วีดีโอ</span>
                                </a>
                              )}

                              {lesson.pdf_url && lesson.pdf_url.trim() && (
                                <a
                                  href={lesson.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    background: '#fef3c7',
                                    color: '#92400e',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    border: '1px solid #fde68a',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fde68a';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#fef3c7';
                                  }}
                                >
                                  <File size={16} />
                                  <span>📑 PDF</span>
                                </a>
                              )}

                              {/* แสดงสถานะไฟล์ที่ไม่มี */}
                              {(!lesson.video_url || !lesson.video_url.trim()) && (
                                <div style={{
                                  fontSize: '0.85rem',
                                  color: '#ef4444',
                                  padding: '8px 12px',
                                  background: '#fee2e2',
                                  borderRadius: '6px',
                                  border: '1px solid #fca5a5',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  ❌ ไม่มีวีดีโอ
                                </div>
                              )}

                              {(!lesson.pdf_url || !lesson.pdf_url.trim()) && (
                                <div style={{
                                  fontSize: '0.85rem',
                                  color: '#f59e0b',
                                  padding: '8px 12px',
                                  background: '#fef3c7',
                                  borderRadius: '6px',
                                  border: '1px solid #fcd34d',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  ⚠️ ไม่มี PDF
                                </div>
                              )}
                            </div>

                            {lesson.content && (
                              <div style={{
                                marginTop: '10px',
                                padding: '10px',
                                background: '#f8fafc',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                color: '#475569',
                                lineHeight: '1.5'
                              }}>
                                {lesson.content}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Status Badge */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', fontWeight: 'bold' }}>📊 สถานะ</label>
                  <div>
                    {selectedCourse.status === CourseStatus.REQUEST_CREATE && (
                      <span style={{ background: '#fef08a', color: '#854d0e', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'inline-block' }}>⏳ รออนุมัติสร้างคอร์ส</span>
                    )}
                    {selectedCourse.status === CourseStatus.PENDING_REVIEW && (
                      <span style={{ background: '#fed7aa', color: '#9a3412', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', display: 'inline-block' }}>🚀 รออนุมัติวางขาย</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Action Buttons */}
            <div style={{ padding: '20px 30px', borderTop: '2px solid #e2e8f0', display: 'flex', gap: '15px', justifyContent: 'flex-end', background: '#f8fafc' }}>
              <button
                onClick={closeModal}
                style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleRejectFromModal}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}
              >
                ❌ ปฏิเสธ
              </button>
              <button
                onClick={handleApproveFromModal}
                style={{ background: '#22c55e', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}
              >
                ✅ อนุมัติ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {isBookingModalOpen && selectedBookingDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ padding: '24px 30px', borderBottom: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', borderRadius: '16px 16px 0 0' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'white', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={24} color="#38bdf8" />
                รายละเอียดการจอง
              </h2>
              <button 
                onClick={() => { setIsBookingModalOpen(false); setSelectedBookingDetails(null); }} 
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: 'white', padding: '8px', borderRadius: '8px', display: 'flex', transition: 'background 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                ✕
              </button>
            </div>
            
            <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>รหัสการจอง (ID)</label>
                  <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: '500', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', wordBreak: 'break-all' }}>
                    {selectedBookingDetails.id}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>สถานะ</label>
                  <div style={{ fontSize: '1rem', fontWeight: '500', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                    {selectedBookingDetails.status === BStatus.CONFIRMED && <span style={{ color: '#16a34a' }}>✅ ยืนยันแล้ว</span>}
                    {selectedBookingDetails.status === BStatus.PENDING && <span style={{ color: '#ca8a04' }}>⏳ รอยืนยัน</span>}
                    {selectedBookingDetails.status === BStatus.CANCELLED && <span style={{ color: '#ef4444' }}>❌ ยกเลิกแล้ว</span>}
                    {selectedBookingDetails.status === BStatus.COMPLETED && <span style={{ color: '#2563eb' }}>🎓 เสร็จสิ้น</span>}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>รูปแบบการเรียน</label>
                 <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: '500', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {selectedBookingDetails.learning_mode}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>คอร์สเรียน</label>
                <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: '500', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {selectedBookingDetails.course_name}
                </div>
              </div>

              {/* แสดงรอบเวลาเรียน ถ้ามีข้อมูล */}
              {selectedBookingDetails.schedule_start_time && selectedBookingDetails.schedule_end_time && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>รอบเวลาเรียน</label>
                  <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: '500', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    📅 {new Date(selectedBookingDetails.schedule_start_time).toLocaleDateString('th-TH', { 
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
                       })}
                    <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                    🕐 {new Date(selectedBookingDetails.schedule_start_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    {' - '}
                    {new Date(selectedBookingDetails.schedule_end_time).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    
                    {selectedBookingDetails.room_location && (
                      <span style={{ marginLeft: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                        (📍 ห้อง: {selectedBookingDetails.room_location})
                      </span>
                    )}
                  </div>
                </div>
              )}

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>ชื่อผู้จอง</label>
                   <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: '500', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {selectedBookingDetails.user_name}
                  </div>
                 </div>
                 <div>
                   <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>อีเมล</label>
                   <div style={{ fontSize: '1rem', color: '#0f172a', fontWeight: '500', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', wordBreak: 'break-word' }}>
                    {selectedBookingDetails.user_email}
                  </div>
                 </div>
              </div>

              {selectedBookingDetails.notes && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>หมายเหตุ (จากผู้เรียน)</label>
                  <div style={{ fontSize: '0.95rem', color: '#334155', background: '#fffbeb', padding: '14px', borderRadius: '8px', border: '1px solid #fde68a', lineHeight: '1.5' }}>
                    {selectedBookingDetails.notes}
                  </div>
                </div>
              )}

              {selectedBookingDetails.created_at && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>วันที่สร้างรายการ</label>
                  <div style={{ fontSize: '0.95rem', color: '#475569', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {new Date(selectedBookingDetails.created_at).toLocaleString('th-TH')}
                  </div>
                </div>
              )}
            </div>

             <div style={{ padding: '20px 30px', borderTop: '2px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', background: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
              <button
                onClick={() => { setIsBookingModalOpen(false); setSelectedBookingDetails(null); }}
                style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }}
              >
                ปิดหน้าต่าง
              </button>
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
              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>กำลังโหลดรายวิชา...</div>
              ) : adminCourses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>ยังไม่มีรายวิชาในระบบ ขอให้สร้างรายวิชาก่อน</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  {adminCourses.map(course => (
                    <div 
                      key={course.id} 
                      onClick={() => navigate(`/exam-management/${course.id}`)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', 
                        border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
                        transition: 'all 0.2s', background: '#fff' 
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.background = '#eff6ff';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      <img 
                        src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'} 
                        alt="" 
                        style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
                      />
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#0f172a' }}>{course.title}</h4>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '10px' }}>
                          <span>ผู้สอน: {course.instructor_name || 'ไม่ระบุ'}</span>
                          <span>|</span>
                          <span style={{ color: course.status === CourseStatus.PUBLISHED ? '#16a34a' : '#f59e0b' }}>
                            {course.status === CourseStatus.PUBLISHED ? 'เปิดขายแล้ว' : 'แบบร่าง/รอตรวจ'}
                          </span>
                        </div>
                      </div>
                      <div style={{ color: '#3b82f6' }}>▶</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
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
