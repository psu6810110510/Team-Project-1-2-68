/* ไฟล์ src/components/Register.tsx */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { authAPI } from '../api/authAPI'; // ถ้าไม่ได้ใช้ ลบออกได้ครับ
import '../styles/LoginTheme.css'; 
import { Search, ShoppingCart, Menu, User, Eye, EyeOff } from 'lucide-react';
import logoImage from '../assets/logo.png';
import fullLogo from '../assets/name.png';
import Footer from './Footer';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    bachelorDegree: '',
    masterDegree: '',
    doctorateDegree: '',
    expertise: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
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
          role: formData.role, // ✅ ส่งค่า role ที่ผู้ใช้เลือก (STUDENT หรือ TEACHER)
          ...(formData.role === 'TEACHER' && {
            bachelorDegree: formData.bachelorDegree,
            masterDegree: formData.masterDegree,
            doctorateDegree: formData.doctorateDegree,
            expertise: formData.expertise,
          })
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

            {formData.role === 'TEACHER' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                <div className="form-group">
                  <input name="bachelorDegree" value={formData.bachelorDegree} placeholder="ปริญญาตรี (สถาบัน/สาขา)" className="form-input" onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <input name="masterDegree" value={formData.masterDegree} placeholder="ปริญญาโท (ถ้ามี)" className="form-input" onChange={handleChange} />
                </div>
                <div className="form-group">
                  <input name="doctorateDegree" value={formData.doctorateDegree} placeholder="ปริญญาเอก (ถ้ามี)" className="form-input" onChange={handleChange} />
                </div>
                <div className="form-group">
                  <input name="expertise" value={formData.expertise} placeholder="ความเชี่ยวชาญ (เช่น React, Node.js)" className="form-input" onChange={handleChange} required />
                </div>
              </div>
            )}

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
              <div className="form-group" style={{ flex: 1, position: 'relative' }}>
                <input name="password" value={formData.password} type={showPassword ? 'text' : 'password'} placeholder="รหัสผ่าน" className="form-input" onChange={handleChange} required style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', color: '#94a3b8' }}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="form-group" style={{ flex: 1, position: 'relative' }}>
                <input name="confirmPassword" value={formData.confirmPassword} type={showConfirmPassword ? 'text' : 'password'} placeholder="ยืนยันรหัสผ่าน" className="form-input" onChange={handleChange} required style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', color: '#94a3b8' }}>
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-options" style={{ justifyContent: 'center' }}>
              <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                <input type="checkbox" required /> 
                ฉันยอมรับ
                <span 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTermsModal(true);
                  }}
                  style={{
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: '#0f172a',
                    fontWeight: '500'
                  }}
                >
                  เงื่อนไขและข้อตกลงการใช้งาน
                </span>
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

      <Footer />

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowTermsModal(false)}
        >
          <div 
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowTermsModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#64748b',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              ×
            </button>

            {/* Modal Content */}
            <div style={{ padding: '30px', overflowY: 'auto' }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                marginBottom: '20px',
                color: '#0f172a',
                textAlign: 'center'
              }}>
                ข้อตกลงและเงื่อนไขการใช้บริการสถาบันการเรียนรู้ Born2Code
              </h2>

              <div style={{ 
                lineHeight: '1.8', 
                color: '#334155',
                fontSize: '0.95rem'
              }}>
                <p style={{ marginBottom: '15px' }}>
                  ผู้ใช้บริการกรุณาอ่านและทำความเข้าใจข้อตกลงและเงื่อนไขการใช้บริการนี้อย่างละเอียดก่อนทำการสมัครสมาชิกและเข้าใช้งานเว็บไซต์ การที่ผู้ใช้บริการกดยอมรับเงื่อนไข หรือเข้าใช้บริการของสถาบันการเรียนรู้ Born2Code ถือว่าผู้ใช้บริการได้ยอมรับและตกลงที่จะผูกพันตามเงื่อนไขดังต่อไปนี้ทุกประการ
                </p>

                <h3 style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', color: '#0f172a' }}>
                  1. การสมัครสมาชิกและบัญชีผู้ใช้งาน
                </h3>
                <p style={{ marginBottom: '8px' }}>
                  ผู้ใช้บริการต้องให้ข้อมูลส่วนบุคคลที่ถูกต้อง ครบถ้วน และเป็นความจริงในการสมัครสมาชิก
                </p>
                <p style={{ marginBottom: '8px' }}>
                  ผู้ใช้บริการจะต้องเก็บรักษารหัสผ่านและข้อมูลบัญชีของตนเองไว้เป็นความลับ สถาบันฯ จะไม่รับผิดชอบต่อความเสียหายใด ๆ ที่เกิดขึ้นจากการเข้าถึงบัญชีโดยบุคคลที่สามอันเกิดจากความประมาทของผู้ใช้บริการ
                </p>
                <p style={{ marginBottom: '15px' }}>
                  บัญชีผู้ใช้งาน 1 บัญชี สงวนสิทธิ์สำหรับผู้ใช้งานเพียง 1 ท่านเท่านั้น ห้ามมิให้มีการแบ่งปันบัญชี หรือนำบัญชีไปให้บุคคลอื่นเข้าเรียนแทนโดยเด็ดขาด
                </p>

                <h3 style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', color: '#0f172a' }}>
                  2. ทรัพย์สินทางปัญญาและลิขสิทธิ์เนื้อหา
                </h3>
                <p style={{ marginBottom: '8px' }}>
                  เนื้อหา บทเรียน วิดีโอ เอกสารประกอบการเรียน รวมถึงชุดรหัสคำสั่งต้นแบบที่จัดทำโดย Born2Code ถือเป็นทรัพย์สินทางปัญญาของทางสถาบันฯ แต่เพียงผู้เดียว
                </p>
                <p style={{ marginBottom: '8px' }}>
                  ห้ามมิให้ผู้ใช้บริการทำซ้ำ ดัดแปลง เผยแพร่ ส่งต่อ หรือนำเนื้อหาและรหัสคำสั่งไปใช้เพื่อการค้า หรือกระทำการใด ๆ ที่เป็นการละเมิดลิขสิทธิ์โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษรจากทางสถาบันฯ
                </p>
                <p style={{ marginBottom: '15px' }}>
                  ผู้ใช้บริการสามารถนำความรู้และรหัสคำสั่งที่ได้จากการเรียนไปประยุกต์ใช้เพื่อการศึกษาและพัฒนาโปรเจกต์ส่วนตัวได้
                </p>

                <h3 style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', color: '#0f172a' }}>
                  3. จรรยาบรรณและข้อปฏิบัติในการใช้ระบบ
                </h3>
                <p style={{ marginBottom: '8px' }}>
                  ผู้ใช้บริการต้องไม่ใช้เซิร์ฟเวอร์ ระบบเครือข่าย หรือพื้นที่จำลองการเขียนโปรแกรมของทางสถาบันฯ ในการกระทำที่ผิดกฎหมาย หรือละเมิดสิทธิของผู้อื่น
                </p>
                <p style={{ marginBottom: '8px' }}>
                  ห้ามมิให้ผู้ใช้บริการนำความรู้ไปใช้ในทางที่ผิด จู่โจมระบบ ปล่อยมัลแวร์ หรือก่อกวนระบบคอมพิวเตอร์ของบุคคลอื่นหรือของทางสถาบันฯ
                </p>
                <p style={{ marginBottom: '15px' }}>
                  ผู้ใช้บริการจะต้องแสดงความเคารพต่อผู้สอนและผู้เรียนท่านอื่น ๆ ในพื้นที่สนทนาหรือในขณะทำการเรียนการสอนแบบออนไลน์
                </p>

                <h3 style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', color: '#0f172a' }}>
                  4. นโยบายการชำระเงินและการคืนเงิน
                </h3>
                <p style={{ marginBottom: '8px' }}>
                  ผู้ใช้บริการจะต้องชำระค่าธรรมเนียมการเรียนตามจำนวนและวิธีการที่สถาบันฯ กำหนดไว้ให้เสร็จสิ้นก่อนจึงจะสามารถเข้าถึงเนื้อหาบทเรียนได้
                </p>
                <p style={{ marginBottom: '15px' }}>
                  สถาบันฯ สงวนสิทธิ์ในการไม่คืนเงินค่าธรรมเนียมการเรียนในทุกกรณี เว้นแต่จะเกิดจากความผิดพลาดของระบบเว็บไซต์หรือทางสถาบันฯ ไม่สามารถจัดการเรียนการสอนได้ตามที่ระบุไว้
                </p>

                <h3 style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', color: '#0f172a' }}>
                  5. การจำกัดความรับผิดชอบ
                </h3>
                <p style={{ marginBottom: '8px' }}>
                  สถาบันฯ จะใช้ความพยายามอย่างเต็มที่ในการรักษาระบบเว็บไซต์ให้สามารถใช้งานได้ตามปกติ อย่างไรก็ตาม สถาบันฯ ไม่รับประกันว่าเว็บไซต์จะปราศจากข้อบกพร่องหรือการหยุดชะงักที่เกิดจากการบำรุงรักษาระบบ
                </p>
                <p style={{ marginBottom: '15px' }}>
                  สถาบันฯ จะไม่รับผิดชอบต่อความสูญหายของข้อมูลส่วนบุคคลหรือรหัสคำสั่งที่ผู้ใช้บริการบันทึกไว้ในระบบของสถาบันฯ อันเกิดจากเหตุสุดวิสัย
                </p>

                <h3 style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', color: '#0f172a' }}>
                  6. การระงับและการยกเลิกบัญชีผู้ใช้งาน
                </h3>
                <p style={{ marginBottom: '15px' }}>
                  สถาบันการเรียนรู้ Born2Code สงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีผู้ใช้งานได้ทันทีโดยไม่ต้องแจ้งให้ทราบล่วงหน้า หากตรวจสอบพบว่าผู้ใช้บริการละเมิดข้อตกลงและเงื่อนไขข้อใดข้อหนึ่งตามที่ระบุไว้ข้างต้น หรือกระทำการใด ๆ ที่ก่อให้เกิดความเสียหายต่อสถาบันฯ
                </p>

                <h3 style={{ fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', color: '#0f172a' }}>
                  7. การปรับปรุงแก้ไขข้อตกลง
                </h3>
                <p style={{ marginBottom: '15px' }}>
                  สถาบันฯ ขอสงวนสิทธิ์ในการแก้ไข เปลี่ยนแปลง หรือเพิ่มเติมข้อตกลงและเงื่อนไขการใช้บริการนี้ในเวลาใดก็ได้ โดยจะแจ้งให้ผู้ใช้บริการทราบผ่านทางหน้าเว็บไซต์
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}