---
name: World Rainfall Pattern Painter
file: index.html (single-page web app)
version: 3.2.0
date: 2026-11-14
author: Robert Dickinson
links: {web: https://rain-canvas-studio.lovable.app, api_reference: https://rain-canvas-studio.lovable.app/API.md, repo: none}
engines:
  - {name: shared storm calculator, file: supabase/functions/_shared/rainfallPatterns.ts, version: 3.2.0, license: see LICENSE}
units: US customary (in, in/hr) by default; metric (mm, mm/hr) when selected
ai_use: built with Lovable (AI coding agent); see AI use
---

# World Rainfall Pattern Painter: synthetic design storm hyetographs for stormwater models

## What it does
Builds a design storm hyetograph from a total depth, a duration, a time step and a temporal pattern.
Covers 339 predefined patterns (US, Europe, Asia/Pacific, Middle East, Africa, Latin America) plus a custom editor.
Writes the storm to EPA SWMM, InfoWorks ICM, XP-SWMM, HEC-HMS and CSV files.
The same calculator also runs behind a public REST API, so app and API results match.

## How it computes
1. Inputs: total depth P, duration D, time step dt. dt is snapped so D/dt is a whole number of intervals (`fitTimeStep`).
2. The pattern returns a cumulative mass curve or block intensities on n = D/dt intervals.
3. Intensity per interval: i_k = (F(t_k) - F(t_k-1)) * P / dt.
4. Guard (`generateRainfallData`): output must be finite, non-negative and conserve depth.
   - Raw result within 2% of P: rescaled to P exactly.
   - Otherwise recomputed on a finer grid (240, 1440 or 6000 substeps), aggregated, rescaled.
   - Last resort: cleaned raw rescaled, or uniform P/D.
   - Single interval: uniform [P/dt].
   - Any fallback is reported with a plain reason in the storm check panel, export headers and API.
5. Euler Type II (DWA-A 118): peak block at 30% of duration.
6. Climate uplift: depth multiplied by the selected regional factor (PUB, FEH, ARR, CDA).
7. Duplicates: patterns with identical output are merged; old IDs stay accepted as aliases (`PATTERN_ALIASES`).

## Inputs and outputs
- Writes: CSV (comment header, Time (hr)), SWMM [TIMESERIES] script, SWMM .inp template, .dat, XP-SWMM .inp, InfoWorks ICM event CSV (type=RED), HEC-HMS .gage and DSS CSV, PNG/SVG charts, PDF and printable HTML reports.
- Every export header lists depth, duration, time step, pattern, source note, confidence and any fallback reason.
- Reads: the same CSV, SWMM, HEC formats, plus long rainfall records (events split in the Real Data Hub).
- API: GET endpoints, no sign-in, permissive CORS; see /API.md.

## Checks
Mechanical (vitest, this build, 2026-11-14): 18 test files, 1,496 tests passed.
- `methodFidelity.test.ts` (11): SCS Type IA, SCS Type II, block against published ordinates; Euler II peak timing and cumulative values.
- `exportReimport.test.ts` (5): every export format loads back with the same depth and units.
- `volumeConservation.test.ts`, `singleInterval.test.ts`: depth conserved, single-interval storms valid.
- `catalogueParity.test.ts`: app catalogue equals the API's 339 canonical IDs.
- `hydrologyCalcs.test.ts` (11): unit transfers, Modified Puls, unit hydrograph convolution, LID accounting.
- `storm-api/index.test.ts` (6): live API responses.
Confidence registry (`patternProvenance.ts`, 339 patterns): 3 high, 57 medium, 279 low.
Human review: external reviews graded B- to A- across versions; findings addressed are listed in Changes.

## What this does not show
1. Only 3 patterns (block, scs1a, scs2) are benchmarked against published ordinates. 336 use typical parameters or approximations.
2. Source notes were written from general knowledge and have not been checked against the original documents.
3. InfoWorks ICM, XP-SWMM and HEC-HMS desktop imports were not tested in those programs.
4. Multi-series imports load one series at a time.
5. Chicago uses a fixed r = 0.4 and exponent 0.6; Huff curves are piecewise approximations.
6. Regional detection uses browser timezone/locale, not location.
7. NOAA IDF lookup covers the continental US only; the "IDF values" counter is a calculated grid (cities x 6 return periods x 15 durations), not observations.
8. No person has checked every pattern's ordinates by hand.

## How to reproduce
```
bun install
bunx vitest run
```
API: `curl https://rain-canvas-studio.lovable.app` API endpoints as documented in /API.md.

## Credits and licenses
Robert Dickinson, author. Methods from NRCS TR-55, NOAA Atlas 14/15, FEH, ARR, DWA-A 118, Huff, Keifer and Chu, Yen and Chow, Desbordes and national meteorological services. Libraries: React, Vite, Tailwind CSS, Recharts, KaTeX, jsPDF. License: see LICENSE.

## AI use
Built with Lovable, an AI coding agent, directed and reviewed by Robert Dickinson. Code, tests and source notes were AI-written; numbers come from the test run above.

## Changes
- `3.2.0 (2026-11-02)`: shared active storm across tabs; tabs keep state; climate setting kept in share links; Changes tab.
- `3.1.x (2026-11)`: Euler II peak at 30%; confidence audit (high limited to benchmarked patterns); confidence filter; fallback reasons shown; ICM event CSV; re-import of all exports; engine-backed equation explorer; calculator fixes.
- `3.0.0`: public REST API, shared calculator, duplicate patterns merged to 339.
