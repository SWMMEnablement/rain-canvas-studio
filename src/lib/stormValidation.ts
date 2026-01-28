import { type UnitSystem } from './unitConversions';

export interface ValidationWarning {
  type: 'info' | 'warning' | 'error';
  message: string;
  field: string;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: ValidationWarning[];
}

// Typical intensity thresholds (in/hr for USA, mm/hr for SI)
const INTENSITY_THRESHOLDS = {
  USA: {
    typical_max: 4.0,      // 4 in/hr is very intense
    extreme: 8.0,          // 8 in/hr is exceptional (PMP territory)
    record: 12.0,          // Historical records approach this
  },
  SI: {
    typical_max: 100,      // 100 mm/hr is very intense
    extreme: 200,          // 200 mm/hr is exceptional
    record: 300,           // Historical records approach this
  }
};

// Typical depth-duration relationships
const DEPTH_DURATION_LIMITS = {
  USA: [
    { maxDuration: 0.25, maxDepth: 1.5 },   // 15 min: 1.5 in max typical
    { maxDuration: 0.5, maxDepth: 2.5 },    // 30 min: 2.5 in max typical
    { maxDuration: 1.0, maxDepth: 4.0 },    // 1 hr: 4 in max typical
    { maxDuration: 2.0, maxDepth: 5.0 },    // 2 hr: 5 in max typical
    { maxDuration: 6.0, maxDepth: 8.0 },    // 6 hr: 8 in max typical
    { maxDuration: 12.0, maxDepth: 12.0 },  // 12 hr: 12 in max typical
    { maxDuration: 24.0, maxDepth: 20.0 },  // 24 hr: 20 in max typical
  ],
  SI: [
    { maxDuration: 0.25, maxDepth: 38 },    // 15 min: 38 mm max typical
    { maxDuration: 0.5, maxDepth: 64 },     // 30 min: 64 mm max typical
    { maxDuration: 1.0, maxDepth: 100 },    // 1 hr: 100 mm max typical
    { maxDuration: 2.0, maxDepth: 127 },    // 2 hr: 127 mm max typical
    { maxDuration: 6.0, maxDepth: 200 },    // 6 hr: 200 mm max typical
    { maxDuration: 12.0, maxDepth: 305 },   // 12 hr: 305 mm max typical
    { maxDuration: 24.0, maxDepth: 508 },   // 24 hr: 508 mm max typical
  ]
};

export function calculateAverageIntensity(depth: number, duration: number): number {
  return depth / duration; // in/hr or mm/hr depending on unit system
}

export function calculatePeakIntensity(
  depth: number, 
  duration: number, 
  patternPeakRatio: number = 3.0 // typical peak/average ratio
): number {
  return calculateAverageIntensity(depth, duration) * patternPeakRatio;
}

