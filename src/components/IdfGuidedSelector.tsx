import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, CloudRain, ExternalLink, ChevronDown, ChevronUp, Zap, Target, Info, Search, Loader2, CheckCircle, AlertTriangle, BarChart3 } from "lucide-react";
import { Area, AreaChart, Line, LineChart, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { type UnitSystem, convertDepth } from "@/lib/unitConversions";
import { lookupZip, type ZipEntry } from "@/lib/zipLookup";

// Regional IDF lookup tables (depth in inches for various return periods and durations)
// Based on representative NOAA Atlas 14 data for major US climate regions
const REGIONAL_IDF_DATA: Record<string, {
  name: string;
  description: string;
  recommendedScsType: string;
  depths: Record<string, Record<string, number>>; // [duration][return period] = depth (inches)
}> = {
  southeast: {
    name: "Southeast (Atlanta, Charlotte)",
    description: "Humid subtropical climate with intense summer thunderstorms",
    recommendedScsType: "Type II or Type III",
    depths: {
      "1": { "2": 1.5, "5": 1.9, "10": 2.2, "25": 2.6, "50": 2.9, "100": 3.3, "200": 3.7, "500": 4.3, "1000": 4.8 },
      "2": { "2": 1.8, "5": 2.4, "10": 2.8, "25": 3.3, "50": 3.7, "100": 4.2, "200": 4.7, "500": 5.5, "1000": 6.1 },
      "6": { "2": 2.5, "5": 3.2, "10": 3.7, "25": 4.4, "50": 5.0, "100": 5.6, "200": 6.3, "500": 7.3, "1000": 8.1 },
      "12": { "2": 3.0, "5": 3.9, "10": 4.5, "25": 5.4, "50": 6.2, "100": 7.0, "200": 7.9, "500": 9.1, "1000": 10.1 },
      "24": { "2": 3.6, "5": 4.6, "10": 5.4, "25": 6.5, "50": 7.4, "100": 8.4, "200": 9.5, "500": 11.0, "1000": 12.2 },
    }
  },
  gulfCoast: {
    name: "Gulf Coast (Houston, New Orleans)",
    description: "Tropical influence with frequent heavy rainfall events",
    recommendedScsType: "Type III",
    depths: {
      "1": { "2": 1.9, "5": 2.5, "10": 2.9, "25": 3.5, "50": 4.0, "100": 4.5, "200": 5.1, "500": 5.9, "1000": 6.6 },
      "2": { "2": 2.4, "5": 3.1, "10": 3.6, "25": 4.4, "50": 5.0, "100": 5.7, "200": 6.5, "500": 7.5, "1000": 8.3 },
      "6": { "2": 3.3, "5": 4.3, "10": 5.0, "25": 6.1, "50": 7.0, "100": 8.0, "200": 9.1, "500": 10.5, "1000": 11.7 },
      "12": { "2": 4.0, "5": 5.2, "10": 6.1, "25": 7.4, "50": 8.5, "100": 9.7, "200": 11.0, "500": 12.8, "1000": 14.2 },
      "24": { "2": 4.8, "5": 6.2, "10": 7.3, "25": 8.9, "50": 10.2, "100": 11.7, "200": 13.3, "500": 15.4, "1000": 17.1 },
    }
  },
  northeast: {
    name: "Northeast (New York, Boston)",
    description: "Humid continental with nor'easters and frontal systems",
    recommendedScsType: "Type II",
    depths: {
      "1": { "2": 1.2, "5": 1.5, "10": 1.8, "25": 2.1, "50": 2.4, "100": 2.7, "200": 3.0, "500": 3.5, "1000": 3.9 },
      "2": { "2": 1.4, "5": 1.9, "10": 2.2, "25": 2.6, "50": 3.0, "100": 3.4, "200": 3.8, "500": 4.4, "1000": 4.9 },
      "6": { "2": 2.0, "5": 2.6, "10": 3.0, "25": 3.6, "50": 4.1, "100": 4.6, "200": 5.2, "500": 6.0, "1000": 6.7 },
      "12": { "2": 2.4, "5": 3.1, "10": 3.7, "25": 4.4, "50": 5.0, "100": 5.7, "200": 6.4, "500": 7.4, "1000": 8.3 },
      "24": { "2": 2.9, "5": 3.7, "10": 4.4, "25": 5.3, "50": 6.0, "100": 6.9, "200": 7.7, "500": 9.0, "1000": 10.0 },
    }
  },
  midwest: {
    name: "Midwest (Chicago, St. Louis)",
    description: "Continental climate with severe thunderstorms",
    recommendedScsType: "Type II",
    depths: {
      "1": { "2": 1.3, "5": 1.7, "10": 2.0, "25": 2.4, "50": 2.7, "100": 3.1, "200": 3.5, "500": 4.0, "1000": 4.5 },
      "2": { "2": 1.6, "5": 2.1, "10": 2.5, "25": 3.0, "50": 3.4, "100": 3.9, "200": 4.4, "500": 5.1, "1000": 5.7 },
      "6": { "2": 2.2, "5": 2.9, "10": 3.4, "25": 4.1, "50": 4.7, "100": 5.3, "200": 6.0, "500": 6.9, "1000": 7.7 },
      "12": { "2": 2.7, "5": 3.5, "10": 4.2, "25": 5.0, "50": 5.7, "100": 6.5, "200": 7.3, "500": 8.5, "1000": 9.5 },
      "24": { "2": 3.2, "5": 4.1, "10": 4.9, "25": 5.9, "50": 6.7, "100": 7.7, "200": 8.7, "500": 10.0, "1000": 11.2 },
    }
  },
  southwest: {
    name: "Southwest (Phoenix, Las Vegas)",
    description: "Arid climate with monsoon thunderstorms",
    recommendedScsType: "Type II",
    depths: {
      "1": { "2": 0.8, "5": 1.1, "10": 1.3, "25": 1.6, "50": 1.8, "100": 2.1, "200": 2.4, "500": 2.8, "1000": 3.1 },
      "2": { "2": 1.0, "5": 1.3, "10": 1.6, "25": 1.9, "50": 2.2, "100": 2.5, "200": 2.8, "500": 3.3, "1000": 3.7 },
      "6": { "2": 1.3, "5": 1.7, "10": 2.1, "25": 2.5, "50": 2.9, "100": 3.3, "200": 3.7, "500": 4.3, "1000": 4.8 },
      "12": { "2": 1.6, "5": 2.1, "10": 2.5, "25": 3.1, "50": 3.5, "100": 4.0, "200": 4.5, "500": 5.3, "1000": 5.9 },
      "24": { "2": 1.9, "5": 2.5, "10": 3.0, "25": 3.6, "50": 4.2, "100": 4.8, "200": 5.4, "500": 6.3, "1000": 7.0 },
    }
  },
  pacificNorthwest: {
    name: "Pacific Northwest (Seattle, Portland)",
    description: "Maritime climate with prolonged frontal rainfall",
    recommendedScsType: "Type IA",
    depths: {
      "1": { "2": 0.5, "5": 0.7, "10": 0.8, "25": 1.0, "50": 1.1, "100": 1.3, "200": 1.5, "500": 1.7, "1000": 1.9 },
      "2": { "2": 0.7, "5": 0.9, "10": 1.1, "25": 1.3, "50": 1.5, "100": 1.7, "200": 1.9, "500": 2.2, "1000": 2.5 },
      "6": { "2": 1.1, "5": 1.4, "10": 1.7, "25": 2.0, "50": 2.3, "100": 2.6, "200": 2.9, "500": 3.4, "1000": 3.8 },
      "12": { "2": 1.5, "5": 1.9, "10": 2.3, "25": 2.7, "50": 3.1, "100": 3.5, "200": 4.0, "500": 4.6, "1000": 5.1 },
      "24": { "2": 2.0, "5": 2.5, "10": 3.0, "25": 3.6, "50": 4.1, "100": 4.7, "200": 5.3, "500": 6.1, "1000": 6.8 },
    }
  },
  california: {
    name: "California Coast (San Francisco, LA)",
    description: "Mediterranean climate with winter storms",
    recommendedScsType: "Type I",
    depths: {
      "1": { "2": 0.6, "5": 0.8, "10": 1.0, "25": 1.2, "50": 1.4, "100": 1.6, "200": 1.8, "500": 2.1, "1000": 2.4 },
      "2": { "2": 0.8, "5": 1.1, "10": 1.3, "25": 1.6, "50": 1.8, "100": 2.1, "200": 2.4, "500": 2.7, "1000": 3.1 },
      "6": { "2": 1.3, "5": 1.7, "10": 2.0, "25": 2.4, "50": 2.8, "100": 3.2, "200": 3.6, "500": 4.2, "1000": 4.7 },
      "12": { "2": 1.7, "5": 2.2, "10": 2.7, "25": 3.2, "50": 3.7, "100": 4.2, "200": 4.7, "500": 5.5, "1000": 6.1 },
      "24": { "2": 2.2, "5": 2.9, "10": 3.4, "25": 4.1, "50": 4.8, "100": 5.5, "200": 6.2, "500": 7.2, "1000": 8.0 },
    }
  },
  mountainWest: {
    name: "Mountain West (Denver, Salt Lake)",
    description: "Semi-arid continental with orographic effects",
    recommendedScsType: "Type II",
    depths: {
      "1": { "2": 0.9, "5": 1.2, "10": 1.4, "25": 1.7, "50": 1.9, "100": 2.2, "200": 2.5, "500": 2.9, "1000": 3.2 },
      "2": { "2": 1.1, "5": 1.4, "10": 1.7, "25": 2.0, "50": 2.3, "100": 2.6, "200": 2.9, "500": 3.4, "1000": 3.8 },
      "6": { "2": 1.5, "5": 1.9, "10": 2.3, "25": 2.7, "50": 3.1, "100": 3.5, "200": 4.0, "500": 4.6, "1000": 5.1 },
      "12": { "2": 1.8, "5": 2.3, "10": 2.8, "25": 3.3, "50": 3.8, "100": 4.3, "200": 4.9, "500": 5.6, "1000": 6.3 },
      "24": { "2": 2.1, "5": 2.7, "10": 3.2, "25": 3.9, "50": 4.4, "100": 5.1, "200": 5.7, "500": 6.6, "1000": 7.4 },
    }
  },
};

const RETURN_PERIODS = ["2", "5", "10", "25", "50", "100", "200", "500", "1000"];
const DURATIONS = ["1", "2", "6", "12", "24"];

// Map NOAA duration labels to our duration keys (hours)
function noaaDurationToHours(label: string): string | null {
  const map: Record<string, string> = {
    "60-min": "1", "2-hr": "2", "6-hr": "6", "12-hr": "12", "24-hr": "24",
  };
  return map[label] || null;
}

interface IdfGuidedSelectorProps {
  unitSystem: UnitSystem;
  onApplyDesignStorm: (depth: number, duration: number) => void;
}

export function IdfGuidedSelector({ unitSystem, onApplyDesignStorm }: IdfGuidedSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("southeast");
  const [selectedReturnPeriod, setSelectedReturnPeriod] = useState<string>("10");
  const [selectedDuration, setSelectedDuration] = useState<string>("6");
  const [zipCode, setZipCode] = useState("");
  const [zipResult, setZipResult] = useState<ZipEntry | null>(null);
  const [liveData, setLiveData] = useState<Record<string, Record<string, number>> | null>(null);
  const [liveUpper, setLiveUpper] = useState<Record<string, Record<string, number>> | null>(null);
  const [liveLower, setLiveLower] = useState<Record<string, Record<string, number>> | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveSource, setLiveSource] = useState("");
  const [chartOverlayDurations, setChartOverlayDurations] = useState<string[]>([]);
  const [logScale, setLogScale] = useState(false);

  const regionData = REGIONAL_IDF_DATA[selectedRegion];

  // Use live data if available, otherwise fall back to bundled regional data
  const activeDepths = liveData || (regionData?.depths ?? {});

  const selectedDepth = useMemo(() => {
    const depthInches = activeDepths[selectedDuration]?.[selectedReturnPeriod];
    if (!depthInches) return null;
    return unitSystem === 'USA' ? depthInches : convertDepth(depthInches, 'USA', 'SI');
  }, [activeDepths, selectedReturnPeriod, selectedDuration, unitSystem]);

  const handleZipLookup = useCallback(() => {
    const clean = zipCode.replace(/\D/g, "");
    if (clean.length < 5) {
      toast.error("Please enter a valid 5-digit US zip code");
      return;
    }

    const entry = lookupZip(clean);
    if (entry) {
      setZipResult(entry);
      setSelectedRegion(entry.region);
      toast.success(`Found: ${entry.city}, ${entry.state} → ${REGIONAL_IDF_DATA[entry.region]?.name}`);
      // Auto-fetch live NOAA data for this location
      fetchLiveNoaa(entry.lat, entry.lon, `${entry.city}, ${entry.state}`);
    } else {
      setZipResult(null);
      toast.error("Zip code not in bundled dataset. Try the live NOAA lookup in Advanced Tools → IDF Lookup.");
    }
  }, [zipCode]);

  const fetchLiveNoaa = useCallback(async (lat: number, lon: number, locationLabel: string) => {
    setLiveLoading(true);
    setLiveData(null);
    setLiveUpper(null);
    setLiveLower(null);
    setLiveSource("");

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/noaa-idf-proxy?lat=${lat}&lon=${lon}&data=depth&units=english&series=pds`;

      const response = await fetch(url, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.error || !data.quantiles?.length) throw new Error(data.error || "No data");

      // Map NOAA response into our duration→returnPeriod→depth format
      const noaaRPs = data.returnPeriods.map(Number);

      const mapArray = (arr: number[][]) => {
        const mapped: Record<string, Record<string, number>> = {};
        data.durations.forEach((durLabel: string, dIdx: number) => {
          const hourKey = noaaDurationToHours(durLabel);
          if (!hourKey || dIdx >= arr.length) return;
          mapped[hourKey] = {};
          noaaRPs.forEach((rp: number, rpIdx: number) => {
            if (RETURN_PERIODS.includes(String(rp)) && rpIdx < arr[dIdx].length) {
              mapped[hourKey][String(rp)] = arr[dIdx][rpIdx];
            }
          });
        });
        return mapped;
      };

      const mapped = mapArray(data.quantiles);

      if (Object.keys(mapped).length > 0) {
        setLiveData(mapped);
        if (data.upper?.length) setLiveUpper(mapArray(data.upper));
        if (data.lower?.length) setLiveLower(mapArray(data.lower));
        setLiveSource(`NOAA Atlas 14 for ${locationLabel} (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
        toast.success(`Live NOAA Atlas 14 data loaded for ${locationLabel}`);
      }
    } catch {
      // Silently fall back to bundled data — it's still useful
      console.warn("Live NOAA fetch failed, using bundled regional data");
    } finally {
      setLiveLoading(false);
    }
  }, []);

  const handleApply = () => {
    if (selectedDepth !== null) {
      const depthInches = liveData
        ? (activeDepths[selectedDuration]?.[selectedReturnPeriod] ?? selectedDepth)
        : (unitSystem === 'USA' ? selectedDepth : convertDepth(selectedDepth, 'SI', 'USA'));
      onApplyDesignStorm(
        unitSystem === 'USA' ? depthInches : convertDepth(depthInches, 'USA', 'SI'),
        parseFloat(selectedDuration)
      );
      toast.success(`Applied ${selectedReturnPeriod}-year, ${selectedDuration}-hour design storm`);
      setIsOpen(false);
    }
  };

  const formatDepth = (depth: number | null) => {
    if (depth === null) return "—";
    return unitSystem === 'USA' ? `${depth.toFixed(2)} in` : `${depth.toFixed(1)} mm`;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/30 transition-colors rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    IDF-Guided Design Storm
                    <Badge variant="secondary" className="text-xs">Design by Return Period</Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Enter zip code or select region → pick return period + duration → depth auto-fills
                  </CardDescription>
                </div>
              </div>
              {isOpen ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Zip Code Quick Lookup */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                Quick Lookup by US Zip Code
              </Label>
              <div className="flex gap-2">
                <Input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  onKeyDown={(e) => e.key === "Enter" && handleZipLookup()}
                  placeholder="e.g., 77001"
                  className="w-32"
                  maxLength={5}
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleZipLookup}
                  disabled={zipCode.length < 5 || liveLoading}
                >
                  {liveLoading ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 mr-1" />
                  )}
                  {liveLoading ? "Fetching..." : "Look Up"}
                </Button>
              </div>

              {zipResult && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="font-medium">{zipResult.city}, {zipResult.state}</span>
                  <span className="text-muted-foreground">→ {REGIONAL_IDF_DATA[zipResult.region]?.name}</span>
                </div>
              )}

              {liveSource && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-accent/50 border border-primary/20">
                  <Badge variant="default" className="text-xs">Live</Badge>
                  <span className="text-xs text-muted-foreground">{liveSource}</span>
                </div>
              )}
            </div>

            {/* Region Selection (manual fallback) */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Climate Region {liveData ? "(overridden by live data)" : ""}
              </Label>
              <Select value={selectedRegion} onValueChange={(v) => { setSelectedRegion(v); setLiveData(null); setLiveUpper(null); setLiveLower(null); setLiveSource(""); setZipResult(null); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REGIONAL_IDF_DATA).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {regionData && !liveData && (
                <p className="text-xs text-muted-foreground">
                  {regionData.description}. Recommended: <strong>{regionData.recommendedScsType}</strong>
                </p>
              )}
            </div>

            {/* Design Storm Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Return Period (years)</Label>
                <Select value={selectedReturnPeriod} onValueChange={setSelectedReturnPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RETURN_PERIODS.map(rp => (
                      <SelectItem key={rp} value={rp}>
                        {rp}-year{parseInt(rp) >= 500 ? " ⚠️" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Duration (hours)</Label>
                <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map(dur => (
                      <SelectItem key={dur} value={dur}>{dur}-hour</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* High-Uncertainty Warning for Extreme Return Periods */}
            {parseInt(selectedReturnPeriod) >= 500 && (
              <div className="flex items-start gap-3 p-3 rounded-lg border border-warning/50 bg-warning/10">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-warning">
                    High-Uncertainty Extreme Event ({selectedReturnPeriod}-year)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Return periods ≥ 500 years exceed typical gauge record lengths and rely on
                    statistical extrapolation. NOAA Atlas 14 confidence intervals widen
                    significantly at these frequencies.
                    {(() => {
                      const uv = liveUpper?.[selectedDuration]?.[selectedReturnPeriod];
                      const lv = liveLower?.[selectedDuration]?.[selectedReturnPeriod];
                      if (uv != null && lv != null) {
                        const fmt = (v: number) =>
                          unitSystem === 'USA' ? `${v.toFixed(2)} in` : `${convertDepth(v, 'USA', 'SI').toFixed(1)} mm`;
                        return (
                          <span className="block mt-1 font-medium text-warning">
                            90% CI: {fmt(lv)} – {fmt(uv)} (±{((uv - lv) / 2 / ((uv + lv) / 2) * 100).toFixed(0)}% range)
                          </span>
                        );
                      }
                      return null;
                    })()}
                    {' '}Use with caution for critical infrastructure — consider applying
                    climate change adjustment factors and consulting site-specific frequency analyses.
                  </p>
                </div>
              </div>
            )}

            {/* Result Preview */}
            <div className="p-4 rounded-lg bg-accent/50 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Design Storm Depth</p>
                  <p className="text-2xl font-bold text-primary">{formatDepth(selectedDepth)}</p>
                   <div className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-1">
                    <span>{selectedReturnPeriod}-year, {selectedDuration}-hour storm</span>
                    {liveSource && <Badge variant="outline" className="text-xs">NOAA Atlas 14</Badge>}
                    {parseInt(selectedReturnPeriod) >= 500 && (() => {
                      const upperVal = liveUpper?.[selectedDuration]?.[selectedReturnPeriod];
                      const lowerVal = liveLower?.[selectedDuration]?.[selectedReturnPeriod];
                      const hasCI = upperVal != null && lowerVal != null;
                      const formatCI = (v: number) =>
                        unitSystem === 'USA' ? `${v.toFixed(2)} in` : `${convertDepth(v, 'USA', 'SI').toFixed(1)} mm`;

                      const badge = (
                        <Badge variant="outline" className="text-xs border-warning/50 text-warning cursor-default">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          High Uncertainty
                        </Badge>
                      );

                      if (hasCI) {
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {badge}
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-xs text-xs space-y-1">
                              <p className="font-semibold">NOAA Atlas 14 — 90% Confidence Interval</p>
                              <p>Lower bound: <span className="font-mono">{formatCI(lowerVal)}</span></p>
                              <p>Upper bound: <span className="font-mono">{formatCI(upperVal)}</span></p>
                              <p className="text-muted-foreground pt-1">
                                Range: ±{((upperVal - lowerVal) / 2 / ((upperVal + lowerVal) / 2) * 100).toFixed(0)}% — 
                                wide intervals indicate high statistical uncertainty
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      }
                      return badge;
                    })()}
                  </div>
                </div>
                <Button onClick={handleApply} className="gap-2" disabled={selectedDepth === null}>
                  <Zap className="w-4 h-4" />
                  Apply to Storm
                </Button>
              </div>
            </div>

            {/* IDF Reference Table */}
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <CloudRain className="w-4 h-4" />
                {liveData ? "NOAA Atlas 14" : "Regional"} IDF Reference ({unitSystem === 'USA' ? 'inches' : 'mm'})
                {liveData && <Badge variant="default" className="text-xs">Live Data</Badge>}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-2 border">Duration</th>
                      {RETURN_PERIODS.map(rp => (
                        <th key={rp} className="text-center p-2 border">{rp}-yr</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DURATIONS.map(dur => (
                      <tr key={dur} className={dur === selectedDuration ? "bg-primary/10" : "hover:bg-muted/30"}>
                        <td className="p-2 border font-medium">{dur}-hr</td>
                        {RETURN_PERIODS.map(rp => {
                          const depth = activeDepths[dur]?.[rp];
                          const displayDepth = depth
                            ? (unitSystem === 'USA' ? depth.toFixed(2) : convertDepth(depth, 'USA', 'SI').toFixed(1))
                            : "—";
                          const isSelected = dur === selectedDuration && rp === selectedReturnPeriod;
                          return (
                            <td
                              key={rp}
                              className={`p-2 border text-center cursor-pointer transition-colors ${
                                isSelected ? "bg-primary text-primary-foreground font-bold" : "hover:bg-accent"
                              }`}
                              onClick={() => {
                                setSelectedDuration(dur);
                                setSelectedReturnPeriod(rp);
                              }}
                            >
                              {displayDepth}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* IDF Curve Chart with Confidence Interval & Multi-Duration Overlay */}
            {(() => {
              const DURATION_COLORS: Record<string, string> = {
                "1": "hsl(200, 80%, 55%)",
                "2": "hsl(160, 70%, 45%)",
                "6": "hsl(var(--primary))",
                "12": "hsl(280, 60%, 55%)",
                "24": "hsl(350, 70%, 55%)",
              };

              const allDurations = [selectedDuration, ...chartOverlayDurations.filter(d => d !== selectedDuration)];
              const depthUnit = unitSystem === 'USA' ? 'in' : 'mm';
              const decimals = unitSystem === 'USA' ? 2 : 1;

              const chartData = RETURN_PERIODS.map(rp => {
                const rpNum = parseInt(rp);
                const entry: Record<string, unknown> = { rp: `${rp}-yr`, rpNum };

                for (const dur of allDurations) {
                  const raw = activeDepths[dur]?.[rp];
                  entry[`d${dur}`] = raw ? (unitSystem === 'USA' ? raw : convertDepth(raw, 'USA', 'SI')) : null;
                }

                // CI band for primary duration only
                if (liveUpper && liveLower) {
                  const uv = liveUpper[selectedDuration]?.[rp];
                  const lv = liveLower[selectedDuration]?.[rp];
                  if (uv != null && lv != null) {
                    const upper = unitSystem === 'USA' ? uv : convertDepth(uv, 'USA', 'SI');
                    const lower = unitSystem === 'USA' ? lv : convertDepth(lv, 'USA', 'SI');
                    entry.ciRange = [lower, upper];
                  }
                }

                return entry;
              });

              const hasCI = chartData.some(d => d.ciRange);

              const toggleOverlay = (dur: string) => {
                if (dur === selectedDuration) return;
                setChartOverlayDurations(prev =>
                  prev.includes(dur) ? prev.filter(d => d !== dur) : [...prev, dur]
                );
              };

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      IDF Curves
                      {hasCI && <Badge variant="outline" className="text-xs">90% CI</Badge>}
                    </p>
                    <button
                      onClick={() => setLogScale(prev => !prev)}
                      className={`px-2 py-0.5 rounded text-xs font-medium border transition-all ${
                        logScale
                          ? "border-primary/60 text-primary bg-primary/10"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {logScale ? "Log ✓" : "Log"}
                    </button>
                  </div>

                  {/* Duration toggle chips */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground mr-1">Durations:</span>
                    {DURATIONS.map(dur => {
                      const isPrimary = dur === selectedDuration;
                      const isOverlay = chartOverlayDurations.includes(dur);
                      const isActive = isPrimary || isOverlay;
                      return (
                        <button
                          key={dur}
                          onClick={() => toggleOverlay(dur)}
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                            isPrimary
                              ? "bg-primary text-primary-foreground border-primary cursor-default"
                              : isOverlay
                                ? "border-primary/60 text-primary bg-primary/10 hover:bg-primary/20"
                                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                          title={isPrimary ? "Primary duration (change via dropdown above)" : isOverlay ? `Remove ${dur}-hr overlay` : `Add ${dur}-hr overlay`}
                        >
                          {dur}-hr
                          {isPrimary && <span className="ml-1 opacity-60">●</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis
                          dataKey={logScale ? "rpNum" : "rp"}
                          type={logScale ? "number" : "category"}
                          scale={logScale ? "log" : "auto"}
                          domain={logScale ? [1, 1200] : undefined}
                          ticks={logScale ? [2, 5, 10, 25, 50, 100, 200, 500, 1000] : undefined}
                          tickFormatter={logScale ? (v: number) => `${v}-yr` : undefined}
                          tick={{ fontSize: 11 }}
                          label={{ value: `Return Period${logScale ? ' (log)' : ''}`, position: "insideBottom", offset: -10, fontSize: 12 }}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          label={{ value: `Depth (${depthUnit})`, angle: -90, position: "insideLeft", offset: 5, fontSize: 12 }}
                        />
                        <RechartsTooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }}
                          formatter={(value: unknown, name: string) => {
                            if (name === 'ciRange') {
                              const arr = value as number[];
                              return [`${arr[0].toFixed(decimals)} – ${arr[1].toFixed(decimals)} ${depthUnit}`, '90% CI'];
                            }
                            const durKey = name.replace('d', '');
                            return [`${(value as number).toFixed(decimals)} ${depthUnit}`, `${durKey}-hr`];
                          }}
                        />
                        {hasCI && (
                          <Area
                            dataKey="ciRange"
                            fill="hsl(var(--warning) / 0.15)"
                            stroke="hsl(var(--warning) / 0.35)"
                            strokeDasharray="4 2"
                            strokeWidth={1}
                            name="ciRange"
                            legendType="none"
                          />
                        )}
                        {/* Overlay durations (behind primary) */}
                        {chartOverlayDurations.filter(d => d !== selectedDuration).map(dur => (
                          <Line
                            key={dur}
                            type="monotone"
                            dataKey={`d${dur}`}
                            stroke={DURATION_COLORS[dur] || "hsl(var(--muted-foreground))"}
                            strokeWidth={1.5}
                            strokeDasharray="6 3"
                            dot={{ r: 3, fill: DURATION_COLORS[dur] || "hsl(var(--muted-foreground))" }}
                            activeDot={{ r: 5 }}
                            name={`d${dur}`}
                            connectNulls
                          />
                        ))}
                        {/* Primary duration */}
                        <Line
                          type="monotone"
                          dataKey={`d${selectedDuration}`}
                          stroke={DURATION_COLORS[selectedDuration] || "hsl(var(--primary))"}
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: DURATION_COLORS[selectedDuration] || "hsl(var(--primary))" }}
                          activeDot={{ r: 6 }}
                          name={`d${selectedDuration}`}
                          connectNulls
                        />
                        {selectedReturnPeriod && (
                          <ReferenceLine
                            x={`${selectedReturnPeriod}-yr`}
                            stroke="hsl(var(--primary) / 0.5)"
                            strokeDasharray="6 3"
                            strokeWidth={1}
                          />
                        )}
                        <Legend
                          verticalAlign="top"
                          height={28}
                          formatter={(value: string) => {
                            if (value === 'ciRange') return <span className="text-xs text-warning">90% CI</span>;
                            const durKey = value.replace('d', '');
                            const isPrimary = durKey === selectedDuration;
                            return (
                              <span className="text-xs" style={{ color: DURATION_COLORS[durKey], fontWeight: isPrimary ? 600 : 400 }}>
                                {durKey}-hr{isPrimary ? ' ●' : ''}
                              </span>
                            );
                          }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  {hasCI && (
                    <p className="text-xs text-muted-foreground text-center">
                      Shaded band shows the 90% CI for the primary ({selectedDuration}-hr) duration. Click other durations above to overlay for comparison.
                    </p>
                  )}
                  {!hasCI && chartOverlayDurations.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Click duration chips above to overlay multiple curves for comparison.
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Source Info */}
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {liveData
                      ? `Site-specific data from ${liveSource}. Values are precipitation depths for the partial duration series (PDS).`
                      : "Regional representative values based on NOAA Atlas 14. For site-specific data, enter a zip code above or use Advanced Tools → IDF Lookup."
                    }
                  </p>
                  {!liveData && (
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                      <a href="https://hdsc.nws.noaa.gov/pfds/" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open NOAA PFDS directly
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
