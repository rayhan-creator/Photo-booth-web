import React, { useState } from 'react';
import { ShieldAlert, BookOpen, Clock, AlertTriangle, HelpCircle, Download, Check, Sparkles, RefreshCw } from 'lucide-react';
import { TimeTravelNarrative, Era } from '../types.ts';

interface TimeTravelReportProps {
  narrative: TimeTravelNarrative;
  selectedEra: Era;
  isCustomEra: boolean;
  customEraName?: string;
  username: string;
  onReset: () => void;
  onSaveSnapshot: () => void;
}

export default function TimeTravelReport({
  narrative,
  selectedEra,
  isCustomEra,
  customEraName,
  username,
  onReset,
  onSaveSnapshot
}: TimeTravelReportProps) {
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const eraName = isCustomEra ? (customEraName || "Custom Rift Era") : selectedEra.name;
  const eraYear = isCustomEra ? "Custom Age" : selectedEra.year;

  const handleDownload = () => {
    setDownloaded(true);
    onSaveSnapshot();
    setTimeout(() => {
      setDownloaded(false);
    }, 2500);
  };

  // Helper code to select danger category based on risk score
  const getRiskDetails = (score: number) => {
    if (score < 25) {
      return {
        label: 'Low Risk — Safe Scout',
        color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/20',
        barColor: 'bg-green-500'
      };
    } else if (score < 55) {
      return {
        label: 'Moderate Risk — Temporal Footprint Detected',
        color: 'text-yellow-400',
        bg: 'bg-yellow-500/10 border-yellow-500/20',
        barColor: 'bg-yellow-500'
      };
    } else if (score < 80) {
      return {
        label: 'High Risk — Danger of Local Infiltration',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10 border-orange-500/20',
        barColor: 'bg-orange-500'
      };
    } else {
      return {
        label: 'TEMPORAL CODE RED — Butterfly Effect Imminent!',
        color: 'text-red-400',
        bg: 'bg-red-500/10 border-red-500/20',
        barColor: 'bg-red-500'
      };
    }
  };

  const risk = getRiskDetails(narrative.butterflyEffectRisk);

  return (
    <div className="flex flex-col gap-6" id="time-travel-composite-report">
      
      {/* 1. Header Hero Segment */}
      <div className="bg-[#0b0a09]/85 border border-amber-900/40 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div>
          <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-500/20 uppercase font-bold">
            SECURE AUDIT CLASSIFIED // LEVEL 4
          </span>
          <h2 className="text-3xl font-medium tracking-wide text-amber-100 mt-3 flex items-center gap-2 font-serif italic temporal-glow">
            <Clock className="w-6 h-6 text-amber-500" />
            Active Displacement Record: {username || "Chrononaut"}
          </h2>
          <p className="text-xs text-amber-105/60 mt-1 leading-relaxed">
            Temporal rift audited successfully. Current location coordinates locked on: <span className="text-amber-400 font-semibold font-serif italic">{eraName} ({eraYear})</span>.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto mt-2 md:mt-0">
          <button
            onClick={handleDownload}
            className="flex-1 md:flex-none py-3 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            id="btn-download-passport"
          >
            {downloaded ? (
              <>
                <Check className="w-4 h-4 text-black stroke-[2.5]" />
                Postcard Saved!
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-black stroke-[2.5]" />
                Download Postcard
              </>
            )}
          </button>
          
          <button
            onClick={onReset}
            className="flex-1 md:flex-none py-3 px-6 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-900/40 text-amber-200 hover:text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer text-xs font-serif italic"
            id="btn-re-enter"
          >
            <RefreshCw className="w-4 h-4 text-amber-500" />
            Travel Again
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: THE GOLDEN ENVELOPE JOURNAL ENTRY (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Journal Entry */}
          <div className="bg-[#0b0a09]/80 border border-amber-900/45 rounded-2xl p-6 relative shadow-xl overflow-hidden flex flex-col gap-4 glass">
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
            <div className="absolute top-4 right-4 text-[10px] font-semibold text-amber-500/50 font-mono tracking-widest uppercase font-bold">
              TEMPORAL DIARY
            </div>

            <h3 className="text-lg font-medium text-amber-300 flex items-center gap-2 font-serif italic">
              <BookOpen className="w-4.5 h-4.5 text-amber-400" />
              Chronicle of {username}
            </h3>

            <div className="text-amber-100/90 font-serif leading-relaxed text-sm italic whitespace-pre-line border-l-2 border-amber-500/20 pl-4 py-1" id="narrative-journal-entry">
              "{narrative.journalEntry || "Timeline static registered. Standard travel sequence initiated without journal errors."}"
            </div>

            <p className="text-[10px] font-mono text-amber-500/60 mt-2">
              RECORDED ON CHRONO-PLATE // SECURE SIGNATURE SYST_3000
            </p>
          </div>

          {/* Real Historical Context */}
          <div className="bg-[#0b0a09]/80 border border-amber-900/40 rounded-2xl p-6 shadow-md flex flex-col gap-3 glass">
            <h4 className="text-xs font-semibold text-amber-400/80 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Authentic Historical Records
            </h4>
            <p className="text-xs text-amber-100/70 leading-relaxed font-mono" id="narrative-history-facts">
              {narrative.historicalContext}
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: TEMPORAL ANOMALY SCANNING STATUS (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Anachronism Scan HUD */}
          <div className="bg-[#0b0a09]/80 border border-amber-900/40 rounded-2xl p-6 shadow-xl flex flex-col gap-4 glass animate-pulse-slow">
            <h3 className="text-xs font-semibold text-amber-400/80 font-mono tracking-wider uppercase flex items-center justify-between">
              <span>Anachronism Scan Report</span>
              <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-500/20 px-2.5 py-0.5 rounded animate-pulse font-mono font-bold uppercase">ACTIVE SCAN</span>
            </h3>

            <div className="p-4 bg-[#0c0b0a] border border-amber-900/30 rounded-xl relative overflow-hidden">
              <p className="text-xs text-amber-300 leading-relaxed font-mono" id="narrative-anachronism">
                {narrative.anachronismScan}
              </p>
            </div>
          </div>

          {/* Quantum Butterfly Risk Needle Deck */}
          <div className="bg-[#0b0a09]/80 border border-amber-900/40 rounded-2xl p-6 shadow-xl flex flex-col gap-4 glass">
            <h3 className="text-xs font-semibold text-amber-400/80 font-mono tracking-wider uppercase flex items-center gap-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Butterfly Effect Hazard Matrix
            </h3>

            <div className={`p-4 border rounded-xl flex items-start gap-3 transition-colors ${risk.bg} glass`}>
              <AlertTriangle className={`w-5 h-5 shrink-0 ${risk.color}`} />
              <div>
                <p className={`text-sm font-semibold ${risk.color}`}>{risk.label}</p>
                <p className="text-xs text-amber-100/50 mt-1">
                  Chronological deviation index. Deviation exceeding 80% yields extreme timeline splitting risk!
                </p>
              </div>
            </div>

            {/* Risk Slider Bar gauge */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-amber-100/40">Chronological Deviation</span>
                <span className={`font-semibold ${risk.color}`}>{narrative.butterflyEffectRisk}% Discordance</span>
              </div>
              
              <div className="h-2 w-full bg-[#0c0b0a] rounded-full overflow-hidden border border-amber-900/20">
                <div
                  style={{ width: `${narrative.butterflyEffectRisk}%` }}
                  className={`h-full ${risk.barColor} transition-all duration-1000 ease-out`}
                />
              </div>
            </div>

            {/* Warning bullet directive */}
            <div className="bg-[#0c0b0a]/75 p-3 rounded-xl border border-amber-900/30 mt-2">
              <p className="text-[10px] font-mono text-amber-400 tracking-wider uppercase flex items-center gap-1.5 mb-1.5 font-bold">
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                TIMELINE GUARDIAN DIRECTIVE:
              </p>
              <p className="text-xs text-amber-105/70 italic font-serif" id="narrative-warning">
                {narrative.butterflyEffectWarning}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
