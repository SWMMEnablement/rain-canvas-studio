/**
 * Storm Analysis & Pattern Derivation Engine
 * Analyzes real storm data and matches to synthetic patterns
 */

import { type RainfallDataPoint } from './rainfallParsers';
import { type PatternType, generateRainfallData } from './rainfallPatterns';

export interface StormStatistics {
  // Basic metrics
  totalDepth: number;
  duration: number; // minutes
  peakIntensity: number;
  peakTime: number; // minutes from start
  peakPosition: number; // 0-1 fraction of duration
  
  // Distribution metrics
  centroid: number; // center of mass (0-1)
  skewness: number; // asymmetry measure
  kurtosis: number; // peakedness measure
  
  // Quartile analysis (Huff-style)
  q1Fraction: number; // % of rain in first quartile
  q2Fraction: number;
  q3Fraction: number;
  q4Fraction: number;
  dominantQuartile: 1 | 2 | 3 | 4;
  
  // Shape characteristics
  riseDuration: number; // time to peak (minutes)
  fallDuration: number; // time after peak (minutes)
  riseSlope: number; // average rise rate
  fallSlope: number; // average fall rate
  asymmetryRatio: number; // rise/fall ratio
}

export interface PatternMatch {
  pattern: PatternType;
  patternName: string;
  similarity: number; // 0-1, higher is better
  rmse: number; // root mean square error
  correlation: number; // Pearson correlation
  peakPositionDiff: number; // difference in peak position
  description: string;
}

export interface AnalysisResult {
  statistics: StormStatistics;
  matches: PatternMatch[];
  bestMatch: PatternMatch;
  recommendations: string[];
}

