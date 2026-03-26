# World Rainfall Pattern Painter – Handover Document

**Version**: March 2026  
**Live URL**: https://rain-canvas-studio.lovable.app  
**API Documentation**: https://rain-canvas-studio.lovable.app/API.md

---

## 1. Overview

**World Rainfall Pattern Painter** is a web application for generating, visualizing, comparing, and exporting synthetic rainfall hyetographs used in stormwater modeling worldwide. It targets hydrologists, civil engineers, and urban planners who need design storm distributions for software like EPA SWMM5, HEC-HMS, InfoWorks ICM, InfoDrainage, PCSWMM, XP-SWMM, and HydroCAD.

The app is primarily client-side with three serverless backend functions for the public API, AI chatbot, and NOAA IDF proxy.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui (Radix primitives) |
| Charts | Recharts |
| Math rendering | KaTeX |
| PDF export | jsPDF |
| Screenshot/GIF | html2canvas, gif.js |
| Routing | react-router-dom v6 |
| State | React hooks + URL search params (no global store) |
| Theme | next-themes (class-based dark mode) |
| Backend | Lovable Cloud (Supabase Edge Functions) |
| Maps | react-simple-maps |
| Testing | Vitest |

---

## 3. Architecture

### 3.1 Frontend (Single-Page App)

One main route (`/`) with a 5-tab layout:

| Tab | Component | Purpose |
|-----|-----------|---------|
| **Storm Generator** | `StormWizard` | 3-step workflow: Parameters → Pattern → Export |
| **Real Data Hub** | `RealDataHub` | Import/parse observed rainfall files |
| **Advanced Tools** | `AdvancedTools` | 12+ engineering calculators |
| **API Playground** | `ApiPlayground` | Interactive REST API tester |
| **Documentation** | `Documentation` | Methodology, glossary, references |

### 3.2 Backend (Edge Functions)

Three serverless functions deployed automatically via Lovable Cloud:

| Function | Path | Purpose |
|----------|------|---------|
| `storm-api` | `/functions/v1/storm-api` | Public REST API (generate hyetographs, list patterns, analyze data) |
| `storm-chat` | `/functions/v1/storm-chat` | AI chatbot for hydrology Q&A (uses Lovable AI gateway) |
| `noaa-idf-proxy` | `/functions/v1/noaa-idf-proxy` | CORS proxy for NOAA Atlas 14 PFDS lookups |

### 3.3 No Database

The application has **no database tables**. All computation is stateless. User preferences (unit system) persist via `localStorage`. The Supabase project exists solely to host the edge functions.

---

## 4. Project Structure

