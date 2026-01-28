/**
 * Rainfall Data Parsers
 * Parses various rainfall data formats into a unified timeseries structure
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

/**
 * Detect the format of a rainfall file based on content and extension
 */
export function detectFormat(content: string, filename: string): 'csv' | 'noaa' | 'swmm' | 'hec' | 'unknown' {
  const ext = filename.toLowerCase().split('.').pop();
  const lines = content.trim().split('\n').slice(0, 20);
  
  // Check for SWMM .inp format - look for [TIMESERIES] section
  if (content.includes('[TIMESERIES]') || content.includes('[RAINGAGES]')) {
    return 'swmm';
  }
  
  // Check for HEC .gage format - typically has DSS-style headers
  if (ext === 'gage' || content.includes('HEC-HMS') || /^[A-Z]:\/.+\.dss/i.test(content)) {
    return 'hec';
  }
  
  // Check for NOAA .dat format - fixed-width columns, station ID pattern
  if (ext === 'dat') {
    // NOAA format typically has station codes and date patterns
    const hasNoaaPattern = lines.some(line => 
      /^\s*\d{8,}\s+\d+\s+[\d.]+/.test(line) || // YYYYMMDD HH value pattern
      /^[A-Z]{2,4}\d+/.test(line) // Station ID pattern
    );
    if (hasNoaaPattern) return 'noaa';
  }
  
  // Default to CSV for .csv or comma-separated content
  if (ext === 'csv' || lines.some(line => line.includes(','))) {
    return 'csv';
  }
  
  return 'unknown';
}

/**
 * Parse CSV rainfall data
 * Expects columns: time (or datetime), intensity (or depth/value)
 */
export function parseCSV(content: string, filename: string): ParsedRainfallData {
  const warnings: string[] = [];
  const errors: string[] = [];
  const data: RainfallDataPoint[] = [];
  
  const lines = content.trim().split('\n');
  if (lines.length < 2) {
    errors.push('CSV file must have at least a header row and one data row');
    return { data: [], metadata: { source: 'csv', filename }, warnings, errors };
  }
  
  // Parse header to identify columns
  const header = lines[0].toLowerCase().split(',').map(h => h.trim());
  
  // Find time column
  const timeColIndex = header.findIndex(h => 
    ['time', 'datetime', 'date', 'timestamp', 'minutes', 'hours', 't', 'min'].includes(h)
  );
  
  // Find intensity/value column
  const valueColIndex = header.findIndex(h => 
    ['intensity', 'value', 'rainfall', 'rain', 'depth', 'precip', 'precipitation', 'i', 'in/hr', 'mm/hr'].includes(h)
  );
  
  if (valueColIndex === -1) {
    // Try to use second column if no header match
    if (header.length >= 2) {
      warnings.push('Could not identify value column from header, using column 2');
    } else {
      errors.push('Could not identify intensity/value column');
      return { data: [], metadata: { source: 'csv', filename }, warnings, errors };
    }
  }
  
  const timeIdx = timeColIndex >= 0 ? timeColIndex : 0;
  const valueIdx = valueColIndex >= 0 ? valueColIndex : 1;
  
  // Detect if units are in mm or inches based on header
  let detectedUnits: 'inches' | 'mm' = 'inches';
  if (header[valueIdx]?.includes('mm')) {
    detectedUnits = 'mm';
  }
  
  // Parse data rows
  let cumulativeDepth = 0;
  let prevTime = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = line.split(',').map(c => c.trim());
    
    // Parse time - could be minutes, hours, or datetime
    let timeMinutes: number;
    const timeStr = cols[timeIdx];
    
    if (/^\d+(\.\d+)?$/.test(timeStr)) {
      // Numeric - assume minutes unless very small (then hours)
      const numValue = parseFloat(timeStr);
      timeMinutes = numValue < 100 && numValue === Math.floor(numValue) && i < 50 
        ? numValue * (numValue <= 24 ? 60 : 1) // Treat as hours if small integers
        : numValue;
    } else if (/\d{1,2}:\d{2}/.test(timeStr)) {
      // HH:MM format
      const [hours, mins] = timeStr.split(':').map(Number);
      timeMinutes = hours * 60 + mins;
    } else {
      // Try to parse as date and calculate offset from first row
      const date = new Date(timeStr);
      if (!isNaN(date.getTime())) {
        if (i === 1) {
          timeMinutes = 0;
        } else {
          const firstDate = new Date(lines[1].split(',')[timeIdx].trim());
          timeMinutes = (date.getTime() - firstDate.getTime()) / 60000;
        }
      } else {
        warnings.push(`Row ${i + 1}: Could not parse time "${timeStr}", using row index`);
        timeMinutes = (i - 1) * 15; // Default 15-min intervals
      }
    }
    
    // Parse intensity value
    const intensityStr = cols[valueIdx];
    const intensity = parseFloat(intensityStr);
    
    if (isNaN(intensity)) {
      warnings.push(`Row ${i + 1}: Invalid intensity value "${intensityStr}", skipping`);
      continue;
    }
    
    // Calculate cumulative (assuming intensity * timeStep)
    const timeStep = timeMinutes - prevTime;
    if (timeStep > 0) {
      cumulativeDepth += intensity * (timeStep / 60);
    }
    
    data.push({
      time: timeMinutes,
      intensity,
      cumulative: cumulativeDepth
    });
    
    prevTime = timeMinutes;
  }
  
  // Calculate metadata
  const timeSteps = data.slice(1).map((d, i) => d.time - data[i].time);
  const avgTimeStep = timeSteps.length > 0 ? timeSteps.reduce((a, b) => a + b, 0) / timeSteps.length : 15;
  
  return {
    data,
    metadata: {
      source: 'csv',
      filename,
      units: detectedUnits,
      timeStep: Math.round(avgTimeStep),
      totalDepth: cumulativeDepth,
      peakIntensity: Math.max(...data.map(d => d.intensity)),
      peakTime: data.find(d => d.intensity === Math.max(...data.map(p => p.intensity)))?.time
    },
    warnings,
    errors
  };
}

