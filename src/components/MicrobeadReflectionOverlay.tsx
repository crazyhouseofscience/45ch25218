import React from 'react';
import { Sparkles, Sun, ShieldCheck, ArrowUpRight, Zap } from 'lucide-react';

interface MicrobeadReflectionOverlayProps {
  microbeadDensity: number;
  reflectedSolar: number;
  absorbedEnergy: number;
  onToggleMicrobeads: (density: number) => void;
}

export const MicrobeadReflectionOverlay: React.FC<MicrobeadReflectionOverlayProps> = ({
  microbeadDensity,
  reflectedSolar,
  absorbedEnergy,
  onToggleMicrobeads,
}) => {
  const isActive = microbeadDensity > 0;

  return (
    <div className="absolute top-20 left-4 z-20 max-w-sm bg-slate-900/95 backdrop-blur-md border border-sky-500/50 rounded-2xl p-4 shadow-2xl text-slate-100 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shadow-sm ${
            isActive ? 'bg-sky-500/20 border-sky-400/50 text-sky-300' : 'bg-slate-800 border-slate-700 text-slate-400'
          }`}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Microbead Reflection Overlay</span>
              {isActive && (
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-sky-500/20 text-sky-300 border border-sky-400/40 font-mono font-bold">
                  {microbeadDensity}% ACTIVE
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">
              {isActive ? 'Silica microspheres bouncing sunlight to space' : 'Untreated glacier (absorbing heat)'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onToggleMicrobeads(isActive ? 0 : 100)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition shadow-md cursor-pointer ${
            isActive
              ? 'bg-rose-600 hover:bg-rose-500 text-white'
              : 'bg-sky-600 hover:bg-sky-500 text-white'
          }`}
        >
          {isActive ? 'Disable Shield' : 'Apply Shield (100%)'}
        </button>
      </div>

      {/* SVG Animated Ray Diagram */}
      <div className="relative h-28 w-full bg-slate-950/90 rounded-xl overflow-hidden border border-slate-800 p-2 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 110">
          <defs>
            <linearGradient id="sunbeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="100%" stopColor="#facc15" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="reflectGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Glacier surface baseline */}
          <path d="M 0 85 Q 160 70 320 85" fill="none" stroke={isActive ? '#38bdf8' : '#e2e8f0'} strokeWidth="3" opacity="0.6" />

          {/* Incoming Sunlight Rays (Animated dasharray) */}
          <g filter="url(#glow)">
            <line x1="40" y1="10" x2="120" y2="80" stroke="url(#sunbeamGrad)" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
            <line x1="90" y1="10" x2="170" y2="80" stroke="url(#sunbeamGrad)" strokeWidth="3" strokeLinecap="round" />
            <line x1="140" y1="10" x2="220" y2="80" stroke="url(#sunbeamGrad)" strokeWidth="3" strokeLinecap="round" className="animate-pulse" />
          </g>

          {/* If Active: Reflected Rays shooting UP into space! */}
          {isActive ? (
            <g filter="url(#glow)">
              <line x1="120" y1="80" x2="200" y2="15" stroke="url(#reflectGrad)" strokeWidth="3.5" strokeLinecap="round" className="animate-pulse" />
              <line x1="170" y1="80" x2="250" y2="15" stroke="url(#reflectGrad)" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="220" y1="80" x2="300" y2="15" stroke="url(#reflectGrad)" strokeWidth="3.5" strokeLinecap="round" className="animate-pulse" />
              
              {/* Sparkle nodes at reflection points */}
              <circle cx="120" cy="80" r="4" fill="#ffffff" />
              <circle cx="170" cy="80" r="4" fill="#ffffff" />
              <circle cx="220" cy="80" r="4" fill="#ffffff" />
            </g>
          ) : (
            /* If Inactive: Absorption & Red Heat Waves */
            <g filter="url(#glow)">
              <circle cx="120" cy="83" r="5" fill="#ea580c" className="animate-ping" />
              <circle cx="170" cy="83" r="5" fill="#ea580c" className="animate-ping" />
              <path d="M 120 75 Q 130 50 140 30" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 2" />
              <path d="M 170 75 Q 180 50 190 30" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="4 2" />
            </g>
          )}
        </svg>

        {/* Overlay Badge Status */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-700/80 text-[10px]">
          {isActive ? (
            <div className="flex items-center gap-1.5 text-sky-300 font-semibold">
              <ShieldCheck size={13} className="text-sky-400" />
              <span>Reflecting {reflectedSolar} W/m² (Escapes CO₂)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
              <Zap size={13} className="text-rose-400" />
              <span>Absorbing {absorbedEnergy} W/m² (Converts to Heat)</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 text-[10px] text-slate-400 leading-tight">
        {isActive ? (
          <span className="text-sky-200">
            ✨ Silica microspheres create total internal reflection. Sunlight bounces away before turning into thermal infrared heat!
          </span>
        ) : (
          <span className="text-rose-200">
            ⚠️ Without microbeads, sunlight is absorbed by the ice lattice, driving up temperature and re-radiant infrared ($LW\uparrow$).
          </span>
        )}
      </div>
    </div>
  );
};
