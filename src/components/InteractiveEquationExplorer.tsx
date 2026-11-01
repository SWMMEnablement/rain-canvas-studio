import { useState, useMemo, useEffect, useRef } from "react";

import { Calculator, Play, RotateCcw, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type PatternType } from "@/lib/rainfallPatterns";
import { getPatternEquation } from "@/lib/patternEquations";
import { explorerValues, type ExplorerValues } from "@/lib/equationExplorer";
import { type UnitSystem } from "@/lib/unitConversions";

interface LatexInlineProps {
  latex: string;
  className?: string;
}

function LatexInline({ latex, className = "" }: LatexInlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && latex) {
      (async () => {
        try {
          const [katexModule] = await Promise.all([
            import("katex"),
            import("katex/dist/katex.min.css"),
          ]);
          const katex = katexModule.default;
          katex.render(latex, containerRef.current!, {
            throwOnError: false,
            displayMode: false,
            trust: true,
            strict: false
          });
        } catch (err) {
          console.error("KaTeX render error:", err);
          if (containerRef.current) {
            containerRef.current.innerHTML = `<span class="text-destructive text-sm">${latex}</span>`;
          }
        }
      })();
    }
  }, [latex]);

  return <span ref={containerRef} className={className} />;
}

// Plain-language phase of the storm at dimensionless time t. Numbers come from the storm calculator.
const describePhase = (pattern: PatternType, t: number): string => {
  switch (pattern) {
    case 'block': return 'Constant intensity throughout duration';
    case 'triangular': return t <= 0.33 ? 'Rising limb (before peak)' : 'Falling limb (after peak)';
    case 'trapezoidal': return t <= 0.25 ? 'Rising limb' : t <= 0.6 ? 'Sustained peak' : 'Falling limb';
    case 'scs1': return t < 9.5 / 24 ? 'Pre-peak accumulation' : t <= 10 / 24 ? 'Peak period' : 'Recession';
    case 'scs1a': return t < 7.5 / 24 ? 'Early accumulation' : t <= 8 / 24 ? 'Peak period' : 'Recession';
    case 'scs2': return t < 11.5 / 24 ? 'Pre-peak buildup' : t <= 12 / 24 ? 'Peak intensity zone' : 'Post-peak recession';
    case 'scs3': return t < 11.5 / 24 ? 'Slow buildup' : t <= 12.5 / 24 ? 'Sharp peak burst' : 'Gradual recession';
    case 'huff1': case 'huff2': case 'huff3': case 'huff4': return `Quartile ${Math.min(4, Math.max(1, Math.ceil(t * 4)))}`;
    case 'double': return t < 0.5 ? 'First peak zone' : 'Second peak zone';
    default: return t < 0.5 ? 'First half of the storm' : 'Second half of the storm';
  }
};

interface InteractiveEquationExplorerProps {
  pattern: PatternType;
  totalDepth?: number;
  duration?: number;
  /** Wizard time step in minutes; the explorer uses the same intervals as the generated storm. */
  timeStep?: number;
  unitSystem?: UnitSystem;
}

