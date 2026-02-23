import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown, ChevronUp, MapPin, BookOpen, Scale,
  CheckCircle, XCircle, AlertTriangle, HelpCircle, ExternalLink, BarChart3
} from "lucide-react";

export interface PatternParameter {
  name: string;
  symbol: string;
  description: string;
  defaultValue: string;
  range: string;
}

export interface RegulatoryAcceptance {
  jurisdiction: string;
  status: "required" | "accepted" | "preferred" | "not-accepted" | "unknown";
  notes?: string;
}

export interface PatternCardData {
  id: string;
  name: string;
  region: string;
  shortDescription: string;
  fullDescription: string;
  history: string;
  equation: string;
  equationDescription: string;
  parameters: PatternParameter[];
  peakPosition: string;
  peakIntensityRatio: string;
  applicableRegions: string[];
  typicalDurations: string[];
  typicalReturnPeriods: string[];
  regulatoryAcceptance: RegulatoryAcceptance[];
  standardReference: string;
  standardUrl?: string;
  characteristicShape: string;
  similarPatterns: string[];
  differenceNotes: string;
  lastVerified: string;
  dataSource: string;
}

const statusConfig: Record<string, { icon: typeof CheckCircle; className: string; label: string }> = {
  required: { icon: CheckCircle, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", label: "Required" },
  preferred: { icon: CheckCircle, className: "bg-sky-500/10 text-sky-600 border-sky-500/30", label: "Preferred" },
  accepted: { icon: CheckCircle, className: "bg-blue-500/10 text-blue-600 border-blue-500/30", label: "Accepted" },
  "not-accepted": { icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/30", label: "Not Accepted" },
  unknown: { icon: HelpCircle, className: "bg-muted text-muted-foreground border-border", label: "Unknown" },
};

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

export function PatternReferenceCard({ pattern }: { pattern: PatternCardData }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card id={`pattern-${pattern.id}`} className="overflow-hidden transition-all duration-300">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-foreground">{pattern.name}</h3>
            <Badge variant="outline" className="text-xs">{pattern.region}</Badge>
            <Badge variant="secondary" className="text-xs">{pattern.characteristicShape}</Badge>
            <span className="text-xs text-muted-foreground">Peak at {pattern.peakPosition}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{pattern.shortDescription}</p>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 ml-2" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <CardContent className="pt-0 pb-4">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="overview" className="text-xs gap-1"><BookOpen className="w-3 h-3" />Overview</TabsTrigger>
              <TabsTrigger value="technical" className="text-xs gap-1"><BarChart3 className="w-3 h-3" />Technical</TabsTrigger>
              <TabsTrigger value="regulatory" className="text-xs gap-1"><Scale className="w-3 h-3" />Regulatory</TabsTrigger>
              <TabsTrigger value="comparison" className="text-xs gap-1"><CheckCircle className="w-3 h-3" />Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{pattern.fullDescription}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">History & Background</h4>
                <p className="text-sm text-muted-foreground">{pattern.history}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <InfoBox label="Peak Position" value={pattern.peakPosition} />
                <InfoBox label="Peak Ratio" value={pattern.peakIntensityRatio} />
                <InfoBox label="Typical Duration" value={pattern.typicalDurations.join(", ")} />
                <InfoBox label="Shape" value={pattern.characteristicShape} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Applicable Regions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {pattern.applicableRegions.map((r) => (
                    <span key={r} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      <MapPin className="w-3 h-3" />{r}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BookOpen className="w-3 h-3" />
                <span>Source: {pattern.standardReference}</span>
                {pattern.standardUrl && (
                  <a href={pattern.standardUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Mathematical Formulation</h4>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto whitespace-pre-wrap font-mono">{pattern.equation}</pre>
                <p className="text-sm text-muted-foreground mt-2">{pattern.equationDescription}</p>
              </div>
              {pattern.parameters.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Parameters</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Parameter</th>
                          <th className="text-left p-2">Symbol</th>
                          <th className="text-left p-2">Description</th>
                          <th className="text-left p-2">Default</th>
                          <th className="text-left p-2">Range</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        {pattern.parameters.map((p) => (
                          <tr key={p.name} className="border-b">
                            <td className="p-2 font-medium text-foreground">{p.name}</td>
                            <td className="p-2 font-mono">{p.symbol}</td>
                            <td className="p-2">{p.description}</td>
                            <td className="p-2">{p.defaultValue}</td>
                            <td className="p-2">{p.range}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="regulatory" className="space-y-4 mt-4">
              <h4 className="text-sm font-semibold text-foreground">Regulatory Acceptance by Jurisdiction</h4>
              <div className="space-y-2">
                {pattern.regulatoryAcceptance.map((reg) => {
                  const cfg = statusConfig[reg.status];
                  const Icon = cfg.icon;
                  return (
                    <div key={reg.jurisdiction} className="flex items-start justify-between p-2 rounded-lg border bg-card">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${cfg.className.split(" ")[1]}`} />
                        <span className="text-sm font-medium text-foreground">{reg.jurisdiction}</span>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={`text-xs ${cfg.className}`}>{cfg.label}</Badge>
                        {reg.notes && <p className="text-xs text-muted-foreground mt-0.5">{reg.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Always verify pattern requirements with your local reviewing agency. Last updated: {pattern.lastVerified}.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="comparison" className="space-y-4 mt-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Similar Patterns</h4>
                <div className="flex flex-wrap gap-1.5">
                  {pattern.similarPatterns.map((s) => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Key Differences</h4>
                <p className="text-sm text-muted-foreground">{pattern.differenceNotes}</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}
