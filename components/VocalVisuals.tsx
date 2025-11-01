
import React from 'react';
import { voices, VoiceOption } from '../types';

interface VocalVisualsProps {
  selectedVoice: VoiceOption;
  onVoiceChange: (voice: VoiceOption) => void;
  disabled: boolean;
  children: React.ReactNode;
}

export const VocalVisuals: React.FC<VocalVisualsProps> = ({ selectedVoice, onVoiceChange, disabled, children }) => {
  return (
    <div className="bg-[#222222] p-6 rounded-lg shadow-lg h-full flex flex-col border border-gray-700 gap-6">
      <div>
        <h2 className="text-xl font-bold text-[#F5F5DC] border-b border-gray-700 pb-2 mb-4">Voice & Visuals</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Select Voice</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
            {voices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => onVoiceChange(voice)}
                disabled={disabled}
                className={`p-3 rounded-lg text-left transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
                  selectedVoice.id === voice.id
                    ? 'bg-red-800 ring-2 ring-red-500 shadow-lg'
                    : 'bg-[#2a2a2a] hover:bg-[#3a3a3a]'
                }`}
              >
                <p className="font-semibold text-sm text-gray-100">{voice.name}</p>
                <p className="text-xs text-gray-400">{voice.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
