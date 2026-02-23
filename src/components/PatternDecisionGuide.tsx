import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ChevronRight, RotateCcw, TreePine, Droplets, Zap, Target } from "lucide-react";

interface DecisionNode {
  question: string;
  options: {
    label: string;
    description?: string;
    next?: string; // node id
    result?: {
      pattern: string;
      reason: string;
      alternatives?: string[];
    };
  }[];
}

const decisionTree: Record<string, DecisionNode> = {
  start: {
    question: "Does your local agency specify a required rainfall distribution?",
    options: [
      {
        label: "Yes — agency requirement",
        description: "My permit or design manual specifies the pattern",
        result: {
          pattern: "Use Agency-Specified Pattern",
          reason: "Local agency requirements always override general guidance. Check your stormwater manual, MS4 permit, or local design standards for the required temporal distribution.",
          alternatives: [],
        },
      },
      {
        label: "No — I need to select one",
        description: "I have flexibility in pattern selection",
        next: "location",
      },
    ],
  },
  location: {
    question: "Where is your project located?",
    options: [
      { label: "Eastern US (Midwest, Northeast, Southeast)", next: "eastern_detail" },
      { label: "Gulf Coast & Coastal Atlantic (FL, TX coast, LA)", next: "gulf" },
      { label: "Western US (Pacific NW, California)", next: "western_detail" },
      { label: "Arid Southwest (AZ, NM, NV, UT)", next: "southwest" },
    ],
  },
  eastern_detail: {
    question: "Which part of the Eastern US?",
    options: [
      {
        label: "Illinois, Indiana, or Ohio",
        description: "Huff distributions were developed from Midwest data",
        next: "huff_duration",
      },
      {
        label: "Northeast (NY, NJ, PA, New England)",
        result: {
          pattern: "SCS Type II",
          reason: "Type II is the standard NRCS distribution for the Northeast and most of the continental US. It represents frontal and convective storms with a strong central peak.",
          alternatives: ["Chicago Storm (for small urban catchments)", "Huff 2nd Quartile"],
        },
      },
      {
        label: "Southeast interior (GA, NC, SC, VA, TN)",
        result: {
          pattern: "SCS Type II",
          reason: "Interior Southeast uses Type II. The intense thunderstorms and convective activity in this region match the Type II peak distribution.",
          alternatives: ["SCS Type III (near coast)", "Huff 2nd Quartile"],
        },
      },
      {
        label: "Midwest (MN, WI, MI, MO, IA, KS, NE)",
        result: {
          pattern: "SCS Type II",
          reason: "Type II is standard for the continental interior. Severe thunderstorms in the Midwest produce high peak intensities consistent with Type II.",
          alternatives: ["Huff 1st or 2nd Quartile", "Chicago Storm"],
        },
      },
    ],
  },
  huff_duration: {
    question: "What is your design storm duration?",
    options: [
      {
        label: "Short duration (< 6 hours)",
        result: {
          pattern: "Huff 1st or 2nd Quartile",
          reason: "Short-duration storms in the Midwest tend to be convective with early-peaked intensity. 1st Quartile is most conservative; 2nd Quartile is most common (~35% of observed storms).",
          alternatives: ["SCS Type II", "Chicago Storm"],
        },
      },
      {
        label: "Medium duration (6–12 hours)",
        result: {
          pattern: "Huff 2nd Quartile",
          reason: "Medium-duration storms most commonly peak in the second quartile. This is the default conservative choice for design in Illinois/Indiana/Ohio per ISWS guidance.",
          alternatives: ["Huff 3rd Quartile", "SCS Type II"],
        },
      },
      {
        label: "Long duration (12–24 hours)",
        result: {
          pattern: "Huff 3rd or 4th Quartile",
          reason: "Long-duration frontal storms tend to have delayed peaks. 3rd Quartile represents 20% of observed storms; 4th Quartile represents trailing-peak systems.",
          alternatives: ["SCS Type II (24-hr standard)", "Huff 2nd Quartile"],
        },
      },
    ],
  },
  gulf: {
    question: "Is your site in a tropical storm–influenced zone?",
    options: [
      {
        label: "Yes — coastal Florida, Gulf coast, tropical influence",
        result: {
          pattern: "SCS Type III",
          reason: "Type III was developed for Gulf of Mexico and Atlantic coastal areas subject to tropical storms. It has a broader, more sustained peak than Type II, reflecting tropical rainfall characteristics.",
          alternatives: ["Huff 4th Quartile (for back-loaded storms)"],
        },
      },
      {
        label: "No — inland Gulf states (AR, MS interior, AL interior)",
        result: {
          pattern: "SCS Type II",
          reason: "Interior Gulf states use Type II. While they receive significant rainfall, the convective storm patterns are more similar to the continental interior than to coastal tropical systems.",
          alternatives: ["SCS Type III (conservative choice)"],
        },
      },
    ],
  },
  western_detail: {
    question: "Which Western US region?",
    options: [
      {
        label: "Pacific Northwest (WA, OR coast)",
        result: {
          pattern: "SCS Type IA",
          reason: "Type IA represents the mild, steady Pacific maritime climate. Rainfall is less intense and more evenly distributed, with peak at ~37% of duration — the gentlest of all SCS types.",
          alternatives: ["SCS Type I"],
        },
      },
      {
        label: "California coast & valleys",
        result: {
          pattern: "SCS Type I",
          reason: "Type I applies to California's Mediterranean climate with winter-dominant storm systems. Slightly more intense than Type IA but still reflects maritime influence.",
          alternatives: ["SCS Type IA (northern CA)", "SCS Type II (inland valleys)"],
        },
      },
      {
        label: "Mountain West (CO, MT, WY, ID)",
        result: {
          pattern: "SCS Type II",
          reason: "Mountain West uses Type II. Despite lower total depths, orographic and convective storms produce the high-intensity peaks characteristic of Type II.",
          alternatives: ["Chicago Storm (for urban areas at elevation)"],
        },
      },
    ],
  },
  southwest: {
    question: "What type of development are you designing for?",
    options: [
      {
        label: "Urban drainage (small catchments < 200 ac)",
        result: {
          pattern: "Chicago Storm or SCS Type II",
          reason: "For small urban catchments in the arid Southwest, the Chicago method gives precise IDF-based peak intensities. Type II is the NRCS standard. Monsoon thunderstorms are extremely intense but short.",
          alternatives: ["Huff 1st Quartile"],
        },
      },
      {
        label: "Regional detention / larger watersheds",
        result: {
          pattern: "SCS Type II",
          reason: "Type II is standard for NRCS work in the Southwest. The 24-hour design storm captures monsoon thunderstorm peaks embedded within longer events.",
          alternatives: ["SCS Type III (if agency allows)"],
        },
      },
    ],
  },
};