```
src/
├── pages/
│   ├── Index.tsx              # Main page – 5-tab layout, hero section, pattern badges
│   └── NotFound.tsx
│
├── components/
│   ├── StormWizard.tsx        # 3-step wizard (Parameters → Pattern → Export)
│   ├── StormParameters.tsx    # Depth, duration, timestep, unit system inputs
│   ├── PatternSelector.tsx    # Grid of 250+ rainfall patterns (12 categories)
│   ├── RainfallChart.tsx      # Recharts bar chart for hyetograph visualization
│   ├── ExportButtons.tsx      # CSV, JSON, TXT, PDF, clipboard export
│   ├── HecHmsExportPanel.tsx  # HEC-HMS export support
│   ├── SwmmFileIntegration.tsx # SWMM5 .inp file read/write/batch
│   ├── CustomPatternEditor.tsx # Draw-your-own pattern via interactive chart
│   │
│   │  # Hero & Visual
│   ├── HeroHyetograph.tsx     # Animated hero chart preview
│   ├── HeroGifExport.tsx      # GIF export of hero animation
│   ├── RainParticles.tsx      # Animated rain particle effect in header
│   ├── ThemeToggle.tsx        # Dark/light mode toggle
│   │
│   │  # Pattern Analysis
│   ├── PatternComparison.tsx       # Side-by-side overlay of distributions
│   ├── PatternDerivationEngine.tsx # Derive patterns from observed data
│   ├── PatternEquationDisplay.tsx  # LaTeX equations per pattern
│   ├── PatternDecisionGuide.tsx    # Decision tree for pattern selection
│   ├── PatternSectionSearch.tsx    # Search/filter patterns
│   ├── InteractiveEquationExplorer.tsx # Slider-driven real-time computation
│   ├── NumericalPatternTable.tsx   # Tabular pattern data
│   ├── SensitivityTable.tsx        # Parameter sensitivity analysis
│   │
│   │  # IDF & Regional
│   ├── IdfLookup.tsx               # NOAA Atlas 14 manual IDF entry
│   ├── IdfComparison.tsx           # Compare storm vs IDF curves
│   ├── IdfGuidedSelector.tsx       # Region-based IDF parameter selection
│   ├── WorldMapSelector.tsx        # Interactive world map for region selection
│   ├── CanadaIdfCalculator.tsx     # Canadian IDF lookup
│   ├── ChinaRainstormCalculator.tsx # China GB 50014 calculator
│   ├── ChinaCityComparison.tsx     # China regional comparison
│   ├── DubaiDdfLookup.tsx          # Dubai DM depth-duration-frequency
│   ├── ScsRegionalGuide.tsx        # SCS pattern selection guide
│   │
│   │  # Advanced Calculators
│   ├── CurveNumberCalculator.tsx        # SCS CN composite calculation
│   ├── RunoffCalculator.tsx             # SCS runoff volume
│   ├── RationalMethodCalculator.tsx     # Rational method peak Q
│   ├── UnitHydrographCalculator.tsx     # NRCS unit hydrograph
│   ├── DetentionPondCalculator.tsx      # Detention pond sizing
│   ├── ModifiedPulsRouting.tsx          # Level-pool routing
│   ├── OutletStructureCalculator.tsx    # Orifice/weir discharge
│   ├── StageStorageDischarge.tsx        # Stage-storage-outflow curves
│   ├── PrePostDevelopmentComparison.tsx # Pre/post development analysis
│   ├── LIDCalculator.tsx               # Low-impact development BMPs
│   ├── TreatmentTrainCalculator.tsx     # Sequential BMP pollutant removal
│   ├── TcCalculator.tsx                # Time of concentration (3 methods)
│   ├── UnitConversionCalculator.tsx     # USA ↔ SI conversion
│   │
│   │  # Data Import/Export
│   ├── RealDataHub.tsx          # Tab: import observed rainfall
│   ├── RealDataImporter.tsx     # Parse CSV/GAGE/DAT files
│   ├── EventHyetograph.tsx      # Visualize imported events
│   ├── HistoricalStormMatching.tsx   # Match observed to synthetic
│   ├── HistoricalStormReplay.tsx     # Replay historical storms
│   ├── StormEventLibrary.tsx    # Curated storm event database
│   ├── TimeseriesEditor.tsx     # Manual timeseries editing
│   ├── AnimationExport.tsx      # GIF export of animations
│   ├── PdfReportGenerator.tsx   # Full PDF report generation
│   ├── AllPatternsReportPdf.tsx # All-patterns comparison PDF
│   │
│   │  # API & AI
│   ├── ApiPlayground.tsx        # Interactive API tester with visualization
│   ├── StormChatbot.tsx         # AI hydrology assistant (floating widget)
│   ├── ParametricStormEngine.tsx # Parametric storm generation
│   ├── ValidationFeedback.tsx   # Input validation display
│   │
│   │  # Documentation subcomponents
│   ├── docs/
│   │   ├── ComparisonMatrix.tsx
│   │   ├── EquationFamilyRegistry.tsx
│   │   ├── PatternCoverageMap.tsx
│   │   ├── PatternDecisionFlowchart.tsx
│   │   ├── PatternReferenceCard.tsx
│   │   ├── PatternReferenceList.tsx
│   │   ├── PatternSearchTable.tsx
│   │   ├── RegionComparisonChart.tsx
│   │   ├── RegulatoryMatrix.tsx
│   │   ├── SavedFilters.tsx
│   │   ├── TaxonomyTree.tsx
│   │   ├── patternReferenceData.ts
│   │   └── taxonomyData.ts
│   │
│   └── ui/                      # shadcn/ui primitives (auto-generated, do not edit)
│
├── lib/
│   ├── rainfallPatterns.ts      # Core: 250+ pattern generators (4,154 lines)
│   ├── patternEquations.ts      # LaTeX strings & metadata per pattern
│   ├── patternStatistics.ts     # Statistical analysis of distributions
│   ├── rainfallParsers.ts       # CSV/GAGE/DAT file parsers
│   ├── stormAnalysis.ts         # Peak intensity, volume, centroid calcs
│   ├── stormEventExtractor.ts   # Extract events from continuous data
│   ├── stormValidation.ts       # Input validation rules
│   ├── unitConversions.ts       # USA ↔ SI unit helpers
│   ├── hecHmsExport.ts          # HEC-HMS export formatting
│   ├── markdownExport.ts        # Markdown report generation
│   ├── equationsMarkdownExport.ts # Equation documentation export
│   ├── canadaIdfData.ts         # Canadian IDF lookup tables
│   ├── chinaRainstormData.ts    # China design storm parameters
│   ├── countryRegionMapping.ts  # Country-to-region mappings
│   ├── zipLookup.ts             # US ZIP code lookup
│   └── utils.ts                 # Tailwind cn() helper
│
├── hooks/
│   ├── use-mobile.tsx           # Mobile breakpoint detection
│   ├── use-toast.ts             # Toast notification hook
│   └── useStormApi.ts           # API client hook
│
├── integrations/supabase/
│   ├── client.ts                # Supabase client (auto-generated)
│   └── types.ts                 # Database types (auto-generated, empty schema)
│
├── index.css                    # Tailwind config + CSS custom properties (design system)
├── App.tsx                      # Router + providers setup
└── main.tsx                     # Entry point

public/
├── API.md                       # Public API documentation (downloadable)
├── og-image.png                 # Social sharing preview image (1200×630)
├── favicon.ico
├── robots.txt
└── sample-data/
    ├── sample-hec.gage          # HEC-DSS gauge format sample
    ├── sample-noaa.dat          # NOAA precipitation data sample
    ├── sample-rainfall.csv      # Generic CSV timeseries sample
    ├── sample-month.csv         # Monthly data sample
    └── sample-swmm.inp          # EPA SWMM5 input file sample

supabase/
├── config.toml                  # Supabase project configuration (auto-managed)
└── functions/
    ├── storm-api/index.ts       # Public REST API (265 patterns)
    ├── storm-chat/index.ts      # AI chatbot edge function
    └── noaa-idf-proxy/index.ts  # NOAA PFDS CORS proxy
```