// Pattern metadata for matching
const patternMetadata: Record<PatternType, { name: string; peakPosition: number; description: string }> = {
  block: { name: 'Uniform Block', peakPosition: 0.5, description: 'Constant intensity throughout' },
  scs1: { name: 'SCS Type I', peakPosition: 0.4, description: 'Pacific maritime climate' },
  scs1a: { name: 'SCS Type IA', peakPosition: 0.35, description: 'Pacific Northwest coastal' },
  scs2: { name: 'SCS Type II', peakPosition: 0.5, description: 'Most of US (moderate climate)' },
  scs3: { name: 'SCS Type III', peakPosition: 0.5, description: 'Gulf Coast high rainfall' },
  double: { name: 'Double Peak', peakPosition: 0.5, description: 'Bimodal storm pattern' },
  custom: { name: 'Custom', peakPosition: 0.5, description: 'User-defined pattern' },
  triangular: { name: 'Triangular', peakPosition: 0.33, description: 'UK practice standard' },
  trapezoidal: { name: 'Trapezoidal', peakPosition: 0.425, description: 'Sustained peak pattern' },
  fsr: { name: 'FSR (UK)', peakPosition: 0.4, description: 'Flood Studies Report' },
  chicago: { name: 'Chicago', peakPosition: 0.4, description: 'Alternating block method' },
  huff1: { name: 'Huff Q1', peakPosition: 0.125, description: 'Peak in first quartile' },
  huff2: { name: 'Huff Q2', peakPosition: 0.375, description: 'Peak in second quartile' },
  huff3: { name: 'Huff Q3', peakPosition: 0.625, description: 'Peak in third quartile' },
  huff4: { name: 'Huff Q4', peakPosition: 0.875, description: 'Peak in fourth quartile' },
  desbordes: { name: 'Desbordes', peakPosition: 0.3, description: 'French double-triangle' },
  arr: { name: 'ARR (Australia)', peakPosition: 0.4, description: 'Australian Rainfall & Runoff' },
  jma: { name: 'JMA (Japan)', peakPosition: 0.5, description: 'Japan Meteorological Agency' },
  china: { name: 'China Design', peakPosition: 0.4, description: 'Chinese drainage standard' },
  sa_huff: { name: 'SA Huff', peakPosition: 0.35, description: 'South African adapted Huff' },
  dwa: { name: 'DWA (Germany)', peakPosition: 0.5, description: 'German Euler Type II' },
  dutch: { name: 'Dutch STOWA', peakPosition: 0.35, description: 'Netherlands polder regions' },
  italian: { name: 'Italian Mediterranean', peakPosition: 0.45, description: 'Intense convective storms' },
  balanced: { name: 'Balanced Storm', peakPosition: 0.5, description: 'IDF-derived alternating block' },
  fdot1: { name: 'FDOT Zone 1', peakPosition: 0.42, description: 'NW Florida modified Type II' },
  fdot2: { name: 'FDOT Zone 2', peakPosition: 0.45, description: 'NE Florida modified Type II' },
  fdot3: { name: 'FDOT Zone 3', peakPosition: 0.35, description: 'Central FL tropical distribution' },
  fdot4: { name: 'FDOT Zone 4', peakPosition: 0.25, description: 'SE Florida convective front-loaded' },
  fdot5: { name: 'FDOT Zone 5', peakPosition: 0.28, description: 'SW Florida convective' },
  txdot: { name: 'TxDOT', peakPosition: 0.38, description: 'Texas DOT empirical hyetograph' },
  yen_chow: { name: 'Yen & Chow', peakPosition: 0.375, description: 'Variable triangular hyetograph' },
  noaa_a14: { name: 'NOAA Atlas 14', peakPosition: 0.48, description: 'Atlas 14 50th percentile temporal' },
  udfcd: { name: 'UDFCD Denver', peakPosition: 0.2, description: 'Colorado front-loaded 2-hour storm' },
  usace_sps: { name: 'USACE SPS', peakPosition: 0.45, description: 'Corps of Engineers standard project storm' },
  pmp_hmr: { name: 'PMP (HMR 51/52)', peakPosition: 0.38, description: 'Probable Maximum Precipitation generalized storm' },
  feh: { name: 'FEH (UK)', peakPosition: 0.42, description: 'Flood Estimation Handbook temporal' },
  euler1: { name: 'Euler Type I', peakPosition: 0.167, description: 'Front-loaded German Euler' },
  euler2: { name: 'Euler Type II', peakPosition: 0.33, description: 'Center-peaked German Euler' },
  desbordes_double: { name: 'Double Triangle', peakPosition: 0.25, description: 'Desbordes double triangle' },
  canadian: { name: 'Canadian CDA', peakPosition: 0.45, description: 'Canadian Dam Association pattern' },
  singapore_pub: { name: 'Singapore PUB', peakPosition: 0.15, description: 'Singapore tropical convective' },
  china_gb50014: { name: 'China GB 50014', peakPosition: 0.40, description: 'Chinese urban drainage standard' },
  china_prd: { name: 'China PRD', peakPosition: 0.22, description: 'Pearl River Delta typhoon' },
  india_imd: { name: 'India IMD', peakPosition: 0.47, description: 'IMD monsoon standard' },
  india_coastal: { name: 'India Coastal', peakPosition: 0.25, description: 'Coastal cyclonic storm' },
  japan_amedas: { name: 'Japan AMeDAS', peakPosition: 0.42, description: 'Short-duration convective' },
  japan_baiu: { name: 'Japan Baiu', peakPosition: 0.38, description: 'Baiu frontal rain pattern' },
  japan_typhoon: { name: 'Japan Typhoon', peakPosition: 0.65, description: 'Typhoon double-band pattern' },
  korea_kma: { name: 'Korea KMA', peakPosition: 0.42, description: 'Korean standard monsoon/convective' },
  malaysia_msma: { name: 'Malaysia MSMA', peakPosition: 0.35, description: 'Malaysian MSMA tropical monsoon' },
  indonesia_bmkg: { name: 'Indonesia BMKG', peakPosition: 0.18, description: 'Indonesian tropical convective' },
  philippines_pagasa: { name: 'Philippines PAGASA', peakPosition: 0.15, description: 'Philippine typhoon/monsoon' },
  vietnam_imhen: { name: 'Vietnam IMHEN', peakPosition: 0.35, description: 'Vietnamese monsoon/convective' },
  thailand_tmd: { name: 'Thailand TMD', peakPosition: 0.38, description: 'Thai monsoon with urban heat island' },
  saudi_pme: { name: 'Saudi Arabia PME', peakPosition: 0.12, description: 'Arid wadi flash flood' },
  uae_ncms: { name: 'UAE NCMS', peakPosition: 0.14, description: 'Dubai/Abu Dhabi flash flood' },
  qatar_kahramaa: { name: 'Qatar Kahramaa', peakPosition: 0.12, description: 'Doha arid flash flood' },
  oman_dgman: { name: 'Oman DGMAN', peakPosition: 0.15, description: 'Muscat wadi/Khareef flood' },
  sa_sanral: { name: 'South Africa SANRAL', peakPosition: 0.30, description: 'SANRAL road drainage design storm' },
  kenya_kmd: { name: 'Kenya KMD', peakPosition: 0.15, description: 'East African highland convective' },
  nigeria_nimet: { name: 'Nigeria NiMet', peakPosition: 0.45, description: 'West African monsoon ITCZ pattern' },
  egypt_hcww: { name: 'Egypt HCWW', peakPosition: 0.08, description: 'Arid flash flood Nile Delta' },
  brazil_ana: { name: 'Brazil ANA', peakPosition: 0.45, description: 'Tropical convective SE Brazil' },
  mexico_conagua: { name: 'Mexico CONAGUA', peakPosition: 0.20, description: 'Front-loaded tropical convective' },
  colombia_ideam: { name: 'Colombia IDEAM', peakPosition: 0.45, description: 'Andean valley convective' },
  chile_dga: { name: 'Chile DGA', peakPosition: 0.40, description: 'Frontal/orographic central Chile' },
  nz_tp108: { name: 'Auckland TP108', peakPosition: 0.40, description: 'Auckland Council TP108 maritime convective' },
  nz_wellington: { name: 'Wellington Regional', peakPosition: 0.35, description: 'Wellington frontal/orographic maritime' },
  nz_christchurch: { name: 'Christchurch Canterbury', peakPosition: 0.45, description: 'Canterbury rain-shadow plains' },
  // New patterns
  sifalda: { name: 'Sifalda', peakPosition: 0.34, description: 'Czech Republic three-part storm' },
  danish_svk: { name: 'Denmark SVK', peakPosition: 0.375, description: 'Danish Chicago variant' },
  swedish_smhi: { name: 'Sweden SMHI', peakPosition: 0.35, description: 'Swedish Chicago variant' },
  norwegian_nve: { name: 'Norway NVE', peakPosition: 0.33, description: 'Norwegian Chicago variant' },
  finnish_fmi: { name: 'Finland FMI', peakPosition: 0.35, description: 'Finnish Chicago variant' },
  swiss_idf: { name: 'Swiss IDF', peakPosition: 0.40, description: 'Swiss cantonal IDF' },
  spanish_cedex: { name: 'Spain CEDEX', peakPosition: 0.50, description: 'Spanish alternating block' },
  belgian_irm: { name: 'Belgium IRM', peakPosition: 0.50, description: 'Belgian center-peaked' },
  pilgrim_cordery: { name: 'Pilgrim-Cordery', peakPosition: 0.45, description: 'Australian historical empirical' },
  watts_curve: { name: "Watt's Curve", peakPosition: 0.50, description: 'UK historical bell-shaped' },
  hong_kong_hko: { name: 'Hong Kong HKO', peakPosition: 0.20, description: 'HKO typhoon front-loaded' },
  taiwan_cwa: { name: 'Taiwan CWA', peakPosition: 0.45, description: 'Taiwan typhoon IDF' },
  bangladesh_bmd: { name: 'Bangladesh BMD', peakPosition: 0.65, description: 'Monsoon rear-loaded' },
  pakistan_pmd: { name: 'Pakistan PMD', peakPosition: 0.45, description: 'Monsoon beta distribution' },
  sri_lanka: { name: 'Sri Lanka', peakPosition: 0.40, description: 'Monsoon beta distribution' },
  fiji_fms: { name: 'Fiji FMS', peakPosition: 0.25, description: 'Tropical cyclone front-loaded' },
  argentina_smn: { name: 'Argentina SMN', peakPosition: 0.33, description: 'Buenos Aires Chicago variant' },
  peru_senamhi: { name: 'Peru SENAMHI', peakPosition: 0.40, description: 'Andean convective' },
  ecuador_inamhi: { name: 'Ecuador INAMHI', peakPosition: 0.40, description: 'Andean convective' },
  venezuela_inameh: { name: 'Venezuela INAMEH', peakPosition: 0.40, description: 'Andean convective' },
  puerto_rico: { name: 'Puerto Rico', peakPosition: 0.48, description: 'Tropical modified SCS II' },
  morocco_dmn: { name: 'Morocco DMN', peakPosition: 0.38, description: 'North African Mediterranean' },
  ethiopia_nma: { name: 'Ethiopia NMA', peakPosition: 0.42, description: 'East African monsoon' },
  ghana_gmet: { name: 'Ghana GMet', peakPosition: 0.32, description: 'West African front-loaded' },
  tanzania_tma: { name: 'Tanzania TMA', peakPosition: 0.44, description: 'East African monsoon' },
  mozambique_inam: { name: 'Mozambique INAM', peakPosition: 0.40, description: 'SE African coastal' },
  hirds_nz: { name: 'HIRDS NZ', peakPosition: 0.55, description: 'NZ hyperbolic tangent' },
  arid_flash_flood: { name: 'Arid Flash Flood', peakPosition: 0.15, description: 'Exponential decay burst' },
  aes_30: { name: 'AES Canada 30%', peakPosition: 0.30, description: 'Ontario/ECCC 30% distribution' },
  aes_40: { name: 'AES Canada 40%', peakPosition: 0.40, description: 'BC/prairies 40% distribution' },
  kostra_dwd: { name: 'KOSTRA-DWD', peakPosition: 0.33, description: 'Euler II alternating-block, peak at 1/3' },
  dubai_dm: { name: 'Dubai Municipality', peakPosition: 0.50, description: 'FEH 90th pctl needle peak' },
  dubai_dm_combined: { name: 'Dubai DM Combined', peakPosition: 0.50, description: 'Modified FEH for DXB Combined' },
  abu_dhabi_adm: { name: 'Abu Dhabi ADM', peakPosition: 0.50, description: 'FEH 75th pctl peak' },
  montana_caquot: { name: 'Montana/Caquot', peakPosition: 0.10, description: 'French power-law IT77' },
  m5_60_fsr: { name: 'M5-60 FSR', peakPosition: 0.45, description: 'UK short-duration FSR' },
  arr2019: { name: 'ARR 2019', peakPosition: 0.45, description: 'Australian ensemble median' },
  upm_plata: { name: 'UPM Plata', peakPosition: 0.35, description: 'Uruguay/Paraguay basin' },
  // v3 patterns
  feh22_refh2: { name: 'FEH22/ReFH2', peakPosition: 0.50, description: 'UK FEH22 DDF + ReFH2 design hyetograph' },
  noaa_a15: { name: 'NOAA Atlas 15', peakPosition: 0.50, description: 'NOAA Atlas 15 pilot temporal' },
  eccc_idf: { name: 'ECCC IDF', peakPosition: 0.50, description: 'Environment Canada engineering IDF' },
  shyreg_fr: { name: 'SHYREG', peakPosition: 0.40, description: 'French stochastic rainfall generator' },
  ireland_met: { name: 'Ireland Met Éireann', peakPosition: 0.45, description: 'Irish return-period IDF' },
  arr87_legacy: { name: 'ARR87 Legacy', peakPosition: 0.45, description: 'Legacy Australian IFD (pre-2016)' },
  hk_dsd_2018: { name: 'HK DSD 2018', peakPosition: 0.25, description: 'HK Stormwater Drainage Manual 5th ed.' },
  malaysia_hp1: { name: 'Malaysia HP1', peakPosition: 0.40, description: 'Hydrological Procedure No.1 (2015)' },
  austria_okostra: { name: 'Austria ÖKOSTRA', peakPosition: 0.33, description: 'Austrian ÖKOSTRA design rainfall' },
  // v4 patterns
  france_shypre: { name: 'France SHYPRE', peakPosition: 0.35, description: 'French SHYPRE stochastic hyetograph' },
  poland_panda: { name: 'Poland PANDa', peakPosition: 0.40, description: 'Polish national precipitation atlas' },
  turkey_mgm: { name: 'Turkey MGM', peakPosition: 0.38, description: 'Turkish meteorological IDF' },
  israel_ims: { name: 'Israel IMS', peakPosition: 0.30, description: 'Israeli arid/semi-arid convective' },
  iran_irimo: { name: 'Iran IRIMO', peakPosition: 0.35, description: 'Iranian meteorological IDF' },
  iraq_mos: { name: 'Iraq MoS', peakPosition: 0.32, description: 'Iraqi Tigris-Euphrates basin' },
  kazakhstan_kazhydromet: { name: 'Kazakhstan Kazhydromet', peakPosition: 0.42, description: 'Central Asian continental' },
  russia_roshydromet: { name: 'Russia Roshydromet', peakPosition: 0.40, description: 'Russian continental IDF' },
  portugal_ipma: { name: 'Portugal IPMA', peakPosition: 0.40, description: 'Portuguese Mediterranean IDF' },
  nz_niwa: { name: 'NZ NIWA', peakPosition: 0.45, description: 'NZ national NIWA standard' },
  csa_w231: { name: 'CSA W231', peakPosition: 0.45, description: 'Canadian climate-adjusted IDF' },
  sa_wrc: { name: 'SA WRC', peakPosition: 0.38, description: 'South African Water Research Commission' },
  west_africa_cilss: { name: 'West Africa CILSS', peakPosition: 0.28, description: 'Sahel AGRHYMET convective squall' },
  noaa_a16: { name: 'NOAA Atlas 16', peakPosition: 0.50, description: 'Next-gen NOAA western US atlas' },
  euro_cordex: { name: 'EURO-CORDEX', peakPosition: 0.48, description: 'Climate-downscaled European ensemble' },
  mongolia_namem: { name: 'Mongolia NAMEM', peakPosition: 0.35, description: 'High-altitude cold-arid continental' },
  pacific_sprep: { name: 'Pacific SPREP', peakPosition: 0.22, description: 'Pacific SIDS tropical cyclone' },
  czech_chmu: { name: 'Czech ČHMÚ', peakPosition: 0.38, description: 'Czech modern hydrometeorological' },
  // v5 patterns
  barbados_bms: { name: 'Barbados BMS', peakPosition: 0.20, description: 'Tropical maritime Hershfield PMP' },
  oecs_caribbean: { name: 'OECS Caribbean', peakPosition: 0.25, description: 'Eastern Caribbean Bell method + TC' },
  cyprus_wdd: { name: 'Cyprus WDD', peakPosition: 0.25, description: 'Mediterranean double-triangular' },
  malta_mra: { name: 'Malta MRA', peakPosition: 0.32, description: 'Composite Chicago-Huff hybrid' },
  bolivia_altiplano: { name: 'Bolivia Altiplano', peakPosition: 0.50, description: 'Modified SCS Type I high-altitude' },
  fourier_multipeak: { name: 'Fourier Multi-Peak', peakPosition: 0.40, description: 'Fourier series dual-peak research' },
  cc_idf_scaled: { name: 'CC-IDF Scaled', peakPosition: 0.48, description: 'Climate-change scaled SCS Type II' },
  // v6 patterns
  g2p_gamma: { name: 'G2P Gamma', peakPosition: 0.40, description: 'Gamma 2-parameter peaked storm' },
  poland_bs: { name: 'Poland Bogdanowicz-Stachy', peakPosition: 0.50, description: 'Polish stormwater standard' },
  belgium_willems: { name: 'Belgium Willems', peakPosition: 0.35, description: 'Flemish composite nested storm' },
  russia_snip: { name: 'Russia SNiP', peakPosition: 0.20, description: 'Russian building code intensity' },
  turkey_dsi: { name: 'Turkey DSİ', peakPosition: 0.42, description: 'Turkish State Hydraulic Works IDF' },
  korea_molit: { name: 'Korea MOLIT', peakPosition: 0.35, description: 'Korean MOLIT Huff-type urban' },
  greece_hellenic: { name: 'Greece Hellenic', peakPosition: 0.38, description: 'Koutsoyiannis-Baloutsos Greek IDF' },
  romania_stas: { name: 'Romania STAS', peakPosition: 0.50, description: 'Romanian Andrei method drainage' },
  pmp_wmo: { name: 'PMP WMO', peakPosition: 0.45, description: 'WMO generalized Hershfield PMP' },
  nested_envelope: { name: 'Nested Envelope', peakPosition: 0.50, description: 'USACE worst-case nested IDF storm' },
  // v7 patterns
  arnell_sweden: { name: 'Arnell (Sweden)', peakPosition: 0.33, description: 'Swedish historical 1982 predecessor' },
  tenax_cds: { name: 'TENAX-CDS', peakPosition: 0.40, description: 'Climate-adapted Chicago design storm' },
  avm: { name: 'Average Variability', peakPosition: 0.45, description: 'Averaged observed storm patterns' },
  sa_scs1: { name: 'SA SCS Type 1', peakPosition: 0.50, description: 'South African SCS Type 1 — coastal/orographic, lowest concentration' },
  sa_scs2: { name: 'SA SCS Type 2', peakPosition: 0.50, description: 'South African SCS Type 2 — moderate concentration' },
  sa_scs3: { name: 'SA SCS Type 3', peakPosition: 0.50, description: 'South African SCS Type 3 — inland convective' },
  sa_scs4: { name: 'SA SCS Type 4', peakPosition: 0.50, description: 'South African SCS Type 4 — extreme convective Highveld' },
  // v10 — Poland & Eastern Europe
  atv_a121: { name: 'ATV-A 121', peakPosition: 0.46, description: 'German ATV sewer design rainfall, widely used in Poland' },
  dwa_a118: { name: 'DWA-A 118', peakPosition: 0.50, description: 'Updated German symmetric model rain (2006)' },
  blaszczyk: { name: 'Błaszczyk', peakPosition: 0.375, description: 'Traditional Polish design storm method' },
  imgw_cluster1: { name: 'IMGW Cluster 1', peakPosition: 0.10, description: 'Polish front-loaded rapid onset (18% of storms)' },
  imgw_cluster2: { name: 'IMGW Cluster 2', peakPosition: 0.275, description: 'Polish early-peak (25% of storms)' },
  imgw_cluster3: { name: 'IMGW Cluster 3', peakPosition: 0.425, description: 'Polish central peak, most common (28% of storms)' },
  imgw_cluster4: { name: 'IMGW Cluster 4', peakPosition: 0.60, description: 'Polish late peak (17% of storms)' },
  imgw_cluster5: { name: 'IMGW Cluster 5', peakPosition: 0.80, description: 'Polish end-loaded delayed peak (12% of storms)' },
  wroclaw_2050: { name: 'Wrocław 2050', peakPosition: 0.30, description: 'Climate-adjusted design storm for Wrocław' },
  trupl: { name: 'Trupl', peakPosition: 0.45, description: 'Czech standard design storm (1958), sharper peak than DVWK' },
  samaj_valovic: { name: 'Šamaj-Valovič', peakPosition: 0.425, description: 'Slovak design storm from Bratislava/Košice records' },
  hungarian_msz: { name: 'Hungarian MSZ', peakPosition: 0.425, description: 'Hungarian MSZ standard design storm' },
  budapest_convective: { name: 'Budapest Convective', peakPosition: 0.35, description: 'Budapest pluviograph-derived very sharp peak (3.5×)' },
  owav_rb11: { name: 'ÖWAV Regelblatt 11', peakPosition: 0.54, description: 'Austrian standard, later peak for orographic rainfall' },
  // v11 — High-value additions
  croatian_dhmz: { name: 'Croatian DHMZ', peakPosition: 0.35, description: 'Adriatic coastal convective storm' },
  beta_distribution: { name: 'Beta Distribution', peakPosition: 0.40, description: 'Flexible shape via α/β parameters' },
  cc_clausius: { name: 'Clausius-Clapeyron', peakPosition: 0.35, description: '7%/°C scaled climate storm' },
  bartlett_lewis: { name: 'Bartlett-Lewis', peakPosition: 0.35, description: 'Stochastic rectangular pulse model' },
  tropical_cyclone: { name: 'Tropical Cyclone', peakPosition: 0.45, description: 'Rainband spiral structure' },
  atmospheric_river: { name: 'Atmospheric River', peakPosition: 0.65, description: 'Sustained frontal with late broad peak' },
  algeria_anrh: { name: 'Algeria ANRH', peakPosition: 0.25, description: 'North African Mediterranean convective' },
  west_africa_cieh: { name: 'West Africa CIEH', peakPosition: 0.15, description: 'Sahelian squall line 14 countries' },
  portugal_lnec: { name: 'Portugal LNEC', peakPosition: 0.40, description: 'Portuguese Mediterranean convective' },
  costa_rica_imn: { name: 'Costa Rica IMN', peakPosition: 0.35, description: 'Central American tropical convective' },
  nepal_dhm: { name: 'Nepal DHM', peakPosition: 0.45, description: 'Extreme orographic monsoon peak' },
  nyc_dep: { name: 'NYC DEP', peakPosition: 0.48, description: 'NYC combined sewer design storm' },
  post_wildfire: { name: 'Post-Wildfire', peakPosition: 0.12, description: 'Debris flow triggering burst' },
  bimodal_gaussian: { name: 'Bimodal Gaussian', peakPosition: 0.30, description: 'Double Gaussian peak storm' },
  // v12 — Massive expansion
  serbian_rhmz: { name: 'Serbian RHMZ', peakPosition: 0.42, description: 'Belgrade/Pannonian continental' },
  bulgarian_nimh: { name: 'Bulgarian NIMH', peakPosition: 0.38, description: 'Sofia/Black Sea coast' },
  slovenian_arso: { name: 'Slovenian ARSO', peakPosition: 0.42, description: 'Alpine/Mediterranean transition' },
  ukrainian_dbn: { name: 'Ukrainian DBN', peakPosition: 0.35, description: 'Continental Kyiv/Odesa/Lviv' },
  lithuanian_hms: { name: 'Lithuanian HMS', peakPosition: 0.42, description: 'Baltic maritime Vilnius' },
  latvian_lvgmc: { name: 'Latvian LVĢMC', peakPosition: 0.42, description: 'Baltic maritime Riga' },
  estonian_emhi: { name: 'Estonian EMHI', peakPosition: 0.42, description: 'Nordic/Baltic Tallinn' },
  soviet_snip_legacy: { name: 'Soviet SNiP Legacy', peakPosition: 0.35, description: 'Historical 5-zone sewer standard' },
  belarusian_tkp: { name: 'Belarusian TKP', peakPosition: 0.38, description: 'Updated SNiP for Minsk' },
  icelandic_imo: { name: 'Icelandic IMO', peakPosition: 0.50, description: 'Subarctic frontal low-intensity' },
  svensson_jones: { name: 'Svensson-Jones', peakPosition: 0.52, description: 'CEH UK seasonal derivation' },
  reunion_mf: { name: 'Réunion Météo-France', peakPosition: 0.35, description: 'World record rainfall territory' },
  azores_ipma: { name: 'Azores/Madeira IPMA', peakPosition: 0.42, description: 'Atlantic subtropical islands' },
  jordan_jmd: { name: 'Jordan JMD', peakPosition: 0.25, description: 'Arid wadi flash flood Amman' },
  lebanon_cav: { name: 'Lebanon Civil Aviation', peakPosition: 0.40, description: 'Mountain vs coastal orographic' },
  kuwait_mew: { name: 'Kuwait MEW', peakPosition: 0.15, description: 'Hyper-arid flash flood' },
  bahrain_met: { name: 'Bahrain MET', peakPosition: 0.15, description: 'Island microclimate convective' },
  yemen_cama: { name: 'Yemen CAMA', peakPosition: 0.25, description: 'Monsoonal south coast arid' },
  myanmar_dmh: { name: 'Myanmar DMH', peakPosition: 0.38, description: 'Monsoon + cyclone Yangon' },
  mekong_mrc: { name: 'Mekong MRC', peakPosition: 0.42, description: 'Regional monsoon tropical' },
  mononobe: { name: 'Mononobe Formula', peakPosition: 0.50, description: 'Classical Japanese IDF method' },
  uzbekistan_uhm: { name: 'Uzbekistan UHM', peakPosition: 0.32, description: 'Central Asian arid convective' },
  tunisia_inm: { name: 'Tunisia INM', peakPosition: 0.28, description: 'North African Mediterranean' },
  uganda_unma: { name: 'Uganda UNMA', peakPosition: 0.42, description: 'Bimodal tropical equatorial' },
  cameroon_ird: { name: 'Cameroon IRD', peakPosition: 0.42, description: 'Extreme wet zone ORSTOM' },
  madagascar_dgm: { name: 'Madagascar DGM', peakPosition: 0.40, description: 'Cyclone + monsoon + orographic' },
  mauritius_mms: { name: 'Mauritius MMS', peakPosition: 0.35, description: 'Tropical cyclone island' },
  cote_ivoire: { name: "Côte d'Ivoire SODEXAM", peakPosition: 0.40, description: 'West African Abidjan IDF' },
  namibia_nms: { name: 'Namibia NMS', peakPosition: 0.18, description: 'Hyper-arid Windhoek flash' },
  sudan_sma: { name: 'Sudan SMA', peakPosition: 0.25, description: 'Saharan to tropical gradient' },
  guatemala_insivumeh: { name: 'Guatemala INSIVUMEH', peakPosition: 0.40, description: 'Volcanic highland tropical' },
  cuba_insmet: { name: 'Cuba INSMET', peakPosition: 0.40, description: 'Hurricane-influenced Caribbean' },
  dominican_onamet: { name: 'Dominican ONAMET', peakPosition: 0.35, description: 'Caribbean hurricane + orographic' },
  jamaica_msj: { name: 'Jamaica MSJ', peakPosition: 0.35, description: 'Blue Mountains orographic' },
  trinidad_tobago: { name: 'Trinidad & Tobago', peakPosition: 0.40, description: 'ITCZ equatorial convective' },
  panama_etesa: { name: 'Panama ETESA', peakPosition: 0.42, description: 'Canal zone Pacific/Caribbean' },
  honduras_smn: { name: 'Honduras SMN', peakPosition: 0.38, description: 'Post-Mitch extreme design' },
  paraguay_dmh: { name: 'Paraguay DMH', peakPosition: 0.40, description: 'Subtropical SAMS monsoon' },
  uruguay_inumet: { name: 'Uruguay INUMET', peakPosition: 0.42, description: 'Temperate subtropical' },
  sao_paulo_daee: { name: 'São Paulo DAEE', peakPosition: 0.38, description: 'State-specific 20M+ people' },
  bogota_eaab: { name: 'Bogotá EAAB', peakPosition: 0.42, description: 'Highland bimodal 2600m' },
  lima_senamhi: { name: 'Lima SENAMHI', peakPosition: 0.12, description: 'El Niño coastal desert extreme' },
  png_nws: { name: 'Papua New Guinea NWS', peakPosition: 0.42, description: 'Extreme wet tropical maritime' },
  samoa_met: { name: 'Samoa MET', peakPosition: 0.40, description: 'Pacific cyclone 3000+ mm/yr' },
  hawaii_distinct: { name: 'Hawaii (Distinct)', peakPosition: 0.42, description: 'Trade wind + Kona + hurricane' },
  caltrans: { name: 'Caltrans', peakPosition: 0.48, description: 'California atmospheric river' },
  harris_county_fcd: { name: 'Harris County FCD', peakPosition: 0.45, description: 'Houston post-Harvey Gulf Coast' },
  maricopa_fcd: { name: 'Maricopa County FCD', peakPosition: 0.20, description: 'Phoenix monsoon flash flood' },
  la_county: { name: 'LA County LACDPW', peakPosition: 0.22, description: 'Burn area debris flow' },
  clark_county_nv: { name: 'Clark County (Las Vegas)', peakPosition: 0.18, description: 'Desert monsoon flash flood' },
  philadelphia_pwd: { name: 'Philadelphia PWD', peakPosition: 0.45, description: 'Green infrastructure design' },
  illinois_b75: { name: 'Illinois SWS B75', peakPosition: 0.42, description: 'Extended Huff methodology' },
  parabolic: { name: 'Parabolic', peakPosition: 0.50, description: 'Symmetric smooth zero-endpoint' },
  cosine_storm: { name: 'Raised Cosine', peakPosition: 0.50, description: 'Smooth no-discontinuity peak' },
  lognormal_temporal: { name: 'Log-Normal Temporal', peakPosition: 0.35, description: 'Right-skewed convective' },
  exponential_decay_storm: { name: 'Exponential Decay', peakPosition: 0.05, description: 'Front-loaded burst + tail' },
  power_curve_storm: { name: 'Power Curve', peakPosition: 0.40, description: 'Asymmetric generalized peak' },
  weibull_temporal: { name: 'Weibull Temporal', peakPosition: 0.42, description: 'Flexible peak and tail shape' },
  instantaneous_burst: { name: 'Instantaneous Burst', peakPosition: 0.50, description: 'Worst-case impulse response' },
  sigmoid_mass: { name: 'Sigmoid / Logistic', peakPosition: 0.50, description: 'S-curve smooth center peak' },
  medicane: { name: 'Medicane', peakPosition: 0.30, description: 'Mediterranean hurricane dual-peak' },
  polar_low: { name: 'Polar Low', peakPosition: 0.25, description: 'Arctic intense short-duration' },
  cutoff_low: { name: 'Cut-Off Low', peakPosition: 0.65, description: 'Slow-moving multi-day late peak' },
  mcs_storm: { name: 'MCS Storm', peakPosition: 0.40, description: 'Mesoscale organized convection' },
  supercell: { name: 'Supercell', peakPosition: 0.15, description: 'Extreme single-peak small catchment' },
  orographic_enhanced: { name: 'Orographic Enhanced', peakPosition: 0.60, description: 'Prolonged mountain uplift' },
  urban_heat_island: { name: 'Urban Heat Island', peakPosition: 0.30, description: 'City-enhanced convection' },
  monsoon_burst: { name: 'Monsoon Burst', peakPosition: 0.42, description: 'Active phase heavy rainfall' },
  squall_line: { name: 'Squall Line', peakPosition: 0.12, description: 'Narrow intense front-loaded' },
  sea_breeze: { name: 'Sea Breeze', peakPosition: 0.70, description: 'Late afternoon coastal convective' },
  nocturnal_mcs: { name: 'Nocturnal MCS', peakPosition: 0.65, description: 'Night-time organized late peak' },
  rain_on_snow: { name: 'Rain-on-Snow', peakPosition: 0.50, description: 'Compound sustained event' },
  derecho: { name: 'Derecho', peakPosition: 0.10, description: 'Fast-moving destructive burst' },
  ukcp18_enhanced: { name: 'UKCP18 Enhanced', peakPosition: 0.32, description: 'UK +4°C climate scenario' },
  super_cc: { name: 'Super-CC 14%/°C', peakPosition: 0.35, description: 'Double Clausius-Clapeyron scaling' },
  neyman_scott: { name: 'Neyman-Scott', peakPosition: 0.45, description: 'Stochastic cluster model' },
  temez_spain: { name: 'Témez (Spain)', peakPosition: 0.50, description: 'Classical Spanish IDF method' },
  bonta_usda: { name: 'Bonta (USDA)', peakPosition: 0.42, description: 'ARS 6000+ Midwest storm analysis' },
  georgian_nea: { name: 'Georgia NEA', peakPosition: 0.25, description: 'Caucasus front-loaded Mediterranean-influenced storms' },
  albanian_igewe: { name: 'Albanian IGEWE', peakPosition: 0.28, description: 'Adriatic Mediterranean front-loaded storms' },
  aes_50: { name: 'AES Canada 50%', peakPosition: 0.50, description: 'AES/ECCC 50% center-peaked distribution (Hogg 1980)' },
  ontario_mto_4hr: { name: 'Ontario MTO 4-hr', peakPosition: 0.25, description: 'Ontario Ministry of Transportation 4-hour highway design storm' },
  marsalek_1978: { name: 'Marsalek (1978)', peakPosition: 0.50, description: 'NRC Canada dimensionless urban drainage design storm' },
  quebec_melccfp: { name: 'Quebec MELCCFP', peakPosition: 0.50, description: 'Quebec provincial design storm for Great Lakes/St. Lawrence climate' },
  alberta_transportation: { name: 'Alberta Transportation', peakPosition: 0.35, description: 'Alberta highway drainage design for continental prairie climate' },
  prairie_short: { name: 'Prairie Short-Duration', peakPosition: 0.20, description: 'Canadian Prairie convective thunderstorm burst pattern' },
  bc_moe_coastal: { name: 'BC MOE Coastal', peakPosition: 0.50, description: 'British Columbia coastal orographic/frontal rainfall pattern' },
  pilgrim_cordery_ca: { name: 'Pilgrim-Cordery (Canada)', peakPosition: 0.50, description: 'Pilgrim-Cordery method adapted for Canadian jurisdictions' },
};

