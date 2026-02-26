import { type PatternType } from '@/lib/rainfallPatterns';

// ── Taxonomy classification ──
export interface TaxonomyNode {
  id: string;
  label: string;
  description?: string;
  children?: TaxonomyNode[];
  patterns?: PatternType[];
}

export const TAXONOMY_TREE: TaxonomyNode[] = [
  {
    id: '1', label: 'IDF-Derived Synthetic Storms',
    description: 'Generated mathematically from Intensity-Duration-Frequency curves',
    children: [
      { id: '1.1', label: 'Constant Intensity', patterns: ['block'] },
      {
        id: '1.2', label: 'Chicago-Family (Keifer & Chu)',
        description: 'Based on the 1957 Keifer-Chu IDF disaggregation method',
        patterns: ['chicago', 'desbordes', 'tenax_cds', 'arnell_sweden'],
      },
      {
        id: '1.3', label: 'Block Methods',
        patterns: ['balanced', 'block'],
      },
      {
        id: '1.4', label: 'Triangular / Trapezoidal',
        patterns: ['triangular', 'trapezoidal', 'desbordes_double', 'double'],
      },
      {
        id: '1.5', label: 'Parametric Curve-Based',
        patterns: ['g2p_gamma', 'sifalda', 'montana_caquot'],
      },
      {
        id: '1.6', label: 'Euler Methods',
        patterns: ['euler1', 'euler2'],
      },
    ],
  },
  {
    id: '2', label: 'Statistically-Derived (Observed Pattern) Storms',
    description: 'Based on statistical analysis of observed rainfall events',
    children: [
      {
        id: '2.1', label: 'Huff Curves',
        patterns: ['huff1', 'huff2', 'huff3', 'huff4', 'sa_huff'],
      },
      {
        id: '2.2', label: 'SCS/NRCS Type Curves',
        patterns: ['scs1', 'scs1a', 'scs2', 'scs3'],
        children: [
          { id: '2.2.1', label: 'SCS-SA (South Africa)', patterns: ['sa_scs1', 'sa_scs2', 'sa_scs3', 'sa_scs4'] },
        ],
      },
      {
        id: '2.3', label: 'Average Variability / Ensemble',
        patterns: ['pilgrim_cordery', 'arr2019', 'arr87_legacy', 'aes_30', 'aes_40', 'avm'],
      },
      {
        id: '2.4', label: 'FSR/FEH Family (UK)',
        patterns: ['fsr', 'feh', 'feh22_refh2', 'watts_curve'],
      },
    ],
  },
  {
    id: '3', label: 'National/Regional Standard Methods',
    description: 'Codified methods tied to specific country engineering standards',
    children: [
      {
        id: '3.1', label: 'Asia-Pacific',
        patterns: [
          'arr', 'nz_tp108', 'nz_wellington', 'nz_christchurch', 'hirds_nz',
          'bangladesh_bmd', 'china', 'china_gb50014', 'china_prd',
          'hong_kong_hko', 'hk_dsd_2018', 'india_imd', 'india_coastal',
          'indonesia_bmkg', 'japan_amedas', 'japan_baiu', 'jma', 'japan_typhoon',
          'korea_kma', 'malaysia_hp1', 'malaysia_msma', 'pakistan_pmd',
          'philippines_pagasa', 'singapore_pub', 'sri_lanka', 'taiwan_cwa',
          'thailand_tmd', 'vietnam_imhen', 'fiji_fms',
        ],
      },
      {
        id: '3.2', label: 'Europe',
        patterns: [
          'dwa', 'kostra_dwd', 'dutch', 'italian', 'danish_svk',
          'swedish_smhi', 'norwegian_nve', 'finnish_fmi', 'swiss_idf',
          'spanish_cedex', 'belgium_willems', 'ireland_met',
          'm5_60_fsr', 'shyreg_fr', 'austria_okostra', 'greece_hellenic',
          'poland_bs', 'romania_stas', 'russia_snip', 'czech_chmu',
        ],
      },
      {
        id: '3.3', label: 'Middle East & Africa',
        patterns: [
          'uae_ncms', 'dubai_dm', 'abu_dhabi_adm', 'saudi_pme',
          'qatar_kahramaa', 'oman_dgman', 'turkey_dsi',
          'sa_sanral', 'kenya_kmd', 'nigeria_nimet', 'egypt_hcww',
          'ethiopia_nma', 'ghana_gmet', 'morocco_dmn', 'mozambique_inam',
          'tanzania_tma',
        ],
      },
      {
        id: '3.4', label: 'Americas',
        patterns: [
          'noaa_a14', 'noaa_a15', 'eccc_idf', 'canadian',
          'udfcd', 'usace_sps', 'yen_chow', 'txdot',
          'fdot1', 'fdot2', 'fdot3', 'fdot4', 'fdot5',
          'brazil_ana', 'argentina_smn', 'chile_dga', 'colombia_ideam',
          'mexico_conagua', 'ecuador_inamhi', 'peru_senamhi',
          'venezuela_inameh', 'puerto_rico', 'upm_plata',
        ],
      },
      {
        id: '3.5', label: 'Extreme / Dam Safety',
        patterns: ['pmp_hmr', 'arid_flash_flood', 'pmp_wmo', 'nested_envelope'],
      },
    ],
  },
  {
    id: '4', label: 'Special Purpose',
    description: 'Agency-specific or purpose-built distributions',
    children: [
      { id: '4.1', label: 'Custom', patterns: ['custom'] },
      { id: '4.2', label: 'State DOT', patterns: ['txdot', 'fdot1', 'fdot2', 'fdot3', 'fdot4', 'fdot5'] },
      { id: '4.3', label: 'Urban Drainage', patterns: ['udfcd'] },
    ],
  },
  {
    id: '5', label: 'Emerging / Climate-Adapted',
    description: 'Next-generation methods incorporating climate change projections',
    children: [
      { id: '5.1', label: 'Climate-Adapted', patterns: ['tenax_cds'] },
    ],
  },
];

