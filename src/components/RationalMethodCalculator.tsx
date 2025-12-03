import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Gauge, Calculator } from 'lucide-react';

interface RunoffCoefficientData {
  category: string;
  description: string;
  cRange: { min: number; max: number };
  typical: number;
}

const runoffCoefficients: RunoffCoefficientData[] = [
  { category: 'business_downtown', description: 'Business - Downtown', cRange: { min: 0.70, max: 0.95 }, typical: 0.85 },
  { category: 'business_neighborhood', description: 'Business - Neighborhood', cRange: { min: 0.50, max: 0.70 }, typical: 0.60 },
  { category: 'residential_single', description: 'Residential - Single family', cRange: { min: 0.30, max: 0.50 }, typical: 0.40 },
  { category: 'residential_multi', description: 'Residential - Multi-units, detached', cRange: { min: 0.40, max: 0.60 }, typical: 0.50 },
  { category: 'residential_attached', description: 'Residential - Multi-units, attached', cRange: { min: 0.60, max: 0.75 }, typical: 0.68 },
  { category: 'residential_suburban', description: 'Residential - Suburban', cRange: { min: 0.25, max: 0.40 }, typical: 0.32 },
  { category: 'residential_apartments', description: 'Residential - Apartments', cRange: { min: 0.50, max: 0.70 }, typical: 0.60 },
  { category: 'industrial_light', description: 'Industrial - Light', cRange: { min: 0.50, max: 0.80 }, typical: 0.65 },
  { category: 'industrial_heavy', description: 'Industrial - Heavy', cRange: { min: 0.60, max: 0.90 }, typical: 0.75 },
  { category: 'parks_cemeteries', description: 'Parks, Cemeteries', cRange: { min: 0.10, max: 0.25 }, typical: 0.18 },
  { category: 'playgrounds', description: 'Playgrounds', cRange: { min: 0.20, max: 0.35 }, typical: 0.28 },
  { category: 'railroad_yards', description: 'Railroad yards', cRange: { min: 0.20, max: 0.40 }, typical: 0.30 },
  { category: 'unimproved', description: 'Unimproved areas', cRange: { min: 0.10, max: 0.30 }, typical: 0.20 },
  { category: 'pavement_asphalt', description: 'Pavement - Asphalt', cRange: { min: 0.70, max: 0.95 }, typical: 0.85 },
  { category: 'pavement_concrete', description: 'Pavement - Concrete', cRange: { min: 0.80, max: 0.95 }, typical: 0.90 },
  { category: 'pavement_brick', description: 'Pavement - Brick', cRange: { min: 0.70, max: 0.85 }, typical: 0.78 },
  { category: 'roofs', description: 'Roofs', cRange: { min: 0.75, max: 0.95 }, typical: 0.88 },
  { category: 'lawns_sandy_flat', description: 'Lawns - Sandy soil, flat (2%)', cRange: { min: 0.05, max: 0.10 }, typical: 0.08 },
  { category: 'lawns_sandy_avg', description: 'Lawns - Sandy soil, average (2-7%)', cRange: { min: 0.10, max: 0.15 }, typical: 0.12 },
  { category: 'lawns_sandy_steep', description: 'Lawns - Sandy soil, steep (7%+)', cRange: { min: 0.15, max: 0.20 }, typical: 0.18 },
  { category: 'lawns_clay_flat', description: 'Lawns - Clay soil, flat (2%)', cRange: { min: 0.13, max: 0.17 }, typical: 0.15 },
  { category: 'lawns_clay_avg', description: 'Lawns - Clay soil, average (2-7%)', cRange: { min: 0.18, max: 0.22 }, typical: 0.20 },
  { category: 'lawns_clay_steep', description: 'Lawns - Clay soil, steep (7%+)', cRange: { min: 0.25, max: 0.35 }, typical: 0.30 },
];

const RationalMethodCalculator: React.FC = () => {
  const [runoffCoeff, setRunoffCoeff] = useState<number>(0.5);
  const [intensity, setIntensity] = useState<number>(2.5);
  const [area, setArea] = useState<number>(50);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const coeff = runoffCoefficients.find(c => c.category === category);
    if (coeff) {
      setRunoffCoeff(coeff.typical);
    }
  };

  const peakDischarge = useMemo(() => {
    // Q = C * i * A
    // Q in cfs, i in in/hr, A in acres
    // (Factor of 1.008 is approximately 1, often omitted)
    return runoffCoeff * intensity * area;
  }, [runoffCoeff, intensity, area]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5" />
          Rational Method Peak Discharge Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Calculate peak discharge using the Rational Method (Q = CIA). Best for small watersheds (&lt;200 acres) with Tc &lt; 20 minutes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Land Use Category (optional)</Label>
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select to auto-fill C..." />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {runoffCoefficients.map((coeff) => (
                    <SelectItem key={coeff.category} value={coeff.category}>
                      {coeff.description} (C = {coeff.typical})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="rational-c">Runoff Coefficient (C)</Label>
              <Input
                id="rational-c"
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={runoffCoeff}
                onChange={(e) => setRunoffCoeff(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Range: 0.0 - 1.0 (dimensionless)</p>
            </div>

            <div>
              <Label htmlFor="rational-i">Rainfall Intensity, i (in/hr)</Label>
              <Input
                id="rational-i"
                type="number"
                min="0"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use intensity for duration = Tc from IDF curves
              </p>
            </div>

            <div>
              <Label htmlFor="rational-a">Drainage Area, A (acres)</Label>
              <Input
                id="rational-a"
                type="number"
                min="0"
                step="1"
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: &lt;200 acres for Rational Method
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Peak Discharge (Q)</p>
                  <p className="text-3xl font-bold text-primary">
                    {peakDischarge.toFixed(2)} cfs
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({(peakDischarge * 0.0283168).toFixed(3)} m³/s)
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Input Summary</h4>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="bg-muted/50 p-2 rounded flex justify-between">
                  <span className="text-muted-foreground">C (runoff coeff):</span>
                  <span className="font-medium">{runoffCoeff.toFixed(2)}</span>
                </div>
                <div className="bg-muted/50 p-2 rounded flex justify-between">
                  <span className="text-muted-foreground">i (intensity):</span>
                  <span className="font-medium">{intensity.toFixed(2)} in/hr</span>
                </div>
                <div className="bg-muted/50 p-2 rounded flex justify-between">
                  <span className="text-muted-foreground">A (area):</span>
                  <span className="font-medium">{area.toFixed(1)} acres</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2">Rational Method Equation</h4>
          <div className="text-sm space-y-1 font-mono">
            <p>Q = C × i × A</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Where Q = peak discharge (cfs), C = runoff coefficient, i = rainfall intensity (in/hr), A = drainage area (acres)
          </p>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-3">Runoff Coefficient Reference</h4>
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Land Use</TableHead>
                  <TableHead>C Range</TableHead>
                  <TableHead>Typical</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runoffCoefficients.slice(0, 12).map((coeff) => (
                  <TableRow key={coeff.category}>
                    <TableCell className="text-sm">{coeff.description}</TableCell>
                    <TableCell>{coeff.cRange.min.toFixed(2)} - {coeff.cRange.max.toFixed(2)}</TableCell>
                    <TableCell className="font-medium">{coeff.typical.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RationalMethodCalculator;