/**
 * Parse NOAA/NCEI precipitation data format
 * Various formats exist - this handles common hourly/15-min data
 */
export function parseNOAA(content: string, filename: string): ParsedRainfallData {
  const warnings: string[] = [];
  const errors: string[] = [];
  const data: RainfallDataPoint[] = [];
  
  const lines = content.trim().split('\n');
  
  // Try to detect format from content
  // Format 1: Fixed-width NCEI hourly data
  // Format 2: CSV-style NOAA data downloads
  
  let stationId = '';
  let startDate = '';
  
  // Check if it's CSV-style NOAA download
  if (lines[0].includes(',') && lines[0].toLowerCase().includes('station')) {
    // Parse as CSV with NOAA-specific columns
    const header = lines[0].toLowerCase().split(',').map(h => h.trim());
    const dateIdx = header.findIndex(h => h.includes('date'));
    const valueIdx = header.findIndex(h => h.includes('hpcp') || h.includes('prcp') || h.includes('precipitation'));
    const stationIdx = header.findIndex(h => h.includes('station'));
    
    if (valueIdx === -1) {
      errors.push('Could not find precipitation column in NOAA data');
      return { data: [], metadata: { source: 'noaa', filename }, warnings, errors };
    }
    
    let cumulative = 0;
    let prevTime = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
      
      if (i === 1 && stationIdx >= 0) {
        stationId = cols[stationIdx];
      }
      
      const dateStr = dateIdx >= 0 ? cols[dateIdx] : '';
      if (i === 1) startDate = dateStr;
      
      // Parse precipitation value (NOAA uses 9999 or -9999 for missing)
      let value = parseFloat(cols[valueIdx]);
      if (isNaN(value) || value === 9999 || value === -9999 || value === 99.99) {
        warnings.push(`Row ${i + 1}: Missing or invalid precipitation value`);
        value = 0;
      }
      
      // NOAA hourly data is often in hundredths of inches
      if (value > 0 && value < 1 && cols[valueIdx].length >= 3) {
        // Likely already in inches
      } else if (value > 100) {
        value = value / 100; // Convert from hundredths
      }
      
      const timeMinutes = (i - 1) * 60; // Assume hourly
      cumulative += value;
      
      data.push({
        time: timeMinutes,
        intensity: value, // This is depth per hour, so equals intensity in in/hr
        cumulative
      });
      
      prevTime = timeMinutes;
    }
  } else {
    // Try fixed-width format parsing
    let timeMinutes = 0;
    let cumulative = 0;
    
    for (const line of lines) {
      // Skip header/comment lines
      if (line.startsWith('#') || line.trim().length < 10) continue;
      
      // Try to extract numeric values
      const numbers = line.match(/[\d.]+/g);
      if (numbers && numbers.length >= 2) {
        const value = parseFloat(numbers[numbers.length - 1]);
        if (!isNaN(value) && value < 100) {
          cumulative += value;
          data.push({
            time: timeMinutes,
            intensity: value,
            cumulative
          });
          timeMinutes += 60; // Assume hourly
        }
      }
    }
    
    if (data.length === 0) {
      errors.push('Could not parse NOAA data format. Please ensure file contains precipitation values.');
    }
  }
  
  return {
    data,
    metadata: {
      source: 'noaa',
      filename,
      station: stationId,
      startDate,
      units: 'inches',
      timeStep: 60,
      totalDepth: data.length > 0 ? data[data.length - 1].cumulative : 0,
      peakIntensity: Math.max(...data.map(d => d.intensity)),
      peakTime: data.find(d => d.intensity === Math.max(...data.map(p => p.intensity)))?.time
    },
    warnings,
    errors
  };
}

