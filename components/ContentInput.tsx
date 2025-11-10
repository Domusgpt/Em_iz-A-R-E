import React, { useRef } from 'react';
import { useApp, useContent, useUI } from '../contexts/AppContext';
import { modeConfigs } from '../types';

export const ContentInput: React.FC = () => {
  const { settings } = useApp();
  const { content, setInputText } = useContent();
  const { ui, setError, getRandomCanadianPhrase } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = modeConfigs[settings.mode];
  const isGenerating = ui.isLoading.script || ui.isLoading.audio || ui.isLoading.avatar;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain" || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text.length > config.maxLength) {
          setError(`Sorry buddy, that file's a bit too long, eh? Please keep it under ${config.maxLength} characters.`);
        } else {
          setInputText(text);
          setError(null);
        }
      };
      reader.onerror = () => setError(getRandomCanadianPhrase('apologies') + " Couldn't read that file.");
      reader.readAsText(file);
    } else {
      setError("Oops! Please upload a .txt file, friend.");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= config.maxLength) {
      setInputText(text);
      setError(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.length > config.maxLength) {
      e.preventDefault();
      setError(`That's a bit long, eh? Please keep it under ${config.maxLength} characters, buddy.`);
    }
  };

  const charCount = content.inputText.length;
  const charPercent = (charCount / config.maxLength) * 100;
  const charColor = charPercent > 90 ? 'text-red-500' : charPercent > 75 ? 'text-yellow-500' : 'text-gray-400';

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#F5F5DC] flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            {config.name}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{config.canadianGreeting}</p>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isGenerating}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          📁 Upload File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      <div className="flex-1 flex flex-col">
        <textarea
          value={content.inputText}
          onChange={handleTextChange}
          onPaste={handlePaste}
          placeholder={config.placeholder}
          disabled={isGenerating}
          className="flex-1 w-full bg-gray-900/50 text-[#F5F5DC] rounded-lg p-4 border border-gray-600 focus:border-red-600 focus:outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
        />

        <div className="flex justify-between items-center mt-3">
          <div className={`text-xs ${charColor} font-mono`}>
            {charCount.toLocaleString()} / {config.maxLength.toLocaleString()} characters
          </div>

          {charPercent > 0 && (
            <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  charPercent > 90 ? 'bg-red-500' : charPercent > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(charPercent, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {content.inputText.length > 0 && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            <strong>💡 Tip:</strong> {settings.mode === 'resume'
              ? "Include key achievements and measurable results for the best script, eh?"
              : settings.mode === 'document'
              ? "Break your content into clear sections for better flow, buddy!"
              : "Keep it concise and highlight what makes you unique, friend!"}
          </p>
        </div>
      )}
    </div>
  );
};