export function InteractiveEquationExplorer({
  pattern,
  totalDepth = 2.0,
  duration = 6.0,
  timeStep = 15,
  unitSystem = 'USA'
}: InteractiveEquationExplorerProps) {
  const depthUnit = unitSystem === 'SI' ? 'mm' : 'in';
  const equation = getPatternEquation(pattern);
  
  // Input states
  const [t, setT] = useState(0.5); // dimensionless time (0-1)
  const [P, setP] = useState(totalDepth);
  const [D, setD] = useState(duration);

  // Sync with parent props
  useEffect(() => {
    setP(totalDepth);
    setD(duration);
  }, [totalDepth, duration]);

  // Compute results
  const results = useMemo(() => {
    const v = explorerValues(pattern, t, P, D, timeStep);
    return { ...(v ?? {}), description: describePhase(pattern, t) } as Partial<ExplorerValues> & { description: string };
  }, [pattern, t, P, D, timeStep]);

  // Compute actual time in hours/minutes
  const actualTime = useMemo(() => {
    const hours = t * D;
    const totalMinutes = hours * 60;
    const hrs = Math.floor(hours);
    const mins = Math.round((hours - hrs) * 60);
    return { hours, totalMinutes, formatted: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m` };
  }, [t, D]);

  const handleReset = () => {
    setT(0.5);
    setP(totalDepth);
    setD(duration);
  };

  if (!equation) {
    return null;
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Interactive Equation Explorer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Input Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground">Input Variables</h4>
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs gap-1">
              <RotateCcw className="w-3 h-3" />
              Reset
            </Button>
          </div>

          {/* Time slider - primary input */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <Label className="text-sm flex items-center gap-2">
                <LatexInline latex="t" /> — Time Position
              </Label>
              <Badge variant="outline" className="font-mono">
                {actualTime.formatted}
              </Badge>
            </div>
            <Slider
              value={[t]}
              onValueChange={([value]) => setT(value)}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Start (0%)</span>
              <span className="font-mono">t = {t.toFixed(2)}</span>
              <span>End (100%)</span>
            </div>
          </div>

          {/* Depth and Duration inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <LatexInline latex="P" /> — Total Depth
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={P}
                  onChange={(e) => setP(parseFloat(e.target.value) || 0)}
                  step={0.1}
                  min={0}
                  className="font-mono"
                />
                <span className="text-xs text-muted-foreground">{depthUnit}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-2">
                <LatexInline latex="D" /> — Duration
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={D}
                  onChange={(e) => setD(parseFloat(e.target.value) || 1)}
                  step={0.5}
                  min={0.5}
                  className="font-mono"
                />
                <span className="text-xs text-muted-foreground">hr</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Results Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-medium">Computed Results</h4>
          </div>

          <div className="grid gap-3">
            {/* Current phase description */}
            <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm">{results.description}</p>
            </div>

            {/* Cumulative fraction F(t) */}
            {results.F !== undefined && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <LatexInline latex="F(t)" />
                  <span className="text-sm text-muted-foreground">Cumulative Fraction</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-primary text-lg">
                    {(results.F * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            {/* Intensity i(t) */}
            {results.i !== undefined && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <LatexInline latex="i(t)" />
                  <span className="text-sm text-muted-foreground">Intensity</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-primary text-lg">
                    {results.i.toFixed(3)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">{depthUnit}/hr</span>
                </div>
              </div>
            )}

            {/* Cumulative depth */}
            {results.cumulativeDepth !== undefined && (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <LatexInline latex="P(t) = F(t) \\cdot P" />
                  <span className="text-sm text-muted-foreground">Cumulative Depth</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-semibold text-primary text-lg">
                    {results.cumulativeDepth.toFixed(3)}
                  </span>
                  <span className="text-xs text-muted-foreground ml-1">{depthUnit}</span>
                </div>
              </div>
            )}

            {/* Time conversion */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-dashed">
              <div className="flex items-center gap-2">
                <LatexInline latex="t_{actual} = t \\cdot D" />
                <span className="text-sm text-muted-foreground">Actual Time</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-semibold">
                  {actualTime.hours.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground ml-1">hr</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({actualTime.totalMinutes.toFixed(0)} min)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick reference */}
        <div className="pt-2">
          <p className="text-xs text-muted-foreground text-center">
            Drag the time slider to see how values change through the storm duration
          </p>
          {results.intervals !== undefined && (
            <p className="text-xs text-muted-foreground text-center mt-1">
              Values come from the storm calculator ({results.intervals} intervals of {results.stepMin?.toFixed(results.stepMin % 1 ? 2 : 0)} min), so they match the generated hyetograph and exports. Intensity is the average for the interval containing t.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
