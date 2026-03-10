import React from 'react';
import '../styles/Footer.css';
import logo2 from '../assets/logo2.png';

const Footer = () => {
  return (
    <footer className="footer">
      <img src={logo2} alt="Logo" className="footer-logo" />
    </footer>
  );
};

export default Footer;