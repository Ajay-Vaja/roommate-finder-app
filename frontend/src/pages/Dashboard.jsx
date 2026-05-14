import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { getMyProperties } from '../services/propertyService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const res = await getMyProperties();
        setProperties(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProps();
  }, []);

  return (
    <div className="container" style={{ marginTop: '40px' }}>
      <h2 style={{ marginBottom: '20px' }}>Dashboard</h2>
      <div style={styles.grid}>
        <Card title="My Profile Status">
          <p>Your profile is 80% complete.</p>
          <button className="btn btn-primary" style={{ marginTop: '10px' }}>Complete Profile</button>
        </Card>
        <Card title="Manage My Properties">
          <p>You have {properties.length} active listings.</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '10px' }}
            onClick={() => navigate('/manage-properties')}
          >
            Manage Listings
          </button>
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
