import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building, LayoutDashboard, Settings, Search, Bell, LogOut, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch live user data from the backend API we just created!
  useEffect(() => {
    if (activeTab === 'users') {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const { data } = await api.get('/admin/users');
          setUsers(data);
        } catch (error) {
          console.error("Failed to fetch users:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUsers();
    }
  }, [activeTab]);

  return (
    <div style={styles.container}>
      {/* LEFT SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}><LayoutDashboard size={20} color="white" /></div>
          <h2 style={styles.logoText}>AdminPanel</h2>
        </div>

        <nav style={styles.navMenu}>
          <p style={styles.menuLabel}>MAIN MENU</p>
          
          <button 
            style={{...styles.navItem, ...(activeTab === 'dashboard' ? styles.activeNavItem : {})}}
            onClick={() => setActiveTab('dashboard')}
          >
            <Activity size={18} /> Overview
          </button>
          
          <button 
            style={{...styles.navItem, ...(activeTab === 'users' ? styles.activeNavItem : {})}}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Manage Users
          </button>
          
          <button 
            style={{...styles.navItem, ...(activeTab === 'properties' ? styles.activeNavItem : {})}}
            onClick={() => setActiveTab('properties')}
          >
            <Building size={18} /> Properties
          </button>
          
          <button 
            style={{...styles.navItem, ...(activeTab === 'settings' ? styles.activeNavItem : {})}}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} /> System Settings
          </button>
        </nav>

        <div style={styles.bottomNav}>
          <button style={styles.logoutBtn} onClick={() => navigate('/')}>
            <LogOut size={18} /> Exit Admin
          </button>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div style={styles.mainContent}>
        {/* Top Header */}
        <header style={styles.header}>
          <div style={styles.searchBar}>
            <Search size={18} color="#9ca3af" />
            <input type="text" placeholder="Search anything..." style={styles.searchInput} />
          </div>
          <div style={styles.headerRight}>
            <button style={styles.iconBtn}><Bell size={20} /></button>
            <div style={styles.adminAvatar}>A</div>
          </div>
        </header>

        {/* Content Area */}
        <div style={styles.contentArea}>
          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>User Management</h1>
                <button className="btn btn-primary">Add New User</button>
              </div>
              
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Gender</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                          <Activity size={24} style={{ animation: 'spin 2s linear infinite' }} />
                          <p>Loading real users from database...</p>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                          <p>No users found in the database.</p>
                        </td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user.id} style={styles.tr}>
                          <td style={styles.td}>#{user.id}</td>
                          <td style={styles.td}><strong>{user.name}</strong></td>
                          <td style={styles.td}>{user.email}</td>
                          <td style = {styles.td}>{user.gender}</td>
                          <td style={styles.td}>{user.role}</td>
                          <td style={styles.td}>
                            <span style={{
                              ...styles.statusBadge, 
                              backgroundColor: user.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: user.status === 'Active' ? '#10b981' : '#f59e0b'
                            }}>
                              {user.status}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <button style={styles.actionBtn}>Edit</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab !== 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.emptyState}>
              <Activity size={48} color="#6b7280" style={{ marginBottom: '20px' }} />
              <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section</h2>
              <p style={{ color: '#9ca3af', marginTop: '10px' }}>This section is currently under development.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

// Vanilla React Inline Styles for extremely fast and isolated component rendering
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#0f172a',
    color: 'white',
    fontFamily: "'Outfit', sans-serif",
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 9999, // Sit above everything including the standard Navbar
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#1e1b4b',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '40px',
    padding: '10px',
  },
  logoIcon: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: 0,
  },
  navMenu: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  menuLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: '1px',
    marginBottom: '10px',
    paddingLeft: '10px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 15px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#9ca3af',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  activeNavItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
  },
  bottomNav: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '20px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 15px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    height: '80px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    backgroundColor: '#0f172a',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: '10px 15px',
    borderRadius: '20px',
    width: '300px',
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: 'white',
    outline: 'none',
    width: '100%',
    fontSize: '0.9rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  iconBtn: {
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
  },
  adminAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
  contentArea: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  pageTitle: {
    fontSize: '1.8rem',
    fontWeight: '700',
    margin: 0,
  },
  tableContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '20px',
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    color: '#9ca3af',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
  },
  td: {
    padding: '20px',
    fontSize: '0.95rem',
    color: '#e2e8f0',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  actionBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    padding: '6px 15px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '12px',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
  }
};

export default AdminDashboard;
