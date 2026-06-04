import { ArrowRight, Globe, Zap, ShieldCheck, Cpu } from "lucide-react";
import LandingBackground from "./components/LandingBackground";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="relative w-full h-screen bg-[#050507] text-slate-100 overflow-y-auto overflow-x-hidden font-sans scroll-smooth">
      <LandingBackground />

      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <img src="/exohabx-logo.png" alt="ExoHabX Logo" className="h-8 w-auto object-contain" />
        </div>
        
        <nav className="hidden lg:flex items-center gap-12">
          {[
            { label: "Mission", href: "#mission" },
            { label: "Guide", href: "#guide" },
          ].map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 hover:text-sky-400 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          onClick={onStart}
          className="px-6 py-2 bg-white/5 border border-white/10 hover:border-sky-500/50 rounded-full transition-all duration-300"
        >
          <span className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] uppercase text-white">
            Launch <ArrowRight className="w-3 h-3" />
          </span>
        </button>
      </header>

      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center z-10">
        <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h1 className="text-5xl lg:text-8xl font-light tracking-tighter text-white leading-tight">
            EXPLORE LIFE’S <br />
            <span className="text-sky-400 glow-text">POSSIBILITIES</span> <br />
            ON EXOHABX.
          </h1>
          <p className="text-lg lg:text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Predictive Exoplanet Habitability, Redefined. Leverage Advanced Data Modeling for Cosmic Discoveries.
          </p>
          <div className="pt-8">
            <button
              onClick={onStart}
              className="group relative px-8 py-4 bg-white/5 border border-white/10 hover:border-sky-500/50 rounded-full transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2 text-sm font-mono tracking-[0.2em] uppercase text-white">
                Launch Simulator <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <div className="w-[1px] h-12 bg-white" />
        </div>
      </section>

      <section id="mission" className="relative z-10 py-32 px-6 lg:px-24 glass-edge border-t border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-8 text-left">
            <div className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-[0.3em]">
              THE MISSION
            </div>
            <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-white leading-tight">
              Decoding the Habitability of Distant Worlds
            </h2>
            <p className="text-lg text-white/50 font-light leading-relaxed">
              ExoHabX is a next-generation astrophysical simulator designed to visualize and predict the habitability potential of exoplanets. By integrating real-time Keplerian physics with advanced machine learning models, we provide a window into the conditions of planets light-years away.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                <Globe className="w-6 h-6 text-sky-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">3D Visualization</h3>
                <p className="text-xs text-white/40 leading-relaxed">Procedural textures and real-time orbital mechanics.</p>
              </div>
              <div className="space-y-2">
                <Cpu className="w-6 h-6 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">AI Analysis</h3>
                <p className="text-xs text-white/40 leading-relaxed">Predictive ESI scoring using planetary parameters.</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-video glass rounded-3xl border border-white/5 overflow-hidden group shadow-2xl">
            <img 
              src="/app-screens/app-screen.png" 
              alt="ExoHabX App Interface" 
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-transparent to-transparent opacity-60" />
          </div>
        </div>
      </section>

      <section id="guide" className="relative z-10 py-32 px-6 lg:px-24 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-[0.3em]">
              OPERATION GUIDE
            </div>
            <h2 className="text-3xl lg:text-5xl font-light tracking-tight text-white">
              Navigating the Universe
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass overflow-hidden rounded-2xl border border-white/5 flex flex-col hover:border-sky-500/30 transition-all duration-500 group">
              <div className="aspect-video overflow-hidden border-b border-white/5">
                <img src="/app-screens/control.png" alt="Control Panel" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-sky-400" />
                  <h3 className="text-lg font-semibold text-white">1. Configure</h3>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  Use the Control Deck to adjust planetary mass, radius, and orbital distance. Watch the physics engine respond instantly.
                </p>
              </div>
            </div>

            <div className="glass overflow-hidden rounded-2xl border border-white/5 flex flex-col hover:border-emerald-500/30 transition-all duration-500 group">
              <div className="aspect-video overflow-hidden border-b border-white/5">
                <img src="/app-screens/score.png" alt="Habitability Score" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">2. Analyze</h3>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  Monitor the real-time AI Assessment Score. The system calculates the Earth Similarity Index based on your inputs.
                </p>
              </div>
            </div>

            <div className="glass overflow-hidden rounded-2xl border border-white/5 flex flex-col hover:border-indigo-500/30 transition-all duration-500 group">
              <div className="aspect-video relative overflow-hidden border-b border-white/5 flex bg-black/40">
                <img src="/app-screens/star-label.png" alt="Star Label" className="w-1/2 h-full object-cover border-r border-white/5 group-hover:scale-105 transition-transform duration-700" />
                <img src="/app-screens/planet-label.png" alt="Planet Label" className="w-1/2 h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-8 space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-white">3. Interact</h3>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  Click on the 3D celestial bodies in the viewport to open interactive data labels and explore specific object metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-24 border-t border-white/5 text-center">
         <div className="mb-16">
            <button
              onClick={onStart}
              className="group relative px-8 py-4 bg-white/5 border border-white/10 hover:border-sky-500/50 rounded-full transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center gap-2 text-sm font-mono tracking-[0.2em] uppercase text-white">
                Launch Simulator <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
         </div>
         <img 
            src="/astro-logo.png" 
            alt="Astrowalid Logo" 
            className="h-12 mx-auto opacity-30 hover:opacity-100 transition-opacity mb-6"
          />
          <p className="text-[10px] font-mono text-white/20 tracking-[0.2em] uppercase">
            ExoHabX © 2026 // Astrophysical Exploration Systems
          </p>
      </footer>
    </div>
  );
}