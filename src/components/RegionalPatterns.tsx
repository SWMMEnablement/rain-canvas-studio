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
  source: string;
}

/** Literature sources for widely used generic patterns */
const PATTERN_SOURCES: Record<string, string> = {
  balanced: "Chow, Maidment & Mays (1988) Applied Hydrology, §14.4 alternating block",
  chicago: "Keifer & Chu (1957) Synthetic storm pattern for drainage design, ASCE J. Hydraulics Div. 83(4)",
  dwa: "DWA-A 118 (2006)",
  euler2: "DWA-A 118 (2006) Euler Type II",
  huff1: "Huff (1967) Time distribution of rainfall in heavy storms, Water Resources Research 3(4)",
  huff2: "Huff (1967) Time distribution of rainfall in heavy storms, Water Resources Research 3(4)",
  noaa_a14: "Bonnin et al. NOAA Atlas 14 Precipitation-Frequency Atlas (2004–2019)",
  scs2: "USDA NRCS (1986) TR-55 Urban Hydrology for Small Watersheds",
  triangular: "Yen & Chow (1980) Design hyetographs for small drainage structures, ASCE J. Hydraulics Div. 106(6)",
};

type Confidence = "high" | "medium" | "manual" | "default";
const CONFIDENCE_LABEL: Record<Confidence, string> = {
  default: "No detection — default shown",
  high: "High confidence — browser language region",
  manual: "Selected manually",
  medium: "Medium confidence — time zone",
};

