import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, MapPin, DollarSign, Tag, Calendar, 
  Image as ImageIcon, Plus, X, AlignLeft, Info, 
  Upload, CheckCircle2, Trash2, Camera
} from 'lucide-react';
import { createProperty } from '../services/propertyService';
import { locationData } from '../utils/locationData';
import toast from 'react-hot-toast';

const PREDEFINED_AMENITIES = [
  "WiFi", "Air Conditioning", "Geyser", "RO Water",
  "Bed", "Wardrobe", "Table & Chair", "Attached Bath",
  "Kitchen Access", "Fridge", "Microwave", "Induction",
  "Washing Machine", "Housekeeping", "Gas Connection",
  "Balcony", "TV", "Sofa", "Parking", "Gym", "Lift",
  "Power Backup", "Security/CCTV", "Maid Service"
];

const TITLE_SUGGESTIONS = [
  "1 RK",
  "1 BHK",
  "2 BHK",
  "3 BHK",
  "4 BHK",
  "Tenement",
  "Bungalow",
  "Row House"
];

const PostProperty = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
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
    images: [] // Array of base64 strings
  });

  const cities = Object.keys(locationData);
  const localities = formData.city ? locationData[formData.city] : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'city') {
      setFormData(prev => ({ ...prev, locality: [] }));
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
    
    setLoading(true);

    try {
      const payload = {
        ...formData,
        amenities: formData.amenities.join(','),
        locality: Array.isArray(formData.locality) ? formData.locality.join(',') : formData.locality,
        images: formData.images.join('|SPLIT|'), // Using unique separator for base64
        rent_amount: parseInt(formData.rent_amount)
      };

      await createProperty(payload);
      toast.success('Property listed successfully!');
      navigate('/properties');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to list property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.formWrapper}
      >
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.logoCircle}>
              <Building size={24} color="white" />
            </div>
            <h2 style={styles.sidebarTitle}>Property Hub</h2>
          </div>
          
          <div style={styles.steps}>
            <StepItem icon={<Info size={18} />} text="Basic Information" active />
            <StepItem icon={<MapPin size={18} />} text="Location Details" active />
            <StepItem icon={<DollarSign size={18} />} text="Pricing & Type" active />
            <StepItem icon={<Tag size={18} />} text="Amenities" active />
            <StepItem icon={<Camera size={18} />} text="Media & Photos" active />
          </div>

          <div style={styles.sidebarFooter}>
            <p style={styles.footerText}>Need help listing? <a href="#" style={{ color: 'white' }}>Contact Support</a></p>
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.title}>List Your Property</h1>
            <p style={styles.subtitle}>Fill in the details to find your perfect roommate</p>
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
                    <option value="">Select City</option>
                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
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
                    <option value="">Select Locality</option>
                    {localities.map(loc => (
                      <option key={loc} value={loc}>
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
                    <option value="Private">Private Room</option>
                    <option value="Shared">Shared Room</option>
                    <option value="Entire Place">Entire Flat</option>
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
                    <option value={1}>1 Roommate</option>
                    <option value={2}>2 Roommates</option>
                    <option value={3}>3+ Roommates</option>
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
                        borderColor: isSelected ? 'var(--primary)' : '#e5e7eb',
                        backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.05)' : 'white',
                        color: isSelected ? 'var(--primary)' : '#4b5563',
                      }}
                    >
                      {isSelected ? <CheckCircle2 size={16} /> : <div style={styles.emptyCircle} />}
                      <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? '600' : '500' }}>{amenity}</span>
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
                <p style={styles.dropzoneText}>Click to upload property photos (Max 10)</p>
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
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Publish Listing'}
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
    background: 'var(--bg-gradient)',
  },
  formWrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '1100px',
    backgroundColor: 'white',
    borderRadius: '30px',
    overflow: 'hidden',
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
  },
  header: {
    marginBottom: '40px',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '10px',
    letterSpacing: '-1px',
  },
  subtitle: {
    color: '#6b7280',
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
    color: '#374151',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    paddingLeft: '16px', // Overriding the default icon padding
    borderRadius: '12px',
    border: '2px solid #f3f4f6',
    backgroundColor: '#f9fafb',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none',
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
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyCircle: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '2px solid #e5e7eb',
  },
  dropzone: {
    width: '100%',
    padding: '40px',
    border: '2px dashed #e5e7eb',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#f9fafb',
  },
  dropzoneText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4b5563',
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
    border: '2px solid #f3f4f6',
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

export default PostProperty;
