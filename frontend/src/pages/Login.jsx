import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Key } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(newPassword);
  
  const getStrengthDetails = (score) => {
    switch (score) {
      case 0: return { label: '', color: 'transparent', width: '0%' };
      case 1: return { label: 'Weak', color: '#ef4444', width: '25%' };
      case 2: return { label: 'Medium', color: '#f59e0b', width: '50%' };
      case 3: return { label: 'Good', color: '#3b82f6', width: '75%' };
      case 4: return { label: 'Strong', color: '#10b981', width: '100%' };
      default: return { label: '', color: 'transparent', width: '0%' };
    }
  };

  const strengthDetails = getStrengthDetails(strength);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      toast.error('Invalid email or password. Please try again.');
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      toast.success(data.msg || 'OTP sent successfully!');
      setForgotStep(2);
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to send OTP.');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
      toast.success(data.msg || 'Password reset successfully! Please login.');
      setIsForgotPassword(false);
      setForgotStep(1);
      setOtp('');
      setNewPassword('');
      setPassword('');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to reset password.');
    }
  };

  // Effect to handle navigation once user is set
  const { user } = useAuth();
  React.useEffect(() => {
    if (user) {
      if (user.role === 'Admin') {
        navigate('/admin-dashboard');
      } else if (!user.is_profile_complete) {
        navigate('/onboarding');
      } else {
        navigate('/profile');
      }
    }
  }, [user, navigate]);

  // Effect to show logout toast if signal exists
  React.useEffect(() => {
    const shouldShowLogout = localStorage.getItem('showLogout');
    if (shouldShowLogout === 'true') {
      toast.success('Logged out successfully');
      localStorage.removeItem('showLogout');
    }
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
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
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="auth-hero-title">Find your perfect match.</h1>
          <p className="auth-hero-subtitle">
            Welcome back to FindMyStay. Thousands of incredible apartments and potential roommates are waiting for you.
          </p>
        </motion.div>
      </div>

      {/* Right side: Login Form */}
      <div className="auth-right">
        {/* Animated glowing background blobs */}
        <div className="auth-bg-blob blob-1"></div>
        <div className="auth-bg-blob blob-2"></div>

        <motion.div
          style={{ width: '100%', maxWidth: '450px', position: 'relative', zIndex: 10, margin: 'auto 0' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {isForgotPassword ? (
            <div style={styles.customCard}>
              <h2 style={styles.loginTitle}>{forgotStep === 1 ? "RECOVERY" : "SECURE RESET"}</h2>
              <form onSubmit={forgotStep === 1 ? handleForgotPasswordSubmit : handleResetPasswordSubmit} style={{ position: 'relative', zIndex: 2 }}>
                {forgotStep === 1 ? (
                  <>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '25px', marginTop: '-20px' }}>
                      Enter your email to receive a verification code.
                    </p>
                    <div style={styles.inputWrapper}>
                      <label style={styles.inputLabel}>Email Address</label>
                      <input
                        type="email"
                        placeholder="e.g. name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={styles.customInput}
                      />
                    </div>
                    <button type="submit" style={styles.customSubmitBtn}>SEND CODE</button>
                    <div style={{ textAlign: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => setIsForgotPassword(false)}
                        style={styles.customFooterLinkBtn}
                      >
                        BACK TO LOGIN
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '25px', marginTop: '-20px' }}>
                      We sent a code to <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{email}</span>
                    </p>
                    
                    <div style={styles.inputWrapper}>
                      <label style={styles.inputLabel}>Verification Code</label>
                      <input
                        type="text"
                        placeholder="E.g. 123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        maxLength="6"
                        style={{ ...styles.customInput, letterSpacing: '4px', textAlign: 'center', fontWeight: '800' }}
                      />
                    </div>

                    <div style={styles.inputWrapper}>
                      <label style={styles.inputLabel}>New Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          style={styles.customInput}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={styles.customEyeBtn}
                        >
                          {showNewPassword ? <EyeOff size={14} color="#111827" /> : <Eye size={14} color="#111827" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Strength Meter */}
                    <div style={styles.strengthMeterContainer}>
                      <div style={styles.strengthMeterTrack}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: strengthDetails.width, backgroundColor: strengthDetails.color }}
                          transition={{ duration: 0.3 }}
                          style={styles.strengthMeterBar}
                        />
                      </div>
                      <div style={{...styles.strengthLabel, color: strengthDetails.color}}>
                        {strengthDetails.label}
                      </div>
                    </div>

                    <div style={styles.passwordRequirements}>
                      <span style={{ color: newPassword.length >= 8 ? '#10b981' : '#6b7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {newPassword.length >= 8 ? '✓' : '○'} Min 8 characters
                      </span>
                      <span style={{ color: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? '#10b981' : '#6b7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? '✓' : '○'} One symbol
                      </span>
                    </div>

                    <button type="submit" style={styles.customSubmitBtn}>RESET PASSWORD</button>
                    <div style={{ textAlign: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => { setIsForgotPassword(false); setForgotStep(1); }}
                        style={styles.customFooterLinkBtn}
                      >
                        CANCEL
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          ) : (
            <div style={styles.customCard}>
              <img 
                src="/images/login-character.png" 
                alt="3D Character" 
                style={styles.characterImg} 
              />
              <h2 style={styles.loginTitle}>LOGIN</h2>

              <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 2 }}>
                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.customInput}
                  />
                </div>

                <div style={styles.inputWrapper}>
                  <label style={styles.inputLabel}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={styles.customInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.customEyeBtn}
                    >
                      {showPassword ? <EyeOff size={14} color="#111827" /> : <Eye size={14} color="#111827" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  style={styles.customSubmitBtn}
                >
                  SUBMIT
                </button>

                <div style={styles.customFooter}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={styles.footerTextPrefix}>New here?</span>
                    <a href="/register" style={styles.customFooterLink}>Create an account</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={styles.footerTextPrefix}>Having trouble?</span>
                    <button 
                      type="button" 
                      onClick={() => setIsForgotPassword(true)}
                      style={styles.customFooterLinkBtn}
                    >
                      Reset password
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const styles = {
  passwordRequirements: {
    display: 'flex',
    gap: '15px',
    marginTop: '8px',
    paddingLeft: '4px'
  },
  strengthMeterContainer: {
    marginTop: '12px',
    marginBottom: '8px'
  },
  strengthMeterTrack: {
    height: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '2px',
    width: '100%',
    overflow: 'hidden',
    marginBottom: '4px'
  },
  strengthMeterBar: {
    height: '100%',
    borderRadius: '2px'
  },
  strengthLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  customCard: {
    background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '20px',
    padding: '45px 35px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    position: 'relative',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
  },
  characterImg: {
    position: 'absolute',
    top: '-45px',
    right: '-65px',
    width: '260px',
    height: 'auto',
    zIndex: 1,
    pointerEvents: 'none',
    WebkitMaskImage: 'radial-gradient(circle at 60% 40%, black 45%, transparent 75%)',
    maskImage: 'radial-gradient(circle at 60% 40%, black 45%, transparent 75%)',
  },
  loginTitle: {
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: '2.2rem',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '2px',
    marginBottom: '35px',
    position: 'relative',
    zIndex: 2,
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: '18px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '800',
    color: '#e2e8f0',
    marginBottom: '8px',
    marginLeft: '4px',
    textTransform: 'uppercase',
    letterSpacing: '1.2px'
  },
  customInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '10px',
    padding: '14px 16px',
    color: '#fff',
    fontSize: '0.85rem',
    letterSpacing: '1px',
    outline: 'none',
    boxShadow: 'inset 0 2px 5px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s ease',
  },
  customEyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.8)',
    border: 'none',
    cursor: 'pointer',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '4px',
  },
  customSubmitBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    color: '#ffffff',
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: '800',
    letterSpacing: '2px',
    padding: '15px',
    border: 'none',
    borderRadius: '10px',
    marginTop: '15px',
    marginBottom: '25px',
    cursor: 'pointer',
    boxShadow: '0 8px 15px -3px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
  },
  customFooter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  },
  footerTextPrefix: {
    color: '#9ca3af',
    fontSize: '0.85rem',
    marginRight: '6px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  customFooterLink: {
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '600',
    textDecoration: 'none',
    cursor: 'pointer',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    transition: 'color 0.2s ease',
  },
  customFooterLinkBtn: {
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '600',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    transition: 'color 0.2s ease',
  }
};

export default Login;
