import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Target, Award, Info, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, ReferenceLine
} from "recharts";
import { type RainfallDataPoint } from "@/lib/rainfallParsers";
import { analyzeStormComplete, type AnalysisResult, type PatternMatch } from "@/lib/stormAnalysis";

interface PatternDerivationEngineProps {
  data: RainfallDataPoint[];
  onPatternSelect?: (pattern: string) => void;
}

const QUARTILE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function PatternDerivationEngine({ data, onPatternSelect }: PatternDerivationEngineProps) {
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<PatternMatch | null>(null);
  
  const analysis = useMemo<AnalysisResult | null>(() => {
    if (data.length < 3) return null;
    try {
      return analyzeStormComplete(data);
    } catch (e) {
      console.error('Analysis failed:', e);
      return null;
    }
  }, [data]);
  
  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Import storm data to analyze patterns</p>
          <p className="text-sm mt-2">Need at least 3 data points for analysis</p>
        </CardContent>
      </Card>
    );
  }
  
  const { statistics, matches, bestMatch, recommendations } = analysis;
  
  // Prepare quartile chart data
  const quartileData = [
    { name: 'Q1', value: statistics.q1Fraction * 100, label: '0-25%' },
    { name: 'Q2', value: statistics.q2Fraction * 100, label: '25-50%' },
    { name: 'Q3', value: statistics.q3Fraction * 100, label: '50-75%' },
    { name: 'Q4', value: statistics.q4Fraction * 100, label: '75-100%' },
  ];
  
  // Top matches for display
  const displayMatches = showAllMatches ? matches : matches.slice(0, 5);
  
  // Similarity color
  const getSimilarityColor = (sim: number) => {
    if (sim >= 0.8) return 'text-green-600';
    if (sim >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };
  
  const getSimilarityBadge = (sim: number) => {
    if (sim >= 0.8) return 'default';
    if (sim >= 0.6) return 'secondary';
    return 'outline';
  };
  
  return (
    <div className="space-y-6">
      {/* Storm Statistics Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Storm Statistics
          </CardTitle>
          <CardDescription>
            Computed characteristics of the imported storm event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Duration</p>
              <p className="font-semibold text-primary">{(statistics.duration / 60).toFixed(1)} hr</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Depth</p>
              <p className="font-semibold text-primary">{statistics.totalDepth.toFixed(2)} in</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Peak Intensity</p>
              <p className="font-semibold text-primary">{statistics.peakIntensity.toFixed(2)} in/hr</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Peak Position</p>
              <p className="font-semibold text-primary">{(statistics.peakPosition * 100).toFixed(0)}%</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Centroid</p>
              <p className="font-medium">{(statistics.centroid * 100).toFixed(0)}%</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Skewness</p>
              <p className="font-medium">{statistics.skewness.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Kurtosis</p>
              <p className="font-medium">{statistics.kurtosis.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Rise/Fall Ratio</p>
              <p className="font-medium">{statistics.asymmetryRatio.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quartile Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quartile Distribution (Huff Analysis)
          </CardTitle>
          <CardDescription>
            Percentage of total rainfall in each quartile of storm duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quartileData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Rainfall']} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {quartileData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={QUARTILE_COLORS[index]} />
                    ))}
                  </Bar>
                  <ReferenceLine y={25} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quartileData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}
                  >
                    {quartileData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={QUARTILE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Dominant Quartile:</strong> Q{statistics.dominantQuartile} ({(quartileData[statistics.dominantQuartile - 1].value).toFixed(1)}% of rainfall)
              {statistics.dominantQuartile === 1 && ' — Early-peaked storm, typical of frontal passages'}
              {statistics.dominantQuartile === 2 && ' — Moderately early peak, common for many storm types'}
              {statistics.dominantQuartile === 3 && ' — Late-developing peak, typical of convective buildup'}
              {statistics.dominantQuartile === 4 && ' — Very late peak, characteristic of slow-moving systems'}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Best Match */}
      <Card className="border-primary/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Best Pattern Match
          </CardTitle>
          <CardDescription>
            The synthetic pattern most similar to your storm data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <h3 className="text-xl font-bold text-primary">{bestMatch.patternName}</h3>
              <p className="text-sm text-muted-foreground">{bestMatch.description}</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getSimilarityColor(bestMatch.similarity)}`}>
                {(bestMatch.similarity * 100).toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground">Similarity</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">RMSE</p>
              <p className="font-medium">{bestMatch.rmse.toFixed(3)}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Correlation</p>
              <p className="font-medium">{bestMatch.correlation.toFixed(3)}</p>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Peak Diff</p>
              <p className="font-medium">{(bestMatch.peakPositionDiff * 100).toFixed(1)}%</p>
            </div>
          </div>
          
          {onPatternSelect && (
            <Button 
              className="w-full mt-4" 
              onClick={() => onPatternSelect(bestMatch.pattern)}
            >
              Use {bestMatch.patternName} Pattern
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* All Pattern Matches */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Pattern Comparison
          </CardTitle>
          <CardDescription>
            Similarity ranking against all synthetic patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {displayMatches.map((match, index) => (
              <div 
                key={match.pattern}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  index === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <div className="w-8 text-center font-bold text-muted-foreground">
                  #{index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{match.patternName}</span>
                    <Badge variant={getSimilarityBadge(match.similarity)} className="text-xs">
                      {(match.similarity * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{match.description}</p>
                </div>
                <div className="w-32">
                  <Progress value={match.similarity * 100} className="h-2" />
                </div>
                <div className="text-right text-sm text-muted-foreground w-20">
                  r = {match.correlation.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          
          {matches.length > 5 && (
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowAllMatches(!showAllMatches)}
            >
              {showAllMatches ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show All {matches.length} Patterns
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Analysis Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Info className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
