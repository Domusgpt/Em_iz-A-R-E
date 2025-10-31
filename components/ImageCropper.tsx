
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageCropperProps {
  imageSrc: string | null;
  videoStream: MediaStream | null;
  onCropComplete: (croppedImage: string) => void;
  onClose: () => void;
}

const OVAL_ASPECT_RATIO = 3 / 4;

export const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, videoStream, onCropComplete, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);
  
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    const sourceWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.videoWidth;
    const sourceHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.videoHeight;
    
    if (sourceWidth === 0 || sourceHeight === 0) return;

    const scaledWidth = sourceWidth * zoom;
    const scaledHeight = sourceHeight * zoom;
    
    const sx = (canvasWidth - scaledWidth) / 2 + offset.x;
    const sy = (canvasHeight - scaledHeight) / 2 + offset.y;

    ctx.drawImage(source, sx, sy, scaledWidth, scaledHeight);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    ctx.save();
    const ovalWidth = canvasWidth * 0.8;
    const ovalHeight = ovalWidth / OVAL_ASPECT_RATIO;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, ovalWidth / 2, ovalHeight / 2, 0, 0, 2 * Math.PI);
    ctx.clip();
    
    ctx.drawImage(source, sx, sy, scaledWidth, scaledHeight);
    ctx.restore();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, ovalWidth / 2, ovalHeight / 2, 0, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 50, 50, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - ovalWidth / 3, centerY);
    ctx.lineTo(centerX + ovalWidth / 3, centerY);
    ctx.stroke();

    if (videoStream) {
      requestAnimationFrame(draw);
    }

  }, [zoom, offset, videoStream]);
  
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = imageSrc;
      img.onload = () => {
        sourceRef.current = img;
        draw();
      };
    } else if (videoStream) {
      const video = document.createElement('video');
      video.srcObject = videoStream;
      video.autoplay = true;
      video.onloadeddata = () => {
        sourceRef.current = video;
        draw();
      };
    }
  }, [imageSrc, videoStream, draw]);
  
  useEffect(() => {
    draw();
  }, [draw, zoom, offset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setIsDragging(false);
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = zoom - e.deltaY * 0.001;
    setZoom(Math.max(0.1, Math.min(newZoom, 5)));
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;

    const sourceWidth = source instanceof HTMLImageElement ? source.naturalWidth : source.videoWidth;
    const sourceHeight = source instanceof HTMLImageElement ? source.naturalHeight : source.videoHeight;
    
    if (sourceWidth === 0 || sourceHeight === 0) return;

    const tempCanvas = document.createElement('canvas');
    const ovalWidth = canvas.width * 0.8;
    const ovalHeight = ovalWidth / OVAL_ASPECT_RATIO;
    tempCanvas.width = ovalWidth;
    tempCanvas.height = ovalHeight;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.ellipse(ovalWidth / 2, ovalHeight / 2, ovalWidth / 2, ovalHeight / 2, 0, 0, 2 * Math.PI);
    ctx.clip();
    
    const scaledWidth = sourceWidth * zoom;
    const scaledHeight = sourceHeight * zoom;
    
    const sx = (canvas.width - scaledWidth) / 2 + offset.x - (canvas.width - ovalWidth) / 2;
    const sy = (canvas.height - scaledHeight) / 2 + offset.y - (canvas.height - ovalHeight) / 2;
    
    ctx.drawImage(source, sx, sy, scaledWidth, scaledHeight);
    
    onCropComplete(tempCanvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-4 max-w-lg w-full text-center shadow-2xl border border-gray-700">
        <h2 className="text-xl font-bold mb-4 text-cyan-400">Position Your Headshot</h2>
        <canvas
          ref={canvasRef}
          width={400}
          height={500}
          className="cursor-move rounded-md"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
        <div className="flex justify-between items-center mt-4">
            <p className="text-gray-400 text-sm">Use mouse wheel to zoom.</p>
            <div>
                 <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 mr-2">Cancel</button>
                <button onClick={handleCrop} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">Confirm</button>
            </div>
        </div>
      </div>
    </div>
  );
};
