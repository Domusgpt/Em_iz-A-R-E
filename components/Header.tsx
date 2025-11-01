import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { HolographicVisualizer } from '../visualizers/HolographicVisualizer.js';

export const Header: React.FC = () => {
  const hologramRef = useRef<any>(null);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    // Use a try-catch block to handle cases where the canvas might not be found
    try {
      hologramRef.current = new HolographicVisualizer('header-hologram', 'accent', 0.3, Math.floor(Math.random() * 30));
    } catch (error) {
      console.error("Failed to initialize header visualizer:", error);
      return;
    }
    
    const animate = () => {
      if (hologramRef.current && typeof hologramRef.current.render === 'function') {
        hologramRef.current.render();
      }
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <header className="relative text-center py-4 sm:py-6 border-b border-gray-800/50 overflow-hidden">
      <canvas id="header-hologram" className="absolute inset-0 w-full h-full opacity-50 mix-blend-screen"></canvas>
      <div className="relative z-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text" style={{
            backgroundImage: 'linear-gradient(to bottom, #FFFFFF, #BDBDBD)',
            WebkitBackgroundClip: 'text',
        }}>
          Resu-M is R-E
        </h1>
        <p className="text-sm text-cyan-400/70 mt-1 tracking-wider font-mono">
          Your Professional Emissary, Now With More Cosmic Dread
        </p>
      </div>
    </header>
  );
};