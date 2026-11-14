---
name: World Rainfall Pattern Painter
file: rain-canvas-studio
version: 3.2.0
date: 2026-11-14
commit: bb672ea89af42e4e9924fbc3a5781c47867a0db0
licence: MIT License
author: Robert Dickinson
links:
  web: https://rain-canvas-studio.lovable.app
  technical_summary: https://rain-canvas-studio.lovable.app/rain-canvas-studio.md
  api_reference: https://rain-canvas-studio.lovable.app/API.md
  source: Private Lovable project; public repository not checked
engines:
  - name: Shared storm calculator
    file: supabase/functions/_shared/rainfallPatterns.ts
    version: 3.2.0
units: US customary first (in, in/hr, ft, ft3, acres); metric second (mm, mm/hr)
ai_use: Lovable by Lovable, November 2026; details under AI use
---

# World Rainfall Pattern Painter: synthetic design storm hyetographs for stormwater models

The commit above identifies the source revision used for the fresh checks. The summary-only documentation commit follows that source revision. The app version comes from `src/components/StormCheckPanel.tsx:28`; the MIT licence is in `LICENSE:1-9`.

## In one sentence.

The app and public API generate rainfall from 339 predefined patterns plus 1 separate Custom editor, and this build passed 1,502 automated tests across 19 test files (`src/components/PatternSelector.tsx:1846-1856`, `supabase/functions/_shared/patternCatalog.ts:831`).

## In one paragraph.

The wizard starts with a 2.00 in (50.8 mm) depth, 6 h duration and 15 min time step (`src/components/StormWizard.tsx:794-796`). A real API request for SCS Type II at 4.00 in (101.6 mm), 6 h and 15 min returned 24 intervals totaling 4.0000 in, with `generation.fallback = "none"`. The measured confidence registry contains 3 High, 57 Medium and 279 Low patterns, totaling 339; only the 3 High patterns are labelled as benchmarked against published ordinates (`src/lib/patternProvenance.ts:46-50`).

## What it does

Builds a synthetic design-storm hyetograph from total depth, duration, time step and temporal pattern. The app catalogue and API use the same calculator and the same 339 canonical pattern IDs. Another 234 old IDs remain as aliases rather than separate catalogue entries (`supabase/functions/_shared/patternCatalog.ts:585,822-831`).

The app reads and writes rainfall files, compares patterns, produces charts and reports, and provides engineering calculators. File exports include CSV, EPA SWMM, InfoWorks ICM, XP-SWMM and HEC-HMS formats. The public API lists patterns, generates hyetographs and analyzes supplied series (`supabase/functions/storm-api/index.ts:400-469`).

## How it computes

This section gives the general pipeline and the specific methods used in the worked examples and fidelity checks. It does not reproduce all 339 pattern formulas. Every numerical threshold or constant stated here has a source-line citation.

### 1. Units, defaults and interval count

1. US customary units are the default. The conversion is `depth_mm = depth_in * 25.4` and `depth_in = depth_mm / 25.4`; the constant 25.4 mm/in is defined at `src/lib/unitConversions.ts:3-8`.
2. Default inputs are `P = 2.0 in`, `D = 6 h` and `dt = 15 min` (`src/components/StormWizard.tsx:794-796`). Here P is total depth, D is duration and dt is the interval length.
3. Before generation, the wizard fits dt so that duration contains whole intervals. The rule is: keep dt if `round(D * 60) mod dt = 0`; otherwise choose the largest whole-minute divisor below dt, searching down to 1 min (`src/lib/stormValidation.ts:249-256`). For example, 25 min on a 1 h storm becomes 20 min, as tested at `src/lib/__tests__/timeStepFit.test.ts:5-7`.
4. The raw generator uses `n = ceil(D * 60 / dt)` intervals, with D in hours and dt in minutes (`supabase/functions/_shared/rainfallPatterns.ts:340-346`). Interval k starts at `k * dt`, and its value is mean intensity over that interval.

### 2. Mass curves and plain-text equations

