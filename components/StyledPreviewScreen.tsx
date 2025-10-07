import React, { useState, useEffect } from 'react';
import { applyStyleToImage } from '../services/geminiService';
import { Spinner } from './icons/Spinner';

interface StyledPreviewScreenProps {
  imageSrc: string;
  stylePrompt: string;
  onConfirm: (styledImage: string) => void;
  onBack: () => void;
  onError: (error: string) => void;
}

const StyledPreviewScreen: React.FC<StyledPreviewScreenProps> = ({
  imageSrc,
  stylePrompt,
  onConfirm,
  onBack,
  onError,
}) => {
  const [styledImage, setStyledImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateStyledImage = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await applyStyleToImage(imageSrc, stylePrompt);
        setStyledImage(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        // Optionally call the main error handler to bubble up
        // onError(errorMessage); 
      } finally {
        setIsLoading(false);
      }
    };

    generateStyledImage();
  }, [imageSrc, stylePrompt, onError]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFC371] to-[#F9D423] mb-4 text-center">
        Styled Preview
      </h2>

      <div className="w-full max-w-2xl aspect-[16/9] rounded-lg overflow-hidden shadow-2xl shadow-[#8A5FBF]/20 border-2 border-[#8A5FBF]/50 mb-6 flex items-center justify-center bg-black/20">
        {isLoading && (
          <div className="flex flex-col items-center text-center p-4">
            <Spinner className="w-16 h-16 text-[#F9D423] mb-4" />
            <p className="text-lg text-[#77A6F7]">Applying AI style filter...</p>
          </div>
        )}
        {error && !isLoading && (
          <div className="p-4 text-center">
            <p className="font-bold text-[#E84A5F]">Styling Failed</p>
            <p className="text-sm text-white/80">{error}</p>
             <button
                onClick={onBack}
                className="mt-4 px-8 py-3 bg-gray-700 text-white font-semibold text-lg rounded-full hover:bg-gray-600 transition-colors duration-300"
                >
                Try a Different Style
            </button>
          </div>
        )}
        {!isLoading && styledImage && (
          <img src={styledImage} alt="Styled preview" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-xs sm:max-w-none justify-center">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="px-8 py-3 bg-gray-700 text-white font-semibold text-lg rounded-full hover:bg-gray-600 transition-colors duration-300 disabled:opacity-50 w-full sm:w-auto"
        >
          Different Style
        </button>
        <button
          onClick={() => styledImage && onConfirm(styledImage)}
          disabled={isLoading || !!error || !styledImage}
          className="px-8 py-3 bg-[#F9D423] text-gray-900 font-bold text-lg rounded-full shadow-[0_0_15px_#F9D423] hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          Create Motion Portrait
        </button>
      </div>
    </div>
  );
};

export default StyledPreviewScreen;