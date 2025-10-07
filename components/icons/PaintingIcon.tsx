import React from 'react';

export const PaintingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    {...props}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="1.5"></rect>
    <path d="M8 14l3-3 4 4 2-2 3 3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="1.5"></circle>
  </svg>
);