/**
 * Parse EPA SWMM .inp file timeseries data
 */
export function parseSWMM(content: string, filename: string): ParsedRainfallData {
  const warnings: string[] = [];
  const errors: string[] = [];
  const data: RainfallDataPoint[] = [];
  
  // Find [TIMESERIES] section
  const timeseriesMatch = content.match(/\[TIMESERIES\]([\s\S]*?)(?=\[|$)/i);
  
  if (!timeseriesMatch) {
    errors.push('No [TIMESERIES] section found in SWMM file');
    return { data: [], metadata: { source: 'swmm', filename }, warnings, errors };
  }
  
  const section = timeseriesMatch[1];
  const lines = section.trim().split('\n');
  
  let timeseriesName = '';
  let cumulative = 0;
  let prevTime = 0;
  let timeStep = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith(';')) continue;
    
    // Parse timeseries data
    // Format: NAME TIME VALUE or NAME DATE TIME VALUE
    const parts = trimmed.split(/\s+/);
    
    if (parts.length >= 3) {
      if (!timeseriesName) timeseriesName = parts[0];
      
      let timeMinutes: number;
      let value: number;
      
      if (parts.length >= 4 && /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(parts[1])) {
        // Format: NAME DATE TIME VALUE
        const timeStr = parts[2];
        const [hours, mins] = timeStr.split(':').map(Number);
        timeMinutes = data.length === 0 ? 0 : (hours * 60 + (mins || 0));
        value = parseFloat(parts[3]);
        
        // For multi-day storms, add 24 hours for each day
        if (data.length > 0 && timeMinutes < prevTime) {
          timeMinutes += 1440; // Add 24 hours
        }
      } else {
        // Format: NAME TIME VALUE (time in decimal hours or HH:MM)
        const timeStr = parts[1];
        if (timeStr.includes(':')) {
          const [hours, mins] = timeStr.split(':').map(Number);
          timeMinutes = hours * 60 + (mins || 0);
        } else {
          // Decimal hours
          timeMinutes = parseFloat(timeStr) * 60;
        }
        value = parseFloat(parts[2]);
      }
      
      if (isNaN(value)) {
        warnings.push(`Invalid value in line: ${trimmed}`);
        continue;
      }
      
      // Track time step
      if (data.length > 0 && timeStep === 0) {
        timeStep = timeMinutes - prevTime;
      }
      
      cumulative += value * (timeStep > 0 ? timeStep / 60 : 1/60);
      
      data.push({
        time: timeMinutes,
        intensity: value,
        cumulative
      });
      
      prevTime = timeMinutes;
    }
  }
  
  if (data.length === 0) {
    errors.push('No valid timeseries data found in SWMM file');
  }
  
  return {
    data,
    metadata: {
      source: 'swmm',
      filename,
      station: timeseriesName,
      units: 'inches',
      timeStep: timeStep || 15,
      totalDepth: cumulative,
      peakIntensity: Math.max(...data.map(d => d.intensity)),
      peakTime: data.find(d => d.intensity === Math.max(...data.map(p => p.intensity)))?.time
    },
    warnings,
    errors
  };
}

