export type IceCondition = 'pristine' | 'aged' | 'soot';
export type MicrobeadMaterialType = 'silica' | 'ceramic' | 'polymer' | 'soot' | 'custom';

export interface MaterialThermodynamics {
  id: MicrobeadMaterialType;
  name: string;
  description: string;
  specificHeatJ: number; // J / (kg · °C)
  specificHeatG: number; // J / (g · °C)
  density: number; // kg / m^3
  albedoMax: number; // 0 - 1
  thermalConductivity: number; // W / (m · K)
  formulaSymbol: string;
}

export interface SimulationState {
  // Inputs
  solarIntensity: number; // W/m^2 (200 - 1000)
  microbeadDensity: number; // 0 - 100%
  microbeadMaterial: MicrobeadMaterialType; // silica, ceramic, polymer, soot, custom
  customSpecificHeatG: number; // J / (g · °C) custom override
  co2Concentration: number; // ppm (280 - 1000)
  iceCondition: IceCondition; // pristine snow, aged grey ice, or soot/cryoconite
  ambientTemp: number; // °C (-10 to +15)
  timeSpeed: number; // 1, 5, 20
  isPlaying: boolean;
  heatPulseCount: number; // incremented on interactive heat pulse trigger

  // Visual toggles
  showIncomingRays: boolean;
  showReflectedRays: boolean;
  showReradiantHeat: boolean;
  showCO2Molecules: boolean;
  showGreenhouseTrapping: boolean;
  showMicroscopicView: boolean;
  showEnergyBudgetModal: boolean;
  showSpecificHeatModal: boolean;

  // Dynamic physics metrics
  iceThickness: number; // 0 - 100% (100% is full glacier, 0 is fully melted down to bedrock)
  iceSurfaceTemp: number; // °C
  effectiveAlbedo: number; // 0.05 to 0.95
  reflectedSolarPercent: number; // % of incident solar radiation reflected (effectiveAlbedo * 100)
  absorbedSolarPercent: number; // % of incident solar radiation absorbed ((1 - effectiveAlbedo) * 100)
  reflectedSolar: number; // W/m^2
  absorbedEnergy: number; // W/m^2
  solarConvertedInfrared: number; // W/m^2 (solar energy absorbed and transformed into thermal waves)
  solarEscapingToSpace: number; // W/m^2 (100% of reflected solar passes through CO2 unhindered into space)
  reradiantInfrared: number; // W/m^2 (outgoing LW from surface, Stefan-Boltzmann)
  infraredTrappingPercent: number; // % of upward infrared absorbed by CO2 (scales with CO2 ppm)
  infraredEscapingToSpace: number; // W/m^2 escaping TOA
  infraredTrapped: number; // W/m^2 trapped by CO2
  greenhouseBackRadiation: number; // W/m^2 (downwelling LW re-emitted by CO2)
  sensibleHeatFlux: number; // W/m^2
  netEnergyTrappedSystem: number; // W/m^2 net energy trapped in the atmospheric/glacier column
  netEnergyTrappedSystemPercent: number; // % of total incident solar energy permanently trapped in system
  netEnergyFlux: number; // W/m^2 (surface energy imbalance driving melt)
  meltRate: number; // mm / day
  meltwaterAccumulated: number; // liters / m^2
  meltPreventedPercent: number; // % saved compared to 0% beads
  feedbackLoopActive: boolean; // true when melted down and dark substrate accelerates melt

  // Specific Heat & Latent Heat Thermodynamic Metrics
  specificHeatIce: number; // J / (g · °C), default 2.108
  specificHeatWater: number; // J / (g · °C), default 4.184
  specificHeatMaterial: number; // J / (g · °C) active material specific heat
  sensibleHeatToFuse1m: number; // MJ / m² energy to bring 1m ice column from T_surface to 0°C
  latentHeatToMelt1m: number; // MJ / m² energy to melt 1m ice column at 0°C (306.27 MJ/m²)
  totalEnergyToMelt1m: number; // MJ / m² total energy (sensible + latent)
  timeToMelt1mHours: number; // Hours needed under current net flux
  materialHeatingRateCperMin: number; // °C / min rate of temp rise for material layer under absorbed solar flux
}

export interface EnergyWave {
  id: number;
  type: 'solar_shortwave' | 'reflected_shortwave' | 'infrared_longwave' | 'greenhouse_back_lw' | 'infrared_escaped';
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number; // length of wave packet in pixels
  wavelength: number; // spatial period in pixels (short for solar ~13px, long for infrared ~36px)
  amplitude: number; // peak-to-trough amplitude
  color: string;
  glowColor: string;
  lineWidth: number;
  life: number;
  maxLife: number;
  phase: number;
}

export interface MeltVapor {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface CO2Molecule {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  excitedTimer: number; // vibrates in bending mode when absorbing infrared
  vibrationSpeed: number;
  bendAngle: number;
}
