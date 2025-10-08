import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { ShutterIcon } from './icons/ShutterIcon';

interface PhotoCaptureProps {
  onPhotoCaptured: (image: string) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoCaptured }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    if (isCameraActive || !videoRef.current) return;

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      streamRef.current = stream; // Save stream for cleanup
      const video = videoRef.current;
      video.srcObject = stream;
      
      video.onloadedmetadata = () => {
          video.play().catch(err => {
              console.error("Video play failed:", err);
              setCameraError("Could not play the video stream.");
          });
          setIsCameraActive(true);
      };

    } catch (err) {
      console.error("Error accessing camera: ", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setCameraError('Camera permission was denied. Please allow camera access in your browser settings.');
        } else {
            setCameraError(`Could not access camera. Error: ${err.name}`);
        }
      } else {
        setCameraError("An unknown error occurred while accessing the camera.");
      }
    }
  }, [isCameraActive]);

  useEffect(() => {
    // Cleanup: stop camera streams when component unmounts
    return () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0) {
        capturePhoto();
      }
      return;
    }

    const timerId = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        onPhotoCaptured(dataUrl);
      }
    }
  }, [onPhotoCaptured]);

  const handleStartCountdown = () => {
    setCountdown(3);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold text-[#77A6F7] mb-4">Stand in Position</h2>
      <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-2xl shadow-[#8A5FBF]/20 border-2 border-[#8A5FBF]/50 bg-black/30 flex items-center justify-center">
        <video 
            ref={videoRef} 
            playsInline 
            className={`w-full h-full object-cover transform -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
        ></video>
        
        {!isCameraActive && (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center text-[#77A6F7]/80">
                {cameraError ? (
                <div className="p-4 max-w-lg">
                    <p className="font-bold text-red-400">Camera Error</p>
                    <p className="text-sm text-red-400/80">{cameraError}</p>
                </div>
                ) : (
                <button
                    onClick={startCamera}
                    className="w-full h-full flex flex-col items-center justify-center group focus:outline-none focus:ring-2 focus:ring-[#F9D423] rounded-lg"
                    aria-label="Start Camera"
                >
                    <CameraIcon className="w-20 h-20 mx-auto opacity-50 group-hover:opacity-75 transition-opacity" />
                    <p className="mt-2 text-lg">Tap to Start Camera</p>
                </button>
                )}
            </div>
        )}

        {countdown === null && isCameraActive && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
            <button
                onClick={handleStartCountdown}
                aria-label="Take Photo"
                className="group focus:outline-none"
            >
                <ShutterIcon className="w-16 h-16 text-white/90 group-hover:text-white group-hover:scale-105 group-active:scale-95 transition-transform duration-200" />
            </button>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
      
      {countdown !== null && countdown > 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <div className="text-9xl font-extrabold text-white animate-ping">
                {countdown}
            </div>
             <div className="absolute text-9xl font-extrabold text-white">
                {countdown}
            </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCapture;