/**
 * Rainfall Data Parsers
 * Parses various rainfall data formats into a unified timeseries structure.
 *
 * Convention: every returned point is one interval that STARTS at `time` (minutes from the
 * first row) with a constant `intensity` (in/hr or mm/hr, per metadata.units). `cumulative`
 * is the depth at the END of that interval, so the last value equals the total depth.
 * Every file the app exports (CSV, SWMM, HEC-HMS) must load back through these parsers.
 */

export interface RainfallDataPoint {
  time: number; // minutes from start
  intensity: number; // in/hr or mm/hr depending on context
  cumulative?: number; // cumulative depth
}

export interface ParsedRainfallData {
  data: RainfallDataPoint[];
  metadata: {
    source: 'csv' | 'noaa' | 'swmm' | 'hec';
    filename: string;
    startDate?: string;
    endDate?: string;
    station?: string;
    units?: 'inches' | 'mm';
    timeStep?: number; // detected time step in minutes
    totalDepth?: number;
    peakIntensity?: number;
    peakTime?: number;
  };
  warnings: string[];
  errors: string[];
}

type Source = ParsedRainfallData['metadata']['source'];
type ValueKind = 'intensity' | 'depth' | 'cumulative';
type Units = 'inches' | 'mm';

// ---------------------------------------------------------------- helpers

