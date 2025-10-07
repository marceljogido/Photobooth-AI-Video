import React from 'react';
import { KlgLogo } from './icons/KlgLogo';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#FFC371]/10 to-[#8A5FBF]/20">
      <div className="text-center animate-float">
        <div className="mb-4">
          <KlgLogo className="h-12 w-auto mx-auto text-white/80" />
        </div>
        <p className="text-lg text-[#77A6F7] tracking-widest mb-2">KLG SUMMIT 2025</p>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFC371] to-[#F9D423] mb-8">
          Visionary Portraits
        </h1>
      </div>
      
      <button
        onClick={onStart}
        className="mt-12 md:mt-16 px-8 py-3 text-xl md:px-12 md:py-4 md:text-2xl bg-[#F9D423] text-gray-900 font-bold rounded-full shadow-[0_0_20px_#F9D423] hover:scale-105 hover:shadow-[0_0_30px_#F9D423] transition-all duration-300 transform text-center"
      >
        Build Your Future Portrait
      </button>
    </div>
  );
};

export default WelcomeScreen;