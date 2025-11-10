import React, { useEffect, useCallback } from 'react';
import { AppProviders, useApp, useContent, useAvatar, useUI } from './contexts/AppContext';
import { generateScript, generateAudio, generateAvatarParts } from './services/geminiService';
import { decode, decodeAudioData } from './utils/audioUtils';

// Components
import { Onboarding } from './components/Onboarding';
import { ModeSelector } from './components/ModeSelector';
import { ContentInput } from './components/ContentInput';
import { ScriptStudioNew } from './components/ScriptStudioNew';
import { VoiceAvatarPanel } from './components/VoiceAvatarPanel';
import { PreviewExport } from './components/PreviewExport';
import { HolographicBorder } from './components/HolographicBorder';

// Assume window.webkitAudioContext exists for Safari
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const AppContent: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { content, setAudioUrl } = useContent();
  const { avatar, setAvatarParts } = useAvatar();
  const { ui, setLoading, setError, showOnboarding, showModeSelector, getRandomCanadianPhrase } = useUI();

  // Show onboarding on first load
  useEffect(() => {
    if (!settings.hasCompletedOnboarding) {
      showOnboarding();
    }
  }, [settings.hasCompletedOnboarding, showOnboarding]);

  // Helper to convert AudioBuffer to WAV
  const audioBufferToWav = (buffer: AudioBuffer): ArrayBuffer => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferOut = new ArrayBuffer(length);
    const view = new DataView(bufferOut);
    const channels = [];
    let i = 0;
    let sample = 0;
    let offset = 0;
    let pos = 0;

    // write WAVE header
    const setUint16 = (data: number) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data: number) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for (i = 0; i < buffer.numberOfChannels; i++) {
      channels.push(buffer.getChannelData(i));
    }

    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return bufferOut;
  };

  // Main generation function
  const handleGenerate = useCallback(async () => {
    if (!content.script.trim()) {
      setError("Please generate or write a script first.");
      return;
    }

    setError(null);
    setAudioUrl(null);
    setAvatarParts(null);
    setLoading({ script: false, audio: true, avatar: !!avatar.croppedHeadshot });

    try {
      // Parallelize audio and avatar generation
      const promises = [
        generateAudio(content.script, content.voice.id),
        avatar.croppedHeadshot ? generateAvatarParts(avatar.croppedHeadshot) : Promise.resolve(null)
      ];

      const [base64Audio, generatedAvatarParts] = await Promise.all(promises);

      if (generatedAvatarParts) {
        setAvatarParts(generatedAvatarParts as string[]);
      }

      // Convert audio to playable format
      const outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      const audioBytes = decode(base64Audio as string);
      const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);

      const wav = audioBufferToWav(audioBuffer);
      const blob = new Blob([wav], { type: 'audio/wav' });
      const newAudioUrl = URL.createObjectURL(blob);

      // Clean up old object URL to prevent memory leaks
      if (content.generatedAudioUrl) {
        URL.revokeObjectURL(content.generatedAudioUrl);
      }

      setAudioUrl(newAudioUrl);
      setError(null);

      // Success message with Canadian flair
      setTimeout(() => {
        alert(getRandomPhrase('success') + " Your presentation is ready!");
      }, 500);

    } catch (err: any) {
      console.error("Generation error:", err);
      setError(getRandomPhrase('errors') + " " + (err.message || 'An unknown error occurred.'));
    } finally {
      setLoading({ script: false, audio: false, avatar: false });
    }
  }, [content.script, content.voice.id, content.generatedAudioUrl, avatar.croppedHeadshot, setAudioUrl, setAvatarParts, setLoading, setError, getRandomCanadianPhrase]);

  const isGenerating = ui.isLoading.script || ui.isLoading.audio || ui.isLoading.avatar;

  return (
    <HolographicBorder>
      <div className="min-h-screen bg-transparent text-[#F5F5DC] flex flex-col">
        {/* Header */}
        <header className="bg-gray-900/80 backdrop-blur border-b border-red-600/30 sticky top-0 z-40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl md:text-3xl font-bold text-[#F5F5DC]">
                  🎬 TalkingHead Pro
                </h1>
                <span className="hidden md:inline-block px-3 py-1 bg-red-600/20 border border-red-600/50 rounded-full text-xs font-medium">
                  South Park Style 🍁
                </span>
              </div>
              <button
                onClick={showModeSelector}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm flex items-center space-x-2"
              >
                <span>Change Mode</span>
                <span className="text-xl">🔄</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 h-full">

            {/* LEFT PANEL: Input & Script */}
            <div className="flex flex-col gap-6">
              <ContentInput />
              <ScriptStudioNew />
            </div>

            {/* MIDDLE PANEL: Voice & Avatar */}
            <div className="flex flex-col gap-6">
              <VoiceAvatarPanel />

              {/* Generate Button */}
              <div className="mt-auto">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !content.script.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 px-6 rounded-xl transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-lg shadow-lg hover:shadow-red-600/50"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🎬</span>
                      Generate Presentation
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT PANEL: Preview & Export */}
            <div className="lg:col-span-2 xl:col-span-1 min-h-[600px] xl:min-h-0">
              <PreviewExport />
            </div>
          </div>

          {/* Error Display */}
          {ui.error && (
            <div className="fixed bottom-4 right-4 max-w-md bg-red-900/90 backdrop-blur border border-red-600 rounded-lg p-4 shadow-xl z-50 animate-slide-up">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-white font-medium">{ui.error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-300 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-900/80 backdrop-blur border-t border-red-600/30 py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
              <p>Made with ❤️ for creators 🍁</p>
              <p>TalkingHead Pro © 2024 • Powered by AI</p>
            </div>
          </div>
        </footer>

        {/* Modals */}
        {ui.showOnboarding && <Onboarding />}
        {ui.showModeSelector && <ModeSelector />}
      </div>
    </HolographicBorder>
  );
};

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;
