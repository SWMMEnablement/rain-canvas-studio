import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TcCalculator } from "./TcCalculator";
import { IdfLookup } from "./IdfLookup";
import CurveNumberCalculator from "./CurveNumberCalculator";
import RunoffCalculator from "./RunoffCalculator";
import RationalMethodCalculator from "./RationalMethodCalculator";
import DetentionPondCalculator from "./DetentionPondCalculator";
import OutletStructureCalculator from "./OutletStructureCalculator";
import StageStorageDischarge, { StageStorageOutflowData } from "./StageStorageDischarge";
import ModifiedPulsRouting, { StorageOutflowPoint, InflowPoint } from "./ModifiedPulsRouting";
import UnitHydrographCalculator from "./UnitHydrographCalculator";
import PrePostDevelopmentComparison from "./PrePostDevelopmentComparison";
import LIDCalculator from "./LIDCalculator";
import TreatmentTrainCalculator from "./TreatmentTrainCalculator";
import { 
  Droplets, 
  CloudRain, 
  Calculator, 
  FileText, 
  Globe, 
  Settings, 
  Download,
  Info,
  MapPin,
  Beaker,
  BarChart3,
  Clock,
  Layers,
  BookOpen,
  FlaskConical
} from "lucide-react";

export function Documentation() {
  const [linkedCN, setLinkedCN] = useState<number | null>(null);
  const [linkedArea, setLinkedArea] = useState<number>(0);
  const [linkedRunoffDepth, setLinkedRunoffDepth] = useState<number>(0);
  
  // State for routing data transfer
  const [routingSSOData, setRoutingSSOData] = useState<StorageOutflowPoint[] | undefined>(undefined);
  const [routingInflowData, setRoutingInflowData] = useState<InflowPoint[] | undefined>(undefined);

  const handleCNChange = (cn: number | null, totalArea: number) => {
    setLinkedCN(cn);
    setLinkedArea(totalArea);
  };

  const handleRunoffChange = (runoffDepth: number) => {
    setLinkedRunoffDepth(runoffDepth);
  };

  const handleSSOExport = (data: StageStorageOutflowData[]) => {
    setRoutingSSOData(data);
  };

  const handleHydrographExport = (data: { time: number; flow: number }[]) => {
    setRoutingInflowData(data.map(p => ({ time: p.time, inflow: p.flow })));
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-6 h-6 text-primary" />
            About Rainfall Pattern Painter
          </CardTitle>
          <CardDescription>
            Comprehensive synthetic rainfall generation for stormwater modeling
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            <strong>Rainfall Pattern Painter</strong> is a tool designed for hydrologists, 
            civil engineers, and stormwater modelers. It generates synthetic rainfall hyetographs based on 
            standardized temporal distribution patterns used worldwide.
          </p>
          <p>
            The application supports multiple international standards including NRCS/SCS (USA), 
            Huff distributions, Chicago Storm, and various regional patterns from Europe, Asia, 
            Australia, and Africa. Generated data can be exported in formats compatible with 
            SWMM5, InfoWorks ICM, and other hydraulic modeling software.
          </p>
        </CardContent>
      </Card>

      {/* Main Documentation Tabs */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7 h-auto">
          <TabsTrigger value="patterns" className="flex items-center gap-1">
            <CloudRain className="w-4 h-4" />
            <span className="hidden sm:inline">Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="parameters" className="flex items-center gap-1">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Parameters</span>
          </TabsTrigger>
          <TabsTrigger value="swmm" className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">SWMM</span>
          </TabsTrigger>
          <TabsTrigger value="units" className="flex items-center gap-1">
            <Calculator className="w-4 h-4" />
            <span className="hidden sm:inline">Units</span>
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-1">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Glossary</span>
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-1">
            <FlaskConical className="w-4 h-4" />
            <span className="hidden sm:inline">Examples</span>
          </TabsTrigger>
        </TabsList>

        {/* Rainfall Patterns Tab */}
        <TabsContent value="patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-primary" />
                Rainfall Distribution Patterns
              </CardTitle>
              <CardDescription>
                Detailed information on all supported temporal distribution patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {/* SCS/NRCS Patterns */}
                <AccordionItem value="scs">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      SCS/NRCS Patterns (USA)
                      <Badge variant="secondary" className="ml-2">4 Types</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      The NRCS (formerly SCS) rainfall distributions are the most widely used design storm 
                      patterns in the United States. Developed by the Natural Resources Conservation Service, 
                      these patterns are based on analysis of rainfall data across different climatic regions.
                    </p>
                    
                    <div className="grid gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Type IA</h4>
                        <p className="text-muted-foreground mt-1">
                          <strong>Region:</strong> Pacific Northwest coastal areas (western WA, OR, northern CA coast)
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Characteristics:</strong> Gentle, steady rainfall typical of maritime climates. 
                          Peak occurs at approximately 37% of storm duration. Lowest intensity of all SCS types.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>24-hr Peak Intensity:</strong> ~8% of total depth per hour
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Type I</h4>
                        <p className="text-muted-foreground mt-1">
                          <strong>Region:</strong> Pacific coast, Hawaii, Alaska coastal areas
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Characteristics:</strong> Similar to Type IA but with slightly higher intensities. 
                          Peak occurs at approximately 40% of storm duration.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>24-hr Peak Intensity:</strong> ~12% of total depth per hour
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Type II</h4>
                        <p className="text-muted-foreground mt-1">
                          <strong>Region:</strong> Most of the continental United States (Midwest, Northeast, 
                          Gulf states, Southwest deserts)
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Characteristics:</strong> Represents intense thunderstorm-type rainfall. 
                          Sharp peak at storm center (50% of duration). Most commonly used SCS distribution.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>24-hr Peak Intensity:</strong> ~25% of total depth per hour
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Type III</h4>
                        <p className="text-muted-foreground mt-1">
                          <strong>Region:</strong> Gulf of Mexico coastal areas, Atlantic coastal areas (FL, 
                          coastal GA, SC, NC)
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Characteristics:</strong> Represents tropical storm patterns with high intensities 
                          but more gradual buildup than Type II. Peak at approximately 50% of duration.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>24-hr Peak Intensity:</strong> ~20% of total depth per hour
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-700 dark:text-blue-300">Reference</h4>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        USDA-NRCS TR-55 "Urban Hydrology for Small Watersheds" (1986)
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Huff Patterns */}
                <AccordionItem value="huff">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-green-500" />
                      Huff Distributions
                      <Badge variant="secondary" className="ml-2">4 Quartiles</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      Huff distributions, developed by Floyd Huff at the Illinois State Water Survey (1967), 
                      classify storms based on when the peak intensity occurs within the storm duration. 
                      They are probability-based distributions derived from analysis of actual storm events.
                    </p>

                    <div className="grid gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">1st Quartile</h4>
                        <p className="text-muted-foreground">
                          Peak intensity occurs in the first 25% of storm duration. Represents approximately 
                          30% of observed storms. Common in short-duration, high-intensity convective events.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">2nd Quartile</h4>
                        <p className="text-muted-foreground">
                          Peak intensity occurs between 25-50% of storm duration. Most common distribution, 
                          representing approximately 35% of observed storms. Often used as a conservative 
                          design choice.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">3rd Quartile</h4>
                        <p className="text-muted-foreground">
                          Peak intensity occurs between 50-75% of storm duration. Represents approximately 
                          20% of observed storms. Often associated with frontal systems.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">4th Quartile</h4>
                        <p className="text-muted-foreground">
                          Peak intensity occurs in the last 25% of storm duration. Represents approximately 
                          15% of observed storms. Can produce high peak flows due to saturated conditions.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <h4 className="font-semibold text-green-700 dark:text-green-300">Application Note</h4>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Huff distributions are particularly useful when designing for specific storm types 
                        or when probability-based analysis is required. The 50% probability curves are 
                        typically used for design purposes.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Chicago Storm */}
                <AccordionItem value="chicago">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-purple-500" />
                      Chicago Storm (Keifer & Chu)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      The Chicago Storm method, developed by Keifer and Chu (1957), creates a synthetic 
                      hyetograph directly from IDF (Intensity-Duration-Frequency) curves. It is widely 
                      used in urban drainage design worldwide.
                    </p>

                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-semibold text-foreground">Key Characteristics</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                        <li>Peak position controlled by advancement ratio (r), typically 0.3-0.5</li>
                        <li>Before peak: intensity increases following IDF relationship</li>
                        <li>After peak: intensity decreases following IDF relationship</li>
                        <li>Total depth equals IDF depth for storm duration</li>
                        <li>Default r = 0.375 (peak at 37.5% of duration)</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300">Mathematical Basis</h4>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        Intensity is derived from IDF equation: i = a / (t + b)^c, where the pattern 
                        maintains consistency with the IDF curve at every duration.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* International Patterns */}
                <AccordionItem value="international">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-orange-500" />
                      International Patterns
                      <Badge variant="secondary" className="ml-2">8 Regions</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      Regional rainfall patterns developed by national agencies worldwide to reflect 
                      local precipitation characteristics.
                    </p>

                    <div className="grid gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Australian ARR</h4>
                        <p className="text-muted-foreground">
                          Based on Australian Rainfall and Runoff guidelines. Uses temporal patterns 
                          derived from pluviograph data across Australian climatic zones.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">German DWA</h4>
                        <p className="text-muted-foreground">
                          Deutsche Vereinigung für Wasserwirtschaft (German Water Management Association) 
                          standard. Euler Type II pattern commonly used for central European conditions.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Dutch Pattern</h4>
                        <p className="text-muted-foreground">
                          Netherlands standard pattern for urban drainage design. Accounts for the 
                          flat terrain and high water table conditions common in the Netherlands.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Italian Pattern</h4>
                        <p className="text-muted-foreground">
                          Based on Italian national guidelines. Incorporates Mediterranean climate 
                          characteristics with distinct wet/dry seasonal patterns.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">JMA (Japan)</h4>
                        <p className="text-muted-foreground">
                          Japan Meteorological Agency pattern. Designed for monsoon and typhoon 
                          conditions common in East Asian climates.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">China Pattern</h4>
                        <p className="text-muted-foreground">
                          Chinese national standard pattern based on extensive pluviograph analysis 
                          across diverse Chinese climatic regions.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">South African Huff</h4>
                        <p className="text-muted-foreground">
                          Adaptation of Huff distributions calibrated for South African rainfall 
                          characteristics, particularly summer thunderstorms.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Desbordes (France)</h4>
                        <p className="text-muted-foreground">
                          French pattern developed by Michel Desbordes. Double-triangle shape commonly 
                          used in French urban drainage design.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Simple Patterns */}
                <AccordionItem value="simple">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-500" />
                      Simple Geometric Patterns
                      <Badge variant="secondary" className="ml-2">4 Types</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      Basic geometric shapes useful for sensitivity analysis, simple design calculations, 
                      or when detailed temporal patterns are not required.
                    </p>

                    <div className="grid gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Block (Uniform)</h4>
                        <p className="text-muted-foreground">
                          Constant intensity throughout storm duration. Simplest possible distribution. 
                          Useful for rational method applications and quick calculations.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Triangular</h4>
                        <p className="text-muted-foreground">
                          Linear increase to peak at center, then linear decrease. Simple representation 
                          of natural storm behavior with a single peak.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Trapezoidal</h4>
                        <p className="text-muted-foreground">
                          Combines triangular rise/fall with constant peak period. Represents storms 
                          with sustained high-intensity periods.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Double Peak</h4>
                        <p className="text-muted-foreground">
                          Two intensity peaks representing multi-cell storms or frontal passages with 
                          pre-frontal and post-frontal precipitation.
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parameters Tab */}
        <TabsContent value="parameters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Storm Parameters
              </CardTitle>
              <CardDescription>
                Understanding and configuring rainfall event parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Total Depth
                  </h4>
                  <p className="text-muted-foreground mt-2">
                    The cumulative precipitation depth over the entire storm duration. Typically obtained 
                    from IDF curves, Atlas 14, or regional precipitation frequency studies.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
                    <li>USA units: inches (in)</li>
                    <li>SI units: millimeters (mm)</li>
                    <li>Typical range: 0.5 - 15 inches / 12 - 380 mm</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Storm Duration
                  </h4>
                  <p className="text-muted-foreground mt-2">
                    The total length of the rainfall event. Should match the design storm duration from 
                    IDF curves and be appropriate for the catchment time of concentration.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
                    <li>Common durations: 1, 2, 3, 6, 12, 24 hours</li>
                    <li>Short durations (1-3 hr): Small urban catchments</li>
                    <li>Long durations (12-24 hr): Large watersheds, SCS methods</li>
                  </ul>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Time Step
                  </h4>
                  <p className="text-muted-foreground mt-2">
                    The temporal resolution of the generated hyetograph. Smaller time steps provide 
                    more detailed patterns but increase computational requirements.
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1">
                    <li>Available: 5, 10, 15, 30, 60 minutes</li>
                    <li>5-10 min: High-resolution urban modeling</li>
                    <li>15 min: Standard SWMM modeling</li>
                    <li>30-60 min: Large watershed applications</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300">Best Practice</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Select a time step that is no larger than 1/5 of the catchment's time of concentration 
                  to adequately capture runoff response. For SWMM modeling, ensure the rainfall time step 
                  is compatible with (divisible into) the routing time step.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Soil Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-primary" />
                Hydrologic Soil Groups
              </CardTitle>
              <CardDescription>
                USDA/NRCS soil classification for infiltration modeling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-300">Group A - High Infiltration</h4>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Deep, well-drained sands and gravels. Infiltration rate: &gt;0.30 in/hr (&gt;7.6 mm/hr). 
                    Low runoff potential. Examples: Sand, loamy sand, sandy loam.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Group B - Moderate Infiltration</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Moderately deep, well-drained soils with moderate texture. Infiltration rate: 0.15-0.30 in/hr 
                    (3.8-7.6 mm/hr). Moderate runoff potential. Examples: Silt loam, loam.
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Group C - Slow Infiltration</h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                    Soils with layer impeding downward movement or moderately fine texture. Infiltration rate: 
                    0.05-0.15 in/hr (1.3-3.8 mm/hr). Moderately high runoff potential. Examples: Sandy clay loam.
                  </p>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-700 dark:text-red-300">Group D - Very Slow Infiltration</h4>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Clay soils with high swelling potential, high water table, or shallow impervious layer. 
                    Infiltration rate: 0-0.05 in/hr (0-1.3 mm/hr). High runoff potential. Examples: Clay, silty clay.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SWMM Tab */}
        <TabsContent value="swmm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                SWMM5 Integration
              </CardTitle>
              <CardDescription>
                Generate complete SWMM5 input files with rainfall timeseries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p>
                  The SWMM File Integration feature generates complete EPA SWMM5 input files (.inp) 
                  ready for simulation. Files include all required sections with customizable parameters 
                  for subcatchments, conduits, and infiltration.
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sections">
                  <AccordionTrigger>Generated File Sections</AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm">
                    <div className="grid gap-3">
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[TITLE]</strong> - Project identification
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[OPTIONS]</strong> - Simulation settings (flow units, routing method, dates)
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[RAINGAGES]</strong> - Rain gauge definition linked to timeseries
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[SUBCATCHMENTS]</strong> - Drainage area properties
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[SUBAREAS]</strong> - Pervious/impervious surface parameters
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[INFILTRATION]</strong> - Horton infiltration parameters
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[JUNCTIONS]</strong> - Node definitions
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[OUTFALLS]</strong> - System outlet definition
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[CONDUITS]</strong> - Pipe/channel properties
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[XSECTIONS]</strong> - Conduit cross-section geometry
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>[TIMESERIES]</strong> - Rainfall intensity data
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="landuse">
                  <AccordionTrigger>Land Use Presets</AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Pre-configured parameter sets for common land use types:</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Badge variant="outline">Low-Density Residential</Badge>
                      <Badge variant="outline">Medium-Density Residential</Badge>
                      <Badge variant="outline">High-Density Residential</Badge>
                      <Badge variant="outline">Commercial</Badge>
                      <Badge variant="outline">Industrial</Badge>
                      <Badge variant="outline">Park/Open Space</Badge>
                      <Badge variant="outline">Agricultural</Badge>
                      <Badge variant="outline">Parking Lot</Badge>
                      <Badge variant="outline">Forest/Woods</Badge>
                      <Badge variant="outline">Highway/Road</Badge>
                    </div>
                    <p className="mt-3">
                      Each preset automatically configures imperviousness, Manning's n values, 
                      depression storage, and infiltration parameters based on typical values 
                      from SWMM documentation and engineering practice.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="horton">
                  <AccordionTrigger>Horton Infiltration Parameters</AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      The Horton equation models infiltration rate decay over time:
                    </p>
                    <div className="p-3 bg-muted rounded font-mono text-center">
                      f = f∞ + (f₀ - f∞) × e^(-kt)
                    </div>
                    <div className="grid gap-3 mt-3">
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>f₀ (MaxInfil)</strong> - Initial/maximum infiltration rate at start of storm
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>f∞ (MinInfil)</strong> - Final/minimum infiltration rate at saturation
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>k (Decay)</strong> - Decay constant controlling rate of decrease (1/hr)
                      </div>
                      <div className="p-3 bg-muted/50 rounded">
                        <strong>DryTime</strong> - Time for soil to fully recover infiltration capacity
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="validation">
                  <AccordionTrigger>Parameter Validation</AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Built-in validation warns about unrealistic parameter values:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mt-2">
                      <li>Imperviousness outside 0-100% range</li>
                      <li>Manning's n values outside typical ranges</li>
                      <li>Depression storage values that seem too high or low</li>
                      <li>Infiltration rates inconsistent with soil type</li>
                      <li>Conduit slopes that may cause numerical instability</li>
                      <li>Pipe diameters incompatible with expected flows</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Units Tab */}
        <TabsContent value="units" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Unit Systems
              </CardTitle>
              <CardDescription>
                USA Customary and SI (Metric) unit conversions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-semibold">Parameter</th>
                      <th className="text-left p-2 font-semibold">USA Units</th>
                      <th className="text-left p-2 font-semibold">SI Units</th>
                      <th className="text-left p-2 font-semibold">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b">
                      <td className="p-2">Rainfall Depth</td>
                      <td className="p-2">inches (in)</td>
                      <td className="p-2">millimeters (mm)</td>
                      <td className="p-2">1 in = 25.4 mm</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Rainfall Intensity</td>
                      <td className="p-2">in/hr</td>
                      <td className="p-2">mm/hr</td>
                      <td className="p-2">1 in/hr = 25.4 mm/hr</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Area</td>
                      <td className="p-2">acres (ac)</td>
                      <td className="p-2">hectares (ha)</td>
                      <td className="p-2">1 ac = 0.4047 ha</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Length</td>
                      <td className="p-2">feet (ft)</td>
                      <td className="p-2">meters (m)</td>
                      <td className="p-2">1 ft = 0.3048 m</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Pipe Diameter</td>
                      <td className="p-2">inches (in)</td>
                      <td className="p-2">millimeters (mm)</td>
                      <td className="p-2">1 in = 25.4 mm</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">Flow Rate</td>
                      <td className="p-2">CFS</td>
                      <td className="p-2">CMS (m³/s)</td>
                      <td className="p-2">1 CFS = 0.0283 CMS</td>
                    </tr>
                    <tr>
                      <td className="p-2">Infiltration Rate</td>
                      <td className="p-2">in/hr</td>
                      <td className="p-2">mm/hr</td>
                      <td className="p-2">1 in/hr = 25.4 mm/hr</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300">Unit System Persistence</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Your unit system preference is saved to browser local storage and will persist 
                  between sessions. The comparison table always shows both unit systems for reference.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Export Formats
              </CardTitle>
              <CardDescription>
                Available data export options and file formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">CSV (Comma-Separated Values)</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    Universal format compatible with Excel, Python, R, and most data analysis tools. 
                    Includes time and intensity columns with headers.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">JSON (JavaScript Object Notation)</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    Structured data format ideal for web applications and programmatic access. 
                    Includes metadata (pattern, depth, duration) alongside timeseries data.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">SWMM5 Input File (.inp)</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    Complete EPA SWMM5 input file with all required sections. Ready for immediate 
                    simulation or modification in SWMM5 GUI.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">ICM Timeseries (.csv)</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    Format compatible with Innovyze InfoWorks ICM. Uses datetime format and 
                    intensity values suitable for ICM rainfall import.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Chart Image (PNG)</h4>
                  <p className="text-muted-foreground text-sm mt-1">
                    High-resolution image of the hyetograph chart for reports and presentations. 
                    Includes axis labels, legend, and pattern identification.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Export Tips</h4>
                <ul className="text-sm text-yellow-600 dark:text-yellow-400 list-disc list-inside space-y-1 mt-2">
                  <li>CSV exports use the currently selected unit system</li>
                  <li>SWMM files automatically use compatible USA units (CFS flow)</li>
                  <li>JSON includes both raw values and formatted strings</li>
                  <li>Chart images capture the current visualization settings</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Glossary Tab */}
        <TabsContent value="glossary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Hydrology Glossary
              </CardTitle>
              <CardDescription>
                Definitions of common hydrology and stormwater modeling terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Hyetograph</h4>
                  <p className="text-muted-foreground mt-1">
                    A graph showing rainfall intensity (or depth) as a function of time during a storm event. 
                    The x-axis represents time, and the y-axis shows rainfall intensity (typically in/hr or mm/hr) 
                    or incremental depth. Hyetographs are fundamental inputs for rainfall-runoff modeling.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">IDF Curves (Intensity-Duration-Frequency)</h4>
                  <p className="text-muted-foreground mt-1">
                    Statistical relationships showing rainfall intensity for various storm durations and return periods. 
                    For example, a 10-year, 1-hour storm represents the rainfall intensity expected to occur on average 
                    once every 10 years for a 1-hour duration. IDF curves are derived from historical rainfall records 
                    and are essential for design storm selection.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Time of Concentration (Tc)</h4>
                  <p className="text-muted-foreground mt-1">
                    The time required for runoff to travel from the hydraulically most distant point in a watershed 
                    to the outlet. It represents when the entire watershed is contributing to flow at the outlet. 
                    Common estimation methods include Kirpich, FAA, and TR-55 sheet/shallow/channel flow equations. 
                    Tc is critical for selecting appropriate storm duration.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Return Period (Recurrence Interval)</h4>
                  <p className="text-muted-foreground mt-1">
                    The average time interval between storm events of equal or greater magnitude. A 100-year storm 
                    has a 1% probability of occurring in any given year (not once every 100 years). Common design 
                    return periods: 2-year (routine drainage), 10-year (minor system), 25-100 year (major system/detention).
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Runoff Coefficient (C)</h4>
                  <p className="text-muted-foreground mt-1">
                    The ratio of runoff to rainfall, representing the fraction of precipitation that becomes direct runoff. 
                    Values range from 0.05-0.35 for pervious surfaces (lawns, forests) to 0.70-0.95 for impervious surfaces 
                    (pavement, roofs). Used in the Rational Method: Q = CiA.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Curve Number (CN)</h4>
                  <p className="text-muted-foreground mt-1">
                    An empirical parameter (0-100) used in the SCS/NRCS method to estimate direct runoff from rainfall. 
                    Higher CNs indicate more runoff. CN depends on soil type (Hydrologic Soil Group A-D), land cover, 
                    and antecedent moisture conditions. CN=100 represents a completely impervious surface.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Hydrologic Soil Group (HSG)</h4>
                  <p className="text-muted-foreground mt-1">
                    NRCS classification of soils based on infiltration characteristics. Group A: High infiltration 
                    (sand, gravel). Group B: Moderate infiltration (silt loam). Group C: Low infiltration (sandy clay loam). 
                    Group D: Very low infiltration (clay). HSG affects runoff estimation and infiltration modeling.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Unit Hydrograph</h4>
                  <p className="text-muted-foreground mt-1">
                    The direct runoff hydrograph resulting from 1 inch (or 1 mm) of effective rainfall uniformly 
                    distributed over a watershed for a specified duration. Based on the principle of linearity and 
                    superposition, allowing scaling and addition of hydrographs for varying rainfall amounts.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Horton Infiltration</h4>
                  <p className="text-muted-foreground mt-1">
                    An empirical infiltration model where infiltration capacity decreases exponentially from an initial 
                    maximum rate (f₀) to a minimum rate (fc) as soil becomes saturated. Formula: f(t) = fc + (f₀ - fc)e^(-kt), 
                    where k is decay constant. Used in SWMM for continuous simulation.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Manning's n (Roughness Coefficient)</h4>
                  <p className="text-muted-foreground mt-1">
                    A coefficient representing surface roughness affecting flow velocity in open channels and overland flow. 
                    Lower values (0.011-0.015) for smooth surfaces like concrete/asphalt. Higher values (0.15-0.40) for 
                    dense vegetation. Used in Manning's equation: V = (1.49/n)R^(2/3)S^(1/2) (US) or V = (1/n)R^(2/3)S^(1/2) (SI).
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Depression Storage</h4>
                  <p className="text-muted-foreground mt-1">
                    The volume of rainfall stored in surface depressions (puddles, low spots) before runoff begins. 
                    Must be filled before overland flow occurs. Typical values: 0.05-0.1 inches for impervious surfaces, 
                    0.1-0.3 inches for pervious surfaces. Depends on surface micro-topography.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Peak Discharge (Qp)</h4>
                  <p className="text-muted-foreground mt-1">
                    The maximum instantaneous flow rate during a storm event, typically measured in cfs (cubic feet per second) 
                    or cms (cubic meters per second). Critical for sizing drainage infrastructure, culverts, and channels. 
                    Often estimated using the Rational Method (Q=CiA) for small watersheds.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Temporal Distribution</h4>
                  <p className="text-muted-foreground mt-1">
                    The pattern of how total rainfall depth is distributed over the storm duration. Different distributions 
                    (SCS Type II, Huff, Chicago) produce different hydrographs even with the same total depth. 
                    Peak position significantly affects peak runoff timing and magnitude.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Antecedent Moisture Condition (AMC)</h4>
                  <p className="text-muted-foreground mt-1">
                    Soil moisture level before a storm event, affecting infiltration and runoff. AMC I: Dry conditions 
                    (lowest runoff). AMC II: Average conditions (typical design assumption). AMC III: Wet/saturated 
                    conditions (highest runoff). Adjustments to CN values account for different AMCs.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Rational Method</h4>
                  <p className="text-muted-foreground mt-1">
                    A simple peak flow estimation method: Q = CiA, where Q is peak discharge, C is runoff coefficient, 
                    i is rainfall intensity (for duration = Tc), and A is drainage area. Valid for watersheds up to 
                    200-300 acres with relatively uniform characteristics. Does not produce a full hydrograph.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-foreground">Design Storm</h4>
                  <p className="text-muted-foreground mt-1">
                    A hypothetical storm event used for engineering design, defined by total depth, duration, 
                    temporal distribution, and return period. Selected based on project requirements, local regulations, 
                    and downstream impacts. Common examples: 10-year 24-hour SCS Type II storm.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-primary" />
                Example Calculations
              </CardTitle>
              <CardDescription>
                Step-by-step examples for determining storm parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Example 1 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Example 1: Small Urban Development Site
                </h3>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Problem Statement</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    A 15-acre commercial development in Atlanta, Georgia requires storm drainage design. 
                    The site is relatively flat (1.5% slope) with Type B soils. Determine appropriate storm 
                    parameters for sizing the on-site drainage system.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 1: Determine Time of Concentration</h4>
                    <p className="text-muted-foreground mt-2">
                      Using the FAA method for overland flow: Tc = 1.8(1.1 - C)√L / S^(1/3)
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border font-mono text-sm">
                      <p>Flow length (L) = 800 ft</p>
                      <p>Slope (S) = 1.5% = 0.015</p>
                      <p>Runoff coefficient (C) = 0.85 (commercial)</p>
                      <p className="mt-2">Tc = 1.8 × (1.1 - 0.85) × √800 / (0.015)^(1/3)</p>
                      <p>Tc = 1.8 × 0.25 × 28.3 / 0.247</p>
                      <p className="font-semibold">Tc ≈ 52 minutes</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 2: Select Storm Duration</h4>
                    <p className="text-muted-foreground mt-2">
                      Storm duration should equal or exceed the time of concentration to ensure 
                      the entire watershed contributes to peak flow.
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border">
                      <p className="text-sm">Tc = 52 minutes → <strong>Use 1-hour (60-minute) storm duration</strong></p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Round up to standard duration for IDF curve lookup
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 3: Select Return Period</h4>
                    <p className="text-muted-foreground mt-2">
                      For commercial site minor drainage (inlets, pipes): 10-year return period<br />
                      For detention basin/major system: 25-year or 100-year per local requirements
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border">
                      <p className="text-sm"><strong>Selected: 10-year return period</strong> for pipe sizing</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 4: Determine Rainfall Depth</h4>
                    <p className="text-muted-foreground mt-2">
                      From Atlanta IDF data (NOAA Atlas 14):
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border">
                      <p className="text-sm">10-year, 1-hour rainfall depth for Atlanta = <strong>2.5 inches</strong></p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 5: Select Temporal Distribution</h4>
                    <p className="text-muted-foreground mt-2">
                      Georgia (Gulf/Atlantic region) → <strong>SCS Type III</strong> recommended for tropical influence<br />
                      Alternative: <strong>SCS Type II</strong> for inland areas or more conservative design
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 6: Select Time Step</h4>
                    <p className="text-muted-foreground mt-2">
                      For accurate hydrograph resolution: Δt ≤ Tc/5
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border">
                      <p className="text-sm">52 min / 5 = 10.4 min → <strong>Use 5-minute time step</strong></p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-300">Final Parameters for This Tool</h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 mt-2 space-y-1">
                    <li>• <strong>Pattern:</strong> SCS Type III</li>
                    <li>• <strong>Total Depth:</strong> 2.5 inches</li>
                    <li>• <strong>Duration:</strong> 1 hour (60 minutes)</li>
                    <li>• <strong>Time Step:</strong> 5 minutes</li>
                  </ul>
                </div>
              </div>

              {/* Example 2 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Example 2: Regional Detention Basin
                </h3>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Problem Statement</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    A 500-acre watershed in Kansas City, Missouri requires a regional detention basin. 
                    The watershed has mixed land use with an average slope of 2.5% and primarily 
                    Type C soils. Determine storm parameters for detention design.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 1: Determine Time of Concentration</h4>
                    <p className="text-muted-foreground mt-2">
                      For larger watersheds, use TR-55 segmental method (sheet + shallow + channel flow):
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border font-mono text-sm">
                      <p>Sheet flow: 300 ft @ 2% slope, n=0.15 (grass) → Tt1 = 24 min</p>
                      <p>Shallow concentrated: 2,500 ft @ 2.5% → Tt2 = 22 min</p>
                      <p>Channel flow: 8,000 ft @ 1% slope → Tt3 = 75 min</p>
                      <p className="mt-2 font-semibold">Tc = 24 + 22 + 75 = 121 min ≈ 2 hours</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 2: Select Storm Duration</h4>
                    <p className="text-muted-foreground mt-2">
                      For detention design, use 24-hour storm regardless of Tc to capture full 
                      hydrograph volume. This is standard practice for storage facility design.
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border">
                      <p className="text-sm"><strong>Use 24-hour storm duration</strong> (standard for detention)</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 3: Select Return Periods</h4>
                    <p className="text-muted-foreground mt-2">
                      Multiple return periods typically required for detention design:
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border text-sm">
                      <p>• <strong>2-year:</strong> Channel protection volume</p>
                      <p>• <strong>10-year:</strong> Overbank flood protection</p>
                      <p>• <strong>100-year:</strong> Extreme flood/emergency spillway</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 4: Determine Rainfall Depths</h4>
                    <p className="text-muted-foreground mt-2">
                      From Kansas City IDF data (NOAA Atlas 14), 24-hour depths:
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border text-sm">
                      <p>• 2-year: <strong>3.2 inches</strong></p>
                      <p>• 10-year: <strong>4.8 inches</strong></p>
                      <p>• 100-year: <strong>7.5 inches</strong></p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 5: Select Temporal Distribution</h4>
                    <p className="text-muted-foreground mt-2">
                      Missouri (Midwest) → <strong>SCS Type II</strong> per TR-55 regional map
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 6: Select Time Step</h4>
                    <p className="text-muted-foreground mt-2">
                      For 24-hour storms with routing: Δt = 15-30 minutes provides adequate resolution
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border">
                      <p className="text-sm"><strong>Use 15-minute time step</strong></p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-300">Final Parameters for 100-year Design Storm</h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 mt-2 space-y-1">
                    <li>• <strong>Pattern:</strong> SCS Type II</li>
                    <li>• <strong>Total Depth:</strong> 7.5 inches</li>
                    <li>• <strong>Duration:</strong> 24 hours</li>
                    <li>• <strong>Time Step:</strong> 15 minutes</li>
                  </ul>
                </div>
              </div>

              {/* Example 3 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Example 3: Urban Storm Sewer Design (Chicago Method)
                </h3>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-300">Problem Statement</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    Design a storm sewer system for a 25-acre urban infill site in Chicago, Illinois. 
                    The site will be 85% impervious with a maximum flow path of 1,200 feet. 
                    Local code requires using the Chicago Storm method for design.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 1: Estimate Time of Concentration</h4>
                    <p className="text-muted-foreground mt-2">
                      For urban areas with high imperviousness, use inlet time + pipe travel time:
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border font-mono text-sm">
                      <p>Inlet time (overland to first inlet): 5-10 min typical</p>
                      <p>Pipe travel: L/V = 1,200 ft / (5 ft/s) = 4 min</p>
                      <p className="font-semibold mt-2">Tc ≈ 10 + 4 = 14 minutes</p>
                      <p className="text-muted-foreground mt-1">Use minimum of 10 min per most codes</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 2: Select Storm Duration</h4>
                    <p className="text-muted-foreground mt-2">
                      For Chicago Storm method, duration is typically 2× to 3× the Tc to capture 
                      adequate storm buildup and recession.
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border">
                      <p className="text-sm">Tc = 14 min → <strong>Use 30-minute storm duration</strong></p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 3: Obtain IDF Parameters</h4>
                    <p className="text-muted-foreground mt-2">
                      Chicago IDF equation form: i = a/(t+b)^c
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border text-sm">
                      <p>For 10-year return period (typical sewer design):</p>
                      <p>a = 96.6, b = 17.0, c = 0.89</p>
                      <p className="mt-2">At t = 30 min: i = 96.6/(30+17)^0.89 = <strong>3.2 in/hr</strong></p>
                      <p>Total depth = 3.2 in/hr × 0.5 hr = <strong>1.6 inches</strong></p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 4: Chicago Storm Parameters</h4>
                    <p className="text-muted-foreground mt-2">
                      The advancement ratio (r) determines peak position:
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border text-sm">
                      <p>Standard r = 0.375 (peak at 37.5% of duration)</p>
                      <p>For 30-min storm: Peak at 0.375 × 30 = <strong>11.25 minutes</strong></p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground">Step 5: Select Time Step</h4>
                    <p className="text-muted-foreground mt-2">
                      For short-duration urban storms: Δt ≤ 2-3 minutes recommended
                    </p>
                    <div className="mt-2 p-3 bg-background rounded border">
                      <p className="text-sm"><strong>Use 2-minute time step</strong></p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-300">Final Parameters for This Tool</h4>
                  <ul className="text-sm text-green-600 dark:text-green-400 mt-2 space-y-1">
                    <li>• <strong>Pattern:</strong> Chicago Storm</li>
                    <li>• <strong>Total Depth:</strong> 1.6 inches</li>
                    <li>• <strong>Duration:</strong> 30 minutes (0.5 hours)</li>
                    <li>• <strong>Time Step:</strong> 2 minutes</li>
                  </ul>
                </div>
              </div>

              {/* Summary Table */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2 mb-4">
                  Parameter Selection Summary
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-semibold">Parameter</th>
                        <th className="text-left p-3 font-semibold">Selection Criteria</th>
                        <th className="text-left p-3 font-semibold">Common Sources</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b">
                        <td className="p-3 font-medium text-foreground">Storm Duration</td>
                        <td className="p-3">≥ Time of concentration (Tc) for peak flow; 24-hr for detention</td>
                        <td className="p-3">Calculated from watershed geometry</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium text-foreground">Return Period</td>
                        <td className="p-3">Based on infrastructure type and local codes</td>
                        <td className="p-3">Local drainage manual, state DOT</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium text-foreground">Rainfall Depth</td>
                        <td className="p-3">From IDF curves for selected duration and return period</td>
                        <td className="p-3">NOAA Atlas 14, state climatologist</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium text-foreground">Temporal Pattern</td>
                        <td className="p-3">Regional standard (SCS type based on location)</td>
                        <td className="p-3">TR-55, local drainage manual</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium text-foreground">Time Step</td>
                        <td className="p-3">≤ Tc/5 for adequate resolution; 5-15 min typical</td>
                        <td className="p-3">Model requirements, computational needs</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-300">Important Notes</h4>
                <ul className="text-sm text-yellow-600 dark:text-yellow-400 list-disc list-inside space-y-1 mt-2">
                  <li>Always verify parameters with local drainage criteria and regulations</li>
                  <li>Use NOAA Atlas 14 (hdsc.nws.noaa.gov) for current precipitation frequency data</li>
                  <li>Consider climate change factors for long-design-life infrastructure</li>
                  <li>Document all assumptions and data sources for project records</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Tc Calculator */}
          <TcCalculator />

          {/* IDF Lookup Tool */}
          <IdfLookup />

          {/* Curve Number Calculator */}
          <CurveNumberCalculator onCNChange={handleCNChange} />

          {/* Runoff Volume Calculator */}
          <RunoffCalculator linkedCN={linkedCN} linkedArea={linkedArea} onRunoffChange={handleRunoffChange} />

          {/* Rational Method Calculator */}
          <RationalMethodCalculator />

          {/* Detention Pond Calculator */}
          <DetentionPondCalculator linkedRunoffVolume={linkedRunoffDepth} />

          {/* Outlet Structure Calculator */}
          <OutletStructureCalculator />

          {/* Stage-Storage-Discharge Curves */}
          <StageStorageDischarge onExportData={handleSSOExport} />

          {/* Unit Hydrograph Calculator */}
          <UnitHydrographCalculator onExportHydrograph={handleHydrographExport} />

          {/* Modified Puls Pond Routing */}
          <ModifiedPulsRouting importedSSOData={routingSSOData} importedInflowData={routingInflowData} />

          {/* Pre/Post Development Comparison */}
          <PrePostDevelopmentComparison />

          {/* LID / Green Infrastructure Calculator */}
          <LIDCalculator />

          {/* Treatment Train Calculator */}
          <TreatmentTrainCalculator />
        </TabsContent>
      </Tabs>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
          <CardDescription>Common design storm parameters by application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Application</th>
                  <th className="text-left p-2 font-semibold">Typical Duration</th>
                  <th className="text-left p-2 font-semibold">Recommended Pattern</th>
                  <th className="text-left p-2 font-semibold">Time Step</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="p-2">Small Urban Catchment</td>
                  <td className="p-2">1-3 hours</td>
                  <td className="p-2">Chicago, Huff 2nd</td>
                  <td className="p-2">5-10 min</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Medium Watershed</td>
                  <td className="p-2">6-12 hours</td>
                  <td className="p-2">SCS Type II, Huff</td>
                  <td className="p-2">15 min</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Large Watershed</td>
                  <td className="p-2">24 hours</td>
                  <td className="p-2">SCS Type II/III</td>
                  <td className="p-2">30-60 min</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Detention Basin</td>
                  <td className="p-2">24 hours</td>
                  <td className="p-2">SCS Type II</td>
                  <td className="p-2">15-30 min</td>
                </tr>
                <tr>
                  <td className="p-2">Coastal/Tropical</td>
                  <td className="p-2">6-24 hours</td>
                  <td className="p-2">SCS Type III, Huff 4th</td>
                  <td className="p-2">15 min</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
