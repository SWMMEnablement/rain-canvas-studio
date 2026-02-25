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
];

const MATRIX_DATA: MatrixEntry[] = [
  {
    jurisdiction: "FEMA (Nationwide)", country: "US", type: "federal",
    patterns: { scs2: "accepted", scs3: "accepted", scs1: "accepted", huff3: "accepted", chicago: "accepted", block: "accepted", euler2: "unknown", feh: "unknown", desbordes: "unknown", desbordes2: "unknown" },
    notes: "Accepts any technically defensible distribution", referenceDoc: "FEMA Guidelines for Flood Risk Analysis", lastVerified: "2025-01",
  },
  {
    jurisdiction: "USACE (Nationwide)", country: "US", type: "federal",
    patterns: { scs2: "accepted", scs3: "accepted", scs1: "accepted", huff3: "accepted", chicago: "accepted", block: "accepted", euler2: "unknown", feh: "unknown", desbordes: "unknown", desbordes2: "unknown" },
    notes: "Accepted for Section 404/NEPA analysis", referenceDoc: "EM 1110-2-1417", lastVerified: "2025-01",
  },
  {
    jurisdiction: "TxDOT (Texas)", country: "US", type: "state-dot",
    patterns: { scs2: "required", scs3: "accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted" },
    notes: "TxDOT HDM Ch. 4 mandates specific distributions", referenceDoc: "TxDOT Hydraulic Design Manual", lastVerified: "2024-11",
  },
  {
    jurisdiction: "FDOT (Florida)", country: "US", type: "state-dot",
    patterns: { scs2: "not-accepted", scs3: "accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted" },
    notes: "Must use FDOT Zone-specific distributions", referenceDoc: "FDOT Drainage Manual Ch. 2", lastVerified: "2024-09",
  },
  {
    jurisdiction: "Caltrans (California)", country: "US", type: "state-dot",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "required", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted" },
    notes: "Use SCS Type I or IA for California", referenceDoc: "Caltrans Highway Design Manual", lastVerified: "2025-01",
  },
  {
    jurisdiction: "MWRD (Chicago)", country: "US", type: "municipality",
    patterns: { scs2: "accepted", scs3: "unknown", scs1: "unknown", huff3: "accepted", chicago: "accepted", block: "accepted", euler2: "unknown", feh: "unknown", desbordes: "unknown", desbordes2: "unknown" },
    notes: "Accepts Huff, SCS Type II, and Chicago Storm", referenceDoc: "MWRD WMO Stormwater Rules", lastVerified: "2025-01",
  },
  {
    jurisdiction: "City of Houston", country: "US", type: "municipality",
    patterns: { scs2: "required", scs3: "unknown", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted" },
    notes: "Required per Infrastructure Design Manual", referenceDoc: "COH IDM Chapter 9", lastVerified: "2024-11",
  },
  {
    jurisdiction: "France (national — IT77)", country: "FR", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "required", desbordes2: "accepted" },
    notes: "Desbordes standard per Instruction Technique IT77 for assainissement", referenceDoc: "Circulaire interministérielle n° 77-284", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Métropole de Lyon", country: "FR", type: "municipality",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "required", desbordes2: "accepted" },
    notes: "Required for urban drainage studies", referenceDoc: "Règlement d'assainissement métropolitain", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Île-de-France (DRIEE)", country: "FR", type: "regional",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "accepted", desbordes2: "accepted" },
    notes: "Accepted alongside ANC standards for drainage design", referenceDoc: "DRIEE guidelines", lastVerified: "2025-01",
  },
  {
    jurisdiction: "DREAL Occitanie", country: "FR", type: "regional",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "required", desbordes2: "preferred" },
    notes: "Desbordes Double-Peak recommended for Mediterranean storms", referenceDoc: "DREAL Occitanie flood risk guidance", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Belgium — Wallonia", country: "BE", type: "regional",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "accepted", feh: "not-accepted", desbordes: "accepted", desbordes2: "accepted" },
    notes: "Francophone Belgian practice follows French standards", referenceDoc: "SPW guidelines", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Environment Agency (England)", country: "UK", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "required", desbordes: "not-accepted", desbordes2: "not-accepted" },
    notes: "FEH required for all flood risk assessments", referenceDoc: "FEH Guidelines", lastVerified: "2025-01",
  },
  {
    jurisdiction: "DWA (Germany)", country: "DE", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "accepted", block: "accepted", euler2: "required", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted" },
    notes: "DWA-A 118 standard for sewer design", referenceDoc: "DWA-A 118", lastVerified: "2025-01",
  },
  {
    jurisdiction: "All Australian States", country: "AU", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted" },
    notes: "ARR 2019 ensemble temporal patterns mandated", referenceDoc: "Australian Rainfall & Runoff 2019", lastVerified: "2025-01",
  },
  {
    jurisdiction: "Singapore PUB", country: "SG", type: "national",
    patterns: { scs2: "not-accepted", scs3: "not-accepted", scs1: "not-accepted", huff3: "not-accepted", chicago: "not-accepted", block: "not-accepted", euler2: "not-accepted", feh: "not-accepted", desbordes: "not-accepted", desbordes2: "not-accepted" },
    notes: "PUB-specific design storm required", referenceDoc: "PUB Code of Practice", lastVerified: "2025-01",
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
