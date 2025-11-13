export type UnitSystem = 'USA' | 'SI';

const INCH_TO_MM = 25.4;

export function convertDepth(value: number, from: UnitSystem, to: UnitSystem): number {
  if (from === to) return value;
  if (from === 'USA' && to === 'SI') return value * INCH_TO_MM;
  return value / INCH_TO_MM;
}

export function convertIntensity(value: number, from: UnitSystem, to: UnitSystem): number {
  return convertDepth(value, from, to);
}

export function getDepthUnit(system: UnitSystem): string {
  return system === 'USA' ? 'in' : 'mm';
}

export function getIntensityUnit(system: UnitSystem): string {
  return system === 'USA' ? 'in/hr' : 'mm/hr';
}

export function formatDepth(value: number, system: UnitSystem): string {
  const decimals = system === 'USA' ? 2 : 1;
  return `${value.toFixed(decimals)} ${getDepthUnit(system)}`;
}

export function formatIntensity(value: number, system: UnitSystem): string {
  const decimals = system === 'USA' ? 4 : 2;
  return `${value.toFixed(decimals)} ${getIntensityUnit(system)}`;
}
