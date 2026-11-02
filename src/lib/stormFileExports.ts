/**
 * Text builders for the storm files the app exports (CSV, SWMM, HEC-HMS gage).
 * Kept as plain functions so the round-trip tests can export a storm and load it back
 * through the importer (src/lib/rainfallParsers.ts).
 *
 * Inputs are always US customary (in, in/hr); `unitSystem` decides what is written.
 */
import { type UnitSystem, convertDepth, convertIntensity, getDepthUnit, getIntensityUnit } from "@/lib/unitConversions";
import { CONFIDENCE_LABELS, getPatternProvenance } from "@/lib/patternProvenance";
import { type PatternType, generateRainfallDataDetailed } from "@/lib/rainfallPatterns";

/**
 * Comment lines stating the pattern's source, confidence, how the app differs from the source,
 * and whether the calculator had to adjust this storm. Empty for custom or unknown patterns.
 */
export function provenanceCommentLines(prefix: string, patternId: string | undefined, duration: number, timeStep: number): string[] {
  if (!patternId || patternId === 'custom') return [];
  const p = getPatternProvenance(patternId);
  const lines = [
    `${prefix}Source:         ${p.source}`,
    `${prefix}Confidence:     ${CONFIDENCE_LABELS[p.confidence]}`,
  ];
  if (p.approximation) lines.push(`${prefix}Approximation:  ${p.approximation}`);
  if (duration > 0 && timeStep > 0) {
    const g = generateRainfallDataDetailed(patternId as PatternType, 1, duration, timeStep);
    lines.push(`${prefix}Calculator:     ${g.fallback === 'none' ? 'pattern formula used directly' : `${g.fallback.replace('_', ' ')} - ${g.reason}`}`);
  }
  return lines;
}

export interface ExportMeta {
  pattern: string;
  /** Pattern id; when given, source/confidence/calculator notes are written into the header. */
  patternId?: string;
  totalDepth: number; // inches
  duration: number; // hours
  timeStep: number; // minutes
  unitSystem: UnitSystem;
  projectName?: string;
  engineerName?: string;
  companyName?: string;
  /** Fixed timestamp for reproducible output (tests); defaults to now. */
  generatedAt?: Date;
}

/** Points with `time` in hours and `intensity` in in/hr. */
export interface HourPoint { time: number; intensity: number }

const stamp = (d?: Date) => (d ?? new Date()).toISOString().slice(0, 19).replace('T', ' ') + ' UTC';
const decimals = (u: UnitSystem) => (u === 'USA' ? 4 : 2);

