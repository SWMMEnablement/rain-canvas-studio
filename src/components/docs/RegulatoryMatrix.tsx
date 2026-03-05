import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, HelpCircle, AlertTriangle } from "lucide-react";

type Status = "required" | "accepted" | "preferred" | "not-accepted" | "unknown";

interface MatrixEntry {
  jurisdiction: string;
  country: string;
  type: string;
  patterns: Record<string, Status>;
  notes: string;
  referenceDoc: string;
  lastVerified: string;
}

const STATUS_STYLES: Record<Status, { icon: typeof CheckCircle; className: string; label: string }> = {
  required: { icon: CheckCircle, className: "text-emerald-600", label: "Required" },
  preferred: { icon: CheckCircle, className: "text-sky-600", label: "Preferred" },
  accepted: { icon: CheckCircle, className: "text-blue-500", label: "Accepted" },
  "not-accepted": { icon: XCircle, className: "text-destructive", label: "No" },
  unknown: { icon: HelpCircle, className: "text-muted-foreground", label: "?" },
};

const PATTERN_COLUMNS = [
  { key: "scs2", label: "SCS II" },
  { key: "scs3", label: "SCS III" },
  { key: "scs1", label: "SCS I" },
  { key: "huff3", label: "Huff 3Q" },
  { key: "chicago", label: "Chicago" },
  { key: "block", label: "Alt. Block" },
  { key: "euler2", label: "Euler II" },
  { key: "feh", label: "FEH" },
  { key: "desbordes", label: "Desbordes" },
  { key: "desbordes2", label: "Desb. 2P" },
  { key: "arr", label: "ARR" },
  { key: "snip", label: "SNiP" },
  { key: "local", label: "Local" },
];

