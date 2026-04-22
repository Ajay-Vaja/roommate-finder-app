import React from 'react';

const Card = ({ children, title }) => {
  return (
    <div className="card">
      {title && <h3 style={{ marginBottom: '15px' }}>{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