1. For a dimensionless cumulative mass curve F, linear interpolation between table points j and j+1 is `F(t) = F_j + ((t - t_j) / (t_(j+1) - t_j)) * (F_(j+1) - F_j)` (`supabase/functions/_shared/rainfallPatterns.ts:135-143`).
2. Interval intensity from a mass curve is `I_k = P * (F((k+1)/n) - F(k/n)) / (dt/60)`, in depth units per hour (`supabase/functions/_shared/rainfallPatterns.ts:146-160`).
3. Uniform block: `I_k = P / D` for every interval (`supabase/functions/_shared/rainfallPatterns.ts:351-357`).
4. SCS Type IA and Type II use linearly interpolated 24 h cumulative tables. The Type IA ordinates are at `supabase/functions/_shared/rainfallPatterns.ts:369-374`; Type II ordinates are at `supabase/functions/_shared/rainfallPatterns.ts:377-382`. Their interval equation is the mass-curve equation above.
5. Triangular pattern: peak position `r = 0.33`, peak intensity `I_peak = 2 * P / D`, rising limb `I(t) = I_peak * t/r` for `t <= r`, and falling limb `I(t) = I_peak * (1-t)/(1-r)` for `t > r`, where t is interval-start time divided by D (`supabase/functions/_shared/rainfallPatterns.ts:421-437`).
6. Chicago alternating blocks: peak index `floor(n * r)` with `r = 0.4`. Block intensity before sorting is `I_j = P / (D * ((j+1)*dt/(60*D))^0.6)`. Blocks are sorted from largest to smallest and alternated left and right around the peak (`supabase/functions/_shared/rainfallPatterns.ts:512-547`). The values r = 0.4 and exponent 0.6 are fixed approximations, not site IDF constants (`src/lib/patternProvenance.ts:58-59`).
7. Euler Type II block depths start with `h(d) = (d/60)^0.45` for `0 < d <= 60 min`, and `h(d) = (d/60)^0.25` for `d > 60 min` (`supabase/functions/_shared/rainfallPatterns.ts:1427-1435`). Increments are ranked. For n at least 2, the largest increment goes at `k = max(1, floor(0.3*n))`; earlier ranks rise toward it and later ranks fall after it (`supabase/functions/_shared/rainfallPatterns.ts:210-220`). Final intensity is `I_k = P * arranged_depth_k / sum(arranged_depths) / (dt/60)` (`supabase/functions/_shared/rainfallPatterns.ts:1432-1435`). The 0.45 and 0.25 exponents are a generic KOSTRA-like curve, not site KOSTRA data.

### 3. Depth guard and reported fallbacks

Let `P_raw = sum(I_k * dt/60)` and `relative_error = abs(P_raw - P) / P`.

1. If n is 1 or less, the result is one block with `I = P/(dt/60)`, labelled `single_interval` (`supabase/functions/_shared/rainfallPatterns.ts:274-277`).
2. A raw series is accepted only when every value is finite and non-negative and `relative_error <= 0.02` (`supabase/functions/_shared/rainfallPatterns.ts:327-330`).
3. An accepted series is rescaled so its depth equals P. If `relative_error > 0.001`, the result is labelled `depth_adjusted`; otherwise it is labelled `none` (`supabase/functions/_shared/rainfallPatterns.ts:279-287`). The scaling is `scale = P/P_raw` and `I_scaled_k = scale * I_k`; scaling is skipped when `abs(P_raw-P) <= 1e-9 * P` (`supabase/functions/_shared/rainfallPatterns.ts:333-338`).
4. If the raw series is invalid and `abs(n*dt - D*60) < 1e-9 min`, the generator tries target grids of 240, 1440 and 6000 substeps. It uses `m = max(2, ceil(target/n))`, generates at `dt/m`, then aggregates with `I_out_k = (1/m) * sum(I_fine_j)` over each group of m fine intervals (`supabase/functions/_shared/rainfallPatterns.ts:289-303`). A successful result is labelled `refined_grid`.
5. If refinement fails, invalid or non-positive raw values are set to 0 and the remaining positive shape is rescaled, labelled `rescaled` (`supabase/functions/_shared/rainfallPatterns.ts:306-311`). If no usable value remains, every interval becomes `P/(n*dt/60)`, labelled `uniform` (`supabase/functions/_shared/rainfallPatterns.ts:313-314`).
6. The app displays the fallback and reason, and export headers and API responses carry the same diagnostic (`src/components/StormCheckPanel.tsx:31-37,68-76`; `supabase/functions/storm-api/index.ts:327-340,424-434`).

