import React, { useEffect, useRef, useState } from 'react';
import { SimulationState, EnergyWave, MeltVapor, CO2Molecule, MicrobeadMaterialType } from '../types/simulation';
import { ZoomIn, Minimize2, Sparkles, Wind, Eye, Droplets, Info, Flame, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

import { MicrobeadReflectionOverlay } from './MicrobeadReflectionOverlay';

interface GlacierCanvasProps {
  state: SimulationState;
  onUpdateIce: (newThickness: number, meltDelta: number) => void;
  onUpdateMicrobeads?: (val: number) => void;
  onChangeMaterial?: (mat: MicrobeadMaterialType) => void;
  onChangeCustomSpecificHeat?: (val: number) => void;
  onFireHeatPulse?: (joules: number) => void;
  onOpenEnergyBudget?: () => void;
  onResetIce?: () => void;
}

interface FloatingIceberg {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
}

export const GlacierCanvas: React.FC<GlacierCanvasProps> = ({
  state,
  onUpdateIce,
  onUpdateMicrobeads,
  onChangeMaterial,
  onChangeCustomSpecificHeat,
  onFireHeatPulse,
  onOpenEnergyBudget,
  onResetIce,
}) => {
  const stateRef = useRef(state);
  stateRef.current = state;
  const onUpdateIceRef = useRef(onUpdateIce);
  onUpdateIceRef.current = onUpdateIce;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wavesRef = useRef<EnergyWave[]>([]);
  const vaporsRef = useRef<MeltVapor[]>([]);
  const co2MoleculesRef = useRef<CO2Molecule[]>([]);
  const icebergsRef = useRef<FloatingIceberg[]>([
    { x: 30, y: 0, width: 34, height: 16, vx: -4 },
    { x: 100, y: 0, width: 26, height: 12, vx: -3 },
    { x: 160, y: 0, width: 40, height: 20, vx: -5 },
  ]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const [showZoomInset, setShowZoomInset] = useState<boolean>(false);
  const [showMicrobeadOverlay, setShowMicrobeadOverlay] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);
  const [zoomMode, setZoomMode] = useState<'beads' | 'co2_vibrate' | 'lattice'>('lattice');

  // Surface elevation profile generator based on ice thickness
  const getSurfaceY = (x: number, width: number, height: number, thickness: number) => {
    const bedrockY = height * 0.88;
    const maxIceY = height * 0.48; // Higher, more majestic glacier
    const baseCurrentY = bedrockY - (bedrockY - maxIceY) * (thickness / 100);

    const slope = ((width - x) / width) * 55;
    const wave1 = Math.sin(x * 0.012) * 9;
    const wave2 = Math.cos(x * 0.024) * 5;
    return baseCurrentY - slope + wave1 + wave2;
  };

  // Helper function to draw an electromagnetic wave packet
  const drawWavePacket = (
    ctx: CanvasRenderingContext2D,
    wave: EnergyWave,
    time: number
  ) => {
    const headX = wave.x;
    const headY = wave.y;
    const speed = Math.sqrt(wave.vx * wave.vx + wave.vy * wave.vy);
    if (speed < 0.1) return;

    const ux = wave.vx / speed;
    const uy = wave.vy / speed;
    const nx = -uy;
    const ny = ux;

    const packetLength = wave.length;
    const steps = 28;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = wave.color;
    ctx.lineWidth = wave.lineWidth;
    ctx.shadowColor = wave.glowColor;
    ctx.shadowBlur = wave.type === 'infrared_longwave' ? 8 : 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i <= steps; i++) {
      const s = (i / steps) * packetLength;
      const distFromHead = s - packetLength;
      const envelope = Math.sin((i / steps) * Math.PI);
      const spatialAngle = (s / wave.wavelength) * Math.PI * 2 + wave.phase + time * 0.016;
      const displacement = wave.amplitude * envelope * Math.sin(spatialAngle);

      const px = headX + ux * distFromHead + nx * displacement;
      const py = headY + uy * distFromHead + ny * displacement;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Arrowhead oriented along velocity vector
    const arrowLen = wave.type === 'infrared_longwave' ? 9 : 7;
    const arrowWidth = wave.type === 'infrared_longwave' ? 5 : 4;
    ctx.fillStyle = wave.color;
    ctx.beginPath();
    ctx.moveTo(headX, headY);
    ctx.lineTo(
      headX - ux * arrowLen + nx * arrowWidth,
      headY - uy * arrowLen + ny * arrowWidth
    );
    ctx.lineTo(
      headX - ux * (arrowLen * 0.6),
      headY - uy * (arrowLen * 0.6)
    );
    ctx.lineTo(
      headX - ux * arrowLen - nx * arrowWidth,
      headY - uy * arrowLen - ny * arrowWidth
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  };

  // Initialize CO2 molecules in the atmosphere
  useEffect(() => {
    const count = Math.max(14, Math.floor((state.co2Concentration / 1000) * 48));
    const molecules: CO2Molecule[] = [];
    for (let i = 0; i < count; i++) {
      molecules.push({
        id: i,
        x: 40 + Math.random() * 880,
        y: 65 + Math.random() * 145,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 6,
        excitedTimer: 0,
        vibrationSpeed: 0.05 + Math.random() * 0.03,
        bendAngle: 0,
      });
    }
    co2MoleculesRef.current = molecules;
  }, [state.co2Concentration]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const sunPos = { x: 120, y: 95 };

    const render = (time: number) => {
      const state = stateRef.current;
      const onUpdateIce = onUpdateIceRef.current;
      const dt = Math.min(0.08, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // 1. SKY & ARCTIC ATMOSPHERE
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#040d1a'); // Upper stratosphere
      skyGrad.addColorStop(0.25, '#0a2138'); // Mesosphere / Troposphere boundary
      skyGrad.addColorStop(0.48, '#1b3f63'); // Tropospheric greenhouse layer
      skyGrad.addColorStop(0.72, '#486d8c'); // Polar horizon haze
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Greenhouse Gas & Net Trapped Energy Heat Haze (Thickens and glows warm crimson when net energy is trapped!)
      const trappedRatio = Math.max(0, Math.min(1, state.netEnergyTrappedSystem / 400));
      const ghgRatio = (state.co2Concentration - 280) / 720;
      const combinedWarmth = Math.max(0, trappedRatio * 0.7 + ghgRatio * 0.3);

      if (combinedWarmth > 0.04) {
        const ghgHaze = ctx.createLinearGradient(0, height * 0.10, 0, height * 0.42);
        ghgHaze.addColorStop(0, 'rgba(239, 68, 68, 0)');
        ghgHaze.addColorStop(0.5, `rgba(225, 29, 72, ${0.04 + combinedWarmth * 0.28})`);
        ghgHaze.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = ghgHaze;
        ctx.fillRect(0, height * 0.10, width, height * 0.32);
      }

      // Tropospheric boundary line and Atmospheric Badge
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = state.netEnergyTrappedSystem > 0 ? 'rgba(244, 63, 94, 0.5)' : 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.38);
      ctx.lineTo(width, height * 0.38);
      ctx.stroke();
      ctx.restore();

      // Compact shielded Troposphere Badge (shielded from rays & sun label)
      ctx.save();
      const tropW = 220;
      const tropH = 22;
      const tropX = 16;
      const tropY = height * 0.38 - 26;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = state.netEnergyTrappedSystem > 0 ? 'rgba(244, 63, 94, 0.6)' : 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(tropX, tropY, tropW, tropH, 6) : ctx.rect(tropX, tropY, tropW, tropH);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = state.netEnergyTrappedSystem > 0 ? '#fca5a5' : '#7dd3fc';
      ctx.fillText(
        `TROPOSPHERE / CO₂ (${state.co2Concentration} ppm)`,
        tropX + 10,
        tropY + 15
      );
      ctx.restore();

      // 2. BACKGROUND ALPINE GLACIATED MOUNTAIN RANGE
      ctx.save();
      ctx.fillStyle = '#142538';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.58);
      ctx.lineTo(width * 0.16, height * 0.42);
      ctx.lineTo(width * 0.30, height * 0.50);
      ctx.lineTo(width * 0.52, height * 0.34);
      ctx.lineTo(width * 0.70, height * 0.46);
      ctx.lineTo(width * 0.86, height * 0.30);
      ctx.lineTo(width, height * 0.44);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();

      // Sharp Snowfield Glint on Peaks
      ctx.fillStyle = 'rgba(240, 249, 255, 0.65)';
      ctx.beginPath();
      ctx.moveTo(width * 0.16, height * 0.42);
      ctx.lineTo(width * 0.21, height * 0.47);
      ctx.lineTo(width * 0.12, height * 0.47);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(width * 0.52, height * 0.34);
      ctx.lineTo(width * 0.58, height * 0.41);
      ctx.lineTo(width * 0.46, height * 0.42);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(width * 0.86, height * 0.30);
      ctx.lineTo(width * 0.93, height * 0.39);
      ctx.lineTo(width * 0.80, height * 0.40);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 3. THE SUN
      const sunPulse = Math.sin(time * 0.003) * 3;
      const sunRadius = 35 + (state.solarIntensity / 1000) * 14 + sunPulse;

      const coronaGrad = ctx.createRadialGradient(
        sunPos.x, sunPos.y, sunRadius * 0.2,
        sunPos.x, sunPos.y, sunRadius * 3.0
      );
      coronaGrad.addColorStop(0, 'rgba(253, 224, 71, 0.90)');
      coronaGrad.addColorStop(0.3, 'rgba(251, 191, 36, 0.45)');
      coronaGrad.addColorStop(0.7, 'rgba(245, 158, 11, 0.15)');
      coronaGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(sunPos.x, sunPos.y, sunRadius * 3.0, 0, Math.PI * 2);
      ctx.fill();

      const sunCoreGrad = ctx.createRadialGradient(
        sunPos.x - 6, sunPos.y - 6, 2,
        sunPos.x, sunPos.y, sunRadius
      );
      sunCoreGrad.addColorStop(0, '#ffffff');
      sunCoreGrad.addColorStop(0.35, '#fef08a');
      sunCoreGrad.addColorStop(0.8, '#f59e0b');
      sunCoreGrad.addColorStop(1, '#d97706');
      ctx.fillStyle = sunCoreGrad;
      ctx.beginPath();
      ctx.arc(sunPos.x, sunPos.y, sunRadius, 0, Math.PI * 2);
      ctx.fill();

      // Sun label with dark protective backdrop pill to eliminate text overlap
      ctx.save();
      const sunLabelW = 118;
      const sunLabelH = 30;
      const sunLabelX = sunPos.x - sunLabelW / 2;
      const sunLabelY = sunPos.y + sunRadius + 6;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(sunLabelX, sunLabelY, sunLabelW, sunLabelH, 6) : ctx.rect(sunLabelX, sunLabelY, sunLabelW, sunLabelH);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('SOLAR SOURCE', sunPos.x, sunLabelY + 12);
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`${state.solarIntensity} W/m² (SW↓)`, sunPos.x, sunLabelY + 24);
      ctx.restore();

      // 4. ATMOSPHERIC CO2 MOLECULES (UCAR Model: Linear O=C=O with Bending Modes)
      if (state.showCO2Molecules) {
        ctx.save();
        for (const mol of co2MoleculesRef.current) {
          mol.x += mol.vx * dt;
          mol.y += mol.vy * dt;

          if (mol.x < 30) mol.x = width - 30;
          if (mol.x > width - 30) mol.x = 30;
          if (mol.y < height * 0.11) mol.y = height * 0.36;
          if (mol.y > height * 0.37) mol.y = height * 0.12;

          let bendAngle = 0;
          if (mol.excitedTimer > 0) {
            mol.excitedTimer -= dt;
            bendAngle = Math.sin(time * 0.045 + mol.id * 3) * 0.45;
          }

          const centerX = mol.x;
          const centerY = mol.y;
          const bondLength = 8.5;

          const oxLeftX = centerX - Math.cos(bendAngle) * bondLength;
          const oxLeftY = centerY - Math.sin(bendAngle) * bondLength;
          const oxRightX = centerX + Math.cos(-bendAngle) * bondLength;
          const oxRightY = centerY - Math.sin(-bendAngle) * bondLength;

          // Bonds
          ctx.strokeStyle = mol.excitedTimer > 0 ? '#f87171' : 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(oxLeftX, oxLeftY - 1);
          ctx.lineTo(centerX, centerY - 1);
          ctx.moveTo(oxLeftX, oxLeftY + 1);
          ctx.lineTo(centerX, centerY + 1);
          ctx.moveTo(centerX, centerY - 1);
          ctx.lineTo(oxRightX, oxRightY - 1);
          ctx.moveTo(centerX, centerY + 1);
          ctx.lineTo(oxRightX, oxRightY + 1);
          ctx.stroke();

          // Carbon (Dark)
          ctx.fillStyle = mol.excitedTimer > 0 ? '#ef4444' : '#1e293b';
          ctx.beginPath();
          ctx.arc(centerX, centerY, 4.2, 0, Math.PI * 2);
          ctx.fill();

          // Oxygens (Red)
          ctx.fillStyle = mol.excitedTimer > 0 ? '#fca5a5' : '#dc2626';
          ctx.beginPath();
          ctx.arc(oxLeftX, oxLeftY, 3.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(oxRightX, oxRightY, 3.6, 0, Math.PI * 2);
          ctx.fill();

          if (mol.excitedTimer > 0) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 13 + Math.sin(time * 0.03) * 2, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 5. BEDROCK FLOOR (Underneath glacier)
      const bedrockY = height * 0.88;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, bedrockY, width, height - bedrockY);

      // Bedrock boulders and moraine gravel
      ctx.fillStyle = '#0f172a';
      for (let bx = 12; bx < width; bx += 32) {
        ctx.beginPath();
        ctx.ellipse(bx, bedrockY + 12, 16, 6, 0.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Positive Feedback Loop Banner
      if (state.feedbackLoopActive) {
        ctx.save();
        ctx.fillStyle = 'rgba(220, 38, 38, 0.92)';
        ctx.fillRect(width * 0.28, bedrockY + 6, 380, 24);
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('⚡ ICE-ALBEDO POSITIVE FEEDBACK ACTIVE: Dark Bedrock Absorbing 90% Heat!', width * 0.29, bedrockY + 22);
        ctx.restore();
      }

      // 6. REALISTIC GLACIER ICE BODY (With Surface Stratigraphy and Ice Condition Textures)
      const glacierLeft = width * 0.22;
      const glacierRight = width;

      ctx.save();
      ctx.beginPath();
      const surfaceYStart = getSurfaceY(glacierLeft, width, height, state.iceThickness);
      ctx.moveTo(glacierLeft, bedrockY);
      ctx.lineTo(glacierLeft, surfaceYStart);

      const sampleStep = 6;
      for (let sx = glacierLeft; sx <= glacierRight; sx += sampleStep) {
        const sy = getSurfaceY(sx, width, height, state.iceThickness);
        ctx.lineTo(sx, sy);
      }
      ctx.lineTo(glacierRight, bedrockY);
      ctx.closePath();

      // Realistic Glacial Color Stratigraphy based on condition
      const iceBodyGrad = ctx.createLinearGradient(0, height * 0.45, 0, bedrockY);
      if (state.iceCondition === 'pristine') {
        // Pristine snowpack: brilliant white & crystalline cyan
        iceBodyGrad.addColorStop(0, '#ffffff'); // Fresh powdery snow crust
        iceBodyGrad.addColorStop(0.12, '#e0f2fe'); // Compacted firn
        iceBodyGrad.addColorStop(0.45, '#38bdf8'); // Translucent glacial blue
        iceBodyGrad.addColorStop(0.80, '#0284c7'); // Deep compressed ice
        iceBodyGrad.addColorStop(1, '#0c4a6e'); // Basal moraine ice
      } else if (state.iceCondition === 'aged') {
        // Aged grey ice: weathered, darker, granular
        iceBodyGrad.addColorStop(0, '#cbd5e1'); // Weathered grey surface crust
        iceBodyGrad.addColorStop(0.18, '#94a3b8'); // Compacted aged firn
        iceBodyGrad.addColorStop(0.55, '#0284c7'); // Deep compressed ice
        iceBodyGrad.addColorStop(1, '#0c4a6e');
      } else {
        // Soot/Cryoconite: very dark carbon deposit crust
        iceBodyGrad.addColorStop(0, '#475569'); // Dark cryoconite soot crust
        iceBodyGrad.addColorStop(0.15, '#64748b'); // Dust contaminated layer
        iceBodyGrad.addColorStop(0.55, '#0369a1'); // Dense ice
        iceBodyGrad.addColorStop(1, '#082f49');
      }
      ctx.fillStyle = iceBodyGrad;
      ctx.fill();

      // Deep Glacial Crevasses & Stratified Ice Veins
      ctx.strokeStyle = state.iceCondition === 'pristine' ? 'rgba(2, 132, 199, 0.45)' : 'rgba(30, 41, 59, 0.55)';
      ctx.lineWidth = 2.2;
      for (let cx = glacierLeft + 55; cx < glacierRight - 20; cx += 65) {
        const topY = getSurfaceY(cx, width, height, state.iceThickness);
        ctx.beginPath();
        ctx.moveTo(cx, topY);
        ctx.lineTo(cx - 12, topY + 40);
        ctx.lineTo(cx - 6, topY + 75);
        ctx.stroke();
      }

      // Supraglacial Melt Streams & Cryoconite Holes (visible when melting!)
      if (state.meltRate > 0.5) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 2.5;
        for (let px = glacierLeft + 35; px < glacierRight - 20; px += 45) {
          const py = getSurfaceY(px, width, height, state.iceThickness);
          ctx.beginPath();
          ctx.ellipse(px, py + 1.2, 15, 3, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Water sheen highlight
          ctx.fillStyle = 'rgba(186, 230, 253, 0.5)';
          ctx.beginPath();
          ctx.ellipse(px - 3, py + 0.8, 6, 1.2, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 7. GLACIER SNOUT MELTWATER WATERFALL & RUNOFF BASIN
      const fjordGrad = ctx.createLinearGradient(0, bedrockY - 25, 0, height);
      fjordGrad.addColorStop(0, '#0284c7');
      fjordGrad.addColorStop(1, '#082f49');
      ctx.fillStyle = fjordGrad;
      ctx.fillRect(0, bedrockY - 18, glacierLeft + 10, height - (bedrockY - 18));

      // Meltwater ripples
      ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)';
      ctx.lineWidth = 1.5;
      for (let wy = bedrockY - 14; wy < height - 6; wy += 8) {
        ctx.beginPath();
        const waveOffset = Math.sin(time * 0.003 + wy) * 6;
        ctx.moveTo(0, wy);
        ctx.lineTo(glacierLeft, wy + waveOffset * 0.3);
        ctx.stroke();
      }

      // Dynamic Dripping Meltwater Droplets
      if (state.meltRate > 0.2 && state.isPlaying) {
        const dripCount = Math.min(10, Math.max(2, Math.floor(state.meltRate / 2)));
        for (let d = 0; d < dripCount; d++) {
          const dripX = glacierLeft + 5 + Math.sin(time * 0.004 + d * 2) * 22;
          const dropProgress = ((time * (0.35 + d * 0.12)) % 1000) / 1000;
          const dropY = surfaceYStart + dropProgress * (bedrockY - 14 - surfaceYStart);

          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(dripX, dropY, 2.8, 0, Math.PI * 2);
          ctx.fill();

          if (dropProgress > 0.82) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${1 - dropProgress})`;
            ctx.beginPath();
            ctx.ellipse(dripX, bedrockY - 14, 10 * (dropProgress - 0.82) * 5, 2.5, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      // Floating Calved Icebergs in Fjord
      for (const berg of icebergsRef.current) {
        berg.y = bedrockY - 16;
        berg.x += berg.vx * dt * state.timeSpeed;
        if (berg.x < -berg.width) berg.x = glacierLeft - 10;

        ctx.save();
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.moveTo(berg.x, berg.y);
        ctx.lineTo(berg.x + berg.width * 0.4, berg.y - berg.height);
        ctx.lineTo(berg.x + berg.width, berg.y);
        ctx.closePath();
        ctx.fill();

        // Underwater ice shadow
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillRect(berg.x + 2, berg.y, berg.width - 4, 8);
        ctx.restore();
      }

      // 8. MICROBEAD LAYER (Reflective silica microspheres on glacier surface)
      if (state.microbeadDensity > 0 && state.iceThickness > 2) {
        ctx.save();
        const beadCount = Math.floor((width - glacierLeft) * (state.microbeadDensity / 100) * 0.55);

        for (let b = 0; b < beadCount; b++) {
          const bx = glacierLeft + 5 + (b * 3.4) % (glacierRight - glacierLeft - 10);
          const by = getSurfaceY(bx, width, height, state.iceThickness) - 1.5;
          const sparkle = Math.sin(time * 0.007 + b) > 0.60;

          ctx.fillStyle = sparkle ? '#ffffff' : 'rgba(254, 240, 138, 0.95)';
          ctx.beginPath();
          ctx.arc(bx, by, sparkle ? 2.6 : 1.6, 0, Math.PI * 2);
          ctx.fill();

          if (sparkle && b % 3 === 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(bx - 3.5, by);
            ctx.lineTo(bx + 3.5, by);
            ctx.moveTo(bx, by - 3.5);
            ctx.lineTo(bx, by + 3.5);
            ctx.stroke();
          }
        }

        ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let bx = glacierLeft; bx <= glacierRight; bx += sampleStep) {
          ctx.lineTo(bx, getSurfaceY(bx, width, height, state.iceThickness) - 1);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 9. ELECTROMAGNETIC WAVES & DIRECT ENERGY CONVERSION (Solar Shortwave -> Upward Infrared!)
      if (state.isPlaying) {
        // Spawn Solar Shortwave waves from Sun (Yellow tight waves)
        if (state.showIncomingRays && Math.random() < (state.solarIntensity / 1000) * 0.55 * state.timeSpeed) {
          const targetX = glacierLeft + Math.random() * (glacierRight - glacierLeft);
          const targetY = getSurfaceY(targetX, width, height, state.iceThickness);
          const dx = targetX - sunPos.x;
          const dy = targetY - sunPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const speed = 250;

          wavesRef.current.push({
            id: Math.random(),
            type: 'solar_shortwave',
            x: sunPos.x,
            y: sunPos.y,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            length: 48,
            wavelength: 13,
            amplitude: 3.8,
            color: '#facc15', // Vibrant Solar Yellow
            glowColor: '#fef08a',
            lineWidth: 2.3,
            life: 0,
            maxLife: dist / speed,
            phase: Math.random() * Math.PI * 2,
          });
        }

        // Spontaneous surface thermal infrared emission according to Stefan-Boltzmann (LW↑)
        // Scaled directly by absorbed solar energy ratio so high microbeads correctly suppress thermal IR emission!
        const absorptionRatio = state.absorbedEnergy / Math.max(1, state.solarIntensity);
        if (state.showReradiantHeat && Math.random() < absorptionRatio * 0.22 * state.timeSpeed) {
          const emitX = glacierLeft + Math.random() * (glacierRight - glacierLeft);
          const emitY = getSurfaceY(emitX, width, height, state.iceThickness);
          wavesRef.current.push({
            id: Math.random(),
            type: 'infrared_longwave',
            x: emitX,
            y: emitY - 4,
            vx: (Math.random() - 0.5) * 18,
            vy: -90 - Math.random() * 25,
            length: 68,
            wavelength: 36,
            amplitude: 8.5,
            color: '#ef4444',
            glowColor: '#f87171',
            lineWidth: 2.8,
            life: 0,
            maxLife: 3.5,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }

      // Update & Render Electromagnetic Waves
      const nextWaves: EnergyWave[] = [];
      for (const w of wavesRef.current) {
        w.life += dt * state.timeSpeed;
        w.x += w.vx * dt * state.timeSpeed;
        w.y += w.vy * dt * state.timeSpeed;

        if (w.type === 'solar_shortwave') {
          const currentSurfY = getSurfaceY(w.x, width, height, state.iceThickness);

          // Solar ray strikes the glacier surface!
          // Strictly partitioned by precise albedo percentage
          if (w.y >= currentSurfY) {
            const willReflect = Math.random() < (state.reflectedSolarPercent / 100);

            if (willReflect && state.showReflectedRays) {
              // High Albedo: Ray reflects as Shortwave Sunlight back to space!
              const reflectAngle = -Math.PI * 0.25 - Math.random() * (Math.PI * 0.5);
              const reflectSpeed = 240;
              nextWaves.push({
                id: Math.random(),
                type: 'reflected_shortwave',
                x: w.x,
                y: currentSurfY - 2,
                vx: Math.cos(reflectAngle) * reflectSpeed,
                vy: Math.sin(reflectAngle) * reflectSpeed,
                length: 48,
                wavelength: 13,
                amplitude: 3.8,
                color: '#fef08a', // Sunlight Yellow-White
                glowColor: '#fde047',
                lineWidth: 2.2,
                life: 0,
                maxLife: 2.5,
                phase: w.phase,
              });
            } else {
              // Low Albedo: RAY IS ABSORBED & CONVERTED INTO INFRARED HEAT!
              // 1. Thermal absorption pulse inside the ice
              ctx.save();
              const glowGrad = ctx.createRadialGradient(w.x, currentSurfY, 2, w.x, currentSurfY, 24);
              glowGrad.addColorStop(0, 'rgba(234, 88, 12, 0.7)');
              glowGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
              ctx.fillStyle = glowGrad;
              ctx.beginPath();
              ctx.arc(w.x, currentSurfY, 24, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              // 2. DIRECT CONVERSION TO LONGWAVE INFRARED:
              // An unmistakable crimson sinusoidal heat wave emerges from the strike point and radiates UP!
              if (state.showReradiantHeat) {
                nextWaves.push({
                  id: Math.random(),
                  type: 'infrared_longwave',
                  x: w.x,
                  y: currentSurfY - 4,
                  vx: (Math.random() - 0.5) * 16,
                  vy: -95 - Math.random() * 25, // Undulating upward
                  length: 70,
                  wavelength: 36, // Longwave infrared (approx 3x solar!)
                  amplitude: 9.0, // Wide undulating wave
                  color: '#ef4444', // Crimson Red Infrared
                  glowColor: '#f87171',
                  lineWidth: 3.0, // Thick and prominent!
                  life: 0,
                  maxLife: 3.4,
                  phase: Math.random() * Math.PI * 2,
                });
              }

              // 3. Melt vapor ribbon
              vaporsRef.current.push({
                id: Math.random(),
                x: w.x,
                y: currentSurfY - 2,
                vx: (Math.random() - 0.5) * 12,
                vy: -30 - Math.random() * 20,
                life: 0,
                maxLife: 1.4,
                size: 3,
              });
            }
            continue;
          }

          drawWavePacket(ctx, w, time);
          if (w.life < w.maxLife) nextWaves.push(w);

        } else if (w.type === 'reflected_shortwave') {
          // NOAA Principle: Reflected shortwave solar radiation passes directly through CO2 into space
          drawWavePacket(ctx, w, time);
          
          // Subtle sparkle when escaping top of atmosphere into space
          if (w.y <= height * 0.12 && w.y > 0) {
            ctx.save();
            ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
            ctx.beginPath();
            ctx.arc(w.x, w.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          if (w.life < w.maxLife && w.y > 0) nextWaves.push(w);

        } else if (w.type === 'infrared_longwave') {
          // UCAR Trapping by CO2 Molecules in Troposphere
          let trappedByCO2 = false;
          const trappingThreshold = state.infraredTrappingPercent / 100;

          if (state.showGreenhouseTrapping && w.y < height * 0.38 && w.y > height * 0.12) {
            for (const mol of co2MoleculesRef.current) {
              const dX = mol.x - w.x;
              const dY = mol.y - w.y;
              if (Math.sqrt(dX * dX + dY * dY) < 24) {
                if (Math.random() < trappingThreshold) {
                  mol.excitedTimer = 0.8; // Trigger violent bending mode vibration!
                  trappedByCO2 = true;

                  // Downward greenhouse back-radiation wave towards glacier
                  nextWaves.push({
                    id: Math.random(),
                    type: 'greenhouse_back_lw',
                    x: mol.x,
                    y: mol.y + 4,
                    vx: (Math.random() - 0.5) * 20,
                    vy: 75 + Math.random() * 25,
                    length: 64,
                    wavelength: 34,
                    amplitude: 8,
                    color: '#ea580c', // Orange-Red Greenhouse Heat
                    glowColor: '#f97316',
                    lineWidth: 2.6,
                    life: 0,
                    maxLife: 2.4,
                    phase: Math.random() * Math.PI * 2,
                  });
                  break;
                }
              }
            }
          }

          if (trappedByCO2) continue;

          // If wave escapes to space
          if (w.y <= height * 0.12 && w.type === 'infrared_longwave') {
            w.type = 'infrared_escaped';
            w.color = 'rgba(239, 68, 68, 0.45)';
          }

          drawWavePacket(ctx, w, time);
          if (w.life < w.maxLife && w.y > 0) nextWaves.push(w);

        } else if (w.type === 'infrared_escaped') {
          drawWavePacket(ctx, w, time);
          if (w.life < w.maxLife && w.y > 0) nextWaves.push(w);

        } else if (w.type === 'greenhouse_back_lw') {
          const currentSurfY = getSurfaceY(w.x, width, height, state.iceThickness);
          if (w.y >= currentSurfY && w.x >= glacierLeft) {
            // Downward greenhouse back-radiation absorbs into glacier and deposits heat!
            ctx.save();
            const glowGrad = ctx.createRadialGradient(w.x, currentSurfY, 2, w.x, currentSurfY, 20);
            glowGrad.addColorStop(0, 'rgba(234, 88, 12, 0.65)');
            glowGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(w.x, currentSurfY, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            continue; // Energy absorbed into glacier surface
          }
          drawWavePacket(ctx, w, time);
          if (w.life < w.maxLife && w.y < bedrockY) nextWaves.push(w);
        }
      }
      wavesRef.current = nextWaves;

      // Render Melt Vapors
      const nextVapors: MeltVapor[] = [];
      for (const v of vaporsRef.current) {
        v.life += dt * state.timeSpeed;
        v.x += v.vx * dt * state.timeSpeed;
        v.y += v.vy * dt * state.timeSpeed;
        const alpha = Math.max(0, 1 - v.life / v.maxLife);

        ctx.save();
        ctx.fillStyle = `rgba(224, 242, 254, ${alpha * 0.45})`;
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.size * (1 + v.life * 1.5), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (v.life < v.maxLife) nextVapors.push(v);
      }
      vaporsRef.current = nextVapors;

      // 10. REALISTIC ICE MELT PROGRESSION
      if (state.isPlaying && state.meltRate > 0 && state.iceThickness > 0) {
        const mmToPercent = 0.0006 * state.timeSpeed * dt;
        const thicknessDelta = state.meltRate * mmToPercent;
        const newThickness = Math.max(0, state.iceThickness - thicknessDelta);
        onUpdateIce(newThickness, thicknessDelta);
      }

      // 11. TOP-RIGHT LIVE INCIDENT SOLAR PARTITIONING & NET TRAPPED HUD
      ctx.save();
      const hudW = 295;
      const hudH = 62;
      const hudX = width - hudW - 16;
      const hudY = 16;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = state.netEnergyTrappedSystem > 0 ? 'rgba(244, 63, 94, 0.55)' : 'rgba(56, 189, 248, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.fillRect(hudX, hudY, hudW, hudH);
      ctx.strokeRect(hudX, hudY, hudW, hudH);

      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`INCIDENT SOLAR (100% = ${state.solarIntensity} W/m²)`, hudX + 10, hudY + 15);

      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`SW↑ Reflected: ${state.reflectedSolarPercent}% (${state.reflectedSolar} W/m²)`, hudX + 10, hudY + 31);

      ctx.fillStyle = '#fb923c';
      ctx.fillText(`Q_abs Absorbed: ${state.absorbedSolarPercent}% (${state.absorbedEnergy} W/m²)`, hudX + 10, hudY + 47);

      // Net Trapped Badge inside HUD
      const badgeX = hudX + hudW - 88;
      const badgeY = hudY + 12;
      ctx.fillStyle = state.netEnergyTrappedSystem > 0 ? 'rgba(225, 29, 72, 0.3)' : 'rgba(14, 165, 233, 0.3)';
      ctx.strokeStyle = state.netEnergyTrappedSystem > 0 ? '#f43f5e' : '#38bdf8';
      ctx.lineWidth = 1;
      ctx.fillRect(badgeX, badgeY, 78, 38);
      ctx.strokeRect(badgeX, badgeY, 78, 38);

      ctx.font = 'bold 8px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('NET TRAPPED', badgeX + 7, badgeY + 13);
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = state.netEnergyTrappedSystem > 0 ? '#fca5a5' : '#7dd3fc';
      ctx.fillText(`${state.netEnergyTrappedSystem > 0 ? '+' : ''}${state.netEnergyTrappedSystem}`, badgeX + 7, badgeY + 27);
      ctx.font = '8px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('W/m²', badgeX + 50, badgeY + 27);
      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950 overflow-hidden select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Clean Canvas Toolbar to Toggle Overlays & keep view pristine */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 shadow-lg text-xs pointer-events-auto">
        <button
          onClick={() => setShowMicrobeadOverlay(!showMicrobeadOverlay)}
          className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
            showMicrobeadOverlay ? 'bg-sky-500 text-white font-bold shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Sparkles size={13} />
          <span>Shield Overlay</span>
        </button>

        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
            showLegend ? 'bg-sky-500 text-white font-bold shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Info size={13} />
          <span>Radiation Legend</span>
        </button>

        <button
          onClick={() => setShowZoomInset(!showZoomInset)}
          className={`px-2.5 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer ${
            showZoomInset ? 'bg-sky-500 text-white font-bold shadow-sm' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <ZoomIn size={13} />
          <span>Micro View</span>
        </button>
      </div>

      {/* Conditional SVG Microbead Reflection & Absorption Animation Overlay */}
      {showMicrobeadOverlay && (
        <MicrobeadReflectionOverlay
          microbeadDensity={state.microbeadDensity}
          reflectedSolar={state.reflectedSolar}
          absorbedEnergy={state.absorbedEnergy}
          onToggleMicrobeads={onUpdateMicrobeads || (() => {})}
        />
      )}

      {/* Depleted Ice Callout Overlay with One-Click Restore */}
      {state.iceThickness <= 0 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-slate-900/95 border-2 border-rose-500/80 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl flex items-center gap-4 text-xs text-rose-100 z-30 pointer-events-auto">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center shrink-0 text-rose-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span>Glacier Melted Down to Bedrock!</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold">
                Melt Rate: {state.meltRate} mm/day
              </span>
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Dark bedrock is absorbing 90% heat. Use sliders or click Restore to simulate fresh ice.
            </p>
          </div>
          {onResetIce && (
            <button
              onClick={onResetIce}
              className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl shadow-lg transition cursor-pointer whitespace-nowrap text-xs flex items-center gap-1.5"
            >
              <span>↺ Restore Ice</span>
            </button>
          )}
        </div>
      )}

      {/* Conditional Radiation Legend with Explicit Wave Samples */}
      {showLegend && (
        <div className="absolute top-[88px] right-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/70 rounded-xl p-3.5 shadow-xl text-xs space-y-2 max-w-xs pointer-events-auto z-30">
        <div className="font-semibold text-slate-200 tracking-wide flex items-center justify-between border-b border-slate-700/70 pb-1.5">
          <span>Radiation & Wave Pathways</span>
          <span className="text-[10px] text-rose-400 font-bold font-mono">{state.infraredTrappingPercent}% TRAPPED</span>
        </div>

        <div className="space-y-2 text-slate-300">
          {/* Solar shortwave */}
          <div className="flex items-start gap-2">
            <div className="w-5 h-2.5 mt-0.5 flex items-center justify-center">
              <svg className="w-5 h-2.5" viewBox="0 0 20 8">
                <path d="M 0 4 Q 2.5 1 5 4 T 10 4 T 15 4 T 20 4" fill="none" stroke="#facc15" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-yellow-300">1. Solar Shortwave (SW↓)</span>
                <span className="font-mono text-yellow-200 font-bold">{state.solarIntensity} W/m²</span>
              </div>
              <p className="text-[10px] text-slate-400">Tight yellow waves from Sun</p>
            </div>
          </div>

          {/* Reflected Shortwave */}
          <div className="flex items-start gap-2">
            <div className="w-5 h-2.5 mt-0.5 flex items-center justify-center">
              <svg className="w-5 h-2.5" viewBox="0 0 20 8">
                <path d="M 0 4 Q 2.5 1 5 4 T 10 4 T 15 4 T 20 4" fill="none" stroke="#fef08a" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-yellow-100">2. Reflected Sunlight (SW↑)</span>
                <span className="font-mono text-yellow-100 font-bold">{state.reflectedSolar} W/m²</span>
              </div>
              <p className="text-[10px] text-emerald-300 font-medium">
                ✨ 100% Escapes through CO₂ into space!
              </p>
              <p className="text-[9px] text-slate-400">
                NOAA Principle: CO₂ is transparent to solar light
              </p>
            </div>
          </div>

          {/* Re-radiant Longwave Infrared */}
          <div className="flex items-start gap-2">
            <div className="w-5 h-2.5 mt-0.5 flex items-center justify-center">
              <svg className="w-5 h-2.5" viewBox="0 0 20 8">
                <path d="M 0 4 Q 5 0 10 4 T 20 4" fill="none" stroke="#ef4444" strokeWidth="2.8" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-rose-400">3. Re-Radiant Infrared (LW↑)</span>
                <span className="font-mono text-rose-300 font-bold">{state.reradiantInfrared} W/m²</span>
              </div>
              <p className="text-[10px] text-amber-200 font-medium">
                🔴 Solar Absorbed: {state.absorbedEnergy} W/m² ➔ Converted to Heat
              </p>
              <p className="text-[9px] text-slate-400">
                More microbeads ➔ Less absorbed ➔ Less re-radiation
              </p>
            </div>
          </div>

          {/* Greenhouse Back-radiation */}
          <div className="flex items-start gap-2">
            <div className="w-5 h-2.5 mt-0.5 flex items-center justify-center">
              <svg className="w-5 h-2.5" viewBox="0 0 20 8">
                <path d="M 0 4 Q 5 0 10 4 T 20 4" fill="none" stroke="#ea580c" strokeWidth="2.2" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-orange-400">4. CO₂ Back-Radiation (LW↓)</span>
                <span className="font-mono text-orange-300 font-bold">{state.greenhouseBackRadiation} W/m²</span>
              </div>
              <p className="text-[10px] text-slate-400">Trapped by CO₂ & radiated back down</p>
            </div>
          </div>
        </div>

        {/* Live Trapping breakdown */}
        <div className="pt-2 border-t border-slate-700/70 space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-rose-300 font-medium">Infrared Trapped:</span>
            <span className="font-mono font-bold text-rose-400">{state.infraredTrapped} W/m² ({state.infraredTrappingPercent}%)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Infrared Escapes Space:</span>
            <span className="font-mono text-slate-300">{state.infraredEscapingToSpace} W/m²</span>
          </div>
          <div className="flex justify-between text-yellow-200/90 pt-0.5 border-t border-slate-800">
            <span>Total Escaping to Space:</span>
            <span className="font-mono font-bold text-yellow-300">{state.reflectedSolar + state.infraredEscapingToSpace} W/m²</span>
          </div>
        </div>

        {/* NOAA Educational Principle Card */}
        <div className="p-2 bg-sky-950/50 border border-sky-800/50 rounded-lg text-[10px] text-sky-200 leading-tight">
          <span className="font-bold text-sky-300">NOAA Carbon Cycle Toolkit:</span> As microbeads increase, solar light reflects directly and escapes through CO₂ unhindered. This leaves virtually no absorbed heat to re-radiate as infrared, preventing greenhouse warming!
        </div>
      </div>
      )}

      {/* Picture-in-Picture: Microscopic Surface & CO2 Inspector */}
      {showZoomInset && (
        <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl w-84 text-xs">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
            <div className="flex items-center gap-1.5 font-semibold text-slate-100">
              <ZoomIn size={14} className="text-sky-400" />
              <span>
                {zoomMode === 'lattice'
                  ? 'Energy Conversion in Ice'
                  : zoomMode === 'beads'
                  ? '500× Microbead Reflection'
                  : 'UCAR: CO₂ Molecular Resonance'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
                <button
                  onClick={() => setZoomMode('lattice')}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer ${
                    zoomMode === 'lattice' ? 'bg-amber-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Absorbed Solar Converting to Infrared"
                >
                  Ice Melt
                </button>
                <button
                  onClick={() => setZoomMode('beads')}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer ${
                    zoomMode === 'beads' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Microbead Total Internal Reflection"
                >
                  Beads
                </button>
                <button
                  onClick={() => setZoomMode('co2_vibrate')}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition cursor-pointer ${
                    zoomMode === 'co2_vibrate' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="UCAR Carbon Dioxide Vibration Model"
                >
                  CO₂
                </button>
              </div>

              <button
                onClick={() => setShowZoomInset(false)}
                className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition cursor-pointer"
                title="Close Inset"
              >
                <Minimize2 size={13} />
              </button>
            </div>
          </div>

          <div className="relative h-32 w-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
            {zoomMode === 'lattice' ? (
              // Direct conversion: Light absorbed -> converts to red infrared
              <div className="relative w-full h-full flex flex-col items-center justify-center px-4 text-center">
                <div className="flex items-center gap-3">
                  <div className="text-[10px] text-yellow-300 font-bold">
                    Yellow Solar Ray (SW)
                  </div>
                  <span className="text-slate-400">➔</span>
                  <div className="w-7 h-7 rounded-lg bg-amber-500/30 border border-amber-400/60 flex items-center justify-center text-xs text-amber-300 font-bold">
                    Ice
                  </div>
                  <span className="text-slate-400">➔</span>
                  <div className="text-[10px] text-rose-400 font-bold">
                    Red Infrared Wave (LW)
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-amber-300 font-semibold">
                  Absorption Converts Light to Thermal Waves!
                </div>
                <div className="text-[10px] text-rose-300">
                  {state.absorbedEnergy} W/m² absorbed ➔ Emits {state.reradiantInfrared} W/m² Red Infrared
                </div>
              </div>
            ) : zoomMode === 'beads' ? (
              // Microbead internal reflection view
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative flex items-center justify-center gap-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="relative w-14 h-14 rounded-full border border-white/70 bg-gradient-to-br from-white/50 via-yellow-100/30 to-sky-300/40 shadow-[0_0_15px_rgba(250,204,21,0.4)] flex items-center justify-center overflow-hidden"
                    >
                      <div className="w-8 h-8 rounded-full border border-white/40 bg-white/10" />
                      <div className="absolute top-1 left-2 w-3 h-2 rounded-full bg-white/95 blur-[0.5px]" />
                    </div>
                  ))}
                </div>
                <div className="absolute top-1 left-12 w-16 h-1 bg-yellow-400 rotate-45 animate-pulse shadow-[0_0_8px_#facc15]" />
                <div className="absolute top-4 left-24 w-14 h-1 bg-yellow-200 -rotate-45 shadow-[0_0_8px_#fef08a]" />
              </div>
            ) : (
              // UCAR CO2 Molecular Bending Resonance Animation
              <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
                <div className="flex items-center justify-center gap-6 relative">
                  <div className="w-7 h-7 rounded-full bg-rose-600 border border-rose-300 shadow-[0_0_10px_#ef4444] flex items-center justify-center text-[10px] font-bold text-white animate-bounce">
                    O
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-400 shadow-md flex items-center justify-center text-xs font-bold text-white z-10">
                    C
                  </div>
                  <div className="w-7 h-7 rounded-full bg-rose-600 border border-rose-300 shadow-[0_0_10px_#ef4444] flex items-center justify-center text-[10px] font-bold text-white animate-bounce">
                    O
                  </div>
                </div>

                <div className="mt-2 text-[11px] font-semibold text-rose-300">
                  Resonant Bending Mode (ν₂ = 667 cm⁻¹)
                </div>
                <div className="text-[10px] text-slate-400 text-center">
                  Absorbs red infrared wave ➔ vibrates ➔ re-radiates heat back to Earth
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 text-[11px] text-slate-300 leading-relaxed">
            {zoomMode === 'lattice' ? (
              <span>
                <strong className="text-amber-300">Energy Conversion:</strong> Dark/aged ice absorbs solar photons, heating water molecules and emitting <strong>thick red sinusoidal infrared heat waves</strong> into the atmosphere!
              </span>
            ) : zoomMode === 'beads' ? (
              <span>
                <strong className="text-yellow-300">Microbead Shield:</strong> Reflects shortwave light before absorption, cutting red infrared emission to near zero!
              </span>
            ) : (
              <span>
                <strong className="text-rose-300">UCAR Science:</strong> CO₂ traps <strong>{state.infraredTrapped} W/m² ({state.infraredTrappingPercent}%)</strong> of red infrared heat!
              </span>
            )}
          </div>
        </div>
      )}



      {!showZoomInset && (
        <button
          onClick={() => setShowZoomInset(true)}
          className="absolute bottom-4 left-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-xs flex items-center gap-2 shadow-lg transition cursor-pointer"
        >
          <ZoomIn size={14} className="text-amber-400" />
          <span>Show Ice / CO₂ / Microbead Inspector</span>
        </button>
      )}
    </div>
  );
};
