import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, Calendar, Users, Briefcase, Eye, EyeOff, Home, Search, ArrowRight, ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';


const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    name: '', email: '', phone: '', password: '', age: '', gender: '', occupation: '', user_type: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  
  const { register, verifyOtp } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    let interval;
    if (step === 4 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const commonPasswords = [
    "password", "password123", "12345678", "123456789", 
    "qwertyuiop", "admin123", "welcome123", "roommate123"
  ];

  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
    return score;
  };

  const strength = calculateStrength(formData.password);
  
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

  const validatePassword = (pass) => {
    if (pass.length < 8) return "Password must be at least 8 characters long.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) return "Password must contain at least one special character.";
    if (commonPasswords.includes(pass.toLowerCase())) return "This password is too common. Please choose a stronger one.";
    return null;
  };

  const handleNext = () => {
    if (step === 2) {
      const error = validatePassword(formData.password);
      if (error) {
        toast.error(error);
        return;
      }
    }
    setStep(step + 1);
  };
  
  const handleBack = () => setStep(step - 1);

  const selectUserType = (type) => {
    setFormData({ ...formData, user_type: type });
    handleNext();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register(formData);
      toast.success('Verification code sent to your email!');
      setStep(4); // Move to OTP step
    } catch (error) {
      const msg = error.response?.data?.msg || 'Registration failed. Try a different email.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter the full 6-digit code');
      return;
    }
    setIsVerifying(true);
    try {
      await verifyOtp(formData.email, fullOtp);
      toast.success('Account created successfully!');
      setStep(5); // Success step
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      const msg = error.response?.data?.msg || 'Invalid verification code. Please try again.';
      setOtpError(msg);
      toast.error(msg);
      // Clear OTP on error to let them try again
      setOtp(['','','','','','']);
      document.getElementById('otp-0')?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    enter: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: "easeIn" } }
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
          <h1 className="auth-hero-title">Your new home<br/>awaits.</h1>
          <p className="auth-hero-subtitle">
            Join thousands of people finding their perfect living situation through AI-driven lifestyle matching.
          </p>
          
          <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
            <div style={styles.heroStat}>
              <div style={styles.statValue}>10k+</div>
              <div style={styles.statLabel}>Active Users</div>
            </div>
            <div style={styles.heroStat}>
              <div style={styles.statValue}>95%</div>
              <div style={styles.statLabel}>Match Rate</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side: Registration Form */}
      <div className="auth-right">
        <div className="auth-bg-blob blob-1"></div>
        <div className="auth-bg-blob blob-2"></div>

        <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 10 }}>
          <AnimatePresence mode="wait">
            {/* STEP 1: ROLE SELECTION */}
            {step === 1 && (
              <motion.div 
                key="step1" 
                variants={pageVariants} 
                initial="initial" 
                animate="enter" 
                exit="exit"
                style={{ width: '100%', maxWidth: '640px' }}
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ textAlign: 'center', marginBottom: '48px' }}
                >
                  <h2 style={styles.glassStepTitle}>How can we help you?</h2>
                  <p style={styles.glassStepSubtitle}>Join our community and find your perfect living match.</p>
                </motion.div>
                
                <div style={styles.glassRoleGrid}>
                  <motion.div 
                    style={styles.glassRoleCard} 
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectUserType('Seeker')}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div style={styles.glassCardDecoration} />
                    <motion.div 
                      style={{...styles.glassIconContainer, background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)'}}
                      variants={{ hover: { y: -5, boxShadow: '0 15px 30px rgba(139, 92, 246, 0.4)' } }}
                    >
                      <Search size={28} color="white" />
                    </motion.div>
                    
                    <h3 style={styles.glassRoleTitle}>I'm looking for a room</h3>
                    <p style={styles.glassRoleText}>Browse verified listings and connect with compatible roommates using our AI matching.</p>
                    
                    <div style={styles.glassRoleFooter}>
                      <span style={{ color: '#8b5cf6', fontWeight: '700' }}>Get Started</span>
                      <motion.div variants={{ hover: { x: 5 } }}>
                        <ArrowRight size={18} color="#8b5cf6" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div 
                    style={styles.glassRoleCard} 
                    whileHover="hover"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectUserType('Lister')}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div style={{...styles.glassCardDecoration, background: 'rgba(59, 130, 246, 0.1)'}} />
                    <motion.div 
                      style={{...styles.glassIconContainer, background: 'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)'}}
                      variants={{ hover: { y: -5, boxShadow: '0 15px 30px rgba(59, 130, 246, 0.4)' } }}
                    >
                      <Home size={28} color="white" />
                    </motion.div>
                    
                    <h3 style={styles.glassRoleTitle}>I have a room to list</h3>
                    <p style={styles.glassRoleText}>List your space in minutes and find the ideal roommate who fits your lifestyle perfectly.</p>
                    
                    <div style={styles.glassRoleFooter}>
                      <span style={{ color: '#3b82f6', fontWeight: '700' }}>Post Listing</span>
                      <motion.div variants={{ hover: { x: 5 } }}>
                        <ArrowRight size={18} color="#3b82f6" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  style={{ textAlign: 'center', marginTop: '48px' }}
                >
                  <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                    Already a member? <a href="/login" style={{ fontWeight: '800', color: 'white', borderBottom: '2px solid #8b5cf6', paddingBottom: '2px' }}>Sign In</a>
                  </p>
                </motion.div>
              </motion.div>
            )}

            {/* STEP 2: CREDENTIALS */}
            {step === 2 && (
              <motion.div key="step2" variants={pageVariants} initial="initial" animate="enter" exit="exit">
                <button onClick={handleBack} style={styles.backBtn}><ArrowLeft size={18} /> Back</button>
                <div style={styles.customCard}>
                  <img 
                    src="/images/register-character.png" 
                    alt="3D Character" 
                    style={styles.characterImg} 
                  />
                  <h2 style={styles.loginTitle}>ACCOUNT DETAILS</h2>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '25px', textAlign: 'center', marginTop: '-10px' }}>
                    Let's start with your basic credentials.
                  </p>
                  
                  <form style={{ position: 'relative', zIndex: 2 }}>
                    <div style={styles.inputWrapper}>
                      <label style={styles.inputLabel}>Full Name</label>
                      <input 
                        type="text" style={styles.customInput} placeholder="E.g. John Doe"
                        value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>

                    <div style={styles.inputWrapper}>
                      <label style={styles.inputLabel}>Email Address</label>
                      <input 
                        type="email" style={styles.customInput} placeholder="name@example.com"
                        value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div style={styles.inputWrapper}>
                      <label style={styles.inputLabel}>Phone Number</label>
                      <input 
                        type="tel" style={styles.customInput} placeholder="+91 98765 43210"
                        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>

                    <div style={styles.inputWrapper}>
                      <label style={styles.inputLabel}>Password</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showPassword ? "text" : "password"} style={styles.customInput} placeholder="Create a strong password"
                          value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.customEyeBtn}>
                          {showPassword ? <EyeOff size={14} color="#111827" /> : <Eye size={14} color="#111827" />}
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
                      <span style={{ color: formData.password.length >= 8 ? '#10b981' : '#6b7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {formData.password.length >= 8 ? '✓' : '○'} Min 8 characters
                      </span>
                      <span style={{ color: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '#10b981' : '#6b7280', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? '✓' : '○'} One symbol
                      </span>
                    </div>

                    <button type="button" style={styles.customSubmitBtn} onClick={handleNext}>
                      CONTINUE
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={pageVariants} initial="initial" animate="enter" exit="exit">
                <button onClick={handleBack} style={styles.backBtn}><ArrowLeft size={18} /> Back</button>
                <div style={styles.customCard}>
                  <img 
                    src="/images/register-character.png" 
                    alt="3D Character" 
                    style={styles.characterImg} 
                  />
                  <h2 style={styles.loginTitle}>PERSONAL PROFILE</h2>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '25px', textAlign: 'center', marginTop: '-10px' }}>
                    Almost there! Tell us a bit about yourself.
                  </p>
                  
                  <form style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div style={styles.inputWrapper}>
                        <label style={styles.inputLabel}>Age</label>
                        <input 
                          type="number" style={styles.customInput} placeholder="Age (e.g. 24)"
                          value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                        />
                      </div>

                      <div style={styles.inputWrapper}>
                        <label style={styles.inputLabel}>Gender</label>
                        <select 
                          style={{...styles.customInput, appearance: 'none'}}
                          value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        >
                          <option value="" style={{color: '#111827'}}>GENDER</option>
                          <option value="Male" style={{color: '#111827'}}>Male</option>
                          <option value="Female" style={{color: '#111827'}}>Female</option>
                          <option value="Other" style={{color: '#111827'}}>Other</option>
                        </select>
                      </div>
                    </div>

                    <div style={styles.inputWrapper}>
                      <label style={styles.inputLabel}>Occupation</label>
                      <select 
                        style={{...styles.customInput, appearance: 'none'}}
                        value={formData.occupation} onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                      >
                        <option value="" style={{color: '#111827'}}>OCCUPATION</option>
                        <option value="Student" style={{color: '#111827'}}>Student</option>
                        <option value="Professional" style={{color: '#111827'}}>Working Professional</option>
                        <option value="Freelancer" style={{color: '#111827'}}>Freelancer</option>
                        <option value="Other" style={{color: '#111827'}}>Other</option>
                      </select>
                    </div>

                    <button 
                      type="button"
                      style={styles.customSubmitBtn} 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'CREATING...' : 'COMPLETE REGISTRATION'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* STEP 4: OTP VERIFICATION */}
            {step === 4 && (
              <motion.div key="step4" variants={pageVariants} initial="initial" animate="enter" exit="exit">
                <button onClick={() => setStep(3)} style={styles.backBtn}><ArrowLeft size={18} /> Back</button>
                <div style={styles.premiumOtpCard}>
                  <div style={styles.securityHeader}>
                    <div style={styles.shieldIconBox}>
                      <Shield size={32} color="#8b5cf6" />
                    </div>
                    <h2 style={styles.otpTitle}>Security Verification</h2>
                    <p style={styles.otpInstruction}>
                      To protect your account, we've sent a 6-digit code to:
                      <br/>
                      <span style={styles.emailHighlight}>{formData.email}</span>
                    </p>
                  </div>
                  
                  <div style={styles.otpGrid}>
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleOtpKeyDown(e, index)}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#8b5cf6';
                          e.target.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.3)';
                          e.target.style.transform = 'translateY(-4px)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = otpError ? '#ef4444' : 'rgba(255, 255, 255, 0.1)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.transform = 'translateY(0)';
                        }}
                        style={{
                          ...styles.otpInput,
                          borderColor: otpError ? '#ef4444' : 'rgba(255, 255, 255, 0.1)',
                          color: otpError ? '#ef4444' : '#1e293b'
                        }}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <motion.p 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      style={styles.otpErrorText}
                    >
                      <Lock size={14} style={{ marginRight: '6px' }} /> {otpError}
                    </motion.p>
                  )}

                  <button 
                    className="btn btn-primary" 
                    style={styles.verifyBtn} 
                    onClick={handleVerifyOtp}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="spinner-small" style={styles.spinner}></div> Verifying...
                      </div>
                    ) : 'Verify & Continue'}
                  </button>

                  <div style={styles.resendSection}>
                    {canResend ? (
                      <div style={styles.resendContent}>
                        <span style={{ color: '#9ca3af' }}>Didn't receive the code?</span>
                        <button 
                          onClick={(e) => {
                            setOtp(['','','','','','']);
                            setTimer(60);
                            setCanResend(false);
                            handleSubmit(e);
                          }} 
                          style={styles.resendLink}
                        >
                          Resend Code
                        </button>
                      </div>
                    ) : (
                      <div style={styles.timerContent}>
                        <span style={{ color: '#6b7280' }}>You can resend the code in</span>
                        <span style={styles.timerBadge}>{timer}s</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: SUCCESS */}
            {step === 5 && (
              <motion.div 
                key="step5" 
                variants={pageVariants} initial="initial" animate="enter" 
                style={styles.successContainer}
              >
                <div style={styles.successIcon}><CheckCircle size={64} /></div>
                <h2 style={styles.successTitle}>Welcome aboard, {formData.name}!</h2>
                <p style={styles.successText}>Your account has been verified and created successfully. Redirecting you to login...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const styles = {
  glassStepTitle: { 
    fontSize: '2.8rem', 
    fontWeight: '900', 
    marginBottom: '16px', 
    color: 'white',
    letterSpacing: '-1.5px'
  },
  glassStepSubtitle: { 
    fontSize: '1.2rem', 
    color: '#94a3b8', 
    lineHeight: '1.6',
    maxWidth: '450px',
    margin: '0 auto'
  },
  glassRoleGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '30px',
    marginTop: '20px'
  },
  glassRoleCard: {
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '32px',
    padding: '40px 30px',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    overflow: 'hidden'
  },
  glassCardDecoration: {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: 'rgba(139, 92, 246, 0.05)',
    filter: 'blur(30px)',
    zIndex: 0
  },
  glassIconContainer: { 
    width: '72px', 
    height: '72px', 
    borderRadius: '24px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: '28px',
    position: 'relative',
    zIndex: 1
  },
  glassRoleTitle: { 
    fontSize: '1.35rem', 
    fontWeight: '800', 
    marginBottom: '14px', 
    color: 'white',
    zIndex: 1
  },
  glassRoleText: { 
    fontSize: '0.95rem', 
    color: '#94a3b8', 
    marginBottom: '32px', 
    lineHeight: '1.6',
    zIndex: 1
  },
  glassRoleFooter: {
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '1rem',
    zIndex: 1
  },
  backBtn: { background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.95rem' },
  cardDesc: { color: '#9ca3af', marginBottom: '25px', fontSize: '0.9rem', textAlign: 'center' },
  nextBtn: { width: '100%', marginTop: '20px', padding: '14px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  eyeBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' },
  errorAlert: { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' },
  heroStat: { display: 'flex', flexDirection: 'column', gap: '4px' },
  statValue: { fontSize: '1.5rem', fontWeight: '800', color: 'white' },
  statLabel: { fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' },
  successContainer: { textAlign: 'center', padding: '40px 20px' },
  successIcon: { color: '#10b981', marginBottom: '24px', display: 'flex', justifyContent: 'center' },
  successTitle: { fontSize: '1.8rem', fontWeight: '800', marginBottom: '16px', color: 'white' },
  successText: { fontSize: '1.05rem', color: '#9ca3af', lineHeight: '1.6' },
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
    fontWeight: '600',
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  otpGrid: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    margin: '30px 0'
  },
  otpInput: {
    width: '50px',
    height: '64px',
    fontSize: '1.8rem',
    fontWeight: '800',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    color: '#1e293b',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  otpErrorText: {
    color: '#ef4444',
    fontSize: '0.9rem',
    textAlign: 'center',
    marginTop: '-5px',
    marginBottom: '20px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
    maxWidth: '440px',
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
    marginBottom: '20px',
    position: 'relative',
    zIndex: 2,
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
    textAlign: 'center'
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
    cursor: 'pointer',
    boxShadow: '0 8px 15px -3px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
    transition: 'all 0.3s ease',
  },
  premiumOtpCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  securityHeader: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  shieldIconBox: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto'
  },
  otpTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'white',
    margin: '0 0 10px 0'
  },
  otpInstruction: {
    fontSize: '1rem',
    color: '#94a3b8',
    lineHeight: '1.5',
    margin: 0
  },
  emailHighlight: {
    color: '#8b5cf6',
    fontWeight: '700',
    fontSize: '1.1rem'
  },
  verifyBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)'
  },
  resendSection: {
    marginTop: '30px',
    width: '100%'
  },
  resendContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  resendLink: {
    background: 'none',
    border: 'none',
    color: '#8b5cf6',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  timerContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  timerBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8b5cf6',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: '800',
    fontSize: '0.9rem'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

export default Register;
