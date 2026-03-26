import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Snowflake, CloudRain, Droplets, BarChart3, Thermometer, BookOpen, AlertTriangle } from "lucide-react";

const SectionCard = ({ title, icon: Icon, children, description }: { title: string; icon: React.ElementType; children: React.ReactNode; description?: string }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2 text-lg">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent className="prose prose-sm max-w-none text-muted-foreground">
      {children}
    </CardContent>
  </Card>
);

const Eq = ({ children }: { children: string }) => (
  <code className="bg-muted px-2 py-1 rounded text-xs font-mono text-foreground">{children}</code>
);

const ParamBadge = ({ label, value }: { label: string; value: string }) => (
  <span className="inline-flex items-center gap-1 mr-2 mb-1">
    <Badge variant="outline" className="text-xs font-mono">{label}</Badge>
    <span className="text-xs text-muted-foreground">{value}</span>
  </span>
);

export function CanadianDesignStormsRef() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-accent/30 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Snowflake className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Canadian Design Storms: Comprehensive Technical Reference
              </h2>
              <p className="text-sm text-muted-foreground mb-3">
                Design storms are single-event synthetic rainfalls assumed to produce flows of a desired 
                return period. They are the fundamental input to urban drainage models like SWMM5, Visual 
                OTTHYMO, and InfoWorks ICM. This reference covers all major design storm methods used in 
                Canadian practice.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge>ECCC IDF Framework</Badge>
                <Badge variant="secondary">12+ Storm Types</Badge>
                <Badge variant="outline">Climate Change Scaling</Badge>
                <Badge variant="outline">Ontario Regional Storms</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role of Design Storms */}
      <SectionCard title="Role of Design Storms in Canadian Practice" icon={Droplets}>
        <div className="grid md:grid-cols-2 gap-4 not-prose">
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <h4 className="font-semibold text-sm text-foreground mb-2">Minor System Design</h4>
            <p className="text-xs text-muted-foreground">Pipes, inlets — typically 2–10 year return periods</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <h4 className="font-semibold text-sm text-foreground mb-2">Major System / Flood Control</h4>
            <p className="text-xs text-muted-foreground">25–100 year return periods, plus Regional Storm (Hurricane Hazel in southern Ontario)</p>
          </div>
        </div>
        <p className="mt-4">There are two broad families:</p>
        <ul>
          <li><strong>IDF-derived synthetic storms</strong> — hyetograph shape derived mathematically from IDF curves</li>
          <li><strong>Historically-based synthetic storms</strong> — temporal pattern derived from statistical analysis of observed storm events</li>
        </ul>
        <p>
          Environment and Climate Change Canada (ECCC) provides IDF data for ~563 stations across Canada 
          through the Engineering Climate Datasets program, using the Gumbel (Extreme Value Type I) 
          distribution fitted via the method of moments.
        </p>
      </SectionCard>

      {/* IDF Framework */}
      <SectionCard title="Canadian IDF Framework" icon={BarChart3} description="The foundation of all IDF-derived design storms">
        <h4 className="font-semibold text-foreground">The Fundamental IDF Equation</h4>
        <div className="bg-muted/50 p-4 rounded-lg my-3 text-center">
          <Eq>i = a / (t_d + b)^c</Eq>
        </div>
        <div className="not-prose grid grid-cols-2 md:grid-cols-4 gap-2 my-3">
          <ParamBadge label="i" value="intensity (mm/hr)" />
          <ParamBadge label="t_d" value="duration (min)" />
          <ParamBadge label="a, b, c" value="station-specific coefficients" />
        </div>
        <p>Coefficients vary by return period (2, 5, 10, 25, 50, 100 years).</p>

        <h4 className="font-semibold text-foreground mt-4">Alternative Forms</h4>
        <ul>
          <li><strong>Talbot:</strong> <Eq>i = a / (t_d + b)</Eq></li>
          <li><strong>Sherman/Montana:</strong> <Eq>i = a / t_d^n</Eq></li>
        </ul>

        <h4 className="font-semibold text-foreground mt-4">ECCC IDF Data Structure</h4>
        <div className="not-prose">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-muted/30 rounded"><strong>Durations:</strong> 5, 10, 15, 30 min; 1, 2, 6, 12, 24 hr</div>
            <div className="p-2 bg-muted/30 rounded"><strong>Return periods:</strong> 2, 5, 10, 25, 50, 100 years</div>
            <div className="p-2 bg-muted/30 rounded"><strong>Distribution:</strong> Gumbel EV Type I (method of moments)</div>
            <div className="p-2 bg-muted/30 rounded"><strong>Climate scaling:</strong> i_future = i_hist × 1.07^ΔT</div>
          </div>
        </div>
      </SectionCard>

      {/* IDF-Derived Storms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-primary" />
            IDF-Derived Design Storms
          </CardTitle>
          <CardDescription>Hyetograph shapes derived mathematically from IDF curves</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {/* Uniform Storm */}
            <AccordionItem value="uniform">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Uniform Design Storm
                  <Badge variant="outline" className="text-xs">Simplest</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>Constant intensity throughout the storm duration.</p>
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <Eq>i(t) = i_avg = constant for 0 ≤ t ≤ t_d</Eq>
                </div>
                <div className="not-prose grid grid-cols-2 md:grid-cols-3 gap-2 my-3 text-xs">
                  <div className="p-2 bg-muted/30 rounded"><strong>Source:</strong> Direct IDF reading</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Duration:</strong> = Time of concentration (Tc)</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Use:</strong> Rational Method only</div>
                </div>
                <p><strong>Limitation:</strong> Unrealistically low peak intensity; not suitable for hydrograph methods.</p>
              </AccordionContent>
            </AccordionItem>

            {/* Alternating Block (Composite) */}
            <AccordionItem value="alternating-block">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Composite / Alternating Block Method
                  <Badge variant="outline" className="text-xs">Common</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>Builds a stepped hyetograph from multiple IDF readings with peak at center.</p>
                <h4 className="font-semibold text-foreground">Procedure</h4>
                <ol>
                  <li>For duration Δt, read intensity i₁ from IDF → depth P₁ = i₁ × Δt</li>
                  <li>For duration 2Δt, read i₂ → depth P₂ = i₂ × 2Δt; incremental ΔP₂ = P₂ − P₁</li>
                  <li>Continue for 3Δt, 4Δt, etc.</li>
                  <li>Arrange blocks symmetrically around center (peak at center)</li>
                </ol>
                <div className="not-prose grid grid-cols-2 gap-2 my-3 text-xs">
                  <div className="p-2 bg-muted/30 rounded"><strong>Source:</strong> Multiple IDF curve points</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Use:</strong> Common in Ontario practice</div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Chicago Storm */}
            <AccordionItem value="chicago">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Chicago Design Storm (Keifer & Chu, 1957)
                  <Badge className="text-xs">Most Used in Canada</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>The most widely used design storm in Canadian urban drainage practice. MTO-recommended; most common in Ontario.</p>

                <h4 className="font-semibold text-foreground">Instantaneous Intensity Equations</h4>
                <div className="bg-muted/50 p-3 rounded-lg my-3 space-y-2 text-xs font-mono">
                  <p><strong>Before peak (rising):</strong></p>
                  <p>i_b(t_b) = a × [(1−c)(t_b/r + b)^c + c·b] / (t_b/r + b)^(c+1)</p>
                  <p className="mt-2"><strong>After peak (falling):</strong></p>
                  <p>i_a(t_a) = a × [(1−c)(t_a/(1−r) + b)^c + c·b] / (t_a/(1−r) + b)^(c+1)</p>
                </div>

                <div className="not-prose grid grid-cols-2 md:grid-cols-3 gap-2 my-3 text-xs">
                  <ParamBadge label="t_b" value="time before peak" />
                  <ParamBadge label="t_a" value="time after peak" />
                  <ParamBadge label="r" value="advancement coefficient" />
                  <ParamBadge label="a, b, c" value="IDF coefficients" />
                </div>

                <h4 className="font-semibold text-foreground">Advancement Coefficient r Values for Canada</h4>
                <div className="not-prose">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Region</TableHead>
                        <TableHead className="text-xs">r Value</TableHead>
                        <TableHead className="text-xs">Source</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell className="text-xs">Original Chicago</TableCell><TableCell className="text-xs font-mono">0.375</TableCell><TableCell className="text-xs">Keifer & Chu (1957)</TableCell></TableRow>
                      <TableRow><TableCell className="text-xs">Southern Ontario</TableCell><TableCell className="text-xs font-mono">0.35–0.40</TableCell><TableCell className="text-xs">Marsalek & Watt (1984)</TableCell></TableRow>
                      <TableRow><TableCell className="text-xs">General Canadian</TableCell><TableCell className="text-xs font-mono">0.37–0.50</TableCell><TableCell className="text-xs">Varies by region</TableCell></TableRow>
                      <TableRow><TableCell className="text-xs">Montreal/Quebec</TableCell><TableCell className="text-xs font-mono">0.30–0.40</TableCell><TableCell className="text-xs">Regional studies</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>

                <h4 className="font-semibold text-foreground mt-4">Cumulative Depth Equations (Silveira, 2016)</h4>
                <div className="bg-muted/50 p-3 rounded-lg my-3 text-xs font-mono space-y-1">
                  <p>Before: P_b(t_b) = a × t_b / (r × (t_b/r + b)^c)</p>
                  <p>After:  P_a(t_a) = a × t_a / ((1−r) × (t_a/(1−r) + b)^c)</p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Historically-Based Storms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Historically-Based Design Storms
          </CardTitle>
          <CardDescription>Temporal patterns derived from statistical analysis of observed events</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {/* AES Storm */}
            <AccordionItem value="aes">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  AES Design Storm (Hogg, 1980)
                  <Badge className="text-xs">Official ECCC</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>The official Canadian Atmospheric Environment Service storm, based on analysis of ~2000 extreme events across Canada.</p>
                <div className="not-prose grid grid-cols-2 md:grid-cols-3 gap-2 my-3 text-xs">
                  <div className="p-2 bg-muted/30 rounded"><strong>Source:</strong> W.D. Hogg, 1980; Environment Canada AES</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Versions:</strong> 1-hour and 12-hour</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Profiles:</strong> 30%, 50%, 70% probability</div>
                </div>
                <h4 className="font-semibold text-foreground">Key Findings</h4>
                <ul>
                  <li>Temporal distributions vary significantly between coastal and continental regions</li>
                  <li>Up to 25% difference between AES distributions for southern Ontario and Huff's 50%</li>
                  <li>30% profile (1-hr) gives peak flows close to Chicago storm</li>
                  <li>50% profile (12-hr) gives results similar to SCS 24-hr storm</li>
                </ul>
                <h4 className="font-semibold text-foreground">AES 1-Hour Storm (50th Percentile, Southern Ontario)</h4>
                <div className="not-prose overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Time fraction</TableHead>
                        {[0, 0.083, 0.167, 0.250, 0.333, 0.417, 0.500, 0.583, 0.667, 0.750, 0.833, 0.917, 1.0].map(t => (
                          <TableHead key={t} className="text-xs text-center">{t}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="text-xs font-semibold">Cum. %</TableCell>
                        {[0, 6, 17, 35, 55, 70, 80, 87, 92, 95, 97, 99, 100].map((v, i) => (
                          <TableCell key={i} className="text-xs text-center font-mono">{v}</TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Watt et al. */}
            <AccordionItem value="watt">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Watt et al. 1-Hour Urban Design Storm (1986)
                  <Badge variant="secondary" className="text-xs">Canadian Origin</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>The first officially developed Canadian urban design storm, based on 45 AES stations.</p>
                <h4 className="font-semibold text-foreground">Mathematical Model</h4>
                <div className="bg-muted/50 p-3 rounded-lg my-3 text-center">
                  <Eq>P(t)/P_total = (t/t_d)^α × [1 + β × (1 − t/t_d)]</Eq>
                </div>
                <div className="not-prose">
                  <ParamBadge label="α" value="shape parameter" />
                  <ParamBadge label="β" value="peak location parameter" />
                </div>
                <h4 className="font-semibold text-foreground mt-3">Regional Parameter Values</h4>
                <div className="not-prose">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Region</TableHead>
                        <TableHead className="text-xs">α</TableHead>
                        <TableHead className="text-xs">β</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell className="text-xs">Atlantic Canada</TableCell><TableCell className="text-xs font-mono">1.2–1.6</TableCell><TableCell className="text-xs font-mono">0.3–0.5</TableCell></TableRow>
                      <TableRow><TableCell className="text-xs">Southern Ontario</TableCell><TableCell className="text-xs font-mono">1.0–1.4</TableCell><TableCell className="text-xs font-mono">0.4–0.6</TableCell></TableRow>
                      <TableRow><TableCell className="text-xs">Prairies</TableCell><TableCell className="text-xs font-mono">0.8–1.2</TableCell><TableCell className="text-xs font-mono">0.3–0.5</TableCell></TableRow>
                      <TableRow><TableCell className="text-xs">Pacific Coast</TableCell><TableCell className="text-xs font-mono">1.4–1.8</TableCell><TableCell className="text-xs font-mono">0.2–0.4</TableCell></TableRow>
                      <TableRow><TableCell className="text-xs">Northern Canada</TableCell><TableCell className="text-xs font-mono">1.0–1.5</TableCell><TableCell className="text-xs font-mono">0.3–0.5</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* SCS Storms */}
            <AccordionItem value="scs">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  SCS (NRCS) Design Storms (24-hr & 6-hr)
                  <Badge variant="outline" className="text-xs">US Origin, Used in Canada</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>Widely used in Canada despite being a US development. Type II is used in most of Canada.</p>
                <p><strong>Key feature:</strong> 67% of total rainfall falls in the central 2 hours (hours 11–13).</p>
                <div className="not-prose grid grid-cols-2 md:grid-cols-3 gap-2 my-3 text-xs">
                  <div className="p-2 bg-muted/30 rounded"><strong>24-hr:</strong> Center-peaked, nested blocks</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>6-hr:</strong> Shorter variant for medium watersheds</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Types:</strong> I, IA, II, III (Type II for most of Canada)</div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Huff Quartiles */}
            <AccordionItem value="huff">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Huff Quartile Design Storms (1967)
                  <Badge variant="outline" className="text-xs">Probabilistic</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>Probability-based distributions from ~400 observed storms. Used in Alberta, Quebec, and NOAA Atlas 14 approach.</p>
                <h4 className="font-semibold text-foreground">Quartile Classification</h4>
                <ul>
                  <li><strong>1st Quartile:</strong> Peak in first 25% — short storms (&lt;6 hrs)</li>
                  <li><strong>2nd Quartile:</strong> Peak 25–50% — most common (6–12 hr)</li>
                  <li><strong>3rd Quartile:</strong> Peak 50–75% — longer duration (12–24 hr)</li>
                  <li><strong>4th Quartile:</strong> Peak in last 25% — trailing pattern (&gt;24 hr)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Yen & Chow */}
            <AccordionItem value="yen-chow">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Yen & Chow Triangular Storm (1980)
                  <Badge variant="outline" className="text-xs">Statistical</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>Statistically-derived triangular hyetograph from ~7,500 US rainstorms. Referenced in Ontario practice and Visual OTTHYMO.</p>
                <div className="bg-muted/50 p-3 rounded-lg my-3 text-xs font-mono space-y-1">
                  <p>Rising:  i(t) = (i_p / t_p) × t       for 0 ≤ t &lt; t_p</p>
                  <p>Falling: i(t) = i_p − [i_p/(t_d−t_p)] × (t−t_p)  for t_p ≤ t &lt; t_d</p>
                  <p>Peak:    i_p = 2P / t_d</p>
                  <p>Time to peak: t_p = r × t_d</p>
                </div>
                <h4 className="font-semibold text-foreground">Typical r Values</h4>
                <ul>
                  <li>US average: r ≈ 0.35–0.45</li>
                  <li>Summer convective: r ≈ 0.35–0.40 (early peaking)</li>
                  <li>Winter cyclonic: r ≈ 0.45–0.55 (more centered)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Pilgrim & Cordery */}
            <AccordionItem value="pilgrim-cordery">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Pilgrim & Cordery (1975)
                  <Badge variant="outline" className="text-xs">Australian</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>Average variability method from Australian practice, used in Canadian research.</p>
                <h4 className="font-semibold text-foreground">Procedure</h4>
                <ol>
                  <li>Select storms with total depths near the design depth</li>
                  <li>Rank intensity of each time interval (highest = rank 1)</li>
                  <li>Average ranks across all storms for each position</li>
                  <li>Assign design intensities from IDF based on average ranks</li>
                </ol>
              </AccordionContent>
            </AccordionItem>

            {/* Other Methods */}
            <AccordionItem value="other-methods">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Other Referenced Methods
                  <Badge variant="outline" className="text-xs">FSR, Sifalda, Desbordes</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <h4 className="font-semibold text-foreground">FSR Design Storm (UK, 1975)</h4>
                <p>British symmetric bell-shaped profile: 75% of depth in the central third of duration. Rarely used directly in Canada.</p>

                <h4 className="font-semibold text-foreground mt-3">Sifalda Trapezoidal Storm (1973)</h4>
                <p>German/European trapezoidal shape with flat top and sloped sides. Referenced in comparisons.</p>

                <h4 className="font-semibold text-foreground mt-3">Desbordes (French) Storm (1978)</h4>
                <p>Double-triangular profile. A Quebec study (Peyron et al., 2002) found the AES and Desbordes (30-min peak) were the most accurate among seven tested storms for peak flow estimation in southern Quebec.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Ontario Historic Storms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Ontario-Specific Historic Design Storms
          </CardTitle>
          <CardDescription>Regulatory storms for Ontario floodplain management</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="hazel">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Hurricane Hazel (1954) — Regional Storm for Southern Ontario
                  <Badge variant="destructive" className="text-xs">Regulatory</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>The defining flood event for Ontario floodplain management. October 15–16, 1954.</p>
                <div className="not-prose grid grid-cols-2 md:grid-cols-3 gap-2 my-3 text-xs">
                  <div className="p-2 bg-muted/30 rounded"><strong>Type:</strong> Extratropical cyclone (former Cat 4 hurricane)</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Duration:</strong> ~12 hours intense period</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Depth:</strong> 214–285 mm</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Malton:</strong> 107 mm / 12 hr; 137 mm / 24 hr</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Snelgrove:</strong> 214 mm total</div>
                  <div className="p-2 bg-muted/30 rounded"><strong>Pre-storm:</strong> 16 days above-normal rain</div>
                </div>
                <h4 className="font-semibold text-foreground">Regulatory Significance</h4>
                <ul>
                  <li>Ontario MNR uses Hazel as the "Regional Storm" for defining the Regulatory Flood in the GTA</li>
                  <li>All new development in the GTA floodplain must pass the Hazel flood</li>
                  <li>TRCA was created as a direct result of this event</li>
                  <li>For design, the Hazel pattern is transposed over the watershed with location adjustments</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="timmins">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  Timmins Storm (1961) — Northern Ontario
                  <Badge variant="outline" className="text-xs">Regional</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                <p>August 31 – September 1, 1961. ~200 mm in 18 hours. Used as design storm for Ontario northern regions.</p>
                <p>Reference: CIR-3746, TEC-428, Meteorological Branch.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Climate Change */}
      <SectionCard title="Climate Change Adaptation" icon={Thermometer} description="Future-proofing Canadian infrastructure design">
        <h4 className="font-semibold text-foreground">Temperature Scaling Method (IDF_CC)</h4>
        <div className="bg-muted/50 p-4 rounded-lg my-3 text-center">
          <Eq>i_future = i_historical × 1.07^ΔT</Eq>
        </div>
        <div className="not-prose">
          <ParamBadge label="ΔT" value="projected temperature increase (°C)" />
          <ParamBadge label="1.07" value="Clausius-Clapeyron scaling (~7%/°C)" />
        </div>
        <p className="mt-3">
          <strong>IDF_CC Tool</strong> (Western University): Covers 896 ECCC stations, supports CMIP5/CMIP6, 
          RCP 2.6/4.5/8.5 scenarios. Available at idf-cc-uwo.ca.
        </p>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mt-3 text-xs">
          <strong>Example:</strong> 10-year, 1-hour intensity of 25 mm/hr with +3°C warming (RCP 8.5): 
          25 × 1.07³ = 30.6 mm/hr (+22.5%)
        </div>
        <h4 className="font-semibold text-foreground mt-4">CSA W231:25 / PLUS 4013 (2010)</h4>
        <p>Canadian Standards Association technical guidance on development, interpretation and use of IDF information, including climate change considerations.</p>
      </SectionCard>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Design Storm Comparison Summary
          </CardTitle>
          <CardDescription>All major design storm methods compared</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Storm</TableHead>
                <TableHead className="text-xs">Origin</TableHead>
                <TableHead className="text-xs">Duration</TableHead>
                <TableHead className="text-xs">Peak Position</TableHead>
                <TableHead className="text-xs">IDF?</TableHead>
                <TableHead className="text-xs">Best For</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ['Uniform', 'IDF', '= Tc', 'Flat', 'Yes', 'Rational Method only'],
                ['Alternating Block', 'IDF curve', 'User', 'Center', 'Yes', 'General design'],
                ['Chicago (Keifer-Chu)', 'USA/CAN 1957', 'User', 'r × td', 'Yes', 'Ontario urban drainage'],
                ['AES (Hogg)', 'Canada 1980', '1 hr, 12 hr', 'Early', 'No', 'Official ECCC design'],
                ['Watt et al.', 'Canada 1986', '1 hr', 'Early', 'Hybrid', 'Canadian urban drainage'],
                ['SCS Type II', 'USA 1972', '24 hr', 'Center (hr 12)', 'No', 'Large watersheds'],
                ['SCS 6-hour', 'USA', '6 hr', 'Center', 'No', 'Medium watersheds'],
                ['Huff Quartiles', 'USA 1967', 'Variable', 'Quartile-dep.', 'No', 'Probabilistic analysis'],
                ['Yen & Chow', 'USA 1980', 'Iterative', 'r × td', 'No', 'Small drainage'],
                ['Pilgrim & Cordery', 'Australia 1975', 'User', 'Avg ranking', 'No', 'Research'],
                ['Desbordes', 'France 1978', 'Variable', '30 min peak', 'No', 'Quebec studies'],
                ['Hurricane Hazel', 'Ontario 1954', '24 hr', 'Hrs 10–12', 'No', 'Ontario regulatory'],
                ['Timmins Storm', 'Ontario 1961', '18 hr', 'Variable', 'No', 'Northern Ontario'],
              ].map(([storm, origin, dur, peak, idf, use], i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs font-semibold">{storm}</TableCell>
                  <TableCell className="text-xs">{origin}</TableCell>
                  <TableCell className="text-xs">{dur}</TableCell>
                  <TableCell className="text-xs">{peak}</TableCell>
                  <TableCell className="text-xs">{idf}</TableCell>
                  <TableCell className="text-xs">{use}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Key References
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>Keifer, C.J. & Chu, H.H. (1957). Synthetic storm pattern for drainage design. <em>ASCE J. Hydraul. Div.</em>, 83(HY4).</p>
          <p>Huff, F.A. (1967). Time distribution of rainfall in heavy storms. <em>Water Resources Research</em>, 3, 1007-1019.</p>
          <p>Hogg, W.D. (1980). Time distribution of short duration rainfall in Canada. <em>Proc. Canadian Hydrology Symposium</em>, Ottawa.</p>
          <p>Yen, B.C. & Chow, V.T. (1980). Design hyetographs for small drainage structures. <em>ASCE J. Hydraul. Div.</em>, 106(HY6).</p>
          <p>Marsalek, J. & Watt, W.E. (1984). Design storms for urban drainage design. <em>Canadian J. Civil Eng.</em>, 11(3), 574-584.</p>
          <p>Watt, W.E. et al. (1986). A 1-hour urban design storm for Canada. <em>Canadian J. Civil Eng.</em>, 13(3), 293-300.</p>
          <p>Huff, F.A. & Angel, J.R. (1989). Frequency distributions of heavy rainstorms in Illinois. <em>ISWS Circular 172</em>.</p>
          <p>Peyron, N. et al. (2002). Optimal design storm pattern for urban runoff estimation in southern Quebec.</p>
          <p>Marsalek, J. (2007). Critical review of the evolution of the design storm event concept. <em>Canadian J. Civil Eng.</em></p>
          <p>CSA PLUS 4013 (2010). Technical guide: Development, interpretation and use of rainfall IDF information.</p>
          <p>Silveira, A.L.L. (2016). Cumulative equations for continuous time Chicago hyetograph method. <em>RBRH</em>, 21(3).</p>
          <p>Saaremäe, E. et al. (2025). The importance of design storm hyetograph on urban flood risk management. <em>J. Flood Risk Management</em>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
