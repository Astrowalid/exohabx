import { SimulationParams, HabitabilityMetrics } from "./types";

export function getStarProps(temp: number): {
  starClass: string;
  colorHex: string;
  glowHex: string;
  sizeMultiplier: number;
} {
  if (temp < 3700) {
    return {
      starClass: "Class M (Red Dwarf)",
      colorHex: "#ff5a36",
      glowHex: "#ff2200",
      sizeMultiplier: 0.65,
    };
  } else if (temp < 5200) {
    return {
      starClass: "Class K (Orange Dwarf)",
      colorHex: "#ff9138",
      glowHex: "#ff6a00",
      sizeMultiplier: 0.8,
    };
  } else if (temp < 6000) {
    return {
      starClass: "Class G (Yellow Dwarf)",
      colorHex: "#ffea75",
      glowHex: "#ffa600",
      sizeMultiplier: 1.0,
    };
  } else {
    return {
      starClass: "Class F (Yellow-White Star)",
      colorHex: "#e0f2fe",
      glowHex: "#38bdf8",
      sizeMultiplier: 1.2,
    };
  }
}

export function getPlanetClassification(
  radius: number,
  mass: number,
  temp: number
): string {
  if (radius > 3.0 || mass > 10.0) {
    if (temp > 400) return "Hot Jupiter";
    if (temp < 200) return "Jovian Ice Giant";
    return "Gas Giant";
  }
  
  if (radius > 1.4 || mass > 4.0) {
    if (temp > 350) return "Hot Super-Earth (Lava World)";
    if (temp < 200) return "Cold Super-Earth";
    if (temp >= 240 && temp <= 310) return "Temperate Super-Earth (Ocean World)";
    return "Super-Earth (Rocky)";
  }

  if (radius >= 0.7 && radius <= 1.4) {
    if (temp > 373) return "Superheated Desert (Scorched)";
    if (temp < 200) return "Frozen Ice ball";
    if (temp >= 235 && temp <= 315) {
      if (mass >= 0.6 && mass <= 1.4) return "Earth-like (Habitable)";
      return "Temperate Rocky Planet";
    }
    return "Barren Rocky Planet";
  }

  if (temp > 350) return "Scorched Dwarf Planet";
  if (temp < 200) return "Ice Ball (Dwarf)";
  return "Sub-Earth Dwarf";
}

export function calculateMockHabitability(
  radius: number,
  mass: number,
  temp: number,
  orbit: number,
  starTemp: number
): number {
  if (radius === 1.0 && mass === 1.0 && temp === 288 && orbit === 1.0 && starTemp === 5778) {
    return 1.0;
  }

  const r0 = 1.0;
  const d0 = 1.0;
  const v0 = 1.0;
  const t0 = 288.0;

  const radiusVal = radius;
  const densityVal = mass / Math.pow(radius, 3);
  const escapeVelocityVal = Math.sqrt(mass / radius);
  const tempVal = temp;

  const wRadius = 0.57;
  const wDensity = 1.07;
  const wEscape = 0.70;
  const wTemp = 5.58;

  const totalWeight = wRadius + wDensity + wEscape + wTemp; 

  const term = (x: number, x0: number, w: number) => {
    const ratio = Math.abs(x - x0) / (x + x0);
    const clampedRatio = Math.max(0, Math.min(0.999, ratio));
    return Math.pow(1 - clampedRatio, w);
  };

  const rTerm = term(radiusVal, r0, wRadius);
  const dTerm = term(densityVal, d0, wDensity);
  const vTerm = term(escapeVelocityVal, v0, wEscape);
  const tTerm = term(tempVal, t0, wTemp);

  const rawScore = Math.pow(rTerm * dTerm * vTerm * tTerm, 1 / totalWeight);

  const finalScore = isNaN(rawScore) ? 0.0 : Math.max(0.0, Math.min(1.0, rawScore));
  
  return parseFloat(finalScore.toFixed(2));
}

export function generateMetrics(params: SimulationParams): HabitabilityMetrics {
  const { planetRadius, planetMass, equilibriumTemp, orbitDistance, starTemp } = params;

  const habitabilityScore = calculateMockHabitability(
    planetRadius,
    planetMass,
    equilibriumTemp,
    orbitDistance,
    starTemp
  );

  const classification = getPlanetClassification(
    planetRadius,
    planetMass,
    equilibriumTemp
  );

  const gravity = planetMass / Math.pow(planetRadius, 2);
  const density = planetMass / Math.pow(planetRadius, 3);
  
  const periodYears = Math.pow(orbitDistance, 1.5);
  const days = periodYears * 365.25;
  const orbitalPeriod = days < 1 
    ? `${(days * 24).toFixed(1)} Hours` 
    : `${Math.round(days).toLocaleString()} Days`;

  const starProps = getStarProps(starTemp);

  return {
    habitabilityScore,
    classification,
    gravity: parseFloat(gravity.toFixed(2)),
    density: parseFloat(density.toFixed(2)),
    orbitalPeriod,
    starClass: starProps.starClass,
    starColorHex: starProps.colorHex,
    starGlowColor: starProps.glowHex,
  };
}