### 4. Climate uplift factors

The equation is `P_effective = P * factor` when the selected pattern has a climate configuration and the scenario is not `none`; otherwise `P_effective = P` (`src/components/StormWizard.tsx:881-888`). All factors available in the code are:

| Pattern and source wording in code | Scenario | Factor | Source lines |
|---|---|---:|---|
| Singapore PUB, 2020 code wording | Baseline | 1.00 | `src/components/StormWizard.tsx:833-838` |
| Singapore PUB | 2020-2039 | 1.12 | `src/components/StormWizard.tsx:839` |
| Singapore PUB | 2040-2069 | 1.26 | `src/components/StormWizard.tsx:840` |
| Singapore PUB | 2070-2099 | 1.40 | `src/components/StormWizard.tsx:841` |
| UK FEH | Baseline | 1.00 | `src/components/StormWizard.tsx:844-848` |
| UK FEH | 2015-2039 | 1.10 | `src/components/StormWizard.tsx:849` |
| UK FEH | 2040-2069 | 1.20 | `src/components/StormWizard.tsx:850` |
| UK FEH | 2070-2115 | 1.40 | `src/components/StormWizard.tsx:851` |
| UK FEH | 2070-2115 upper end | 1.20 | `src/components/StormWizard.tsx:852` |
| Australian ARR 2019 | Baseline | 1.00 | `src/components/StormWizard.tsx:855-859` |
| Australian ARR 2019 | RCP 4.5, 2050 | 1.05 | `src/components/StormWizard.tsx:860` |
| Australian ARR 2019 | RCP 4.5, 2090 | 1.09 | `src/components/StormWizard.tsx:861` |
| Australian ARR 2019 | RCP 8.5, 2050 | 1.09 | `src/components/StormWizard.tsx:862` |
| Australian ARR 2019 | RCP 8.5, 2090 | 1.16 | `src/components/StormWizard.tsx:863` |
| Canadian CDA | Baseline | 1.00 | `src/components/StormWizard.tsx:866-870` |
| Canadian CDA | 2050 moderate | 1.10 | `src/components/StormWizard.tsx:871` |
| Canadian CDA | 2050 high | 1.15 | `src/components/StormWizard.tsx:872` |
| Canadian CDA | 2100 moderate | 1.20 | `src/components/StormWizard.tsx:873` |
| Canadian CDA | 2100 high | 1.30 | `src/components/StormWizard.tsx:874` |

These factors are transcribed from the app, not independently checked against the cited guidance. The pattern source note separately cites PUB 2018 for the base temporal pattern (`src/lib/patternProvenance.ts:119`), while the climate configuration says PUB 2020 (`src/components/StormWizard.tsx:834-836`).

### 5. API rounding and request limits

1. API intensity and cumulative values are rounded to 4 decimal places (`supabase/functions/storm-api/index.ts:330-337`). Depth calculated from rounded intensities can therefore differ slightly from requested depth.
2. Generate requests require `0 < total_depth <= 100 in`, `0 < duration_hr <= 72 h` and `1 <= time_step_min <= 360 min`. If time step is omitted or numerically zero, it defaults to 15 min (`supabase/functions/storm-api/index.ts:411-422`).
3. The API resolves aliases before calling the shared calculator and returns the canonical pattern ID, requested pattern ID, generation diagnostic and data (`supabase/functions/storm-api/index.ts:327-340,424-434`).

## Inputs and outputs

- Main inputs: total depth in in (mm optional), duration in h, time step in min, pattern ID, unit system and optional climate scenario (`src/components/StormWizard.tsx:636-675`).
- Generated API output: interval-start time in min, intensity in in/hr and cumulative depth in in (`supabase/functions/storm-api/index.ts:327-340`).
- Export headers include pattern, depth, duration, time step, units, source, confidence, approximation when present, and calculator fallback (`src/lib/stormFileExports.ts:13-17`; `src/lib/__tests__/methodFidelity.test.ts:110-124`).
- Import behavior for multiple SWMM rain series: the gauged series is loaded and a warning reports the number found; all series are not merged (`src/lib/__tests__/exportReimport.test.ts:62-71`).

## Checks

Fresh checks ran on 2026-11-14 at commit `bb672ea89af42e4e9924fbc3a5781c47867a0db0`.

