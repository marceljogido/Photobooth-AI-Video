import React, { useState, useCallback } from 'react';
import { AppState } from './types';
import WelcomeScreen from './components/WelcomeScreen';
import PhotoCapture from './components/PhotoCapture';
import PreviewScreen from './components/PreviewScreen';
import StyleSelectionScreen from './components/StyleSelectionScreen';
import StyledPreviewScreen from './components/StyledPreviewScreen';
import ProcessingScreen from './components/ProcessingScreen';
import ResultScreen from './components/ResultScreen';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedStylePrompt, setSelectedStylePrompt] = useState<string | null>(null);
  const [styledImage, setStyledImage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = useCallback(() => {
    setAppState(AppState.CAPTURE);
    setCapturedImage(null);
    setSelectedStylePrompt(null);
    setStyledImage(null);
    setGeneratedVideoUrl(null);
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

  const handleProcessingComplete = useCallback((videoUrl: string) => {
    setGeneratedVideoUrl(videoUrl);
    setAppState(AppState.RESULT);
  }, []);

  const handleProcessingError = useCallback((errorMessage: string) => {
    setError(errorMessage);
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
        if(generatedVideoUrl) {
            return <ResultScreen videoSrc={generatedVideoUrl} onStartOver={handleStart} />;
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