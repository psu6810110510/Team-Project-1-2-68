import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import logoname from '../assets/name.png';
import '../styles/Header.css';

interface HeaderProps {
  user?: {
    email: string;
    role: string;
    id: number;
    profileImage?: string;
  };
}

export default function Header({ user }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ปิดเมนูเมื่อคลิกข้างนอก
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuClick = (path: string) => {
    setIsMenuOpen(false);
    if (path) {
      navigate(path);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" />
          <img src={logoname} alt="Logo Name" className="logo-name" onClick={() => navigate('/dashboard')} />
        </div>
        
        <div className="header-right">
          {/* Hamburger Menu */}
          <div className="menu-wrapper" ref={menuRef}>
            <button 
              className="hamburger-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
              <span className="hamburger-line"></span>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="dropdown-menu">
                <button 
                  className="menu-item"
                  onClick={() => handleMenuClick('/courses')}
                >
                  <span className="menu-text">คอร์สทั้งหมด</span>
                </button>
                <button 
                  className="menu-item"
                  onClick={() => handleMenuClick('/instructors')}
                >
                  <span className="menu-text">ประวัติผู้สอน</span>
                </button>
                <button 
                  className="menu-item"
                  onClick={() => handleMenuClick('/profile')}
                >
                  <span className="menu-text">บริการผู้ใช้งาน</span>
                </button>
              </div>
            )}
          </div>

          <div className="profile-section">
            {user?.profileImage ? (
              <img 
                src={user.profileImage} 
                alt="Profile" 
                className="profile-image"
              />
            ) : (
              <div className="profile-image default-profile">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
