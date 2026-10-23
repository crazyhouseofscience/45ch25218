import { IceCondition } from '../types/simulation';

// Physical constants based on Ray Pierrehumbert (UChicago) and IPCC standards
export const STEFAN_BOLTZMANN = 5.670374e-8; // W / (m^2 * K^4)
export const ICE_EMISSIVITY = 0.97;
export const LATENT_HEAT_FUSION = 3.34e5; // J / kg
export const ICE_DENSITY = 917; // kg / m^3

export interface PhysicsCalculationInput {
  solarIntensity: number;
  microbeadDensity: number;
  co2Concentration: number; // ppm (280 - 1000)
  iceCondition: IceCondition;
  ambientTemp: number;
  iceThickness: number;
}

export function calculatePhysicsMetrics(input: PhysicsCalculationInput) {
  const { solarIntensity, microbeadDensity, co2Concentration, iceCondition, ambientTemp, iceThickness } = input;

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

  // 2. Microbead albedo restoration (high-reflectivity hollow silica glass microspheres)
  // At 100% density, microspheres reflect up to 96% of solar light (albedo 0.96), making solar absorption near-zero (4%).
  const beadCoverageRatio = microbeadDensity / 100;
  const beadReflectivity = 0.96;
  const effectiveAlbedo = Math.min(
    0.96,
    baseAlbedo + (beadReflectivity - baseAlbedo) * Math.pow(beadCoverageRatio, 0.72)
  );

  // 3. Shortwave partitioning (Pierrehumbert Glacier Energy Budget)
  // Calculate precise percentage of incident solar radiation reflected vs. absorbed
  const reflectedSolarPercent = Number((effectiveAlbedo * 100).toFixed(1));
  const absorbedSolarPercent = Number((100 - reflectedSolarPercent).toFixed(1));

  // Energy flux in W/m² strictly partitioned with zero rounding loss: SW↓ = SW↑ + Q_abs
  const reflectedSolar = Math.round(solarIntensity * (reflectedSolarPercent / 100));
  const absorbedEnergy = Math.max(0, solarIntensity - reflectedSolar);

  // 4. Atmospheric CO2 Trapping Ratio (UCAR Center for Science Education model)
  // At 280 ppm (Pre-industrial): ~42% trapped, 58% escapes directly to space.
  // At 425 ppm (Today): ~62% trapped, 38% escapes.
  // At 750 ppm: ~81% trapped, 19% escapes.
  // At 1000 ppm: ~90% trapped, only 10% escapes.
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
  // Solve surface energy balance: ε·σ·T⁴ + h·(T - T_freeze) = absorbedEnergy + downwellingLWBase + h·ambientTemp
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
  // True Stefan-Boltzmann upward longwave radiation from surface
  const reradiantInfrared = Math.round(
    ICE_EMISSIVITY * STEFAN_BOLTZMANN * Math.pow(surfaceKelvin, 4)
  );

  // NOAA Carbon Toolkit Key Concept:
  // 1. Reflected solar (SW↑) is shortwave light: CO2 is transparent to it, so 100% escapes to space!
  const solarEscapingToSpace = reflectedSolar;
  // 2. Solar energy absorbed is what converts into thermal waves (molecular excitation)
  const solarConvertedInfrared = Math.round(absorbedEnergy);

  // 7. Trapped vs Escaped Infrared breakdown (UCAR / NOAA model)
  const infraredTrapped = Math.round(reradiantInfrared * (infraredTrappingPercent / 100));
  const infraredEscapingToSpace = Math.max(0, reradiantInfrared - infraredTrapped);

  // Downwelling greenhouse back-radiation returned to glacier
  const greenhouseBackRadiation = Math.round(
    downwellingLWBase + (co2Concentration / 380) * (infraredTrapped * 0.35)
  );

  // Net Energy Trapped by the System (Atmosphere + Glacier column):
  // Net Trapped = Incident Solar - Total Escaped to Space (SW↑ + LW_escaped)
  // Algebraically equivalent to: Absorbed Solar - Escaped Infrared (Q_abs - LW_escaped)
  const netEnergyTrappedSystem = Math.round(absorbedEnergy - infraredEscapingToSpace);
  const netEnergyTrappedSystemPercent = Number(
    ((netEnergyTrappedSystem / Math.max(1, solarIntensity)) * 100).toFixed(1)
  );

  // 8. Sensible heat flux and Net Glacier Energy Flux (Pierrehumbert)
  const sensibleHeatFlux = Math.round(sensibleHeatCoeff * (ambientTemp - iceSurfaceTemp));
  const netEnergyFlux = absorbedEnergy + greenhouseBackRadiation + sensibleHeatFlux - reradiantInfrared;

  // 9. Glacial Melt Rate (kg/m^2/day and mm/day)
  // Continuous glaciological ablation potential: directly driven by surplus net energy flux
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
  };
}
