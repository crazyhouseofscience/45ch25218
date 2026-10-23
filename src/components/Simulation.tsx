import React, { useState, useEffect, useCallback } from 'react';
import { SimulationState, IceCondition, MicrobeadMaterialType } from '../types/simulation';
import { calculatePhysicsMetrics } from '../utils/physics';
import { GlacierCanvas } from './GlacierCanvas';
import { MetricsPanel } from './MetricsPanel';
import { ControlDeck } from './ControlDeck';
import { EducationalGuide } from './EducationalGuide';
import { EnergyBudgetModal } from './EnergyBudgetModal';
import { ClimateDataDashboard } from './ClimateDataDashboard';
import { SpecificHeatLabModal } from './SpecificHeatLabModal';
import { BookOpen, Sparkles, Calculator, BarChart2, RotateCcw, Flame } from 'lucide-react';

export default function Simulation() {
  const [state, setState] = useState<SimulationState>({
    solarIntensity: 700,
    microbeadDensity: 0,
    microbeadMaterial: 'silica',
    customSpecificHeatG: 1.0,
    co2Concentration: 425,
    iceCondition: 'aged',
    ambientTemp: 2,
    timeSpeed: 1,
    isPlaying: true,
    heatPulseCount: 0,

    showIncomingRays: true,
    showReflectedRays: true,
    showReradiantHeat: true,
    showCO2Molecules: true,
    showGreenhouseTrapping: true,
    showMicroscopicView: true,
    showEnergyBudgetModal: false,
    showSpecificHeatModal: false,

    iceThickness: 100,
    iceSurfaceTemp: 0,
    effectiveAlbedo: 0.42,
    reflectedSolarPercent: 42.0,
    absorbedSolarPercent: 58.0,
    reflectedSolar: 294,
    absorbedEnergy: 406,
    solarConvertedInfrared: 406,
    solarEscapingToSpace: 294,
    reradiantInfrared: 307,
    infraredTrappingPercent: 62,
    infraredEscapingToSpace: 120,
    infraredTrapped: 195,
    greenhouseBackRadiation: 245,
    sensibleHeatFlux: 28,
    netEnergyTrappedSystem: 286,
    netEnergyTrappedSystemPercent: 40.9,
    netEnergyFlux: 160,
    meltRate: 8.5,
    meltwaterAccumulated: 0,
    meltPreventedPercent: 0,
    feedbackLoopActive: false,

    specificHeatIce: 2.108,
    specificHeatWater: 4.184,
    specificHeatMaterial: 0.84,
    sensibleHeatToFuse1m: 0,
    latentHeatToMelt1m: 306.28,
    totalEnergyToMelt1m: 306.28,
    timeToMelt1mHours: 9999,
    materialHeatingRateCperMin: 0,
  });

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isSpecificHeatOpen, setIsSpecificHeatOpen] = useState<boolean>(false);

  // Helper to update state and synchronously calculate physics metrics
  const updateWithPhysics = (prev: SimulationState, patch: Partial<SimulationState>): SimulationState => {
    const next = { ...prev, ...patch };
    const metrics = calculatePhysicsMetrics({
      solarIntensity: next.solarIntensity,
      microbeadDensity: next.microbeadDensity,
      microbeadMaterial: next.microbeadMaterial,
      customSpecificHeatG: next.customSpecificHeatG,
      co2Concentration: next.co2Concentration,
      iceCondition: next.iceCondition,
      ambientTemp: next.ambientTemp,
      iceThickness: next.iceThickness,
    });
    return {
      ...next,
      ...metrics,
    };
  };

  // Handlers for sliders & material selector
  const handleSolarChange = (val: number) => {
    setState((prev) => updateWithPhysics(prev, { solarIntensity: val }));
  };

  const handleMicrobeadsChange = (val: number) => {
    setState((prev) => updateWithPhysics(prev, { microbeadDensity: val }));
  };

  const handleMaterialChange = (mat: MicrobeadMaterialType) => {
    setState((prev) => updateWithPhysics(prev, { microbeadMaterial: mat }));
  };

  const handleCustomSpecificHeatChange = (val: number) => {
    setState((prev) => updateWithPhysics(prev, { customSpecificHeatG: val }));
  };

  const handleFireHeatPulse = (joules: number) => {
    setState((prev) => {
      const activeC = prev.specificHeatMaterial || 0.84;
      const absorbedJ = joules * (1 - prev.effectiveAlbedo);
      const layerMassGrams = 100; // 100g sample layer
      const deltaT = absorbedJ / (layerMassGrams * activeC);

      const newTemp = Math.min(15, prev.iceSurfaceTemp + deltaT);
      const nextCount = (prev.heatPulseCount || 0) + 1;

      return updateWithPhysics(
        { ...prev, heatPulseCount: nextCount },
        { iceSurfaceTemp: Number(newTemp.toFixed(1)) }
      );
    });
  };

  const handleCO2Change = (val: number) => {
    setState((prev) => updateWithPhysics(prev, { co2Concentration: val }));
  };

  const handleIceConditionChange = (cond: IceCondition) => {
    setState((prev) =>
      updateWithPhysics(prev, {
        iceCondition: cond,
        // Reset microbeads to 0 when explicitly selecting a natural ice condition
        // so the natural surface albedo (Pristine = 0.76) takes immediate effect!
        microbeadDensity: 0,
        // Restore thickness to 100% on Pristine click so auto-aging doesn't override
        iceThickness: cond === 'pristine' ? 100 : prev.iceThickness,
      })
    );
  };

  const handleAmbientTempChange = (val: number) => {
    setState((prev) => updateWithPhysics(prev, { ambientTemp: val }));
  };

  const handleIceThicknessChange = (val: number) => {
    setState((prev) => updateWithPhysics(prev, { iceThickness: val }));
  };

  const handleTogglePlay = () => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleChangeSpeed = (spd: number) => {
    setState((prev) => ({ ...prev, timeSpeed: spd }));
  };

  const handleResetIce = () => {
    setState((prev) =>
      updateWithPhysics(prev, {
        iceThickness: 100,
        meltwaterAccumulated: 0,
      })
    );
  };

  const handleResetAll = () => {
    setState((prev) =>
      updateWithPhysics(prev, {
        solarIntensity: 700,
        microbeadDensity: 0,
        co2Concentration: 425,
        iceCondition: 'aged',
        ambientTemp: 2,
        iceThickness: 100,
        timeSpeed: 1,
        isPlaying: true,
        meltwaterAccumulated: 0,
        showIncomingRays: true,
        showReflectedRays: true,
        showReradiantHeat: true,
        showCO2Molecules: true,
        showGreenhouseTrapping: true,
      })
    );
  };

  const handleToggleIncoming = () => {
    setState((prev) => ({ ...prev, showIncomingRays: !prev.showIncomingRays }));
  };

  const handleToggleReflected = () => {
    setState((prev) => ({ ...prev, showReflectedRays: !prev.showReflectedRays }));
  };

  const handleToggleReradiant = () => {
    setState((prev) => ({ ...prev, showReradiantHeat: !prev.showReradiantHeat }));
  };

  const handleToggleCO2Molecules = () => {
    setState((prev) => ({ ...prev, showCO2Molecules: !prev.showCO2Molecules }));
  };

  const handleToggleGreenhouseTrapping = () => {
    setState((prev) => ({ ...prev, showGreenhouseTrapping: !prev.showGreenhouseTrapping }));
  };

  const handleUpdateIce = useCallback((newThickness: number, meltDelta: number) => {
    setState((prev) => {
      let newCondition = prev.iceCondition;
      // Auto-age pristine ice only when it melts below 50%
      if (newThickness < 50 && newCondition === 'pristine') {
        newCondition = 'aged';
      }
      if (newThickness < 20 && newCondition === 'aged') {
        newCondition = 'soot';
      }

      return updateWithPhysics(prev, {
        iceThickness: newThickness,
        iceCondition: newCondition,
        meltwaterAccumulated: prev.meltwaterAccumulated + meltDelta * 10,
      });
    });
  }, []);

  // Presets
  const handleApplyPreset = (presetKey: string) => {
    if (presetKey === 'untreated') {
      setState((prev) =>
        updateWithPhysics(prev, {
          solarIntensity: 750,
          microbeadDensity: 0,
          co2Concentration: 425,
          iceCondition: 'aged',
          ambientTemp: 3,
          iceThickness: 100,
          isPlaying: true,
        })
      );
    } else if (presetKey === 'microbeads') {
      setState((prev) =>
        updateWithPhysics(prev, {
          solarIntensity: 750,
          microbeadDensity: 100,
          co2Concentration: 425,
          iceCondition: 'aged',
          ambientTemp: 3,
          iceThickness: 100,
          isPlaying: true,
        })
      );
    } else if (presetKey === 'highco2') {
      setState((prev) =>
        updateWithPhysics(prev, {
          solarIntensity: 800,
          microbeadDensity: 0,
          co2Concentration: 750,
          iceCondition: 'soot',
          ambientTemp: 4,
          iceThickness: 100,
          isPlaying: true,
        })
      );
    }
  };

  const handleApplyChallenge = (beads: number, solar: number, co2?: number) => {
    setState((prev) =>
      updateWithPhysics(prev, {
        microbeadDensity: beads,
        solarIntensity: solar,
        co2Concentration: co2 ?? prev.co2Concentration,
        iceThickness: 100,
        isPlaying: true,
      })
    );
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* Top Bar following Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-800 bg-slate-900/90 shrink-0">
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block">
              Arctic Albedo, CO₂ & Radiant Energy Simulator
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              Designed by Mr. Keith Chapman 2026 v. 2.0 using Google AI Studio.
            </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-300">
          <a
            href="https://gml.noaa.gov/education/carbon_toolkit/"
            target="_blank"
            rel="noreferrer"
            className="text-sky-300 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 font-semibold"
            title="NOAA Global Monitoring Laboratory Carbon Cycle Toolkit"
          >
            <span>NOAA Carbon Toolkit</span>
            <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1 py-0.5 rounded border border-sky-400/30">NOAA.gov ↗</span>
          </a>
          <button
            onClick={() => setIsSpecificHeatOpen(true)}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1 text-amber-400 font-semibold"
          >
            <Flame size={13} className="text-amber-400" />
            <span>Specific Heat & Melt Lab</span>
          </button>
          <button
            onClick={() => setIsBudgetOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Calculator size={13} className="text-sky-400" />
            <span>Pierrehumbert Energy Budget</span>
          </button>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            UCAR: How CO₂ Traps Infrared
          </button>
          <button
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Ice-Albedo Positive Feedback
          </button>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsSpecificHeatOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-amber-200 bg-amber-950/70 hover:bg-amber-900 border border-amber-700/70 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            title="Open Specific Heat & Glacier Melt Interactive Lab"
          >
            <Flame size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Specific Heat Lab</span>
          </button>

          <button
            onClick={handleResetAll}
            className="px-3 py-1.5 text-xs font-semibold text-rose-200 bg-rose-950/70 hover:bg-rose-900 border border-rose-700/70 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            title="Reset all simulation parameters to defaults"
          >
            <RotateCcw size={14} className="text-rose-400" />
            <span>Reset All</span>
          </button>

          <button
            onClick={() => setIsDashboardOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BarChart2 size={14} className="text-sky-400" />
            <span className="hidden sm:inline">Telemetry Dashboard</span>
          </button>

          <button
            onClick={() => setIsBudgetOpen(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Calculator size={14} className="text-sky-400" />
            <span className="hidden sm:inline">Energy Budget</span>
          </button>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Student Guide & Lab</span>
          </button>
        </div>
      </header>

      {/* Main Simulation Viewport (Split Layout) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left: Interactive Canvas & Live Metrics */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Chromebook Quick Control Strip - High Visibility for Albedo, Microbeads & Solar */}
          <div className="bg-slate-900 border-b border-slate-800 p-2 px-4 flex flex-wrap items-center justify-between gap-2 shrink-0 z-10 shadow-md">
            {/* Quick Albedo Controls */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-sky-300 whitespace-nowrap">🧊 Ice Albedo:</span>
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-700">
                <button
                  onClick={() => handleIceConditionChange('pristine')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    state.iceCondition === 'pristine' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Pristine Snowpack (Albedo 0.76)"
                >
                  ❄️ Pristine (0.76)
                </button>
                <button
                  onClick={() => handleIceConditionChange('aged')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    state.iceCondition === 'aged' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Aged Glacial Ice (Albedo 0.42)"
                >
                  🧊 Aged (0.42)
                </button>
                <button
                  onClick={() => handleIceConditionChange('soot')}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    state.iceCondition === 'soot' ? 'bg-rose-500 text-white shadow' : 'text-slate-300 hover:text-white'
                  }`}
                  title="Dark Soot Deposits (Albedo 0.22)"
                >
                  🌋 Dark Soot (0.22)
                </button>
              </div>
            </div>

            {/* Quick Microbead Shield Controls */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-yellow-300 whitespace-nowrap">🔮 Microbeads Shield:</span>
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-700">
                <button
                  onClick={() => handleMicrobeadsChange(0)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    state.microbeadDensity === 0 ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  0% (Off)
                </button>
                <button
                  onClick={() => handleMicrobeadsChange(50)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    state.microbeadDensity === 50 ? 'bg-yellow-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  50%
                </button>
                <button
                  onClick={() => handleMicrobeadsChange(100)}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                    state.microbeadDensity === 100 ? 'bg-sky-400 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  100% Shield
                </button>
              </div>
            </div>

            {/* Quick Solar Transmission Controls */}
            <div className="hidden xl:flex items-center gap-1.5 text-xs">
              <span className="font-bold text-amber-300 whitespace-nowrap">☀️ Solar Power:</span>
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-700">
                {[300, 700, 1000].map((sVal) => (
                  <button
                    key={sVal}
                    onClick={() => handleSolarChange(sVal)}
                    className={`px-2 py-1 rounded-md text-xs font-mono font-bold transition cursor-pointer ${
                      state.solarIntensity === sVal ? 'bg-amber-500 text-slate-950' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {sVal} W/m²
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Heat Trigger */}
            <button
              onClick={() => setIsSpecificHeatOpen(true)}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow transition cursor-pointer flex items-center gap-1"
            >
              <Flame size={13} className="fill-slate-950" />
              <span>Specific Heat Lab ↗</span>
            </button>
          </div>

          {/* Glacier Canvas Stage */}
          <div className="flex-1 relative min-h-0 overflow-hidden">
            <GlacierCanvas
              state={state}
              onUpdateIce={handleUpdateIce}
              onUpdateMicrobeads={handleMicrobeadsChange}
              onChangeMaterial={handleMaterialChange}
              onChangeCustomSpecificHeat={handleCustomSpecificHeatChange}
              onFireHeatPulse={handleFireHeatPulse}
              onOpenEnergyBudget={() => setIsBudgetOpen(true)}
              onResetIce={handleResetIce}
            />
          </div>

          {/* Bottom Telemetry Metrics Panel */}
          <div className="shrink-0">
            <MetricsPanel state={state} />
          </div>
        </div>

        {/* Right: Parameter Controls & Scenarios */}
        <div className="shrink-0 flex">
          <ControlDeck
            state={state}
            onChangeSolar={handleSolarChange}
            onChangeMicrobeads={handleMicrobeadsChange}
            onChangeMaterial={handleMaterialChange}
            onChangeCustomSpecificHeat={handleCustomSpecificHeatChange}
            onFireHeatPulse={handleFireHeatPulse}
            onOpenSpecificHeatModal={() => setIsSpecificHeatOpen(true)}
            onChangeCO2={handleCO2Change}
            onChangeIceCondition={handleIceConditionChange}
            onChangeAmbientTemp={handleAmbientTempChange}
            onChangeIceThickness={handleIceThicknessChange}
            onTogglePlay={handleTogglePlay}
            onChangeSpeed={handleChangeSpeed}
            onResetIce={handleResetIce}
            onResetAll={handleResetAll}
            onToggleIncoming={handleToggleIncoming}
            onToggleReflected={handleToggleReflected}
            onToggleReradiant={handleToggleReradiant}
            onToggleCO2Molecules={handleToggleCO2Molecules}
            onToggleGreenhouseTrapping={handleToggleGreenhouseTrapping}
            onApplyPreset={handleApplyPreset}
          />
        </div>
      </div>

      {/* Educational Guide & Student Experiment Modal */}
      <EducationalGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onApplyChallenge={handleApplyChallenge}
      />

      {/* Ray Pierrehumbert Energy Budget Modal */}
      <EnergyBudgetModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        state={state}
      />

      {/* Real-Time Climate Telemetry Dashboard (Recharts) */}
      <ClimateDataDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        state={state}
      />

      {/* Specific Heat & Glacier Melt Interactive Lab Modal */}
      <SpecificHeatLabModal
        isOpen={isSpecificHeatOpen}
        onClose={() => setIsSpecificHeatOpen(false)}
        state={state}
        onChangeMaterial={handleMaterialChange}
        onChangeCustomSpecificHeat={handleCustomSpecificHeatChange}
      />
    </div>
  );
}
