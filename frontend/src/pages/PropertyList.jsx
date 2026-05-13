import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, DollarSign, Tag, Calendar, Home, Search, 
  SlidersHorizontal, ArrowRight, X, LayoutGrid, 
  Filter, Info, Star, Heart, Building, Warehouse, 
  Store, Landmark, ChevronRight, ChevronDown, TrendingUp, 
  ShieldCheck, Sparkles, User, SortAsc, Eye, Clock, Users, Map
} from 'lucide-react';
import { getProperties, toggleSaveProperty, getSavedProperties } from '../services/propertyService';
import { locationData } from '../utils/locationData';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

import { useAuth } from '../hooks/useAuth';

const formatPrice = (price) => {
  if (!price) return '0';
  if (price >= 1000) return (price / 1000).toFixed(price % 1000 === 0 ? 0 : 1).toLowerCase() + 'k';
  return price;
};

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

const PropertyList = () => {
  const navigate = useNavigate();
  const { user: userData } = useAuth();
  const isSeeker = userData?.user_type === 'Seeker';

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [filters, setFilters] = useState({ search: '', city: '', localities: [], room_type: '', max_rent: '' });
  const [sortBy, setSortBy] = useState('newest');
  
  const [cityInput, setCityInput] = useState('');
  const [areaInput, setAreaInput] = useState('');
  const [showCitySugg, setShowCitySugg] = useState(false);
  const [showAreaSugg, setShowAreaSugg] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  const fetchSavedIds = async () => {
    if (!isSeeker) return;
    try {
      const res = await getSavedProperties();
      setSavedIds(res.data.map(p => p.id));
    } catch (err) { console.error(err); }
  };

  const handleToggleSave = async (id) => {
    if (!userData) {
      toast.error("Please login as a Seeker to save properties");
      return;
    }
    if (userData.user_type !== 'Seeker') {
      toast.error("Only seekers can save properties");
      return;
    }
    try {
      const res = await toggleSaveProperty(id);
      if (res.data.saved) {
        setSavedIds(prev => [...prev, id]);
        toast.success("Saved to favorites!");
      } else {
        setSavedIds(prev => prev.filter(sid => sid !== id));
        toast.success("Removed from favorites");
      }
    } catch (err) { toast.error("Could not save property"); }
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'views', label: 'Most Popular' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' }
  ];

  const currentSortLabel = sortOptions.find(o => o.value === sortBy)?.label;

  const cities = Object.keys(locationData);
  const citySuggestions = cityInput 
    ? cities.filter(c => c.toLowerCase().startsWith(cityInput.toLowerCase())).slice(0, 5)
    : [];

  const currentLocalities = filters.city && locationData[filters.city] ? locationData[filters.city] : [];
  const areaSuggestions = areaInput
    ? currentLocalities.filter(a => a.toLowerCase().startsWith(areaInput.toLowerCase()) && !filters.localities.includes(a)).slice(0, 5)
    : [];

  const categories = [
    { name: 'All', icon: <Sparkles size={18} /> },
    { name: '1 RK', icon: <Home size={18} /> },
    { name: '1 BHK', icon: <Building size={18} /> },
    { name: '2 BHK', icon: <Building size={18} /> },
    { name: 'Bungalow', icon: <Landmark size={18} /> },
    { name: 'Tenement', icon: <Store size={18} /> },
    { name: 'Shared', icon: <Users size={18} /> },
  ];

  // Apply active category filter locally
  let filteredProperties = properties.filter(prop => {
    let matchCategory = true;
    let matchRoomType = true;

    // 1. Category Filter (1 BHK, Bungalow, Shared, etc.)
    if (activeCategory !== 'All') {
      if (activeCategory === 'Shared') {
        matchCategory = prop.room_type === 'Shared';
      } else if (prop.title) {
        matchCategory = prop.title.toLowerCase().includes(activeCategory.toLowerCase());
      } else {
        matchCategory = false;
      }
    }

    // 2. Left Sidebar Filter (room_type radio buttons)
    if (filters.room_type) {
      matchRoomType = prop.room_type === filters.room_type;
    }

    return matchCategory && matchRoomType;
  });

  // Apply Sorting
  if (sortBy === 'price_low') {
    filteredProperties.sort((a, b) => a.rent_amount - b.rent_amount);
  } else if (sortBy === 'price_high') {
    filteredProperties.sort((a, b) => b.rent_amount - a.rent_amount);
  } else if (sortBy === 'views') {
    filteredProperties.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else {
    // Newest
    filteredProperties.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  const fetchProperties = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const response = await getProperties(currentFilters);
      setProperties(response.data);
    } catch (err) {
      toast.error("Could not load properties");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when filters change (with debounce for rent)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProperties();
    }, 500); // 500ms debounce for typing
    return () => clearTimeout(timer);
  }, [filters.search, filters.city, filters.localities, filters.max_rent, filters.room_type]);

  useEffect(() => { 
    fetchProperties(); 
    fetchSavedIds();
  }, []);

  const resetFilters = () => {
    setFilters({ search: '', city: '', localities: [], room_type: '', max_rent: '' });
    setCityInput('');
    setAreaInput('');
    setActiveCategory('All');
  };

  const handleCitySelect = (city) => {
    setFilters(prev => ({ ...prev, city, search: '', localities: [] }));
    setCityInput(city);
    setShowCitySugg(false);
  };

  const toggleArea = (area) => {
    setFilters(prev => {
      const exists = prev.localities.includes(area);
      if (exists) {
        return { ...prev, localities: prev.localities.filter(a => a !== area) };
      } else {
        return { ...prev, localities: [...prev.localities, area] };
      }
    });
    setAreaInput('');
    setShowAreaSugg(false);
  };

  return (
    <div style={styles.pageWrapper}>
      <style>{`
        .suggestion-item:hover {
          background-color: rgba(167, 139, 250, 0.1) !important;
          color: #a78bfa !important;
        }
        .area-tag:hover {
          background-color: rgba(167, 139, 250, 0.2) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
        .tag-close:hover {
          color: #f472b6 !important;
          opacity: 1 !important;
        }
      `}</style>

      {/* Click-away overlay */}
      {(showCitySugg || showAreaSugg) && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
          onMouseDown={() => { setShowCitySugg(false); setShowAreaSugg(false); }}
        />
      )}

      {/* Restored Hero Structure with Dark UI */}
      <section style={styles.hero}>
        <div style={styles.heroOverlay}></div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.heroContent}
        >
          <div style={styles.heroBadge}>
            <TrendingUp size={14} />
            <span>Over 2,000+ rooms added this week</span>
          </div>
          <h1 style={styles.heroTitle}>Find your perfect <br /><span style={styles.gradientText}>space to live.</span></h1>
          <p style={styles.heroSubtitle}>Browse thousands of available spaces with premium amenities and trusted roommates.</p>
          
          <div style={styles.searchBarWrapper}>
            <div style={styles.searchMain}>
              {/* City Search */}
              <div style={{ ...styles.searchGroup, position: 'relative' }}>
                <MapPin size={20} color="#a78bfa" />
                <input 
                  type="text" 
                  placeholder="Where do you want to live?" 
                  style={styles.searchInput}
                  value={cityInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCityInput(val);
                    setFilters(prev => ({ ...prev, search: val, city: '' }));
                    setShowCitySugg(true);
                  }}
                  onFocus={() => setShowCitySugg(true)}
                />
                
                {showCitySugg && citySuggestions.length > 0 && (
                  <div style={styles.suggestionDrop}>
                    {citySuggestions.map(city => (
                      <div 
                        key={city} 
                        className="suggestion-item"
                        style={styles.suggestionItem}
                        onMouseDown={() => handleCitySelect(city)}
                      >
                        <MapPin size={14} />
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.vDivider}></div>

              {/* Area Search */}
              <div style={{ ...styles.searchGroup, position: 'relative', flex: 1.2 }}>
                <Map size={20} color="#a78bfa" />
                <input 
                  type="text" 
                  placeholder={filters.city ? `Search areas in ${filters.city}...` : "Select a city first"} 
                  style={styles.searchInput}
                  value={areaInput}
                  onChange={(e) => {
                    setAreaInput(e.target.value);
                    setShowAreaSugg(true);
                  }}
                  onFocus={() => setShowAreaSugg(true)}
                  disabled={!filters.city}
                />

                {showAreaSugg && areaSuggestions.length > 0 && (
                  <div style={styles.suggestionDrop}>
                    {areaSuggestions.map(area => (
                      <div 
                        key={area} 
                        className="suggestion-item"
                        style={styles.suggestionItem}
                        onMouseDown={() => toggleArea(area)}
                      >
                        <Tag size={14} />
                        {area}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dedicated Area Tags Row */}
          {filters.localities.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.activeFiltersRow}
            >
              {filters.localities.map(loc => (
                <span 
                  key={loc} 
                  className="area-tag"
                  style={styles.areaTag}
                >
                  {loc}
                  <X 
                    size={14} 
                    style={{ cursor: 'pointer', opacity: 0.6, transition: 'all 0.2s' }} 
                    className="tag-close"
                    onMouseDown={(e) => { e.stopPropagation(); toggleArea(loc); }} 
                  />
                </span>
              ))}
              <button 
                style={styles.clearAllBtn}
                onClick={() => setFilters(prev => ({ ...prev, localities: [] }))}
              >
                Clear all
              </button>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* Restored Horizontal Category Bar */}
      <div style={styles.categoryBarWrapper}>
        <div style={styles.categoryBar}>
          {categories.map((cat) => (
            <button 
              key={cat.name} 
              onClick={() => setActiveCategory(cat.name)}
              style={{
                ...styles.categoryBtn,
                ...(activeCategory === cat.name ? styles.categoryBtnActive : {})
              }}
            >
              {cat.icon}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.mainWrapper}>
        <div className="container">
          <div style={styles.contentGrid}>
            {/* Sidebar Left */}
            <aside style={styles.sidebar}>
              <div style={styles.sideCard}>
                <div style={styles.sideHeader}>
                  <h3>Filters</h3>
                  <button onClick={resetFilters} style={styles.resetLink}>Reset</button>
                </div>

                <div style={styles.filterGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={styles.filterLabel}>Monthly Budget</label>
                    <span style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: '800' }}>
                      {filters.max_rent ? `Up to ₹${parseInt(filters.max_rent).toLocaleString()}` : 'Any Price'}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="2000" 
                    max="50000" 
                    step="500"
                    style={styles.budgetSlider}
                    value={filters.max_rent || 50000}
                    onChange={(e) => setFilters({...filters, max_rent: e.target.value})}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: '#64748b', fontSize: '0.7rem', fontWeight: '700' }}>
                    <span>₹2k</span>
                    <span>₹50k+</span>
                  </div>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Room Type</label>
                  <div style={styles.radioList}>
                    {['Any', 'Private', 'Shared'].map(type => (
                      <label key={type} style={styles.radioItem}>
                        <input 
                          type="radio" 
                          name="rt" 
                          checked={(filters.room_type || 'Any') === type}
                          onChange={() => setFilters({...filters, room_type: type === 'Any' ? '' : type})}
                        />
                        <span>{type} Room</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Grid Right */}
            <main style={styles.propertySection}>
              <div style={styles.listHeader}>
                <div style={styles.listInfo}>
                  <h2 style={styles.sectionTitle}>Featured Properties</h2>
                  <p style={styles.sectionSubtitle}>Showing {filteredProperties.length} matches</p>
                </div>
                  {/* Custom Sort Dropdown */}
                  <div style={{ position: 'relative' }}>
                    <div 
                      style={styles.sortBox} 
                      onClick={() => setShowSortMenu(!showSortMenu)}
                    >
                      <SlidersHorizontal size={14} color="#94a3b8" />
                      <div style={styles.sortLabel}>Sort by:</div>
                      <div style={styles.sortValue}>{currentSortLabel}</div>
                      <ChevronDown size={14} color="#a78bfa" />
                    </div>

                    <AnimatePresence>
                      {showSortMenu && (
                        <>
                          <div 
                            style={{ position: 'fixed', inset: 0, zIndex: 90 }} 
                            onClick={() => setShowSortMenu(false)}
                          />
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            style={styles.sortMenu}
                          >
                            {sortOptions.map(opt => (
                              <div 
                                key={opt.value}
                                className="suggestion-item"
                                style={{
                                  ...styles.sortMenuItem,
                                  backgroundColor: sortBy === opt.value ? 'rgba(167, 139, 250, 0.1)' : 'transparent',
                                  color: sortBy === opt.value ? '#a78bfa' : '#cbd5e1'
                                }}
                                onClick={() => {
                                  setSortBy(opt.value);
                                  setShowSortMenu(false);
                                }}
                              >
                                {opt.label}
                              </div>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

              {loading ? (
                <div style={styles.loaderArea}><Loader /></div>
              ) : (
                <div style={styles.grid}>
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((p, idx) => (
                      <PropertyCard 
                        key={p.id} 
                        property={p} 
                        index={idx} 
                        navigate={navigate} 
                        isSaved={savedIds.includes(p.id)}
                        onToggleSave={handleToggleSave}
                      />
                    ))
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
                      <Home size={48} style={{ margin: '0 auto 15px', opacity: 0.5 }} />
                      <h3>No properties found in this category</h3>
                      <p>Try selecting "All" or searching different criteria.</p>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyCard = ({ property, index, navigate, isSaved, onToggleSave }) => {
  const { user: userData } = useAuth();
  const isSeeker = userData?.user_type === 'Seeker';
  const allAmenities = property.amenities ? property.amenities.split(',') : [];
  const amenityList = allAmenities.slice(0, 3);
  const remainingCount = allAmenities.length - 3;
  
  // Dynamic styling based on room type
  const isPrivate = property.room_type?.toLowerCase() === 'private';
  const typeColor = isPrivate ? '#a78bfa' : '#38bdf8'; // Purple for Private, Blue for Shared
  const TypeIcon = isPrivate ? LucideIcons.Lock : LucideIcons.Users;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
      whileHover={{ 
        y: -15, 
        scale: 1.02,
        boxShadow: '0 30px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(167, 139, 250, 0.3)'
      }}
      onClick={() => navigate(`/properties/${property.id}`)}
      style={styles.card}
    >
      <div style={styles.cardMedia}>
        {property.images && property.images[0] ? (
          <img src={property.images[0]} style={styles.cardImg} alt={property.title} />
        ) : (
          <div style={styles.cardPlaceholder}><Home size={40} /></div>
        )}
        
        {/* Dark Gradient Overlay for readability */}
        <div style={styles.imageOverlay}></div>
        
        {/* Top Badges */}
        <div style={styles.cardTopBar}>
          <div style={{...styles.eliteTypeBadge, backgroundColor: `${typeColor}20`, border: `1px solid ${typeColor}40`, color: typeColor}}>
            <TypeIcon size={12} />
            {property.room_type}
          </div>
            <motion.button 
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              style={{
                ...styles.heartBtn,
                backgroundColor: isSaved ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.4)',
                border: isSaved ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                color: isSaved ? '#ef4444' : 'white',
                boxShadow: isSaved ? '0 0 20px rgba(239, 68, 68, 0.3)' : '0 8px 16px rgba(0,0,0,0.2)'
              }} 
              onClick={(e) => { e.stopPropagation(); onToggleSave(property.id); }}
            >
              <Heart 
                size={20} 
                fill={isSaved ? "#ef4444" : "none"} 
                strokeWidth={isSaved ? 0 : 2.5}
                style={{ 
                  filter: isSaved ? 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.8))' : 'none',
                  transition: 'all 0.3s ease'
                }} 
              />
            </motion.button>

        </div>

        {/* Integrated Bottom Strip on Image */}
        <div style={styles.imageBottomStrip}>
          <div style={styles.priceBlock}>
            <span style={styles.priceSymbol}>₹</span>
            <span style={styles.priceAmount}>{formatPrice(property.rent_amount)}</span>
            <span style={styles.priceTerm}>/mo</span>
          </div>
          <div style={styles.occupancyBadge}>
            <User size={14} color="#a78bfa" />
            <span>{property.occupancy_count || 1} Needed</span>
          </div>
        </div>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.cardHeader}>
          <h3 style={styles.cardTitle} className="truncate">{property.title}</h3>
          <div style={styles.cardLoc}>
            <MapPin size={12} color="#a78bfa" /> 
            <span className="truncate">{property.locality}, {property.city}</span>
          </div>
        </div>

        {/* Quick Amenities Box */}
        <div style={styles.amenityBox}>
          {allAmenities.length > 0 ? (
            <>
              {amenityList.map((amt, i) => (
                <div key={i} style={styles.miniAmt} title={amt}>
                  {amt.toLowerCase().includes('wifi') ? <LucideIcons.Wifi size={12} /> : 
                   amt.toLowerCase().includes('ac') ? <LucideIcons.Wind size={12} /> : 
                   amt.toLowerCase().includes('park') ? <LucideIcons.Car size={12} /> : 
                   amt.toLowerCase().includes('wash') ? <LucideIcons.Waves size={12} /> :
                   <CheckCircle2 size={12} />}
                  <span>{amt.trim()}</span>
                </div>
              ))}
              {remainingCount > 0 && (
                <div style={styles.moreAmtBadge}>+{remainingCount}</div>
              )}
            </>
          ) : (
            <span style={styles.noAmenities}>No specific amenities listed</span>
          )}
        </div>
        
        <div style={styles.cardFooter}>
          <div style={styles.statsRow}>
            <div style={styles.statItem}><Eye size={12} /> {property.views || 0}</div>
            <div style={styles.statItem}><Clock size={12} /> {timeAgo(property.created_at)}</div>
          </div>
          <div style={styles.ownerWrap}>
            <span style={styles.ownerName}>{property.owner_name?.split(' ')[0] || 'Host'}</span>
            {property.owner_pic ? <img src={property.owner_pic} style={styles.miniAvatar} /> : <div style={styles.avatarEmpty}><User size={10} /></div>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Add LucideIcons to scope if not already there
import * as LucideIcons from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';

const styles = {
  pageWrapper: { backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' },
  hero: {
    height: '65vh',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'url("https://images.unsplash.com/photo-1560518883-ce09059ee742?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80") center/cover no-repeat',
    padding: '0 20px',
  },
  heroOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.9))', zIndex: 1 },
  heroContent: { position: 'relative', zIndex: 100, maxWidth: '900px', textAlign: 'center' },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '8px 16px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' },
  heroTitle: { fontSize: '4.5rem', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-2px', marginBottom: '20px' },
  gradientText: { background: 'linear-gradient(90deg, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroSubtitle: { fontSize: '1.3rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' },
  searchBarWrapper: { maxWidth: '850px', margin: '0 auto', padding: '12px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(30px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' },
  searchMain: { backgroundColor: '#1e293b', borderRadius: '16px', display: 'flex', alignItems: 'center', padding: '8px' },
  searchGroup: { flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 20px' },
  searchInput: { border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '1rem', fontWeight: '600', color: 'white' },
  vDivider: { width: '1px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)' },
  searchBtn: { background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  
  suggestionDrop: { position: 'absolute', top: 'calc(100% + 15px)', left: '0', right: '0', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 100, overflow: 'hidden' },
  suggestionItem: { padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  activeFiltersRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' },
  areaTag: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', padding: '8px 16px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: '700', border: '1px solid rgba(167, 139, 250, 0.25)', transition: 'all 0.2s', backdropFilter: 'blur(10px)' },
  clearAllBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', marginLeft: '10px' },
  
  categoryBarWrapper: { backgroundColor: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: '80px', zIndex: 10, padding: '15px 0' },
  categoryBar: { maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '30px', justifyContent: 'center' },
  categoryBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.3s', padding: '8px', borderBottom: '2px solid transparent' },
  categoryBtnActive: { color: '#a78bfa', borderBottomColor: '#a78bfa' },

  mainWrapper: { padding: '60px 0', backgroundColor: '#0f172a' },
  contentGrid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '40px' },
  sidebar: {},
  sideCard: { backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '30px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' },
  sideHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  resetLink: { background: 'none', border: 'none', color: '#a78bfa', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' },
  filterGroup: { marginBottom: '30px' },
  filterLabel: { display: 'block', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '800', marginBottom: '12px', letterSpacing: '1px' },
  sidebarSearch: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' },
  sidebarInput: { background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: '0.9rem', fontWeight: '600', width: '100%' },
  radioList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  radioItem: { display: 'flex', alignItems: 'center', gap: '12px', color: '#94a3b8', fontWeight: '600', cursor: 'pointer', '& span': { fontSize: '0.9rem' } },

  budgetSlider: { width: '100%', accentColor: '#a78bfa', cursor: 'pointer', height: '6px', borderRadius: '10px' },
  propertySection: { flex: 1 },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' },
  sectionTitle: { fontSize: '2rem', fontWeight: '900', color: 'white', letterSpacing: '-1px' },
  sectionSubtitle: { color: '#64748b', fontSize: '1rem', marginTop: '4px' },
  sortBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '8px 18px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.3s', cursor: 'pointer' },
  sortLabel: { color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem' },
  sortValue: { color: '#a78bfa', fontWeight: '800', fontSize: '0.85rem', minWidth: 'fit-content' },
  sortMenu: { position: 'absolute', top: 'calc(100% + 10px)', right: '0', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', zIndex: 100, minWidth: '200px', overflow: 'hidden', padding: '8px' },
  sortMenuItem: { padding: '12px 20px', borderRadius: '10px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' },
  card: { backgroundColor: '#1e293b', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', flexDirection: 'column' },
  cardMedia: { height: '260px', position: 'relative' },
  cardImg: { width: '100%', height: '100%', objectFit: 'cover' },
  cardPlaceholder: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  imageOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,0.4) 0%, transparent 40%, rgba(15,23,42,0.9) 100%)' },
  cardTopBar: { position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2 },
  eliteTypeBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', backdropFilter: 'blur(10px)' },
  heartBtn: { 
    width: '42px', 
    height: '42px', 
    borderRadius: '14px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(10px)',
  },
  imageBottomStrip: { position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2 },
  priceBlock: { display: 'flex', alignItems: 'baseline', gap: '2px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' },
  priceSymbol: { fontSize: '1.2rem', color: '#a78bfa', fontWeight: '800' },
  priceAmount: { fontSize: '2rem', fontWeight: '900', color: 'white', lineHeight: '1' },
  priceTerm: { fontSize: '0.9rem', color: '#cbd5e1', fontWeight: '600', marginLeft: '4px' },
  occupancyBadge: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', fontWeight: '700', color: 'white' },
  cardBody: { padding: '25px', display: 'flex', flexDirection: 'column', flex: 1 },
  cardHeader: { marginBottom: '20px' },
  cardTitle: { fontSize: '1.4rem', fontWeight: '800', color: 'white', margin: '0 0 8px 0', letterSpacing: '-0.5px', lineHeight: '1.3' },
  cardLoc: { color: '#94a3b8', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' },
  amenityBox: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '25px', marginTop: 'auto', alignItems: 'center' },
  miniAmt: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#0f172a', padding: '8px 12px', borderRadius: '10px', fontSize: '0.75rem', color: '#cbd5e1', fontWeight: '600', border: '1px solid rgba(255,255,255,0.03)' },
  moreAmtBadge: { display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', padding: '6px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '800', border: '1px solid rgba(167, 139, 250, 0.2)' },
  noAmenities: { fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' },
  statsRow: { display: 'flex', gap: '15px' },
  statItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', fontWeight: '700' },
  ownerWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  ownerName: { color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700' },
  miniAvatar: { width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1e293b' },
  avatarEmpty: { width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  loaderArea: { padding: '100px 0', textAlign: 'center' }
};

export default PropertyList;
