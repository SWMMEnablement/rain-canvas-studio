import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface StormParametersProps {
  depth: number;
  duration: number;
  timeStep: number;
  onDepthChange: (value: number) => void;
  onDurationChange: (value: number) => void;
  onTimeStepChange: (value: number) => void;
}

export function StormParameters({
  depth,
  duration,
  timeStep,
  onDepthChange,
  onDurationChange,
  onTimeStepChange,
}: StormParametersProps) {
  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle>Storm Parameters</CardTitle>
        <CardDescription>Adjust rainfall characteristics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="depth-slider">Total Rainfall Depth</Label>
            <span className="text-sm font-semibold text-primary">{depth.toFixed(1)} inches</span>
          </div>
          <Slider
            id="depth-slider"
            min={0.5}
            max={10}
            step={0.1}
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
      </CardContent>
    </Card>
  );
}
