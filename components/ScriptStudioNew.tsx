import React from 'react';
import { useApp, useContent, useUI } from '../contexts/AppContext';
import { Tone, PresentationStyle, modeConfigs } from '../types';
import { generateScript } from '../services/geminiService';

export const ScriptStudioNew: React.FC = () => {
  const { settings } = useApp();
  const { content, setScript, setTone, setStyle } = useContent();
  const { ui, setLoading, setError, getRandomCanadianPhrase } = useUI();

  const config = modeConfigs[settings.mode];
  const isGenerating = ui.isLoading.script || ui.isLoading.audio || ui.isLoading.avatar;

  const handleGenerateScript = async () => {
    if (!content.inputText.trim()) {
      setError("Hey buddy, you need to add some content first, eh?");
      return;
    }

    setError(null);
    setLoading({ script: true });

    try {
      const generated = await generateScript(content.inputText, content.tone, content.style);
      setScript(generated);
      setError(null);
    } catch (err: any) {
      setError(getRandomCanadianPhrase('apologies') + " " + (err.message || 'Failed to generate script.'));
    } finally {
      setLoading({ script: false });
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 h-full flex flex-col">
      <h2 className="text-xl font-bold text-[#F5F5DC] mb-4 flex items-center gap-2">
        <span className="text-2xl">✍️</span>
        Script Studio
      </h2>

      {/* Tone Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Tone & Personality
        </label>
        <select
          value={content.tone}
          onChange={(e) => setTone(e.target.value as Tone)}
          disabled={isGenerating}
          className="w-full bg-gray-900/50 text-[#F5F5DC] rounded-lg p-3 border border-gray-600 focus:border-red-600 focus:outline-none disabled:opacity-50"
        >
          {Object.values(Tone).map((tone) => (
            <option key={tone} value={tone}>
              {tone}
            </option>
          ))}
        </select>
      </div>

      {/* Style Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Presentation Style
        </label>
        <select
          value={content.style}
          onChange={(e) => setStyle(e.target.value as PresentationStyle)}
          disabled={isGenerating}
          className="w-full bg-gray-900/50 text-[#F5F5DC] rounded-lg p-3 border border-gray-600 focus:border-red-600 focus:outline-none disabled:opacity-50"
        >
          {Object.values(PresentationStyle).map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateScript}
        disabled={isGenerating || !content.inputText.trim()}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:bg-gray-600 disabled:cursor-not-allowed mb-4 flex items-center justify-center"
      >
        {ui.isLoading.script ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating Script...
          </>
        ) : (
          <>
            <span className="mr-2">✨</span>
            Generate AI Script
          </>
        )}
      </button>

      {/* Script Editor */}
      <div className="flex-1 flex flex-col">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Your Script (Edit as needed!)
        </label>
        <textarea
          value={content.script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Your AI-generated script will appear here, or you can write your own, eh?"
          disabled={isGenerating}
          className="flex-1 w-full bg-gray-900/50 text-[#F5F5DC] rounded-lg p-4 border border-gray-600 focus:border-red-600 focus:outline-none resize-none disabled:opacity-50 font-sans text-sm leading-relaxed"
        />
        <div className="text-xs text-gray-400 mt-2">
          {content.script.length > 0 && `${content.script.split(' ').length} words • ~${Math.ceil(content.script.split(' ').length / 150)} min read`}
        </div>
      </div>

      {content.script.length > 0 && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
          <p className="text-xs text-green-300">
            <strong>✓ Script ready!</strong> Feel free to edit it, then move on to avatar and voice, buddy!
          </p>
        </div>
      )}
    </div>
  );
};
