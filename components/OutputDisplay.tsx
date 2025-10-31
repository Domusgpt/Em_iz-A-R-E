
import React from 'react';
import { Loader } from './Loader';
import { GenerationState, AvatarParts } from '../types';
import { AudioVisualizer } from './AudioVisualizer';
import { AnimatedAvatar } from './AnimatedAvatar';

interface OutputDisplayProps {
  isLoading: GenerationState;
  script: string;
  audioUrl: string | null;
  avatarParts: AvatarParts | null;
  error: string | null;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ isLoading, script, audioUrl, avatarParts, error }) => {
  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 text-red-200 p-6 rounded-lg shadow-lg flex items-center space-x-4 h-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 className="font-bold text-lg">An Error Occurred</h3>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const isIdle = !isLoading.script && !isLoading.audio && !isLoading.avatar && !script;

  if (isIdle) {
    return (
      <div className="flex items-center justify-center h-full bg-[#222222]/50 border-2 border-dashed border-gray-700 rounded-lg p-8">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 6l12-3" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-400">Your generated content will appear here.</h3>
          <p className="mt-1 text-sm text-gray-500">Provide your resume, choose your settings, and click "Generate".</p>
        </div>
      </div>
    );
  }

  const renderVisuals = () => {
    if (isLoading.avatar) {
      return <Loader text="Building your avatar..." />;
    }
    if (avatarParts && audioUrl) {
      return <AnimatedAvatar audioUrl={audioUrl} avatarFrames={avatarParts} />;
    }
    if (isLoading.audio) {
        return <Loader text="Narrating your story..." />;
    }
    if (audioUrl) {
      return <AudioVisualizer audioUrl={audioUrl} />;
    }
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Waiting for generation...</p>
      </div>
    );
  };

  return (
    <div className="bg-[#222222] p-4 rounded-lg shadow-lg h-full flex flex-col border border-gray-700">
      {/* Visuals Area */}
      <div className="flex-shrink-0 w-full aspect-video bg-black rounded-md mb-4 relative overflow-hidden">
        {renderVisuals()}
      </div>

      {/* Script Area */}
      <div className="flex-grow h-1/2 flex flex-col">
        <h3 className="text-lg font-semibold mb-2 text-gray-300">Generated Script</h3>
        <div className="bg-[#1A1A1A] p-4 rounded-md flex-grow overflow-y-auto border border-gray-600">
          {isLoading.script ? <Loader text="Crafting your script..." /> : <p className="text-gray-300 whitespace-pre-wrap">{script}</p>}
        </div>
      </div>
    </div>
  );
};