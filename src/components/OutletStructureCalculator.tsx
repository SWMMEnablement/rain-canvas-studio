import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CircleDot, Waves, Calculator, Info } from 'lucide-react';

const OutletStructureCalculator: React.FC = () => {
  // Orifice inputs
  const [orificeDiameter, setOrificeDiameter] = useState<number>(6);
  const [orificeHead, setOrificeHead] = useState<number>(3);
  const [orificeCoeff, setOrificeCoeff] = useState<number>(0.6);
  const [orificeType, setOrificeType] = useState<'circular' | 'rectangular'>('circular');
  const [orificeWidth, setOrificeWidth] = useState<number>(12);
  const [orificeHeight, setOrificeHeight] = useState<number>(6);

  // Rectangular weir inputs
  const [rectWeirLength, setRectWeirLength] = useState<number>(4);
  const [rectWeirHead, setRectWeirHead] = useState<number>(0.5);
  const [rectWeirCoeff, setRectWeirCoeff] = useState<number>(3.33);
  const [rectWeirType, setRectWeirType] = useState<'suppressed' | 'contracted'>('suppressed');

  // V-notch weir inputs
  const [vNotchAngle, setVNotchAngle] = useState<number>(90);
  const [vNotchHead, setVNotchHead] = useState<number>(0.5);
  const [vNotchCoeff, setVNotchCoeff] = useState<number>(2.5);

  // Target discharge for reverse calculation
  const [targetDischarge, setTargetDischarge] = useState<number>(5);

  const orificeCalcs = useMemo(() => {
    const g = 32.2; // ft/s²
    let area: number;
    
    if (orificeType === 'circular') {
      const radiusFt = (orificeDiameter / 12) / 2; // Convert inches to feet
      area = Math.PI * radiusFt * radiusFt;
    } else {
      area = (orificeWidth / 12) * (orificeHeight / 12); // Convert inches to feet
    }

    // Q = Cd * A * sqrt(2 * g * h)
    const discharge = orificeCoeff * area * Math.sqrt(2 * g * orificeHead);
    const velocity = Math.sqrt(2 * g * orificeHead);

    // Reverse calc: find diameter for target discharge
    const requiredArea = targetDischarge / (orificeCoeff * Math.sqrt(2 * g * orificeHead));
    const requiredDiameter = Math.sqrt(requiredArea / Math.PI) * 2 * 12; // in inches

    return {
      area,
      discharge,
      velocity,
      requiredDiameter,
      requiredArea,
    };
  }, [orificeDiameter, orificeHead, orificeCoeff, orificeType, orificeWidth, orificeHeight, targetDischarge]);

  const rectWeirCalcs = useMemo(() => {
    // Q = C * L * H^1.5 (suppressed)
    // Q = C * (L - 0.2H) * H^1.5 (contracted)
    const effectiveLength = rectWeirType === 'contracted' 
      ? rectWeirLength - 0.2 * rectWeirHead 
      : rectWeirLength;
    
    const discharge = rectWeirCoeff * effectiveLength * Math.pow(rectWeirHead, 1.5);

    // Reverse calc: find length for target discharge
    const requiredLength = targetDischarge / (rectWeirCoeff * Math.pow(rectWeirHead, 1.5));

    return {
      effectiveLength,
      discharge,
      requiredLength,
    };
  }, [rectWeirLength, rectWeirHead, rectWeirCoeff, rectWeirType, targetDischarge]);

  const vNotchCalcs = useMemo(() => {
    // Q = C * tan(θ/2) * H^2.5
    const angleRad = (vNotchAngle / 2) * (Math.PI / 180);
    const discharge = vNotchCoeff * Math.tan(angleRad) * Math.pow(vNotchHead, 2.5);

    // Reverse calc: find head for target discharge
    const requiredHead = Math.pow(targetDischarge / (vNotchCoeff * Math.tan(angleRad)), 1/2.5);

    return {
      discharge,
      requiredHead,
    };
  }, [vNotchAngle, vNotchHead, vNotchCoeff, targetDischarge]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5" />
          Outlet Structure Sizing Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Calculate discharge through orifices and weirs for detention pond outlet design.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="target-q">Target Discharge (cfs)</Label>
            <Input
              id="target-q"
              type="number"
              min="0"
              step="0.1"
              value={targetDischarge}
              onChange={(e) => setTargetDischarge(parseFloat(e.target.value) || 0)}
              className="mt-1 max-w-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used for reverse calculations to find required dimensions
            </p>
          </div>
        </div>

        <Tabs defaultValue="orifice" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orifice">
              <CircleDot className="h-4 w-4 mr-2" />
              Orifice
            </TabsTrigger>
            <TabsTrigger value="rect-weir">Rectangular Weir</TabsTrigger>
            <TabsTrigger value="v-notch">V-Notch Weir</TabsTrigger>
          </TabsList>

          {/* Orifice Tab */}
          <TabsContent value="orifice" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Orifice Type</Label>
                  <Select
                    value={orificeType}
                    onValueChange={(v) => setOrificeType(v as 'circular' | 'rectangular')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circular">Circular</SelectItem>
                      <SelectItem value="rectangular">Rectangular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orificeType === 'circular' ? (
                  <div>
                    <Label htmlFor="orifice-dia">Orifice Diameter (inches)</Label>
                    <Input
                      id="orifice-dia"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={orificeDiameter}
                      onChange={(e) => setOrificeDiameter(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="orifice-width">Width (inches)</Label>
                      <Input
                        id="orifice-width"
                        type="number"
                        min="1"
                        step="1"
                        value={orificeWidth}
                        onChange={(e) => setOrificeWidth(parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="orifice-height">Height (inches)</Label>
                      <Input
                        id="orifice-height"
                        type="number"
                        min="1"
                        step="1"
                        value={orificeHeight}
                        onChange={(e) => setOrificeHeight(parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="orifice-head">Head Above Centroid (ft)</Label>
                  <Input
                    id="orifice-head"
                    type="number"
                    min="0"
                    step="0.1"
                    value={orificeHead}
                    onChange={(e) => setOrificeHead(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="orifice-coeff">Discharge Coefficient (Cd)</Label>
                  <Input
                    id="orifice-coeff"
                    type="number"
                    min="0.4"
                    max="1"
                    step="0.01"
                    value={orificeCoeff}
                    onChange={(e) => setOrificeCoeff(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Typical: 0.60 (sharp-edged), 0.80 (rounded)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Orifice Discharge</p>
                      <p className="text-3xl font-bold text-primary">
                        {orificeCalcs.discharge.toFixed(2)} cfs
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2 text-sm">
                  <div className="bg-muted/50 p-2 rounded flex justify-between">
                    <span className="text-muted-foreground">Area:</span>
                    <span className="font-medium">{orificeCalcs.area.toFixed(4)} ft²</span>
                  </div>
                  <div className="bg-muted/50 p-2 rounded flex justify-between">
                    <span className="text-muted-foreground">Velocity:</span>
                    <span className="font-medium">{orificeCalcs.velocity.toFixed(2)} ft/s</span>
                  </div>
                  <div className="bg-muted/50 p-2 rounded flex justify-between">
                    <span className="text-muted-foreground">For Q = {targetDischarge} cfs:</span>
                    <span className="font-medium">{orificeCalcs.requiredDiameter.toFixed(1)}" dia.</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg text-sm">
                  <p className="font-mono">Q = Cd × A × √(2gh)</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    g = 32.2 ft/s²
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Rectangular Weir Tab */}
          <TabsContent value="rect-weir" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Weir Type</Label>
                  <Select
                    value={rectWeirType}
                    onValueChange={(v) => setRectWeirType(v as 'suppressed' | 'contracted')}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suppressed">Suppressed (no contractions)</SelectItem>
                      <SelectItem value="contracted">Contracted (side contractions)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rect-length">Weir Length (ft)</Label>
                  <Input
                    id="rect-length"
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={rectWeirLength}
                    onChange={(e) => setRectWeirLength(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rect-head">Head Above Crest (ft)</Label>
                  <Input
                    id="rect-head"
                    type="number"
                    min="0"
                    step="0.05"
                    value={rectWeirHead}
                    onChange={(e) => setRectWeirHead(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="rect-coeff">Weir Coefficient (C)</Label>
                  <Input
                    id="rect-coeff"
                    type="number"
                    min="2.5"
                    max="4"
                    step="0.01"
                    value={rectWeirCoeff}
                    onChange={(e) => setRectWeirCoeff(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Typical: 3.33 (sharp-crested), 3.0-3.1 (broad-crested)
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Weir Discharge</p>
                      <p className="text-3xl font-bold text-primary">
                        {rectWeirCalcs.discharge.toFixed(2)} cfs
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2 text-sm">
                  <div className="bg-muted/50 p-2 rounded flex justify-between">
                    <span className="text-muted-foreground">Effective length:</span>
                    <span className="font-medium">{rectWeirCalcs.effectiveLength.toFixed(2)} ft</span>
                  </div>
                  <div className="bg-muted/50 p-2 rounded flex justify-between">
                    <span className="text-muted-foreground">For Q = {targetDischarge} cfs:</span>
                    <span className="font-medium">{rectWeirCalcs.requiredLength.toFixed(2)} ft length</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg text-sm">
                  <p className="font-mono">Q = C × L × H<sup>1.5</sup></p>
                  <p className="text-xs text-muted-foreground mt-1">
                    For contracted weir: L<sub>eff</sub> = L - 0.2H
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* V-Notch Weir Tab */}
          <TabsContent value="v-notch" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="v-angle">Notch Angle (degrees)</Label>
                  <Select
                    value={vNotchAngle.toString()}
                    onValueChange={(v) => setVNotchAngle(parseFloat(v))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="22.5">22.5° (1/4 notch)</SelectItem>
                      <SelectItem value="45">45° (1/2 notch)</SelectItem>
                      <SelectItem value="60">60°</SelectItem>
                      <SelectItem value="90">90° (full notch)</SelectItem>
                      <SelectItem value="120">120°</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="v-head">Head Above Vertex (ft)</Label>
                  <Input
                    id="v-head"
                    type="number"
                    min="0"
                    step="0.05"
                    value={vNotchHead}
                    onChange={(e) => setVNotchHead(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="v-coeff">Weir Coefficient (C)</Label>
                  <Input
                    id="v-coeff"
                    type="number"
                    min="2"
                    max="3"
                    step="0.01"
                    value={vNotchCoeff}
                    onChange={(e) => setVNotchCoeff(parseFloat(e.target.value) || 0)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Typical: 2.5 for 90° notch
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">V-Notch Discharge</p>
                      <p className="text-3xl font-bold text-primary">
                        {vNotchCalcs.discharge.toFixed(2)} cfs
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2 text-sm">
                  <div className="bg-muted/50 p-2 rounded flex justify-between">
                    <span className="text-muted-foreground">For Q = {targetDischarge} cfs:</span>
                    <span className="font-medium">{vNotchCalcs.requiredHead.toFixed(2)} ft head</span>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg text-sm">
                  <p className="font-mono">Q = C × tan(θ/2) × H<sup>2.5</sup></p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Reference Table */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Coefficient Reference
          </h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Structure Type</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Coefficient</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Orifice</TableCell>
                <TableCell>Sharp-edged</TableCell>
                <TableCell>0.60 - 0.62</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Orifice</TableCell>
                <TableCell>Rounded entrance</TableCell>
                <TableCell>0.80 - 0.92</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Rectangular Weir</TableCell>
                <TableCell>Sharp-crested, suppressed</TableCell>
                <TableCell>3.27 - 3.33</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Rectangular Weir</TableCell>
                <TableCell>Broad-crested</TableCell>
                <TableCell>2.63 - 3.08</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>V-Notch (90°)</TableCell>
                <TableCell>Sharp-crested</TableCell>
                <TableCell>2.49 - 2.50</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default OutletStructureCalculator;
