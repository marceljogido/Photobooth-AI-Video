import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { ShutterIcon } from './icons/ShutterIcon';
import { Orientation } from '../types';

interface PhotoCaptureProps {
  onPhotoCaptured: (image: string, orientation: Orientation) => void;
  orientation: Orientation;
  onOrientationChange: (nextOrientation: Orientation) => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoCaptured,
  orientation,
  onOrientationChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async (targetOrientation: Orientation) => {
    if (!videoRef.current) {
      return;
    }

    try {
      setCameraError(null);
      setIsCameraActive(false);
      setCountdown(null);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const portraitConstraints: MediaTrackConstraints = {
        width: { ideal: 1080 },
        height: { ideal: 1920 },
        aspectRatio: { ideal: 9 / 16 },
        facingMode: 'user',
      };

      const landscapeConstraints: MediaTrackConstraints = {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: { ideal: 16 / 9 },
        facingMode: 'user',
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: targetOrientation === 'portrait' ? portraitConstraints : landscapeConstraints,
      });

      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video
          .play()
          .then(() => {
            setIsCameraActive(true);
          })
          .catch(err => {
            console.error('Video play failed:', err);
            setCameraError('Could not play the video stream.');
            setIsCameraActive(false);
          });
      };
    } catch (err) {
      console.error('Error accessing camera: ', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera permission was denied. Please allow camera access in your browser settings.');
        } else {
          setCameraError(`Could not access camera. Error: ${err.name}`);
        }
      } else {
        setCameraError('An unknown error occurred while accessing the camera.');
      }
    }
  }, []);

  useEffect(() => {
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
        onPhotoCaptured(dataUrl, orientation);
      }
    }
  }, [onPhotoCaptured, orientation]);

  const handleStartCamera = useCallback(() => {
    startCamera(orientation);
  }, [orientation, startCamera]);

  const handleToggleOrientation = useCallback(() => {
    const nextOrientation: Orientation = orientation === 'portrait' ? 'landscape' : 'portrait';
    onOrientationChange(nextOrientation);
    if (isCameraActive) {
      startCamera(nextOrientation);
    }
  }, [orientation, isCameraActive, startCamera, onOrientationChange]);

  const handleStartCountdown = () => {
    setCountdown(3);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 gap-4">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h2 className="text-2xl md:text-3xl font-bold text-[#77A6F7]">Stand in Position</h2>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleToggleOrientation}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-[#8A5FBF]/40 text-[#F9D423] font-semibold hover:bg-[#8A5FBF]/60 transition-colors"
            type="button"
          >
            {orientation === 'portrait' ? 'Switch to Landscape (16:9)' : 'Switch to Portrait (9:16)'}
          </button>
          <button
            onClick={handleStartCamera}
            className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-[#F9D423] text-[#1a1133] font-semibold hover:bg-[#fce16a] transition-colors"
            type="button"
          >
            {isCameraActive ? 'Restart Camera' : 'Start Camera'}
          </button>
        </div>
      </div>
      <div
        className="relative w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl shadow-[#8A5FBF]/20 border-2 border-[#8A5FBF]/50 bg-black/30 flex items-center justify-center"
        style={{ aspectRatio: orientation === 'portrait' ? '9 / 16' : '16 / 9' }}
      >
        <video
          ref={videoRef}
          playsInline
          className={`w-full h-full object-cover transform -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
        ></video>
        {isCameraActive && (
          <img
            src="/logowatermark.png"
            alt="DigiOH Watermark"
            className="absolute bottom-6 right-6 w-28 md:w-64 object-contain drop-shadow-lg pointer-events-none select-none opacity-90 z-10"
          />
        )}

        {!isCameraActive && (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center text-center text-[#77A6F7]/80 px-6">
            {cameraError ? (
              <div className="p-4 max-w-lg bg-black/40 rounded-lg border border-red-400/40">
                <p className="font-bold text-red-400">Camera Error</p>
                <p className="text-sm text-red-400/80">{cameraError}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <CameraIcon className="w-20 h-20 mx-auto opacity-50" />
                <p className="text-lg">Press the button above to start the camera</p>
              </div>
            )}
          </div>
        )}

        {countdown === null && isCameraActive && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10">
            <button
              onClick={handleStartCountdown}
              aria-label="Take Photo"
              className="group focus:outline-none"
              type="button"
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
