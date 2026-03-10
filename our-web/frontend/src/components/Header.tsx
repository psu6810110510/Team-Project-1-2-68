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
                  onClick={() => {
                    let path = '/profile';
                    if (user?.role === 'ADMIN' || user?.role === 'admin') path = '/admin-dashboard';
                    else if (user?.role === 'TEACHER' || user?.role === 'teacher') path = '/teacher-dashboard';
                    else {
                      try {
                        const stored = localStorage.getItem('user');
                        if (stored) {
                          const parsed = JSON.parse(stored);
                          if (parsed.role === 'ADMIN') path = '/admin-dashboard';
                          else if (parsed.role === 'TEACHER') path = '/teacher-dashboard';
                        }
                      } catch(e) {}
                    }
                    handleMenuClick(path);
                  }}
                >
                  <span className="menu-text">บริการผู้ใช้งาน</span>
                </button>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <button 
            className="cart-btn"
            onClick={() => navigate('/cart')}
            aria-label="Shopping Cart"
          >
            <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>

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
