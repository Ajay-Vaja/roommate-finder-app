import React from 'react';
import Card from '../components/Card';

const Profile = () => {
  return (
    <div className="container" style={{ marginTop: '40px', maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '20px' }}>My Profile</h2>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
            U
          </div>
          <div>
            <h3>User Name</h3>
            <p style={{ color: 'var(--text-muted)' }}>user@example.com</p>
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }}>Edit Profile</button>
      </Card>
    </div>
  );
};

export default Profile;
