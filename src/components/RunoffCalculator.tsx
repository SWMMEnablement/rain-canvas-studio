import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Droplets, Calculator, Link } from 'lucide-react';

interface RunoffCalculatorProps {
  linkedCN?: number | null;
  linkedArea?: number;
}

const RunoffCalculator: React.FC<RunoffCalculatorProps> = ({ linkedCN, linkedArea }) => {
  const [curveNumber, setCurveNumber] = useState<number>(75);
  const [rainfall, setRainfall] = useState<number>(4);
  const [area, setArea] = useState<number>(100);
  const [iaRatio, setIaRatio] = useState<'0.2' | '0.05'>('0.2');
  const [units, setUnits] = useState<'us' | 'metric'>('us');

  // Update values when linked values change
  useEffect(() => {
    if (linkedCN !== null && linkedCN !== undefined) {
      setCurveNumber(Math.round(linkedCN * 10) / 10);
    }
  }, [linkedCN]);

  useEffect(() => {
    if (linkedArea && linkedArea > 0) {
      setArea(linkedArea);
    }
  }, [linkedArea]);

  const calculations = useMemo(() => {
    if (curveNumber <= 0 || curveNumber > 100 || rainfall <= 0) {
      return null;
    }

    const iaCoeff = parseFloat(iaRatio);
    
    const S = units === 'us' 
      ? (1000 / curveNumber) - 10 
      : (25400 / curveNumber) - 254;

    const Ia = iaCoeff * S;

    let Q = 0;
    if (rainfall > Ia) {
      Q = Math.pow(rainfall - Ia, 2) / (rainfall - Ia + S);
    }

    const runoffCoeff = rainfall > 0 ? Q / rainfall : 0;

    let volumeAcreFt = 0;
    let volumeCuFt = 0;
    let volumeCuM = 0;

    if (units === 'us') {
      volumeAcreFt = (Q / 12) * area;
      volumeCuFt = volumeAcreFt * 43560;
    } else {
      volumeCuM = (Q / 1000) * area * 10000;
    }

    return {
      S,
      Ia,
      Q,
      runoffCoeff,
      volumeAcreFt,
      volumeCuFt,
      volumeCuM,
      infiltration: rainfall - Q,
    };
  }, [curveNumber, rainfall, area, iaRatio, units]);

  const depthUnit = units === 'us' ? 'in' : 'mm';
  const areaUnit = units === 'us' ? 'acres' : 'hectares';
  const isLinked = linkedCN !== null && linkedCN !== undefined;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          SCS Runoff Volume Calculator
          {isLinked && (
            <Badge variant="secondary" className="ml-2 flex items-center gap-1">
              <Link className="h-3 w-3" />
              Linked to CN Calculator
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Calculate runoff depth and volume using the NRCS/SCS Curve Number method.
          {isLinked && ' CN and area values are automatically populated from the calculator above.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Unit System</Label>
              <RadioGroup
                value={units}
                onValueChange={(v) => setUnits(v as 'us' | 'metric')}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="us" id="runoff-units-us" />
                  <Label htmlFor="runoff-units-us" className="font-normal">US Customary</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="metric" id="runoff-units-metric" />
                  <Label htmlFor="runoff-units-metric" className="font-normal">Metric</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="runoff-cn" className="flex items-center gap-2">
                Curve Number (CN)
                {isLinked && <Badge variant="outline" className="text-xs">Auto</Badge>}
              </Label>
              <Input
                id="runoff-cn"
                type="number"
                min="1"
                max="100"
                value={curveNumber}
                onChange={(e) => setCurveNumber(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Range: 1-100</p>
            </div>

            <div>
              <Label htmlFor="runoff-rainfall">Rainfall Depth ({depthUnit})</Label>
              <Input
                id="runoff-rainfall"
                type="number"
                min="0"
                step="0.1"
                value={rainfall}
                onChange={(e) => setRainfall(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="runoff-area" className="flex items-center gap-2">
                Watershed Area ({areaUnit})
                {isLinked && linkedArea && linkedArea > 0 && <Badge variant="outline" className="text-xs">Auto</Badge>}
              </Label>
              <Input
                id="runoff-area"
                type="number"
                min="0"
                step="1"
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Initial Abstraction Ratio (Ia/S)</Label>
              <RadioGroup
                value={iaRatio}
                onValueChange={(v) => setIaRatio(v as '0.2' | '0.05')}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0.2" id="runoff-ia-02" />
                  <Label htmlFor="runoff-ia-02" className="font-normal">0.20 (Traditional)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0.05" id="runoff-ia-005" />
                  <Label htmlFor="runoff-ia-005" className="font-normal">0.05 (Updated)</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground mt-1">
                0.05 ratio recommended for urban areas per recent NRCS guidance
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {calculations ? (
              <>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Runoff Depth</p>
                        <p className="text-2xl font-bold text-primary">
                          {calculations.Q.toFixed(2)} {depthUnit}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Runoff Coefficient</p>
                        <p className="text-2xl font-bold">
                          {(calculations.runoffCoeff * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Intermediate Values</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground">S (max retention):</span>
                      <span className="float-right font-medium">{calculations.S.toFixed(2)} {depthUnit}</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground">Ia (initial abs.):</span>
                      <span className="float-right font-medium">{calculations.Ia.toFixed(2)} {depthUnit}</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground">Infiltration:</span>
                      <span className="float-right font-medium">{calculations.infiltration.toFixed(2)} {depthUnit}</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground">Rainfall:</span>
                      <span className="float-right font-medium">{rainfall.toFixed(2)} {depthUnit}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Runoff Volume</h4>
                  {units === 'us' ? (
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="bg-muted/50 p-2 rounded">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="float-right font-medium">{calculations.volumeAcreFt.toFixed(2)} acre-ft</span>
                      </div>
                      <div className="bg-muted/50 p-2 rounded">
                        <span className="text-muted-foreground">Volume:</span>
                        <span className="float-right font-medium">{calculations.volumeCuFt.toLocaleString()} ft³</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/50 p-2 rounded text-sm">
                      <span className="text-muted-foreground">Volume:</span>
                      <span className="float-right font-medium">{calculations.volumeCuM.toLocaleString()} m³</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <Calculator className="h-8 w-8 mr-2" />
                Enter valid inputs to see results
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold mb-2">SCS Runoff Equation</h4>
          <div className="text-sm space-y-1 font-mono">
            <p>Q = (P - Ia)² / (P - Ia + S)  when P &gt; Ia</p>
            <p>S = (1000/CN) - 10  {units === 'metric' && '(or (25400/CN) - 254 for mm)'}</p>
            <p>Ia = λ × S  where λ = {iaRatio}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Where Q = runoff depth, P = rainfall, Ia = initial abstraction, S = potential maximum retention
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RunoffCalculator;
