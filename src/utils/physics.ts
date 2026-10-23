import { IceCondition, MicrobeadMaterialType, MaterialThermodynamics } from '../types/simulation';

// Physical constants based on Ray Pierrehumbert (UChicago) and IPCC standards
export const STEFAN_BOLTZMANN = 5.670374e-8; // W / (m^2 * K^4)
export const ICE_EMISSIVITY = 0.97;
export const LATENT_HEAT_FUSION = 3.34e5; // J / kg (334 J / g)
export const ICE_DENSITY = 917; // kg / m^3
export const SPECIFIC_HEAT_ICE = 2108; // J / (kg · °C) (2.108 J / g · °C)
export const SPECIFIC_HEAT_WATER = 4184; // J / (kg · °C) (4.184 J / g · °C)

export const MATERIALS_THERMODYNAMICS: Record<MicrobeadMaterialType, MaterialThermodynamics> = {
  silica: {
    id: 'silica',
    name: 'Hollow Silica Glass Microspheres',
    description: '35-50 µm glass microspheres with encapsulated air core. Reflects up to 96% of solar radiation.',
    specificHeatJ: 840,
    specificHeatG: 0.84,
    density: 250,
    albedoMax: 0.96,
    thermalConductivity: 0.06,
    formulaSymbol: 'SiO₂ (Hollow)',
  },
  ceramic: {
    id: 'ceramic',
    name: 'Hollow Ceramic Alumina Spheres',
    description: 'High-strength hollow aluminosilicate spheres. Highly durable in sub-zero Arctic conditions.',
    specificHeatJ: 1050,
    specificHeatG: 1.05,
    density: 400,
    albedoMax: 0.88,
    thermalConductivity: 0.12,
    formulaSymbol: 'Al₂O₃ · SiO₂',
  },
  polymer: {
    id: 'polymer',
    name: 'Expanded Hydrophobic PMMA',
    description: 'Lightweight hydrophobic polymer microspheres with high mass-specific heat capacity.',
    specificHeatJ: 1300,
    specificHeatG: 1.30,
    density: 150,
    albedoMax: 0.82,
    thermalConductivity: 0.08,
    formulaSymbol: '(C₅O₂H₈)ₙ',
  },
  soot: {
    id: 'soot',
    name: 'Dark Volcanic Ash / Carbon Soot',
    description: 'Cryoconite pollutant with low albedo and low specific heat, causing rapid surface heating.',
    specificHeatJ: 710,
    specificHeatG: 0.71,
    density: 1800,
    albedoMax: 0.22,
    thermalConductivity: 0.45,
    formulaSymbol: 'C (Cryoconite)',
  },
  custom: {
    id: 'custom',
    name: 'Custom Experimental Material',
    description: 'Custom material layer allowing students to modify specific heat and study temperature rise.',
    specificHeatJ: 1000,
    specificHeatG: 1.00,
    density: 300,
    albedoMax: 0.85,
    thermalConductivity: 0.10,
    formulaSymbol: 'Custom Lab Specimen',
  },
};

export interface PhysicsCalculationInput {
  solarIntensity: number;
  microbeadDensity: number;
  microbeadMaterial?: MicrobeadMaterialType;
  customSpecificHeatG?: number;
  co2Concentration: number;
  iceCondition: IceCondition;
  ambientTemp: number;
  iceThickness: number;
}

