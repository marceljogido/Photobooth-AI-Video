import React from 'react';

export const PixelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    strokeWidth="0.5"
    {...props}
  >
    <path d="M4 4h4v4H4z M8 4h4v4H8z M12 4h4v4h-4z M16 4h4v4h-4z M4 8h4v4H4z M16 8h4v4h-4z M8 12h4v4H8z M12 12h4v4h-4z M4 16h4v4H4z M8 16h4v4H8z M12 16h4v4h-4z M16 16h4v4h-4z"/>
  </svg>
);
