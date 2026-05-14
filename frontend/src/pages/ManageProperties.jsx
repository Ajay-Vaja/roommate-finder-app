import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, Edit, Trash2, Eye, MapPin, 
  Plus, Search, Filter, MoreVertical, 
  AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react';
import { getMyProperties, deleteProperty } from '../services/propertyService';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const ManageProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: '' });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await getMyProperties();
      setProperties(response.data);
    } catch (error) {
      toast.error('Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProperty(deleteModal.id);
      toast.success('Property deleted successfully');
      setProperties(properties.filter(p => p.id !== deleteModal.id));
      setDeleteModal({ show: false, id: null, title: '' });
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to delete property');
    }
  };

  const filteredProperties = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.locality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Manage Listings</h1>
            <p style={styles.subtitle}>Track, edit, and optimize your property posts</p>
          </div>
          <Link to="/post-property" style={styles.addBtn}>
            <Plus size={20} />
            <span>Post New Property</span>
          </Link>
        </header>

        <div style={styles.statsRow}>
          <StatCard 
            title="Total Listings" 
            value={properties.length} 
            icon={<Building size={24} color="var(--primary)" />} 
            color="rgba(139, 92, 246, 0.1)"
          />
          <StatCard 
            title="Total Views" 
            value={properties.reduce((acc, p) => acc + (p.views || 0), 0)} 
            icon={<Eye size={24} color="#10b981" />} 
            color="rgba(16, 185, 129, 0.1)"
          />
          <StatCard 
            title="Active Requests" 
            value="--" 
            icon={<ArrowRight size={24} color="#f59e0b" />} 
            color="rgba(245, 158, 11, 0.1)"
          />
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchWrapper}>
            <Search size={18} color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Search your listings..." 
              style={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.grid}>
          <AnimatePresence>
            {filteredProperties.length > 0 ? (
              filteredProperties.map((prop, index) => (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  transition={{ delay: index * 0.05 }}
                  style={styles.card}
                >
                  <div style={styles.cardImageWrapper}>
                    <img 
                      src={prop.images && prop.images[0] ? prop.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'} 
                      alt={prop.title} 
                      style={styles.cardImage}
                    />
                    <div style={styles.imageOverlay} />
                    <div style={styles.statusBadge}>
                      <div style={styles.statusDot} />
                      <span>Live</span>
                    </div>
                    <div style={styles.viewBadge}>
                      <Eye size={14} />
                      <span>{prop.views || 0} Views</span>
                    </div>
                  </div>
                  
                  <div style={styles.cardContent}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>{prop.title}</h3>
                      <div style={styles.priceContainer}>
                        <span style={styles.priceLabel}>Rent</span>
                        <div style={styles.cardPrice}>₹{prop.rent_amount}</div>
                      </div>
                    </div>
                    
                    <div style={styles.cardLocation}>
                      <div style={styles.locIcon}>
                        <MapPin size={14} />
                      </div>
                      <span>{prop.locality}, {prop.city}</span>
                    </div>

                    <div style={styles.cardFooter}>
                      <div style={styles.cardType}>
                        {prop.room_type}
                      </div>
                      <div style={styles.actions}>
                        <button 
                          style={{ ...styles.actionBtn, color: '#a78bfa', backgroundColor: 'rgba(139, 92, 246, 0.15)' }}
                          onClick={() => navigate(`/edit-property/${prop.id}`)}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.25)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.15)'; }}
                          title="Edit Listing"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          style={{ ...styles.actionBtn, color: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
                          onClick={() => setDeleteModal({ show: true, id: prop.id, title: prop.title })}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.25)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'; }}
                          title="Delete Listing"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div style={styles.emptyState}>
                <Building size={64} color="#e5e7eb" />
                <h3>No properties found</h3>
                <p>You haven't posted any properties yet, or no results match your search.</p>
                <Link to="/post-property" style={styles.emptyAddBtn}>Post Your First Property</Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div style={styles.modalOverlay}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.modal}
          >
            <div style={styles.modalIcon}>
              <AlertCircle size={32} color="#ef4444" />
            </div>
            <h2 style={styles.modalTitle}>Delete Property?</h2>
            <p style={styles.modalText}>
              Are you sure you want to delete <strong>{deleteModal.title}</strong>? 
              This action cannot be undone.
            </p>
            <div style={styles.modalActions}>
              <button 
                style={styles.cancelBtn} 
                onClick={() => setDeleteModal({ show: false, id: null, title: '' })}
              >
                Cancel
              </button>
              <button style={styles.deleteBtn} onClick={handleDelete}>
                Delete Permanently
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <motion.div 
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    style={{ ...styles.statCard, boxShadow: `0 10px 30px ${color.replace('0.1', '0.05')}` }}
  >
    <div style={{ ...styles.statIcon, backgroundColor: color }}>
      {icon}
    </div>
    <div style={styles.statInfo}>
      <span style={styles.statLabel}>{title}</span>
      <h3 style={styles.statValue}>{value}</h3>
    </div>
  </motion.div>
);

const styles = {
  container: {
    padding: '100px 20px 60px',
    minHeight: '100vh',
    background: 'transparent',
  },
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'white',
    letterSpacing: '-1px',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    color: 'white',
    padding: '14px 28px',
    borderRadius: '16px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    boxShadow: '0 10px 25px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  statCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(16px)',
    padding: '28px',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '22px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.3s ease',
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    fontWeight: '500',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
    marginTop: '4px',
  },
  toolbar: {
    marginBottom: '30px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    padding: '0 24px',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    maxWidth: '450px',
    backdropFilter: 'blur(20px)',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  searchInput: {
    width: '100%',
    padding: '16px',
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    backgroundColor: 'transparent',
    color: 'white',
    letterSpacing: '0.3px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '25px',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(20px)',
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    flexDirection: 'column',
  },
  cardImageWrapper: {
    position: 'relative',
    height: '220px',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.6s ease',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(to bottom, transparent 60%, rgba(15, 23, 42, 0.8) 100%)',
    pointerEvents: 'none',
  },
  statusBadge: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    backdropFilter: 'blur(8px)',
    color: '#10b981',
    padding: '6px 12px',
    borderRadius: '100px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    boxShadow: '0 0 10px #10b981',
  },
  viewBadge: {
    position: 'absolute',
    bottom: '15px',
    right: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  cardContent: {
    padding: '24px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '15px',
    marginBottom: '15px',
  },
  cardTitle: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: 'white',
    lineHeight: '1.3',
    letterSpacing: '-0.3px',
  },
  priceContainer: {
    textAlign: 'right',
  },
  priceLabel: {
    display: 'block',
    fontSize: '0.7rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: '2px',
  },
  cardPrice: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--primary)',
    letterSpacing: '-0.5px',
  },
  cardLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.95rem',
    color: '#94a3b8',
    marginBottom: '25px',
  },
  locIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary)',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    marginTop: 'auto',
  },
  cardType: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#e2e8f0',
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: '6px 14px',
    borderRadius: '100px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  actionBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 20px',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: '30px',
    border: '2px dashed rgba(255, 255, 255, 0.1)',
    color: '#e2e8f0',
  },
  emptyAddBtn: {
    marginTop: '20px',
    color: 'var(--primary)',
    fontWeight: '600',
    textDecoration: 'none',
    borderBottom: '2px solid var(--primary)',
    paddingBottom: '2px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#1e293b',
    borderRadius: '24px',
    padding: '40px',
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  modalIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: 'white',
    marginBottom: '12px',
  },
  modalText: {
    color: '#94a3b8',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  deleteBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#ef4444',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)',
  }
};

export default ManageProperties;
