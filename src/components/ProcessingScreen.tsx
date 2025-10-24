import React, { useEffect, useRef, useState } from 'react';
import { generateMotionVideo } from '../services/geminiService';
import { Spinner } from './icons/Spinner';
import { Orientation } from '../types';

interface ProcessingScreenProps {
    imageSrc: string;
    orientation: Orientation;
    onComplete: (generatedVideoUrl: string) => void;
    onError: (error: string) => void;
}

const loadingMessages = [
    "Initializing AI matrix...",
    "Generating futuristic cityscape...",
    "Animating your portrait with subtle motion...",
    "Applying cinematic lighting effects...",
    "Rendering final video pass...",
    "Finalizing cinematic details..."
];

const ProcessingScreen: React.FC<ProcessingScreenProps> = ({ imageSrc, orientation, onComplete, onError }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const hasRequested = useRef(false);

  useEffect(() => {
    const messageInterval = setInterval(() => {
        setCurrentMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    if (hasRequested.current) {
      return;
    }
    hasRequested.current = true;

    console.log("Memulai proses generateMotionVideo di ProcessingScreen");
    const processImage = async () => {
      try {
        const result = await generateMotionVideo(imageSrc, orientation);
        onComplete(result);
      } catch (err) {
        if (err instanceof Error) {
            onError(err.message);
        } else {
            onError('An unknown error occurred.');
        }
      }
    };

    processImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, onComplete, onError]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#8A5FBF]/10 to-[#FFC371]/10">
        <div className="relative flex items-center justify-center mb-8">
            <Spinner className="w-48 h-48 text-[#F9D423]" />
            <img
              src="/loading.png"
              alt="Loading Logo"
              className="w-20 h-20 absolute object-contain animate-loading-logo"
            />
        </div>
        <h2 className="text-3xl font-bold text-[#77A6F7] text-center">
            {loadingMessages[currentMessageIndex]}
        </h2>
        <p className="text-[#77A6F7]/70 mt-2">The AI is creating your cinematic vision.</p>
        <p className="text-sm text-[#77A6F7]/50 mt-4 max-w-sm text-center">
            This process can take a few minutes as the AI generates a high-resolution video. Please be patient.
        </p>
    </div>
  );
};

export default ProcessingScreen;