/** HH:MM from hours, rounding to the nearest minute first so 59.99 min never prints as "00:60". */
export function hoursToClock(hours: number): string {
  const total = Math.round(hours * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Self-documenting metadata header (prefix "# " for CSV, "; " for SWMM). */
export function buildExportHeader(format: 'csv' | 'swmm', data: HourPoint[], m: ExportMeta): string {
  const exportDepth = convertDepth(m.totalDepth, 'USA', m.unitSystem);
  const peakUs = Math.max(...data.map((d) => d.intensity));
  const peakIntensity = convertIntensity(peakUs, 'USA', m.unitSystem);
  const peakIndex = data.findIndex((d) => d.intensity === peakUs);
  const peakTime = peakIndex >= 0 ? data[peakIndex].time : 0;
  const prefix = format === 'csv' ? '# ' : '; ';
  const lines = [
    `${prefix}==========================================`,
    `${prefix}Rain Canvas Studio Export`,
    `${prefix}Generated: ${stamp(m.generatedAt)}`,
    `${prefix}==========================================`,
  ];
  if (m.projectName) lines.push(`${prefix}Project:        ${m.projectName}`);
  if (m.engineerName) lines.push(`${prefix}Engineer:       ${m.engineerName}`);
  if (m.companyName) lines.push(`${prefix}Company:        ${m.companyName}`);
  if (m.projectName || m.engineerName || m.companyName) lines.push(`${prefix}------------------------------------------`);
  lines.push(
    `${prefix}Total Depth:    ${exportDepth.toFixed(m.unitSystem === 'USA' ? 2 : 1)} ${getDepthUnit(m.unitSystem)}`,
    `${prefix}Duration:       ${m.duration} hours`,
    `${prefix}Time Step:      ${m.timeStep} minutes`,
    `${prefix}Pattern:        ${m.pattern}`,
    ...provenanceCommentLines(prefix, m.patternId, m.duration, m.timeStep),
    `${prefix}Peak Intensity: ${peakIntensity.toFixed(2)} ${getIntensityUnit(m.unitSystem)} at t=${peakTime.toFixed(2)} hr`,
    `${prefix}Unit System:    ${m.unitSystem}`,
    `${prefix}==========================================`,
    '',
  );
  return lines.join('\n');
}

/** CSV: time in hours, intensity in the chosen unit per interval starting at that time. */
export function buildCsvExport(data: HourPoint[], m: ExportMeta): string {
  let out = buildExportHeader('csv', data, m);
  out += `Time (hr),Intensity (${getIntensityUnit(m.unitSystem)})\n`;
  data.forEach((p) => {
    out += `${p.time.toFixed(6)},${convertIntensity(p.intensity, 'USA', m.unitSystem).toFixed(decimals(m.unitSystem))}\n`;
  });
  return out;
}

/**
 * SWMM [TIMESERIES] script of intensities, for pasting into an existing model.
 * No rain gage is written (it would clash with the model's own); the comment states the unit.
 */
export function buildSwmmScriptExport(data: HourPoint[], m: ExportMeta): string {
  const intensityUnit = getIntensityUnit(m.unitSystem);
  let out = buildExportHeader('swmm', data, m);
  out += `; Use with a rain gage of format INTENSITY, interval ${minutesToHHMM(m.timeStep)}\n`;
  out += `[TIMESERIES]\n`;
  out += `;Name       Date       Time       Value (${intensityUnit})\n`;
  data.forEach((p) => {
    out += `RainPattern             ${hoursToClock(p.time)}     ${convertIntensity(p.intensity, 'USA', m.unitSystem).toFixed(decimals(m.unitSystem))}\n`;
  });
  return out;
}

/** EPA SWMM rainfall .dat: Station Year Month Day Hour Minute incremental-depth. */
export function buildSwmmDatExport(data: HourPoint[], m: ExportMeta): string {
  const depthUnit = getDepthUnit(m.unitSystem);
  const total = convertDepth(m.totalDepth, 'USA', m.unitSystem);
  const stepHr = m.timeStep / 60;
  let dat = '';
  dat += `; EPA SWMM Rainfall Data File (.dat)\n`;
  dat += `; Generated by Rain Canvas Studio\n`;
  dat += `; ${stamp(m.generatedAt)}\n`;
  dat += `;\n`;
  if (m.projectName) dat += `; Project:    ${m.projectName}\n`;
  if (m.engineerName) dat += `; Engineer:   ${m.engineerName}\n`;
  if (m.companyName) dat += `; Company:    ${m.companyName}\n`;
  if (m.projectName || m.engineerName || m.companyName) dat += `;\n`;
  dat += `; Pattern:    ${m.pattern}\n`;
  provenanceCommentLines('; ', m.patternId, m.duration, m.timeStep).forEach((l) => (dat += `${l}\n`));
  dat += `; Total Depth: ${total.toFixed(m.unitSystem === 'USA' ? 2 : 1)} ${depthUnit}\n`;
  dat += `; Duration:   ${m.duration} hours\n`;
  dat += `; Time Step:  ${m.timeStep} minutes\n`;
  dat += `; Units:      ${m.unitSystem === 'USA' ? 'IN (inches)' : 'MM (millimeters)'}\n`;
  dat += `;\n`;
  dat += `; Format: Station Year Month Day Hour Minute Value\n`;
  dat += `; Value = incremental depth per timestep (${depthUnit})\n`;
  dat += `;\n`;
  const base = Date.UTC(2025, 0, 1, 0, 0, 0);
  data.forEach((d) => {
    const depth = convertIntensity(d.intensity, 'USA', m.unitSystem) * stepHr;
    const t = new Date(base + Math.round(d.time * 60) * 60000);
    const mo = String(t.getUTCMonth() + 1).padStart(2, ' ');
    const dy = String(t.getUTCDate()).padStart(2, ' ');
    const hr = String(t.getUTCHours()).padStart(2, ' ');
    const mn = String(t.getUTCMinutes()).padStart(2, '0');
    dat += `STA001  ${t.getUTCFullYear()}  ${mo}  ${dy}  ${hr}  ${mn}  ${depth.toFixed(decimals(m.unitSystem) + 2)}\n`;
  });
  return dat;
}

/** "00:15" style interval for SWMM rain gages. */
export function minutesToHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const mm = Math.round(minutes % 60);
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

// ---------------------------------------------------------------- per-step builders (SWMM integration panel)

export interface StepSeriesMeta {
  name: string;
  patternDisplayName: string;
  patternId?: string;
  totalDepth: number; // inches
  duration: number; // hours
  timeStep: number; // minutes
  unitSystem: UnitSystem;
}

function stepClock(i: number, timeStep: number) {
  const timeMinutes = i * timeStep;
  const dayOffset = Math.floor(timeMinutes / 1440);
  const hours = Math.floor((timeMinutes % 1440) / 60);
  const minutes = timeMinutes % 60;
  return {
    time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    swmmDate: `01/${String(1 + dayOffset).padStart(2, '0')}/2024`,
    hecDate: `${String(1 + dayOffset).padStart(2, '0')}Jan2024`,
  };
}

const stepDepth = (inHr: number, m: StepSeriesMeta) => convertIntensity(inHr, 'USA', m.unitSystem) * (m.timeStep / 60);

/** SWMM [TIMESERIES] rows (incremental depth per step) with a comment stating the total depth. */
export function buildSwmmTimeSeriesRows(intensities: number[], m: StepSeriesMeta): string {
  const exportDepth = convertDepth(m.totalDepth, 'USA', m.unitSystem);
  const lines = [
    `; Generated time series for ${m.patternDisplayName}`,
    ...provenanceCommentLines('; ', m.patternId, m.duration, m.timeStep),
    `; Total depth: ${exportDepth.toFixed(m.unitSystem === 'USA' ? 2 : 1)} ${getDepthUnit(m.unitSystem)}, Duration: ${m.duration} hrs, Time step: ${m.timeStep} min, Values: incremental depth`,
  ];
  intensities.forEach((v, i) => {
    const c = stepClock(i, m.timeStep);
    lines.push(`${m.name}  ${c.swmmDate}  ${c.time}  ${stepDepth(v, m).toFixed(6)}`);
  });
  return lines.join('\n');
}

/** XP-SWMM / PCSWMM block: [TIMESERIES] of incremental depths plus a VOLUME rain gage. */
export function buildXpSwmmExport(intensities: number[], m: StepSeriesMeta): string {
  const exportDepth = convertDepth(m.totalDepth, 'USA', m.unitSystem);
  const lines: string[] = [
    `;;; XP-SWMM / PCSWMM Compatible Rainfall Data`,
    `;;; Generated by Pattern Painter`,
    `;;; Pattern: ${m.patternDisplayName}`,
    ...provenanceCommentLines(';;; ', m.patternId, m.duration, m.timeStep),
    `;;; Total Depth: ${exportDepth.toFixed(2)} ${getDepthUnit(m.unitSystem)}`,
    `;;; Duration: ${m.duration} hours`,
    `;;; Time Step: ${m.timeStep} minutes`,
    `;;; Data Type: Incremental Depth`,
    ``,
    `[TIMESERIES]`,
    `;;Name           Date       Time       Value`,
    `;;-------------- ---------- ---------- ----------`,
  ];
  intensities.forEach((v, i) => {
    const c = stepClock(i, m.timeStep);
    lines.push(`${m.name.padEnd(16)} ${c.swmmDate}  ${c.time}      ${stepDepth(v, m).toFixed(6)}`);
  });
  lines.push(``, `[RAINGAGES]`, `;;Name           Format    Interval SCF      Source`, `;;-------------- --------- -------- -------- ----------`);
  lines.push(`RG_${m.name.substring(0, 12).padEnd(12)} VOLUME    ${minutesToHHMM(m.timeStep)}    1.0      TIMESERIES ${m.name}`);
  return lines.join('\n');
}

/** HEC-HMS precipitation gage text with dated incremental-depth rows. */
export function buildHecGageRows(intensities: number[], m: StepSeriesMeta): string {
  const exportDepth = convertDepth(m.totalDepth, 'USA', m.unitSystem);
  const lines: string[] = [
    `# HEC-HMS Precipitation Gage Data`,
    `# Generated by Pattern Painter`,
    `# Pattern: ${m.patternDisplayName}`,
    ...provenanceCommentLines('# ', m.patternId, m.duration, m.timeStep),
    `# Total Depth: ${exportDepth.toFixed(m.unitSystem === 'USA' ? 2 : 1)} ${getDepthUnit(m.unitSystem)}`,
    `# Duration: ${m.duration} hours`,
    `# Time Step: ${m.timeStep} minutes`,
    `#`,
    `Gage: ${m.name}`,
    `Units: ${m.unitSystem === 'USA' ? 'IN' : 'MM'}`,
    `Type: INCREMENTAL`,
    `Time Interval: ${m.timeStep} MIN`,
    `#`,
    `# Date        Time      Precip`,
    `# ----------  --------  ------`,
  ];
  intensities.forEach((v, i) => {
    const c = stepClock(i, m.timeStep);
    lines.push(`${c.hecDate}  ${c.time}     ${stepDepth(v, m).toFixed(4)}`);
  });
  lines.push(`# End of Data`);
  return lines.join('\n');
}
