import { useState, useEffect } from "react";
import { PatternComparison } from "@/components/PatternComparison";
import { ScsRegionalGuide } from "@/components/ScsRegionalGuide";
import { UnitComparisonTable } from "@/components/UnitComparisonTable";
import { UnitConversionCalculator } from "@/components/UnitConversionCalculator";
import { AllPatternsTest } from "@/components/AllPatternsTest";
import { PatternDecisionGuide } from "@/components/PatternDecisionGuide";
import { ChinaRainstormCalculator } from "@/components/ChinaRainstormCalculator";
import { CanadaIdfCalculator } from "@/components/CanadaIdfCalculator";
import { GlobalIdfCalculator } from "@/components/GlobalIdfCalculator";
import { ParametricStormEngine } from "@/components/ParametricStormEngine";
import { WorldMapSelector } from "@/components/WorldMapSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitCompare, Map, Calculator, Info, BarChart3, Target, CloudRain, Snowflake, Beaker, Globe } from "lucide-react";
import {
  generateRainfallData,
  prepareChartData,
  prepareExportData,
  type PatternType,
} from "@/lib/rainfallPatterns";
import { type UnitSystem } from "@/lib/unitConversions";
import { chinaRainstormDatabase } from "@/lib/chinaRainstormData";
import { canadaIdfDatabase } from "@/lib/canadaIdfData";

interface AdvancedToolsProps {
  onSendToGenerator?: (depthMm: number, durationMin: number) => void;
  onViewIdf?: (city: { name: string; lat: number; lon: number }) => void;
}

export function AdvancedTools({ onSendToGenerator, onViewIdf }: AdvancedToolsProps = {}) {
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
        <TabsList className="flex w-full overflow-x-auto scrollbar-thin mb-6">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Map</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <GitCompare className="w-4 h-4" />
            <span className="hidden sm:inline">Compare</span>
          </TabsTrigger>
          <TabsTrigger value="sensitivity" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Sensitivity</span>
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Decision Guide</span>
          </TabsTrigger>
          <TabsTrigger value="china_idf" className="flex items-center gap-2">
            <CloudRain className="w-4 h-4" />
            <span className="hidden sm:inline">China IDF</span>
          </TabsTrigger>
          <TabsTrigger value="canada_idf" className="flex items-center gap-2">
            <Snowflake className="w-4 h-4" />
            <span className="hidden sm:inline">Canada IDF</span>
          </TabsTrigger>
          <TabsTrigger value="global_idf" className="flex items-center gap-2 min-w-max">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Global IDF</span>
          </TabsTrigger>
          <TabsTrigger value="regional" className="flex items-center gap-2">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Regional</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Units</span>
          </TabsTrigger>
          <TabsTrigger value="engine" className="flex items-center gap-2">
            <Beaker className="w-4 h-4" />
            <span className="hidden sm:inline">Engine</span>
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">About</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-6">
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>World Pattern Map</strong> — Click any region on the interactive map to discover 
                the recommended rainfall distributions for that area. Covers 18 regions with 200+ patterns.
              </p>
            </CardContent>
          </Card>
          <WorldMapSelector onViewIdf={onViewIdf} />
        </TabsContent>

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

        <TabsContent value="sensitivity" className="space-y-6">
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Sensitivity Analysis</strong> compares peak intensity across all patterns 
                for your current storm parameters. Use this table in engineering reports to justify 
                your pattern selection.
              </p>
            </CardContent>
          </Card>
          <AllPatternsTest
            depth={depth}
            duration={duration}
            timeStep={timeStep}
            unitSystem={unitSystem}
          />
        </TabsContent>

        <TabsContent value="guide" className="space-y-6">
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Pattern Decision Guide</strong> walks you through a series of questions 
                about your project location to recommend the most appropriate rainfall distribution.
              </p>
            </CardContent>
          </Card>
          <PatternDecisionGuide />
        </TabsContent>

        <TabsContent value="china_idf" className="space-y-6">
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>China Rainstorm Intensity Calculator (暴雨强度公式计算器)</strong> — Look up city-specific 
                A₁/C/b/n coefficients per GB 50014, calculate design intensities, generate IDF curves and 
                alternating block hyetographs for {chinaRainstormDatabase.length}+ Chinese cities.
              </p>
            </CardContent>
          </Card>
          <ChinaRainstormCalculator onSendToGenerator={onSendToGenerator} />
        </TabsContent>

        <TabsContent value="canada_idf" className="space-y-6">
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Canada IDF Calculator</strong> — Look up city-specific IDF coefficients from 
                Environment and Climate Change Canada (ECCC), calculate design intensities, generate 
                IDF curves and alternating block hyetographs for {canadaIdfDatabase.length}+ Canadian cities.
              </p>
            </CardContent>
          </Card>
          <CanadaIdfCalculator onSendToGenerator={onSendToGenerator} />
        </TabsContent>

        <TabsContent value="global_idf" className="space-y-6">
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Global IDF Calculator</strong> — Look up IDF coefficients from published standards for
                15 countries including Australia, UK, France, Germany, India, Brazil, Japan, South Korea, Singapore,
                and more. Generate IDF curves, data tables, and Chicago design storm hyetographs.
              </p>
            </CardContent>
          </Card>
          <GlobalIdfCalculator onSendToGenerator={onSendToGenerator} />
        </TabsContent>

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

        <TabsContent value="engine" className="space-y-6">
          <Card className="bg-accent/30 border-primary/20">
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">
                <strong>Parametric Storm Engine</strong> generates design storms from first principles using
                SCS (Sigmoid), Chicago (Keifer-Chu), or Huff (Quartile) mathematical engines. Adjust parameters
                in real-time to replicate any regional standard or create custom distributions.
              </p>
            </CardContent>
          </Card>
          <ParametricStormEngine />
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
