import React, { useState, useEffect, useRef } from 'react';
import { SimulationState, MicrobeadMaterialType } from '../types/simulation';
import { MATERIALS_THERMODYNAMICS } from '../utils/physics';
import {
  Play,
  Pause,
  RotateCcw,
  Flame,
  Sun,
  Moon,
  Droplets,
  Sparkles,
  Layers,
  Sliders,
  Zap,
  Info,
  X,
  CheckCircle2,
  TrendingUp,
  Shield,
  Activity
} from 'lucide-react';

interface SpecificHeatLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: SimulationState;
  onChangeMaterial: (mat: MicrobeadMaterialType) => void;
  onChangeCustomSpecificHeat: (val: number) => void;
}

interface RaceSample {
  id: string;
  name: string;
  subLabel: string;
  specificHeat: number; // J/g·°C
  albedo: number; // 0 to 1
  color: string;
  borderColor: string;
  temp: number; // °C (starts at -8°C)
  latentHeatAccumulated: number; // J per gram (out of 334 J/g needed to melt)
  meltPercent: number; // 0 to 100%
  status: 'frozen' | 'warming' | 'melting' | 'melted';
  description: string;
}

export const SpecificHeatLabModal: React.FC<SpecificHeatLabModalProps> = ({
  isOpen,
  onClose,
  state,
  onChangeMaterial,
  onChangeCustomSpecificHeat,
}) => {
  const [activeTab, setActiveTab] = useState<'race' | 'workbench' | 'day_night'>('race');

  // --- TAB 1: LIVE MELT RACE STATE ---
  const [isRacePlaying, setIsRacePlaying] = useState<boolean>(false);
  const [raceSolarFlux, setRaceSolarFlux] = useState<number>(750); // W/m²
  const [raceElapsedSeconds, setRaceElapsedSeconds] = useState<number>(0);

  const initialSamples: RaceSample[] = [
    {
      id: 'ice',
      name: 'Pristine Glacial Ice',
      subLabel: 'Natural Substrate',
      specificHeat: 2.11,
      albedo: 0.76,
      color: 'from-sky-500/20 to-cyan-500/10',
      borderColor: 'border-sky-500/50',
      temp: -8.0,
      latentHeatAccumulated: 0,
      meltPercent: 0,
      status: 'frozen',
      description: 'Reflects 76% of sun. Moderate specific heat means slow, steady warming.',
    },
    {
      id: 'microbeads',
      name: 'Microbead Shield on Ice',
      subLabel: 'Geoengineered Ice',
      specificHeat: 0.84, // Silica microspheres
      albedo: 0.96, // 96% reflected!
      color: 'from-amber-400/20 to-yellow-300/10',
      borderColor: 'border-yellow-400/60',
      temp: -8.0,
      latentHeatAccumulated: 0,
      meltPercent: 0,
      status: 'frozen',
      description: 'Reflects 96% of sunlight before absorption. Zero heat enters the ice!',
    },
    {
      id: 'soot',
      name: 'Dark Soot / Cryoconite',
      subLabel: 'Polluted Ice',
      specificHeat: 0.71, // Dark carbon soot
      albedo: 0.22, // Absorbs 78%!
      color: 'from-stone-600/30 to-neutral-800/40',
      borderColor: 'border-stone-500/60',
      temp: -8.0,
      latentHeatAccumulated: 0,
      meltPercent: 0,
      status: 'frozen',
      description: 'Double trouble: Absorbs 78% of light AND low specific heat means rapid heating.',
    },
    {
      id: 'water',
      name: 'Meltwater Pool on Ice',
      subLabel: 'Liquid Ocean Buffer',
      specificHeat: 4.18, // Liquid water
      albedo: 0.10, // Absorbs 90%!
      color: 'from-blue-600/30 to-indigo-700/20',
      borderColor: 'border-blue-400/60',
      temp: -8.0,
      latentHeatAccumulated: 0,
      meltPercent: 0,
      status: 'frozen',
      description: 'Huge specific heat acts as a heat sponge, storing immense energy.',
    },
  ];

  const [raceSamples, setRaceSamples] = useState<RaceSample[]>(initialSamples);

  // Simulation loop for Race
  useEffect(() => {
    if (!isOpen || !isRacePlaying) return;

    const interval = setInterval(() => {
      setRaceElapsedSeconds((s) => s + 1);

      setRaceSamples((prevSamples) =>
        prevSamples.map((sample) => {
          // Absorbed energy per cm² per second
          // Solar flux in W/m² = J / (m² · s) -> divide by 10,000 for J/(cm²·s)
          // For an effective 10g column (approx 1 cm² x 10 cm deep)
          const absorbedFlux = raceSolarFlux * (1 - sample.albedo); // W/m²
          const joulesPerGramSec = (absorbedFlux / 10000) * 8.0; // accelerated time scale for visual learning

          let newTemp = sample.temp;
          let newLatent = sample.latentHeatAccumulated;
          let newMelt = sample.meltPercent;
          let newStatus = sample.status;

          if (newTemp < 0) {
            // Stage 1: Sensible Heating (Q = m · c · ΔT -> ΔT = Q / (m · c))
            const deltaT = joulesPerGramSec / sample.specificHeat;
            newTemp = Math.min(0, newTemp + deltaT);
            newStatus = newTemp >= 0 ? 'melting' : 'warming';
          } else {
            // Stage 2: Latent Heat of Fusion at 0°C (Q = m · L_f, L_f = 334 J/g)
            newTemp = 0;
            newLatent += joulesPerGramSec;
            newMelt = Math.min(100, (newLatent / 334) * 100);

            if (newMelt >= 100) {
              newStatus = 'melted';
              // If melted, temperature starts climbing as liquid water (c = 4.18)
              const surplusJoules = newLatent - 334;
              newTemp = Math.min(25, Number((surplusJoules / 4.18).toFixed(1)));
            } else {
              newStatus = 'melting';
            }
          }

          return {
            ...sample,
            temp: Number(newTemp.toFixed(1)),
            latentHeatAccumulated: Number(newLatent.toFixed(1)),
            meltPercent: Number(newMelt.toFixed(1)),
            status: newStatus,
          };
        })
      );
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, isRacePlaying, raceSolarFlux]);

  const handleResetRace = () => {
    setIsRacePlaying(false);
    setRaceElapsedSeconds(0);
    setRaceSamples(initialSamples);
  };

  // --- TAB 2: INTERACTIVE THERMAL WORKBENCH ---
  const [benchMaterialKey, setBenchMaterialKey] = useState<MicrobeadMaterialType>('silica');
  const [benchCustomC, setBenchCustomC] = useState<number>(1.0);
  const [benchAlbedo, setBenchAlbedo] = useState<number>(0.96);
  const [benchMassGrams, setBenchMassGrams] = useState<number>(50); // 50g sample
  const [benchTemp, setBenchTemp] = useState<number>(-10.0); // start at -10°C
  const [benchLatentHeat, setBenchLatentHeat] = useState<number>(0);
  const [benchTotalHeatAdded, setBenchTotalHeatAdded] = useState<number>(0);

  // Sync bench material with selection
  const handleSelectBenchMaterial = (key: MicrobeadMaterialType) => {
    setBenchMaterialKey(key);
    onChangeMaterial(key);
    const def = MATERIALS_THERMODYNAMICS[key];
    setBenchAlbedo(def.albedoMax);
    if (key !== 'custom') {
      setBenchCustomC(def.specificHeatG);
    }
  };

  const activeC = benchMaterialKey === 'custom' ? benchCustomC : MATERIALS_THERMODYNAMICS[benchMaterialKey].specificHeatG;

  const handleAddHeatPulse = (joules: number) => {
    // Only a fraction is absorbed based on albedo: Q_absorbed = Q · (1 - albedo)
    const absorbedJ = joules * (1 - benchAlbedo);
    setBenchTotalHeatAdded((prev) => prev + joules);

    setBenchTemp((currT) => {
      let t = currT;
      let latent = benchLatentHeat;

      if (t < 0) {
        // Sensible heat needed to reach 0°C
        const joulesToZero = benchMassGrams * activeC * Math.abs(t);
        if (absorbedJ <= joulesToZero) {
          const deltaT = absorbedJ / (benchMassGrams * activeC);
          return Number((t + deltaT).toFixed(1));
        } else {
          const surplus = absorbedJ - joulesToZero;
          setBenchLatentHeat((prevL) => Math.min(benchMassGrams * 334, prevL + surplus));
          return 0;
        }
      } else {
        // Already at or above 0°C
        const totalLatentNeeded = benchMassGrams * 334;
        if (latent < totalLatentNeeded) {
          const newLatent = Math.min(totalLatentNeeded, latent + absorbedJ);
          setBenchLatentHeat(newLatent);
          if (newLatent >= totalLatentNeeded) {
            const surplus = (latent + absorbedJ) - totalLatentNeeded;
            return Number((surplus / (benchMassGrams * 4.18)).toFixed(1));
          }
          return 0;
        } else {
          // Liquid state
          const deltaT = absorbedJ / (benchMassGrams * 4.18);
          return Number((t + deltaT).toFixed(1));
        }
      }
    });
  };

  const handleResetWorkbench = () => {
    setBenchTemp(-10.0);
    setBenchLatentHeat(0);
    setBenchTotalHeatAdded(0);
  };

  // --- TAB 3: DAY VS NIGHT THERMAL INERTIA ---
  const [isDayTime, setIsDayTime] = useState<boolean>(true);
  const [dayNightPondTemp, setDayNightPondTemp] = useState<number>(6.5);
  const [dayNightIceTemp, setDayNightIceTemp] = useState<number>(-0.2);

  const toggleDayNight = () => {
    setIsDayTime(!isDayTime);
    if (isDayTime) {
      // Switching to night: dry ice cools fast (low heat capacity per area), pond holds heat
      setDayNightIceTemp(-6.0);
      setDayNightPondTemp(4.2); // stays warm and bleeds heat into ice!
    } else {
      // Switching to day
      setDayNightIceTemp(-0.2);
      setDayNightPondTemp(6.5);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Flame size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Specific Heat & Glacier Melt Interactive Lab
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Interactive Experiment
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Discover why specific heat (thermal inertia) and albedo determine how fast glaciers melt or survive.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close Lab"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('race')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'race'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={14} />
            <span>1. Live Melt Race (Side-by-Side Test)</span>
          </button>

          <button
            onClick={() => setActiveTab('workbench')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'workbench'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={14} />
            <span>2. Heat Pulse Workbench (Try Materials)</span>
          </button>

          <button
            onClick={() => setActiveTab('day_night')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'day_night'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon size={14} />
            <span>3. Day vs. Night Meltwater Buffer</span>
          </button>
        </div>

        {/* Lab Viewport Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-300">
          {/* TAB 1: LIVE MELT RACE */}
          {activeTab === 'race' && (
            <div className="space-y-5">
              {/* Top Controls Banner */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsRacePlaying(!isRacePlaying)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md ${
                      isRacePlaying
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {isRacePlaying ? <Pause size={15} /> : <Play size={15} />}
                    <span>{isRacePlaying ? 'Pause Heat Lamp' : 'Start Heat Lamp Race'}</span>
                  </button>

                  <button
                    onClick={handleResetRace}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Samples</span>
                  </button>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-xs">
                    <span className="text-slate-400">Sun Timer:</span>
                    <span className="font-bold text-amber-300">{raceElapsedSeconds}s</span>
                  </div>
                </div>

                {/* Sun Intensity Slider */}
                <div className="flex items-center gap-3 min-w-[260px]">
                  <Sun size={16} className="text-amber-400 shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span>Heat Lamp Flux:</span>
                      <strong className="text-amber-300 font-mono">{raceSolarFlux} W/m²</strong>
                    </div>
                    <input
                      type="range"
                      min="300"
                      max="1000"
                      step="50"
                      value={raceSolarFlux}
                      onChange={(e) => setRaceSolarFlux(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Intuition Banner */}
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-[11px] flex items-center justify-between gap-3 text-amber-200">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-amber-400 shrink-0" />
                  <span>
                    <strong>What to observe:</strong> Watch how fast dark soot warms up (low <em>c</em> + low albedo), while the <strong>Microbead Shield</strong> stays sub-zero because reflecting 96% of sunlight stops heat from ever entering the ice!
                  </span>
                </div>
              </div>

              {/* 4 Interactive Sample Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {raceSamples.map((sample) => {
                  const isMelted = sample.status === 'melted';
                  const isMelting = sample.status === 'melting';
                  const isSafe = sample.id === 'microbeads';

                  return (
                    <div
                      key={sample.id}
                      className={`relative rounded-2xl border ${sample.borderColor} bg-slate-900/90 p-4 flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                        isRacePlaying && !isSafe ? 'ring-1 ring-amber-500/30' : ''
                      }`}
                    >
                      {/* Top Header */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white truncate">{sample.name}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              isSafe
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : isMelted
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : isMelting
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}
                          >
                            {sample.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{sample.subLabel}</span>
                      </div>

                      {/* Visual Simulation Block */}
                      <div className="my-3 relative h-36 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-end overflow-hidden p-2">
                        {/* Sun Ray Beams Animation */}
                        {isRacePlaying && (
                          <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            <div className="absolute top-1 left-3 w-0.5 h-10 bg-yellow-300/60 animate-pulse rotate-12" />
                            <div className="absolute top-1 right-4 w-0.5 h-12 bg-yellow-300/60 animate-pulse -rotate-12" />
                            {sample.id === 'microbeads' && (
                              <div className="absolute top-8 left-6 w-12 h-0.5 bg-yellow-200 rotate-45 shadow-[0_0_8px_#fde047]" />
                            )}
                          </div>
                        )}

                        {/* Ice Mass / Melt visual */}
                        <div
                          className={`w-full rounded-lg transition-all duration-300 flex flex-col items-center justify-center relative ${
                            sample.id === 'microbeads'
                              ? 'bg-gradient-to-t from-sky-400/30 via-sky-200/40 to-white/90 border border-yellow-300/40 shadow-inner'
                              : sample.id === 'soot'
                              ? 'bg-gradient-to-t from-stone-800 to-stone-600 border border-stone-500/50'
                              : sample.id === 'water'
                              ? 'bg-gradient-to-t from-blue-700/60 to-cyan-500/40 border border-blue-400/40'
                              : 'bg-gradient-to-t from-sky-600/40 to-sky-300/30 border border-sky-400/30'
                          }`}
                          style={{
                            height: `${Math.max(12, 100 - sample.meltPercent * 0.85)}%`,
                          }}
                        >
                          {sample.id === 'microbeads' && (
                            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-yellow-200 via-white to-yellow-200 opacity-90 rounded-t-lg flex items-center justify-center gap-1">
                              <Sparkles size={8} className="text-yellow-600" />
                              <span className="text-[7px] font-bold text-slate-900 tracking-tighter">MICROBEADS 96% REFLECT</span>
                            </div>
                          )}

                          {sample.id === 'soot' && (
                            <div className="absolute top-0 inset-x-0 h-2 bg-stone-900/90 rounded-t-lg flex items-center justify-center">
                              <span className="text-[7px] font-bold text-stone-300 tracking-tighter">SOOT LAYER</span>
                            </div>
                          )}

                          <span className="font-mono font-bold text-xs text-white drop-shadow">
                            {sample.temp >= 0 ? `+${sample.temp}°C` : `${sample.temp}°C`}
                          </span>
                        </div>

                        {/* Meltwater Drip Pool at Bottom */}
                        {sample.meltPercent > 0 && (
                          <div
                            className="w-full bg-cyan-500/40 border-t border-cyan-400 rounded-b-lg transition-all"
                            style={{ height: `${sample.meltPercent * 0.25}%` }}
                          />
                        )}
                      </div>

                      {/* Thermometer & Latent Progress */}
                      <div className="space-y-2 font-mono text-[10px]">
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Specific Heat (c):</span>
                          <strong className="text-amber-300">{sample.specificHeat} J/g·°C</strong>
                        </div>

                        <div className="flex justify-between items-center text-slate-300">
                          <span>Solar Albedo (α):</span>
                          <strong className="text-sky-300">{(sample.albedo * 100).toFixed(0)}% Reflected</strong>
                        </div>

                        {/* Melt Progress Bar */}
                        <div>
                          <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                            <span>Ice Melt Progress:</span>
                            <span className={sample.meltPercent > 50 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                              {sample.meltPercent}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-200 ${
                                isSafe ? 'bg-emerald-400' : sample.meltPercent > 70 ? 'bg-rose-500' : 'bg-amber-400'
                              }`}
                              style={{ width: `${sample.meltPercent}%` }}
                            />
                          </div>
                        </div>

                        <p className="text-[10px] font-sans text-slate-400 pt-1 leading-tight line-clamp-2">
                          {sample.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Insight Card */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-white flex items-center gap-2">
                    <Shield size={15} className="text-emerald-400" />
                    <span>The Big Discovery: Albedo Beats Specific Heat Every Time</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 max-w-2xl leading-relaxed">
                    Notice that silica glass has a <em>lower</em> specific heat ($0.84$) than ice ($2.11$) or water ($4.18$). If sunlight were absorbed, it would warm up fast! But because hollow silica spheres have an <strong>albedo of 96%</strong>, they bounce sunlight away instantly. Energy never enters the equation, protecting the glacier permanently.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('workbench')}
                  className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Try Heat Pulse Workbench</span>
                  <Zap size={14} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE THERMAL WORKBENCH */}
          {activeTab === 'workbench' && (
            <div className="space-y-5">
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Sliders size={16} className="text-amber-400" />
                      <span>Interactive Thermal Workbench: Test Any Material & Pulse Heat</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Change specific heat (c), mass (m), or albedo (α), then send heat pulses to observe temperature change: ΔT = Q / (m · c).
                    </p>
                  </div>

                  <button
                    onClick={handleResetWorkbench}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Specimen</span>
                  </button>
                </div>

                {/* Material Buttons */}
                <div className="space-y-2">
                  <span className="font-semibold text-xs text-amber-200">1. Choose Material Specimen:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(Object.keys(MATERIALS_THERMODYNAMICS) as MicrobeadMaterialType[]).map((key) => {
                      const mat = MATERIALS_THERMODYNAMICS[key];
                      const isSelected = benchMaterialKey === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleSelectBenchMaterial(key)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-amber-950/70 border-amber-500 text-white shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="font-bold text-xs truncate">{mat.name.split(' ')[0]} {mat.name.split(' ')[1] || ''}</span>
                          <span className="text-[10px] font-mono text-amber-300 mt-1">
                            c = {mat.specificHeatG} J/g·°C
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Workbench Visual Chamber & Live Thermometer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  {/* Left: Specimen Chamber */}
                  <div className="md:col-span-2 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="font-bold text-xs text-white">Specimen Test Chamber</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Total Energy Absorbed: <strong className="text-amber-300">{benchTotalHeatAdded} J</strong>
                      </span>
                    </div>

                    {/* Visual Chamber Container */}
                    <div className="my-4 h-40 relative rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                      {/* Incoming Photons beam when pulsed */}
                      <div className="text-center space-y-2 z-10">
                        <div className="inline-block p-4 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl">
                          <span className="text-2xl font-black font-mono text-amber-300">
                            {benchTemp >= 0 ? `+${benchTemp}°C` : `${benchTemp}°C`}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            {benchTemp < 0 ? 'Sub-Zero Solid Ice' : benchLatentHeat < benchMassGrams * 334 ? 'Melting Plateau (0°C)' : 'Liquid Meltwater'}
                          </span>
                        </div>

                        {/* Latent Heat reservoir progress */}
                        {benchTemp === 0 && (
                          <div className="w-56 mx-auto bg-slate-800/90 p-2 rounded-lg border border-slate-700 text-left">
                            <div className="flex justify-between text-[9px] text-amber-300 font-mono mb-1">
                              <span>Latent Fusion Absorbed:</span>
                              <span>{((benchLatentHeat / (benchMassGrams * 334)) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-400 transition-all"
                                style={{ width: `${(benchLatentHeat / (benchMassGrams * 334)) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Interactive Heat Pulse Buttons */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-semibold text-slate-300">Fire Heat Pulse into Material:</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleAddHeatPulse(250)}
                          className="py-2 px-3 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Zap size={14} />
                          <span>+250 Joules</span>
                        </button>
                        <button
                          onClick={() => handleAddHeatPulse(1000)}
                          className="py-2 px-3 bg-amber-600/40 hover:bg-amber-600/60 border border-amber-500/60 text-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Zap size={14} />
                          <span>+1,000 Joules</span>
                        </button>
                        <button
                          onClick={() => handleAddHeatPulse(5000)}
                          className="py-2 px-3 bg-rose-600/40 hover:bg-rose-600/60 border border-rose-500/60 text-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Flame size={14} />
                          <span>+5,000 Joules</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right: Sliders & Parameter Modifiers */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-4 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-xs text-white block mb-2">Adjust Material Properties:</span>

                      {/* Slider: Specific Heat Capacity c */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300">Specific Heat (c):</span>
                          <strong className="text-amber-300 font-mono">{activeC.toFixed(2)} J/g·°C</strong>
                        </div>
                        <input
                          type="range"
                          min="0.30"
                          max="4.50"
                          step="0.05"
                          value={activeC}
                          onChange={(e) => {
                            setBenchMaterialKey('custom');
                            setBenchCustomC(Number(e.target.value));
                            onChangeCustomSpecificHeat(Number(e.target.value));
                          }}
                          className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                          <span>0.30 (Metals/Soot)</span>
                          <span>2.11 (Ice)</span>
                          <span>4.18 (Water)</span>
                        </div>
                      </div>

                      {/* Slider: Albedo */}
                      <div className="space-y-1 mb-3">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300">Surface Albedo (α):</span>
                          <strong className="text-sky-300 font-mono">{(benchAlbedo * 100).toFixed(0)}%</strong>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="0.98"
                          step="0.01"
                          value={benchAlbedo}
                          onChange={(e) => setBenchAlbedo(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-sky-400"
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                          <span>5% (Ocean)</span>
                          <span>22% (Soot)</span>
                          <span>96% (Microbeads)</span>
                        </div>
                      </div>

                      {/* Slider: Mass */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300">Sample Mass (m):</span>
                          <strong className="text-emerald-300 font-mono">{benchMassGrams} grams</strong>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          step="5"
                          value={benchMassGrams}
                          onChange={(e) => setBenchMassGrams(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-1">
                      <div className="text-amber-200 font-bold">Physics Equation:</div>
                      <div>Sensible: ΔT = Q / (m · c)</div>
                      <div>Melting: Q = m · 334 J/g</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DAY VS NIGHT THERMAL INERTIA */}
          {activeTab === 'day_night' && (
            <div className="space-y-5">
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Moon size={16} className="text-blue-400" />
                      <span>Why Liquid Meltwater Acts as a "Thermal Battery" on Glaciers</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Toggle between Arctic Day (Sun ON) and Arctic Night (Sun OFF) to see why high specific heat water keeps melting ice even in the dark.
                    </p>
                  </div>

                  <button
                    onClick={toggleDayNight}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md ${
                      isDayTime
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500'
                    }`}
                  >
                    {isDayTime ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
                    <span>{isDayTime ? 'Switch to Arctic Night (Sun OFF)' : 'Switch to Arctic Day (Sun ON)'}</span>
                  </button>
                </div>

                {/* Day vs Night Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Dry Glacial Ice */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-sky-200">Dry Glacier Ice Surface</span>
                      <span className="text-[10px] font-mono text-sky-400">c = 2.11 J/g·°C</span>
                    </div>

                    <div className="h-32 rounded-xl bg-sky-950/40 border border-sky-800/40 flex flex-col items-center justify-center p-3 text-center">
                      <span className="text-3xl font-bold font-mono text-sky-300">
                        {dayNightIceTemp}°C
                      </span>
                      <span className="text-[11px] text-slate-300 mt-1">
                        {isDayTime ? 'Near 0°C under sun' : 'Rapidly drops to -6.0°C in the dark!'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Dry ice has half the heat capacity of liquid water. As soon as the sun sets, dry ice radiates its heat away to space and <strong>freezes solid, stopping any melt immediately</strong>.
                    </p>
                  </div>

                  {/* Right: Liquid Meltwater Pond */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-blue-200">Meltwater Pond on Glacier</span>
                      <span className="text-[10px] font-mono text-blue-400">c = 4.18 J/g·°C (2× Higher!)</span>
                    </div>

                    <div className="h-32 rounded-xl bg-blue-950/40 border border-blue-800/40 flex flex-col items-center justify-center p-3 text-center">
                      <span className="text-3xl font-bold font-mono text-amber-300">
                        +{dayNightPondTemp}°C
                      </span>
                      <span className="text-[11px] text-amber-200 mt-1 font-semibold">
                        {isDayTime ? 'Absorbs 90% of solar light' : 'Retains heat at +4.2°C, melting ice all night!'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Because water's specific heat is so high (4.18 J/g·°C), the pond acts as a <strong>thermal battery</strong>. It stays warm through the Arctic night, transferring heat downwards by thermal conduction and drilling tunnels (moulins) through the glacier.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-400">
            Designed by Mr. Keith Chapman 2026 v. 2.0 using Google AI Studio.
          </span>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition shadow cursor-pointer"
          >
            Close Lab Module
          </button>
        </div>
      </div>
    </div>
  );
};