- `bunx vitest run --reporter=json --outputFile=/tmp/rain-canvas-test-results.json`: 18 files, 1,496 tests passed, 0 failed.
- `deno test --allow-env --allow-net --allow-read supabase/functions/storm-api/index.test.ts`: 1 file, 6 live API tests passed, 0 failed.
- Total: 19 files, 1,502 tests passed, 0 failed. The per-file counts below sum to 1,502.
- A read-only measurement script then called the same project functions to record differences. It also queried all 339 live API patterns. Differences below are measured results, not the allowed tolerances.
- Vitest excludes `supabase/**` (`vite.config.ts:19-22`), which is why the Deno API file is run and counted separately.
- "Not checked" means the source and fresh run provide no published reference or no human check. It does not mean a test failed.

| Test file | Count | Published reference, document or table | Tolerance in the test | Largest difference found in this run |
|---|---:|---|---|---|
| `src/lib/__tests__/activeStorm.test.ts` | 6 | Not checked; app permalink and display behavior | Exact strings and scenario IDs | 0 mismatches |
| `src/lib/__tests__/batchExportCount.test.ts` | 2 | Not checked; catalogue/export regression | 0 failed generations allowed | 0 failed out of 339 predefined patterns |
| `src/lib/__tests__/catalogueParity.test.ts` | 12 | Not checked; app/API ID parity and 10 added-pattern regressions | Exact ID lists and count 339; depth `5e-10 in` for 10 added patterns | 0 in depth difference; 0 ID differences |
| `src/lib/__tests__/coarseStorms.test.ts` | 1,017 | Not checked; 339 patterns at 3 coarse-step cases | `toBeCloseTo(2,1)`, equivalent to `0.05 in` | `8.88e-16 in`, Desbordes, 1 h at 30 min |
| `src/lib/__tests__/dubaiDmCombined.test.ts` | 1 | Dubai DM combined 101-point curve; source document/table not checked. Code comment states 98.72 mm/hr (`rainfallPatterns.ts:2968-2972`) | `80 < peak < 120 mm/hr`; no tight tolerance around 98.7 | 0.00205 in/hr (0.05208 mm/hr) from the test's 98.7 mm/hr target; measured peak 3.88378 in/hr (98.64792 mm/hr) |
| `src/lib/__tests__/equationExplorer.test.ts` | 5 | NRCS WinTR-55 Type II whole-hour values at hours 11, 12 and 13; triangular reference not checked | `0.05 mm` for SCS displayed values; `5e-7 mm` for triangular total; `5e-10 mm` or mm/hr against engine | `1.42e-14 mm` against displayed SCS values; 0 against engine |
| `src/lib/__tests__/exportReimport.test.ts` | 36 | Not checked externally; app export-to-import round trips | Relative metadata depth error `< 0.002` US and `< 0.01` SI; exact interval/time/unit checks | 0.000885827 relative, equal to 0.0885827%, FEH SI CSV metadata. This is metadata depth, not a desktop-program check |
| `src/lib/__tests__/hydrologyCalcs.test.ts` | 11 | USDA NRCS (1986) TR-55 for curve-number runoff; NRCS dimensionless unit hydrograph table year not checked; Modified Puls and LID numeric references not checked | Includes `0.005 mm` runoff, `0.0005 in` transfer, `0.005 acre` area, `0.005 ac-ft` storage, `1e-6` Puls relative residual, and `0.0005 ft3` storm-hydrograph volume | Storage 0.0002751 ac-ft; runoff 0.00000586 in (0.0001489 mm); storm hydrograph `1.397e-9 ft3`; full Puls relative residual `1.011e-16` |
| `src/lib/__tests__/icmCsvExport.test.ts` | 3 | Autodesk "Events - CSV File Formats", type=RED, year not stated (`src/lib/icmCsvExport.ts:1-4`) | Exact headers, timestamps and sanitized title | 0 differing strings; desktop import not checked |
| `src/lib/__tests__/japanTyphoonVolume.test.ts` | 1 | Not checked; volume regression only | Relative depth error `< 0.02` | 0 in, relative error 0 |
| `src/lib/__tests__/methodFidelity.test.ts` | 18 | DWD KOSTRA model-rain printout, Gollheim, T=5 a, Euler Type II, 15 and 30 min examples; NRCS WinTR-55 Type IA and II whole-hour cumulative fractions; uniform block definition | Euler `5e-7 mm`; SCS cumulative fraction `0.0005`; block `5e-13 in/hr`; additional exact fallback/header checks | Euler `8.74e-17 in` (`2.22e-15 mm`); SCS cumulative fraction 0; block 0 in/hr |
| `src/lib/__tests__/metricUnits.test.ts` | 1 | Exact unit identity 1 in = 25.4 mm (`src/lib/unitConversions.ts:3-8`) | `0.00005 in` and `0.0005 mm` for the two directions | 0 in and 0 mm |
| `src/lib/__tests__/patternMerge.test.ts` | 4 | Not checked; canonical/alias equivalence regression | Alias intensity difference `< 1e-9 in/hr`; exact count 234 | `1.066e-14 in/hr` across 234 aliases at 3 duration/step pairs |
| `src/lib/__tests__/patternProvenance.test.ts` | 3 | TR-55 named for SCS Type II; published tables are not checked by this file | Exact allowed confidence values and non-empty source notes | 0 missing source notes, 0 invalid named-source IDs |
| `src/lib/__tests__/saScsVolume.test.ts` | 5 | Schulze (1984), Weddepohl (1988) named in engine comments; source ordinate table not checked | Relative depth error `< 0.02`; 4 distinct rounded peaks | 0 relative depth difference; 4 distinct peaks |
| `src/lib/__tests__/singleInterval.test.ts` | 28 | Not checked; finite/depth regression | Absolute depth error `<= 1e-6 mm`; exact one-block value | `1.119e-15 in` (`2.842e-14 mm`) across 9,153 generated pattern/step cases |
| `src/lib/__tests__/timeStepFit.test.ts` | 3 | Not checked; divisor and depth regression | Exact fitted steps; depth `0.0005 in` | 0 min fitting error and 0 in depth error; 25 min fitted to 20 min |
| `src/lib/__tests__/volumeConservation.test.ts` | 340 | Not checked; all-pattern volume regression | Relative depth error `< 0.02` | `1.776e-15 in`, relative `8.882e-16`, Sifalda |
| `supabase/functions/storm-api/index.test.ts` | 6 | Not checked externally; live API invariants and shape ranges | Relative depth error `< 0.02`; cumulative decrease no more than `0.0001 in`; block range `< 0.01 in/hr`; SCS peak 0.30-0.70, Euler 0.20-0.40, Huff Q1 <= 0.35 | 0.0002 in on block, relative 0.00005 or 0.005%; largest cumulative decrease 0 in |
| **Total** | **1,502** | References vary by row; absence is marked not checked | All tests passed | See rows; units are not combined into a false single maximum |

