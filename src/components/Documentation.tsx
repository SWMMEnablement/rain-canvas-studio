import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import LIDCalculator, { LIDBMPExport } from "./LIDCalculator";
import TreatmentTrainCalculator, { ImportedBMP } from "./TreatmentTrainCalculator";
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
  FlaskConical,
  Search,
  ChevronDown,
  List,
  Leaf,
  PipetteIcon,
  type LucideIcon
} from "lucide-react";

// Calculator categories
type CalculatorCategory = 'hydrology' | 'hydraulics' | 'water-quality';

const CALCULATOR_CATEGORIES: { id: CalculatorCategory; name: string; color: string; icon: LucideIcon; description: string }[] = [
  { id: 'hydrology', name: 'Hydrology', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20', icon: Droplets, description: 'Rainfall analysis, runoff calculations, curve numbers, and hydrograph generation' },
  { id: 'hydraulics', name: 'Hydraulics', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20', icon: PipetteIcon, description: 'Detention ponds, outlet structures, stage-storage curves, and flow routing' },
  { id: 'water-quality', name: 'Water Quality', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20', icon: Leaf, description: 'LID/green infrastructure BMPs and treatment train pollutant removal' },
];

// Calculator metadata for search/filter
const CALCULATOR_METADATA: { id: string; name: string; keywords: string[]; category: CalculatorCategory }[] = [
  { id: 'tc', name: 'Time of Concentration', keywords: ['tc', 'travel time', 'kirpich', 'faa', 'nrcs', 'lag'], category: 'hydrology' },
  { id: 'idf', name: 'IDF Lookup', keywords: ['idf', 'intensity', 'duration', 'frequency', 'rainfall', 'noaa', 'atlas'], category: 'hydrology' },
  { id: 'cn', name: 'Curve Number', keywords: ['cn', 'curve number', 'scs', 'nrcs', 'soil', 'land use', 'hydrologic'], category: 'hydrology' },
  { id: 'runoff', name: 'Runoff Volume', keywords: ['runoff', 'volume', 'depth', 'scs', 'rainfall excess'], category: 'hydrology' },
  { id: 'rational', name: 'Rational Method', keywords: ['rational', 'peak flow', 'intensity', 'coefficient', 'q=cia'], category: 'hydrology' },
  { id: 'detention', name: 'Detention Pond', keywords: ['detention', 'pond', 'basin', 'storage', 'sizing'], category: 'hydraulics' },
  { id: 'outlet', name: 'Outlet Structure', keywords: ['outlet', 'orifice', 'weir', 'riser', 'discharge', 'hydraulics'], category: 'hydraulics' },
  { id: 'ssd', name: 'Stage-Storage-Discharge', keywords: ['stage', 'storage', 'discharge', 'elevation', 'curve', 'pond'], category: 'hydraulics' },
  { id: 'hydrograph', name: 'Unit Hydrograph', keywords: ['unit hydrograph', 'nrcs', 'triangular', 'dimensionless', 'inflow'], category: 'hydrology' },
  { id: 'puls', name: 'Modified Puls Routing', keywords: ['puls', 'routing', 'pond', 'reservoir', 'attenuation', 'flood'], category: 'hydraulics' },
  { id: 'prepost', name: 'Pre/Post Development', keywords: ['pre', 'post', 'development', 'comparison', 'peak', 'detention'], category: 'hydrology' },
  { id: 'lid', name: 'LID / Green Infrastructure', keywords: ['lid', 'green', 'infrastructure', 'bmp', 'bioretention', 'permeable', 'swale'], category: 'water-quality' },
  { id: 'train', name: 'Treatment Train', keywords: ['treatment', 'train', 'pollutant', 'removal', 'water quality', 'tss', 'bmp'], category: 'water-quality' },
];

export function Documentation() {
  const [linkedCN, setLinkedCN] = useState<number | null>(null);
  const [linkedArea, setLinkedArea] = useState<number>(0);
  const [linkedRunoffDepth, setLinkedRunoffDepth] = useState<number>(0);
  
  // State for routing data transfer
  const [routingSSOData, setRoutingSSOData] = useState<StorageOutflowPoint[] | undefined>(undefined);
  const [routingInflowData, setRoutingInflowData] = useState<InflowPoint[] | undefined>(undefined);
  
  // State for LID to Treatment Train data transfer
  const [treatmentTrainBMPs, setTreatmentTrainBMPs] = useState<ImportedBMP[] | undefined>(undefined);
  
  // Calculator search state
  const [calculatorSearch, setCalculatorSearch] = useState<string>('');
  const [indexOpen, setIndexOpen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory | null>(null);

  // Filter function for calculators
  const isCalculatorVisible = useMemo(() => {
    const searchLower = calculatorSearch.toLowerCase().trim();
    
    return (id: string) => {
      const calc = CALCULATOR_METADATA.find(c => c.id === id);
      if (!calc) return true;
      
      // Category filter
      if (activeCategory && calc.category !== activeCategory) return false;
      
      // Search filter
      if (!searchLower) return true;
      return calc.name.toLowerCase().includes(searchLower) || 
             calc.keywords.some(k => k.toLowerCase().includes(searchLower));
    };
  }, [calculatorSearch, activeCategory]);

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

  const handleLIDExport = (bmps: LIDBMPExport[]) => {
    setTreatmentTrainBMPs(bmps);
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-6 h-6 text-primary" />
            About World Rainfall Pattern Painter
          </CardTitle>
          <CardDescription>
            Comprehensive synthetic rainfall generation for stormwater modeling
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            <strong>World Rainfall Pattern Painter</strong> is a tool designed for hydrologists, 
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
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 h-auto">
          <TabsTrigger value="patterns" className="flex items-center gap-1">
            <CloudRain className="w-4 h-4" />
            <span className="hidden sm:inline">Patterns</span>
          </TabsTrigger>
          <TabsTrigger value="calculators" className="flex items-center gap-1">
            <FlaskConical className="w-4 h-4" />
            <span className="hidden sm:inline">Calculators</span>
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
                      <Badge variant="secondary" className="ml-2">9 Regions</Badge>
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

                {/* US Agency Patterns */}
                <AccordionItem value="us_agency">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-500" />
                      US Agency Patterns
                      <Badge variant="secondary" className="ml-2">9 Types</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      State and federal agency-specific design storm patterns required for regulatory compliance 
                      on transportation and infrastructure projects across the United States.
                    </p>

                    <div className="grid gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-foreground">FDOT Zone 1 — Northwest Florida (Panhandle)</h4>
                        <p className="text-muted-foreground">
                          Covers Escambia to Jefferson counties. Reflects temperate Gulf Coast rainfall with moderate 
                          front-loading. Peak intensity occurs at approximately 40% of storm duration. Zone 1 has the 
                          lowest peak-to-average ratio among FDOT zones (~3.5:1 for 24-hr storms), consistent with 
                          frontal system dominance in the panhandle region.
                        </p>
                        <p className="text-muted-foreground"><strong>Typical design:</strong> 24-hr storm, 25-yr or 100-yr return period</p>
                        <p className="text-muted-foreground"><strong>Reference:</strong> FDOT Drainage Manual (2024), Chapter 2, Table 2.3.1</p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-foreground">FDOT Zone 2 — North Central Florida</h4>
                        <p className="text-muted-foreground">
                          Covers the Suwannee River basin through Alachua and Putnam counties. Transitional zone 
                          between temperate and subtropical influences. Slightly more peaked than Zone 1 with ~45% 
                          of rainfall in the central third of the storm. Peak-to-average ratio ~4.0:1.
                        </p>
                        <p className="text-muted-foreground"><strong>Reference:</strong> FDOT Drainage Manual (2024), Chapter 2</p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-foreground">FDOT Zone 3 — Central Florida</h4>
                        <p className="text-muted-foreground">
                          Covers the I-4 corridor (Orlando, Tampa metro areas). Strong convective influence from 
                          the sea breeze convergence zone. Peak-to-average ratio ~4.5:1. Approximately 50% of total 
                          depth falls in the central 20% of the storm duration, making it significantly more peaked 
                          than northern zones.
                        </p>
                        <p className="text-muted-foreground"><strong>Reference:</strong> FDOT Drainage Manual (2024), Chapter 2</p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-foreground">FDOT Zone 4 — Southeast Florida (Atlantic Coast)</h4>
                        <p className="text-muted-foreground">
                          Covers Brevard through Palm Beach counties. Tropical and subtropical convective dominance 
                          with intense, short-duration bursts. Peak-to-average ratio ~5.0:1. The most intense zone 
                          on the Atlantic side, heavily influenced by tropical moisture and easterly wave activity.
                        </p>
                        <p className="text-muted-foreground"><strong>Reference:</strong> FDOT Drainage Manual (2024), Chapter 2</p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-foreground">FDOT Zone 5 — Southwest Florida</h4>
                        <p className="text-muted-foreground">
                          Covers Lee, Collier, and Monroe counties (Naples, Fort Myers, Keys). The most front-loaded 
                          FDOT distribution. Peak-to-average ratio ~5.5:1, reflecting extreme tropical convective 
                          activity and proximity to warm Gulf waters. Over 60% of rainfall occurs in the first 40% 
                          of storm duration. Required for Everglades restoration project drainage design.
                        </p>
                        <p className="text-muted-foreground"><strong>Reference:</strong> FDOT Drainage Manual (2024), Chapter 2</p>
                      </div>

                      <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800 text-xs text-blue-600 dark:text-blue-400">
                        <strong>FDOT Note:</strong> All five zones are mandatory for FDOT drainage submittals. Zone boundaries 
                        are defined by county — check the FDOT Drainage Manual Figure 2.3.1 for the official map. 
                        FDOT requires the 24-hr Nested (NRCS) design storm with zone-specific temporal distributions.
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-foreground">TxDOT (Texas)</h4>
                        <p className="text-muted-foreground">
                          Texas DOT dimensionless hyetograph derived from USGS analysis of over 1,600 Texas 
                          recording rain gauge stations (SIR 2004-5075, Williams-Sether et al.). The distribution 
                          is depth-duration-frequency independent — the same dimensionless shape applies to all 
                          return periods and durations from 0.5 to 24 hours.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Characteristics:</strong> Center-peaked with ~55% of depth in the central 30% of 
                          duration. Peak intensity ratio approximately 4.2:1. Less peaked than SCS Type II for 
                          short durations but more peaked for durations exceeding 12 hours. Applicable statewide — 
                          TxDOT does not use regional sub-zones.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Required for:</strong> All TxDOT hydraulic design submittals, including bridge 
                          scour, culvert sizing, and roadway drainage. Supersedes SCS distributions for TxDOT projects.
                        </p>
                        <p className="text-muted-foreground"><strong>Reference:</strong> TxDOT Hydraulic Design Manual (2023), Chapter 4; USGS SIR 2004-5075</p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-foreground">NOAA Atlas 14 Temporal Distribution</h4>
                        <p className="text-muted-foreground">
                          Site-specific temporal distributions derived from the NOAA Precipitation Frequency Data Server 
                          (PFDS). Unlike SCS patterns which use fixed shapes, Atlas 14 distributions are based on 
                          statistical analysis of actual L-moment ratios from local recording gauges, providing 
                          location-specific 10th, 25th, 50th, 75th, and 90th percentile temporal patterns.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Method:</strong> The tool uses the 50th percentile (median) temporal distribution. 
                          Cumulative rainfall fractions are interpolated from NOAA's dimensionless mass curves for the 
                          user's selected duration. This produces a balanced, site-specific hyetograph that avoids the 
                          conservatism of SCS distributions in regions where they don't apply.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Coverage:</strong> CONUS (Volumes 1–11), Alaska (Vol. 7), Hawaii (Vol. 4), 
                          selected Pacific Islands, Puerto Rico/USVI (Vol. 3). Supersedes TP-40, HYDRO-35, and 
                          NWS Technical Memorandum NOAA TM NWS HYDRO-35.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>When to use:</strong> Preferred over SCS distributions when local Atlas 14 data is 
                          available and the reviewing agency accepts site-specific distributions. Many state agencies 
                          (e.g., VDOT, NCDOT) now require or prefer Atlas 14 over SCS.
                        </p>
                        <p className="text-muted-foreground"><strong>Reference:</strong> NOAA Atlas 14, Volumes 1–11; Bonnin et al. (2006)</p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-foreground">UDFCD Denver 2-Hour Storm</h4>
                        <p className="text-muted-foreground">
                          The Urban Drainage and Flood Control District (UDFCD) 2-hour design storm is the standard 
                          for the Denver metropolitan area and surrounding Colorado Front Range communities. Developed 
                          from analysis of Colorado's unique semi-arid convective storm climatology, where short, 
                          intense thunderstorms dominate the rainfall regime.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Characteristics:</strong> Strongly front-loaded — approximately 60% of total depth 
                          falls in the first 30 minutes (first quarter). Peak 5-minute intensity can reach 6–8× the 
                          average intensity. This extreme front-loading reflects Colorado's "cloudburst" convective 
                          cells that form along the Front Range orographic trigger.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Jurisdiction:</strong> Required for all projects within UDFCD's service area 
                          (Adams, Arapahoe, Boulder, Broomfield, Denver, Douglas, and Jefferson counties). The 
                          UDFCD criteria manual also specifies a separate 6-hour storm for larger watersheds.
                        </p>
                        <p className="text-muted-foreground"><strong>Reference:</strong> UDFCD Urban Storm Drainage Criteria Manual, Vol. 1 (2020), Section 5.5</p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h4 className="font-semibold text-foreground">USACE Standard Project Storm (SPS)</h4>
                        <p className="text-muted-foreground">
                          The US Army Corps of Engineers Standard Project Storm represents an envelope of the most 
                          severe storms observed in a region, used for dam safety evaluation and major flood control 
                          project design. The SPS depth is typically 40–60% of the Probable Maximum Precipitation (PMP) 
                          for the same duration and area.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Temporal distribution:</strong> Broader, flatter peak than SCS distributions, 
                          reflecting the large-area, long-duration storms that drive dam safety analysis. The 
                          temporal pattern follows a center-weighted distribution with approximately 40% of depth 
                          in the central third and gradual tails extending to 72 or 96 hours for large basin studies.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Application:</strong> Dam safety (Inflow Design Flood), levee certification, 
                          major reservoir spillway design, and USACE Civil Works projects. Often paired with 
                          snowmelt for spring-season dam safety scenarios in northern states.
                        </p>
                        <p className="text-muted-foreground">
                          <strong>Note:</strong> The SPS is being phased out in favor of site-specific flood 
                          frequency analysis and risk-informed approaches per USACE ER 1110-2-1156 (2014). However, 
                          it remains in use for screening-level assessments and where historical precedent applies.
                        </p>
                        <p className="text-muted-foreground"><strong>Reference:</strong> USACE EM 1110-2-1411; EM 1110-2-1417; HMR 51/52</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* UK/ICM Patterns */}
                <AccordionItem value="uk_icm">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      UK / InfoWorks ICM Patterns
                      <Badge variant="secondary" className="ml-2">4 Types</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      Design storm profiles used in UK drainage practice and compatible with Innovyze InfoWorks ICM 
                      modeling software. These patterns are the foundation of British flood estimation and urban 
                      drainage design, ranging from the original 1975 Flood Studies Report through the modern 
                      Flood Estimation Handbook methodology.
                    </p>

                    <div className="grid gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">FSR Profile (Flood Studies Report)</h4>
                        <p className="text-muted-foreground">
                          The original UK standard design storm profile developed by the Natural Environment Research 
                          Council (NERC) in 1975. Features a symmetric bell-shaped distribution with peak intensity 
                          at the centre of the storm. The FSR summer profile has a sharper peak (75% of rain in 
                          central third) while the winter profile is broader and flatter (60% in central third), 
                          reflecting frontal vs. convective dominance.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          The FSR method uses an areal reduction factor (ARF) and a storm duration linked to the 
                          catchment time of concentration. Despite being superseded by FEH, FSR profiles remain 
                          widely accepted by UK water authorities and are the default in many InfoWorks ICM 
                          project templates.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Typical application:</strong> UK greenfield and brownfield drainage design, Sewers 
                          for Adoption assessments, Environment Agency flood risk assessments (legacy projects).
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> NERC Flood Studies Report, Volume II — Meteorological Studies (1975); 
                          Wallingford Procedure for Design and Analysis of Urban Storm Drainage (1981)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">FEH (Flood Estimation Handbook)</h4>
                        <p className="text-muted-foreground">
                          The modern successor to FSR, published by the Centre for Ecology & Hydrology (CEH) 
                          Wallingford in 1999 with major updates in 2013 (FEH13). FEH uses updated depth-duration-frequency 
                          (DDF) rainfall statistics derived from a much larger rain gauge network and longer record 
                          periods than FSR.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          The FEH temporal profile is asymmetric with a slightly earlier peak than FSR, better 
                          representing observed UK storm characteristics. It employs a 50% summer/winter split 
                          profile and integrates with the FEH rainfall DDF model for site-specific design depths. 
                          The FEH Supplementary Report No. 1 (2015) provides revised ARFs and improved small 
                          catchment estimates.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Typical application:</strong> Current best practice for all UK flood estimation, 
                          Environment Agency requirements, SuDS design per CIRIA C753, and all new InfoWorks ICM models.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Climate change:</strong> UK Environment Agency guidance (2022) requires +40% uplift 
                          for the 2070s epoch (upper end) on peak rainfall for most development types.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> Flood Estimation Handbook, CEH Wallingford (1999, updated 2013); 
                          FEH Supplementary Reports 1–3; EA Climate Change Allowances (2022)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Triangular (UK Practice)</h4>
                        <p className="text-muted-foreground">
                          Simple triangular hyetograph with linear rise to peak and linear recession. The peak 
                          position is typically set at one-third of the storm duration (r = 0.33), producing a 
                          front-loaded profile consistent with short-duration convective events common in UK summers.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          The triangular profile preserves total rainfall depth while providing a realistic 
                          intensity variation with minimal parameterisation. It is computationally efficient and 
                          widely used for preliminary sewer network sizing in InfoWorks ICM, particularly when 
                          detailed FSR/FEH profiles are not yet warranted.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Typical application:</strong> Preliminary drainage design, sensitivity analysis, 
                          small catchment studies, and InfoWorks ICM quick-run scenarios.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> BS EN 752:2017 — Drain and Sewer Systems Outside Buildings; 
                          Innovyze InfoWorks ICM Technical Reference Manual
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Trapezoidal</h4>
                        <p className="text-muted-foreground">
                          Combines a rising limb, sustained peak-intensity plateau, and falling limb. The plateau 
                          typically spans 20–40% of the total storm duration, representing sustained high-intensity 
                          rainfall from well-developed convective systems or slow-moving frontal bands.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          The trapezoidal profile generates higher peak runoff volumes than a triangular profile 
                          of the same total depth because the sustained plateau prevents attenuation through 
                          storage. This makes it a conservative choice for critical infrastructure such as 
                          pumping stations and CSO chambers where sustained inflow matters more than instantaneous peak.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Typical application:</strong> Pumping station design, CSO assessment, 
                          InfoWorks ICM 2D overland flow studies, and scenarios requiring sustained peak loading.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> Innovyze InfoWorks ICM Help Documentation; 
                          CIRIA Report C635 — Designing for Exceedance in Urban Drainage (2006)
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* European Patterns */}
                <AccordionItem value="european">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-500" />
                      European Patterns
                      <Badge variant="secondary" className="ml-2">4 Types</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      Design storm patterns from European national standards, widely used in continental European 
                      drainage and flood control practice.
                    </p>

                    <div className="grid gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <h4 className="font-semibold text-foreground">Euler Type I (Front-Loaded)</h4>
                        <p className="text-muted-foreground">
                          Peak intensity placed in the <strong>first interval</strong> (block 1 of <em>n</em> blocks). Used for conservative sewer 
                          design in German and European practice where maximum peak flow is critical. Produces 
                          higher peak flows than Euler Type II.
                        </p>
                        
                        <div className="bg-background rounded-md p-3 font-mono text-xs space-y-2 border">
                          <p className="text-muted-foreground not-italic font-sans text-[11px] font-medium">Mathematical Formulation</p>
                          <p>Storm divided into <em>n</em> = T/Δt equal blocks</p>
                          <p>For each block rank <em>k</em> = 1, 2, …, <em>n</em>:</p>
                          <p className="pl-4">ΔP(k) = P(k·Δt) − P((k−1)·Δt)</p>
                          <p className="text-muted-foreground font-sans text-[11px]">where P(t) is the IDF-derived cumulative depth for duration t</p>
                          <p className="mt-2 font-semibold">Peak placement — Euler Type I:</p>
                          <p className="pl-4">Block with rank 1 (highest ΔP) → position <strong>j = 1</strong> (first interval)</p>
                          <p className="pl-4">Block with rank 2 → position j = 2</p>
                          <p className="pl-4">Block with rank 3 → position j = 3</p>
                          <p className="pl-4">…remaining blocks in descending order, left to right</p>
                          <p className="mt-2">i(j) = ΔP(assigned rank) / Δt</p>
                        </div>
                        
                        <p className="text-muted-foreground text-xs">
                          <strong>Effect:</strong> Monotonically decreasing hyetograph. Maximizes peak runoff because antecedent 
                          moisture is lowest when the highest intensity occurs.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> DWA-A 118 (2006), Euler, G. "Modellregen für die Kanalnetzberechnung" (1983)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <h4 className="font-semibold text-foreground">Euler Type II (Center-Peaked)</h4>
                        <p className="text-muted-foreground">
                          Peak intensity in the <strong>second block</strong> (position j = 2, typically the second 1/6 to 1/3 of duration). 
                          The standard pattern for German drainage design per DWA guidelines. More moderate than Type I, 
                          allowing initial soil wetting before the burst.
                        </p>
                        
                        <div className="bg-background rounded-md p-3 font-mono text-xs space-y-2 border">
                          <p className="text-muted-foreground not-italic font-sans text-[11px] font-medium">Mathematical Formulation</p>
                          <p>Same IDF-derived incremental depths ΔP(k) as Type I</p>
                          <p className="mt-2 font-semibold">Peak placement — Euler Type II:</p>
                          <p className="pl-4">Block with rank 1 (highest ΔP) → position <strong>j = r</strong> (peak position, typically j = 2)</p>
                          <p className="pl-4">Ranks 2, 4, 6, … → positions j = r+1, r+2, r+3, … (right of peak)</p>
                          <p className="pl-4">Ranks 3, 5, 7, … → positions j = r−1, r−2, r−3, … (left of peak)</p>
                          <p className="mt-2 text-muted-foreground font-sans text-[11px]">This alternating arrangement produces a bell-shaped hyetograph centered near the front.</p>
                          <p className="mt-1">Default peak position: r = ⌈n / 3⌉ (DWA-A 118 recommends peak in second third)</p>
                          <p className="mt-1">When n = 6 blocks: r = 2, giving the classic "second-sixth" peak</p>
                        </div>
                        
                        <p className="text-muted-foreground text-xs">
                          <strong>Effect:</strong> Produces realistic runoff hydrographs — initial wetting period reduces immediate 
                          peak, then the high-intensity burst generates a well-defined peak flow. Preferred for combined 
                          sewer overflow analysis.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> DWA-A 531 (2012), DWA-A 118 (2006)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                        <h4 className="font-semibold text-foreground">Double Triangle (Desbordes)</h4>
                        <p className="text-muted-foreground">
                          Two triangular bursts separated by a defined low-intensity valley. Used in French and European 
                          urban drainage for modeling complex multi-cell storm systems. More realistic than 
                          single-peak patterns for longer duration events (&gt;2 hours).
                        </p>
                        
                        <div className="bg-background rounded-md p-3 font-mono text-xs space-y-2 border">
                          <p className="text-muted-foreground not-italic font-sans text-[11px] font-medium">Mathematical Formulation</p>
                          <p>Total duration T split into two triangular events:</p>
                          <p className="mt-1 font-semibold">Triangle 1 (intense burst):</p>
                          <p className="pl-4">Duration: T₁ = α·T (typically α = 0.30–0.40)</p>
                          <p className="pl-4">Depth: P₁ = β·P<sub>total</sub> (typically β = 0.60–0.70)</p>
                          <p className="pl-4">Peak: i₁<sub>max</sub> = 2·P₁ / T₁</p>
                          <p className="pl-4">Time-to-peak: t<sub>p1</sub> = r₁·T₁ (r₁ ≈ 0.4)</p>
                          <p className="mt-1 font-semibold">Valley (transition):</p>
                          <p className="pl-4">Duration: T<sub>v</sub> = γ·T (typically γ = 0.10–0.15)</p>
                          <p className="pl-4">Intensity: i<sub>valley</sub> = i<sub>base</sub> = P<sub>valley</sub> / T<sub>v</sub></p>
                          <p className="pl-4 text-muted-foreground font-sans text-[11px]">Valley depth is the remaining rainfall not assigned to the two triangles</p>
                          <p className="mt-1 font-semibold">Triangle 2 (secondary burst):</p>
                          <p className="pl-4">Duration: T₂ = T − T₁ − T<sub>v</sub></p>
                          <p className="pl-4">Depth: P₂ = P<sub>total</sub> − P₁ − P<sub>valley</sub></p>
                          <p className="pl-4">Peak: i₂<sub>max</sub> = 2·P₂ / T₂</p>
                          <p className="pl-4">Time-to-peak: t<sub>p2</sub> = r₂·T₂ (r₂ ≈ 0.5)</p>
                        </div>
                        
                        <p className="text-muted-foreground text-xs">
                          <strong>Typical parameters:</strong> α = 0.35, β = 0.65, γ = 0.10, r₁ = 0.4, r₂ = 0.5. 
                          The first triangle represents convective activity; the valley simulates a lull between 
                          cells; the second triangle represents trailing stratiform rain.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> Desbordes, M. (1978) "Urban Runoff and Design Storm Modelling", 
                          Chocat, B. (1997) "Encyclopédie de l'Hydrologie Urbaine"
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">Canadian CDA</h4>
                        <p className="text-muted-foreground">
                          Canadian Dam Association / Ontario MTO temporal pattern. Modified Type II adapted for 
                          Canadian climate with broader central peak and extended tails to account for snowmelt 
                          and longer-duration frontal systems.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> Canadian Dam Association Dam Safety Guidelines (2007, revised 2013)
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Asian Design Storms */}
                <AccordionItem value="asian">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-rose-500" />
                      Asian Design Storms
                      <Badge variant="secondary" className="ml-2">14 Patterns</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      Regional design storm patterns from major Asian national standards. These patterns reflect 
                      monsoon, typhoon, and tropical convective rainfall characteristics distinct from Western standards.
                    </p>

                    <div className="grid gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇸🇬 Singapore PUB</h4>
                        <p className="text-muted-foreground">
                          Public Utilities Board tropical convective standard. Extremely front-loaded with 70-80% of 
                          rain in first 30 minutes. Very high peak intensities exceeding 100 mm/hr. Required for all 
                          Singapore drainage design projects.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> PUB Code of Practice on Surface Water Drainage (2018)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇨🇳 China GB 50014-2021</h4>
                        <p className="text-muted-foreground">
                          Chinese national standard for urban drainage design storms. Short-duration high-peak pattern 
                          derived from city-specific rainstorm intensity formulas (i = A(1+C·log T)/(t+b)ⁿ). Coefficients 
                          available for 500+ cities. Required for all public infrastructure projects in China.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> GB 50014-2021, Ministry of Housing and Urban-Rural Development
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🌊 China Pearl River Delta</h4>
                        <p className="text-muted-foreground">
                          Typhoon-influenced distribution for the Guangzhou–Shenzhen–Hong Kong region. Front-loaded 
                          with extended tail representing outer typhoon rain bands. Accounts for both direct typhoon 
                          impacts and pre-typhoon convective cells.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> China Meteorological Administration (CMA) PRD analysis (2019)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇮🇳 India IMD (Monsoon)</h4>
                        <p className="text-muted-foreground">
                          India Meteorological Department standard. Center-peaked with gradual build-up characteristic 
                          of monsoon rainfall. Based on data from 6,000+ raingauges nationwide. Used for Smart Cities 
                          Mission drainage design and CWC dam design across India.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> IMD Rainfall Atlas of India (2020)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🌀 India Coastal (Cyclonic)</h4>
                        <p className="text-muted-foreground">
                          Very sharp early peak representing cyclone eye/eyewall passage. Used for coastal 
                          infrastructure in Tamil Nadu, Andhra Pradesh, Odisha, and Kerala. Distinct from inland 
                          monsoon patterns due to cyclonic wind-driven rainfall.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> Central Water Commission (CWC) Cyclonic Storm Standards (2018)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇯🇵 Japan AMeDAS (Convective)</h4>
                        <p className="text-muted-foreground">
                          Based on Japan's 1,300 AMeDAS (Automated Meteorological Data Acquisition System) stations. 
                          Very sharp center peak with rapid onset and recession. Represents short-duration (30min–3hr) 
                          urban convective events common in summer.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> JMA AMeDAS Rainfall Analysis Guidelines (2020)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">☔ Japan Baiu (梅雨 / Plum Rain)</h4>
                        <p className="text-muted-foreground">
                          Broader, moderate-intensity pattern representing the June–July Baiu (plum rain) seasonal 
                          front. Extended duration with less extreme peaks than convective events. Used for 
                          longer-duration drainage and river basin design.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> Japan Society of Civil Engineers (JSCE) Guidelines (2017)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🌀 Japan Typhoon (Double-Band)</h4>
                        <p className="text-muted-foreground">
                          Dual-peak pattern with two Gaussian peaks: the outer rain band (~25% of duration) and 
                          the inner eyewall (~65% of duration). Light continuous rain between bands. Used for 
                          JSCE flood control and super-levee design (August–September typhoon season).
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> JSCE Typhoon Flood Control Design Guidelines (2019)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇰🇷 Korea KMA</h4>
                        <p className="text-muted-foreground">
                          Korean Meteorological Administration standard. Center-peaked monsoon/convective hybrid 
                          with moderate asymmetry. Based on ASOS and AWS network data. Required for Ministry of 
                          Environment urban flood control design in South Korea.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> KMA Urban Flood Control Design Standards (2019)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇲🇾 Malaysia MSMA</h4>
                        <p className="text-muted-foreground">
                          Manual Saliran Mesra Alam (MSMA) 2nd Edition (2012) standard from the Department of 
                          Irrigation and Drainage (DID). Tropical monsoon + convective pattern optimized for 
                          Peninsular Malaysia and the Klang Valley urban heat island. Required for all DID drainage projects.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> MSMA 2nd Edition, DID Malaysia (2012)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇮🇩 Indonesia BMKG</h4>
                        <p className="text-muted-foreground">
                          Badan Meteorologi, Klimatologi, dan Geofisika (BMKG) tropical convective pattern. 
                          Very front-loaded Jakarta-style distribution representing wet season (Nov–Mar) events. 
                          Based on 3,000+ rainfall stations. Used for Jakarta's massive flood control projects.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> BMKG National Rainfall Database Standards (2020)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇵🇭 Philippines PAGASA</h4>
                        <p className="text-muted-foreground">
                          Philippine Atmospheric, Geophysical and Astronomical Services Administration typhoon/monsoon 
                          distribution. Very front-loaded with extended tail for typhoon events. Accounts for 
                          super-typhoon class events (&gt;220 kph, Haiyan/Yolanda class). Used for Metro Manila flood control.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> PAGASA Rainfall Intensity-Duration-Frequency Atlas (2019)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇻🇳 Vietnam IMHEN</h4>
                        <p className="text-muted-foreground">
                          Institute of Meteorology, Hydrology and Climate Change (IMHEN) monsoon/convective hybrid. 
                          Ho Chi Minh City-style moderate front-loading. Central coast variant is more typhoon-influenced 
                          (Da Nang, Hue). Used for Vietnamese Smart City drainage design.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> IMHEN National Rainfall Database and Design Standards (2018)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇹🇭 Thailand TMD</h4>
                        <p className="text-muted-foreground">
                          Thai Meteorological Department Bangkok Metropolitan Administration (BMA) pattern. 
                          Southwest monsoon (May–Oct) with urban heat island intensification. Very high intensity 
                          due to Bangkok's urban microclimate. Required for all BMA drainage projects.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> TMD/BMA Urban Drainage Design Manual (2019)
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-rose-50 dark:bg-rose-950 rounded-lg border border-rose-200 dark:border-rose-800">
                      <h4 className="font-semibold text-rose-700 dark:text-rose-300">Important Note</h4>
                      <p className="text-sm text-rose-600 dark:text-rose-400">
                        Asian engineers generally do NOT use SCS curves or Huff distributions. Each country has 
                        its own national standard (GB 50014 in China, IMD in India, PUB in Singapore, KMA in Korea). 
                        Always verify which standard is required for your specific project jurisdiction.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* GCC / Middle East Design Storms */}
                <AccordionItem value="middle_east">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-500" />
                      GCC / Middle East Design Storms
                      <Badge variant="secondary" className="ml-2">4 Patterns</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      Arid flash flood and wadi flooding patterns for the Gulf Cooperation Council (GCC) region. 
                      These patterns are extremely front-loaded compared to tropical or temperate standards, reflecting 
                      the intense, short-duration convective events typical of arid climates.
                    </p>

                    <div className="grid gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇸🇦 Saudi Arabia PME</h4>
                        <p className="text-muted-foreground">
                          Presidency of Meteorology and Environment (now NCEC) arid flash flood pattern. Extremely 
                          front-loaded Jeddah/Riyadh wadi flood distribution — most rainfall occurs in the first 20% 
                          of the storm duration. Required for MOMRA municipal drainage and Ministry of Transport wadi crossing projects.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> MOMRA Storm Drainage Design Manual; Saudi Building Code SBC 801 (2018)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇦🇪 UAE NCMS</h4>
                        <p className="text-muted-foreground">
                          National Center of Meteorology and Seismology flash flood pattern for Dubai/Abu Dhabi. 
                          Extreme burst intensity with rapid decay. Accounts for cloud seeding enhanced rainfall events 
                          that have become increasingly significant since the UAE Rain Enhancement Program.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> Abu Dhabi UPC Storm Drainage Manual; Dubai Municipality Drainage Design Guide (2020)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇶🇦 Qatar Kahramaa</h4>
                        <p className="text-muted-foreground">
                          Kahramaa/Ashghal drainage design standard for Doha urban infrastructure. Extremely arid 
                          flash flood — the shortest, most intense burst among GCC patterns. Developed for Qatar's 
                          World Cup 2022 infrastructure and Lusail City drainage networks.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> Ashghal Qatar Sewerage & Drainage Design Manual (QCS 2014)
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold text-foreground">🇴🇲 Oman DGMAN</h4>
                        <p className="text-muted-foreground">
                          Directorate General of Meteorology and Air Navigation wadi flood pattern. Covers both 
                          Muscat Shamal wind-driven events and the Salalah Khareef (monsoon) influence in Dhofar 
                          region. Slightly less front-loaded than other GCC patterns due to Khareef orographic effects.
                        </p>
                        <p className="text-muted-foreground mt-1">
                          <strong>Reference:</strong> Oman Wadi Flood Protection Design Standards; MRMWR (2017)
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                      <h4 className="font-semibold text-amber-700 dark:text-amber-300">Important Note</h4>
                      <p className="text-sm text-amber-600 dark:text-amber-400">
                        GCC flash flood patterns are significantly more front-loaded than any other region. Peak intensities 
                        occur within the first 10-20% of the storm. Wadi flooding can occur with as little as 10-15 mm of 
                        rainfall due to extremely low infiltration rates. Always use local IDF curves from the relevant 
                        national meteorological authority.
                      </p>
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

        {/* Calculators Tab */}
        <TabsContent value="calculators" className="space-y-6">
          {/* Search/Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search calculators (e.g., 'curve number', 'detention', 'BMP')..."
              value={calculatorSearch}
              onChange={(e) => setCalculatorSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">Filter by:</span>
            <TooltipProvider delayDuration={300}>
              {CALCULATOR_CATEGORIES.map((cat) => {
                const count = CALCULATOR_METADATA.filter(c => c.category === cat.id).length;
                const isActive = activeCategory === cat.id;
                const IconComponent = cat.icon;
                return (
                  <Tooltip key={cat.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setActiveCategory(isActive ? null : cat.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          isActive 
                            ? cat.color + ' ring-2 ring-offset-2 ring-offset-background' 
                            : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {cat.name}
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">{count}</Badge>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p>{cat.description}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Collapsible Calculator Index */}
          <Collapsible open={indexOpen} onOpenChange={setIndexOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <List className="w-5 h-5 text-primary" />
                      Calculator Index
                      <Badge variant="secondary" className="ml-2">{CALCULATOR_METADATA.length} tools</Badge>
                    </CardTitle>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${indexOpen ? 'rotate-180' : ''}`} />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {CALCULATOR_METADATA.map((calc, index) => (
                      <a
                        key={calc.id}
                        href={`#calc-${calc.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setCalculatorSearch('');
                          const element = document.getElementById(`calc-${calc.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors text-sm"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {index + 1}
                        </span>
                        <span className="text-foreground">{calc.name}</span>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
          
          {calculatorSearch && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing calculators matching "{calculatorSearch}"</span>
              <button 
                onClick={() => setCalculatorSearch('')}
                className="text-primary hover:underline"
              >
                Clear
              </button>
            </div>
          )}

          {!calculatorSearch && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-primary" />
                Hydrologic Calculators
              </CardTitle>
              <CardDescription>
                Interactive tools for stormwater calculations and design
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
          )}

          {/* Interactive Tc Calculator */}
          {isCalculatorVisible('tc') && <div id="calc-tc"><TcCalculator /></div>}

          {/* IDF Lookup Tool */}
          {isCalculatorVisible('idf') && <div id="calc-idf"><IdfLookup /></div>}

          {/* Curve Number Calculator */}
          {isCalculatorVisible('cn') && <div id="calc-cn"><CurveNumberCalculator onCNChange={handleCNChange} /></div>}

          {/* Runoff Volume Calculator */}
          {isCalculatorVisible('runoff') && <div id="calc-runoff"><RunoffCalculator linkedCN={linkedCN} linkedArea={linkedArea} onRunoffChange={handleRunoffChange} /></div>}

          {/* Rational Method Calculator */}
          {isCalculatorVisible('rational') && <div id="calc-rational"><RationalMethodCalculator /></div>}

          {/* Detention Pond Calculator */}
          {isCalculatorVisible('detention') && <div id="calc-detention"><DetentionPondCalculator linkedRunoffVolume={linkedRunoffDepth} /></div>}

          {/* Outlet Structure Calculator */}
          {isCalculatorVisible('outlet') && <div id="calc-outlet"><OutletStructureCalculator /></div>}

          {/* Stage-Storage-Discharge Curves */}
          {isCalculatorVisible('ssd') && <div id="calc-ssd"><StageStorageDischarge onExportData={handleSSOExport} /></div>}

          {/* Unit Hydrograph Calculator */}
          {isCalculatorVisible('hydrograph') && <div id="calc-hydrograph"><UnitHydrographCalculator onExportHydrograph={handleHydrographExport} /></div>}

          {/* Modified Puls Pond Routing */}
          {isCalculatorVisible('puls') && <div id="calc-puls"><ModifiedPulsRouting importedSSOData={routingSSOData} importedInflowData={routingInflowData} /></div>}

          {/* Pre/Post Development Comparison */}
          {isCalculatorVisible('prepost') && <div id="calc-prepost"><PrePostDevelopmentComparison /></div>}

          {/* LID / Green Infrastructure Calculator */}
          {isCalculatorVisible('lid') && <div id="calc-lid"><LIDCalculator onExportToTreatmentTrain={handleLIDExport} /></div>}

          {/* Treatment Train Calculator */}
          {isCalculatorVisible('train') && <div id="calc-train"><TreatmentTrainCalculator importedBMPs={treatmentTrainBMPs} /></div>}
          
          {calculatorSearch && !CALCULATOR_METADATA.some(c => isCalculatorVisible(c.id)) && (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No calculators found matching "{calculatorSearch}"</p>
              <button 
                onClick={() => setCalculatorSearch('')}
                className="text-primary hover:underline mt-2"
              >
                Clear search
              </button>
            </Card>
          )}
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
