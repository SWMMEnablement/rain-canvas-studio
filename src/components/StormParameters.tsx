import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type UnitSystem, convertDepth, formatDepth } from "@/lib/unitConversions";
import { ValidationFeedback } from "@/components/ValidationFeedback";
import { 
  validateStormParameters, 
  getIntensityClassification, 
  estimateReturnPeriod 
} from "@/lib/stormValidation";

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
    // Convert depth value when switching units
    const convertedDepth = convertDepth(depth, unitSystem, newSystem);
    onDepthChange(convertedDepth);
    onUnitSystemChange(newSystem);
  };

  const depthConfig = unitSystem === 'USA' 
    ? { min: 0.5, max: 10, step: 0.1 }
    : { min: 12.7, max: 254, step: 2.54 }; // equivalent ranges in mm

  // Validate storm parameters
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
        <CardDescription>Adjust rainfall characteristics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
