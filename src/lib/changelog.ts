/**
 * Release history shown in the "Changes" tab.
 * Compiled from the project's saved change history (commit messages) and grouped
 * into releases. Add a new entry at the top whenever a release ships.
 */

export type ChangeArea =
  | "Calculations"
  | "Catalogue"
  | "Exports & imports"
  | "Interface"
  | "Calculators"
  | "API"
  | "Documentation"
  | "Search & sharing";

export interface ChangeEntry {
  version: string;
  date: string; // ISO yyyy-mm-dd (last day of the release window)
  title: string;
  areas: ChangeArea[];
  changes: string[];
}

export const CHANGELOG: ChangeEntry[] = [
  {
    version: "3.2.0",
    date: "2026-11-02",
    title: "Shared storm across tabs, tabs keep your work, climate in share links",
    areas: ["Interface", "Search & sharing"],
    changes: [
      "The storm set up in the Storm Generator is now the active storm for Advanced Tools (comparison, sensitivity, unit tables) and can fill the API Playground request.",
      "Switching tabs no longer clears inputs, imported data or results — every opened tab keeps its state.",
      "Share links keep the climate change scenario; opening one now applies the uplift instead of resetting it.",
      "New Changes tab showing how the app has changed over time.",
    ],
  },
  {
    version: "3.1.2",
    date: "2026-11-02",
    title: "Method fidelity review (B−)",
    areas: ["Calculations", "Catalogue", "Exports & imports", "Interface"],
    changes: [
      "Euler Type II peak moved to 30% of duration (DWA-A 118), with peak-timing and cumulative tests.",
      "High confidence kept only for patterns benchmarked against published ordinates; approximations downgraded and labelled.",
      "Confidence filter in the pattern picker; source and confidence written into exported file headers.",
      "Storm check reports when the calculator refined, rescaled or substituted a uniform storm, with the reason.",
      "Shorter opening screen; IDF counter relabelled as a calculated grid.",
    ],
  },
  {
    version: "3.1.1",
    date: "2026-11-01",
    title: "Linked calculators and single-interval storms",
    areas: ["Calculations", "Calculators"],
    changes: [
      "Storms with only one interval give a valid, depth-conserving series.",
      "SCS Type II and triangular equation explorers read the storm calculator directly.",
      "Fixed detention units, Modified Puls storage, unit hydrograph convolution, pre/post Rational Method intensity and LID over-capture.",
    ],
  },
  {
    version: "3.1.0",
    date: "2026-11-01",
    title: "Source notes, ICM CSV and file round-trips",
    areas: ["Catalogue", "Exports & imports"],
    changes: [
      "Source note and confidence level for every pattern, shown in pattern details and regional recommendations.",
      "Native InfoWorks ICM rainfall event CSV export.",
      "CSV, HEC-HMS and SWMM files exported by the app load back in without errors (round-trip tests for each format).",
      "Time step snaps to fit the duration; batch export covers the whole catalogue.",
    ],
  },
  {
    version: "3.0.1",
    date: "2026-10-22",
    title: "One shared storm calculator; duplicate patterns merged",
    areas: ["Calculations", "API", "Catalogue"],
    changes: [
      "App and public API use the same storm calculator so results match.",
      "Patterns with identical output merged; old links still open the kept pattern.",
      "Catalogue aligned to 339 predefined storms in both app and API.",
      "SWMM export timing/format and SCS ordinates corrected.",
    ],
  },
  {
    version: "3.0.0",
    date: "2026-10-21",
    title: "Pattern pages, compare-3 chart and reports",
    areas: ["Search & sharing", "Interface", "Exports & imports"],
    changes: [
      "Each pattern has its own address (/patterns/…); sitemap and robots file added.",
      "Compare 3 patterns chart with PNG/SVG export, share links, keyboard control and A4 report view.",
      "Regional recommendations fixed so Latin American visitors are no longer shown as the United States; sources and confidence added.",
    ],
  },
  {
    version: "2.5.0",
    date: "2026-08-15",
    title: "Faster loading, permalinks and search metadata",
    areas: ["Interface", "Search & sharing"],
    changes: [
      "Heavy tabs load on demand, roughly halving the first download.",
      "Readable permalinks (?pattern=…&depth=…) and sticky wizard summary bar.",
      "Page titles, descriptions, social cards and structured data.",
    ],
  },
  {
    version: "2.4.0",
    date: "2026-05-30",
    title: "38 more patterns, search and empty states",
    areas: ["Catalogue", "Interface"],
    changes: [
      "US specialty, European and Asia-Pacific patterns added.",
      "Pattern search and a placeholder when no preview is available; step counter fixed.",
    ],
  },
  {
    version: "2.3.0",
    date: "2026-03-27",
    title: "Global catalogue and IDF coverage expansion",
    areas: ["Catalogue", "Documentation"],
    changes: [
      "Around 180 design storms added; equations referenced for every pattern.",
      "Global IDF data expanded across Africa, Asia, the Caribbean, Europe, Latin America, the Middle East and the Pacific; reorganised by continent.",
      "Design Storm Deep Dive and documentation appendix; lists sorted alphabetically.",
    ],
  },
  {
    version: "2.2.0",
    date: "2026-03-08",
    title: "Equation registry and regional standards",
    areas: ["Catalogue", "Documentation"],
    changes: [
      "Equation family registry and regulatory acceptance matrix.",
      "Further regional standards and pattern documentation.",
    ],
  },
  {
    version: "2.1.0",
    date: "2026-02-27",
    title: "Public API, storm assistant and Real Data Hub events",
    areas: ["API", "Interface", "Catalogue"],
    changes: [
      "Public REST storm API and interactive API Playground; main generator moved onto the API.",
      "Storm assistant chatbot reading the active storm.",
      "Storm event extraction from long records, one-click samples, Test All Patterns step.",
      "New Zealand, Dubai/Abu Dhabi, Nordic, Desbordes and Japan typhoon patterns; volumes normalised.",
      "Animated hero hyetograph with GIF export.",
    ],
  },
  {
    version: "2.0.0",
    date: "2026-02-24",
    title: "World Rainfall Pattern Painter",
    areas: ["Catalogue", "Calculators", "Exports & imports", "Interface"],
    changes: [
      "Renamed; dark mode and accessibility fixes.",
      "Canada IDF and China rainstorm calculators; NOAA IDF lookup with confidence intervals.",
      "African, Latin American, Gulf, Southeast Asian and PMP patterns; climate change factors.",
      "HEC-HMS, HydroCAD and PDF report exports; storm sharing by link.",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-01-29",
    title: "Wizard, custom pattern editor and Real Data Hub",
    areas: ["Interface", "Exports & imports"],
    changes: [
      "Interface restructured into a step-by-step wizard.",
      "Custom pattern editor with import/export; Real Data Hub with sample files.",
      "Interactive equation explorer and hyetograph overlay chart.",
    ],
  },
  {
    version: "1.2.0",
    date: "2025-12-03",
    title: "Engineering calculators and SWMM tools",
    areas: ["Calculators", "Exports & imports"],
    changes: [
      "Tc, curve number, runoff volume, detention, Modified Puls, unit hydrograph, LID, outlet and treatment-train calculators.",
      "SWMM5 import with validation and auto-repair; HEC-HMS gage export; SWMM template parameters.",
    ],
  },
  {
    version: "1.1.0",
    date: "2025-11-13",
    title: "Units, batch export and recommendations",
    areas: ["Interface", "Exports & imports"],
    changes: [
      "US customary and metric units throughout, remembered between visits.",
      "Batch processing, SWMM5 export and time-series animation; pattern recommendation engine.",
    ],
  },
  {
    version: "1.0.0",
    date: "2025-11-09",
    title: "First release — Rainfall Pattern Painter",
    areas: ["Catalogue", "Exports & imports"],
    changes: [
      "SCS, European, Asian, African and InfoWorks ICM rainfall patterns.",
      "Chart export, presets, statistics, PDF export and SCS regional guide.",
    ],
  },
];

/** Saved changes per month, counted from the project's change history. */
export const MONTHLY_ACTIVITY: { month: string; changes: number }[] = [
  { month: "2025-11", changes: 24 },
  { month: "2025-12", changes: 62 },
  { month: "2026-01", changes: 34 },
  { month: "2026-02", changes: 320 },
  { month: "2026-03", changes: 382 },
  { month: "2026-04", changes: 0 },
  { month: "2026-05", changes: 11 },
  { month: "2026-06", changes: 1 },
  { month: "2026-07", changes: 2 },
  { month: "2026-08", changes: 31 },
  { month: "2026-09", changes: 0 },
  { month: "2026-10", changes: 47 },
  { month: "2026-11", changes: 75 },
];
