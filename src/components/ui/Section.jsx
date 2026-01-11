import React from 'react';

const Section = ({ title, children }) => (
  <div className="bg-white p-4 rounded-2xl shadow-sm">
    <h3 className="text-gray-600 mb-3 font-medium">{title}</h3>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

export default Section;