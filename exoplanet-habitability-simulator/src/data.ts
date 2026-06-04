import { SimulationParams } from "./types";

export interface PlanetPreset {
  name: string;
  description: string;
  params: SimulationParams;
  fixedESI: number; 
}

export const EXOPLANET_PRESETS: PlanetPreset[] = [
  {
    name: "Earth Baseline",
    description: "Our blue planet. Perfect liquid water equilibrium, ideal solar luminosity, G-type yellow host dwarf.",
    params: {
      planetRadius: 1.0,
      planetMass: 1.0,
      equilibriumTemp: 288,
      orbitDistance: 1.0,
      starTemp: 5778,
    },
    fixedESI: 1.0,
  },
  {
    name: "Trappist-1e",
    description: "An ultra-compact terrestrial exoplanet orbiting a cool M-type red dwarf, located in the habitable zone.",
    params: {
      planetRadius: 0.92,
      planetMass: 0.69,
      equilibriumTemp: 251,
      orbitDistance: 0.15,
      starTemp: 3100,
    },
    fixedESI: 0.85,
  },
  {
    name: "Kepler-452b",
    description: "The 'older, bigger cousin' of Earth. First discovered near-Earth-size planet orbiting a Sun-like star.",
    params: {
      planetRadius: 1.63,
      planetMass: 5.0,
      equilibriumTemp: 265,
      orbitDistance: 1.04,
      starTemp: 5757,
    },
    fixedESI: 0.83,
  },
  {
    name: "Gliese 581g",
    description: "A controversial, heavily debated rocky Super-Earth planet with deep black iron basalt crusts.",
    params: {
      planetRadius: 1.5,
      planetMass: 3.1,
      equilibriumTemp: 228,
      orbitDistance: 0.14,
      starTemp: 3300,
    },
    fixedESI: 0.82,
  },
  {
    name: "Corot-7b",
    description: "A superheated Super-Earth 'Lava planet' orbiting extremely close to its primary white host star.",
    params: {
      planetRadius: 1.58,
      planetMass: 4.8,
      equilibriumTemp: 480,
      orbitDistance: 0.12,
      starTemp: 5275,
    },
    fixedESI: 0.22,
  },
];