/**
 * Per-pattern provenance: a short source note and a confidence level saying how
 * closely the curve this app generates is known to follow the published source.
 *
 *  high   – the app applies the source's own defining equation, rule or table directly.
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
}

export const CONFIDENCE_LABELS: Record<PatternConfidence, string> = {
  high: "High",
  low: "Low",
  medium: "Medium",
};

export const CONFIDENCE_MEANING: Record<PatternConfidence, string> = {
  high: "The app applies the source's own equation, rule or table directly.",
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
  // High — defining equation, rule or table applied directly
  alternating_block: { source: "Chow, Maidment & Mays (1988) Applied Hydrology §14.4, alternating block method", confidence: "high" },
  balanced: { source: "Chow, Maidment & Mays (1988) Applied Hydrology §14.4, alternating block (balanced) storm", confidence: "high" },
  block: { source: "Uniform-intensity block storm (textbook definition, e.g. Chow, Maidment & Mays 1988)", confidence: "high" },
  chicago: { source: "Keifer & Chu (1957) Synthetic storm pattern for drainage design, ASCE J. Hydraulics Div. 83(4)", confidence: "high" },
  desbordes: { source: DESBORDES, confidence: "high" },
  desbordes_double: { source: DESBORDES, confidence: "high" },
  dwa_a118: { source: `${DWA}, Euler Type II`, confidence: "high" },
  euler2: { source: `${DWA}, Euler Type II (peak at 30% of duration)`, confidence: "high" },
  huff1: { source: `${HUFF}, 1st-quartile median curve`, confidence: "high" },
  huff2: { source: `${HUFF}, 2nd-quartile median curve`, confidence: "high" },
  huff3: { source: `${HUFF}, 3rd-quartile median curve`, confidence: "high" },
  huff4: { source: `${HUFF}, 4th-quartile median curve`, confidence: "high" },
  keifer_chu: { source: "Keifer & Chu (1957) ASCE J. Hydraulics Div. 83(4)", confidence: "high" },
  scs1a: { source: `${TR55}, Type IA`, confidence: "high" },
  scs2: { source: `${TR55}, Type II`, confidence: "high" },
  triangular: { source: "Yen & Chow (1980) Design hyetographs for small drainage structures, ASCE J. Hydraulics Div. 106(6)", confidence: "high" },
  yen_chow: { source: "Yen & Chow (1980) ASCE J. Hydraulics Div. 106(6)", confidence: "high" },

  // Medium — published method, values reconstructed or typical
  aes_30: { source: `${AES}, 30% quartile`, confidence: "medium" },
  aes_40: { source: `${AES}, 40% quartile`, confidence: "medium" },
  aes_50: { source: `${AES}, 50% quartile`, confidence: "medium" },
  arr: { source: ARR, confidence: "medium" },
  arr2019: { source: ARR, confidence: "medium" },
  arr2019_p3: { source: ARR, confidence: "medium" },
  arr87_legacy: { source: "Pilgrim (ed.) (1987) Australian Rainfall & Runoff, Vol. 2 temporal patterns", confidence: "medium" },
  atv_a121: { source: "ATV-A 121 (1985) Niederschlag – Starkregen", confidence: "medium" },
  canadian: { source: AES, confidence: "medium" },
  china_gb50014: { source: "GB 50014-2021 Standard for design of outdoor wastewater engineering, rainstorm intensity formula", confidence: "medium" },
  double: { source: "Generic double-peak storm (no single published table)", confidence: "medium" },
  dubai_dm: { source: "Dubai Municipality drainage design guidelines, DXB design storm", confidence: "medium" },
  dubai_dm_combined: { source: "Dubai Municipality drainage design guidelines, combined 101-point mass curve", confidence: "medium" },
  dwa: { source: DWA, confidence: "medium" },
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
  hk_dsd_2023: { source: "Hong Kong DSD Stormwater Drainage Manual (2018, 2023 corrigendum)", confidence: "medium" },
  kostra_dwd: { source: "DWD KOSTRA-DWD-2020 with DWA-A 118 Euler profile", confidence: "medium" },
  m5_60_fsr: { source: FEH, confidence: "medium" },
  malaysia_msma: { source: "DID Malaysia (2012) MSMA 2nd Ed., Ch. 2 temporal patterns", confidence: "medium" },
  malaysia_msma2: { source: "DID Malaysia (2012) MSMA 2nd Ed., Ch. 2 temporal patterns", confidence: "medium" },
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