// ── Comparison Matrix column data ──
export type PeakPosition = 'front' | 'center' | 'back' | 'variable';

export interface ComparisonRow {
  id: PatternType;
  name: string;
  taxonomyClass: string;
  region: string;
  idfRequired: 'Yes' | 'No' | 'Optional';
  temporalRes: string;
  durationRange: string;
  keyParams: string;
  peakPosition: PeakPosition;
  advancementRatio: string;
  nestedIdf: boolean | null;
  dimensionless: boolean;
  sourceDoc: string;
  equationFamily: string;
  useCase: string;
  swmmCompat: 'Direct' | 'Conversion' | 'N/A';
  icmCompat: 'Direct' | 'Conversion' | 'N/A';
}

export const COMPARISON_DATA: ComparisonRow[] = [
  { id: 'block', name: 'Block (Uniform)', taxonomyClass: '1.1', region: 'Universal', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.1–72h', keyParams: 'None', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: null, dimensionless: true, sourceDoc: 'Standard practice', equationFamily: 'Constant', useCase: 'Preliminary design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'chicago', name: 'Chicago Storm (CDS)', taxonomyClass: '1.2', region: 'Universal', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r, a, b, c (IDF)', peakPosition: 'variable', advancementRatio: '0.3–0.5', nestedIdf: true, dimensionless: true, sourceDoc: 'Keifer & Chu 1957', equationFamily: 'Keifer-Chu', useCase: 'Urban drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'desbordes', name: 'Desbordes', taxonomyClass: '1.2', region: 'France', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–6h', keyParams: 'r, IDF', peakPosition: 'variable', advancementRatio: '0.3–0.5', nestedIdf: true, dimensionless: true, sourceDoc: 'Desbordes (France)', equationFamily: 'Keifer-Chu', useCase: 'Urban drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'tenax_cds', name: 'TENAX-CDS', taxonomyClass: '1.2', region: 'Europe', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r, α_CC, IDF', peakPosition: 'variable', advancementRatio: '0.40', nestedIdf: true, dimensionless: true, sourceDoc: 'Marra et al. 2024', equationFamily: 'Keifer-Chu', useCase: 'Climate-adapted design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'arnell_sweden', name: 'Arnell (Sweden)', taxonomyClass: '1.2', region: 'Sweden', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.33', peakPosition: 'front', advancementRatio: '0.33', nestedIdf: true, dimensionless: true, sourceDoc: 'Arnell 1982', equationFamily: 'Keifer-Chu', useCase: 'Urban drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'balanced', name: 'Balanced Storm (ABM)', taxonomyClass: '1.3', region: 'Universal', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–72h', keyParams: 'Δt, IDF table', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'Chow et al. 1988', equationFamily: 'ABM', useCase: 'General drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'triangular', name: 'Triangular', taxonomyClass: '1.4', region: 'Universal', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r (peak ratio)', peakPosition: 'variable', advancementRatio: 'User-set', nestedIdf: false, dimensionless: true, sourceDoc: 'Standard hydrology', equationFamily: 'Triangular', useCase: 'Simple design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'trapezoidal', name: 'Trapezoidal', taxonomyClass: '1.4', region: 'Universal', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r, plateau width', peakPosition: 'variable', advancementRatio: 'User-set', nestedIdf: false, dimensionless: true, sourceDoc: 'Standard hydrology', equationFamily: 'Triangular', useCase: 'Simple design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'desbordes_double', name: 'Double Triangle', taxonomyClass: '1.4', region: 'France', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–6h', keyParams: 'i₁, i₂, Tₚ', peakPosition: 'variable', advancementRatio: 'Varies', nestedIdf: false, dimensionless: true, sourceDoc: 'French SHYPRE method', equationFamily: 'Triangular', useCase: 'Urban drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'double', name: 'Double Peak', taxonomyClass: '1.4', region: 'Universal', idfRequired: 'No', temporalRes: 'Any', durationRange: '1–24h', keyParams: 'Peak positions', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: false, dimensionless: true, sourceDoc: 'Standard hydrology', equationFamily: 'Triangular', useCase: 'Frontal storms', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'g2p_gamma', name: 'G2P Gamma', taxonomyClass: '1.5', region: 'Europe', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'i₀, tₚ, φ', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: false, dimensionless: true, sourceDoc: 'G2P Method', equationFamily: 'Gamma', useCase: 'Research / design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'sifalda', name: 'Sifalda (Czech)', taxonomyClass: '1.5', region: 'Czech Republic', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–6h', keyParams: 'None (fixed %)', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: false, dimensionless: true, sourceDoc: 'Sifalda 1973', equationFamily: 'Parametric', useCase: 'Urban drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'montana_caquot', name: 'Montana/Caquot (FR)', taxonomyClass: '1.5', region: 'France', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.1–6h', keyParams: 'a, b (regional)', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: false, dimensionless: false, sourceDoc: 'Montana formula', equationFamily: 'Power Law', useCase: 'French sewer design', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'euler1', name: 'Euler Type I', taxonomyClass: '1.6', region: 'Germany/Europe', idfRequired: 'Yes', temporalRes: '5-min', durationRange: '0.5–72h', keyParams: 'IDF table', peakPosition: 'front', advancementRatio: '0.0', nestedIdf: true, dimensionless: false, sourceDoc: 'DWA-A 531', equationFamily: 'Euler', useCase: 'Sewer design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'euler2', name: 'Euler Type II', taxonomyClass: '1.6', region: 'Germany/Europe', idfRequired: 'Yes', temporalRes: '5-min', durationRange: '0.5–72h', keyParams: 'r, IDF table', peakPosition: 'variable', advancementRatio: '0.30', nestedIdf: true, dimensionless: false, sourceDoc: 'DWA-A 531', equationFamily: 'Euler', useCase: 'Sewer design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  // SCS/NRCS
  { id: 'scs1', name: 'SCS Type I', taxonomyClass: '2.2', region: 'US (Pacific)', idfRequired: 'No', temporalRes: '6-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '~0.40', nestedIdf: false, dimensionless: true, sourceDoc: 'TR-55 (NRCS 1986)', equationFamily: 'SCS', useCase: 'Rural/urban watersheds', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'scs1a', name: 'SCS Type IA', taxonomyClass: '2.2', region: 'US (NW Coast)', idfRequired: 'No', temporalRes: '6-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'TR-55 (NRCS 1986)', equationFamily: 'SCS', useCase: 'Rural/urban watersheds', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'scs2', name: 'SCS Type II', taxonomyClass: '2.2', region: 'US (East/Central)', idfRequired: 'No', temporalRes: '6-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'TR-55 (NRCS 1986)', equationFamily: 'SCS', useCase: 'Rural/urban watersheds', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'scs3', name: 'SCS Type III', taxonomyClass: '2.2', region: 'US (Gulf/Atlantic)', idfRequired: 'No', temporalRes: '6-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'TR-55 (NRCS 1986)', equationFamily: 'SCS', useCase: 'Rural/urban watersheds', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  // Huff
  { id: 'huff1', name: 'Huff 1st Quartile', taxonomyClass: '2.1', region: 'US Midwest', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'Percentile', peakPosition: 'front', advancementRatio: '~0.125', nestedIdf: false, dimensionless: true, sourceDoc: 'Huff 1967', equationFamily: 'Huff', useCase: 'Convective storms', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'huff2', name: 'Huff 2nd Quartile', taxonomyClass: '2.1', region: 'US Midwest', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'Percentile', peakPosition: 'center', advancementRatio: '~0.375', nestedIdf: false, dimensionless: true, sourceDoc: 'Huff 1967', equationFamily: 'Huff', useCase: 'Mixed storms', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'huff3', name: 'Huff 3rd Quartile', taxonomyClass: '2.1', region: 'US Midwest', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'Percentile', peakPosition: 'back', advancementRatio: '~0.625', nestedIdf: false, dimensionless: true, sourceDoc: 'Huff 1967', equationFamily: 'Huff', useCase: 'Frontal storms', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'huff4', name: 'Huff 4th Quartile', taxonomyClass: '2.1', region: 'US Midwest', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'Percentile', peakPosition: 'back', advancementRatio: '~0.875', nestedIdf: false, dimensionless: true, sourceDoc: 'Huff 1967', equationFamily: 'Huff', useCase: 'Long-duration storms', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'sa_huff', name: 'South African Huff', taxonomyClass: '2.1', region: 'South Africa', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'Percentile', peakPosition: 'front', advancementRatio: '~0.20', nestedIdf: false, dimensionless: true, sourceDoc: 'SANRAL 2013', equationFamily: 'Huff', useCase: 'SA drainage design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  // FSR/FEH
  { id: 'fsr', name: 'FSR Profile', taxonomyClass: '2.4', region: 'UK', idfRequired: 'No', temporalRes: 'Any', durationRange: '1–48h', keyParams: 'Storm profile %', peakPosition: 'center', advancementRatio: '~0.42', nestedIdf: false, dimensionless: true, sourceDoc: 'NERC FSR 1975', equationFamily: 'FSR/FEH', useCase: 'UK flood estimation', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'feh', name: 'FEH (UK)', taxonomyClass: '2.4', region: 'UK', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.25–192h', keyParams: 'Season, ARF', peakPosition: 'center', advancementRatio: '~0.42', nestedIdf: true, dimensionless: true, sourceDoc: 'FEH 2013', equationFamily: 'FSR/FEH', useCase: 'UK flood estimation', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'feh22_refh2', name: 'FEH22/ReFH2', taxonomyClass: '2.4', region: 'UK', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.25–192h', keyParams: 'Season, ARF, FEH22 depths', peakPosition: 'center', advancementRatio: '~0.42', nestedIdf: true, dimensionless: true, sourceDoc: 'FEH22 (2022)', equationFamily: 'FSR/FEH', useCase: 'UK design floods', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'watts_curve', name: "Watt's Curve (UK)", taxonomyClass: '2.4', region: 'UK', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'i₀, k', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'Watt & Chow 1985', equationFamily: 'FSR/FEH', useCase: 'Historical UK', swmmCompat: 'Direct', icmCompat: 'Direct' },
  // Ensemble / AVM
  { id: 'pilgrim_cordery', name: 'Pilgrim-Cordery', taxonomyClass: '2.3', region: 'Australia', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–72h', keyParams: 'Historical storms', peakPosition: 'front', advancementRatio: '~0.40', nestedIdf: false, dimensionless: true, sourceDoc: 'Pilgrim & Cordery 1975', equationFamily: 'Ensemble', useCase: 'Australian design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'avm', name: 'Average Variability', taxonomyClass: '2.3', region: 'Universal', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–72h', keyParams: 'Storm sample size', peakPosition: 'center', advancementRatio: '~0.45', nestedIdf: false, dimensionless: true, sourceDoc: 'Pilgrim & Cordery 1975', equationFamily: 'Ensemble', useCase: 'General design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  // Key international standards (representative subset)
  { id: 'arr', name: 'Australian ARR', taxonomyClass: '3.1', region: 'Australia', idfRequired: 'Yes', temporalRes: 'Any', durationRange: 'Varies', keyParams: 'Ensemble, ARF', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'ARR 2019', equationFamily: 'Ensemble', useCase: 'Australian standard', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'dwa', name: 'German DWA', taxonomyClass: '3.2', region: 'Germany', idfRequired: 'Yes', temporalRes: '5-min', durationRange: '0.5–72h', keyParams: 'Euler Type II, r=0.3', peakPosition: 'front', advancementRatio: '0.30', nestedIdf: true, dimensionless: false, sourceDoc: 'DWA-A 531', equationFamily: 'Euler', useCase: 'Sewer design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'noaa_a14', name: 'NOAA Atlas 14', taxonomyClass: '3.4', region: 'United States', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '5min–60d', keyParams: 'Lat/Lon, Tr', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'NOAA Atlas 14', equationFamily: 'ABM', useCase: 'US design standard', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'jma', name: 'Japan JMA', taxonomyClass: '3.1', region: 'Japan', idfRequired: 'No', temporalRes: 'Any', durationRange: '1–24h', keyParams: 'Regional coefficients', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'JMA Technical Reports', equationFamily: 'Parametric', useCase: 'Japanese drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'china', name: 'China Design Storm', taxonomyClass: '3.1', region: 'China', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'P&C formula, r', peakPosition: 'variable', advancementRatio: '0.35–0.45', nestedIdf: false, dimensionless: false, sourceDoc: 'GB 50014', equationFamily: 'Keifer-Chu', useCase: 'Chinese urban drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'pmp_hmr', name: 'PMP (HMR 51/52)', taxonomyClass: '3.5', region: 'United States', idfRequired: 'No', temporalRes: 'Any', durationRange: '6–72h', keyParams: 'Basin area, Tr', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'HMR 51/52 (NWS)', equationFamily: 'ABM', useCase: 'Dam safety / PMP', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'txdot', name: 'TxDOT', taxonomyClass: '4.2', region: 'Texas, US', idfRequired: 'No', temporalRes: 'Any', durationRange: '5–24h', keyParams: 'a, b (regional)', peakPosition: 'front', advancementRatio: '~0.02', nestedIdf: false, dimensionless: true, sourceDoc: 'TxDOT HDM', equationFamily: 'SCS', useCase: 'Texas highways', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  // South African SCS Types
  { id: 'sa_scs1', name: 'SA SCS Type 1', taxonomyClass: '2.2', region: 'South Africa', idfRequired: 'No', temporalRes: '5-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'Schulze 1984, Weddepohl 1988', equationFamily: 'SCS', useCase: 'SA coastal/orographic', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'sa_scs2', name: 'SA SCS Type 2', taxonomyClass: '2.2', region: 'South Africa', idfRequired: 'No', temporalRes: '5-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'Schulze 1984, Weddepohl 1988', equationFamily: 'SCS', useCase: 'SA inland transitional', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'sa_scs3', name: 'SA SCS Type 3', taxonomyClass: '2.2', region: 'South Africa', idfRequired: 'No', temporalRes: '5-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'Schulze 1984, Weddepohl 1988', equationFamily: 'SCS', useCase: 'SA inland convective', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'sa_scs4', name: 'SA SCS Type 4', taxonomyClass: '2.2', region: 'South Africa', idfRequired: 'No', temporalRes: '5-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'Schulze 1984, Weddepohl 1988', equationFamily: 'SCS', useCase: 'SA extreme convective Highveld', swmmCompat: 'Direct', icmCompat: 'Conversion' },
];

// ── Equation Family Registry ──
export interface EquationFamily {
  id: string;
  name: string;
  description: string;
  equations: { label: string; latex: string; description: string }[];
  variables: { symbol: string; meaning: string }[];
  members: string[];
  notes: string;
}

export const EQUATION_FAMILIES: EquationFamily[] = [
  {
    id: 'keifer-chu', name: 'Family 1: Keifer-Chu (Chicago)',
    description: 'IDF disaggregation method producing peaked synthetic storms',
    equations: [
      { label: 'IDF Base', latex: 'i = \\frac{a}{(t_d + b)^c}', description: 'Sherman-type IDF curve' },
      { label: 'Before Peak', latex: 'i(t_b) = \\frac{a \\left[\\frac{(1-c) \\cdot t_b}{r} + b\\right]}{\\left(\\frac{t_b}{r} + b\\right)^{c+1}}', description: 'Rising limb intensity' },
      { label: 'After Peak', latex: 'i(t_a) = \\frac{a \\left[\\frac{(1-c) \\cdot t_a}{1-r} + b\\right]}{\\left(\\frac{t_a}{1-r} + b\\right)^{c+1}}', description: 'Falling limb intensity' },
    ],
    variables: [
      { symbol: 'r', meaning: 'Advancement coefficient (0.3–0.5)' },
      { symbol: 't_b', meaning: 'Time before peak' },
      { symbol: 't_a', meaning: 'Time after peak' },
      { symbol: 'a, b, c', meaning: 'Regional IDF coefficients' },
    ],
    members: ['Chicago Storm', 'Desbordes', 'TENAX-CDS', 'Arnell (Sweden)', 'China Design Storm'],
    notes: 'The 1957 Keifer-Chu method remains the most widely used IDF disaggregation approach globally.',
  },
  {
    id: 'abm', name: 'Family 2: Alternating Block Method',
    description: 'Nests IDF-derived blocks symmetrically around the center',
    equations: [
      { label: 'Cumulative Depth', latex: 'P_k = i(k \\cdot \\Delta t) \\cdot k \\cdot \\Delta t', description: 'Depth from IDF at each duration' },
      { label: 'Incremental', latex: '\\Delta P_k = P_k - P_{k-1}', description: 'Block depths by subtraction' },
      { label: 'Arrangement', latex: '\\text{Rank } \\Delta P_k \\text{ desc., alternate L-R from center}', description: 'Symmetric nesting pattern' },
    ],
    variables: [
      { symbol: 'P_k', meaning: 'Cumulative depth for duration k·Δt' },
      { symbol: '\\Delta P_k', meaning: 'Incremental block depth' },
      { symbol: '\\Delta t', meaning: 'Time step' },
    ],
    members: ['Balanced Storm', 'NOAA Atlas 14', 'PMP (HMR 51/52)', 'Nested Envelope'],
    notes: 'Preserves IDF consistency at all sub-durations. Standard textbook method (Chow, Maidment & Mays 1988).',
  },
  {
    id: 'euler', name: 'Family 3: Euler Type I & II',
    description: 'German variants of ABM with variable peak placement',
    equations: [
      { label: 'Euler I', latex: '\\text{Largest block at } t = 0, \\text{ remaining descending}', description: 'Front-loaded extreme storm' },
      { label: 'Euler II', latex: '\\text{Largest block at } t = r \\cdot T_d', description: 'Peak at position r' },
    ],
    variables: [
      { symbol: 'r', meaning: 'Peak position ratio (typically 0.3 for Germany)' },
      { symbol: 'T_d', meaning: 'Total storm duration' },
    ],
    members: ['Euler Type I', 'Euler Type II', 'German DWA', 'KOSTRA-DWD', 'Austrian ÖKOSTRA'],
    notes: 'DWA-A 531 standard. Euler II with r=0.3 is the German default for sewer design.',
  },
  {
    id: 'scs', name: 'Family 4: SCS/NRCS Dimensionless Curves',
    description: '24-hour tabulated mass curves from USDA NRCS',
    equations: [
      { label: 'Mass Curve', latex: '\\frac{P(t)}{P_{24}} = f_{SCS}\\left(\\frac{t}{24}\\right)', description: 'Dimensionless cumulative fraction' },
      { label: 'Incremental', latex: '\\Delta P_i = [F(t_{i+1}) - F(t_i)] \\cdot P_{24}', description: 'Rainfall in each interval' },
    ],
    variables: [
      { symbol: 'P_{24}', meaning: 'Total 24-hour depth' },
      { symbol: 'f_{SCS}', meaning: 'Tabulated cumulative fraction for type I/IA/II/III or SA Type 1–4' },
    ],
    members: ['SCS Type I', 'SCS Type IA', 'SCS Type II', 'SCS Type III', 'TxDOT', 'SA SCS Type 1', 'SA SCS Type 2', 'SA SCS Type 3', 'SA SCS Type 4'],
    notes: '24-hour duration with ~30 min of peak intensity near center. TR-55 standard since 1986. South African adaptation by Schulze (1984) and Weddepohl (1988) created 4 symmetrical types based on D-hour/24-hour ratios.',
  },
  {
    id: 'huff', name: 'Family 5: Huff Curves',
    description: 'Statistically-derived from observed storm temporal patterns',
    equations: [
      { label: 'Cumulative', latex: '\\frac{P(t)}{P_{total}} = H_q\\left(\\frac{t}{T_d}\\right)', description: 'Dimensionless quartile curve at given percentile' },
    ],
    variables: [
      { symbol: 'H_q', meaning: 'Huff curve function for quartile q' },
      { symbol: 'T_d', meaning: 'Total storm duration' },
      { symbol: 'q', meaning: 'Quartile (1–4): which quarter contains peak' },
    ],
    members: ['Huff 1st–4th Quartile', 'South African Huff'],
    notes: 'Originally from Illinois storms (Huff 1967). 50th percentile = median storm profile.',
  },
  {
    id: 'triangular', name: 'Family 6: Triangular / Double Triangle',
    description: 'Simple piecewise linear intensity profiles',
    equations: [
      { label: 'Rising', latex: 'i(t) = \\frac{2P}{a \\cdot T} \\cdot \\frac{t}{a \\cdot T}', description: 'Linear rise to peak' },
      { label: 'Falling', latex: 'i(t) = \\frac{2P}{(1-a) \\cdot T} \\cdot \\frac{T - t}{(1-a) \\cdot T}', description: 'Linear decay from peak' },
      { label: 'Double Triangle', latex: 'i_{total}(t) = i_{outer}(t) + i_{inner}(t)', description: 'Superposition of two triangles' },
    ],
    variables: [
      { symbol: 'a', meaning: 'Fraction of duration to peak' },
      { symbol: 'P', meaning: 'Total depth' },
      { symbol: 'T', meaning: 'Total duration' },
    ],
    members: ['Triangular', 'Double Triangle', 'Trapezoidal', 'Double Peak', 'Yen & Chow'],
    notes: 'Simplest parametric forms. Double Triangle is the French SHYPRE standard.',
  },
  {
    id: 'gamma', name: 'Family 7: Gamma / Parametric',
    description: 'Smooth bell-shaped profiles from gamma distribution',
    equations: [
      { label: 'G2P', latex: 'i(t) = i_0 \\cdot \\left(\\frac{t}{t_p}\\right)^{\\phi} \\cdot \\exp\\left[\\phi \\cdot \\left(1 - \\frac{t}{t_p}\\right)\\right]', description: 'Gamma 2-parameter peaked storm' },
    ],
    variables: [
      { symbol: 'i_0', meaning: 'Peak intensity' },
      { symbol: 't_p', meaning: 'Time to peak' },
      { symbol: '\\phi', meaning: 'Shape parameter (higher = sharper)' },
    ],
    members: ['G2P Gamma', 'Italian Pattern'],
    notes: 'Produces smooth, physically realistic profiles. φ controls peakedness.',
  },
  {
    id: 'power-law', name: 'Family 8: Power Law / Regional IDF',
    description: 'Simple power-law IDF forms used by many national standards',
    equations: [
      { label: 'General', latex: 'i = \\frac{a \\cdot T_r^m}{(t_d + b)^n}', description: 'Regional IDF with return period' },
      { label: 'Simplified', latex: 'i = \\frac{A}{t_d^n}', description: 'Montana formula' },
    ],
    variables: [
      { symbol: 'T_r', meaning: 'Return period (years)' },
      { symbol: 't_d', meaning: 'Duration' },
      { symbol: 'a, b, n, m', meaning: 'Regionally calibrated coefficients' },
    ],
    members: ['Russia SNiP', 'Turkey DSİ', 'Greece Hellenic', 'Montana/Caquot', 'Many national methods'],
    notes: 'The most common IDF parameterization worldwide. Coefficients vary by region/agency.',
  },
  {
    id: 'ensemble', name: 'Family 9: Pilgrim-Cordery / Ensemble',
    description: 'Design storms derived by averaging multiple observed events',
    equations: [
      { label: 'Averaging', latex: '\\frac{P(t)}{P_{total}} = \\frac{1}{n} \\sum_{k=1}^{n} H_k\\left(\\frac{t}{T_d}\\right)', description: 'Mean of n dimensionless hyetographs' },
    ],
    variables: [
      { symbol: 'n', meaning: 'Number of historical storms' },
      { symbol: 'H_k', meaning: 'Dimensionless pattern of storm k' },
    ],
    members: ['Pilgrim-Cordery', 'ARR 2019 Ensemble', 'ARR87 Legacy', 'AES Canada 30%/40%', 'Average Variability (AVM)'],
    notes: 'Ensemble methods smooth out individual storm irregularities. ARR2019 uses stochastic selection from large event database.',
  },
];

export const PEAK_POSITION_LABELS: Record<PeakPosition, string> = {
  front: 'Front-loaded',
  center: 'Center',
  back: 'Back-loaded',
  variable: 'Variable (r)',
};
