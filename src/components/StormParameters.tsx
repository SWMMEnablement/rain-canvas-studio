import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Zap, MapPin, Sliders } from "lucide-react";
import { type UnitSystem, convertDepth, formatDepth } from "@/lib/unitConversions";
import { ValidationFeedback } from "@/components/ValidationFeedback";
import { 
  validateStormParameters, 
  getIntensityClassification, 
  estimateReturnPeriod 
} from "@/lib/stormValidation";

// Presets: depth in inches, duration in hours, timeStep in minutes
const STORM_PRESETS = [
  { label: "2-yr, 1-hr",    depth: 1.0,  duration: 1,  timeStep: 5  },
  { label: "10-yr, 6-hr",   depth: 3.2,  duration: 6,  timeStep: 15 },
  { label: "25-yr, 12-hr",  depth: 5.0,  duration: 12, timeStep: 15 },
  { label: "100-yr, 24-hr", depth: 7.5,  duration: 24, timeStep: 15 },
  { label: "500-yr, 24-hr", depth: 10.0, duration: 24, timeStep: 15 },
];

const RETURN_PERIODS = [2, 5, 10, 25, 50, 100, 200, 500, 1000];
const COMMON_DURATIONS = [
  { label: "15 min", hours: 0.25 },
  { label: "30 min", hours: 0.5 },
  { label: "1 hr", hours: 1 },
  { label: "2 hr", hours: 2 },
  { label: "3 hr", hours: 3 },
  { label: "6 hr", hours: 6 },
  { label: "12 hr", hours: 12 },
  { label: "24 hr", hours: 24 },
];

function getReturnPeriodDescription(rp: number): string {
  if (rp <= 2) return "Frequent event — minor drainage, water quality";
  if (rp <= 10) return "Moderate event — standard urban drainage design";
  if (rp <= 25) return "Uncommon event — culverts, storm sewers";
  if (rp <= 100) return "Rare event — detention basins, floodplain management";
  if (rp <= 500) return "Extreme event — critical infrastructure, dam safety";
  return "Ultra-rare — PMP-level analysis, high uncertainty";
}

type InputMode = "idf-guided" | "manual";

interface StormParametersProps {
  depth: number;
  duration: number;
  timeStep: number;
  unitSystem: UnitSystem;
  onDepthChange: (value: number) => void;
  onDurationChange: (value: number) => void;
  onTimeStepChange: (value: number) => void;
  onUnitSystemChange: (system: UnitSystem) => void;
}

