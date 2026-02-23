import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, RotateCcw, MapPin, Zap } from "lucide-react";

interface FlowOption {
  label: string;
  nextNode?: string;
  recommendation?: string;
  pattern?: string;
  confidence: "high" | "medium" | "low";
}

interface FlowNode {
  id: string;
  question: string;
  helpText?: string;
  options: FlowOption[];
}

const FLOWCHART: FlowNode[] = [
  {
    id: "start",
    question: "Where is your project located?",
    helpText: "Select the country or region of your stormwater project.",
    options: [
      { label: "United States", nextNode: "us-region", confidence: "high" },
      { label: "United Kingdom", nextNode: "uk-type", confidence: "high" },
      { label: "Europe (Continental)", nextNode: "eu-country", confidence: "high" },
      { label: "China", recommendation: "Use China GB 50014 for municipal drainage or China PRD for Pearl River Delta projects.", pattern: "china_gb50014", confidence: "high" },
      { label: "Japan", recommendation: "Use Japan AMeDAS for general storms, Baiu for seasonal frontal rain, or Typhoon for tropical cyclone events.", pattern: "japan_amedas", confidence: "high" },
      { label: "Southeast Asia", nextNode: "sea-country", confidence: "high" },
      { label: "Middle East / GCC", nextNode: "gcc-country", confidence: "high" },
      { label: "Australia / New Zealand", recommendation: "Use ARR 2019 ensemble temporal patterns. Mandated for all Australian flood studies since 2019.", pattern: "arr", confidence: "high" },
      { label: "Africa", nextNode: "africa-country", confidence: "high" },
      { label: "Latin America", nextNode: "latam-country", confidence: "high" },
      { label: "Other / Unknown", nextNode: "generic", confidence: "medium" },
    ],
  },
  {
    id: "us-region",
    question: "Which US region or state?",
    helpText: "Many states mandate specific distributions.",
    options: [
      { label: "Florida", nextNode: "us-florida", confidence: "high" },
      { label: "Texas", recommendation: "Use SCS Type II for most of Texas. TxDOT projects require TxDOT-specific distributions.", pattern: "scs2", confidence: "high" },
      { label: "California (Pacific Coast)", recommendation: "Use SCS Type I for coastal California.", pattern: "scs1", confidence: "high" },
      { label: "Pacific NW (west of Cascades)", recommendation: "Use SCS Type IA for the maritime PNW climate.", pattern: "scs1a", confidence: "high" },
      { label: "Gulf Coast / Hawaii", recommendation: "Use SCS Type III for tropical/coastal storms.", pattern: "scs3", confidence: "high" },
      { label: "Denver Metro Area", recommendation: "Use UDFCD Denver distributions per the Urban Storm Drainage Criteria Manual.", pattern: "udfcd", confidence: "high" },
      { label: "Illinois / Chicago", nextNode: "us-illinois", confidence: "high" },
      { label: "Most other states (East of 105°W)", recommendation: "Use SCS Type II — the default for most of the continental US east of the Rocky Mountains.", pattern: "scs2", confidence: "high" },
    ],
  },
  {
    id: "us-florida",
    question: "What type of Florida project?",
    options: [
      { label: "FDOT (state highway)", recommendation: "Use FDOT Zone-specific distribution. Florida is divided into 5 zones with unique patterns.", pattern: "fdot3", confidence: "high" },
      { label: "Local/municipal", recommendation: "Check your Water Management District. SFWMD often requires FDOT zones. SJRWMD may accept SCS Type II.", pattern: "fdot3", confidence: "medium" },
      { label: "South Florida (coastal)", recommendation: "Use SCS Type III for tropical coastal areas, or FDOT Zone 1/2 per SFWMD.", pattern: "scs3", confidence: "medium" },
    ],
  },
  {
    id: "us-illinois",
    question: "Which agency is reviewing?",
    options: [
      { label: "MWRD (Chicago)", recommendation: "MWRD accepts both Huff and SCS Type II. Huff 3rd Quartile is most common for Chicago area.", pattern: "huff3", confidence: "high" },
      { label: "IDOT or county highway", recommendation: "Use SCS Type II per IDOT Drainage Manual.", pattern: "scs2", confidence: "high" },
      { label: "Not sure", recommendation: "SCS Type II is the safe default. Huff 3rd Quartile is also widely accepted in Illinois.", pattern: "scs2", confidence: "medium" },
    ],
  },
  {
    id: "uk-type",
    question: "Which UK standard applies?",
    options: [
      { label: "Flood risk assessment", recommendation: "Use FEH design rainfall profile. Required by Environment Agency for all flood studies.", pattern: "feh", confidence: "high" },
      { label: "Sewer / drainage design", recommendation: "Use FEH or FSR summer profile (75% peakedness) for urban drainage. Check Sewers for Adoption requirements.", pattern: "feh", confidence: "high" },
      { label: "InfoWorks ICM model", recommendation: "Use FEH profile — directly compatible with InfoWorks ICM rainfall editor.", pattern: "feh", confidence: "high" },
    ],
  },
  {
    id: "eu-country",
    question: "Which European country?",
    options: [
      { label: "Germany / Austria / Switzerland", recommendation: "Use Euler Type II (r=0.3) per DWA-A 118 for sewer design. Use Euler Type I for conservative front-loaded storms.", pattern: "euler2", confidence: "high" },
      { label: "France", recommendation: "Use Double Triangle (Desbordes) pattern, standard for French urban drainage design.", pattern: "desbordes_double", confidence: "high" },
      { label: "Netherlands", recommendation: "Use Dutch standard pattern per RIONED guidelines.", pattern: "dutch", confidence: "high" },
      { label: "Italy / Spain", recommendation: "Use Chicago Storm or Alternating Block with local IDF parameters.", pattern: "chicago", confidence: "medium" },
      { label: "Scandinavia", recommendation: "Use Alternating Block or Chicago Storm with local IDF data. Check national guidelines (e.g., SVF P110 for Sweden).", pattern: "balanced", confidence: "medium" },
    ],
  },
  {
    id: "sea-country",
    question: "Which Southeast Asian country?",
    options: [
      { label: "Singapore", recommendation: "Use Singapore PUB pattern per Code of Practice on Surface Water Drainage.", pattern: "singapore_pub", confidence: "high" },
      { label: "Malaysia", recommendation: "Use MSMA pattern per Manual Saliran Mesra Alam.", pattern: "malaysia_msma", confidence: "high" },
      { label: "Indonesia", recommendation: "Use Indonesia BMKG pattern or Alternating Block with local IDF.", pattern: "indonesia_bmkg", confidence: "high" },
      { label: "Other", recommendation: "Use Alternating Block with local IDF data as the universal fallback.", pattern: "balanced", confidence: "medium" },
    ],
  },
  {
    id: "gcc-country",
    question: "Which GCC / Middle East country?",
    options: [
      { label: "Saudi Arabia", recommendation: "Use Saudi PME standard rainfall pattern.", pattern: "saudi_pme", confidence: "high" },
      { label: "UAE", recommendation: "Use UAE NCMS rainfall distribution.", pattern: "uae_ncms", confidence: "high" },
      { label: "Qatar", recommendation: "Use Qatar Kahramaa design storm.", pattern: "qatar_kahramaa", confidence: "high" },
      { label: "Oman / Other", recommendation: "Use Oman DGMAN or Alternating Block with local IDF.", pattern: "oman_dgman", confidence: "medium" },
    ],
  },
  {
    id: "africa-country",
    question: "Which African country/region?",
    options: [
      { label: "South Africa", recommendation: "Use SANRAL design rainfall per TRH Drainage Manual.", pattern: "sa_sanral", confidence: "high" },
      { label: "Kenya", recommendation: "Use Kenya KMD rainfall distribution.", pattern: "kenya_kmd", confidence: "high" },
      { label: "Nigeria", recommendation: "Use NiMet rainfall pattern or Alternating Block with local IDF.", pattern: "nigeria_nimet", confidence: "medium" },
      { label: "Other", recommendation: "Use Alternating Block with local IDF data.", pattern: "balanced", confidence: "medium" },
    ],
  },
  {
    id: "latam-country",
    question: "Which Latin American country?",
    options: [
      { label: "Brazil", recommendation: "Use ANA/DAEE rainfall pattern or Alternating Block with IDF from local agencies.", pattern: "brazil_ana", confidence: "high" },
      { label: "Mexico", recommendation: "Use CONAGUA design storm methodology.", pattern: "mexico_conagua", confidence: "high" },
      { label: "Colombia", recommendation: "Use IDEAM rainfall distribution.", pattern: "colombia_ideam", confidence: "high" },
      { label: "Chile / Other", recommendation: "Use DGA methodology or Alternating Block with local IDF.", pattern: "chile_dga", confidence: "medium" },
    ],
  },
  {
    id: "generic",
    question: "What type of storm pattern do you need?",
    helpText: "For locations without a specific national standard.",
    options: [
      { label: "Simple / conservative (uniform)", recommendation: "Use Uniform (Block) distribution — constant intensity. Conservative for peak flow.", pattern: "block", confidence: "medium" },
      { label: "Center-peaked (common thunderstorm)", recommendation: "Use Alternating Block Method — derived from your local IDF curve. Internationally applicable.", pattern: "balanced", confidence: "high" },
      { label: "Front-loaded (intense start)", recommendation: "Use Euler Type I or Triangular distribution.", pattern: "euler1", confidence: "medium" },
      { label: "IDF-derived with adjustable peak", recommendation: "Use Chicago Storm with r parameter to set peak position.", pattern: "chicago", confidence: "high" },
    ],
  },
];

