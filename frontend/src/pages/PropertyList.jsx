import React from 'react';
import Card from '../components/Card';

const PropertyList = () => {
  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <h2 style={{ marginBottom: '20px' }}>Available Properties</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <Card title="Spacious Apartment in Downtown">
          <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>$800/month</p>
          <p>Looking for a neat roommate to share a 2BHK...</p>
        </Card>
        <Card title="Cozy Room near University">
          <p style={{ color: 'var(--text-muted)', marginBottom: '10px' }}>$500/month</p>
          <p>Available immediately. Includes utilities...</p>
        </Card>
      </div>
    </div>
  );
};

export default PropertyList;
