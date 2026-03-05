import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, CloudRain, Info, Copy, Check, Loader2, Zap, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const RETURN_PERIODS = [2, 5, 10, 25, 50, 100];
const ALL_RETURN_PERIODS = [1, 2, 5, 10, 25, 50, 100, 200, 500, 1000];
const DURATIONS = [
  { label: "5-min", minutes: 5 },
  { label: "10-min", minutes: 10 },
  { label: "15-min", minutes: 15 },
  { label: "30-min", minutes: 30 },
  { label: "60-min", minutes: 60 },
  { label: "2-hr", minutes: 120 },
  { label: "3-hr", minutes: 180 },
  { label: "6-hr", minutes: 360 },
  { label: "12-hr", minutes: 720 },
  { label: "24-hr", minutes: 1440 },
];

type IdfData = {
  [duration: string]: {
    [returnPeriod: number]: string;
  };
};

interface NoaaApiResponse {
  source: string;
  dataType: string;
  durations: string[];
  returnPeriods: string[];
  quantiles: number[][];
  upper: number[][];
  lower: number[][];
  error?: string;
}

interface IdfLookupProps {
  initialLat?: string;
  initialLon?: string;
  initialName?: string;
  autoFetch?: boolean;
}

export function IdfLookup({ initialLat, initialLon, initialName, autoFetch }: IdfLookupProps = {}) {
  const [latitude, setLatitude] = useState<string>(initialLat || "33.749");
  const [longitude, setLongitude] = useState<string>(initialLon || "-84.388");
  const [locationName, setLocationName] = useState<string>(initialName || "Atlanta, GA");
  const [idfData, setIdfData] = useState<IdfData>({});
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noaaSource, setNoaaSource] = useState<string>("");
  const [fetchError, setFetchError] = useState<string>("");

  // Update when external props change (e.g. from map city click)
  useEffect(() => {
    if (initialLat && initialLon) {
      setLatitude(initialLat);
      setLongitude(initialLon);
      setLocationName(initialName || "");
    }
  }, [initialLat, initialLon, initialName]);

  const autoFetchDone = useRef(false);

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
          setLocationName("Current Location");
          toast.success("Location retrieved successfully");
        },
        (error) => {
          toast.error("Could not get location: " + error.message);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleFetchNoaaData = useCallback(async () => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) {
      toast.error("Please enter valid coordinates");
      return;
    }

    setLoading(true);
    setFetchError("");

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/noaa-idf-proxy?lat=${lat}&lon=${lon}&data=depth&units=english&series=pds`;

      const response = await fetch(url, {
        headers: {
          "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${response.status}`);
      }

      const data: NoaaApiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.quantiles || data.quantiles.length === 0) {
        throw new Error("No precipitation data available for this location");
      }

      // Map NOAA response to IdfData format
      const newIdfData: IdfData = {};
      const noaaDurations = data.durations;
      const noaaReturnPeriods = data.returnPeriods.map(Number);

      noaaDurations.forEach((dur, dIdx) => {
        // Map NOAA duration labels to our labels
        const mappedLabel = mapDurationLabel(dur);
        if (!mappedLabel || dIdx >= data.quantiles.length) return;

        newIdfData[mappedLabel] = {};
        noaaReturnPeriods.forEach((rp, rpIdx) => {
          if (rpIdx < data.quantiles[dIdx].length) {
            const val = data.quantiles[dIdx][rpIdx];
            if (val !== null && val !== undefined && val > 0) {
              newIdfData[mappedLabel][rp] = val.toFixed(2);
            }
          }
        });
      });

      setIdfData(newIdfData);
      setNoaaSource(data.source || "NOAA Atlas 14");
      toast.success(`NOAA Atlas 14 data retrieved for ${locationName}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to fetch NOAA data";
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [latitude, longitude, locationName]);

  // Auto-fetch when triggered from external source (e.g. map city click)
  useEffect(() => {
    if (autoFetch && initialLat && initialLon && !autoFetchDone.current) {
      autoFetchDone.current = true;
      const t = setTimeout(() => handleFetchNoaaData(), 200);
      return () => clearTimeout(t);
    }
  }, [autoFetch, initialLat, initialLon, handleFetchNoaaData]);

  const handleIdfValueChange = (duration: string, returnPeriod: number, value: string) => {
    setIdfData(prev => ({
      ...prev,
      [duration]: {
        ...(prev[duration] || {}),
        [returnPeriod]: value
      }
    }));
  };

  const calculateIntensity = (depth: string, durationMinutes: number): string => {
    const d = parseFloat(depth);
    if (isNaN(d) || d <= 0) return "—";
    const intensity = d / (durationMinutes / 60);
    return intensity.toFixed(2);
  };

  const copyTableToClipboard = () => {
    let text = `IDF Data for ${locationName} (${latitude}, ${longitude})\n`;
    text += `Source: ${noaaSource || "Manual Entry"}\n`;
    text += "Duration\t" + RETURN_PERIODS.map(rp => `${rp}-yr`).join("\t") + "\n";
    
    DURATIONS.forEach(dur => {
      const row = [dur.label];
      RETURN_PERIODS.forEach(rp => {
        const val = idfData[dur.label]?.[rp] || "";
        row.push(val ? `${val}"` : "");
      });
      text += row.join("\t") + "\n";
    });
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("IDF table copied to clipboard");
  };

  const hasAnyData = Object.keys(idfData).length > 0 && 
    Object.values(idfData).some(durations => 
      Object.values(durations).some(val => val && val.trim() !== "")
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-primary" />
          NOAA Atlas 14 IDF Lookup
          <Badge variant="default" className="text-xs ml-2">Live API</Badge>
        </CardTitle>
        <CardDescription>
          Retrieve precipitation frequency data for any US location — auto-populated from NOAA Atlas 14
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Input */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <h4 className="font-semibold">Location</h4>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="location-name">Location Name</Label>
              <Input
                id="location-name"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g., Atlanta, GA"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g., 33.749"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g., -84.388"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleGetCurrentLocation}>
              <MapPin className="w-4 h-4 mr-1" />
              Use My Location
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleFetchNoaaData}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-1" />
              )}
              {loading ? "Fetching..." : "Fetch NOAA Data"}
            </Button>
            {noaaPfdsUrl && (
              <Button variant="outline" size="sm" asChild>
                <a href={noaaPfdsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open NOAA PFDS
                </a>
              </Button>
            )}
          </div>

          {fetchError && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {fetchError}
            </div>
          )}

          {noaaSource && (
            <div className="p-3 bg-green-50 dark:bg-green-950/50 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Data retrieved from {noaaSource} for ({latitude}, {longitude})
              </p>
            </div>
          )}
        </div>

        {/* Quick Select Locations */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Quick Select Locations</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { name: "New York, NY", lat: "40.7128", lon: "-74.0060" },
              { name: "Los Angeles, CA", lat: "34.0522", lon: "-118.2437" },
              { name: "Chicago, IL", lat: "41.8781", lon: "-87.6298" },
              { name: "Houston, TX", lat: "29.7604", lon: "-95.3698" },
              { name: "Phoenix, AZ", lat: "33.4484", lon: "-112.0740" },
              { name: "Miami, FL", lat: "25.7617", lon: "-80.1918" },
              { name: "Seattle, WA", lat: "47.6062", lon: "-122.3321" },
              { name: "Denver, CO", lat: "39.7392", lon: "-104.9903" },
            ].map(loc => (
              <Button
                key={loc.name}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setLatitude(loc.lat);
                  setLongitude(loc.lon);
                  setLocationName(loc.name);
                  setIdfData({});
                  setNoaaSource("");
                }}
              >
                {loc.name}
              </Button>
            ))}
          </div>
        </div>

        {/* IDF Data Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Precipitation Depth Data (inches)</h4>
            {hasAnyData && (
              <Button variant="outline" size="sm" onClick={copyTableToClipboard}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied!" : "Copy Table"}
              </Button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 border font-semibold">Duration</th>
                  {RETURN_PERIODS.map(rp => (
                    <th key={rp} className="text-center p-2 border font-semibold min-w-[70px]">
                      {rp}-yr
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DURATIONS.map(dur => (
                  <tr key={dur.label} className="hover:bg-muted/30">
                    <td className="p-2 border font-medium">{dur.label}</td>
                    {RETURN_PERIODS.map(rp => (
                      <td key={rp} className="p-1 border">
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 text-center text-sm"
                          value={idfData[dur.label]?.[rp] || ""}
                          onChange={(e) => handleIdfValueChange(dur.label, rp, e.target.value)}
                          placeholder="—"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Intensity Table (calculated from depths) */}
        {hasAnyData && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">Rainfall Intensity (in/hr)</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Intensity = Depth ÷ Duration</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Badge variant="secondary" className="text-xs">Calculated</Badge>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 border font-semibold">Duration</th>
                    {RETURN_PERIODS.map(rp => (
                      <th key={rp} className="text-center p-2 border font-semibold">
                        {rp}-yr
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {DURATIONS.map(dur => (
                    <tr key={dur.label} className="hover:bg-muted/30">
                      <td className="p-2 border font-medium text-foreground">{dur.label}</td>
                      {RETURN_PERIODS.map(rp => {
                        const depth = idfData[dur.label]?.[rp] || "";
                        const intensity = calculateIntensity(depth, dur.minutes);
                        return (
                          <td key={rp} className="p-2 border text-center">
                            {intensity}
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

        {/* Reference Info */}
        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
          <h4 className="font-semibold">About NOAA Atlas 14</h4>
          <p className="text-muted-foreground">
            NOAA Atlas 14 provides precipitation frequency estimates for the United States. 
            Click <strong>"Fetch NOAA Data"</strong> to automatically retrieve depth-duration-frequency 
            data for your coordinates. Values can also be entered manually.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">Live API Integration</Badge>
            <Badge variant="outline">Continental US Coverage</Badge>
            <Badge variant="outline">Statistical Analysis</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Map NOAA duration labels to our standard labels */
function mapDurationLabel(noaaLabel: string): string | null {
  const map: Record<string, string> = {
    "5-min": "5-min",
    "10-min": "10-min",
    "15-min": "15-min",
    "30-min": "30-min",
    "60-min": "60-min",
    "2-hr": "2-hr",
    "3-hr": "3-hr",
    "6-hr": "6-hr",
    "12-hr": "12-hr",
    "24-hr": "24-hr",
  };
  return map[noaaLabel] || null;
}
