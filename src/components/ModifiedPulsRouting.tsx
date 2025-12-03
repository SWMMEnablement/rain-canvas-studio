import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Waves, Plus, Trash2, Download, RefreshCw } from 'lucide-react';

interface StorageOutflowPoint {
  stage: number;
  storage: number; // cubic feet
  outflow: number; // cfs
}

interface InflowPoint {
  time: number; // hours
  inflow: number; // cfs
}

interface RoutingResult {
  time: number;
  inflow: number;
  outflow: number;
  storage: number;
  stage: number;
}

const ModifiedPulsRouting: React.FC = () => {
  const [timeStep, setTimeStep] = useState<number>(0.1); // hours
  
  // Stage-Storage-Outflow data
  const [ssoData, setSsoData] = useState<StorageOutflowPoint[]>([
    { stage: 0, storage: 0, outflow: 0 },
    { stage: 1, storage: 2500, outflow: 2 },
    { stage: 2, storage: 10000, outflow: 8 },
    { stage: 3, storage: 22500, outflow: 18 },
    { stage: 4, storage: 40000, outflow: 45 },
    { stage: 5, storage: 62500, outflow: 120 },
    { stage: 6, storage: 90000, outflow: 250 },
  ]);

  // Inflow hydrograph data
  const [inflowData, setInflowData] = useState<InflowPoint[]>([
    { time: 0, inflow: 0 },
    { time: 0.5, inflow: 20 },
    { time: 1, inflow: 80 },
    { time: 1.5, inflow: 150 },
    { time: 2, inflow: 200 },
    { time: 2.5, inflow: 180 },
    { time: 3, inflow: 120 },
    { time: 3.5, inflow: 70 },
    { time: 4, inflow: 40 },
    { time: 4.5, inflow: 20 },
    { time: 5, inflow: 10 },
    { time: 5.5, inflow: 5 },
    { time: 6, inflow: 0 },
  ]);

  // SSO table management
  const addSSORow = () => {
    const lastStage = ssoData.length > 0 ? ssoData[ssoData.length - 1].stage + 1 : 0;
    setSsoData([...ssoData, { stage: lastStage, storage: 0, outflow: 0 }]);
  };

  const removeSSORow = (index: number) => {
    setSsoData(ssoData.filter((_, i) => i !== index));
  };

  const updateSSORow = (index: number, field: keyof StorageOutflowPoint, value: number) => {
    setSsoData(ssoData.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  // Inflow table management
  const addInflowRow = () => {
    const lastTime = inflowData.length > 0 ? inflowData[inflowData.length - 1].time + 0.5 : 0;
    setInflowData([...inflowData, { time: lastTime, inflow: 0 }]);
  };

  const removeInflowRow = (index: number) => {
    setInflowData(inflowData.filter((_, i) => i !== index));
  };

  const updateInflowRow = (index: number, field: keyof InflowPoint, value: number) => {
    setInflowData(inflowData.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  // Generate sample triangular hydrograph
  const generateSampleHydrograph = () => {
    const peakFlow = 200;
    const timeToPeak = 2;
    const totalDuration = 6;
    const points: InflowPoint[] = [];
    
    for (let t = 0; t <= totalDuration; t += timeStep) {
      let inflow: number;
      if (t <= timeToPeak) {
        inflow = (t / timeToPeak) * peakFlow;
      } else {
        inflow = peakFlow * (1 - (t - timeToPeak) / (totalDuration - timeToPeak));
      }
      points.push({ time: Math.round(t * 100) / 100, inflow: Math.max(0, Math.round(inflow * 10) / 10) });
    }
    
    setInflowData(points);
  };

  // Build 2S/Δt + O routing curve
  const routingCurve = useMemo(() => {
    const dt = timeStep * 3600; // Convert hours to seconds
    return ssoData.map(point => ({
      ...point,
      routingValue: (2 * point.storage / dt) + point.outflow
    }));
  }, [ssoData, timeStep]);

  // Interpolation helper
  const interpolate = (x: number, xData: number[], yData: number[]): number => {
    if (x <= xData[0]) return yData[0];
    if (x >= xData[xData.length - 1]) return yData[yData.length - 1];
    
    for (let i = 0; i < xData.length - 1; i++) {
      if (x >= xData[i] && x <= xData[i + 1]) {
        const ratio = (x - xData[i]) / (xData[i + 1] - xData[i]);
        return yData[i] + ratio * (yData[i + 1] - yData[i]);
      }
    }
    return yData[yData.length - 1];
  };

  // Modified Puls Routing
  const routingResults = useMemo(() => {
    if (inflowData.length < 2 || ssoData.length < 2) return [];

    const dt = timeStep * 3600; // seconds
    const results: RoutingResult[] = [];
    
    // Extract arrays for interpolation
    const stages = ssoData.map(p => p.stage);
    const storages = ssoData.map(p => p.storage);
    const outflows = ssoData.map(p => p.outflow);
    const routingValues = routingCurve.map(p => p.routingValue);

    // Initial conditions
    let S1 = 0;
    let O1 = 0;
    
    // Sort inflow data by time
    const sortedInflow = [...inflowData].sort((a, b) => a.time - b.time);

    for (let i = 0; i < sortedInflow.length; i++) {
      const I1 = i > 0 ? sortedInflow[i - 1].inflow : 0;
      const I2 = sortedInflow[i].inflow;
      
      if (i === 0) {
        results.push({
          time: sortedInflow[i].time,
          inflow: I2,
          outflow: 0,
          storage: 0,
          stage: 0
        });
        continue;
      }

      // Modified Puls equation: (2S2/Δt + O2) = (2S1/Δt - O1) + I1 + I2
      const leftSide = (2 * S1 / dt) - O1 + I1 + I2;
      
      // Find O2 by interpolating on routing curve
      const O2 = interpolate(leftSide, routingValues, outflows);
      const S2 = interpolate(O2, outflows, storages);
      const stage2 = interpolate(S2, storages, stages);

      results.push({
        time: Math.round(sortedInflow[i].time * 100) / 100,
        inflow: I2,
        outflow: Math.round(O2 * 100) / 100,
        storage: Math.round(S2),
        stage: Math.round(stage2 * 100) / 100
      });

      // Update for next iteration
      S1 = S2;
      O1 = O2;
    }

    return results;
  }, [inflowData, ssoData, routingCurve, timeStep]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    if (routingResults.length === 0) return null;

    const peakInflow = Math.max(...routingResults.map(r => r.inflow));
    const peakOutflow = Math.max(...routingResults.map(r => r.outflow));
    const maxStorage = Math.max(...routingResults.map(r => r.storage));
    const maxStage = Math.max(...routingResults.map(r => r.stage));
    const peakReduction = peakInflow > 0 ? ((peakInflow - peakOutflow) / peakInflow) * 100 : 0;
    
    const peakInflowTime = routingResults.find(r => r.inflow === peakInflow)?.time || 0;
    const peakOutflowTime = routingResults.find(r => r.outflow === peakOutflow)?.time || 0;
    const lagTime = peakOutflowTime - peakInflowTime;

    return {
      peakInflow: Math.round(peakInflow * 100) / 100,
      peakOutflow: Math.round(peakOutflow * 100) / 100,
      peakReduction: Math.round(peakReduction * 10) / 10,
      maxStorage: Math.round(maxStorage),
      maxStorageAcFt: Math.round((maxStorage / 43560) * 1000) / 1000,
      maxStage: Math.round(maxStage * 100) / 100,
      lagTime: Math.round(lagTime * 100) / 100
    };
  }, [routingResults]);

  const exportCSV = () => {
    const headers = ['Time (hr)', 'Inflow (cfs)', 'Outflow (cfs)', 'Storage (cf)', 'Stage (ft)'];
    const rows = routingResults.map(r => [r.time, r.inflow, r.outflow, r.storage, r.stage].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pond-routing-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5" />
          Modified Puls Pond Routing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Route an inflow hydrograph through a detention pond using the Modified Puls (level pool routing) method.
        </p>

        <Tabs defaultValue="sso" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sso">Storage-Outflow</TabsTrigger>
            <TabsTrigger value="inflow">Inflow Hydrograph</TabsTrigger>
            <TabsTrigger value="results">Routing Results</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          {/* Storage-Outflow Tab */}
          <TabsContent value="sso" className="space-y-4 mt-4">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <Label htmlFor="time-step">Time Step (hours)</Label>
                <Input
                  id="time-step"
                  type="number"
                  min="0.01"
                  max="1"
                  step="0.05"
                  value={timeStep}
                  onChange={(e) => setTimeStep(parseFloat(e.target.value) || 0.1)}
                  className="w-32 mt-1"
                />
              </div>
              <Button variant="outline" size="sm" onClick={addSSORow} className="mt-6">
                <Plus className="h-4 w-4 mr-1" /> Add Row
              </Button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Stage (ft)</TableHead>
                    <TableHead className="w-32">Storage (cf)</TableHead>
                    <TableHead className="w-32">Outflow (cfs)</TableHead>
                    <TableHead className="w-32">2S/Δt + O</TableHead>
                    <TableHead className="w-16"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routingCurve.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={row.stage}
                          onChange={(e) => updateSSORow(index, 'stage', parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="100"
                          value={row.storage}
                          onChange={(e) => updateSSORow(index, 'storage', parseFloat(e.target.value) || 0)}
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={row.outflow}
                          onChange={(e) => updateSSORow(index, 'outflow', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {row.routingValue.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSSORow(index)}
                          className="h-8 w-8"
                          disabled={ssoData.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <h5 className="text-sm font-medium mb-2">Modified Puls Method</h5>
                <p className="text-xs text-muted-foreground">
                  The routing equation is: (2S₂/Δt + O₂) = (2S₁/Δt - O₁) + I₁ + I₂
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  The "2S/Δt + O" column is computed automatically and used for interpolation during routing.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inflow Hydrograph Tab */}
          <TabsContent value="inflow" className="space-y-4 mt-4">
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={addInflowRow}>
                <Plus className="h-4 w-4 mr-1" /> Add Point
              </Button>
              <Button variant="outline" size="sm" onClick={generateSampleHydrograph}>
                <RefreshCw className="h-4 w-4 mr-1" /> Generate Sample
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="max-h-80 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Time (hr)</TableHead>
                      <TableHead className="w-28">Inflow (cfs)</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inflowData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={row.time}
                            onChange={(e) => updateInflowRow(index, 'time', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="5"
                            value={row.inflow}
                            onChange={(e) => updateInflowRow(index, 'inflow', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeInflowRow(index)}
                            className="h-8 w-8"
                            disabled={inflowData.length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-4">Inflow Hydrograph Preview</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={inflowData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (hr)', position: 'bottom', offset: -5 }}
                        className="text-xs"
                      />
                      <YAxis 
                        label={{ value: 'Q (cfs)', angle: -90, position: 'insideLeft' }}
                        className="text-xs"
                      />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                      <Area 
                        type="monotone" 
                        dataKey="inflow" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Routing Results Tab */}
          <TabsContent value="results" className="space-y-4 mt-4">
            {summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-primary/10">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold text-primary">{summary.peakInflow}</p>
                    <p className="text-xs text-muted-foreground">Peak Inflow (cfs)</p>
                  </CardContent>
                </Card>
                <Card className="bg-chart-2/10">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-2))' }}>{summary.peakOutflow}</p>
                    <p className="text-xs text-muted-foreground">Peak Outflow (cfs)</p>
                  </CardContent>
                </Card>
                <Card className="bg-chart-3/10">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-3))' }}>{summary.peakReduction}%</p>
                    <p className="text-xs text-muted-foreground">Peak Reduction</p>
                  </CardContent>
                </Card>
                <Card className="bg-chart-4/10">
                  <CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-4))' }}>{summary.maxStorageAcFt}</p>
                    <p className="text-xs text-muted-foreground">Max Storage (ac-ft)</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {summary && (
              <Card className="bg-muted/30 mb-4">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Max Stage:</span>
                      <span className="ml-2 font-medium">{summary.maxStage} ft</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Max Storage:</span>
                      <span className="ml-2 font-medium">{summary.maxStorage.toLocaleString()} cf</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lag Time:</span>
                      <span className="ml-2 font-medium">{summary.lagTime} hr</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Attenuation:</span>
                      <span className="ml-2 font-medium">{(summary.peakInflow - summary.peakOutflow).toFixed(1)} cfs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time (hr)</TableHead>
                    <TableHead>Inflow (cfs)</TableHead>
                    <TableHead>Outflow (cfs)</TableHead>
                    <TableHead>Storage (cf)</TableHead>
                    <TableHead>Stage (ft)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routingResults.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.time}</TableCell>
                      <TableCell>{row.inflow}</TableCell>
                      <TableCell>{row.outflow}</TableCell>
                      <TableCell>{row.storage.toLocaleString()}</TableCell>
                      <TableCell>{row.stage}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6 mt-4">
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-4">Inflow vs Outflow Hydrograph</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={routingResults}>
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
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="inflow" 
                      name="Inflow"
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="outflow" 
                      name="Outflow"
                      stroke="hsl(var(--chart-2))" 
                      fill="hsl(var(--chart-2))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-4">Storage vs Time</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={routingResults}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (hr)', position: 'bottom', offset: -5 }}
                        className="text-xs"
                      />
                      <YAxis 
                        label={{ value: 'Storage (cf)', angle: -90, position: 'insideLeft' }}
                        className="text-xs"
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [value.toLocaleString(), 'Storage (cf)']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="storage" 
                        stroke="hsl(var(--chart-3))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-4">Stage vs Time</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={routingResults}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="time" 
                        label={{ value: 'Time (hr)', position: 'bottom', offset: -5 }}
                        className="text-xs"
                      />
                      <YAxis 
                        label={{ value: 'Stage (ft)', angle: -90, position: 'insideLeft' }}
                        className="text-xs"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [value.toFixed(2), 'Stage (ft)']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="stage" 
                        stroke="hsl(var(--chart-4))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-4">Routing Curve (2S/Δt + O vs O)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={routingCurve}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="outflow" 
                      label={{ value: 'Outflow (cfs)', position: 'bottom', offset: -5 }}
                      className="text-xs"
                    />
                    <YAxis 
                      dataKey="routingValue"
                      label={{ value: '2S/Δt + O', angle: -90, position: 'insideLeft' }}
                      className="text-xs"
                    />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Line 
                      type="monotone" 
                      dataKey="routingValue" 
                      stroke="hsl(var(--chart-5))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-5))', strokeWidth: 0, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ModifiedPulsRouting;
