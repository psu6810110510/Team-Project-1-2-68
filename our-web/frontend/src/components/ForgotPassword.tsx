import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginTheme.css';
import { Search, ShoppingCart, Menu, User } from 'lucide-react';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';
import Footer from './Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`ระบบส่งลิงก์รีเซ็ตรหัสผ่านไปที่ ${email} แล้ว (Simulation)`);
    // ในอนาคตต้องเรียก API ตรงนี้
  };

  return (
    <div className="page-container">
      {/* --- Header (Navbar) --- */}
      <nav className="navbar">
        {/* ส่วนโลโก้ */}
        <div className="nav-logo">
          <img src={logoImage} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />
          <img src={fullLogo} alt="Born2Code Logo" style={{ height: '50px', width: 'auto' }} />
        </div>

        {/* ไอคอนด้านขวา */}
        <div className="nav-icons">
          <Search className="nav-icon" size={24} />
          <ShoppingCart className="nav-icon" size={24} />
          <Menu className="nav-icon" size={24} />
          <User className="nav-icon" size={24} />
        </div>
      </nav>

      <main className="main-content">
        <div className="login-card">
          <h1 className="login-title">ลืมรหัสผ่าน?</h1>
          <p style={{ marginBottom: '20px', color: '#666' }}>กรุณากรอกอีเมลของคุณเพื่อรับลิงก์สำหรับรีเซ็ตรหัสผ่าน</p>

          <form onSubmit={handleSubmit}>
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
            <button type="submit" className="btn-primary">รีเซ็ตรหัสผ่าน</button>
          </form>

          <p style={{ marginTop: '1rem', cursor: 'pointer', color: '#0f172a' }} onClick={() => navigate('/login')}>
            กลับไปหน้าเข้าสู่ระบบ
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}