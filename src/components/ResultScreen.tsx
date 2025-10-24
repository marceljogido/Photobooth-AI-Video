import React, { useEffect, useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Orientation } from '../types';

interface ResultScreenProps {
  videoSrc: string;
  shareableUrl: string | null;
  isUploading: boolean;
  uploadError: string | null;
  onRetryUpload?: () => void;
  onStartOver: () => void;
  orientation: Orientation;
}

const ResultScreen: React.FC<ResultScreenProps> = ({
  videoSrc,
  shareableUrl,
  isUploading,
  uploadError,
  onRetryUpload,
  onStartOver,
  orientation,
}) => {
  const [computedOrientation, setComputedOrientation] = useState<Orientation>(orientation);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    setComputedOrientation(orientation);
  }, [orientation, videoSrc]);

  const handleMetadataLoaded = useCallback((event: React.SyntheticEvent<HTMLVideoElement>) => {
    const target = event.currentTarget;
    if (target.videoWidth && target.videoHeight) {
      const ratio = target.videoWidth / target.videoHeight;
      const detectedOrientation: Orientation = ratio >= 1 ? 'landscape' : 'portrait';
      setComputedOrientation(detectedOrientation);
    }
  }, []);

  const containerOrientation = computedOrientation;
  const isPortraitLayout = containerOrientation === 'portrait';

  return (
    <>
      <div
        className={`w-full h-full flex p-4 md:p-8 ${
          isPortraitLayout
            ? 'flex-col items-center justify-center gap-6'
            : 'flex-col md:flex-row items-center justify-center gap-4 md:gap-8'
        }`}
      >
        <div className="flex flex-col items-center text-center max-w-xl">
          <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFC371] to-[#F9D423] mb-3">
            Motion is Ready!
          </h2>
        </div>

        <div
          className={`relative w-full ${
            containerOrientation === 'portrait' ? 'max-w-2xl' : 'max-w-3xl'
          } rounded-lg overflow-hidden shadow-2xl shadow-[#8A5FBF]/30 border-2 border-[#8A5FBF]/60 group bg-black`}
          style={{ aspectRatio: containerOrientation === 'portrait' ? '9 / 16' : '16 / 9' }}
        >
          <video
            src={videoSrc}
            autoPlay
            loop
            playsInline
            onLoadedMetadata={handleMetadataLoaded}
            className="w-full h-full object-cover animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#F9D423] rounded-full animate-sparkle-1"></div>
          <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-[#77A6F7] rounded-full animate-sparkle-2"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white rounded-full animate-sparkle-3"></div>

          <div className="absolute bottom-3 right-3 flex items-center gap-3">
            <img
              src="/logowatermark.png"
              alt="DigiOH Logo"
              className="h-16 w-auto md:h-20 object-contain drop-shadow-lg pointer-events-none select-none"
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center max-w-md">
          <p className="text-base md:text-lg text-[#77A6F7] mb-3 md:mb-4">
            Scan to Download & Share Your Moment!
          </p>
          {!shareableUrl && (
            <p className="text-xs md:text-sm text-white/60 mb-4 md:mb-6">
              Tautan download akan aktif begitu proses upload selesai.
            </p>
          )}

          {uploadError && (
            <div className="w-full px-4 py-3 bg-red-500/10 border border-red-400/40 text-red-200 rounded-lg mb-4 md:mb-6">
              <p className="text-sm md:text-base mb-2">{uploadError}</p>
              {onRetryUpload && (
                <button
                  onClick={onRetryUpload}
                  disabled={isUploading}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors duration-300 ${
                    isUploading
                      ? 'bg-red-400/40 text-red-100 cursor-not-allowed'
                      : 'bg-red-400 text-red-900 hover:bg-red-300'
                  }`}
                >
                  Coba unggah lagi
                </button>
              )}
            </div>
          )}

          {isUploading && !shareableUrl && (
            <div className="text-sm text-yellow-200 mb-4 md:mb-6">
              Mengunggah video ke server... harap tunggu sebentar.
            </div>
          )}

          <div className="p-3 bg-white rounded-lg shadow-lg mb-6 md:mb-8 min-w-[200px] min-h-[200px] flex items-center justify-center">
            {shareableUrl ? (
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="flex flex-col items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D423] rounded-md transition-transform hover:scale-[1.02] active:scale-95"
                title="Perbesar QR Code"
              >
                <QRCodeSVG value={shareableUrl} size={160} />
                <span className="mt-2 text-xs text-[#1a1133]/70 font-medium">Ketuk untuk perbesar</span>
              </button>
            ) : (
              <div className="w-[160px] h-[160px] border-2 border-dashed border-[#77A6F7]/60 rounded-lg flex items-center justify-center text-[#77A6F7] text-sm font-medium text-center px-4">
                {isUploading ? 'Menyiapkan QR Code...' : 'QR Code akan muncul setelah upload selesai.'}
              </div>
            )}
          </div>

          <button
            onClick={onStartOver}
            className="px-8 py-3 bg-gray-700 text-white font-semibold text-lg rounded-full hover:bg-gray-600 transition-colors duration-300"
          >
            Create Another Motion
          </button>
        </div>
      </div>

      {shareableUrl && isQrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setIsQrModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full flex items-center justify-center flex-col gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D423] rounded-full p-1"
              aria-label="Tutup QR Code"
            >
              X
            </button>
            <h3 className="text-lg font-semibold text-[#1a1133]">Scan QR untuk download</h3>
            <QRCodeSVG value={shareableUrl} size={320} />
            <p className="text-sm text-gray-600 text-center">
              Arahkan kamera ponsel ke QR Code untuk mengunduh video Anda.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ResultScreen;
