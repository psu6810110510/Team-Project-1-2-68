import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginTheme.css';
import { Search, ShoppingCart, Menu, User } from 'lucide-react';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';

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
    {/* --- Header (Navbar) --- */ }
    <nav className="navbar">

        {/* ส่วนโลโก้ */}
        <div className="nav-logo">
          
          {/* 1. รูปโลโก้ (ที่แก้ใหม่) */}
          <img src={logoImage} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />

          {/* 2. ตัวหนังสือ Born2Code (ถ้าในรูป logo.png มีตัวหนังสือแล้ว ให้ลบส่วนนี้ทิ้งได้เลยครับ) */}
          <img src={fullLogo} alt="Born2Code Logo" style={{ height: '50px', width: 'auto' }} />
          
        </div>

      {/* ไอคอนด้านขวา (เหมือนเดิม) */}
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

      {/* ไฟล์: src/components/Login.tsx (และ Register.tsx) */}

{/* ... (ส่วน Main Content ด้านบน) ... */}

      {/* --- 3. Footer (ส่วนล่างสุด) --- */}
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