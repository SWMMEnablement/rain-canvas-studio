import { useState, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { StormWizard, decodeStormParams } from "@/components/StormWizard";
import { patterns } from "@/components/PatternSelector";
import { AdvancedTools } from "@/components/AdvancedTools";
import { Documentation } from "@/components/Documentation";
import { RealDataHub } from "@/components/RealDataHub";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RainParticles } from "@/components/RainParticles";
import { HeroHyetograph, getHeroPatternLabel } from "@/components/HeroHyetograph";
import { StormChatbot } from "@/components/StormChatbot";
import { HeroGifExport } from "@/components/HeroGifExport";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, CloudRain, BookOpen, Wrench, Database, Code2 } from "lucide-react";
import { ApiPlayground } from "@/components/ApiPlayground";
import { toast } from "sonner";

const PATTERN_BADGES = [
  "Abu Dhabi ADM", "AES Canada 30%", "AES Canada 40%", "Argentina SMN",
  "Arid Flash Flood", "ARR 2019 Ensemble", "ARR87 Legacy", "Auckland TP108",
  "Australian ARR", "Austria ÖKOSTRA",
  "Balanced Storm", "Bangladesh BMD", "Belgium IRM", "Belgium Willems",
  "Block Pattern", "Brazil ANA",
  "Canadian CDA", "Chicago Storm", "Chile DGA", "China Design Storm",
  "China GB 50014", "China PRD", "Christchurch Canterbury", "Colombia IDEAM", "Custom",
  "Denmark SVK", "Desbordes", "Double Peak", "Double Triangle",
  "Dubai Municipality", "Dutch NEERSLAG",
  "ECCC IDF", "Ecuador INAMHI", "Egypt HCWW", "Ethiopia NMA", "Euler Type I", "Euler Type II",
  "FDOT Zone 1", "FDOT Zone 2", "FDOT Zone 3", "FDOT Zone 4", "FDOT Zone 5",
  "FEH (UK)", "FEH22/ReFH2", "Fiji FMS", "Finland FMI", "FSR Profile",
  "G2P Gamma", "German DWA", "Ghana GMet", "Greece Hellenic",
  "HIRDS NZ", "HK DSD 2018", "Hong Kong HKO", "Huff 1st Quartile", "Huff 2nd Quartile",
  "Huff 3rd Quartile", "Huff 4th Quartile",
  "India Coastal", "India IMD", "Indonesia BMKG", "Ireland Met Éireann", "Italian Pattern",
  "Japan AMeDAS", "Japan Baiu", "Japan JMA", "Japan Typhoon",
  "Kenya KMD", "Korea KMA", "Korea MOLIT", "KOSTRA-DWD",
  "M5-60 (UK/Ireland)", "Malaysia HP1", "Malaysia MSMA", "Mexico CONAGUA",
  "Montana/Caquot (FR)", "Morocco DMN", "Mozambique INAM",
  "Nested Envelope", "Nigeria NiMet", "NOAA Atlas 14", "NOAA Atlas 15", "Norway NVE",
  "Oman DGMAN",
  "Pakistan PMD", "Peru SENAMHI", "Philippines PAGASA", "Pilgrim-Cordery",
  "PMP (HMR 51/52)", "PMP WMO Generalized", "Poland Bogdanowicz-Stachy", "Puerto Rico",
  "Qatar Kahramaa",
  "Romania STAS", "Russia SNiP",
  "Saudi Arabia PME", "SCS Type I", "SCS Type IA", "SCS Type II", "SCS Type III",
  "SHYREG (FR)", "Sifalda (Czech)", "Singapore PUB", "South Africa SANRAL",
  "South African Huff", "Spain CEDEX", "Sri Lanka", "Sweden SMHI", "Swiss IDF",
  "Taiwan CWA", "Tanzania TMA", "Thailand TMD", "Triangular", "Trapezoidal",
  "Turkey DSİ", "TxDOT",
  "UAE NCMS", "UDFCD Denver", "UPM Río de la Plata", "USACE SPS",
  "Venezuela INAMEH", "Vietnam IMHEN",
  "Watt's Curve (UK)", "Wellington Regional",
  "Yen & Chow",
];

