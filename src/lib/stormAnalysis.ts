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
  adamowski_pacific: { name: 'Adamowski-Alila Pacific', peakPosition: 0.50, description: 'Adamowski & Alila (1996) Pacific region — prolonged frontal/orographic rainfall' },
  adamowski_prairie: { name: 'Adamowski-Alila Prairie', peakPosition: 0.30, description: 'Adamowski & Alila (1996) Prairie region — sharp convective peak' },
  adamowski_greatlakes: { name: 'Adamowski-Alila Great Lakes', peakPosition: 0.45, description: 'Adamowski & Alila (1996) Great Lakes region — frontal/convective mix' },
  adamowski_stlawrence: { name: 'Adamowski-Alila St. Lawrence', peakPosition: 0.50, description: 'Adamowski & Alila (1996) St. Lawrence region — moderate central peak' },
  adamowski_atlantic: { name: 'Adamowski-Alila Atlantic', peakPosition: 0.50, description: 'Adamowski & Alila (1996) Atlantic region — maritime frontal, gradual' },
  adamowski_northern: { name: 'Adamowski-Alila Northern', peakPosition: 0.50, description: 'Adamowski & Alila (1996) Northern region — low intensity, uniform' },
  winnipeg_maclaren: { name: 'Winnipeg MacLaren', peakPosition: 0.40, description: 'City of Winnipeg Drainage Criteria Manual modified Chicago distribution' },
  // v15 — IDF-only country storm patterns
  senegal_anacim: { name: 'Senegal ANACIM', peakPosition: 0.20, description: 'Sahel monsoon burst front-loaded pattern' },
  rwanda_meteo: { name: 'Rwanda Météo', peakPosition: 0.45, description: 'Highland tropical convective center-peaked' },
  zimbabwe_zmd: { name: 'Zimbabwe ZMD', peakPosition: 0.32, description: 'Subtropical summer thunderstorm early-center peak' },
  zambia_zmd: { name: 'Zambia ZMD', peakPosition: 0.42, description: 'ITCZ-influenced tropical wet season center-peaked' },
  mali_dnm: { name: 'Mali DNM', peakPosition: 0.18, description: 'Sahel squall line very front-loaded burst' },
  burkina_anam: { name: 'Burkina Faso ANAM', peakPosition: 0.20, description: 'West African Sahel MCS front-loaded' },
  angola_inamet: { name: 'Angola INAMET', peakPosition: 0.40, description: 'Tropical maritime/continental transition' },
  congo_mettelsat: { name: 'Congo DRC METTELSAT', peakPosition: 0.42, description: 'Equatorial convective center-peaked' },
  laos_dmh: { name: 'Laos DMH', peakPosition: 0.30, description: 'Southeast Asian monsoon early-center peaked' },
  brunei_bdmd: { name: 'Brunei BDMD', peakPosition: 0.25, description: 'Equatorial maritime front-loaded tropical burst' },
  // v16
  keifer_chu: { name: 'Keifer-Chu (1957)', peakPosition: 0.375, description: 'Original instantaneous intensity method by Keifer & Chu (1957)' },
  alternating_block: { name: 'Alternating Block', peakPosition: 0.50, description: 'NRCS/HEC Alternating Block Method, IDF-derived symmetric arrangement' },
  gauteng_wrc: { name: 'Gauteng WRC', peakPosition: 0.45, description: 'South Africa WRC Gauteng convective center-peaked' },
  botswana_dms: { name: 'Botswana DMS', peakPosition: 0.35, description: 'Semi-arid convective front-to-center peaked' },
  cambodia_mowram: { name: 'Cambodia MOWRAM', peakPosition: 0.28, description: 'Tropical monsoon early-peaked convective' },
  timor_leste_dnmg: { name: 'Timor-Leste DNMG', peakPosition: 0.25, description: 'Tropical maritime intense short bursts' },
  armenia_hydromet: { name: 'Armenia Hydromet', peakPosition: 0.48, description: 'Continental highland center-peaked convective' },
  azerbaijan_nhms: { name: 'Azerbaijan NHMS', peakPosition: 0.40, description: 'Semi-arid Caspian front-center peaked' },
  moldova_shs: { name: 'Moldova SHS', peakPosition: 0.48, description: 'Continental Eastern Europe center-peaked' },
  north_macedonia_hms: { name: 'North Macedonia HMS', peakPosition: 0.45, description: 'Continental-Mediterranean transition' },
  bosnia_fhmz: { name: 'Bosnia & Herzegovina FHMZ', peakPosition: 0.47, description: 'Mediterranean-continental mix' },
  montenegro_ihms: { name: 'Montenegro IHMS', peakPosition: 0.42, description: 'Adriatic coast heavy orographic precipitation' },
  seychelles_sma: { name: 'Seychelles SMA', peakPosition: 0.25, description: 'Tropical maritime intense early peak' },
  maldives_mms: { name: 'Maldives MMS', peakPosition: 0.28, description: 'Low-lying atoll tropical convective' },
  cape_verde_inmg: { name: 'Cape Verde INMG', peakPosition: 0.30, description: 'Sahelian-maritime front-loaded tropical' },
  eritrea_dme: { name: 'Eritrea DME', peakPosition: 0.32, description: 'Semi-arid East Africa intense short bursts' },
  tajikistan_hydromet: { name: 'Tajikistan Hydromet', peakPosition: 0.48, description: 'High-altitude continental center-peaked' },
  kyrgyzstan_hydromet: { name: 'Kyrgyzstan Hydromet', peakPosition: 0.50, description: 'Mountain continental late-center peaked' },
  gaussian_storm: { name: 'Gaussian Storm', peakPosition: 0.50, description: 'Symmetric bell-curve normal distribution' },
  burundi_igebu: { name: 'Burundi IGEBU', peakPosition: 0.35, description: 'Tropical highland center-front peaked' },
  // v17
  bhutan_scs: { name: 'Bhutan SCS', peakPosition: 0.42, description: 'Southern Belt SCS-adapted design storm' },
  belize_flood: { name: 'Belize Flood Hazard', peakPosition: 0.35, description: 'Central American coastal flood design' },
  comoros_post_kenneth: { name: 'Comoros Post-Kenneth', peakPosition: 0.30, description: 'Tropical cyclone recovery design storm' },
  delta_change: { name: 'Delta Change Method', peakPosition: 0.50, description: 'Climate-adjusted historical scaling method' },
  dominica_charim: { name: 'Dominica CHaRIM', peakPosition: 0.35, description: 'Caribbean Gumbel-based design storm' },
  epa_swmm_cat: { name: 'EPA SWMM-CAT', peakPosition: 0.50, description: 'Climate Assessment Tool design storm' },
  faa_airport: { name: 'FAA Standard', peakPosition: 0.45, description: 'Airport drainage design standard' },
  gabon_francophone: { name: 'Gabon Francophone', peakPosition: 0.30, description: 'French African design methodology' },
  gambia_rna: { name: 'Gambia RNA', peakPosition: 0.25, description: 'Rapid Needs Assessment West African' },
  grenada_charim: { name: 'Grenada CHaRIM', peakPosition: 0.38, description: 'Johnson SB distribution Caribbean' },
  guyana_drainage: { name: 'Guyana Drainage', peakPosition: 0.40, description: 'Modified rational method South American' },
  haiti_marndr: { name: 'Haiti MARNDR', peakPosition: 0.45, description: 'HEC-HMS alternating block Caribbean' },
  jamaica_jie: { name: 'Jamaica JIE', peakPosition: 0.42, description: 'Jamaica Institution of Engineers guidelines' },
  johnson_sb_caribbean: { name: 'Johnson SB Caribbean', peakPosition: 0.38, description: 'Johnson SB probability distribution' },
  kosovo_nothas: { name: 'Kosovo NOTHAS', peakPosition: 0.45, description: 'Southeastern European continental' },
  laos_jica: { name: 'Laos JICA', peakPosition: 0.30, description: 'JICA-developed SE Asian monsoon pattern' },
  liberia_regional: { name: 'Liberia Regional', peakPosition: 0.25, description: 'West African tropical front-loaded' },
  mali_lmoments: { name: 'Mali L-moments', peakPosition: 0.20, description: 'Bani Basin L-moments analysis' },
  marshall_islands: { name: 'Marshall Islands', peakPosition: 0.35, description: 'Pacific atoll coastal protection design' },
  mauritania_regional: { name: 'Mauritania Regional', peakPosition: 0.22, description: 'Saharan-Sahelian arid design storm' },
  micronesia_fsm: { name: 'Micronesia FSM', peakPosition: 0.30, description: 'Pacific island tropical convective' },
  moldova_urban: { name: 'Moldova Urban Drainage', peakPosition: 0.48, description: 'Eastern European urban drainage design' },
  mongolia_ulaanbaatar: { name: 'Mongolia Ulaanbaatar', peakPosition: 0.45, description: 'Continental steppe urban design' },
  montenegro_regional: { name: 'Montenegro Regional', peakPosition: 0.42, description: 'Adriatic coast regional standard' },
  myanmar_yangon: { name: 'Myanmar Yangon IDF', peakPosition: 0.28, description: 'Monsoon tropical urban IDF-derived' },
  nauru_regional: { name: 'Nauru Regional', peakPosition: 0.30, description: 'Pacific island regional approach' },
  niger_regional: { name: 'Niger Regional', peakPosition: 0.20, description: 'Sahel arid front-loaded design storm' },
  nonstationary_gev: { name: 'Non-stationary GEV IDF', peakPosition: 0.50, description: 'Climate non-stationary GEV analysis' },
  north_macedonia_regional: { name: 'North Macedonia Regional', peakPosition: 0.45, description: 'Balkan continental-Mediterranean' },
  palau_usace: { name: 'Palau USACE', peakPosition: 0.42, description: 'USACE TR-55 Pacific island design' },
  partial_duration: { name: 'Partial Duration Series', peakPosition: 0.50, description: 'PDS-based frequency analysis' },
  qatar_qrrc: { name: 'Qatar QRRC', peakPosition: 0.35, description: 'Qatar Rainfall Runoff Center design' },
  quantile_delta: { name: 'Quantile Delta Mapping', peakPosition: 0.50, description: 'Climate bias-corrected QDM method' },
  rwanda_regional_idf: { name: 'Rwanda Regionalized IDF', peakPosition: 0.40, description: '5-region East African IDF design' },
  saint_lucia_charim: { name: 'Saint Lucia CHaRIM', peakPosition: 0.38, description: 'Johnson SB Caribbean alternating block' },
  saint_vincent_charim: { name: 'Saint Vincent CHaRIM', peakPosition: 0.38, description: 'Caribbean LISEM-based design storm' },
  samoa_sopac: { name: 'Samoa SOPAC', peakPosition: 0.32, description: 'Pacific SOPAC flood management design' },
  seychelles_scs3: { name: 'Seychelles SCS Type 3', peakPosition: 0.40, description: 'SA SCS Type 3 adapted for Indian Ocean' },
  sierra_leone_roads: { name: 'Sierra Leone Roads', peakPosition: 0.30, description: 'Low Volume Roads IDF design' },
  solomon_islands: { name: 'Solomon Islands', peakPosition: 0.32, description: 'Honiara World Bank design storm' },
  sst_transposition: { name: 'SST', peakPosition: 0.50, description: 'Stochastic Storm Transposition method' },
  suriname_paramaribo: { name: 'Suriname Paramaribo', peakPosition: 0.40, description: 'NOAA 24hr Latin America/Caribbean' },
  tank_model: { name: 'Tank Model', peakPosition: 0.35, description: 'Laos/Myanmar tank model rainfall input' },
  turkmenistan: { name: 'Turkmenistan', peakPosition: 0.45, description: 'Central Asian NWP-based design storm' },
  tuvalu_tcap: { name: 'Tuvalu TCAP/UNDP', peakPosition: 0.35, description: 'Coastal hazard storm modelling' },
  vanuatu_vankirap: { name: 'Vanuatu Van-KIRAP', peakPosition: 0.38, description: 'Road design IDF with climate scaling' },
  xgboost_storm: { name: 'XGBoost Storm Prediction', peakPosition: 0.50, description: 'ML-based storm pattern prediction' },
  zimbabwe_sala: { name: 'Zimbabwe Sala Manuals', peakPosition: 0.42, description: 'Highway stormwater drainage design' },
  abu_dhabi_upc: { name: 'Abu Dhabi UPC/DM Combined', peakPosition: 0.4, description: 'Abu Dhabi unified planning and drainage management' },
  sharjah_sewa: { name: 'Sharjah SEWA', peakPosition: 0.38, description: 'Sharjah Electricity and Water Authority drainage c' },
  abu_dhabi_climate: { name: 'Abu Dhabi Climate-Adjusted', peakPosition: 0.42, description: 'Forward-looking criteria accounting for observed U' },
  saudi_aramco: { name: 'Saudi Aramco', peakPosition: 0.35, description: 'Oil sector industrial facility drainage criteria S' },
  saudi_momrah: { name: 'Saudi MoMRAH', peakPosition: 0.4, description: 'Ministry of Municipal, Rural Affairs and Housing s' },
  neom_design: { name: 'NEOM Design Storm', peakPosition: 0.45, description: 'NEOM mega-project emerging design criteria Saudi A' },
  qatar_kahramaa_enhanced: { name: 'Qatar Kahramaa Enhanced', peakPosition: 0.38, description: 'Updated Qatar criteria post-2024 extreme events' },
  iran_irimo_regional: { name: 'Iran IRIMO Regional', peakPosition: 0.42, description: 'Regional variations beyond national IRIMO criteria' },
  iraq_mosul: { name: 'Iraq Mosul', peakPosition: 0.35, description: 'Northern Iraq region-specific design criteria' },
  yemen_sanaa: { name: 'Yemen Sanaa', peakPosition: 0.45, description: 'Highland criteria for Sanaa Basin stormwater desi' },
  bc_moe_interior: { name: 'BC MOE Interior', peakPosition: 0.45, description: 'British Columbia interior region design storm' },
  bc_moe_northern: { name: 'BC MOE Northern', peakPosition: 0.48, description: 'Northern British Columbia design storm criteria' },
  ontario_mto_2hr: { name: 'Ontario MTO 2-hr', peakPosition: 0.3, description: 'Ontario Ministry of Transportation 2-hour design s' },
  ontario_mto_12hr: { name: 'Ontario MTO 12-hr', peakPosition: 0.45, description: 'Ontario Ministry of Transportation 12-hour design ' },
  ontario_moecp: { name: 'Ontario MOECP', peakPosition: 0.48, description: 'Ontario Ministry of Environment, Conservation and ' },
  quebec_mtq: { name: 'Quebec MTQ', peakPosition: 0.45, description: 'Ministère des Transports du Québec highway drainag' },
  manitoba_mi: { name: 'Manitoba MI', peakPosition: 0.35, description: 'Manitoba Infrastructure drainage design criteria' },
  saskatchewan_wsa: { name: 'Saskatchewan WSA', peakPosition: 0.3, description: 'Water Security Agency prairie drainage criteria' },
  alberta_esrd: { name: 'Alberta ESRD', peakPosition: 0.38, description: 'Alberta Environment and Sustainable Resource Devel' },
  nwt_enr: { name: 'Northwest Territories ENR', peakPosition: 0.5, description: 'NWT Environment and Natural Resources criteria' },
  nunavut_cws: { name: 'Nunavut CWS', peakPosition: 0.5, description: 'Nunavut Community and Government Services design' },
  yukon_highways: { name: 'Yukon Highways', peakPosition: 0.42, description: 'Yukon Department of Highways and Public Works' },
  alaska_dotpf: { name: 'Alaska DOT&PF', peakPosition: 0.45, description: 'Alaska Department of Transportation criteria' },
  arizona_adot: { name: 'Arizona ADOT', peakPosition: 0.2, description: 'Arizona DOT desert monsoon drainage design' },
  new_mexico_nmdot: { name: 'New Mexico NMDOT', peakPosition: 0.22, description: 'New Mexico DOT arid/semi-arid drainage design' },
  montana_mdt: { name: 'Montana MDT', peakPosition: 0.4, description: 'Montana DOT mountain/plains drainage criteria' },
  wyoming_wydot: { name: 'Wyoming WYDOT', peakPosition: 0.38, description: 'Wyoming DOT high plains drainage design' },
  idaho_itd: { name: 'Idaho ITD', peakPosition: 0.42, description: 'Idaho Transportation Department drainage criteria' },
  north_dakota_nddot: { name: 'North Dakota NDDOT', peakPosition: 0.35, description: 'North Dakota DOT prairie drainage design' },
  south_dakota_sddot: { name: 'South Dakota SDDOT', peakPosition: 0.35, description: 'South Dakota DOT Great Plains criteria' },
  nebraska_ndot: { name: 'Nebraska NDOT', peakPosition: 0.38, description: 'Nebraska DOT central plains design criteria' },
  kansas_kdot: { name: 'Kansas KDOT', peakPosition: 0.4, description: 'Kansas DOT Great Plains drainage criteria' },
  oklahoma_odot: { name: 'Oklahoma ODOT', peakPosition: 0.35, description: 'Oklahoma DOT severe weather drainage design' },
  arkansas_ardot: { name: 'Arkansas ArDOT', peakPosition: 0.42, description: 'Arkansas DOT Gulf moisture drainage criteria' },
  louisiana_dotd: { name: 'Louisiana DOTD', peakPosition: 0.4, description: 'Louisiana DOT tropical/subtropical drainage design' },
  mississippi_mdot: { name: 'Mississippi MDOT', peakPosition: 0.42, description: 'Mississippi DOT Gulf Coast drainage criteria' },
  alabama_aldot: { name: 'Alabama ALDOT', peakPosition: 0.42, description: 'Alabama DOT southeastern humid drainage design' },
  georgia_gdot: { name: 'Georgia GDOT', peakPosition: 0.45, description: 'Georgia DOT Piedmont/Coastal Plain criteria' },
  south_carolina_scdot: { name: 'South Carolina SCDOT', peakPosition: 0.42, description: 'South Carolina DOT coastal drainage design' },
  north_carolina_ncdot: { name: 'North Carolina NCDOT', peakPosition: 0.45, description: 'North Carolina DOT mountain-to-coast criteria' },
  virginia_vdot: { name: 'Virginia VDOT', peakPosition: 0.45, description: 'Virginia DOT Mid-Atlantic drainage design' },
  maryland_sha: { name: 'Maryland SHA', peakPosition: 0.45, description: 'Maryland State Highway Administration drainage cri' },
  pennsylvania_penndot: { name: 'Pennsylvania PennDOT', peakPosition: 0.45, description: 'Pennsylvania DOT Appalachian drainage design' },
  new_york_nysdot: { name: 'New York NYSDOT', peakPosition: 0.45, description: 'New York State DOT drainage criteria' },
  new_jersey_njdot: { name: 'New Jersey NJDOT', peakPosition: 0.45, description: 'New Jersey DOT coastal/urban drainage criteria' },
  connecticut_ctdot: { name: 'Connecticut CTDOT', peakPosition: 0.48, description: 'Connecticut DOT New England drainage design' },
  rhode_island_ridot: { name: 'Rhode Island RIDOT', peakPosition: 0.48, description: 'Rhode Island DOT coastal drainage criteria' },
  massachusetts_massdot: { name: 'Massachusetts MassDOT', peakPosition: 0.48, description: 'Massachusetts DOT New England drainage design' },
  vermont_vtrans: { name: 'Vermont VTrans', peakPosition: 0.48, description: 'Vermont Agency of Transportation drainage criteria' },
  new_hampshire_nhdot: { name: 'New Hampshire NHDOT', peakPosition: 0.48, description: 'New Hampshire DOT mountain/valley drainage design' },
  maine_mainedot: { name: 'Maine MaineDOT', peakPosition: 0.48, description: 'Maine DOT northern New England drainage criteria' },
  argentina_ina: { name: 'Argentina INA', peakPosition: 0.42, description: 'Instituto Nacional del Agua design criteria' },
  argentina_adt: { name: 'Argentina ADT', peakPosition: 0.4, description: 'Buenos Aires Province hydraulic drainage criteria' },
  chile_idic: { name: 'Chile IDIC', peakPosition: 0.38, description: 'Regional variations beyond DGA national standard' },
  peru_provias: { name: 'Peru PROVÍAS', peakPosition: 0.4, description: 'National roads infrastructure drainage criteria' },
  colombia_invias: { name: 'Colombia INVIAS', peakPosition: 0.42, description: 'National roads institute drainage criteria' },
  ecuador_emaapq: { name: 'Ecuador EMAAP-Q', peakPosition: 0.45, description: 'Quito municipal water authority design storm' },
  bolivia_sepsa: { name: 'Bolivia SEPSA', peakPosition: 0.4, description: 'Public works drainage standards Bolivia' },
  paraguay_dnp: { name: 'Paraguay DNP', peakPosition: 0.42, description: 'Dirección Nacional de Proyectos drainage design' },
  nicaragua_ineter: { name: 'Nicaragua INETER', peakPosition: 0.35, description: 'Instituto Nicaragüense de Estudios Territoriales' },
  el_salvador_mop: { name: 'El Salvador MOP', peakPosition: 0.38, description: 'Ministerio de Obras Públicas drainage criteria' },
  honduras_soptravi: { name: 'Honduras SOPTRAVI', peakPosition: 0.35, description: 'Secretaría de Obras Públicas drainage design' },
  guatemala_civ: { name: 'Guatemala CIV', peakPosition: 0.38, description: 'Regional drainage beyond INSIVUMEH criteria' },
  panama_mop: { name: 'Panama MOP', peakPosition: 0.42, description: 'Ministerio de Obras Públicas drainage criteria' },
  costa_rica_mopt: { name: 'Costa Rica MOPT', peakPosition: 0.4, description: 'Ministerio de Obras Públicas y Transporte drainage' },
  caribbean_cdema: { name: 'Caribbean CDEMA', peakPosition: 0.38, description: 'Caribbean Disaster Emergency Management Agency cri' },
  czech_dia: { name: 'Czech DIA', peakPosition: 0.45, description: 'Czech road infrastructure drainage criteria' },
  slovak_shmu: { name: 'Slovak SHMU', peakPosition: 0.48, description: 'Slovak Hydrometeorological Institute design storm' },
  slovenian_mop: { name: 'Slovenian MOP', peakPosition: 0.45, description: 'Ministry of Infrastructure drainage criteria beyon' },
  croatian_hv: { name: 'Croatian HRVATSKE VODE', peakPosition: 0.45, description: 'Water management agency drainage criteria' },
  greek_ye: { name: 'Greek YE', peakPosition: 0.42, description: 'Ministry of Environment drainage infrastructure cr' },
  swedish_smhi_urban: { name: 'Swedish SMHI Urban', peakPosition: 0.4, description: 'Urban-specific Swedish drainage criteria' },
  danish_svk_urban: { name: 'Danish SVK Urban', peakPosition: 0.42, description: 'Urban-specific Danish drainage criteria' },
  finnish_ely: { name: 'Finnish ELY', peakPosition: 0.45, description: 'Regional ELY-centres drainage criteria Finland' },
  norwegian_nve_urban: { name: 'Norwegian NVE Urban', peakPosition: 0.42, description: 'Urban drainage criteria Norway' },
  polish_imgw_urban: { name: 'Poland IMGW Urban', peakPosition: 0.42, description: 'Urban-specific drainage criteria Poland' },
  hungarian_kovizig: { name: 'Hungarian KÖVÍZIG', peakPosition: 0.45, description: 'Regional water management authority criteria' },
  romanian_anar: { name: 'Romanian ANAR', peakPosition: 0.45, description: 'National water administration drainage criteria' },
  bulgarian_nimh_urban: { name: 'Bulgarian NIMH Urban', peakPosition: 0.42, description: 'Urban drainage criteria Bulgaria' },
  ukrainian_dstu: { name: 'Ukrainian DSTU', peakPosition: 0.48, description: 'National standard drainage criteria distinct from ' },
  russian_sp: { name: 'Russian SP', peakPosition: 0.45, description: 'Building codes drainage criteria distinct from SNi' },
  icelandic_lhf: { name: 'Icelandic LHF', peakPosition: 0.5, description: 'Local flood drainage criteria Iceland' },
  egypt_capw: { name: 'Egypt CAPW', peakPosition: 0.38, description: 'Cairo and Alexandria Potable Water Authority crite' },
  morocco_ormvat: { name: 'Morocco ORMVAT', peakPosition: 0.35, description: 'Regional irrigation and drainage criteria Morocco' },
  algeria_anrh_urban: { name: 'Algeria ANRH Urban', peakPosition: 0.32, description: 'Urban-specific drainage criteria Algeria' },
  tunisia_anpe: { name: 'Tunisia ANPE', peakPosition: 0.38, description: 'National environment agency drainage criteria' },
  ethiopia_addis: { name: 'Ethiopia Addis Ababa', peakPosition: 0.4, description: 'City-specific Addis Ababa drainage design' },
  kenya_nairobi: { name: 'Kenya Nairobi City', peakPosition: 0.35, description: 'Municipal drainage criteria Nairobi' },
  tanzania_dawasa: { name: 'Tanzania DAWASA', peakPosition: 0.38, description: 'Dar es Salaam water authority drainage criteria' },
  uganda_nwsc: { name: 'Uganda NWSC', peakPosition: 0.4, description: 'National Water and Sewerage Corporation criteria' },
  ghana_accra: { name: 'Ghana Accra AMA', peakPosition: 0.3, description: 'Accra Metropolitan Assembly drainage design' },
  nigeria_lagos: { name: 'Nigeria Lagos LSWB', peakPosition: 0.35, description: 'Lagos State drainage and water criteria' },
  nigeria_abuja: { name: 'Nigeria Abuja FCDA', peakPosition: 0.38, description: 'Federal Capital Territory drainage criteria' },
  sa_johannesburg: { name: 'South Africa Johannesburg', peakPosition: 0.42, description: 'Johannesburg city-specific drainage criteria' },
  sa_cape_town: { name: 'South Africa Cape Town', peakPosition: 0.5, description: 'Cape Town city-specific drainage criteria' },
  angola_dna: { name: 'Angola DNA', peakPosition: 0.38, description: 'Direcção Nacional de Águas drainage criteria' },
  mozambique_maputo: { name: 'Mozambique Maputo', peakPosition: 0.35, description: 'Maputo city-specific drainage criteria' },
  zambia_warma: { name: 'Zambia WARMA', peakPosition: 0.4, description: 'Water Resources Management Authority criteria' },
  zimbabwe_zinwa: { name: 'Zimbabwe ZINWA', peakPosition: 0.38, description: 'Zimbabwe National Water Authority criteria' },
  china_mohurd: { name: 'China MOHURD', peakPosition: 0.42, description: 'Ministry of Housing and Urban-Rural Development cr' },
  china_beijing: { name: 'China Beijing', peakPosition: 0.45, description: 'Beijing municipal drainage design criteria' },
  china_shanghai: { name: 'China Shanghai', peakPosition: 0.42, description: 'Shanghai municipal drainage design criteria' },
  china_guangzhou: { name: 'China Guangzhou', peakPosition: 0.38, description: 'Guangzhou municipal drainage design criteria' },
  china_shenzhen: { name: 'China Shenzhen', peakPosition: 0.4, description: 'Shenzhen municipal drainage design criteria' },
  japan_mlit_urban: { name: 'Japan MLIT Urban', peakPosition: 0.45, description: 'MLIT urban drainage infrastructure criteria' },
  japan_osaka: { name: 'Japan Osaka City', peakPosition: 0.42, description: 'Osaka municipal drainage design criteria' },
  korea_moe_urban: { name: 'Korea MOE Urban', peakPosition: 0.45, description: 'Ministry of Environment urban drainage criteria' },
  taiwan_moiwr: { name: 'Taiwan MOIWR', peakPosition: 0.42, description: 'Ministry of Interior Water Resources Agency criter' },
  singapore_pub_urban: { name: 'Singapore PUB Urban', peakPosition: 0.45, description: 'PUB urban-specific drainage variations' },
  malaysia_did: { name: 'Malaysia DID', peakPosition: 0.35, description: 'Department of Irrigation and Drainage criteria' },
  philippines_mmda: { name: 'Philippines MMDA', peakPosition: 0.3, description: 'Metro Manila drainage and flood criteria' },
  vietnam_hanoi: { name: 'Vietnam Hanoi', peakPosition: 0.35, description: 'Hanoi city-specific drainage design criteria' },
  vietnam_hcmc: { name: 'Vietnam HCMC', peakPosition: 0.32, description: 'Ho Chi Minh City drainage design criteria' },
  thailand_bma: { name: 'Thailand BMA', peakPosition: 0.3, description: 'Bangkok Metropolitan Administration drainage crite' },
  indonesia_jakarta: { name: 'Indonesia DKI Jakarta', peakPosition: 0.28, description: 'Jakarta provincial drainage design criteria' },
  myanmar_ycdc: { name: 'Myanmar Yangon YCDC', peakPosition: 0.28, description: 'Yangon City Development Committee drainage criteri' },
  bangladesh_dwasa: { name: 'Bangladesh DWASA', peakPosition: 0.3, description: 'Dhaka Water and Sewerage Authority drainage criter' },
  sri_lanka_nbro: { name: 'Sri Lanka NBRO', peakPosition: 0.35, description: 'National Building Research Organization criteria' },
  nepal_kukl: { name: 'Nepal Kathmandu KUKL', peakPosition: 0.4, description: 'Kathmandu Upatyaka Khanepani Limited drainage crit' },
  pakistan_lda: { name: 'Pakistan LDA', peakPosition: 0.3, description: 'Lahore Development Authority drainage criteria' },
  pakistan_cda: { name: 'Pakistan CDA Islamabad', peakPosition: 0.35, description: 'Capital Development Authority drainage criteria' },
  afghanistan_momp: { name: 'Afghanistan MOMP', peakPosition: 0.32, description: 'Ministry of Public Works drainage criteria' },
  aus_nsw_oeh: { name: 'Australian NSW OEH', peakPosition: 0.42, description: 'New South Wales Office of Environment drainage cri' },
  aus_vic_delwp: { name: 'Australian VIC DELWP', peakPosition: 0.45, description: 'Victoria Department of Environment drainage criter' },
  aus_qld_dnrme: { name: 'Australian QLD DNRME', peakPosition: 0.38, description: 'Queensland Department of Natural Resources criteri' },
  aus_wa_dwer: { name: 'Australian WA DWER', peakPosition: 0.4, description: 'Western Australia Department of Water criteria' },
  aus_sa_epa: { name: 'Australian SA EPA', peakPosition: 0.45, description: 'South Australia Environment Protection Authority c' },
  aus_tas_dpiwe: { name: 'Australian TAS DPIWE', peakPosition: 0.48, description: 'Tasmania Department of Primary Industries criteria' },
  aus_act_epsdd: { name: 'Australian ACT EPSDD', peakPosition: 0.45, description: 'ACT Environment, Planning and Sustainable Developm' },
  aus_nt_depws: { name: 'Australian NT DEPWS', peakPosition: 0.35, description: 'Northern Territory Department of Environment crite' },
  nz_auckland_ac: { name: 'New Zealand Auckland AC', peakPosition: 0.42, description: 'Auckland Council drainage design criteria' },
  nz_wellington_gwrc: { name: 'New Zealand Wellington GWRC', peakPosition: 0.48, description: 'Greater Wellington Regional Council criteria' },
  nz_christchurch_ccc: { name: 'New Zealand Christchurch CCC', peakPosition: 0.45, description: 'Christchurch City Council drainage criteria' },
  fiji_ndmo: { name: 'Fiji NDMO', peakPosition: 0.35, description: 'National Disaster Management Office drainage crite' },
  png_ncd: { name: 'PNG NCD', peakPosition: 0.3, description: 'National Capital District drainage criteria' },
  pmp_hmr49: { name: 'PMP HMR 49', peakPosition: 0.45, description: 'Probable Maximum Precipitation Northwest US' },
  pmp_hmr50: { name: 'PMP HMR 50', peakPosition: 0.5, description: 'Probable Maximum Precipitation East of 105°W' },
  pmp_hmr52: { name: 'PMP HMR 52', peakPosition: 0.48, description: 'Probable Maximum Precipitation Southeastern US' },
  pmp_hmr53: { name: 'PMP HMR 53', peakPosition: 0.45, description: 'Probable Maximum Precipitation Northwestern US' },
  pmp_hmr55: { name: 'PMP HMR 55', peakPosition: 0.42, description: 'Probable Maximum Precipitation Texas' },
  pmp_hmr57: { name: 'PMP HMR 57', peakPosition: 0.45, description: 'Probable Maximum Precipitation California' },
  pmp_hmr58: { name: 'PMP HMR 58', peakPosition: 0.4, description: 'Probable Maximum Precipitation Nevada' },
  pmp_hmr59: { name: 'PMP HMR 59', peakPosition: 0.42, description: 'Probable Maximum Precipitation Colorado' },
  pmp_hmr60: { name: 'PMP HMR 60', peakPosition: 0.4, description: 'Probable Maximum Precipitation Hawaii' },
  cloudburst: { name: 'Cloudburst', peakPosition: 0.15, description: 'Copenhagen cloudburst extreme urban pluvial criter' },
  urban_pluvial: { name: 'Urban Pluvial Flood', peakPosition: 0.35, description: 'Urban-specific pluvial flooding design criteria' },
  compound_flood: { name: 'Compound Flood Storm', peakPosition: 0.5, description: 'Combined fluvial-pluvial-coastal flood design' },
  cascading_failure: { name: 'Cascading Failure Storm', peakPosition: 0.3, description: 'Infrastructure failure cascade design criteria' },
  heat_enhanced: { name: 'Heat-Enhanced Convective', peakPosition: 0.25, description: 'Climate-adjusted for urban heat island effects' },
  saharan_dust: { name: 'Saharan Dust Storm', peakPosition: 0.2, description: 'Dust-enhanced precipitation design criteria' },
  volcanic_ash: { name: 'Volcanic Ash-Enhanced', peakPosition: 0.35, description: 'Post-volcanic eruption precipitation design' },
  snowmelt_enhanced: { name: 'Snowmelt-Enhanced', peakPosition: 0.5, description: 'Combined rain-on-snow enhanced beyond standard' },
  cmip6_idf: { name: 'CMIP6 Derived IDF', peakPosition: 0.5, description: 'IPCC CMIP6 climate model derived IDF curves' },
  ukcp09_legacy: { name: 'UKCP09 Legacy', peakPosition: 0.35, description: 'Previous UK Climate Projections 2009' },
  naiad_enhanced: { name: 'NAIAD Enhanced', peakPosition: 0.5, description: 'Nature-based solutions adjusted design storm' },
  swiss_ch2018: { name: 'Swiss IDF CH2018', peakPosition: 0.5, description: 'Swiss Climate Scenarios 2018 adjusted IDF' },
  dutch_knmi14: { name: 'Dutch KNMI'14', peakPosition: 0.48, description: 'Netherlands Climate Scenarios 2014 design storm' },
  dutch_knmi23: { name: 'Dutch KNMI'23', peakPosition: 0.48, description: 'Netherlands Climate Scenarios 2023 design storm' },
  german_dwd_extrem: { name: 'German DWD-EXTREM', peakPosition: 0.42, description: 'German climate extremes design criteria' },
  norwegian_nccs: { name: 'Norwegian NCCS', peakPosition: 0.45, description: 'Norwegian Centre for Climate Services design' },
  danish_dkcip: { name: 'Danish DKCIP', peakPosition: 0.42, description: 'Danish Climate Infrastructure Platform criteria' },
  french_drias: { name: 'French DRIAS 2020', peakPosition: 0.45, description: 'French DRIAS climate services design storm' },
  italian_ipcc: { name: 'Italian IPCC-AR6', peakPosition: 0.42, description: 'Italian climate projections design criteria' },
  spanish_aemet: { name: 'Spanish AEMET-ADAPTA', peakPosition: 0.4, description: 'Spanish climate adaptation design criteria' },
  us_noaa_climate: { name: 'US NOAA Climate-Adjusted', peakPosition: 0.45, description: 'NOAA climate-adjusted Atlas 14 design storm' },
  canadian_eccc_climate: { name: 'Canadian ECCC Climate-Adjusted', peakPosition: 0.45, description: 'Environment Canada climate-adjusted IDF curves' },
  keifer_1940: { name: 'Keifer (1940)', peakPosition: 0.375, description: 'Early Chicago-based distribution Keifer original' },
  chen_1976: { name: 'Chen (1976)', peakPosition: 0.42, description: 'Chen synthetic storm distribution method' },
  pilgrim_1977: { name: 'Pilgrim (1977)', peakPosition: 0.5, description: 'Australian variant Pilgrim original method' },
  desbordes_1978: { name: 'Desbordes (1978)', peakPosition: 0.5, description: 'French urban drainage design storm variant' },
  bemposta: { name: 'Bemposta (Portugal)', peakPosition: 0.45, description: 'Portuguese regional design storm approach' },
  silva_brazil: { name: 'Silva (Brazil)', peakPosition: 0.4, description: 'Brazilian regional design storm methodology' },
  hershfield_1961: { name: 'Hershfield (1961)', peakPosition: 0.5, description: 'PMP methodology Hershfield statistical approach' },
  chow_1964: { name: 'Chow (1964)', peakPosition: 0.42, description: 'Open channel hydraulics design storm Chow method' },
  hendrick_1973: { name: 'Hendrick (1973)', peakPosition: 0.45, description: 'Canadian regional design storm Hendrick method' },
  chocat_1997: { name: 'Chocat (1997)', peakPosition: 0.5, description: 'French urban drainage design storm Chocat method' },
  guo_2001: { name: 'Guo (2001)', peakPosition: 0.45, description: 'Analytical derived design storm Guo method' },};

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
