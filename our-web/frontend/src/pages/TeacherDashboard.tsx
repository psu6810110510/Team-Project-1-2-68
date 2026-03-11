/* ไฟล์: src/pages/TeacherDashboard.tsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, LogOut, Edit3, Camera, ChevronLeft,
  PlusCircle, Clock, AlertCircle, CheckCircle, BookOpen, X,
  Image as ImageIcon, Video, Edit2, Check, Bell
} from 'lucide-react';
import '../styles/LoginTheme.css';
import '../styles/ProfileTheme.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { courseAPI, CourseStatus, type Course as APICourse } from '../api/courseAPI';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('profile');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<APICourse | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [videoObjUrl, setVideoObjUrl] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  
  // Content Management State
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [contentCourse, setContentCourse] = useState<APICourse | null>(null);
  const [lessons, setLessons] = useState<Array<{
    id?: string;
    topic_name: string;
    subLessons: Array<{
      id?: string;
      title: string;
      content: string;
      video_url: string;
      pdf_url: string;
      videoFile?: File;
    }>;
  }>>([]);
  
  // Notification State
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

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
      } catch (e) { }
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
      } catch (e) { }
    }

    if (token) {
      try {
        // ✅ เปลี่ยนเป็นใช้ API_URL
        await fetch(`${API_URL}/auth/profile`, {
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
          } catch (e) { }
        }

        if (token) {
          try {
             // ✅ เปลี่ยนเป็นใช้ API_URL
            await fetch(`${API_URL}/auth/profile`, {
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
         // ✅ เปลี่ยนเป็นใช้ API_URL
        const response = await fetch(`${API_URL}/auth/change-password`, {
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
  // 2. ระบบคอร์สเรียน (เชื่อมกับ API)
  // ==========================================
  const [myCourses, setMyCourses] = useState<APICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Fetch user ID and courses on mount
  useEffect(() => {
    const fetchUserAndCourses = async () => {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          const userObj = JSON.parse(user);
          setCurrentUserId(userObj.id);
          
          // Fetch courses by instructor
          const response = await courseAPI.getCoursesByInstructor(userObj.id);
          setMyCourses(response.data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoading(false);
      }
    };

    fetchUserAndCourses();
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isNotificationOpen && !target.closest('[data-notification]')) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  const requestedCourses = myCourses.filter(c => c.status === CourseStatus.REQUEST_CREATE);
  const draftingCourses = myCourses.filter(c => c.status === CourseStatus.DRAFTING);
  const pendingReviewCourses = myCourses.filter(c => c.status === CourseStatus.PENDING_REVIEW);
  const publishedCourses = myCourses.filter(c => c.status === CourseStatus.PUBLISHED);
  
  // Filter out read notifications for rejected courses
  const unreadRejectedCourses = myCourses
    .filter(c => c.status === CourseStatus.REJECTED)
    .filter(c => !readNotifications.has(c.id));
  const unreadNotifications = unreadRejectedCourses.length;

  // Mark notification as read
  const markAsRead = (courseId: string) => {
    const newReadNotifications = new Set(readNotifications);
    newReadNotifications.add(courseId);
    setReadNotifications(newReadNotifications);
    localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]));
  };

  const initialFormState = {
    title: '',
    instructor: `อ.${teacherData.firstName} ${teacherData.lastName}`,
    description: '', price: '', tags: '',
    isOnsite: true, onsiteSeats: '', onsiteDays: [] as string[], onsiteTimeStart: '', onsiteTimeEnd: '', onsiteDuration: '', onsiteExamSchedule: '',
    isOnline: true, onlineExpiry: ''
  };

  const [courseForm, setCourseForm] = useState(initialFormState);

  useEffect(() => {
    setCourseForm(prev => ({ ...prev, instructor: `อ.${teacherData.firstName} ${teacherData.lastName}` }));
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

  // ฟังก์ชันบีบอัดรูปภาพ
  const compressImage = (file: File, maxWidth: number = 400, quality: number = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // คำนวณขนาดใหม่โดยรักษาอัตราส่วน
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // บีบอัดรูปภาพก่อนแสดง preview
        const compressedImage = await compressImage(file);
        setImagePreview(compressedImage);
      } catch (error) {
        console.error('Error compressing image:', error);
        // fallback ถ้าบีบอัดไม่ได้
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFileName(file.name);
    setVideoObjUrl(null);
    setVideoUploading(true);
    try {
      const result = await courseAPI.uploadVideo(file);
      setVideoObjUrl(result.url);
    } catch (error: any) {
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดวิดีโอ');
      setVideoFileName(null);
    } finally {
      setVideoUploading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!courseForm.title.trim()) { alert("กรุณากรอกชื่อวิชา"); return; }
    if (!courseForm.price.trim()) { alert("กรุณากรอกราคาคอร์ส"); return; }

    try {
      const finalImage = imagePreview || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80';

      // Create course request via API
      await courseAPI.createCourseRequest({
        title: courseForm.title,
        description: courseForm.description || undefined,
        thumbnail_url: finalImage,
        video_url: videoObjUrl || undefined,
        price: courseForm.price ? Number(courseForm.price) : undefined,
        instructor_id: currentUserId,
        instructor_name: courseForm.instructor || undefined,
        tags: courseForm.tags || undefined,
        is_onsite: courseForm.isOnsite,
        onsite_seats: courseForm.onsiteSeats ? Number(courseForm.onsiteSeats) : undefined,
        onsite_days: courseForm.onsiteDays && courseForm.onsiteDays.length > 0 ? courseForm.onsiteDays : undefined,
        onsite_time_start: courseForm.onsiteTimeStart || undefined,
        onsite_time_end: courseForm.onsiteTimeEnd || undefined,
        onsite_duration: courseForm.onsiteDuration || undefined,
        onsite_exam_schedule: courseForm.onsiteExamSchedule || undefined,
        is_online: courseForm.isOnline,
        online_expiry: courseForm.onlineExpiry || undefined,
      });

      // Refresh courses list
      const coursesResponse = await courseAPI.getCoursesByInstructor(currentUserId);
      setMyCourses(coursesResponse.data.data);

      closeModal();
      alert(`✅ ส่งคำขอเปิดคอร์ส "${courseForm.title}" โดย ${courseForm.instructor} เรียบร้อยแล้ว!`);

    } catch (error: any) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: CourseStatus) => {
    try {
      if (newStatus === CourseStatus.PENDING_REVIEW) {
        // Submit for review
        await courseAPI.submitForReview(id);
        alert("ส่งเนื้อหาให้แอดมินตรวจสอบแล้ว!");
      }

      // Refresh courses list
      const coursesResponse = await courseAPI.getCoursesByInstructor(currentUserId);
      setMyCourses(coursesResponse.data.data);
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการอัพเดทสถานะ");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคอร์สนี้? การกระทำนี้ไม่สามารถยกเลิกได้')) {
      return;
    }

    try {
      await courseAPI.deleteCourse(courseId);
      alert('ลบคอร์สสำเร็จ!');
      
      // Refresh courses list
      const coursesResponse = await courseAPI.getCoursesByInstructor(currentUserId);
      setMyCourses(coursesResponse.data.data);
      
      // Remove from read notifications
      const newReadNotifications = new Set(readNotifications);
      newReadNotifications.delete(courseId);
      setReadNotifications(newReadNotifications);
      localStorage.setItem('readNotifications', JSON.stringify([...newReadNotifications]));
    } catch (error: any) {
      console.error('Error deleting course:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการลบคอร์ส');
    }
  };

  const handleEditCourse = (course: APICourse) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      instructor: course.instructor_name || `อ.${teacherData.firstName} ${teacherData.lastName}`,
      description: course.description || '',
      price: course.price?.toString() || '',
      tags: course.tags || '',
      isOnsite: course.is_onsite,
      onsiteSeats: course.onsite_seats?.toString() || '',
      onsiteDays: course.onsite_days || [],
      onsiteTimeStart: course.onsite_time_start || '',
      onsiteTimeEnd: course.onsite_time_end || '',
      onsiteDuration: course.onsite_duration || '',
      onsiteExamSchedule: course.onsite_exam_schedule || '',
      isOnline: course.is_online,
      onlineExpiry: course.online_expiry || ''
    });
    setImagePreview(course.thumbnail_url || null);
    setVideoObjUrl(course.video_url || null);
    setIsEditModalOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse || !courseForm.title.trim()) {
      alert('กรุณากรอกชื่อวิชา');
      return;
    }
    if (!courseForm.price.trim()) {
      alert('กรุณากรอกราคาคอร์ส');
      return;
    }

    try {
      const wasRejected = editingCourse.status === CourseStatus.REJECTED;

      await courseAPI.updateCourseDetails(editingCourse.id, {
        title: courseForm.title,
        description: courseForm.description || undefined,
        thumbnail_url: imagePreview || undefined,
        video_url: videoObjUrl || undefined,
        price: courseForm.price ? Number(courseForm.price) : undefined,
        instructor_name: courseForm.instructor || undefined,
        tags: courseForm.tags || undefined,
        is_onsite: courseForm.isOnsite,
        onsite_seats: courseForm.onsiteSeats ? Number(courseForm.onsiteSeats) : undefined,
        onsite_days: courseForm.onsiteDays && courseForm.onsiteDays.length > 0 ? courseForm.onsiteDays : undefined,
        onsite_time_start: courseForm.onsiteTimeStart || undefined,
        onsite_time_end: courseForm.onsiteTimeEnd || undefined,
        onsite_duration: courseForm.onsiteDuration || undefined,
        onsite_exam_schedule: courseForm.onsiteExamSchedule || undefined,
        is_online: courseForm.isOnline,
        online_expiry: courseForm.onlineExpiry || undefined,
      });

      // Refresh courses list
      const coursesResponse = await courseAPI.getCoursesByInstructor(currentUserId);
      setMyCourses(coursesResponse.data.data);

      closeEditModal();
      
      if (wasRejected) {
        alert(`✅ แก้ไขคอร์ส "${courseForm.title}" เรียบร้อยแล้ว!\n🔄 ส่งคำขอให้แอดมินอนุมัติอีกครั้งแล้ว`);
      } else {
        alert(`✅ แก้ไขคอร์ส "${courseForm.title}" เรียบร้อยแล้ว!`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขคอร์ส');
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCourse(null);
    setCourseForm({ ...initialFormState, instructor: `อ.${teacherData.firstName} ${teacherData.lastName}` });
    setImagePreview(null);
    setVideoFileName(null);
    setVideoObjUrl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // ✅ อัปเดตการเคลียร์ Form ให้ดึงชื่อล่าสุดมาใช้เสมอ
    setCourseForm({ ...initialFormState, instructor: `อ.${teacherData.firstName} ${teacherData.lastName}` });
    setImagePreview(null);
    setVideoFileName(null);
    setVideoObjUrl(null);
  };

  // ==========================================
  // Content Management Functions
  // ==========================================
  const handleOpenContentModal = async (course: APICourse) => {
    setContentCourse(course);
    setIsContentModalOpen(true);
    
    try {
      // Try to load existing lessons
      const response = await courseAPI.getLessonsByCourse(course.id);
      const existingLessons = response.data.data;
      
      console.log('📂 [Open Modal] Loading lessons from database:', existingLessons);
      
      if (existingLessons && existingLessons.length > 0) {
        // Parse and group lessons
        const groupedLessons: { [key: string]: typeof lessons[0] } = {};
        
        existingLessons.forEach((lesson) => {
          console.log('📖 [Open Modal] Processing lesson:', {
            id: lesson.id,
            topic: lesson.topic_name,
            video_url: lesson.video_url,
            pdf_url: lesson.pdf_url
          });
          
          // Split topic_name by " - " to separate parent and child
          const parts = lesson.topic_name.split(' - ');
          
          if (parts.length >= 2) {
            const parentName = parts[0];
            const childName = parts.slice(1).join(' - '); // In case there are multiple " - "
            
            if (!groupedLessons[parentName]) {
              groupedLessons[parentName] = {
                id: lesson.id,
                topic_name: parentName,
                subLessons: []
              };
            }
            
            groupedLessons[parentName].subLessons.push({
              id: lesson.id,
              title: childName,
              content: lesson.content || '',
              video_url: lesson.video_url || '',
              pdf_url: lesson.pdf_url || ''
            });
          } else {
            // If no " - " separator, treat as a single lesson
            if (!groupedLessons[lesson.topic_name]) {
              groupedLessons[lesson.topic_name] = {
                id: lesson.id,
                topic_name: lesson.topic_name,
                subLessons: []
              };
            }
            
            groupedLessons[lesson.topic_name].subLessons.push({
              id: lesson.id,
              title: lesson.topic_name,
              content: lesson.content || '',
              video_url: lesson.video_url || '',
              pdf_url: lesson.pdf_url || ''
            });
          }
        });
        
        // Convert to array
        const lessonsArray = Object.values(groupedLessons);
        console.log('✅ [Open Modal] Grouped lessons:', lessonsArray);
        lessonsArray.forEach((lesson, idx) => {
          console.log(`  Lesson ${idx + 1}:`, lesson.topic_name);
          lesson.subLessons.forEach((sub, subIdx) => {
            console.log(`    SubLesson ${idx + 1}.${subIdx + 1}:`, {
              title: sub.title,
              video_url: sub.video_url,
              pdf_url: sub.pdf_url
            });
          });
        });
        setLessons(lessonsArray);
      } else {
        // Initialize with one empty lesson if no existing lessons
        setLessons([{
          topic_name: '',
          subLessons: [{
            title: '',
            content: '',
            video_url: '',
            pdf_url: ''
          }]
        }]);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
      // Initialize with one empty lesson on error
      setLessons([{
        topic_name: '',
        subLessons: [{
          title: '',
          content: '',
          video_url: '',
          pdf_url: ''
        }]
      }]);
    }
  };

  const handleAddLesson = () => {
    setLessons([...lessons, {
      topic_name: '',
      subLessons: [{
        title: '',
        content: '',
        video_url: '',
        pdf_url: ''
      }]
    }]);
  };

  const handleRemoveLesson = (lessonIndex: number) => {
    setLessons(lessons.filter((_, i) => i !== lessonIndex));
  };

  const handleAddSubLesson = (lessonIndex: number) => {
    const newLessons = [...lessons];
    newLessons[lessonIndex].subLessons.push({
      title: '',
      content: '',
      video_url: '',
      pdf_url: ''
    });
    setLessons(newLessons);
  };

  const handleRemoveSubLesson = (lessonIndex: number, subLessonIndex: number) => {
    const newLessons = [...lessons];
    newLessons[lessonIndex].subLessons = newLessons[lessonIndex].subLessons.filter((_, i) => i !== subLessonIndex);
    setLessons(newLessons);
  };

  const handleLessonChange = (lessonIndex: number, field: string, value: string) => {
    const newLessons = [...lessons];
    (newLessons[lessonIndex] as any)[field] = value;
    setLessons(newLessons);
  };

  const handleSubLessonChange = (lessonIndex: number, subLessonIndex: number, field: string, value: string) => {
    console.log(`🔄 Changing ${field} to:`, value);
    const newLessons = [...lessons];
    (newLessons[lessonIndex].subLessons[subLessonIndex] as any)[field] = value;
    console.log('Updated subLesson:', newLessons[lessonIndex].subLessons[subLessonIndex]);
    setLessons(newLessons);
  };

  const handleSubLessonVideoUpload = async (lessonIndex: number, subLessonIndex: number, file: File) => {
    try {
      // Validate file type
      const validVideoTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska'];
      if (!validVideoTypes.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/i)) {
        alert('❌ รองรับเฉพาะไฟล์วีดีโอ: mp4, avi, mov, wmv, flv, mkv');
        return;
      }

      // Validate file size (500MB = 524288000 bytes)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`❌ ไฟล์วีดีโอใหญ่เกินกำหนด!\nขนาดไฟล์: ${(file.size / (1024 * 1024)).toFixed(2)} MB\nขนาดสูงสุด: 500 MB`);
        return;
      }

      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      console.log(`📤 กำลังอัปโหลดวีดีโอ: ${file.name} (${fileSizeMB} MB)`);

      const newLessons = [...lessons];
      // Show uploading status
      newLessons[lessonIndex].subLessons[subLessonIndex].video_url = 'uploading...';
      setLessons([...newLessons]);
      
      // Upload to backend
      const result = await courseAPI.uploadVideo(file);
      
      // Update with actual URL
      newLessons[lessonIndex].subLessons[subLessonIndex].video_url = result.url;
      setLessons([...newLessons]);
      
      console.log('✅ อัปโหลดวีดีโอสำเร็จ:', result.url);
      alert(`✅ อัปโหลดวีดีโอสำเร็จ!\nชื่อไฟล์: ${result.filename}\nขนาด: ${fileSizeMB} MB`);
    } catch (error: any) {
      console.error('❌ Error uploading video:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดวีดีโอ');
      
      // Clear uploading status on error
      const newLessons = [...lessons];
      newLessons[lessonIndex].subLessons[subLessonIndex].video_url = '';
      setLessons([...newLessons]);
    }
  };

  const handleSaveContent = async () => {
    if (!contentCourse) return;

    // Check if any video is still uploading
    const isUploading = lessons.some(lesson =>
      lesson.subLessons.some(sub => sub.video_url === 'uploading...')
    );

    if (isUploading) {
      alert('⏳ กรุณารอให้การอัปโหลดวีดีโอเสร็จสิ้นก่อนบันทึก');
      return;
    }

    // Validate
    for (const lesson of lessons) {
      if (!lesson.topic_name.trim()) {
        alert('กรุณากรอกชื่อบทเรียนทุกบท');
        return;
      }
      for (const subLesson of lesson.subLessons) {
        if (!subLesson.title.trim()) {
          alert('กรุณากรอกชื่อบทเรียนย่อยทุกบท');
          return;
        }
      }
    }

    const confirmSave = confirm(`คุณต้องการบันทึกเนื้อหา ${lessons.length} บทเรียน ใช่หรือไม่?`);
    if (!confirmSave) return;

    try {
      // Save lessons to database
      let sequenceOrder = 1;
      let savedCount = 0;
      
      for (const lesson of lessons) {
        // Create or update each sub-lesson as a separate lesson record
        for (const subLesson of lesson.subLessons) {
          const lessonData = {
            topic_name: `${lesson.topic_name} - ${subLesson.title}`,
            content: subLesson.content || undefined,
            video_url: subLesson.video_url || undefined,
            pdf_url: subLesson.pdf_url || undefined,
            sequence_order: sequenceOrder++
          };
          
          console.log('💾 Saving lesson:', lessonData);
          console.log('📝 PDF URL:', subLesson.pdf_url);
          
          if (subLesson.id) {
            // Update existing lesson
            await courseAPI.updateLesson(subLesson.id, lessonData);
          } else {
            // Create new lesson
            const response = await courseAPI.createLesson(contentCourse.id, lessonData);
            // Store the new ID back to state
            subLesson.id = response.data.id;
          }
          savedCount++;
        }
      }
      
      alert(`✅ บันทึกเนื้อหาเรียบร้อยแล้ว! (${savedCount} บทเรียนย่อย)\n\nคุณสามารถเพิ่มเนื้อหาเพิ่มเติม ปิดหน้าต่าง หรือกด "ส่งคำขอขายคอร์ส" เพื่อส่งให้แอดมินอนุมัติ`);
      
      // Reload lessons to sync with database (including new IDs)
      const response = await courseAPI.getLessonsByCourse(contentCourse.id);
      const existingLessons = response.data.data;
      
      console.log('🔄 Reloading lessons from database:', existingLessons);
      
      if (existingLessons && existingLessons.length > 0) {
        // Parse and group lessons
        const groupedLessons: { [key: string]: typeof lessons[0] } = {};
        
        existingLessons.forEach((lesson) => {
          console.log('📖 Processing lesson:', {
            id: lesson.id,
            topic: lesson.topic_name,
            video_url: lesson.video_url,
            pdf_url: lesson.pdf_url
          });
          
          const parts = lesson.topic_name.split(' - ');
          
          if (parts.length >= 2) {
            const parentName = parts[0];
            const childName = parts.slice(1).join(' - ');
            
            if (!groupedLessons[parentName]) {
              groupedLessons[parentName] = {
                id: lesson.id,
                topic_name: parentName,
                subLessons: []
              };
            }
            
            groupedLessons[parentName].subLessons.push({
              id: lesson.id,
              title: childName,
              content: lesson.content || '',
              video_url: lesson.video_url || '',
              pdf_url: lesson.pdf_url || ''
            });
          }
        });
        
        // Convert to array and update state
        const lessonsArray = Object.values(groupedLessons);
        console.log('✅ Grouped lessons:', lessonsArray);
        lessonsArray.forEach((lesson, idx) => {
          console.log(`  📚 Lesson ${idx + 1}:`, lesson.topic_name);
          lesson.subLessons.forEach((sub, subIdx) => {
            console.log(`    📄 SubLesson ${idx + 1}.${subIdx + 1}:`, {
              id: sub.id,
              title: sub.title,
              video_url: sub.video_url,
              pdf_url: sub.pdf_url
            });
          });
        });
        setLessons(lessonsArray);
      }
      
    } catch (error: any) {
      console.error('Error saving content:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกเนื้อหา');
    }
  };

  const handleSubmitForReview = async () => {
    if (!contentCourse) return;
    
    // Check if there are unsaved lessons (lessons without ID)
    const hasUnsavedContent = lessons.some(l => 
      l.topic_name.trim() && l.subLessons.some(s => !s.id && s.title.trim())
    );
    
    if (hasUnsavedContent) {
      const confirmSubmit = confirm('มีเนื้อหาที่ยังไม่ได้บันทึก\n\nคุณต้องการบันทึกและส่งคำขอขายคอร์สเลยใช่หรือไม่?');
      if (!confirmSubmit) return;

      // Validate all lessons
      for (const lesson of lessons) {
        if (lesson.topic_name.trim()) {
          for (const subLesson of lesson.subLessons) {
            if (!subLesson.title.trim()) {
              alert('กรุณากรอกชื่อบทเรียนย่อยทุกบท');
              return;
            }
          }
        }
      }
      
      try {
        // Save remaining lessons (create/update)
        let sequenceOrder = 1;
        
        for (const lesson of lessons) {
          if (lesson.topic_name.trim()) {
            for (const subLesson of lesson.subLessons) {
              const lessonData = {
                topic_name: `${lesson.topic_name} - ${subLesson.title}`,
                content: subLesson.content || undefined,
                video_url: subLesson.video_url || undefined,
                pdf_url: subLesson.pdf_url || undefined,
                sequence_order: sequenceOrder++
              };
              
              console.log('💾 [Submit] Saving lesson:', lessonData);
              console.log('📝 [Submit] PDF URL:', subLesson.pdf_url);
              
              if (subLesson.id) {
                // Update existing lesson
                await courseAPI.updateLesson(subLesson.id, lessonData);
              } else {
                // Create new lesson
                await courseAPI.createLesson(contentCourse.id, lessonData);
              }
            }
          }
        }
      } catch (error: any) {
        console.error('Error saving lessons:', error);
        alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกเนื้อหา');
        return;
      }
    } else {
      const confirmSubmit = confirm('คุณต้องการส่งคำขอขายคอร์สให้แอดมินอนุมัติใช่หรือไม่?');
      if (!confirmSubmit) return;
    }
    
    try {
      // Submit for review
      await courseAPI.submitForReview(contentCourse.id);
      
      // Refresh courses list
      const coursesResponse = await courseAPI.getCoursesByInstructor(currentUserId);
      setMyCourses(coursesResponse.data.data);
      
      setIsContentModalOpen(false);
      setLessons([]);
      setContentCourse(null);
      
      alert('✅ ส่งคำขอขายคอร์สให้แอดมินอนุมัติเรียบร้อยแล้ว!\n\nรอแอดมินตรวจสอบและอนุมัติคอร์สของคุณ');
    } catch (error: any) {
      console.error('Error submitting for review:', error);
      alert(error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งคำขอ');
    }
  };

  const closeContentModal = () => {
    setIsContentModalOpen(false);
    setLessons([]);
    setContentCourse(null);
  };

  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.REQUEST_CREATE: return <span style={{ color: '#eab308', background: '#fefce8', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={14} /> รออนุมัติสร้าง</span>;
      case CourseStatus.DRAFTING: return <span style={{ color: '#3b82f6', background: '#eff6ff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}><Edit3 size={14} /> กำลังใส่เนื้อหา</span>;
      case CourseStatus.PENDING_REVIEW: return <span style={{ color: '#f97316', background: '#fff7ed', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}><AlertCircle size={14} /> รออนุมัติขาย</span>;
      case CourseStatus.PUBLISHED: return <span style={{ color: '#22c55e', background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={14} /> วางขายแล้ว</span>;
      case CourseStatus.REJECTED: return <span style={{ color: '#ef4444', background: '#fef2f2', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}><X size={14} /> ถูกปฏิเสธ</span>;
      default: return null;
    }
  };

  const renderCourseActions = (course: APICourse) => {
    switch (course.status) {
      case CourseStatus.REQUEST_CREATE: return <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>⏳ รอ Admin อนุมัติคำขอ...</span>;
      case CourseStatus.DRAFTING: return (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/exam-management/${course.id}`)}
            style={{ padding: '8px 20px', background: '#3b82f6', border: 'none', borderRadius: '30px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📝 จัดการข้อสอบ
          </button>
          <button 
            onClick={() => handleOpenContentModal(course)}
            style={{ padding: '8px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '30px', cursor: 'pointer', color: '#334155' }}
          >
            ✏️ แก้ไขเนื้อหา
          </button>
          <button onClick={() => handleUpdateStatus(course.id, CourseStatus.PENDING_REVIEW)} style={{ padding: '8px 20px', background: '#22c55e', border: 'none', borderRadius: '30px', cursor: 'pointer', color: 'white' }}>🚀 ส่งขออนุมัติขาย</button>
        </div>
      );
      case CourseStatus.PENDING_REVIEW: return <span style={{ color: '#f97316', fontSize: '0.9rem' }}>🕵️‍♀️ กำลังตรวจสอบความถูกต้อง...</span>;
      case CourseStatus.REJECTED: return (
        <div>
          <span style={{ color: '#ef4444', fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>❌ ถูกปฏิเสธ</span>
          {course.rejection_reason && <span style={{ color: '#64748b', fontSize: '0.85rem' }}>เหตุผล: {course.rejection_reason}</span>}
        </div>
      );
      case CourseStatus.PUBLISHED: return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/exam-management/${course.id}`)}
            style={{ padding: '8px 20px', background: '#0f172a', border: 'none', borderRadius: '30px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            📝 จัดการข้อสอบ
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{course.students_enrolled}</span>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>นักเรียนที่ลงทะเบียน</span>
          </div>
        </div>
      );
      default: return null;
    }
  };

  const renderCourseList = (courses: APICourse[], emptyMessage: string) => {
    if (courses.length === 0) return <div style={{ color: '#94a3b8', padding: '1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>{emptyMessage}</div>;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {courses.map((course) => (
          <div key={course.id} style={{ display: 'flex', flexWrap: 'wrap', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.2rem', gap: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <img
              src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'}
              alt={course.title}
              style={{ width: '180px', height: '130px', objectFit: 'cover', borderRadius: '10px' }}
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80'; }}
            />
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{course.title}</h3>{getStatusBadge(course.status)}</div>
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
      {/* Replace Navbar with imported Header */}
      <Header />

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
                <Camera size={16} color="#475569" />
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
                        <input type="text" name="firstName" value={editProfileForm.firstName} onChange={handleProfileInputChange} placeholder="ชื่อ" style={{ ...editInputStyle, flex: 1 }} />
                        <input type="text" name="lastName" value={editProfileForm.lastName} onChange={handleProfileInputChange} placeholder="นามสกุล" style={{ ...editInputStyle, flex: 1 }} />
                      </div>
                    ) : (
                      <span className="info-value">{teacherData.firstName} {teacherData.lastName}</span>
                    )}
                  </div>

                  {/* อีเมล */}
                  <div className="info-row">
                    <span className="info-label">อีเมล</span>
                    {isEditingProfile ? (
                      <input type="email" name="email" value={editProfileForm.email} onChange={handleProfileInputChange} style={{ ...editInputStyle, flex: 1 }} />
                    ) : (
                      <span className="info-value" style={{ color: '#94a3b8' }}>{teacherData.email}</span>
                    )}
                  </div>

                  {/* เบอร์โทร */}
                  <div className="info-row" style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <span className="info-label">เบอร์โทร</span>
                    {isEditingProfile ? (
                      <input type="text" name="phone" value={editProfileForm.phone} onChange={handleProfileInputChange} style={{ ...editInputStyle, flex: 1 }} />
                    ) : (
                      <span className="info-value" style={{ color: '#94a3b8' }}>{teacherData.phone}</span>
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
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Notification Bell */}
                    <div data-notification style={{ position: 'relative' }}>
                      <button 
                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                        style={{ 
                          background: unreadNotifications > 0 ? '#fee2e2' : '#f1f5f9', 
                          color: unreadNotifications > 0 ? '#dc2626' : '#64748b',
                          border: unreadNotifications > 0 ? '2px solid #fca5a5' : '2px solid #e2e8f0', 
                          padding: '8px 12px', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontWeight: '500',
                          position: 'relative'
                        }}
                      >
                        <Bell size={18} />
                        {unreadNotifications > 0 && (
                          <span style={{ 
                            position: 'absolute', 
                            top: '-5px', 
                            right: '-5px', 
                            background: '#dc2626', 
                            color: 'white', 
                            borderRadius: '50%', 
                            width: '20px', 
                            height: '20px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '0.7rem', 
                            fontWeight: 'bold',
                            border: '2px solid white'
                          }}>
                            {unreadNotifications}
                          </span>
                        )}
                      </button>

                      {/* Notification Dropdown */}
                      {isNotificationOpen && (
                        <div style={{ 
                          position: 'absolute', 
                          top: '110%', 
                          right: 0, 
                          background: 'white', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 40px rgba(0,0,0,0.15)', 
                          minWidth: '400px', 
                          maxWidth: '500px',
                          zIndex: 1000,
                          maxHeight: '500px',
                          overflow: 'auto'
                        }}>
                          <div style={{ padding: '15px 20px', borderBottom: '2px solid #fee2e2', background: '#fef2f2' }}>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#991b1b', fontWeight: 'bold' }}>
                              🔔 การแจ้งเตือน ({unreadNotifications})
                            </h3>
                          </div>

                          {unreadRejectedCourses.length === 0 ? (
                            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8' }}>
                              <Bell size={40} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                              <p>ไม่มีการแจ้งเตือน</p>
                            </div>
                          ) : (
                            <div style={{ padding: '10px' }}>
                              {unreadRejectedCourses.map(course => (
                                <div 
                                  key={course.id} 
                                  style={{ 
                                    padding: '15px', 
                                    borderRadius: '8px', 
                                    background: '#fef2f2', 
                                    marginBottom: '10px',
                                    border: '1px solid #fecaca'
                                  }}
                                >
                                  <div style={{ display: 'flex', gap: '10px' }}>
                                    <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 'bold', color: '#991b1b', marginBottom: '5px' }}>
                                        คอร์สถูกปฏิเสธ
                                      </div>
                                      <div style={{ fontSize: '0.95rem', color: '#7f1d1d', marginBottom: '8px', fontWeight: '500' }}>
                                        {course.title}
                                      </div>
                                      {course.rejection_reason && (
                                        <div style={{ 
                                          background: 'white', 
                                          padding: '10px', 
                                          borderRadius: '6px', 
                                          fontSize: '0.9rem', 
                                          color: '#0f172a',
                                          border: '1px solid #fecaca',
                                          lineHeight: '1.5',
                                          marginBottom: '10px'
                                        }}>
                                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: 'bold' }}>
                                            เหตุผลการปฏิเสธ:
                                          </div>
                                          {course.rejection_reason}
                                        </div>
                                      )}
                                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '10px' }}>
                                        คุณสามารถแก้ไขคอร์สแล้วส่งคำขออีกครั้ง หรือลบคอร์สนี้ทิ้ง
                                      </div>
                                      
                                      {/* Action Buttons */}
                                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <button
                                          onClick={() => {
                                            handleEditCourse(course);
                                            markAsRead(course.id);
                                            setIsNotificationOpen(false);
                                          }}
                                          style={{
                                            background: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            flex: 1,
                                            justifyContent: 'center'
                                          }}
                                        >
                                          <Edit2 size={16} /> แก้ไขคอร์ส
                                        </button>
                                        <button
                                          onClick={() => {
                                            markAsRead(course.id);
                                            setIsNotificationOpen(false);
                                            handleDeleteCourse(course.id);
                                          }}
                                          style={{
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            flex: 1,
                                            justifyContent: 'center'
                                          }}
                                        >
                                          <X size={16} /> ลบ
                                        </button>
                                      </div>
                                      
                                      {/* Mark as Read Button */}
                                      <button
                                        onClick={() => markAsRead(course.id)}
                                        style={{
                                          background: 'white',
                                          color: '#64748b',
                                          border: '1px solid #e2e8f0',
                                          padding: '8px 16px',
                                          borderRadius: '6px',
                                          cursor: 'pointer',
                                          fontSize: '0.85rem',
                                          fontWeight: '500',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          width: '100%',
                                          justifyContent: 'center'
                                        }}
                                      >
                                        <Check size={16} /> ทราบแล้ว (ดูทีหลัง)
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button onClick={() => setIsModalOpen(true)} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
                      <PlusCircle size={18} /> ขอเปิดคอร์สใหม่
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳</div>
                    <div>กำลังโหลดข้อมูลคอร์ส...</div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '2px solid #fef08a', paddingBottom: '0.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#a16207', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} /> คอร์สที่รออนุมัติสร้าง</span></div>
                    {renderCourseList(requestedCourses, "ไม่มีคอร์สที่รออนุมัติสร้าง")}

                    <div style={{ marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '2px solid #bfdbfe', paddingBottom: '0.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '8px' }}><Edit3 size={18} /> คอร์สที่กำลังใส่เนื้อหา</span></div>
                    {renderCourseList(draftingCourses, "ไม่มีคอร์สที่กำลังใส่เนื้อหา")}

                    <div style={{ marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '2px solid #fed7aa', paddingBottom: '0.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#c2410c', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={18} /> คอร์สที่รออนุมัติขาย</span></div>
                    {renderCourseList(pendingReviewCourses, "ไม่มีคอร์สที่รออนุมัติขาย")}

                    <div style={{ marginTop: '2.5rem', marginBottom: '1rem', borderBottom: '2px solid #bbf7d0', paddingBottom: '0.5rem' }}><span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} /> คอร์สที่เปิดขายแล้ว</span></div>
                    {renderCourseList(publishedCourses, "ไม่มีคอร์สที่เปิดขาย")}
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <Footer />


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
                      <><Video size={18} /> อัปโหลดไฟล์วิดีโอตัวอย่างการสอน</>
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
                      <div className="input-group"><label style={labelSmallStyle}>จำนวนที่นั่ง</label><div style={inputContainerStyle}><input id="onsiteSeats" type="text" name="onsiteSeats" value={courseForm.onsiteSeats} placeholder="กรอกจำนวนที่นั่ง" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onsiteSeats" style={{ cursor: 'pointer' }}><Edit2 size={14} color="#9ca3af" /></label></div></div>
                      <div className="input-group">
                        <label style={labelSmallStyle}>วันที่เปิดสอน</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((day, idx) => (
                            <button key={idx} type="button" onClick={() => toggleDay(day)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #d1d5db', background: courseForm.onsiteDays?.includes(day) ? '#374151' : '#f3f4f6', color: courseForm.onsiteDays?.includes(day) ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{day}</button>
                          ))}
                        </div>
                      </div>
                      <div className="input-group"><label style={labelSmallStyle}>เวลาที่เปิดสอน</label><div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><div style={{ ...inputContainerStyle, width: '130px', justifyContent: 'center' }}><input type="time" name="onsiteTimeStart" value={courseForm.onsiteTimeStart} onChange={handleInputChange} style={{ ...inputStyleClean, textAlign: 'center' }} /></div><span>-</span><div style={{ ...inputContainerStyle, width: '130px', justifyContent: 'center' }}><input type="time" name="onsiteTimeEnd" value={courseForm.onsiteTimeEnd} onChange={handleInputChange} style={{ ...inputStyleClean, textAlign: 'center' }} /></div></div></div>
                      <div className="input-group"><label style={labelSmallStyle}>ระยะเวลาคอร์ส</label><div style={inputContainerStyle}><input id="onsiteDuration" type="text" name="onsiteDuration" value={courseForm.onsiteDuration} placeholder="กรอกจำนวนวัน" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onsiteDuration" style={{ cursor: 'pointer' }}><Edit2 size={14} color="#9ca3af" /></label></div></div>
                      <div className="input-group"><label style={labelSmallStyle}>ตารางการเปิดสอบประจำปี</label><div style={inputContainerStyle}><input id="onsiteExamSchedule" type="text" name="onsiteExamSchedule" value={courseForm.onsiteExamSchedule} placeholder="เช่น 2568" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onsiteExamSchedule" style={{ cursor: 'pointer' }}><Edit2 size={14} color="#9ca3af" /></label></div></div>
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
                      <div className="input-group"><label style={labelSmallStyle}>ระยะเวลาหมดอายุคอร์ส</label><div style={inputContainerStyle}><input id="onlineExpiry" type="text" name="onlineExpiry" value={courseForm.onlineExpiry} placeholder="กรอกระยะเวลาหมดอายุ(เดือน)" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onlineExpiry" style={{ cursor: 'pointer' }}><Edit2 size={14} color="#9ca3af" /></label></div></div>
                    </div>
                  )}
                </div>
              </div>

              {/* --- RIGHT COLUMN --- */}
              <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group"><label style={labelStyle}>ชื่อวิชา</label><div style={inputContainerStyle}><input id="title" type="text" name="title" value={courseForm.title} onChange={handleInputChange} placeholder="กรอกชื่อวิชา" style={inputStyleClean} /><label htmlFor="title" style={{ cursor: 'pointer' }}><Edit2 size={16} color="#9ca3af" /></label></div></div>
                <div className="input-group"><label style={labelStyle}>ผู้สอน</label><div style={{ ...inputContainerStyle, background: '#f3f4f6' }}><input type="text" name="instructor" value={courseForm.instructor} readOnly style={{ ...inputStyleClean, color: '#6b7280', cursor: 'not-allowed' }} /></div></div>
                <div className="input-group"><label style={labelStyle}>รายละเอียดคอร์ส</label><div style={{ ...inputContainerStyle, alignItems: 'flex-start' }}><textarea id="description" name="description" value={courseForm.description} rows={4} onChange={handleInputChange} placeholder="กรอกรายละเอียด" style={{ ...inputStyleClean, resize: 'none' }} /><label htmlFor="description" style={{ cursor: 'pointer', marginTop: '5px' }}><Edit2 size={16} color="#9ca3af" /></label></div></div>
                <div className="input-group"><label style={labelStyle}>ราคา</label><div style={inputContainerStyle}><input id="price" type="text" name="price" value={courseForm.price} onChange={handleInputChange} placeholder="กรอกราคา" style={inputStyleClean} /><label htmlFor="price" style={{ cursor: 'pointer' }}><Edit2 size={16} color="#9ca3af" /></label></div></div>
                <div className="input-group"><label style={labelStyle}>ป้ายกำกับ (เริ่มด้วย #)</label><div style={inputContainerStyle}><input id="tags" type="text" name="tags" value={courseForm.tags} onChange={handleInputChange} placeholder="#กรอกแท็ก #กรอกแท็ก" style={inputStyleClean} /><label htmlFor="tags" style={{ cursor: 'pointer' }}><Edit2 size={16} color="#9ca3af" /></label></div></div>

                <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleCreateCourse} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 40px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>ส่งคำขอ</button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT COURSE MODAL ================= */}
      {isEditModalOpen && editingCourse && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '16px', width: '900px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative',
            color: '#1e293b'
          }}>

            <button onClick={closeEditModal} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer' }}><X size={24} color="#94a3b8" /></button>

            <h2 style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }}>แก้ไขคอร์ส</h2>

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
                      <><Video size={18} /> อัปโหลดไฟล์วิดีโอตัวอย่างการสอน</>
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
                      <div className="input-group"><label style={labelSmallStyle}>จำนวนที่นั่ง</label><div style={inputContainerStyle}><input id="onsiteSeats" type="text" name="onsiteSeats" value={courseForm.onsiteSeats} placeholder="กรอกจำนวนที่นั่ง" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onsiteSeats" style={{ cursor: 'pointer' }}><Edit2 size={14} color="#9ca3af" /></label></div></div>
                      <div className="input-group">
                        <label style={labelSmallStyle}>วันที่เปิดสอน</label>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'].map((day, idx) => (
                            <button key={idx} type="button" onClick={() => toggleDay(day)} style={{ width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #d1d5db', background: courseForm.onsiteDays?.includes(day) ? '#374151' : '#f3f4f6', color: courseForm.onsiteDays?.includes(day) ? 'white' : '#374151', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>{day}</button>
                          ))}
                        </div>
                      </div>
                      <div className="input-group"><label style={labelSmallStyle}>เวลาที่เปิดสอน</label><div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}><div style={{ ...inputContainerStyle, width: '130px', justifyContent: 'center' }}><input type="time" name="onsiteTimeStart" value={courseForm.onsiteTimeStart} onChange={handleInputChange} style={{ ...inputStyleClean, textAlign: 'center' }} /></div><span>-</span><div style={{ ...inputContainerStyle, width: '130px', justifyContent: 'center' }}><input type="time" name="onsiteTimeEnd" value={courseForm.onsiteTimeEnd} onChange={handleInputChange} style={{ ...inputStyleClean, textAlign: 'center' }} /></div></div></div>
                      <div className="input-group"><label style={labelSmallStyle}>ระยะเวลาคอร์ส</label><div style={inputContainerStyle}><input id="onsiteDuration" type="text" name="onsiteDuration" value={courseForm.onsiteDuration} placeholder="กรอกจำนวนวัน" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onsiteDuration" style={{ cursor: 'pointer' }}><Edit2 size={14} color="#9ca3af" /></label></div></div>
                      <div className="input-group"><label style={labelSmallStyle}>ตารางการเปิดสอบประจำปี</label><div style={inputContainerStyle}><input id="onsiteExamSchedule" type="text" name="onsiteExamSchedule" value={courseForm.onsiteExamSchedule} placeholder="เช่น 2568" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onsiteExamSchedule" style={{ cursor: 'pointer' }}><Edit2 size={14} color="#9ca3af" /></label></div></div>
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
                      <div className="input-group"><label style={labelSmallStyle}>ระยะเวลาหมดอายุคอร์ส</label><div style={inputContainerStyle}><input id="onlineExpiry" type="text" name="onlineExpiry" value={courseForm.onlineExpiry} placeholder="กรอกระยะเวลาหมดอายุ(เดือน)" onChange={handleInputChange} style={inputStyleClean} /><label htmlFor="onlineExpiry" style={{ cursor: 'pointer' }}><Edit2 size={14} color="#9ca3af" /></label></div></div>
                    </div>
                  )}
                </div>
              </div>

              {/* --- RIGHT COLUMN --- */}
              <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="input-group"><label style={labelStyle}>ชื่อวิชา</label><div style={inputContainerStyle}><input id="title" type="text" name="title" value={courseForm.title} onChange={handleInputChange} placeholder="กรอกชื่อวิชา" style={inputStyleClean} /><label htmlFor="title" style={{ cursor: 'pointer' }}><Edit2 size={16} color="#9ca3af" /></label></div></div>
                <div className="input-group"><label style={labelStyle}>ผู้สอน</label><div style={{ ...inputContainerStyle, background: '#f3f4f6' }}><input type="text" name="instructor" value={courseForm.instructor} readOnly style={{ ...inputStyleClean, color: '#6b7280', cursor: 'not-allowed' }} /></div></div>
                <div className="input-group"><label style={labelStyle}>รายละเอียดคอร์ส</label><div style={{ ...inputContainerStyle, alignItems: 'flex-start' }}><textarea id="description" name="description" value={courseForm.description} rows={4} onChange={handleInputChange} placeholder="กรอกรายละเอียด" style={{ ...inputStyleClean, resize: 'none' }} /><label htmlFor="description" style={{ cursor: 'pointer', marginTop: '5px' }}><Edit2 size={16} color="#9ca3af" /></label></div></div>
                <div className="input-group"><label style={labelStyle}>ราคา</label><div style={inputContainerStyle}><input id="price" type="text" name="price" value={courseForm.price} onChange={handleInputChange} placeholder="กรอกราคา" style={inputStyleClean} /><label htmlFor="price" style={{ cursor: 'pointer' }}><Edit2 size={16} color="#9ca3af" /></label></div></div>
                <div className="input-group"><label style={labelStyle}>ป้ายกำกับ (เริ่มด้วย #)</label><div style={inputContainerStyle}><input id="tags" type="text" name="tags" value={courseForm.tags} onChange={handleInputChange} placeholder="#กรอกแท็ก #กรอกแท็ก" style={inputStyleClean} /><label htmlFor="tags" style={{ cursor: 'pointer' }}><Edit2 size={16} color="#9ca3af" /></label></div></div>

                <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={closeEditModal} style={{ background: '#e2e8f0', color: '#475569', border: 'none', padding: '10px 30px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>ยกเลิก</button>
                  <button onClick={handleUpdateCourse} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 40px', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>บันทึกการแก้ไข</button>
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

      {/* ================= CONTENT MANAGEMENT MODAL ================= */}
      {isContentModalOpen && contentCourse && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000,
          overflow: 'auto', padding: '20px'
        }}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '16px', width: '95%', maxWidth: '1200px',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative'
          }}>
            <button onClick={closeContentModal} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', cursor: 'pointer', zIndex: 1 }}>
              <X size={24} color="#94a3b8" />
            </button>

            <h2 style={{ marginBottom: '10px', fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>
              📚 จัดการเนื้อหาคอร์ส
            </h2>
            <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '1rem' }}>
              {contentCourse.title}
            </p>

            {/* Lessons List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {lessons.map((lesson, lessonIndex) => (
                <div key={lessonIndex} style={{ 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '25px',
                  background: '#f8fafc',
                  position: 'relative'
                }}>
                  {/* Lesson Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ 
                      background: '#3b82f6', 
                      color: 'white', 
                      borderRadius: '50%', 
                      width: '40px', 
                      height: '40px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}>
                      {lessonIndex + 1}
                    </div>
                    <input
                      type="text"
                      placeholder="ชื่อบทเรียน (เช่น บทที่ 1: พื้นฐานการเขียนโปรแกรม)"
                      value={lesson.topic_name}
                      onChange={(e) => handleLessonChange(lessonIndex, 'topic_name', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '12px 15px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        border: '2px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        background: 'white'
                      }}
                    />
                    {lessons.length > 1 && (
                      <button
                        onClick={() => handleRemoveLesson(lessonIndex)}
                        style={{
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px 15px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 'bold'
                        }}
                      >
                        🗑️ ลบบท
                      </button>
                    )}
                  </div>

                  {/* Sub-lessons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginLeft: '55px' }}>
                    {lesson.subLessons.map((subLesson, subIndex) => (
                      <div key={subIndex} style={{ 
                        background: 'white', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '10px', 
                        padding: '20px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                          <span style={{ 
                            background: '#f1f5f9', 
                            color: '#475569', 
                            padding: '5px 12px', 
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold'
                          }}>
                            {lessonIndex + 1}.{subIndex + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="ชื่อบทเรียนย่อย (เช่น ตัวแปรและชนิดข้อมูล)"
                            value={subLesson.title}
                            onChange={(e) => handleSubLessonChange(lessonIndex, subIndex, 'title', e.target.value)}
                            style={{
                              flex: 1,
                              padding: '10px 12px',
                              fontSize: '1rem',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              outline: 'none'
                            }}
                          />
                          {lesson.subLessons.length > 1 && (
                            <button
                              onClick={() => handleRemoveSubLesson(lessonIndex, subIndex)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '5px'
                              }}
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                          {/* Video Upload */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>
                              📹 วีดีโอบทเรียน
                            </label>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleSubLessonVideoUpload(lessonIndex, subIndex, file);
                              }}
                              style={{ display: 'none' }}
                              id={`video-${lessonIndex}-${subIndex}`}
                              disabled={subLesson.video_url === 'uploading...'}
                            />
                            <label
                              htmlFor={`video-${lessonIndex}-${subIndex}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '12px',
                                border: subLesson.video_url && subLesson.video_url !== 'uploading...' ? '2px solid #22c55e' : '2px dashed #cbd5e1',
                                borderRadius: '8px',
                                cursor: subLesson.video_url === 'uploading...' ? 'wait' : 'pointer',
                                background: subLesson.video_url === 'uploading...' ? '#fef3c7' : (subLesson.video_url ? '#f0fdf4' : '#f9fafb'),
                                color: subLesson.video_url === 'uploading...' ? '#92400e' : (subLesson.video_url ? '#15803d' : '#64748b'),
                                fontSize: '0.95rem',
                                fontWeight: '500',
                                pointerEvents: subLesson.video_url === 'uploading...' ? 'none' : 'auto'
                              }}
                            >
                              {subLesson.video_url === 'uploading...' ? (
                                <>
                                  <Clock size={20} />
                                  <span>⏳ กำลังอัปโหลด...</span>
                                </>
                              ) : subLesson.video_url ? (
                                <>
                                  <Check size={20} />
                                  <span>✅ วีดีโออัปโหลดแล้ว</span>
                                </>
                              ) : (
                                <>
                                  <Video size={20} />
                                  <span>คลิกเพื่ออัปโหลดวีดีโอ</span>
                                </>
                              )}
                            </label>
                            {subLesson.video_url && subLesson.video_url !== 'uploading...' && (
                              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#15803d', textAlign: 'center' }}>
                                <a href={subLesson.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#15803d', textDecoration: 'underline' }}>
                                  ดูวีดีโอ
                                </a>
                              </div>
                            )}
                          </div>

                          {/* PDF URL Input */}
                          <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>
                              📑 URL ไฟล์ PDF (เนื้อหาบทเรียน)
                            </label>
                            <input
                              type="text"
                              placeholder="วาง URL ไฟล์ PDF (Google Drive, Dropbox, etc.)"
                              value={subLesson.pdf_url}
                              onChange={(e) => handleSubLessonChange(lessonIndex, subIndex, 'pdf_url', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '12px',
                                fontSize: '0.9rem',
                                border: subLesson.pdf_url ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                                borderRadius: '8px',
                                outline: 'none',
                                background: subLesson.pdf_url ? '#eff6ff' : 'white',
                                boxSizing: 'border-box'
                              }}
                            />
                            {subLesson.pdf_url && (
                              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                                <div style={{ 
                                  fontSize: '0.8rem', 
                                  color: '#1e40af',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  marginBottom: '4px'
                                }}>
                                  <Check size={14} />
                                  ✅ มี URL PDF แล้ว
                                </div>
                                <a 
                                  href={subLesson.pdf_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ 
                                    color: '#1e40af', 
                                    textDecoration: 'underline',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  ดู PDF
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Add Sub-lesson Button */}
                    <button
                      onClick={() => handleAddSubLesson(lessonIndex)}
                      style={{
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '2px dashed #93c5fd',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <PlusCircle size={18} />
                      เพิ่มบทเรียนย่อย
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Lesson Button */}
              <button
                onClick={handleAddLesson}
                style={{
                  background: '#f0fdf4',
                  color: '#15803d',
                  border: '2px dashed #86efac',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <PlusCircle size={22} />
                เพิ่มบทเรียนถัดไป
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{ 
              marginTop: '30px', 
              paddingTop: '25px', 
              borderTop: '2px solid #e2e8f0',
              display: 'flex', 
              gap: '15px', 
              justifyContent: 'flex-end',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={closeContentModal}
                style={{
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveContent}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                💾 บันทึกเนื้อหา
              </button>
              <button
                onClick={handleSubmitForReview}
                style={{
                  background: '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🚀 ส่งคำขอขายคอร์ส
              </button>
            </div>
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