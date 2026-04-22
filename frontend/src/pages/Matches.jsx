import React from 'react';
import Card from '../components/Card';

const Matches = () => {
  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <h2 style={{ marginBottom: '20px' }}>Your Matches</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#d1d5db', margin: '0 auto 10px' }}></div>
            <h4>Alex Johnson</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>90% Match Match</p>
            <button className="btn btn-primary" style={{ width: '100%', padding: '8px' }}>Send Message</button>
          </div>
        </Card>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#d1d5db', margin: '0 auto 10px' }}></div>
            <h4>Sam Smith</h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>85% Match Match</p>
            <button className="btn btn-primary" style={{ width: '100%', padding: '8px' }}>Send Message</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Matches;
