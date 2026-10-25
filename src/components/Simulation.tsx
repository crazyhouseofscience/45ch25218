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
      {/* Streamlined 3-Zone Top Bar - Fits 100% Zoom on All Screens */}
      <header className="flex items-center justify-between gap-4 px-5 py-2.5 border-b border-slate-800 bg-slate-900/95 shrink-0">
        {/* Zone 1: Brand & Version */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow-sm">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-white block">
              Arctic Albedo & Energy Simulator
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              Designed by Mr. Keith Chapman 2026 v. 2.2
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Clean & Non-Duplicated) */}
        <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-300">
          <button
            onClick={() => setIsSpecificHeatOpen(true)}
            className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 text-amber-400 font-bold"
          >
            <Flame size={14} className="text-amber-400" />
            <span>Specific Heat Lab</span>
          </button>

          <span className="text-slate-700">|</span>

          <button
            onClick={() => setIsBudgetOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <Calculator size={14} className="text-sky-400" />
            <span>Energy Budget</span>
          </button>

          <span className="text-slate-700">|</span>

          <button
            onClick={() => setIsDashboardOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <BarChart2 size={14} className="text-sky-400" />
            <span>Telemetry</span>
          </button>

          <span className="text-slate-700">|</span>

          <a
            href="https://gml.noaa.gov/education/carbon_toolkit/"
            target="_blank"
            rel="noreferrer"
            className="text-sky-300 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            title="NOAA Global Monitoring Laboratory Carbon Cycle Toolkit"
          >
            <span>NOAA Toolkit ↗</span>
          </a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetAll}
            className="px-3 py-1.5 text-xs font-bold text-rose-200 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
            title="Reset all simulation parameters to defaults"
          >
            <RotateCcw size={13} className="text-rose-400" />
            <span>Reset All</span>
          </button>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Student Guide & Science</span>
          </button>
        </div>
      </header>

      {/* Main Simulation Viewport (Split Layout) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left: Interactive Canvas & Live Metrics */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">


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
