import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, ComposedChart } from 'recharts';
import { Scale, Download, Calculator, TrendingUp, Droplets } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StormEvent {
  returnPeriod: string;
  rainfall: number;
}

const PrePostDevelopmentComparison: React.FC = () => {
  // Pre-development parameters
  const [preArea, setPreArea] = useState<number>(50); // acres
  const [preCN, setPreCN] = useState<number>(65);
  const [preTc, setPreTc] = useState<number>(30); // minutes
  const [preC, setPreC] = useState<number>(0.35); // rational method C
  
  // Post-development parameters
  const [postArea, setPostArea] = useState<number>(50); // acres
  const [postCN, setPostCN] = useState<number>(85);
  const [postTc, setPostTc] = useState<number>(15); // minutes
  const [postC, setPostC] = useState<number>(0.65); // rational method C
  
  // Storm parameters
  const [stormDuration, setStormDuration] = useState<number>(24); // hours
  const [designStorms, setDesignStorms] = useState<StormEvent[]>([
    { returnPeriod: '2-year', rainfall: 3.2 },
    { returnPeriod: '10-year', rainfall: 5.0 },
    { returnPeriod: '25-year', rainfall: 6.0 },
    { returnPeriod: '100-year', rainfall: 7.5 },
  ]);
  
  // Method selection
  const [method, setMethod] = useState<'scs' | 'rational'>('scs');
  
  // Safety factor for storage
  const [safetyFactor, setSafetyFactor] = useState<number>(1.1);

  const updateStormRainfall = (index: number, rainfall: number) => {
    const updated = [...designStorms];
    updated[index].rainfall = rainfall;
    setDesignStorms(updated);
  };

  // Calculate runoff using SCS method
  const calculateSCSRunoff = (rainfall: number, cn: number, area: number) => {
    const S = (1000 / cn) - 10; // inches
    const Ia = 0.2 * S;
    let Q = 0;
    if (rainfall > Ia) {
      Q = Math.pow(rainfall - Ia, 2) / (rainfall - Ia + S);
    }
    // Volume in acre-feet
    const volumeAcFt = (Q * area) / 12;
    // Volume in cubic feet
    const volumeCuFt = volumeAcFt * 43560;
    return { depth: Q, volumeAcFt, volumeCuFt, S, Ia };
  };

  // Calculate peak flow using NRCS TR-55 graphical method approximation
  const calculateSCSPeakFlow = (runoffDepth: number, area: number, tc: number) => {
    // Simplified TR-55 peak discharge: qp = qu * A * Q
    // qu = unit peak discharge (csm/in) - varies with Tc and Ia/P ratio
    // Approximation: qu ≈ 484 / (Tc + 0.6*Tc) for Type II storm
    const lagTime = 0.6 * (tc / 60); // hours
    const timeToPeak = (stormDuration / 48) + lagTime; // hours
    const areaSqMi = area / 640;
    
    // Peak flow coefficient (484 for NRCS standard)
    const Cp = 484;
    const peakFlow = (Cp * areaSqMi * runoffDepth) / timeToPeak;
    
    return peakFlow; // cfs
  };

  // Calculate peak flow using Rational Method
  const calculateRationalPeakFlow = (rainfall: number, c: number, area: number, tc: number) => {
    // i = intensity (in/hr) - approximate from rainfall and Tc
    // Using simplified IDF: i ≈ P * K / (Tc + b) where K and b are constants
    // Simplified: i ≈ (total rainfall / duration) * adjustment for Tc
    const intensity = rainfall / (tc / 60); // crude approximation
    const peakFlow = c * intensity * area; // Q = CiA
    return peakFlow; // cfs
  };

  const calculations = useMemo(() => {
    return designStorms.map(storm => {
      let prePeak: number, postPeak: number;
      let preRunoff: { depth: number; volumeAcFt: number; volumeCuFt: number };
      let postRunoff: { depth: number; volumeAcFt: number; volumeCuFt: number };
      
      if (method === 'scs') {
        // SCS Method calculations
        const preCalc = calculateSCSRunoff(storm.rainfall, preCN, preArea);
        const postCalc = calculateSCSRunoff(storm.rainfall, postCN, postArea);
        
        preRunoff = preCalc;
        postRunoff = postCalc;
        
        prePeak = calculateSCSPeakFlow(preCalc.depth, preArea, preTc);
        postPeak = calculateSCSPeakFlow(postCalc.depth, postArea, postTc);
      } else {
        // Rational Method calculations
        prePeak = calculateRationalPeakFlow(storm.rainfall, preC, preArea, preTc);
        postPeak = calculateRationalPeakFlow(storm.rainfall, postC, postArea, postTc);
        
        // Estimate runoff volumes for rational method (simplified)
        const preRunoffCoef = preC;
        const postRunoffCoef = postC;
        const preDepth = storm.rainfall * preRunoffCoef;
        const postDepth = storm.rainfall * postRunoffCoef;
        
        preRunoff = {
          depth: preDepth,
          volumeAcFt: (preDepth * preArea) / 12,
          volumeCuFt: (preDepth * preArea * 43560) / 12
        };
        postRunoff = {
          depth: postDepth,
          volumeAcFt: (postDepth * postArea) / 12,
          volumeCuFt: (postDepth * postArea * 43560) / 12
        };
      }
      
      // Peak flow increase
      const peakIncrease = postPeak - prePeak;
      const peakIncreasePercent = prePeak > 0 ? ((postPeak - prePeak) / prePeak) * 100 : 0;
      
      // Volume increase
      const volumeIncrease = postRunoff.volumeAcFt - preRunoff.volumeAcFt;
      const volumeIncreasePercent = preRunoff.volumeAcFt > 0 
        ? ((postRunoff.volumeAcFt - preRunoff.volumeAcFt) / preRunoff.volumeAcFt) * 100 
        : 0;
      
      // Required detention storage (simplified routing)
      // Storage ≈ (Qpost - Qpre) * time / 2 (triangular approximation)
      // More accurate: use modified rational method
      const avgTc = (preTc + postTc) / 2 / 60; // hours
      const storageTime = avgTc * 2; // approximate detention time
      
      // Modified rational method storage estimate
      // Vs = Qpost * Td - Qpre * Td where Td is detention time
      // Simplified: required storage to reduce postPeak to prePeak
      const requiredRelease = prePeak; // Target release rate = pre-dev peak
      
      // Storage estimate using modified rational method approximation
      // V = (Qi - Qo) * T / 2 for triangular hydrograph
      let requiredStorageCuFt = 0;
      if (postPeak > prePeak) {
        // Extended detention time approximation
        const detentionTime = storageTime * 3600; // seconds
        requiredStorageCuFt = ((postPeak - prePeak) * detentionTime) / 2;
        
        // Also consider volume-based approach
        const volumeBasedStorage = (postRunoff.volumeCuFt - preRunoff.volumeCuFt) * 0.5;
        
        // Use the larger of flow-based or volume-based
        requiredStorageCuFt = Math.max(requiredStorageCuFt, volumeBasedStorage);
      }
      
      const designStorageCuFt = requiredStorageCuFt * safetyFactor;
      const designStorageAcFt = designStorageCuFt / 43560;
      
      return {
        returnPeriod: storm.returnPeriod,
        rainfall: storm.rainfall,
        prePeak,
        postPeak,
        peakIncrease,
        peakIncreasePercent,
        preRunoffDepth: preRunoff.depth,
        postRunoffDepth: postRunoff.depth,
        preVolume: preRunoff.volumeAcFt,
        postVolume: postRunoff.volumeAcFt,
        volumeIncrease,
        volumeIncreasePercent,
        requiredStorageCuFt,
        designStorageCuFt,
        designStorageAcFt,
        targetRelease: requiredRelease
      };
    });
  }, [designStorms, preCN, postCN, preArea, postArea, preTc, postTc, preC, postC, method, safetyFactor, stormDuration]);

  // Chart data for peak flow comparison
  const peakFlowChartData = calculations.map(calc => ({
    name: calc.returnPeriod,
    'Pre-Development': Number(calc.prePeak.toFixed(1)),
    'Post-Development': Number(calc.postPeak.toFixed(1)),
    'Target Release': Number(calc.targetRelease.toFixed(1))
  }));

  // Chart data for volume comparison
  const volumeChartData = calculations.map(calc => ({
    name: calc.returnPeriod,
    'Pre-Dev Volume': Number(calc.preVolume.toFixed(3)),
    'Post-Dev Volume': Number(calc.postVolume.toFixed(3)),
    'Required Storage': Number(calc.designStorageAcFt.toFixed(3))
  }));

  // Export results to CSV
  const exportToCSV = () => {
    const headers = [
      'Return Period',
      'Rainfall (in)',
      'Pre-Dev Peak (cfs)',
      'Post-Dev Peak (cfs)',
      'Peak Increase (%)',
      'Pre-Dev Volume (ac-ft)',
      'Post-Dev Volume (ac-ft)',
      'Volume Increase (%)',
      'Required Storage (cu-ft)',
      'Design Storage (ac-ft)',
      'Target Release (cfs)'
    ];
    
    const rows = calculations.map(calc => [
      calc.returnPeriod,
      calc.rainfall.toFixed(2),
      calc.prePeak.toFixed(2),
      calc.postPeak.toFixed(2),
      calc.peakIncreasePercent.toFixed(1),
      calc.preVolume.toFixed(4),
      calc.postVolume.toFixed(4),
      calc.volumeIncreasePercent.toFixed(1),
      calc.requiredStorageCuFt.toFixed(0),
      calc.designStorageAcFt.toFixed(4),
      calc.targetRelease.toFixed(2)
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pre_post_development_comparison.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Pre/Post Development Comparison
          <Badge variant="secondary" className="ml-2">Detention Sizing</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="inputs" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="sizing">Sizing</TabsTrigger>
          </TabsList>

          <TabsContent value="inputs" className="space-y-6 mt-4">
            {/* Method Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Analysis Method</Label>
                <Select value={method} onValueChange={(v) => setMethod(v as 'scs' | 'rational')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scs">SCS/NRCS Method</SelectItem>
                    <SelectItem value="rational">Rational Method</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Storm Duration (hours)</Label>
                <Input
                  type="number"
                  value={stormDuration}
                  onChange={(e) => setStormDuration(Number(e.target.value))}
                  min={1}
                  max={72}
                />
              </div>
            </div>

            {/* Pre and Post Development Parameters Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pre-Development */}
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-4 flex items-center gap-2">
                  <Droplets className="w-4 h-4" />
                  Pre-Development Conditions
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label>Drainage Area (acres)</Label>
                    <Input
                      type="number"
                      value={preArea}
                      onChange={(e) => setPreArea(Number(e.target.value))}
                      min={0.1}
                      step={0.1}
                    />
                  </div>
                  {method === 'scs' ? (
                    <div>
                      <Label>Curve Number (CN)</Label>
                      <Input
                        type="number"
                        value={preCN}
                        onChange={(e) => setPreCN(Number(e.target.value))}
                        min={30}
                        max={98}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label>Runoff Coefficient (C)</Label>
                      <Input
                        type="number"
                        value={preC}
                        onChange={(e) => setPreC(Number(e.target.value))}
                        min={0.05}
                        max={0.95}
                        step={0.05}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Time of Concentration (min)</Label>
                    <Input
                      type="number"
                      value={preTc}
                      onChange={(e) => setPreTc(Number(e.target.value))}
                      min={5}
                      max={600}
                    />
                  </div>
                </div>
              </div>

              {/* Post-Development */}
              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Post-Development Conditions
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label>Drainage Area (acres)</Label>
                    <Input
                      type="number"
                      value={postArea}
                      onChange={(e) => setPostArea(Number(e.target.value))}
                      min={0.1}
                      step={0.1}
                    />
                  </div>
                  {method === 'scs' ? (
                    <div>
                      <Label>Curve Number (CN)</Label>
                      <Input
                        type="number"
                        value={postCN}
                        onChange={(e) => setPostCN(Number(e.target.value))}
                        min={30}
                        max={98}
                      />
                    </div>
                  ) : (
                    <div>
                      <Label>Runoff Coefficient (C)</Label>
                      <Input
                        type="number"
                        value={postC}
                        onChange={(e) => setPostC(Number(e.target.value))}
                        min={0.05}
                        max={0.95}
                        step={0.05}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Time of Concentration (min)</Label>
                    <Input
                      type="number"
                      value={postTc}
                      onChange={(e) => setPostTc(Number(e.target.value))}
                      min={5}
                      max={600}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Design Storms */}
            <div className="space-y-4">
              <h4 className="font-semibold">Design Storm Events</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {designStorms.map((storm, idx) => (
                  <div key={storm.returnPeriod}>
                    <Label>{storm.returnPeriod} Rainfall (in)</Label>
                    <Input
                      type="number"
                      value={storm.rainfall}
                      onChange={(e) => updateStormRainfall(idx, Number(e.target.value))}
                      min={0.1}
                      step={0.1}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Factor */}
            <div className="max-w-xs">
              <Label>Storage Safety Factor</Label>
              <Input
                type="number"
                value={safetyFactor}
                onChange={(e) => setSafetyFactor(Number(e.target.value))}
                min={1.0}
                max={2.0}
                step={0.05}
              />
              <p className="text-xs text-muted-foreground mt-1">Typically 1.1 to 1.25</p>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Storm</TableHead>
                    <TableHead className="text-right">Rain (in)</TableHead>
                    <TableHead className="text-right">Pre Peak (cfs)</TableHead>
                    <TableHead className="text-right">Post Peak (cfs)</TableHead>
                    <TableHead className="text-right">Increase (%)</TableHead>
                    <TableHead className="text-right">Pre Vol (ac-ft)</TableHead>
                    <TableHead className="text-right">Post Vol (ac-ft)</TableHead>
                    <TableHead className="text-right">Storage (ac-ft)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calculations.map((calc) => (
                    <TableRow key={calc.returnPeriod}>
                      <TableCell className="font-medium">{calc.returnPeriod}</TableCell>
                      <TableCell className="text-right">{calc.rainfall.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-green-600">{calc.prePeak.toFixed(1)}</TableCell>
                      <TableCell className="text-right text-orange-600">{calc.postPeak.toFixed(1)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={calc.peakIncreasePercent > 50 ? "destructive" : "secondary"}>
                          +{calc.peakIncreasePercent.toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{calc.preVolume.toFixed(3)}</TableCell>
                      <TableCell className="text-right">{calc.postVolume.toFixed(3)}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {calc.designStorageAcFt.toFixed(3)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6 mt-4">
            {/* Peak Flow Comparison Chart */}
            <div>
              <h4 className="font-semibold mb-4">Peak Flow Comparison</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peakFlowChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Peak Flow (cfs)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Pre-Development" fill="#22c55e" />
                    <Bar dataKey="Post-Development" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Volume and Storage Chart */}
            <div>
              <h4 className="font-semibold mb-4">Runoff Volume & Required Storage</h4>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={volumeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Volume (ac-ft)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Pre-Dev Volume" fill="#22c55e" />
                    <Bar dataKey="Post-Dev Volume" fill="#f97316" />
                    <Line type="monotone" dataKey="Required Storage" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sizing" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary Cards */}
              {calculations.map((calc) => (
                <Card key={calc.returnPeriod} className="bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{calc.returnPeriod} Storm</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Pre-Dev Peak</p>
                        <p className="text-lg font-semibold text-green-600">{calc.prePeak.toFixed(1)} cfs</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Post-Dev Peak</p>
                        <p className="text-lg font-semibold text-orange-600">{calc.postPeak.toFixed(1)} cfs</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Target Release</p>
                        <p className="text-lg font-semibold">{calc.targetRelease.toFixed(1)} cfs</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Peak Reduction Needed</p>
                        <p className="text-lg font-semibold">{calc.peakIncrease.toFixed(1)} cfs</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-muted-foreground">Required Detention Storage</p>
                      <div className="flex gap-4 mt-1">
                        <p className="text-xl font-bold text-primary">
                          {calc.designStorageAcFt.toFixed(3)} ac-ft
                        </p>
                        <p className="text-lg text-muted-foreground">
                          ({(calc.designStorageCuFt / 1000).toFixed(1)}k cu-ft)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Design Recommendations */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Design Recommendations</h4>
              <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Controlling storm is typically the {calculations.reduce((max, c) => c.designStorageAcFt > max.designStorageAcFt ? c : max, calculations[0]).returnPeriod} event</li>
                <li>Maximum required storage: {Math.max(...calculations.map(c => c.designStorageAcFt)).toFixed(3)} ac-ft</li>
                <li>Size outlet structure to release at pre-development peak rate</li>
                <li>Consider multi-stage outlet for multiple design storms</li>
                <li>Verify with detailed pond routing analysis</li>
              </ul>
            </div>

            {/* Methodology Notes */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Methodology</h4>
              <p className="text-sm text-muted-foreground">
                {method === 'scs' ? (
                  <>
                    Storage estimates use the SCS/NRCS curve number method for runoff calculations 
                    with simplified TR-55 peak flow estimates. For detailed design, use the Modified Puls 
                    routing method with actual hydrographs.
                  </>
                ) : (
                  <>
                    Storage estimates use the Rational Method for peak flow calculations. This method 
                    is suitable for small watersheds (&lt;200 acres). For larger watersheds, use the 
                    SCS method with hydrograph routing.
                  </>
                )}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PrePostDevelopmentComparison;