/**
 * Parse HEC-HMS .gage file format
 */
export function parseHEC(content: string, filename: string): ParsedRainfallData {
  const warnings: string[] = [];
  const errors: string[] = [];
  const data: RainfallDataPoint[] = [];
  
  const lines = content.trim().split('\n');
  
  let gageName = '';
  let startDate = '';
  let timeStep = 15; // Default 15-min
  let inDataSection = false;
  let cumulative = 0;
  let timeMinutes = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip empty lines
    if (!trimmed) continue;
    
    // Parse header information
    if (trimmed.startsWith('Gage:')) {
      gageName = trimmed.replace('Gage:', '').trim();
      continue;
    }
    
    if (trimmed.startsWith('Start Date:') || trimmed.startsWith('StartDate:')) {
      startDate = trimmed.split(':').slice(1).join(':').trim();
      continue;
    }
    
    if (trimmed.startsWith('Time Interval:') || trimmed.startsWith('TimeInterval:')) {
      const interval = trimmed.split(':').slice(1).join(':').trim();
      // Parse interval (e.g., "15 MIN", "1 HOUR")
      const match = interval.match(/(\d+)\s*(MIN|HOUR|HR)/i);
      if (match) {
        timeStep = parseInt(match[1]) * (match[2].toUpperCase().startsWith('H') ? 60 : 1);
      }
      continue;
    }
    
    // Look for data start
    if (trimmed.toLowerCase().includes('data:') || trimmed.toLowerCase() === 'data') {
      inDataSection = true;
      continue;
    }
    
    // Parse data values
    if (inDataSection || /^[\d.\s]+$/.test(trimmed)) {
      const values = trimmed.split(/\s+/).map(v => parseFloat(v)).filter(v => !isNaN(v));
      
      for (const value of values) {
        cumulative += value;
        
        data.push({
          time: timeMinutes,
          intensity: value * (60 / timeStep), // Convert depth to intensity
          cumulative
        });
        
        timeMinutes += timeStep;
      }
    }
  }
  
  if (data.length === 0) {
    // Try parsing as simple column data
    let foundData = false;
    timeMinutes = 0;
    cumulative = 0;
    
    for (const line of lines) {
      const value = parseFloat(line.trim());
      if (!isNaN(value) && value >= 0 && value < 100) {
        foundData = true;
        cumulative += value;
        data.push({
          time: timeMinutes,
          intensity: value * (60 / timeStep),
          cumulative
        });
        timeMinutes += timeStep;
      }
    }
    
    if (!foundData) {
      errors.push('Could not parse HEC-HMS gage file format');
    }
  }
  
  return {
    data,
    metadata: {
      source: 'hec',
      filename,
      station: gageName,
      startDate,
      units: 'inches',
      timeStep,
      totalDepth: cumulative,
      peakIntensity: Math.max(...data.map(d => d.intensity)),
      peakTime: data.find(d => d.intensity === Math.max(...data.map(p => p.intensity)))?.time
    },
    warnings,
    errors
  };
}

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
    default:
      // Try CSV as fallback
      const result = parseCSV(content, filename);
      result.warnings.unshift('Could not auto-detect format, attempting CSV parse');
      return result;
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
