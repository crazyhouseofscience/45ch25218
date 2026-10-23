import React, { useState, useEffect, useCallback } from 'react';
import { SimulationState, IceCondition } from '../types/simulation';
import { calculatePhysicsMetrics } from '../utils/physics';
import { GlacierCanvas } from './GlacierCanvas';
import { MetricsPanel } from './MetricsPanel';
import { ControlDeck } from './ControlDeck';
import { EducationalGuide } from './EducationalGuide';
import { EnergyBudgetModal } from './EnergyBudgetModal';
import { ClimateDataDashboard } from './ClimateDataDashboard';
import { BookOpen, Sparkles, Calculator, BarChart2 } from 'lucide-react';

export default function Simulation() {
  const [state, setState] = useState<SimulationState>({
    solarIntensity: 700,
    microbeadDensity: 0,
    co2Concentration: 425,
    iceCondition: 'aged',
    ambientTemp: 2,
    timeSpeed: 1,
    isPlaying: true,

    showIncomingRays: true,
    showReflectedRays: true,
    showReradiantHeat: true,
    showCO2Molecules: true,
    showGreenhouseTrapping: true,
    showMicroscopicView: true,
    showEnergyBudgetModal: false,

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
  });

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);

  // Helper to update state and synchronously calculate physics metrics
  const updateWithPhysics = (prev: SimulationState, patch: Partial<SimulationState>): SimulationState => {
    const next = { ...prev, ...patch };
    const metrics = calculatePhysicsMetrics({
      solarIntensity: next.solarIntensity,
      microbeadDensity: next.microbeadDensity,
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

  // Handlers for sliders
  const handleSolarChange = (val: number) => {
    setState((prev) => updateWithPhysics(prev, { solarIntensity: val }));
  };

  const handleMicrobeadsChange = (val: number) => {
    setState((prev) => updateWithPhysics(prev, { microbeadDensity: val }));
  };

  const handleCO2Change = (val: number) => {
    setState((prev) => updateWithPhysics(prev, { co2Concentration: val }));
  };

  const handleIceConditionChange = (cond: IceCondition) => {
    setState((prev) => updateWithPhysics(prev, { iceCondition: cond }));
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
      if (newThickness < 70 && newCondition === 'pristine') {
        newCondition = 'aged';
      }
      if (newThickness < 30 && newCondition === 'aged') {
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
          <span className="text-base font-bold tracking-tight text-white">
            Arctic Albedo, CO₂ & Radiant Energy Simulator
          </span>
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
          <button
            onClick={() => setIsGuideOpen(true)}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Microbead Geoengineering
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
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
          {/* Glacier Canvas Stage */}
          <div className="flex-1 relative min-h-0 overflow-hidden">
            <GlacierCanvas
              state={state}
              onUpdateIce={handleUpdateIce}
              onUpdateMicrobeads={handleMicrobeadsChange}
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
            onChangeCO2={handleCO2Change}
            onChangeIceCondition={handleIceConditionChange}
            onChangeAmbientTemp={handleAmbientTempChange}
            onChangeIceThickness={handleIceThicknessChange}
            onTogglePlay={handleTogglePlay}
            onChangeSpeed={handleChangeSpeed}
            onResetIce={handleResetIce}
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
    </div>
  );
}
