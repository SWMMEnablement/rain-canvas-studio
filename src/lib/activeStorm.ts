import type { UnitSystem } from "@/lib/unitConversions";

/**
 * The storm currently configured in the Storm Generator. Other tabs read it so
 * they analyse the same storm instead of their own defaults.
 * Depths are in the storm's own unit system (in for USA, mm for SI).
 */
export interface ActiveStorm {
  pattern: string;
  patternName: string;
  /** Depth as entered, before any climate uplift */
  depth: number;
  /** Depth after the climate uplift (equals depth when no scenario) */
  effectiveDepth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
  climateScenario: string;
  climateFactor: number;
}

export function describeActiveStorm(s: ActiveStorm): string {
  const u = s.unitSystem === "SI" ? "mm" : "in";
  const depth = s.unitSystem === "SI" ? s.effectiveDepth.toFixed(1) : s.effectiveDepth.toFixed(2);
  const cc = s.climateFactor !== 1 ? ` (climate ×${s.climateFactor.toFixed(2)})` : "";
  return `${s.patternName} · ${depth} ${u}${cc} · ${s.duration} h · ${s.timeStep} min`;
}

/**
 * The climate scenario is only kept when the pattern really changed, so a
 * shared link (which sets pattern and scenario together) keeps its uplift.
 */
export function nextClimateScenario(prevPattern: string | null, nextPattern: string, current: string): string {
  if (prevPattern === null || prevPattern === nextPattern) return current;
  return "none";
}
