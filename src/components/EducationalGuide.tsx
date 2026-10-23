import React, { useState } from 'react';
import {
  BookOpen,
  X,
  ShieldCheck,
  Flame,
  Globe2,
  Sparkles,
  Sun,
  Activity,
  Wind
} from 'lucide-react';

interface EducationalGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyChallenge: (beads: number, solar: number, co2?: number) => void;
}

export const EducationalGuide: React.FC<EducationalGuideProps> = ({
  isOpen,
  onClose,
  onApplyChallenge,
}) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'co2' | 'microbeads' | 'climate' | 'challenges'>('concepts');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <BookOpen className="text-sky-400" size={20} />
            <h2 className="text-lg font-bold text-white">
              Student Science Guide: Albedo, Radiant Energy, CO₂ & Microbeads
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            title="Close Guide"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('concepts')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'concepts'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Shortwave vs. Longwave Heat
          </button>
          <button
            onClick={() => setActiveTab('co2')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'co2'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. The CO₂ Greenhouse Trap
          </button>
          <button
            onClick={() => setActiveTab('microbeads')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'microbeads'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Microbeads (Albedo Geoengineering)
          </button>
          <button
            onClick={() => setActiveTab('climate')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'climate'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Climate Patterns & Feedback Loops
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'challenges'
                ? 'border-sky-400 text-sky-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            5. Interactive Lab Challenges
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
          {activeTab === 'concepts' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sun className="text-yellow-400" size={18} />
                  How Sunlight Transforms into Re-Radiant Thermal Heat
                </h3>
                <p className="mt-1 text-slate-300">
                  Sunlight itself is high-frequency electromagnetic radiation (visible and near-ultraviolet light). Why does it cause melting? Because of the conversion of radiation types:
                </p>
              </div>

              {/* 4 Step Visual Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                  <span className="font-bold text-yellow-300 flex items-center gap-1.5">
                    Step 1: Shortwave Solar Radiation (SW↓)
                  </span>
                  <p className="text-slate-300">
                    High-energy solar photons stream through space and the atmosphere. Greenhouse gases like CO₂ cannot absorb visible light, so sunlight reaches the surface unimpeded.
                  </p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                  <span className="font-bold text-sky-300 flex items-center gap-1.5">
                    Step 2: Albedo (α) & Direct Reflection (SW↑)
                  </span>
                  <p className="text-slate-300">
                    Any light reflected directly back (albedo) retains its shortwave wavelength and escapes safely back out to space without warming Earth.
                  </p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    Step 3: Absorption (Q_abs) & Internal Heating
                  </span>
                  <p className="text-slate-300">
                    When untreated dark or aged ice absorbs sunlight, the photon energy excites the water molecules in the ice lattice, transforming into thermal kinetic energy (heat).
                  </p>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1.5">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    Step 4: Re-Radiant Longwave Infrared (LW↑)
                  </span>
                  <p className="text-slate-300">
                    Because the warmed ground is much cooler than the Sun (~273 K vs. 5,778 K), it radiates energy at longer infrared wavelengths (heat waves). This is what CO₂ traps!
                  </p>
                </div>
              </div>

              <div className="p-4 bg-sky-950/50 border border-sky-800/60 rounded-xl text-xs space-y-1">
                <span className="font-bold text-sky-300">💡 Why This Matters:</span>
                <p className="text-sky-100">
                  If we reflect the light <strong>before</strong> it absorbs (high albedo), it never turns into thermal energy, meaning <strong>zero re-radiant infrared</strong> is emitted for greenhouse gases to trap!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'co2' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Wind className="text-rose-400" size={18} />
                The Role of Atmospheric Carbon Dioxide (CO₂)
              </h3>

              <p>
                Carbon dioxide (CO₂) is a linear molecule consisting of one carbon atom and two oxygen atoms (O=C=O). It acts as Earth's thermal blanket.
              </p>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <h4 className="font-semibold text-rose-300 mb-1">1. Transparent to Sunlight (SW), Opaque to Infrared (LW)</h4>
                  <p className="text-slate-300">
                    CO₂ molecules do not interact with incoming or reflected shortwave sunlight (yellow). Shortwave visible light passes straight through CO₂ into space without being trapped! However, their atomic bonds vibrate at the exact resonant frequency of thermal infrared waves (red)!
                  </p>
                </div>

                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <h4 className="font-semibold text-rose-300 mb-1">2. Infrared Absorption & Re-Emission (Back-Radiation)</h4>
                  <p className="text-slate-300">
                    When upward re-radiant infrared (LW↑) hits a CO₂ molecule, the molecule absorbs the photon, enters an excited vibrational state (bending mode at 15 µm), and re-emits infrared in all directions—including back down to the glacier (LW↓)!
                  </p>
                </div>

                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <h4 className="font-semibold text-rose-300 mb-1">3. NOAA Carbon Cycle Toolkit: How Microbeads Intervene</h4>
                  <p className="text-slate-300">
                    As microbead density increases, nearly all sunlight is reflected as <strong>shortwave radiation</strong>. Because CO₂ is transparent to shortwave light, this reflected energy passes directly through the CO₂ blanket into outer space. The ice absorbs very little heat, <strong>choking off the re-radiant infrared emissions</strong> and leaving CO₂ with nothing to trap!
                  </p>
                </div>

                <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3.5">
                  <h4 className="font-semibold text-rose-300 mb-1">4. The Concentration Multiplier</h4>
                  <p className="text-slate-300">
                    Pre-industrial atmosphere had 280 ppm of CO₂. Today it is over 425 ppm, and high-emission projections reach 750–900 ppm. More CO₂ means a thicker infrared trap, sending hundreds of extra W/m² back to melt glaciers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'microbeads' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Sparkles className="text-sky-400" size={18} />
                How Microbeads Neutralize the Warming Cycle
              </h3>

              <p>
                Developed by the <strong>Arctic Ice Project</strong>, hollow silica microspheres provide a non-toxic, targeted geoengineering intervention to restore lost albedo.
              </p>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                  <h4 className="font-semibold text-sky-300 mb-1">🔬 Microscopic Anatomy (35–50 Microns)</h4>
                  <p>
                    Each bead is composed of silicon dioxide (silica, natural sand material) surrounding an inner pocket of air.
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                  <h4 className="font-semibold text-sky-300 mb-1">✨ Total Internal Reflection</h4>
                  <p>
                    Because of the refractive difference between the glass shell and air core, incoming solar photons bounce around internally and reflect back out at steep angles into space—acting like billions of microscopic mirrors!
                  </p>
                </div>

                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3">
                  <h4 className="font-semibold text-sky-300 mb-1">🛡️ Starving the Greenhouse Effect</h4>
                  <p>
                    By reflecting 96% of solar radiation back as shortwave light at 100% density, the ice stays sub-zero, solar absorption drops to near-zero (4%), re-radiant infrared drops to a minimum, and atmospheric CO₂ has almost no heat to trap!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'climate' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Globe2 className="text-sky-400" size={18} />
                Why Preserving Glacial Ice Regulates Global Climate
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 rounded-xl">
                  <span className="font-bold text-rose-300">1. The Runaway Ice-Albedo Positive Feedback Loop</span>
                  <p className="mt-1 text-slate-300">
                    When ice melts completely, it exposes dark ocean or bedrock (albedo ~0.08 to 0.10). Dark rock absorbs 92% of sunlight, heating up rapidly and preventing ice from ever reforming.
                  </p>
                </div>

                <div className="p-3.5 bg-sky-950/40 border border-sky-800/40 rounded-xl">
                  <span className="font-bold text-sky-300">2. Polar Jet Stream Stabilization</span>
                  <p className="mt-1 text-slate-300">
                    The sharp temperature contrast between the Arctic and the tropics keeps the circumpolar jet stream fast and stable. When the Arctic warms, the jet stream meanders, trapping intense heatwaves and deep freezes across North America and Europe.
                  </p>
                </div>

                <div className="p-3.5 bg-indigo-950/40 border border-indigo-800/40 rounded-xl">
                  <span className="font-bold text-indigo-300">3. Slowing Sea Level Rise & Permafrost Thaw</span>
                  <p className="mt-1 text-slate-300">
                    Glaciers store massive quantities of fresh water. Preventing land-ice ablation protects coastal cities and stops arctic permafrost from releasing ancient trapped methane.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="text-emerald-400" size={18} />
                Student Scientific Lab Experiments
              </h3>
              <p className="text-xs text-slate-300">
                Click "Load Setup" on any experiment to test scientific hypotheses directly on the simulation.
              </p>

              <div className="space-y-3">
                <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <Sparkles size={14} /> Experiment 1: 100% Microbead Shield (Near-Zero Solar Absorption)
                    </span>
                    <p className="text-slate-400 mt-1">
                      Set Microbeads to 100%, Solar to 800 W/m², CO₂ to 600 ppm. Observe how 96% of solar light is reflected as shortwave radiation, reducing absorption to near-zero (4%), minimizing thermal infrared output, and halting ice melt completely!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyChallenge(100, 800, 600);
                      onClose();
                    }}
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium whitespace-nowrap transition cursor-pointer"
                  >
                    Load Setup
                  </button>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-sky-300">Experiment 2: Neutralizing High-CO₂ Warming</span>
                    <p className="text-slate-400 mt-1">
                      Set CO₂ to 650 ppm and Solar to 800 W/m². Test how applying 80% microbeads prevents infrared generation and stops melting even under elevated CO₂!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyChallenge(80, 800, 650);
                      onClose();
                    }}
                    className="py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium whitespace-nowrap transition cursor-pointer"
                  >
                    Load Setup
                  </button>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-amber-300">Experiment 3: Pre-Industrial Baseline vs. Present Day</span>
                    <p className="text-slate-400 mt-1">
                      Compare 280 ppm pre-industrial conditions with modern 425 ppm. Observe how greenhouse back-radiation (LW↓) increases by over 25 W/m².
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyChallenge(0, 650, 280);
                      onClose();
                    }}
                    className="py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium whitespace-nowrap transition cursor-pointer"
                  >
                    Load Setup
                  </button>
                </div>

                <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-rose-300">Experiment 4: Runaway Melt Without Protection</span>
                    <p className="text-slate-400 mt-1">
                      High solar (900 W/m²), 800 ppm CO₂, 0% microbeads. Watch the rapid thinning of the glacier and emergence of bedrock.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyChallenge(0, 900, 800);
                      onClose();
                    }}
                    className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium whitespace-nowrap transition cursor-pointer"
                  >
                    Load Setup
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Scientific References */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4 text-[11px] flex-wrap">
            <span className="font-semibold text-slate-300">Scientific Foundations:</span>
            <a
              href="https://gml.noaa.gov/education/carbon_toolkit/"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300 underline font-semibold"
            >
              NOAA Carbon Cycle Toolkit
            </a>
            <a
              href="https://en.wikipedia.org/wiki/Ice%E2%80%93albedo_feedback"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300 underline"
            >
              Ice–Albedo Feedback
            </a>
            <a
              href="https://geosci.uchicago.edu/~rtp1/glaciers/EnergyBudget.html"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300 underline"
            >
              Pierrehumbert Energy Budget
            </a>
            <a
              href="https://scied.ucar.edu/learning-zone/how-climate-works/carbon-dioxide-absorbs-and-re-emits-infrared-radiation"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:text-sky-300 underline"
            >
              UCAR CO₂ Resonance
            </a>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition cursor-pointer ml-auto"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
