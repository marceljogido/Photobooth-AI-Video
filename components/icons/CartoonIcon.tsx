import React from 'react';

export const CartoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        stroke="currentColor"
        {...props}
    >
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <ellipse cx="8.5" cy="10.5" rx="1.5" ry="2.5" fill="currentColor" />
        <ellipse cx="15.5" cy="10.5" rx="1.5" ry="2.5" fill="currentColor" />
        <path d="M8 15C8.91331 16.2848 10.3643 17 12 17C13.6357 17 15.0867 16.2848 16 15" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);