/**
 * Calculate comprehensive statistics for a storm timeseries
 */
export function analyzeStorm(data: RainfallDataPoint[]): StormStatistics {
  if (data.length === 0) {
    throw new Error('Empty storm data');
  }
  
  const duration = data[data.length - 1].time - data[0].time;
  const timeStep = data.length > 1 ? data[1].time - data[0].time : 15;
  
  // Basic metrics
  let totalDepth = 0;
  let peakIntensity = 0;
  let peakTime = 0;
  let peakIndex = 0;
  
  for (let i = 0; i < data.length; i++) {
    const intensity = data[i].intensity;
    totalDepth += intensity * (timeStep / 60);
    
    if (intensity > peakIntensity) {
      peakIntensity = intensity;
      peakTime = data[i].time;
      peakIndex = i;
    }
  }
  
  const peakPosition = duration > 0 ? peakTime / duration : 0.5;
  
  // Normalize intensities for statistical calculations
  const normalized = data.map(d => d.intensity / (peakIntensity || 1));
  
  // Calculate centroid (center of mass)
  let weightedSum = 0;
  let totalWeight = 0;
  for (let i = 0; i < data.length; i++) {
    const t = data[i].time / duration;
    weightedSum += t * data[i].intensity;
    totalWeight += data[i].intensity;
  }
  const centroid = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  
  // Calculate moments for skewness and kurtosis
  const n = data.length;
  const mean = normalized.reduce((a, b) => a + b, 0) / n;
  
  let m2 = 0, m3 = 0, m4 = 0;
  for (const val of normalized) {
    const diff = val - mean;
    m2 += diff * diff;
    m3 += diff * diff * diff;
    m4 += diff * diff * diff * diff;
  }
  m2 /= n;
  m3 /= n;
  m4 /= n;
  
  const stdDev = Math.sqrt(m2);
  const skewness = stdDev > 0 ? m3 / Math.pow(stdDev, 3) : 0;
  const kurtosis = stdDev > 0 ? m4 / Math.pow(stdDev, 4) - 3 : 0;
  
  // Quartile analysis
  const q1End = Math.floor(n * 0.25);
  const q2End = Math.floor(n * 0.5);
  const q3End = Math.floor(n * 0.75);
  
  let q1Depth = 0, q2Depth = 0, q3Depth = 0, q4Depth = 0;
  
  for (let i = 0; i < n; i++) {
    const depth = data[i].intensity * (timeStep / 60);
    if (i < q1End) q1Depth += depth;
    else if (i < q2End) q2Depth += depth;
    else if (i < q3End) q3Depth += depth;
    else q4Depth += depth;
  }
  
  const q1Fraction = totalDepth > 0 ? q1Depth / totalDepth : 0.25;
  const q2Fraction = totalDepth > 0 ? q2Depth / totalDepth : 0.25;
  const q3Fraction = totalDepth > 0 ? q3Depth / totalDepth : 0.25;
  const q4Fraction = totalDepth > 0 ? q4Depth / totalDepth : 0.25;
  
  const fractions = [q1Fraction, q2Fraction, q3Fraction, q4Fraction];
  const maxFraction = Math.max(...fractions);
  const dominantQuartile = (fractions.indexOf(maxFraction) + 1) as 1 | 2 | 3 | 4;
  
  // Rise and fall characteristics
  const riseDuration = peakTime;
  const fallDuration = duration - peakTime;
  
  const riseSlope = riseDuration > 0 ? peakIntensity / riseDuration : 0;
  const fallSlope = fallDuration > 0 ? peakIntensity / fallDuration : 0;
  const asymmetryRatio = fallSlope > 0 ? riseSlope / fallSlope : 1;
  
  return {
    totalDepth,
    duration,
    peakIntensity,
    peakTime,
    peakPosition,
    centroid,
    skewness,
    kurtosis,
    q1Fraction,
    q2Fraction,
    q3Fraction,
    q4Fraction,
    dominantQuartile,
    riseDuration,
    fallDuration,
    riseSlope,
    fallSlope,
    asymmetryRatio
  };
}

