# Rainfall Pattern Painter – Handover Document

## Overview

**Rainfall Pattern Painter** is a client-side web application for generating, visualizing, and exporting synthetic rainfall patterns used in stormwater modeling. It targets hydrologists and civil engineers who need design storm hyetographs for tools like EPA SWMM5 and Innovyze ICM.

**Live URL**: https://rain-canvas-studio.lovable.app  
**No backend or database** – everything runs in the browser with localStorage for preferences.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Charts | Recharts |
| Math rendering | KaTeX |
| PDF export | jsPDF |
| Screenshot/GIF | html2canvas, gif.js |
| Routing | react-router-dom v6 |

## Project Structure

```
src/
├── pages/
│   ├── Index.tsx              # Main page with 4-tab layout
│   └── NotFound.tsx
├── components/
│   ├── StormWizard.tsx        # 3-step wizard (Parameters → Pattern → Export)
│   ├── StormParameters.tsx    # Depth, duration, timestep, unit system inputs
│   ├── PatternSelector.tsx    # Grid of 22 rainfall patterns
│   ├── RainfallChart.tsx      # Recharts bar chart for hyetograph
│   ├── ExportButtons.tsx      # CSV, JSON, TXT, PDF, clipboard export
│   ├── SwmmFileIntegration.tsx # SWMM5 .inp file read/write
│   ├── CustomPatternEditor.tsx # Draw-your-own pattern via interactive chart
│   ├── IdfComparison.tsx      # Compare storm vs IDF curves
│   ├── IdfGuidedSelector.tsx  # IDF-based storm parameter selection
│   ├── InteractiveEquationExplorer.tsx # Real-time equation calculator
│   ├── PatternEquationDisplay.tsx      # LaTeX equations per pattern
│   ├── AdvancedTools.tsx      # Tab: comparisons, unit hydro, routing, etc.
│   ├── Documentation.tsx      # Tab: methodology, glossary, examples
│   ├── RealDataHub.tsx        # Tab: import observed rainfall data
│   ├── RealDataImporter.tsx   # Parse CSV/GAGE/DAT files
│   │
│   │  # Advanced calculators
│   ├── CurveNumberCalculator.tsx
│   ├── DetentionPondCalculator.tsx
│   ├── LIDCalculator.tsx
│   ├── ModifiedPulsRouting.tsx
│   ├── OutletStructureCalculator.tsx
│   ├── PrePostDevelopmentComparison.tsx
│   ├── RationalMethodCalculator.tsx
│   ├── RunoffCalculator.tsx
│   ├── StageStorageDischarge.tsx
│   ├── TcCalculator.tsx
│   ├── TreatmentTrainCalculator.tsx
│   ├── UnitHydrographCalculator.tsx
│   ├── UnitConversionCalculator.tsx
│   │
│   │  # Supporting UI
│   ├── AnimationExport.tsx
│   ├── NumericalPatternTable.tsx
│   ├── PatternComparison.tsx
│   ├── PatternDerivationEngine.tsx
│   ├── ScsRegionalGuide.tsx
│   ├── StormEventLibrary.tsx
│   ├── TimeseriesEditor.tsx
│   ├── UnitComparisonTable.tsx
│   ├── ValidationFeedback.tsx
│   └── ui/                    # shadcn/ui primitives (do not edit)
│
├── lib/
│   ├── rainfallPatterns.ts    # Core: 22 pattern generators + chart/export helpers
│   ├── patternEquations.ts    # LaTeX strings & metadata per pattern
│   ├── patternStatistics.ts   # Statistical analysis of distributions
│   ├── rainfallParsers.ts     # CSV/GAGE/DAT file parsers
│   ├── stormAnalysis.ts       # Peak intensity, volume, centroid calcs
│   ├── stormValidation.ts     # Input validation rules
│   ├── unitConversions.ts     # USA ↔ SI unit helpers
│   └── utils.ts               # Tailwind cn() helper
│
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── index.css                  # Tailwind config + CSS custom properties
├── App.tsx                    # Router setup
└── main.tsx                   # Entry point
```

## Supported Rainfall Patterns (22)

