import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Briefcase, Calendar, 
  Moon, Sun, Trash2, Users, Volume2, Cigarette, Wine, 
  Dog, Coffee, MapPin, DollarSign, CheckCircle, 
  Edit3, Save, X, ArrowLeft, Camera, Home, Star, ShieldCheck,
  TrendingUp, Sparkles
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { locationData } from '../utils/locationData';
import Loader from '../components/Loader';

const Profile = () => {
  const { user: authUser, checkAuth } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const indianCities = Object.keys(locationData);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = React.useRef(null);
  
  const [formData, setFormData] = useState({
    user: {},
    lifestyle: {},
    requirements: {},
    property: {}
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/user/profile');
      setProfileData(data);
      setFormData(data);
      if (data.user.profile_pic) {
        setProfileImage(data.user.profile_pic);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      toast.error("Could not load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    if (section === 'requirements') {
      if (field === 'preferred_city') {
        const filtered = indianCities.filter(city => 
          city.toLowerCase().includes(value.toLowerCase())
        );
        setCitySuggestions(filtered);
        setShowSuggestions(value.length > 0);
        
        setFormData(prev => ({
          ...prev,
          requirements: {
            ...prev.requirements,
            preferred_city: value,
            preferred_areas: '' 
          }
        }));
        return;
      }

      if (field === '_locality_search') {
        const city = formData.requirements.preferred_city;
        const availableLocalities = locationData[city] || [];
        const filtered = availableLocalities.filter(loc => 
          loc.toLowerCase().includes(value.toLowerCase())
        );
        setCitySuggestions(filtered);
        setShowSuggestions(value.length > 0);
        
        setFormData(prev => ({ ...prev, requirements: { ...prev.requirements, _locality_search: value } }));
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAddLocality = (locality) => {
    const currentLocs = formData.requirements.preferred_areas ? formData.requirements.preferred_areas.split(',').map(s => s.trim()) : [];
    if (!currentLocs.includes(locality)) {
      const updated = [...currentLocs, locality].join(', ');
      handleInputChange('requirements', 'preferred_areas', updated);
    }
    handleInputChange('requirements', '_locality_search', '');
    setShowSuggestions(false);
  };

  const removeLocality = (loc) => {
    const currentLocs = formData.requirements.preferred_areas ? formData.requirements.preferred_areas.split(',').map(s => s.trim()) : [];
    const updated = currentLocs.filter(l => l !== loc).join(', ');
    handleInputChange('requirements', 'preferred_areas', updated);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        toast.success("Photo selected!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateData = {
        ...formData,
        profile_pic: profileImage
      };
      await api.put('/user/profile/update', updateData);
      await checkAuth(); // Refresh global auth state to update navbar photo
      toast.success("Profile updated successfully!");
      setProfileData(updateData);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profileData) return <div style={styles.loadingContainer}><Loader /></div>;

  const { user, lifestyle, requirements, property } = formData;

  const calculateProgress = () => {
    let score = 0;
    let total = 0;

    // Core User Info
    const userFields = ['phone', 'occupation', 'age'];
    userFields.forEach(f => {
      total++;
      if (user[f]) score++;
    });

    // Lifestyle Habits
    const lifestyleFields = [
      'sleep_schedule', 'cleanliness', 'smoking', 'drinking', 
      'food_habits', 'guests_policy', 'noise_level', 'pets', 
      'work_from_home', 'occupancy_count'
    ];
    lifestyleFields.forEach(f => {
      total++;
      if (lifestyle[f]) score++;
    });

    // Type-specific details
    if (user.user_type === 'Seeker') {
      const reqFields = ['preferred_city', 'min_budget', 'max_budget', 'preferred_areas', 'room_type_pref', 'move_in_date'];
      reqFields.forEach(f => {
        total++;
        if (requirements[f]) score++;
      });
    } else {
      const propFields = ['title', 'description', 'address', 'city', 'locality', 'rent_amount', 'room_type'];
      propFields.forEach(f => {
        total++;
        if (property && property[f]) score++;
      });
    }

    // Profile Pic (Significant weight)
    total += 2;
    if (user.profile_pic) score += 2;

    return Math.round((score / total) * 100);
  };

  const progress = calculateProgress();

  return (
    <div style={styles.pageWrapper}>
      <div className="container">
        {/* Cinematic Header */}
        <div style={styles.header}>
          <div style={styles.profileHero}>
            <div style={styles.avatarWrapper}>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
              <div style={styles.avatar}>
                {profileImage ? <img src={profileImage} alt="Profile" style={styles.avatarImg} /> : user.name?.charAt(0).toUpperCase()}
              </div>
              {isEditing && <button style={styles.camBtn} onClick={() => fileInputRef.current.click()}><Camera size={16} /></button>}
            </div>
            
            <div style={styles.heroText}>
              <h1 style={styles.userName}>{user.name}</h1>
              <div style={styles.heroMeta}>
                <span style={styles.userTypeBadge}>
                  {user.user_type === 'Seeker' ? <Users size={14} /> : <Home size={14} />}
                  <span>{user.user_type === 'Seeker' ? 'Room Seeker' : 'Property Host'}</span>
                </span>
                <span style={styles.userOccupation}>{user.occupation || 'Member'} • {user.age || '24'} yrs</span>
              </div>
              
              <div style={styles.trustBadgeHero}>
                <div style={styles.trustCircle}>
                  <svg width="36" height="36" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--primary)" strokeWidth="3" 
                      strokeDasharray={`${progress}, 100`} transform="rotate(-90 18 18)" />
                  </svg>
                  <span style={styles.trustPercent}>{progress}%</span>
                </div>
                <div style={styles.trustInfo}>
                  <span style={styles.strengthLabelStyle}>Profile Strength</span>
                  <span style={styles.trustStatus}>{progress > 80 ? 'Highly Verified' : progress > 50 ? 'Partially Verified' : 'Incomplete'}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.actionGroup}>
            {isEditing ? (
              <>
                <button onClick={() => {setIsEditing(false); setFormData(profileData);}} style={styles.cancelBtn}><X size={18} /> Cancel</button>
                <button onClick={handleSave} style={styles.saveBtn} disabled={saving}><Save size={18} /> {saving ? 'Saving...' : 'Save'}</button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} style={styles.editBtn}><Edit3 size={18} /> Edit Profile</button>
            )}
          </div>
        </div>

        <div style={styles.mainGrid}>
          {/* Lifestyle Bento Grid */}
          <section style={styles.leftCol}>
            <h2 style={styles.sectionTitle}>Lifestyle Habits</h2>
            <div style={styles.bentoGrid}>
              <HabitBox icon={<Moon size={20} />} label="Sleep" value={lifestyle.sleep_schedule} isEditing={isEditing} options={['Early Bird', 'Night Owl', 'Flexible']} onSelect={(v) => handleInputChange('lifestyle', 'sleep_schedule', v)} />
              <HabitBox icon={<Trash2 size={20} />} label="Cleanliness" value={lifestyle.cleanliness} isEditing={isEditing} options={['Very Clean', 'Moderate', 'Relaxed']} onSelect={(v) => handleInputChange('lifestyle', 'cleanliness', v)} />
              <HabitBox icon={<Cigarette size={20} />} label="Smoking" value={lifestyle.smoking} isEditing={isEditing} options={['Yes', 'No', 'Outside Only']} onSelect={(v) => handleInputChange('lifestyle', 'smoking', v)} />
              <HabitBox icon={<Wine size={20} />} label="Drinking" value={lifestyle.drinking} isEditing={isEditing} options={['Yes', 'No', 'Occasional']} onSelect={(v) => handleInputChange('lifestyle', 'drinking', v)} />
              <HabitBox icon={<Coffee size={20} />} label="Food" value={lifestyle.food_habits} isEditing={isEditing} options={['Veg', 'Non-Veg', 'Vegan']} onSelect={(v) => handleInputChange('lifestyle', 'food_habits', v)} />
              <HabitBox icon={<Users size={20} />} label="Guests" value={lifestyle.guests_policy} isEditing={isEditing} options={['Frequent', 'Occasionally', 'No Guests']} onSelect={(v) => handleInputChange('lifestyle', 'guests_policy', v)} />
              <HabitBox icon={<Volume2 size={20} />} label="Noise" value={lifestyle.noise_level} isEditing={isEditing} options={['Quiet', 'Moderate', 'Lively']} onSelect={(v) => handleInputChange('lifestyle', 'noise_level', v)} />
              <HabitBox icon={<Dog size={20} />} label="Pets" value={lifestyle.pets} isEditing={isEditing} options={['Yes', 'No', 'Love them']} onSelect={(v) => handleInputChange('lifestyle', 'pets', v)} />
              <HabitBox icon={<Briefcase size={20} />} label="WFH Status" value={lifestyle.work_from_home} isEditing={isEditing} options={['Yes', 'No', 'Sometimes']} onSelect={(v) => handleInputChange('lifestyle', 'work_from_home', v)} />
              <HabitBox icon={<Users size={20} />} label={authUser.user_type === 'Seeker' ? 'People Moving In' : 'Roommates Needed'} value={isEditing ? lifestyle.occupancy_count : `${lifestyle.occupancy_count} ${lifestyle.occupancy_count === 1 ? (authUser.user_type === 'Seeker' ? 'Person' : 'Roommate') : (authUser.user_type === 'Seeker' ? 'People' : 'Roommates')}`} isEditing={isEditing} options={[1, 2, 3]} onSelect={(v) => handleInputChange('lifestyle', 'occupancy_count', v)} />
            </div>
          </section>

          {/* Side Info Panel */}
          <aside style={styles.rightCol}>
            <div style={styles.sideCard}>
              <h3 style={styles.sideCardTitle}>Contact Details</h3>
              <div style={styles.infoList}>
                <div style={styles.infoItem}><Mail size={16} /> <span>{user.email}</span></div>
                <div style={styles.infoItem}>
                  <Phone size={16} /> 
                  {isEditing ? <input style={styles.inlineInput} value={user.phone || ''} onChange={(e) => handleInputChange('user', 'phone', e.target.value)} /> : <span>{user.phone || 'No phone'}</span>}
                </div>
              </div>
            </div>

            {user.user_type === 'Seeker' ? (
              <div style={styles.sideCard}>
                <h3 style={styles.sideCardTitle}>My Preferences</h3>
                <div style={styles.prefGrid}>
                  <div style={styles.prefItem}>
                    <label style={styles.prefLabelStyle}>Preferred City</label>
                    {isEditing ? (
                      <div style={{position:'relative'}}>
                        <input style={styles.inlineInput} value={requirements.preferred_city} onChange={(e) => handleInputChange('requirements', 'preferred_city', e.target.value)} />
                        {showSuggestions && !requirements._locality_search && (
                          <div style={styles.suggestionBox}>
                            {citySuggestions.map(c => <div key={c} style={styles.suggestionItem} onClick={() => {handleInputChange('requirements', 'preferred_city', c); setShowSuggestions(false);}}>{c}</div>)}
                          </div>
                        )}
                      </div>
                    ) : <span style={styles.prefValueStyle}>{requirements.preferred_city || 'Anywhere'}</span>}
                  </div>
                  <div style={styles.prefItem}>
                    <label style={styles.prefLabelStyle}>Budget</label>
                    {isEditing ? (
                      <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                        <input style={styles.inlineInput} type="number" value={requirements.min_budget} onChange={(e) => handleInputChange('requirements', 'min_budget', e.target.value)} />
                        <span style={{color:'#94a3b8'}}>-</span>
                        <input style={styles.inlineInput} type="number" value={requirements.max_budget} onChange={(e) => handleInputChange('requirements', 'max_budget', e.target.value)} />
                      </div>
                    ) : <span style={styles.prefValueStyle}>₹{requirements.min_budget} - ₹{requirements.max_budget}</span>}
                  </div>
                </div>
              </div>
            ) : property && (
              <div style={styles.sideCard}>
                <h3 style={styles.sideCardTitle}>My Listing</h3>
                <div style={styles.listMini}>
                  <Home size={24} color="var(--primary)" />
                  <div>
                    <h4>{property.title}</h4>
                    <p>{property.locality}, {property.city}</p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

const HabitBox = ({ icon, label, value, isEditing, options, onSelect }) => (
  <div style={styles.bentoBox}>
    <div style={styles.bentoHeader}>{icon} <span>{label}</span></div>
    {isEditing ? (
      <div style={styles.bentoOptions}>
        {options.map(o => (
          <button key={o} onClick={() => onSelect(o)} style={{...styles.bentoPill, ...(value === o ? styles.bentoPillActive : {})}}>{o}</button>
        ))}
      </div>
    ) : <h4 style={styles.bentoValue}>{value}</h4>}
  </div>
);

const styles = {
  pageWrapper: { minHeight: '100vh', backgroundColor: '#0f172a', background: 'var(--bg-gradient)', paddingTop: '120px', paddingBottom: '100px' },
  loadingContainer: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '50px', backgroundColor: 'rgba(30, 41, 59, 0.4)', padding: '40px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' },
  profileHero: { display: 'flex', alignItems: 'center', gap: '30px' },
  avatarWrapper: { position: 'relative' },
  avatar: { width: '120px', height: '120px', borderRadius: '40px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: '900', color: 'white', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  camBtn: { position: 'absolute', bottom: '-5px', right: '-5px', backgroundColor: 'white', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' },
  heroText: { display: 'flex', flexDirection: 'column', gap: '8px' },
  userName: { fontSize: '2.8rem', fontWeight: '900', color: 'white', letterSpacing: '-2px', margin: 0 },
  heroMeta: { display: 'flex', gap: '15px', alignItems: 'center' },
  userTypeBadge: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa', padding: '6px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' },
  userOccupation: { color: '#94a3b8', fontSize: '1rem', fontWeight: '500' },
  
  trustBadgeHero: { display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px', padding: '10px 15px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '20px', width: 'fit-content' },
  trustCircle: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  trustPercent: { position: 'absolute', fontSize: '0.7rem', fontWeight: '900', color: 'white' },
  trustInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  strengthLabelStyle: { fontSize: '0.7rem', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' },
  trustStatus: { fontSize: '0.95rem', color: 'white', fontWeight: '700' },

  actionGroup: { display: 'flex', gap: '12px' },
  editBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '14px 28px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer' },
  saveBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--primary)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer' },
  cancelBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '14px 28px', borderRadius: '20px', fontWeight: '700', cursor: 'pointer' },

  mainGrid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' },
  sectionTitle: { color: 'white', fontSize: '1.6rem', fontWeight: '800', marginBottom: '25px', letterSpacing: '-0.5px' },
  bentoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' },
  bentoBox: { backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '30px', padding: '25px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' },
  bentoHeader: { display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '15px' },
  bentoValue: { fontSize: '1.3rem', fontWeight: '800', color: 'white', margin: 0 },
  bentoOptions: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  bentoPill: { padding: '8px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer', backgroundColor: 'transparent' },
  bentoPillActive: { backgroundColor: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' },

  rightCol: { display: 'flex', flexDirection: 'column', gap: '25px' },
  sideCard: { backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '30px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)' },
  sideCardTitle: { color: 'white', fontSize: '1.2rem', fontWeight: '800', marginBottom: '20px' },
  infoList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  infoItem: { display: 'flex', alignItems: 'center', gap: '15px', color: '#94a3b8', fontWeight: '600' },
  inlineInput: { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 15px', color: 'white', fontSize: '1rem', outline: 'none', width: '100%' },
  
  prefGrid: { display: 'flex', flexDirection: 'column', gap: '22px' },
  prefLabelStyle: { fontSize: '0.75rem', color: '#a78bfa', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px', display: 'block', letterSpacing: '0.5px' },
  prefValueStyle: { fontSize: '1.15rem', fontWeight: '800', color: 'white' },
  listMini: { display: 'flex', alignItems: 'center', gap: '15px', '& h4': { color: 'white', fontWeight: '800', margin: 0 }, '& p': { color: '#64748b', margin: 0 } },
  suggestionBox: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', zIndex: 100 },
  suggestionItem: { padding: '12px 20px', color: 'white', cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } }
};

export default Profile;