/**
 * Calculate similarity between two intensity arrays
 */
function calculateSimilarity(actual: number[], synthetic: number[]): {
  rmse: number;
  correlation: number;
  similarity: number;
} {
  // Resample to same length if needed
  const targetLen = Math.min(actual.length, synthetic.length);
  const resampleArray = (arr: number[], targetLen: number): number[] => {
    const result: number[] = [];
    for (let i = 0; i < targetLen; i++) {
      const srcIndex = (i / targetLen) * arr.length;
      const lower = Math.floor(srcIndex);
      const upper = Math.min(lower + 1, arr.length - 1);
      const fraction = srcIndex - lower;
      result.push(arr[lower] * (1 - fraction) + arr[upper] * fraction);
    }
    return result;
  };
  
  const a = resampleArray(actual, targetLen);
  const s = resampleArray(synthetic, targetLen);
  
  // Normalize both to 0-1 range for comparison
  const maxA = Math.max(...a);
  const maxS = Math.max(...s);
  const normA = a.map(v => maxA > 0 ? v / maxA : 0);
  const normS = s.map(v => maxS > 0 ? v / maxS : 0);
  
  // Calculate RMSE
  let sumSqErr = 0;
  for (let i = 0; i < targetLen; i++) {
    sumSqErr += Math.pow(normA[i] - normS[i], 2);
  }
  const rmse = Math.sqrt(sumSqErr / targetLen);
  
  // Calculate Pearson correlation
  const meanA = normA.reduce((acc, v) => acc + v, 0) / targetLen;
  const meanS = normS.reduce((acc, v) => acc + v, 0) / targetLen;
  
  let numerator = 0;
  let denomA = 0;
  let denomS = 0;
  
  for (let i = 0; i < targetLen; i++) {
    const diffA = normA[i] - meanA;
    const diffS = normS[i] - meanS;
    numerator += diffA * diffS;
    denomA += diffA * diffA;
    denomS += diffS * diffS;
  }
  
  const correlation = (denomA > 0 && denomS > 0) 
    ? numerator / Math.sqrt(denomA * denomS)
    : 0;
  
  // Composite similarity score (0-1)
  const rmseScore = Math.max(0, 1 - rmse * 2);
  const corrScore = Math.max(0, (correlation + 1) / 2);
  const similarity = 0.4 * rmseScore + 0.6 * corrScore;
  
  return { rmse, correlation, similarity };
}

