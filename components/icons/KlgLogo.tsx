
import React from 'react';

// A simplified, abstract representation of the Kawan Lama Group logo
export const KlgLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 60"
    fill="currentColor"
    {...props}
  >
    <path d="M0 0 H40 L20 30 Z" />
    <path d="M30 0 H70 L50 30 Z" />
    <path d="M60 0 H100 L80 30 Z" />
    <path d="M10 40 L30 10 L50 40 L30 70 Z" fillOpacity="0.7" />
    <path d="M40 40 L60 10 L80 40 L60 70 Z" fillOpacity="0.7" />
  </svg>
);