---

## 5. Rainfall Patterns

The application supports **250+ design storm patterns** organized into 12 categories:

| Category | Example Patterns |
|----------|-----------------|
| **SWMM/Universal** | Block, SCS Types I/IA/II/III, Chicago, Balanced, Triangular, Trapezoidal |
| **US Agency** | FDOT Zones 1–5, TxDOT, NOAA Atlas 14/15/16, UDFCD Denver, USACE SPS, NYC DEP, Harris County FCD, Clark County NV |
| **European** | DWA A-118, ATV A-121, Euler I/II, KOSTRA-DWD, FSR, FEH22/ReFH2, Danish SVK, SHYREG, Belgium IRM/Willems, CEDEX |
| **Scandinavian** | Arnell (Sweden), SMHI, Norwegian NVE, Finnish FMI |
| **Asian** | Japan AMeDAS/Baiu/Typhoon/JMA, China GB 50014/PRD, Korea KMA/MOLIT, HK DSD, Taiwan CWA, Singapore PUB, Malaysia MSMA/HP1, India IMD, Bangladesh BMD |
| **Middle East** | Dubai Municipality/DM Combined, Abu Dhabi ADM, UAE NCMS, Saudi PME, Qatar Kahramaa, Oman DGMAN, Kuwait MEW, Bahrain MET, Iran IRIMO, Iraq MoS |
| **African** | South Africa SANRAL/SCS Types 1–4/WRC/Huff, Kenya KMD, Nigeria NiMet, Ethiopia NMA, Ghana GMet, Morocco DMN, Egypt HCWW, Algeria ANRH, West Africa CIEH/CILSS |
| **Latin American** | Brazil ANA, Mexico CONAGUA, Colombia IDEAM, Chile DGA, Argentina SMN, Peru SENAMHI, Ecuador INAMHI, Venezuela INAMEH, Costa Rica IMN, Bogotá EAAB |
| **Oceania** | ARR 2019 Ensemble, ARR87 Legacy, HIRDS NZ, NZ NIWA, Auckland TP108, Wellington, Christchurch, Fiji FMS, Pacific SPREP |
| **Americas** | Canadian CDA, AES 30%/40%, CSA W231, ECCC IDF, Puerto Rico, OECS Caribbean, Barbados BMS |
| **Statistical** | Huff Quartiles 1–4, Beta Distribution, G2P Gamma, Bartlett-Lewis, Neyman-Scott, Weibull, LogNormal, Fourier Multipeak |
| **Extreme/Special** | PMP (HMR 51/52), PMP WMO, Atmospheric River, Tropical Cyclone, Monsoon Burst, Derecho, Supercell, MCS Storm, Post-Wildfire, Rain on Snow, Clausius-Clapeyron scaled |

