import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calculator, Info, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TcResult {
  value: number | null;
  unit: string;
  formula: string;
}

export function TcCalculator() {
  // Kirpich inputs
  const [kirpichLength, setKirpichLength] = useState<string>("1000");
  const [kirpichSlope, setKirpichSlope] = useState<string>("2");

  // FAA inputs
  const [faaLength, setFaaLength] = useState<string>("300");
  const [faaSlope, setFaaSlope] = useState<string>("2");
  const [faaRunoffCoeff, setFaaRunoffCoeff] = useState<string>("0.5");

  // TR-55 inputs
  const [sheetLength, setSheetLength] = useState<string>("100");
  const [sheetManning, setSheetManning] = useState<string>("0.15");
  const [sheetRainfall, setSheetRainfall] = useState<string>("3");
  const [sheetSlope, setSheetSlope] = useState<string>("2");
  
  const [shallowLength, setShallowLength] = useState<string>("500");
  const [shallowSlope, setShallowSlope] = useState<string>("2");
  const [shallowSurface, setShallowSurface] = useState<string>("unpaved");
  
  const [channelLength, setChannelLength] = useState<string>("2000");
  const [channelSlope, setChannelSlope] = useState<string>("1");
  const [channelArea, setChannelArea] = useState<string>("10");
  const [channelWettedPerimeter, setChannelWettedPerimeter] = useState<string>("8");
  const [channelManning, setChannelManning] = useState<string>("0.03");

  // Kirpich calculation
  const kirpichResult = useMemo((): TcResult => {
    const L = parseFloat(kirpichLength);
    const S = parseFloat(kirpichSlope) / 100;
    
    if (isNaN(L) || isNaN(S) || L <= 0 || S <= 0) {
      return { value: null, unit: "min", formula: "Tc = 0.0078 × L^0.77 × S^(-0.385)" };
    }
    
    // Kirpich formula: Tc = 0.0078 * L^0.77 * S^(-0.385) (Tc in minutes, L in feet, S in ft/ft)
    const tc = 0.0078 * Math.pow(L, 0.77) * Math.pow(S, -0.385);
    
    return { 
      value: Math.round(tc * 10) / 10, 
      unit: "min",
      formula: "Tc = 0.0078 × L^0.77 × S^(-0.385)"
    };
  }, [kirpichLength, kirpichSlope]);

  // FAA calculation
  const faaResult = useMemo((): TcResult => {
    const L = parseFloat(faaLength);
    const S = parseFloat(faaSlope) / 100;
    const C = parseFloat(faaRunoffCoeff);
    
    if (isNaN(L) || isNaN(S) || isNaN(C) || L <= 0 || S <= 0 || C <= 0 || C > 1) {
      return { value: null, unit: "min", formula: "Tc = 1.8 × (1.1 - C) × √L / S^(1/3)" };
    }
    
    // FAA formula: Tc = 1.8 * (1.1 - C) * sqrt(L) / S^(1/3)
    const tc = 1.8 * (1.1 - C) * Math.sqrt(L) / Math.pow(S, 1/3);
    
    return { 
      value: Math.round(tc * 10) / 10, 
      unit: "min",
      formula: "Tc = 1.8 × (1.1 - C) × √L / S^(1/3)"
    };
  }, [faaLength, faaSlope, faaRunoffCoeff]);

  // TR-55 calculation
  const tr55Result = useMemo(() => {
    // Sheet flow travel time
    const Ls = parseFloat(sheetLength);
    const ns = parseFloat(sheetManning);
    const P2 = parseFloat(sheetRainfall);
    const Ss = parseFloat(sheetSlope) / 100;
    
    let sheetTt = 0;
    let sheetValid = true;
    if (isNaN(Ls) || isNaN(ns) || isNaN(P2) || isNaN(Ss) || Ls <= 0 || ns <= 0 || P2 <= 0 || Ss <= 0) {
      sheetValid = false;
    } else {
      // Tt = 0.007 * (n*L)^0.8 / (P2^0.5 * S^0.4)
      sheetTt = 0.007 * Math.pow(ns * Ls, 0.8) / (Math.pow(P2, 0.5) * Math.pow(Ss, 0.4));
    }
    
    // Shallow concentrated flow travel time
    const Lsc = parseFloat(shallowLength);
    const Ssc = parseFloat(shallowSlope) / 100;
    
    let shallowTt = 0;
    let shallowValid = true;
    if (isNaN(Lsc) || isNaN(Ssc) || Lsc <= 0 || Ssc <= 0) {
      shallowValid = false;
    } else {
      // Velocity depends on surface type
      // Unpaved: V = 16.1345 * S^0.5, Paved: V = 20.3282 * S^0.5
      const velocityCoeff = shallowSurface === "paved" ? 20.3282 : 16.1345;
      const velocity = velocityCoeff * Math.pow(Ssc, 0.5);
      shallowTt = (Lsc / velocity) / 60; // Convert seconds to minutes
    }
    
    // Channel flow travel time (Manning's equation)
    const Lc = parseFloat(channelLength);
    const Sc = parseFloat(channelSlope) / 100;
    const A = parseFloat(channelArea);
    const P = parseFloat(channelWettedPerimeter);
    const nc = parseFloat(channelManning);
    
    let channelTt = 0;
    let channelValid = true;
    if (isNaN(Lc) || isNaN(Sc) || isNaN(A) || isNaN(P) || isNaN(nc) || 
        Lc <= 0 || Sc <= 0 || A <= 0 || P <= 0 || nc <= 0) {
      channelValid = false;
    } else {
      const R = A / P; // Hydraulic radius
      // Manning's: V = (1.49/n) * R^(2/3) * S^(1/2)
      const velocity = (1.49 / nc) * Math.pow(R, 2/3) * Math.pow(Sc, 0.5);
      channelTt = (Lc / velocity) / 60; // Convert seconds to minutes
    }
    
    const totalTc = (sheetValid ? sheetTt : 0) + (shallowValid ? shallowTt : 0) + (channelValid ? channelTt : 0);
    
    return {
      sheet: { value: sheetValid ? Math.round(sheetTt * 10) / 10 : null, valid: sheetValid },
      shallow: { value: shallowValid ? Math.round(shallowTt * 10) / 10 : null, valid: shallowValid },
      channel: { value: channelValid ? Math.round(channelTt * 10) / 10 : null, valid: channelValid },
      total: Math.round(totalTc * 10) / 10
    };
  }, [sheetLength, sheetManning, sheetRainfall, sheetSlope, shallowLength, shallowSlope, shallowSurface, channelLength, channelSlope, channelArea, channelWettedPerimeter, channelManning]);

  const InputWithTooltip = ({ 
    id, 
    label, 
    value, 
    onChange, 
    tooltip, 
    unit 
  }: { 
    id: string; 
    label: string; 
    value: string; 
    onChange: (v: string) => void; 
    tooltip: string;
    unit?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor={id} className="text-sm">{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3 h-3 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex gap-2 items-center">
        <Input
          id={id}
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9"
        />
        {unit && <span className="text-xs text-muted-foreground w-12">{unit}</span>}
      </div>
    </div>
  );

  const ResultDisplay = ({ result, label }: { result: TcResult; label: string }) => (
    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-primary">
            {result.value !== null ? `${result.value} ${result.unit}` : "—"}
          </p>
        </div>
        <Clock className="w-8 h-8 text-primary/50" />
      </div>
      <p className="text-xs text-muted-foreground mt-2 font-mono">{result.formula}</p>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Time of Concentration Calculator
        </CardTitle>
        <CardDescription>
          Calculate Tc using Kirpich, FAA, or TR-55 methods
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="kirpich" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="kirpich">Kirpich</TabsTrigger>
            <TabsTrigger value="faa">FAA</TabsTrigger>
            <TabsTrigger value="tr55">TR-55</TabsTrigger>
          </TabsList>

          {/* Kirpich Method */}
          <TabsContent value="kirpich" className="space-y-6">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Best For</Badge>
                <span className="text-sm text-muted-foreground">Small rural watersheds, natural channels</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Developed in 1940 for small agricultural watersheds in Tennessee. 
                Best for overland flow lengths of 200-10,000 feet with slopes 3-10%.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputWithTooltip
                id="kirpich-length"
                label="Flow Length (L)"
                value={kirpichLength}
                onChange={setKirpichLength}
                tooltip="Maximum flow path length from the hydraulically most distant point to the outlet"
                unit="feet"
              />
              <InputWithTooltip
                id="kirpich-slope"
                label="Average Slope (S)"
                value={kirpichSlope}
                onChange={setKirpichSlope}
                tooltip="Average slope along the flow path (rise/run × 100)"
                unit="%"
              />
            </div>

            <ResultDisplay result={kirpichResult} label="Time of Concentration" />
          </TabsContent>

          {/* FAA Method */}
          <TabsContent value="faa" className="space-y-6">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Best For</Badge>
                <span className="text-sm text-muted-foreground">Overland flow, airport drainage, paved areas</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Federal Aviation Administration method for overland flow. 
                Accounts for surface roughness through the runoff coefficient. Flow length should be ≤300 ft.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <InputWithTooltip
                id="faa-length"
                label="Flow Length (L)"
                value={faaLength}
                onChange={setFaaLength}
                tooltip="Overland flow length (recommended ≤300 feet)"
                unit="feet"
              />
              <InputWithTooltip
                id="faa-slope"
                label="Surface Slope (S)"
                value={faaSlope}
                onChange={setFaaSlope}
                tooltip="Average surface slope along the flow path"
                unit="%"
              />
              <InputWithTooltip
                id="faa-coeff"
                label="Runoff Coeff (C)"
                value={faaRunoffCoeff}
                onChange={setFaaRunoffCoeff}
                tooltip="Rational method runoff coefficient: 0.3-0.5 (pervious), 0.7-0.95 (impervious)"
                unit=""
              />
            </div>

            <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
              <strong>Typical C values:</strong> Lawns (0.15-0.35), Parks (0.20-0.35), 
              Commercial (0.70-0.95), Industrial (0.60-0.90), Residential (0.40-0.70)
            </div>

            <ResultDisplay result={faaResult} label="Time of Concentration" />
          </TabsContent>

          {/* TR-55 Method */}
          <TabsContent value="tr55" className="space-y-6">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Best For</Badge>
                <span className="text-sm text-muted-foreground">Complete watershed analysis, segmented flow paths</span>
              </div>
              <p className="text-xs text-muted-foreground">
                NRCS TR-55 segmental approach divides the flow path into sheet flow (≤300 ft), 
                shallow concentrated flow, and channel flow segments.
              </p>
            </div>

            {/* Sheet Flow */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-semibold flex items-center gap-2">
                1. Sheet Flow
                <Badge variant="secondary" className="text-xs">Max 300 ft</Badge>
              </h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InputWithTooltip
                  id="sheet-length"
                  label="Length"
                  value={sheetLength}
                  onChange={setSheetLength}
                  tooltip="Sheet flow length (maximum 300 feet per TR-55)"
                  unit="feet"
                />
                <InputWithTooltip
                  id="sheet-manning"
                  label="Manning's n"
                  value={sheetManning}
                  onChange={setSheetManning}
                  tooltip="Surface roughness: 0.011 (smooth), 0.15 (grass), 0.40 (dense woods)"
                  unit=""
                />
                <InputWithTooltip
                  id="sheet-rainfall"
                  label="2-yr, 24-hr Rainfall"
                  value={sheetRainfall}
                  onChange={setSheetRainfall}
                  tooltip="2-year, 24-hour rainfall depth from NOAA Atlas 14"
                  unit="inches"
                />
                <InputWithTooltip
                  id="sheet-slope"
                  label="Slope"
                  value={sheetSlope}
                  onChange={setSheetSlope}
                  tooltip="Land slope along the sheet flow path"
                  unit="%"
                />
              </div>
              {tr55Result.sheet.value !== null && (
                <p className="text-sm">Travel time: <strong>{tr55Result.sheet.value} min</strong></p>
              )}
            </div>

            {/* Shallow Concentrated Flow */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-semibold">2. Shallow Concentrated Flow</h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <InputWithTooltip
                  id="shallow-length"
                  label="Length"
                  value={shallowLength}
                  onChange={setShallowLength}
                  tooltip="Length of shallow concentrated flow segment"
                  unit="feet"
                />
                <InputWithTooltip
                  id="shallow-slope"
                  label="Slope"
                  value={shallowSlope}
                  onChange={setShallowSlope}
                  tooltip="Average slope of shallow flow segment"
                  unit="%"
                />
                <div className="space-y-2">
                  <Label className="text-sm">Surface Type</Label>
                  <select
                    value={shallowSurface}
                    onChange={(e) => setShallowSurface(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="unpaved">Unpaved</option>
                    <option value="paved">Paved</option>
                  </select>
                </div>
              </div>
              {tr55Result.shallow.value !== null && (
                <p className="text-sm">Travel time: <strong>{tr55Result.shallow.value} min</strong></p>
              )}
            </div>

            {/* Channel Flow */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-semibold">3. Channel Flow (Manning's Equation)</h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <InputWithTooltip
                  id="channel-length"
                  label="Length"
                  value={channelLength}
                  onChange={setChannelLength}
                  tooltip="Channel flow length"
                  unit="feet"
                />
                <InputWithTooltip
                  id="channel-slope"
                  label="Slope"
                  value={channelSlope}
                  onChange={setChannelSlope}
                  tooltip="Channel bed slope"
                  unit="%"
                />
                <InputWithTooltip
                  id="channel-area"
                  label="Cross-Section Area"
                  value={channelArea}
                  onChange={setChannelArea}
                  tooltip="Channel cross-sectional flow area"
                  unit="sq ft"
                />
                <InputWithTooltip
                  id="channel-wp"
                  label="Wetted Perimeter"
                  value={channelWettedPerimeter}
                  onChange={setChannelWettedPerimeter}
                  tooltip="Wetted perimeter of channel cross-section"
                  unit="feet"
                />
                <InputWithTooltip
                  id="channel-manning"
                  label="Manning's n"
                  value={channelManning}
                  onChange={setChannelManning}
                  tooltip="Channel roughness: 0.013 (concrete), 0.03 (natural stream), 0.05 (weedy)"
                  unit=""
                />
              </div>
              {tr55Result.channel.value !== null && (
                <p className="text-sm">Travel time: <strong>{tr55Result.channel.value} min</strong></p>
              )}
            </div>

            {/* TR-55 Result */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Time of Concentration</p>
                  <p className="text-3xl font-bold text-primary">
                    {tr55Result.total > 0 ? `${tr55Result.total} min` : "—"}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Tc = Tt(sheet) + Tt(shallow) + Tt(channel) = {tr55Result.sheet.value || 0} + {tr55Result.shallow.value || 0} + {tr55Result.channel.value || 0} min
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
