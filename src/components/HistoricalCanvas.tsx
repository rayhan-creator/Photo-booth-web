import React, { useRef, useState, useEffect } from 'react';
import { Move, RotateCw, ZoomIn, Eye, Sliders, Sparkles, Wand2, ArrowLeftRight } from 'lucide-react';
import { Era, FaceLayer } from '../types.ts';

interface HistoricalCanvasProps {
  selectedEra: Era;
  userPhoto: string;
  faceLayer: FaceLayer;
  onChangeFaceLayer: (layer: FaceLayer) => void;
  onAutoMatchTheme: () => void;
}

export default function HistoricalCanvas({
  selectedEra,
  userPhoto,
  faceLayer,
  onChangeFaceLayer,
  onAutoMatchTheme
}: HistoricalCanvasProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Mouse or touch drag events to move the face around the canvas
  const handleStartDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updateFacePosition(e);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    updateFacePosition(e);
  };

  const handleEndDrag = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleEndDrag);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleEndDrag);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleEndDrag);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleEndDrag);
    };
  }, [isDragging, faceLayer]);

  const updateFacePosition = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    const relativeY = ((clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.min(Math.max(relativeX, 0), 100);
    const clampedY = Math.min(Math.max(relativeY, 0), 100);

    onChangeFaceLayer({
      ...faceLayer,
      x: clampedX,
      y: clampedY
    });
  };

  // Helper styles for crop shapes & radial feather blending masks
  const getMaskStyle = () => {
    const featherPct = faceLayer.feather;
    const innerRadius = 100 - featherPct;
    
    let maskGradient = '';
    let borderRadius = '50%';
    let aspectRatio = '1/1';

    switch (faceLayer.cropShape) {
      case 'oval':
        borderRadius = '50%';
        aspectRatio = '3/4';
        maskGradient = `radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${innerRadius}%, rgba(0,0,0,0) 100%)`;
        break;
      case 'soft-square':
        borderRadius = '24px';
        maskGradient = `radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${innerRadius}%, rgba(0,0,0,0) 100%)`;
        break;
      case 'vintage-frame':
        borderRadius = '16% 16% 16% 16% / 12% 12% 12% 12%';
        maskGradient = `radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${innerRadius - 5}%, rgba(0,0,0,0) 100%)`;
        break;
      case 'circle':
      default:
        borderRadius = '50%';
        maskGradient = `radial-gradient(circle at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${innerRadius}%, rgba(0,0,0,0) 100%)`;
        break;
    }

    return {
      borderRadius,
      aspectRatio,
      maskImage: maskGradient,
      WebkitMaskImage: maskGradient,
    };
  };

  const getFaceFilters = () => {
    return [
      `brightness(${faceLayer.brightness}%)`,
      `contrast(${faceLayer.contrast}%)`,
      `sepia(${faceLayer.sepia}%)`,
      `grayscale(${faceLayer.grayscale}%)`
    ].join(' ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="historical-canvas-workshop">
      
      {/* LEFT COLUMN: INTERACTIVE CANVAS DISPLAY (7 cols) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-zinc-950/80 border border-amber-900/40 p-2.5 rounded-2xl relative overflow-hidden shadow-2xl glass">
          <div className="absolute top-4 left-4 z-10 bg-[#0b0a09]/95 text-amber-400 border border-amber-900/50 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-widest uppercase flex items-center gap-1.5 shadow-md glass">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            Quantum Overlay Live
          </div>

          <div
            ref={canvasRef}
            onMouseDown={handleStartDrag}
            onTouchStart={handleStartDrag}
            className="relative w-full aspect-square md:aspect-video rounded-xl overflow-hidden cursor-crosshair select-none bg-[#0c0b0a] shadow-inner viewfinder-crosshair"
            id="viewport-canvas"
          >
            {/* Background Era Scene */}
            <img
              src={selectedEra.image}
              alt={selectedEra.name}
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />

            {/* Draggable User Portrait */}
            <div
              style={{
                left: `${faceLayer.x}%`,
                top: `${faceLayer.y}%`,
                transform: `translate(-50%, -50%) rotate(${faceLayer.rotation}deg) scale(${faceLayer.scale})`,
                opacity: faceLayer.opacity / 100,
                position: 'absolute',
                pointerEvents: 'none', // Allow dragging clicking directly through to the background
                width: '180px',
                maxWidth: '30%',
              }}
              className="transition-transform duration-75 select-none"
            >
              <div
                style={{
                  ...getMaskStyle(),
                  filter: getFaceFilters(),
                  transform: faceLayer.hFlip ? 'scaleX(-1)' : 'none',
                }}
                className="w-full h-full object-cover border border-amber-500/10 shadow-[0_0_15px_rgba(0,0,0,0.4)] overflow-hidden"
              >
                <img
                  src={userPhoto}
                  alt="Avatar Face Overlay"
                  className="w-full h-full object-cover scale-[1.05]"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Center point drag indicator */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-dashed border-amber-400 bg-black/20 shadow-lg flex items-center justify-center animate-ping opacity-25 pointer-events-none" />
            </div>
          </div>
        </div>

        <p className="text-xs text-amber-550 text-center flex items-center justify-center gap-1.5 font-mono">
          <Move className="w-3.5 h-3.5 text-amber-500" />
          Click or touch-drag anywhere on the viewport canvas to reposition your face layer.
        </p>
      </div>

      {/* RIGHT COLUMN: REFINED PRECISION PANEL DECK (5 cols) */}
      <div className="lg:col-span-5 bg-[#0b0a09]/80 backdrop-blur-xl border border-amber-900/45 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 glass" id="parameters-panel">
        <div className="flex items-center justify-between border-b border-amber-900/20 pb-4">
          <h3 className="text-base font-semibold text-amber-100 flex items-center gap-2 font-serif italic temporal-glow">
            <Sliders className="w-4.5 h-4.5 text-amber-500" />
            Chrono-Fitter Panel
          </h3>
          <button
            onClick={onAutoMatchTheme}
            className="text-xs text-amber-300 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-semibold cursor-pointer"
            title="Auto adjust brightness/sepia/grayscale to blend perfectly with this Era's lighting!"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            Auto Era Filter
          </button>
        </div>

        {/* 1. Geometric Shape Crop Matrix */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-amber-400/80 font-mono tracking-wider uppercase">
            1. Face Crop Matrix
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['circle', 'oval', 'soft-square', 'vintage-frame'] as const).map((shape) => (
              <button
                key={shape}
                onClick={() => onChangeFaceLayer({ ...faceLayer, cropShape: shape })}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold tracking-tight border transition-all text-center flex flex-col items-center gap-1.5 cursor-pointer ${
                  faceLayer.cropShape === shape
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-inner'
                    : 'bg-[#0c0b0a]/80 text-amber-100/50 border-amber-900/20 hover:text-amber-100 hover:border-amber-500/30'
                }`}
              >
                {/* Micro Shape Indicator */}
                <div className={`w-5 h-5 border-2 ${
                  shape === 'circle' ? 'rounded-full' :
                  shape === 'oval' ? 'rounded-full scale-x-75 scale-y-100' :
                  shape === 'soft-square' ? 'rounded-md' :
                  'rounded-lg rotate-45 scale-75'
                } border-current`} />
                <span className="capitalize text-[9px] font-medium font-serif italic">{shape.replace('-', ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Sliders Segment */}
        <div className="flex flex-col gap-4">
          <label className="text-xs font-semibold text-amber-400/80 font-mono tracking-wider uppercase">
            2. Scale, Angle & Rotation
          </label>

          {/* Scale */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-100/60 flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5" /> Scale</span>
              <span className="font-mono text-amber-400 font-medium">x{faceLayer.scale.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2.5"
              step="0.05"
              value={faceLayer.scale}
              onChange={(e) => onChangeFaceLayer({ ...faceLayer, scale: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#0c0b0a] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Rotation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-100/60 flex items-center gap-1"><RotateCw className="w-3.5 h-3.5" /> Rotation</span>
              <span className="font-mono text-amber-400 font-medium">{faceLayer.rotation}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="2"
              value={faceLayer.rotation}
              onChange={(e) => onChangeFaceLayer({ ...faceLayer, rotation: parseInt(e.target.value) })}
              className="w-full h-1 bg-[#0c0b0a] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Flip Horizontal */}
          <div className="flex items-center justify-between bg-[#0c0b0a]/60 p-3 rounded-xl border border-amber-900/40 glass">
            <div>
              <p className="text-xs font-semibold text-amber-100 font-serif italic">Mirror Portrait</p>
              <p className="text-[10px] text-amber-100/40 mt-0.5">Flip face lighting or profile projection</p>
            </div>
            <button
              onClick={() => onChangeFaceLayer({ ...faceLayer, hFlip: !faceLayer.hFlip })}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                faceLayer.hFlip
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-amber-950/20 border-amber-900/30 text-amber-150/65 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3. Blending and Gradient feather */}
        <div className="flex flex-col gap-4 border-t border-amber-900/20 pt-4">
          <label className="text-xs font-semibold text-amber-400/80 font-mono tracking-wider uppercase">
            3. Feathering & Photographic Filters
          </label>

          {/* Edges Blurring Softness */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-100/60">Radial Edge Softness</span>
              <span className="font-mono text-amber-400 font-medium">{faceLayer.feather}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={faceLayer.feather}
              onChange={(e) => onChangeFaceLayer({ ...faceLayer, feather: parseInt(e.target.value) })}
              className="w-full h-1 bg-[#0c0b0a] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Brightness */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-100/60">Layer Brightness</span>
              <span className="font-mono text-amber-400 font-medium">{faceLayer.brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={faceLayer.brightness}
              onChange={(e) => onChangeFaceLayer({ ...faceLayer, brightness: parseInt(e.target.value) })}
              className="w-full h-1 bg-[#0c0b0a] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Sepia filter */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-100/60">Sepia Vibe Tonal</span>
              <span className="font-mono text-amber-400 font-medium">{faceLayer.sepia}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={faceLayer.sepia}
              onChange={(e) => onChangeFaceLayer({ ...faceLayer, sepia: parseInt(e.target.value) })}
              className="w-full h-1 bg-[#0c0b0a] rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Grayscale filter */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-amber-100/60">Grayscale Age Aging</span>
              <span className="font-mono text-amber-400 font-medium">{faceLayer.grayscale}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={faceLayer.grayscale}
              onChange={(e) => onChangeFaceLayer({ ...faceLayer, grayscale: parseInt(e.target.value) })}
              className="w-full h-1 bg-[#0c0b0a] rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
