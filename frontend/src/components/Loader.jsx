import React from 'react';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

const Loader = ({ fullScreen = true }) => {
  const overlayStyle = {
    ...styles.overlay,
    ...(fullScreen ? styles.fullScreenOverlay : styles.inlineOverlay)
  };

  return (
    <div style={overlayStyle}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.glassCard}
      >
        <div style={styles.loaderWrapper}>
          {/* Spinning Gradient Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            style={styles.ring}
          />
          
          {/* Pulsing Home Icon */}
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={styles.iconContainer}
          >
            <Home size={32} color="white" />
          </motion.div>
        </div>
        
        <motion.p 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={styles.text}
        >
          Finding your stay...
        </motion.p>
      </motion.div>
    </div>
  );
};

const styles = {
  overlay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullScreenOverlay: {
    height: '100vh',
    width: '100vw',
    position: 'fixed',
    top: 0,
    left: 0,
    background: 'var(--bg-gradient)',
    zIndex: 9999,
  },
  inlineOverlay: {
    minHeight: '200px',
    padding: '40px',
    background: 'transparent',
  },
  glassCard: {
    padding: '40px 60px',
    borderRadius: '30px',
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
  },
  loaderWrapper: {
    position: 'relative',
    width: '80px',
    height: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '3px solid transparent',
    borderTop: '3px solid #8b5cf6',
    borderRight: '3px solid #d946ef',
    boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  text: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    margin: 0,
  }
};

export default Loader;