| Category | Patterns |
|----------|----------|
| SCS/NRCS | Type IA, I, II, III |
| Huff Quartiles | 1st, 2nd, 3rd, 4th |
| Synthetic | Chicago, Block, Triangular, Trapezoidal, Double Peak |
| International | Desbordes (France), ARR (Australia), DWA (Germany), FSR (UK), JMA (Japan), China, South African Huff, Dutch, Italian |
| Custom | User-drawn via interactive editor |

## Key Features

1. **3-Step Storm Wizard** – Parameters → Pattern → Review/Export
2. **IDF-Guided Selection** – Derive depth/duration from IDF curves
3. **22 Built-in Patterns** – With LaTeX equations and methodology citations
4. **Interactive Equation Explorer** – Slider-driven real-time computation of F(t), i(t), P(t)
5. **Custom Pattern Editor** – Draw distributions interactively
6. **Multi-format Export** – CSV, JSON, TXT, PDF, SWMM5 .inp
7. **SWMM File Integration** – Read/inject patterns into existing .inp files
8. **Real Data Import** – Parse HEC .gage, NOAA .dat, generic .csv
9. **Advanced Calculators** – Rational method, curve number, unit hydrograph, detention pond, modified Puls routing, LID, treatment trains, stage-storage-discharge
10. **Unit System Toggle** – USA (in, in/hr) ↔ SI (mm, mm/hr) with localStorage persistence
11. **Pattern Comparison** – Side-by-side overlay of multiple distributions
12. **Animation Export** – GIF export of progressive rainfall accumulation
13. **Comprehensive Documentation** – Methodology, glossary, worked examples

## Design System

- **CSS Variables**: Defined in `src/index.css` using HSL format
- **Tailwind Config**: Extended in `tailwind.config.ts` with semantic tokens
- **Theme**: Custom gradient `bg-gradient-rain` for header; card shadows via `shadow-card`
- **Dark mode**: Supported via `next-themes` (class-based)
- **Components**: All from shadcn/ui – do not edit files in `src/components/ui/`

## Data Flow

```
User Input (depth, duration, timeStep, pattern)
  → rainfallPatterns.ts::generateRainfallData()
  → returns number[] of intensities
  → prepareChartData() → RainfallChart (Recharts)
  → prepareExportData() → ExportButtons / SwmmFileIntegration
```

## Sample Data Files

Located in `public/sample-data/`:
- `sample-hec.gage` – HEC-DSS gauge format
- `sample-noaa.dat` – NOAA precipitation data
- `sample-rainfall.csv` – Generic CSV timeseries
- `sample-swmm.inp` – EPA SWMM5 input file

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `preferredUnitSystem` | `"USA"` or `"SI"` – persists unit toggle |

## Advanced Calculators – Formulas & I/O Specifications

### 1. Time of Concentration (`TcCalculator.tsx`)

Three methods, all outputting Tc in **minutes**:

| Method | Formula | Inputs |
|--------|---------|--------|
| **Kirpich** | `Tc = 0.0078 × L^0.77 × S^(−0.385)` | L = flow length (ft), S = slope (%, converted to ft/ft) |
| **FAA** | `Tc = 1.8 × (1.1 − C) × √L / S^(1/3)` | C = runoff coeff, L = flow length (ft), S = slope (%, converted to ft/ft) |
| **TR-55** | Sum of sheet flow + shallow concentrated + channel flow travel times | Sheet: n, L (≤100 ft), P₂ (in), S; Shallow: L, S, surface type; Channel: L, S, A, WP, n |

**Outputs**: Tc (min), intermediate travel times per segment.

---

### 2. SCS Curve Number (`CurveNumberCalculator.tsx`)

**Purpose**: Area-weighted composite CN from multiple land uses.

- **Inputs**: Land use category + HSG (A/B/C/D) + area (acres) — multiple rows
- **Lookup table**: 31 land-use categories with CN values per HSG (from TR-55 Table 2-2a)
- **Formula**: `CN_composite = Σ(CN_i × A_i) / Σ(A_i)`
- **Outputs**: Composite CN, total area, per-row CN values

---

### 3. SCS Runoff Volume (`RunoffCalculator.tsx`)

