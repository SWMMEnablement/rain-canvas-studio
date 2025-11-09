import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
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
];

export function PatternComparison() {
  const [selectedPatterns, setSelectedPatterns] = useState<PatternType[]>([
    'scs1a',
    'scs1',
    'scs2',
    'scs3',
  ]);

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

  const togglePattern = (patternId: PatternType) => {
    setSelectedPatterns((prev) =>
      prev.includes(patternId)
        ? prev.filter((id) => id !== patternId)
        : [...prev, patternId]
    );
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
          <div className="bg-card rounded-lg border border-border p-4">
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
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Select at least one pattern to display the comparison chart
          </div>
        )}
      </CardContent>
    </Card>
  );
}