export function StormParameters({
  depth,
  duration,
  timeStep,
  unitSystem,
  onDepthChange,
  onDurationChange,
  onTimeStepChange,
  onUnitSystemChange,
}: StormParametersProps) {
  const [inputMode, setInputMode] = useState<InputMode>("manual");
  const [selectedReturnPeriod, setSelectedReturnPeriod] = useState<number>(100);
  const [selectedDuration, setSelectedDuration] = useState<number>(24);

  const handleUnitSystemChange = (newSystem: UnitSystem) => {
    const convertedDepth = convertDepth(depth, unitSystem, newSystem);
    onDepthChange(convertedDepth);
    onUnitSystemChange(newSystem);
  };

  const applyPreset = (preset: typeof STORM_PRESETS[number]) => {
    const depthVal = unitSystem === 'USA' ? preset.depth : convertDepth(preset.depth, 'USA', 'SI');
    onDepthChange(depthVal);
    onDurationChange(preset.duration);
    onTimeStepChange(preset.timeStep);
  };

  const handleReturnPeriodSelect = (rp: number) => {
    setSelectedReturnPeriod(rp);
    // Estimate depth from return period + duration (rough US-centric approximation)
    const baseDepth = estimateDepthFromRP(rp, selectedDuration);
    const depthVal = unitSystem === 'USA' ? baseDepth : convertDepth(baseDepth, 'USA', 'SI');
    onDepthChange(depthVal);
  };

  const handleDurationSelect = (hours: number) => {
    setSelectedDuration(hours);
    onDurationChange(hours);
    // Update depth estimate
    const baseDepth = estimateDepthFromRP(selectedReturnPeriod, hours);
    const depthVal = unitSystem === 'USA' ? baseDepth : convertDepth(baseDepth, 'USA', 'SI');
    onDepthChange(depthVal);
    // Auto-select appropriate timestep
    if (hours <= 1) onTimeStepChange(5);
    else if (hours <= 6) onTimeStepChange(15);
    else if (hours <= 24) onTimeStepChange(15);
    else onTimeStepChange(30);
  };

  const depthConfig = unitSystem === 'USA' 
    ? { min: 0.5, max: 10, step: 0.1 }
    : { min: 12.7, max: 254, step: 2.54 };

  const validation = useMemo(() => 
    validateStormParameters(depth, duration, timeStep, unitSystem),
    [depth, duration, timeStep, unitSystem]
  );

  const intensityClass = useMemo(() => 
    getIntensityClassification(depth, duration, unitSystem),
    [depth, duration, unitSystem]
  );

  const returnPeriod = useMemo(() => 
    estimateReturnPeriod(depth, duration, unitSystem),
    [depth, duration, unitSystem]
  );

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle>Storm Parameters</CardTitle>
        <CardDescription>Define storm characteristics by return period or manual entry</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted">
          <button
            onClick={() => setInputMode("idf-guided")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${
              inputMode === "idf-guided"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Return Period
          </button>
          <button
            onClick={() => setInputMode("manual")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${
              inputMode === "manual"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Manual Entry
          </button>
        </div>

        {/* Unit System */}
        <div className="flex justify-between items-center">
          <Label htmlFor="unit-system">Unit System</Label>
          <Select value={unitSystem} onValueChange={handleUnitSystemChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USA">USA (inches)</SelectItem>
              <SelectItem value="SI">SI (mm)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* IDF-Guided Mode */}
        {inputMode === "idf-guided" && (
          <div className="space-y-5">
            {/* Return Period */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Design Return Period
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {RETURN_PERIODS.map((rp) => (
                  <Button
                    key={rp}
                    variant={selectedReturnPeriod === rp ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleReturnPeriodSelect(rp)}
                  >
                    {rp}-yr
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                {getReturnPeriodDescription(selectedReturnPeriod)}
              </p>
              {selectedReturnPeriod >= 500 && (
                <Badge variant="destructive" className="text-xs">⚠ High uncertainty at extreme return periods</Badge>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Storm Duration
              </Label>
              <div className="grid grid-cols-4 gap-1.5">
                {COMMON_DURATIONS.map((d) => (
                  <Button
                    key={d.hours}
                    variant={selectedDuration === d.hours ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleDurationSelect(d.hours)}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Resulting depth display */}
            <div className="p-3 rounded-lg bg-muted/50 border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estimated Depth</span>
                <span className="text-lg font-bold text-primary">{formatDepth(depth, unitSystem)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Approximate depth for {selectedReturnPeriod}-yr, {selectedDuration >= 1 ? `${selectedDuration}-hr` : `${selectedDuration * 60}-min`} storm. 
                Use NOAA Atlas 14 IDF Lookup for precise values.
              </p>
            </div>

            {/* Time Step */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="timestep-slider-idf">Time Step</Label>
                <span className="text-sm font-semibold text-primary">{timeStep} minutes</span>
              </div>
              <Slider
                id="timestep-slider-idf"
                min={5}
                max={60}
                step={5}
                value={[timeStep]}
                onValueChange={(values) => onTimeStepChange(values[0])}
                className="cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Manual Mode */}
        {inputMode === "manual" && (
          <div className="space-y-5">
            {/* Quick Presets */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wider">
                <Zap className="w-3 h-3" /> Quick Presets
              </Label>
              <div className="flex flex-wrap gap-2">
                {STORM_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => applyPreset(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="depth-slider">Total Rainfall Depth</Label>
                <span className="text-sm font-semibold text-primary">{formatDepth(depth, unitSystem)}</span>
              </div>
              <Slider
                id="depth-slider"
                min={depthConfig.min}
                max={depthConfig.max}
                step={depthConfig.step}
                value={[depth]}
                onValueChange={(values) => onDepthChange(values[0])}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatDepth(depthConfig.min, unitSystem)}</span>
                <span className="italic">Typical: {unitSystem === 'USA' ? '1–6 in for urban design' : '25–150 mm for urban design'}</span>
                <span>{formatDepth(depthConfig.max, unitSystem)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="duration-slider">Storm Duration</Label>
                <span className="text-sm font-semibold text-primary">{duration.toFixed(1)} hours</span>
              </div>
              <Slider
                id="duration-slider"
                min={1}
                max={24}
                step={0.5}
                value={[duration]}
                onValueChange={(values) => onDurationChange(values[0])}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 hr</span>
                <span className="italic">1–6 hr urban · 12–24 hr rural/floodplain</span>
                <span>24 hr</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="timestep-slider">Time Step</Label>
                <span className="text-sm font-semibold text-primary">{timeStep} minutes</span>
              </div>
              <Slider
                id="timestep-slider"
                min={5}
                max={60}
                step={5}
                value={[timeStep]}
                onValueChange={(values) => onTimeStepChange(values[0])}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 min</span>
                <span className="italic">5–10 min small catchments · 15 min recommended for SWMM</span>
                <span>60 min</span>
              </div>
            </div>
          </div>
        )}

        {/* Validation Feedback */}
        <ValidationFeedback
          warnings={validation.warnings}
          isValid={validation.isValid}
          intensityClass={intensityClass}
          estimatedReturnPeriod={returnPeriod}
        />
      </CardContent>
    </Card>
  );
}

/** Rough depth estimate from return period and duration (US-centric, inches) */
function estimateDepthFromRP(rp: number, durationHr: number): number {
  // Very rough approximation based on typical US rainfall
  // Base: 100-yr 24-hr ≈ 7.5 in
  const rpFactor: Record<number, number> = {
    2: 0.35, 5: 0.50, 10: 0.62, 25: 0.80, 50: 0.90,
    100: 1.0, 200: 1.12, 500: 1.30, 1000: 1.45,
  };
  const durationFactor = Math.pow(durationHr / 24, 0.6);
  const factor = rpFactor[rp] ?? 1.0;
  return Math.round(7.5 * factor * durationFactor * 10) / 10;
}
