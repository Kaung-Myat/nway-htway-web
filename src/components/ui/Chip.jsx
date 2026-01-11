import React from 'react';

const Chip = ({ label, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
      selected
        ? 'bg-pink-500 text-white shadow-md scale-105'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

export default Chip;