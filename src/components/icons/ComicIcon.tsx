import React from 'react';

export const ComicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    {...props}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="1.5"></path>
    <circle cx="9" cy="10" r="0.5" fill="currentColor"></circle>
    <circle cx="12" cy="10" r="0.5" fill="currentColor"></circle>
    <circle cx="15" cy="10" r="0.5" fill="currentColor"></circle>
  </svg>
);
