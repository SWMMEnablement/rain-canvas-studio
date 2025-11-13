import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight } from "lucide-react";
import { convertDepth, convertIntensity, getDepthUnit, getIntensityUnit } from "@/lib/unitConversions";

export function UnitConversionCalculator() {
  const [depthUSA, setDepthUSA] = useState<string>("1.0");
  const [depthSI, setDepthSI] = useState<string>("25.4");
  const [intensityUSA, setIntensityUSA] = useState<string>("1.0");
  const [intensitySI, setIntensitySI] = useState<string>("25.4");

  const handleDepthUSAChange = (value: string) => {
    setDepthUSA(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setDepthSI(convertDepth(numValue, 'USA', 'SI').toFixed(1));
    }
  };

  const handleDepthSIChange = (value: string) => {
    setDepthSI(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setDepthUSA(convertDepth(numValue, 'SI', 'USA').toFixed(2));
    }
  };

  const handleIntensityUSAChange = (value: string) => {
    setIntensityUSA(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setIntensitySI(convertIntensity(numValue, 'USA', 'SI').toFixed(2));
    }
  };

  const handleIntensitySIChange = (value: string) => {
    setIntensitySI(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setIntensityUSA(convertIntensity(numValue, 'SI', 'USA').toFixed(4));
    }
  };

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5" />
          Unit Conversion Calculator
        </CardTitle>
        <CardDescription>Quick conversions between USA and SI units</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Depth Conversion */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Rainfall Depth</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="depth-usa" className="text-sm text-muted-foreground">
                USA ({getDepthUnit('USA')})
              </Label>
              <Input
                id="depth-usa"
                type="number"
                step="0.01"
                value={depthUSA}
                onChange={(e) => handleDepthUSAChange(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="depth-si" className="text-sm text-muted-foreground">
                SI ({getDepthUnit('SI')})
              </Label>
              <Input
                id="depth-si"
                type="number"
                step="0.1"
                value={depthSI}
                onChange={(e) => handleDepthSIChange(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Intensity Conversion */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Rainfall Intensity</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="intensity-usa" className="text-sm text-muted-foreground">
                USA ({getIntensityUnit('USA')})
              </Label>
              <Input
                id="intensity-usa"
                type="number"
                step="0.0001"
                value={intensityUSA}
                onChange={(e) => handleIntensityUSAChange(e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intensity-si" className="text-sm text-muted-foreground">
                SI ({getIntensityUnit('SI')})
              </Label>
              <Input
                id="intensity-si"
                type="number"
                step="0.01"
                value={intensitySI}
                onChange={(e) => handleIntensitySIChange(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground text-center">
          1 inch = 25.4 mm
        </div>
      </CardContent>
    </Card>
  );
}
