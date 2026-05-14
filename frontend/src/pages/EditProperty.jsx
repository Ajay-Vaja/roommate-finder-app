import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, MapPin, DollarSign, Tag, Calendar, 
  Image as ImageIcon, Plus, X, AlignLeft, Info, 
  Upload, CheckCircle2, Trash2, Camera, ArrowLeft
} from 'lucide-react';
import { getProperty, updateProperty } from '../services/propertyService';
import { locationData } from '../utils/locationData';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const PREDEFINED_AMENITIES = [
  "WiFi", "Air Conditioning", "Geyser", "RO Water",
  "Bed", "Wardrobe", "Table & Chair", "Attached Bath",
  "Kitchen Access", "Fridge", "Microwave", "Induction",
  "Washing Machine", "Housekeeping", "Gas Connection",
  "Balcony", "TV", "Sofa", "Parking", "Gym", "Lift",
  "Power Backup", "Security/CCTV", "Maid Service"
];

const TITLE_SUGGESTIONS = [
  "1 RK", "1 BHK", "2 BHK", "3 BHK", "4 BHK",
  "Tenement", "Bungalow", "Row House"
];

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    locality: '',
    rent_amount: '',
    room_type: 'Private',
    amenities: [],
    available_from: '',
    occupancy_count: 1,
    images: [] 
  });

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await getProperty(id);
        const data = response.data;
        
        // Handle comma-separated locality and amenities if needed
        setFormData({
          title: data.title || '',
          description: data.description || '',
          address: data.address || '',
          city: data.city || '',
          locality: data.locality || '',
          rent_amount: data.rent_amount || '',
          room_type: data.room_type || 'Private',
          amenities: Array.isArray(data.amenities) ? data.amenities : (data.amenities ? data.amenities.split(',') : []),
          available_from: data.available_from ? data.available_from.split('T')[0] : '',
          occupancy_count: data.occupancy_count || 1,
          images: data.images || []
        });
        setImagePreviews(data.images || []);
      } catch (error) {
        toast.error('Failed to load property details');
        navigate('/manage-properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const cities = Object.keys(locationData);
  const localities = formData.city ? locationData[formData.city] : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'city') {
      setFormData(prev => ({ ...prev, locality: '' }));
    }
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...prev.amenities, amenity] };
      }
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({ ...prev, images: [...prev.images, base64String] }));
        setImagePreviews(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    
    setSaving(true);

    try {
      const payload = {
        ...formData,
        amenities: Array.isArray(formData.amenities) ? formData.amenities.join(',') : formData.amenities,
        images: formData.images.join('|SPLIT|'), 
        rent_amount: parseInt(formData.rent_amount)
      };

      await updateProperty(id, payload);
      toast.success('Property updated successfully!');
      navigate('/manage-properties');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to update property');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.formWrapper}
      >
        <div style={styles.sidebar}>
          <button onClick={() => navigate('/manage-properties')} style={styles.backBtn}>
            <ArrowLeft size={18} />
            <span>Back to Manage</span>
          </button>
          
          <div style={styles.sidebarHeader}>
            <div style={styles.logoCircle}>
              <Building size={24} color="white" />
            </div>
            <h2 style={styles.sidebarTitle}>Update Listing</h2>
          </div>
          
          <div style={styles.steps}>
            <StepItem icon={<Info size={18} />} text="Basic Information" active />
            <StepItem icon={<MapPin size={18} />} text="Location Details" active />
            <StepItem icon={<DollarSign size={18} />} text="Pricing & Type" active />
            <StepItem icon={<Tag size={18} />} text="Amenities" active />
            <StepItem icon={<Camera size={18} />} text="Media & Photos" active />
          </div>

          <div style={styles.sidebarFooter}>
            <p style={styles.footerText}>Need help? <a href="#" style={{ color: 'white' }}>Contact Support</a></p>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.title}>Edit Property</h1>
            <p style={styles.subtitle}>Update your property details to keep it attractive</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>General Details</h3>
              <div className="form-group">
                <label style={styles.label}>Headline / Property Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  style={styles.input}
                  placeholder="e.g. Sunny Room with Balcony"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                <div style={styles.suggestionCloud}>
                  {TITLE_SUGGESTIONS.map((suggestion) => (
                    <span 
                      key={suggestion} 
                      style={{
                        ...styles.suggestionTag,
                        backgroundColor: formData.title === suggestion ? 'rgba(139, 92, 246, 0.1)' : '#f3f4f6',
                        color: formData.title === suggestion ? 'var(--primary)' : '#6b7280',
                        borderColor: formData.title === suggestion ? 'var(--primary)' : 'transparent'
                      }}
                      onClick={() => setFormData(prev => ({ ...prev, title: suggestion }))}
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  style={{ ...styles.input, minHeight: '80px', resize: 'none', paddingTop: '10px' }}
                  placeholder="Tell potential roommates about the space and vibes..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Location & Area</h3>
              <div style={styles.row}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={styles.label}>City</label>
                  <select
                    name="city"
                    className="form-control"
                    style={styles.input}
                    value={formData.city}
                    onChange={handleChange}
                    required
                  >
                    <option value="" style={{ background: '#1e1b4b', color: '#fff' }}>Select City</option>
                    {cities.map(city => (
                      <option key={city} value={city} style={{ background: '#1e1b4b', color: '#fff' }}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={styles.label}>Locality</label>
                  <select
                    name="locality"
                    className="form-control"
                    style={styles.input}
                    value={formData.locality}
                    onChange={handleChange}
                    disabled={!formData.city}
                    required
                  >
                    <option value="" style={{ background: '#1e1b4b', color: '#fff' }}>Select Locality</option>
                    {localities.map(loc => (
                      <option key={loc} value={loc} style={{ background: '#1e1b4b', color: '#fff' }}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label style={styles.label}>Full Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  style={styles.input}
                  placeholder="Building name, Street No, Landmark"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Pricing & Availability</h3>
              <div style={styles.row}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={styles.label}>Rent per month (₹)</label>
                  <input
                    type="number"
                    name="rent_amount"
                    className="form-control"
                    style={styles.input}
                    placeholder="0"
                    value={formData.rent_amount}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={styles.label}>Type</label>
                  <select
                    name="room_type"
                    className="form-control"
                    style={styles.input}
                    value={formData.room_type}
                    onChange={handleChange}
                  >
                    <option value="Private" style={{ background: '#1e1b4b', color: '#fff' }}>Private Room</option>
                    <option value="Shared" style={{ background: '#1e1b4b', color: '#fff' }}>Shared Room</option>
                    <option value="Entire Place" style={{ background: '#1e1b4b', color: '#fff' }}>Entire Flat</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={styles.label}>Roommates Needed</label>
                  <select
                    name="occupancy_count"
                    className="form-control"
                    style={styles.input}
                    value={formData.occupancy_count}
                    onChange={handleChange}
                  >
                    <option value={1} style={{ background: '#1e1b4b', color: '#fff' }}>1 Roommate</option>
                    <option value={2} style={{ background: '#1e1b4b', color: '#fff' }}>2 Roommates</option>
                    <option value={3} style={{ background: '#1e1b4b', color: '#fff' }}>3+ Roommates</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label style={styles.label}>Available From</label>
                <input
                  type="date"
                  name="available_from"
                  className="form-control"
                  style={styles.input}
                  value={formData.available_from}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Amenities</h3>
              <div style={styles.amenityGrid}>
                {PREDEFINED_AMENITIES.map(amenity => {
                  const isSelected = formData.amenities.includes(amenity);
                  return (
                    <motion.div
                      key={amenity}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleAmenity(amenity)}
                      style={{
                        ...styles.amenityItem,
                        borderColor: isSelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                        backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? 'white' : '#94a3b8',
                      }}
                    >
                      {isSelected ? <CheckCircle2 size={16} color="var(--primary)" /> : <div style={styles.emptyCircle} />}
                      <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? '700' : '500' }}>{amenity}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={styles.sectionHeading}>Photos</h3>
              <div 
                style={styles.dropzone}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} color="#9ca3af" />
                <p style={styles.dropzoneText}>Click to add more photos (Max 10)</p>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Only images (JPG, PNG) are allowed</span>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  style={{ display: 'none' }} 
                />
              </div>

              <div style={styles.imageGrid}>
                <AnimatePresence>
                  {imagePreviews.map((src, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      style={styles.imagePreviewWrapper}
                    >
                      <img src={src} alt={`Preview ${index}`} style={styles.imagePreview} />
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeImage(index); }} 
                        style={styles.removeImageBtn}
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={styles.submitBtn}
              disabled={saving}
            >
              {saving ? 'Updating...' : 'Update Listing'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const StepItem = ({ icon, text, active }) => (
  <div style={{ ...styles.stepItem, opacity: active ? 1 : 0.6 }}>
    <div style={{ ...styles.stepIcon, backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
      {icon}
    </div>
    <span style={styles.stepText}>{text}</span>
  </div>
);

const styles = {
  container: {
    padding: '120px 20px 60px',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'transparent',
  },
  formWrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '1100px',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(20px)',
    borderRadius: '30px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
  },
  sidebar: {
    width: '300px',
    background: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    color: 'white',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    marginBottom: '40px',
    width: 'fit-content',
    transition: 'all 0.2s ease',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '60px',
  },
  logoCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    flex: 1,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'all 0.3s ease',
  },
  stepIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  stepText: {
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  sidebarFooter: {
    marginTop: 'auto',
  },
  footerText: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.5)',
  },
  content: {
    flex: 1,
    padding: '50px 60px',
    overflowY: 'auto',
    maxHeight: '85vh',
    background: 'transparent',
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: 'white',
    marginBottom: '10px',
    letterSpacing: '-1px',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  sectionHeading: {
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: 'var(--primary)',
    fontWeight: '800',
    marginBottom: '10px',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '2px solid rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    color: 'white',
  },
  row: {
    display: 'flex',
    gap: '20px',
  },
  suggestionCloud: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px',
  },
  suggestionTag: {
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
  },
  amenityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
  },
  amenityItem: {
    padding: '12px 15px',
    borderRadius: '12px',
    border: '2px solid transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  emptyCircle: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  dropzone: {
    width: '100%',
    padding: '40px',
    border: '2px dashed rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  dropzoneText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#e2e8f0',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '15px',
    marginTop: '15px',
  },
  imagePreviewWrapper: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeImageBtn: {
    position: 'absolute',
    top: '5px',
    right: '5px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  submitBtn: {
    width: '100%',
    padding: '18px',
    fontSize: '1.1rem',
    fontWeight: '700',
    marginTop: '20px',
    borderRadius: '15px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  '@media (max-width: 900px)': {
    sidebar: { display: 'none' },
    formWrapper: { borderRadius: '20px' },
    content: { padding: '30px' }
  }
};

export default EditProperty;
