/**
 * Per-pattern provenance: a short source note and a confidence level saying how
 * closely the curve this app generates is known to follow the published source.
 *
 *  high   – the app applies the source's own defining table or rule directly, with no typical
 *           parameters substituted, and a test checks the output against published ordinates.
 *  medium – the method is published, but the app's ordinates or parameters were
 *           reconstructed or set to typical values; check against the document before design use.
 *  low    – representative shape only; not checked against any published table.
 *
 * Anything not listed explicitly is "low" on purpose: confidence is only raised
 * when there is a specific, named source for the curve.
 */

export type PatternConfidence = "high" | "medium" | "low";

export interface PatternProvenance {
  source: string;
  confidence: PatternConfidence;
  /** What the app does differently from the source (fixed parameters, fitted curves, generic IDF). */
  approximation?: string;
}

export const CONFIDENCE_LABELS: Record<PatternConfidence, string> = {
  high: "High",
  low: "Low",
  medium: "Medium",
};

export const CONFIDENCE_MEANING: Record<PatternConfidence, string> = {
  high: "The app applies the source's own table or rule directly, and a test checks it against published values.",
  low: "Representative shape only — not checked against a published table. Use for screening, not final design.",
  medium: "Published method, but the app's values were reconstructed or use typical parameters. Check against the document before design use.",
};

const TR55 = "USDA NRCS (1986) TR-55 Urban Hydrology for Small Watersheds; WinTR-55 24-h tables";
const HUFF = "Huff (1967) Time distribution of rainfall in heavy storms, Water Resources Research 3(4)";
const DWA = "DWA-A 118 (2006) Hydraulic dimensioning of drainage systems";
const DESBORDES = "Desbordes (1978); French Instruction Technique 77-284 (1977) double-triangle storm";
const ATLAS14 = "Bonnin et al. NOAA Atlas 14 (2004–2019) temporal distributions, quartile curves";
const ARR = "Ball et al. (2019) Australian Rainfall & Runoff, Book 2 Ch. 5 temporal patterns";
const AES = "Hogg (1980) Temporal distribution of 1-, 6-, 12- and 24-hour AES design storms, Environment Canada";
const FEH = "CEH (1999) Flood Estimation Handbook Vol. 4; NERC (1975) Flood Studies Report summer/winter profiles";
const FDOT = "FDOT Drainage Manual / Drainage Design Guide, Florida rainfall distributions by zone";

