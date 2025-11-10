import React from 'react';
import { useApp, useUI } from '../contexts/AppContext';
import { AppMode, modeConfigs } from '../types';

export const ModeSelector: React.FC = () => {
  const { setMode } = useApp();
  const { hideModeSelector, getRandomCanadianPhrase } = useUI();

  const handleModeSelect = (mode: AppMode) => {
    setMode(mode);
    hideModeSelector();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full border-2 border-red-600/30">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-3 text-[#F5F5DC]">
              Choose Your Mode, Buddy! 🎯
            </h2>
            <p className="text-xl text-gray-400">
              {getRandomCanadianPhrase('greetings')} What would you like to create today?
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {Object.values(modeConfigs).map((config) => (
              <button
                key={config.id}
                onClick={() => handleModeSelect(config.id)}
                className="group relative p-6 bg-gray-800 hover:bg-gray-750 rounded-xl transition-all duration-300 border-2 border-transparent hover:border-red-600 hover:scale-105"
              >
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                  {config.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#F5F5DC]">{config.name}</h3>
                <p className="text-sm text-gray-400">{config.description}</p>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 rounded-xl transition-opacity pointer-events-none" />
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Don't worry, you can change modes anytime, eh?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
