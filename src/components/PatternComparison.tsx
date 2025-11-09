import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useRef } from "react";
import { Download, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";
import { calculatePatternStatistics, type PatternStatistics } from "@/lib/patternStatistics";
import { toast } from "sonner";

interface ComparisonPattern {
  id: PatternType;
  name: string;
  color: string;
  category: string;
}

const comparisonPatterns: ComparisonPattern[] = [
  // SCS Patterns
  { id: 'scs1a', name: 'SCS Type IA', color: '#3b82f6', category: 'SCS' },
  { id: 'scs1', name: 'SCS Type I', color: '#06b6d4', category: 'SCS' },
  { id: 'scs2', name: 'SCS Type II', color: '#10b981', category: 'SCS' },
  { id: 'scs3', name: 'SCS Type III', color: '#f97316', category: 'SCS' },
  // Huff Patterns
  { id: 'huff1', name: 'Huff 1st Quartile', color: '#8b5cf6', category: 'Huff' },
  { id: 'huff2', name: 'Huff 2nd Quartile', color: '#ec4899', category: 'Huff' },
  { id: 'huff3', name: 'Huff 3rd Quartile', color: '#f43f5e', category: 'Huff' },
  { id: 'huff4', name: 'Huff 4th Quartile', color: '#ef4444', category: 'Huff' },
  // Chicago
  { id: 'chicago', name: 'Chicago Storm', color: '#14b8a6', category: 'Other' },
  // International
  { id: 'desbordes', name: 'Desbordes', color: '#6366f1', category: 'International' },
  { id: 'arr', name: 'Australian ARR', color: '#a855f7', category: 'International' },
  { id: 'dwa', name: 'German DWA', color: '#84cc16', category: 'International' },
];

interface PresetGroup {
  name: string;
  patterns: PatternType[];
  description: string;
}

const presetGroups: PresetGroup[] = [
  {
    name: 'All SCS',
    patterns: ['scs1a', 'scs1', 'scs2', 'scs3'],
    description: 'Compare all NRCS (SCS) patterns',
  },
  {
    name: 'All Huff',
    patterns: ['huff1', 'huff2', 'huff3', 'huff4'],
    description: 'Compare all Huff quartiles',
  },
  {
    name: 'International',
    patterns: ['chicago', 'desbordes', 'arr', 'dwa'],
    description: 'Compare international patterns',
  },
  {
    name: 'US Standard',
    patterns: ['scs2', 'chicago', 'huff2'],
    description: 'Common US design storms',
  },
];

export function PatternComparison() {
  const [selectedPatterns, setSelectedPatterns] = useState<PatternType[]>([
    'scs1a',
    'scs1',
    'scs2',
    'scs3',
  ]);
  const chartRef = useRef<HTMLDivElement>(null);

  // Fixed parameters for comparison
  const totalDepth = 2.0;
  const duration = 6.0;
  const timeStep = 15;

  const chartData = useMemo(() => {
    const numSteps = Math.ceil((duration * 60) / timeStep);
    const data: any[] = [];

    for (let i = 0; i < numSteps; i++) {
      const time = ((i * timeStep) / 60).toFixed(1);
      const point: any = { time };

      selectedPatterns.forEach((patternId) => {
        const intensities = generateRainfallData(patternId, totalDepth, duration, timeStep);
        const pattern = comparisonPatterns.find((p) => p.id === patternId);
        if (pattern) {
          point[pattern.name] = intensities[i];
        }
      });

      data.push(point);
    }

    return data;
  }, [selectedPatterns, totalDepth, duration, timeStep]);

  // Calculate statistics for each selected pattern
  const patternStats = useMemo(() => {
    const stats: Record<string, PatternStatistics> = {};
    
    selectedPatterns.forEach((patternId) => {
      const intensities = generateRainfallData(patternId, totalDepth, duration, timeStep);
      const pattern = comparisonPatterns.find((p) => p.id === patternId);
      if (pattern) {
        stats[pattern.name] = calculatePatternStatistics(intensities, timeStep);
      }
    });
    
    return stats;
  }, [selectedPatterns, totalDepth, duration, timeStep]);

  const togglePattern = (patternId: PatternType) => {
    setSelectedPatterns((prev) =>
      prev.includes(patternId)
        ? prev.filter((id) => id !== patternId)
        : [...prev, patternId]
    );
  };

  const loadPreset = (preset: PresetGroup) => {
    setSelectedPatterns(preset.patterns);
    toast.success(`Loaded preset: ${preset.name}`);
  };

  const exportChartAsPNG = async () => {
    if (!chartRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = 'rainfall-pattern-comparison.png';
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Chart exported as PNG');
    } catch (error) {
      toast.error('Failed to export chart');
      console.error(error);
    }
  };

  const exportChartAsSVG = () => {
    if (!chartRef.current) return;
    
    try {
      const svgElement = chartRef.current.querySelector('svg');
      if (!svgElement) {
        toast.error('Chart not found');
        return;
      }
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const link = document.createElement('a');
      link.download = 'rainfall-pattern-comparison.svg';
      link.href = svgUrl;
      link.click();
      
      URL.revokeObjectURL(svgUrl);
      toast.success('Chart exported as SVG');
    } catch (error) {
      toast.error('Failed to export chart');
      console.error(error);
    }
  };

  const groupedPatterns = comparisonPatterns.reduce((acc, pattern) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = [];
    }
    acc[pattern.category].push(pattern);
    return acc;
  }, {} as Record<string, ComparisonPattern[]>);

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle>Pattern Comparison</CardTitle>
        <CardDescription>
          Overlay multiple rainfall patterns to compare their temporal distributions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Groups */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Quick Presets</h4>
          <div className="flex flex-wrap gap-2">
            {presetGroups.map((preset) => (
              <Button
                key={preset.name}
                variant="outline"
                size="sm"
                onClick={() => loadPreset(preset)}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Pattern Selection */}
        <div className="space-y-4">
          {Object.entries(groupedPatterns).map(([category, patterns]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-foreground mb-2">{category} Patterns</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {patterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={pattern.id}
                      checked={selectedPatterns.includes(pattern.id)}
                      onCheckedChange={() => togglePattern(pattern.id)}
                    />
                    <Label
                      htmlFor={pattern.id}
                      className="text-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: pattern.color }}
                      />
                      {pattern.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Chart */}
        {selectedPatterns.length > 0 ? (
          <>
            <div ref={chartRef} className="bg-card rounded-lg border border-border p-4">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="time"
                    label={{ value: "Time (hours)", position: "insideBottom", offset: -5 }}
                    stroke="hsl(var(--foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    label={{ value: "Intensity (in/hr)", angle: -90, position: "insideLeft" }}
                    stroke="hsl(var(--foreground))"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {selectedPatterns.map((patternId) => {
                    const pattern = comparisonPatterns.find((p) => p.id === patternId);
                    return pattern ? (
                      <Line
                        key={pattern.id}
                        type="monotone"
                        dataKey={pattern.name}
                        stroke={pattern.color}
                        strokeWidth={2}
                        dot={false}
                      />
                    ) : null;
                  })}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Comparison parameters: {totalDepth} inches total depth, {duration} hour duration, {timeStep} minute time step
              </p>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportChartAsPNG}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportChartAsSVG}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export SVG
              </Button>
            </div>

            {/* Pattern Statistics */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Pattern Statistics</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-semibold text-foreground">Pattern</th>
                      <th className="text-right py-2 px-2 font-semibold text-foreground">Peak Intensity</th>
                      <th className="text-right py-2 px-2 font-semibold text-foreground">Time to Peak</th>
                      <th className="text-right py-2 px-2 font-semibold text-foreground">Centroid</th>
                      <th className="text-right py-2 px-2 font-semibold text-foreground">Skewness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(patternStats).map(([name, stats]) => {
                      const pattern = comparisonPatterns.find((p) => p.name === name);
                      return (
                        <tr key={name} className="border-b border-border/50 hover:bg-accent/30">
                          <td className="py-2 px-2 flex items-center gap-2">
                            {pattern && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: pattern.color }}
                              />
                            )}
                            <span className="text-foreground">{name}</span>
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {stats.peakIntensity} in/hr
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {stats.timeToPeak} hrs
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {stats.centroid} hrs
                          </td>
                          <td className="text-right py-2 px-2 text-muted-foreground">
                            {stats.skewness > 0 ? '+' : ''}{stats.skewness}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                <p><strong>Peak Intensity:</strong> Maximum rainfall rate during the storm</p>
                <p><strong>Time to Peak:</strong> Duration from storm start to maximum intensity</p>
                <p><strong>Centroid:</strong> Center of mass of the rainfall distribution (temporal balance point)</p>
                <p><strong>Skewness:</strong> Measure of asymmetry (negative = left-skewed, positive = right-skewed)</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Select at least one pattern to display the comparison chart
          </div>
        )}
      </CardContent>
    </Card>
  );
}