/**
 * Match storm against all synthetic patterns
 */
export function matchPatterns(
  data: RainfallDataPoint[],
  statistics: StormStatistics
): PatternMatch[] {
  const patterns: PatternType[] = [
    'scs1', 'scs1a', 'scs2', 'scs3',
    'huff1', 'huff2', 'huff3', 'huff4',
    'chicago', 'fsr', 'triangular', 'trapezoidal',
    'arr', 'jma', 'china', 'sa_huff', 'dwa', 'dutch', 'italian',
    'desbordes', 'double', 'block',
    'balanced', 'yen_chow', 'noaa_a14',
    'fdot1', 'fdot2', 'fdot3', 'fdot4', 'fdot5', 'txdot',
    'udfcd', 'usace_sps', 'pmp_hmr', 'feh', 'euler1', 'euler2', 'desbordes_double', 'canadian',
    'singapore_pub', 'china_gb50014', 'china_prd', 'india_imd', 'india_coastal',
    'japan_amedas', 'japan_baiu', 'japan_typhoon', 'korea_kma'
  ];
  
  // Extract intensities from data
  const actualIntensities = data.map(d => d.intensity);
  const timeStep = data.length > 1 ? data[1].time - data[0].time : 15;
  
  const matches: PatternMatch[] = patterns.map(pattern => {
    const meta = patternMetadata[pattern];
    
    // Generate synthetic pattern with same parameters
    const syntheticIntensities = generateRainfallData(
      pattern,
      statistics.totalDepth,
      statistics.duration / 60, // Convert to hours
      timeStep
    );
    
    const { rmse, correlation, similarity } = calculateSimilarity(
      actualIntensities,
      syntheticIntensities
    );
    
    const peakPositionDiff = Math.abs(statistics.peakPosition - meta.peakPosition);
    
    // Adjust similarity based on peak position match
    const peakBonus = Math.max(0, 1 - peakPositionDiff * 2) * 0.2;
    const adjustedSimilarity = Math.min(1, similarity + peakBonus);
    
    return {
      pattern,
      patternName: meta.name,
      similarity: adjustedSimilarity,
      rmse,
      correlation,
      peakPositionDiff,
      description: meta.description
    };
  });
  
  // Sort by similarity descending
  matches.sort((a, b) => b.similarity - a.similarity);
  
  return matches;
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(
  statistics: StormStatistics,
  bestMatch: PatternMatch
): string[] {
  const recommendations: string[] = [];
  
  // Quartile-based recommendation
  if (statistics.dominantQuartile === 1 && bestMatch.pattern !== 'huff1') {
    recommendations.push(`Storm has 1st quartile dominance (${(statistics.q1Fraction * 100).toFixed(0)}%). Consider Huff Q1 pattern.`);
  } else if (statistics.dominantQuartile === 4 && bestMatch.pattern !== 'huff4') {
    recommendations.push(`Storm has 4th quartile dominance (${(statistics.q4Fraction * 100).toFixed(0)}%). Consider Huff Q4 pattern.`);
  }
  
  // Asymmetry recommendation
  if (statistics.asymmetryRatio > 2) {
    recommendations.push(`Storm has steep rise/slow fall (ratio: ${statistics.asymmetryRatio.toFixed(1)}). Typical of frontal systems.`);
  } else if (statistics.asymmetryRatio < 0.5) {
    recommendations.push(`Storm has slow rise/steep fall (ratio: ${statistics.asymmetryRatio.toFixed(1)}). Typical of convective events.`);
  }
  
  // Peak position recommendation
  if (statistics.peakPosition < 0.3) {
    recommendations.push(`Early peak (${(statistics.peakPosition * 100).toFixed(0)}% of duration). Consider SCS Type IA or Huff Q1.`);
  } else if (statistics.peakPosition > 0.7) {
    recommendations.push(`Late peak (${(statistics.peakPosition * 100).toFixed(0)}% of duration). Consider Huff Q4.`);
  }
  
  // Match quality recommendation
  if (bestMatch.similarity < 0.6) {
    recommendations.push(`Best match similarity is low (${(bestMatch.similarity * 100).toFixed(0)}%). Storm may have unique characteristics not captured by standard patterns.`);
  } else if (bestMatch.similarity > 0.85) {
    recommendations.push(`Excellent match with ${bestMatch.patternName} (${(bestMatch.similarity * 100).toFixed(0)}% similarity). Safe to use this pattern for modeling.`);
  }
  
  // Skewness recommendation
  if (Math.abs(statistics.skewness) > 1.5) {
    const direction = statistics.skewness > 0 ? 'right-skewed' : 'left-skewed';
    recommendations.push(`Storm distribution is ${direction} (skewness: ${statistics.skewness.toFixed(2)}). May represent unusual meteorological conditions.`);
  }
  
  return recommendations;
}

/**
 * Perform complete storm analysis
 */
export function analyzeStormComplete(data: RainfallDataPoint[]): AnalysisResult {
  const statistics = analyzeStorm(data);
  const matches = matchPatterns(data, statistics);
  const bestMatch = matches[0];
  const recommendations = generateRecommendations(statistics, bestMatch);
  
  return {
    statistics,
    matches,
    bestMatch,
    recommendations
  };
}

/**
 * Get pattern metadata for display
 */
export function getPatternInfo(pattern: PatternType) {
  return patternMetadata[pattern];
}
