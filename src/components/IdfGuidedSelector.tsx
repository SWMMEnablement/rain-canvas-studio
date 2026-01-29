import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, CloudRain, ExternalLink, ChevronDown, ChevronUp, Zap, Target, Info } from "lucide-react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { type UnitSystem, convertDepth } from "@/lib/unitConversions";

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
      "1": { "2": 1.5, "5": 1.9, "10": 2.2, "25": 2.6, "50": 2.9, "100": 3.3 },
      "2": { "2": 1.8, "5": 2.4, "10": 2.8, "25": 3.3, "50": 3.7, "100": 4.2 },
      "6": { "2": 2.5, "5": 3.2, "10": 3.7, "25": 4.4, "50": 5.0, "100": 5.6 },
      "12": { "2": 3.0, "5": 3.9, "10": 4.5, "25": 5.4, "50": 6.2, "100": 7.0 },
      "24": { "2": 3.6, "5": 4.6, "10": 5.4, "25": 6.5, "50": 7.4, "100": 8.4 },
    }
  },
  gulfCoast: {
    name: "Gulf Coast (Houston, New Orleans)",
    description: "Tropical influence with frequent heavy rainfall events",
    recommendedScsType: "Type III",
    depths: {
      "1": { "2": 1.9, "5": 2.5, "10": 2.9, "25": 3.5, "50": 4.0, "100": 4.5 },
      "2": { "2": 2.4, "5": 3.1, "10": 3.6, "25": 4.4, "50": 5.0, "100": 5.7 },
      "6": { "2": 3.3, "5": 4.3, "10": 5.0, "25": 6.1, "50": 7.0, "100": 8.0 },
      "12": { "2": 4.0, "5": 5.2, "10": 6.1, "25": 7.4, "50": 8.5, "100": 9.7 },
      "24": { "2": 4.8, "5": 6.2, "10": 7.3, "25": 8.9, "50": 10.2, "100": 11.7 },
    }
  },
  northeast: {
    name: "Northeast (New York, Boston)",
    description: "Humid continental with nor'easters and frontal systems",
    recommendedScsType: "Type II",
    depths: {
      "1": { "2": 1.2, "5": 1.5, "10": 1.8, "25": 2.1, "50": 2.4, "100": 2.7 },
      "2": { "2": 1.4, "5": 1.9, "10": 2.2, "25": 2.6, "50": 3.0, "100": 3.4 },
      "6": { "2": 2.0, "5": 2.6, "10": 3.0, "25": 3.6, "50": 4.1, "100": 4.6 },
      "12": { "2": 2.4, "5": 3.1, "10": 3.7, "25": 4.4, "50": 5.0, "100": 5.7 },
      "24": { "2": 2.9, "5": 3.7, "10": 4.4, "25": 5.3, "50": 6.0, "100": 6.9 },
    }
  },
  midwest: {
    name: "Midwest (Chicago, St. Louis)",
    description: "Continental climate with severe thunderstorms",
    recommendedScsType: "Type II",
    depths: {
      "1": { "2": 1.3, "5": 1.7, "10": 2.0, "25": 2.4, "50": 2.7, "100": 3.1 },
      "2": { "2": 1.6, "5": 2.1, "10": 2.5, "25": 3.0, "50": 3.4, "100": 3.9 },
      "6": { "2": 2.2, "5": 2.9, "10": 3.4, "25": 4.1, "50": 4.7, "100": 5.3 },
      "12": { "2": 2.7, "5": 3.5, "10": 4.2, "25": 5.0, "50": 5.7, "100": 6.5 },
      "24": { "2": 3.2, "5": 4.1, "10": 4.9, "25": 5.9, "50": 6.7, "100": 7.7 },
    }
  },
  southwest: {
    name: "Southwest (Phoenix, Las Vegas)",
    description: "Arid climate with monsoon thunderstorms",
    recommendedScsType: "Type II",
    depths: {
      "1": { "2": 0.8, "5": 1.1, "10": 1.3, "25": 1.6, "50": 1.8, "100": 2.1 },
      "2": { "2": 1.0, "5": 1.3, "10": 1.6, "25": 1.9, "50": 2.2, "100": 2.5 },
      "6": { "2": 1.3, "5": 1.7, "10": 2.1, "25": 2.5, "50": 2.9, "100": 3.3 },
      "12": { "2": 1.6, "5": 2.1, "10": 2.5, "25": 3.1, "50": 3.5, "100": 4.0 },
      "24": { "2": 1.9, "5": 2.5, "10": 3.0, "25": 3.6, "50": 4.2, "100": 4.8 },
    }
  },
  pacificNorthwest: {
    name: "Pacific Northwest (Seattle, Portland)",
    description: "Maritime climate with prolonged frontal rainfall",
    recommendedScsType: "Type IA",
    depths: {
      "1": { "2": 0.5, "5": 0.7, "10": 0.8, "25": 1.0, "50": 1.1, "100": 1.3 },
      "2": { "2": 0.7, "5": 0.9, "10": 1.1, "25": 1.3, "50": 1.5, "100": 1.7 },
      "6": { "2": 1.1, "5": 1.4, "10": 1.7, "25": 2.0, "50": 2.3, "100": 2.6 },
      "12": { "2": 1.5, "5": 1.9, "10": 2.3, "25": 2.7, "50": 3.1, "100": 3.5 },
      "24": { "2": 2.0, "5": 2.5, "10": 3.0, "25": 3.6, "50": 4.1, "100": 4.7 },
    }
  },
  california: {
    name: "California Coast (San Francisco, LA)",
    description: "Mediterranean climate with winter storms",
    recommendedScsType: "Type I",
    depths: {
      "1": { "2": 0.6, "5": 0.8, "10": 1.0, "25": 1.2, "50": 1.4, "100": 1.6 },
      "2": { "2": 0.8, "5": 1.1, "10": 1.3, "25": 1.6, "50": 1.8, "100": 2.1 },
      "6": { "2": 1.3, "5": 1.7, "10": 2.0, "25": 2.4, "50": 2.8, "100": 3.2 },
      "12": { "2": 1.7, "5": 2.2, "10": 2.7, "25": 3.2, "50": 3.7, "100": 4.2 },
      "24": { "2": 2.2, "5": 2.9, "10": 3.4, "25": 4.1, "50": 4.8, "100": 5.5 },
    }
  },
  mountainWest: {
    name: "Mountain West (Denver, Salt Lake)",
    description: "Semi-arid continental with orographic effects",
    recommendedScsType: "Type II",
    depths: {
      "1": { "2": 0.9, "5": 1.2, "10": 1.4, "25": 1.7, "50": 1.9, "100": 2.2 },
      "2": { "2": 1.1, "5": 1.4, "10": 1.7, "25": 2.0, "50": 2.3, "100": 2.6 },
      "6": { "2": 1.5, "5": 1.9, "10": 2.3, "25": 2.7, "50": 3.1, "100": 3.5 },
      "12": { "2": 1.8, "5": 2.3, "10": 2.8, "25": 3.3, "50": 3.8, "100": 4.3 },
      "24": { "2": 2.1, "5": 2.7, "10": 3.2, "25": 3.9, "50": 4.4, "100": 5.1 },
    }
  },
};

