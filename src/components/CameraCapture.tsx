import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, Sparkles, User, RefreshCw, AlertCircle } from 'lucide-react';
import { SAMPLE_FACES, SampleFace } from '../data.ts';

interface CameraCaptureProps {
  onPhotoSelected: (photoUrl: string) => void;
  selectedPhoto: string | null;
}

export default function CameraCapture({ onPhotoSelected, selectedPhoto }: CameraCaptureProps) {
  const [mode, setMode] = useState<'camera' | 'upload' | 'samples'>('samples');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera when mode changes to 'camera'
  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [mode]);

  const startCamera = async () => {
    setCameraError(null);
    setIsCapturing(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Your browser or sandbox environment does not support camera access.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: "user" },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play interrupted:", e));
      }
    } catch (err: any) {
      console.error("Camera capture error:", err);
      let errMsg = "Camera permission denied or not available. Please try uploading an image or selecting a template!";
      if (err.name === 'NotAllowedError') {
        errMsg = "Camera access was denied. Please allow camera permissions in your browser bar, or upload a photo.";
      } else if (err.name === 'NotFoundError') {
        errMsg = "No camera device detected on this system.";
      }
      setCameraError(errMsg);
      setMode('samples'); // fallback to samples
    } finally {
      setIsCapturing(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 480;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the current video frame
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1); // Mirror effect for standard webcam experience
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onPhotoSelected(dataUrl);
      }
    }
  };

  // Drag and drop photo upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onPhotoSelected(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-[#0b0a09]/80 backdrop-blur-xl border border-amber-900/45 rounded-2xl p-6 shadow-2xl glass" id="camera-capture-box">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] font-mono text-amber-500 uppercase block font-bold">Chronology Phase 1</span>
          <h2 className="text-2xl font-medium tracking-wide text-amber-100 flex items-center gap-2 font-serif italic mt-0.5 temporal-glow">
            <Sparkles className="w-5 h-5 text-amber-500 stroke-[1.5]" />
            Step 1: Project Your Avatar
          </h2>
          <p className="text-xs text-amber-100/60 mt-1 leading-relaxed">
            Capture a real-time portrait, upload a photo, or choose a pre-loaded chrononaut.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-[#0c0b0a]/90 p-1 border border-amber-900/40 rounded-lg w-full md:w-auto glass" id="capture-mode-tabs">
          <button
            onClick={() => setMode('samples')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all font-serif italic cursor-pointer ${
              mode === 'samples'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-amber-150/40 hover:text-amber-250 border border-transparent'
            }`}
            id="tab-samples"
          >
            <User className="w-3.5 h-3.5" />
            Presets
          </button>
          <button
            onClick={() => setMode('camera')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all font-serif italic cursor-pointer ${
              mode === 'camera'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-amber-150/40 hover:text-amber-250 border border-transparent'
            }`}
            id="tab-camera"
          >
            <Camera className="w-3.5 h-3.5" />
            Live Booth
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all font-serif italic cursor-pointer ${
              mode === 'upload'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-amber-150/40 hover:text-amber-250 border border-transparent'
            }`}
            id="tab-upload"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>
      </div>

      {cameraError && (
        <div className="mb-4 bg-amber-500/15 text-amber-200 border border-amber-500/30 px-4 py-3 rounded-xl flex items-start gap-2.5 text-xs glass">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 text-amber-500" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Mode Containers */}
      <div className="relative aspect-square md:aspect-[16/9] w-full bg-[#0c0b0a]/95 rounded-xl border border-amber-900/35 overflow-hidden flex items-center justify-center">
        
        {/* SNAPSHOT PREVIEW OVERLAY (if an image is selected) */}
        {selectedPhoto && mode !== 'camera' && (
          <div className="absolute inset-0 z-10 bg-zinc-950/50 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="relative w-48 h-48 rounded-full border-4 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] overflow-hidden bg-[#0c0b0a] group">
              <img
                src={selectedPhoto}
                alt="Selected Portrait"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <p className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 cursor-pointer" onClick={() => onPhotoSelected("")}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Avatar
                </p>
              </div>
            </div>
            <p className="text-base font-medium text-amber-100 mt-4 flex items-center gap-2 font-serif italic">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
              Quantum Signature Confirmed
            </p>
            <p className="text-xs text-amber-100/50 mt-1">Ready for chrono-insertion. Select an era below!</p>
          </div>
        )}

        {/* 1. WEBCAM INTERFACE */}
        {mode === 'camera' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {isCapturing ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                <p className="text-xs font-mono text-amber-400">CONNECTING TEMPORAL LENS...</p>
              </div>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-between">
                <div className="relative flex-1 w-full max-w-sm rounded-xl border border-amber-900/30 overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-amber-500/20 pointer-events-none rounded-xl m-4 flex items-center justify-center">
                    <div className="w-48 h-48 border border-dashed border-amber-500/40 rounded-full flex items-center justify-center viewfinder-crosshair">
                      <p className="text-[9px] font-mono tracking-widest text-amber-450/75 mb-2">ALIGN FACE</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={captureSnapshot}
                  className="mt-4 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-amber-500/10 flex items-center gap-2 transition-all self-center cursor-pointer"
                  id="btn-take-photo"
                >
                  <Camera className="w-4.5 h-4.5 stroke-[2.5]" />
                  Capture Signature
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. FILE UPLOAD INTERFACE */}
        {mode === 'upload' && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`w-full h-full flex flex-col items-center justify-center p-6 border-2 border-dashed transition-all cursor-pointer ${
              dragActive ? 'border-amber-400 bg-amber-500/5' : 'border-amber-900/20 hover:border-amber-500/30 hover:bg-amber-950/20'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="p-4 bg-[#0c0b0a] border border-amber-900/40 rounded-xl mb-4 group-hover:scale-110 transition-transform glass">
              <Upload className="w-8 h-8 text-amber-500/80" />
            </div>
            <p className="text-sm text-amber-100/80 font-semibold text-center font-serif italic">
              Drag your portrait file here, or click to browse
            </p>
            <p className="text-xs text-amber-100/40 mt-2 text-center font-mono">
              Supports JPEG, PNG, or WEBP. Square frontal photos work best.
            </p>
          </div>
        )}

        {/* 3. SAMPLE EXPLORERS PORTRAITS */}
        {mode === 'samples' && !selectedPhoto && (
          <div className="w-full h-full p-6 flex flex-col justify-between">
            <div className="text-center">
              <p className="text-sm font-semibold text-amber-100/80 font-serif italic">Choose a Pre-Engineered Chrononaut Preset</p>
              <p className="text-xs text-amber-100/40 mt-1 font-mono">Excellent for quick testing or if system camera access is protected.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-2" id="sample-faces-grid">
              {SAMPLE_FACES.map((face) => (
                <button
                  key={face.id}
                  onClick={() => onPhotoSelected(face.image)}
                  className="flex flex-col items-center bg-amber-950/10 hover:bg-amber-950/30 border border-amber-900/30 hover:border-amber-500/40 rounded-xl p-3 transition-all text-center group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full border border-amber-900/40 group-hover:border-amber-500 overflow-hidden mb-2 shadow-inner">
                    <img
                      src={face.image}
                      alt={face.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-xs font-semibold text-amber-200 group-hover:text-amber-400 truncate w-full font-serif italic">{face.name}</p>
                  <p className="text-[10px] text-amber-100/40 mt-0.5 line-clamp-1 font-mono">{face.desc}</p>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-amber-500/40 font-mono text-center">QUANTUM AVATAR ARCHIVES // ONLINE</p>
          </div>
        )}

      </div>
    </div>
  );
}
