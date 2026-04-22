import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={styles.navbar}>
      <div className="container" style={styles.navContainer}>
        <Link to="/" style={styles.logo}>RoommateFinder</Link>
        <ul style={styles.navLinks}>
          <li><Link to="/properties">Properties</Link></li>
          {user ? (
            <>
              <li><Link to="/matches">Matches</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><button onClick={logout} className="btn" style={styles.logoutBtn}>Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="btn">Login</Link></li>
              <li><Link to="/register" className="btn btn-primary">Sign Up</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  navContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '70px'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: 'var(--primary-color)'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: 'var(--text-main)',
    border: '1px solid #d1d5db'
  }
};

export default Navbar;
