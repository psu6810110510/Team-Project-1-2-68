import React from 'react';
import '../styles/Footer.css';
import logo2 from '../assets/logo2.png';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-accent-line"></div>
      <div className="footer-inner">
        {/* Row 1: Brand + Slogan */}
        <div className="footer-top-row">
          <div className="footer-brand">
            <img src={logo2} alt="Born2Code Logo" className="footer-logo" />
            <span className="footer-brand-name">Born2Code</span>
          </div>
          <p className="footer-slogan">
            "ตัวช่วยที่จะทำให้คุณประสบความสำเร็จทางด้านคอมพิวเตอร์"
          </p>
        </div>

        {/* Row 2: Address+Hours (left) | Contact (right) */}
        <div className="footer-bottom-row">
          <div className="footer-left">
            <div className="footer-block">
              <h4 className="footer-label">ที่อยู่</h4>
              <p className="footer-text">
                สถาบันบอร์นทูโค้ด เลขที่ 15 ถ.กาญจนวณิชย์<br />
                อ.หาดใหญ่ จ.สงขลา 90110
              </p>
            </div>
            <div className="footer-block">
              <h4 className="footer-label">เวลาเปิดทำการ</h4>
              <p className="footer-text">
                จ.-ศ. 16.00 – 21.00<br />
                ส.-อา. 8.00 – 21.00
              </p>
            </div>
          </div>
          <div className="footer-right">
            <div className="footer-block">
              <h4 className="footer-label">ช่องทางการติดต่อ</h4>
              <p className="footer-text">
                เบอร์โทรศัพท์ 03 3333 3333<br />
                อีเมล Born2Code@coe.co.th
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;