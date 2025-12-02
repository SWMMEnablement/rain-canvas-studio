import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, MapPin, CloudRain, Info, Copy, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

const RETURN_PERIODS = [2, 5, 10, 25, 50, 100];
const DURATIONS = [
  { label: "5-min", minutes: 5 },
  { label: "10-min", minutes: 10 },
  { label: "15-min", minutes: 15 },
  { label: "30-min", minutes: 30 },
  { label: "1-hr", minutes: 60 },
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

export function IdfLookup() {
  const [latitude, setLatitude] = useState<string>("33.749");
  const [longitude, setLongitude] = useState<string>("-84.388");
  const [locationName, setLocationName] = useState<string>("Atlanta, GA");
  const [idfData, setIdfData] = useState<IdfData>({});
  const [copied, setCopied] = useState(false);

  const noaaUrl = useMemo(() => {
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon)) return null;
    return `https://hdsc.nws.noaa.gov/cgi-bin/hdsc/new/cgi_readH5.py?lat=${lat}&lon=${lon}&type=pf&data=depth&units=english&series=pds`;
  }, [latitude, longitude]);

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
        </CardTitle>
        <CardDescription>
          Retrieve precipitation frequency data for any US location
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
            {noaaPfdsUrl && (
              <Button variant="default" size="sm" asChild>
                <a href={noaaPfdsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open NOAA PFDS
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Info className="w-4 h-4" />
            How to Use
          </h4>
          <ol className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1 list-decimal list-inside">
            <li>Enter coordinates or click "Use My Location"</li>
            <li>Click "Open NOAA PFDS" to access the official data</li>
            <li>On the NOAA site, click your location on the map</li>
            <li>Copy the precipitation depths from the table below</li>
            <li>Enter the values in the input fields below for reference</li>
          </ol>
        </div>

        {/* IDF Data Entry Table */}
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

        {/* Common Locations Quick Select */}
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
                }}
              >
                {loc.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Reference Info */}
        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
          <h4 className="font-semibold">About NOAA Atlas 14</h4>
          <p className="text-muted-foreground">
            NOAA Atlas 14 provides precipitation frequency estimates for the United States. 
            The data represents the expected rainfall depth for various storm durations and 
            return periods based on historical records and statistical analysis.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">Updated through 2023</Badge>
            <Badge variant="outline">Continental US Coverage</Badge>
            <Badge variant="outline">Statistical Analysis</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
