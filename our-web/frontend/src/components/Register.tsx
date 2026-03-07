/* ไฟล์ src/components/Register.tsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { authAPI } from '../api/authAPI'; // ถ้าไม่ได้ใช้ ลบออกได้ครับ
import '../styles/LoginTheme.css'; 
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
    confirmPassword: '',
    role: 'STUDENT' // ✅ 1. เพิ่ม role ลงใน State เริ่มต้นเป็นนักเรียน
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      // 1. รวมชื่อ + นามสกุล
      const fullName = `${formData.firstName} ${formData.lastName}`;
      
      // 2. เปลี่ยนมาใช้ fetch ยิงตรง เพื่อส่งข้อมูลให้ครบ
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: fullName, 
          phone: formData.phone, 
          role: formData.role, // ✅ 2. ส่งค่า role (TEACHER/STUDENT) ไปให้ Backend
        }),
      });

      if (!response.ok) {
        // ถ้า Backend ตอบกลับมาว่า Error (เช่น อีเมลซ้ำ)
        const errorData = await response.json();
        throw new Error(errorData.message || 'การสมัครสมาชิกผิดพลาด');
      }
      
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/login');

    } catch (err: any) {
      // จับ Error มาโชว์
      setError(err.message || 'การสมัครสมาชิกผิดพลาด');
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

      {/* Main Content */}
      <main className="main-content">
        <div className="login-card" style={{ maxWidth: '500px' }}>
          <h1 className="login-title">สร้างบัญชีใหม่</h1>
          
          {error && <div style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}

          <form onSubmit={handleRegister}>
            {/* ✅ 3. ช่องเลือกประเภทบัญชี (Role) */}
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="form-input"
                style={{ 
                  appearance: 'auto', // ทำให้เห็นลูกศรชี้ลงของ Dropdown
                  cursor: 'pointer', 
                  color: '#0f172a',
                  fontWeight: '500',
                  backgroundColor: '#f8fafc'
                }}
              >
                <option value="STUDENT">👨‍🎓 สมัครเป็นผู้เรียน (Student)</option>
                <option value="TEACHER">👨‍🏫 สมัครเป็นผู้สอน (Teacher)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <input name="firstName" value={formData.firstName} placeholder="ชื่อ" className="form-input" onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <input name="lastName" value={formData.lastName} placeholder="นามสกุล" className="form-input" onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <input name="email" value={formData.email} type="email" placeholder="อีเมล" className="form-input" onChange={handleChange} required />
            </div>

            {/* ช่องกรอกเบอร์โทร */}
            <div className="form-group">
              <input name="phone" value={formData.phone} type="tel" placeholder="เบอร์โทรศัพท์" className="form-input" onChange={handleChange} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <input name="password" value={formData.password} type="password" placeholder="รหัสผ่าน" className="form-input" onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <input name="confirmPassword" value={formData.confirmPassword} type="password" placeholder="ยืนยันรหัสผ่าน" className="form-input" onChange={handleChange} required />
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

          <p style={{marginTop: '1rem', fontSize: '0.9rem', color: '#666', textAlign: 'center'}}>
            มีบัญชีอยู่แล้ว? <span style={{color: '#0f172a', fontWeight: 'bold', cursor: 'pointer'}} onClick={() => navigate('/login')}>เข้าสู่ระบบ</span>
          </p>
        </div>
      </main>

      {/* --- Footer (ส่วนล่างสุด) --- */}
      <footer className="footer">
        <div className="footer-content" style={{ flexDirection: 'column', gap: '2rem' }}>
          
          {/* ส่วนบน: โลโก้ + สโลแกน */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <img src={fullLogo} alt="Logo" style={{ height: '50px' }} />
            <span style={{ fontSize: '1rem', fontWeight: '500', color: '#fff' }}>
              “ ตัวช่วยที่จะทำให้คุณประสบความสำเร็จทางด้านคอมพิวเตอร์”
            </span>
          </div>

          {/* เส้นขีดคั่นบางๆ */}
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