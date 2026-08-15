import { useEffect, useMemo, useState } from "react";
import { Globe2, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { patterns } from "@/components/PatternSelector";
import type { PatternType } from "@/lib/rainfallPatterns";

interface Region {
  code: string;
  name: string;
  note: string;
  patterns: PatternType[];
}

/** Country code → locally accepted design storm patterns (alphabetical by name) */
export const REGIONS: Region[] = [
  { code: "AE", name: "United Arab Emirates", note: "Gulf arid short-duration design storms", patterns: ["uae_ncms", "chicago", "balanced"] },
  { code: "AU", name: "Australia", note: "ARR 2019 temporal patterns", patterns: ["arr", "chicago", "triangular"] },
  { code: "BR", name: "Brazil", note: "ANA / Chicago-based urban storms", patterns: ["brazil_ana", "chicago", "huff2"] },
  { code: "CA", name: "Canada", note: "CDA / AES Chicago storms", patterns: ["canadian", "chicago", "scs2"] },
  { code: "CL", name: "Chile", note: "DGA design storms", patterns: ["chile_dga", "chicago", "triangular"] },
  { code: "CN", name: "China", note: "GB 50014 rainstorm intensity formula", patterns: ["china_gb50014", "chicago", "triangular"] },
  { code: "CO", name: "Colombia", note: "IDEAM design storms", patterns: ["colombia_ideam", "chicago", "huff2"] },
  { code: "DE", name: "Germany", note: "DWA-A 118 Euler Type II", patterns: ["euler2", "dwa", "chicago"] },
  { code: "EG", name: "Egypt", note: "HCWW arid design storms", patterns: ["egypt_hcww", "chicago", "block" as PatternType] },
  { code: "FR", name: "France", note: "Desbordes double-triangle IT77", patterns: ["desbordes", "chicago", "euler2"] },
  { code: "GB", name: "United Kingdom", note: "FEH / FSR summer & winter profiles", patterns: ["feh", "fsr" as PatternType, "chicago"] },
  { code: "ID", name: "Indonesia", note: "BMKG tropical storms", patterns: ["indonesia_bmkg", "chicago", "huff1" as PatternType] },
  { code: "IN", name: "India", note: "IMD short-duration formula", patterns: ["india_imd", "chicago", "scs2"] },
  { code: "IT", name: "Italy", note: "VAPI / Italian LSPP curves", patterns: ["italian", "chicago", "euler2"] },
  { code: "JP", name: "Japan", note: "JMA AMeDAS & typhoon patterns", patterns: ["jma", "japan_typhoon" as PatternType, "chicago"] },
  { code: "KE", name: "Kenya", note: "KMD design storms", patterns: ["kenya_kmd", "chicago", "scs2"] },
  { code: "KR", name: "South Korea", note: "KMA Huff-based profiles", patterns: ["korea_kma", "huff2", "chicago"] },
  { code: "MX", name: "Mexico", note: "CONAGUA design storms", patterns: ["mexico_conagua", "scs2", "chicago"] },
  { code: "MY", name: "Malaysia", note: "MSMA 2nd edition", patterns: ["malaysia_msma", "chicago", "huff2"] },
  { code: "NG", name: "Nigeria", note: "NIMET design storms", patterns: ["nigeria_nimet", "chicago", "scs2"] },
  { code: "NL", name: "Netherlands", note: "STOWA / Buishand-Velds profiles", patterns: ["dutch", "chicago", "euler2"] },
  { code: "NZ", name: "New Zealand", note: "TP108 nested profile", patterns: ["nz_tp108", "chicago", "triangular"] },
  { code: "PH", name: "Philippines", note: "PAGASA design storms", patterns: ["philippines_pagasa", "chicago", "huff2"] },
  { code: "SA", name: "Saudi Arabia", note: "PME arid design storms", patterns: ["saudi_pme", "chicago", "balanced"] },
  { code: "SG", name: "Singapore", note: "PUB Code of Practice", patterns: ["singapore_pub", "chicago", "block" as PatternType] },
  { code: "TH", name: "Thailand", note: "TMD monsoon design storms", patterns: ["thailand_tmd", "chicago", "huff2"] },
  { code: "US", name: "United States", note: "NRCS TR-55 and NOAA Atlas 14", patterns: ["scs2", "noaa_a14", "huff2"] },
  { code: "VN", name: "Vietnam", note: "IMHEN design storms", patterns: ["vietnam_imhen", "chicago", "huff2"] },
  { code: "ZA", name: "South Africa", note: "SANRAL drainage manual", patterns: ["sa_sanral", "chicago", "scs2"] },
];

function detectCountry(): string | null {
  try {
    const langs = [navigator.language, ...(navigator.languages || [])];
    for (const l of langs) {
      const region = l?.split("-")[1]?.toUpperCase();
      if (region && REGIONS.some((r) => r.code === region)) return region;
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const tzMap: Record<string, string> = {
      "Europe/London": "GB", "Europe/Berlin": "DE", "Europe/Paris": "FR", "Europe/Rome": "IT",
      "Europe/Amsterdam": "NL", "Asia/Tokyo": "JP", "Asia/Shanghai": "CN", "Asia/Singapore": "SG",
      "Asia/Kolkata": "IN", "Asia/Seoul": "KR", "Asia/Dubai": "AE", "Asia/Riyadh": "SA",
      "Asia/Bangkok": "TH", "Asia/Jakarta": "ID", "Asia/Manila": "PH", "Asia/Kuala_Lumpur": "MY",
      "Asia/Ho_Chi_Minh": "VN", "Africa/Cairo": "EG", "Africa/Nairobi": "KE", "Africa/Lagos": "NG",
      "Africa/Johannesburg": "ZA", "Pacific/Auckland": "NZ",
    };
    if (tzMap[tz]) return tzMap[tz];
    if (tz.startsWith("America/Toronto") || tz.startsWith("America/Vancouver")) return "CA";
    if (tz.startsWith("America/Sao_Paulo")) return "BR";
    if (tz.startsWith("America/Mexico")) return "MX";
    if (tz.startsWith("America/Santiago")) return "CL";
    if (tz.startsWith("America/Bogota")) return "CO";
    if (tz.startsWith("Australia/")) return "AU";
    if (tz.startsWith("America/")) return "US";
  } catch {
    /* ignore */
  }
  return null;
}

interface Props {
  onSelectPattern: (patternId: string, patternName: string) => void;
}

export const RegionalPatterns = ({ onSelectPattern }: Props) => {
  const [code, setCode] = useState<string>("US");
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const found = detectCountry();
    if (found) {
      setCode(found);
      setDetected(true);
    }
  }, []);

  const region = useMemo(() => REGIONS.find((r) => r.code === code) ?? REGIONS.find((r) => r.code === "US")!, [code]);
  const items = useMemo(
    () => region.patterns.map((id) => patterns.find((p) => p.id === id)).filter(Boolean) as typeof patterns,
    [region]
  );

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Globe2 className="w-5 h-5 text-primary" aria-hidden="true" />
              Patterns used in your region
            </CardTitle>
            <CardDescription className="mt-1">
              {detected ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Detected {region.name} — {region.note}
                </span>
              ) : (
                <>Showing {region.name} — {region.note}</>
              )}
            </CardDescription>
          </div>
          <Select value={code} onValueChange={(v) => { setCode(v); setDetected(false); }}>
            <SelectTrigger className="w-[240px]" aria-label="Choose your country">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {REGIONS.map((r) => (
                <SelectItem key={r.code} value={r.code}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        {items.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelectPattern(p.id, p.name)}
            className="text-left rounded-lg border border-border bg-muted/40 hover:bg-muted transition-colors p-4"
            aria-label={`Use ${p.name} in the storm wizard`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={i === 0 ? "default" : "secondary"} className="text-[10px]">
                {i === 0 ? "Primary standard" : "Also used"}
              </Badge>
            </div>
            <p className="font-medium text-foreground">{p.name}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{p.description}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
