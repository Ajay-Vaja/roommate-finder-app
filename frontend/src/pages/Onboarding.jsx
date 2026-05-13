import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/Loader';
import api from '../services/api';
import { 
  Moon, Sun, Trash2, Users, Volume2, Cigarette, Wine, 
  Dog, Coffee, Home, Briefcase, MapPin, DollarSign, 
  Calendar, CheckCircle, ArrowRight, ArrowLeft, X 
} from 'lucide-react';
import { locationData } from '../utils/locationData';
import toast from 'react-hot-toast';


const Onboarding = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Redirect if profile is already complete
  useEffect(() => {
    if (user && user.is_profile_complete) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch existing data to pre-fill form
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const { data } = await api.get('/user/onboarding-data');
        if (data.lifestyle) setLifestyle(prev => ({ ...prev, ...data.lifestyle }));
        if (data.requirements) {
          setRequirements(prev => ({ ...prev, ...data.requirements }));
          if (data.requirements.preferred_areas) {
            setSelectedLocalities(data.requirements.preferred_areas.split(', ').filter(Boolean));
          }
        }
        if (data.property) setProperty(prev => ({ ...prev, ...data.property }));
      } catch (err) {
        console.error("Failed to fetch existing onboarding data", err);
      }
    };
    if (user) fetchExistingData();
  }, [user]);


  // State for all onboarding data

  const [lifestyle, setLifestyle] = useState({
    sleep_schedule: 'Moderate',
    cleanliness: 'Moderate',
    guests_policy: 'Occasionally',
    smoking: 'No',
    drinking: 'No',
    pets: 'No',
    food_habits: 'Veg',
    noise_level: 'Moderate',
    work_from_home: 'No',
    occupancy_count: 1
  });

  const [requirements, setRequirements] = useState({
    preferred_city: '',
    min_budget: '',
    max_budget: '',
    preferred_areas: '',
    room_type_pref: 'Private',
    move_in_date: ''
  });

  const [property, setProperty] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    locality: '',
    rent_amount: '',
    room_type: 'Private',
    amenities: ''
  });

  // Autocomplete State
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [citySuggestionsOpen, setCitySuggestionsOpen] = useState(false);
  const [localityInput, setLocalityInput] = useState('');
  const [selectedLocalities, setSelectedLocalities] = useState([]);
  const [localitySuggestions, setLocalitySuggestions] = useState([]);
  const [localitySuggestionsOpen, setLocalitySuggestionsOpen] = useState(false);

  const handleCityChange = (e) => {
    const val = e.target.value;
    setRequirements({ ...requirements, preferred_city: val });
    if (val.length > 0) {
      const filtered = Object.keys(locationData).filter(c => 
        c.toLowerCase().startsWith(val.toLowerCase())
      );
      setCitySuggestions(filtered);
      setCitySuggestionsOpen(true);
    } else {
      setCitySuggestions([]);
    }
  };

  const selectCity = (city) => {
    setRequirements({ ...requirements, preferred_city: city });
    setCitySuggestionsOpen(false);
    setSelectedLocalities([]); // Reset localities when city changes
  };

  const handleLocalityChange = (e) => {
    const val = e.target.value;
    setLocalityInput(val);
    if (val.length > 0 && requirements.preferred_city) {
      // Find the correct key case-insensitively
      const cityKey = requirements.preferred_city ? Object.keys(locationData).find(
        k => k.toLowerCase() === requirements.preferred_city?.toLowerCase()
      ) : null;
      
      const allLocs = cityKey ? locationData[cityKey] : [];
      const filtered = allLocs.filter(l => 
        l.toLowerCase().includes(val.toLowerCase()) && !selectedLocalities.includes(l)
      );
      setLocalitySuggestions(filtered);
      setLocalitySuggestionsOpen(true);
    } else {
      setLocalitySuggestions([]);
    }
  };

  const selectLocality = (loc) => {
    const newLocs = [...selectedLocalities, loc];
    setSelectedLocalities(newLocs);
    setLocalityInput('');
    setLocalitySuggestionsOpen(false);
    setRequirements({ ...requirements, preferred_areas: newLocs.join(', ') });
  };

  const removeLocality = (loc) => {
    const newLocs = selectedLocalities.filter(l => l !== loc);
    setSelectedLocalities(newLocs);
    setRequirements({ ...requirements, preferred_areas: newLocs.join(', ') });
  };

  // Lister Autocomplete Handlers
  const handleListerCityChange = (e) => {
    const val = e.target.value;
    setProperty({ ...property, city: val });
    if (val.length > 0) {
      const filtered = Object.keys(locationData).filter(c => 
        c.toLowerCase().startsWith(val.toLowerCase())
      );
      setCitySuggestions(filtered);
      setCitySuggestionsOpen(true);
    } else {
      setCitySuggestions([]);
    }
  };

  const selectListerCity = (city) => {
    setProperty({ ...property, city: city, locality: '' });
    setCitySuggestionsOpen(false);
  };

  const handleListerLocalityChange = (e) => {
    const val = e.target.value;
    setProperty({ ...property, locality: val });
    if (val.length > 0 && property.city) {
      const cityKey = Object.keys(locationData).find(
        k => k.toLowerCase() === property.city.toLowerCase()
      );
      const allLocs = cityKey ? locationData[cityKey] : [];
      const filtered = allLocs.filter(l => 
        l.toLowerCase().includes(val.toLowerCase())
      );
      setLocalitySuggestions(filtered);
      setLocalitySuggestionsOpen(true);
    } else {
      setLocalitySuggestions([]);
    }
  };

  const selectListerLocality = (loc) => {
    setProperty({ ...property, locality: loc });
    setLocalitySuggestionsOpen(false);
  };

  // const [error, setError] = useState(''); // Removed in favor of toasts


  const validateStep = () => {
    // setError('');
    
    if (step === 2) {
      if (user?.user_type === 'Seeker') {
        if (!requirements.preferred_city) {
          toast.error('Please select a preferred city.');
          return false;
        }
        if (!requirements.preferred_areas) {
          toast.error('Please add at least one locality.');
          return false;
        }
        if (!requirements.min_budget || !requirements.max_budget) {
          toast.error('Please enter your budget range.');
          return false;
        }
        if (parseInt(requirements.max_budget) < parseInt(requirements.min_budget)) {
          toast.error('Maximum budget cannot be less than minimum budget.');
          return false;
        }
      } else {
        // Lister validation
        if (!property.title || !property.address || !property.city || !property.rent_amount) {
          toast.error('Please fill in all required property details.');
          return false;
        }
      }
    }
    return true;
  };


  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    // setError('');
    setStep(step - 1);
  };


  const handleSubmit = async () => {
    if (!user) return;
    if (!validateStep()) return;
    setLoading(true);
    try {
      const payload = {
        lifestyle,
        ...(user.user_type === 'Seeker' ? { requirements } : { property })
      };
      await api.post('/user/complete-profile', payload);
      toast.success('Profile completed successfully!');
      await checkAuth(); // Refresh user data to confirm profile is complete
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding failed', error);
      toast.error('Something went wrong. Please try again.');
    } finally {

      setLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.progressContainer}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{
                ...styles.progressDot,
                backgroundColor: step >= s ? '#8b5cf6' : 'rgba(255, 255, 255, 0.1)',
                boxShadow: step >= s ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none'
              }} />
            ))}
          </div>
          <h1 style={styles.title}>
            {step === 1 ? 'Lifestyle Habits' : 
             step === 2 ? (user?.user_type === 'Lister' ? 'Property Details' : 'Your Preferences') :
             'Review & Complete'}
          </h1>
          <p style={styles.subtitle}>Help us find the best matches for you.</p>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: LIFESTYLE (Bento Grid) */}
          {step === 1 && (
            <motion.div 
              key="step1" 
              variants={pageVariants} 
              initial="initial" 
              animate="enter" 
              exit="exit" 
              style={styles.bentoGrid}
            >
              {/* Profile Teaser Box (Span 2 rows) */}
              <div style={{ 
                ...styles.bentoBox, 
                gridColumn: 'span 4', 
                gridRow: 'span 2',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
                padding: 0,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img 
                  src="/images/onboarding-premium.png" 
                  alt="3D Character" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>

              {/* Sleep Schedule */}
              <div style={{ ...styles.bentoBox, gridColumn: 'span 4' }}>
                <div style={styles.bentoHeader}>
                  <div style={styles.bentoIcon}><Moon size={20} /></div>
                  <span style={styles.bentoLabel}>Sleep</span>
                </div>
                <div style={styles.bentoOptions}>
                  {['Early Bird', 'Night Owl', 'Flexible'].map(opt => (
                    <button key={opt} onClick={() => setLifestyle({...lifestyle, sleep_schedule: opt})} 
                            style={{...styles.bentoPill, ...(lifestyle.sleep_schedule === opt ? styles.bentoPillActive : {})}}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cleanliness */}
              <div style={{ ...styles.bentoBox, gridColumn: 'span 4' }}>
                <div style={styles.bentoHeader}>
                  <div style={styles.bentoIcon}><Trash2 size={20} /></div>
                  <span style={styles.bentoLabel}>Cleanliness</span>
                </div>
                <div style={styles.bentoOptions}>
                  {['Very Clean', 'Moderate', 'Relaxed'].map(opt => (
                    <button key={opt} onClick={() => setLifestyle({...lifestyle, cleanliness: opt})} 
                            style={{...styles.bentoPill, ...(lifestyle.cleanliness === opt ? styles.bentoPillActive : {})}}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Smoking */}
              <div style={{ ...styles.bentoBox, gridColumn: 'span 4' }}>
                <div style={styles.bentoHeader}>
                  <div style={styles.bentoIcon}><Cigarette size={20} /></div>
                  <span style={styles.bentoLabel}>Smoking</span>
                </div>
                <div style={styles.bentoOptions}>
                  {['Yes', 'No', 'Outside Only'].map(opt => (
                    <button key={opt} onClick={() => setLifestyle({...lifestyle, smoking: opt})} 
                            style={{...styles.bentoPill, ...(lifestyle.smoking === opt ? styles.bentoPillActive : {})}}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Habits */}
              <div style={{ ...styles.bentoBox, gridColumn: 'span 4' }}>
                <div style={styles.bentoHeader}>
                  <div style={styles.bentoIcon}><Coffee size={20} /></div>
                  <span style={styles.bentoLabel}>Food</span>
                </div>
                <div style={styles.bentoOptions}>
                  {['Veg', 'Non-Veg', 'Vegan'].map(opt => (
                    <button key={opt} onClick={() => setLifestyle({...lifestyle, food_habits: opt})} 
                            style={{...styles.bentoPill, ...(lifestyle.food_habits === opt ? styles.bentoPillActive : {})}}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guests Policy */}
              <div style={{ ...styles.bentoBox, gridColumn: 'span 4' }}>
                <div style={styles.bentoHeader}>
                  <div style={styles.bentoIcon}><Users size={20} /></div>
                  <span style={styles.bentoLabel}>Guests Policy</span>
                </div>
                <div style={styles.bentoOptions}>
                  {['Frequent', 'Occasionally', 'No Guests'].map(opt => (
                    <button key={opt} onClick={() => setLifestyle({...lifestyle, guests_policy: opt})} 
                            style={{...styles.bentoPill, ...(lifestyle.guests_policy === opt ? styles.bentoPillActive : {})}}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Noise Level */}
              <div style={{ ...styles.bentoBox, gridColumn: 'span 4' }}>
                <div style={styles.bentoHeader}>
                  <div style={styles.bentoIcon}><Volume2 size={20} /></div>
                  <span style={styles.bentoLabel}>Noise</span>
                </div>
                <div style={styles.bentoOptions}>
                  {['Quiet', 'Moderate', 'Lively'].map(opt => (
                    <button key={opt} onClick={() => setLifestyle({...lifestyle, noise_level: opt})} 
                            style={{...styles.bentoPill, ...(lifestyle.noise_level === opt ? styles.bentoPillActive : {})}}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pets */}
              <div style={{ ...styles.bentoBox, gridColumn: 'span 4' }}>
                <div style={styles.bentoHeader}>
                  <div style={styles.bentoIcon}><Dog size={20} /></div>
                  <span style={styles.bentoLabel}>Pets</span>
                </div>
                <div style={styles.bentoOptions}>
                  {['Yes', 'No', 'Love them'].map(opt => (
                    <button key={opt} onClick={() => setLifestyle({...lifestyle, pets: opt})} 
                            style={{...styles.bentoPill, ...(lifestyle.pets === opt ? styles.bentoPillActive : {})}}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work From Home */}
              <div style={{ ...styles.bentoBox, gridColumn: 'span 4' }}>
                <div style={styles.bentoHeader}>
                  <div style={styles.bentoIcon}><Briefcase size={20} /></div>
                  <span style={styles.bentoLabel}>Work From Home</span>
                </div>
                <div style={styles.bentoOptions}>
                  {['Yes', 'No', 'Sometimes'].map(opt => (
                    <button key={opt} onClick={() => setLifestyle({...lifestyle, work_from_home: opt})} 
                            style={{...styles.bentoPill, ...(lifestyle.work_from_home === opt ? styles.bentoPillActive : {})}}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occupancy Count */}
              <div style={{ ...styles.bentoBox, gridColumn: 'span 4' }}>
                <div style={styles.bentoHeader}>
                  <div style={styles.bentoIcon}><Users size={20} /></div>
                  <span style={styles.bentoLabel}>{user.user_type === 'Seeker' ? 'People Moving In' : 'Roommates Needed'}</span>
                </div>
                <div style={styles.bentoOptions}>
                  {[1, 2, 3].map(num => (
                    <button key={num} onClick={() => setLifestyle({...lifestyle, occupancy_count: num})} 
                            style={{...styles.bentoPill, ...(lifestyle.occupancy_count === num ? styles.bentoPillActive : {})}}>
                      {num === 3 ? '3+' : num} {num === 1 ? 'Person' : 'People'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SEEKER REQUIREMENTS */}
          {step === 2 && user?.user_type === 'Seeker' && (
            <motion.div key="step2s" variants={pageVariants} initial="initial" animate="enter" exit="exit" style={styles.customCard}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={styles.inputLabel}>Monthly Budget Range</label>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <input type="number" placeholder="Min (₹)" style={styles.input} value={requirements.min_budget} onChange={e => setRequirements({...requirements, min_budget: e.target.value})} />
                    <input type="number" placeholder="Max (₹)" style={styles.input} value={requirements.max_budget} onChange={e => setRequirements({...requirements, max_budget: e.target.value})} />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={styles.inputLabel}>Preferred City</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="Search city..." style={styles.input} value={requirements.preferred_city} onChange={handleCityChange} />
                    {citySuggestionsOpen && citySuggestions.length > 0 && (
                      <div style={styles.dropdown}>
                        {citySuggestions.map(city => <div key={city} style={styles.dropdownItem} onClick={() => selectCity(city)}>{city}</div>)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={styles.inputLabel}>Localities</label>
                  <div style={{ position: 'relative' }}>
                    <div style={styles.tagContainer}>
                      {selectedLocalities.map(loc => (
                        <span key={loc} style={styles.tag}>{loc} <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeLocality(loc)} /></span>
                      ))}
                      <input type="text" placeholder="Add area..." style={styles.tagInput} value={localityInput} onChange={handleLocalityChange} disabled={!requirements.preferred_city} />
                    </div>
                    {localitySuggestionsOpen && localitySuggestions.length > 0 && (
                      <div style={styles.dropdown}>
                        {localitySuggestions.map(loc => (
                          <div key={loc} style={styles.dropdownItem} onClick={() => selectLocality(loc)}>
                            {loc}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={styles.inputLabel}>Room Type</label>
                  <div style={styles.bentoOptions}>
                    {['Private', 'Shared'].map(opt => (
                      <button key={opt} onClick={() => setRequirements({...requirements, room_type_pref: opt})} 
                              style={{...styles.bentoPill, ...(requirements.room_type_pref === opt ? styles.bentoPillActive : {})}}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={styles.inputLabel}>Move-in Date</label>
                  <input type="date" style={styles.input} value={requirements.move_in_date} onChange={e => setRequirements({...requirements, move_in_date: e.target.value})} />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: LISTER PROPERTY */}
          {step === 2 && user?.user_type === 'Lister' && (
            <motion.div key="step2l" variants={pageVariants} initial="initial" animate="enter" exit="exit" style={styles.customCard}>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={styles.inputLabel}>Property Title</label>
                  <input type="text" placeholder="e.g. Cozy 2BHK in South Delhi" style={styles.input} value={property.title} onChange={e => setProperty({...property, title: e.target.value})} />
                </div>
                
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={styles.inputLabel}>Full Address</label>
                  <input type="text" placeholder="House No, Street Name" style={styles.input} value={property.address} onChange={e => setProperty({...property, address: e.target.value})} />
                </div>

                <div>
                  <label style={styles.inputLabel}>City</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="Search city" style={styles.input} value={property.city} onChange={handleListerCityChange} />
                    {citySuggestionsOpen && citySuggestions.length > 0 && (
                      <div style={styles.dropdown}>
                        {citySuggestions.map(city => <div key={city} style={styles.dropdownItem} onClick={() => selectListerCity(city)}>{city}</div>)}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label style={styles.inputLabel}>Locality</label>
                  <div style={{ position: 'relative' }}>
                    <input type="text" placeholder="Search area" style={styles.input} value={property.locality} onChange={handleListerLocalityChange} disabled={!property.city} />
                    {localitySuggestionsOpen && localitySuggestions.length > 0 && (
                      <div style={styles.dropdown}>
                        {localitySuggestions.map(loc => <div key={loc} style={styles.dropdownItem} onClick={() => selectListerLocality(loc)}>{loc}</div>)}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={styles.inputLabel}>Monthly Rent</label>
                  <input type="number" placeholder="₹ Amount" style={styles.input} value={property.rent_amount} onChange={e => setProperty({...property, rent_amount: e.target.value})} />
                </div>
                <div>
                  <label style={styles.inputLabel}>Room Type</label>
                  <div style={styles.bentoOptions}>
                    {['Private', 'Shared'].map(opt => (
                      <button key={opt} onClick={() => setProperty({...property, room_type: opt})} 
                              style={{...styles.bentoPill, ...(property.room_type === opt ? styles.bentoPillActive : {})}}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <motion.div key="step3" variants={pageVariants} initial="initial" animate="enter" exit="exit" style={styles.customCard}>
              <div style={styles.reviewContainer}>
                <h3 style={{ color: 'white', fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px' }}>Review & Finish</h3>
                <p style={{ color: '#64748b', marginBottom: '35px' }}>Double check everything before we save your profile.</p>
                
                <div style={styles.summaryGrid}>
                  <div style={styles.summaryItem}><span style={styles.summaryLabel}>Sleep</span><span style={styles.summaryValue}>{lifestyle.sleep_schedule}</span></div>
                  <div style={styles.summaryItem}><span style={styles.summaryLabel}>Cleanliness</span><span style={styles.summaryValue}>{lifestyle.cleanliness}</span></div>
                  <div style={styles.summaryItem}><span style={styles.summaryLabel}>Smoking</span><span style={styles.summaryValue}>{lifestyle.smoking}</span></div>
                  <div style={styles.summaryItem}><span style={styles.summaryLabel}>Food</span><span style={styles.summaryValue}>{lifestyle.food_habits}</span></div>
                  <div style={styles.summaryItem}><span style={styles.summaryLabel}>WFH Status</span><span style={styles.summaryValue}>{lifestyle.work_from_home}</span></div>
                  <div style={styles.summaryItem}><span style={styles.summaryLabel}>{user?.user_type === 'Seeker' ? 'Total People' : 'Roommates Needed'}</span><span style={styles.summaryValue}>{lifestyle.occupancy_count} {lifestyle.occupancy_count === 1 ? (user?.user_type === 'Seeker' ? 'Person' : 'Roommate') : (user?.user_type === 'Seeker' ? 'People' : 'Roommates')}</span></div>
                  
                  {user?.user_type === 'Seeker' ? (
                    <>
                      <div style={styles.summaryItem}><span style={styles.summaryLabel}>Preferred City</span><span style={styles.summaryValue}>{requirements.preferred_city}</span></div>
                      <div style={styles.summaryItem}><span style={styles.summaryLabel}>Budget</span><span style={styles.summaryValue}>₹{requirements.min_budget} - ₹{requirements.max_budget}</span></div>
                    </>
                  ) : (
                    <>
                      <div style={styles.summaryItem}><span style={styles.summaryLabel}>Property</span><span style={styles.summaryValue}>{property.title}</span></div>
                      <div style={styles.summaryItem}><span style={styles.summaryLabel}>Rent</span><span style={styles.summaryValue}>₹{property.rent_amount}</span></div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={styles.footer}>
          {step > 1 && (
            <button onClick={handleBack} style={styles.backBtn}>
              <ArrowLeft size={18} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < 3 ? (
            <button onClick={handleNext} style={styles.nextBtn}>
              Next Step <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} style={styles.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : 'Finish Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 20px 60px 20px',
    position: 'relative',
    overflowX: 'hidden'
  },
  content: {
    width: '100%',
    maxWidth: '850px',
    position: 'relative',
    zIndex: 10
  },
  header: { textAlign: 'center', marginBottom: '30px' },
  progressContainer: { display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '20px' },
  progressDot: { 
    width: '50px', 
    height: '6px', 
    borderRadius: '3px',
    transition: 'all 0.4s ease'
  },
  title: {
    fontFamily: 'Outfit, sans-serif',
    color: 'white', 
    fontSize: '2.4rem', 
    fontWeight: '900', 
    marginBottom: '8px',
    letterSpacing: '-1px'
  },
  subtitle: { color: '#94a3b8', fontSize: '1rem', fontWeight: '500' },
  
  // Bento Grid System
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 1fr)',
    gridAutoRows: 'auto',
    gap: '20px',
    width: '100%',
    marginBottom: '40px'
  },
  bentoBox: {
    background: 'rgba(30, 41, 59, 0.7)',
    borderRadius: '32px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    display: 'flex', 
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  },
  bentoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px'
  },
  bentoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8b5cf6'
  },
  bentoLabel: {
    color: 'white',
    fontSize: '1rem',
    fontWeight: '700'
  },
  bentoOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  bentoPill: {
    padding: '8px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    outline: 'none'
  },
  bentoPillActive: {
    background: '#8b5cf6',
    color: 'white',
    borderColor: '#8b5cf6',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
  },
  
  // Custom Card for other steps
  customCard: {
    background: 'rgba(30, 41, 59, 0.7)',
    borderRadius: '32px',
    padding: '50px 40px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    position: 'relative',
    width: '100%',
  },
  
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '16px 20px',
    color: 'white',
    fontSize: '1rem',
    width: '100%',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  footer: { 
    display: 'flex', 
    alignItems: 'center', 
    marginTop: '30px',
    padding: '0 10px'
  },
  nextBtn: { 
    background: '#8b5cf6',
    color: 'white', 
    border: 'none', 
    padding: '12px 28px', 
    borderRadius: '16px', 
    fontWeight: '800', 
    fontSize: '1rem',
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)',
    transition: 'all 0.3s ease'
  },
  backBtn: {
    color: '#64748b',
    background: 'none',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  submitBtn: { 
    background: '#10b981',
    color: 'white', 
    border: 'none', 
    padding: '12px 32px', 
    borderRadius: '16px', 
    fontWeight: '800',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.3s ease'
  },
  
  // Standard Step 2/3 labels
  inputLabel: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '8px',
    display: 'block'
  },
  
  tagContainer: {
    display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px', 
    backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: '16px', minHeight: '52px', alignItems: 'center',
  },
  tag: {
    backgroundColor: '#8b5cf6', color: 'white', padding: '6px 12px', 
    borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px'
  },
  tagInput: {
    background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '0.95rem', flex: 1, minWidth: '150px'
  },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, 
    backgroundColor: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.15)', 
    borderRadius: '14px', marginTop: '8px', zIndex: 100, maxHeight: '220px', overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(20px)'
  },
  dropdownItem: {
    padding: '14px 18px', color: 'white', cursor: 'pointer', transition: 'all 0.2s ease', borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },

  reviewContainer: { textAlign: 'left' },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '30px'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  summaryLabel: { color: '#64748b', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' },
  summaryValue: { color: 'white', fontSize: '1.1rem', fontWeight: '600' }
};

export default Onboarding;
