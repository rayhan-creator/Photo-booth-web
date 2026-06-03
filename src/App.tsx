import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Navigation, Shield, Camera, Sliders, FileText, Compass, AlertCircle, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';
import { Era, FaceLayer, TimeTravelNarrative, TimeTravelSession } from './types.ts';
import { HISTORICAL_ERAS } from './data.ts';
import CameraCapture from './components/CameraCapture.tsx';
import HistoricalCanvas from './components/HistoricalCanvas.tsx';
import TimeTravelReport from './components/TimeTravelReport.tsx';

export default function App() {
  const [username, setUsername] = useState<string>('Explorer_7');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedEraIndex, setSelectedEraIndex] = useState<number>(0);
  
  // Custom Era state
  const [isCustomEra, setIsCustomEra] = useState<boolean>(false);
  const [customEraPrompt, setCustomEraPrompt] = useState<string>('');
  const [customEraImage, setCustomEraImage] = useState<string | null>(null);
  const [loadingCustomScene, setLoadingCustomScene] = useState<boolean>(false);
  const [customSceneError, setCustomSceneError] = useState<string | null>(null);

  // Layer editing and narrative state
  const [faceLayer, setFaceLayer] = useState<FaceLayer>(HISTORICAL_ERAS[0].defaultFaceProps);
  const [historicalRole, setHistoricalRole] = useState<string>(HISTORICAL_ERAS[0].historicalRole);
  const [facialExpression, setFacialExpression] = useState<string>('captivated awe');
  const [customOutfitNotes, setCustomOutfitNotes] = useState<string>('');

  // Narrative loading
  const [narrative, setNarrative] = useState<TimeTravelNarrative | null>(null);
  const [loadingNarrative, setLoadingNarrative] = useState<boolean>(false);
  const [narrativeError, setNarrativeError] = useState<string | null>(null);
  const [apiChecked, setApiChecked] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);

  // Active Wizard step: 'intro' | 'portrait' | 'era' | 'workshop' | 'chronicle'
  const [activeStep, setActiveStep] = useState<'intro' | 'portrait' | 'era' | 'workshop' | 'chronicle'>('intro');

  // Verify server-side api key existence on mount
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHasApiKey(data.geminiConfigured);
        setApiChecked(true);
      })
      .catch(err => {
        console.error("Health check error:", err);
        setApiChecked(true);
      });
  }, []);

  // Sync default face configs and historical roles when the base Era changes
  useEffect(() => {
    if (!isCustomEra) {
      const era = HISTORICAL_ERAS[selectedEraIndex];
      setFaceLayer(era.defaultFaceProps);
      setHistoricalRole(era.historicalRole);
    } else {
      // Default face setting for custom eras
      setFaceLayer({
        x: 50,
        y: 40,
        scale: 0.85,
        rotation: 0,
        feather: 15,
        brightness: 100,
        contrast: 100,
        sepia: 20,
        grayscale: 0,
        opacity: 100,
        hFlip: false,
        cropShape: 'circle'
      });
      setHistoricalRole('Chrono Traveler');
    }
  }, [selectedEraIndex, isCustomEra]);

  // Automated thematic filters for face composition based on Selected Era
  const handleAutoMatchTheme = () => {
    if (isCustomEra) {
      setFaceLayer(prev => ({
        ...prev,
        sepia: 15,
        brightness: 105,
        contrast: 105,
        grayscale: 0
      }));
      return;
    }
    
    const era = HISTORICAL_ERAS[selectedEraIndex];
    setFaceLayer(prev => ({
      ...prev,
      brightness: era.defaultFaceProps.brightness,
      contrast: era.defaultFaceProps.contrast,
      sepia: era.defaultFaceProps.sepia,
      grayscale: era.defaultFaceProps.grayscale,
      cropShape: era.defaultFaceProps.cropShape
    }));
  };

  // 1. GENERATE CUSTOM BACKGROUND SCENE (Gemini 2.5 Image Generative)
  const handleGenerateCustomScene = async () => {
    if (!customEraPrompt.trim()) return;
    setLoadingCustomScene(true);
    setCustomSceneError(null);

    try {
      const response = await fetch('/api/time-travel/generate-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customEraPrompt })
      });

      const data = await response.json();
      if (response.ok && data.imageUrl) {
        setCustomEraImage(data.imageUrl);
      } else {
        throw new Error(data.error || "Generation malfunction in spatial coordinates.");
      }
    } catch (err: any) {
      console.error(err);
      setCustomSceneError(err.message || "Failed to establish custom spatial coordinates.");
    } finally {
      setLoadingCustomScene(false);
    }
  };

  // 2. DISPATCH TEMPORAL REPORT / GEMINI JOURNAL ENTRY GENERATION
  const handleLaunchDisplacement = async () => {
    setLoadingNarrative(true);
    setNarrativeError(null);
    setActiveStep('chronicle');

    const eraName = isCustomEra ? customEraPrompt : HISTORICAL_ERAS[selectedEraIndex].name;
    const eraYear = isCustomEra ? "Quantum Horizon" : HISTORICAL_ERAS[selectedEraIndex].year;

    try {
      const response = await fetch('/api/time-travel/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          eraName,
          eraYear,
          historicalRole,
          expression: facialExpression,
          customOutfit: customOutfitNotes
        })
      });

      const data = await response.json();
      if (response.ok && data.narrative) {
        setNarrative(data.narrative);
      } else {
        throw new Error(data.error || "Temporal feed signal lost.");
      }
    } catch (err: any) {
      console.error(err);
      setNarrativeError(err.message || "Rift connection failed. Please re-engage temporal engines!");
    } finally {
      setLoadingNarrative(false);
    }
  };

  // 3. CANVAS Snapshot Builder and image merger (HTML5 canvas compositing)
  const handleSaveSnapshot = () => {
    const bgSrc = isCustomEra ? customEraImage : HISTORICAL_ERAS[selectedEraIndex].image;
    if (!bgSrc || !userPhoto) return;

    const canvas = document.createElement('canvas');
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    
    bgImg.onload = () => {
      canvas.width = bgImg.naturalWidth || 1200;
      canvas.height = bgImg.naturalHeight || 800;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw the background scene
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // 2. Draw user overlay face
      const faceImg = new Image();
      faceImg.crossOrigin = "anonymous";
      faceImg.onload = () => {
        ctx.save();

        const fX = (faceLayer.x / 100) * canvas.width;
        const fY = (faceLayer.y / 100) * canvas.height;
        const fSize = canvas.width * 0.16 * faceLayer.scale;
        const fH = faceLayer.cropShape === 'oval' ? fSize * 1.3 : fSize;

        // Transform 2D matrix
        ctx.translate(fX, fY);
        ctx.rotate((faceLayer.rotation * Math.PI) / 180);
        if (faceLayer.hFlip) {
          ctx.scale(-1, 1);
        }

        // Apply visual composition rendering filters
        const filterStr = `brightness(${faceLayer.brightness}%) contrast(${faceLayer.contrast}%) sepia(${faceLayer.sepia}%) grayscale(${faceLayer.grayscale}%)`;
        ctx.filter = filterStr;
        ctx.globalAlpha = faceLayer.opacity / 100;

        // Shape cropping boundaries
        ctx.beginPath();
        if (faceLayer.cropShape === 'oval') {
          ctx.ellipse(0, 0, fSize / 2, fH / 2, 0, 0, Math.PI * 2);
        } else if (faceLayer.cropShape === 'soft-square') {
          const r = 24;
          ctx.roundRect(-fSize / 2, -fH / 2, fSize, fH, r);
        } else if (faceLayer.cropShape === 'vintage-frame') {
          ctx.roundRect(-fSize / 2, -fH / 2, fSize, fH, 14);
        } else { // circle
          ctx.arc(0, 0, fSize / 2, 0, Math.PI * 2);
        }
        ctx.clip();

        // Overlay portrait onto clipped coordinates
        ctx.drawImage(faceImg, -fSize / 2, -fH / 2, fSize, fH);
        ctx.restore();

        // Draw research team timestamp imprint
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "rgba(103, 232, 249, 0.70)";
        ctx.fillText(`CHRONONAUT COMPILATION: ${username.toUpperCase()}`, 40, canvas.height - 60);
        ctx.font = "12px monospace";
        const currentEraTitle = isCustomEra ? customEraPrompt : HISTORICAL_ERAS[selectedEraIndex].name;
        ctx.fillText(`TEMPORAL LOCK: ${currentEraTitle.toUpperCase()} // LAB PORTAL 3000`, 40, canvas.height - 40);

        try {
          const downloadUrl = canvas.toDataURL('image/png');
          const element = document.createElement('a');
          const safeName = username.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          element.download = `temporal_postcard_${safeName}.png`;
          element.href = downloadUrl;
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        } catch (err) {
          console.error("Canvas composite snapshot failed due to origin constraints:", err);
        }
      };
      faceImg.src = userPhoto;
    };
    bgImg.src = bgSrc;
  };

  const handleResetSession = () => {
    setNarrative(null);
    setNarrativeError(null);
    setActiveStep('intro');
  };

  return (
    <div className="min-h-screen bg-[#0c0b0a] text-amber-50 flex flex-col font-sans antialiased overflow-x-hidden select-none" id="applet-viewport">
      
      {/* 1. TOP QUANTUM HEADER STAVE */}
      <header className="border-b border-amber-900/40 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 glass" id="lab-main-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border-2 border-amber-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Clock className="w-5 h-5 text-amber-500 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase opacity-50 font-bold block font-mono text-amber-400">Chronos Engine v4.2</span>
              <h1 className="text-xl font-medium tracking-tight text-amber-100 flex items-center gap-2 font-serif italic temporal-glow">
                The Aethelgard Photo-Booth
                <span className="text-[9px] bg-amber-950/80 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold not-italic">V_4.2_IMMERSIVE</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Status light */}
            <div className="text-[10px] bg-amber-950/20 border border-amber-900/40 px-3 py-1.5 rounded-lg font-mono flex items-center gap-2 glass">
              <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-amber-500 animate-pulse' : 'bg-amber-600'} shrink-0`} />
              <span className="text-amber-200">{hasApiKey ? 'COGNITIVE CORE: OPTIMAL_SYNC' : 'EMBEDDED OFFLINE MODE'}</span>
            </div>
          </div>

        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Step Indicator Train */}
        {activeStep !== 'intro' && (
          <nav className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-amber-900/30" id="temporal-steps-train">
            {[
              { id: 'portrait', label: '1. Portrait Scan', icon: Camera },
              { id: 'era', label: '2. Target Era', icon: Navigation },
              { id: 'workshop', label: '3. Composite Core', icon: Sliders },
              { id: 'chronicle', label: '4. Temporal Logs', icon: FileText }
            ].map((st) => {
              const active = activeStep === st.id;
              const completed = ['portrait', 'era', 'workshop', 'chronicle'].indexOf(activeStep) > ['portrait', 'era', 'workshop', 'chronicle'].indexOf(st.id);
              const SIcon = st.icon;

              return (
                <div key={st.id} className="flex items-center shrink-0">
                  <div
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border text-xs font-semibold select-none transition-all ${
                      active
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                        : completed
                        ? 'bg-amber-950/20 text-emerald-400 border-emerald-500/20'
                        : 'bg-transparent text-amber-100/40 border-transparent'
                    }`}
                  >
                    <SIcon className="w-3.5 h-3.5" />
                    <span className="font-serif italic">{st.label}</span>
                  </div>
                  {st.id !== 'chronicle' && <ChevronRight className="w-4 h-4 text-amber-900/40 mx-1 shrink-0" />}
                </div>
              );
            })}
          </nav>
        )}

        <AnimatePresence mode="wait">
          
          {/* STEP 0: THE INTRO LAUNCHPAD SCREEN */}
          {activeStep === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto text-center flex flex-col items-center gap-8 py-10"
              id="intro-launchpad"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-3xl animate-pulse opacity-20" />
                <div className="w-24 h-24 bg-[#151210] border-2 border-amber-500/60 rounded-full flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] relative">
                  <Clock className="w-10 h-10 animate-spin-slow text-amber-400" />
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 p-1.5 rounded-lg text-black">
                    <Sparkles className="w-4 h-4 text-black stroke-[2.5]" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-wide text-amber-100 font-serif italic temporal-glow">
                  Step Into the Quantum Chronometer
                </h2>
                <p className="text-amber-100/60 text-base max-w-xl mx-auto mt-3 leading-relaxed">
                  Capture your photographic signature, warp into legendary historical eras, and let Gemini compile your anachronism logs & history reports with unmatched fidelity.
                </p>
              </div>

              {/* Username selection */}
              <div className="bg-amber-950/20 border border-amber-900/40 p-5 rounded-2xl w-full max-w-md flex flex-col gap-3.5 text-left glass shadow-xl">
                <label className="text-xs font-bold font-mono text-amber-400/80 uppercase tracking-widest block">
                  IDENTIFY CHRONONAUT SIGNATURE (Your Name)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.slice(0, 24))}
                    className="w-full bg-[#0c0b0a]/90 border border-amber-900/60 rounded-xl px-4 py-3 text-sm text-amber-200 font-semibold focus:outline-none focus:border-amber-500 transition-colors placeholder-amber-900/50 font-mono uppercase"
                    placeholder="ENTER YOUR SURNAME..."
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-amber-500/80 font-mono font-bold">
                    ONLINE
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveStep('portrait')}
                className="px-10 py-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-black font-bold uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 flex items-center gap-2.5 transition-all cursor-pointer group"
                id="btn-engage-quantum"
              >
                <span>Engage Chronometer</span>
                <ChevronRight className="w-5 h-5 stroke-[2.5] text-black group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-[10px] font-mono text-amber-500/40 hover:text-amber-400/60 transition-colors">
                PROJECT PORTAL COMPLIANT // NO TIMELINE SHARDS PRODUCED
              </div>
            </motion.div>
          )}

          {/* STEP 1: PORTRAIT SELECTION */}
          {activeStep === 'portrait' && (
            <motion.div
              key="portrait"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <CameraCapture
                onPhotoSelected={(url) => {
                  setUserPhoto(url);
                  if (url) {
                    setActiveStep('era');
                  }
                }}
                selectedPhoto={userPhoto}
              />
              
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setActiveStep('intro')}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  Back to Hub
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ERA SELECTION */}
          {activeStep === 'era' && (
            <motion.div
              key="era"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
              id="era-selector-deck"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-amber-400">CHRONO-COORDINATES INJECTED</span>
                <h2 className="text-2xl font-medium text-amber-100 flex items-center gap-2 font-serif italic temporal-glow">
                  <Navigation className="w-5 h-5 text-amber-500" />
                  Step 2: Calibrate Destination Coordinate
                </h2>
              </div>

              {/* Grid block of historical eras */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6" id="eras-choices-grid">
                {HISTORICAL_ERAS.map((era, index) => {
                  const isSelected = selectedEraIndex === index && !isCustomEra;
                  return (
                    <button
                      key={era.id}
                      onClick={() => {
                        setSelectedEraIndex(index);
                        setIsCustomEra(false);
                      }}
                      className={`flex flex-col text-left bg-amber-950/20 glass border rounded-2xl overflow-hidden transition-all group cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/30 bg-amber-500/5'
                          : 'border-amber-900/30 hover:border-amber-500/30 hover:bg-amber-950/30'
                      }`}
                    >
                      <div className="h-32 w-full overflow-hidden relative bg-[#0c0b0a]">
                        <img
                          src={era.image}
                          alt={era.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0b0a] via-transparent to-transparent" />
                        <div className="absolute top-2.5 right-2.5 bg-amber-950/90 backdrop-blur-md text-[9px] font-mono font-bold tracking-wider text-amber-400 px-2.5 py-1 rounded border border-amber-900/60">
                          {era.year}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] font-mono text-amber-400/60 block tracking-widest">COORDS LOCK</span>
                          <h3 className="text-base font-semibold text-amber-100 group-hover:text-amber-400 transition-colors font-serif italic mt-0.5">{era.name}</h3>
                          <p className="text-xs text-amber-100/60 mt-1.5 line-clamp-3 leading-relaxed">{era.description}</p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-amber-900/20 text-[10px] text-amber-400/50 font-mono tracking-wide truncate">
                          ROLE: {era.historicalRole.toUpperCase()}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* CUSTOM TIME MACHINE GENERATOR RIFT */}
              <div className="bg-amber-950/20 border border-amber-900/40 p-6 rounded-2xl flex flex-col gap-5 mt-4 relative overflow-hidden glass" id="custom-rift-station">
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-100 font-serif">Create Custom Temporal Destination (Gemini AI Generated Backdrop)</h3>
                    <p className="text-xs text-amber-100/50 mt-0.5">Let Imagen formulate any historical moment, fantasy landmark, or cyber-period backplane.</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={customEraPrompt}
                    onChange={(e) => {
                      setCustomEraPrompt(e.target.value.slice(0, 100));
                      setIsCustomEra(true);
                    }}
                    className="flex-1 bg-[#0c0b0a] border border-amber-900/60 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-amber-200 focus:outline-none placeholder-amber-900/30 transition-colors"
                    placeholder="Enter custom epoch (e.g., '18th century wooden pirate deck at high seas', 'Steampunk Victorian laboratory at midnight')..."
                  />
                  
                  <button
                    onClick={handleGenerateCustomScene}
                    disabled={loadingCustomScene || !customEraPrompt.trim()}
                    className="py-3 px-5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 disabled:bg-amber-950/50 disabled:text-amber-500/20 text-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/10"
                    id="btn-compute-custom-coordinate"
                  >
                    {loadingCustomScene ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Generating Background...
                      </>
                    ) : (
                      <>
                        <Compass className="w-3.5 h-3.5" />
                        Render Custom Rift Background
                      </>
                    )}
                  </button>
                </div>

                {customSceneError && (
                  <div className="bg-red-500/10 text-red-300 border border-red-500/20 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{customSceneError}</span>
                  </div>
                )}

                {customEraImage && (
                  <div className="flex items-center gap-4 bg-[#0c0b0a]/90 border border-amber-900/60 p-3 rounded-xl max-w-md glass">
                    <img
                      src={customEraImage}
                      alt="Custom generated era preview"
                      className="w-16 h-16 rounded-lg object-cover border border-amber-900/40"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 font-serif italic">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Background Generated!
                      </p>
                      <p className="text-[10px] text-amber-100/40 mt-1">Ready for overlay. Click 'Proceed' below to configure.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center mt-6 border-t border-amber-900/30 pt-5">
                <button
                  onClick={() => setActiveStep('portrait')}
                  className="px-4 py-2 bg-amber-950/20 border border-amber-900/40 hover:bg-amber-950/40 text-xs font-semibold rounded-lg text-amber-100/60 hover:text-white transition-all cursor-pointer font-serif italic"
                >
                  Back to Portrait
                </button>
                
                <button
                  onClick={() => setActiveStep('workshop')}
                  disabled={isCustomEra && !customEraImage}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all disabled:bg-amber-950/40 disabled:text-amber-500/20 shadow-md cursor-pointer"
                >
                  Proceed to Workshop
                  <ChevronRight className="w-4 h-4 text-black stroke-[2.5]" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: THE COMPOSITING WORKSPACE */}
          {activeStep === 'workshop' && userPhoto && (
            <motion.div
              key="workshop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-mono font-bold tracking-[0.3em] text-amber-400">PRECISION ALIGNMENT ALGORITHMIC</span>
                <h2 className="text-2xl font-medium text-amber-100 flex items-center gap-2 font-serif italic temporal-glow">
                  <Sliders className="w-5 h-5 text-amber-500" />
                  Step 3: Temporal Workshop
                </h2>
              </div>

              <HistoricalCanvas
                selectedEra={HISTORICAL_ERAS[selectedEraIndex]}
                userPhoto={userPhoto}
                faceLayer={faceLayer}
                onChangeFaceLayer={setFaceLayer}
                onAutoMatchTheme={handleAutoMatchTheme}
              />

              {/* SECURE IDENTITY REGISTRATION FORM (Role and details in era) */}
              <div className="bg-[#0b0a09]/80 border border-amber-900/40 p-6 rounded-2xl flex flex-col gap-5 mt-4 glass" id="role-calibration-deck">
                <div className="border-b border-amber-900/25 pb-3">
                  <h3 className="text-base font-semibold text-amber-100 font-serif italic">4. Align Chrono-Logs Personal Parameters</h3>
                  <p className="text-xs text-amber-100/50 mt-1">Calibrate who you are playing in this epoch. Customized text parameters sharpen Gemini narrations.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Historical Role */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-semibold text-amber-400/80 font-mono uppercase tracking-widest">
                      Temporal Role / Title
                    </label>
                    <input
                      type="text"
                      value={historicalRole}
                      onChange={(e) => setHistoricalRole(e.target.value.slice(0, 30))}
                      className="w-full bg-[#0c0b0a] border border-amber-900/40 rounded-xl px-4 py-3 text-xs text-amber-200 focus:outline-none focus:border-amber-500/60 transition-colors placeholder-amber-900/30 font-mono"
                      placeholder="e.g., Royal Sorcerer, Jazz Saxophonist..."
                    />
                  </div>

                  {/* Facial Expression info */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-semibold text-amber-400/80 font-mono uppercase tracking-widest">
                      My Face Expression in Image
                    </label>
                    <input
                      type="text"
                      value={facialExpression}
                      onChange={(e) => setFacialExpression(e.target.value.slice(0, 30))}
                      className="w-full bg-[#0c0b0a] border border-amber-900/40 rounded-xl px-4 py-3 text-xs text-amber-200 focus:outline-none focus:border-amber-500/60 transition-colors placeholder-amber-900/30 font-mono"
                      placeholder="e.g., smiling wickedly, confused and surprised..."
                    />
                  </div>

                  {/* Custom Outfit description */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-semibold text-amber-400/80 font-mono uppercase tracking-widest">
                      Additional Outfit Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={customOutfitNotes}
                      onChange={(e) => setCustomOutfitNotes(e.target.value.slice(0, 50))}
                      className="w-full bg-[#0c0b0a] border border-amber-900/40 rounded-xl px-4 py-3 text-xs text-amber-200 focus:outline-none focus:border-amber-500/60 transition-colors placeholder-amber-900/30 font-mono"
                      placeholder="e.g., wearing denim jeans, sneakers, digital wristwatch..."
                    />
                  </div>

                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center mt-6 border-t border-amber-900/35 pt-5">
                <button
                  onClick={() => setActiveStep('era')}
                  className="px-4 py-2 bg-amber-950/20 border border-amber-900/40 hover:bg-amber-950/40 text-xs font-semibold rounded-lg text-amber-100/60 hover:text-white transition-all cursor-pointer font-serif italic"
                >
                  Back to Target Era
                </button>
                
                <button
                  onClick={handleLaunchDisplacement}
                  className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-[0.1em] text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/15 hover:-translate-y-0.5 active:translate-y-0"
                  id="btn-engage-chronology"
                >
                  <span>Engage Chrono-Displacement</span>
                  <Compass className="w-4 h-4 animate-spin-slow text-black" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ACTIVE RIFT DISPLACEMENT REPORT (Chronicles) */}
          {activeStep === 'chronicle' && (
            <motion.div
              key="chronicle"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-8"
            >
              
              {/* NARRATIVE LOG LOADING STATUS */}
              {loadingNarrative ? (
                <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 bg-amber-950/20 border border-amber-900/40 rounded-2xl p-8 shadow-2xl text-center glass">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
                    <RefreshCw className="w-12 h-12 text-amber-400 animate-spin" />
                  </div>
                  <h3 className="text-xl font-medium text-amber-100 tracking-wide font-serif italic temporal-glow">COMPUTING QUANTUM DISPLACEMENT REPORT...</h3>
                  <div className="max-w-md text-xs text-amber-100/60 leading-relaxed font-mono flex flex-col gap-2 mt-4 border border-amber-950/60 bg-[#0c0b0a] p-4 rounded-xl">
                    <p className="text-amber-400">Locking local timezone vectors • Done</p>
                    <p className="text-amber-450">Scanning for temporal anachronism footprints • Done</p>
                    <p className="text-yellow-400">Projecting Period-Accurate Chronicles (Gemini AI Core) • Compiling...</p>
                  </div>
                </div>
              ) : narrativeError ? (
                <div className="bg-[#0b0a09]/85 border border-amber-900/40 rounded-2xl p-8 shadow-2xl text-center flex flex-col items-center gap-4 max-w-xl mx-auto py-12 glass">
                  <div className="p-3 bg-red-950/40 text-red-500/80 border border-red-900/65 rounded-xl">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-100 font-serif">Chronicle Alignment Aborted</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {narrativeError}
                  </p>
                  <button
                    onClick={handleLaunchDisplacement}
                    className="mt-2 py-3 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
                  >
                    <RefreshCw className="w-4 h-4 animate-spin-hover" />
                    Re-Align Shards
                  </button>
                </div>
              ) : narrative && (
                <div className="flex flex-col gap-8">
                  {/* Visual compilation postcard view on top */}
                  <div className="bg-zinc-950/80 border border-amber-900/40 p-4 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center max-w-xl mx-auto shadow-2xl glass">
                    <div className="absolute top-6 left-6 z-10 bg-[#0b0a09]/95 text-amber-400 border border-amber-900/40 px-3 py-1 rounded text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5 glass">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                      Composite Postcard View
                    </div>

                    <div className="relative w-full aspect-square md:aspect-video rounded-2xl overflow-hidden shadow-inner bg-[#0c0b0a] border border-amber-900/30">
                      <img
                        src={isCustomEra ? (customEraImage || '') : HISTORICAL_ERAS[selectedEraIndex].image}
                        alt="Background Destination"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />

                      <div
                        style={{
                          left: `${faceLayer.x}%`,
                          top: `${faceLayer.y}%`,
                          transform: `translate(-50%, -50%) rotate(${faceLayer.rotation}deg) scale(${faceLayer.scale})`,
                          opacity: faceLayer.opacity / 100,
                          position: 'absolute',
                          width: '180px',
                          maxWidth: '30%',
                        }}
                        className="pointer-events-none transition-transform duration-75 select-none"
                      >
                        <div
                          style={{
                            borderRadius: faceLayer.cropShape === 'oval' ? '50%' :
                                          faceLayer.cropShape === 'soft-square' ? '24px' :
                                          faceLayer.cropShape === 'vintage-frame' ? '16% 16% 16% 16% / 12% 12% 12% 12%' : '50%',
                            aspectRatio: faceLayer.cropShape === 'oval' ? '3/4' : '1/1',
                            maskImage: `radial-gradient(${faceLayer.cropShape === 'oval' ? 'ellipse' : 'circle'} at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${100 - faceLayer.feather}%, rgba(0,0,0,0) 100%)`,
                            WebkitMaskImage: `radial-gradient(${faceLayer.cropShape === 'oval' ? 'ellipse' : 'circle'} at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${100 - faceLayer.feather}%, rgba(0,0,0,0) 100%)`,
                            filter: `brightness(${faceLayer.brightness}%) contrast(${faceLayer.contrast}%) sepia(${faceLayer.sepia}%) grayscale(${faceLayer.grayscale}%)`,
                            transform: faceLayer.hFlip ? 'scaleX(-1)' : 'none',
                          }}
                          className="w-full h-full object-cover shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden"
                        >
                          <img
                            src={userPhoto || ''}
                            alt="Visual Overlay"
                            className="w-full h-full object-cover scale-[1.05]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <TimeTravelReport
                    narrative={narrative}
                    selectedEra={HISTORICAL_ERAS[selectedEraIndex]}
                    isCustomEra={isCustomEra}
                    customEraName={customEraPrompt}
                    username={username}
                    onReset={handleResetSession}
                    onSaveSnapshot={handleSaveSnapshot}
                  />
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* 3. FOOTER */}
      <footer className="border-t border-amber-900/40 mt-auto py-6 bg-[#0c0b0a] glass" id="lab-main-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-amber-500/60 font-mono">
          <p>© 2026 Chronological Temporal Research Lab. Authorized Personnel Only.</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 font-bold">
              <Shield className="w-3.5 h-3.5 text-amber-500" /> Secure Sandbox Channel
            </span>
            <span>Local Time Vector: {new Date().toISOString().slice(11,19)} UTC</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
