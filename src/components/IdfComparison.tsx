import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart3,
  MapPin,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp
} from "lucide-react";
import { type UnitSystem, convertIntensity, getIntensityUnit, convertDepth } from "@/lib/unitConversions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface IdfComparisonProps {
  stormDepth: number; // in inches (internal)
  stormDuration: number; // in hours
  peakIntensity: number; // in in/hr (internal)
  unitSystem: UnitSystem;
}

// NOAA Atlas 14 standard durations
const NOAA_DURATIONS = [
  { label: "5-min", hours: 5/60 },
  { label: "10-min", hours: 10/60 },
  { label: "15-min", hours: 0.25 },
  { label: "30-min", hours: 0.5 },
  { label: "1-hr", hours: 1 },
  { label: "2-hr", hours: 2 },
  { label: "3-hr", hours: 3 },
  { label: "6-hr", hours: 6 },
  { label: "12-hr", hours: 12 },
  { label: "24-hr", hours: 24 },
];

const RETURN_PERIODS = [1, 2, 5, 10, 25, 50, 100, 200, 500, 1000];

// Sample regional IDF parameters (intensity = a / (t + b)^c for various return periods)
// These are illustrative - actual values vary by location
const SAMPLE_IDF_REGIONS: Record<string, { name: string; a: number; b: number; c: number }[]> = {
  "atlanta": [
    { name: "1-yr", a: 35, b: 10, c: 0.75 },
    { name: "2-yr", a: 50, b: 10, c: 0.78 },
    { name: "5-yr", a: 65, b: 10, c: 0.80 },
    { name: "10-yr", a: 80, b: 10, c: 0.81 },
    { name: "25-yr", a: 100, b: 10, c: 0.82 },
    { name: "50-yr", a: 115, b: 10, c: 0.83 },
    { name: "100-yr", a: 130, b: 10, c: 0.84 },
  ],
  "houston": [
    { name: "1-yr", a: 45, b: 8, c: 0.72 },
    { name: "2-yr", a: 65, b: 8, c: 0.75 },
    { name: "5-yr", a: 85, b: 8, c: 0.77 },
    { name: "10-yr", a: 105, b: 8, c: 0.78 },
    { name: "25-yr", a: 130, b: 8, c: 0.79 },
    { name: "50-yr", a: 150, b: 8, c: 0.80 },
    { name: "100-yr", a: 170, b: 8, c: 0.81 },
  ],
  "denver": [
    { name: "1-yr", a: 20, b: 12, c: 0.80 },
    { name: "2-yr", a: 30, b: 12, c: 0.82 },
    { name: "5-yr", a: 42, b: 12, c: 0.84 },
    { name: "10-yr", a: 52, b: 12, c: 0.85 },
    { name: "25-yr", a: 65, b: 12, c: 0.86 },
    { name: "50-yr", a: 75, b: 12, c: 0.87 },
    { name: "100-yr", a: 85, b: 12, c: 0.88 },
  ],
};

interface ManualIdfData {
  [duration: string]: {
    [returnPeriod: number]: string;
  };
}

