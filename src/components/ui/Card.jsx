import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white rounded-xl p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;