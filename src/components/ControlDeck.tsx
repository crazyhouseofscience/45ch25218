import React, { useState } from 'react';
import { SimulationState, IceCondition, MicrobeadMaterialType } from '../types/simulation';
import { Tooltip } from './Tooltip';
import {
  Sun,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Layers,
  Thermometer,
  Wind,
  Lightbulb,
  Info,
  Flame,
  Zap,
  Check
} from 'lucide-react';

interface ControlDeckProps {
  state: SimulationState;
  onChangeSolar: (val: number) => void;
  onChangeMicrobeads: (val: number) => void;
  onChangeMaterial?: (mat: MicrobeadMaterialType) => void;
  onChangeCustomSpecificHeat?: (val: number) => void;
  onFireHeatPulse?: (joules: number) => void;
  onOpenSpecificHeatModal?: () => void;
  onChangeCO2: (val: number) => void;
  onChangeIceCondition: (val: IceCondition) => void;
  onChangeAmbientTemp: (val: number) => void;
  onChangeIceThickness: (val: number) => void;
  onTogglePlay: () => void;
  onChangeSpeed: (val: number) => void;
  onResetIce: () => void;
  onResetAll?: () => void;
  onToggleIncoming: () => void;
  onToggleReflected: () => void;
  onToggleReradiant: () => void;
  onToggleCO2Molecules: () => void;
  onToggleGreenhouseTrapping: () => void;
  onApplyPreset: (presetKey: string) => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  state,
  onChangeSolar,
  onChangeMicrobeads,
  onChangeMaterial,
  onChangeCustomSpecificHeat,
  onFireHeatPulse,
  onOpenSpecificHeatModal,
  onChangeCO2,
  onChangeIceCondition,
  onChangeAmbientTemp,
  onChangeIceThickness,
  onTogglePlay,
  onChangeSpeed,
  onResetIce,
  onResetAll,
  onToggleIncoming,
  onToggleReflected,
  onToggleReradiant,
  onToggleCO2Molecules,
  onToggleGreenhouseTrapping,
  onApplyPreset,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'albedo_beads' | 'solar_co2' | 'specific_heat' | 'scenarios'>('all');