const COMMENT_RE = /^\s*(#|;|\/\/|!)/;
const MONTHS: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

function splitLines(content: string): string[] {
  return content.replace(/^\uFEFF/, '').split(/\r?\n/);
}

function commentText(content: string): string {
  return splitLines(content).filter((l) => COMMENT_RE.test(l)).join('\n');
}

/** Units stated anywhere in the file (comments, headers, SWMM options). */
export function detectUnits(text: string): Units | undefined {
  const t = text;
  const unitSystem = t.match(/unit\s*system\s*[:=]\s*(SI|USA|US|metric|imperial)/i);
  if (unitSystem) return /^(SI|metric)$/i.test(unitSystem[1]) ? 'mm' : 'inches';
  const units = t.match(/^\s*(?:[;#/]*\s*)?units?\s*[:=]\s*(MM|IN|INCH|INCHES|MILLIMET\w*)\b/im);
  if (units) return /^M/i.test(units[1]) ? 'mm' : 'inches';
  const flow = t.match(/FLOW_UNITS\s+(CFS|GPM|MGD|CMS|LPS|MLD)/i);
  if (flow) return /CMS|LPS|MLD/i.test(flow[1]) ? 'mm' : 'inches';
  if (/\(\s*mm\s*(\/\s*h(r|our)?)?\s*\)|mm\/h|\d\s*mm\b/i.test(t)) return 'mm';
  if (/\(\s*in(ches)?\s*(\/\s*h(r|our)?)?\s*\)|in\/h|\d\s*(in|inches)\b/i.test(t)) return 'inches';
  return undefined;
}

/** "Total Depth: 2.00 in" in an export header, if present. */
function statedTotalDepth(text: string): number | undefined {
  const m = text.match(/total\s*depth\s*[:=]?\s*([\d.]+)/i);
  const v = m ? parseFloat(m[1]) : NaN;
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

/** Minutes since epoch for a date string (UTC, no time-zone shifts). Returns NaN if unknown. */
function dateToMinutes(s: string): number {
  const str = s.trim();
  let m = str.match(/^(\d{1,2})([A-Za-z]{3})(\d{4})$/); // 01Jan2025 (HEC)
  if (m && MONTHS[m[2].toLowerCase()] !== undefined) return Date.UTC(+m[3], MONTHS[m[2].toLowerCase()], +m[1]) / 60000;
  m = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/); // 2025-01-01
  if (m) return Date.UTC(+m[1], +m[2] - 1, +m[3]) / 60000;
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/); // 01/01/2024 (SWMM: month/day/year)
  if (m) {
    const y = +m[3] < 100 ? 2000 + +m[3] : +m[3];
    return Date.UTC(y, +m[1] - 1, +m[2]) / 60000;
  }
  return NaN;
}

/** HH:MM[:SS] → minutes (hours may exceed 24). */
function clockToMinutes(s: string): number {
  const m = s.trim().match(/^(\d{1,3}):(\d{2})(?::(\d{2}(?:\.\d+)?))?$/);
  if (!m) return NaN;
  return +m[1] * 60 + +m[2] + (m[3] ? +m[3] / 60 : 0);
}

/** Full date-time string (ISO, "2025-01-01 00:15", "01Jan2025 00:15", "01/01/2024 00:15") → minutes. */
function dateTimeToMinutes(s: string): number {
  const str = s.trim().replace(/^"|"$/g, '');
  const iso = str.match(/^(\d{4}-\d{1,2}-\d{1,2})[T\s](\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?)(Z|[+-]\d{2}:?\d{2})?$/);
  if (iso) {
    if (iso[3]) {
      const d = Date.parse(str.replace(' ', 'T'));
      return Number.isNaN(d) ? NaN : d / 60000;
    }
    return dateToMinutes(iso[1]) + clockToMinutes(iso[2]);
  }
  const parts = str.split(/\s+/);
  if (parts.length === 2) {
    const d = dateToMinutes(parts[0]);
    const t = clockToMinutes(parts[1]);
    if (!Number.isNaN(d) && !Number.isNaN(t)) return d + t;
  }
  const d = dateToMinutes(str);
  return d;
}

function mostCommonStep(times: number[]): number | undefined {
  const counts = new Map<number, number>();
  for (let i = 1; i < times.length; i++) {
    const d = Math.round((times[i] - times[i - 1]) * 1000) / 1000;
    if (d > 0) counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  let best: number | undefined;
  let bestCount = 0;
  counts.forEach((c, d) => {
    if (c > bestCount || (c === bestCount && best !== undefined && d < best)) {
      best = d;
      bestCount = c;
    }
  });
  return best;
}

interface RawRow { time: number; value: number }

/**
 * Turn raw (time, value) rows into intensity intervals and fill metadata.
 * `stepHint` (minutes) overrides the detected spacing, e.g. a SWMM rain-gage interval.
 */
function finalize(
  rows: RawRow[],
  kind: ValueKind,
  source: Source,
  filename: string,
  units: Units,
  warnings: string[],
  errors: string[],
  extra: Partial<ParsedRainfallData['metadata']> = {},
  stepHint?: number,
): ParsedRainfallData {
  const clean = rows.filter((r) => Number.isFinite(r.time) && Number.isFinite(r.value));
  clean.sort((a, b) => a.time - b.time);
  if (clean.length === 0) {
    if (errors.length === 0) errors.push('No rainfall values were found in the file.');
    return { data: [], metadata: { source, filename, units, ...extra }, warnings, errors };
  }
  const t0 = clean[0].time;
  const times = clean.map((r) => r.time - t0);
  const step = stepHint && stepHint > 0 ? stepHint : mostCommonStep(times) ?? 15;

  let values = clean.map((r) => r.value);
  if (kind === 'cumulative') {
    values = values.map((v, i) => Math.max(0, v - (i === 0 ? 0 : values[i - 1])));
  }
  const negative = values.filter((v) => v < 0).length;
  if (negative > 0) warnings.push(`${negative} negative value(s) were set to zero.`);

  // Gauge-style data (incremental depths, or values with a known recording interval) apply for
  // one step only; missing rows between them are dry intervals, so fill them with zeros.
  const fillGaps = kind !== 'intensity' || (stepHint !== undefined && stepHint > 0);
  const data: RainfallDataPoint[] = [];
  let cumulative = 0;
  times.forEach((time, i) => {
    const v = Math.max(0, values[i]);
    const next = i < times.length - 1 ? times[i + 1] : time + step;
    if (fillGaps) {
      const intensity = kind === 'intensity' ? v : (v * 60) / step;
      cumulative += kind === 'intensity' ? (v * step) / 60 : v;
      data.push({ time, intensity, cumulative });
      const gaps = Math.round((next - time) / step) - 1;
      for (let g = 1; g <= gaps && gaps < 200000; g++) data.push({ time: time + g * step, intensity: 0, cumulative });
    } else {
      const dt = next - time > 0 ? next - time : step;
      cumulative += (v * dt) / 60;
      data.push({ time, intensity: v, cumulative });
    }
  });

  const peakIntensity = Math.max(...data.map((d) => d.intensity));
  return {
    data,
    metadata: {
      source,
      filename,
      units,
      timeStep: Math.round(step * 1000) / 1000,
      totalDepth: cumulative,
      peakIntensity,
      peakTime: data.find((d) => d.intensity === peakIntensity)?.time,
      ...extra,
    },
    warnings,
    errors,
  };
}

/**
 * Decide whether bare values are intensities or incremental depths using the export's
 * "Total Depth" header: whichever reading reproduces the stated depth wins.
 */
function guessKind(times: number[], values: number[], statedDepth: number | undefined, fallback: ValueKind): ValueKind {
  if (!statedDepth || values.length === 0) return fallback;
  const step = mostCommonStep(times) ?? 15;
  const asDepth = values.reduce((a, b) => a + b, 0);
  const asIntensity = values.reduce((a, v, i) => a + (v * ((i < times.length - 1 ? times[i + 1] - times[i] : step) || step)) / 60, 0);
  return Math.abs(asDepth - statedDepth) <= Math.abs(asIntensity - statedDepth) ? 'depth' : 'intensity';
}

// ---------------------------------------------------------------- format detection

const SWMM_ROW_RE = /^\S+\s+(?:\d{1,2}\/\d{1,2}\/\d{2,4}\s+)?\d{1,3}:\d{2}(?::\d{2})?\s+[-\d.eE+]+\s*$/;
const DAT_ROW_RE = /^\S+\s+\d{4}\s+\d{1,2}\s+\d{1,2}\s+\d{1,2}\s+\d{1,2}\s+[-\d.eE+]+\s*$/;

/**
 * Detect the format of a rainfall file based on content and extension
 */
export function detectFormat(content: string, filename: string): 'csv' | 'noaa' | 'swmm' | 'hec' | 'unknown' {
  const ext = filename.toLowerCase().split('.').pop();
  const lines = splitLines(content).filter((l) => l.trim() && !COMMENT_RE.test(l)).slice(0, 40);

  if (/^\s*\[(TIMESERIES|RAINGAGES)\]/im.test(content)) return 'swmm';
  if (ext === 'gage' || /^\s*Gage\s*:/im.test(content) || /HEC-HMS|HEC-DSS/i.test(content)) return 'hec';
  // SWMM rainfall .dat (station year month day hour minute value)
  if (lines.filter((l) => DAT_ROW_RE.test(l.trim())).length >= Math.min(3, lines.length) && lines.length > 0) return 'swmm';
  // Bare SWMM time-series rows (no section header), e.g. a copied [TIMESERIES] block
  if (!lines.some((l) => l.includes(',')) && lines.filter((l) => SWMM_ROW_RE.test(l.trim())).length >= Math.min(3, lines.length) && lines.length > 0) return 'swmm';

  if (ext === 'dat') {
    const hasNoaaPattern = lines.some((line) => /^\s*\d{8,}\s+\d+\s+[\d.]+/.test(line) || /^[A-Z]{2,4}\d+/.test(line));
    if (hasNoaaPattern) return 'noaa';
  }
  if (ext === 'csv' || lines.some((line) => /[,;\t]/.test(line))) return 'csv';
  return 'unknown';
}

// ---------------------------------------------------------------- CSV

function splitDelimited(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (const ch of line) {
    if (ch === '"') q = !q;
    else if (ch === delim && !q) { out.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/**
 * Parse CSV rainfall data
 * Accepts comment lines (#, ;, //), headers with units in brackets, one combined or separate
 * date and time columns, and intensity, incremental-depth or cumulative-depth values.
 */
export function parseCSV(content: string, filename: string, source: Source = 'csv'): ParsedRainfallData {
  const warnings: string[] = [];
  const errors: string[] = [];
  const comments = commentText(content);
  const lines = splitLines(content).filter((l) => l.trim() && !COMMENT_RE.test(l));

  if (lines.length < 2) {
    errors.push('CSV file must have at least a header row and one data row');
    return { data: [], metadata: { source, filename }, warnings, errors };
  }
  const first = lines[0];
  const delim = [',', ';', '\t'].reduce((best, d) => (first.split(d).length > first.split(best).length ? d : best), ',');
  const header = splitDelimited(first, delim).map((h) => h.toLowerCase());
  const hasHeader = header.some((h) => h && Number.isNaN(Number(h)) && !/^\d/.test(h));
  const cols = hasHeader ? header : header.map((_, i) => (i === 0 ? 'time' : 'value'));
  const body = hasHeader ? lines.slice(1) : lines;

  const base = (h: string) => h.replace(/\(.*?\)|\[.*?\]/g, '').trim();
  const dateIdx = cols.findIndex((h) => /^(date|day)$/.test(base(h)));
  const timeIdx = (() => {
    const exact = cols.findIndex((h) => /^(time|datetime|date\s*time|timestamp|minutes?|mins?|hours?|hrs?|t|elapsed.*)$/.test(base(h)));
    if (exact >= 0) return exact;
    const loose = cols.findIndex((h, i) => i !== dateIdx && /time|minute|hour/.test(h) && !/intensity|depth|rain|precip/.test(h));
    return loose >= 0 ? loose : dateIdx >= 0 ? dateIdx : 0;
  })();
  let valueIdx = cols.findIndex((h, i) => i !== timeIdx && i !== dateIdx && /intensity|rain|precip|depth|value|^i\b|in\/hr|mm\/hr|mm|inch/.test(h));
  if (valueIdx === -1) {
    valueIdx = cols.findIndex((_, i) => i !== timeIdx && i !== dateIdx);
    if (valueIdx === -1) {
      errors.push('Could not identify intensity/value column');
      return { data: [], metadata: { source, filename }, warnings, errors };
    }
    if (hasHeader) warnings.push(`Could not identify the rainfall column from the header; using "${cols[valueIdx]}".`);
  }

  const vh = cols[valueIdx];
  const th = cols[timeIdx];
  let kind: ValueKind = /cumul|mass/.test(vh) ? 'cumulative'
    : /intensity|\/\s*h(r|our)?\b|\/h\)/.test(vh) ? 'intensity'
    : /depth|increment|precip|volume/.test(vh) ? 'depth'
    : 'intensity';
  const units: Units =
    (/\bmm\b|mm\//.test(vh) ? 'mm' : /\bin\b|in\/|inch/.test(vh) ? 'inches' : undefined) ??
    detectUnits(comments) ?? 'inches';
  const timeInHours = /hour|\bhrs?\b|\(h\)|\[h\]/.test(th);

  const rows: RawRow[] = [];
  let dayOffset = 0;
  let prevClock = -Infinity;
  body.forEach((line, i) => {
    const c = splitDelimited(line, delim);
    const timeStr = (c[timeIdx] ?? '').replace(/^"|"$/g, '');
    const valStr = c[valueIdx] ?? '';
    const value = parseFloat(valStr);
    if (Number.isNaN(value)) {
      warnings.push(`Row ${i + 1}: Invalid rainfall value "${valStr}", skipped.`);
      return;
    }
    let t: number;
    if (dateIdx >= 0 && dateIdx !== timeIdx) {
      t = dateToMinutes(c[dateIdx] ?? '') + clockToMinutes(timeStr);
    } else if (/^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(timeStr)) {
      t = parseFloat(timeStr) * (timeInHours ? 60 : 1);
    } else if (/^\d{1,3}:\d{2}(:\d{2})?$/.test(timeStr)) {
      const clock = clockToMinutes(timeStr);
      if (clock < prevClock) dayOffset += 1440; // clock times wrapped past midnight
      prevClock = clock;
      t = clock + dayOffset;
    } else {
      t = dateTimeToMinutes(timeStr);
      if (Number.isNaN(t)) {
        const d = Date.parse(timeStr);
        t = Number.isNaN(d) ? NaN : d / 60000;
      }
    }
    if (Number.isNaN(t)) {
      warnings.push(`Row ${i + 1}: Could not read time "${timeStr}", skipped.`);
      return;
    }
    rows.push({ time: t, value });
  });

  if (!/cumul|mass|intensity|\/\s*h/.test(vh) && !/depth|increment|precip|volume/.test(vh)) {
    kind = guessKind(rows.map((r) => r.time), rows.map((r) => r.value), statedTotalDepth(comments), kind);
  }
  return finalize(rows, kind, source, filename, units, warnings, errors);
}

// ---------------------------------------------------------------- NOAA

/**
 * Parse NOAA/NCEI precipitation data format
 * Various formats exist - this handles common hourly/15-min data
 */
export function parseNOAA(content: string, filename: string): ParsedRainfallData {
  const warnings: string[] = [];
  const errors: string[] = [];
  const data: RainfallDataPoint[] = [];
  const lines = splitLines(content).filter((l) => l.trim() && !COMMENT_RE.test(l));

  let stationId = '';
  let startDate = '';

  if (lines.length && lines[0].includes(',') && lines[0].toLowerCase().includes('station')) {
    const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
    const dateIdx = header.findIndex((h) => h.includes('date'));
    const valueIdx = header.findIndex((h) => h.includes('hpcp') || h.includes('prcp') || h.includes('precipitation'));
    const stationIdx = header.findIndex((h) => h.includes('station'));
    if (valueIdx === -1) {
      errors.push('Could not find precipitation column in NOAA data');
      return { data: [], metadata: { source: 'noaa', filename }, warnings, errors };
    }
    let cumulative = 0;
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/"/g, ''));
      if (i === 1 && stationIdx >= 0) stationId = cols[stationIdx];
      const dateStr = dateIdx >= 0 ? cols[dateIdx] : '';
      if (i === 1) startDate = dateStr;
      let value = parseFloat(cols[valueIdx]);
      if (isNaN(value) || value === 9999 || value === -9999 || value === 99.99) {
        warnings.push(`Row ${i + 1}: Missing or invalid precipitation value`);
        value = 0;
      }
      if (value > 100) value = value / 100; // hundredths of inches
      cumulative += value;
      data.push({ time: (i - 1) * 60, intensity: value, cumulative });
    }
  } else {
    let timeMinutes = 0;
    let cumulative = 0;
    for (const line of lines) {
      if (line.trim().length < 10) continue;
      const numbers = line.match(/[\d.]+/g);
      if (numbers && numbers.length >= 2) {
        const value = parseFloat(numbers[numbers.length - 1]);
        if (!isNaN(value) && value < 100) {
          cumulative += value;
          data.push({ time: timeMinutes, intensity: value, cumulative });
          timeMinutes += 60;
        }
      }
    }
    if (data.length === 0) errors.push('Could not parse NOAA data format. Please ensure file contains precipitation values.');
  }
  const peak = data.length ? Math.max(...data.map((d) => d.intensity)) : 0;
  return {
    data,
    metadata: {
      source: 'noaa', filename, station: stationId, startDate, units: 'inches', timeStep: 60,
      totalDepth: data.length > 0 ? data[data.length - 1].cumulative : 0,
      peakIntensity: peak,
      peakTime: data.find((d) => d.intensity === peak)?.time,
    },
    warnings,
    errors,
  };
}

// ---------------------------------------------------------------- SWMM

function sectionLines(content: string, name: string): string[] {
  const out: string[] = [];
  let inside = false;
  for (const raw of splitLines(content)) {
    const t = raw.trim();
    const sec = t.match(/^\[([^\]]+)\]/);
    if (sec) { inside = sec[1].trim().toUpperCase() === name; continue; }
    if (inside && t && !t.startsWith(';')) out.push(t.replace(/;.*$/, '').trim());
  }
  return out.filter(Boolean);
}

/** SWMM rain-gage interval "0:15", "1:00" or decimal hours → minutes */
function swmmInterval(s: string): number {
  if (s.includes(':')) return clockToMinutes(s);
  const h = parseFloat(s);
  return Number.isFinite(h) ? h * 60 : NaN;
}

interface SwmmSeries { name: string; rows: RawRow[]; file?: string }

/** Read SWMM time-series rows: "Name [Date] Time Value [Time Value ...]" (date optional). */
function readSwmmSeries(lines: string[], warnings: string[]): SwmmSeries[] {
  const map = new Map<string, SwmmSeries>();
  const state = new Map<string, { date: number; prevClock: number; offset: number }>();
  lines.forEach((line) => {
    const p = line.split(/\s+/);
    if (p.length < 2) return;
    const name = p[0];
    const s = map.get(name) ?? { name, rows: [] };
    map.set(name, s);
    if (p[1].toUpperCase() === 'FILE') { s.file = p.slice(2).join(' '); return; }
    const st = state.get(name) ?? { date: NaN, prevClock: -Infinity, offset: 0 };
    let i = 1;
    while (i < p.length) {
      const tok = p[i];
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(tok) || /^\d{4}-\d{1,2}-\d{1,2}$/.test(tok)) {
        st.date = dateToMinutes(tok);
        st.offset = 0;
        st.prevClock = -Infinity;
        i++;
        continue;
      }
      if (i + 1 >= p.length) { warnings.push(`Incomplete SWMM line skipped: "${line}"`); break; }
      let t = tok.includes(':') ? clockToMinutes(tok) : parseFloat(tok) * 60;
      const v = parseFloat(p[i + 1]);
      if (Number.isNaN(t) || Number.isNaN(v)) { warnings.push(`Unreadable SWMM line skipped: "${line}"`); break; }
      if (Number.isNaN(st.date)) {
        // no date: clock times that go backwards roll into the next day
        if (t < st.prevClock) st.offset += 1440;
        st.prevClock = t;
        t += st.offset;
      } else {
        t += st.date;
      }
      s.rows.push({ time: t, value: v });
      i += 2;
    }
    state.set(name, st);
  });
  return [...map.values()];
}

/**
 * Parse EPA SWMM .inp file timeseries data (also XP-SWMM/PCSWMM and bare [TIMESERIES] text).
 * The rain-gage format (INTENSITY / VOLUME / CUMULATIVE) decides how values are read.
 */
export function parseSWMM(content: string, filename: string): ParsedRainfallData {
  const warnings: string[] = [];
  const errors: string[] = [];
  const comments = commentText(content);
  const hasSection = /^\s*\[TIMESERIES\]/im.test(content);
  const tsLines = hasSection
    ? sectionLines(content, 'TIMESERIES')
    : splitLines(content).map((l) => l.trim()).filter((l) => l && !COMMENT_RE.test(l));

  if (!hasSection && !/^\s*\[RAINGAGES\]/im.test(content) && tsLines.length && DAT_ROW_RE.test(tsLines[0])) {
    return parseSwmmDat(content, filename);
  }
  if (tsLines.length === 0) {
    errors.push('No [TIMESERIES] section found in SWMM file');
    return { data: [], metadata: { source: 'swmm', filename }, warnings, errors };
  }

  // Rain gages: Name Format Interval SCF TIMESERIES tsName
  const gages = sectionLines(content, 'RAINGAGES').map((l) => l.split(/\s+/)).filter((p) => p.length >= 6 && p[4].toUpperCase() === 'TIMESERIES')
    .map((p) => ({ name: p[0], format: p[1].toUpperCase(), interval: swmmInterval(p[2]), series: p[5] }));

  const series = readSwmmSeries(tsLines, warnings).filter((s) => s.rows.length > 0 || s.file);
  const withData = series.filter((s) => s.rows.length > 0);
  if (withData.length === 0) {
    const fileRefs = series.filter((s) => s.file).map((s) => `${s.name} → ${s.file}`);
    errors.push(fileRefs.length
      ? `This file's rain series point to external files (${fileRefs.join(', ')}). Import those files directly.`
      : 'No valid timeseries data found in SWMM file');
    return { data: [], metadata: { source: 'swmm', filename }, warnings, errors };
  }
  const gaged = withData.find((s) => gages.some((g) => g.series === s.name));
  const chosen = gaged ?? withData[0];
  if (withData.length > 1) {
    warnings.push(`The file has ${withData.length} rain series (${withData.map((s) => s.name).join(', ')}). Loaded "${chosen.name}"; import the others one at a time.`);
  }
  const gage = gages.find((g) => g.series === chosen.name);

  let kind: ValueKind;
  if (gage) {
    kind = gage.format === 'VOLUME' ? 'depth' : gage.format === 'CUMULATIVE' ? 'cumulative' : 'intensity';
  } else {
    const hint = /value\s*\(\s*(in|mm)\s*\/\s*h/i.test(comments) || /intensity/i.test(comments) ? 'intensity'
      : /incremental\s*depth|data\s*type\s*:\s*(incremental|volume)/i.test(comments) ? 'depth' : undefined;
    kind = hint ?? guessKind(chosen.rows.map((r) => r.time), chosen.rows.map((r) => r.value), statedTotalDepth(comments), 'intensity');
    if (!hint && !statedTotalDepth(comments)) warnings.push('No rain gage or format note found; values were read as intensities.');
  }
  const units = detectUnits(content) ?? 'inches';
  return finalize(chosen.rows, kind, 'swmm', filename, units, warnings, errors, { station: chosen.name },
    gage && Number.isFinite(gage.interval) && gage.interval > 0 ? gage.interval : undefined);
}

/**
 * Parse an EPA SWMM rainfall .dat file: "Station Year Month Day Hour Minute Value".
 * Values are incremental depths per time step (SWMM VOLUME format) unless the header says otherwise.
 */
export function parseSwmmDat(content: string, filename: string): ParsedRainfallData {
  const warnings: string[] = [];
  const errors: string[] = [];
  const comments = commentText(content);
  const rows: RawRow[] = [];
  let station = '';
  const others = new Set<string>();
  splitLines(content).forEach((raw, i) => {
    const l = raw.trim();
    if (!l || COMMENT_RE.test(l)) return;
    const p = l.split(/\s+/);
    if (p.length < 7) { warnings.push(`Line ${i + 1}: expected "Station Year Month Day Hour Minute Value", skipped.`); return; }
    if (!station) station = p[0];
    if (p[0] !== station) { others.add(p[0]); return; }
    const [y, mo, d, h, mi] = p.slice(1, 6).map(Number);
    const v = parseFloat(p[6]);
    if ([y, mo, d, h, mi, v].some((n) => Number.isNaN(n))) { warnings.push(`Line ${i + 1}: unreadable values, skipped.`); return; }
    rows.push({ time: Date.UTC(y, mo - 1, d, h, mi) / 60000, value: v });
  });
  if (others.size) warnings.push(`Other stations in the file were skipped: ${[...others].join(', ')}.`);
  const kind: ValueKind = /intensity/i.test(comments) && !/incremental depth/i.test(comments) ? 'intensity'
    : /cumulative/i.test(comments) ? 'cumulative' : 'depth';
  const stepMatch = comments.match(/time\s*step\s*:\s*([\d.]+)\s*min/i);
  return finalize(rows, kind, 'swmm', filename, detectUnits(comments) ?? 'inches', warnings, errors, { station },
    stepMatch ? parseFloat(stepMatch[1]) : undefined);
}

// ---------------------------------------------------------------- HEC-HMS

/**
 * Parse HEC-HMS precipitation gage text (.gage): "Key: value" header lines, then values
 * (one or many per line, optionally prefixed by "01Jan2025 00:15"). Also handles the
 * HEC-DSS import CSV. Files with several gages load the first one.
 */
export function parseHEC(content: string, filename: string): ParsedRainfallData {
  const lines = splitLines(content);
  const firstData = lines.find((l) => l.trim() && !COMMENT_RE.test(l));
  if (firstData && /,/.test(firstData) && /date|time/i.test(firstData)) {
    return parseCSV(content, filename, 'hec');
  }
  const warnings: string[] = [];
  const errors: string[] = [];

  let gageName = '';
  let startDate = '';
  let startTime = '';
  let units: Units | undefined;
  let stepMin: number | undefined;
  let kind: ValueKind = 'depth';
  let gageCount = 0;
  const stamped: RawRow[] = [];
  const bare: number[] = [];

  for (const raw of lines) {
    const t = raw.trim();
    if (!t || COMMENT_RE.test(t)) continue;
    const kv = t.match(/^([A-Za-z][A-Za-z _-]*?)\s*:\s*(.*)$/);
    if (kv) {
      const key = kv[1].toLowerCase().replace(/[\s_-]+/g, ' ');
      const val = kv[2].trim();
      if (key === 'gage') {
        gageCount++;
        if (gageCount > 1) break;
        gageName = val;
      } else if (key === 'units') {
        units = /^M/i.test(val) ? 'mm' : /^IN/i.test(val) ? 'inches' : units;
      } else if (key === 'time interval' || key === 'timeinterval' || key === 'interval') {
        const m = val.match(/([\d.]+)\s*(MIN\w*|HOUR\w*|HR\w*|H)?/i);
        if (m) stepMin = parseFloat(m[1]) * (m[2] && /^H/i.test(m[2]) ? 60 : 1);
      } else if (key === 'start date' || key === 'startdate') {
        startDate = val;
      } else if (key === 'start time' || key === 'starttime') {
        startTime = val;
      } else if (key === 'incremental') {
        kind = /^N/i.test(val) ? 'cumulative' : 'depth';
      } else if (key === 'type' || key === 'data type') {
        kind = /CUMUL/i.test(val) ? 'cumulative' : /INTENS/i.test(val) ? 'intensity' : 'depth';
      }
      continue;
    }
    const stampedRow = t.match(/^(\d{1,2}[A-Za-z]{3}\d{4})\s+(\d{1,3}:\d{2}(?::\d{2})?)\s+([-\d.eE+]+)$/);
    if (stampedRow) {
      stamped.push({ time: dateToMinutes(stampedRow[1]) + clockToMinutes(stampedRow[2]), value: parseFloat(stampedRow[3]) });
      continue;
    }
    if (/^[-\d.eE+\s]+$/.test(t)) {
      t.split(/\s+/).forEach((v) => { const n = parseFloat(v); if (!Number.isNaN(n)) bare.push(n); });
    }
  }
  if (gageCount > 1) warnings.push('The file has more than one gage; loaded the first one. Import the others one at a time.');

  units = units ?? detectUnits(content) ?? 'inches';
  let rows: RawRow[];
  if (stamped.length) {
    rows = stamped;
  } else {
    const step = stepMin ?? 15;
    if (!stepMin && bare.length) warnings.push('No time interval found; assumed 15 minutes.');
    rows = bare.map((value, i) => ({ time: i * step, value }));
  }
  if (rows.length === 0) errors.push('Could not parse HEC-HMS gage file format');
  const start = startDate ? `${startDate}${startTime ? ' ' + startTime : ''}` : undefined;
  return finalize(rows, kind, 'hec', filename, units, warnings, errors, { station: gageName, startDate: start }, stepMin);
}

// ---------------------------------------------------------------- dispatcher

/**
 * Main parser function - auto-detects format and parses
 */
export function parseRainfallFile(content: string, filename: string): ParsedRainfallData {
  const format = detectFormat(content, filename);
  switch (format) {
    case 'csv':
      return parseCSV(content, filename);
    case 'noaa':
      return parseNOAA(content, filename);
    case 'swmm':
      return parseSWMM(content, filename);
    case 'hec':
      return parseHEC(content, filename);
    default: {
      const result = parseCSV(content, filename);
      result.warnings.unshift('Could not auto-detect format, attempting CSV parse');
      return result;
    }
  }
}

/**
 * Utility: Resample timeseries to a new time step
 */
export function resampleTimeseries(
  data: RainfallDataPoint[],
  targetTimeStep: number
): RainfallDataPoint[] {
  if (data.length === 0) return [];
  
  const maxTime = data[data.length - 1].time;
  const resampled: RainfallDataPoint[] = [];
  let cumulative = 0;
  
  for (let t = 0; t <= maxTime; t += targetTimeStep) {
    // Find surrounding points for interpolation
    const before = data.filter(d => d.time <= t).pop();
    const after = data.find(d => d.time > t);
    
    let intensity: number;
    
    if (!before) {
      intensity = data[0].intensity;
    } else if (!after) {
      intensity = before.intensity;
    } else if (before.time === t) {
      intensity = before.intensity;
    } else {
      // Linear interpolation
      const ratio = (t - before.time) / (after.time - before.time);
      intensity = before.intensity + ratio * (after.intensity - before.intensity);
    }
    
    cumulative += intensity * (targetTimeStep / 60);
    
    resampled.push({
      time: t,
      intensity,
      cumulative
    });
  }
  
  return resampled;
}

/**
 * Utility: Trim timeseries to a time range
 */
export function trimTimeseries(
  data: RainfallDataPoint[],
  startTime: number,
  endTime: number
): RainfallDataPoint[] {
  const trimmed = data.filter(d => d.time >= startTime && d.time <= endTime);
  
  // Recalculate cumulative from start
  let cumulative = 0;
  const timeStep = trimmed.length > 1 ? trimmed[1].time - trimmed[0].time : 15;
  
  return trimmed.map((d, i) => {
    if (i > 0) {
      cumulative += d.intensity * (timeStep / 60);
    }
    return { ...d, time: d.time - startTime, cumulative };
  });
}

/**
 * Utility: Combine multiple storms into one timeseries
 */
export function combineStorms(
  storms: RainfallDataPoint[][],
  gapMinutes: number = 60
): RainfallDataPoint[] {
  const combined: RainfallDataPoint[] = [];
  let timeOffset = 0;
  let cumulative = 0;
  
  for (let i = 0; i < storms.length; i++) {
    const storm = storms[i];
    const timeStep = storm.length > 1 ? storm[1].time - storm[0].time : 15;
    
    for (const point of storm) {
      cumulative += point.intensity * (timeStep / 60);
      combined.push({
        time: point.time + timeOffset,
        intensity: point.intensity,
        cumulative
      });
    }
    
    // Add gap before next storm
    if (i < storms.length - 1 && storm.length > 0) {
      timeOffset = combined[combined.length - 1].time + gapMinutes;
    }
  }
  
  return combined;
}