---

## 6. Core Data Flow

```
User Input (depth, duration, timeStep, pattern, unitSystem)
  → rainfallPatterns.ts :: generateRainfallData()
  → returns number[] of fractional cumulative values
  → differencing → intensity per interval
  → prepareChartData() → RainfallChart (Recharts)
  → prepareExportData() → ExportButtons / SwmmFileIntegration / HecHmsExport
```

### Pattern Generator Interface

Each pattern is a function `(steps: number) => number[]` returning an array of cumulative fractions (0 to 1). The framework scales these by total depth and time step to produce intensities.

---

## 7. Public REST API

**Base URL**: `https://psbaxqgkhunxkdrecknh.supabase.co/functions/v1/storm-api`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/patterns` | GET | List all 265 API-available patterns |
| `/generate` | POST | Generate hyetograph (pattern, depth, duration, timestep) |
| `/analyze` | POST | Compute storm statistics from raw timeseries |

No authentication required. Full documentation at `/API.md`.

---

## 8. AI Chatbot

The `StormChatbot` component provides a floating AI assistant that:
- Answers hydrology and stormwater questions
- Is context-aware of the current storm configuration
- Uses the Lovable AI gateway (no API key needed)
- Has input sanitization for prompt injection prevention (600-char limit, allowlisted characters)

---

## 9. Advanced Engineering Calculators

### Calculator Chain

```
CurveNumberCalculator ──→ RunoffCalculator ──→ DetentionPondCalculator
                                                        │
UnitHydrographCalculator ──→ ModifiedPulsRouting ←── StageStorageDischarge
                                                        ↑
                                        OutletStructureCalculator

LIDCalculator ──→ TreatmentTrainCalculator

