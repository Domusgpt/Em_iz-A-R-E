import React, { useState, useRef, useEffect } from 'react';
import { useContent, useAvatar, useUI } from '../contexts/AppContext';
import { AnimatedAvatar } from './AnimatedAvatar';
import { AudioData } from '../types';

export const PreviewExport: React.FC = () => {
  const { content } = useContent();
  const { avatar } = useAvatar();
  const { ui, getRandomCanadianPhrase } = useUI();

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const hasContent = content.generatedAudioUrl && avatar.avatarParts;
  const isGenerating = ui.isLoading.audio || ui.isLoading.avatar;

  useEffect(() => {
    if (content.generatedAudioUrl && audioRef.current) {
      audioRef.current.load();
    }
  }, [content.generatedAudioUrl]);

  const initAudioAnalysis = () => {
    if (!audioRef.current || audioContextRef.current) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioRef.current);

    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    analyzeAudio();
  };

  const analyzeAudio = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!isPlaying) return;

      analyserRef.current!.getByteFrequencyData(dataArray);

      const bass = dataArray.slice(0, 5).reduce((a, b) => a + b) / 5 / 255;
      const mid = dataArray.slice(5, 15).reduce((a, b) => a + b) / 10 / 255;
      const high = dataArray.slice(15, 25).reduce((a, b) => a + b) / 10 / 255;
      const energy = dataArray.reduce((a, b) => a + b) / bufferLength / 255;

      setAudioData({
        bass,
        mid,
        high,
        energy,
        rhythm: energy > 0.3 ? 1 : 0
      });

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  const handlePlay = () => {
    if (!audioRef.current) return;

    if (!audioContextRef.current) {
      initAudioAnalysis();
    }

    audioRef.current.play();
    setIsPlaying(true);
    analyzeAudio();
  };

  const handlePause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownloadAudio = () => {
    if (!content.generatedAudioUrl) return;

    const link = document.createElement('a');
    link.href = content.generatedAudioUrl;
    link.download = 'talkinghead-audio.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700 h-full flex flex-col">
      {/* Preview Area */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-900 to-black rounded-t-xl overflow-hidden">
        {isGenerating ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative">
              <svg className="animate-spin h-20 w-20 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="mt-4 text-gray-400">
              {ui.isLoading.avatar ? "Creating your avatar, buddy..." : "Generating audio, eh? Won't be long!"}
            </p>
          </div>
        ) : hasContent && avatar.avatarParts ? (
          <>
            <AnimatedAvatar
              parts={avatar.avatarParts}
              isPlaying={isPlaying}
              audioData={audioData}
            />
            {/* Animated background */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-blue-900/20 animate-pulse" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-lg">Preview will appear here, friend!</p>
            <p className="text-sm mt-2">Generate your presentation to see the magic, eh?</p>
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <div className="p-6 bg-gray-800 rounded-b-xl border-t border-gray-700">
        {hasContent ? (
          <div className="space-y-4">
            {/* Playback Controls */}
            <div className="flex items-center justify-center space-x-4">
              {!isPlaying ? (
                <button
                  onClick={handlePlay}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all transform hover:scale-110"
                >
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all transform hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 4a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V4zm8 0a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V4z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Export Options */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
              <button
                onClick={handleDownloadAudio}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Audio</span>
              </button>

              <button
                onClick={() => alert('Video export coming soon, eh? 🎥')}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Export Video</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <p className="text-sm">{getRandomCanadianPhrase('encouragement')}</p>
            <p className="text-xs mt-2">Add content, generate a script, and hit "Generate" to create your presentation!</p>
          </div>
        )}

        {/* Audio element */}
        {content.generatedAudioUrl && (
          <audio
            ref={audioRef}
            src={content.generatedAudioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            style={{ display: 'none' }}
          />
        )}
      </div>
    </div>
  );
};
