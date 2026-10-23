import React, { useState, useEffect, useRef } from 'react';
import { SimulationState } from '../types/simulation';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { BarChart2, X, TrendingDown, TrendingUp, Activity, Layers, Sun, Wind } from 'lucide-react';

interface ClimateDataDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  state: SimulationState;
}

interface DataPoint {
  time: string;
  iceThickness: number;
  albedo: number;
  infrared: number;
  meltRate: number;
  co2: number;
}

export const ClimateDataDashboard: React.FC<ClimateDataDashboardProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [dataHistory, setDataHistory] = useState<DataPoint[]>([]);
  const tickCounterRef = useRef<number>(0);

  // Record historical data points when simulation runs
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      if (!state.isPlaying) return;

      tickCounterRef.current += 1;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setDataHistory((prev) => {
        const newPoint: DataPoint = {
          time: nowStr,
          iceThickness: Number(state.iceThickness.toFixed(1)),
          albedo: Number((state.effectiveAlbedo * 100).toFixed(1)),
          infrared: Math.round(state.reradiantInfrared),
          meltRate: Number(state.meltRate.toFixed(1)),
          co2: state.co2Concentration,
        };

        const updated = [...prev, newPoint];
        if (updated.length > 30) {
          updated.shift(); // keep last 30 points
        }
        return updated;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, state.isPlaying, state.iceThickness, state.effectiveAlbedo, state.reradiantInfrared, state.meltRate, state.co2Concentration]);

  // Initial populate if empty
  useEffect(() => {
    if (isOpen && dataHistory.length === 0) {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setDataHistory([
        {
          time: nowStr,
          iceThickness: Number(state.iceThickness.toFixed(1)),
          albedo: Number((state.effectiveAlbedo * 100).toFixed(1)),
          infrared: Math.round(state.reradiantInfrared),
          meltRate: Number(state.meltRate.toFixed(1)),
          co2: state.co2Concentration,
        }
      ]);
    }
  }, [isOpen, dataHistory.length, state]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-sky-400">
              <BarChart2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Real-Time Climate Telemetry Dashboard
              </h2>
              <p className="text-xs text-slate-400">
                Live Recharts tracking of Ice Volume, Albedo Percentage, and Infrared Radiation Output ($LW\uparrow$)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition cursor-pointer"
            title="Close Dashboard"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Metrics Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 pb-2 bg-slate-950/40">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Layers size={14} className="text-sky-400" />
              <span>Glacier Ice Volume</span>
            </div>
            <div className="text-xl font-bold font-mono text-sky-300 mt-1">
              {state.iceThickness.toFixed(1)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {state.iceThickness < 30 ? '⚠️ Bedrock Exposed' : 'Stable Mass'}
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Sun size={14} className="text-yellow-400" />
              <span>Effective Albedo (α)</span>
            </div>
            <div className="text-xl font-bold font-mono text-yellow-300 mt-1">
              {(state.effectiveAlbedo * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Reflecting {state.reflectedSolar} W/m²
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Activity size={14} className="text-rose-400" />
              <span>Infrared Radiation ($LW\uparrow$)</span>
            </div>
            <div className="text-xl font-bold font-mono text-rose-300 mt-1">
              {state.reradiantInfrared} W/m²
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {state.infraredTrappingPercent}% trapped by CO₂
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Wind size={14} className="text-amber-400" />
              <span>Melt Rate & CO₂</span>
            </div>
            <div className="text-xl font-bold font-mono text-amber-300 mt-1">
              {state.meltRate.toFixed(1)} mm/day
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {state.co2Concentration} ppm CO₂
            </div>
          </div>
        </div>

        {/* Charts Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Chart 1: Ice Volume & Albedo Trends */}
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Glacier Ice Volume (%) vs. Albedo Efficiency (%)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Real-time telemetry</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line
                    type="monotone"
                    dataKey="iceThickness"
                    name="Ice Volume (%)"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="albedo"
                    name="Albedo (α %)"
                    stroke="#facc15"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Infrared Radiation & Melt Rate Trends */}
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Infrared Radiation Output ($LW\uparrow$ W/m²) & Melt Rate (mm/day)</span>
              </h3>
              <span className="text-xs text-rose-400 font-mono">Positive Feedback Tracking</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorInfrared" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area
                    type="monotone"
                    dataKey="infrared"
                    name="Infrared Radiation ($LW\uparrow$ W/m²)"
                    stroke="#ef4444"
                    fillOpacity={1}
                    fill="url(#colorInfrared)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="meltRate"
                    name="Melt Rate (mm/day)"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Telemetry updates automatically while simulation is playing.</span>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition cursor-pointer"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
