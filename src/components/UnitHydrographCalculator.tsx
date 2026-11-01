import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Download, ArrowRight } from 'lucide-react';
import { generateRainfallData, type PatternType } from '@/lib/rainfallPatterns';
import { unitHydrograph, incrementalExcess, convolve, scsRunoff } from '@/lib/hydrologyCalcs';

interface HydrographPoint {
  time: number;
  flow: number;
}

interface UnitHydrographCalculatorProps {
  onExportHydrograph?: (data: HydrographPoint[]) => void;
}

const UnitHydrographCalculator: React.FC<UnitHydrographCalculatorProps> = ({ onExportHydrograph }) => {
  // Method selection
  const [method, setMethod] = useState<'triangular' | 'dimensionless'>('triangular');
  
  // Watershed parameters
  const [drainageArea, setDrainageArea] = useState<number>(100); // acres
  const [curveNumber, setCurveNumber] = useState<number>(75);
  const [timeOfConcentration, setTimeOfConcentration] = useState<number>(0.5); // hours
  
  // Storm parameters
  const [rainfall, setRainfall] = useState<number>(4); // inches
  const [stormDuration, setStormDuration] = useState<number>(6); // hours
  const [computationInterval, setComputationInterval] = useState<number>(0.1); // hours

  // Rainfall distribution used to spread the storm over its duration (from the shared storm calculator)
  const [stormPattern, setStormPattern] = useState<PatternType>('scs2');

  // Unit response (1 in of excess over Δt), storm excess per interval, and their convolution.
  const calculations = useMemo(() => {
    const dt = Math.min(1, Math.max(0.01, Number.isFinite(computationInterval) ? computationInterval : 0.1));
    const tc = Math.max(0.01, Number.isFinite(timeOfConcentration) ? timeOfConcentration : 0.5);
    const area = Math.max(0, Number.isFinite(drainageArea) ? drainageArea : 0);
    const P = Math.max(0, Number.isFinite(rainfall) ? rainfall : 0);
    const duration = Math.min(72, Math.max(dt, Number.isFinite(stormDuration) ? stormDuration : 6));

    const uh = unitHydrograph({ areaAcres: area, tcHours: tc, dtHours: dt, method });

    // Interval rainfall: whole number of Δt intervals across the storm (bounded count).
    const nIntervals = Math.min(5000, Math.max(1, Math.round(duration / dt)));
    const stepMin = (nIntervals * dt * 60) / nIntervals;
    const intensities = P > 0 ? generateRainfallData(stormPattern, P, nIntervals * dt, stepMin) : new Array(nIntervals).fill(0);
    const intervalDepths = intensities.map(i => i * dt);
    const excess = incrementalExcess(intervalDepths, curveNumber);
    const stormFlows = convolve(excess, uh.ordinates);

    const S = (1000 / curveNumber) - 10;
    const Ia = 0.2 * S;
    const runoffDepth = scsRunoff(P, curveNumber);
    const runoffVolume = (runoffDepth / 12) * area;
    const hydroVolumeAcFt = (stormFlows.reduce((sum, q) => sum + q, 0) * dt * 3600) / 43560;

    let peakIdx = 0;
    stormFlows.forEach((q, i) => { if (q > stormFlows[peakIdx]) peakIdx = i; });

    return {
      dt,
      lagTime: Math.round(uh.lag * 1000) / 1000,
      timeToPeak: Math.round(uh.tp * 1000) / 1000,
      baseTime: Math.round(uh.tb * 1000) / 1000,
      unitPeakFlow: Math.round(Math.max(0, ...uh.ordinates) * 100) / 100,
      runoffDepth: Math.round(runoffDepth * 1000) / 1000,
      peakFlow: Math.round((stormFlows[peakIdx] ?? 0) * 100) / 100,
      stormPeakTime: Math.round(peakIdx * dt * 100) / 100,
      runoffVolume: Math.round(runoffVolume * 1000) / 1000,
      hydroVolumeAcFt: Math.round(hydroVolumeAcFt * 1000) / 1000,
      volumeError: runoffVolume > 0 ? ((hydroVolumeAcFt - runoffVolume) / runoffVolume) * 100 : 0,
      representedDuration: nIntervals * dt,
      stormFlows,
      unitOrdinates: uh.ordinates,
      S,
      Ia: Math.round(Ia * 1000) / 1000,
    };
  }, [drainageArea, curveNumber, timeOfConcentration, rainfall, computationInterval, stormDuration, stormPattern, method]);

  // Storm runoff hydrograph (convolution of rainfall excess with the unit hydrograph)
  const hydrographData = useMemo<HydrographPoint[]>(() =>
    calculations.stormFlows.map((q, i) => ({
      time: Math.round(i * calculations.dt * 100) / 100,
      flow: Math.max(0, Math.round(q * 100) / 100),
    })),
  [calculations]);

  const exportCSV = () => {
    const headers = ['Time (hr)', 'Flow (cfs)'];
    const rows = hydrographData.map(d => [d.time, d.flow].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${method}-unit-hydrograph.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToRouting = () => {
    if (onExportHydrograph) {
      onExportHydrograph(hydrographData);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          NRCS Unit Hydrograph Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Generate inflow hydrographs using NRCS triangular or dimensionless unit hydrograph methods.
        </p>

        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inputs">Watershed & Storm</TabsTrigger>
            <TabsTrigger value="calculations">Calculations</TabsTrigger>
            <TabsTrigger value="hydrograph">Hydrograph</TabsTrigger>
          </TabsList>

          {/* Inputs Tab */}
          <TabsContent value="inputs" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Method Selection</h4>
                <div>
                  <Label>Hydrograph Type</Label>
                  <Select value={method} onValueChange={(v) => setMethod(v as 'triangular' | 'dimensionless')}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="triangular">NRCS Triangular</SelectItem>
                      <SelectItem value="dimensionless">NRCS Dimensionless</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <h4 className="font-semibold mt-6">Watershed Parameters</h4>
                <div>
                  <Label htmlFor="drainage-area">Drainage Area (acres)</Label>
                  <Input
                    id="drainage-area"
                    type="number"
                    min="1"
                    step="10"
                    value={drainageArea}
                    onChange={(e) => setDrainageArea(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="curve-number">Curve Number (CN)</Label>
                  <Input
                    id="curve-number"
                    type="number"
                    min="30"
                    max="98"
                    step="1"
                    value={curveNumber}
                    onChange={(e) => setCurveNumber(parseFloat(e.target.value) || 75)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tc">Time of Concentration (hours)</Label>
                  <Input
                    id="tc"
                    type="number"
                    min="0.1"
                    max="24"
                    step="0.1"
                    value={timeOfConcentration}
                    onChange={(e) => setTimeOfConcentration(parseFloat(e.target.value) || 0.5)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Storm Parameters</h4>
                <div>
                  <Label htmlFor="rainfall">Total Rainfall (inches)</Label>
                  <Input
                    id="rainfall"
                    type="number"
                    min="0.5"
                    max="20"
                    step="0.1"
                    value={rainfall}
                    onChange={(e) => setRainfall(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="storm-duration">Storm Duration (hours)</Label>
                  <Input
                    id="storm-duration"
                    type="number"
                    min="1"
                    max="72"
                    step="1"
                    value={stormDuration}
                    onChange={(e) => setStormDuration(parseFloat(e.target.value) || 6)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="uh-storm-pattern">Rainfall Distribution</Label>
                  <Select value={stormPattern} onValueChange={(v) => setStormPattern(v as PatternType)}>
                    <SelectTrigger id="uh-storm-pattern" className="mt-1" aria-label="Rainfall distribution over the storm duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block (uniform)</SelectItem>
                      <SelectItem value="huff2">Huff 2nd quartile</SelectItem>
                      <SelectItem value="scs1">SCS Type I</SelectItem>
                      <SelectItem value="scs1a">SCS Type IA</SelectItem>
                      <SelectItem value="scs2">SCS Type II</SelectItem>
                      <SelectItem value="scs3">SCS Type III</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Spreads the rainfall over the storm duration; excess per interval is convolved with the unit hydrograph.
                  </p>
                </div>
                <div>
                  <Label htmlFor="interval">Computation Interval (hours)</Label>
                  <Input
                    id="interval"
                    type="number"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={computationInterval}
                    onChange={(e) => setComputationInterval(parseFloat(e.target.value) || 0.1)}
                    className="mt-1"
                  />
                </div>

                <Card className="bg-muted/30 mt-4">
                  <CardContent className="pt-4">
                    <h5 className="text-sm font-medium mb-2">Method Notes</h5>
                    <p className="text-xs text-muted-foreground">
                      {method === 'triangular' 
                        ? "Triangular UH: Simple approximation with linear rise to peak and linear recession. Peak coefficient Cp = 484."
                        : "Dimensionless UH: Standard NRCS curvilinear shape based on observed hydrographs. More accurate representation of recession limb."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Calculations Tab */}
          <TabsContent value="calculations" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-primary/10">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-primary">{calculations.stormPeakTime}</p>
                  <p className="text-xs text-muted-foreground">Storm Peak Time (hr)</p>
                </CardContent>
              </Card>
              <Card className="bg-chart-2/10">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-2))' }}>{calculations.peakFlow}</p>
                  <p className="text-xs text-muted-foreground">Storm Peak Flow (cfs)</p>
                </CardContent>
              </Card>
              <Card className="bg-chart-3/10">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-3))' }}>{calculations.runoffDepth}</p>
                  <p className="text-xs text-muted-foreground">Runoff Depth (in)</p>
                </CardContent>
              </Card>
              <Card className="bg-chart-4/10">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-4))' }}>{calculations.runoffVolume}</p>
                  <p className="text-xs text-muted-foreground">Volume (ac-ft)</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3">Hydrograph Parameters</h4>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Lag Time (L)</TableCell>
                        <TableCell>{calculations.lagTime} hours</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Time to Peak (Tp)</TableCell>
                        <TableCell>{calculations.timeToPeak} hours</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Base Time (Tb)</TableCell>
                        <TableCell>{calculations.baseTime} hours</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Unit Peak Flow (qp)</TableCell>
                        <TableCell>{calculations.unitPeakFlow} cfs/in</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-3">Runoff Calculations (SCS Method)</h4>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Potential Max Retention (S)</TableCell>
                        <TableCell>{calculations.S.toFixed(2)} in</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Initial Abstraction (Ia)</TableCell>
                        <TableCell>{calculations.Ia} in</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Total Rainfall</TableCell>
                        <TableCell>{rainfall} in</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Runoff Depth (Q)</TableCell>
                        <TableCell>{calculations.runoffDepth} in</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Hydrograph Volume (check)</TableCell>
                        <TableCell>
                          {calculations.hydroVolumeAcFt} ac-ft vs {calculations.runoffVolume} ac-ft
                          {' '}({calculations.volumeError >= 0 ? '+' : ''}{calculations.volumeError.toFixed(2)}%)
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Storm Duration Used</TableCell>
                        <TableCell>{calculations.representedDuration.toFixed(2)} hr ({Math.round(calculations.representedDuration / calculations.dt)} × {calculations.dt} hr)</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <h5 className="text-sm font-medium mb-2">Key Equations</h5>
                <div className="text-xs text-muted-foreground space-y-1 font-mono">
                  <p>L = 0.6 × Tc (Lag time)</p>
                  <p>Tp = D/2 + L (Time to peak)</p>
                  <p>Tb = 2.67 × Tp (Base time - triangular)</p>
                  <p>qp = 484 × A / Tp (Peak unit flow, cfs/in)</p>
                  <p>Q = (P - Ia)² / (P - Ia + S) (Runoff depth)</p>
                  <p>Qn = Σ ΔQk × U(n−k) (Storm hydrograph = excess convolved with unit hydrograph)</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hydrograph Tab */}
          <TabsContent value="hydrograph" className="space-y-4 mt-4">
            <div className="flex justify-end gap-2">
              {onExportHydrograph && (
                <Button variant="default" size="sm" onClick={handleSendToRouting}>
                  <ArrowRight className="h-4 w-4 mr-1" /> Send to Pond Routing
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
            </div>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-4">
                  {method === 'triangular' ? 'Triangular' : 'Dimensionless'} Unit Hydrograph
                </h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={hydrographData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="time" 
                      label={{ value: 'Time (hr)', position: 'bottom', offset: -5 }}
                      className="text-xs"
                    />
                    <YAxis 
                      label={{ value: 'Flow (cfs)', angle: -90, position: 'insideLeft' }}
                      className="text-xs"
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [`${value} cfs`, 'Flow']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="flow" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-4">Hydrograph Data</h4>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time (hr)</TableHead>
                        <TableHead>Flow (cfs)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hydrographData.filter((_, i) => i % Math.max(1, Math.floor(hydrographData.length / 20)) === 0).map((point, index) => (
                        <TableRow key={index}>
                          <TableCell>{point.time}</TableCell>
                          <TableCell>{point.flow}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UnitHydrographCalculator;
