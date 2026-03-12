import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../styles/Cart.css';
import qrImage from '../assets/qr.png';
import { paymentAPI } from '../api/paymentAPI';

interface CartItem {
  id: string;
  title: string;
  instructor_name?: string;
  price: number;
  thumbnail_url?: string;
  is_online?: boolean;
  is_onsite?: boolean;
}

type ModalStep = 'qr' | 'success';

export default function Cart() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // ใช้ string[] ตาม id ของ item
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('qr');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);

  useEffect(() => {
    // โหลดข้อมูลผู้ใช้
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // โหลดข้อมูลตะกร้า
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const handleSelectItem = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.id));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    setSelectedItems(selectedItems.filter(id => id !== itemId));
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const calculateTotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
  };

  // ฟังก์ชัน Checkout หลัก (เชื่อมต่อ API)
  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      alert('กรุณาเลือกคอร์สที่ต้องการชำระเงิน');
      return;
    }
    
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนชำระเงิน');
      navigate('/login');
      return;
    }

    const itemsToCheckout = cartItems.filter(item => selectedItems.includes(item.id));

    try {
      setSubmitting(true);
      const res = await paymentAPI.createPayment({
        user_id: user.id,
        user_name: user.full_name || user.email,
        user_email: user.email,
        course_ids: itemsToCheckout.map(i => i.id),
        course_titles: itemsToCheckout.map(i => i.title),
        course_prices: itemsToCheckout.map(i => i.price),
        total_amount: calculateTotal(),
      });
      setPaymentId(res.data.id);
      setModalStep('qr');
      setShowPaymentModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!paymentId) return;
    if (!slipFile) {
      alert('กรุณาแนบสลิปการโอนเงินก่อนกดตรวจสอบ');
      return;
    }
    try {
      setSubmitting(true);
      await paymentAPI.submitPayment(paymentId, slipFile);
      setModalStep('success');
      
      // ลบคอร์สที่ชำระเงินสำเร็จออกจากตะกร้า
      const remaining = cartItems.filter(item => !selectedItems.includes(item.id));
      setCartItems(remaining);
      setSelectedItems([]);
      localStorage.setItem('cart', JSON.stringify(remaining));
      
    } catch (err: any) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowPaymentModal(false);
    setPaymentId(null);
    setModalStep('qr');
    setSlipFile(null);
    setSlipPreview(null);
  };

  return (
    <div className="cart-page">
      <Header user={user} />
      
      <main className="cart-main">
        <div className="cart-container">
          <h1 className="cart-title">ตะกร้าคอร์สเรียน</h1>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
              <p>ตะกร้าของคุณว่างเปล่า</p>
              <button className="browse-courses-btn" onClick={() => navigate('/courses')}>
                เรียกดูคอร์สทั้งหมด
              </button>
            </div>
          ) : (
            <>
              <div className="cart-header">
                <label className="select-all-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === cartItems.length}
                    onChange={handleSelectAll}
                  />
                  <span>เลือกทั้งหมด ({cartItems.length} คอร์ส)</span>
                </label>
              </div>

              <div className="cart-items">
                {cartItems.map(item => (
                  <div key={item.id} className="cart-item">
                    <input
                      type="checkbox"
                      className="item-checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                    
                    <div className="item-image">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt={item.title} />
                      ) : (
                        <div className="placeholder-image">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{item.title}</h3>
                      {item.instructor_name && (
                        <p className="item-teacher">ผู้สอน: {item.instructor_name}</p>
                      )}
                      <p className="item-duration">
                        {item.is_online && item.is_onsite
                          ? 'ออนไลน์ / ออนไซต์'
                          : item.is_online
                          ? 'ออนไลน์'
                          : item.is_onsite
                          ? 'ออนไซต์'
                          : ''}
                      </p>
                    </div>

                    <div className="item-price">
                      <span className="price-amount">{item.price.toLocaleString()}</span>
                      <span className="price-currency">บาท</span>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      aria-label="ลบรายการ"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-details">
                  <p className="summary-text">
                    คอร์สที่เลือก: <strong>{selectedItems.length}</strong> รายการ
                  </p>
                  <p className="summary-total">
                    ยอดรวม: <strong>{calculateTotal().toLocaleString()}</strong> บาท
                  </p>
                </div>
                <button 
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0 || submitting}
                >
                  {submitting ? 'กำลังดำเนินการ...' : 'ชำระเงิน'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* QR Payment Modal (เชื่อมต่อ API เรียบร้อย) */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', maxWidth: '480px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: '#0A1C39', color: 'white', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                {modalStep === 'qr' ? '💳 ชำระเงินผ่าน QR Code' : '✅ ส่งหลักฐานเรียบร้อย'}
              </h2>
              <button onClick={closeModal} style={{
                background: 'transparent', border: 'none', color: 'white',
                fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1
              }}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '28px 24px', textAlign: 'center', maxHeight: '80vh', overflowY: 'auto' }}>
              {modalStep === 'qr' ? (
                <>
                  <p style={{ margin: '0 0 16px', color: '#475569', fontSize: '0.95rem' }}>
                    สแกน QR Code เพื่อชำระเงิน แล้วกดปุ่มด้านล่างเมื่อชำระเสร็จแล้ว
                  </p>

                  {/* QR Code Image */}
                  <div style={{
                    background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px',
                    padding: '16px', display: 'inline-block', marginBottom: '20px'
                  }}>
                    <img
                      src={qrImage}
                      alt="QR Code สำหรับชำระเงิน"
                      style={{ width: '220px', height: '220px', objectFit: 'contain', display: 'block' }}
                    />
                  </div>

                  {/* Total Amount */}
                  <div style={{
                    background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px',
                    padding: '6px 12px', marginBottom: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      ยอดชำระทั้งหมด ({cartItems.filter(i => selectedItems.includes(i.id)).length} คอร์ส)
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#15803d' }}>
                      {calculateTotal().toLocaleString()} บาท
                    </span>
                  </div>

                  {/* Course list */}
                  <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                    {cartItems.filter(i => selectedItems.includes(i.id)).map(item => (
                      <div key={item.id} style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '8px 0', borderBottom: '1px solid #f1f5f9',
                        fontSize: '0.9rem', color: '#334155'
                      }}>
                        <span style={{ flex: 1, marginRight: '12px' }}>{item.title}</span>
                        <span style={{ fontWeight: '600', color: '#0A1C39', whiteSpace: 'nowrap' }}>
                          {item.price.toLocaleString()} บาท
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Slip Upload */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      minHeight: '2cm', padding: '10px', border: '1.5px dashed #cbd5e1', borderRadius: '8px',
                      cursor: 'pointer', background: slipFile ? '#f0fdf4' : '#f8fafc',
                      borderColor: slipFile ? '#86efac' : '#cbd5e1',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSlipFile(file);
                            const reader = new FileReader();
                            reader.onload = (ev) => setSlipPreview(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {slipPreview ? (
                        <img src={slipPreview} alt="Slip Preview" style={{ maxHeight: '100px', objectFit: 'contain', marginBottom: '8px' }} />
                      ) : null}
                      <span style={{ fontSize: '0.88rem', color: slipFile ? '#16a34a' : '#64748b' }}>
                        {slipFile ? `✅ ${slipFile.name} (คลิกเพื่อเปลี่ยน)` : 'แนบสลิปการโอนเงิน'}
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleVerifyPayment}
                    disabled={submitting || !slipFile}
                    style={{
                      width: '100%', padding: '14px',
                      background: (!slipFile || submitting) ? '#94a3b8' : '#16a34a',
                      color: 'white', border: 'none', borderRadius: '10px',
                      fontSize: '1rem', fontWeight: 'bold',
                      cursor: (!slipFile || submitting) ? 'not-allowed' : 'pointer',
                      opacity: 1, transition: 'background 0.2s'
                    }}
                  >
                    {submitting ? 'กำลังส่งข้อมูล...' : !slipFile ? '📎 กรุณาแนบสลิปก่อน' : '✅ ตรวจสอบการชำระเงิน'}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#0A1C39', marginBottom: '12px' }}>
                    ส่งข้อมูลการชำระเงินเรียบร้อยแล้ว!
                  </h3>
                  <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: 1.6 }}>
                    ระบบได้รับข้อมูลการชำระเงินของคุณแล้ว<br />
                    รอแอดมินตรวจสอบและยืนยัน จากนั้นคุณจะสามารถ<br />
                    เข้าถึงคอร์สได้ทันที
                  </p>
                  <button
                    onClick={() => { closeModal(); navigate('/courses'); }}
                    style={{
                      width: '100%', padding: '14px', background: '#0A1C39',
                      color: 'white', border: 'none', borderRadius: '10px',
                      fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    กลับหน้าคอร์สทั้งหมด
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}