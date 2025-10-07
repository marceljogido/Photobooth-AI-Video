import React from 'react';

export const HologramIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    {...props}
  >
    <path d="M12 2.5L5 7v10l7 4.5 7-4.5V7L12 2.5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 7l7 4.5 7-4.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21.5V11.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 10h18" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
    <path d="M3 14h18" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
  </svg>
);