### Confidence registry

The fresh catalogue count is 339 predefined patterns: 3 High, 57 Medium and 279 Low. High is limited to `block`, `scs1a` and `scs2` by the test at `src/lib/__tests__/methodFidelity.test.ts:75-78`. Euler Type II is Medium because its arrangement is checked against examples but its block heights use a generic curve (`src/lib/patternProvenance.ts:61-62`). The Custom editor is not included in the 339.

### AI review

| Review | Tool and maker | Date | Grade | Evidence |
|---|---|---|---|---|
| Method fidelity review | Tool and maker not checked | 2026-11-02 | B- | `src/lib/changelog.ts:39-49` records the grade and fixes, but not the reviewer or tool |
| Source and test summary rewrite | Lovable by Lovable | 2026-11-14 | Not checked; no grade assigned | Fresh test runs and source-line inspection described in this document |

### Human review

Not checked. The project source contains no record identifying a person who performed an engineering review, so the earlier "Human review" claim is not repeated.

## What this does not show

1. No person has checked all 339 pattern source notes against original documents in this build. Automated High-confidence ordinate benchmarks cover 3 patterns; 336 predefined patterns are not High, including 279 Low.
2. External source verification is not checked for the 60 High or Medium named-source records. A source string in `patternProvenance.ts` is not proof that its original table was read.
3. Human import checks in the 4 named desktop targets, EPA SWMM, InfoWorks ICM, XP-SWMM and HEC-HMS, are not checked. The fresh tests exercise app parsers and exact ICM text, not those desktop programs.
4. The 36 export/re-import tests check app-generated files and metadata. They do not establish that every third-party file variation will import.
5. The test suite has 0 test files for `storm-chat` and 0 for `noaa-idf-proxy`. Their human checks are also not checked in this build.
6. Fresh manual browser interaction, accessibility auditing, printed-report inspection and visual review were not checked in this build.
7. Regional detection uses browser information rather than measured location; its real-world accuracy was not checked by the 19 test files.
8. A single request or volume test does not validate the hydrologic suitability of a pattern for a particular site or regulatory requirement.