export function calculatePhysicsMetrics(input: PhysicsCalculationInput) {
  const {
    solarIntensity,
    microbeadDensity,
    microbeadMaterial = 'silica',
    customSpecificHeatG,
    co2Concentration,
    iceCondition,
    ambientTemp,
    iceThickness,
  } = input;

  // 1. Determine base substrate albedo (Wikipedia Ice-Albedo Feedback model)
  let baseAlbedo: number;
  let feedbackLoopActive = false;

  if (iceThickness <= 0) {
    baseAlbedo = 0.10; // Dark bedrock moraine / deep water
    feedbackLoopActive = true;
  } else {
    switch (iceCondition) {
      case 'pristine':
        baseAlbedo = 0.76;
        break;
      case 'aged':
        baseAlbedo = 0.42;
        break;
      case 'soot':
        baseAlbedo = 0.22;
        break;
      default:
        baseAlbedo = 0.42;
    }

    // Thinning ice exposes dark bedrock below (runaway positive feedback)
    if (iceThickness < 30) {
      const transition = Math.max(0, iceThickness / 30);
      baseAlbedo = 0.10 * (1 - transition) + baseAlbedo * transition;
      if (microbeadDensity < 25) {
        feedbackLoopActive = true;
      }
    }
  }

  // 2. Microbead material albedo & specific heat properties
  const matKey = microbeadMaterial || 'silica';
  const materialDef = MATERIALS_THERMODYNAMICS[matKey] || MATERIALS_THERMODYNAMICS.silica;
  const specificHeatMaterialG = matKey === 'custom' && customSpecificHeatG ? customSpecificHeatG : materialDef.specificHeatG;
  const specificHeatMaterialJ = specificHeatMaterialG * 1000;
  const beadReflectivity = matKey === 'custom' ? 0.88 : materialDef.albedoMax;

  // Microbead albedo restoration
  const beadCoverageRatio = microbeadDensity / 100;
  const effectiveAlbedo = Math.min(
    beadReflectivity,
    baseAlbedo + (beadReflectivity - baseAlbedo) * Math.pow(beadCoverageRatio, 0.72)
  );

  // 3. Shortwave partitioning (Pierrehumbert Glacier Energy Budget)
  const reflectedSolarPercent = Number((effectiveAlbedo * 100).toFixed(1));
  const absorbedSolarPercent = Number((100 - reflectedSolarPercent).toFixed(1));

  // Energy flux in W/m² strictly partitioned: SW↓ = SW↑ + Q_abs
  const reflectedSolar = Math.round(solarIntensity * (reflectedSolarPercent / 100));
  const absorbedEnergy = Math.max(0, solarIntensity - reflectedSolar);

  // 4. Atmospheric CO2 Trapping Ratio (UCAR Center for Science Education model)
  const normCO2 = Math.max(0, Math.min(1, (co2Concentration - 280) / 720));
  const trappingRatio = 0.42 + 0.48 * Math.pow(normCO2, 0.72);
  const infraredTrappingPercent = Math.round(trappingRatio * 100);

  // 5. Radiative Forcing and Atmospheric Downwelling Longwave
  const co2Ratio = Math.max(0.5, co2Concentration / 280);
  const co2Forcing = 5.35 * Math.log(co2Ratio); // IPCC ΔF = 5.35 ln(C/C0)

  const ambientKelvin = ambientTemp + 273.15;
  const atmosphericEmissivity = Math.min(0.96, 0.72 + 0.08 * Math.log(co2Ratio));
  const downwellingLWBase = atmosphericEmissivity * STEFAN_BOLTZMANN * Math.pow(ambientKelvin, 4) + co2Forcing;

  // 6. Surface Temperature & Upward Infrared (NOAA & Pierrehumbert Model)
  const sensibleHeatCoeff = 14; // W / (m^2 * K)
  const T_freeze = 273.15;
  const totalIncomingRadiant = absorbedEnergy + downwellingLWBase;

  // Newton-Raphson solver for non-linear Stefan-Boltzmann surface equilibrium
  let tempK = ambientKelvin;
  for (let iter = 0; iter < 5; iter++) {
    const f = ICE_EMISSIVITY * STEFAN_BOLTZMANN * Math.pow(tempK, 4) + sensibleHeatCoeff * (tempK - T_freeze) - (totalIncomingRadiant + sensibleHeatCoeff * ambientTemp);
    const fPrime = 4 * ICE_EMISSIVITY * STEFAN_BOLTZMANN * Math.pow(tempK, 3) + sensibleHeatCoeff;
    tempK = tempK - f / fPrime;
  }

  const theoreticalTempC = tempK - T_freeze;
  // Phase change plateau: ice cannot exceed 0°C (surplus energy melts ice instead)
  const iceSurfaceTemp = iceThickness > 0 ? Math.min(0, theoreticalTempC) : theoreticalTempC;

  const surfaceKelvin = iceSurfaceTemp + T_freeze;
  const reradiantInfrared = Math.round(
    ICE_EMISSIVITY * STEFAN_BOLTZMANN * Math.pow(surfaceKelvin, 4)
  );

  const solarEscapingToSpace = reflectedSolar;
  const solarConvertedInfrared = Math.round(absorbedEnergy);

  // 7. Trapped vs Escaped Infrared breakdown
  const infraredTrapped = Math.round(reradiantInfrared * (infraredTrappingPercent / 100));
  const infraredEscapingToSpace = Math.max(0, reradiantInfrared - infraredTrapped);

  // Downwelling greenhouse back-radiation returned to glacier
  const greenhouseBackRadiation = Math.round(
    downwellingLWBase + (co2Concentration / 380) * (infraredTrapped * 0.35)
  );

  // Net Energy Trapped by the System
  const netEnergyTrappedSystem = Math.round(absorbedEnergy - infraredEscapingToSpace);
  const netEnergyTrappedSystemPercent = Number(
    ((netEnergyTrappedSystem / Math.max(1, solarIntensity)) * 100).toFixed(1)
  );

  // 8. Sensible heat flux and Net Glacier Energy Flux
  const sensibleHeatFlux = Math.round(sensibleHeatCoeff * (ambientTemp - iceSurfaceTemp));
  const netEnergyFlux = absorbedEnergy + greenhouseBackRadiation + sensibleHeatFlux - reradiantInfrared;

  // 9. Glacial Melt Rate
  let meltRate = 0;
  if (netEnergyFlux > 0) {
    const kgMeltPerDay = (netEnergyFlux * 86400) / LATENT_HEAT_FUSION;
    meltRate = Math.max(0, (kgMeltPerDay / (ICE_DENSITY / 1000)));
  }

  // Baseline comparison (without microbeads)
  const baselineEffectiveAlbedo = (iceCondition === 'pristine' ? 0.76 : iceCondition === 'soot' ? 0.22 : 0.42);
  const baselineAbsorbed = solarIntensity * (1 - baselineEffectiveAlbedo);
  let baselineTempK = ambientKelvin;
  for (let iter = 0; iter < 5; iter++) {
    const f = ICE_EMISSIVITY * STEFAN_BOLTZMANN * Math.pow(baselineTempK, 4) + sensibleHeatCoeff * (baselineTempK - T_freeze) - (baselineAbsorbed + downwellingLWBase + sensibleHeatCoeff * ambientTemp);
    const fPrime = 4 * ICE_EMISSIVITY * STEFAN_BOLTZMANN * Math.pow(baselineTempK, 3) + sensibleHeatCoeff;
    baselineTempK = baselineTempK - f / fPrime;
  }
  const baselineTheoreticalC = baselineTempK - T_freeze;
  const baselineSensible = Math.round(sensibleHeatCoeff * (ambientTemp - Math.min(0, baselineTheoreticalC)));
  const baselineNetFlux = baselineAbsorbed + greenhouseBackRadiation + baselineSensible - reradiantInfrared;

  let baselineMeltRate = 0;
  if (baselineNetFlux > 0) {
    const baselineKgMelt = (baselineNetFlux * 86400) / LATENT_HEAT_FUSION;
    baselineMeltRate = Math.max(0, baselineKgMelt / (ICE_DENSITY / 1000));
  }

  let meltPreventedPercent = 0;
  if (baselineMeltRate > 0) {
    meltPreventedPercent = Math.max(0, Math.min(100, Math.round(((baselineMeltRate - meltRate) / baselineMeltRate) * 100)));
  } else if (microbeadDensity > 0) {
    meltPreventedPercent = 100;
  }

  // 10. Specific Heat & Latent Thermodynamics Calculations
  const iceMassColumn = ICE_DENSITY * 1.0; // 917 kg for 1m depth per m²
  const deltaT = Math.abs(Math.min(0, iceSurfaceTemp));

  // Sensible Heat Q = m * c_ice * ΔT (J and MJ)
  const sensibleHeatToFuse1mJ = iceMassColumn * SPECIFIC_HEAT_ICE * deltaT;
  const sensibleHeatToFuse1m = Number((sensibleHeatToFuse1mJ / 1e6).toFixed(2));

  // Latent Heat of Fusion Q_latent = m * L_f
  const latentHeatToMelt1mJ = iceMassColumn * LATENT_HEAT_FUSION; // 306.278 MJ
  const latentHeatToMelt1m = Number((latentHeatToMelt1mJ / 1e6).toFixed(2));

  const totalEnergyToMelt1m = Number((sensibleHeatToFuse1m + latentHeatToMelt1m).toFixed(2));

  // Time to melt 1m ice column in hours under net energy flux
  let timeToMelt1mHours = 9999;
  if (netEnergyFlux > 0) {
    const totalJoules = sensibleHeatToFuse1mJ + latentHeatToMelt1mJ;
    timeToMelt1mHours = Number((totalJoules / (netEnergyFlux * 3600)).toFixed(1));
  }

  // Material surface layer heating rate (°C / min) for a 100 g/m² surface layer
  const layerMassKg = 0.1;
  const materialHeatingRateCperMin = absorbedEnergy > 0
    ? Number(((absorbedEnergy / (layerMassKg * specificHeatMaterialJ)) * 60).toFixed(2))
    : 0;

  return {
    effectiveAlbedo,
    reflectedSolarPercent,
    absorbedSolarPercent,
    reflectedSolar,
    absorbedEnergy,
    solarConvertedInfrared,
    solarEscapingToSpace,
    reradiantInfrared,
    infraredTrappingPercent,
    infraredEscapingToSpace,
    infraredTrapped,
    greenhouseBackRadiation,
    sensibleHeatFlux,
    netEnergyTrappedSystem,
    netEnergyTrappedSystemPercent,
    iceSurfaceTemp: Number(iceSurfaceTemp.toFixed(1)),
    meltRate: Number(meltRate.toFixed(1)),
    meltPreventedPercent,
    netEnergyFlux: Math.round(netEnergyFlux),
    feedbackLoopActive,

    // Specific Heat & Thermodynamics
    specificHeatIce: 2.108,
    specificHeatWater: 4.184,
    specificHeatMaterial: specificHeatMaterialG,
    sensibleHeatToFuse1m,
    latentHeatToMelt1m,
    totalEnergyToMelt1m,
    timeToMelt1mHours,
    materialHeatingRateCperMin,
  };
}