const MATRIX_DATA: MatrixEntry[] = [
  // ── United States ──
  {
    jurisdiction: "FEMA (Nationwide)", country: "US", type: "federal",
    patterns: { scs2: "accepted", scs3: "accepted", scs1: "accepted", huff3: "accepted", chicago: "accepted", block: "accepted", euler2: "unknown", feh: "unknown", desbordes: "unknown", desbordes2: "unknown", arr: "unknown", snip: "unknown", local: "accepted" },
    notes: "Accepts any technically defensible distribution", referenceDoc: "FEMA Guidelines for Flood Risk Analysis", lastVerified: "2025-01",
  },
  {
    jurisdiction: "USACE (Nationwide)", country: "US", type: "federal",
    patterns: { scs2: "accepted", scs3: "accepted", scs1: "accepted", huff3: "accepted", chicago: "accepted", block: "accepted", euler2: "unknown", feh: "unknown", desbordes: "unknown", desbordes2: "unknown", arr: "unknown", snip: "unknown", local: "accepted" },
    notes: "Accepted for Section 404/NEPA analysis", referenceDoc: "EM 1110-2-1417", lastVerified: "2025-01",
  },
  {
    jurisdiction: "TxDOT (Texas)", country: "US", type: "state-dot",
    patterns: { scs2: "required", scs3: "accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "not-accepted" },
    notes: "TxDOT HDM Ch. 4 mandates specific distributions", referenceDoc: "TxDOT Hydraulic Design Manual", lastVerified: "2024-11",
  },
  {
    jurisdiction: "FDOT (Florida)", country: "US", type: "state-dot",
    patterns: { scs2: "not-accepted", scs3: "accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Must use FDOT Zone-specific distributions (Zones 1–5)", referenceDoc: "FDOT Drainage Manual Ch. 2", lastVerified: "2024-09",
  },
  {
    jurisdiction: "Caltrans (California)", country: "US", type: "state-dot",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "required", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Use SCS Type I or IA for California", referenceDoc: "Caltrans Highway Design Manual", lastVerified: "2025-01",
  },
  {
    jurisdiction: "MWRD (Chicago)", country: "US", type: "municipality",
    patterns: { scs2: "accepted", scs3: "unknown", scs1: "unknown", huff3: "accepted", chicago: "accepted", block: "accepted", euler2: "unknown", feh: "unknown", desbordes: "unknown", desbordes2: "unknown", arr: "unknown", snip: "unknown", local: "accepted" },
    notes: "Accepts Huff, SCS Type II, and Chicago Storm", referenceDoc: "MWRD WMO Stormwater Rules", lastVerified: "2025-01",
  },
  {
    jurisdiction: "City of Houston", country: "US", type: "municipality",
    patterns: { scs2: "required", scs3: "unknown", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "not-accepted" },
    notes: "Required per Infrastructure Design Manual", referenceDoc: "COH IDM Chapter 9", lastVerified: "2024-11",
  },
  {
    jurisdiction: "NYC DEP", country: "US", type: "municipality",
    patterns: { scs2: "accepted", scs3: "preferred", scs1: "not-accepted", huff3: "accepted", chicago: "accepted", block: "accepted", euler2: "unknown", feh: "unknown", desbordes: "unknown", desbordes2: "unknown", arr: "unknown", snip: "unknown", local: "required" },
    notes: "NRCS Type III + climate-adjusted (NPCC 2050s +13–24%)", referenceDoc: "NYC DEP Standards", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Harris County FCD", country: "US", type: "municipality",
    patterns: { scs2: "accepted", scs3: "required", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Post-Harvey SCS Type III + HCFCD county-specific profiles", referenceDoc: "HCFCD Manual", lastVerified: "2025-01",
  },
  {
    jurisdiction: "LA County DPW", country: "US", type: "municipality",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Must use LA County Hydrology Manual isohyetal temporal profiles", referenceDoc: "LA County Hydrology Manual", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Maricopa County FCD", country: "US", type: "municipality",
    patterns: { scs2: "accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Monsoon (2-hr) + General (24-hr) FCDMC-specific storms", referenceDoc: "FCDMC Drainage Design Manual", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Clark County NV", country: "US", type: "municipality",
    patterns: { scs2: "accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "CCRFCD monsoon + frontal design storms required", referenceDoc: "CCRFCD Criteria", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Philadelphia PWD", country: "US", type: "municipality",
    patterns: { scs2: "required", scs3: "accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "SCS II standard; 1-inch 24-hr for green infrastructure", referenceDoc: "PWD Manual", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Illinois (IDOT/SWS)", country: "US", type: "state-dot",
    patterns: { scs2: "accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "preferred", chicago: "accepted", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Huff 2nd Quartile (Bulletin 75) preferred for IL drainage", referenceDoc: "ISWS Bulletin 75", lastVerified: "2025-01",
  },
  // ── Canada ──
  {
    jurisdiction: "ECCC / Ontario MTO", country: "CA", type: "national",
    patterns: { scs2: "accepted", scs3: "accepted", scs1: "accepted", huff3: "accepted", chicago: "accepted", block: "accepted", euler2: "unknown", feh: "unknown", desbordes: "unknown", desbordes2: "unknown", arr: "unknown", snip: "unknown", local: "accepted" },
    notes: "AES 30%/40% profiles or SCS distributions accepted", referenceDoc: "ECCC Engineering Climate / CSA W231", lastVerified: "2025-01",
  },
  // ── France ──
  {
    jurisdiction: "France (national — IT77)", country: "FR", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "required", desbordes2: "accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Desbordes standard per Instruction Technique IT77 for assainissement", referenceDoc: "Circulaire interministérielle n° 77-284", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Métropole de Lyon", country: "FR", type: "municipality",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "required", desbordes2: "accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Required for urban drainage studies", referenceDoc: "Règlement d'assainissement métropolitain", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Île-de-France (DRIEE)", country: "FR", type: "regional",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "accepted", desbordes2: "accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Accepted alongside ANC standards for drainage design", referenceDoc: "DRIEE guidelines", lastVerified: "2025-01",
  },
  {
    jurisdiction: "DREAL Occitanie", country: "FR", type: "regional",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "required", desbordes2: "preferred", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Desbordes Double-Peak recommended for Mediterranean storms", referenceDoc: "DREAL Occitanie flood risk guidance", lastVerified: "2025-01",
  },
  // ── Belgium ──
  {
    jurisdiction: "Belgium — Wallonia", country: "BE", type: "regional",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "accepted", desbordes2: "accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Francophone Belgian practice follows French standards", referenceDoc: "SPW guidelines", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Belgium — Flanders", country: "BE", type: "regional",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "preferred", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Willems composite storm method required in Flanders", referenceDoc: "Willems 2000 / VMM guidelines", lastVerified: "2025-01",
  },
  // ── United Kingdom ──
  {
    jurisdiction: "Environment Agency (England)", country: "UK", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "required", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "not-accepted" },
    notes: "FEH required for all flood risk assessments", referenceDoc: "FEH Guidelines", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Scotland (SEPA)", country: "UK", type: "regional",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "required", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "FEH required; Western Highland orographic profiles accepted", referenceDoc: "SEPA Technical Flood Risk Guidance", lastVerified: "2025-01",
  },
  // ── Germany & Austria ──
  {
    jurisdiction: "DWA (Germany)", country: "DE", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "required", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "DWA-A 118 / A 531 / A 121 standard for sewer design", referenceDoc: "DWA-A 118, DWA-A 531", lastVerified: "2025-01",
  },
  {
    jurisdiction: "ÖWAV (Austria)", country: "AT", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "required", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "ÖWAV RB 11 uses Euler Type II with ÖKOSTRA IDF data", referenceDoc: "ÖWAV Regelblatt 11 / ÖKOSTRA", lastVerified: "2025-01",
  },
  // ── Netherlands & Scandinavia ──
  {
    jurisdiction: "STOWA (Netherlands)", country: "NL", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "NEERSLAG asymmetric polder-specific storms required", referenceDoc: "STOWA/NEERSLAG Guidelines", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Sweden (Svenskt Vatten)", country: "SE", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "required", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Arnell/CDS method (r=0.33) is Swedish standard", referenceDoc: "P110 Svenskt Vatten", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Denmark (SVK)", country: "DK", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "required", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "CDS with Danish IDF (r=0.375) standard for sewer design", referenceDoc: "SVK Guidelines", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Norway (NVE)", country: "NO", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "NVE IDF + CDS/Euler accepted; local NVE profiles for flood assessment", referenceDoc: "NVE Standards", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Finland (FMI)", country: "FI", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "CDS with FMI IDF data standard for Finnish drainage", referenceDoc: "FMI Standards", lastVerified: "2025-01",
  },
  // ── Central/Eastern Europe ──
  {
    jurisdiction: "Poland (IMGW/PANDa)", country: "PL", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "required", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Euler II + Błaszczyk/IMGW cluster profiles; PANDa atlas for modern design", referenceDoc: "PANDa Atlas / Błaszczyk PN-EN", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Czech Republic (ČHMÚ)", country: "CZ", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Trupl/Sifalda legacy + ČHMÚ CDS method", referenceDoc: "ČHMÚ Standards / ČSN 75 6101", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Slovakia (SHMÚ)", country: "SK", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Šamaj-Valovič IDF formula with Euler redistribution", referenceDoc: "Šamaj & Valovič 1973 / STN 75 6101", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Hungary (MSZ)", country: "HU", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "required", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "MSZ EN 752 adaptation; Budapest convective profiles accepted locally", referenceDoc: "MSZ EN 752 / Budapest Sewer Authority", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Croatia (DHMZ)", country: "HR", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "DHMZ IDF-based design with Euler/CDS redistribution", referenceDoc: "DHMZ Standards", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Serbia (RHMZ)", country: "RS", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "required", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Euler Type II with Belgrade IDF coefficients", referenceDoc: "RHMZ Serbia", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Romania (STAS/Andrei)", country: "RO", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "STAS/Andrei power-law IDF method standard", referenceDoc: "STAS 9470 / Andrei Method", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Bulgaria (NIMH)", country: "BG", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "required", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Euler Type II with Sofia IDF, r=0.35", referenceDoc: "NIMH Bulgaria", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Slovenia (ARSO)", country: "SI", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "required", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Modified Euler II with Alpine-Mediterranean correction", referenceDoc: "ARSO Slovenia", lastVerified: "2025-01",
  },
  // ── Former Soviet ──
  {
    jurisdiction: "Russia (Roshydromet)", country: "RU", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "required", local: "accepted" },
    notes: "SNiP 2.04.03-85 / SP 32.13330 q₂₀-based method mandatory", referenceDoc: "SP 32.13330 / SNiP", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Ukraine (DBN)", country: "UA", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "required", local: "accepted" },
    notes: "DBN В.2.5-75 based on updated SNiP methodology", referenceDoc: "DBN В.2.5-75", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Belarus (TKP)", country: "BY", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "required", local: "accepted" },
    notes: "TKP 45-4.01-57 modified Soviet SNiP method", referenceDoc: "TKP 45-4.01-57", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Kazakhstan (Kazhydromet)", country: "KZ", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "required", local: "accepted" },
    notes: "Soviet SNiP with Almaty/Astana regional q₂₀ adjustments", referenceDoc: "Kazhydromet Standards", lastVerified: "2025-01",
  },
  // ── Mediterranean ──
  {
    jurisdiction: "Spain (CEDEX/Témez)", country: "ES", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "required", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Témez IDF formula + ABM standard; I₁/Id ratio 8–13 by region", referenceDoc: "CEDEX / Témez 1991", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Italy (national)", country: "IT", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "required", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "CDS/Chicago with regional IDF coefficients standard", referenceDoc: "Italian Hydrological Practice", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Greece (Koutsoyiannis)", country: "GR", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "IDF-consistent method (Koutsoyiannis-Baloutsos) required", referenceDoc: "Hellenic Technical Standards", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Turkey (DSİ)", country: "TR", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "DSİ/MGM regional IDF i=A/(t+B)^C with CDS redistribution", referenceDoc: "DSİ / MGM IDF Standards", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Portugal (IPMA/LNEC)", country: "PT", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "IPMA/LNEC IDF-based design with CDS redistribution", referenceDoc: "IPMA / LNEC Standards", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Cyprus (WDD)", country: "CY", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "WDD double-triangle + Chicago r=0.30 for Mediterranean events", referenceDoc: "WDD Drainage Manual", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Malta (MRA)", country: "MT", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "required", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Chicago r=0.25 standard for intense Mediterranean convective", referenceDoc: "MRA Drainage Standards", lastVerified: "2025-01",
  },
  // ── Middle East ──
  {
    jurisdiction: "Saudi Arabia (MOMRA)", country: "SA", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "MOMRA/PME-specific arid flash flood profiles mandatory", referenceDoc: "MOMRA Drainage Manual", lastVerified: "2025-01",
  },
  {
    jurisdiction: "UAE (NCMS/Dubai DM)", country: "AE", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Dubai DM uses FEH-based profiles; Abu Dhabi ADM separate", referenceDoc: "NCM / Dubai DM / ADM Standards", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Qatar (Ashghal)", country: "QA", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Kahramaa/Ashghal-specific arid front-loaded profiles", referenceDoc: "Ashghal Drainage Manual", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Oman (DGMAN)", country: "OM", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "DGMAN wadi + Khareef + cyclone-specific design storms", referenceDoc: "DGMAN Standards", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Kuwait (MEW)", country: "KW", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "MEW arid flash flood segment-based profile required", referenceDoc: "MEW Kuwait Standards", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Jordan (JMD)", country: "JO", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "required", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "Chicago r=0.25 for arid wadi flash flood design", referenceDoc: "JMD Standards", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Israel (IMS)", country: "IL", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "IMS arid design standard with 60% depth in first 30% of duration", referenceDoc: "IMS Arid Design Standards", lastVerified: "2025-01",
  },
  // ── Oceania ──
  {
    jurisdiction: "All Australian States", country: "AU", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "required", snip: "not-accepted", local: "not-accepted" },
    notes: "ARR 2019 ensemble temporal patterns mandated", referenceDoc: "Australian Rainfall & Runoff 2019", lastVerified: "2025-01",
  },
  {
    jurisdiction: "New Zealand (NIWA)", country: "NZ", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "accepted", snip: "not-accepted", local: "required" },
    notes: "HIRDS v4 IDF + regional profiles (TP108, Wellington, Canterbury)", referenceDoc: "NIWA HIRDS v4 / TP108", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Singapore PUB", country: "SG", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "PUB-specific design storm required (70-80% in first 30 min)", referenceDoc: "PUB Code of Practice", lastVerified: "2025-01",
  },
  // ── Asia ──
  {
    jurisdiction: "Japan (JMA/MLIT)", country: "JP", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "Mononobe formula + JMA/AMeDAS profiles; typhoon-specific storms", referenceDoc: "JMA Technical Reports / MLIT", lastVerified: "2025-01",
  },
  {
    jurisdiction: "South Korea (KMA)", country: "KR", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "accepted", chicago: "accepted", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "KMA/MOLIT Huff-type front-loaded profiles standard", referenceDoc: "KMA / MOLIT Design Standard", lastVerified: "2025-01",
  },
  {
    jurisdiction: "China (GB 50014)", country: "CN", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "required", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "P&C formula (Chicago method) with city-specific IDF coefficients", referenceDoc: "GB 50014-2021", lastVerified: "2025-01",
  },
  {
    jurisdiction: "India (IMD)", country: "IN", type: "national",
    patterns: { scs2: "accepted", scs3: "accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "IMD monsoon profiles standard; SCS accepted for small catchments", referenceDoc: "IMD Technical Reports / IRC:SP:42", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Malaysia (DID/MSMA)", country: "MY", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "MSMA/HP1 Malaysian-specific tropical monsoon profiles", referenceDoc: "MSMA 2nd Edition / HP1 (DID 2015)", lastVerified: "2025-01",
  },
  // ── Africa ──
  {
    jurisdiction: "South Africa (SANRAL)", country: "ZA", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "SA SCS Types 1–4 (Schulze/Weddepohl) mandatory; SA Huff accepted", referenceDoc: "SANRAL Drainage Manual 2013", lastVerified: "2025-01",
  },
  {
    jurisdiction: "West Africa (CIEH)", country: "BF/ML/NE", type: "regional",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "CIEH/CILSS Montana formula + West African squall line profiles", referenceDoc: "CIEH 1985 / AGRHYMET", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Algeria (ANRH)", country: "DZ", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "accepted", desbordes2: "accepted", arr: "not-accepted", snip: "not-accepted", local: "required" },
    notes: "French-influenced; Desbordes/Chicago accepted alongside ANRH local", referenceDoc: "ANRH Standards", lastVerified: "2025-01",
  },
  // ── Latin America ──
  {
    jurisdiction: "Brazil (ANA/DAEE)", country: "BR", type: "national",
    patterns: { scs2: "accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "required", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "ABM standard; São Paulo DAEE has city-specific profiles", referenceDoc: "ANA / DAEE Methodology", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Mexico (CONAGUA)", country: "MX", type: "national",
    patterns: { scs2: "accepted", scs3: "accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "SCS and Chicago accepted; CONAGUA front-loaded tropical standard", referenceDoc: "SCT Highway Manual / CONAGUA", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Colombia (IDEAM/EAAB)", country: "CO", type: "national",
    patterns: { scs2: "accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "required", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted", arr: "not-accepted", snip: "not-accepted", local: "accepted" },
    notes: "ABM standard; Bogotá EAAB has bimodal annual profiles", referenceDoc: "IDEAM / EAAB Standards", lastVerified: "2025-01",
  },
];

function StatusCell({ status }: { status: Status | undefined }) {
  if (!status) return <td className="p-1.5 text-center"><span className="text-muted-foreground text-xs">—</span></td>;
  const cfg = STATUS_STYLES[status];
  const Icon = cfg.icon;
  return (
    <td className="p-1.5 text-center">
      <Icon className={`w-3.5 h-3.5 mx-auto ${cfg.className}`} />
    </td>
  );
}

export function RegulatoryMatrix() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return MATRIX_DATA;
    return MATRIX_DATA.filter(
      (e) => e.jurisdiction.toLowerCase().includes(q) || e.country.toLowerCase().includes(q) || e.notes.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Regulatory Acceptance Matrix
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search jurisdiction, country, or notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold min-w-[180px]">Jurisdiction</th>
                {PATTERN_COLUMNS.map((col) => (
                  <th key={col.key} className="p-1.5 text-center font-semibold whitespace-nowrap">{col.label}</th>
                ))}
                <th className="text-left p-2 font-semibold min-w-[200px]">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.jurisdiction} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-2">
                    <span className="font-medium text-foreground">{entry.jurisdiction}</span>
                    <Badge variant="outline" className="ml-1.5 text-[10px]">{entry.country}</Badge>
                  </td>
                  {PATTERN_COLUMNS.map((col) => (
                    <StatusCell key={col.key} status={entry.patterns[col.key]} />
                  ))}
                  <td className="p-2 text-muted-foreground">{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t text-xs text-muted-foreground">
          {Object.entries(STATUS_STYLES).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <span key={key} className="flex items-center gap-1">
                <Icon className={`w-3.5 h-3.5 ${cfg.className}`} />
                {cfg.label}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