export function validateStormParameters(
  depth: number,
  duration: number,
  timeStep: number,
  unitSystem: UnitSystem
): ValidationResult {
  const warnings: ValidationWarning[] = [];
  let isValid = true;

  // Check for zero/negative values
  if (depth <= 0) {
    warnings.push({
      type: 'error',
      message: 'Rainfall depth must be greater than zero',
      field: 'depth'
    });
    isValid = false;
  }

  if (duration <= 0) {
    warnings.push({
      type: 'error',
      message: 'Storm duration must be greater than zero',
      field: 'duration'
    });
    isValid = false;
  }

  if (timeStep <= 0) {
    warnings.push({
      type: 'error',
      message: 'Time step must be greater than zero',
      field: 'timeStep'
    });
    isValid = false;
  }

  // Skip further validation if basic checks fail
  if (!isValid) {
    return { isValid, warnings };
  }

  // Check time step vs duration
  const stepsCount = Math.floor((duration * 60) / timeStep);
  if (stepsCount < 4) {
    warnings.push({
      type: 'warning',
      message: `Only ${stepsCount} time steps will be generated. Consider using a smaller time step for better resolution.`,
      field: 'timeStep'
    });
  }

  if (timeStep > duration * 60) {
    warnings.push({
      type: 'error',
      message: 'Time step cannot exceed storm duration',
      field: 'timeStep'
    });
    isValid = false;
  }

  // Calculate average intensity
  const avgIntensity = calculateAverageIntensity(depth, duration);
  const thresholds = INTENSITY_THRESHOLDS[unitSystem];
  const unit = unitSystem === 'USA' ? 'in/hr' : 'mm/hr';

  // Check average intensity against thresholds
  if (avgIntensity > thresholds.record) {
    warnings.push({
      type: 'error',
      message: `Average intensity (${avgIntensity.toFixed(2)} ${unit}) exceeds historical records. Please verify your inputs.`,
      field: 'depth'
    });
  } else if (avgIntensity > thresholds.extreme) {
    warnings.push({
      type: 'warning',
      message: `Average intensity (${avgIntensity.toFixed(2)} ${unit}) is extremely high, approaching PMP levels.`,
      field: 'depth'
    });
  } else if (avgIntensity > thresholds.typical_max) {
    warnings.push({
      type: 'info',
      message: `Average intensity (${avgIntensity.toFixed(2)} ${unit}) is above typical design storms. This may be appropriate for extreme event analysis.`,
      field: 'depth'
    });
  }

  // Check depth-duration relationship
  const limits = DEPTH_DURATION_LIMITS[unitSystem];
  const applicableLimit = limits.find(l => duration <= l.maxDuration) || limits[limits.length - 1];
  
  if (depth > applicableLimit.maxDepth * 1.5) {
    warnings.push({
      type: 'warning',
      message: `Depth of ${depth.toFixed(2)} ${unitSystem === 'USA' ? 'in' : 'mm'} for a ${duration}-hour storm exceeds typical design values. Consider checking your data source.`,
      field: 'depth'
    });
  } else if (depth > applicableLimit.maxDepth) {
    warnings.push({
      type: 'info',
      message: `This depth-duration combination represents an unusually intense storm event.`,
      field: 'depth'
    });
  }

  // Check for very short durations with high depths
  if (duration < 0.5 && depth > (unitSystem === 'USA' ? 2.0 : 50)) {
    warnings.push({
      type: 'warning',
      message: 'Very short duration with high depth may exceed physical rainfall limits for most regions.',
      field: 'duration'
    });
  }

  // Check for very long durations
  if (duration > 24) {
    warnings.push({
      type: 'info',
      message: 'Storm duration exceeds 24 hours. Most design patterns are calibrated for 24-hour or shorter events.',
      field: 'duration'
    });
  }

  // Check for very small time steps
  if (timeStep < 5) {
    warnings.push({
      type: 'info',
      message: 'Very small time steps increase data volume. Ensure your modeling software can handle the resolution.',
      field: 'timeStep'
    });
  }

  return { isValid, warnings };
}

// Get intensity classification for display
export function getIntensityClassification(
  depth: number, 
  duration: number, 
  unitSystem: UnitSystem
): { label: string; color: string } {
  const avgIntensity = calculateAverageIntensity(depth, duration);
  const thresholds = INTENSITY_THRESHOLDS[unitSystem];

  if (avgIntensity > thresholds.extreme) {
    return { label: 'Extreme', color: 'text-destructive' };
  } else if (avgIntensity > thresholds.typical_max) {
    return { label: 'Very High', color: 'text-orange-500' };
  } else if (avgIntensity > thresholds.typical_max * 0.5) {
    return { label: 'High', color: 'text-yellow-500' };
  } else if (avgIntensity > thresholds.typical_max * 0.25) {
    return { label: 'Moderate', color: 'text-primary' };
  } else {
    return { label: 'Light', color: 'text-muted-foreground' };
  }
}

// Estimate return period based on depth/duration (simplified)
export function estimateReturnPeriod(
  depth: number,
  duration: number,
  unitSystem: UnitSystem
): string {
  const avgIntensity = calculateAverageIntensity(depth, duration);
  const thresholds = INTENSITY_THRESHOLDS[unitSystem];

  // Very rough approximation for guidance only
  if (avgIntensity > thresholds.extreme) {
    return '500+ year';
  } else if (avgIntensity > thresholds.typical_max * 1.5) {
    return '100-500 year';
  } else if (avgIntensity > thresholds.typical_max) {
    return '25-100 year';
  } else if (avgIntensity > thresholds.typical_max * 0.5) {
    return '10-25 year';
  } else if (avgIntensity > thresholds.typical_max * 0.25) {
    return '2-10 year';
  } else {
    return '< 2 year';
  }
}
