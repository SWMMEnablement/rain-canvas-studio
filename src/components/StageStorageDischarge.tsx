import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Plus, Trash2, Download } from 'lucide-react';

interface OutletConfig {
  id: number;
  type: 'orifice' | 'weir';
  invert: number;
  // Orifice params
  diameter?: number;
  coeff?: number;
  // Weir params
  length?: number;
  weirCoeff?: number;
}

const StageStorageDischarge: React.FC = () => {
  // Pond geometry inputs
  const [bottomLength, setBottomLength] = useState<number>(100);
  const [bottomWidth, setBottomWidth] = useState<number>(50);
  const [sideSlope, setSideSlope] = useState<number>(3); // H:V ratio
  const [maxDepth, setMaxDepth] = useState<number>(6);
  const [depthIncrement, setDepthIncrement] = useState<number>(0.5);

  // Outlet configurations
  const [outlets, setOutlets] = useState<OutletConfig[]>([
    { id: 1, type: 'orifice', invert: 0, diameter: 6, coeff: 0.6 },
    { id: 2, type: 'weir', invert: 4, length: 8, weirCoeff: 3.33 },
  ]);
  const [nextOutletId, setNextOutletId] = useState(3);

  const addOutlet = (type: 'orifice' | 'weir') => {
    const newOutlet: OutletConfig = type === 'orifice'
      ? { id: nextOutletId, type: 'orifice', invert: 0, diameter: 6, coeff: 0.6 }
      : { id: nextOutletId, type: 'weir', invert: 2, length: 4, weirCoeff: 3.33 };
    setOutlets([...outlets, newOutlet]);
    setNextOutletId(nextOutletId + 1);
  };

  const removeOutlet = (id: number) => {
    setOutlets(outlets.filter(o => o.id !== id));
  };

  const updateOutlet = (id: number, field: keyof OutletConfig, value: number | string) => {
    setOutlets(outlets.map(o => o.id === id ? { ...o, [field]: value } : o));
  };

  // Calculate storage at a given depth (trapezoidal pond)
  const calculateStorage = (depth: number): number => {
    // V = (d/3) * (A1 + A2 + sqrt(A1*A2))
    // Where A1 = bottom area, A2 = top area at depth d
    const topLength = bottomLength + 2 * sideSlope * depth;
    const topWidth = bottomWidth + 2 * sideSlope * depth;
    
    const bottomArea = bottomLength * bottomWidth;
    const topArea = topLength * topWidth;
    
    // Prismoidal formula
    const volume = (depth / 6) * (bottomArea + topArea + 4 * ((bottomLength + sideSlope * depth) * (bottomWidth + sideSlope * depth)));
    
    return volume; // cubic feet
  };

  // Calculate discharge at a given stage
  const calculateDischarge = (stage: number): number => {
    let totalQ = 0;
    const g = 32.2;

    for (const outlet of outlets) {
      const head = stage - outlet.invert;
      if (head <= 0) continue;

      if (outlet.type === 'orifice' && outlet.diameter && outlet.coeff) {
        const radiusFt = (outlet.diameter / 12) / 2;
        const area = Math.PI * radiusFt * radiusFt;
        // For submerged orifice, use head to centroid
        const effectiveHead = Math.max(0, head - (outlet.diameter / 12) / 2);
        if (effectiveHead > 0) {
          totalQ += outlet.coeff * area * Math.sqrt(2 * g * effectiveHead);
        }
      } else if (outlet.type === 'weir' && outlet.length && outlet.weirCoeff) {
        totalQ += outlet.weirCoeff * outlet.length * Math.pow(head, 1.5);
      }
    }

    return totalQ;
  };

  // Generate stage-storage-discharge data
  const curveData = useMemo(() => {
    const data: { stage: number; storage: number; storageAcFt: number; discharge: number }[] = [];
    
    for (let depth = 0; depth <= maxDepth; depth += depthIncrement) {
      const storage = calculateStorage(depth);
      const discharge = calculateDischarge(depth);
      
      data.push({
        stage: Math.round(depth * 100) / 100,
        storage: Math.round(storage),
        storageAcFt: Math.round((storage / 43560) * 1000) / 1000,
        discharge: Math.round(discharge * 100) / 100,
      });
    }
    
    return data;
  }, [bottomLength, bottomWidth, sideSlope, maxDepth, depthIncrement, outlets]);

  const exportCSV = () => {
    const headers = ['Stage (ft)', 'Storage (cf)', 'Storage (ac-ft)', 'Discharge (cfs)'];
    const rows = curveData.map(d => [d.stage, d.storage, d.storageAcFt, d.discharge].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stage-storage-discharge.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Stage-Storage-Discharge Curve Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Generate stage-storage-discharge relationships for detention pond routing analysis.
        </p>

        <Tabs defaultValue="geometry" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="geometry">Pond Geometry</TabsTrigger>
            <TabsTrigger value="outlets">Outlet Structures</TabsTrigger>
            <TabsTrigger value="results">Results & Curves</TabsTrigger>
          </TabsList>

          {/* Geometry Tab */}
          <TabsContent value="geometry" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Bottom Dimensions</h4>
                <div>
                  <Label htmlFor="bottom-length">Bottom Length (ft)</Label>
                  <Input
                    id="bottom-length"
                    type="number"
                    min="10"
                    step="10"
                    value={bottomLength}
                    onChange={(e) => setBottomLength(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bottom-width">Bottom Width (ft)</Label>
                  <Input
                    id="bottom-width"
                    type="number"
                    min="10"
                    step="10"
                    value={bottomWidth}
                    onChange={(e) => setBottomWidth(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="side-slope">Side Slope (H:V)</Label>
                  <Input
                    id="side-slope"
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={sideSlope}
                    onChange={(e) => setSideSlope(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Typical: 3:1 to 4:1 for mowed slopes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Analysis Parameters</h4>
                <div>
                  <Label htmlFor="max-depth">Maximum Depth (ft)</Label>
                  <Input
                    id="max-depth"
                    type="number"
                    min="1"
                    max="20"
                    step="0.5"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="depth-inc">Depth Increment (ft)</Label>
                  <Input
                    id="depth-inc"
                    type="number"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={depthIncrement}
                    onChange={(e) => setDepthIncrement(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <h5 className="text-sm font-medium mb-2">Pond Summary</h5>
                    <div className="text-sm space-y-1">
                      <p>Bottom area: {(bottomLength * bottomWidth).toLocaleString()} ft²</p>
                      <p>Top area at max depth: {((bottomLength + 2 * sideSlope * maxDepth) * (bottomWidth + 2 * sideSlope * maxDepth)).toLocaleString()} ft²</p>
                      <p>Max storage: {(calculateStorage(maxDepth) / 43560).toFixed(2)} acre-ft</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Outlets Tab */}
          <TabsContent value="outlets" className="space-y-4 mt-4">
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={() => addOutlet('orifice')}>
                <Plus className="h-4 w-4 mr-1" /> Add Orifice
              </Button>
              <Button variant="outline" size="sm" onClick={() => addOutlet('weir')}>
                <Plus className="h-4 w-4 mr-1" /> Add Weir
              </Button>
            </div>

            <div className="space-y-4">
              {outlets.map((outlet) => (
                <Card key={outlet.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-medium capitalize">{outlet.type} #{outlet.id}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOutlet(outlet.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">Invert Elev. (ft)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={outlet.invert}
                        onChange={(e) => updateOutlet(outlet.id, 'invert', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    
                    {outlet.type === 'orifice' ? (
                      <>
                        <div>
                          <Label className="text-xs">Diameter (in)</Label>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={outlet.diameter}
                            onChange={(e) => updateOutlet(outlet.id, 'diameter', parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Coeff (Cd)</Label>
                          <Input
                            type="number"
                            min="0.4"
                            max="1"
                            step="0.05"
                            value={outlet.coeff}
                            onChange={(e) => updateOutlet(outlet.id, 'coeff', parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label className="text-xs">Length (ft)</Label>
                          <Input
                            type="number"
                            min="1"
                            step="0.5"
                            value={outlet.length}
                            onChange={(e) => updateOutlet(outlet.id, 'length', parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Weir Coeff (C)</Label>
                          <Input
                            type="number"
                            min="2.5"
                            max="4"
                            step="0.01"
                            value={outlet.weirCoeff}
                            onChange={(e) => updateOutlet(outlet.id, 'weirCoeff', parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              ))}

              {outlets.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No outlet structures defined. Add an orifice or weir above.
                </p>
              )}
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4 mt-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-4">Stage-Storage Curve</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={curveData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="storageAcFt" 
                        label={{ value: 'Storage (ac-ft)', position: 'bottom', offset: -5 }}
                        className="text-xs"
                      />
                      <YAxis 
                        dataKey="stage"
                        label={{ value: 'Stage (ft)', angle: -90, position: 'insideLeft' }}
                        className="text-xs"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number, name: string) => {
                          if (name === 'stage') return [`${value} ft`, 'Stage'];
                          return [value, name];
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="stage" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-4">Stage-Discharge Curve</h4>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={curveData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="discharge" 
                        label={{ value: 'Discharge (cfs)', position: 'bottom', offset: -5 }}
                        className="text-xs"
                      />
                      <YAxis 
                        dataKey="stage"
                        label={{ value: 'Stage (ft)', angle: -90, position: 'insideLeft' }}
                        className="text-xs"
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="stage" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 0, r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card>
              <CardContent className="pt-4">
                <h4 className="font-semibold mb-4">Stage-Storage-Discharge Table</h4>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Stage (ft)</TableHead>
                        <TableHead>Storage (ft³)</TableHead>
                        <TableHead>Storage (ac-ft)</TableHead>
                        <TableHead>Discharge (cfs)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {curveData.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.stage.toFixed(2)}</TableCell>
                          <TableCell>{row.storage.toLocaleString()}</TableCell>
                          <TableCell>{row.storageAcFt.toFixed(3)}</TableCell>
                          <TableCell>{row.discharge.toFixed(2)}</TableCell>
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

export default StageStorageDischarge;
