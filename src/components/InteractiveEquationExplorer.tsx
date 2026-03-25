import { useState, useMemo, useEffect, useRef } from "react";
import type katexType from "katex";
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

interface LatexInlineProps {
  latex: string;
  className?: string;
}

function LatexInline({ latex, className = "" }: LatexInlineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && latex) {
      try {
        katex.render(latex, containerRef.current, {
          throwOnError: false,
          displayMode: false,
          trust: true,
          strict: false
        });
      } catch (err) {
        console.error("KaTeX render error:", err);
        containerRef.current.innerHTML = `<span class="text-destructive text-sm">${latex}</span>`;
      }
    }
  }, [latex]);

  return <span ref={containerRef} className={className} />;
}

// Computation functions for different pattern types
const computePatternValues = (
  pattern: PatternType,
  t: number, // dimensionless time (0-1)
  P: number, // total depth
  D: number  // duration in hours
): { 
  F?: number; 
  i?: number; 
  incrementalDepth?: number;
  cumulativeDepth?: number;
  description: string;
} => {
  switch (pattern) {
    case 'block': {
      const i = P / D;
      return {
        i,
        cumulativeDepth: t * P,
        description: `Constant intensity throughout duration`
      };
    }

    case 'triangular': {
      const tp = 0.33; // time to peak as fraction
      const iPeak = (2 * P) / D;
      let i: number;
      if (t <= tp) {
        i = iPeak * (t / tp);
      } else {
        i = iPeak * ((1 - t) / (1 - tp));
      }
      // Cumulative depth calculation
      let F: number;
      if (t <= tp) {
        F = (t * t) / (2 * tp);
      } else {
        F = tp / 2 + (t - tp) - ((t - tp) * (t - tp)) / (2 * (1 - tp));
      }
      return {
        i,
        F,
        cumulativeDepth: F * P,
        description: t <= tp ? 'Rising limb (before peak)' : 'Falling limb (after peak)'
      };
    }

    case 'trapezoidal': {
      const t1 = 0.25;
      const t2 = 0.6;
      const denominator = t1 / 2 + (t2 - t1) + (1 - t2) / 2;
      const iPeak = P / (D * denominator);
      let i: number;
      if (t <= t1) {
        i = iPeak * (t / t1);
      } else if (t <= t2) {
        i = iPeak;
      } else {
        i = iPeak * ((1 - t) / (1 - t2));
      }
      return {
        i,
        description: t <= t1 ? 'Rising limb' : t <= t2 ? 'Sustained peak' : 'Falling limb'
      };
    }

    case 'scs1': {
      let F: number;
      if (t <= 0.4) {
        F = 0.50 * Math.pow(t / 0.4, 0.8);
      } else if (t <= 0.6) {
        F = 0.50 + 0.35 * ((t - 0.4) / 0.2);
      } else {
        F = 0.85 + 0.15 * ((t - 0.6) / 0.4);
      }
      return {
        F,
        cumulativeDepth: F * P,
        description: t <= 0.4 ? 'Pre-peak accumulation' : t <= 0.6 ? 'Peak period' : 'Recession'
      };
    }

    case 'scs1a': {
      let F: number;
      if (t <= 0.35) {
        F = 0.55 * Math.pow(t / 0.35, 0.75);
      } else if (t <= 0.55) {
        F = 0.55 + 0.30 * ((t - 0.35) / 0.2);
      } else {
        F = 0.85 + 0.15 * ((t - 0.55) / 0.45);
      }
      return {
        F,
        cumulativeDepth: F * P,
        description: t <= 0.35 ? 'Early peak accumulation' : t <= 0.55 ? 'Peak period' : 'Recession'
      };
    }

    case 'scs2': {
      let F: number;
      if (t <= 0.5) {
        F = 0.35 * Math.pow(t / 0.5, 0.9);
      } else if (t <= 0.6) {
        F = 0.35 + 0.45 * ((t - 0.5) / 0.1);
      } else {
        F = 0.80 + 0.20 * ((t - 0.6) / 0.4);
      }
      const avgIntensity = P / D;
      const peakRatio = 4.8;
      return {
        F,
        cumulativeDepth: F * P,
        i: t > 0.5 && t <= 0.6 ? avgIntensity * peakRatio : avgIntensity * F * 2,
        description: t <= 0.5 ? 'Pre-peak buildup' : t <= 0.6 ? 'Peak intensity zone' : 'Post-peak recession'
      };
    }

    case 'scs3': {
      let F: number;
      if (t <= 0.5) {
        F = 0.25 * (t / 0.5);
      } else if (t <= 0.58) {
        F = 0.25 + 0.50 * ((t - 0.5) / 0.08);
      } else {
        F = 0.75 + 0.25 * ((t - 0.58) / 0.42);
      }
      return {
        F,
        cumulativeDepth: F * P,
        description: t <= 0.5 ? 'Slow buildup' : t <= 0.58 ? 'Sharp peak burst' : 'Gradual recession'
      };
    }

    case 'huff1': {
      let F: number;
      if (t <= 0.25) {
        F = 0.65 * Math.pow(t / 0.25, 0.7);
      } else if (t <= 0.50) {
        F = 0.65 + 0.20 * ((t - 0.25) / 0.25);
      } else if (t <= 0.75) {
        F = 0.85 + 0.10 * ((t - 0.50) / 0.25);
      } else {
        F = 0.95 + 0.05 * ((t - 0.75) / 0.25);
      }
      return {
        F,
        cumulativeDepth: F * P,
        description: t <= 0.25 ? '1st Quartile (65% of rain)' : `Quartile ${Math.ceil(t * 4)}`
      };
    }

    case 'huff2': {
      let F: number;
      if (t <= 0.25) {
        F = 0.20 * (t / 0.25);
      } else if (t <= 0.50) {
        F = 0.20 + 0.50 * Math.pow((t - 0.25) / 0.25, 0.7);
      } else if (t <= 0.75) {
        F = 0.70 + 0.20 * ((t - 0.50) / 0.25);
      } else {
        F = 0.90 + 0.10 * ((t - 0.75) / 0.25);
      }
      return {
        F,
        cumulativeDepth: F * P,
        description: t <= 0.25 ? '1st Quartile' : t <= 0.50 ? '2nd Quartile (peak)' : `Quartile ${Math.ceil(t * 4)}`
      };
    }

    case 'huff3': {
      let F: number;
      if (t <= 0.25) {
        F = 0.15 * (t / 0.25);
      } else if (t <= 0.50) {
        F = 0.15 + 0.20 * ((t - 0.25) / 0.25);
      } else if (t <= 0.75) {
        F = 0.35 + 0.45 * Math.pow((t - 0.50) / 0.25, 0.7);
      } else {
        F = 0.80 + 0.20 * ((t - 0.75) / 0.25);
      }
      return {
        F,
        cumulativeDepth: F * P,
        description: t <= 0.50 ? 'Pre-peak quartiles' : t <= 0.75 ? '3rd Quartile (peak)' : '4th Quartile'
      };
    }

    case 'huff4': {
      let F: number;
      if (t <= 0.25) {
        F = 0.10 * (t / 0.25);
      } else if (t <= 0.50) {
        F = 0.10 + 0.15 * ((t - 0.25) / 0.25);
      } else if (t <= 0.75) {
        F = 0.25 + 0.15 * ((t - 0.50) / 0.25);
      } else {
        F = 0.40 + 0.60 * Math.pow((t - 0.75) / 0.25, 0.7);
      }
      return {
        F,
        cumulativeDepth: F * P,
        description: t <= 0.75 ? 'Slow buildup phase' : '4th Quartile (60% of rain)'
      };
    }

    case 'chicago': {
      // Simplified Chicago storm with r=0.4
      const r = 0.4;
      const tp = r; // peak at 40% of duration
      const a = 100; // IDF coefficient
      const b = 10;
      const c = 0.75;
      
      let i: number;
      if (t <= tp) {
        const tb = tp - t;
        i = (a * ((1 - c) * (tb / r) + b)) / Math.pow((tb / r) + b, 1 + c);
      } else {
        const ta = t - tp;
        i = (a * ((1 - c) * (ta / (1 - r)) + b)) / Math.pow((ta / (1 - r)) + b, 1 + c);
      }
      
      return {
        i: i * P / 100, // Scale by depth
        description: t <= tp ? 'Before peak (rising)' : 'After peak (falling)'
      };
    }

    case 'double': {
      const mu1 = 0.3;
      const mu2 = 0.7;
      const sigma = 0.08;
      const A1 = 2.5;
      const A2 = 2.0;
      
      const peak1 = A1 * Math.exp(-Math.pow((t - mu1) / sigma, 2));
      const peak2 = A2 * Math.exp(-Math.pow((t - mu2) / sigma, 2));
      const combined = peak1 + peak2;
      
      return {
        i: combined * P / D / 2, // Approximate scaling
        description: t < 0.5 ? `First peak zone (t=${mu1})` : `Second peak zone (t=${mu2})`
      };
    }

    default:
      return {
        description: 'Computation not available for this pattern'
      };
  }
};

interface InteractiveEquationExplorerProps {
  pattern: PatternType;
  totalDepth?: number;
  duration?: number;
}

export function InteractiveEquationExplorer({
  pattern,
  totalDepth = 2.0,
  duration = 6.0
}: InteractiveEquationExplorerProps) {
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
    return computePatternValues(pattern, t, P, D);
  }, [pattern, t, P, D]);

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
                <span className="text-xs text-muted-foreground">in</span>
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
                  <span className="text-xs text-muted-foreground ml-1">in/hr</span>
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
                  <span className="text-xs text-muted-foreground ml-1">in</span>
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
        </div>
      </CardContent>
    </Card>
  );
}
