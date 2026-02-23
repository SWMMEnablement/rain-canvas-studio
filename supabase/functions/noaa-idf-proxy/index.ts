import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const units = url.searchParams.get("units") || "english";
    const series = url.searchParams.get("series") || "pds";
    const data = url.searchParams.get("data") || "depth";

    if (!lat || !lon) {
      return new Response(
        JSON.stringify({ error: "lat and lon are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (isNaN(latNum) || isNaN(lonNum) || latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const noaaUrl = `https://hdsc.nws.noaa.gov/cgi-bin/hdsc/new/cgi_readH5.py?lat=${latNum}&lon=${lonNum}&type=pf&data=${data}&units=${units}&series=${series}`;

    const noaaResponse = await fetch(noaaUrl, {
      headers: { "User-Agent": "WorldRainfallPatternPainter/1.0", "Accept": "*/*" },
    });

    if (!noaaResponse.ok) {
      return new Response(
        JSON.stringify({ error: `NOAA server returned ${noaaResponse.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawText = await noaaResponse.text();
    const parsed = parseNoaaResponse(rawText);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error proxying NOAA request:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * NOAA PFDS response format is JavaScript-like assignment statements:
 *   result = 'values';
 *   quantiles = [['0.498', '0.585', ...], ['0.787', ...], ...];
 *   upper = [['0.574', ...], ...];
 *   lower = [['0.432', ...], ...];
 *   ...other metadata variables...
 *
 * Each row = a duration (5-min through 60-day), each col = a return period (1yr through 1000yr)
 */
function parseNoaaResponse(text: string) {
  // Extract variable assignments using regex
  const extractVar = (name: string): string | null => {
    // Match: varname = value; (where value can span multiple lines)
    const regex = new RegExp(`${name}\\s*=\\s*([\\s\\S]*?)(?:;\\s*(?:[a-zA-Z_]|$))`, 'm');
    const match = text.match(regex);
    if (match) return match[1].trim().replace(/;$/, '').trim();
    return null;
  };

  // Extract 2D array from string like [['0.498', '0.585'], ['0.787', '0.928']]
  const extract2DArray = (name: string): number[][] => {
    const raw = extractVar(name);
    if (!raw) return [];
    try {
      // Replace single quotes with double quotes for JSON parsing
      const jsonStr = raw.replace(/'/g, '"');
      const arr = JSON.parse(jsonStr);
      if (Array.isArray(arr)) {
        return arr.map((row: (string | number)[]) =>
          Array.isArray(row)
            ? row.map((v) => {
                const n = parseFloat(String(v));
                return isNaN(n) ? 0 : n;
              })
            : []
        );
      }
    } catch {
      // Fallback: try manual parsing
      console.error(`Failed to parse ${name} as JSON`);
    }
    return [];
  };

  // Extract simple string var
  const extractString = (name: string): string => {
    const raw = extractVar(name);
    if (!raw) return "";
    return raw.replace(/^['"]|['"]$/g, "");
  };

  const quantiles = extract2DArray("quantiles");
  const upper = extract2DArray("upper");
  const lower = extract2DArray("lower");

  // Standard NOAA Atlas 14 durations and return periods
  const durations = [
    "5-min", "10-min", "15-min", "30-min", "60-min",
    "2-hr", "3-hr", "6-hr", "12-hr", "24-hr",
    "2-day", "3-day", "4-day", "7-day", "10-day",
    "20-day", "30-day", "45-day", "60-day"
  ];

  const returnPeriods = ["1", "2", "5", "10", "25", "50", "100", "200", "500", "1000"];

  return {
    source: extractString("source") || "NOAA Atlas 14",
    dataType: extractString("datatype") || extractString("data"),
    durations,
    returnPeriods,
    quantiles,
    upper,
    lower,
  };
}
