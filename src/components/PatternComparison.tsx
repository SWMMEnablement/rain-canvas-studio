import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useState, useMemo, useRef } from "react";
import { Download, TrendingUp, Settings, RotateCcw, FileText, BarChart3, Activity } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";

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

  // Default parameters
  const DEFAULT_DEPTH = 2.0;
  const DEFAULT_DURATION = 6.0;
  const DEFAULT_TIMESTEP = 15;

  // Customizable parameters for comparison
  const [totalDepth, setTotalDepth] = useState(DEFAULT_DEPTH);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [timeStep, setTimeStep] = useState(DEFAULT_TIMESTEP);
  const [showCumulative, setShowCumulative] = useState(false);

  const chartData = useMemo(() => {
    const numSteps = Math.ceil((duration * 60) / timeStep);
    const data: any[] = [];
    const timeStepHours = timeStep / 60;

    // Store cumulative values for each pattern
    const cumulatives: Record<string, number> = {};

    for (let i = 0; i < numSteps; i++) {
      const time = ((i * timeStep) / 60).toFixed(1);
      const point: any = { time };

      selectedPatterns.forEach((patternId) => {
        const intensities = generateRainfallData(patternId, totalDepth, duration, timeStep);
        const pattern = comparisonPatterns.find((p) => p.id === patternId);
        if (pattern) {
          if (showCumulative) {
            // Calculate cumulative depth
            if (!cumulatives[pattern.name]) {
              cumulatives[pattern.name] = 0;
            }
            cumulatives[pattern.name] += intensities[i] * timeStepHours;
            point[pattern.name] = parseFloat(cumulatives[pattern.name].toFixed(3));
          } else {
            // Show intensity
            point[pattern.name] = intensities[i];
          }
        }
      });

      data.push(point);
    }

    return data;
  }, [selectedPatterns, totalDepth, duration, timeStep, showCumulative]);

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

  // Auto-analysis summary
  const analysisSummary = useMemo(() => {
    if (Object.keys(patternStats).length === 0) return null;

    const entries = Object.entries(patternStats);
    
    const earliestPeak = entries.reduce((min, [name, stats]) => 
      stats.timeToPeak < min.stats.timeToPeak ? { name, stats } : min
    , { name: entries[0][0], stats: entries[0][1] });

    const latestPeak = entries.reduce((max, [name, stats]) => 
      stats.timeToPeak > max.stats.timeToPeak ? { name, stats } : max
    , { name: entries[0][0], stats: entries[0][1] });

    const highestIntensity = entries.reduce((max, [name, stats]) => 
      stats.peakIntensity > max.stats.peakIntensity ? { name, stats } : max
    , { name: entries[0][0], stats: entries[0][1] });

    const lowestIntensity = entries.reduce((min, [name, stats]) => 
      stats.peakIntensity < min.stats.peakIntensity ? { name, stats } : min
    , { name: entries[0][0], stats: entries[0][1] });

    return {
      earliestPeak,
      latestPeak,
      highestIntensity,
      lowestIntensity,
    };
  }, [patternStats]);

  const togglePattern = (patternId: PatternType) => {
    setSelectedPatterns((prev) =>
      prev.includes(patternId)
        ? prev.filter((id) => id !== patternId)
        : [...prev, patternId]
    );
  };

  const loadPreset = (preset: PresetGroup) => {
    setSelectedPatterns(preset.patterns);
    toast({ title: "Preset loaded", description: `Loaded preset: ${preset.name}` });
  };

  const resetToDefaults = () => {
    setTotalDepth(DEFAULT_DEPTH);
    setDuration(DEFAULT_DURATION);
    setTimeStep(DEFAULT_TIMESTEP);
    toast({ title: "Parameters reset", description: "Storm parameters restored to defaults" });
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
      
      toast({ title: "Export successful", description: "Chart exported as PNG" });
    } catch (error) {
      toast({ title: "Export failed", description: "Failed to export chart", variant: "destructive" });
      console.error(error);
    }
  };

  const exportChartAsSVG = () => {
    if (!chartRef.current) return;
    
    try {
      const svgElement = chartRef.current.querySelector('svg');
      if (!svgElement) {
        toast({ title: "Export failed", description: "Chart not found", variant: "destructive" });
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
      toast({ title: "Export successful", description: "Chart exported as SVG" });
    } catch (error) {
      toast({ title: "Export failed", description: "Failed to export chart", variant: "destructive" });
      console.error(error);
    }
  };

  const exportAsPDF = async () => {
    if (!chartRef.current) return;

    try {
      const [html2canvas, { jsPDF }] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf')
      ]);

      toast({ title: "Generating PDF", description: "Please wait..." });

      // Capture the chart
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      const chartImage = canvas.toDataURL('image/png');

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Title
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Rainfall Pattern Comparison Report', margin, yPosition);
      yPosition += 10;

      // Date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 8;

      // Storm Parameters
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Storm Parameters', margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Depth: ${totalDepth.toFixed(1)} inches`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Duration: ${duration.toFixed(1)} hours`, margin, yPosition);
      yPosition += 5;
      pdf.text(`Time Step: ${timeStep} minutes`, margin, yPosition);
      yPosition += 10;

      // Selected Patterns
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Selected Patterns', margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const patternNames = selectedPatterns.map(id => 
        comparisonPatterns.find(p => p.id === id)?.name || id
      ).join(', ');
      const splitPatterns = pdf.splitTextToSize(patternNames, pageWidth - 2 * margin);
      pdf.text(splitPatterns, margin, yPosition);
      yPosition += splitPatterns.length * 5 + 8;

      // Chart
      const chartWidth = pageWidth - 2 * margin;
      const chartHeight = (canvas.height * chartWidth) / canvas.width;
      
      if (yPosition + chartHeight > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.addImage(chartImage, 'PNG', margin, yPosition, chartWidth, chartHeight);
      yPosition += chartHeight + 10;

      // Statistics Table
      if (yPosition + 60 > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Pattern Statistics', margin, yPosition);
      yPosition += 8;

      // Table headers
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      const colWidth = (pageWidth - 2 * margin) / 5;
      pdf.text('Pattern', margin, yPosition);
      pdf.text('Peak (in/hr)', margin + colWidth, yPosition);
      pdf.text('Time to Peak', margin + 2 * colWidth, yPosition);
      pdf.text('Centroid', margin + 3 * colWidth, yPosition);
      pdf.text('Skewness', margin + 4 * colWidth, yPosition);
      yPosition += 6;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      Object.entries(patternStats).forEach(([name, stats]) => {
        if (yPosition > pageHeight - margin - 10) {
          pdf.addPage();
          yPosition = margin;
        }

        const shortName = name.length > 18 ? name.substring(0, 15) + '...' : name;
        pdf.text(shortName, margin, yPosition);
        pdf.text(stats.peakIntensity.toString(), margin + colWidth, yPosition);
        pdf.text(`${stats.timeToPeak} hrs`, margin + 2 * colWidth, yPosition);
        pdf.text(`${stats.centroid} hrs`, margin + 3 * colWidth, yPosition);
        pdf.text((stats.skewness > 0 ? '+' : '') + stats.skewness.toString(), margin + 4 * colWidth, yPosition);
        yPosition += 5;
      });

      // Footer
      const totalPages = pdf.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      pdf.save('rainfall-pattern-comparison-report.pdf');
      toast({ title: "Export successful", description: "PDF report generated successfully" });
    } catch (error) {
      toast({ title: "Export failed", description: "Failed to generate PDF report", variant: "destructive" });
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
        {/* Storm Parameters */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-accent/20">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold text-foreground">Storm Parameters</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Total Depth</Label>
                <span className="text-xs font-mono text-muted-foreground">{totalDepth.toFixed(1)} in</span>
              </div>
              <Slider
                value={[totalDepth]}
                onValueChange={(value) => setTotalDepth(value[0])}
                min={0.5}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Duration</Label>
                <span className="text-xs font-mono text-muted-foreground">{duration.toFixed(1)} hrs</span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
                min={1}
                max={24}
                step={0.5}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs">Time Step</Label>
                <span className="text-xs font-mono text-muted-foreground">{timeStep} min</span>
              </div>
              <Slider
                value={[timeStep]}
                onValueChange={(value) => setTimeStep(value[0])}
                min={5}
                max={60}
                step={5}
                className="w-full"
              />
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="w-full md:w-auto flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>

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
                    label={{ 
                      value: showCumulative ? "Cumulative Depth (in)" : "Intensity (in/hr)", 
                      angle: -90, 
                      position: "insideLeft" 
                    }}
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
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Comparison parameters: {totalDepth} inches total depth, {duration} hour duration, {timeStep} minute time step
                </p>
                <div className="flex items-center gap-2">
                  <Label htmlFor="view-mode" className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Intensity
                  </Label>
                  <Switch
                    id="view-mode"
                    checked={showCumulative}
                    onCheckedChange={setShowCumulative}
                  />
                  <Label htmlFor="view-mode" className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Cumulative
                  </Label>
                </div>
              </div>
            </div>

            {/* Export Buttons */}
            <div className="flex flex-wrap gap-2">
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
              <Button
                variant="default"
                size="sm"
                onClick={exportAsPDF}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export Full Report (PDF)
              </Button>
            </div>

            {/* Analysis Summary */}
            {analysisSummary && (
              <div className="space-y-3 p-4 rounded-lg border border-border bg-primary/5">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-semibold text-foreground">Auto-Analysis Summary</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 rounded bg-card">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Earliest Peak</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                          {comparisonPatterns.find(p => p.name === analysisSummary.earliestPeak.name) && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: comparisonPatterns.find(p => p.name === analysisSummary.earliestPeak.name)?.color }}
                            />
                          )}
                          {analysisSummary.earliestPeak.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          at {analysisSummary.earliestPeak.stats.timeToPeak} hours
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-card">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Latest Peak</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                          {comparisonPatterns.find(p => p.name === analysisSummary.latestPeak.name) && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: comparisonPatterns.find(p => p.name === analysisSummary.latestPeak.name)?.color }}
                            />
                          )}
                          {analysisSummary.latestPeak.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          at {analysisSummary.latestPeak.stats.timeToPeak} hours
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 p-2 rounded bg-card">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Highest Intensity</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                          {comparisonPatterns.find(p => p.name === analysisSummary.highestIntensity.name) && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: comparisonPatterns.find(p => p.name === analysisSummary.highestIntensity.name)?.color }}
                            />
                          )}
                          {analysisSummary.highestIntensity.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {analysisSummary.highestIntensity.stats.peakIntensity} in/hr
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-card">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Lowest Intensity</p>
                        <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                          {comparisonPatterns.find(p => p.name === analysisSummary.lowestIntensity.name) && (
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: comparisonPatterns.find(p => p.name === analysisSummary.lowestIntensity.name)?.color }}
                            />
                          )}
                          {analysisSummary.lowestIntensity.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {analysisSummary.lowestIntensity.stats.peakIntensity} in/hr
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
