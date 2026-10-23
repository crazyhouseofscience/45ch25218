import React from 'react';
import { SimulationState } from '../types/simulation';
import { Tooltip } from './Tooltip';
import {
  Sun,
  ShieldCheck,
  Thermometer,
  Flame,
  ArrowUpRight,
  Droplets,
  Activity,
  Gauge,
  Wind,
  Info
} from 'lucide-react';

interface MetricsPanelProps {
  state: SimulationState;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ state }) => {
  const albedoPercent = state.reflectedSolarPercent.toFixed(1);
  const tempF = ((state.iceSurfaceTemp * 9) / 5 + 32).toFixed(1);

  // Exact energy distribution percentages from simulation physics
  const reflectedPct = state.reflectedSolarPercent;
  const absorbedPct = state.absorbedSolarPercent;

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 text-slate-100">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-sky-400" />
          <span className="font-semibold text-slate-200 tracking-wide uppercase text-[11px]">
            Live Radiative Balance & Glaciological Telemetry
          </span>
          {state.feedbackLoopActive && (
            <Tooltip
              title="Ice-Albedo Positive Feedback Loop"
              concept="As ice melts down, dark bedrock (albedo ~0.10) is exposed. Dark rock absorbs 90% of sunlight, converting it to infrared heat that melts adjacent ice even faster!"
              formula="ΔAlbedo < 0 ➔ +Absorption ➔ +Melt"
              position="bottom"
            >
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold animate-pulse cursor-help flex items-center gap-1">
                ⚠️ Ice-Albedo Positive Feedback Active
              </span>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <Tooltip
            title="Net Radiative Energy Forcing"
            concept="The net balance of all radiant and sensible heat entering the glacier surface minus outgoing radiation. A positive value drives melting."
            formula="F_net = (1-α)SW↓ + LW↓ - LW↑ + H"
            units="W/m²"
            position="bottom"
          >
            <span className="cursor-help">
              Net Energy Forcing:{' '}
              <strong className={state.netEnergyFlux > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                {state.netEnergyFlux > 0 ? `+${state.netEnergyFlux}` : state.netEnergyFlux} W/m²
              </strong>
            </span>
          </Tooltip>
          <span className="hidden sm:inline text-slate-500">|</span>
          <Tooltip
            title="Atmospheric Carbon Dioxide"
            concept="Global concentration of CO₂ in parts per million. Pre-industrial: 280 ppm, Current: ~425 ppm. Higher CO₂ absorbs more outgoing longwave infrared."
            formula="ΔF = 5.35 · ln(C/280)"
            units="ppm"
            position="bottom"
          >
            <span className="hidden sm:inline cursor-help">
              CO₂ Concentration: <strong className="text-rose-400">{state.co2Concentration} ppm</strong>
            </span>
          </Tooltip>
        </div>
      </div>

      {/* NOAA Carbon Cycle Toolkit Educational Strip */}
      <div className="mb-3 px-3 py-1.5 rounded-lg bg-sky-950/60 border border-sky-800/40 text-xs flex flex-wrap items-center justify-between gap-2 text-sky-200">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sky-300">📘 NOAA Carbon Toolkit:</span>
          <span>
            Microbeads bounce sunlight as shortwave radiation (<strong className="text-yellow-200 font-mono">{state.reflectedSolar} W/m²</strong>) which <strong className="text-emerald-300">escapes freely through CO₂</strong> into space.
          </span>
        </div>
        <div className="text-[11px] text-slate-300 font-medium">
          Solar absorbed into ice: <strong className="text-amber-300 font-mono">{state.absorbedEnergy} W/m²</strong> (suppresses infrared re-radiation!)
        </div>
      </div>

      {/* Primary KPI Grid (8 Cards with Informative Educational Tooltips) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* 1. Solar Input */}
        <Tooltip
          title="Shortwave Solar Irradiance (SW↓)"
          concept="High-frequency visible and UV electromagnetic radiation arriving from the Sun. Greenhouse gases cannot absorb shortwave light, so it passes directly to the surface."
          formula="SW↓ = S₀ · cos(θ)"
          units="W/m²"
          position="top"
          className="w-full"
        >
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between h-full cursor-help transition">
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
              <span>Solar Input</span>
              <Sun size={16} className="text-yellow-400" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-extrabold text-yellow-300 tabular-nums">
              {state.solarIntensity} <span className="text-xs font-normal text-slate-400">W/m²</span>
            </div>
            <div className="text-xs font-semibold text-slate-400">Shortwave (SW↓)</div>
          </div>
        </Tooltip>

        {/* 2. Effective Albedo */}
        <Tooltip
          title="Surface Albedo (α)"
          concept="The fraction of solar light reflected directly back without heating the surface. Fresh snow has high albedo (~0.85); dark wet ice has low albedo (~0.35). Microbeads restore albedo to 0.90."
          formula="α = SW↑ / SW↓"
          units="0 to 1"
          position="top"
          className="w-full"
        >
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between h-full cursor-help transition">
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
              <span>Albedo (α)</span>
              <ShieldCheck size={16} className="text-sky-400" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-extrabold text-sky-300 tabular-nums">
              {state.effectiveAlbedo.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">({albedoPercent}%)</span>
            </div>
            <div className="text-xs font-bold text-sky-300">
              {state.effectiveAlbedo > 0.75
                ? 'High Reflection'
                : state.effectiveAlbedo > 0.4
                ? 'Moderate'
                : 'Critical Low'}
            </div>
          </div>
        </Tooltip>

        {/* 3. Reflected Solar */}
        <Tooltip
          title="Reflected Sunlight (SW↑) - NOAA Carbon Toolkit"
          concept="Solar energy bounced directly back into space by high-albedo snow or microbeads. Because CO₂ is transparent to shortwave light, 100% of this energy passes unhindered out to space and NEVER converts to greenhouse heat!"
          formula="SW↑ = α · SW↓ (Escapes CO₂)"
          units="W/m²"
          position="top"
          className="w-full"
        >
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between h-full cursor-help transition">
            <div className="flex items-center justify-between text-yellow-200 text-xs font-bold">
              <span>Reflected (SW↑)</span>
              <ArrowUpRight size={16} className="text-yellow-300" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-extrabold text-yellow-200 tabular-nums">
              {state.reflectedSolar} <span className="text-xs font-normal text-slate-400">W/m²</span>
            </div>
            <div className="text-xs text-emerald-300 font-bold">Escapes 100% via CO₂</div>
          </div>
        </Tooltip>

        {/* 4. Absorbed Heat */}
        <Tooltip
          title="Absorbed Solar Heat (Q_abs)"
          concept="Solar photons that are NOT reflected penetrate into the ice crystals, exciting molecular vibrations and transforming electromagnetic energy into thermal heat that drives melt."
          formula="Q_abs = (1 - α) · SW↓"
          units="W/m²"
          position="top"
          className="w-full"
        >
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between h-full cursor-help transition">
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
              <span>Absorbed (Q)</span>
              <Flame size={16} className="text-amber-400" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-extrabold text-amber-300 tabular-nums">
              {state.absorbedEnergy} <span className="text-xs font-normal text-slate-400">W/m²</span>
            </div>
            <div className="text-xs font-semibold text-slate-400">Heats Substrate</div>
          </div>
        </Tooltip>

        {/* 5. Re-Radiant Longwave Infrared */}
        <Tooltip
          title="Re-Radiant Longwave Infrared (LW↑)"
          concept="Stefan-Boltzmann thermal radiation (ε·σ·T⁴) emitted by the surface. When microbeads are added, solar absorption plummets, removing the energy source that feeds thermal infrared radiation!"
          formula="LW↑ = ε · σ · T⁴"
          units="W/m²"
          position="top"
          className="w-full"
        >
          <div className={`border rounded-xl p-3 flex flex-col justify-between h-full cursor-help transition-all ${
            state.absorbedEnergy > 250 && state.microbeadDensity === 0
              ? 'bg-rose-950/40 border-rose-600/70 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
              : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/60'
          }`}>
            <div className="flex items-center justify-between text-rose-300 text-xs font-bold">
              <span>Re-Radiant (LW↑)</span>
              <Activity size={16} className="text-rose-400" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-extrabold text-rose-300 tabular-nums">
              {state.reradiantInfrared} <span className="text-xs font-normal text-slate-400">W/m²</span>
            </div>
            <div className="text-xs text-rose-300 font-bold">
              Absorbed: {state.absorbedEnergy} W/m²
            </div>
          </div>
        </Tooltip>

        {/* 6. CO2 Greenhouse Back-Radiation */}
        <Tooltip
          title="Greenhouse Back-Radiation (LW↓)"
          concept="Atmospheric CO₂ absorbs upward infrared waves, enters resonant bending vibrations, and re-emits infrared in all directions—sending hundreds of W/m² back down to melt the glacier."
          formula="LW↓ = ε_atm · σ · T⁴ + ΔF_CO₂"
          units="W/m²"
          position="top"
          className="w-full"
        >
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between h-full cursor-help transition">
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
              <span>CO₂ Back (LW↓)</span>
              <Wind size={16} className="text-rose-400" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-extrabold text-rose-400 tabular-nums">
              {state.greenhouseBackRadiation} <span className="text-xs font-normal text-slate-400">W/m²</span>
            </div>
            <div className="text-xs font-semibold text-slate-400">Downward Heat Trap</div>
          </div>
        </Tooltip>

        {/* 7. Surface Temp */}
        <Tooltip
          title="Ice Surface Temperature (Phase Plateau)"
          concept="Under atmospheric pressure, melting ice cannot rise above 0°C (32°F). When it reaches 0°C, surplus energy is converted into latent heat of fusion, melting the ice."
          formula="T_surface ≤ 0.0°C"
          units="°C / °F"
          position="top"
          className="w-full"
        >
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between h-full cursor-help transition">
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
              <span>Ice Temp</span>
              <Thermometer size={16} className="text-indigo-400" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-extrabold text-indigo-200 tabular-nums">
              {state.iceSurfaceTemp}°C{' '}
              <span className="text-xs font-normal text-slate-400">({tempF}°F)</span>
            </div>
            <div className="text-xs font-bold text-indigo-300">
              {state.iceSurfaceTemp >= 0 ? 'Melting Active' : 'Sub-Freezing'}
            </div>
          </div>
        </Tooltip>

        {/* 8. Melt Rate */}
        <Tooltip
          title="Glacial Melt Rate (Pierrehumbert)"
          concept="The rate of ice thinning per day. Surplus energy (F_net) is divided by latent heat of fusion (3.34 × 10⁵ J/kg) and ice density (917 kg/m³)."
          formula="Melt = (F_net · 86400) / (ρ · L_f)"
          units="mm / day"
          position="top"
          className="w-full"
        >
          <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 flex flex-col justify-between h-full cursor-help transition">
            <div className="flex items-center justify-between text-slate-300 text-xs font-bold">
              <span>Melt Rate</span>
              <Droplets size={16} className="text-blue-400" />
            </div>
            <div className="mt-1.5 font-mono text-xl font-extrabold text-blue-300 tabular-nums">
              {state.meltRate} <span className="text-xs font-normal text-slate-400">mm/day</span>
            </div>
            <div className="text-xs font-bold">
              {state.iceThickness <= 0 ? (
                <span className="text-amber-400">⚠️ Potential (Depleted)</span>
              ) : state.meltPreventedPercent > 0 ? (
                <span className="text-emerald-400">-{state.meltPreventedPercent}% Saved</span>
              ) : (
                <span className="text-rose-300">Active Ablation</span>
              )}
            </div>
          </div>
        </Tooltip>
      </div>

      {/* Energy Partitioning Bar & Glacier Thickness */}
      <div className="mt-3 bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
        <div className="flex flex-wrap items-center justify-between text-xs mb-1.5 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-medium">Solar Energy Partitioning:</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Material c: {state.specificHeatMaterial.toFixed(2)} J/g·°C
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
              1m Ice Melt: {state.timeToMelt1mHours > 9000 ? 'Stable (No Melt)' : `${state.timeToMelt1mHours} hrs`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
            <span className="text-yellow-300">● Reflected ({reflectedPct}%)</span>
            <span className="text-amber-400">● Absorbed ({absorbedPct}%)</span>
            <span className={state.netEnergyTrappedSystem > 0 ? 'text-rose-400 font-bold' : 'text-sky-400 font-bold'}>
              ● Net Trapped: {state.netEnergyTrappedSystem > 0 ? `+${state.netEnergyTrappedSystem}` : state.netEnergyTrappedSystem} W/m²
            </span>
          </div>
        </div>

        {/* Proportional horizontal bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-amber-200 transition-all duration-300"
            style={{ width: `${reflectedPct}%` }}
            title={`Reflected: ${state.reflectedSolar} W/m² (${reflectedPct}%)`}
          />
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
            style={{ width: `${absorbedPct}%` }}
            title={`Absorbed: ${state.absorbedEnergy} W/m² (${absorbedPct}%)`}
          />
        </div>

        {/* Remaining glacier thickness progress bar */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Gauge size={13} className="text-sky-400" />
            <span>Glacier Ice Thickness Remaining:</span>
          </div>
          <span className="font-mono font-bold text-sky-300">{state.iceThickness.toFixed(1)}%</span>
        </div>
        <div className="mt-1 w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              state.iceThickness > 50
                ? 'bg-sky-400'
                : state.iceThickness > 20
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
            style={{ width: `${state.iceThickness}%` }}
          />
        </div>
      </div>
    </div>
  );
};
