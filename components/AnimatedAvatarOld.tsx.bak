
import React, { useState, useEffect, useRef } from 'react';
import { AvatarParts, AudioData } from '../types';

interface AnimatedAvatarProps {
  parts: AvatarParts;
  isPlaying: boolean;
  audioData: AudioData | null;
}

// Sequence: A-C-B-D-A-E-B-F-A-G-B-H-A-I-B-J
const FRAME_SEQUENCE = [0, 2, 1, 3, 0, 4, 1, 5, 0, 6, 1, 7, 0, 8, 1, 9];
const FRAME_RATE = 15; // Increased for smoother mouth shape changes

export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ parts, isPlaying, audioData }) => {
  const [frameCounter, setFrameCounter] = useState(0);
  const animationRef = useRef<number>();
  const lastFrameTimeRef = useRef(performance.now());

  useEffect(() => {
    let animId: number;
    const animate = (time: number) => {
      const deltaTime = time - lastFrameTimeRef.current;
      if (deltaTime > 1000 / FRAME_RATE) {
        lastFrameTimeRef.current = time;
        setFrameCounter((prev) => prev + 1);
      }
      animId = requestAnimationFrame(animate);
      animationRef.current = animId;
    };

    if (isPlaying) {
      lastFrameTimeRef.current = performance.now(); // Reset timer on play
      animId = requestAnimationFrame(animate);
      animationRef.current = animId;
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setFrameCounter(0); // Reset to first frame when not playing
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  if (!parts || parts.length < 10) {
    return null;
  }
  
  const currentSequenceIndex = frameCounter % FRAME_SEQUENCE.length;
  // Default to frame B (tilted) when paused
  const currentPartIndex = isPlaying ? FRAME_SEQUENCE[currentSequenceIndex] : 1; 
  const currentImage = parts[currentPartIndex];

  // Audio-reactive calculations
  const flap = isPlaying && audioData ? Math.max(0, Math.min(1, audioData.mid * 4.5)) : 0;
  const sway = isPlaying && audioData && audioData.rhythm > 0.5 ? (Math.sin(frameCounter * 0.6) * 2.5) : 0;
  const idleSway = isPlaying ? (Math.sin(frameCounter * 0.2) * 1) : 0;
  const tilt = isPlaying && audioData ? (audioData.rhythm > 0.5 ? -3 : 0) + (Math.sin(frameCounter * 0.35) * 1.5) : -2;

  const sharedStyle: React.CSSProperties = {
    backgroundImage: `url(${currentImage})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    position: 'absolute',
    inset: 0,
    transition: 'transform 80ms ease-out', // Smoother transition
  };

  const topStyle: React.CSSProperties = {
    ...sharedStyle,
    backgroundPosition: 'center top',
    clipPath: 'polygon(0 0, 100% 0, 100% 55%, 0 55%)',
    // Top part moves more, tilts back more dramatically
    transform: `translate(${sway + idleSway}px, ${-flap * 12}px) rotate(${tilt}deg)`,
  };

  const bottomStyle: React.CSSProperties = {
    ...sharedStyle,
    backgroundPosition: 'center bottom',
    clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
    // Bottom part moves less, providing an anchor
    transform: `translate(${-sway * 0.5}px, ${flap * 2}px) rotate(${-tilt * 0.3}deg)`,
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="relative w-48 h-64 md:w-56 md:h-72 lg:w-64 lg:h-80 drop-shadow-2xl">
        <div style={topStyle}></div>
        <div style={bottomStyle}></div>
      </div>
    </div>
  );
};