export function IdfComparison({
  stormDepth,
  stormDuration,
  peakIntensity,
  unitSystem,
}: IdfComparisonProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>("atlanta");
  const [latitude, setLatitude] = useState<string>("33.749");
  const [longitude, setLongitude] = useState<string>("-84.388");
  const [manualIdfData, setManualIdfData] = useState<ManualIdfData>({});
  const [useManualData, setUseManualData] = useState(false);

  const intensityUnit = getIntensityUnit(unitSystem);
  const depthUnit = unitSystem === 'USA' ? 'in' : 'mm';

  // Calculate intensity from IDF equation: i = a / (t + b)^c
  const calculateIdfIntensity = useCallback((durationMinutes: number, params: { a: number; b: number; c: number }) => {
    return params.a / Math.pow(durationMinutes + params.b, params.c);
  }, []);

  // Find matching duration in NOAA standards
  const matchingDuration = useMemo(() => {
    const durationHours = stormDuration;
    return NOAA_DURATIONS.find(d => Math.abs(d.hours - durationHours) < 0.01) || null;
  }, [stormDuration]);

  // Calculate average intensity of the storm
  const avgIntensity = useMemo(() => {
    return stormDepth / stormDuration;
  }, [stormDepth, stormDuration]);

  // Estimate return period based on storm characteristics
  const estimatedReturnPeriod = useMemo(() => {
    const regionParams = SAMPLE_IDF_REGIONS[selectedRegion];
    if (!regionParams) return null;

    const durationMinutes = stormDuration * 60;
    
    // Find where our storm intensity falls in the IDF curves
    for (let i = 0; i < regionParams.length; i++) {
      const idfIntensity = calculateIdfIntensity(durationMinutes, regionParams[i]);
      if (avgIntensity <= idfIntensity) {
        if (i === 0) {
          return { period: "<1", confidence: "low" };
        }
        // Interpolate between return periods
        const prevIntensity = calculateIdfIntensity(durationMinutes, regionParams[i - 1]);
        const ratio = (avgIntensity - prevIntensity) / (idfIntensity - prevIntensity);
        const returnPeriodIndex = RETURN_PERIODS.indexOf(parseInt(regionParams[i].name));
        const prevPeriodIndex = RETURN_PERIODS.indexOf(parseInt(regionParams[i - 1].name));
        if (returnPeriodIndex >= 0 && prevPeriodIndex >= 0) {
          const interpolated = Math.round(RETURN_PERIODS[prevPeriodIndex] + 
            ratio * (RETURN_PERIODS[returnPeriodIndex] - RETURN_PERIODS[prevPeriodIndex]));
          return { period: `~${interpolated}`, confidence: "medium" };
        }
        return { period: regionParams[i].name.replace("-yr", ""), confidence: "medium" };
      }
    }
    return { period: ">100", confidence: "low" };
  }, [selectedRegion, stormDuration, avgIntensity, calculateIdfIntensity]);

  // Generate IDF curve data for the current duration
  const idfCurveData = useMemo(() => {
    const regionParams = SAMPLE_IDF_REGIONS[selectedRegion];
    if (!regionParams) return [];

    const durationMinutes = stormDuration * 60;
    
    return regionParams.map(params => {
      const intensity = calculateIdfIntensity(durationMinutes, params);
      return {
        returnPeriod: params.name,
        intensity: unitSystem === 'USA' ? intensity : convertIntensity(intensity, 'USA', 'SI'),
        depth: intensity * stormDuration,
      };
    });
  }, [selectedRegion, stormDuration, unitSystem, calculateIdfIntensity]);

  // NOAA PFDS URL
  const noaaPfdsUrl = useMemo(() => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) return null;
    return `https://hdsc.nws.noaa.gov/pfds/pfds_map_cont.html?bkmrk=ga&lat=${lat}&lon=${lon}&data=depth&units=english&series=pds`;
  }, [latitude, longitude]);

  // Get current location
  const handleGetLocation = useCallback(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(4));
          setLongitude(position.coords.longitude.toFixed(4));
          toast.success("Location retrieved");
        },
        (error) => {
          toast.error("Could not get location: " + error.message);
        }
      );
    }
  }, []);

  // Update manual IDF value
  const handleManualValueChange = useCallback((duration: string, returnPeriod: number, value: string) => {
    setManualIdfData(prev => ({
      ...prev,
      [duration]: {
        ...(prev[duration] || {}),
        [returnPeriod]: value
      }
    }));
  }, []);

  // Display intensity in current unit system
  const displayIntensity = (inPerHr: number) => {
    const val = unitSystem === 'USA' ? inPerHr : convertIntensity(inPerHr, 'USA', 'SI');
    const decimals = unitSystem === 'USA' ? 2 : 1;
    return `${val.toFixed(decimals)} ${intensityUnit}`;
  };

  // Display depth in current unit system
  const displayDepth = (inches: number) => {
    const val = unitSystem === 'USA' ? inches : convertDepth(inches, 'USA', 'SI');
    const decimals = unitSystem === 'USA' ? 2 : 1;
    return `${val.toFixed(decimals)} ${depthUnit}`;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              IDF Curve Comparison
            </CardTitle>
            <CardDescription>
              Compare your storm against regional Intensity-Duration-Frequency curves
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <MapPin className="w-3 h-3" />
            NOAA Atlas 14
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location & Region Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sample Region (for demonstration)</Label>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atlanta">Atlanta, GA</SelectItem>
                <SelectItem value="houston">Houston, TX</SelectItem>
                <SelectItem value="denver">Denver, CO</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Use NOAA lookup for accurate local data
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">NOAA Atlas 14 Lookup</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-24"
              />
              <Input
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-28"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleGetLocation}>
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Use current location</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {noaaPfdsUrl && (
              <Button variant="link" size="sm" className="h-auto p-0 gap-1" asChild>
                <a href={noaaPfdsUrl} target="_blank" rel="noopener noreferrer">
                  Open NOAA PFDS <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Storm Summary */}
        <div className="p-4 bg-accent/30 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Your Storm Analysis
            </h4>
            {estimatedReturnPeriod && (
              <Badge className={cn(
                "text-sm",
                parseInt(estimatedReturnPeriod.period.replace(/[<>~]/g, '')) >= 25 
                  ? "bg-warning text-warning-foreground" 
                  : "bg-primary"
              )}>
                {estimatedReturnPeriod.period}-yr return period
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Duration</p>
              <p className="font-semibold">{stormDuration} hours</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Depth</p>
              <p className="font-semibold">{displayDepth(stormDepth)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Average Intensity</p>
              <p className="font-semibold">{displayIntensity(avgIntensity)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Peak Intensity</p>
              <p className="font-semibold">{displayIntensity(peakIntensity)}</p>
            </div>
          </div>
        </div>

        {/* IDF Comparison Table */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">
            IDF Values for {stormDuration}-hour Duration
          </h4>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 border">Return Period</th>
                  <th className="text-center p-2 border">IDF Intensity</th>
                  <th className="text-center p-2 border">IDF Depth</th>
                  <th className="text-center p-2 border">Comparison</th>
                </tr>
              </thead>
              <tbody>
                {idfCurveData.map((row, index) => {
                  const idfDepthInches = row.intensity * stormDuration / (unitSystem === 'SI' ? 25.4 : 1);
                  const stormExceedsIdf = stormDepth > idfDepthInches;
                  const nearMatch = Math.abs(stormDepth - idfDepthInches) / idfDepthInches < 0.1;
                  
                  return (
                    <tr key={index} className={cn(
                      "border-b",
                      nearMatch && "bg-primary/10"
                    )}>
                      <td className="p-2 border font-medium">{row.returnPeriod}</td>
                      <td className="p-2 border text-center font-mono">
                        {row.intensity.toFixed(unitSystem === 'USA' ? 2 : 1)} {intensityUnit}
                      </td>
                      <td className="p-2 border text-center font-mono">
                        {(unitSystem === 'USA' ? row.depth : convertDepth(row.depth, 'USA', 'SI')).toFixed(2)} {depthUnit}
                      </td>
                      <td className="p-2 border text-center">
                        {nearMatch ? (
                          <span className="inline-flex items-center gap-1 text-primary">
                            <CheckCircle2 className="w-4 h-4" /> Match
                          </span>
                        ) : stormExceedsIdf ? (
                          <span className="inline-flex items-center gap-1 text-warning">
                            <AlertTriangle className="w-4 h-4" /> Exceeds
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Below</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg text-sm">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-muted-foreground">
            <p className="font-medium text-foreground mb-1">About IDF Comparison</p>
            <p>
              This tool uses sample regional IDF parameters for demonstration. For accurate design work,{" "}
              <a 
                href="https://hdsc.nws.noaa.gov/pfds/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                access NOAA Atlas 14 PFDS
              </a>{" "}
              and enter the official precipitation depths for your location. The estimated return period 
              helps validate that your design storm is appropriate for the intended level of protection.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