const KNOWN: Record<string, PatternProvenance> = {
  // High — published table applied directly; benchmarked in src/lib/__tests__/methodFidelity.test.ts
  block: { source: "Uniform-intensity block storm (textbook definition, e.g. Chow, Maidment & Mays 1988)", confidence: "high" },
  scs1a: { source: `${TR55}, Type IA`, confidence: "high", approximation: "Linear interpolation between the published ordinates." },
  scs2: { source: `${TR55}, Type II`, confidence: "high", approximation: "Linear interpolation between the published ordinates." },

  // Medium — method from the source, but with fixed or typical parameters (audited: not exact to the source)
  alternating_block: { source: "Chow, Maidment & Mays (1988) Applied Hydrology §14.4, alternating block method", confidence: "medium",
    approximation: "Uses a generic IDF i = 100/(t+10)^0.7, not your local IDF; centre-peaked." },
  balanced: { source: "Chow, Maidment & Mays (1988) Applied Hydrology §14.4, alternating block (balanced) storm", confidence: "medium",
    approximation: "Uses a generic depth-duration curve P(d) ∝ d^0.6, not your local IDF." },
  chicago: { source: "Keifer & Chu (1957) Synthetic storm pattern for drainage design, ASCE J. Hydraulics Div. 83(4)", confidence: "medium",
    approximation: "Alternating blocks from a generic IDF (exponent 0.6) with a fixed peak position r = 0.4 — not Keifer & Chu's continuous equations with your IDF constants." },
  desbordes: { source: DESBORDES, confidence: "medium", approximation: "Fixed peak timings (0.3 / 0.5 / 0.7 of duration) instead of a chosen intense-period length." },
  desbordes_double: { source: DESBORDES, confidence: "medium", approximation: "Fixed peak timings and depth split." },
  euler2: { source: `${DWA}, Annex — Euler Type II (peak in the interval containing 0.3·D)`, confidence: "medium",
    approximation: "Euler Type II arrangement rule applied exactly (checked against a DWD KOSTRA example), but block heights come from a generic KOSTRA-like depth-duration curve, not your site's KOSTRA values." },
  huff1: { source: `${HUFF}, 1st-quartile median curve`, confidence: "medium", approximation: "Piecewise power/linear fit to the median curve, not Huff's tabulated ordinates." },
  huff2: { source: `${HUFF}, 2nd-quartile median curve`, confidence: "medium", approximation: "Piecewise power/linear fit to the median curve, not Huff's tabulated ordinates." },
  huff3: { source: `${HUFF}, 3rd-quartile median curve`, confidence: "medium", approximation: "Piecewise power/linear fit to the median curve, not Huff's tabulated ordinates." },
  huff4: { source: `${HUFF}, 4th-quartile median curve`, confidence: "medium", approximation: "Piecewise power/linear fit to the median curve, not Huff's tabulated ordinates." },
  keifer_chu: { source: "Keifer & Chu (1957) ASCE J. Hydraulics Div. 83(4)", confidence: "medium",
    approximation: "Keifer & Chu intensity equation with example constants (a = 40, c = 8, e = 0.75, r = 0.375), rescaled to your depth." },
  triangular: { source: "Yen & Chow (1980) Design hyetographs for small drainage structures, ASCE J. Hydraulics Div. 106(6)", confidence: "medium",
    approximation: "Fixed peak position 0.33 of duration; intensity sampled at interval start." },
  yen_chow: { source: "Yen & Chow (1980) ASCE J. Hydraulics Div. 106(6)", confidence: "medium",
    approximation: "Fixed time-to-peak ratio r = 0.375 instead of a regional value." },

  // Medium — published method, values reconstructed or typical
  dwa_a118: { source: `${DWA} (2006) — symmetric model rain`, confidence: "low",
    approximation: "Symmetric centre-peaked mass curve; this is NOT the Euler Type II model rain the standard uses. Use Euler Type II for DWA-A 118 work." },
  aes_30: { source: `${AES}, 30% quartile`, confidence: "medium" },
  aes_40: { source: `${AES}, 40% quartile`, confidence: "medium" },
  aes_50: { source: `${AES}, 50% quartile`, confidence: "medium" },
  arr: { source: ARR, confidence: "medium" },
  arr2019: { source: ARR, confidence: "medium" },
  arr87_legacy: { source: "Pilgrim (ed.) (1987) Australian Rainfall & Runoff, Vol. 2 temporal patterns", confidence: "medium" },
  atv_a121: { source: "ATV-A 121 (1985) Niederschlag – Starkregen", confidence: "medium" },
  canadian: { source: AES, confidence: "medium" },
  china_gb50014: { source: "GB 50014-2021 Standard for design of outdoor wastewater engineering, rainstorm intensity formula", confidence: "medium" },
  double: { source: "Generic double-peak storm (no single published table)", confidence: "medium" },
  dubai_dm: { source: "Dubai Municipality drainage design guidelines, DXB design storm", confidence: "medium" },
  dubai_dm_combined: { source: "Dubai Municipality drainage design guidelines, combined 101-point mass curve", confidence: "medium" },
  dwa: { source: DWA, confidence: "low", approximation: "Centre-peaked mass curve — does not follow the Euler Type II rule; use Euler Type II for DWA-A 118 work." },
  euler1: { source: `${DWA}, Euler Type I`, confidence: "medium" },
  fdot1: { source: `${FDOT}, Zone 1`, confidence: "medium" },
  fdot2: { source: `${FDOT}, Zone 2`, confidence: "medium" },
  fdot3: { source: `${FDOT}, Zone 3`, confidence: "medium" },
  fdot4: { source: `${FDOT}, Zone 4`, confidence: "medium" },
  fdot5: { source: `${FDOT}, Zone 5`, confidence: "medium" },
  feh: { source: FEH, confidence: "medium" },
  feh22_refh2: { source: "UKCEH FEH22 rainfall with ReFH2 design-storm profile", confidence: "medium" },
  fsr: { source: FEH, confidence: "medium" },
  hk_dsd_2018: { source: "Hong Kong DSD Stormwater Drainage Manual (2018)", confidence: "medium" },
  kostra_dwd: { source: "DWD KOSTRA-DWD-2020 with DWA-A 118 Euler profile", confidence: "low", approximation: "Generic alternating-block shape with the peak at about 1/3 of duration — not the Euler Type II rule or site KOSTRA values." },
  m5_60_fsr: { source: FEH, confidence: "medium" },
  malaysia_msma: { source: "DID Malaysia (2012) MSMA 2nd Ed., Ch. 2 temporal patterns", confidence: "medium" },
  noaa_a14: { source: ATLAS14, confidence: "medium" },
  noaa_a14_a: { source: `${ATLAS14}, 1st quartile`, confidence: "medium" },
  noaa_a14_b: { source: `${ATLAS14}, 2nd quartile`, confidence: "medium" },
  noaa_a14_c: { source: `${ATLAS14}, 3rd quartile`, confidence: "medium" },
  noaa_a14_d: { source: `${ATLAS14}, 4th quartile`, confidence: "medium" },
  nz_tp108: { source: "Auckland Regional Council (1999) TP108 Guidelines for stormwater runoff modelling", confidence: "medium" },
  pilgrim_cordery: { source: "Pilgrim & Cordery (1975) Rainfall temporal patterns for design floods, ASCE J. Hydraulics Div. 101(1)", confidence: "medium" },
  pmp_hmr: { source: "NOAA HMR 52 (1982) PMP storm time sequence", confidence: "medium" },
  sa_scs1: { source: "Weddepohl (1988); SANRAL Drainage Manual (2013) SCS-SA Type 1", confidence: "medium" },
  sa_scs2: { source: "Weddepohl (1988); SANRAL Drainage Manual (2013) SCS-SA Type 2", confidence: "medium" },
  sa_scs3: { source: "Weddepohl (1988); SANRAL Drainage Manual (2013) SCS-SA Type 3", confidence: "medium" },
  sa_scs4: { source: "Weddepohl (1988); SANRAL Drainage Manual (2013) SCS-SA Type 4", confidence: "medium" },
  scs1: { source: `${TR55}, Type I (quarter-hour values to be checked against WinTR-55)`, confidence: "medium" },
  scs3: { source: `${TR55}, Type III (quarter-hour values to be checked against WinTR-55)`, confidence: "medium" },
  sifalda: { source: "Sifalda (1973) Beitrag zur Berechnung von Abflussmengen, gwf Wasser/Abwasser", confidence: "medium" },
  singapore_pub: { source: "PUB (2018) Code of Practice on Surface Water Drainage, 7th Ed.", confidence: "medium" },
  trapezoidal: { source: "Generic trapezoidal hyetograph (textbook shape, no single published table)", confidence: "medium" },
  txdot: { source: "TxDOT Hydraulic Design Manual (2019), design storm distribution", confidence: "medium" },
  udfcd: { source: "MHFD (formerly UDFCD) Urban Storm Drainage Criteria Manual Vol. 1, Colorado Urban Hydrograph Procedure", confidence: "medium" },
  usace_sps: { source: "USACE EM 1110-2-1411 (1965) Standard Project Storm", confidence: "medium" },
};

/**
 * Source note and confidence level for a pattern.
 * `name` and `description` are used to word the note for patterns without a named source.
 */
export function getPatternProvenance(id: string, name?: string, description?: string): PatternProvenance {
  const known = KNOWN[id];
  if (known) return known;
  if (id === "custom") {
    return { source: "Your own drawing or imported values", confidence: "medium" };
  }
  const label = name ?? id;
  if (description && /^synthetic\b/i.test(description.trim())) {
    return {
      source: `Synthetic profile written for this app to represent typical ${label} storms; not taken from the agency's published tables.`,
      confidence: "low",
    };
  }
  return {
    source: `Representative shape for ${label}; not yet checked against the published document.`,
    confidence: "low",
  };
}

/** Ids with a named source (high or medium). */
export const NAMED_SOURCE_IDS = Object.keys(KNOWN);