export function PatternDecisionGuide() {
  const [currentNode, setCurrentNode] = useState("start");
  const [history, setHistory] = useState<string[]>([]);
  const [selectedResult, setSelectedResult] = useState<{
    pattern: string;
    reason: string;
    alternatives?: string[];
  } | null>(null);

  const node = decisionTree[currentNode];

  const handleSelect = (option: (typeof node.options)[0]) => {
    if (option.result) {
      setSelectedResult(option.result);
    } else if (option.next) {
      setHistory((prev) => [...prev, currentNode]);
      setCurrentNode(option.next);
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setCurrentNode(prev);
      setSelectedResult(null);
    }
  };

  const restart = () => {
    setCurrentNode("start");
    setHistory([]);
    setSelectedResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Which Pattern Should I Use?
        </CardTitle>
        <CardDescription>
          Interactive decision guide for selecting the right rainfall distribution
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedResult ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-6 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-primary">Recommendation</h3>
              </div>
              <p className="text-2xl font-bold mb-3">{selectedResult.pattern}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{selectedResult.reason}</p>
            </div>

            {selectedResult.alternatives && selectedResult.alternatives.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/50 border">
                <p className="text-sm font-medium mb-2">Also Consider:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedResult.alternatives.map((alt) => (
                    <Badge key={alt} variant="secondary" className="text-xs">
                      {alt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={goBack} className="gap-1">
                Back
              </Button>
              <Button variant="outline" size="sm" onClick={restart} className="gap-1">
                <RotateCcw className="w-3 h-3" />
                Start Over
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Start</span>
              {history.map((nodeId, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" />
                  <span className="capitalize">{nodeId.replace(/_/g, " ")}</span>
                </span>
              ))}
            </div>

            <h3 className="text-lg font-semibold">{node.question}</h3>

            <div className="grid gap-2">
              {node.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent/50 hover:border-primary/40 transition-all text-left group"
                >
                  <div>
                    <p className="font-medium text-sm">{option.label}</p>
                    {option.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </button>
              ))}
            </div>

            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={goBack} className="gap-1">
                ← Back
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
