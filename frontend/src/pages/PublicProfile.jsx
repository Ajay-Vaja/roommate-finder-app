import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, Briefcase, Calendar, 
  Moon, Sun, Users, Volume2, Cigarette, Wine, 
  Dog, Coffee, MapPin, DollarSign, CheckCircle, 
  ArrowLeft, Home, Star, ShieldCheck, MessageSquare,
  ChevronRight
} from 'lucide-react';
import api from '../services/api';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        toast.error("No user ID provided");
        navigate(-1);
        return;
      }
      try {
        setLoading(true);
        const { data } = await api.get(`/user/profile/${id}`);
        setProfileData(data);
      } catch (err) {
        console.error("Failed to fetch public profile", err);
        const errorMsg = err.response?.data?.msg || "Could not load user profile";
        toast.error(errorMsg);
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id, navigate]);

  if (loading) return <div style={styles.loadingArea}><Loader /></div>;
  if (!profileData) return null;

  const { user, lifestyle, property, preferences } = profileData;

  return (
    <div style={styles.pageWrapper}>
      <div className="container">
        {/* Dark Cinematic Header */}
        <header style={styles.header}>
          <button onClick={() => navigate(-1)} style={styles.backBtn}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <div style={styles.headerText}>
            <h1 style={styles.headerTitle}>Host Insights</h1>
            <p style={styles.headerSub}>Viewing {user.name}'s verified profile</p>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.contactBtn} onClick={() => toast.success("Message feature coming soon!")}>
              <MessageSquare size={18} /> Message
            </button>
          </div>
        </header>

        <div style={styles.profileGrid}>
          {/* Left Column: Sidebar Card */}
          <aside style={styles.sidebar}>
            <div style={styles.userCard}>
              <div style={styles.avatarWrapper}>
                {user.profile_pic ? (
                  <img src={user.profile_pic} alt={user.name} style={styles.avatar} />
                ) : (
                  <div style={styles.avatarPlaceholder}><User size={48} /></div>
                )}
                {user.is_verified && <div style={styles.verifiedBadge}><CheckCircle size={16} color="white" /></div>}
              </div>
              
              <h2 style={styles.userName}>{user.name}</h2>
              <p style={styles.userType}>{user.user_type}</p>
              
              <div style={styles.statsRow}>
                <div style={styles.statItem}><Star size={16} fill="#f59e0b" color="#f59e0b" /> <span>4.8 Rating</span></div>
              </div>

              <div style={styles.infoList}>
                <div style={styles.infoItem}><Briefcase size={18} /> <span>{user.occupation || 'Professional'}</span></div>
                <div style={styles.infoItem}><Users size={18} /> <span>{user.gender}, {user.age || '25'} yrs</span></div>
              </div>

              <div style={styles.trustBox}>
                <ShieldCheck size={20} color="#22c55e" />
                <span>Highly Verified</span>
              </div>

              <div style={styles.strengthBox}>
                <div style={styles.strengthHeader}>
                  <span style={styles.strengthLabel}>Profile Strength</span>
                  <span style={styles.strengthValue}>100%</span>
                </div>
                <div style={styles.progressBarBg}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={styles.progressBarFill}
                  ></motion.div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Content Bento */}
          <main style={styles.mainContent}>
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>About {(user.name || 'User').split(' ')[0]}</h3>
              <div style={styles.bentoGrid}>
                {Object.entries(lifestyle).map(([key, value]) => (
                  <div key={key} style={styles.bentoBox}>
                    <p style={styles.bentoLabel}>{key.replace(/_/g, ' ')}</p>
                    <h4 style={styles.bentoValue}>{value}</h4>
                  </div>
                ))}
              </div>
            </section>

            {property && (
              <section style={styles.section}>
                <h3 style={styles.sectionTitle}>Active Hosting</h3>
                <motion.div 
                  whileHover={{ x: 10 }}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  style={styles.propertyCard}
                >
                  <div style={styles.propIcon}><Home size={28} /></div>
                  <div style={styles.propText}>
                    <h4 style={styles.propTitle}>{property.title}</h4>
                    <p style={styles.propLoc}><MapPin size={14} color="#a78bfa" /> {property.locality}, {property.city}</p>
                    <div style={styles.propPrice}>₹{property.rent_amount} <span style={styles.period}>/ month</span></div>
                  </div>
                  <ChevronRight size={24} color="#a78bfa" />
                </motion.div>
              </section>
            )}

            {preferences && (
              <section style={styles.section}>
                <h3 style={styles.sectionTitle}>My Preferences</h3>
                <div style={styles.bentoGrid}>
                  <div style={styles.bentoBox}>
                    <p style={styles.bentoLabel}>Preferred City</p>
                    <h4 style={styles.bentoValue}>{preferences.city}</h4>
                  </div>
                  <div style={styles.bentoBox}>
                    <p style={styles.bentoLabel}>Budget</p>
                    <h4 style={styles.bentoValue}>{preferences.budget}</h4>
                  </div>
                  <div style={styles.bentoBox}>
                    <p style={styles.bentoLabel}>Room Type</p>
                    <h4 style={styles.bentoValue}>{preferences.room_type}</h4>
                  </div>
                  <div style={styles.bentoBox}>
                    <p style={styles.bentoLabel}>Preferred Areas</p>
                    <h4 style={styles.bentoValue}>{preferences.areas}</h4>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageWrapper: { minHeight: '100vh', backgroundColor: '#0f172a', background: 'var(--bg-gradient)', paddingTop: '120px', paddingBottom: '100px' },
  loadingArea: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '50px', backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '30px 40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px 20px', borderRadius: '14px', fontWeight: '700', cursor: 'pointer' },
  headerText: { textAlign: 'center' },
  headerTitle: { fontSize: '2.5rem', fontWeight: '900', color: 'white', letterSpacing: '-1.5px', margin: 0 },
  headerSub: { color: '#94a3b8', fontSize: '1rem', fontWeight: '500' },
  contactBtn: { backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },

  profileGrid: { display: 'grid', gridTemplateColumns: '350px 1fr', gap: '40px' },
  sidebar: {},
  userCard: { backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '30px', padding: '40px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' },
  avatarWrapper: { position: 'relative', width: '120px', height: '120px', margin: '0 auto 25px' },
  avatar: { width: '100%', height: '100%', borderRadius: '40px', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: '40px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: '900' },
  verifiedBadge: { position: 'absolute', bottom: '-5px', right: '-5px', backgroundColor: '#22c55e', width: '32px', height: '32px', borderRadius: '50%', border: '4px solid #0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  userName: { fontSize: '1.8rem', fontWeight: '900', color: 'white', letterSpacing: '-1px', marginBottom: '5px' },
  userType: { fontSize: '0.85rem', color: '#a78bfa', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '25px' },
  statsRow: { display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' },
  statItem: { display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '700' },
  infoList: { display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left', marginBottom: '35px' },
  infoItem: { display: 'flex', alignItems: 'center', gap: '15px', color: '#94a3b8', fontWeight: '600' },
  trustBox: { padding: '15px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#22c55e', fontWeight: '800', fontSize: '0.9rem', marginBottom: '25px', border: '1px solid rgba(34, 197, 94, 0.2)' },
  strengthBox: { textAlign: 'left', padding: '0 5px' },
  strengthHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' },
  strengthLabel: { fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase' },
  strengthValue: { fontSize: '0.9rem', fontWeight: '900', color: '#4ade80' },
  progressBarBg: { width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' },
  progressBarFill: { height: '100%', background: 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)', borderRadius: '10px' },

  mainContent: { display: 'flex', flexDirection: 'column', gap: '30px' },
  section: { backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '40px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' },
  sectionTitle: { fontSize: '1.8rem', fontWeight: '900', color: 'white', marginBottom: '30px', letterSpacing: '-1px' },
  bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
  bentoBox: { backgroundColor: 'rgba(0,0,0,0.2)', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' },
  bentoLabel: { fontSize: '0.75rem', fontWeight: '800', color: '#a78bfa', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' },
  bentoValue: { fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', margin: 0 },

  propertyCard: { display: 'flex', alignItems: 'center', gap: '25px', padding: '25px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' },
  propIcon: { width: '60px', height: '60px', borderRadius: '16px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  propText: { flex: 1 },
  propTitle: { fontSize: '1.4rem', color: 'white', fontWeight: '900', margin: '0 0 5px' },
  propLoc: { color: '#cbd5e1', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 },
  propPrice: { marginTop: '10px', fontSize: '1.5rem', fontWeight: '900', color: '#a78bfa' },
  period: { fontSize: '0.9rem', color: '#94a3b8', fontWeight: '600' }
};

export default PublicProfile;
