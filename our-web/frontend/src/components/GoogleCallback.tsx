/* ไฟล์: src/components/GoogleCallback.tsx
   หน้านี้จะรับ token และ user data จาก backend หลัง Google OAuth callback
   แล้วเก็บลง localStorage + redirect ไปหน้าที่เหมาะสมตาม role */
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (!token || !userParam) {
      setError('ไม่ได้รับข้อมูลจาก Google กรุณาลองใหม่อีกครั้ง');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));

      // เก็บ token และข้อมูล user ลง localStorage
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // redirect ตาม role
      const userRole = user?.role?.toUpperCase();
      if (userRole === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (userRole === 'TEACHER') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      console.error('Google callback error:', err);
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: "'Kanit', sans-serif",
      background: '#f5f5f5',
    }}>
      {error ? (
        <div style={{
          color: '#ef4444',
          backgroundColor: '#fee2e2',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '1.2rem', margin: 0 }}>{error}</p>
          <p style={{ fontSize: '0.9rem', color: '#999', marginTop: '10px' }}>กำลังกลับไปหน้าเข้าสู่ระบบ...</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }} />
          <p style={{ fontSize: '1.2rem', color: '#333' }}>กำลังเข้าสู่ระบบด้วย Google...</p>
        </div>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
