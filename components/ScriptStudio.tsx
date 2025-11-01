import React from 'react';
import { Tone, PresentationStyle } from '../types';

interface ScriptStudioProps {
  script: string;
  setScript: (script: string) => void;
  tone: Tone;
  setTone: (tone: Tone) => void;
  style: PresentationStyle;
  setStyle: (style: PresentationStyle) => void;
  onGenerateScript: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const ControlWrapper: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex-1 min-w-[120px]">
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

export const ScriptStudio: React.FC<ScriptStudioProps> = ({
  script,
  setScript,
  tone,
  setTone,
  style,
  setStyle,
  onGenerateScript,
  isLoading,
  disabled
}) => {
  return (
    <div className="bg-[#222222] p-6 rounded-lg shadow-lg h-full flex flex-col border border-gray-700">
      <h2 className="text-xl font-bold text-[#F5F5DC] border-b border-gray-700 pb-2 mb-4">Script Studio</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <ControlWrapper label="Tone">
          <Select value={tone} onChange={(e) => setTone(e.target.value as Tone)} disabled={disabled}>
            {Object.values(Tone).map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
        </ControlWrapper>
        <ControlWrapper label="Style">
          <Select value={style} onChange={(e) => setStyle(e.target.value as PresentationStyle)} disabled={disabled}>
            {Object.values(PresentationStyle).map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </ControlWrapper>
      </div>
      
      <button
        onClick={onGenerateScript}
        disabled={isLoading || disabled}
        className="w-full bg-cyan-700 text-white font-semibold py-2 px-4 rounded-md hover:bg-cyan-600 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center mb-4"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Script...
          </>
        ) : "Generate Script with AI"}
      </button>

      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Your script will manifest here. Feel free to commune with the AI, or scribe your own tale..."
        disabled={disabled}
        className="flex-grow w-full bg-[#1A1A1A] text-gray-300 p-4 rounded-md border border-gray-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition resize-none disabled:bg-gray-800 disabled:cursor-not-allowed min-h-[150px]"
      />
    </div>
  );
};