| Variable | Formula |
|----------|---------|
| Potential retention | US: `S = (1000/CN) − 10`; SI: `S = (25400/CN) − 254` |
| Initial abstraction | `Ia = λ × S` (λ = 0.2 or 0.05) |
| Runoff depth | `Q = (P − Ia)² / (P − Ia + S)` when P > Ia, else 0 |
| Runoff volume | `V = Q × A` (acre-in or ha-mm) |

- **Inputs**: CN, rainfall depth (in/mm), area (acres/ha), Ia ratio (0.2 or 0.05), unit system
- **Outputs**: S, Ia, Q (depth), V (volume), runoff ratio
- **Linkable**: Accepts CN from CurveNumberCalculator, exports runoff depth to DetentionPondCalculator

---

### 4. Rational Method (`RationalMethodCalculator.tsx`)

**Formula**: `Q = C × i × A` (Q in cfs when i in in/hr and A in acres)

- **Inputs**: Runoff coefficient C (0–1), rainfall intensity i (in/hr), drainage area A (acres)
- **Lookup table**: 23 land-use categories with C ranges and typical values
- **Outputs**: Peak discharge Q (cfs), equivalent SI values (m³/s)

---

### 5. Unit Hydrograph (`UnitHydrographCalculator.tsx`)

**Methods**: Triangular UH and NRCS Dimensionless UH (33-point t/Tp vs q/Qp table).

| Variable | Formula |
|----------|---------|
| Lag time | `T_lag = 0.6 × Tc` |
| Time to peak | `Tp = Δt/2 + T_lag` |
| Base time | `Tb = 2.67 × Tp` (triangular method) |
| Peak discharge | `Qp = 484 × A_mi² × Q / Tp` (A converted from acres via `÷ 640`) |
| Runoff depth | SCS method internally: `Q = (P − 0.2S)² / (P − 0.2S + S)` |

- **Inputs**: Drainage area (acres), CN, Tc (hr), rainfall depth (in), storm duration (hr), computation interval (hr)
- **Outputs**: Full hydrograph table (time vs flow in cfs), peak Q, time to peak, base time, runoff volume (acre-ft), chart
- **Linkable**: Exports hydrograph to Modified Puls Routing

---

### 6. Detention Pond Sizing (`DetentionPondCalculator.tsx`)

**Formula**: `V_required = (Q_post − Q_pre) × A × safety_factor`

- **Inputs**: Pre-dev runoff (in), post-dev runoff (in), pond area (acres), average depth (ft), safety factor (default 1.1), method (simple/modified)
- **Outputs**: Required storage (acre-in, acre-ft, ft³, m³), surface area needed, depth check
- **Linkable**: Accepts post-dev runoff from RunoffCalculator

---

### 7. Outlet Structure (`OutletStructureCalculator.tsx`)

Three structure types with forward and reverse calculations:

| Structure | Discharge Formula |
|-----------|------------------|
| **Orifice** | `Q = Cd × A × √(2gH)` — circular or rectangular |
| **Rectangular Weir** | `Q = Cw × L × H^1.5` (suppressed or contracted) |
| **V-Notch Weir** | `Q = Cw × tan(θ/2) × H^2.5` |

- **Inputs**: Dimensions (in/ft), head (ft), discharge coefficients, target Q for reverse calc
- **Outputs**: Discharge (cfs), velocity (fps), required dimensions for target Q

---

### 8. Stage-Storage-Discharge (`StageStorageDischarge.tsx`)

**Pond geometry**: Prismoidal formula with side slopes.

| Variable | Formula |
|----------|---------|
| Area at depth d | `A(d) = (L + 2zd)(W + 2zd)` where z = side slope (H:V) |
| Storage at depth d | `V(d) = d/3 × [A_bot + A_top + √(A_bot × A_top)]` |
| Composite outflow | Sum of all outlet structures (orifice + weir) active at each stage |

- **Inputs**: Bottom length/width (ft), side slope (H:V), max depth (ft), depth increment, outlet configurations (multiple orifices/weirs with invert elevations)
- **Outputs**: Stage-storage-outflow table, rating curves (chart), CSV export
- **Linkable**: Exports SSO data to Modified Puls Routing

