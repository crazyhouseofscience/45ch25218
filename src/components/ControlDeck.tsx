import React from 'react';
import { SimulationState, IceCondition } from '../types/simulation';
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
  Eye,
  Activity,
  Info
} from 'lucide-react';

interface ControlDeckProps {
  state: SimulationState;
  onChangeSolar: (val: number) => void;
  onChangeMicrobeads: (val: number) => void;
  onChangeCO2: (val: number) => void;
  onChangeIceCondition: (val: IceCondition) => void;
  onChangeAmbientTemp: (val: number) => void;
  onChangeIceThickness: (val: number) => void;
  onTogglePlay: () => void;
  onChangeSpeed: (val: number) => void;
  onResetIce: () => void;
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
  onChangeCO2,
  onChangeIceCondition,
  onChangeAmbientTemp,
  onChangeIceThickness,
  onTogglePlay,
  onChangeSpeed,
  onResetIce,
  onToggleIncoming,
  onToggleReflected,
  onToggleReradiant,
  onToggleCO2Molecules,
  onToggleGreenhouseTrapping,
  onApplyPreset,
}) => {
  return (
    <div className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 p-5 flex flex-col gap-5 overflow-y-auto max-h-screen text-slate-100">
      {/* Title & Brand */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="text-sky-400" size={18} />
          <h2 className="text-base font-bold tracking-tight text-white">Climate Parameters & Controls</h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Adjust solar flux, atmospheric CO₂, and microbead albedo enhancement.
        </p>
      </div>

      {/* Student Concept Breakdown Card */}
      <div className="bg-sky-950/40 border border-sky-800/60 rounded-xl p-3 text-xs space-y-2">
        <div className="font-bold text-sky-200 flex items-center gap-1.5">
          <span>🎓 Student Concept Guide</span>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-300">
          <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
            <span className="font-semibold text-rose-300">Without Microbeads (Warming):</span>
            <p className="text-slate-300 mt-0.5">
              Sunlight hits ice ➔ Absorbed & converted to heat ➔ Re-radiated as <strong>Red Infrared (LW &uarr;)</strong> ➔ Trapped by CO₂ (LW &darr;).
            </p>
          </div>
          <div className="p-2 bg-slate-900/80 rounded border border-slate-800">
            <span className="font-semibold text-sky-300">With Microbeads (Cooling):</span>
            <p className="text-slate-300 mt-0.5">
              Sunlight reflected by microbeads as <strong>Shortwave (SW &uarr;)</strong> ➔ Passes straight through CO₂ into space unhindered ➔ Zero heat absorbed!
            </p>
          </div>
        </div>
      </div>

      {/* Playback & Reset Toolbar */}
      <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-2.5 flex items-center justify-between gap-2">
        <button
          onClick={onTogglePlay}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            state.isPlaying
              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
          }`}
        >
          {state.isPlaying ? <Pause size={14} /> : <Play size={14} />}
          <span>{state.isPlaying ? 'Pause Simulation' : 'Run Simulation'}</span>
        </button>

        {/* Speed Selector */}
        <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700">
          {[1, 5, 20].map((spd) => (
            <button
              key={spd}
              onClick={() => onChangeSpeed(spd)}
              className={`px-2 py-1 text-[11px] font-mono rounded font-medium transition cursor-pointer ${
                state.timeSpeed === spd
                  ? 'bg-sky-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`${spd}x speed`}
            >
              {spd}×
            </button>
          ))}
        </div>

        <button
          onClick={onResetIce}
          className="py-1.5 px-2.5 text-xs text-sky-300 hover:text-white bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 rounded-lg transition cursor-pointer flex items-center gap-1 font-semibold"
          title="Reset Glacier Ice to 100%"
        >
          <RotateCcw size={13} />
          <span>Reset Ice</span>
        </button>
      </div>

      {/* Glacier Ice Thickness Controller */}
      <div className="space-y-2 bg-slate-800/60 border border-slate-700/70 rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <Tooltip
            title="Glacial Ice Thickness & Positive Feedback"
            concept="As the glacier melts and thins below 30%, dark bedrock moraine is exposed below (albedo ~0.10). The exposed rock absorbs 90% of solar energy, accelerating melting of adjacent ice."
            formula="Thickness: 0% (Bedrock) to 100% (Full)"
            units="% Mass"
            position="top"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 cursor-help">
              <Layers size={15} className="text-sky-400" />
              <span>Glacier Ice Thickness</span>
              <Info size={12} className="text-sky-400/70" />
            </div>
          </Tooltip>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-sky-300 tabular-nums">
              {state.iceThickness.toFixed(0)}%
            </span>
            {state.iceThickness <= 0 && (
              <button
                onClick={onResetIce}
                className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer"
              >
                Restore Ice
              </button>
            )}
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={Math.round(state.iceThickness)}
          onChange={(e) => onChangeIceThickness(Number(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span className={state.iceThickness <= 0 ? 'text-rose-400 font-bold' : ''}>0% (Exposed Bedrock)</span>
          <span>50%</span>
          <span className={state.iceThickness >= 95 ? 'text-emerald-400 font-bold' : ''}>100% (Full Glacier)</span>
        </div>

        {state.iceThickness <= 0 && (
          <div className="text-[11px] p-2 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-200 flex items-center justify-between">
            <span>⚠️ Glacier depleted! Current melt rate potential: <strong>{state.meltRate} mm/day</strong>.</span>
          </div>
        )}
      </div>

      {/* Primary Slider 1: Microbead Density with Educational Tooltip */}
      <div className="space-y-2 bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <Tooltip
            title="Microbead Geoengineering (Arctic Ice Project)"
            concept="Hollow silica glass microspheres (35-50 µm) applied over melting ice. Because of the refractive index contrast between silica glass and the internal air cavity, sunlight undergoes total internal reflection and is bounced back into space before it can convert to heat."
            formula="α_effective ≈ α_base + (0.88 - α_base)·Coverage^0.80"
            units="% Coverage"
            position="top"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-200 cursor-help">
              <Sparkles size={15} className="text-sky-400" />
              <span>Microbead Application Density</span>
              <Info size={12} className="text-sky-400/70" />
            </div>
          </Tooltip>
          <span className="font-mono text-sm font-bold text-sky-300 tabular-nums">
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
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0% (Bare Ice)</span>
          <span>50% (Partial Coverage)</span>
          <span>100% (High-Albedo Shield)</span>
        </div>

        <div className="text-[11px] text-slate-300 bg-sky-950/40 border border-sky-800/30 rounded-lg p-2.5 mt-1.5 leading-relaxed space-y-1">
          {state.microbeadDensity === 0 ? (
            <div className="text-amber-300">
              ⚠️ <strong>No microbeads:</strong> Ice absorbs <strong>{state.absorbedEnergy} W/m²</strong> of solar light, converting it to re-radiant infrared heat that is trapped by atmospheric CO₂.
            </div>
          ) : (
            <div>
              ✨ <strong className="text-sky-300">{state.microbeadDensity}% microbeads:</strong> Reflects <strong className="text-yellow-200">{state.reflectedSolar} W/m²</strong> of solar light (Albedo {(state.effectiveAlbedo * 100).toFixed(0)}%).
              <div className="text-[10px] text-emerald-300 font-medium mt-0.5">
                📘 NOAA Principle: Because solar light is shortwave, it escapes 100% through CO₂ into space, leaving only {state.absorbedEnergy} W/m² absorbed to suppress infrared re-radiation!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Slider 2: Atmospheric CO2 with Tooltip */}
      <div className="space-y-2 bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <Tooltip
            title="Atmospheric CO₂ & Radiative Forcing"
            concept="Carbon dioxide molecules absorb outgoing longwave infrared radiation (15 µm wavelength) in resonant vibrational bending modes (ν₂). Higher CO₂ increases atmospheric opacity to infrared, reducing heat loss to space and radiating thermal energy back down."
            formula="ΔF = 5.35 · ln(C / 280 ppm)"
            units="ppm"
            position="top"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-200 cursor-help">
              <Wind size={15} className="text-rose-400" />
              <span>Atmospheric CO₂ Concentration</span>
              <Info size={12} className="text-rose-400/70" />
            </div>
          </Tooltip>
          <span className="font-mono text-sm font-bold text-rose-300 tabular-nums">
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
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-400"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>280 (Pre-Ind)</span>
          <span>425 (Today)</span>
          <span>700 (High 2100)</span>
          <span>1000 (Max)</span>
        </div>

        {/* Quick CO2 Presets */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => onChangeCO2(280)}
            className={`py-1 text-[10px] rounded font-medium transition cursor-pointer ${
              state.co2Concentration === 280
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            280 (Pre-Ind)
          </button>
          <button
            onClick={() => onChangeCO2(425)}
            className={`py-1 text-[10px] rounded font-medium transition cursor-pointer ${
              state.co2Concentration === 425
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            425 (Present)
          </button>
          <button
            onClick={() => onChangeCO2(750)}
            className={`py-1 text-[10px] rounded font-medium transition cursor-pointer ${
              state.co2Concentration === 750
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            750 (Future)
          </button>
        </div>

        <div className="text-[11px] text-slate-300 bg-rose-950/30 border border-rose-800/30 rounded-lg p-2 mt-1 leading-relaxed">
          <span className="text-rose-200">
            CO₂ molecules let sunlight in, but <strong>trap {state.greenhouseBackRadiation} W/m² ({state.infraredTrappingPercent}%)</strong> of upward infrared heat, radiating it back down to melt the glacier.
          </span>
        </div>
      </div>

      {/* Primary Slider 3: Solar Irradiance with Tooltip */}
      <div className="space-y-2 bg-slate-800/50 border border-slate-700/60 rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <Tooltip
            title="Shortwave Solar Irradiance (SW↓)"
            concept="The flux of solar electromagnetic energy arriving at the surface. Varies with solar zenith angle, cloud cover, and seasonal latitude (Arctic summer solstice noon reaches 800-1000 W/m²)."
            formula="SW↓ = S₀ · cos(θ_zenith)"
            units="W/m²"
            position="top"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold text-yellow-200 cursor-help">
              <Sun size={15} className="text-yellow-400" />
              <span>Solar Irradiance (SW↓)</span>
              <Info size={12} className="text-yellow-400/70" />
            </div>
          </Tooltip>
          <span className="font-mono text-sm font-bold text-yellow-300 tabular-nums">
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
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
        />

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>200 (Overcast)</span>
          <span>600 (Polar Sun)</span>
          <span>1000 (Zenith Noon)</span>
        </div>
      </div>

      {/* Glacier Surface Substrate Condition with Tooltip */}
      <div className="space-y-2 bg-slate-800/40 border border-slate-700/60 rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <Tooltip
            title="Natural Glacier Ice Albedo & State"
            concept="Substrate reflectivity prior to microbeads. Pristine snowpack reflects 76-85% of light. Compaction and surface melting drop albedo to 0.42. Dark cryoconite soot or wildfire ash plummets albedo to 0.22, converting 78% of sunlight into heat!"
            formula="α_pristine ≈ 0.76 | α_soot ≈ 0.22"
            units="0 to 1"
            position="top"
          >
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-help">
              <Layers size={14} className="text-indigo-400" />
              <span>Glacier Ice State (Natural Albedo)</span>
              <Info size={12} className="text-indigo-400/70" />
            </label>
          </Tooltip>
        </div>

        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-700">
          <button
            onClick={() => onChangeIceCondition('pristine')}
            className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition text-center cursor-pointer ${
              state.iceCondition === 'pristine'
                ? 'bg-sky-500 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pristine (α=0.76)
          </button>
          <button
            onClick={() => onChangeIceCondition('aged')}
            className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition text-center cursor-pointer ${
              state.iceCondition === 'aged'
                ? 'bg-sky-500 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aged Grey (α=0.42)
          </button>
          <button
            onClick={() => onChangeIceCondition('soot')}
            className={`py-1.5 px-2 text-[11px] font-medium rounded-lg transition text-center cursor-pointer ${
              state.iceCondition === 'soot'
                ? 'bg-rose-500 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Soot (α=0.22)
          </button>
        </div>

        <div className="text-[11px] text-slate-300 leading-relaxed pt-1">
          {state.iceCondition === 'pristine' ? (
            <span className="text-sky-200">
              ❄️ <strong>Pristine snowpack:</strong> Reflects most solar rays directly back. Minimal energy penetrates to convert into red infrared waves.
            </span>
          ) : state.iceCondition === 'aged' ? (
            <span className="text-amber-200">
              🧊 <strong>Aged glacial ice:</strong> Weathering and melt drops albedo to 0.42. Over half of incoming rays are absorbed and convert into <strong>red upward infrared waves</strong>!
            </span>
          ) : (
            <span className="text-rose-200">
              ⚡ <strong>Soot & Cryoconite:</strong> Dark deposits absorb 78% of sunlight! Watch the <strong>intense red infrared heat waves</strong> emerge and accelerate melting.
            </span>
          )}
        </div>
      </div>

      {/* Ambient Air Temperature with Tooltip */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
          <Tooltip
            title="Turbulent Sensible Heat Transfer (H)"
            concept="Thermal heat exchange between the ambient air boundary layer and the glacier surface via convection and eddy turbulence. When air temperature is above 0°C, sensible heat transfers downward into the ice."
            formula="H = h · (T_air - T_ice)"
            units="W/m²"
            position="top"
          >
            <span className="flex items-center gap-1.5 cursor-help">
              <Thermometer size={14} className="text-rose-400" />
              <span>Ambient Air Temperature</span>
              <Info size={12} className="text-rose-400/70" />
            </span>
          </Tooltip>
          <span className="font-mono text-xs font-bold text-slate-200 tabular-nums">
            {state.ambientTemp > 0 ? `+${state.ambientTemp}` : state.ambientTemp}°C
          </span>
        </div>
        <input
          type="range"
          min="-10"
          max="15"
          step="1"
          value={state.ambientTemp}
          onChange={(e) => onChangeAmbientTemp(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-400"
        />
      </div>

      {/* Visual Layer Toggles */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span>Simulation Visual Layers:</span>
          <span className="text-[10px] text-slate-400">Interactive</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={onToggleIncoming}
            className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition cursor-pointer ${
              state.showIncomingRays
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-400" />
            <span>Solar Rays (SW↓)</span>
          </button>

          <button
            onClick={onToggleReflected}
            className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition cursor-pointer ${
              state.showReflectedRays
                ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-yellow-200" />
            <span>Reflected Light (SW↑)</span>
          </button>

          <button
            onClick={onToggleReradiant}
            className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition cursor-pointer ${
              state.showReradiantHeat
                ? 'bg-red-500/20 text-red-300 border-red-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Re-Radiant Heat (LW↑)</span>
          </button>

          <button
            onClick={onToggleCO2Molecules}
            className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition cursor-pointer ${
              state.showCO2Molecules
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>CO₂ Molecules</span>
          </button>
        </div>
      </div>

      {/* Preset Scenarios for Students */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Lightbulb size={14} className="text-amber-400" />
          <span>Classroom Scenarios:</span>
        </div>
        <div className="space-y-1.5">
          <button
            onClick={() => onApplyPreset('untreated')}
            className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs transition flex flex-col cursor-pointer"
          >
            <span className="font-semibold text-rose-300">1. Untreated Melting Glacier</span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              425 ppm CO₂, 750 W/m² sun, 0% beads. Emits high infrared, melting rapidly!
            </span>
          </button>

          <button
            onClick={() => onApplyPreset('microbeads')}
            className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs transition flex flex-col cursor-pointer"
          >
            <span className="font-semibold text-sky-300">2. Microbead Climate Shield</span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              Same sun & CO₂, but 85% microbeads applied. Light reflected before turning to heat!
            </span>
          </button>

          <button
            onClick={() => onApplyPreset('highco2')}
            className="w-full text-left p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 text-xs transition flex flex-col cursor-pointer"
          >
            <span className="font-semibold text-amber-300">3. High CO₂ + Soot Scenario</span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              750 ppm CO₂ + dark soot albedo (0.22). Severe runaway greenhouse heating.
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
