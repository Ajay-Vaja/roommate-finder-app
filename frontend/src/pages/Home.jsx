import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={styles.hero}>
      <div className="container" style={styles.heroContent}>
        <h1 style={styles.title}>Find Your Perfect Roommate Today</h1>
        <p style={styles.subtitle}>
          Connect with compatible flatmates and explore amazing properties in your city.
        </p>
        <div style={styles.cta}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '15px 30px' }}>
            Get Started
          </Link>
          <Link to="/properties" className="btn" style={{ fontSize: '1.2rem', padding: '15px 30px', backgroundColor: 'white', border: '1px solid #d1d5db' }}>
            Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  hero: {
    backgroundColor: '#ebecfe',
    padding: '100px 0',
    textAlign: 'center',
    minHeight: 'calc(100vh - 70px)'
  },
  heroContent: {
    maxWidth: '800px'
  },
  title: {
    fontSize: '3rem',
    color: '#1e1b4b',
    marginBottom: '20px'
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#4b5563',
    marginBottom: '40px'
  },
  cta: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center'
  }
};

export default Home;
