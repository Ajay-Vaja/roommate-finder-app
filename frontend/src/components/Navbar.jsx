import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { Home, Users, Building, LayoutDashboard, UserCircle, LogOut, Shield, Plus, Calendar, Bell, Heart } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Add a nice glass effect when the user scrolls down the page
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide the standard Navbar on the completely custom Admin Dashboard or for Admin users
  if (location.pathname === '/admin-dashboard' || user?.role === 'Admin') {
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
          <span style={styles.logoText}>FindMyStay</span>
        </Link>

        {/* Role-Based Navigation Links */}
        <ul style={styles.navLinks}>
          <li>
            <Link to="/properties" style={styles.link}>
              <Building size={18} /> Properties
            </Link>
          </li>
          
          {user ? (
            <>
              {/* Seeker Specific Links */}
              {user.user_type === 'Seeker' && (
                <>
                  <li>
                    <Link to="/matches" style={styles.link}>
                      <Users size={18} /> Matches
                    </Link>
                  </li>
                  <li>
                    <Link to="/my-appointments" style={styles.link}>
                      <Calendar size={18} /> Appointments
                    </Link>
                  </li>
                </>
              )}

              {/* Lister Specific Links */}
              {user.user_type === 'Lister' && (
                <>
                  <li>
                    <Link to="/manage-properties" style={styles.link}>
                      <LayoutDashboard size={18} /> Manage Listings
                    </Link>
                  </li>
                  <li>
                    <Link to="/visit-requests" style={styles.link}>
                      <Bell size={18} /> Visit Requests 
                      <span style={styles.dot}></span>
                    </Link>
                  </li>
                </>
              )}

              {/* Separate Profile Link as requested */}
              <li>
                <Link to="/profile" style={styles.link}>
                  <UserCircle size={18} /> Profile
                </Link>
              </li>
              
              {/* Universal Profile Dropdown Control */}
              <li style={{ position: 'relative' }}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  style={styles.profileTrigger}
                >
                  <div style={styles.avatarWrapper}>
                    {user?.profile_pic ? (
                      <img src={user.profile_pic} style={styles.avatarImg} alt="Profile" />
                    ) : (
                      <UserCircle size={20} color="white" />
                    )}
                  </div>
                  <span>Profile</span>
                </button>

                {/* Glassmorphic Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      style={styles.dropdownMenu}
                    >
                      <div style={styles.dropdownHeader}>
                        <p style={styles.userName}>{user.name}</p>
                        <p style={styles.userRole}>{user.user_type}</p>
                      </div>
                      
                      <Link to="/profile" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                        <UserCircle size={16} /> My Profile
                      </Link>

                      {user.user_type === 'Seeker' && (
                        <Link to="/saved-properties" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                          <Heart size={16} /> Saved Items
                        </Link>
                      )}

                      {user.user_type === 'Lister' && (
                        <>
                          <Link to="/manage-properties" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                            <LayoutDashboard size={16} /> Manage Listings
                          </Link>
                          <Link to="/post-property" style={styles.dropdownItem} onClick={() => setDropdownOpen(false)}>
                            <Plus size={16} /> List Property
                          </Link>
                        </>
                      )}

                      <div style={styles.divider}></div>
                      
                      <button 
                        onClick={() => {
                          logout();
                          setDropdownOpen(false);
                          navigate('/');
                          toast.success("Logged out successfully");
                        }} 
                        style={styles.logoutAction}
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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
  },
  profileTrigger: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: '40px', color: 'white', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' },
  avatarWrapper: { width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  dot: { width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', position: 'absolute', top: '-2px', right: '-2px', border: '2px solid #0f172a' },
  
  dropdownMenu: { position: 'absolute', top: '120%', right: 0, width: '220px', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 1001 },
  dropdownHeader: { padding: '0 10px 15px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px' },
  userName: { margin: 0, fontSize: '0.95rem', fontWeight: '700', color: 'white' },
  userRole: { margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  dropdownItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.2s', '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' } },
  divider: { height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '10px 0' },
  logoutAction: { width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: 'none', background: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', borderRadius: '10px', '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.1)' } }
};

export default Navbar;
