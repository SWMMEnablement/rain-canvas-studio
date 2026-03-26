import { useState, useCallback, useMemo, useEffect } from "react";
import { Download } from "lucide-react";
import { Code2, Play, Copy, CheckCircle, ChevronDown, ChevronRight, Zap, List, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/storm-api`;

interface EndpointResult {
  loading: boolean;
  data: unknown | null;
  error: string | null;
  status: number | null;
  time: number | null;
}

const INITIAL_RESULT: EndpointResult = { loading: false, data: null, error: null, status: null, time: null };

// Common patterns for the dropdown
const FALLBACK_PATTERNS = [
  { value: "scs2", label: "SCS Type II" },
  { value: "scs1", label: "SCS Type I" },
  { value: "scs3", label: "SCS Type III" },
  { value: "chicago", label: "Chicago" },
  { value: "block", label: "Uniform Block" },
  { value: "triangular", label: "Triangular" },
  { value: "huff1", label: "Huff Q1" },
  { value: "huff2", label: "Huff Q2" },
  { value: "fsr", label: "FSR (UK)" },
  { value: "arr", label: "ARR (Australia)" },
  { value: "balanced", label: "Balanced Storm" },
];

export function ApiPlayground() {
  // Dynamic pattern list fetched from API
  const [allPatterns, setAllPatterns] = useState(FALLBACK_PATTERNS);

  useEffect(() => {
    fetch(`${API_BASE}/patterns`, { headers: { "Content-Type": "application/json" } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.patterns) && data.patterns.length > 0) {
          setAllPatterns(data.patterns.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name })));
        }
      })
      .catch(() => { /* keep fallback */ });
  }, []);

  // Generate endpoint state
  const [genPattern, setGenPattern] = useState("scs2");
  const [genDepth, setGenDepth] = useState("4");
  const [genDuration, setGenDuration] = useState("6");
  const [genTimeStep, setGenTimeStep] = useState("15");
  const [genResult, setGenResult] = useState<EndpointResult>(INITIAL_RESULT);

  // Patterns endpoint state
  const [patternsResult, setPatternsResult] = useState<EndpointResult>(INITIAL_RESULT);

  // Analyze endpoint state
  const [analyzeInput, setAnalyzeInput] = useState(
    JSON.stringify([
      { time_min: 0, intensity: 0.1 },
      { time_min: 15, intensity: 0.5 },
      { time_min: 30, intensity: 2.8 },
      { time_min: 45, intensity: 4.5 },
      { time_min: 60, intensity: 3.2 },
      { time_min: 75, intensity: 1.4 },
      { time_min: 90, intensity: 0.4 },
    ], null, 2)
  );
  const [analyzeResult, setAnalyzeResult] = useState<EndpointResult>(INITIAL_RESULT);

  const [copied, setCopied] = useState<string | null>(null);

  const callApi = useCallback(async (
    url: string,
    method: string,
    body: unknown | null,
    setResult: (r: EndpointResult) => void,
  ) => {
    setResult({ loading: true, data: null, error: null, status: null, time: null });
    const start = performance.now();
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      const elapsed = Math.round(performance.now() - start);
      const data = await res.json();
      if (!res.ok) {
        setResult({ loading: false, data, error: data.error || `HTTP ${res.status}`, status: res.status, time: elapsed });
      } else {
        setResult({ loading: false, data, error: null, status: res.status, time: elapsed });
      }
    } catch (err) {
      const elapsed = Math.round(performance.now() - start);
      setResult({ loading: false, data: null, error: err instanceof Error ? err.message : "Network error", status: null, time: elapsed });
    }
  }, []);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleGenerate = () => {
    callApi(`${API_BASE}/generate`, "POST", {
      pattern: genPattern,
      total_depth: Number(genDepth),
      duration_hr: Number(genDuration),
      time_step_min: Number(genTimeStep),
    }, setGenResult);
  };

  const handlePatterns = () => {
    callApi(`${API_BASE}/patterns`, "GET", null, setPatternsResult);
  };

  const handleAnalyze = () => {
    try {
      const data = JSON.parse(analyzeInput);
      callApi(`${API_BASE}/analyze`, "POST", { data }, setAnalyzeResult);
    } catch {
      setAnalyzeResult({ loading: false, data: null, error: "Invalid JSON input", status: null, time: null });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Code2 className="w-7 h-7" />
            Storm API Playground
          </CardTitle>
          <CardDescription className="text-base">
            Try the public REST API directly from your browser. Generate hyetographs, list patterns, and analyze storm data programmatically.
          </CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="font-mono text-xs">
              BASE: {API_BASE}
            </Badge>
            <Badge variant="secondary">No Auth Required</Badge>
            <Button variant="outline" size="sm" className="ml-auto" asChild>
              <a href="/API.md" download="Storm-API-Documentation.md">
                <Download className="w-4 h-4 mr-1" />
                Download API Docs
              </a>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Endpoints */}
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analyze
          </TabsTrigger>
        </TabsList>

        {/* ── Generate Endpoint ── */}
        <TabsContent value="generate" className="mt-6 space-y-4">
          <EndpointHeader
            method="POST"
            path="/storm-api/generate"
            description="Generate a design-storm hyetograph from a synthetic rainfall pattern."
          />

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gen-pattern">Pattern</Label>
                  <Select value={genPattern} onValueChange={setGenPattern}>
                    <SelectTrigger id="gen-pattern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {allPatterns.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gen-depth">Total Depth (in)</Label>
                  <Input id="gen-depth" type="number" value={genDepth} onChange={e => setGenDepth(e.target.value)} min="0.1" max="100" step="0.1" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gen-dur">Duration (hr)</Label>
                  <Input id="gen-dur" type="number" value={genDuration} onChange={e => setGenDuration(e.target.value)} min="0.1" max="72" step="0.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gen-ts">Time Step (min)</Label>
                  <Input id="gen-ts" type="number" value={genTimeStep} onChange={e => setGenTimeStep(e.target.value)} min="1" max="360" step="1" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleGenerate} disabled={genResult.loading}>
                  <Play className="w-4 h-4 mr-2" />
                  {genResult.loading ? "Running..." : "Send Request"}
                </Button>
                <CurlSnippet
                  curl={`curl -X POST ${API_BASE}/generate \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify({ pattern: genPattern, total_depth: Number(genDepth), duration_hr: Number(genDuration), time_step_min: Number(genTimeStep) })}'`}
                  copied={copied}
                  onCopy={copyToClipboard}
                />
              </div>
            </CardContent>
          </Card>

          <HyetographChart result={genResult} />
          <ResultPanel result={genResult} copied={copied} onCopy={copyToClipboard} />
        </TabsContent>

        {/* ── Patterns Endpoint ── */}
        <TabsContent value="patterns" className="mt-6 space-y-4">
          <EndpointHeader
            method="GET"
            path="/storm-api/patterns"
            description="List all 265+ available rainfall distribution patterns with metadata."
          />

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Button onClick={handlePatterns} disabled={patternsResult.loading}>
                  <Play className="w-4 h-4 mr-2" />
                  {patternsResult.loading ? "Running..." : "Send Request"}
                </Button>
                <CurlSnippet
                  curl={`curl ${API_BASE}/patterns`}
                  copied={copied}
                  onCopy={copyToClipboard}
                />
              </div>
            </CardContent>
          </Card>

          <ResultPanel result={patternsResult} copied={copied} onCopy={copyToClipboard} />
        </TabsContent>

        {/* ── Analyze Endpoint ── */}
        <TabsContent value="analyze" className="mt-6 space-y-4">
          <EndpointHeader
            method="POST"
            path="/storm-api/analyze"
            description="Analyze a raw rainfall timeseries and compute storm statistics (depth, peak, quartile fractions)."
          />

          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Input Data (JSON array of {`{time_min, intensity}`})</Label>
                <textarea
                  className="w-full h-40 font-mono text-sm p-3 rounded-lg bg-muted border border-border resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  value={analyzeInput}
                  onChange={e => setAnalyzeInput(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleAnalyze} disabled={analyzeResult.loading}>
                  <Play className="w-4 h-4 mr-2" />
                  {analyzeResult.loading ? "Running..." : "Send Request"}
                </Button>
                <CurlSnippet
                  curl={`curl -X POST ${API_BASE}/analyze \\\n  -H "Content-Type: application/json" \\\n  -d '{"data": ${analyzeInput.replace(/\n/g, "")}}'`}
                  copied={copied}
                  onCopy={copyToClipboard}
                />
              </div>
            </CardContent>
          </Card>

          <ResultPanel result={analyzeResult} copied={copied} onCopy={copyToClipboard} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

function EndpointHeader({ method, path, description }: { method: string; path: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <Badge className={method === "GET" ? "bg-green-600 text-white" : "bg-blue-600 text-white"}>
        {method}
      </Badge>
      <div>
        <code className="text-sm font-mono font-semibold text-foreground">{path}</code>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

function CurlSnippet({ curl, copied, onCopy }: { curl: string; copied: string | null; onCopy: (text: string, label: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
        {open ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
        cURL
      </Button>
      {open && (
        <div className="flex-1 relative">
          <pre className="text-xs font-mono bg-muted p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">{curl}</pre>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1 right-1"
            onClick={() => onCopy(curl, "curl")}
          >
            {copied === "curl" ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      )}
    </>
  );
}

function HyetographChart({ result }: { result: EndpointResult }) {
  const chartData = useMemo(() => {
    if (!result.data || result.error) return null;
    const d = result.data as { data?: { time_min: number; intensity: number; cumulative: number }[] };
    return d.data ?? null;
  }, [result]);

  if (!chartData || chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Hyetograph Visualization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="time_min"
              label={{ value: "Time (min)", position: "insideBottom", offset: -10, className: "fill-muted-foreground text-xs" }}
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="left"
              label={{ value: "Intensity (in/hr)", angle: -90, position: "insideLeft", offset: 0, className: "fill-muted-foreground text-xs" }}
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: "Cumulative (in)", angle: 90, position: "insideRight", offset: 0, className: "fill-muted-foreground text-xs" }}
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              labelFormatter={(v) => `Time: ${v} min`}
            />
            <Bar yAxisId="left" dataKey="intensity" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} name="Intensity (in/hr)" />
            <Area yAxisId="right" type="monotone" dataKey="cumulative" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.1)" name="Cumulative (in)" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function ResultPanel({ result, copied, onCopy }: { result: EndpointResult; copied: string | null; onCopy: (text: string, label: string) => void }) {
  if (!result.data && !result.error && !result.loading) return null;

  const json = result.data ? JSON.stringify(result.data, null, 2) : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm">Response</CardTitle>
            {result.status && (
              <Badge variant={result.status < 400 ? "default" : "destructive"}>
                {result.status}
              </Badge>
            )}
            {result.time !== null && (
              <span className="text-xs text-muted-foreground">{result.time}ms</span>
            )}
          </div>
          {json && (
            <Button variant="ghost" size="sm" onClick={() => onCopy(json, "response")}>
              {copied === "response" ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {result.loading && <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>}
        {result.error && !result.data && (
          <p className="text-sm text-destructive">{result.error}</p>
        )}
        {json && (
          <pre className="text-xs font-mono bg-muted p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto whitespace-pre-wrap">
            {json}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}
