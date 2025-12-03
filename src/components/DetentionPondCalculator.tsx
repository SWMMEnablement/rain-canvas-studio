import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Container, Calculator, Info } from 'lucide-react';

interface DetentionPondCalculatorProps {
  linkedRunoffVolume?: number;
}

const DetentionPondCalculator: React.FC<DetentionPondCalculatorProps> = ({ linkedRunoffVolume }) => {
  const [preDevRunoff, setPreDevRunoff] = useState<number>(0.5);
  const [postDevRunoff, setPostDevRunoff] = useState<number>(2.0);
  const [area, setArea] = useState<number>(10);
  const [avgDepth, setAvgDepth] = useState<number>(4);
  const [method, setMethod] = useState<'simple' | 'modified'>('simple');
  const [safetyFactor, setSafetyFactor] = useState<number>(1.1);

  // Update post-dev runoff when linked value changes
  React.useEffect(() => {
    if (linkedRunoffVolume && linkedRunoffVolume > 0) {
      setPostDevRunoff(linkedRunoffVolume);
    }
  }, [linkedRunoffVolume]);

  const calculations = useMemo(() => {
    if (area <= 0 || postDevRunoff < 0 || preDevRunoff < 0) {
      return null;
    }

    // Required storage = (Post-dev runoff - Pre-dev runoff) × Area
    // Simple method: Direct volume difference
    // Modified method: Accounts for release rate timing
    
    const preDevVolume = preDevRunoff * area; // acre-inches
    const postDevVolume = postDevRunoff * area; // acre-inches
    
    let requiredStorageAcreIn = postDevVolume - preDevVolume;
    if (requiredStorageAcreIn < 0) requiredStorageAcreIn = 0;

    // Apply safety factor
    const designStorageAcreIn = requiredStorageAcreIn * safetyFactor;

    // Convert to other units
    const designStorageAcreFt = designStorageAcreIn / 12;
    const designStorageCuFt = designStorageAcreFt * 43560;
    const designStorageCuM = designStorageCuFt * 0.0283168;

    // Estimate pond surface area needed at given average depth
    // Surface Area = Volume / Depth
    const pondSurfaceAcres = designStorageAcreFt / (avgDepth);
    const pondSurfaceSqFt = pondSurfaceAcres * 43560;

    // Estimate dimensions for rectangular pond (2:1 length to width ratio)
    const pondWidth = Math.sqrt(pondSurfaceSqFt / 2);
    const pondLength = pondWidth * 2;

    return {
      preDevVolume,
      postDevVolume,
      requiredStorageAcreIn,
      designStorageAcreIn,
      designStorageAcreFt,
      designStorageCuFt,
      designStorageCuM,
      pondSurfaceAcres,
      pondSurfaceSqFt,
      pondWidth,
      pondLength,
    };
  }, [preDevRunoff, postDevRunoff, area, avgDepth, safetyFactor]);

  const isLinked = linkedRunoffVolume !== undefined && linkedRunoffVolume > 0;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Container className="h-5 w-5" />
          Detention Pond Sizing Calculator
          {isLinked && (
            <Badge variant="secondary" className="ml-2">
              Linked to Runoff Calculator
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Estimate required detention storage volume using the simple storage method. 
          {isLinked && ' Post-development runoff depth is automatically populated from the calculator above.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="det-pre-runoff">Pre-Development Runoff Depth (in)</Label>
              <Input
                id="det-pre-runoff"
                type="number"
                min="0"
                step="0.1"
                value={preDevRunoff}
                onChange={(e) => setPreDevRunoff(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Runoff from undeveloped or existing conditions
              </p>
            </div>

            <div>
              <Label htmlFor="det-post-runoff" className="flex items-center gap-2">
                Post-Development Runoff Depth (in)
                {isLinked && <Badge variant="outline" className="text-xs">Auto</Badge>}
              </Label>
              <Input
                id="det-post-runoff"
                type="number"
                min="0"
                step="0.1"
                value={postDevRunoff}
                onChange={(e) => setPostDevRunoff(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Runoff from developed conditions (from SCS method)
              </p>
            </div>

            <div>
              <Label htmlFor="det-area">Drainage Area (acres)</Label>
              <Input
                id="det-area"
                type="number"
                min="0"
                step="1"
                value={area}
                onChange={(e) => setArea(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="det-depth">Average Pond Depth (ft)</Label>
              <Input
                id="det-depth"
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={avgDepth}
                onChange={(e) => setAvgDepth(parseFloat(e.target.value) || 0)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Typical range: 3-6 ft for detention ponds
              </p>
            </div>

            <div>
              <Label htmlFor="det-safety">Safety Factor</Label>
              <Input
                id="det-safety"
                type="number"
                min="1"
                max="2"
                step="0.05"
                value={safetyFactor}
                onChange={(e) => setSafetyFactor(parseFloat(e.target.value) || 1)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Typically 1.1-1.25 to account for sediment and freeboard
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {calculations ? (
              <>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Required Storage Volume</p>
                      <p className="text-3xl font-bold text-primary">
                        {calculations.designStorageAcreFt.toFixed(2)} acre-ft
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ({calculations.designStorageCuFt.toLocaleString()} ft³)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Volume Breakdown</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="bg-muted/50 p-2 rounded flex justify-between">
                      <span className="text-muted-foreground">Pre-dev volume:</span>
                      <span className="font-medium">{calculations.preDevVolume.toFixed(2)} acre-in</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded flex justify-between">
                      <span className="text-muted-foreground">Post-dev volume:</span>
                      <span className="font-medium">{calculations.postDevVolume.toFixed(2)} acre-in</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded flex justify-between">
                      <span className="text-muted-foreground">Net increase:</span>
                      <span className="font-medium">{calculations.requiredStorageAcreIn.toFixed(2)} acre-in</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded flex justify-between">
                      <span className="text-muted-foreground">With safety factor:</span>
                      <span className="font-medium">{calculations.designStorageAcreIn.toFixed(2)} acre-in</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Estimated Pond Dimensions</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="bg-muted/50 p-2 rounded flex justify-between">
                      <span className="text-muted-foreground">Surface area:</span>
                      <span className="font-medium">{calculations.pondSurfaceSqFt.toLocaleString()} ft²</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded flex justify-between">
                      <span className="text-muted-foreground">Surface area:</span>
                      <span className="font-medium">{calculations.pondSurfaceAcres.toFixed(3)} acres</span>
                    </div>
                    <div className="bg-muted/50 p-2 rounded flex justify-between">
                      <span className="text-muted-foreground">Est. dimensions (2:1):</span>
                      <span className="font-medium">{calculations.pondLength.toFixed(0)} × {calculations.pondWidth.toFixed(0)} ft</span>
                    </div>
                  </div>
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
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Simple Storage Method
          </h4>
          <div className="text-sm space-y-1 font-mono">
            <p>V<sub>s</sub> = (Q<sub>post</sub> - Q<sub>pre</sub>) × A × SF</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Where V<sub>s</sub> = storage volume, Q = runoff depth, A = drainage area, SF = safety factor
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            <strong>Note:</strong> This is a simplified estimate. Detailed pond design requires routing analysis, 
            outlet structure sizing, and consideration of multiple storm frequencies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetentionPondCalculator;
