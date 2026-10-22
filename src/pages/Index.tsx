import { useState, useCallback, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { COUNTRIES } from "@/lib/globalIdfData";
import { canadaIdfDatabase } from "@/lib/canadaIdfData";
import { chinaRainstormDatabase } from "@/lib/chinaRainstormData";
import { useSearchParams, useParams } from "react-router-dom";
import { patternNames as wizardPatternNames, resolvePatternSlug as resolveSlugForPath } from "@/components/StormWizard";
import { StormWizard, decodeStormParams, parsePermalinkParams } from "@/components/StormWizard";
import { patterns, stormPatterns, stormPatternCount } from "@/components/PatternSelector";
const AdvancedTools = lazy(() => import("@/components/AdvancedTools").then(m => ({ default: m.AdvancedTools })));
const Documentation = lazy(() => import("@/components/Documentation").then(m => ({ default: m.Documentation })));
const RealDataHub = lazy(() => import("@/components/RealDataHub").then(m => ({ default: m.RealDataHub })));
const ApiPlayground = lazy(() => import("@/components/ApiPlayground").then(m => ({ default: m.ApiPlayground })));
const StormChatbot = lazy(() => import("@/components/StormChatbot").then(m => ({ default: m.StormChatbot })));
import { ThemeToggle } from "@/components/ThemeToggle";
import { RainParticles } from "@/components/RainParticles";
import { HeroHyetograph, getHeroPatternLabel } from "@/components/HeroHyetograph";
import { HeroGifExport } from "@/components/HeroGifExport";
import { RegionalPatterns } from "@/components/RegionalPatterns";
import { PatternCompareDemo } from "@/components/PatternCompareDemo";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, CloudRain, BookOpen, Wrench, Database, Code2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TabFallback = () => (
  <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
    <Loader2 className="w-5 h-5 animate-spin" />
    <span className="text-sm">Loading…</span>
  </div>
);

const PATTERN_BADGES = stormPatterns.map((pattern) => pattern.name);

const FEATURED_BADGES = [
  "ARR 2019 Ensemble",
  "Balanced Storm",
  "Block Pattern",
  "Canadian CDA",
  "Chicago Storm",
  "China GB 50014",
  "Double Peak",
  "Dubai Municipality",
  "Euler Type II",
  "FEH22/ReFH2",
  "German DWA",
  "Huff 1st Quartile",
  "Huff 2nd Quartile",
  "Japan JMA",
  "NOAA Atlas 14",
  "SCS Type I",
  "SCS Type II",
  "Singapore PUB",
  "Triangular",
  "TxDOT",
].filter((name) => PATTERN_BADGES.includes(name)).sort((a, b) => a.localeCompare(b));

const Index = () => {
  const [searchParams] = useSearchParams();
  const { patternSlug } = useParams();
  const pathPatternId = patternSlug ? resolveSlugForPath(patternSlug) : null;
  useEffect(() => {
    const canon = document.querySelector('link[rel="canonical"]');
    const desc = document.querySelector('meta[name="description"]');
    const base = "https://rain-canvas-studio.lovable.app";
    if (pathPatternId) {
      const name = (wizardPatternNames as Record<string, string>)[pathPatternId] ?? pathPatternId;
      document.title = `${name} Design Storm Hyetograph — Rainfall Pattern Generator`;
      desc?.setAttribute("content", `Generate a ${name} design storm hyetograph: set depth, duration and time step, then export to SWMM, ICM, HEC-HMS or CSV.`);
      canon?.setAttribute("href", `${base}/patterns/${pathPatternId}`);
    } else {
      canon?.setAttribute("href", `${base}/`);
    }
  }, [pathPatternId]);
  const sharedStorm = useMemo(() => {
    if (pathPatternId && !searchParams.get('storm')) {
      const sp = new URLSearchParams(searchParams);
      sp.set('pattern', pathPatternId);
      return parsePermalinkParams(sp);
    }
    const stormParam = searchParams.get('storm');
    if (stormParam) {
      return decodeStormParams(stormParam) || null;
    }
    return parsePermalinkParams(searchParams);
  }, []);

  useEffect(() => {
    if (sharedStorm) {
      toast.info("Shared storm loaded! Review the configuration below.");
    }
  }, [sharedStorm]);

  const [activeTab, setActiveTab] = useState("generator");
  const [externalStormParams, setExternalStormParams] = useState<{ depth: number; duration: number } | null>(null);
  const [idfCityData, setIdfCityData] = useState<{ name: string; lat: string; lon: string } | null>(null);
  const [heroPattern, setHeroPattern] = useState<string | undefined>(undefined);
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [stormContext, setStormContext] = useState<string>("");
  const [wizardPatternRequest, setWizardPatternRequest] = useState<{ pattern: string; nonce: number } | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleBadgeClick = useCallback((name: string) => {
    setHeroPattern((prev) => (prev === name ? undefined : name));
    const match = patterns.find((p) => p.name.toLowerCase() === name.toLowerCase())
      || patterns.find((p) => p.name.toLowerCase().startsWith(name.toLowerCase()));
    if (match) {
      setWizardPatternRequest({ pattern: match.id, nonce: Date.now() });
    }
  }, []);

  const handleSendToGenerator = useCallback((depthInches: number, durationHours: number) => {
    setExternalStormParams({ depth: depthInches, duration: durationHours });
    setActiveTab("generator");
    toast.success(`Storm parameters sent: ${(depthInches * 25.4).toFixed(1)} mm / ${(durationHours * 60).toFixed(0)} min`);
  }, []);

  const handleUsePattern = useCallback((patternId: string, patternName: string) => {
    setWizardPatternRequest({ pattern: patternId, nonce: Date.now() });
    setActiveTab("generator");
    toast.success(`${patternName} selected in the storm wizard`);
    setTimeout(() => document.getElementById("storm-wizard")?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }, []);

  const handleViewIdf = useCallback((city: { name: string; lat: number; lon: number }) => {
    setIdfCityData({ name: city.name, lat: city.lat.toFixed(4), lon: city.lon.toFixed(4) });
    setActiveTab("docs");
    toast.success(`Loading IDF data for ${city.name}…`);
    // Scroll to IDF calculator after tab switch
    setTimeout(() => {
      document.getElementById("calc-idf")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
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
          <div className="mt-8 mb-2 flex flex-col items-center">
            <div ref={heroRef} className="inline-block px-4 pb-4 pt-2">
              <HeroHyetograph patternName={heroPattern} />
              <p className="text-sm font-medium tracking-wide text-cyan-200/90 mt-3 text-center transition-all duration-300">
                {getHeroPatternLabel(heroPattern)}
              </p>
            </div>

            {/* Animation & GIF controls, next to the animation they control */}
            <HeroGifExport
              patternNames={PATTERN_BADGES}
              onPatternChange={(name) => setHeroPattern(name || undefined)}
              captureRef={heroRef}
            />
          </div>

          {/* Featured Pattern Badges */}
          <div className="relative mt-4 max-w-6xl mx-auto">
            <p className="text-xs uppercase tracking-wider opacity-80 mb-2">
              {showAllBadges ? `All ${PATTERN_BADGES.length} patterns` : "Featured patterns"}
            </p>
            <div className={`flex flex-wrap justify-center gap-1.5 px-2 py-1 scrollbar-thin ${showAllBadges ? "max-h-[220px] sm:max-h-[320px] overflow-y-auto" : ""}`}>
              {(showAllBadges ? PATTERN_BADGES : FEATURED_BADGES).map((name) => (
                <Badge
                  key={name}
                  variant="secondary"
                  className={`text-xs backdrop-blur-sm cursor-pointer transition-all duration-200 ${
                    heroPattern === name
                      ? "bg-white/60 text-blue-900 border-white/80 shadow-md scale-105"
                      : "bg-white/30 text-white border-white/40 hover:bg-white/50 hover:scale-105"
                  }`}
                  onClick={() => handleBadgeClick(name)}
                  title={`Preview and preselect ${name} in the wizard`}
                >
                  {name}
                </Badge>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowAllBadges((v) => !v)}
                className="inline-flex items-center gap-1 text-sm underline underline-offset-4 opacity-90 hover:opacity-100"
                aria-expanded={showAllBadges}
              >
                {showAllBadges ? (
                  <>Show featured only <ChevronUp className="w-4 h-4" /></>
                ) : (
                  <>Browse all {PATTERN_BADGES.length} patterns <ChevronDown className="w-4 h-4" /></>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("generator");
                  setTimeout(() => document.getElementById("storm-wizard")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                }}
                className="inline-flex items-center gap-1 text-sm underline underline-offset-4 opacity-90 hover:opacity-100"
              >
                Open the pattern picker →
              </button>
            </div>
          </div>

          {/* Statistics Counters */}
          {(() => {
            const globalCities = Object.values(COUNTRIES).reduce((sum, c) => sum + Object.keys(c.cities).length, 0);
            const globalCountries = Object.keys(COUNTRIES).length;
            const totalIdfCities = globalCities + canadaIdfDatabase.length + chinaRainstormDatabase.length + 8;
            const idfCountries = globalCountries + 2; // +Canada, +China (Gulf states already in COUNTRIES)
            const totalIdfDataPoints = totalIdfCities * 6 * 15; // 6 return periods × 15 durations
            return (
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                <div className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{stormPatternCount}</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">Storm Patterns</p>
                </div>
                <div className="w-px bg-primary-foreground/20 hidden sm:block" />
                <div className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{idfCountries}+</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">IDF Countries</p>
                </div>
                <div className="w-px bg-primary-foreground/20 hidden sm:block" />
                <div className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{totalIdfCities}+</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">IDF Cities</p>
                </div>
                <div className="w-px bg-primary-foreground/20 hidden sm:block" />
                <div className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{(totalIdfDataPoints / 1000).toFixed(0)}k+</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">IDF Data Points</p>
                </div>
                <div className="w-px bg-primary-foreground/20 hidden sm:block" />
                <div className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">9</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">Export Formats</p>
                </div>
              </div>
            );
          })()}

          {/* Social Proof / Compatibility */}
          <p className="text-xs mt-4 opacity-80">
            Compatible with EPA SWMM · HEC-HMS · InfoWorks ICM · InfoDrainage · PCSWMM · XP-SWMM · HydroCAD
          </p>
        </div>
        {/* Smooth transition into the app section */}
        <div className="pointer-events-none h-28 bg-gradient-to-b from-transparent via-background/60 to-background" />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Above-the-fold: regional suggestions + 3-pattern overlay demo */}
        <section aria-label="Explore design storm patterns" className="grid gap-6 lg:grid-cols-2 mb-10">
          <RegionalPatterns onSelectPattern={handleUsePattern} />
          <PatternCompareDemo onSelectPattern={handleUsePattern} />
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full mb-8 overflow-x-auto scrollbar-thin sm:grid sm:grid-cols-5">
            <TabsTrigger value="generator" className="flex items-center gap-2 min-w-max">
              <CloudRain className="w-4 h-4" />
              <span className="hidden sm:inline">Storm Generator</span>
              <span className="sm:hidden">Generator</span>
            </TabsTrigger>
            <TabsTrigger value="realdata" className="flex items-center gap-2 min-w-max">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Real Data Hub</span>
              <span className="sm:hidden">Real Data</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2 min-w-max">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced Tools</span>
              <span className="sm:hidden">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2 min-w-max">
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">API Playground</span>
              <span className="sm:hidden">API</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2 min-w-max">
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
                Follow the 4-step workflow below to define your storm parameters,
                select a rainfall pattern, review &amp; export data for your stormwater models,
                and optionally test all patterns. For pattern comparisons and advanced analysis,
                visit the <strong>Advanced Tools</strong> tab.
              </p>
            </section>

            {/* Wizard */}
            <div id="storm-wizard" className="scroll-mt-4">
            <StormWizard
              externalStormParams={externalStormParams}
              onExternalParamsConsumed={() => setExternalStormParams(null)}
              initialShareParams={sharedStorm}
              onStormContextChange={setStormContext}
              externalPatternRequest={wizardPatternRequest}
            />
            </div>
          </TabsContent>

          <TabsContent value="realdata">
            <Suspense fallback={<TabFallback />}><RealDataHub /></Suspense>
          </TabsContent>

          <TabsContent value="advanced">
            <Suspense fallback={<TabFallback />}>
              <AdvancedTools onSendToGenerator={handleSendToGenerator} onViewIdf={handleViewIdf} />
            </Suspense>
          </TabsContent>

          <TabsContent value="api">
            <Suspense fallback={<TabFallback />}><ApiPlayground /></Suspense>
          </TabsContent>

          <TabsContent value="docs">
            <Suspense fallback={<TabFallback />}><Documentation idfCity={idfCityData} /></Suspense>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="font-medium mb-2">World Rainfall Pattern Painter – Synthetic Rainfall Patterns for Stormwater Modeling</p>
          <p className="text-sm mb-4">Designed for hydrologists and engineers worldwide</p>
          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm mb-4">
            <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => setActiveTab("docs")}>Documentation</button>
            <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => setActiveTab("api")}>API Playground</button>
            <a className="underline underline-offset-4 hover:text-foreground" href="/API.md">API Reference</a>
            <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => setActiveTab("docs")}>Data sources &amp; references</button>
            <button type="button" className="underline underline-offset-4 hover:text-foreground" onClick={() => setActiveTab("advanced")}>Advanced Tools</button>
          </nav>
          <p className="text-xs opacity-80">
            {stormPatternCount} storm patterns · Data derived from published agency standards (NRCS TR-55, NOAA Atlas 14/15, FEH, ARR, DWA-A 118, and national meteorological services) · v3.0.0
          </p>
        </div>
      </footer>

      {/* AI Storm Assistant */}
      <Suspense fallback={null}>
        <StormChatbot stormContext={stormContext} />
      </Suspense>
    </div>
  );
};

export default Index;