## How to reproduce

### Source

The source is the current private Lovable project. `README.md:1-7` identifies the app and stack but gives no public repository URL, so a public repository is not checked. Key paths are:

- App: `src/`
- Shared storm calculator: `supabase/functions/_shared/rainfallPatterns.ts`
- Shared canonical IDs and aliases: `supabase/functions/_shared/patternCatalog.ts`
- Public API: `supabase/functions/storm-api/index.ts`
- Browser-side tests: `src/lib/__tests__/`
- Live API tests: `supabase/functions/storm-api/index.test.ts`

### Exact commands

Run from the project root with Bun installed. Deno is additionally required for the live API file. The API test reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from `.env` (`supabase/functions/storm-api/index.test.ts:1-6`); use the project's existing publishable configuration, not a private service key.

```bash
bun install
bunx vitest run --reporter=json --outputFile=/tmp/rain-canvas-test-results.json
deno test --allow-env --allow-net --allow-read supabase/functions/storm-api/index.test.ts
```

Expected fresh totals for this source revision are 1,496 passed in the Vitest command and 6 passed in the Deno command. To run the app locally:

```bash
bun run dev
```

Vite uses port 8080 (`vite.config.ts:9-12`).

### One real API request and expected depth total

This command reads the public backend base URL from `.env` without printing it, then makes one POST request. It reproduces the request run for this summary on 2026-11-14.

```bash
BASE_URL="$(awk -F= '$1=="VITE_SUPABASE_URL" {print $2}' .env | tr -d '"')/functions/v1/storm-api"
curl -sS -X POST "${BASE_URL}/generate" \
  -H "Content-Type: application/json" \
  -d '{"pattern":"scs2","total_depth":4,"duration_hr":6,"time_step_min":15}' \
  | python3 -c 'import json,sys; r=json.load(sys.stdin); print({"pattern":r["pattern"],"points":len(r["data"]),"depth_in":sum(p["intensity"]*0.25 for p in r["data"]),"fallback":r["generation"]["fallback"]})'
```

Expected output:

```text
{'pattern': 'scs2', 'points': 24, 'depth_in': 4.0, 'fallback': 'none'}
```

The expected depth total is 4.0000 in (101.6 mm). The factor 0.25 converts each 15 min intensity in in/hr to incremental depth in inches.

## Credits and licences

Robert Dickinson is the copyright holder named in `LICENSE:3`. The project is released under the MIT License (`LICENSE:1-9`). Method credits below are limited to authors and years recorded in the project source; missing information is marked not checked.

