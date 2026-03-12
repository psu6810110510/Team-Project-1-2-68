import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import '../styles/Cart.css';
import qrImage from '../assets/QR.png';

interface CartItem {
  id: number;
  courseId: number;
  courseName: string;
  teacherName: string;
  price: number;
  imageUrl?: string;
  duration: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showQrPopup, setShowQrPopup] = useState(false);

  useEffect(() => {
    // โหลดข้อมูลผู้ใช้
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // โหลดข้อมูลตะกร้า (ตอนนี้ใช้ข้อมูลตัวอย่าง)
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    } else {
      // ข้อมูลตัวอย่างสำหรับทดสอบ
      const sampleCart: CartItem[] = [
        {
          id: 1,
          courseId: 101,
          courseName: 'React และ TypeScript สำหรับมือใหม่',
          teacherName: 'อาจารย์สมชาย',
          price: 1500,
          duration: '8 สัปดาห์',
        },
        {
          id: 2,
          courseId: 102,
          courseName: 'NestJS Backend Development',
          teacherName: 'อาจารย์สมหญิง',
          price: 2000,
          duration: '10 สัปดาห์',
        },
      ];
      setCartItems(sampleCart);
    }
  }, []);

  const handleSelectItem = (itemId: number) => {
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

  const handleRemoveItem = (itemId: number) => {
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

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('กรุณาเลือกคอร์สที่ต้องการชำระเงิน');
      return;
    }
    setShowQrPopup(true);
  };

  const handleConfirmPayment = () => {
    setShowQrPopup(false);
    // ลบคอร์สที่ชำระเงินออกจากตะกร้า
    const remainingItems = cartItems.filter(item => !selectedItems.includes(item.id));
    setCartItems(remainingItems);
    setSelectedItems([]);
    localStorage.setItem('cart', JSON.stringify(remainingItems));
    alert('ชำระเงินสำเร็จ! ขอบคุณค่ะ');
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
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.courseName} />
                      ) : (
                        <div className="placeholder-image">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="item-details">
                      <h3 className="item-name">{item.courseName}</h3>
                      <p className="item-teacher">ผู้สอน: {item.teacherName}</p>
                      <p className="item-duration">ระยะเวลา: {item.duration}</p>
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
                  disabled={selectedItems.length === 0}
                >
                  ชำระเงิน
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* QR Code Payment Popup */}
      {showQrPopup && (
        <div className="qr-overlay" onClick={() => setShowQrPopup(false)}>
          <div className="qr-popup" onClick={(e) => e.stopPropagation()}>
            <button className="qr-close-btn" onClick={() => setShowQrPopup(false)}>
              &times;
            </button>
            <h2 className="qr-title">สแกน QR Code เพื่อชำระเงิน</h2>
            <div className="qr-image-container">
              <img src={qrImage} alt="QR Code สำหรับชำระเงิน" className="qr-image" />
            </div>
            <div className="qr-total">
              ยอดรวม: <span className="qr-amount">{calculateTotal().toLocaleString()}</span> บาท
            </div>
            <button className="qr-confirm-btn" onClick={handleConfirmPayment}>
              ยืนยันการชำระเงิน
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
