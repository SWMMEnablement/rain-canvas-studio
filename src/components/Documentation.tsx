import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
  Layers
} from "lucide-react";

export function Documentation() {
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
            <strong>Rainfall Pattern Painter</strong> is a professional-grade tool designed for hydrologists, 
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
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
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
