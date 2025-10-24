import React from 'react';
import { Orientation } from '../types';

interface PreviewScreenProps {
  imageSrc: string;
  onRetake: () => void;
  onConfirm: () => void;
  error?: string | null;
  orientation: Orientation;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({ imageSrc, onRetake, onConfirm, error, orientation }) => {
  const aspectRatio = orientation === 'portrait' ? '9 / 16' : '16 / 9';
  const containerWidthClass = orientation === 'portrait' ? 'max-w-xl' : 'max-w-2xl';

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFC371] to-[#F9D423] mb-4 text-center">
        Preview & Confirm
      </h2>
      <div className={`w-full ${containerWidthClass} rounded-lg overflow-hidden shadow-2xl shadow-[#8A5FBF]/20 border-2 border-[#8A5FBF]/50 mb-6`}
        style={{ aspectRatio }}>
        <img src={imageSrc} alt="Captured preview" className="w-full h-full object-cover transform -scale-x-100"/>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#E84A5F]/20 border border-[#E84A5F] rounded-md text-center max-w-md w-full">
          <p className="font-bold">An error occurred:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-xs sm:max-w-none justify-center">
        <button
          onClick={onRetake}
          className="px-8 py-3 bg-gray-700 text-white font-semibold text-lg rounded-full hover:bg-gray-600 transition-colors duration-300 w-full sm:w-auto"
        >
          Retake Photo
        </button>
        <button
          onClick={onConfirm}
          className="px-8 py-3 bg-[#F9D423] text-gray-900 font-bold text-lg rounded-full shadow-[0_0_15px_#F9D423] hover:scale-105 transition-transform duration-300 w-full sm:w-auto"
        >
          Choose a Style
        </button>
      </div>
    </div>
  );
};

export default PreviewScreen;
