import { useState, useEffect, useMemo } from "react";
import { PatternSelector } from "@/components/PatternSelector";
import { StormParameters } from "@/components/StormParameters";
import { RainfallChart } from "@/components/RainfallChart";
import { ExportButtons } from "@/components/ExportButtons";
import { ScsRegionalGuide } from "@/components/ScsRegionalGuide";
import { PatternComparison } from "@/components/PatternComparison";
import { SwmmFileIntegration } from "@/components/SwmmFileIntegration";
import { Droplets } from "lucide-react";
import {
  generateRainfallData,
  prepareChartData,
  prepareExportData,
  type PatternType,
} from "@/lib/rainfallPatterns";

const patternNames: Record<PatternType, string> = {
  'scs1a': 'SCS Type IA',
  'scs1': 'SCS Type I',
  'scs2': 'SCS Type II',
  'scs3': 'SCS Type III',
  'huff1': 'Huff 1st Quartile',
  'huff2': 'Huff 2nd Quartile',
  'huff3': 'Huff 3rd Quartile',
  'huff4': 'Huff 4th Quartile',
  'chicago': 'Chicago Storm',
  'desbordes': 'Desbordes',
  'arr': 'Australian ARR',
  'dwa': 'German DWA',
  'block': 'Block',
  'triangular': 'Triangular',
  'double': 'Double Peak',
  'custom': 'Custom',
  'trapezoidal': 'Trapezoidal',
  'fsr': 'FSR',
  'jma': 'JMA',
  'china': 'China',
  'sa_huff': 'South African Huff',
  'dutch': 'Dutch',
  'italian': 'Italian',
};

const Index = () => {
  const [selectedPattern, setSelectedPattern] = useState<PatternType>('block');
  const [depth, setDepth] = useState(2.0);
  const [duration, setDuration] = useState(6.0);
  const [timeStep, setTimeStep] = useState(15);
  const [chartData, setChartData] = useState<Array<{ time: string; intensity: number }>>([]);
  const [exportData, setExportData] = useState<Array<{ time: number; intensity: number }>>([]);

  useEffect(() => {
    const intensities = generateRainfallData(selectedPattern, depth, duration, timeStep);
    const formattedChartData = prepareChartData(intensities, timeStep);
    const formattedExportData = prepareExportData(intensities, timeStep);
    
    setChartData(formattedChartData);
    setExportData(formattedExportData);
  }, [selectedPattern, depth, duration, timeStep]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-rain text-white shadow-lg">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplets className="w-12 h-12" />
            <h1 className="text-5xl font-bold">Rainfall Pattern Painter</h1>
          </div>
          <p className="text-lg max-w-3xl mx-auto opacity-95">
            Generate and visualize synthetic rainfall patterns for stormwater modeling. 
            Create SWMM-ready timeseries with custom parameters.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Introduction */}
        <section className="bg-card p-6 rounded-xl shadow-card border border-border">
          <h2 className="text-2xl font-semibold mb-3 text-foreground">Explore Rainfall Patterns</h2>
          <p className="text-muted-foreground leading-relaxed">
            Rainfall Pattern Painter helps hydrologists and engineers quickly generate synthetic rainfall patterns 
            without hunting for historical data. Adjust parameters to create custom hyetographs for your 
            stormwater models.
          </p>
        </section>

        {/* SCS Regional Guide */}
        <ScsRegionalGuide />

        {/* Controls */}
        <div className="grid md:grid-cols-2 gap-6">
          <PatternSelector
            selectedPattern={selectedPattern}
            onPatternChange={setSelectedPattern}
          />
          <StormParameters
            depth={depth}
            duration={duration}
            timeStep={timeStep}
            onDepthChange={setDepth}
            onDurationChange={setDuration}
            onTimeStepChange={setTimeStep}
          />
        </div>

        {/* Visualization */}
        <section>
          <RainfallChart data={chartData} />
          <ExportButtons
            data={exportData}
            pattern={selectedPattern}
            totalDepth={depth}
            duration={duration}
            timeStep={timeStep}
          />
        </section>

        {/* SWMM5 File Integration */}
        <SwmmFileIntegration
          selectedPattern={selectedPattern}
          patternName={patternNames[selectedPattern]}
          totalDepth={depth}
          duration={duration}
          timeStep={timeStep}
        />

        {/* Pattern Comparison */}
        <PatternComparison />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="font-medium mb-2">Rainfall Pattern Painter – Synthetic Rain & Patterns for Stormwater Modeling</p>
          <p className="text-sm">Designed for hydrologists and engineers worldwide</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
