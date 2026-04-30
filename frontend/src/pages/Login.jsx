import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setErrorMsg('Invalid email or password. Please try again.');
    }
  };

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
            Welcome back to Roommate Finder. Thousands of incredible apartments and potential roommates are waiting for you.
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
          <Card title="Welcome Back">
            <motion.p variants={itemVariants} style={{ color: 'var(--text-muted)', marginBottom: '25px', fontSize: '0.95rem', textAlign: 'center' }}>
              Please enter your details to sign in.
            </motion.p>

            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center', fontWeight: '500' }}
              >
                {errorMsg}
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <motion.div className="form-group" variants={itemVariants}>
                <label>Email Address</label>
                <div className="input-with-icon">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="name@example.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                  <Mail className="input-icon" size={18} />
                </div>
              </motion.div>
              
              <motion.div className="form-group" variants={itemVariants}>
                <label>Password</label>
                <div className="input-with-icon">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control" 
                    placeholder="Enter your password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    style={{ paddingRight: '45px' }}
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

              <motion.button 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '15px', padding: '14px', fontSize: '1.1rem' }}
              >
                Sign In
              </motion.button>

              <motion.div variants={itemVariants} style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.95rem' }}>
                Don't have an account? <a href="/register" style={{ fontWeight: '600' }}>Create one now</a>
              </motion.div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
