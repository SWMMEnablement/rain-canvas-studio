/**
 * Storm Event Extractor
 * Isolates individual storm events from continuous rainfall records
 * using an inter-event dry period threshold.
 */

import { type RainfallDataPoint } from './rainfallParsers';

export interface StormEvent {
  id: number;
  startIndex: number;
  endIndex: number;
  startTime: number; // minutes
  endTime: number;   // minutes
  duration: number;  // minutes
  totalDepth: number;
  peakIntensity: number;
  peakTime: number;
  dataPoints: RainfallDataPoint[];
}

/**
 * Extract individual storm events from a continuous rainfall record.
 * 
 * @param data - Full rainfall timeseries
 * @param minDryGapMinutes - Minimum gap of zero/near-zero rain to separate events (default 360 = 6 hours)
 * @param minIntensityThreshold - Intensity below this is considered "dry" (default 0.01 in/hr)
 * @param minEventPoints - Minimum data points to count as an event (default 3)
 */
export function extractStormEvents(
  data: RainfallDataPoint[],
  minDryGapMinutes: number = 360,
  minIntensityThreshold: number = 0.01,
  minEventPoints: number = 3
): StormEvent[] {
  if (data.length < minEventPoints) return [];

  const timeStep = data.length > 1 ? data[1].time - data[0].time : 5;
  const events: StormEvent[] = [];

  let eventStart: number | null = null;
  let dryCount = 0;
  const dryStepsNeeded = Math.max(1, Math.round(minDryGapMinutes / timeStep));

  for (let i = 0; i < data.length; i++) {
    const isWet = data[i].intensity > minIntensityThreshold;

    if (isWet) {
      if (eventStart === null) {
        eventStart = i;
      }
      dryCount = 0;
    } else {
      dryCount++;
      if (eventStart !== null && dryCount >= dryStepsNeeded) {
        // End of event: trim trailing dry steps
        const eventEnd = i - dryCount;
        if (eventEnd - eventStart + 1 >= minEventPoints) {
          events.push(buildEvent(data, eventStart, eventEnd, events.length + 1, timeStep));
        }
        eventStart = null;
      }
    }
  }

  // Handle final event if record ends during rain
  if (eventStart !== null) {
    const eventEnd = data.length - 1 - dryCount;
    if (eventEnd >= eventStart && eventEnd - eventStart + 1 >= minEventPoints) {
      events.push(buildEvent(data, eventStart, eventEnd, events.length + 1, timeStep));
    }
  }

  // Sort by total depth descending (largest storms first)
  events.sort((a, b) => b.totalDepth - a.totalDepth);
  // Re-number after sort
  events.forEach((e, i) => e.id = i + 1);

  return events;
}

function buildEvent(
  data: RainfallDataPoint[],
  startIdx: number,
  endIdx: number,
  id: number,
  timeStep: number
): StormEvent {
  const points = data.slice(startIdx, endIdx + 1);
  const startTime = data[startIdx].time;

  // Re-base times to start at 0 and recalculate cumulative
  let cumulative = 0;
  const rebasedPoints: RainfallDataPoint[] = points.map(p => {
    cumulative += p.intensity * (timeStep / 60);
    return {
      time: p.time - startTime,
      intensity: p.intensity,
      cumulative,
    };
  });

  const totalDepth = cumulative;
  const peakIntensity = Math.max(...points.map(p => p.intensity));
  const peakPoint = points.find(p => p.intensity === peakIntensity);
  const peakTime = peakPoint ? peakPoint.time - startTime : 0;

  return {
    id,
    startIndex: startIdx,
    endIndex: endIdx,
    startTime: data[startIdx].time,
    endTime: data[endIdx].time,
    duration: data[endIdx].time - data[startIdx].time,
    totalDepth,
    peakIntensity,
    peakTime,
    dataPoints: rebasedPoints,
  };
}
