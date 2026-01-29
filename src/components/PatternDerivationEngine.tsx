import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Target, Award, Info, ChevronDown, ChevronUp, Lightbulb, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, ReferenceLine, AreaChart, Area,
  ComposedChart
} from "recharts";
import { type RainfallDataPoint } from "@/lib/rainfallParsers";
import { analyzeStormComplete, type AnalysisResult, type PatternMatch } from "@/lib/stormAnalysis";
import { generateRainfallData, type PatternType } from "@/lib/rainfallPatterns";

interface PatternDerivationEngineProps {
  data: RainfallDataPoint[];
  onPatternSelect?: (pattern: string) => void;
}

const QUARTILE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function PatternDerivationEngine({ data, onPatternSelect }: PatternDerivationEngineProps) {
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [comparisonPattern, setComparisonPattern] = useState<string>('best');
  
  const analysis = useMemo<AnalysisResult | null>(() => {
    if (data.length < 3) return null;
    try {
      return analyzeStormComplete(data);
    } catch (e) {
      console.error('Analysis failed:', e);
      return null;
    }
  }, [data]);

  // Generate overlay chart data comparing real storm vs synthetic pattern
  const overlayChartData = useMemo(() => {
    if (!analysis || data.length === 0) return [];
    
    const { statistics, bestMatch, matches } = analysis;
    const timeStep = data.length > 1 ? data[1].time - data[0].time : 15;
    
    // Determine which pattern to compare
    const patternToUse = comparisonPattern === 'best' 
      ? bestMatch.pattern 
      : comparisonPattern as PatternType;
    
    // Generate synthetic pattern data
    const syntheticIntensities = generateRainfallData(
      patternToUse,
      statistics.totalDepth,
      statistics.duration / 60,
      timeStep
    );
    
    // Normalize both to same scale for visual comparison
    const maxReal = Math.max(...data.map(d => d.intensity));
    const maxSynthetic = Math.max(...syntheticIntensities);
    const maxScale = Math.max(maxReal, maxSynthetic);
    
    // Create chart data with both series
    const chartData = data.map((point, index) => {
      const syntheticValue = index < syntheticIntensities.length 
        ? syntheticIntensities[index] 
        : 0;
      
      return {
        time: (point.time / 60).toFixed(1),
        timeMinutes: point.time,
        real: point.intensity,
        synthetic: syntheticValue,
        difference: point.intensity - syntheticValue
      };
    });
    
    return chartData;
  }, [data, analysis, comparisonPattern]);

  // Get pattern name for display
  const getComparisonPatternName = () => {
    if (!analysis) return '';
    if (comparisonPattern === 'best') return analysis.bestMatch.patternName;
    const match = analysis.matches.find(m => m.pattern === comparisonPattern);
    return match?.patternName || comparisonPattern;
  };

  // Calculate overlay statistics
  const overlayStats = useMemo(() => {
    if (overlayChartData.length === 0) return null;
    
    const realTotal = overlayChartData.reduce((sum, d) => sum + d.real, 0);
    const syntheticTotal = overlayChartData.reduce((sum, d) => sum + d.synthetic, 0);
    const sumAbsDiff = overlayChartData.reduce((sum, d) => sum + Math.abs(d.difference), 0);
    const meanAbsDiff = sumAbsDiff / overlayChartData.length;
    
    return {
      volumeMatch: realTotal > 0 ? (syntheticTotal / realTotal * 100).toFixed(1) : '0',
      meanAbsDiff: meanAbsDiff.toFixed(3)
    };
  }, [overlayChartData]);
  
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
    if (sim >= 0.8) return 'text-green-600 dark:text-green-400';
    if (sim >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
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

      {/* Visual Overlay Comparison Chart */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Hyetograph Overlay Comparison
              </CardTitle>
              <CardDescription>
                Real storm data vs synthetic pattern side-by-side
              </CardDescription>
            </div>
            <Select value={comparisonPattern} onValueChange={setComparisonPattern}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best">Best Match ({bestMatch.patternName})</SelectItem>
                {matches.slice(0, 8).map(match => (
                  <SelectItem key={match.pattern} value={match.pattern}>
                    {match.patternName} ({(match.similarity * 100).toFixed(0)}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded bg-primary/80" />
              <span className="text-sm">Real Storm Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-500" style={{ borderTop: '3px dashed' }} />
              <span className="text-sm">{getComparisonPatternName()} Pattern</span>
            </div>
          </div>

          {/* Overlay Chart */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={overlayChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time" 
                  label={{ value: 'Time (hours)', position: 'insideBottom', offset: -5 }}
                  fontSize={11}
                />
                <YAxis 
                  label={{ value: 'Intensity (in/hr)', angle: -90, position: 'insideLeft' }}
                  fontSize={11}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const real = payload.find(p => p.dataKey === 'real')?.value as number;
                      const synthetic = payload.find(p => p.dataKey === 'synthetic')?.value as number;
                      return (
                        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
                          <p className="font-medium mb-2">Time: {label} hr</p>
                          <div className="space-y-1">
                            <p className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded bg-primary/80" />
                              Real: <strong>{real?.toFixed(3)} in/hr</strong>
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="w-3 h-0.5 bg-orange-500" style={{ borderTop: '2px dashed' }} />
                              {getComparisonPatternName()}: <strong>{synthetic?.toFixed(3)} in/hr</strong>
                            </p>
                            {real !== undefined && synthetic !== undefined && (
                              <p className="text-muted-foreground pt-1 border-t mt-1">
                                Δ: {(real - synthetic).toFixed(3)} in/hr
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* Real storm as filled area */}
                <Area 
                  type="monotone" 
                  dataKey="real" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#realGradient)"
                  name="Real Storm"
                />
                {/* Synthetic pattern as dashed line */}
                <Line 
                  type="monotone" 
                  dataKey="synthetic" 
                  stroke="hsl(25, 95%, 53%)" 
                  strokeWidth={2.5}
                  strokeDasharray="6 4"
                  dot={false}
                  name={getComparisonPatternName()}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Comparison Stats */}
          {overlayStats && (
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Pattern Compared</p>
                <p className="font-medium text-sm">{getComparisonPatternName()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Volume Match</p>
                <p className="font-medium text-sm">{overlayStats.volumeMatch}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Mean Abs. Difference</p>
                <p className="font-medium text-sm">{overlayStats.meanAbsDiff} in/hr</p>
              </div>
            </div>
          )}

          {/* Interpretation */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
              <span>
                The <strong className="text-primary">filled area</strong> shows your real storm data, while the{' '}
                <strong className="text-orange-500">dashed line</strong> shows the {getComparisonPatternName()} synthetic pattern 
                scaled to the same depth and duration. Use the dropdown to compare against other patterns.
              </span>
            </p>
          </div>
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
              <button 
                key={match.pattern}
                onClick={() => setComparisonPattern(match.pattern)}
                className={`w-full flex items-center gap-4 p-3 rounded-lg transition-colors text-left ${
                  comparisonPattern === match.pattern 
                    ? 'bg-primary/15 border-2 border-primary/40' 
                    : index === 0 
                      ? 'bg-primary/10 border border-primary/20 hover:bg-primary/15' 
                      : 'bg-muted/50 hover:bg-muted'
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
                    {comparisonPattern === match.pattern && (
                      <Badge variant="outline" className="text-xs">Viewing</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{match.description}</p>
                </div>
                <div className="w-32">
                  <Progress value={match.similarity * 100} className="h-2" />
                </div>
                <div className="text-right text-sm text-muted-foreground w-20">
                  r = {match.correlation.toFixed(2)}
                </div>
              </button>
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
