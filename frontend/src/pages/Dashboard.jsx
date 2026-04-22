import React from 'react';
import Card from '../components/Card';

const Dashboard = () => {
  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <h2 style={{ marginBottom: '20px' }}>Dashboard</h2>
      <div style={styles.grid}>
        <Card title="My Profile Status">
          <p>Your profile is 80% complete.</p>
          <button className="btn btn-primary" style={{ marginTop: '10px' }}>Complete Profile</button>
        </Card>
        <Card title="Recent Matches">
          <p>You have 3 new potential roommates!</p>
          <button className="btn" style={{ marginTop: '10px', border: '1px solid #ccc' }}>View Matches</button>
        </Card>
      </div>
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px'
  }
};

export default Dashboard;