const Index = () => {
  const [searchParams] = useSearchParams();
  const sharedStorm = useMemo(() => {
    const stormParam = searchParams.get('storm');
    if (stormParam) {
      const decoded = decodeStormParams(stormParam);
      if (decoded) {
        toast.info("Shared storm loaded! Review the configuration below.");
        return decoded;
      }
    }
    return null;
  }, []);
  const [activeTab, setActiveTab] = useState(sharedStorm ? "generator" : "generator");
  const [externalStormParams, setExternalStormParams] = useState<{ depth: number; duration: number } | null>(null);
  const [heroPattern, setHeroPattern] = useState<string | undefined>(undefined);
  const [stormContext, setStormContext] = useState<string>("");
  const heroRef = useRef<HTMLDivElement>(null);

  const handleSendToGenerator = useCallback((depthInches: number, durationHours: number) => {
    setExternalStormParams({ depth: depthInches, duration: durationHours });
    setActiveTab("generator");
    toast.success(`Storm parameters sent: ${(depthInches * 25.4).toFixed(1)} mm / ${(durationHours * 60).toFixed(0)} min`);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-rain text-white shadow-lg relative overflow-hidden">
        <RainParticles />
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="container mx-auto px-4 py-12 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplets className="w-12 h-12" />
            <h1 className="text-5xl font-bold">World Rainfall Pattern Painter</h1>
          </div>
          <p className="text-lg max-w-3xl mx-auto opacity-95">
            Generate and visualize synthetic rainfall patterns for stormwater modeling. 
            Create SWMM5 and ICM-ready timeseries with custom parameters.
          </p>

          {/* Hero Hyetograph Preview */}
          <div ref={heroRef} className="mt-6 mb-4 inline-block">
            <HeroHyetograph patternName={heroPattern} />
            <p className="text-xs opacity-80 mt-1 transition-all duration-300">{getHeroPatternLabel(heroPattern)}</p>
          </div>

          {/* Pattern Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-5xl mx-auto">
            {PATTERN_BADGES.map((name) => (
              <Badge
                key={name}
                variant="secondary"
                className={`text-xs backdrop-blur-sm cursor-pointer transition-all duration-200 ${
                  heroPattern === name
                    ? "bg-white/60 text-blue-900 border-white/80 shadow-md scale-105"
                    : "bg-white/30 text-white border-white/40 hover:bg-white/50 hover:scale-105"
                }`}
                onClick={() => setHeroPattern(heroPattern === name ? undefined : name)}
              >
                {name}
              </Badge>
            ))}
          </div>

          {/* GIF Export */}
          <HeroGifExport
            patternNames={PATTERN_BADGES}
            onPatternChange={(name) => setHeroPattern(name || undefined)}
            captureRef={heroRef}
          />

          <p className="text-sm mt-4 opacity-90 font-medium tracking-wide">
            {patterns.length} Design Storm Patterns Available
          </p>

          {/* Social Proof / Compatibility */}
          <p className="text-xs mt-3 opacity-80">
            Compatible with EPA SWMM · HEC-HMS · InfoWorks ICM · PCSWMM · XP-SWMM · HydroCAD
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <CloudRain className="w-4 h-4" />
              <span className="hidden sm:inline">Storm Generator</span>
              <span className="sm:hidden">Generator</span>
            </TabsTrigger>
            <TabsTrigger value="realdata" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Real Data Hub</span>
              <span className="sm:hidden">Real Data</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced Tools</span>
              <span className="sm:hidden">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">API Playground</span>
              <span className="sm:hidden">API</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Documentation</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-8">
            {/* Introduction */}
            <section className="bg-card p-6 rounded-xl shadow-card border border-border">
              <h2 className="text-2xl font-semibold mb-3 text-foreground">Create Synthetic Storms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Follow the simple 3-step workflow below to define your storm parameters, 
                select a rainfall pattern, and export data for your stormwater models. 
                For pattern comparisons and advanced analysis, visit the <strong>Advanced Tools</strong> tab.
              </p>
            </section>

            {/* Wizard */}
            <StormWizard
              externalStormParams={externalStormParams}
              onExternalParamsConsumed={() => setExternalStormParams(null)}
              initialShareParams={sharedStorm}
              onStormContextChange={setStormContext}
            />
          </TabsContent>

          <TabsContent value="realdata">
            <RealDataHub />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedTools onSendToGenerator={handleSendToGenerator} />
          </TabsContent>

          <TabsContent value="api">
            <ApiPlayground />
          </TabsContent>

          <TabsContent value="docs">
            <Documentation />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="font-medium mb-2">World Rainfall Pattern Painter – Synthetic Rain & Patterns for Stormwater Modeling</p>
          <p className="text-sm">Designed for hydrologists and engineers worldwide</p>
        </div>
      </footer>

      {/* AI Storm Assistant */}
      <StormChatbot stormContext={stormContext} />
    </div>
  );
};

export default Index;
