import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/authAPI';
import '../styles/LoginTheme.css'; // ใช้ CSS ตัวเดียวกับ Login ได้เลย
import { Search, ShoppingCart, Menu, User} from 'lucide-react';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      // รวมชื่อ-สกุล เป็น fullName เพื่อส่งให้ API
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      await authAPI.register(formData.email, formData.password, fullName);
      
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'การสมัครสมาชิกผิดพลาด');
    } finally {
      setLoading(false);
    }
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

        {/* ... ส่วนไอคอนด้านขวา ... */}

      {/* ไอคอนด้านขวา (เหมือนเดิม) */}
      <div className="nav-icons">
        <Search className="nav-icon" size={24} />
        <ShoppingCart className="nav-icon" size={24} />
        <Menu className="nav-icon" size={24} />
        <User className="nav-icon" size={24} />
      </div>
    </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="login-card" style={{ maxWidth: '500px' }}> {/* ขยายการ์ดนิดหน่อย */}
          <h1 className="login-title">สร้างบัญชีใหม่</h1>
          
          {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

          <form onSubmit={handleRegister}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <input name="firstName" placeholder="ชื่อ" className="form-input" onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <input name="lastName" placeholder="นามสกุล" className="form-input" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <input name="email" type="email" placeholder="อีเมล" className="form-input" onChange={handleChange} required />
            </div>

            <div className="form-group">
              <input name="phone" type="tel" placeholder="เบอร์โทรศัพท์" className="form-input" onChange={handleChange} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <input name="password" type="password" placeholder="รหัสผ่าน" className="form-input" onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <input name="confirmPassword" type="password" placeholder="ยืนยันรหัสผ่าน" className="form-input" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-options" style={{ justifyContent: 'center' }}>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <input type="checkbox" required /> ฉันยอมรับเงื่อนไขและข้อตกลงการใช้งาน
              </label>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p style={{marginTop: '1rem', fontSize: '0.9rem', color: '#666'}}>
            มีบัญชีอยู่แล้ว? <span style={{color: '#0f172a', fontWeight: 'bold', cursor: 'pointer'}} onClick={() => navigate('/login')}>เข้าสู่ระบบ</span>
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