| Method or family | Author and year recorded in source | Source lines |
|---|---|---|
| Uniform block example | Chow, Maidment and Mays, 1988, textbook definition | `src/lib/patternProvenance.ts:48` |
| SCS Types I, IA, II and III | USDA NRCS, 1986, TR-55 | `src/lib/patternProvenance.ts:35,49-50,116-117` |
| Chicago synthetic storm | Keifer and Chu, 1957 | `src/lib/patternProvenance.ts:58-59,68-69` |
| Huff quartiles | Huff, 1967 | `src/lib/patternProvenance.ts:36,63-66` |
| Triangular and Yen-Chow hyetographs | Yen and Chow, 1980 | `src/lib/patternProvenance.ts:69-72` |
| Alternating block and balanced storm | Chow, Maidment and Mays, 1988 | `src/lib/patternProvenance.ts:54-57` |
| Euler Type II and DWA-A 118 | DWA, 2006; Euler's original author/year not checked | `src/lib/patternProvenance.ts:37,61-62,74-75` |
| ATV-A 121 | ATV, 1985 | `src/lib/patternProvenance.ts:83` |
| Desbordes and IT77 | Desbordes, 1978; French Instruction Technique 77-284, 1977 | `src/lib/patternProvenance.ts:39,59-60` |
| FEH | CEH, 1999 | `src/lib/patternProvenance.ts:43,95-98` |
| FSR | NERC, 1975 | `src/lib/patternProvenance.ts:43,98,101` |
| FEH22/ReFH2 | UKCEH; year not checked | `src/lib/patternProvenance.ts:96` |
| ARR 2019 | Ball et al., 2019 | `src/lib/patternProvenance.ts:41,80-81` |
| ARR 1987 legacy | Pilgrim, editor, 1987 | `src/lib/patternProvenance.ts:82` |
| AES temporal distributions and Canadian pattern | Hogg, 1980 | `src/lib/patternProvenance.ts:42,77-79,84` |
| NOAA Atlas 14 | Bonnin et al., 2004-2019 | `src/lib/patternProvenance.ts:40,103-107` |
| NOAA HMR 52 PMP | NOAA, 1982 | `src/lib/patternProvenance.ts:110` |
| Pilgrim and Cordery | Pilgrim and Cordery, 1975 | `src/lib/patternProvenance.ts:109` |
| Sifalda | Sifalda, 1973 | `src/lib/patternProvenance.ts:117` |
| South African SCS Types 1-4 | Schulze, 1984; Weddepohl, 1988; SANRAL, 2013 | `supabase/functions/_shared/rainfallPatterns.ts:3521,3530,3538,3546`; `src/lib/patternProvenance.ts:111-114` |
| Singapore PUB temporal pattern | PUB, 2018 | `src/lib/patternProvenance.ts:119` |
| Singapore climate factors | PUB, 2020 wording in app | `src/components/StormWizard.tsx:834-841` |
| Malaysia MSMA | DID Malaysia, 2012 | `src/lib/patternProvenance.ts:102` |
| China GB 50014 | GB 50014-2021 | `src/lib/patternProvenance.ts:85` |
| Hong Kong DSD | Hong Kong DSD, 2018 | `src/lib/patternProvenance.ts:99` |
| Auckland TP108 | Auckland Regional Council, 1999 | `src/lib/patternProvenance.ts:108` |
| USACE Standard Project Storm | USACE EM 1110-2-1411, 1965 | `src/lib/patternProvenance.ts:123` |
| TxDOT distribution | TxDOT, 2019 | `src/lib/patternProvenance.ts:120` |
| FDOT zones | FDOT; year not checked | `src/lib/patternProvenance.ts:44,90-94` |
| Dubai DM and combined curve | Dubai Municipality; year not checked | `src/lib/patternProvenance.ts:87-88` |
| MHFD/UDFCD procedure | MHFD, formerly UDFCD; year not checked | `src/lib/patternProvenance.ts:121` |
| SCS curve-number runoff | USDA NRCS, 1986, TR-55 | `src/lib/patternProvenance.ts:35`; equation at `src/lib/hydrologyCalcs.ts:29-34` |
| NRCS dimensionless unit hydrograph | USDA NRCS; year not checked | `src/lib/hydrologyCalcs.ts:114-123,135-139` |
| Modified Puls routing | Author and year not checked | `src/lib/hydrologyCalcs.ts:38-61` |
| LID accounting in this app | App-specific accounting implementation; external author/year not checked | `src/lib/hydrologyCalcs.ts:180-208` |
| InfoWorks ICM type=RED export | Autodesk, "Events - CSV File Formats"; year not checked | `src/lib/icmCsvExport.ts:1-4` |

Libraries and their package versions are recorded in `package.json:15-93`. Their individual licences were not checked for this summary.

## AI use

### Tools and dates

- Development and this summary rewrite: Lovable by Lovable, November 2026. The current AI tasks and checks are listed below.
- In-app Storm Assistant: Lovable AI Gateway, with model ID `google/gemini-3-flash-preview` (`supabase/functions/storm-chat/index.ts:73-87`). The model identifier names Google. The month and year this runtime model was first deployed are not checked.
- No claim is made that AI output is an independent engineering review.

### What Robert Dickinson did

Robert Dickinson is named as copyright holder in `LICENSE:3`. His task-by-task development, direction and review contributions are not checked in the project source, so no broader personal authorship or review claim is made here.

