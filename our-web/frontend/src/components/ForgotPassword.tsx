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
        <div className="footer-content">
          {/* คอลัมน์ที่ 1: Born2Code */}
          <div className="footer-column" style={{ flex: 1.5 }}> {/* ให้คอลัมน์แรกกว้างกว่านิดหน่อย */}
            <h4 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Born2Code
            </h4>
            <p>
              "Born2Code ตัวช่วยที่จะทำให้คุณประสบความสำเร็จทางด้านคอมพิวเตอร์"
            </p>
          </div>

          {/* คอลัมน์ที่ 2: ที่อยู่ */}
          <div className="footer-column">
            <h4>ที่อยู่</h4>
            <p>มหาวิทยาลัยสงขลานครินทร์ 15 กาญจนวณิชย์</p>
            <p>คอหงส์ หาดใหญ่ สงขลา 90110</p>
          </div>

          {/* คอลัมน์ที่ 3: ช่องทางการติดต่อ */}
          <div className="footer-column">
            <h4>ช่องทางการติดต่อ</h4>
            <p>เบอร์โทรศัพท์: 08-XXXX-XXXX</p>
            <p>อีเมล: Born2Code@psu.ac.th</p>
          </div>
        </div>
      </footer>
    </div>
  );
}