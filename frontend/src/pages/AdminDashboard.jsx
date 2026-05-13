import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LayoutDashboard, Search, Bell, LogOut, Activity, Eye, X, Filter, Download, Trash2, CheckCircle, ChevronDown, Home, Briefcase, Clock, Shield, Calendar, RotateCcw, Sun, Moon, Camera, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';



const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const profileFileInputRef = React.useRef(null);
  const [users, setUsers] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('adminTheme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    localStorage.setItem('adminTheme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Dynamic Theme Colors
  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    sidebar: isDarkMode ? '#1e1b4b' : '#ffffff',
    header: isDarkMode ? '#0f172a' : '#ffffff',
    card: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
    text: isDarkMode ? 'white' : '#1e293b',
    textMuted: isDarkMode ? '#9ca3af' : '#64748b',
    border: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    filterBg: isDarkMode ? '#1e293b' : '#f1f5f9',
    tableHeader: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
    modalBg: isDarkMode ? '#1e293b' : '#ffffff',
    shadow: isDarkMode ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  };

  // Update inline styles with theme
  const getStyles = (t) => ({
    ...styles,
    container: { ...styles.container, backgroundColor: t.bg, color: t.text },
    sidebar: { ...styles.sidebar, backgroundColor: t.sidebar, borderRight: `1px solid ${t.border}` },
    header: { ...styles.header, backgroundColor: t.header, borderBottom: `1px solid ${t.border}` },
    headerTitle: { ...styles.headerTitle, color: t.text },
    mainContent: { ...styles.mainContent, backgroundColor: t.bg },
    statCard: { ...styles.statCard, backgroundColor: t.card, border: `1px solid ${t.border}`, color: t.text },
    statLabel: { ...styles.statLabel, color: t.textMuted },
    statValue: { ...styles.statValue, color: t.text },
    tableContainer: { ...styles.tableContainer, backgroundColor: t.card, border: `1px solid ${t.border}` },
    th: { ...styles.th, color: t.textMuted, borderBottom: `1px solid ${t.border}`, backgroundColor: t.tableHeader },
    tr: { ...styles.tr, borderBottom: `1px solid ${t.border}` },
    td: { ...styles.td, color: t.text },
    filterBar: { ...styles.filterBar, backgroundColor: t.card, border: `1px solid ${t.border}` },
    filterItem: { ...styles.filterItem, backgroundColor: t.filterBg, border: `1px solid ${t.border}` },
    filterSelect: { ...styles.filterSelect, backgroundColor: t.filterBg, color: t.text },
    integratedSearchInput: { ...styles.integratedSearchInput, color: t.text },
    navItem: { ...styles.navItem, color: t.textMuted },
    menuLabel: { ...styles.menuLabel, color: t.textMuted },
    logoutBtn: { ...styles.logoutBtn, color: '#ef4444' }, // Keep logout red
    modalContent: { ...styles.modalContent, backgroundColor: t.modalBg, border: `1px solid ${t.border}`, color: t.text, boxShadow: t.shadow },
    modalHeader: { ...styles.modalHeader, borderBottom: `1px solid ${t.border}` },
    modalTitle: { ...styles.modalTitle, color: t.text },
    detailLabel: { ...styles.detailLabel, color: t.textMuted },
    detailValue: { ...styles.detailValue, color: t.text },
    confirmModal: { ...styles.confirmModal, backgroundColor: t.modalBg, border: `1px solid ${t.border}`, color: t.text },
    confirmTitle: { ...styles.confirmTitle, color: t.text },
    confirmMessage: { ...styles.confirmMessage, color: t.textMuted },
  });

  const currentStyles = getStyles(theme);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null); // For sparkline tooltip
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    gender: 'all',
    role: 'all',
    userType: 'all',
    status: 'all',
    city: 'all',
    occupation: 'all',
    ageRange: 'all',
    onboarding: 'all'
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleExit = () => {
    logout();
    localStorage.setItem('showLogout', 'true');
    navigate('/login');
  };

  const renderValue = (val) => {
    if (!val || val === 'Not specified' || val === 'Any' || val === 'N/A') {
      return <span style={{ color: '#475569', fontStyle: 'italic', fontSize: '0.9rem', opacity: 0.6 }}>None</span>;
    }
    return val;
  };

  const renderTableVal = (val) => {
    if (!val || val === 'Not specified' || val === 'Any') {
      return <span style={{ color: '#64748b', opacity: 0.4 }}>—</span>;
    }
    return val;
  };



  // Relative Time Formatter
  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Never';
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // CSV Export
  const handleExport = () => {
    const headers = ['SR NO', 'User ID', 'Name', 'Email', 'Gender', 'Age', 'Type', 'Onboarding', 'Role', 'Last Active', 'Status'];
    const rows = filteredUsers.map((u, index) => [
      index + 1,
      u.id,
      u.name || 'N/A',
      u.email || 'N/A',
      u.gender || 'Not Specified',
      u.age || 'N/A',
      u.user_type || 'User',
      u.is_profile_complete ? 'Complete' : 'Pending',
      u.role || 'User',
      formatRelativeTime(u.last_login),
      u.status || 'Active'
    ]);

    // Join with commas and newlines
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `roommate_finder_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Downloaded');
  };

  // Bulk Selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map(u => u.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteUser = (userId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/users/${userId}`);
          setUsers(prev => prev.filter(u => u.id !== userId));
          if (selectedUser?.id === userId) setShowModal(false);
          toast.success('User deleted successfully');
        } catch (error) {
          console.error("Failed to delete user:", error);
          toast.error("Failed to delete user. Please try again.");
        }
      }
    });
  };

  const handleBulkDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Bulk Delete',
      message: `Are you sure you want to delete ${selectedIds.length} users? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => api.delete(`/admin/users/${id}`)));
          setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
          setSelectedIds([]);
          toast.success(`${selectedIds.length} users deleted successfully`);
        } catch (error) {
          console.error("Failed bulk delete:", error);
          toast.error("Some users could not be deleted. Refreshing list...");
          const { data } = await api.get('/admin/users');
          setUsers(data);
        }
      }
    });
  };


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

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveAdminProfile = async () => {
    try {
      setSavingProfile(true);
      await api.put('/user/profile/update', { profile_pic: profileImage });
      toast.success('Profile photo updated!');
      // Update local user state if needed (Auth context handles it usually on refresh)
    } catch (error) {
      toast.error('Failed to update photo');
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    if (user?.profile_pic) {
      setProfileImage(user.profile_pic);
    }
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/admin/notifications');
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    if (user?.role === 'Admin') {
      fetchNotifications();
      // Optional: Polling every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await api.put('/admin/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (error) {}
  };

  const markOneRead = async (id) => {
    try {
      await api.put(`/admin/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {}
  };

  const handleNotifClick = async (notif) => {
    // 1. Mark as read
    if (!notif.is_read) {
      await markOneRead(notif.id);
    }
    
    // 2. Find the user and open details modal
    if (notif.user_id) {
      const targetUser = users.find(u => u.id === notif.user_id);
      if (targetUser) {
        setSelectedUser(targetUser);
        setShowModal(true);
        setShowNotifDropdown(false);
      } else {
        toast.error("User details no longer available");
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      gender: 'all',
      role: 'all',
      userType: 'all',
      status: 'all',
      city: 'all',
      occupation: 'all',
      ageRange: 'all',
      onboarding: 'all',
      fromDate: '',
      toDate: ''
    });
    toast.success('Filters reset');
  };

  // Handle Filtering & Searching
  useEffect(() => {
    let result = users;
    if (searchQuery) {
      result = result.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filters.gender !== 'all') {
      result = result.filter(u => u.gender.toLowerCase() === filters.gender);
    }
    if (filters.role !== 'all') {
      result = result.filter(u => u.role === filters.role);
    }
    if (filters.userType !== 'all') {
      result = result.filter(u => u.user_type === filters.userType);
    }
    if (filters.status !== 'all') {
      result = result.filter(u => u.status === filters.status);
    }
    if (filters.city !== 'all') {
      result = result.filter(u => u.location && u.location.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.occupation !== 'all') {
      result = result.filter(u => u.occupation && u.occupation.toLowerCase() === filters.occupation.toLowerCase());
    }
    if (filters.ageRange !== 'all') {
      result = result.filter(u => {
        if (!u.age) return false;
        if (filters.ageRange === '18-25') return u.age >= 18 && u.age <= 25;
        if (filters.ageRange === '26-35') return u.age >= 26 && u.age <= 35;
        if (filters.ageRange === '36+') return u.age >= 36;
        return true;
      });
    }
    if (filters.onboarding !== 'all') {
      const isComplete = filters.onboarding === 'complete';
      result = result.filter(u => u.is_profile_complete === isComplete);
    }
    setFilteredUsers(result);


  }, [users, searchQuery, filters]);

  // Sparkline calculation for last 30 days
  const getGrowthData = () => {
    const counts = new Array(30).fill(0);
    const now = new Date();
    users.forEach(u => {
      if (!u.created_at) return;
      const created = new Date(u.created_at);
      const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      if (!isNaN(diff) && diff >= 0 && diff < 30) counts[29 - diff]++;
    });
    return counts;
  };

  const growthData = getGrowthData();
  const maxGrowth = Math.max(...growthData, 1);

  return (
    <div style={currentStyles.container}>
      {/* LEFT SIDEBAR */}

      <div style={currentStyles.sidebar}>
        <div style={currentStyles.logoContainer}>
          <div style={currentStyles.logoIcon}><LayoutDashboard size={20} color="white" /></div>
          <h2 style={currentStyles.logoText}>AdminPanel</h2>
        </div>

        <nav style={currentStyles.navMenu}>
          <p style={currentStyles.menuLabel}>MAIN MENU</p>

          <button
            style={{ ...currentStyles.navItem, ...(activeTab === 'users' ? currentStyles.activeNavItem : {}) }}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} /> Manage Users
          </button>
        </nav>

        <div style={currentStyles.bottomNav}>
          <button style={currentStyles.logoutBtn} onClick={handleExit}>
            <LogOut size={18} /> Exit Admin
          </button>
        </div>

      </div>

      <div style={currentStyles.mainContent}>
        {/* Top Header */}
        <header style={currentStyles.header}>
          <div style={currentStyles.headerTitle}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0, color: theme.text }}>User Management</h1>
            <p style={{ fontSize: '0.85rem', color: theme.textMuted, margin: 0 }}>Monitor and manage platform users</p>
          </div>
          <div style={currentStyles.headerRight}>
            <button style={currentStyles.iconBtn} onClick={toggleTheme} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div style={{ position: 'relative' }}>
              <button 
                style={currentStyles.iconBtn} 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              >
                <Bell size={20} />
                {unreadCount > 0 && <span style={currentStyles.notifBadge}>{unreadCount}</span>}
              </button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    style={currentStyles.notifDropdown}
                  >
                    <div style={currentStyles.notifHeader}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Notifications</span>
                      <button style={currentStyles.markAllBtn} onClick={markAllRead}>Mark all read</button>
                    </div>
                    <div style={currentStyles.notifList}>
                      {notifications.length === 0 ? (
                        <div style={currentStyles.emptyNotif}>No notifications yet</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            style={{
                              ...currentStyles.notifItem,
                              borderLeft: n.is_read ? 'none' : '4px solid #8b5cf6',
                              backgroundColor: n.is_read ? 'transparent' : 'rgba(139, 92, 246, 0.05)'
                            }}
                            onClick={() => handleNotifClick(n)}
                          >
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <div style={{ 
                                ...currentStyles.notifIcon,
                                backgroundColor: n.type === 'registration' ? 'rgba(59, 130, 246, 0.1)' : 
                                               n.type === 'onboarding' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                                color: n.type === 'registration' ? '#3b82f6' : 
                                       n.type === 'onboarding' ? '#10b981' : '#ec4899'
                              }}>
                                {n.type === 'registration' ? <Users size={14} /> : 
                                 n.type === 'onboarding' ? <CheckCircle size={14} /> : <Camera size={14} />}
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <p style={currentStyles.notifText}>{n.message}</p>
                                <span style={currentStyles.notifTime}>{formatRelativeTime(n.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div 
              style={currentStyles.adminAvatar}
              onClick={() => setShowProfileSidebar(true)}
              title="My Profile"
            >
              {profileImage ? (
                <img src={profileImage} alt="Admin" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'A'
              )}
            </div>
          </div>
        </header>

        {/* Profile Sidebar Drawer */}
        <AnimatePresence>
          {showProfileSidebar && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowProfileSidebar(false)}
                style={currentStyles.sidebarOverlay}
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                style={currentStyles.profileDrawer}
              >
                <div style={currentStyles.drawerHeader}>
                  <h3 style={currentStyles.drawerTitle}>Admin Profile</h3>
                  <button style={currentStyles.closeBtn} onClick={() => setShowProfileSidebar(false)}><X size={20} /></button>
                </div>

                <div style={currentStyles.drawerBody}>
                  <div style={currentStyles.drawerAvatarSection}>
                    <div style={currentStyles.drawerAvatar}>
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user?.name?.charAt(0).toUpperCase()
                      )}
                      <button 
                        style={currentStyles.drawerAvatarEdit}
                        onClick={() => profileFileInputRef.current.click()}
                      >
                        <Camera size={16} />
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={profileFileInputRef} 
                      onChange={handleProfilePhotoChange} 
                      accept="image/*" 
                      style={{ display: 'none' }} 
                    />
                    <h2 style={{ marginTop: '15px', fontSize: '1.2rem', color: 'white' }}>{user?.name}</h2>
                    <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>System Administrator</span>
                  </div>

                  <div style={currentStyles.drawerInfoList}>
                    <div style={currentStyles.drawerInfoItem}>
                      <Mail size={16} color="#64748b" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>EMAIL</span>
                        <span style={{ color: 'white' }}>{user?.email}</span>
                      </div>
                    </div>
                    <div style={currentStyles.drawerInfoItem}>
                      <Shield size={16} color="#64748b" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700' }}>ROLE</span>
                        <span style={{ color: 'white' }}>Super Administrator</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    style={{
                      ...currentStyles.drawerSaveBtn,
                      opacity: savingProfile ? 0.7 : 1
                    }}
                    onClick={saveAdminProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <div style={currentStyles.contentArea}>
          {/* Stats Row */}
          <div style={currentStyles.statsRow}>
            {/* Card 1: Total Growth */}
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statInfo}>
                <p style={currentStyles.statLabel}>Total Users</p>
                <h2 style={currentStyles.statValue}>{users.length}</h2>
              </div>
              <div
                style={currentStyles.sparkline}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const index = Math.min(7, Math.max(0, Math.round((x / 110) * 7)));
                  setHoveredPoint({
                    index,
                    val: growthData.slice(-8)[index],
                    x: (index * 110) / 7
                  });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <svg width="110" height="45" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Grid Lines */}
                  <line x1="0" y1="10" x2="110" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="25" x2="110" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  <line x1="0" y1="40" x2="110" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                  {/* Area Fill */}
                  <path
                    d={`
                      M 0 45
                      ${growthData.slice(-8).map((d, i) => {
                      const x = (i * 110) / 7;
                      const y = 45 - (maxGrowth > 0 ? (d / maxGrowth) * 35 : 0);
                      return `L ${x} ${y}`;
                    }).join(' ')}
                      L 110 45
                      Z
                    `}
                    fill="url(#areaGradient)"
                    style={{ filter: 'blur(1px)' }}
                  />

                  {/* The Line */}
                  <path
                    d={`
                      M 0 45
                      ${growthData.slice(-8).map((d, i) => {
                      const x = (i * 110) / 7;
                      const y = 45 - (maxGrowth > 0 ? (d / maxGrowth) * 35 : 0);
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    `}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'url(#glow)' }}
                  />

                  {/* Tooltip Vertical Line and Indicator */}
                  {hoveredPoint && (
                    <>
                      <line
                        x1={hoveredPoint.x} y1="0" x2={hoveredPoint.x} y2="45"
                        stroke="rgba(255,255,255,0.2)" strokeDasharray="2,2"
                      />
                      <circle
                        cx={hoveredPoint.x}
                        cy={45 - (maxGrowth > 0 ? (hoveredPoint.val / maxGrowth) * 35 : 0)}
                        r="5" fill="#fff" stroke="#ec4899" strokeWidth="2"
                      />
                    </>
                  )}

                  {!hoveredPoint && (
                    <circle
                      cx="110"
                      cy={45 - (maxGrowth > 0 ? (growthData[29] / maxGrowth) * 35 : 0)}
                      r="4"
                      fill="#ec4899"
                      style={{ filter: 'drop-shadow(0 0 6px #ec4899)' }}
                    />
                  )}
                </svg>

                {/* Floating Tooltip Div */}
                {hoveredPoint && (
                  <div style={styles.miniTooltip}>
                    <span style={{ fontWeight: 'bold', color: 'white' }}>{hoveredPoint.val}</span> users
                    <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                      {hoveredPoint.index === 7 ? 'Today' : `${7 - hoveredPoint.index}d ago`}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Card 2: Platform Balance */}
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statInfo}>
                <p style={currentStyles.statLabel}>Hosts / Seekers</p>
                <h2 style={currentStyles.statValue}>
                  {users.filter(u => u.user_type === 'Lister').length} <span style={{ fontSize: '1rem', color: theme.textMuted }}>/</span> {users.filter(u => u.user_type === 'Seeker').length}
                </h2>
              </div>
              <div style={currentStyles.cardIconBox}><Home size={20} color="#3b82f6" /></div>
            </div>

            {/* Card 3: Active Today */}
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statInfo}>
                <p style={currentStyles.statLabel}>Active (24h)</p>
                <h2 style={currentStyles.statValue}>
                  {users.filter(u => {
                    if (!u.last_login) return false;
                    const login = new Date(u.last_login);
                    return (new Date() - login) < (24 * 60 * 60 * 1000);
                  }).length}
                </h2>
              </div>
              <div style={currentStyles.cardIconBox}><Activity size={20} color="#10b981" /></div>
            </div>

            {/* Card 4: New This Week (Velocity) */}
            <div style={currentStyles.statCard}>
              <div style={currentStyles.statInfo}>
                <p style={currentStyles.statLabel}>New This Week</p>
                <h2 style={currentStyles.statValue}>
                  {users.filter(u => {
                    if (!u.created_at) return false;
                    const created = new Date(u.created_at);
                    return (new Date() - created) < (7 * 24 * 60 * 60 * 1000);
                  }).length}
                </h2>
              </div>
              <div style={currentStyles.cardIconBox}><Users size={20} color="#8b5cf6" /></div>
            </div>
          </div>


          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={currentStyles.pageHeader}>
                <h1 style={currentStyles.pageTitle}>User Management</h1>
                <div style={currentStyles.headerActions}>
                  <button style={currentStyles.secondaryBtn} onClick={handleExport}>
                    <Download size={16} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Filter & Bulk Actions Bar */}              <div style={currentStyles.filterBar}>
                {/* Row 1: 5 Filters */}
                <div style={currentStyles.filterRow}>
                  <div style={{...currentStyles.filterItem, flex: 1}}>
                    <Search size={16} color="#9ca3af" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      style={currentStyles.integratedSearchInput} 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div style={currentStyles.filterItem}>
                    <Filter size={14} color="#9ca3af" />
                    <select 
                      style={currentStyles.filterSelect}
                      value={filters.gender}
                      onChange={(e) => setFilters({...filters, gender: e.target.value})}
                    >
                      <option value="all">All Genders</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>

                  <div style={currentStyles.filterItem}>
                    <Users size={14} color="#9ca3af" />
                    <select 
                      style={currentStyles.filterSelect}
                      value={filters.role}
                      onChange={(e) => setFilters({...filters, role: e.target.value})}
                    >
                      <option value="all">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="User">User</option>
                    </select>
                  </div>

                  <div style={currentStyles.filterItem}>
                    <Shield size={14} color="#9ca3af" />
                    <select 
                      style={currentStyles.filterSelect}
                      value={filters.userType}
                      onChange={(e) => setFilters({...filters, userType: e.target.value})}
                    >
                      <option value="all">All Types</option>
                      <option value="Seeker">Room Seekers</option>
                      <option value="Lister">Property Hosts</option>
                    </select>
                  </div>

                  <div style={currentStyles.filterItem}>
                    <Activity size={14} color="#9ca3af" />
                    <select 
                      style={currentStyles.filterSelect}
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                      <option value="all">Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: 6 Filters */}
                <div style={currentStyles.filterRow}>
                  <div style={currentStyles.filterItem}>
                    <Briefcase size={14} color="#9ca3af" />
                    <select 
                      style={currentStyles.filterSelect}
                      value={filters.occupation}
                      onChange={(e) => setFilters({...filters, occupation: e.target.value})}
                    >
                      <option value="all">Occupation</option>
                      <option value="Student">Student</option>
                      <option value="Professional">Professional</option>
                    </select>
                  </div>
                  <div style={currentStyles.filterItem}>
                    <Activity size={14} color="#9ca3af" />
                    <select 
                      style={currentStyles.filterSelect}
                      value={filters.ageRange}
                      onChange={(e) => setFilters({...filters, ageRange: e.target.value})}
                    >
                      <option value="all">Age Range</option>
                      <option value="18-25">18-25</option>
                      <option value="26-35">26-35</option>
                      <option value="36+">36+</option>
                    </select>
                  </div>

                  <div style={currentStyles.filterItem}>
                    <CheckCircle size={14} color="#9ca3af" />
                    <select 
                      style={currentStyles.filterSelect}
                      value={filters.onboarding}
                      onChange={(e) => setFilters({...filters, onboarding: e.target.value})}
                    >
                      <option value="all">Onboarding</option>
                      <option value="complete">Complete</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>

                  <div style={currentStyles.filterItem}>
                    <Calendar size={14} color="#9ca3af" />
                    <span style={{fontSize: '0.8rem', color: theme.textMuted }}>From:</span>
                    <input type="date" style={currentStyles.filterSelect} value={filters.fromDate} onChange={(e) => setFilters({...filters, fromDate: e.target.value})} />
                  </div>

                  <div style={currentStyles.filterItem}>
                    <Calendar size={14} color="#9ca3af" />
                    <span style={{fontSize: '0.8rem', color: theme.textMuted }}>To:</span>
                    <input type="date" style={currentStyles.filterSelect} value={filters.toDate} onChange={(e) => setFilters({...filters, toDate: e.target.value})} />
                  </div>

                  <button 
                    style={currentStyles.resetBtn}
                    onClick={clearFilters}
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                </div>

                {selectedIds.length > 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={currentStyles.bulkActions}>
                    <span style={currentStyles.selectedCount}>{selectedIds.length} selected</span>
                    <button style={currentStyles.bulkBtnDelete} onClick={handleBulkDelete}>
                      <Trash2 size={16} /> Delete Selected
                    </button>
                  </motion.div>
                )}
              </div>


              <div style={currentStyles.tableContainer}>
                <table style={currentStyles.table}>
                  <thead>
                    <tr>
                      <th style={currentStyles.th}>
                        <input
                          type="checkbox"
                          checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th style={currentStyles.th}>Sr. No.</th>
                      <th style={currentStyles.th}>User ID</th>
                      <th style={currentStyles.th}>Name</th>
                      <th style={currentStyles.th}>Gender</th>
                      <th style={currentStyles.th}>Age</th>
                      <th style={currentStyles.th}>Email</th>
                      <th style={currentStyles.th}>Type</th>
                      <th style={currentStyles.th}>Onboarding</th>
                      <th style={currentStyles.th}>Role</th>
                      <th style={currentStyles.th}>Last Active</th>
                      <th style={currentStyles.th}>Status</th>
                      <th style={currentStyles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan="13" style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>
                          <Loader />
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan="13" style={{ textAlign: 'center', padding: '40px', color: theme.textMuted }}>
                          <p>No users found in the database.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <tr key={user.id} style={currentStyles.tr}>
                          <td style={currentStyles.td}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(user.id)}
                              onChange={() => toggleSelectOne(user.id)}
                            />
                          </td>
                          <td style={{ ...currentStyles.td, color: theme.textMuted, fontWeight: 'bold', fontSize: '0.9rem' }}>{index + 1}</td>
                          <td style={currentStyles.td}>
                            <span style={currentStyles.idBadge}>#{user.id}</span>
                          </td>
                          <td style={currentStyles.td}>
                            <div style={currentStyles.userNameContainer}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={currentStyles.tableAvatar}>
                                  {user.profile_pic ? (
                                    <img src={user.profile_pic} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    user.name?.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <strong>{renderTableVal(user.name)}</strong>
                              </div>
                            </div>
                          </td>                           <td style={currentStyles.td}>
                            {user.gender ? (
                              <span style={{
                                ...currentStyles.genderBadge,
                                backgroundColor: user.gender === 'Male' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                                color: user.gender === 'Male' ? '#3b82f6' : '#ec4899'
                              }}>
                                {user.gender}
                              </span>
                            ) : (
                              <span style={{
                                ...currentStyles.genderBadge,
                                backgroundColor: 'rgba(148, 163, 184, 0.1)',
                                color: '#94a3b8',
                                opacity: 0.7
                              }}>
                                None
                              </span>
                            )}
                          </td>
                          <td style={currentStyles.td}>{renderTableVal(user.age)}</td>
                          <td style={currentStyles.td}>{renderTableVal(user.email)}</td>
                          <td style={currentStyles.td}>
                            <span style={{
                              ...currentStyles.typeBadge,
                              backgroundColor: user.user_type === 'Lister' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                              color: user.user_type === 'Lister' ? '#3b82f6' : '#8b5cf6'
                            }}>
                                {user.user_type === 'Lister' ? 'Property Host' : 'Room Seeker'}
                            </span>
                          </td>
                          <td style={currentStyles.td}>
                            <span style={{
                              ...currentStyles.statusBadge,
                              backgroundColor: user.is_profile_complete ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: user.is_profile_complete ? '#10b981' : '#ef4444',
                              fontSize: '0.7rem'
                            }}>
                              {user.is_profile_complete ? 'Complete' : 'Pending'}
                            </span>
                          </td>

                          <td style={currentStyles.td}>
                            <span style={{
                              ...currentStyles.roleBadge,
                              color: user.role === 'Admin' ? '#fbbf24' : theme.textMuted,
                              borderColor: user.role === 'Admin' ? 'rgba(251, 191, 36, 0.3)' : theme.border
                            }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={currentStyles.td}>{formatRelativeTime(user.last_login)}</td>
                          <td style={currentStyles.td}>
                            <span style={{
                              ...currentStyles.statusBadge,
                              backgroundColor: user.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              color: user.status === 'Active' ? '#10b981' : '#f59e0b'
                            }}>
                              {user.status}
                            </span>
                          </td>
                          <td style={currentStyles.td}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                style={currentStyles.actionBtn}
                                title="View Details"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowModal(true);
                                }}
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                style={{ ...currentStyles.actionBtn, color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                title="Delete User"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))

                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* USER DETAILS MODAL */}
      {showModal && selectedUser && (
        <div style={currentStyles.modalOverlay} onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={currentStyles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <div style={currentStyles.modalHeader}>
              <h2 style={currentStyles.modalTitle}>User Identity</h2>
              <button style={currentStyles.closeBtn} onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            <div style={currentStyles.modalBody}>
              {/* User Hero Section in Modal */}
              <div style={currentStyles.modalHero}>
                <div style={currentStyles.modalAvatar}>
                  {selectedUser.profile_pic ? (
                    <img src={selectedUser.profile_pic} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    selectedUser.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div style={currentStyles.modalHeroInfo}>
                  <h2 style={{ margin: 0, color: 'white' }}>{selectedUser.name}</h2>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                    <span style={{ 
                      ...currentStyles.statusBadge, 
                      backgroundColor: selectedUser.role === 'Admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                      color: selectedUser.role === 'Admin' ? '#ef4444' : '#a78bfa',
                      fontSize: '0.7rem'
                    }}>
                      {selectedUser.role}
                    </span>
                    <span style={{ 
                      ...currentStyles.statusBadge, 
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: '#3b82f6',
                      fontSize: '0.7rem'
                    }}>
                      ID: #{selectedUser.id}
                    </span>
                  </div>
                </div>
              </div>

              <div style={currentStyles.modalSection}>
                <h3 style={currentStyles.sectionTitle}>Basic Information</h3>
                <div style={currentStyles.detailGrid}>
                  <div style={currentStyles.detailItem}>
                    <p style={currentStyles.detailLabel}>Full Name</p>
                    <p style={currentStyles.detailValue}>{renderValue(selectedUser.name)}</p>
                  </div>
                  <div style={currentStyles.detailItem}>
                    <p style={currentStyles.detailLabel}>Email Address</p>
                    <p style={currentStyles.detailValue}>{renderValue(selectedUser.email)}</p>
                  </div>
                  <div style={currentStyles.detailItem}>
                    <p style={currentStyles.detailLabel}>Occupation</p>
                    <p style={currentStyles.detailValue}>{renderValue(selectedUser.occupation)}</p>
                  </div>
                  <div style={currentStyles.detailItem}>
                    <p style={currentStyles.detailLabel}>Gender</p>
                    <p style={currentStyles.detailValue}>{renderValue(selectedUser.gender)}</p>
                  </div>
                  <div style={currentStyles.detailItem}>
                    <p style={currentStyles.detailLabel}>Age</p>
                    <p style={currentStyles.detailValue}>{renderValue(selectedUser.age)}</p>
                  </div>


                  <div style={currentStyles.detailItem}>
                    <p style={currentStyles.detailLabel}>User Type</p>
                    <p style={{ ...currentStyles.detailValue, color: selectedUser.user_type === 'Lister' ? '#3b82f6' : '#8b5cf6' }}>
                      {selectedUser.user_type === 'Lister' ? 'Room Lister' : 'Room Seeker'}
                    </p>
                  </div>
                  <div style={currentStyles.detailItem}>
                    <p style={currentStyles.detailLabel}>Location</p>
                    <p style={currentStyles.detailValue}>{renderValue(selectedUser.location)}</p>
                  </div>



                </div>
              </div>

              {selectedUser.profile && (
                <>
                  <div style={currentStyles.modalSection}>
                    <h3 style={currentStyles.sectionTitle}>Lifestyle Preferences</h3>
                    <div style={currentStyles.prefGrid}>
                      <div style={currentStyles.prefItem}><Clock size={14} /> <span>Sleep: {selectedUser.profile.sleep_schedule}</span></div>
                      <div style={currentStyles.prefItem}><Shield size={14} /> <span>Cleanliness: {selectedUser.profile.cleanliness}</span></div>
                      <div style={currentStyles.prefItem}><Users size={14} /> <span>Guests: {selectedUser.profile.guests_policy}</span></div>
                      <div style={currentStyles.prefItem}><Activity size={14} /> <span>Food: {selectedUser.profile.food_habits}</span></div>
                      <div style={currentStyles.prefItem}><Home size={14} /> <span>WFH: {selectedUser.profile.work_from_home}</span></div>
                    </div>
                  </div>

                  {selectedUser.user_type === 'Seeker' && (
                    <div style={currentStyles.modalSection}>
                      <h3 style={currentStyles.sectionTitle}>Budget & Requirements</h3>
                      <div style={currentStyles.detailGrid}>
                        <div style={currentStyles.detailItem}>
                          <p style={currentStyles.detailLabel}>Monthly Budget</p>
                          <p style={currentStyles.detailValue}>{renderValue(selectedUser.profile.budget_range)}</p>
                        </div>
                        <div style={currentStyles.detailItem}>
                          <p style={currentStyles.detailLabel}>Room Preference</p>
                          <p style={currentStyles.detailValue}>{renderValue(selectedUser.profile.room_type)}</p>
                        </div>
                        <div style={currentStyles.detailItem}>
                          <p style={currentStyles.detailLabel}>Move-in Date</p>
                          <p style={currentStyles.detailValue}>{selectedUser.profile.move_in_date ? new Date(selectedUser.profile.move_in_date).toLocaleDateString() : renderValue(null)}</p>
                        </div>
                        <div style={currentStyles.detailItem}>
                          <p style={currentStyles.detailLabel}>Preferred Areas</p>
                          <p style={currentStyles.detailValue}>{renderValue(selectedUser.profile.preferred_areas)}</p>
                        </div>
                      </div>
                    </div>
                  )}


                </>
              )}
            </div>

            <div style={currentStyles.modalFooter}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div style={currentStyles.modalOverlay} onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={currentStyles.confirmModal}
            onClick={e => e.stopPropagation()}
          >
            <div style={currentStyles.confirmHeader}>
              <div style={currentStyles.warningIcon}><Trash2 size={24} color="#ef4444" /></div>
              <h3 style={currentStyles.confirmTitle}>{confirmModal.title}</h3>
            </div>
            <p style={currentStyles.confirmMessage}>{confirmModal.message}</p>
            <div style={currentStyles.confirmFooter}>
              <button
                style={currentStyles.cancelBtn}
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
              >
                Cancel
              </button>
              <button
                style={currentStyles.confirmBtn}
                onClick={async () => {
                  await confirmModal.onConfirm();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
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
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.1)',
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
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    minWidth: '1000px',
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
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  statsRow: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    minWidth: '240px',
    transition: 'transform 0.2s ease',
  },
  cardIconBox: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#9ca3af',
    margin: 0,
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '5px 0 0 0',
  },
  sparkline: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    position: 'relative',
    cursor: 'crosshair',
  },
  miniTooltip: {
    position: 'absolute',
    top: '-45px',
    right: '0',
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#9ca3af',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    pointerEvents: 'none',
    zIndex: 10,
    whiteSpace: 'nowrap',
  },
  sparkLabel: {
    fontSize: '0.7rem',
    color: '#6b7280',
    marginTop: '5px',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  secondaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.2s',
  },
  filterBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: '20px',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  filterRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    width: '100%',
  },  filterItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0 10px',
    height: '34px',
    transition: 'all 0.2s ease',
  },
  integratedSearchInput: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '0.85rem',
    outline: 'none',
    width: '100%',
    height: '100%',
    padding: '0 10px',
  },
  filterSelect: {
    backgroundColor: '#1e293b', 
    border: 'none',
    color: '#e2e8f0',
    fontSize: '0.85rem',
    outline: 'none',
    cursor: 'pointer',
    height: '100%',
    padding: '0 5px',
    width: 'auto',
    minWidth: '80px',
  },
  resetBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '0 15px',
    height: '34px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },



  bulkActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  selectedCount: {
    fontSize: '0.85rem',
    color: '#8b5cf6',
    fontWeight: '600',
  },
  bulkBtnDelete: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmModal: {
    backgroundColor: '#1e293b',
    borderRadius: '20px',
    width: '400px',
    padding: '30px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  confirmHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
  },
  warningIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '30px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    margin: 0,
    color: 'white',
  },
  confirmMessage: {
    fontSize: '1rem',
    color: '#9ca3af',
    lineHeight: '1.5',
    margin: '0 0 30px 0',
  },
  confirmFooter: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#ef4444',
    border: 'none',
    color: 'white',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
  },


  bulkBtnRole: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  userNameContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  userGender: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  roleBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '1px solid',
  },
  idBadge: {
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    fontSize: '0.75rem',
    fontWeight: '600',
    fontFamily: 'monospace',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    width: '600px',
    maxWidth: '95%',
    padding: '30px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalSection: {
    marginBottom: '25px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: '0.9rem',
    color: '#8b5cf6',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '15px',
    fontWeight: '700',
  },
  prefGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  prefItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#e2e8f0',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: '8px 12px',
    borderRadius: '8px',
  },
  typeBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '15px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '5px',
    transition: 'color 0.2s',
  },
  modalBody: {
    marginBottom: '25px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  detailLabel: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    color: '#9ca3af',
    fontWeight: '600',
    margin: 0,
  },
  detailValue: {
    fontSize: '1rem',
    color: '#e2e8f0',
    margin: 0,
    fontWeight: '500',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '20px',
    paddingBottom: '20px',
  },
  genderBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sidebarOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    zIndex: 10001,
  },
  profileDrawer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '380px',
    backgroundColor: '#1e1b4b',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
    zIndex: 10002,
    display: 'flex',
    flexDirection: 'column',
    padding: '30px',
  },
  drawerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  drawerTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'white',
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  drawerAvatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '40px',
  },
  drawerAvatar: {
    width: '120px',
    height: '120px',
    borderRadius: '40px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    fontWeight: 'bold',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    border: '4px solid rgba(255, 255, 255, 0.05)',
  },
  drawerAvatarEdit: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '36px',
    height: '36px',
    borderRadius: '12px 0 10px 0',
    backgroundColor: 'white',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#0f172a',
  },
  drawerInfoList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: 'auto',
  },
  drawerInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  drawerSaveBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '14px',
    backgroundColor: 'var(--primary)',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    border: 'none',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '30px',
    boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)',
  },
  notifBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#ef4444',
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: 'bold',
    minWidth: '16px',
    height: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid #0f172a',
  },
  notifDropdown: {
    position: 'absolute',
    top: '45px',
    right: '0',
    width: '320px',
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    zIndex: 10005,
    overflow: 'hidden',
  },
  notifHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  markAllBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#8b5cf6',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  notifList: {
    maxHeight: '400px',
    overflowY: 'auto',
  },
  notifItem: {
    padding: '15px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
  },
  notifIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  notifText: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'white',
    lineHeight: '1.4',
  },
  notifTime: {
    fontSize: '0.7rem',
    color: '#64748b',
  },
  emptyNotif: {
    padding: '40px 20px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  tableAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  modalHero: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '16px',
    marginBottom: '25px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  modalAvatar: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  modalHeroInfo: {
    display: 'flex',
    flexDirection: 'column',
  }
};


export default AdminDashboard;