### What the AI did, task by task, in this build

1. Read the app source, test files, release history and licence; mapped calculation thresholds and constants to file and line.
2. Ran the 18-file Vitest suite and recorded 1,496 passing tests.
3. Ran the separate live Deno API file and recorded 6 passing tests.
4. Called the shared functions in a read-only measurement script to calculate the largest differences reported in the Checks table.
5. Queried all 339 live API patterns and measured depth and cumulative behavior; made the separate real SCS Type II request documented above.
6. Rewrote this technical summary, removed unsupported review attribution, marked missing evidence as not checked, and retained US customary units first.

AI development tasks before this summary rewrite are not checked because the changelog records changes, not who performed each task.

### How results were checked

- Automated expected-value, invariant and round-trip checks: 1,502 passing tests in 19 files.
- Published ordinate comparisons: DWD KOSTRA Euler examples and NRCS WinTR-55 Type IA and II whole-hour values in `methodFidelity.test.ts`; 3 patterns are labelled High.
- Live API check: all 339 patterns generated successfully in the volume measurement; the largest depth error from rounded API intensities was 0.0002 in (0.005%) on block.
- Real example check: SCS Type II returned 24 points and 4.0000 in total depth.
- Human confirmation of these results: not checked.

### What no person has checked, with counts

- Pattern-by-pattern human ordinate review: not checked for all 339 predefined patterns.
- Human verification against original source documents: not checked for all 339 source notes; 60 have High or Medium named-source records and 279 default to Low.
- Desktop imports: not checked for the 4 named desktop targets.
- Human review of the 19 test files and their expected values: not checked.
- Human review of this rewritten summary: not checked.

## Changes

Dates and wording are taken from `src/lib/changelog.ts:27-203`. Every recorded version is listed newest first. The 2026-11-14 summary rewrite does not change the app version.

| Version | Date | Recorded changes |
|---|---|---|
| 3.2.0 | 2026-11-02 | Shared active storm across tabs; opened tabs retain work; climate scenario retained in share links; Changes tab added |
| 3.1.2 | 2026-11-02 | Euler Type II peak at 30%; confidence audit and filter; source/confidence in exports; fallback reasons; shorter opening screen; calculated IDF grid label |
| 3.1.1 | 2026-11-01 | Single-interval storms; engine-backed equation explorers; detention units, Modified Puls, unit hydrograph, Rational Method and LID fixes |
| 3.1.0 | 2026-11-01 | Pattern source notes and confidence; InfoWorks ICM event CSV; export/re-import round trips; fitted time step; full-catalogue batch export |
| 3.0.1 | 2026-10-22 | One shared app/API calculator; duplicate patterns merged; 339-storm parity; SWMM timing/format and SCS ordinate corrections |
| 3.0.0 | 2026-10-21 | Individual pattern addresses; sitemap and robots; compare-3 chart and A4 report; regional recommendation fixes and sources |
| 2.5.0 | 2026-08-15 | On-demand heavy tabs; readable permalinks; sticky wizard summary; page and social metadata |
| 2.4.0 | 2026-05-30 | 38 added patterns; pattern search; empty preview placeholder; step-counter fix |
| 2.3.0 | 2026-03-27 | About 180 added design storms; expanded global IDF data; Deep Dive and documentation appendix |
| 2.2.0 | 2026-03-08 | Equation family registry; regulatory acceptance matrix; regional standards documentation |
| 2.1.0 | 2026-02-27 | Public API and Playground; storm assistant; long-record event extraction and samples; more regional patterns; animated hero |
| 2.0.0 | 2026-02-24 | World Rainfall Pattern Painter rename; dark mode and accessibility; more calculators, patterns, climate factors and exports |
| 1.3.0 | 2026-01-29 | Step-by-step wizard; Custom pattern editor; Real Data Hub; equation explorer and overlay chart |
| 1.2.0 | 2025-12-03 | Engineering calculators; SWMM5 import and repair; HEC-HMS gage export; SWMM templates |
| 1.1.0 | 2025-11-13 | US customary and metric units; batch processing; SWMM5 export; animation; recommendations |
| 1.0.0 | 2025-11-09 | First Rainfall Pattern Painter release with regional patterns, charts, presets, statistics, PDF export and SCS guide |
