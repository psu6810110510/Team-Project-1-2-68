/* ไฟล์: src/components/Login.tsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/authAPI';
// Import CSS ให้ถูกต้อง (ตรวจสอบว่าไฟล์อยู่ที่ src/styles/LoginTheme.css จริงๆ)
import '../styles/LoginTheme.css'; 
// ใช้แค่ไอคอนที่จำเป็น (ลบ Chrome ออกแล้ว)
import { Search, ShoppingCart, Menu, User} from 'lucide-react';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { access_token, user } = response.data;

      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      console.log("Login Success!", user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  // --- ส่วน UI (ดีไซน์ใหม่) ---
  return (
    <div className="page-container">
    {/* --- Header (Navbar) --- */ }
    <nav className="navbar">

        {/* ส่วนโลโก้ */}
        <div className="nav-logo">

          <img src={logoImage} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />

          <img src={fullLogo} alt="Born2Code Logo" style={{ height: '50px', width: 'auto' }} />
        </div>

        {/* ... ส่วนไอคอนด้านขวา ... */}

      {/* ไอคอนด้านขวา (เหมือนเดิม) */}
      <div className="nav-icons">
        <Search className="nav-icon" size={24} />
        <ShoppingCart className="nav-icon" size={24} />
        <Menu className="nav-icon" size={24} />
        <User className="nav-icon" size={24} />
      </div>
    </nav>

      {/* Main Content (Card) */}
      <main className="main-content">
        <div className="login-card">
          <h1 className="login-title">เข้าสู่ระบบ</h1>
          
          {error && <div style={{color: '#ef4444', marginBottom: '1rem', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px'}}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="อีเมล" 
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="รหัสผ่าน" 
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-options">
              <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                <input type="checkbox" style={{ accentColor: '#0f172a' }} /> จดจำฉันไว้
              </label>
              <span 
                className="forgot-password"
                onClick={() => navigate('/forgot-password')} // ลิงก์ไปหน้าลืมรหัสผ่าน
              >
                ลืมรหัสผ่าน?
              </span>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="divider">
            <span>หรือ</span>
          </div>

          {/* ปุ่ม Google (ใช้ SVG แท้ แก้ปัญหาไอคอนขีดฆ่า) */}
          <button className="btn-google" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>

          <p style={{marginTop: '1.5rem', fontSize: '0.9rem', color: '#666'}}>
            ยังไม่มีบัญชีใช่ไหม?{' '}
            <span 
              style={{color: '#0f172a', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline'}}
              onClick={() => navigate('/register')} // ลิงก์ไปหน้าสมัครสมาชิก
            >
              สมัครสมาชิก
            </span>
          </p>
        </div>
      </main>

{/* ... (ส่วน Main Content ด้านบน) ... */}

      {/* --- Footer (แก้ไขใหม่) --- */}
      <footer className="footer">
        <div className="footer-content" style={{ flexDirection: 'column', gap: '2rem' }}>
          
          {/* ส่วนบน: โลโก้ + สโลแกน */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            {/* โลโก้ Born2Code (ใช้รูปที่คุณมีอยู่แล้ว) */}
              <img src={fullLogo} alt="Logo" style={{ height: '50px' }} />
            
            {/* สโลแกน */}
            <span style={{ fontSize: '1rem', fontWeight: '500', color: '#fff' }}>
              “ ตัวช่วยที่จะทำให้คุณประสบความสำเร็จทางด้านคอมพิวเตอร์”
            </span>
          </div>

          {/* เส้นขีดคั่นบางๆ (Optional) */}
          <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>

          {/* ส่วนล่าง: แบ่งเป็น 2 โซน (ซ้าย-ขวา) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem', width: '100%' }}>
            
            {/* ฝั่งซ้าย: ที่อยู่ + เวลาทำการ */}
            <div>
              <h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>ที่อยู่</h4>
              <p style={{ marginBottom: '0.3rem' }}>สถาบันบอร์นทูโค้ด เลขที่ 15 ถ.กาญจนวณิชย์</p>
              <p style={{ marginBottom: '1.5rem' }}>อ.หาดใหญ่ จ.สงขลา 90110</p>
              
              <h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>เวลาเปิดทำการ</h4>
              <p style={{ marginBottom: '0.3rem' }}>จ.-ศ. 16.00 - 21.00</p>
              <p>ส.-อา. 8.00 - 21.00</p>
            </div>

            {/* ฝั่งขวา: ช่องทางการติดต่อ */}
            <div>
               <h4 style={{ marginBottom: '0.8rem', fontSize: '1.1rem', color: '#fff' }}>ช่องทางการติดต่อ</h4>
               <p style={{ marginBottom: '0.3rem' }}>เบอร์โทรศัพท์ 03 3333 3333</p>
               <p>อีเมล Born2Code@coe.co.th</p>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}