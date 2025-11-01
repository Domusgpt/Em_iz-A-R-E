import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { HolographicVisualizer } from '../visualizers/HolographicVisualizer.js';

export const HolographicBorder: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const topVisRef = useRef<any>(null);
  const bottomVisRef = useRef<any>(null);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    const variant = Math.floor(Math.random() * 30);
    let topVis, bottomVis;

    try {
        topVis = new HolographicVisualizer('hologram-border-top', 'background', 0.5, variant);
        bottomVis = new HolographicVisualizer('hologram-border-bottom', 'background', 0.5, variant);
    } catch(e) {
        console.error("Failed to initialize border visualizers:", e);
        return;
    }

    topVisRef.current = topVis;
    bottomVisRef.current = bottomVis;

    const animate = () => {
      if (topVisRef.current && typeof topVisRef.current.render === 'function') {
        topVisRef.current.render();
      }
      if (bottomVisRef.current && typeof bottomVisRef.current.render === 'function') {
        bottomVisRef.current.render();
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <canvas id="hologram-border-top" className="fixed top-0 left-0 w-full h-16 z-0 pointer-events-none opacity-40 mix-blend-screen"></canvas>
      <div className="relative z-10">{children}</div>
      <canvas id="hologram-border-bottom" className="fixed bottom-0 left-0 w-full h-16 z-0 pointer-events-none opacity-40 mix-blend-screen"></canvas>
    </div>
  );
};