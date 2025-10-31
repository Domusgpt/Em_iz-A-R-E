
import React from 'react';
import { Tone, PresentationStyle, Voice, GenerationState } from '../types';

interface ControlsProps {
  tone: Tone;
  setTone: (tone: Tone) => void;
  style: PresentationStyle;
  setStyle: (style: PresentationStyle) => void;
  voice: string;
  setVoice: (voice: string) => void;
  onGenerate: () => void;
  isLoading: GenerationState;
}

const ControlWrapper: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
    {children}
  </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    className="w-full bg-[#2a2a2a] border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
  />
);

export const Controls: React.FC<ControlsProps> = ({
  tone,
  setTone,
  style,
  setStyle,
  voice,
  setVoice,
  onGenerate,
  isLoading
}) => {
  const isGenerating = isLoading.script || isLoading.audio || isLoading.avatar;

  const voiceMap: { [key in Voice]: string } = {
    [Voice.KORE]: "Kore",
    [Voice.PUCK]: "Puck",
    [Voice.ZEPHYR]: "Zephyr",
    [Voice.CHARON]: "Charon",
  };

  return (
    <div className="bg-[#222222] p-6 rounded-lg shadow-lg h-full border border-gray-700">
      <h2 className="text-xl font-bold mb-6 text-[#F5F5DC] border-b border-gray-700 pb-2">Generation Controls</h2>
      
      <ControlWrapper label="Select Tone">
        <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)} disabled={isGenerating}>
          {Object.values(Tone).map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </ControlWrapper>

      <ControlWrapper label="Select Presentation Style">
        <Select value={style} onChange={(e) => setStyle(e.target.value as PresentationStyle)} disabled={isGenerating}>
          {Object.values(PresentationStyle).map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </ControlWrapper>

      <ControlWrapper label="Select Voice">
        <Select value={voice} onChange={(e) => setVoice(e.target.value)} disabled={isGenerating}>
          {Object.entries(voiceMap).map(([key, value]) => <option key={value} value={value}>{key}</option>)}
        </Select>
      </ControlWrapper>

      <div className="mt-8">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-red-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            "Generate M'iz-A-R-E"
          )}
        </button>
      </div>
    </div>
  );
};
