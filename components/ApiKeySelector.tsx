import React, { useState, useEffect, useCallback } from 'react';

// Assume window.aistudio exists for type safety in a real project
// Fix: Moved the AIStudio interface into the `declare global` block to resolve a TypeScript type conflict.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [keyIsSelected, setKeyIsSelected] = useState(false);

  const checkApiKey = useCallback(async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setKeyIsSelected(hasKey);
      if (hasKey) {
        onKeySelected();
      }
    } else {
        // Fallback for environments where aistudio is not present
        setKeyIsSelected(true);
        onKeySelected();
    }
  }, [onKeySelected]);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume success to avoid race conditions. The app will handle API errors.
      setKeyIsSelected(true);
      onKeySelected();
    }
  };

  if (keyIsSelected) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center shadow-2xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-cyan-400">API Key Required</h2>
        <p className="text-gray-300 mb-6">
          Video generation with the Veo model requires an API key with billing enabled. Please select your key to proceed.
        </p>
        <button
          onClick={handleSelectKey}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 w-full"
        >
          Select API Key
        </button>
        <p className="text-xs text-gray-500 mt-4">
          For more information on billing, please visit the{' '}
          <a
            href="https://ai.google.dev/gemini-api/docs/billing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-500 hover:underline"
          >
            official documentation
          </a>.
        </p>
      </div>
    </div>
  );
};
