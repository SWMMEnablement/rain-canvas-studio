import { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { StormWizard, decodeStormParams } from "@/components/StormWizard";
import { patterns } from "@/components/PatternSelector";
import { AdvancedTools } from "@/components/AdvancedTools";
import { Documentation } from "@/components/Documentation";
import { RealDataHub } from "@/components/RealDataHub";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RainParticles } from "@/components/RainParticles";
import { HeroHyetograph } from "@/components/HeroHyetograph";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, CloudRain, BookOpen, Wrench, Database } from "lucide-react";
import { toast } from "sonner";

const PATTERN_BADGES = [
  "SCS Type I/IA/II/III", "Huff Quartiles", "Chicago Storm",
  "Alternating Block", "PMP (HMR 51/52)", "UK FSR/FEH",
  "Japan AMeDAS", "Euler Type I/II", "FHWA/USACE",
  "Korea MOLIT", "India IMD", "Australia ARR",
  "Singapore PUB", "Malaysia MSMA", "GCC Arid",
  "South Africa SANRAL", "Brazil ANA", "Mexico CONAGUA",
  "Scandinavian SVK", "Netherlands RIONED", "Custom",
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
          <div className="mt-6 mb-4">
            <HeroHyetograph />
            <p className="text-xs opacity-60 mt-1">SCS Type II — 24-hour design storm</p>
          </div>

          {/* Pattern Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 max-w-2xl mx-auto">
            {PATTERN_BADGES.map((name, i) => (
              <Badge
                key={name}
                variant="secondary"
                className="bg-white/15 text-white border-white/25 hover:bg-white/25 text-xs backdrop-blur-sm"
              >
                {name}
              </Badge>
            ))}
          </div>

          <p className="text-sm mt-4 opacity-80 font-medium tracking-wide">
            {patterns.length} Design Storm Patterns Available
          </p>

          {/* Social Proof / Compatibility */}
          <p className="text-xs mt-3 opacity-60">
            Compatible with EPA SWMM · HEC-HMS · InfoWorks ICM · PCSWMM · XP-SWMM · HydroCAD
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
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
            />
          </TabsContent>

          <TabsContent value="realdata">
            <RealDataHub />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedTools onSendToGenerator={handleSendToGenerator} />
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
    </div>
  );
};

export default Index;
