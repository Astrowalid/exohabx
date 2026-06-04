import { useState, useMemo, useEffect } from "react";
import { 
  Globe, 
  Orbit, 
  Sun, 
  Database,
  Info,
  Sliders,
  Compass,
  Gauge,
  Flame,
  Snowflake,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { SimulationParams } from "./types";
import { generateMetrics } from "./utils";
import { EXOPLANET_PRESETS } from "./data";
import ThreeCanvas from "./components/ThreeCanvas";
import LandingPage from "./LandingPage";

export default function App() {
  const [showSimulator, setShowSimulator] = useState(() => {
    return window.location.hash === "#/simulator";
  });

  useEffect(() => {
    window.location.hash = showSimulator ? "/simulator" : "";
  }, [showSimulator]);

  useEffect(() => {
    const handleHashChange = () => {
      setShowSimulator(window.location.hash === "#/simulator");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const [params, setParams] = useState<SimulationParams>({
    planetRadius: 1.0,
    planetMass: 1.0,
    equilibriumTemp: 288,
    orbitDistance: 1.0,
    starTemp: 5778,
  });

  const [habitabilityScore, setHabitabilityScore] = useState<number | null>(null);

  const metrics = useMemo(() => {
    const baseMetrics = generateMetrics(params);
    
    const matchingPreset = EXOPLANET_PRESETS.find(p => 
      p.params.planetRadius === params.planetRadius &&
      p.params.planetMass === params.planetMass &&
      p.params.equilibriumTemp === params.equilibriumTemp &&
      p.params.orbitDistance === params.orbitDistance &&
      p.params.starTemp === params.starTemp
    );

    let finalScore = baseMetrics.habitabilityScore;
    if (matchingPreset) {
      finalScore = matchingPreset.fixedESI;
    } else if (habitabilityScore !== null) {
      finalScore = habitabilityScore;
    }

    return { ...baseMetrics, habitabilityScore: finalScore };
  }, [params, habitabilityScore]);

  useEffect(() => {
    const isCatalogMatch = EXOPLANET_PRESETS.some(p => 
      p.params.planetRadius === params.planetRadius &&
      p.params.planetMass === params.planetMass &&
      p.params.equilibriumTemp === params.equilibriumTemp &&
      p.params.orbitDistance === params.orbitDistance &&
      p.params.starTemp === params.starTemp
    );

    if (isCatalogMatch) return;

    const debounceHandler = setTimeout(async () => {
      try {
        const response = await fetch("/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            radius: params.planetRadius,
            mass: params.planetMass,
            temp: params.equilibriumTemp,
            orbit: params.orbitDistance,
            star_temp: params.starTemp,
            eccentricity: 0.0,
            num_stars: 1.0
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && typeof result.esi_score === "number") {
            setHabitabilityScore(result.esi_score);
          }
        }
      } catch (error) {
        console.error("Network error fetching Habitability Score:", error);
      }
    }, 300);

    return () => clearTimeout(debounceHandler);
  }, [params]);

  const orbitalPeriodDays = useMemo(() => {
    const periodYears = Math.pow(params.orbitDistance, 1.5);
    const days = periodYears * 365.25;
    return days < 1 
      ? `${(days * 24).toFixed(1)} Hours` 
      : `${Math.round(days).toLocaleString()} Earth Days`;
  }, [params.orbitDistance]);

  const equilibriumTempCelsius = useMemo(() => {
    return (params.equilibriumTemp - 273.15).toFixed(1);
  }, [params.equilibriumTemp]);

  const densityGrams = useMemo(() => {
    return (metrics.density * 5.51).toFixed(2);
  }, [metrics.density]);

  const gravityMeters = useMemo(() => {
    return (metrics.gravity * 9.81).toFixed(2);
  }, [metrics.gravity]);

  const handleLoadPreset = (presetParams: SimulationParams) => {
    setHabitabilityScore(null); 
    setParams({ ...presetParams });
  };

  if (!showSimulator) {
    return <LandingPage onStart={() => setShowSimulator(true)} />;
  }

  return (
    <main className="flex flex-col-reverse lg:flex-row h-screen w-screen bg-[#050507] text-slate-100 overflow-hidden font-sans">
      
      <section className="w-full lg:w-[360px] xl:w-[390px] h-[45vh] lg:h-full flex flex-col glass z-20 overflow-y-auto shrink-0 select-none">
        
        <header className="p-8 border-b border-white/5 bg-transparent shrink-0">
          <div className="flex items-center justify-start cursor-pointer group" onClick={() => setShowSimulator(false)}>
            <img src="/exohabx-logo.png" alt="ExoHabX Logo" className="h-12 w-auto object-contain group-hover:opacity-80 transition-opacity" />
          </div>
        </header>

        <div className="flex-1 p-8 flex flex-col gap-8">
          
          <section className="space-y-3 order-2 lg:order-1">
            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 text-slate-300">
              <span>Catalog Presets</span>
              <Database className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXOPLANET_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleLoadPreset(preset.params)}
                  className={`px-3 py-2 text-xs font-medium rounded text-left transition-all border outline-none ${
                    Math.abs(params.planetRadius - preset.params.planetRadius) < 0.05 &&
                    Math.abs(params.equilibriumTemp - preset.params.equilibriumTemp) < 5
                      ? "bg-white/10 border-white/20 text-white shadow-[0_0_12px_rgba(255,255,255,0.12)]"
                      : "bg-white/[0.02] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="font-semibold truncate">{preset.name}</div>
                  <div className="text-[9px] font-mono text-slate-500 mt-0.5">
                    ESI: {preset.fixedESI.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6 order-1 lg:order-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-50 text-slate-300">
              <span>Atmospheric & Kinetic Controls</span>
            </div>

            <div className="space-y-5">
              
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-60 text-slate-300 font-mono">
                  <span>Planet Radius</span>
                  <span className="text-sky-400 font-bold">{params.planetRadius.toFixed(2)} R⊕</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.05"
                  value={params.planetRadius}
                  onChange={(e) => setParams(prev => ({ ...prev, planetRadius: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-60 text-slate-300 font-mono">
                  <span>Planet Mass</span>
                  <span className="text-emerald-400 font-bold">{params.planetMass.toFixed(2)} M⊕</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="15.0"
                  step="0.1"
                  value={params.planetMass}
                  onChange={(e) => setParams(prev => ({ ...prev, planetMass: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-60 text-slate-300 font-mono">
                  <span>Equilibrium Temp</span>
                  <span className="text-orange-400 font-bold">{params.equilibriumTemp} K</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="500"
                  step="5"
                  value={params.equilibriumTemp}
                  onChange={(e) => setParams(prev => ({ ...prev, equilibriumTemp: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-60 text-slate-300 font-mono">
                  <span>Orbit Distance</span>
                  <span className="text-indigo-400 font-bold">{params.orbitDistance.toFixed(2)} AU</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.05"
                  value={params.orbitDistance}
                  onChange={(e) => setParams(prev => ({ ...prev, orbitDistance: parseFloat(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] uppercase tracking-widest opacity-60 text-slate-300 font-mono">
                  <span>Host Star Temp</span>
                  <span className="text-yellow-400 font-bold">{params.starTemp.toLocaleString()} K</span>
                </div>
                <input
                  type="range"
                  min="3000"
                  max="7000"
                  step="100"
                  value={params.starTemp}
                  onChange={(e) => setParams(prev => ({ ...prev, starTemp: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

            </div>
          </section>

          <section className="pt-4 border-t border-white/5 space-y-2 order-3">
            <div className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
              AI Analysis Status
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
                MODEL_ACTIVE
              </span>
            </div>
          </section>

        </div>

        <footer className="p-6 border-t border-white/5 bg-transparent text-left shrink-0 flex items-center gap-3">
          <span className="text-[8px] font-mono text-white/20 tracking-[0.2em] uppercase">
            Created By
          </span>
          <img 
            src="/astro-logo.png" 
            alt="Astrowalid Logo" 
            className="h-10 opacity-60 hover:opacity-100 transition-opacity"
          />
        </footer>
      </section>

      <section className="flex-1 relative overflow-hidden flex flex-col bg-[#020205]">
        
        <div className="absolute inset-0 z-0 opacity-[0.25] pointer-events-none star-grid-bg" />

        <div className="absolute top-4 left-4 lg:top-12 lg:left-12 pointer-events-none z-20 text-slate-100 flex flex-col gap-1 max-w-[160px] lg:gap-1.5 lg:max-w-sm">
          <div className="text-[8px] lg:text-[10px] font-mono text-sky-400 font-bold uppercase tracking-[0.25em] flex items-center gap-1.5">
            <Sparkles className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 animate-pulse text-sky-400" />
            <span className="hidden lg:inline">SYSTEM_ANALYSIS</span>
            <span className="lg:hidden">ANALYSIS</span>
          </div>
          <h2 className="text-lg lg:text-3xl font-light tracking-tight text-white uppercase font-sans leading-tight">
            {metrics.classification.split(" ")[0] === "Earth-like" ? "Exo-Earth 101" : "Planet Designation X"}
          </h2>
          <p className="hidden lg:block text-[11px] text-white/45 leading-relaxed tracking-wide font-light max-w-xs">
            Predictive habitability model based on stellar heat flux, planetary mass, and atmospheric equilibrium parameters.
          </p>
        </div>

        <div className="absolute top-4 right-4 lg:top-12 lg:right-12 text-right z-20 pointer-events-none">
          <div className="hidden lg:block text-[10px] tracking-[0.2em] text-sky-400 font-bold uppercase mb-1">
            Habitability Score
          </div>
          <div className="text-4xl lg:text-7xl font-light tracking-tighter text-white glow-text select-none">
            {metrics.habitabilityScore.toFixed(2)}
          </div>
          <div className="mt-2 lg:mt-4 inline-block px-2 py-0.5 lg:px-3 lg:py-1 bg-green-500/10 border border-green-500/15 rounded-full text-[8px] lg:text-[10px] tracking-widest text-green-400 uppercase">
            <span className="hidden lg:inline">Assessment: </span>{metrics.classification.split(" ")[0]}
          </div>
        </div>

        <div className="flex-grow w-full h-full relative z-10 bg-transparent">
          <ThreeCanvas params={params} metrics={metrics} />
        </div>

        <div className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:right-12 flex justify-between lg:justify-end lg:gap-10 z-20 text-white/40 pointer-events-none">
          <div className="space-y-0.5 lg:space-y-1 text-center lg:text-left">
            <div className="text-[7px] lg:text-[9px] uppercase tracking-widest font-mono">Orbital Period</div>
            <div className="text-sm lg:text-lg font-light text-white">{metrics.orbitalPeriod}</div>
          </div>
          <div className="space-y-0.5 lg:space-y-1 text-center lg:text-left">
            <div className="text-[7px] lg:text-[9px] uppercase tracking-widest font-mono">Surface Gravity</div>
            <div className="text-sm lg:text-lg font-light text-white">{metrics.gravity} G</div>
          </div>
          <div className="space-y-0.5 lg:space-y-1 text-center lg:text-left">
            <div className="text-[7px] lg:text-[9px] uppercase tracking-widest font-mono">Bulk Density</div>
            <div className="text-sm lg:text-lg font-light text-white">{metrics.density} D⊕</div>
          </div>
        </div>

        <div className="absolute bottom-8 left-12 z-20 text-[10px] font-mono text-white/30 tracking-widest pointer-events-none hidden lg:block">
          DRAG_LMB REVOLUTION // SCROLL_W ZOOM // RESIZING ACTIVE
        </div>

      </section>

    </main>
  );
}