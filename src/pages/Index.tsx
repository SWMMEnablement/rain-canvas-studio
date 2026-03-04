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
  "Abu Dhabi ADM", "AES Canada 30%", "AES Canada 40%", "Algeria ANRH", "Argentina SMN",
  "Arid Flash Flood", "Arnell (Sweden)", "ARR 2019 Ensemble", "ARR87 Legacy",
  "Atmospheric River", "ATV A-121", "Auckland TP108",
  "Australian ARR", "Austria ÖKOSTRA", "Average Variability", "Azores/Madeira IPMA",
  "Bahrain MET", "Balanced Storm", "Bangladesh BMD", "Barbados BMS", "Bartlett-Lewis",
  "Belarusian TKP", "Belgium IRM", "Belgium Willems", "Beta Distribution",
  "Bimodal Gaussian", "Blaszczyk", "Block Pattern", "Bolivia Altiplano",
  "Bogotá EAAB", "Bonta USDA", "Brazil ANA", "Budapest Convective", "Bulgarian NIMH",
  "Caltrans CA", "Cameroon IRD", "Canadian CDA", "CC-IDF Scaled", "Chicago Storm",
  "Chile DGA", "China Design Storm", "China GB 50014", "China PRD",
  "Christchurch Canterbury", "Clark County NV", "Clausius-Clapeyron",
  "Colombia IDEAM", "Cosine Storm", "Costa Rica IMN", "Côte d'Ivoire SODEXAM",
  "Croatian DHMZ", "CSA W231", "Cuba INSMET", "Custom", "Cyprus WDD", "Czech CHMU",
  "Denmark SVK", "Derecho", "Desbordes", "Dominican ONAMET", "Double Peak", "Double Triangle",
  "Dubai DM Combined", "Dubai Municipality", "Dutch NEERSLAG", "DWA A-118",
  "ECCC IDF", "Ecuador INAMHI", "Egypt HCWW", "Estonian EMHI", "Ethiopia NMA",
  "Euler Type I", "Euler Type II", "Euro CORDEX", "Exponential Decay",
  "FDOT Zone 1", "FDOT Zone 2", "FDOT Zone 3", "FDOT Zone 4", "FDOT Zone 5",
  "FEH (UK)", "FEH22/ReFH2", "Fiji FMS", "Finland FMI", "Fourier Multipeak",
  "France SHYPRE", "FSR Profile",
  "G2P Gamma", "German DWA", "Ghana GMet", "Greece Hellenic", "Guatemala INSIVUMEH",
  "Harris County FCD", "Hawaii Distinct", "HIRDS NZ", "HK DSD 2018",
  "Honduras SMN", "Hong Kong HKO", "Huff 1st Quartile", "Huff 2nd Quartile",
  "Huff 3rd Quartile", "Huff 4th Quartile", "Hungarian MSZ",
  "Icelandic IMO", "Illinois SWS B75", "IMGW Cluster 1", "IMGW Cluster 2",
  "IMGW Cluster 3", "IMGW Cluster 4", "IMGW Cluster 5",
  "India Coastal", "India IMD", "Indonesia BMKG", "Instantaneous Burst",
  "Iran IRIMO", "Iraq MoS", "Ireland Met Éireann", "Israel IMS", "Italian Pattern",
  "Jamaica MSJ", "Japan AMeDAS", "Japan Baiu", "Japan JMA", "Japan Typhoon",
  "Jordan JMD",
  "Kazakhstan Kazhydromet", "Kenya KMD", "Korea KMA", "Korea MOLIT", "KOSTRA-DWD",
  "Kuwait MEW",
  "LA County LACDPW", "Latvian LVGMC", "Lebanon Civil Aviation",
  "Lima SENAMHI", "Lithuanian HMS", "LogNormal Temporal",
  "M5-60 (UK/Ireland)", "Madagascar DGM", "Malaysia HP1", "Malaysia MSMA",
  "Malta MRA", "Maricopa FCD", "Mauritius MMS", "MCS Storm", "Medicane",
  "Mekong MRC", "Mexico CONAGUA", "Mongolia NAMEM", "Mononobe (Japan)",
  "Monsoon Burst", "Montana/Caquot (FR)", "Morocco DMN", "Mozambique INAM",
  "Myanmar DMH",
  "Namibia NMS", "Nepal DHM", "Nested Envelope", "Neyman-Scott",
  "Nigeria NiMet", "NOAA Atlas 14", "NOAA Atlas 15", "NOAA Atlas 16",
  "Nocturnal MCS", "Norway NVE", "NYC DEP", "NZ NIWA",
  "OECS Caribbean", "Oman DGMAN", "Orographic Enhanced", "ÖWAV Rb 11",
  "Pacific SPREP", "Pakistan PMD", "Panama ETESA", "Papua New Guinea NWS",
  "Parabolic", "Paraguay DMH", "Peru SENAMHI", "Philadelphia PWD",
  "Philippines PAGASA", "Pilgrim-Cordery", "PMP (HMR 51/52)", "PMP WMO Generalized",
  "Poland Bogdanowicz-Stachy", "Poland PANDA", "Polar Low",
  "Portugal IPMA", "Portugal LNEC", "Post-Wildfire", "Power Curve", "Puerto Rico",
  "Qatar Kahramaa", "Cut-Off Low",
  "Rain on Snow", "Réunion Météo-France", "Romania STAS", "Russia Roshydromet", "Russia SNiP",
  "SA SCS Type 1", "SA SCS Type 2", "SA SCS Type 3", "SA SCS Type 4", "SA WRC",
  "Samoa MET", "São Paulo DAEE", "Saudi Arabia PME",
  "SCS Type I", "SCS Type IA", "SCS Type II", "SCS Type III",
  "Sea Breeze", "Serbian RHMZ", "SHYREG (FR)", "Sifalda (Czech)", "Sigmoid Logistic",
  "Singapore PUB", "Slovenian ARSO", "South Africa SANRAL",
  "South African Huff", "Soviet SNiP Legacy", "Spain CEDEX",
  "Squall Line", "Sri Lanka", "Sudan SMA", "Super CC", "Supercell",
  "Svensson-Jones", "Sweden SMHI", "Swiss IDF",
  "Taiwan CWA", "Tanzania TMA", "Témez (Spain)", "TENAX-CDS", "Thailand TMD",
  "Triangular", "Trapezoidal", "Trinidad & Tobago",
  "Tropical Cyclone Rainband", "Trupl (Czech)", "Tunisia INM",
  "Turkey DSİ", "Turkey MGM", "TxDOT",
  "UAE NCMS", "UDFCD Denver", "Uganda UNMA", "UKCP18 Enhanced",
  "Ukrainian DBN", "UPM Río de la Plata", "Urban Heat Island",
  "Uruguay INUMET", "USACE SPS", "Uzbekistan UHM",
  "Venezuela INAMEH", "Vietnam IMHEN",
  "Watt's Curve (UK)", "Weibull Temporal", "Wellington Regional",
  "West Africa CIEH", "West Africa CILSS", "Wrocław 2050",
  "Yen & Chow", "Yemen CAMA",
  "Šamaj-Valovič",
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
          <div ref={heroRef} className="mt-8 mb-4 inline-block px-4 pb-4 pt-2">
            <HeroHyetograph patternName={heroPattern} />
            <p className="text-sm font-medium tracking-wide text-cyan-200/90 mt-3 text-center transition-all duration-300">
              {getHeroPatternLabel(heroPattern)}
            </p>
          </div>

          {/* Pattern Badges */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-4 max-w-6xl mx-auto">
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
