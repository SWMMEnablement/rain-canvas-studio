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

interface HydrographPoint {
  time: number;
  flow: number;
}

interface UnitHydrographCalculatorProps {
  onExportHydrograph?: (data: HydrographPoint[]) => void;
}

// NRCS Dimensionless Unit Hydrograph ratios
const NRCS_DIMENSIONLESS = [
  { t_tp: 0, q_qp: 0 },
  { t_tp: 0.1, q_qp: 0.03 },
  { t_tp: 0.2, q_qp: 0.1 },
  { t_tp: 0.3, q_qp: 0.19 },
  { t_tp: 0.4, q_qp: 0.31 },
  { t_tp: 0.5, q_qp: 0.47 },
  { t_tp: 0.6, q_qp: 0.66 },
  { t_tp: 0.7, q_qp: 0.82 },
  { t_tp: 0.8, q_qp: 0.93 },
  { t_tp: 0.9, q_qp: 0.99 },
  { t_tp: 1.0, q_qp: 1.0 },
  { t_tp: 1.1, q_qp: 0.99 },
  { t_tp: 1.2, q_qp: 0.93 },
  { t_tp: 1.3, q_qp: 0.86 },
  { t_tp: 1.4, q_qp: 0.78 },
  { t_tp: 1.5, q_qp: 0.68 },
  { t_tp: 1.6, q_qp: 0.56 },
  { t_tp: 1.7, q_qp: 0.46 },
  { t_tp: 1.8, q_qp: 0.39 },
  { t_tp: 1.9, q_qp: 0.33 },
  { t_tp: 2.0, q_qp: 0.28 },
  { t_tp: 2.2, q_qp: 0.207 },
  { t_tp: 2.4, q_qp: 0.147 },
  { t_tp: 2.6, q_qp: 0.107 },
  { t_tp: 2.8, q_qp: 0.077 },
  { t_tp: 3.0, q_qp: 0.055 },
  { t_tp: 3.2, q_qp: 0.04 },
  { t_tp: 3.4, q_qp: 0.029 },
  { t_tp: 3.6, q_qp: 0.021 },
  { t_tp: 3.8, q_qp: 0.015 },
  { t_tp: 4.0, q_qp: 0.011 },
  { t_tp: 4.5, q_qp: 0.005 },
  { t_tp: 5.0, q_qp: 0 },
];

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

  // Calculated parameters
  const calculations = useMemo(() => {
    const tc = timeOfConcentration;
    const D = computationInterval; // Duration of unit rainfall excess
    
    // Lag time (NRCS method: L = 0.6 * Tc)
    const lagTime = 0.6 * tc;
    
    // Time to peak
    const timeToPeak = (D / 2) + lagTime;
    
    // Base time for triangular (Tb = 2.67 * Tp)
    const baseTime = 2.67 * timeToPeak;
    
    // Peak flow coefficient (484 for NRCS standard, can be 300-600)
    const Cp = 484;
    
    // Peak flow rate (cfs) - q_p = Cp * A * Q / Tp
    // For unit hydrograph, Q = 1 inch of runoff
    const areaSqMi = drainageArea / 640;
    const unitPeakFlow = (Cp * areaSqMi) / timeToPeak;
    
    // Calculate actual runoff depth using SCS method
    const S = (1000 / curveNumber) - 10;
    const Ia = 0.2 * S;
    let runoffDepth = 0;
    if (rainfall > Ia) {
      runoffDepth = Math.pow(rainfall - Ia, 2) / (rainfall - Ia + S);
    }
    
    // Actual peak flow
    const peakFlow = unitPeakFlow * runoffDepth;
    
    // Total runoff volume (acre-ft)
    const runoffVolume = (runoffDepth / 12) * drainageArea;
    
    return {
      lagTime: Math.round(lagTime * 1000) / 1000,
      timeToPeak: Math.round(timeToPeak * 1000) / 1000,
      baseTime: Math.round(baseTime * 1000) / 1000,
      unitPeakFlow: Math.round(unitPeakFlow * 100) / 100,
      runoffDepth: Math.round(runoffDepth * 1000) / 1000,
      peakFlow: Math.round(peakFlow * 100) / 100,
      runoffVolume: Math.round(runoffVolume * 1000) / 1000,
      S,
      Ia: Math.round(Ia * 1000) / 1000,
    };
  }, [drainageArea, curveNumber, timeOfConcentration, rainfall, computationInterval]);

  // Generate hydrograph
  const hydrographData = useMemo(() => {
    const { timeToPeak, baseTime, peakFlow, runoffDepth } = calculations;
    const data: HydrographPoint[] = [];
    
    if (method === 'triangular') {
      // Triangular unit hydrograph
      const totalTime = baseTime * 1.2;
      
      for (let t = 0; t <= totalTime; t += computationInterval) {
        let flow = 0;
        
        if (t <= timeToPeak) {
          flow = (t / timeToPeak) * peakFlow;
        } else if (t <= baseTime) {
          flow = peakFlow * (1 - (t - timeToPeak) / (baseTime - timeToPeak));
        }
        
        data.push({
          time: Math.round(t * 100) / 100,
          flow: Math.max(0, Math.round(flow * 100) / 100)
        });
      }
    } else {
      // NRCS Dimensionless Unit Hydrograph
      const maxT = 5 * timeToPeak;
      
      // Interpolate dimensionless hydrograph
      const interpolateDimensionless = (t_tp: number): number => {
        if (t_tp <= 0) return 0;
        if (t_tp >= 5) return 0;
        
        for (let i = 0; i < NRCS_DIMENSIONLESS.length - 1; i++) {
          if (t_tp >= NRCS_DIMENSIONLESS[i].t_tp && t_tp <= NRCS_DIMENSIONLESS[i + 1].t_tp) {
            const ratio = (t_tp - NRCS_DIMENSIONLESS[i].t_tp) / 
                         (NRCS_DIMENSIONLESS[i + 1].t_tp - NRCS_DIMENSIONLESS[i].t_tp);
            return NRCS_DIMENSIONLESS[i].q_qp + 
                   ratio * (NRCS_DIMENSIONLESS[i + 1].q_qp - NRCS_DIMENSIONLESS[i].q_qp);
          }
        }
        return 0;
      };
      
      for (let t = 0; t <= maxT; t += computationInterval) {
        const t_tp = t / timeToPeak;
        const q_qp = interpolateDimensionless(t_tp);
        const flow = q_qp * peakFlow;
        
        data.push({
          time: Math.round(t * 100) / 100,
          flow: Math.max(0, Math.round(flow * 100) / 100)
        });
      }
    }
    
    return data;
  }, [method, calculations, computationInterval]);

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
                  <p className="text-2xl font-bold text-primary">{calculations.timeToPeak}</p>
                  <p className="text-xs text-muted-foreground">Time to Peak (hr)</p>
                </CardContent>
              </Card>
              <Card className="bg-chart-2/10">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-2))' }}>{calculations.peakFlow}</p>
                  <p className="text-xs text-muted-foreground">Peak Flow (cfs)</p>
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
