import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Calendar, Users, Briefcase, DollarSign, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', age: '', gender: '', occupation: '', budget: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); 
    try {
      await register(formData);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      setErrorMsg(error.response?.data?.msg || 'Registration failed. Try a different email.');
    }
  };

  // Animation variants for smooth loading
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="auth-container">
      {/* Left side: Beautiful Hero Image */}
      <div className="auth-left">
        <motion.div 
          className="auth-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="auth-hero-title">Start your journey.</h1>
          <p className="auth-hero-subtitle">
            Create a profile in under 2 minutes. Our AI-driven matching algorithm will connect you with roommates who perfectly match your lifestyle.
          </p>
        </motion.div>
      </div>

      {/* Right side: Registration Form */}
      <div className="auth-right">
        {/* Animated glowing background blobs */}
        <div className="auth-bg-blob blob-1"></div>
        <div className="auth-bg-blob blob-2"></div>

        <motion.div 
          style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 10, margin: '0 0 40px 0' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card title="Create Profile">
            <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
              All fields are required to give you the best matches.
            </motion.p>

            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}
              >
                {errorMsg}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <motion.div className="form-group" variants={itemVariants}>
                  <label>Full Name</label>
                  <div className="input-with-icon">
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. John Doe"
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                    <User className="input-icon" size={18} />
                  </div>
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="name@example.com"
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      required 
                    />
                    <Mail className="input-icon" size={18} />
                  </div>
                </motion.div>
              </div>

              <motion.div className="form-group" variants={itemVariants}>
                <label>Password</label>
                <div className="input-with-icon">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control" 
                    placeholder="Create a strong password"
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    required 
                    style={{ paddingRight: '40px' }}
                  />
                  <Lock className="input-icon" size={18} />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <motion.div className="form-group" variants={itemVariants}>
                  <label>Age</label>
                  <div className="input-with-icon">
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="e.g. 24"
                      min="18" max="99"
                      value={formData.age} 
                      onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || ''})} 
                      required 
                    />
                    <Calendar className="input-icon" size={18} />
                  </div>
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
                  <label>Gender</label>
                  <div className="input-with-icon">
                    <select 
                      className="form-control"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <Users className="input-icon" size={18} />
                  </div>
                </motion.div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <motion.div className="form-group" variants={itemVariants}>
                  <label>Occupation</label>
                  <div className="input-with-icon">
                    <select 
                      className="form-control"
                      value={formData.occupation}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select...</option>
                      <option value="Student">Student</option>
                      <option value="Professional">Professional</option>
                      <option value="Looking for work">Looking for work</option>
                    </select>
                    <Briefcase className="input-icon" size={18} />
                  </div>
                </motion.div>

                <motion.div className="form-group" variants={itemVariants}>
                  <label>Max Budget ($)</label>
                  <div className="input-with-icon">
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="e.g. 1000"
                      min="0"
                      value={formData.budget} 
                      onChange={(e) => setFormData({...formData, budget: parseInt(e.target.value) || ''})} 
                      required 
                    />
                    <DollarSign className="input-icon" size={18} />
                  </div>
                </motion.div>
              </div>

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '10px', padding: '14px', fontSize: '1.05rem' }}
              >
                Create Account
              </motion.button>
              
              <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.9rem' }}>
                Already have an account? <a href="/login" style={{ fontWeight: '600' }}>Log in here</a>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