/** Country code → locally accepted design storm patterns (alphabetical by name) */
export const REGIONS: Region[] = [
  { code: "AE", name: "United Arab Emirates", note: "Gulf arid short-duration design storms", patterns: ["uae_ncms", "chicago", "balanced"], source: "UAE NCMS rainfall IDF studies; Dubai Municipality Drainage Design Guidelines" },
  { code: "AU", name: "Australia", note: "ARR 2019 temporal patterns", patterns: ["arr", "chicago", "triangular"], source: "Ball et al. (2019) Australian Rainfall & Runoff, Book 2 Ch. 5, Geoscience Australia" },
  { code: "BR", name: "Brazil", note: "ANA / Chicago-based urban storms", patterns: ["brazil_ana", "chicago", "huff2"], source: "ANA (Agência Nacional de Águas) hydrology manuals; DAEE/CETESB (1980) Drenagem Urbana" },
  { code: "CA", name: "Canada", note: "CDA / AES Chicago storms", patterns: ["canadian", "chicago", "scs2"], source: "Hogg (1980) AES Design Storms, Environment Canada; MTO Drainage Management Manual (1997)" },
  { code: "CL", name: "Chile", note: "DGA design storms", patterns: ["chile_dga", "chicago", "triangular"], source: "DGA (1991) Precipitaciones Máximas en 1, 2 y 3 Días; MOP Manual de Carreteras Vol. 3" },
  { code: "CN", name: "China", note: "GB 50014 rainstorm intensity formula", patterns: ["china_gb50014", "chicago", "triangular"], source: "GB 50014-2021 Standard for Design of Outdoor Wastewater Engineering" },
  { code: "CO", name: "Colombia", note: "IDEAM design storms", patterns: ["colombia_ideam", "chicago", "huff2"], source: "IDEAM IDF curves; INVÍAS (2009) Manual de Drenaje para Carreteras" },
  { code: "DE", name: "Germany", note: "DWA-A 118 Euler Type II", patterns: ["euler2", "dwa", "chicago"], source: "DWA-A 118 (2006) Hydraulic Dimensioning of Drainage Systems; KOSTRA-DWD" },
  { code: "EG", name: "Egypt", note: "HCWW arid design storms", patterns: ["egypt_hcww", "chicago", "block" as PatternType], source: "HCWW Egyptian Code for Drainage Networks (ECP 101)" },
  { code: "FR", name: "France", note: "Desbordes double-triangle IT77", patterns: ["desbordes", "chicago", "euler2"], source: "Desbordes (1978); CERTU (2003) La ville et son assainissement, Instruction Technique 77-284" },
  { code: "GB", name: "United Kingdom", note: "FEH / FSR summer & winter profiles", patterns: ["feh", "fsr" as PatternType, "chicago"], source: "CEH Flood Estimation Handbook (1999) Vol. 2; NERC (1975) Flood Studies Report" },
  { code: "ID", name: "Indonesia", note: "BMKG tropical storms", patterns: ["indonesia_bmkg", "chicago", "huff1" as PatternType], source: "SNI 2415:2016 Tata Cara Perhitungan Debit Banjir; BMKG rainfall data" },
  { code: "IN", name: "India", note: "IMD short-duration formula", patterns: ["india_imd", "chicago", "scs2"], source: "CPHEEO (2019) Manual on Storm Water Drainage Systems; IMD IDF atlas" },
  { code: "IT", name: "Italy", note: "VAPI / Italian LSPP curves", patterns: ["italian", "chicago", "euler2"], source: "CNR-GNDCI VAPI regional analysis (Rossi & Villani, 1994)" },
  { code: "JP", name: "Japan", note: "JMA AMeDAS & typhoon patterns", patterns: ["jma", "japan_typhoon" as PatternType, "chicago"], source: "MLIT Sewerage Facility Design Guideline (JSWA, 2019); JMA AMeDAS" },
  { code: "KE", name: "Kenya", note: "KMD design storms", patterns: ["kenya_kmd", "chicago", "scs2"], source: "Kenya Ministry of Roads (2009) Road Design Manual Pt. III – Drainage" },
  { code: "KR", name: "South Korea", note: "KMA Huff-based profiles", patterns: ["korea_kma", "huff2", "chicago"], source: "MOLIT (2019) Design Flood Estimation Guideline; Huff quartile method" },
  { code: "MX", name: "Mexico", note: "CONAGUA design storms", patterns: ["mexico_conagua", "scs2", "chicago"], source: "CONAGUA (2016) MAPAS – Manual de Agua Potable, Alcantarillado y Saneamiento" },
  { code: "MY", name: "Malaysia", note: "MSMA 2nd edition", patterns: ["malaysia_msma", "chicago", "huff2"], source: "DID Malaysia (2012) MSMA 2nd Edition, Ch. 2" },
  { code: "NG", name: "Nigeria", note: "NIMET design storms", patterns: ["nigeria_nimet", "chicago", "scs2"], source: "FMW Nigeria Highway Manual Pt. 1 Vol. IV – Drainage Design (2013)" },
  { code: "NL", name: "Netherlands", note: "STOWA / Buishand-Velds profiles", patterns: ["dutch", "chicago", "euler2"], source: "STOWA (2019) Neerslagstatistiek en -reeksen voor het waterbeheer" },
  { code: "NZ", name: "New Zealand", note: "TP108 nested profile", patterns: ["nz_tp108", "chicago", "triangular"], source: "Auckland Regional Council (1999) TP108 Guidelines for Stormwater Runoff Modelling" },
  { code: "PH", name: "Philippines", note: "PAGASA design storms", patterns: ["philippines_pagasa", "chicago", "huff2"], source: "DPWH (2015) Design Guidelines, Criteria and Standards Vol. 4; PAGASA RIDF" },
  { code: "SA", name: "Saudi Arabia", note: "PME arid design storms", patterns: ["saudi_pme", "chicago", "balanced"], source: "MOMRA / PME Saudi drainage design manuals" },
  { code: "SG", name: "Singapore", note: "PUB Code of Practice", patterns: ["singapore_pub", "chicago", "block" as PatternType], source: "PUB (2018) Code of Practice on Surface Water Drainage, 7th Ed." },
  { code: "TH", name: "Thailand", note: "TMD monsoon design storms", patterns: ["thailand_tmd", "chicago", "huff2"], source: "Royal Irrigation Dept. / TMD rainfall IDF reports" },
  { code: "US", name: "United States", note: "NRCS TR-55 and NOAA Atlas 14", patterns: ["scs2", "noaa_a14", "huff2"], source: "USDA NRCS (1986) TR-55; Bonnin et al. NOAA Atlas 14 (2004–2019)" },
  { code: "VN", name: "Vietnam", note: "IMHEN design storms", patterns: ["vietnam_imhen", "chicago", "huff2"], source: "TCVN 7957:2008 Drainage and Sewerage – External Networks" },
  { code: "ZA", name: "South Africa", note: "SANRAL drainage manual", patterns: ["sa_sanral", "chicago", "scs2"], source: "SANRAL (2013) Drainage Manual, 6th Ed.; Smithers & Schulze (2003)" },
];

