import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap } from "lucide-react";
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
        <CardDescription>Adjust rainfall characteristics or pick a common design storm</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
        <div className="space-y-3">
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
        </div>

        <div className="space-y-3">
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
        </div>

        <div className="space-y-3">
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
        </div>

        <div className="space-y-3">
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
        </div>

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