  return (
    <div className="w-full lg:w-[420px] bg-slate-900 border-l border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto max-h-screen text-slate-100">
      {/* Title & Chromebook Optimized Header */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="text-sky-400 shrink-0" size={20} />
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
            Climate Parameters & Controls
          </h2>
        </div>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Select a category below or adjust sliders directly.
        </p>
      </div>

      {/* Chromebook Category Navigation Bar - Easy Topic Filter */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-950 rounded-xl border border-slate-800 flex-wrap shrink-0">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-sky-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          ✨ All
        </button>

        <button
          onClick={() => setActiveTab('albedo_beads')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'albedo_beads'
              ? 'bg-yellow-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          🔮 Microbeads & Albedo
        </button>

        <button
          onClick={() => setActiveTab('solar_co2')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'solar_co2'
              ? 'bg-rose-500 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          ☀️ Solar & CO₂
        </button>

        <button
          onClick={() => setActiveTab('specific_heat')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'specific_heat'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          🧪 Specific Heat
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'scenarios'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          🎯 Scenarios
        </button>
      </div>

      {/* Playback & Master Reset Toolbar */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5">
        <button
          onClick={onTogglePlay}
          className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer shrink-0 ${
            state.isPlaying
              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/50'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg'
          }`}
        >
          {state.isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{state.isPlaying ? 'Pause Simulation' : 'Run Simulation'}</span>
        </button>

        {/* Speed Selector */}
        <div className="flex items-center bg-slate-950 rounded-xl p-1 border border-slate-700">
          {[1, 5, 20].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg font-bold transition cursor-pointer ${
                state.timeSpeed === spd
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`${spd}x speed`}
            >
              {spd}×
            </button>
          ))}
        </div>

        {onResetAll && (
          <button
            onClick={onResetAll}
            className="py-2 px-3 text-xs sm:text-sm text-rose-200 hover:text-white bg-rose-950 hover:bg-rose-900 border border-rose-700 rounded-xl transition cursor-pointer flex items-center gap-1.5 font-bold"
            title="Reset All Simulation Parameters to Default"
          >
            <RotateCcw size={15} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* SECTION 1: MICROBEADS & GLACIER ALBEDO CONTROLS */}
      {(activeTab === 'all' || activeTab === 'albedo_beads') && (
        <div className="space-y-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-sky-200">
              <Sparkles size={18} className="text-sky-400" />
              <span>1. Albedo & Microbead Controls</span>
            </div>
            <span className="font-mono text-xs font-bold text-sky-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Effective Albedo: {(state.effectiveAlbedo * 100).toFixed(0)}%
            </span>
          </div>

          {/* Glacier Ice Condition / Natural Albedo Selector */}
          <div className="space-y-2">
            <Tooltip
              title="Natural Glacier Substrate Albedo"
              concept="Reflectivity before microbeads. Pristine snowpack reflects ~76% of solar light. Soot deposits drop albedo to 22%, causing severe heat absorption."
              formula="α_pristine = 0.76 | α_aged = 0.42 | α_soot = 0.22"
              position="top"
            >
              <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5 cursor-help">
                <Layers size={16} className="text-sky-400" />
                <span>Natural Glacier Surface Albedo State:</span>
                <Info size={14} className="text-sky-400/70" />
              </label>
            </Tooltip>

            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-700">
              <button
                onClick={() => onChangeIceCondition('pristine')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition text-center cursor-pointer ${
                  state.iceCondition === 'pristine'
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ❄️ Pristine (α=0.76)
              </button>
              <button
                onClick={() => onChangeIceCondition('aged')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition text-center cursor-pointer ${
                  state.iceCondition === 'aged'
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🧊 Aged (α=0.42)
              </button>
              <button
                onClick={() => onChangeIceCondition('soot')}
                className={`py-2 px-2 text-xs font-bold rounded-lg transition text-center cursor-pointer ${
                  state.iceCondition === 'soot'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                🌋 Soot (α=0.22)
              </button>
            </div>
          </div>

          {/* Microbead Density Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-700/60">
            <div className="flex items-center justify-between">
              <Tooltip
                title="Microbead Application Density (Arctic Ice Project)"
                concept="Hollow silica glass microspheres (35-50 µm). Sunlight undergoes total internal reflection and bounces back out into space before turning into heat."
                formula="Coverage: 0% to 100%"
                units="%"
                position="top"
              >
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-yellow-200 cursor-help">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span>Microbead Application Density:</span>
                  <Info size={14} className="text-yellow-400/70" />
                </div>
              </Tooltip>
              <span className="font-mono text-base font-extrabold text-yellow-300 tabular-nums">
                {state.microbeadDensity}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={state.microbeadDensity}
              onChange={(e) => onChangeMicrobeads(Number(e.target.value))}
              className="w-full h-3.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />

            <div className="flex justify-between text-xs font-bold text-slate-300 font-mono">
              <button onClick={() => onChangeMicrobeads(0)} className="hover:text-yellow-300 cursor-pointer">
                0% (Bare Ice)
              </button>
              <button onClick={() => onChangeMicrobeads(50)} className="hover:text-yellow-300 cursor-pointer">
                50% (Partial)
              </button>
              <button onClick={() => onChangeMicrobeads(100)} className="hover:text-yellow-300 cursor-pointer">
                100% (High-Albedo Shield)
              </button>
            </div>

            <div className="text-xs text-slate-200 bg-sky-950/60 border border-sky-800/50 rounded-xl p-3 leading-relaxed">
              {state.microbeadDensity === 0 ? (
                <span className="text-amber-200 font-medium">
                  ⚠️ <strong>No microbeads:</strong> Ice absorbs <strong>{state.absorbedEnergy} W/m²</strong> of sunlight, converting it into red thermal infrared heat that melts ice.
                </span>
              ) : (
                <span className="text-sky-200 font-medium">
                  ✨ <strong>{state.microbeadDensity}% microbeads:</strong> Bounces <strong>{state.reflectedSolar} W/m²</strong> of solar light straight back into space through CO₂ unhindered!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SOLAR IRRADIANCE & ATMOSPHERIC CO2 CONTROLS */}
      {(activeTab === 'all' || activeTab === 'solar_co2') && (
        <div className="space-y-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
              <Sun size={18} className="text-amber-400" />
              <span>2. Solar Transmission & Atmospheric CO₂</span>
            </div>
          </div>

          {/* Solar Irradiance Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Tooltip
                title="Shortwave Solar Irradiance (SW↓)"
                concept="Flux of solar electromagnetic energy arriving at the surface. Standard Arctic solstice noon reaches 800-1000 W/m²."
                formula="SW↓ = S₀ · cos(θ)"
                units="W/m²"
                position="top"
              >
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-yellow-200 cursor-help">
                  <Sun size={16} className="text-yellow-400" />
                  <span>Incoming Solar Power (SW↓):</span>
                  <Info size={14} className="text-yellow-400/70" />
                </div>
              </Tooltip>
              <span className="font-mono text-base font-extrabold text-yellow-300 tabular-nums">
                {state.solarIntensity} W/m²
              </span>
            </div>

            <input
              type="range"
              min="200"
              max="1000"
              step="25"
              value={state.solarIntensity}
              onChange={(e) => onChangeSolar(Number(e.target.value))}
              className="w-full h-3.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-yellow-400"
            />

            <div className="flex justify-between text-xs font-bold text-slate-300 font-mono">
              <span>200 (Overcast)</span>
              <span>600 (Polar Sun)</span>
              <span>1000 (Zenith Noon)</span>
            </div>
          </div>

          {/* Atmospheric CO2 Slider */}
          <div className="space-y-2 pt-3 border-t border-slate-700/60">
            <div className="flex items-center justify-between">
              <Tooltip
                title="Atmospheric CO₂ Concentration"
                concept="CO₂ molecules trap outgoing red longwave infrared heat in bending vibrations (ν₂) and radiate heat back down to melt the glacier."
                formula="ΔF = 5.35 · ln(C / 280 ppm)"
                units="ppm"
                position="top"
              >
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-200 cursor-help">
                  <Wind size={16} className="text-rose-400" />
                  <span>Atmospheric CO₂ Concentration:</span>
                  <Info size={14} className="text-rose-400/70" />
                </div>
              </Tooltip>
              <span className="font-mono text-base font-extrabold text-rose-300 tabular-nums">
                {state.co2Concentration} ppm
              </span>
            </div>

            <input
              type="range"
              min="280"
              max="1000"
              step="10"
              value={state.co2Concentration}
              onChange={(e) => onChangeCO2(Number(e.target.value))}
              className="w-full h-3.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-400"
            />

            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => onChangeCO2(280)}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  state.co2Concentration === 280
                    ? 'bg-rose-500 text-white shadow'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                }`}
              >
                280 (Pre-Ind)
              </button>
              <button
                onClick={() => onChangeCO2(425)}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  state.co2Concentration === 425
                    ? 'bg-rose-500 text-white shadow'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                }`}
              >
                425 (Present)
              </button>
              <button
                onClick={() => onChangeCO2(750)}
                className={`py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  state.co2Concentration === 750
                    ? 'bg-rose-500 text-white shadow'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
                }`}
              >
                750 (Future)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: SPECIFIC HEAT & MATERIAL SELECTION */}
      {(activeTab === 'all' || activeTab === 'specific_heat') && (
        <div className="space-y-4 bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-200">
              <Flame size={18} className="text-amber-400" />
              <span>3. Material Thermal Armor & Specific Heat</span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              c = {state.specificHeatMaterial.toFixed(2)} J/g·°C
            </span>
          </div>

          {/* Material Specimen Cards */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'silica', name: '🔮 Glass Microbeads', badge: 'Reflects 96% Sun!', c: 0.84, color: 'border-yellow-400 text-yellow-200 bg-amber-950/60' },
              { id: 'ceramic', name: '🏺 Ceramic Shells', badge: 'Reflects 88% Sun', c: 1.05, color: 'border-amber-400 text-amber-200 bg-amber-950/60' },
              { id: 'soot', name: '🌋 Carbon Soot', badge: 'Heats 3x Fast!', c: 0.71, color: 'border-rose-500 text-rose-300 bg-rose-950/60' },
              { id: 'custom_water', name: '💧 Meltwater Pool', badge: 'Stores Heat 24/7', c: 4.18, color: 'border-blue-400 text-blue-200 bg-blue-950/60' },
            ].map((mat) => {
              const isActive =
                (mat.id === 'custom_water' && Math.abs(state.specificHeatMaterial - 4.18) < 0.1) ||
                state.microbeadMaterial === mat.id;
              return (
                <button
                  key={mat.id}
                  onClick={() => {
                    if (mat.id === 'custom_water') {
                      if (onChangeMaterial) onChangeMaterial('custom');
                      if (onChangeCustomSpecificHeat) onChangeCustomSpecificHeat(4.18);
                    } else {
                      if (onChangeMaterial) onChangeMaterial(mat.id as MicrobeadMaterialType);
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isActive
                      ? `${mat.color} shadow-lg ring-1 ring-amber-400`
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{mat.name}</span>
                    {isActive && <Check size={14} className="text-amber-400" />}
                  </div>
                  <span className="text-[11px] text-slate-300 mt-1">{mat.badge}</span>
                </button>
              );
            })}
          </div>

          {/* Specific Heat Slider */}
          <div className="space-y-2 pt-2 border-t border-slate-700/60">
            <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-200">
              <span>Heat Resistance ($c$):</span>
              <span className="text-amber-300 font-mono font-extrabold">
                {state.specificHeatMaterial.toFixed(2)} J/g·°C
              </span>
            </div>
            <input
              type="range"
              min="0.30"
              max="4.50"
              step="0.05"
              value={state.specificHeatMaterial}
              onChange={(e) => {
                if (onChangeMaterial) onChangeMaterial('custom');
                if (onChangeCustomSpecificHeat) onChangeCustomSpecificHeat(Number(e.target.value));
              }}
              className="w-full h-3.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-xs font-bold text-slate-300 font-mono">
              <span className="text-rose-400">Low (Heats Fast)</span>
              <span>2.11 (Glacier Ice)</span>
              <span className="text-blue-400">High (Stores Heat)</span>
            </div>
          </div>

          {/* Sun Burst Trigger Button */}
          {onFireHeatPulse && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onFireHeatPulse(500)}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Zap size={16} className="fill-slate-950" />
                <span>☀️ Test Sun Burst (+500 Joules)</span>
              </button>

              {onOpenSpecificHeatModal && (
                <button
                  onClick={onOpenSpecificHeatModal}
                  className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                >
                  Live Race ↗
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: CLASSROOM EXPERIMENT PRESETS */}
      {(activeTab === 'all' || activeTab === 'scenarios') && (
        <div className="space-y-3 bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-300 border-b border-slate-700/80 pb-2">
            <Lightbulb size={18} className="text-emerald-400" />
            <span>Classroom Experiment Scenarios</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onApplyPreset('untreated')}
              className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs sm:text-sm transition flex flex-col cursor-pointer"
            >
              <span className="font-bold text-rose-300">1. Untreated Melting Glacier</span>
              <span className="text-xs text-slate-300 mt-1">
                425 ppm CO₂, 750 W/m² sun, 0% beads. High infrared emission, rapid melting.
              </span>
            </button>

            <button
              onClick={() => onApplyPreset('microbeads')}
              className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs sm:text-sm transition flex flex-col cursor-pointer"
            >
              <span className="font-bold text-sky-300">2. Microbead Climate Shield</span>
              <span className="text-xs text-slate-300 mt-1">
                Same sun & CO₂, but 85% microbeads applied. Light reflected before turning into heat!
              </span>
            </button>

            <button
              onClick={() => onApplyPreset('highco2')}
              className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs sm:text-sm transition flex flex-col cursor-pointer"
            >
              <span className="font-bold text-amber-300">3. High CO₂ + Soot Scenario</span>
              <span className="text-xs text-slate-300 mt-1">
                750 ppm CO₂ + dark soot albedo (0.22). Severe runaway greenhouse heating.
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Author & Version Metadata */}
      <div className="pt-3 border-t border-slate-800/80 text-center text-xs text-slate-300 font-mono font-bold">
        Designed by Mr. Keith Chapman 2026 v. 2.0 using Google AI Studio.
      </div>
    </div>
  );
};
