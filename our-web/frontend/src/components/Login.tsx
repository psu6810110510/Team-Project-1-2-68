/* ไฟล์: src/components/Login.tsx */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginTheme.css';
import { Search, ShoppingCart, Menu, User } from 'lucide-react';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';
import Footer from './Footer';

// ✅ ดึงค่า URL จากไฟล์ .env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Forgot Password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [forgotError, setForgotError] = useState('');

  // Update password field automatically when email matches a saved account
  useEffect(() => {
    const accountsStr = localStorage.getItem('saved_accounts');
    if (accountsStr && email.trim() !== '') {
      try {
        const accounts = JSON.parse(accountsStr);
        if (accounts[email]) {
          setPassword(accounts[email]);
        }
      } catch (e) {
        console.error('Error reading saved accounts', e);
      }
    }
  }, [email]);

  // Auto-redirect if already logged in (token exists)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const userRole = user.role?.toUpperCase();

        if (userRole === 'ADMIN') {
          navigate('/admin-dashboard');
        } else if (userRole === 'TEACHER') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/profile');
        }
      } catch (err) {
        console.error('Invalid user data in storage');
      }
    }
  }, [navigate]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus('loading');
    setForgotError('');

    // Simulate API call for forgot password
    setTimeout(() => {
      setForgotStatus('success');
    }, 1500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ ใช้ API_URL แทนการ Fix ค่า
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log("ดักดูข้อมูลจาก Backend:", data);

      if (!response.ok) {
        throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      }

      if (data.access_token) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');

        localStorage.setItem('access_token', data.access_token);

        let updatedUser = data.user || {};
        try {
          // ✅ ใช้ API_URL แทนการ Fix ค่า
          const profileRes = await fetch(`${API_URL}/auth/profile`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${data.access_token}`
            }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            updatedUser = { ...updatedUser, ...profileData };
          }
        } catch (e) {
          console.error("Failed to fetch fresh profile data:", e);
        }

        localStorage.setItem('user', JSON.stringify(updatedUser));

      } else {
        throw new Error('ไม่ได้รับ Token จากระบบ');
      }

      // Handle Remember Me credentials saving
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        const accountsStr = localStorage.getItem('saved_accounts');
        let accounts: Record<string, string> = {};
        try {
          if (accountsStr) accounts = JSON.parse(accountsStr);
        } catch (e) { }
        accounts[email] = password;
        localStorage.setItem('saved_accounts', JSON.stringify(accounts));
      } else {
        localStorage.removeItem('rememberMe');
      }

      const freshlySavedUserStr = localStorage.getItem('user');
      let freshlySavedUser = data.user;
      if (freshlySavedUserStr) {
        try { freshlySavedUser = JSON.parse(freshlySavedUserStr); } catch (e) { }
      }

      alert('เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ' + (freshlySavedUser?.full_name || ''));

      // เช็ค Role เพื่อแยกหน้าอาจารย์และนักเรียน
      const userRole = freshlySavedUser?.role?.toUpperCase();

      if (userRole === 'ADMIN') {
        navigate('/admin-dashboard');
      } else if (userRole === 'TEACHER') {
        navigate('/teacher-dashboard');
      } else {
        navigate('/profile');
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    setTimeout(() => {
      const mockGoogleUser = {
        id: 'g' + Date.now(),
        full_name: 'ผู้ใช้ Google',
        email: 'user.google@gmail.com',
        role: 'STUDENT',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=200&h=200'
      };
      const fakeToken = "mock_google_token_" + Date.now();
      localStorage.setItem('access_token', fakeToken);
      localStorage.setItem('user', JSON.stringify(mockGoogleUser));

      alert('เข้าสู่ระบบด้วย Google สำเร็จ! ยินดีต้อนรับ ' + mockGoogleUser.full_name);
      setLoading(false);
      navigate('/profile');
    }, 1500);
  };

  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="nav-logo">
          <img src={logoImage} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />
          <img src={fullLogo} alt="Born2Code Logo" style={{ height: '50px', width: 'auto' }} />
        </div>
        <div className="nav-icons">
          <Search className="nav-icon" size={24} />
          <ShoppingCart className="nav-icon" size={24} />
          <Menu className="nav-icon" size={24} />
          <User className="nav-icon" size={24} />
        </div>
      </nav>

      <main className="main-content">
        <div className="login-card">
          <h1 className="login-title">เข้าสู่ระบบ</h1>

          {error && <div style={{ color: '#ef4444', marginBottom: '1rem', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px' }}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input
                type="email" placeholder="อีเมล" className="form-input"
                name="email"
                value={email} onChange={(e) => setEmail(e.target.value)} required
              />
            </div>
            <div className="form-group">
              <input
                type="password" placeholder="รหัสผ่าน" className="form-input"
                name="password"
                value={password} onChange={(e) => setPassword(e.target.value)} required
              />
            </div>

            <div className="form-options">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ accentColor: '#0f172a' }}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                /> จดจำฉันไว้
              </label>
              <span
                className="forgot-password"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStatus('idle');
                  setForgotEmail('');
                  setForgotError('');
                }}
              >
                ลืมรหัสผ่าน?
              </span>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="divider"><span>หรือ</span></div>
          <button className="btn-google" type="button" onClick={handleGoogleLogin} disabled={loading}>
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>

          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
            ยังไม่มีบัญชีใช่ไหม? <span style={{ color: '#0f172a', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/register')}>สมัครสมาชิก</span>
          </p>
        </div>
      </main>

      {/* Forgot Password Modal Overlay */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowForgotModal(false)}>
              &times;
            </button>
            <h2 className="modal-title">ลืมรหัสผ่านใช่ไหม?</h2>

            {forgotStatus === 'success' ? (
              <>
                <div className="modal-success-text">
                  ถ้าอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปให้แล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ
                </div>
                <button className="btn-primary" onClick={() => setShowForgotModal(false)}>
                  ตกลง
                </button>
              </>
            ) : (
              <>
                <p className="modal-text">
                  กรุณากรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์เพื่อรีเซ็ตรหัสผ่านใหม่ให้คุณ
                </p>
                {forgotError && (
                  <div style={{ color: '#ef4444', marginBottom: '1rem', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'left' }}>
                    {forgotError}
                  </div>
                )}
                <form onSubmit={handleForgotPassword} style={{ textAlign: 'left' }}>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <input
                      type="email"
                      placeholder="กรอกอีเมลของคุณ"
                      className="form-input"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={forgotStatus === 'loading'} style={{ marginBottom: 0 }}>
                    {forgotStatus === 'loading' ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ✅ ลบ <footer className="footer"> ที่ซ้ำซ้อนออก เหลือแค่ Component <Footer /> */}
      <Footer />
    </div>
  );
}