import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { KlgLogo } from './icons/KlgLogo';

interface ResultScreenProps {
  videoSrc: string;
  onStartOver: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ videoSrc, onStartOver }) => {
  const downloadUrl = "https://example.com/klg-summit-2025/download"; // Placeholder URL

  return (
    <div className="w-full h-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 p-4 md:p-8">
      <div className="relative w-full max-w-xl aspect-[16/9] rounded-lg overflow-hidden shadow-2xl shadow-[#8A5FBF]/30 border-2 border-[#8A5FBF]/60 group">
        <video
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Animated Effects */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#F9D423] rounded-full animate-sparkle-1"></div>
        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-[#77A6F7] rounded-full animate-sparkle-2"></div>
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-sparkle-3"></div>

        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <KlgLogo className="h-8 w-auto text-white/90" />
          <span className="font-bold text-xl text-white tracking-widest">SUMMIT 2025</span>
        </div>
      </div>

      <div className="flex flex-col items-center text-center max-w-md">
        <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFC371] to-[#F9D423] mb-3">
          Your Video is Ready!
        </h2>
        <p className="text-base md:text-lg text-[#77A6F7] mb-4 md:mb-6">
          Scan to Download & Share Your Future Vision!
        </p>
        
        <div className="p-3 bg-white rounded-lg shadow-lg mb-6 md:mb-8">
            <QRCodeSVG value={downloadUrl} size={160} />
        </div>

        <button
          onClick={onStartOver}
          className="px-8 py-3 bg-gray-700 text-white font-semibold text-lg rounded-full hover:bg-gray-600 transition-colors duration-300"
        >
          Create Another
        </button>
      </div>
    </div>
  );
};

export default ResultScreen;