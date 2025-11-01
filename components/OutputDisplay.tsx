import React, { useState, useCallback } from 'react';
import { Loader } from './Loader';
import { GenerationState, AvatarParts, AudioData } from '../types';
import { HolographicDisplay } from './HolographicDisplay';
import { AnimatedAvatar } from './AnimatedAvatar';

interface OutputDisplayProps {
  isLoading: GenerationState;
  audioUrl: string | null;
  avatarParts: AvatarParts | null;
  error: string | null;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ isLoading, audioUrl, avatarParts, error }) => {
  const [isHologramPlaying, setIsHologramPlaying] = useState(false);
  const [audioData, setAudioData] = useState<AudioData | null>(null);

  const handleAudioData = useCallback((data: AudioData) => {
    setAudioData(data);
  }, []);

  const handlePlayStateChange = useCallback((isPlaying: boolean) => {
    setIsHologramPlaying(isPlaying);
    if (!isPlaying) {
      setAudioData(null); // Reset audio data when paused/stopped
    }
  }, []);
  
  const renderContent = () => {
    if (error) {
      return (
        <div className="bg-red-900/50 border border-red-700 text-red-200 p-6 rounded-lg shadow-lg flex items-center space-x-4 h-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold text-lg">A Glitch in the Matrix</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      );
    }

    if (isLoading.audio || isLoading.avatar) {
        return <Loader text="Assembling holographic emissary..." />;
    }

    if (audioUrl) {
      return (
        <>
            <HolographicDisplay 
              audioUrl={audioUrl} 
              onPlayStateChange={handlePlayStateChange} 
              onAudioData={handleAudioData}
            />
            {avatarParts && (
                <AnimatedAvatar 
                  parts={avatarParts} 
                  isPlaying={isHologramPlaying} 
                  audioData={audioData} 
                />
            )}
        </>
      );
    }

    // Default idle state
    return (
      <div className="flex items-center justify-center h-full bg-black/30 border-2 border-dashed border-gray-700 rounded-lg p-8">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.5 18.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z M12 15.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z M12 8.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z M8.5 12a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0Z M5.5 15.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1Z M18.5 12a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0Z M12 5.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1ZM3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0Z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-400">Awaiting Transmission...</h3>
          <p className="mt-1 text-sm text-gray-500">The holographic ether is ready for your signal.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#222222] p-4 rounded-lg shadow-lg h-full flex flex-col border border-gray-700">
      <div className="w-full aspect-video bg-black rounded-md relative overflow-hidden flex-grow">
        {renderContent()}
      </div>
    </div>
  );
};