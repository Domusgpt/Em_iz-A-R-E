
import React, { useRef, useEffect, useState } from 'react';

interface AudioVisualizerProps {
  audioUrl: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameId = useRef<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => setIsPlaying(false);
    }

    return () => {
      // Cleanup on component unmount or audioUrl change
      cancelAnimationFrame(animationFrameId.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (audioRef.current) {
        audioRef.current.onended = null;
      }
    };
  }, [audioUrl]);

  const setupAudioContext = () => {
    if (!audioContextRef.current && audioRef.current) {
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
    }
  };

  const togglePlay = () => {
    if (!audioContextRef.current) {
      setupAudioContext();
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        cancelAnimationFrame(animationFrameId.current);
      } else {
        audioContextRef.current?.resume();
        audioRef.current.play();
        setIsPlaying(true);
        renderFrame();
      }
    }
  };
  
  const renderFrame = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    ctx.fillStyle = '#1A1A1A';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const bass = dataArray.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
    const mid = dataArray.slice(50, 100).reduce((a, b) => a + b, 0) / 50;
    const treble = dataArray.slice(100, 150).reduce((a, b) => a + b, 0) / 50;

    ctx.strokeStyle = '#F5F5DC';
    ctx.lineWidth = 0.5 + (bass / 255) * 1.5;

    function drawBranch(x: number, y: number, angle: number, length: number, depth: number) {
      if (depth === 0) return;
      
      const endX = x + length * Math.cos(angle);
      const endY = y + length * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const newLength = length * 0.85;
      const angleChange = 0.4 + (mid / 255) * 0.4;
      
      if (depth > 1) {
        drawBranch(endX, endY, angle - angleChange, newLength, depth - 1);
        drawBranch(endX, endY, angle + angleChange, newLength, depth - 1);
      }
      
      if (depth < 4 && treble > 160) {
        ctx.fillStyle = `rgba(229, 57, 53, ${treble / 255})`;
        ctx.beginPath();
        ctx.arc(endX, endY, (treble / 255) * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawBranch(WIDTH / 2, HEIGHT, -Math.PI / 2, HEIGHT / 10 + (bass / 255) * 30, 8);
    
    animationFrameId.current = requestAnimationFrame(renderFrame);
  };
  
  return (
    <div className="w-full h-full relative">
      <canvas ref={canvasRef} className="w-full h-full" width="640" height="360" />
      <audio ref={audioRef} className="hidden" />
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
};
