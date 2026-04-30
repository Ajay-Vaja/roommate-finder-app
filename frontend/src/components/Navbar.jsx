import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Home, Users, Building, LayoutDashboard, UserCircle, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Add a nice glass effect when the user scrolls down the page
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide the standard Navbar on the completely custom Admin Dashboard
  if (location.pathname === '/admin-dashboard') {
    return null;
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        ...styles.navbar,
        backgroundColor: scrolled ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.6)',
        boxShadow: '0 4px 30px -5px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="container" style={styles.navContainer}>
        {/* Logo Section */}
        <Link to="/" style={styles.logoGroup}>
          <div style={styles.logoIcon}>
            <Home size={22} color="white" />
          </div>
          <span style={styles.logoText}>RoommateFinder</span>
        </Link>

        {/* Links Section */}
        <ul style={styles.navLinks}>
          <li>
            <Link to="/properties" style={styles.link}>
              <Building size={18} /> Properties
            </Link>
          </li>
          
          {user ? (
            <>
              <li>
                <Link to="/matches" style={styles.link}>
                  <Users size={18} /> Matches
                </Link>
              </li>
              <li>
                <Link to="/dashboard" style={styles.link}>
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" style={styles.link}>
                  <UserCircle size={18} /> Profile
                </Link>
              </li>
              <li style={{ marginLeft: '10px' }}>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout} 
                  style={styles.logoutBtn}
                >
                  <LogOut size={18} /> Logout
                </motion.button>
              </li>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '15px', marginLeft: '10px' }}>
              <li>
                <Link to="/login" style={styles.loginBtn}>Sign In</Link>
              </li>
              <li>
                <Link to="/register" style={styles.signupBtn}>Get Started</Link>
              </li>
            </div>
          )}
        </ul>
      </div>
    </motion.nav>
  );
};

// Vanilla React Inline Styles for extremely fast and isolated component rendering
const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    padding: '15px 0',
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIcon: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(139, 92, 246, 0.4)'
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'white',
    letterSpacing: '-0.5px'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
    listStyle: 'none', /* THIS LINE REMOVES THE DOTS! */
    margin: 0,
    padding: 0
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#e2e8f0',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  loginBtn: {
    display: 'flex',
    alignItems: 'center',
    color: 'white',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    padding: '8px 16px',
  },
  signupBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    color: 'var(--text-main)',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '30px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.9rem',
  }
};

export default Navbar;
