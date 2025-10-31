import React, { useRef, useEffect, useState } from 'react';

interface AnimatedAvatarProps {
  audioUrl: string;
  avatarFrames: string[];
}

const FRAME_SWAP_INTERVAL = 100; // ms, for a rapid, South Park-style animation
const SPEAKING_THRESHOLD = 15;   // Volume threshold to trigger animation

// A = 0, B = 1, C = 2, ..., J = 9
const ANIMATION_SEQUENCE = [0, 2, 1, 3, 0, 4, 1, 5, 0, 6, 1, 7, 0, 8, 1, 9];

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ audioUrl, avatarFrames }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameId = useRef<number>(0);
  const lastFrameSwapTimeRef = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [animationStep, setAnimationStep] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  useEffect(() => {
    // Reset and cleanup when audio source changes
    if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setIsSpeaking(false);
          setAnimationStep(0);
          cancelAnimationFrame(animationFrameId.current);
        };
    }

    setIsPlaying(false);
    setIsSpeaking(false);
    setAnimationStep(0);
    setIsInitialized(false);
    cancelAnimationFrame(animationFrameId.current);

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }
    audioContextRef.current = null;
    sourceRef.current = null;

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      cancelAnimationFrame(animationFrameId.current);
       if (audioRef.current) {
        audioRef.current.onended = null;
      }
    };
  }, [audioUrl]);

  const setupAudioContext = () => {
    if (!isInitialized && audioRef.current) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      if (!sourceRef.current) {
        sourceRef.current = context.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyser);
        analyser.connect(context.destination);
      }
      setIsInitialized(true);
    }
  };

  const togglePlay = () => {
    if (!isInitialized) {
      setupAudioContext();
    }
    audioContextRef.current?.resume();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        cancelAnimationFrame(animationFrameId.current);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        lastFrameSwapTimeRef.current = performance.now();
        animationFrameId.current = requestAnimationFrame(renderFrame);
      }
    }
  };
  
  const renderFrame = (time: number) => {
    if (!analyserRef.current) {
      cancelAnimationFrame(animationFrameId.current);
      return;
    };
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
    const currentlySpeaking = average > SPEAKING_THRESHOLD;

    setIsSpeaking(currentlySpeaking);

    if (currentlySpeaking) {
        if (time - lastFrameSwapTimeRef.current > FRAME_SWAP_INTERVAL) {
            lastFrameSwapTimeRef.current = time;
            setAnimationStep(prev => (prev + 1) % ANIMATION_SEQUENCE.length);
        }
    } else {
        setAnimationStep(0);
    }
    animationFrameId.current = requestAnimationFrame(renderFrame);
  };
  
  const renderAvatar = () => {
    if (!avatarFrames || avatarFrames.length < 10) return <div className="text-gray-500">Generating animation frames...</div>;
    
    // Not playing or not speaking, show the static base image
    if (!isPlaying || !isSpeaking) {
       return <img src={avatarFrames[0]} alt="Avatar" className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />;
    }

    // It's playing and speaking, show the split animation
    const frameIndex = ANIMATION_SEQUENCE[animationStep];
    const imageUrl = avatarFrames[frameIndex];
    
    return (
      <div className="w-full h-full flex flex-col scale-110">
        {/* Top half, moves up */}
        <div className="w-full h-1/2 overflow-hidden transition-transform duration-100" style={{ transform: 'translateY(-5px)' }}>
          <div className="w-full h-[200%]" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'top center', imageRendering: 'pixelated' }} />
        </div>
        {/* Bottom half, moves down */}
        <div className="w-full h-1/2 overflow-hidden transition-transform duration-100" style={{ transform: 'translateY(5px)'}}>
          <div className="w-full h-[200%] -translate-y-1/2" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom center', imageRendering: 'pixelated' }} />
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
      {renderAvatar()}
      <audio ref={audioRef} className="hidden" />
      <div className="absolute inset-0 flex items-center justify-center">
        <button onClick={togglePlay} className="w-20 h-20 bg-black bg-opacity-50 rounded-full text-white flex items-center justify-center hover:bg-opacity-70 transition-opacity" aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
        </button>
      </div>
    </div>
  );
};