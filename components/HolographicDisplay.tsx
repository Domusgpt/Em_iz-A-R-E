
import React, { useRef, useEffect, useState, memo } from 'react';
// @ts-ignore
import { HolographicVisualizer } from '../visualizers/HolographicVisualizer.js';
import { AudioData } from '../types';

interface HolographicDisplayProps {
  audioUrl: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onAudioData?: (data: AudioData) => void;
}

const ROLES = ['background', 'shadow', 'content', 'highlight', 'accent'];
const NUM_VARIANTS = 30;

const cleanUpAudio = (
    animationFrameId: React.MutableRefObject<number>,
    audioContextRef: React.MutableRefObject<AudioContext | null>,
    sourceRef: React.MutableRefObject<MediaElementAudioSourceNode | null>,
    analyserRef: React.MutableRefObject<AnalyserNode | null>
) => {
    cancelAnimationFrame(animationFrameId.current);
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (analyserRef.current) {
        analyserRef.current.disconnect();
        analyserRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error("Error closing audio context:", e));
        audioContextRef.current = null;
    }
};


export const HolographicDisplay: React.FC<HolographicDisplayProps> = memo(({ audioUrl, onPlayStateChange, onAudioData }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const visualizersRef = useRef<any[]>([]);
  const animationFrameId = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [variant, setVariant] = useState(() => Math.floor(Math.random() * NUM_VARIANTS));

  const lastBassEnergy = useRef(0);
  const beatCooldown = useRef(0);

  useEffect(() => {
    // Component unmount cleanup
    return () => {
      cleanUpAudio(animationFrameId, audioContextRef, sourceRef, analyserRef);
      if (audioRef.current) {
        audioRef.current.onended = null;
        audioRef.current.pause();
      }
      visualizersRef.current = [];
    };
  }, []);
  
  useEffect(() => {
    // Reset and re-initialize for new audioUrl
    setIsPlaying(false);
    onPlayStateChange?.(false);
    cleanUpAudio(animationFrameId, audioContextRef, sourceRef, analyserRef);

    if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => {
          setIsPlaying(false);
          onPlayStateChange?.(false);
        };
    }
    
    setVariant(Math.floor(Math.random() * NUM_VARIANTS));
    
  }, [audioUrl, onPlayStateChange]);

  useEffect(() => {
    // Initialize visualizers when variant changes
    visualizersRef.current = ROLES.map(role => 
        new HolographicVisualizer(`hologram-canvas-${role}`, role, 1.0, variant)
    );
  }, [variant]);


  const setupAudioContext = () => {
    if (audioContextRef.current || !audioRef.current) return;

    try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;

        const source = context.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(context.destination);
        
        audioContextRef.current = context;
        analyserRef.current = analyser;
        sourceRef.current = source;
    } catch (e) {
        console.error("Failed to set up audio context:", e);
    }
  };

  const togglePlay = () => {
    if (!audioContextRef.current) {
      setupAudioContext();
    }
    
    if (audioRef.current && audioContextRef.current) {
      const newIsPlaying = !isPlaying;
      if (newIsPlaying) {
        audioContextRef.current.resume();
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
      setIsPlaying(newIsPlaying);
      onPlayStateChange?.(newIsPlaying);
    }
  };

   useEffect(() => {
    if (isPlaying) {
      animationFrameId.current = requestAnimationFrame(renderFrame);
    } else {
      cancelAnimationFrame(animationFrameId.current);
    }
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isPlaying]);


  const renderFrame = () => {
    if (!analyserRef.current || visualizersRef.current.length < ROLES.length || !isPlaying) {
       animationFrameId.current = requestAnimationFrame(renderFrame);
       return;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const bassBins = dataArray.slice(0, 8);
    const midBins = dataArray.slice(8, 40);
    const highBins = dataArray.slice(40, 128);

    const getAvg = (bins: Uint8Array) => bins.reduce((s, v) => s + v, 0) / (bins.length * 255);

    const bass = getAvg(bassBins);
    const mid = getAvg(midBins);
    const high = getAvg(highBins);
    const energy = getAvg(dataArray);

    let rhythm = 0;
    if (bass > lastBassEnergy.current * 1.15 && bass > 0.4 && beatCooldown.current <= 0) {
        rhythm = 1.0;
        beatCooldown.current = 8;
    }
    lastBassEnergy.current = bass;
    if (beatCooldown.current > 0) beatCooldown.current--;

    const audioData: AudioData = { bass, mid, high, energy, rhythm };

    if (onAudioData) {
      onAudioData(audioData);
    }

    visualizersRef.current.forEach(vis => {
      if (vis && typeof vis.updateAudio === 'function' && typeof vis.render === 'function') {
        vis.updateAudio(audioData);
        vis.render();
      }
    });

    animationFrameId.current = requestAnimationFrame(renderFrame);
  };
  
  return (
    <div className="w-full h-full relative bg-black">
      {ROLES.map(role => (
        <canvas
          key={`${variant}-${role}`}
          id={`hologram-canvas-${role}`}
          className="absolute top-0 left-0 w-full h-full"
          style={{ mixBlendMode: role === 'highlight' || role === 'accent' ? 'screen' : 'normal' }}
        />
      ))}
      <audio ref={audioRef} className="hidden" crossOrigin="anonymous" />
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          onClick={togglePlay}
          className="w-20 h-20 bg-black bg-opacity-50 rounded-full text-white flex items-center justify-center hover:bg-opacity-70 transition-opacity"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
        </button>
      </div>
    </div>
  );
});