---

### 9. Modified Puls Routing (`ModifiedPulsRouting.tsx`)

**Method**: Level-pool routing using the storage-indication curve `(2S/Δt + O)` vs `O`.

| Step | Formula |
|------|---------|
| Storage indication | `(2S₂/Δt + O₂) = (2S₁/Δt − O₁) + I₁ + I₂` |
| Interpolation | O₂ found from S-O relationship at each time step |

- **Inputs**: Time step (hr), stage-storage-outflow table, inflow hydrograph (time vs Q)
- **Outputs**: Routed outflow hydrograph, peak inflow/outflow, peak attenuation %, peak lag time, storage utilization, chart
- **Linkable**: Imports SSO from StageStorageDischarge, imports inflow from UnitHydrographCalculator

---

### 10. Pre/Post Development Comparison (`PrePostDevelopmentComparison.tsx`)

**Methods**: SCS or Rational (user-selectable) for multiple return periods.

- **Inputs**: Pre/post area (acres), CN, Tc (min), rational C; design storms (2/10/25/100-yr rainfall depths); safety factor
- **Outputs**: Per-storm: pre/post runoff depth, peak Q, required detention storage; summary table and chart

---

### 11. LID Calculator (`LIDCalculator.tsx`)

**8 BMP Types**: Bioretention, permeable pavement, green roof, infiltration trench, bioswale, sand filter, rain barrel, tree box filter.

| Variable | Formula |
|----------|---------|
| Storage volume | `V = Surface_area × Depth × Porosity` |
| Capture volume | `V_capture = BMP_area × capture_depth` |
| Percent managed | `V_capture / V_design_storm × 100` |

- **Inputs per BMP**: Type, surface area (ft²), media depth (in), porosity, infiltration rate (in/hr)
- **Pollutant removal**: Default TSS/TN/TP percentages per BMP type
- **Outputs**: Total capture volume, percent of design storm managed, pollutant removal estimates, cost estimates
- **Linkable**: Feeds selected BMPs to Treatment Train Calculator

---

### 12. Treatment Train Calculator (`TreatmentTrainCalculator.tsx`)

**Purpose**: Cumulative pollutant removal through sequential BMPs.

**Formula**: `R_cumulative = 1 − Π(1 − R_i)` for each pollutant across the BMP chain.

- **12 BMP types** with removal rates for 6 pollutants: TSS, TN, TP, heavy metals, bacteria, oil & grease
- **Inputs**: Ordered list of BMPs in the treatment train
- **Outputs**: Per-stage and cumulative removal percentages, pollutant breakthrough chart, compliance check

---

### Calculator Data Flow

```
CurveNumberCalculator ──→ RunoffCalculator ──→ DetentionPondCalculator
                                                        │
UnitHydrographCalculator ──→ ModifiedPulsRouting ←── StageStorageDischarge
                                                        ↑
                                        OutletStructureCalculator
                                        
LIDCalculator ──→ TreatmentTrainCalculator

PrePostDevelopmentComparison (standalone, uses SCS or Rational internally)
TcCalculator (standalone, feeds Tc into UnitHydrographCalculator manually)
RationalMethodCalculator (standalone)
```

---

## Migration Notes

- **No backend dependencies** – pure client-side app
- **No environment variables or secrets** needed
- **No database** – all computation is stateless
- Install dependencies: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build` (outputs to `dist/`)
- The `components.json` file configures shadcn/ui CLI if you need to add more primitives

## Dependencies to Note

- `katex` – renders LaTeX math; CSS imported in components
- `gif.js` – Web Worker-based GIF encoder; may need worker file serving config
- `jspdf` – PDF generation client-side
- `html2canvas` – DOM-to-canvas for screenshots
- `recharts` – all chart rendering

## Known Considerations

- `StormWizard.tsx` (433 lines) is the largest component – consider splitting if extending
- Pattern equations in `patternEquations.ts` use raw LaTeX strings consumed by KaTeX
- The Chicago Storm pattern uses IDF coefficients (a, b, c) that are hardcoded defaults
- All 22 pattern generators live in `rainfallPatterns.ts` – this is the core algorithmic file
