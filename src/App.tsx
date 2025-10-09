import React, { useState, useCallback } from 'react';
import { AppState } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import PhotoCapture from './components/PhotoCapture';
import PreviewScreen from './components/PreviewScreen';
import StyleSelectionScreen from './components/StyleSelectionScreen';
import StyledPreviewScreen from './components/StyledPreviewScreen';
import ProcessingScreen from './components/ProcessingScreen';
import ResultScreen from './components/ResultScreen';
import { uploadVideoToServer } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedStylePrompt, setSelectedStylePrompt] = useState<string | null>(null);
  const [styledImage, setStyledImage] = useState<string | null>(null);
  const [playbackVideoUrl, setPlaybackVideoUrl] = useState<string | null>(null);
  const [shareableVideoUrl, setShareableVideoUrl] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = useCallback(() => {
    setAppState(AppState.CAPTURE);
    setCapturedImage(null);
    setSelectedStylePrompt(null);
    setStyledImage(null);
    setPlaybackVideoUrl(null);
    setShareableVideoUrl(null);
    setIsUploadingVideo(false);
    setUploadError(null);
    setError(null);
  }, []);

  const handlePhotoCaptured = useCallback((image: string) => {
    setCapturedImage(image);
    setAppState(AppState.PREVIEW);
  }, []);

  const handleRetake = useCallback(() => {
    setAppState(AppState.CAPTURE);
    setCapturedImage(null);
  }, []);
  
  const handleConfirm = useCallback(() => {
    if (capturedImage) {
      setError(null); // Clear previous errors
      setAppState(AppState.STYLE_SELECTION);
    }
  }, [capturedImage]);

  const handleStyleSelect = useCallback((stylePrompt: string) => {
    setSelectedStylePrompt(stylePrompt);
    setAppState(AppState.STYLED_PREVIEW);
  }, []);

  const handleStyledPreviewBack = useCallback(() => {
    setAppState(AppState.STYLE_SELECTION);
    setSelectedStylePrompt(null);
    setStyledImage(null); // Clear previous styled image
  }, []);

  const handleStyledPreviewConfirm = useCallback((image: string) => {
    setStyledImage(image);
    setAppState(AppState.PROCESSING);
  }, []);

  const handleProcessingComplete = useCallback(async (videoUrl: string) => {
    console.log("handleProcessingComplete dipanggil, videoUrl:", videoUrl);
    try {
      // Tampilkan video sementara dari AI di ResultScreen sambil menyiapkan URL server
      setPlaybackVideoUrl(videoUrl);
      setShareableVideoUrl(null);
      setUploadError(null);
      setIsUploadingVideo(true);
      setAppState(AppState.RESULT);
      
      // Upload ke server di background
      try {
        const serverVideoUrl = await uploadVideoToServer(videoUrl);
        console.log("Upload ke server berhasil, serverVideoUrl:", serverVideoUrl);

        // Simpan URL server hanya untuk keperluan sharing (QR & download)
        setShareableVideoUrl(serverVideoUrl);
      } catch (uploadError) {
        console.error("Gagal mengupload video ke server:", uploadError);
        // Tetap gunakan video sementara jika upload gagal
        setUploadError("Gagal menyiapkan tautan download. Scan QR akan aktif setelah unggah berhasil.");
      }
      setIsUploadingVideo(false);
    } catch (error) {
      console.error("Error dalam handleProcessingComplete:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setAppState(AppState.PREVIEW);
      setPlaybackVideoUrl(null);
      setShareableVideoUrl(null);
      setIsUploadingVideo(false);
      setUploadError(null);
    }
  }, []);

  const handleRetryUpload = useCallback(async () => {
    if (!playbackVideoUrl) {
      return;
    }

    try {
      setIsUploadingVideo(true);
      setUploadError(null);
      const serverVideoUrl = await uploadVideoToServer(playbackVideoUrl);
      console.log("Retry upload berhasil, serverVideoUrl:", serverVideoUrl);
      setShareableVideoUrl(serverVideoUrl);
    } catch (retryError) {
      console.error("Gagal mengupload video ke server saat retry:", retryError);
      setUploadError("Gagal menyiapkan tautan download. Silakan coba lagi.");
    } finally {
      setIsUploadingVideo(false);
    }
  }, [playbackVideoUrl]);

  const handleProcessingError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setPlaybackVideoUrl(null);
    setShareableVideoUrl(null);
    setIsUploadingVideo(false);
    setUploadError(null);
    setAppState(AppState.PREVIEW); // Go back to original preview on error
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.WELCOME:
        return <WelcomeScreen onStart={handleStart} />;
      case AppState.CAPTURE:
        return <PhotoCapture onPhotoCaptured={handlePhotoCaptured} />;
      case AppState.PREVIEW:
        if (capturedImage) {
          return (
            <PreviewScreen
              imageSrc={capturedImage}
              onRetake={handleRetake}
              onConfirm={handleConfirm}
              error={error}
            />
          );
        }
        setAppState(AppState.CAPTURE);
        return null;
      case AppState.STYLE_SELECTION:
        return <StyleSelectionScreen onStyleSelect={handleStyleSelect} />;
      case AppState.STYLED_PREVIEW:
        if (capturedImage && selectedStylePrompt) {
          return (
            <StyledPreviewScreen
              imageSrc={capturedImage}
              stylePrompt={selectedStylePrompt}
              onConfirm={handleStyledPreviewConfirm}
              onBack={handleStyledPreviewBack}
              onError={handleProcessingError}
            />
          );
        }
        setAppState(AppState.CAPTURE);
        return null;
      case AppState.PROCESSING:
        if(styledImage) {
            return <ProcessingScreen 
              imageSrc={styledImage} 
              onComplete={handleProcessingComplete} 
              onError={handleProcessingError} 
            />;
      }
      setAppState(AppState.CAPTURE);
      return null;
    case AppState.RESULT:
        if(playbackVideoUrl) {
            return (
              <ResultScreen
                videoSrc={playbackVideoUrl}
                shareableUrl={shareableVideoUrl}
                isUploading={isUploadingVideo}
                uploadError={uploadError}
                onRetryUpload={handleRetryUpload}
                onStartOver={handleStart}
              />
            );
        }
        setAppState(AppState.WELCOME);
        return null;
     default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-[#1a1133] via-[#0c0c1e] to-[#0a0a1a] text-white overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default App;
