import React from 'react';

const Button = ({ children, variant = 'primary', onClick, disabled = false, className = '', ...props }) => {
  const baseClasses = 'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-pink-500 text-white shadow-md hover:bg-pink-600 active:scale-95',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    outline: 'border border-pink-500 text-pink-500 bg-transparent hover:bg-pink-50',
    ghost: 'text-gray-600 hover:bg-gray-100'
  };

  const classes = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <button 
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;