export interface SimulationParams {
  planetRadius: number; 
  planetMass: number; 
  equilibriumTemp: number; 
  orbitDistance: number; 
  starTemp: number; 
}

export interface HabitabilityMetrics {
  habitabilityScore: number; 
  classification: string;
  gravity: number; 
  density: number; 
  orbitalPeriod: string;
  starClass: string;
  starColorHex: string;
  starGlowColor: string;
}