const RETURN_PERIODS = ["2", "5", "10", "25", "50", "100"];
const DURATIONS = ["1", "2", "6", "12", "24"];

interface IdfGuidedSelectorProps {
  unitSystem: UnitSystem;
  onApplyDesignStorm: (depth: number, duration: number) => void;
}

export function IdfGuidedSelector({ unitSystem, onApplyDesignStorm }: IdfGuidedSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>("southeast");
  const [selectedReturnPeriod, setSelectedReturnPeriod] = useState<string>("10");
  const [selectedDuration, setSelectedDuration] = useState<string>("6");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");

  const regionData = REGIONAL_IDF_DATA[selectedRegion];

  const selectedDepth = useMemo(() => {
    if (!regionData) return null;
    const depthInches = regionData.depths[selectedDuration]?.[selectedReturnPeriod];
    if (!depthInches) return null;
    return unitSystem === 'USA' ? depthInches : convertDepth(depthInches, 'USA', 'SI');
  }, [selectedRegion, selectedReturnPeriod, selectedDuration, unitSystem, regionData]);

  const noaaPfdsUrl = useMemo(() => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) return null;
    return `https://hdsc.nws.noaa.gov/pfds/pfds_map_cont.html?bkmrk=ga&lat=${lat}&lon=${lon}&data=depth&units=english&series=pds`;
  }, [latitude, longitude]);

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(4));
          setLongitude(position.coords.longitude.toFixed(4));
          toast.success("Location retrieved - open NOAA PFDS for exact values");
        },
        (error) => {
          toast.error("Could not get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleApply = () => {
    if (selectedDepth !== null) {
      onApplyDesignStorm(selectedDepth, parseFloat(selectedDuration));
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
                    <Badge variant="secondary" className="text-xs">NOAA Atlas 14</Badge>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Select depth & duration based on regional rainfall statistics
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
            {/* Region Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Climate Region
              </Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
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
              {regionData && (
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
                      <SelectItem key={rp} value={rp}>{rp}-year</SelectItem>
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

            {/* Result Preview */}
            <div className="p-4 rounded-lg bg-accent/50 border border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Design Storm Depth</p>
                  <p className="text-2xl font-bold text-primary">{formatDepth(selectedDepth)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedReturnPeriod}-year, {selectedDuration}-hour storm
                  </p>
                </div>
                <Button onClick={handleApply} className="gap-2" disabled={selectedDepth === null}>
                  <Zap className="w-4 h-4" />
                  Apply to Storm
                </Button>
              </div>
            </div>

            {/* IDF Reference Table */}
            {regionData && (
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <CloudRain className="w-4 h-4" />
                  Regional IDF Reference ({unitSystem === 'USA' ? 'inches' : 'mm'})
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
                            const depth = regionData.depths[dur]?.[rp];
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
            )}

            {/* NOAA Link */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    For site-specific values, use the official NOAA Precipitation Frequency Data Server.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleGetCurrentLocation}>
                      <MapPin className="w-3 h-3 mr-1" />
                      Get Location
                    </Button>
                    {noaaPfdsUrl ? (
                      <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
                        <a href={noaaPfdsUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open NOAA PFDS
                        </a>
                      </Button>
                    ) : (
                      <div className="flex gap-1">
                        <Input 
                          placeholder="Lat" 
                          className="h-7 w-20 text-xs" 
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                        />
                        <Input 
                          placeholder="Lon" 
                          className="h-7 w-20 text-xs" 
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
