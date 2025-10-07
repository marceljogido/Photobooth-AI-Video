import React from 'react';

export const ShutterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 80 80" 
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle 
      cx="40" 
      cy="40" 
      r="36" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      opacity="0.5" 
    />
    <circle 
      cx="40" 
      cy="40" 
      r="28" 
      fill="currentColor" 
    />
  </svg>
);