import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Home, MapPin, User, Eye, Clock, 
  Sparkles, ArrowLeft, Trash2
} from 'lucide-react';
import { getSavedProperties, toggleSaveProperty } from '../services/propertyService';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import * as LucideIcons from 'lucide-react';

const formatPrice = (price) => {
  if (!price) return '0';
  if (price >= 1000) return (price / 1000).toFixed(price % 1000 === 0 ? 0 : 1).toLowerCase() + 'k';
  return price;
};

const SavedProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const response = await getSavedProperties();
      setProperties(response.data);
    } catch (err) {
      toast.error("Could not load your saved properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (e, id) => {
    e.stopPropagation();
    try {
      await toggleSaveProperty(id);
      setProperties(prev => prev.filter(p => p.id !== id));
      toast.success("Removed from favorites");
    } catch (err) {
      toast.error("Failed to remove");
    }
  };

  if (loading) return <div style={styles.loaderArea}><Loader /></div>;

  return (
    <div style={styles.pageWrapper}>
      <div className="container" style={{ paddingTop: '120px' }}>
        <div style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={styles.badge}>
              <Heart size={14} fill="#ef4444" color="#ef4444" />
              <span>Personal Collection</span>
            </div>
            <h1 style={styles.title}>Saved <span style={styles.gradientText}>Properties</span></h1>
            <p style={styles.subtitle}>You have {properties.length} properties in your favorites</p>
          </div>
        </div>

        {properties.length > 0 ? (
          <div style={styles.grid}>
            {properties.map((p, idx) => (
              <SavedCard 
                key={p.id} 
                property={p} 
                index={idx} 
                navigate={navigate} 
                onRemove={handleRemove} 
              />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.emptyState}
          >
            <div style={styles.emptyIconBox}>
              <Heart size={48} color="#ef4444" style={{ opacity: 0.3 }} />
            </div>
            <h2>No favorites yet</h2>
            <p>Start exploring and heart the spaces you love to see them here.</p>
            <button 
              onClick={() => navigate('/properties')} 
              style={styles.exploreBtn}
            >
              Explore Properties
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const SavedCard = ({ property, index, navigate, onRemove }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -10 }}
      onClick={() => navigate(`/properties/${property.id}`)}
      style={styles.card}
    >
      <div style={styles.cardMedia}>
        {property.images && property.images[0] ? (
          <img src={property.images[0]} style={styles.cardImg} alt={property.title} />
        ) : (
          <div style={styles.cardPlaceholder}><Home size={40} /></div>
        )}
        <div style={styles.imageOverlay}></div>
        <button 
          style={styles.removeBtn}
          onClick={(e) => onRemove(e, property.id)}
        >
          <Trash2 size={16} />
        </button>
        <div style={styles.priceTag}>
          ₹{formatPrice(property.rent_amount)}
        </div>
      </div>
      <div style={styles.cardBody}>
        <h3 style={styles.cardTitle}>{property.title}</h3>
        <div style={styles.cardLoc}>
          <MapPin size={12} color="#a78bfa" />
          <span>{property.locality}, {property.city}</span>
        </div>
        <div style={styles.cardMeta}>
          <div style={styles.metaItem}><LucideIcons.Layout size={12} /> {property.room_type}</div>
          <div style={styles.metaItem}><Eye size={12} /> {property.views || 0} views</div>
        </div>
      </div>
    </motion.div>
  );
};

const styles = {
  pageWrapper: { backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', paddingBottom: '100px' },
  loaderArea: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' },
  header: { display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '60px' },
  backBtn: { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '50px', height: '50px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  badge: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800', marginBottom: '15px', border: '1px solid rgba(239, 68, 68, 0.2)' },
  title: { fontSize: '3rem', fontWeight: '900', marginBottom: '10px', letterSpacing: '-1.5px' },
  gradientText: { background: 'linear-gradient(90deg, #f472b6, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { color: '#94a3b8', fontSize: '1.1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' },
  card: { backgroundColor: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' },
  cardMedia: { height: '200px', position: 'relative' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardPlaceholder: { width: '100%', height: '100%', backgroundColor: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  imageOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.8), transparent)' },
  removeBtn: { position: 'absolute', top: '15px', right: '15px', width: '36px', height: '36px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 },
  priceTag: { position: 'absolute', bottom: '15px', left: '15px', backgroundColor: '#a78bfa', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '1rem', fontWeight: '900' },
  cardBody: { padding: '20px' },
  cardTitle: { fontSize: '1.2rem', fontWeight: '800', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  cardLoc: { display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '15px' },
  cardMeta: { display: 'flex', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', fontWeight: '600' },
  emptyState: { textAlign: 'center', padding: '100px 0' },
  emptyIconBox: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 30px' },
  exploreBtn: { marginTop: '30px', padding: '12px 30px', borderRadius: '12px', backgroundColor: '#a78bfa', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }
};

export default SavedProperties;
