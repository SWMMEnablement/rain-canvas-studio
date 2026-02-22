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
