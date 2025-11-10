import React, { useState, useEffect, useRef } from 'react';
import { AvatarParts, AudioData } from '../types';

interface AnimatedAvatarProps {
  parts: AvatarParts;
  isPlaying: boolean;
  audioData: AudioData | null;
}

/**
 * Elegant South Park-style animation
 * Simply splits the face in half at the mouth and animates the jaw
 * Much more authentic and performant!
 */
export const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ parts, isPlaying, audioData }) => {
  const [mouthOpen, setMouthOpen] = useState(0);
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef(performance.now());

  // Use the base image (first part) for the avatar
  const baseImage = parts[0];

  useEffect(() => {
    if (!isPlaying) {
      setMouthOpen(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const animate = (time: number) => {
      const deltaTime = time - lastUpdateRef.current;

      // Update at ~30fps for smooth but efficient animation
      if (deltaTime > 33) {
        lastUpdateRef.current = time;

        if (audioData && audioData.energy > 0.1) {
          // Audio-reactive mouth opening
          // Use mid frequencies (voice range) for more accurate sync
          const energyLevel = Math.min(1, audioData.mid * 2);
          const targetOpen = energyLevel * 25; // Max 25px jaw drop

          // Smooth interpolation for natural movement
          setMouthOpen(prev => prev + (targetOpen - prev) * 0.3);
        } else {
          // Gentle close when no significant audio
          setMouthOpen(prev => prev * 0.85);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    lastUpdateRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, audioData]);

  if (!baseImage) {
    return null;
  }

  // Calculate subtle head movements based on audio
  const headBob = isPlaying && audioData
    ? Math.sin(Date.now() * 0.002) * (audioData.energy * 2)
    : 0;

  const headTilt = isPlaying && audioData && audioData.rhythm > 0.5
    ? Math.sin(Date.now() * 0.003) * 2
    : Math.sin(Date.now() * 0.001) * 0.5; // Subtle idle tilt

  const headSway = isPlaying && audioData
    ? Math.sin(Date.now() * 0.0015) * (audioData.rhythm > 0.5 ? 3 : 1)
    : 0;

  // Top half of face (everything above the mouth)
  const topHalfStyle: React.CSSProperties = {
    backgroundImage: `url(${baseImage})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center top',
    position: 'absolute',
    inset: 0,
    clipPath: 'polygon(0 0, 100% 0, 100% 58%, 0 58%)', // Split at mouth line
    transform: `
      translate(${headSway}px, ${headBob - mouthOpen * 0.3}px)
      rotate(${headTilt}deg)
    `,
    transformOrigin: 'center 60%',
    transition: 'transform 50ms ease-out',
    willChange: 'transform',
  };

  // Bottom half of face (jaw and below)
  const bottomHalfStyle: React.CSSProperties = {
    backgroundImage: `url(${baseImage})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center bottom',
    position: 'absolute',
    inset: 0,
    clipPath: 'polygon(0 58%, 100% 58%, 100% 100%, 0 100%)', // Split at mouth line
    transform: `
      translate(${headSway * 0.7}px, ${headBob + mouthOpen}px)
      rotate(${headTilt * 0.5}deg)
    `,
    transformOrigin: 'center 60%',
    transition: 'transform 50ms ease-out',
    willChange: 'transform',
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="relative w-56 h-72 md:w-64 md:h-80 lg:w-72 lg:h-96 drop-shadow-2xl">
        {/* Top half - stays more stable */}
        <div style={topHalfStyle} />

        {/* Bottom half - moves with jaw */}
        <div style={bottomHalfStyle} />

        {/* Optional: Add a subtle highlight when speaking */}
        {isPlaying && audioData && audioData.energy > 0.3 && (
          <div
            className="absolute inset-0 bg-gradient-radial from-red-500/10 to-transparent rounded-full blur-xl"
            style={{
              opacity: audioData.energy * 0.3,
              transition: 'opacity 100ms ease-out',
            }}
          />
        )}
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && audioData && (
        <div className="absolute bottom-4 right-4 bg-black/80 p-3 rounded text-xs font-mono text-green-400">
          <div>Energy: {audioData.energy.toFixed(2)}</div>
          <div>Mid: {audioData.mid.toFixed(2)}</div>
          <div>Jaw: {mouthOpen.toFixed(1)}px</div>
          <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};
