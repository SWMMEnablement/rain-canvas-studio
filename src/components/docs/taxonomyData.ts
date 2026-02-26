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
  // Japan Typhoon
  { id: 'japan_typhoon', name: 'Japan Typhoon', taxonomyClass: '3.1', region: 'Japan', idfRequired: 'No', temporalRes: '15-min', durationRange: '6h', keyParams: 'Double-peak bands', peakPosition: 'back', advancementRatio: '~0.65', nestedIdf: false, dimensionless: true, sourceDoc: 'JMA Typhoon Studies', equationFamily: 'Parametric', useCase: 'Typhoon design storms', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  // Asian patterns
  { id: 'korea_kma', name: 'Korea KMA', taxonomyClass: '3.1', region: 'South Korea', idfRequired: 'No', temporalRes: '10-min', durationRange: '1–24h', keyParams: 'Monsoon/convective mix', peakPosition: 'center', advancementRatio: '~0.42', nestedIdf: false, dimensionless: true, sourceDoc: 'KMA Standard', equationFamily: 'Parametric', useCase: 'Korean urban drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'korea_molit', name: 'Korea MOLIT', taxonomyClass: '2.1', region: 'South Korea', idfRequired: 'No', temporalRes: '10-min', durationRange: '1–24h', keyParams: 'Huff-type front-loaded', peakPosition: 'front', advancementRatio: '~0.35', nestedIdf: false, dimensionless: true, sourceDoc: 'MOLIT Design Standard', equationFamily: 'Huff', useCase: 'Korean MOLIT urban', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'malaysia_msma', name: 'Malaysia MSMA', taxonomyClass: '3.1', region: 'Malaysia', idfRequired: 'No', temporalRes: '5-min', durationRange: '0.5–72h', keyParams: 'Tropical monsoon', peakPosition: 'front', advancementRatio: '~0.35', nestedIdf: false, dimensionless: true, sourceDoc: 'MSMA 2nd Edition', equationFamily: 'Parametric', useCase: 'Malaysian drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'malaysia_hp1', name: 'Malaysia HP1', taxonomyClass: '3.1', region: 'Malaysia', idfRequired: 'No', temporalRes: '5-min', durationRange: '0.5–72h', keyParams: 'Tropical center-peaked', peakPosition: 'center', advancementRatio: '~0.40', nestedIdf: false, dimensionless: true, sourceDoc: 'HP1 (DID, 2015)', equationFamily: 'Parametric', useCase: 'Malaysian flood estimation', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'india_imd', name: 'India IMD', taxonomyClass: '3.1', region: 'India', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Monsoon build-up', peakPosition: 'center', advancementRatio: '~0.47', nestedIdf: false, dimensionless: true, sourceDoc: 'IMD Technical Reports', equationFamily: 'Parametric', useCase: 'Indian monsoon design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'india_coastal', name: 'India Coastal', taxonomyClass: '3.1', region: 'India', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Cyclonic sharp peak', peakPosition: 'front', advancementRatio: '~0.25', nestedIdf: false, dimensionless: true, sourceDoc: 'IMD Cyclone Guidelines', equationFamily: 'Parametric', useCase: 'Coastal cyclone design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'philippines_pagasa', name: 'Philippines PAGASA', taxonomyClass: '3.1', region: 'Philippines', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Typhoon front-loaded', peakPosition: 'front', advancementRatio: '~0.15', nestedIdf: false, dimensionless: true, sourceDoc: 'PAGASA Rainfall Manual', equationFamily: 'Parametric', useCase: 'Philippine typhoon drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'hong_kong_hko', name: 'Hong Kong HKO', taxonomyClass: '3.1', region: 'Hong Kong', idfRequired: 'No', temporalRes: '5-min', durationRange: '1–24h', keyParams: 'Typhoon front-loaded', peakPosition: 'front', advancementRatio: '~0.20', nestedIdf: false, dimensionless: true, sourceDoc: 'HKO Technical Note', equationFamily: 'Parametric', useCase: 'HK stormwater design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'taiwan_cwa', name: 'Taiwan CWA', taxonomyClass: '1.2', region: 'Taiwan', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.45, IDF', peakPosition: 'center', advancementRatio: '0.45', nestedIdf: true, dimensionless: true, sourceDoc: 'CWA IDF Standards', equationFamily: 'Keifer-Chu', useCase: 'Taiwan typhoon drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'indonesia_bmkg', name: 'Indonesia BMKG', taxonomyClass: '3.1', region: 'Indonesia', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Tropical convective', peakPosition: 'front', advancementRatio: '~0.18', nestedIdf: false, dimensionless: true, sourceDoc: 'BMKG Rainfall Atlas', equationFamily: 'Parametric', useCase: 'Indonesian urban drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'vietnam_imhen', name: 'Vietnam IMHEN', taxonomyClass: '3.1', region: 'Vietnam', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Monsoon/convective', peakPosition: 'front', advancementRatio: '~0.35', nestedIdf: false, dimensionless: true, sourceDoc: 'IMHEN Technical Reports', equationFamily: 'Parametric', useCase: 'Vietnamese drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'thailand_tmd', name: 'Thailand TMD', taxonomyClass: '3.1', region: 'Thailand', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Monsoon + UHI', peakPosition: 'front', advancementRatio: '~0.38', nestedIdf: false, dimensionless: true, sourceDoc: 'TMD Rainfall Reports', equationFamily: 'Parametric', useCase: 'Thai urban drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'bangladesh_bmd', name: 'Bangladesh BMD', taxonomyClass: '3.1', region: 'Bangladesh', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Monsoon rear-loaded', peakPosition: 'back', advancementRatio: '~0.65', nestedIdf: false, dimensionless: true, sourceDoc: 'BMD Monsoon Reports', equationFamily: 'Parametric', useCase: 'Bangladesh flood design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'pakistan_pmd', name: 'Pakistan PMD', taxonomyClass: '3.1', region: 'Pakistan', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Monsoon beta dist.', peakPosition: 'center', advancementRatio: '~0.45', nestedIdf: false, dimensionless: true, sourceDoc: 'PMD Technical Reports', equationFamily: 'Parametric', useCase: 'Pakistan monsoon design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  // South African SCS Types
  { id: 'sa_scs1', name: 'SA SCS Type 1', taxonomyClass: '2.2', region: 'South Africa', idfRequired: 'No', temporalRes: '5-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'Schulze 1984, Weddepohl 1988', equationFamily: 'SCS', useCase: 'SA coastal/orographic', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'sa_scs2', name: 'SA SCS Type 2', taxonomyClass: '2.2', region: 'South Africa', idfRequired: 'No', temporalRes: '5-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'Schulze 1984, Weddepohl 1988', equationFamily: 'SCS', useCase: 'SA inland transitional', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'sa_scs3', name: 'SA SCS Type 3', taxonomyClass: '2.2', region: 'South Africa', idfRequired: 'No', temporalRes: '5-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'Schulze 1984, Weddepohl 1988', equationFamily: 'SCS', useCase: 'SA inland convective', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'sa_scs4', name: 'SA SCS Type 4', taxonomyClass: '2.2', region: 'South Africa', idfRequired: 'No', temporalRes: '5-min', durationRange: '24h', keyParams: 'P₂₄', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'Schulze 1984, Weddepohl 1988', equationFamily: 'SCS', useCase: 'SA extreme convective Highveld', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  // ── US Agency ──
  { id: 'yen_chow', name: 'Yen & Chow', taxonomyClass: '1.4', region: 'Universal', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.375', peakPosition: 'variable', advancementRatio: '0.375', nestedIdf: false, dimensionless: true, sourceDoc: 'Yen & Chow 1980', equationFamily: 'Triangular', useCase: 'Sensitivity analysis', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'fdot1', name: 'FDOT Zone 1', taxonomyClass: '4.2', region: 'Florida NW, US', idfRequired: 'No', temporalRes: '6-min', durationRange: '24h', keyParams: 'Modified Type II', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'FDOT Drainage Manual', equationFamily: 'SCS', useCase: 'FL panhandle highways', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'fdot2', name: 'FDOT Zone 2', taxonomyClass: '4.2', region: 'Florida NE, US', idfRequired: 'No', temporalRes: '6-min', durationRange: '24h', keyParams: 'Modified Type II', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'FDOT Drainage Manual', equationFamily: 'SCS', useCase: 'NE Florida highways', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'fdot3', name: 'FDOT Zone 3', taxonomyClass: '4.2', region: 'Florida Central, US', idfRequired: 'No', temporalRes: '6-min', durationRange: '24h', keyParams: 'Tropical distribution', peakPosition: 'center', advancementRatio: '~0.48', nestedIdf: false, dimensionless: true, sourceDoc: 'FDOT Drainage Manual', equationFamily: 'SCS', useCase: 'Central FL highways', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'fdot4', name: 'FDOT Zone 4', taxonomyClass: '4.2', region: 'Florida SE, US', idfRequired: 'No', temporalRes: '6-min', durationRange: '24h', keyParams: 'Front-loaded convective', peakPosition: 'front', advancementRatio: '~0.35', nestedIdf: false, dimensionless: true, sourceDoc: 'FDOT Drainage Manual', equationFamily: 'SCS', useCase: 'SE Florida highways', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'fdot5', name: 'FDOT Zone 5', taxonomyClass: '4.2', region: 'Florida SW, US', idfRequired: 'No', temporalRes: '6-min', durationRange: '24h', keyParams: 'Front-loaded', peakPosition: 'front', advancementRatio: '~0.37', nestedIdf: false, dimensionless: true, sourceDoc: 'FDOT Drainage Manual', equationFamily: 'SCS', useCase: 'SW Florida highways', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'udfcd', name: 'UDFCD Denver', taxonomyClass: '4.3', region: 'Colorado, US', idfRequired: 'No', temporalRes: '5-min', durationRange: '2h', keyParams: '60% in Q1', peakPosition: 'front', advancementRatio: '~0.08', nestedIdf: false, dimensionless: true, sourceDoc: 'UDFCD Criteria Manual', equationFamily: 'ABM', useCase: 'Denver metro drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'usace_sps', name: 'USACE SPS', taxonomyClass: '3.5', region: 'United States', idfRequired: 'No', temporalRes: 'Any', durationRange: '6–72h', keyParams: 'Broad peak envelope', peakPosition: 'center', advancementRatio: '~0.45', nestedIdf: true, dimensionless: false, sourceDoc: 'USACE EM 1110-2-1411', equationFamily: 'ABM', useCase: 'Dam safety / flood control', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'canadian', name: 'Canadian CDA', taxonomyClass: '3.4', region: 'Canada', idfRequired: 'No', temporalRes: 'Any', durationRange: '6–24h', keyParams: 'Modified Type II', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'CDA / Ontario MTO', equationFamily: 'SCS', useCase: 'Canadian drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'noaa_a15', name: 'NOAA Atlas 15', taxonomyClass: '3.4', region: 'United States (West)', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '5min–60d', keyParams: 'Lat/Lon, Tr', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'NOAA Atlas 15 (pilot)', equationFamily: 'ABM', useCase: 'Next-gen US design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'noaa_a16', name: 'NOAA Atlas 16', taxonomyClass: '3.4', region: 'United States (West)', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '5min–60d', keyParams: 'Lat/Lon, Tr', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'NOAA Atlas 16 (dev)', equationFamily: 'ABM', useCase: 'Future US standard', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  // ── Asian patterns ──
  { id: 'singapore_pub', name: 'Singapore PUB', taxonomyClass: '3.1', region: 'Singapore', idfRequired: 'No', temporalRes: '5-min', durationRange: '0.5–4h', keyParams: '70-80% in first 30min', peakPosition: 'front', advancementRatio: '~0.10', nestedIdf: false, dimensionless: true, sourceDoc: 'PUB Code of Practice', equationFamily: 'Parametric', useCase: 'Singapore drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'china_gb50014', name: 'China GB 50014', taxonomyClass: '3.1', region: 'China', idfRequired: 'Yes', temporalRes: '5-min', durationRange: '0.5–3h', keyParams: 'City IDF formula, r', peakPosition: 'variable', advancementRatio: '0.35–0.45', nestedIdf: false, dimensionless: false, sourceDoc: 'GB 50014-2021', equationFamily: 'Keifer-Chu', useCase: 'Chinese urban drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'china_prd', name: 'China PRD', taxonomyClass: '3.1', region: 'China (Pearl River Delta)', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Typhoon front-loaded', peakPosition: 'front', advancementRatio: '~0.25', nestedIdf: false, dimensionless: true, sourceDoc: 'GZ/SZ Regional Codes', equationFamily: 'Parametric', useCase: 'PRD typhoon drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'japan_amedas', name: 'Japan AMeDAS', taxonomyClass: '3.1', region: 'Japan', idfRequired: 'No', temporalRes: '10-min', durationRange: '1–6h', keyParams: 'Short convective peak', peakPosition: 'center', advancementRatio: '~0.48', nestedIdf: false, dimensionless: true, sourceDoc: 'JMA AMeDAS Network', equationFamily: 'Parametric', useCase: 'Japanese convective design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'japan_baiu', name: 'Japan Baiu (梅雨)', taxonomyClass: '3.1', region: 'Japan', idfRequired: 'No', temporalRes: '15-min', durationRange: '6–48h', keyParams: 'Broad frontal', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'JMA Baiu Studies', equationFamily: 'Parametric', useCase: 'Japanese extended storms', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'sri_lanka', name: 'Sri Lanka', taxonomyClass: '3.1', region: 'Sri Lanka', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Monsoon beta dist.', peakPosition: 'center', advancementRatio: '~0.40', nestedIdf: false, dimensionless: true, sourceDoc: 'Dept. of Meteorology', equationFamily: 'Parametric', useCase: 'Sri Lankan drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'fiji_fms', name: 'Fiji FMS', taxonomyClass: '3.1', region: 'Fiji', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Tropical cyclone', peakPosition: 'front', advancementRatio: '~0.20', nestedIdf: false, dimensionless: true, sourceDoc: 'Fiji Met Service', equationFamily: 'Parametric', useCase: 'Pacific island drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'kazakhstan_kazhydromet', name: 'Kazakhstan Kazhydromet', taxonomyClass: '1.2', region: 'Kazakhstan', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.42, IDF', peakPosition: 'center', advancementRatio: '0.42', nestedIdf: true, dimensionless: true, sourceDoc: 'Kazhydromet Standards', equationFamily: 'Keifer-Chu', useCase: 'Central Asian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'mongolia_namem', name: 'Mongolia NAMEM', taxonomyClass: '1.2', region: 'Mongolia', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.35, IDF', peakPosition: 'front', advancementRatio: '0.35', nestedIdf: true, dimensionless: true, sourceDoc: 'NAMEM Standards', equationFamily: 'Keifer-Chu', useCase: 'Cold-arid continental', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'hk_dsd_2018', name: 'HK DSD 2018', taxonomyClass: '3.1', region: 'Hong Kong', idfRequired: 'Yes', temporalRes: '5-min', durationRange: '0.25–24h', keyParams: 'DSD IDF profiles', peakPosition: 'front', advancementRatio: '~0.22', nestedIdf: true, dimensionless: false, sourceDoc: 'DSD Manual 5th Ed.', equationFamily: 'ABM', useCase: 'HK drainage design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  // ── Middle East patterns ──
  { id: 'saudi_pme', name: 'Saudi Arabia PME', taxonomyClass: '3.3', region: 'Saudi Arabia', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–6h', keyParams: '52% in first 15%', peakPosition: 'front', advancementRatio: '~0.10', nestedIdf: false, dimensionless: true, sourceDoc: 'MOMRA Drainage Manual', equationFamily: 'Parametric', useCase: 'Saudi wadi flood design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'uae_ncms', name: 'UAE NCMS', taxonomyClass: '3.3', region: 'UAE', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–6h', keyParams: '56% in first 18%', peakPosition: 'front', advancementRatio: '~0.12', nestedIdf: false, dimensionless: true, sourceDoc: 'NCM Flash Flood Std.', equationFamily: 'Parametric', useCase: 'UAE drainage design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'qatar_kahramaa', name: 'Qatar Kahramaa', taxonomyClass: '3.3', region: 'Qatar', idfRequired: 'No', temporalRes: '15-min', durationRange: '0.5–4h', keyParams: '58% in first 15%', peakPosition: 'front', advancementRatio: '~0.08', nestedIdf: false, dimensionless: true, sourceDoc: 'Ashghal Drainage Manual', equationFamily: 'Parametric', useCase: 'Doha urban drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'oman_dgman', name: 'Oman DGMAN', taxonomyClass: '3.3', region: 'Oman', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–12h', keyParams: 'Wadi + Khareef', peakPosition: 'front', advancementRatio: '~0.15', nestedIdf: false, dimensionless: true, sourceDoc: 'DGMAN Wadi Flood Std.', equationFamily: 'Parametric', useCase: 'Oman wadi/drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'turkey_mgm', name: 'Turkey MGM', taxonomyClass: '1.2', region: 'Turkey', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.38, IDF', peakPosition: 'variable', advancementRatio: '0.38', nestedIdf: true, dimensionless: true, sourceDoc: 'MGM IDF Standards', equationFamily: 'Keifer-Chu', useCase: 'Turkish drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'israel_ims', name: 'Israel IMS', taxonomyClass: '3.3', region: 'Israel', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–12h', keyParams: '60% in first 30%', peakPosition: 'front', advancementRatio: '~0.20', nestedIdf: false, dimensionless: true, sourceDoc: 'IMS Arid Design Std.', equationFamily: 'Parametric', useCase: 'Israeli drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'iran_irimo', name: 'Iran IRIMO', taxonomyClass: '1.2', region: 'Iran', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.35, IDF', peakPosition: 'variable', advancementRatio: '0.35', nestedIdf: true, dimensionless: true, sourceDoc: 'IRIMO IDF Standards', equationFamily: 'Keifer-Chu', useCase: 'Iranian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'iraq_mos', name: 'Iraq MoS', taxonomyClass: '3.3', region: 'Iraq', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–12h', keyParams: 'Arid front-loaded', peakPosition: 'front', advancementRatio: '~0.20', nestedIdf: false, dimensionless: true, sourceDoc: 'MoS Drainage Std.', equationFamily: 'Parametric', useCase: 'Iraqi drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'dubai_dm', name: 'Dubai Municipality', taxonomyClass: '3.3', region: 'UAE (Dubai)', idfRequired: 'Yes', temporalRes: '5-min', durationRange: '0.5–6h', keyParams: 'FEH 90th% needle', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: true, dimensionless: false, sourceDoc: 'Dubai DM 2024 Guidelines', equationFamily: 'FSR/FEH', useCase: 'Dubai drainage', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'abu_dhabi_adm', name: 'Abu Dhabi ADM', taxonomyClass: '3.3', region: 'UAE (Abu Dhabi)', idfRequired: 'Yes', temporalRes: '5-min', durationRange: '0.5–6h', keyParams: 'FEH 75th% peaked', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: true, dimensionless: false, sourceDoc: 'ADM 2024 Guidelines', equationFamily: 'FSR/FEH', useCase: 'Abu Dhabi drainage', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'arid_flash_flood', name: 'Arid Flash Flood', taxonomyClass: '3.5', region: 'Universal (Arid)', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–6h', keyParams: '70% in first 30%', peakPosition: 'front', advancementRatio: '~0.05', nestedIdf: false, dimensionless: true, sourceDoc: 'General arid practice', equationFamily: 'Parametric', useCase: 'Wadi flash flood', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  // ── African patterns ──
  { id: 'sa_sanral', name: 'South Africa SANRAL', taxonomyClass: '3.3', region: 'South Africa', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Modified Huff Q2', peakPosition: 'center', advancementRatio: '~0.35', nestedIdf: false, dimensionless: true, sourceDoc: 'SANRAL Drainage Manual', equationFamily: 'Huff', useCase: 'SA road drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'kenya_kmd', name: 'Kenya KMD', taxonomyClass: '3.3', region: 'Kenya', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–6h', keyParams: '65% in Q1', peakPosition: 'front', advancementRatio: '~0.15', nestedIdf: false, dimensionless: true, sourceDoc: 'KMD Design Manual', equationFamily: 'Parametric', useCase: 'Kenya highland drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'nigeria_nimet', name: 'Nigeria NiMet', taxonomyClass: '3.3', region: 'Nigeria', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–12h', keyParams: 'ITCZ center-peaked', peakPosition: 'center', advancementRatio: '~0.40', nestedIdf: false, dimensionless: true, sourceDoc: 'NiMet Drainage Manual', equationFamily: 'Parametric', useCase: 'Nigerian drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'egypt_hcww', name: 'Egypt HCWW', taxonomyClass: '3.3', region: 'Egypt', idfRequired: 'No', temporalRes: '15-min', durationRange: '0.5–3h', keyParams: '70% in first 15%', peakPosition: 'front', advancementRatio: '~0.07', nestedIdf: false, dimensionless: true, sourceDoc: 'HCWW Flash Flood Std.', equationFamily: 'Parametric', useCase: 'Egyptian drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'sa_wrc', name: 'South Africa WRC', taxonomyClass: '3.3', region: 'South Africa', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Modified Huff regional', peakPosition: 'center', advancementRatio: '~0.38', nestedIdf: false, dimensionless: true, sourceDoc: 'WRC Report TT 636/15', equationFamily: 'Huff', useCase: 'SA catchment design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'west_africa_cilss', name: 'West Africa CILSS', taxonomyClass: '3.3', region: 'Sahel (Burkina Faso, Mali, Niger)', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–6h', keyParams: '65% in Q1, squall line', peakPosition: 'front', advancementRatio: '~0.12', nestedIdf: false, dimensionless: true, sourceDoc: 'CILSS/AGRHYMET', equationFamily: 'Parametric', useCase: 'Sahel drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'morocco_dmn', name: 'Morocco DMN', taxonomyClass: '1.2', region: 'Morocco', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.38, IDF', peakPosition: 'variable', advancementRatio: '0.38', nestedIdf: true, dimensionless: true, sourceDoc: 'DMN IDF Standards', equationFamily: 'Keifer-Chu', useCase: 'Moroccan drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'ethiopia_nma', name: 'Ethiopia NMA', taxonomyClass: '1.2', region: 'Ethiopia', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.42, IDF', peakPosition: 'center', advancementRatio: '0.42', nestedIdf: true, dimensionless: true, sourceDoc: 'NMA IDF Standards', equationFamily: 'Keifer-Chu', useCase: 'Ethiopian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'ghana_gmet', name: 'Ghana GMet', taxonomyClass: '1.2', region: 'Ghana', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–12h', keyParams: 'r=0.32, IDF', peakPosition: 'front', advancementRatio: '0.32', nestedIdf: true, dimensionless: true, sourceDoc: 'GMet IDF Standards', equationFamily: 'Keifer-Chu', useCase: 'Ghana drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'tanzania_tma', name: 'Tanzania TMA', taxonomyClass: '1.2', region: 'Tanzania', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.44, IDF', peakPosition: 'center', advancementRatio: '0.44', nestedIdf: true, dimensionless: true, sourceDoc: 'TMA IDF Standards', equationFamily: 'Keifer-Chu', useCase: 'Tanzanian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'mozambique_inam', name: 'Mozambique INAM', taxonomyClass: '1.2', region: 'Mozambique', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.40, IDF', peakPosition: 'center', advancementRatio: '0.40', nestedIdf: true, dimensionless: true, sourceDoc: 'INAM Coastal Standards', equationFamily: 'Keifer-Chu', useCase: 'Mozambique drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  // ── Latin American patterns ──
  { id: 'brazil_ana', name: 'Brazil ANA', taxonomyClass: '3.4', region: 'Brazil', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Cetesb center-peaked', peakPosition: 'center', advancementRatio: '~0.45', nestedIdf: false, dimensionless: true, sourceDoc: 'ANA/DAEE Methodology', equationFamily: 'ABM', useCase: 'Brazilian drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'mexico_conagua', name: 'Mexico CONAGUA', taxonomyClass: '3.4', region: 'Mexico', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Front-loaded tropical', peakPosition: 'front', advancementRatio: '~0.30', nestedIdf: false, dimensionless: true, sourceDoc: 'SCT Highway Manual', equationFamily: 'Parametric', useCase: 'Mexican drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'colombia_ideam', name: 'Colombia IDEAM', taxonomyClass: '3.4', region: 'Colombia', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Tropical Andean', peakPosition: 'center', advancementRatio: '~0.45', nestedIdf: false, dimensionless: true, sourceDoc: 'IDEAM Standards', equationFamily: 'Parametric', useCase: 'Colombian drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'chile_dga', name: 'Chile DGA', taxonomyClass: '3.4', region: 'Chile', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Frontal/orographic', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'DGA Crecidas Manual', equationFamily: 'Parametric', useCase: 'Chilean drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'argentina_smn', name: 'Argentina SMN', taxonomyClass: '1.2', region: 'Argentina', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.33, IDF', peakPosition: 'front', advancementRatio: '0.33', nestedIdf: true, dimensionless: true, sourceDoc: 'SMN/Papadakis 1973', equationFamily: 'Keifer-Chu', useCase: 'Argentine drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'peru_senamhi', name: 'Peru SENAMHI', taxonomyClass: '1.2', region: 'Peru', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.40, IDF', peakPosition: 'center', advancementRatio: '0.40', nestedIdf: true, dimensionless: true, sourceDoc: 'SENAMHI IDF Standards', equationFamily: 'Keifer-Chu', useCase: 'Peruvian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'ecuador_inamhi', name: 'Ecuador INAMHI', taxonomyClass: '1.2', region: 'Ecuador', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.40, IDF', peakPosition: 'center', advancementRatio: '0.40', nestedIdf: true, dimensionless: true, sourceDoc: 'INAMHI Standards', equationFamily: 'Keifer-Chu', useCase: 'Ecuadorian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'venezuela_inameh', name: 'Venezuela INAMEH', taxonomyClass: '1.2', region: 'Venezuela', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.40, IDF', peakPosition: 'center', advancementRatio: '0.40', nestedIdf: true, dimensionless: true, sourceDoc: 'INAMEH Standards', equationFamily: 'Keifer-Chu', useCase: 'Venezuelan drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'puerto_rico', name: 'Puerto Rico', taxonomyClass: '2.2', region: 'Puerto Rico', idfRequired: 'No', temporalRes: '6-min', durationRange: '24h', keyParams: 'Modified SCS II', peakPosition: 'center', advancementRatio: '~0.48', nestedIdf: false, dimensionless: true, sourceDoc: 'NOAA Atlas 14 Vol. 3', equationFamily: 'SCS', useCase: 'PR drainage design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'upm_plata', name: 'UPM Río de la Plata', taxonomyClass: '3.4', region: 'Uruguay/Paraguay', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Center-peaked', peakPosition: 'center', advancementRatio: '~0.45', nestedIdf: false, dimensionless: true, sourceDoc: 'UPM Regional Study', equationFamily: 'Parametric', useCase: 'La Plata basin', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'bolivia_altiplano', name: 'Bolivia Altiplano', taxonomyClass: '2.2', region: 'Bolivia', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Modified SCS I, reduced peak', peakPosition: 'center', advancementRatio: '~0.40', nestedIdf: false, dimensionless: true, sourceDoc: 'SENAMHI Bolivia', equationFamily: 'SCS', useCase: 'Altiplano drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  // ── Oceania patterns ──
  { id: 'nz_tp108', name: 'Auckland TP108', taxonomyClass: '3.1', region: 'New Zealand (Auckland)', idfRequired: 'No', temporalRes: '15-min', durationRange: '0.5–72h', keyParams: 'Maritime convective', peakPosition: 'center', advancementRatio: '~0.45', nestedIdf: false, dimensionless: true, sourceDoc: 'Auckland Council TP108', equationFamily: 'Parametric', useCase: 'Auckland drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'nz_wellington', name: 'Wellington Regional', taxonomyClass: '3.1', region: 'New Zealand (Wellington)', idfRequired: 'No', temporalRes: '15-min', durationRange: '0.5–72h', keyParams: 'Frontal/orographic', peakPosition: 'front', advancementRatio: '~0.35', nestedIdf: false, dimensionless: true, sourceDoc: 'GWRC Design Standards', equationFamily: 'Parametric', useCase: 'Wellington drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'nz_christchurch', name: 'Christchurch Canterbury', taxonomyClass: '3.1', region: 'New Zealand (Canterbury)', idfRequired: 'No', temporalRes: '15-min', durationRange: '0.5–72h', keyParams: 'Rain-shadow symmetric', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'ECan Design Standards', equationFamily: 'Parametric', useCase: 'Canterbury drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'hirds_nz', name: 'HIRDS NZ', taxonomyClass: '3.1', region: 'New Zealand', idfRequired: 'Yes', temporalRes: '10-min', durationRange: '10min–72h', keyParams: 'Hyperbolic tangent', peakPosition: 'variable', advancementRatio: 'Variable', nestedIdf: true, dimensionless: false, sourceDoc: 'NIWA HIRDS v4', equationFamily: 'Parametric', useCase: 'NZ-wide design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'nz_niwa', name: 'NZ NIWA', taxonomyClass: '3.1', region: 'New Zealand', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '10min–72h', keyParams: 'NZ-wide calibrated', peakPosition: 'variable', advancementRatio: 'Variable', nestedIdf: true, dimensionless: false, sourceDoc: 'NIWA National Std.', equationFamily: 'Parametric', useCase: 'NZ complementary', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'arr2019', name: 'ARR 2019 Ensemble', taxonomyClass: '2.3', region: 'Australia', idfRequired: 'Yes', temporalRes: 'Any', durationRange: 'Varies', keyParams: 'Ensemble 10 patterns', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'ARR 2019', equationFamily: 'Ensemble', useCase: 'Australian modern standard', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'arr87_legacy', name: 'ARR87 Legacy', taxonomyClass: '2.3', region: 'Australia', idfRequired: 'Yes', temporalRes: 'Any', durationRange: 'Varies', keyParams: 'Pre-2016 IFD', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'ARR 1987 (BoM)', equationFamily: 'Ensemble', useCase: 'Australian legacy', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'pacific_sprep', name: 'Pacific SPREP', taxonomyClass: '3.1', region: 'Pacific Islands', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Tropical cyclone', peakPosition: 'front', advancementRatio: '~0.20', nestedIdf: false, dimensionless: true, sourceDoc: 'SPREP Guidelines', equationFamily: 'Parametric', useCase: 'Pacific SIDS drainage', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  // ── European patterns ──
  { id: 'dutch', name: 'Dutch NEERSLAG', taxonomyClass: '3.2', region: 'Netherlands', idfRequired: 'No', temporalRes: '5-min', durationRange: '0.5–24h', keyParams: 'Asymmetric polder', peakPosition: 'front', advancementRatio: '~0.30', nestedIdf: false, dimensionless: true, sourceDoc: 'STOWA/NEERSLAG', equationFamily: 'Parametric', useCase: 'Dutch polder drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'italian', name: 'Italian Standard', taxonomyClass: '3.2', region: 'Italy', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'Sharp Mediterranean', peakPosition: 'center', advancementRatio: '~0.45', nestedIdf: false, dimensionless: true, sourceDoc: 'Italian hydrological practice', equationFamily: 'Gamma', useCase: 'Italian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'danish_svk', name: 'Denmark SVK', taxonomyClass: '1.2', region: 'Denmark', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.375, Danish IDF', peakPosition: 'variable', advancementRatio: '0.375', nestedIdf: true, dimensionless: true, sourceDoc: 'SVK Guidelines', equationFamily: 'Keifer-Chu', useCase: 'Danish drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'swedish_smhi', name: 'Sweden SMHI', taxonomyClass: '1.2', region: 'Sweden', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.35, Gothenburg', peakPosition: 'variable', advancementRatio: '0.35', nestedIdf: true, dimensionless: true, sourceDoc: 'P110 / SMHI', equationFamily: 'Keifer-Chu', useCase: 'Swedish drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'norwegian_nve', name: 'Norway NVE', taxonomyClass: '1.2', region: 'Norway', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.33, NVE IDF', peakPosition: 'variable', advancementRatio: '0.33', nestedIdf: true, dimensionless: true, sourceDoc: 'NVE Standards', equationFamily: 'Keifer-Chu', useCase: 'Norwegian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'finnish_fmi', name: 'Finland FMI', taxonomyClass: '1.2', region: 'Finland', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.35, FMI IDF', peakPosition: 'variable', advancementRatio: '0.35', nestedIdf: true, dimensionless: true, sourceDoc: 'FMI Standards', equationFamily: 'Keifer-Chu', useCase: 'Finnish drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'swiss_idf', name: 'Swiss IDF', taxonomyClass: '1.2', region: 'Switzerland', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.40, cantonal IDF', peakPosition: 'variable', advancementRatio: '0.40', nestedIdf: true, dimensionless: true, sourceDoc: 'Swiss cantonal IDF', equationFamily: 'Keifer-Chu', useCase: 'Swiss drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'spanish_cedex', name: 'Spain CEDEX', taxonomyClass: '1.3', region: 'Spain', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'ABM + regional IDF', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'CEDEX ABM Standard', equationFamily: 'ABM', useCase: 'Spanish drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'belgian_irm', name: 'Belgium IRM', taxonomyClass: '1.2', region: 'Belgium', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.50, IRM IDF', peakPosition: 'center', advancementRatio: '0.50', nestedIdf: true, dimensionless: true, sourceDoc: 'IRM/KMI Standards', equationFamily: 'Keifer-Chu', useCase: 'Belgian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'kostra_dwd', name: 'KOSTRA-DWD', taxonomyClass: '1.6', region: 'Germany', idfRequired: 'Yes', temporalRes: '5-min', durationRange: '0.5–72h', keyParams: 'Euler II + DWD data', peakPosition: 'front', advancementRatio: '0.30', nestedIdf: true, dimensionless: false, sourceDoc: 'KOSTRA-DWD 2020', equationFamily: 'Euler', useCase: 'German standard', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'm5_60_fsr', name: 'M5-60 (UK/Ireland)', taxonomyClass: '2.4', region: 'UK/Ireland', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–2h', keyParams: 'Peaked FSR variant', peakPosition: 'center', advancementRatio: '~0.42', nestedIdf: false, dimensionless: true, sourceDoc: 'FSR M5-60', equationFamily: 'FSR/FEH', useCase: 'Short-duration UK', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'shyreg_fr', name: 'SHYREG (France)', taxonomyClass: '3.2', region: 'France', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '1–72h', keyParams: 'Stochastic generator', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: false, dimensionless: false, sourceDoc: 'INRAE SHYREG', equationFamily: 'Ensemble', useCase: 'French hydrology', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'ireland_met', name: 'Ireland Met Éireann', taxonomyClass: '2.4', region: 'Ireland', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.25–48h', keyParams: 'Irish DDF + FEH', peakPosition: 'center', advancementRatio: '~0.42', nestedIdf: true, dimensionless: false, sourceDoc: 'Met Éireann DDF', equationFamily: 'FSR/FEH', useCase: 'Irish design', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'austria_okostra', name: 'Austria ÖKOSTRA', taxonomyClass: '1.6', region: 'Austria', idfRequired: 'Yes', temporalRes: '5-min', durationRange: '0.5–72h', keyParams: 'Euler II Austrian', peakPosition: 'front', advancementRatio: '0.30', nestedIdf: true, dimensionless: false, sourceDoc: 'ÖKOSTRA Standards', equationFamily: 'Euler', useCase: 'Austrian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'france_shypre', name: 'France SHYPRE', taxonomyClass: '3.2', region: 'France', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '1–24h', keyParams: 'Regionalized convective', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: false, dimensionless: false, sourceDoc: 'Météo-France SHYPRE', equationFamily: 'Ensemble', useCase: 'French design', swmmCompat: 'Conversion', icmCompat: 'Direct' },
  { id: 'poland_panda', name: 'Poland PANDa', taxonomyClass: '3.2', region: 'Poland', idfRequired: 'Yes', temporalRes: '5-min', durationRange: '0.5–24h', keyParams: 'Cluster-based', peakPosition: 'center', advancementRatio: '~0.42', nestedIdf: true, dimensionless: false, sourceDoc: 'PANDa Atlas', equationFamily: 'ABM', useCase: 'Modern Polish design', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'portugal_ipma', name: 'Portugal IPMA', taxonomyClass: '1.2', region: 'Portugal', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.40, IDF', peakPosition: 'center', advancementRatio: '0.40', nestedIdf: true, dimensionless: true, sourceDoc: 'IPMA Standards', equationFamily: 'Keifer-Chu', useCase: 'Portuguese drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'russia_roshydromet', name: 'Russia Roshydromet', taxonomyClass: '1.2', region: 'Russia', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.40, IDF', peakPosition: 'center', advancementRatio: '0.40', nestedIdf: true, dimensionless: true, sourceDoc: 'Roshydromet Standards', equationFamily: 'Keifer-Chu', useCase: 'Russian drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'czech_chmu', name: 'Czech ČHMÚ', taxonomyClass: '1.2', region: 'Czech Republic', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'r=0.38, IDF', peakPosition: 'variable', advancementRatio: '0.38', nestedIdf: true, dimensionless: true, sourceDoc: 'ČHMÚ Standards', equationFamily: 'Keifer-Chu', useCase: 'Czech drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'belgium_willems', name: 'Belgium Willems', taxonomyClass: '1.3', region: 'Belgium (Flanders)', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'Nested IDF composite', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'Willems 2000', equationFamily: 'ABM', useCase: 'Flanders drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'russia_snip', name: 'Russia SNiP', taxonomyClass: '3.2', region: 'Russia', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'q=A(1+C·ln Tr)/t^n', peakPosition: 'front', advancementRatio: 'N/A', nestedIdf: false, dimensionless: false, sourceDoc: 'SNiP/SP 32.13330', equationFamily: 'Power Law', useCase: 'Russian sewer code', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'turkey_dsi', name: 'Turkey DSİ', taxonomyClass: '3.2', region: 'Turkey', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'i=A/(t+B)^C', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: false, dimensionless: false, sourceDoc: 'DSİ Regional IDF', equationFamily: 'Power Law', useCase: 'Turkish hydraulics', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'greece_hellenic', name: 'Greece Hellenic', taxonomyClass: '3.2', region: 'Greece', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'i=a/(t+θ)^η', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: false, dimensionless: false, sourceDoc: 'Koutsoyiannis-Baloutsos', equationFamily: 'Power Law', useCase: 'Greek drainage', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'romania_stas', name: 'Romania STAS', taxonomyClass: '3.2', region: 'Romania', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'i=a·Tr^b/t^c', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: false, dimensionless: false, sourceDoc: 'STAS/Andrei Method', equationFamily: 'Power Law', useCase: 'Romanian drainage', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'poland_bs', name: 'Poland Bogdanowicz-Stachy', taxonomyClass: '3.2', region: 'Poland', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'P(t,p)=1.42·t^0.33+α', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: false, dimensionless: false, sourceDoc: 'Bogdanowicz-Stachy', equationFamily: 'Power Law', useCase: 'Polish legacy design', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'euro_cordex', name: 'EURO-CORDEX', taxonomyClass: '5.1', region: 'Europe', idfRequired: 'Yes', temporalRes: 'Any', durationRange: 'Varies', keyParams: 'RCP/SSP scenarios', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'EURO-CORDEX Ensemble', equationFamily: 'Ensemble', useCase: 'Climate-adapted European', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'cyprus_wdd', name: 'Cyprus WDD', taxonomyClass: '1.4', region: 'Cyprus', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–12h', keyParams: 'Double triangle', peakPosition: 'variable', advancementRatio: '~0.25 & ~0.65', nestedIdf: false, dimensionless: true, sourceDoc: 'WDD Drainage Manual', equationFamily: 'Triangular', useCase: 'Cyprus drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'malta_mra', name: 'Malta MRA', taxonomyClass: '1.2', region: 'Malta', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '0.5–12h', keyParams: 'r=0.32, Huff/Chicago', peakPosition: 'front', advancementRatio: '0.32', nestedIdf: true, dimensionless: true, sourceDoc: 'MRA Drainage Standards', equationFamily: 'Keifer-Chu', useCase: 'Malta drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  // ── International / Special purpose ──
  { id: 'eccc_idf', name: 'ECCC IDF (Canada)', taxonomyClass: '3.4', region: 'Canada', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '5min–24h', keyParams: 'Lat/Lon, Tr', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'ECCC Engineering Climate', equationFamily: 'ABM', useCase: 'Canadian design standard', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'csa_w231', name: 'CSA W231 (Canada)', taxonomyClass: '5.1', region: 'Canada', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '5min–24h', keyParams: 'Non-stationary IDF', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'CSA W231 (2024)', equationFamily: 'ABM', useCase: 'Climate-adapted Canadian', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'aes_30', name: 'AES Canada 30%', taxonomyClass: '2.3', region: 'Canada (Ontario)', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'Peak at 30%', peakPosition: 'front', advancementRatio: '0.30', nestedIdf: false, dimensionless: true, sourceDoc: 'AES/Hogg 1980', equationFamily: 'Ensemble', useCase: 'Ontario drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'aes_40', name: 'AES Canada 40%', taxonomyClass: '2.3', region: 'Canada (BC/Prairies)', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'Peak at 40%', peakPosition: 'center', advancementRatio: '0.40', nestedIdf: false, dimensionless: true, sourceDoc: 'AES/Hogg 1980', equationFamily: 'Ensemble', useCase: 'BC/Prairie drainage', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'pmp_wmo', name: 'PMP WMO Generalized', taxonomyClass: '3.5', region: 'Global', idfRequired: 'No', temporalRes: 'Any', durationRange: '6–72h', keyParams: 'PMP=X̄n+Km·Sn', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'WMO-No. 1045', equationFamily: 'ABM', useCase: 'Global dam safety', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'nested_envelope', name: 'Nested Envelope', taxonomyClass: '3.5', region: 'United States', idfRequired: 'Yes', temporalRes: 'Any', durationRange: '6–72h', keyParams: 'Worst-case nesting', peakPosition: 'center', advancementRatio: 'N/A', nestedIdf: true, dimensionless: false, sourceDoc: 'USACE Dam Safety', equationFamily: 'ABM', useCase: 'Dam safety envelope', swmmCompat: 'Conversion', icmCompat: 'Conversion' },
  { id: 'barbados_bms', name: 'Barbados BMS', taxonomyClass: '3.4', region: 'Barbados', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Modified Hershfield PMP', peakPosition: 'front', advancementRatio: '~0.20', nestedIdf: false, dimensionless: true, sourceDoc: 'BMS Design Manual', equationFamily: 'Parametric', useCase: 'Caribbean island', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'oecs_caribbean', name: 'OECS Caribbean', taxonomyClass: '3.4', region: 'Eastern Caribbean', idfRequired: 'No', temporalRes: '15-min', durationRange: '1–24h', keyParams: 'Bell method + TC adj.', peakPosition: 'front', advancementRatio: '~0.25', nestedIdf: false, dimensionless: true, sourceDoc: 'OECS Guidelines', equationFamily: 'Parametric', useCase: 'Caribbean SIDS', swmmCompat: 'Direct', icmCompat: 'Conversion' },
  { id: 'fourier_multipeak', name: 'Fourier Multi-Peak', taxonomyClass: '4.1', region: 'Universal', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–24h', keyParams: 'Harmonic coefficients', peakPosition: 'variable', advancementRatio: 'N/A', nestedIdf: false, dimensionless: true, sourceDoc: 'Research method', equationFamily: 'Parametric', useCase: 'Research/academic', swmmCompat: 'Direct', icmCompat: 'Direct' },
  { id: 'cc_idf_scaled', name: 'CC-IDF Scaled', taxonomyClass: '5.1', region: 'Universal', idfRequired: 'No', temporalRes: 'Any', durationRange: '0.5–72h', keyParams: 'SSP2-4.5 ~20% uplift', peakPosition: 'center', advancementRatio: '~0.50', nestedIdf: false, dimensionless: true, sourceDoc: 'Climate scaling method', equationFamily: 'SCS', useCase: 'Future climate design', swmmCompat: 'Direct', icmCompat: 'Conversion' },
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
