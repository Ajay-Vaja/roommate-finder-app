import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, DollarSign, Home, ArrowLeft, 
  CheckCircle2, User, MessageSquare, Share2, Heart, Info,
  Star, ShieldCheck, Clock, Eye, ChevronRight, Maximize2, X, Calendar,
  Bell, Settings, Flag
} from 'lucide-react';
import { getProperty } from '../services/propertyService';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

import * as LucideIcons from 'lucide-react';

const formatPrice = (price) => {
  if (!price) return '0';
  if (price >= 1000) return (price / 1000).toFixed(price % 1000 === 0 ? 0 : 1).toLowerCase() + 'k';
  return price;
};

// Real mapping for Lucide icons
const getAmenityIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('wifi')) return <LucideIcons.Wifi size={20} />;
  if (n.includes('ac') || n.includes('air conditioning')) return <LucideIcons.Wind size={20} />;
  if (n.includes('kitchen')) return <LucideIcons.UtensilsCrossed size={20} />;
  if (n.includes('wash') || n.includes('machine')) return <LucideIcons.Waves size={20} />;
  if (n.includes('lift') || n.includes('elevator')) return <LucideIcons.ArrowUpCircle size={20} />;
  if (n.includes('gym')) return <LucideIcons.Dumbbell size={20} />;
  if (n.includes('tv') || n.includes('television')) return <LucideIcons.Tv size={20} />;
  if (n.includes('park')) return <LucideIcons.Car size={20} />;
  if (n.includes('bed')) return <LucideIcons.Bed size={20} />;
  if (n.includes('wardrobe') || n.includes('cupboard')) return <LucideIcons.Archive size={20} />;
  if (n.includes('bath') || n.includes('shower')) return <LucideIcons.Bath size={20} />;
  if (n.includes('security')) return <LucideIcons.ShieldCheck size={20} />;
  if (n.includes('power') || n.includes('backup')) return <LucideIcons.Zap size={20} />;
  return <LucideIcons.CheckCircle2 size={20} />;
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhotosModal, setShowPhotosModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await getProperty(id);
        setProperty(response.data);
      } catch (error) {
        toast.error("Failed to load property details");
        navigate('/properties');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  useEffect(() => {
    if (selectedImage || showPhotosModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage, showPhotosModal]);

  if (loading || !property) return <div style={styles.loadingArea}><Loader fullScreen={false} /></div>;

  return (
    <div style={styles.pageWrapper}>
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            style={styles.lightboxOverlay}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              style={styles.lightboxContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button style={styles.closeLightbox} onClick={() => setSelectedImage(null)}><X size={32} /></button>
              <img src={selectedImage} style={styles.lightboxImg} alt="Preview" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPhotosModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <button onClick={() => setShowPhotosModal(false)} style={styles.closeBtn}><X size={24} /></button>
                <h3>All Photos</h3>
              </div>
              <div style={styles.modalGrid}>
                {property.images && property.images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    style={styles.modalImg} 
                    onClick={() => {
                      setSelectedImage(img);
                      setShowPhotosModal(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container" style={styles.headerArea}>
        <div style={styles.topActions}>
          <div style={styles.backBtn} onClick={() => navigate('/properties')}><ArrowLeft size={16} /> Back to Discovery</div>
          <div style={styles.actionGroup}>
            <button style={styles.iconBtn}><Share2 size={18} /></button>
            <button style={styles.iconBtn}><Heart size={18} /></button>
          </div>
        </div>
        <h1 style={styles.mainTitle}>{property.title}</h1>
        <div style={styles.headerMeta}>
          <div style={styles.metaItem}><MapPin size={16} color="#a78bfa" /> {property.locality}, {property.city}</div>
          <div style={styles.metaItem}><Star size={16} fill="#f59e0b" color="#f59e0b" /> {property.rating || '0.0'} (Verified Listing)</div>
        </div>
      </div>

      {/* Full Width Gallery Structure */}
      <div className="container" style={styles.galleryWrapper}>
        <div style={{
          ...styles.galleryGrid,
          gridTemplateColumns: property.images && property.images.length > 1 ? '2fr 1fr' : '1fr'
        }}>
          <div style={styles.galleryMain}>
            {property.images && property.images[0] ? (
              <img src={property.images[0]} style={styles.mainImg} onClick={() => setSelectedImage(property.images[0])} />
            ) : (
              <div style={styles.placeholder}><Home size={64} /></div>
            )}
            {property.images && property.images.length > 1 && (
              <button onClick={() => setShowPhotosModal(true)} style={styles.viewPhotosBtn}><Maximize2 size={16} /> All Photos</button>
            )}
          </div>
          
          {property.images && property.images.length > 1 && (
            <div style={styles.gallerySide}>
              {property.images.slice(1, 3).map((img, i) => (
                <img key={i} src={img} style={styles.sideImg} onClick={() => setSelectedImage(img)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container" style={styles.contentArea}>
        <div style={styles.contentGrid}>
          {/* Main Content LEFT */}
          <div style={styles.detailsCol}>
            <div style={styles.infoStrip}>
              <div style={styles.stripItem}><div style={styles.stripIcon}><Home size={20} /></div><div><p>Type</p><h4>{property.room_type} Room</h4></div></div>
              <div style={styles.stripItem}><div style={styles.stripIcon}><Calendar size={20} /></div><div><p>Available</p><h4>{property.available_from ? new Date(property.available_from).toLocaleDateString() : 'Jun 1'}</h4></div></div>
              <div style={styles.stripItem}><div style={styles.stripIcon}><User size={20} /></div><div><p>Roommates Needed</p><h4>{property.occupancy_count || 1}</h4></div></div>
              <div style={styles.stripItem}><div style={styles.stripIcon}><Eye size={20} /></div><div><p>Interest</p><h4>{property.views || 0} Views</h4></div></div>
            </div>

            <section style={styles.glassSection}>
              <h3 style={styles.sectionHeading}>About this property</h3>
              <p style={styles.descText}>{property.description || "Looking for a friendly roommate to share this beautiful space. High speed internet and great views included."}</p>
            </section>

            <section style={styles.glassSection}>
              <h3 style={styles.sectionHeading}>What this place offers</h3>
              <div style={styles.amenityGrid}>
                {property.amenities && property.amenities.split(',').map((amt, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.08)' }}
                    style={styles.amenityChip}
                  >
                    <div style={styles.amtIconWrapper}>
                      {getAmenityIcon(amt)}
                    </div>
                    <span>{amt.trim()}</span>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sticky Card RIGHT */}
          <aside style={styles.sidebarCol}>
            <div style={styles.stickyCard}>
              <div style={styles.cardPrice}>
                <h3>₹{formatPrice(property.rent_amount)}</h3>
                <span>/month</span>
              </div>
              
              <div style={styles.hostBox} onClick={() => navigate(`/profile/${property.user_id}`)}>
                {property.owner_pic ? <img src={property.owner_pic} style={styles.hostImg} /> : <div style={styles.avatarEmpty}><User size={24} /></div>}
                <div style={styles.hostText}>
                  <p>Hosted by</p>
                  <h4>{property.owner_name || 'Host'}</h4>
                </div>
              </div>

              <button style={styles.reserveBtn} onClick={() => toast.success("Scheduling feature coming soon!")}>
                <Calendar size={18} style={{marginRight: '8px'}} /> Schedule Visit
              </button>
              <button style={styles.msgBtn}><MessageSquare size={18} /> Message Host</button>
            </div>
            <div style={styles.reportBtn}><Flag size={16} /> Report listing</div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: { backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', paddingTop: '120px', paddingBottom: '100px' },
  loadingArea: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  headerArea: { marginBottom: '30px' },
  topActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '800', cursor: 'pointer' },
  actionGroup: { display: 'flex', gap: '10px' },
  iconBtn: { width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  headerBookBtn: { background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginLeft: '10px' },
  mainTitle: { fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '10px' },
  headerMeta: { display: 'flex', gap: '20px', color: '#94a3b8', fontWeight: '600' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  
  galleryWrapper: { marginBottom: '50px' },
  galleryGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', height: '500px', borderRadius: '30px', overflow: 'hidden' },
  galleryMain: { position: 'relative' },
  mainImg: { width: '100%', height: '100%', objectFit: 'cover' },
  viewPhotosBtn: { position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '10px 18px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' },
  gallerySide: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sideImg: { width: '100%', height: 'calc(50% - 6px)', objectFit: 'cover' },
  placeholder: { width: '100%', height: '100%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  contentArea: {},
  contentGrid: { display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '80px' },
  detailsCol: {},
  infoStrip: { display: 'flex', justifyContent: 'space-between', padding: '25px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '40px' },
  stripItem: { display: 'flex', alignItems: 'center', gap: '15px' },
  stripIcon: { width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' },
  glassSection: { backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '30px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', marginBottom: '30px' },
  sectionHeading: { fontSize: '1.6rem', fontWeight: '800', marginBottom: '20px' },
  descText: { fontSize: '1.15rem', color: '#94a3b8', lineHeight: '1.8' },
  amenityGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' },
  amenityChip: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' },
  amtIconWrapper: { width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa' },
  safetyCard: { display: 'flex', gap: '20px', padding: '30px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '24px', border: '1px solid rgba(34, 197, 94, 0.2)', '& h4': { margin: '0 0 5px' }, '& p': { color: '#94a3b8', margin: 0 } },

  sidebarCol: {},
  stickyCard: { position: 'sticky', top: '120px', padding: '35px', backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' },
  cardPrice: { display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '30px', '& h3': { fontSize: '2rem', fontWeight: '900', color: '#a78bfa', margin: 0 }, '& span': { color: '#64748b', fontWeight: '700' } },
  hostBox: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '20px', marginBottom: '25px', cursor: 'pointer' },
  hostImg: { width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' },
  avatarEmpty: { width: '48px', height: '48px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hostText: { '& p': { fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '800', margin: 0 }, '& h4': { fontSize: '1.1rem', margin: 0 } },
  reserveBtn: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', border: 'none', borderRadius: '16px', color: 'white', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', marginBottom: '12px' },
  msgBtn: { width: '100%', padding: '16px', background: 'none', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: 'white', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  reportBtn: { marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontWeight: '700', cursor: 'pointer' },

  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, overflowY: 'auto', padding: '40px 20px' },
  modalContent: { maxWidth: '1000px', margin: '0 auto' },
  modalHeader: { display: 'flex', alignItems: 'center', gap: '20px', color: 'white', marginBottom: '40px' },
  closeBtn: { background: 'rgba(255,255,255,0.1)', border: 'none', width: '44px', height: '44px', borderRadius: '50%', color: 'white', cursor: 'pointer' },
  modalGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' },
  modalImg: { width: '100%', height: '400px', objectFit: 'cover', borderRadius: '20px', cursor: 'pointer' },
  
  lightboxOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backdropFilter: 'blur(10px)' },
  lightboxContent: { position: 'relative', maxWidth: '90%', maxHeight: '90%' },
  lightboxImg: { maxWidth: '100%', maxHeight: '85vh', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.8)', display: 'block' },
  closeLightbox: { position: 'absolute', top: '-60px', right: '0', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' },
};

export default PropertyDetails;
