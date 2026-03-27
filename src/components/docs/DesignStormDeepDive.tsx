import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Landmark, Thermometer, Flame, Building2 } from "lucide-react";

/* ─────────────────── Part 1: US State DOT ─────────────────── */

const STATE_DOT_NE = [
  { state: "Maine (MaineDOT)", manual: "Hydraulics Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II, III", rp: "10, 25, 50, 100-yr", notes: "Type III for coastal areas" },
  { state: "New Hampshire (NHDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 50, 100-yr", notes: "Snowmelt considerations" },
  { state: "Vermont (VTrans)", manual: "Hydraulics Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 50-yr", notes: "Mixed rain-snow events" },
  { state: "Massachusetts (MassDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II, III", rp: "10, 25, 100-yr", notes: "Coastal vs. inland patterns" },
  { state: "Rhode Island (RIDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type III", rp: "10, 25, 100-yr", notes: "Strong coastal influence" },
  { state: "Connecticut (CTDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type III", rp: "10, 25, 100-yr", notes: "Historical analysis available" },
  { state: "New York (NYSDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II, III", rp: "10, 25, 50, 100-yr", notes: "Upstate vs. NYC differences" },
  { state: "New Jersey (NJDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II, III", rp: "10, 25, 100-yr", notes: "NJDEP stormwater regulations" },
  { state: "Pennsylvania (PennDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 50, 100-yr", notes: "PA Act 167 requirements" },
  { state: "Maryland (MD SHA)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "MDE stormwater requirements" },
  { state: "Delaware (DelDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II, III", rp: "10, 25, 100-yr", notes: "Coastal vs. inland" },
  { state: "Virginia (VDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 50, 100-yr", notes: "Separate criteria for coastal areas" },
  { state: "West Virginia (WVDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Mountain terrain considerations" },
];

const STATE_DOT_SE = [
  { state: "North Carolina (NCDOT)", manual: "Hydraulics Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II, III", rp: "10, 25, 50, 100-yr", notes: "Coastal Type III, inland Type II" },
  { state: "South Carolina (SCDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II, III", rp: "10, 25, 100-yr", notes: "Hurricane considerations" },
  { state: "Georgia (GDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II, III", rp: "10, 25, 50, 100-yr", notes: "Metropolitan vs. rural" },
  { state: "Florida (FDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "FDOT Type 1-5", rp: "3, 10, 25, 50, 100-yr", notes: "Five regional patterns" },
  { state: "Alabama (ALDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II, III", rp: "10, 25, 100-yr", notes: "Gulf coast vs. inland" },
  { state: "Mississippi (MDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type III", rp: "10, 25, 100-yr", notes: "Hurricane and tropical storm focus" },
  { state: "Louisiana (LA DOTD)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type III", rp: "10, 25, 100-yr", notes: "Low relief, high water table" },
  { state: "Tennessee (TDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Mixed topography" },
  { state: "Kentucky (KYTC)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Karst region considerations" },
];

const STATE_DOT_MW = [
  { state: "Ohio (ODOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "2-hr to 24-hr", pattern: "Huff 1st Quartile", rp: "10, 25, 50, 100-yr", notes: "Duration varies by application" },
  { state: "Michigan (MDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 50-yr", notes: "Lake effect snow considerations" },
  { state: "Indiana (INDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "Huff 2nd Quartile", rp: "10, 25, 100-yr", notes: "IDEM stormwater requirements" },
  { state: "Illinois (IDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "Huff 2nd Quartile", rp: "10, 25, 100-yr", notes: "Chicago metro separate" },
  { state: "Wisconsin (WisDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Snowmelt + rain events" },
  { state: "Minnesota (MnDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 50, 100-yr", notes: "Significant snowmelt component" },
  { state: "Iowa (Iowa DOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "Huff 2nd Quartile", rp: "10, 25, 100-yr", notes: "Agricultural drainage interaction" },
  { state: "Missouri (MoDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Mixed continental climate" },
  { state: "Kansas (KDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "High plains considerations" },
];

const STATE_DOT_GP = [
  { state: "North Dakota (NDDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Extreme cold, snowmelt" },
  { state: "South Dakota (SDDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Black Hills variations" },
  { state: "Nebraska (NDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Flat terrain, agricultural" },
  { state: "Montana (MDT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Mountain vs. plains" },
  { state: "Wyoming (WYDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "High elevation variations" },
  { state: "Colorado (CDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Significant elevation differences" },
  { state: "New Mexico (NMDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Arid, monsoon considerations" },
  { state: "Oklahoma (ODOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Tornado alley, flash floods" },
];

const STATE_DOT_SW = [
  { state: "Texas (TxDOT)", manual: "Hydraulic Design Manual", idf: "NOAA Atlas 14 + TxDOT IDF", duration: "24-hr", pattern: "SCS Type II, III", rp: "10, 25, 50, 100-yr", notes: "State-specific IDF curves also used" },
  { state: "Arizona (ADOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Monsoon, flash flood focus" },
  { state: "Nevada (NDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Desert, extreme variability" },
  { state: "Utah (UDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type II", rp: "10, 25, 100-yr", notes: "Mountain vs. valley" },
];

const STATE_DOT_WC = [
  { state: "Washington (WSDOT)", manual: "Hydraulics Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type IA, I, II", rp: "10, 25, 50, 100-yr", notes: "Three zones: east, west, mountains" },
  { state: "Oregon (ODOT)", manual: "Hydraulics Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type IA, I, II", rp: "10, 25, 100-yr", notes: "Coastal vs. inland patterns" },
  { state: "California (Caltrans)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "Caltrans-specific", rp: "10, 25, 50, 100-yr", notes: "Mediterranean climate, fire interaction" },
  { state: "Alaska (AK DOT&PF)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "SCS Type I, II", rp: "10, 25, 100-yr", notes: "Extreme climate, permafrost" },
  { state: "Hawaii (HDOT)", manual: "Drainage Manual", idf: "NOAA Atlas 14", duration: "24-hr", pattern: "Hawaii-specific", rp: "10, 25, 50, 100-yr", notes: "Island-specific IDF curves" },
];

function StateDOTTable({ data }: { data: typeof STATE_DOT_NE }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">State</TableHead>
            <TableHead>DOT Manual</TableHead>
            <TableHead>IDF Source</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Temporal Pattern</TableHead>
            <TableHead>Return Periods</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.state}>
              <TableCell className="font-medium text-xs">{row.state}</TableCell>
              <TableCell className="text-xs">{row.manual}</TableCell>
              <TableCell className="text-xs">{row.idf}</TableCell>
              <TableCell className="text-xs">{row.duration}</TableCell>
              <TableCell className="text-xs">{row.pattern}</TableCell>
              <TableCell className="text-xs">{row.rp}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{row.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/* ─────────────── Part 2: Climate-Adjusted ─────────────── */

function ClimateAdjustedSection() {
  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none text-muted-foreground">
        <p>
          Climate-adjusted design storms represent the frontier of hydrologic engineering, where historical statistics meet future projections.
          Traditional IDF curves assume <strong>stationarity</strong> — that past statistics represent future conditions. This assumption is increasingly untenable.
        </p>
      </div>

      {/* Clausius-Clapeyron */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Clausius-Clapeyron Scaling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>The foundational principle: <strong>≈ 7% increase in precipitation intensity per °C of warming</strong>.</p>
          <div className="bg-muted/50 p-3 rounded font-mono text-xs">
            P<sub>future</sub> = P<sub>historical</sub> × exp(0.068 × ΔT)
          </div>
          <p>For a projected warming of ΔT = 2.5°C: scaling factor = exp(0.068 × 2.5) = 1.187, so a 200 mm storm becomes 237 mm.</p>
        </CardContent>
      </Card>

      {/* Methods Hierarchy */}
      <Accordion type="multiple" className="space-y-2">
        <AccordionItem value="cc-scaling">
          <AccordionTrigger className="text-sm font-medium">Method 1: Simple CC-Scaling</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>Apply temperature-based scaling factor to all IDF durations.</p>
            <div className="bg-muted/50 p-3 rounded font-mono text-xs">f<sub>CC</sub> = exp(0.068 × ΔT)</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><strong>Advantages:</strong> Simple, physically-based, easy to explain</div>
              <div><strong>Limitations:</strong> Ignores pattern changes, may underestimate short-duration extremes</div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="delta-change">
          <AccordionTrigger className="text-sm font-medium">Method 2: Delta Change</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>Apply change factors derived from climate model projections for each duration and return period.</p>
            <div className="bg-muted/50 p-3 rounded font-mono text-xs">
              Δ<sub>d,T</sub> = (P<sub>model,future</sub> − P<sub>model,hist</sub>) / P<sub>model,hist</sub>
              <br />P<sub>future</sub>(d,T) = P<sub>historical</sub>(d,T) × (1 + Δ<sub>d,T</sub>)
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><strong>Advantages:</strong> Captures climate model projections, duration-specific</div>
              <div><strong>Limitations:</strong> Inherits model biases, may produce unrealistic extremes</div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="qdm">
          <AccordionTrigger className="text-sm font-medium">Method 3: Quantile Delta Mapping (QDM)</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>Transfer change signals from climate model to observations while preserving observed distribution shape.</p>
            <div className="bg-muted/50 p-3 rounded font-mono text-xs">
              P<sub>future,q</sub> = F<sup>−1</sup><sub>obs</sub>(F<sub>future,climate</sub>(P<sub>climate,q</sub>)) × (Δq<sub>climate</sub> / Δq<sub>obs</sub>)
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><strong>Advantages:</strong> Preserves observed distribution, handles extremes</div>
              <div><strong>Limitations:</strong> Complex, requires high-quality observations</div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cmip6">
          <AccordionTrigger className="text-sm font-medium">Method 4: Full CMIP6 Pipeline</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Generate future IDF curves from bias-corrected, downscaled climate projections.</p>
            <ol className="list-decimal list-inside space-y-1 text-xs">
              <li>Download CMIP6 precipitation projections for region</li>
              <li>Bias-correct using observations (quantile mapping or delta change)</li>
              <li>Downscale to sub-daily (statistical, dynamical, or hybrid)</li>
              <li>Perform frequency analysis on bias-corrected projections</li>
              <li>Extract IDF parameters for future periods</li>
              <li>Generate design storm using synthetic methods</li>
            </ol>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Parameter</TableHead>
                    <TableHead className="text-xs">Historical</TableHead>
                    <TableHead className="text-xs">SSP2-4.5 (2050)</TableHead>
                    <TableHead className="text-xs">SSP5-8.5 (2050)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell className="text-xs">100-yr, 24-hr</TableCell><TableCell className="text-xs">P<sub>hist</sub></TableCell><TableCell className="text-xs">×1.12</TableCell><TableCell className="text-xs">×1.18</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs">100-yr, 1-hr</TableCell><TableCell className="text-xs">P<sub>hist</sub></TableCell><TableCell className="text-xs">×1.15</TableCell><TableCell className="text-xs">×1.22</TableCell></TableRow>
                  <TableRow><TableCell className="text-xs">100-yr, 15-min</TableCell><TableCell className="text-xs">P<sub>hist</sub></TableCell><TableCell className="text-xs">×1.18</TableCell><TableCell className="text-xs">×1.25</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Uncertainty */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Uncertainty Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Source</TableHead>
                  <TableHead className="text-xs">Quantification Approach</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["Emission scenario", "Use multiple pathways (SSP1-2.6, SSP2-4.5, SSP5-8.5)"],
                  ["Climate model", "Use ensemble spread (10–30 models)"],
                  ["Natural variability", "Bootstrap, internal variability sampling"],
                  ["Downscaling", "Compare multiple methods"],
                  ["Frequency analysis", "Confidence intervals on GEV parameters"],
                ].map(([src, approach]) => (
                  <TableRow key={src}>
                    <TableCell className="text-xs font-medium">{src}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{approach}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Practical Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Practical Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Application</TableHead>
                  <TableHead className="text-xs">Recommended Approach</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["Standard infrastructure (50-yr life)", "CC-scaling with 1.2–1.5× safety factor"],
                  ["Critical infrastructure (100-yr life)", "Full climate pipeline with ensemble uncertainty"],
                  ["Coastal infrastructure", "Combine precipitation with sea level rise projections"],
                  ["Flood management", "Multiple emission scenarios and ensemble spread"],
                ].map(([app, rec]) => (
                  <TableRow key={app}>
                    <TableCell className="text-xs font-medium">{app}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{rec}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* State-Specific Climate Adjustments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">State-Specific Climate Adjustments (Emerging)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">State</TableHead>
                  <TableHead className="text-xs">Approach</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ["California (Caltrans)", "SB 379 requires climate change consideration", "Climate-adjusted IDF under development"],
                  ["Washington (WSDOT)", "Project-level climate evaluation", "Guidance issued 2011"],
                  ["New York (NYSDOT)", "Executive Order 13653 compliance", "Climate resilience guidance"],
                  ["Massachusetts (MassDOT)", "Climate resilience chapter in design manual", "2070 projections for critical infrastructure"],
                  ["Florida (FDOT)", "Sea level rise considerations", "Storm surge + precipitation"],
                  ["Virginia (VDOT)", "VDOT Climate Change Policy", "Climate-adjusted design for coastal"],
                ].map(([state, approach, status]) => (
                  <TableRow key={state}>
                    <TableCell className="text-xs font-medium">{state}</TableCell>
                    <TableCell className="text-xs">{approach}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────── Part 3: Special-Purpose Storms ─────────────── */

function SpecialPurposeSection() {
  return (
    <div className="space-y-4">
      <Accordion type="multiple" className="space-y-2">
        <AccordionItem value="fire">
          <AccordionTrigger className="text-sm font-medium">🔥 Fire Flow Analysis Storms</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Evaluate water distribution system capacity to deliver fire flows during peak demand periods.</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">Parameter</TableHead><TableHead className="text-xs">Typical Value</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[["Duration", "2–4 hours"], ["Return period", "10–50 years"], ["Temporal pattern", "Uniform or simple distribution"], ["Fire demand", "1,000–4,000 gpm"]].map(([p, v]) => (
                    <TableRow key={p}><TableCell className="text-xs">{p}</TableCell><TableCell className="text-xs">{v}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="bg-muted/50 p-3 rounded font-mono text-xs">Q<sub>fire</sub> = 18 × C × √A<sub>fire</sub> &nbsp;(ISO method)</div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rain-on-snow">
          <AccordionTrigger className="text-sm font-medium">❄️ Rain-on-Snow Compound Events</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Combine rainfall hyetograph with snowmelt contribution.</p>
            <div className="bg-muted/50 p-3 rounded font-mono text-xs space-y-1">
              <div>P<sub>total</sub>(t) = P<sub>rain</sub>(t) + M(t)</div>
              <div>M = k<sub>m</sub> × (T − T<sub>b</sub>)</div>
            </div>
            <p className="text-xs">where k<sub>m</sub> is the melt coefficient (0.1–0.5 in/hr per °F) and T<sub>b</sub> is the base temperature (32 °F).</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">Time (hr)</TableHead><TableHead className="text-xs">P<sub>rain</sub> (mm)</TableHead><TableHead className="text-xs">T (°C)</TableHead><TableHead className="text-xs">M (mm)</TableHead><TableHead className="text-xs">P<sub>total</sub> (mm)</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[["0–4",5,2,2,7],["4–8",10,5,5,15],["8–12",25,8,8,33],["12–16",15,6,6,21],["16–20",8,4,4,12],["20–24",3,1,1,4]].map(([t,p,temp,m,tot]) => (
                    <TableRow key={String(t)}><TableCell className="text-xs">{t}</TableCell><TableCell className="text-xs">{p}</TableCell><TableCell className="text-xs">{temp}</TableCell><TableCell className="text-xs">{m}</TableCell><TableCell className="text-xs">{tot}</TableCell></TableRow>
                  ))}
                  <TableRow className="font-semibold"><TableCell className="text-xs">Total</TableCell><TableCell className="text-xs">66</TableCell><TableCell className="text-xs">—</TableCell><TableCell className="text-xs">26</TableCell><TableCell className="text-xs">92</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="hurricane">
          <AccordionTrigger className="text-sm font-medium">🌀 Hurricane / Tropical Cyclone Rainbands</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Extremely long duration (24–96 hours), multiple peaks from rainbands, high intensity in eyewall.</p>
            <div className="bg-muted/50 p-3 rounded font-mono text-xs space-y-1">
              <div>P(t) = P<sub>background</sub> + P<sub>eyewall</sub>(t) + Σ P<sub>rainband,i</sub>(t)</div>
              <div>P<sub>eyewall</sub>(t) = P<sub>max</sub> × exp(−(t − t<sub>peak</sub>)² / 2σ²)</div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">Parameter</TableHead><TableHead className="text-xs">Typical Range</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[["Total duration","24–96 hours"],["Eyewall peak intensity","50–150 mm/hr"],["Rainband intensity","20–75 mm/hr"],["Rainband frequency","4–12 bands per storm"]].map(([p,v]) => (
                    <TableRow key={p}><TableCell className="text-xs">{p}</TableCell><TableCell className="text-xs">{v}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="atmospheric-river">
          <AccordionTrigger className="text-sm font-medium">🌊 Atmospheric River</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Long, narrow corridors of enhanced water vapor transport. Duration: 24–72+ hours with orographic enhancement.</p>
            <div className="bg-muted/50 p-3 rounded font-mono text-xs space-y-1">
              <div>IVT = (1/g) ∫ q·V dp &nbsp;&nbsp;(IVT &gt; 250 kg/m/s defines AR)</div>
              <div>P(t) = f<sub>orographic</sub> × P<sub>synoptic</sub>(IVT(t))</div>
              <div>f<sub>orographic</sub> = 1 + k<sub>oro</sub> × ∇h</div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="post-wildfire">
          <AccordionTrigger className="text-sm font-medium">🔥 Post-Wildfire Storms</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Modify runoff parameters (CN, infiltration) rather than rainfall pattern.</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">Burn Severity</TableHead><TableHead className="text-xs">ΔCN</TableHead><TableHead className="text-xs">Infiltration Reduction</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[["Low","+5 to +10","−10 to −30%"],["Moderate","+10 to +20","−30 to −60%"],["High","+20 to +30","−60 to −90%"]].map(([s,cn,inf]) => (
                    <TableRow key={s}><TableCell className="text-xs">{s}</TableCell><TableCell className="text-xs">{cn}</TableCell><TableCell className="text-xs">{inf}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="bg-muted/50 p-3 rounded font-mono text-xs">
              Recovery: CN(t) = CN<sub>post</sub> − (CN<sub>post</sub> − CN<sub>pre</sub>) × (1 − e<sup>−kt</sup>) &nbsp;(k ≈ 0.5–2.0/yr)
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="uhi">
          <AccordionTrigger className="text-sm font-medium">🏙️ Urban Heat Island-Enhanced Storms</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Account for urban heat island effects on convective precipitation.</p>
            <div className="bg-muted/50 p-3 rounded font-mono text-xs">P<sub>urban</sub> = P<sub>rural</sub> × (1 + α<sub>UHI</sub> × ΔT<sub>UHI</sub>)</div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">City Size</TableHead><TableHead className="text-xs">ΔTUHI (°C)</TableHead><TableHead className="text-xs">f<sub>UHI</sub></TableHead></TableRow></TableHeader>
                <TableBody>
                  {[["Small (<100k)","0.5–1.0","1.03–1.07"],["Medium (100k–1M)","1.0–2.5","1.07–1.17"],["Large (>1M)","2.5–5.0","1.17–1.35"]].map(([s,dt,f]) => (
                    <TableRow key={s}><TableCell className="text-xs">{s}</TableCell><TableCell className="text-xs">{dt}</TableCell><TableCell className="text-xs">{f}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="volcanic">
          <AccordionTrigger className="text-sm font-medium">🌋 Post-Volcanic Eruption Events</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <p>Similar to post-wildfire: modify infiltration and CN for ash deposits.</p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead className="text-xs">Condition</TableHead><TableHead className="text-xs">CN Increase</TableHead><TableHead className="text-xs">Infiltration Reduction</TableHead></TableRow></TableHeader>
                <TableBody>
                  {[["Light ash (<10 mm)","+5 to +10","−10 to −30%"],["Moderate ash (10–50 mm)","+10 to +20","−30 to −60%"],["Heavy ash (>50 mm)","+20 to +30","−60 to −90%"]].map(([c,cn,inf]) => (
                    <TableRow key={c}><TableCell className="text-xs">{c}</TableCell><TableCell className="text-xs">{cn}</TableCell><TableCell className="text-xs">{inf}</TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

/* ─────────────── Part 4: Asia Urban ─────────────── */

const ASIA_EAST = [
  { city: "Beijing", standard: "GB 50014 + Municipal", idf: "Beijing IDF", pattern: "Keifer-type", notes: "Monsoon + convective" },
  { city: "Shanghai", standard: "GB 50014 + Shanghai IDF", idf: "Shanghai IDF", pattern: "Shanghai Pattern", notes: "Typhoon influence" },
  { city: "Guangzhou", standard: "GB 50014 + Guangzhou IDF", idf: "Guangzhou IDF", pattern: "Guangzhou Pattern", notes: "Tropical cyclone" },
  { city: "Shenzhen", standard: "Shenzhen Design Storm", idf: "Shenzhen IDF", pattern: "Shenzhen Pattern", notes: "High intensity, short duration" },
  { city: "Hong Kong", standard: "HKO Standard", idf: "HKO IDF", pattern: "HKO Pattern", notes: "Typhoon + monsoon" },
  { city: "Tokyo", standard: "JMA Standard", idf: "AMeDAS IDF", pattern: "Mononobe / Tanaka", notes: "Typhoon + Baiu season" },
  { city: "Osaka", standard: "JMA Standard", idf: "AMeDAS IDF", pattern: "Regional pattern", notes: "Urban + typhoon" },
  { city: "Seoul", standard: "MOLIT Standard", idf: "KMA IDF", pattern: "Seoul Pattern", notes: "Monsoon + typhoon" },
  { city: "Busan", standard: "MOLIT Standard", idf: "KMA IDF", pattern: "Regional pattern", notes: "Typhoon influence" },
];

const ASIA_SOUTH = [
  { city: "Mumbai", standard: "Mumbai Storm", idf: "Mumbai IDF", pattern: "Monsoon Pattern", notes: "Extreme monsoon" },
  { city: "Delhi", standard: "Delhi Design Storm", idf: "Delhi IDF", pattern: "Regional pattern", notes: "Monsoon + convective" },
  { city: "Chennai", standard: "Chennai Design Storm", idf: "Chennai IDF", pattern: "NEM Pattern", notes: "Northeast monsoon" },
  { city: "Kolkata", standard: "Kolkata Design Storm", idf: "Kolkata IDF", pattern: "Regional pattern", notes: "Cyclone influence" },
  { city: "Dhaka", standard: "BMD Standard", idf: "BMD IDF", pattern: "Monsoon Pattern", notes: "Extreme flooding" },
];

const ASIA_SE = [
  { city: "Singapore", standard: "PUB Code of Practice", idf: "PUB IDF", pattern: "Singapore Pattern", notes: "Equatorial, convective" },
  { city: "Kuala Lumpur", standard: "MSMA", idf: "DID IDF", pattern: "MSMA Pattern", notes: "Equatorial monsoon" },
  { city: "Bangkok", standard: "TMD Standard", idf: "TMD IDF", pattern: "Bangkok Pattern", notes: "Monsoon + convective" },
  { city: "Jakarta", standard: "BMKG Standard", idf: "BMKG IDF", pattern: "Jakarta Pattern", notes: "Monsoon + convective" },
  { city: "Hanoi", standard: "IMHEN Standard", idf: "IMHEN IDF", pattern: "Hanoi Pattern", notes: "Monsoon + urban" },
  { city: "Ho Chi Minh City", standard: "IMHEN Standard", idf: "IMHEN IDF", pattern: "HCMC Pattern", notes: "Tropical monsoon" },
  { city: "Manila", standard: "PAGASA Standard", idf: "PAGASA IDF", pattern: "Manila Pattern", notes: "Typhoon capital" },
];

function AsiaUrbanTable({ data }: { data: typeof ASIA_EAST }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">City</TableHead>
            <TableHead className="text-xs">Design Standard</TableHead>
            <TableHead className="text-xs">IDF Source</TableHead>
            <TableHead className="text-xs">Temporal Pattern</TableHead>
            <TableHead className="text-xs">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.city}>
              <TableCell className="text-xs font-medium">{row.city}</TableCell>
              <TableCell className="text-xs">{row.standard}</TableCell>
              <TableCell className="text-xs">{row.idf}</TableCell>
              <TableCell className="text-xs">{row.pattern}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{row.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AsiaUrbanSection() {
  return (
    <div className="space-y-4">
      <div className="prose prose-sm max-w-none text-muted-foreground">
        <p>
          Asian urban centers face unique challenges: rapid urbanization, monsoon climates, tropical cyclones, and diverse hydrologic conditions.
        </p>
      </div>

      <Accordion type="multiple" className="space-y-2">
        <AccordionItem value="east">
          <AccordionTrigger className="text-sm font-medium">East Asia (China, Japan, Korea)</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <AsiaUrbanTable data={ASIA_EAST} />
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Key Formulas</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="bg-muted/50 p-2 rounded font-mono">
                  <strong>China (GB 50014):</strong> i = A₁(1 + C log T) / (t + b)<sup>n</sup>
                </div>
                <div className="bg-muted/50 p-2 rounded font-mono">
                  <strong>Beijing:</strong> i = 2001(1 + 0.811 log T) / (t + 8)<sup>0.711</sup> &nbsp;(L/s/ha)
                </div>
                <div className="bg-muted/50 p-2 rounded font-mono">
                  <strong>Japan (Mononobe):</strong> i = (R₂₄/24)(24/t)<sup>2/3</sup>
                </div>
                <div className="bg-muted/50 p-2 rounded font-mono">
                  <strong>Korea:</strong> i = aT<sup>b</sup> / (t + c)<sup>d</sup>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="south">
          <AccordionTrigger className="text-sm font-medium">South Asia (India, Bangladesh)</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <AsiaUrbanTable data={ASIA_SOUTH} />
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">India IDF Parameters</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead className="text-xs">City</TableHead><TableHead className="text-xs">a</TableHead><TableHead className="text-xs">b</TableHead><TableHead className="text-xs">c</TableHead><TableHead className="text-xs">d</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {[["Mumbai",74.9,0.23,6.0,0.72],["Delhi",58.0,0.19,5.5,0.68],["Chennai",44.0,0.22,7.0,0.65],["Kolkata",52.0,0.20,6.5,0.70]].map(([city,...params]) => (
                        <TableRow key={String(city)}><TableCell className="text-xs font-medium">{city}</TableCell>{params.map((p,i) => <TableCell key={i} className="text-xs">{p}</TableCell>)}</TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="southeast">
          <AccordionTrigger className="text-sm font-medium">Southeast Asia</AccordionTrigger>
          <AccordionContent className="space-y-4">
            <AsiaUrbanTable data={ASIA_SE} />
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Regional IDF Formulas</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="bg-muted/50 p-2 rounded font-mono">
                  <strong>Singapore:</strong> i = aT<sup>b</sup> / (t<sup>c</sup> + d)
                </div>
                <div className="bg-muted/50 p-2 rounded font-mono">
                  <strong>Malaysia (MSMA):</strong> i = αT<sup>β</sup> / (t + γ)<sup>δ</sup>
                </div>
                <div className="bg-muted/50 p-2 rounded font-mono">
                  <strong>Jakarta:</strong> i = aT<sup>b</sup> / (t + c)<sup>d</sup>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Regional Best Practices */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Asia Urban — Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Storm Type</TableHead><TableHead className="text-xs">Recommended Pattern</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ["Monsoon sustained", "Chicago-type with extended duration"],
                  ["Typhoon", "Multiple-peak pattern"],
                  ["Convective", "Huff 1st or 2nd quartile"],
                  ["Urban heat island", "Enhanced intensity pattern"],
                ].map(([t, p]) => (
                  <TableRow key={t}><TableCell className="text-xs">{t}</TableCell><TableCell className="text-xs">{p}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────────────── Main Export ─────────────── */

export function DesignStormDeepDive() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Design Storm Categories — Deep Dive
          </CardTitle>
          <CardDescription>
            Detailed technical breakdowns of US State DOT standards, climate-adjusted futures, special-purpose storms, and Asia urban design criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {/* Part 1 */}
            <AccordionItem value="state-dot">
              <AccordionTrigger className="text-base font-semibold">
                <span className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-primary" />
                  Part 1: US State DOT Standards
                  <Badge variant="secondary" className="text-[10px] ml-2">50 States</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-4">
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>
                    State DOTs have developed their own design storm criteria based on regional climate, hydrology, and regulatory requirements.
                    Most use NOAA Atlas 14 for IDF data and SCS Type distributions, but several states (Ohio, Indiana, Illinois, Iowa) use Huff quartiles,
                    and Florida has five unique regional patterns.
                  </p>
                </div>

                {/* Variation table */}
                <Card>
                  <CardHeader className="pb-3"><CardTitle className="text-base">Key Variations Across States</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader><TableRow><TableHead className="text-xs">Aspect</TableHead><TableHead className="text-xs">Variation</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {[
                            ["Design storm duration", "2-hr (Ohio), 4-hr (Ontario), 24-hr (most states), 48-hr (coastal states)"],
                            ["Temporal distribution", "SCS types, Huff quartiles, state-specific patterns, historical analysis"],
                            ["Return periods", "10-yr minor systems, 25-yr major collectors, 50-yr arterials, 100-yr interstates"],
                            ["IDF source", "NOAA Atlas 14, state-specific IDF, TP-40 legacy, regional studies"],
                            ["Areal reduction", "State-specific formulas, no reduction, or ARF from publications"],
                            ["Climate adjustment", "Explicit factors (few), implicit safety (most), under development (many)"],
                          ].map(([a, v]) => (
                            <TableRow key={a}><TableCell className="text-xs font-medium">{a}</TableCell><TableCell className="text-xs text-muted-foreground">{v}</TableCell></TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <Accordion type="multiple" className="space-y-2">
                  <AccordionItem value="ne"><AccordionTrigger className="text-sm">Northeast & Mid-Atlantic (13 states)</AccordionTrigger><AccordionContent><StateDOTTable data={STATE_DOT_NE} /></AccordionContent></AccordionItem>
                  <AccordionItem value="se"><AccordionTrigger className="text-sm">Southeast (9 states)</AccordionTrigger><AccordionContent><StateDOTTable data={STATE_DOT_SE} /></AccordionContent></AccordionItem>
                  <AccordionItem value="mw"><AccordionTrigger className="text-sm">Midwest & Great Lakes (9 states)</AccordionTrigger><AccordionContent><StateDOTTable data={STATE_DOT_MW} /></AccordionContent></AccordionItem>
                  <AccordionItem value="gp"><AccordionTrigger className="text-sm">Great Plains & Mountain West (8 states)</AccordionTrigger><AccordionContent><StateDOTTable data={STATE_DOT_GP} /></AccordionContent></AccordionItem>
                  <AccordionItem value="sw"><AccordionTrigger className="text-sm">Southwest (4 states)</AccordionTrigger><AccordionContent><StateDOTTable data={STATE_DOT_SW} /></AccordionContent></AccordionItem>
                  <AccordionItem value="wc"><AccordionTrigger className="text-sm">West Coast & Pacific (5 states + territories)</AccordionTrigger><AccordionContent><StateDOTTable data={STATE_DOT_WC} /></AccordionContent></AccordionItem>
                </Accordion>

                {/* SCS / Huff / FDOT summary cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">SCS Types</CardTitle></CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-1">
                      <div><Badge variant="outline" className="text-[10px]">IA</Badge> Low intensity, PNW & Hawaii</div>
                      <div><Badge variant="outline" className="text-[10px]">I</Badge> Moderate intensity, coastal CA</div>
                      <div><Badge variant="outline" className="text-[10px]">II</Badge> High intensity, most of US</div>
                      <div><Badge variant="outline" className="text-[10px]">III</Badge> Sustained, Gulf & Atlantic coast</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Huff Quartiles</CardTitle></CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-1">
                      <div><Badge variant="outline" className="text-[10px]">1st</Badge> Early peak, convective</div>
                      <div><Badge variant="outline" className="text-[10px]">2nd</Badge> OH, IN, IL, IA standard</div>
                      <div><Badge variant="outline" className="text-[10px]">3rd</Badge> More uniform distribution</div>
                      <div><Badge variant="outline" className="text-[10px]">4th</Badge> Late peak, stratiform</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">FDOT Zones</CardTitle></CardHeader>
                    <CardContent className="text-xs text-muted-foreground space-y-1">
                      <div><Badge variant="outline" className="text-[10px]">1</Badge> Panhandle, Gulf coast</div>
                      <div><Badge variant="outline" className="text-[10px]">2</Badge> North FL, transition</div>
                      <div><Badge variant="outline" className="text-[10px]">3</Badge> Central FL, convective</div>
                      <div><Badge variant="outline" className="text-[10px]">4</Badge> South FL, tropical</div>
                      <div><Badge variant="outline" className="text-[10px]">5</Badge> Keys, extreme tropical</div>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Part 2 */}
            <AccordionItem value="climate">
              <AccordionTrigger className="text-base font-semibold">
                <span className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-primary" />
                  Part 2: Climate-Adjusted Futures
                  <Badge variant="secondary" className="text-[10px] ml-2">4 Methods</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <ClimateAdjustedSection />
              </AccordionContent>
            </AccordionItem>

            {/* Part 3 */}
            <AccordionItem value="special">
              <AccordionTrigger className="text-base font-semibold">
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary" />
                  Part 3: Special-Purpose Storms
                  <Badge variant="secondary" className="text-[10px] ml-2">7 Types</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <SpecialPurposeSection />
              </AccordionContent>
            </AccordionItem>

            {/* Part 4 */}
            <AccordionItem value="asia-urban">
              <AccordionTrigger className="text-base font-semibold">
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Part 4: Asia Urban Design Storms
                  <Badge variant="secondary" className="text-[10px] ml-2">21 Cities</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <AsiaUrbanSection />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Quality Control Checklist */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quality Control Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Check</TableHead><TableHead className="text-xs">Method</TableHead></TableRow></TableHeader>
              <TableBody>
                {[
                  ["Total depth matches IDF", "Verify sum of hyetograph equals design depth"],
                  ["Temporal pattern realistic", "Compare to historical storm shapes"],
                  ["Peak intensity reasonable", "Should not exceed IDF for shortest duration"],
                  ["Duration matches design", "Verify time span is correct"],
                  ["Units consistent", "Check mm/hr vs. inches/hr"],
                  ["Return period correct", "Confirm IDF curve matches target return period"],
                  ["Regional applicability", "Verify storm is appropriate for location"],
                ].map(([check, method]) => (
                  <TableRow key={check}><TableCell className="text-xs font-medium">{check}</TableCell><TableCell className="text-xs text-muted-foreground">{method}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Requirements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Documentation Requirements</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-2">For each generated storm, document:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li><strong>Source data:</strong> IDF source, historical period, climate model</li>
            <li><strong>Method:</strong> Generation approach used</li>
            <li><strong>Parameters:</strong> Return period, duration, location</li>
            <li><strong>Temporal pattern:</strong> Pattern type and source</li>
            <li><strong>Adjustments:</strong> Climate factors, areal reduction</li>
            <li><strong>Validation:</strong> Quality checks performed</li>
            <li><strong>Limitations:</strong> Known uncertainties or assumptions</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

// Re-export the icon for use in Documentation tabs
import { BookOpen } from "lucide-react";
export { BookOpen as DeepDiveIcon };
