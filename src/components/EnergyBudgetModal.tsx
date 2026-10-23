import React from 'react';
import { SimulationState } from '../types/simulation';
import { X, Calculator, ArrowRight, ExternalLink, ShieldCheck, Flame, Wind, Droplets } from 'lucide-react';

interface EnergyBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SimulationState;
}

export const EnergyBudgetModal: React.FC<EnergyBudgetModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Calculator className="text-sky-400" size={20} />
            <div>
              <h2 className="text-base font-bold text-white">
                Ray Pierrehumbert Glacier Energy Budget (UChicago)
              </h2>
              <p className="text-[11px] text-slate-400">
                Thermodynamic formulation of glacier ablation and atmospheric radiation coupling.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Master Equation Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-center space-y-2">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-sans font-semibold">
              Net Glacier Surface Heat Flux Equation
            </span>
            <div className="text-base md:text-lg font-bold text-sky-300 tracking-wide">
              F_net = (1 - α)·SW↓ + LW↓ - LW↑ + H
            </div>
            <div className="text-xs text-emerald-400 font-bold pt-1">
              Current Net Flux: {state.netEnergyFlux > 0 ? `+${state.netEnergyFlux}` : state.netEnergyFlux} W/m²
            </div>
          </div>

          {/* Interactive Term Breakdown with Live Values */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 font-sans">
              Live Term Values Under Current Settings:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Term 1: Absorbed Shortwave */}
              <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-amber-300 font-mono">(1 - α)·SW↓</span>
                  <span className="font-mono font-bold text-amber-200">{state.absorbedEnergy} W/m²</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Absorbed solar flux: (1 - {state.effectiveAlbedo.toFixed(2)}) × {state.solarIntensity} W/m².
                  {state.microbeadDensity > 0
                    ? ` Microbeads reduced this by ${Math.round((1 - state.effectiveAlbedo) * 100)}%! `
                    : ` High absorption without microbeads.`}
                </p>
              </div>

              {/* Term 2: Downwelling Longwave from Atmosphere (CO2) */}
              <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-rose-400 font-mono">LW↓ (CO₂ Greenhouse)</span>
                  <span className="font-mono font-bold text-rose-300">{state.greenhouseBackRadiation} W/m²</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Atmospheric back-radiation at {state.co2Concentration} ppm CO₂. {state.infraredTrappingPercent}% of upward heat is trapped and returned!
                </p>
              </div>

              {/* Term 3: Upwelling Longwave Emitted by Ice */}
              <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300 font-mono">LW↑ (Ice Emission)</span>
                  <span className="font-mono font-bold text-slate-200">-{state.reradiantInfrared} W/m²</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Stefan-Boltzmann radiation: ε·σ·T⁴ (surface cooling emission into atmosphere).
                </p>
              </div>

              {/* Term 4: Sensible Heat Transfer */}
              <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-indigo-300 font-mono">H (Sensible Heat)</span>
                  <span className="font-mono font-bold text-indigo-200">
                    {state.sensibleHeatFlux > 0 ? `+${state.sensibleHeatFlux}` : state.sensibleHeatFlux} W/m²
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Turbulent air heat exchange: h·(T_air - T_ice) with ambient air at {state.ambientTemp}°C.
                </p>
              </div>
            </div>
          </div>

          {/* Melt Rate Conversion */}
          <div className="bg-sky-950/40 border border-sky-800/50 rounded-xl p-3.5 space-y-1.5">
            <span className="font-semibold text-sky-300 flex items-center gap-1.5 font-sans">
              <Droplets size={14} /> Melt Rate Conversion:
            </span>
            <div className="font-mono text-[11px] text-sky-200">
              Melt Rate = (F_net × 86,400) / (ρ_ice × L_fusion) = {state.meltRate} mm/day
            </div>
            <p className="text-[11px] text-slate-300">
              Where ρ_ice = 917 kg/m³ and L_fusion = 3.34 × 10⁵ J/kg. When F_net &gt; 0 and ice is at 0°C, all surplus energy is converted into phase-change melting.
            </p>
          </div>

          {/* Ice-Albedo Feedback Loop Note */}
          <div className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-3.5 space-y-1">
            <span className="font-bold text-rose-300 font-sans">
              🔗 Connection to the Ice-Albedo Positive Feedback Loop:
            </span>
            <p className="text-[11px] text-slate-300">
              As glaciers melt away, bedrock (α = 0.10) is exposed. Term 1 <code className="text-amber-300">(1 - α)·SW↓</code> jumps from 24% to 90%, causing runaway melting. Microbeads prevent this catastrophic jump by keeping α at 0.88!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Source: UChicago Geosciences / Pierrehumbert Energy Budget</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition cursor-pointer"
          >
            Close Equation View
          </button>
        </div>
      </div>
    </div>
  );
};
