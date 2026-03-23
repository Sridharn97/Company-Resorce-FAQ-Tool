import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function UserMenu({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className={styles.authLinks}>
        <Link href="/login" className={styles.navLink}>Login</Link>
        <Link href="/signup" className={styles.signupButton}>Sign Up</Link>
      </div>
    );
  }

  return (
    <div className={styles.userMenuContainer} ref={menuRef}>
      <button 
        className={styles.userMenuTrigger} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles.userAvatar}>
          {user.email[0].toUpperCase()}
        </div>
        <span className={styles.userEmail}>{user.email}</span>
      </button>


      {isOpen && (
        <div className={styles.userDropdown}>
          {user.role === 'admin' && (
            <Link href="/admin/dashboard" className={styles.dropdownItem} onClick={() => setIsOpen(false)}>
              Admin Dashboard
            </Link>
          )}
          <button className={styles.logoutButton} onClick={() => { onLogout(); setIsOpen(false); }}>
            Logout
          </button>
        </div>
      )}

    </div>
  );
}