export function PatternDecisionFlowchart() {
  const [history, setHistory] = useState<string[]>(["start"]);
  const [result, setResult] = useState<{ recommendation: string; pattern?: string; confidence: string } | null>(null);

  const currentNode = FLOWCHART.find((n) => n.id === history[history.length - 1]);

  const handleSelect = (opt: FlowOption) => {
    if (opt.recommendation) {
      setResult({ recommendation: opt.recommendation, pattern: opt.pattern, confidence: opt.confidence });
    } else if (opt.nextNode) {
      setHistory([...history, opt.nextNode]);
      setResult(null);
    }
  };

  const handleBack = () => {
    if (history.length > 1) {
      setHistory(history.slice(0, -1));
      setResult(null);
    }
  };

  const handleReset = () => {
    setHistory(["start"]);
    setResult(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5 text-primary" />
          Which Pattern Should I Use?
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="w-3.5 h-3.5" /> Start Over
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 flex-wrap text-xs text-muted-foreground">
          {history.map((nodeId, i) => {
            const node = FLOWCHART.find((n) => n.id === nodeId);
            return (
              <span key={nodeId} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                <button
                  onClick={() => { if (i < history.length - 1) { setHistory(history.slice(0, i + 1)); setResult(null); } }}
                  className="hover:text-foreground transition-colors"
                >
                  {node?.question.slice(0, 25)}…
                </button>
              </span>
            );
          })}
        </div>

        {/* Question */}
        {currentNode && !result && (
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">{currentNode.question}</h3>
              {currentNode.helpText && <p className="text-sm text-muted-foreground">{currentNode.helpText}</p>}
            </div>
            <div className="grid gap-2">
              {currentNode.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  className="w-full text-left p-3 border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-between group"
                >
                  <span className="text-sm text-foreground">{opt.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
            {history.length > 1 && (
              <Button variant="ghost" size="sm" onClick={handleBack}>← Go back</Button>
            )}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">Recommendation</span>
                <Badge variant={result.confidence === "high" ? "default" : "secondary"} className="text-xs ml-auto">
                  {result.confidence} confidence
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{result.recommendation}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>← Change last answer</Button>
              <Button variant="ghost" size="sm" onClick={handleReset}>↺ Start over</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