function detectCountry(): { code: string; confidence: Confidence } | null {
  try {
    const langs = [navigator.language, ...(navigator.languages || [])];
    for (const l of langs) {
      const region = l?.split("-")[1]?.toUpperCase();
      if (region && REGIONS.some((r) => r.code === region)) return { code: region, confidence: "high" };
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
    const tzCode = tzZone(tz, tzMap);
    if (tzCode) return { code: tzCode, confidence: "medium" };
  } catch {
    /* ignore */
  }
  return null;
}

function tzZone(tz: string, tzMap: Record<string, string>): string | null {
  {
    if (tzMap[tz]) return tzMap[tz];
    const caZones = ["America/Toronto", "America/Vancouver", "America/Edmonton", "America/Winnipeg", "America/Halifax", "America/St_Johns", "America/Regina", "America/Montreal"];
    if (caZones.includes(tz)) return "CA";
    if (["America/Sao_Paulo", "America/Manaus", "America/Fortaleza", "America/Recife", "America/Bahia", "America/Belem"].includes(tz)) return "BR";
    if (tz.startsWith("America/Mexico") || ["America/Monterrey", "America/Tijuana", "America/Cancun", "America/Merida", "America/Chihuahua"].includes(tz)) return "MX";
    if (tz === "America/Santiago") return "CL";
    if (tz === "America/Bogota") return "CO";
    if (tz.startsWith("Australia/")) return "AU";
    const usZones = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Phoenix", "America/Anchorage", "America/Boise", "America/Detroit", "America/Juneau", "America/Adak", "America/Nome", "America/Sitka", "America/Yakutat", "America/Menominee", "Pacific/Honolulu"];
    if (usZones.includes(tz) || tz.startsWith("America/Indiana/") || tz.startsWith("America/Kentucky/") || tz.startsWith("America/North_Dakota/")) return "US";
  }
  return null;
}

interface Props {
  onSelectPattern: (patternId: string, patternName: string) => void;
}

export const RegionalPatterns = ({ onSelectPattern }: Props) => {
  const [code, setCode] = useState<string>("US");
  const [confidence, setConfidence] = useState<Confidence>("default");

  useEffect(() => {
    const found = detectCountry();
    if (found) {
      setCode(found.code);
      setConfidence(found.confidence);
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
              {confidence === "high" || confidence === "medium" ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" /> Detected {region.name} — {region.note}
                </span>
              ) : (
                <>Showing {region.name} — {region.note}</>
              )}
            </CardDescription>
            <Badge variant={confidence === "high" ? "default" : "outline"} className="mt-2 text-xs">
              {CONFIDENCE_LABEL[confidence]}
            </Badge>
          </div>
          <Select value={code} onValueChange={(v) => { setCode(v); setConfidence("manual"); }}>
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
            <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2">
              <span className="font-medium text-foreground">Source:</span>{" "}
              {i === 0 ? region.source : PATTERN_SOURCES[p.id] ?? region.source}
            </p>
          </button>
        ))}
      </CardContent>
      <p className="px-6 pb-4 text-xs text-muted-foreground">
        Country is inferred on your device from browser language (high confidence) or time zone (medium confidence); nothing is sent to a server. Always confirm against the current local standard.
      </p>
    </Card>
  );
};
