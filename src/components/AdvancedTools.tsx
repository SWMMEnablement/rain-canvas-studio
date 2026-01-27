import { useState, useEffect } from "react";
import { PatternComparison } from "@/components/PatternComparison";
import { ScsRegionalGuide } from "@/components/ScsRegionalGuide";
import { UnitComparisonTable } from "@/components/UnitComparisonTable";
import { UnitConversionCalculator } from "@/components/UnitConversionCalculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompare, Map, Calculator, Info } from "lucide-react";
import {
  generateRainfallData,
  prepareChartData,
  prepareExportData,
  type PatternType,
} from "@/lib/rainfallPatterns";
import { type UnitSystem } from "@/lib/unitConversions";

export function AdvancedTools() {
  const [depth, setDepth] = useState(2.0);
  const [duration, setDuration] = useState(6.0);
  const [timeStep, setTimeStep] = useState(15);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    const saved = localStorage.getItem('preferredUnitSystem');
    return (saved === 'SI' || saved === 'USA') ? saved : 'USA';
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Advanced Analysis Tools</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Compare multiple patterns, explore regional guidance, and access unit conversion utilities
        </p>
      </div>

      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            <span className="hidden sm:inline">Pattern Comparison</span>
            <span className="sm:hidden">Compare</span>
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Regional Guide</span>
            <span className="sm:hidden">Regional</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Unit Tools</span>
            <span className="sm:hidden">Units</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">About Patterns</span>
            <span className="sm:hidden">About</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Pattern Comparison</strong> allows you to overlay multiple rainfall distributions 
                on a single chart to understand their differences. Useful for sensitivity analysis 
                and selecting the most appropriate pattern for your watershed.
              </p>
            </CardContent>
          </Card>
          <PatternComparison
            depth={depth}
            duration={duration}
            timeStep={timeStep}
            unitSystem={unitSystem}
          />
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Regional Guide</strong> helps you select the appropriate SCS rainfall distribution 
                based on your project location within the United States. Different regions have 
                characteristic storm patterns based on their climate.
              </p>
            </CardContent>
          </Card>
          <ScsRegionalGuide />
        </TabsContent>

        <TabsContent value="units" className="space-y-6">
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Unit Conversion Tools</strong> provide quick reference tables and calculators 
                for converting between US Customary (inches) and SI (millimeters) units commonly 
                used in hydrology.
              </p>
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-2 gap-6">
            <UnitComparisonTable
              depth={depth}
              duration={duration}
              unitSystem={unitSystem}
            />
            <UnitConversionCalculator />
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">SCS/NRCS Distributions</CardTitle>
                <CardDescription>United States Design Storms</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  The SCS (Soil Conservation Service, now NRCS) developed four design storm 
                  distributions for use throughout the United States. These are based on 
                  analysis of historical rainfall data and are defined in TR-55.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Type I:</strong> Pacific maritime climate - Alaska, Hawaii, coastal CA/OR/WA</li>
                  <li><strong>Type IA:</strong> Pacific Northwest - western WA/OR with mild winters</li>
                  <li><strong>Type II:</strong> Most of the continental US - highest peak intensity</li>
                  <li><strong>Type III:</strong> Gulf of Mexico coastal areas - tropical storm influence</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Huff Distributions</CardTitle>
                <CardDescription>Illinois State Water Survey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Floyd Huff developed these distributions at the Illinois State Water Survey 
                  based on extensive analysis of Midwest storms. They are categorized by which 
                  quartile of the storm duration contains the peak intensity.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>1st Quartile:</strong> Peak occurs in first 25% - short, intense storms</li>
                  <li><strong>2nd Quartile:</strong> Peak occurs 25-50% through - most common pattern</li>
                  <li><strong>3rd Quartile:</strong> Peak occurs 50-75% through - longer duration storms</li>
                  <li><strong>4th Quartile:</strong> Peak occurs in last 25% - trailing storm pattern</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Chicago Storm (Keifer & Chu)</CardTitle>
                <CardDescription>Intensity-Duration-Frequency Based</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  The Chicago method uses local IDF curves to generate a design storm with 
                  peak intensity matching the design return period. It's particularly useful 
                  for urban drainage design where local IDF data is available.
                </p>
                <p>
                  The method allows for adjusting the peak location within the storm (r factor), 
                  typically centered at 0.375-0.5 of the storm duration.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">International Standards</CardTitle>
                <CardDescription>Global Rainfall Pattern Methods</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p>
                  Many countries have developed their own design storm methodologies based 
                  on local climatology:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Australian ARR:</strong> Australian Rainfall and Runoff temporal patterns</li>
                  <li><strong>German DWA:</strong> Deutscher Verband für Wasserwirtschaft standards</li>
                  <li><strong>UK FSR:</strong> Flood Studies Report design events</li>
                  <li><strong>JMA (Japan):</strong> Japan Meteorological Agency patterns</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