PrePostDevelopmentComparison (standalone)
TcCalculator (standalone, 3 methods: Kirpich, FAA, TR-55)
RationalMethodCalculator (standalone)
UnitConversionCalculator (standalone)
```

### Key Formulas

| Calculator | Core Formula |
|-----------|-------------|
| **SCS Runoff** | `Q = (P − 0.2S)² / (P − 0.2S + S)`, `S = 1000/CN − 10` |
| **Rational Method** | `Q = CiA` (cfs) |
| **Unit Hydrograph** | `Qp = 484 × A × Q / Tp` (NRCS dimensionless) |
| **Modified Puls** | `(2S₂/Δt + O₂) = (2S₁/Δt − O₁) + I₁ + I₂` |
| **Orifice** | `Q = Cd × A × √(2gH)` |
| **Weir** | `Q = Cw × L × H^1.5` |
| **Detention** | `V = (Q_post − Q_pre) × A × SF` |

---

## 10. Export Formats

| Format | Target Software | Component |
|--------|----------------|-----------|
| SWMM5 Time Series | EPA SWMM5, PCSWMM, XP-SWMM | `SwmmFileIntegration` |
| ICM Event | InfoWorks ICM | `SwmmFileIntegration` |
| HEC-HMS .gage | HEC-HMS | `HecHmsExportPanel` |
| Full SWMM .inp | EPA SWMM5 | `SwmmFileIntegration` |
| CSV | Universal | `ExportButtons` |
| JSON | Programmatic | `ExportButtons` |
| TXT (tabular) | Any | `ExportButtons` |
| PDF Report | Documentation | `PdfReportGenerator` |
| Clipboard | Quick paste | `ExportButtons` |
| GIF Animation | Presentations | `AnimationExport` |

---

## 11. Design System

### CSS Custom Properties (index.css)

All colors use HSL values. Key tokens:

| Token | Light | Dark |
|-------|-------|------|
| `--background` | `210 40% 98%` | `222 47% 11%` |
| `--primary` | `204 70% 53%` | `204 70% 53%` |
| `--secondary` | `146 65% 58%` | `146 65% 58%` |
| `--gradient-rain` | Blue gradient for header | Same |
| `--shadow-card` | Subtle card shadow | Adapted |

### Theme

- Dark mode default via `next-themes` with `attribute="class"`
- `ThemeToggle` component in header for manual switching
- All components use semantic Tailwind tokens (`bg-background`, `text-foreground`, etc.)

---

## 12. Testing

### Unit Tests

Located in `src/lib/__tests__/`:

| Test File | What It Tests |
|-----------|--------------|
| `batchExportCount.test.ts` | Batch SWMM export pattern count |
| `dubaiDmCombined.test.ts` | Dubai DM combined pattern generation |
| `japanTyphoonVolume.test.ts` | Japan typhoon pattern volume conservation |
| `saScsVolume.test.ts` | South African SCS pattern volumes |
| `volumeConservation.test.ts` | General volume conservation across patterns |

Run: `npx vitest` or `npm test`

---

## 13. Sample Data Files

Located in `public/sample-data/`:

| File | Format | Purpose |
|------|--------|---------|
| `sample-hec.gage` | HEC-DSS gauge | HEC-HMS import testing |
| `sample-noaa.dat` | NOAA tabular | NOAA data import testing |
| `sample-rainfall.csv` | CSV timeseries | Generic import testing |
| `sample-month.csv` | Monthly CSV | Monthly aggregation testing |
| `sample-swmm.inp` | SWMM5 .inp | SWMM import/repair testing |

---

## 14. localStorage Keys

| Key | Values | Purpose |
|-----|--------|---------|
| `preferredUnitSystem` | `"USA"` / `"SI"` | Persists unit toggle selection |

---

## 15. URL Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `storm` | Shared storm configuration (base64 encoded) | `?storm=eyJ...` |

The `decodeStormParams` function in `StormWizard` decodes shared configurations and pre-populates the wizard.

---

## 16. SEO & Social Sharing

- **OG Image**: `public/og-image.png` (1200×630)
- **Meta tags**: Title, description, OG, Twitter Card configured in `index.html`
- **Canonical URL**: `https://rain-canvas-studio.lovable.app`
- Single H1 tag, semantic HTML structure

---

## 17. Dependencies of Note

| Package | Purpose | Notes |
|---------|---------|-------|
| `katex` | LaTeX math rendering | CSS imported in components using it |
| `gif.js` | Web Worker-based GIF encoder | May need worker file serving config |
| `jspdf` | Client-side PDF generation | |
| `html2canvas` | DOM-to-canvas screenshots | |
| `recharts` | All chart rendering | |
| `react-simple-maps` | World map for region selection | |
| `@supabase/supabase-js` | Edge function client | Only for API/chat calls |

---

## 18. Development

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build    # outputs to dist/

# Run tests
npx vitest

# Lint
npm run lint
```

### Environment Variables (auto-managed)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL (edge function base) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier |

These are auto-configured by Lovable Cloud. Do not edit `.env` manually.

---

## 19. Known Considerations

1. **`rainfallPatterns.ts` (4,154 lines)** is the largest file — contains all 250+ pattern generator functions. Consider splitting by region if extending further.
2. **`PatternSelector.tsx` (1,550 lines)** contains all pattern metadata — could be split into a data file.
3. **Storm API** only exposes 65 patterns (the original core set). The full 250+ are available client-side only.
4. **No authentication** — the app is fully public with no user accounts.
5. **No database** — all state is ephemeral or in localStorage.
6. Pattern equations in `patternEquations.ts` use raw LaTeX strings consumed by KaTeX.
7. The Chicago Storm pattern uses hardcoded IDF coefficients (a, b, c) as defaults.
8. The `components.json` file configures shadcn/ui CLI for adding new Radix primitives.

---

## 20. Deployment

- **Frontend**: Deployed via Lovable publish. Click "Update" in the publish dialog to push changes.
- **Backend (Edge Functions)**: Deploy automatically on code changes — no manual action needed.
- **Custom domain**: Can be connected via Project Settings → Domains.

---

## 21. File Restrictions

These files are auto-generated and must **never** be edited manually:

- `supabase/config.toml`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `.env`
- `bun.lock` / `bun.lockb` / `package-lock.json`
