import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type PatternType } from "@/lib/rainfallPatterns";

interface PatternOption {
  id: PatternType;
  name: string;
  icon: string;
  description: string;
  category: 'swmm' | 'icm' | 'international' | 'us_agency' | 'european' | 'asian' | 'middle_east' | 'african' | 'latam' | 'oceania' | 'americas' | 'scandinavian';
}

export const patterns: PatternOption[] = [
  {
    id: 'block',
    name: 'Block Pattern',
    icon: '▯',
    description: 'Uniform intensity throughout the storm duration. Simple and commonly used for preliminary analysis.',
    category: 'swmm',
  },
  {
    id: 'scs1',
    name: 'SCS Type I',
    icon: '⏐',
    description: 'NRCS (SCS) Type I distribution for Pacific maritime climate with wet winters. Peak occurs earlier than Type II.',
    category: 'swmm',
  },
  {
    id: 'scs1a',
    name: 'SCS Type IA',
    icon: '⏐',
    description: 'NRCS (SCS) Type IA for Pacific Northwest coastal areas. Represents maritime climate with very wet winters and early peak.',
    category: 'swmm',
  },
  {
    id: 'scs2',
    name: 'SCS Type II',
    icon: '⏐',
    description: 'Standard NRCS (SCS) 24-hour rainfall distribution with peak intensity around the middle of the storm. Most common for design storms in the US.',
    category: 'swmm',
  },
  {
    id: 'scs3',
    name: 'SCS Type III',
    icon: '⏐',
    description: 'NRCS (SCS) Type III for Gulf Coast and coastal areas with frequent tropical storms. Features sharp peak and heavy rainfall.',
    category: 'swmm',
  },
  {
    id: 'balanced',
    name: 'Balanced Storm',
    icon: '⚖',
    description: 'Alternating block method derived from IDF curves. Theoretically superior because it uses site-specific IDF data. Widely accepted by agencies nationwide.',
    category: 'swmm',
  },
  {
    id: 'yen_chow',
    name: 'Yen & Chow',
    icon: '△',
    description: 'Triangular hyetograph with variable time-to-peak ratio (r=0.375). Simplest non-uniform distribution. Excellent for sensitivity analysis and developing regions.',
    category: 'swmm',
  },
  {
    id: 'double',
    name: 'Double Peak',
    icon: '⩗',
    description: 'Pattern with two intensity peaks, simulating complex storm systems with multiple convective cells.',
    category: 'swmm',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '✎',
    description: 'Draw your own rainfall distribution using the interactive chart. Click and drag to adjust intensities.',
    category: 'swmm',
  },
  // US Agency patterns
  {
    id: 'fdot1',
    name: 'FDOT Zone 1',
    icon: '🌴',
    description: 'Florida DOT Zone 1 (NW Florida). Modified Type II, slightly front-loaded. Required for all FDOT projects in the panhandle region.',
    category: 'us_agency',
  },
  {
    id: 'fdot2',
    name: 'FDOT Zone 2',
    icon: '🌴',
    description: 'Florida DOT Zone 2 (NE Florida). Modified Type II distribution. Required for FDOT projects in northeastern Florida.',
    category: 'us_agency',
  },
  {
    id: 'fdot3',
    name: 'FDOT Zone 3',
    icon: '🌴',
    description: 'Florida DOT Zone 3 (Central FL). Unique tropical distribution with earlier, more intense peak. Required for FDOT projects in central Florida.',
    category: 'us_agency',
  },
  {
    id: 'fdot4',
    name: 'FDOT Zone 4',
    icon: '🌴',
    description: 'Florida DOT Zone 4 (SE Florida). Heavily front-loaded convective pattern. Required for FDOT projects in southeast Florida including Miami-Dade.',
    category: 'us_agency',
  },
  {
    id: 'fdot5',
    name: 'FDOT Zone 5',
    icon: '🌴',
    description: 'Florida DOT Zone 5 (SW Florida). Similar to Zone 4 with slightly less front-loading. Required for FDOT projects in southwest Florida.',
    category: 'us_agency',
  },
  {
    id: 'txdot',
    name: 'TxDOT',
    icon: '⛰',
    description: 'Texas DOT empirical hyetograph based on USGS Texas rainfall studies (SIR 2004-5075). Required for TxDOT hydraulic design submittals.',
    category: 'us_agency',
  },
  {
    id: 'noaa_a14',
    name: 'NOAA Atlas 14',
    icon: '📡',
    description: 'NOAA Atlas 14 temporal distribution (50th percentile). Derived from actual recording rain gage data. Supersedes SCS types where Atlas 14 data exists.',
    category: 'us_agency',
  },
  // US Agency - additional
  {
    id: 'udfcd',
    name: 'UDFCD Denver',
    icon: '🏔',
    description: 'Urban Drainage and Flood Control District (Colorado) 2-hour design storm. Front-loaded with 60% of rain in first quarter. Required for Denver metro area projects.',
    category: 'us_agency',
  },
  {
    id: 'usace_sps',
    name: 'USACE SPS',
    icon: '🏛',
    description: 'US Army Corps of Engineers Standard Project Storm. Envelope of severe storms for dam safety and major flood control. Broader peak than SCS for large-area storms.',
    category: 'us_agency',
  },
  {
    id: 'pmp_hmr',
    name: 'PMP (HMR 51/52)',
    icon: '☢',
    description: 'Probable Maximum Precipitation based on NOAA HMR 51/52 generalized storm shape. Worst-case meteorological scenario for dam safety and nuclear facility design. Very broad, sustained peak with heavy front-loading.',
    category: 'us_agency',
  },
  // InfoWorks / UK patterns
  {
    id: 'triangular',
    name: 'Triangular',
    icon: '△',
    description: 'Triangular profile with linear rise to peak and linear recession. Common in UK practice and InfoWorks ICM modeling.',
    category: 'icm',
  },
  {
    id: 'trapezoidal',
    name: 'Trapezoidal',
    icon: '⏢',
    description: 'Trapezoidal profile with rising limb, sustained peak period, and falling limb. Used for design storms in InfoWorks ICM.',
    category: 'icm',
  },
  {
    id: 'fsr',
    name: 'FSR Profile',
    icon: '📊',
    description: 'Flood Studies Report (FSR) rainfall profile. Standard design storm profile used in UK drainage design with InfoWorks.',
    category: 'icm',
  },
  {
    id: 'feh',
    name: 'FEH (UK)',
    icon: '🇬🇧',
    description: 'Flood Estimation Handbook (FEH) temporal profile. Modern successor to FSR with improved temporal distributions for UK flood estimation.',
    category: 'icm',
  },
  // European patterns
  {
    id: 'euler1',
    name: 'Euler Type I',
    icon: '⟨',
    description: 'Euler Type I front-loaded distribution. Peak in first 1/6 of duration. Used in German/European practice for conservative sewer design.',
    category: 'european',
  },
  {
    id: 'euler2',
    name: 'Euler Type II',
    icon: '⟩',
    description: 'Euler Type II center-peaked distribution. Peak in second 1/6 of duration. Standard for German drainage design per DWA guidelines.',
    category: 'european',
  },
  {
    id: 'desbordes_double',
    name: 'Double Triangle',
    icon: '⩗',
    description: 'Desbordes Double Triangle with defined valley between two peaks. Used in French and European urban drainage for complex storm modeling.',
    category: 'european',
  },
  // International patterns
  {
    id: 'canadian',
    name: 'Canadian CDA',
    icon: '🇨🇦',
    description: 'Canadian Dam Association / Ontario MTO temporal pattern. Modified Type II adapted for Canadian climate with broader central peak and extended tails.',
    category: 'international',
  },
  {
    id: 'chicago',
    name: 'Chicago Storm',
    icon: '🌆',
    description: 'Alternating block method widely used in urban hydrology worldwide. Peak intensity positioned at specified time with alternating blocks before and after.',
    category: 'international',
  },
  {
    id: 'huff1',
    name: 'Huff 1st Quartile',
    icon: '📈',
    description: 'Huff curve with most rainfall in first quartile. Common for short-duration, high-intensity storms. Used globally for design storms.',
    category: 'international',
  },
  {
    id: 'huff2',
    name: 'Huff 2nd Quartile',
    icon: '📊',
    description: 'Huff curve with peak in second quartile. Typical of frontal storms. Widely adopted in international hydrologic practice.',
    category: 'international',
  },
  {
    id: 'huff3',
    name: 'Huff 3rd Quartile',
    icon: '📉',
    description: 'Huff curve with peak in third quartile. Represents storms with late-arriving intensity. Used in probabilistic design.',
    category: 'international',
  },
  {
    id: 'huff4',
    name: 'Huff 4th Quartile',
    icon: '📐',
    description: 'Huff curve with peak in final quartile. Characterizes storms with extended build-up period. Applied in various climatic regions.',
    category: 'international',
  },
  {
    id: 'desbordes',
    name: 'Desbordes',
    icon: '🇫🇷',
    description: 'French standard design storm profile. Double-triangle pattern commonly used in European urban drainage design and Caquot method.',
    category: 'international',
  },
  {
    id: 'dwa',
    name: 'German DWA',
    icon: '🇩🇪',
    description: 'German DWA-A 531 standard design storm. Euler Type II pattern widely used in German drainage design with characteristic central peak.',
    category: 'international',
  },
  {
    id: 'dutch',
    name: 'Dutch NEERSLAG',
    icon: '🇳🇱',
    description: 'Dutch national rainfall pattern (NEERSLAG/STOWA). Asymmetric distribution optimized for Netherlands low-lying areas and polder systems.',
    category: 'international',
  },
  {
    id: 'italian',
    name: 'Italian Pattern',
    icon: '🇮🇹',
    description: 'Italian design storm for Mediterranean climate. Sharp peak pattern representing intense convective storms typical in Southern Europe.',
    category: 'international',
  },
  {
    id: 'arr',
    name: 'Australian ARR',
    icon: '🇦🇺',
    description: 'Australian Rainfall & Runoff design storm. Ensemble-based temporal pattern used across Australia with regional variations.',
    category: 'international',
  },
  {
    id: 'jma',
    name: 'Japan JMA',
    icon: '🇯🇵',
    description: 'Japan Meteorological Agency design storm pattern. Center-peaked distribution commonly used in Japanese urban drainage design with emphasis on typhoon characteristics.',
    category: 'international',
  },
  {
    id: 'china',
    name: 'China Design Storm',
    icon: '🇨🇳',
    description: 'Chinese national standard design storm (Pillow-shaped). Peak-centered triangular pattern widely used in urban flood control and drainage design across China.',
    category: 'international',
  },
  {
    id: 'sa_huff',
    name: 'South African Huff',
    icon: '🇿🇦',
    description: 'South African adapted Huff curve. Modified 2nd quartile pattern calibrated for South African rainfall characteristics and used in regional design practices.',
    category: 'international',
  },
  // Asian Design Storms
  {
    id: 'singapore_pub',
    name: 'Singapore PUB',
    icon: '🇸🇬',
    description: 'PUB (Public Utilities Board) tropical convective standard. Front-loaded with 70-80% of rain in first 30 minutes. Required for all Singapore drainage design.',
    category: 'asian',
  },
  {
    id: 'china_gb50014',
    name: 'China GB 50014',
    icon: '🇨🇳',
    description: 'Chinese national standard (GB 50014-2021) urban drainage design storm. Short-duration high-peak pattern derived from city-specific rainstorm intensity formulas.',
    category: 'asian',
  },
  {
    id: 'china_prd',
    name: 'China PRD',
    icon: '🌊',
    description: 'Pearl River Delta typhoon-influenced distribution. Front-loaded with extended tail representing outer typhoon rain bands. Used for Guangzhou, Shenzhen, Hong Kong region.',
    category: 'asian',
  },
  {
    id: 'india_imd',
    name: 'India IMD',
    icon: '🇮🇳',
    description: 'India Meteorological Department monsoon standard. Center-peaked with gradual build-up. Used for Smart Cities Mission drainage and CWC dam design across India.',
    category: 'asian',
  },
  {
    id: 'india_coastal',
    name: 'India Coastal',
    icon: '🌀',
    description: 'Indian coastal cyclonic storm distribution. Very sharp early peak representing cyclone eye passage. Used for Tamil Nadu, Andhra Pradesh, Odisha coastal infrastructure.',
    category: 'asian',
  },
  {
    id: 'japan_amedas',
    name: 'Japan AMeDAS',
    icon: '🇯🇵',
    description: 'Japanese AMeDAS network short-duration convective pattern. Very sharp center peak with rapid onset/recession. Based on 1,300 automated stations nationwide.',
    category: 'asian',
  },
  {
    id: 'japan_baiu',
    name: 'Japan Baiu (梅雨)',
    icon: '☔',
    description: 'Japanese Baiu (plum rain) frontal distribution. Broader, moderate-intensity pattern representing June-July seasonal front. Used for extended-duration drainage design.',
    category: 'asian',
  },
  {
    id: 'japan_typhoon',
    name: 'Japan Typhoon',
    icon: '🌀',
    description: 'Japanese typhoon double-band pattern. Two peaks representing outer rain band and inner eyewall passage. Used for JSCE flood control and super-levee design.',
    category: 'asian',
  },
  {
    id: 'korea_kma',
    name: 'Korea KMA',
    icon: '🇰🇷',
    description: 'Korean Meteorological Administration standard. Center-peaked monsoon/convective hybrid. Required for Ministry of Environment urban flood control design.',
    category: 'asian',
  },
  {
    id: 'malaysia_msma',
    name: 'Malaysia MSMA',
    icon: '🇲🇾',
    description: 'Malaysian MSMA 2nd Edition (2012) standard. Tropical monsoon + convective pattern for urban drainage. Required for all DID projects including Klang Valley.',
    category: 'asian',
  },
  {
    id: 'indonesia_bmkg',
    name: 'Indonesia BMKG',
    icon: '🇮🇩',
    description: 'Indonesian BMKG tropical convective pattern. Very front-loaded Jakarta-style distribution for wet season (Nov-Mar). Used for Jakarta flood control projects.',
    category: 'asian',
  },
  {
    id: 'philippines_pagasa',
    name: 'Philippines PAGASA',
    icon: '🇵🇭',
    description: 'PAGASA typhoon/monsoon distribution. Very front-loaded for typhoon events with extended tail. Accounts for super-typhoon class events (>220 kph).',
    category: 'asian',
  },
  {
    id: 'vietnam_imhen',
    name: 'Vietnam IMHEN',
    icon: '🇻🇳',
    description: 'Vietnamese IMHEN monsoon/convective hybrid pattern. HCMC-style moderate front-loading. Central coast variant accounts for typhoon influence.',
    category: 'asian',
  },
  {
    id: 'thailand_tmd',
    name: 'Thailand TMD',
    icon: '🇹🇭',
    description: 'Thai Meteorological Department Bangkok BMA pattern. Southwest monsoon with urban heat island intensification. Required for Bangkok metro drainage projects.',
    category: 'asian',
  },
  {
    id: 'saudi_pme',
    name: 'Saudi Arabia PME',
    icon: '🇸🇦',
    description: 'PME arid flash flood pattern. Extremely front-loaded Jeddah/Riyadh wadi flood distribution. Most rainfall in first 20% of duration. Required for Saudi MOMRA drainage projects.',
    category: 'middle_east',
  },
  {
    id: 'uae_ncms',
    name: 'UAE NCMS',
    icon: '🇦🇪',
    description: 'National Center of Meteorology flash flood pattern. Dubai/Abu Dhabi extreme burst with rapid decay. Accounts for cloud seeding enhanced events.',
    category: 'middle_east',
  },
  {
    id: 'qatar_kahramaa',
    name: 'Qatar Kahramaa',
    icon: '🇶🇦',
    description: 'Kahramaa/Ashghal drainage design standard. Extremely arid flash flood — shortest burst among GCC patterns. Doha urban drainage standard.',
    category: 'middle_east',
  },
  {
    id: 'oman_dgman',
    name: 'Oman DGMAN',
    icon: '🇴🇲',
    description: 'DGMAN Muscat/Salalah wadi flood pattern. Includes Shamal wind-driven and Khareef (monsoon) influence for Dhofar region.',
    category: 'middle_east',
  },
  // African Design Storms
  {
    id: 'sa_sanral',
    name: 'South Africa SANRAL',
    icon: '🇿🇦',
    description: 'SANRAL Drainage Manual design storm. Modified Huff 2nd quartile calibrated for South African conditions. Required for national road drainage design.',
    category: 'african',
  },
  {
    id: 'kenya_kmd',
    name: 'Kenya KMD',
    icon: '🇰🇪',
    description: 'Kenya Meteorological Department convective storm. Front-loaded East African highland pattern with 65% of rain in first quarter. Used for Nairobi and highland drainage.',
    category: 'african',
  },
  {
    id: 'nigeria_nimet',
    name: 'Nigeria NiMet',
    icon: '🇳🇬',
    description: 'Nigerian Meteorological Agency ITCZ-driven pattern. Center-peaked with broad shoulders representing West African monsoon convection. Used for Lagos and southern Nigeria.',
    category: 'african',
  },
  {
    id: 'egypt_hcww',
    name: 'Egypt HCWW',
    icon: '🇪🇬',
    description: 'HCWW (Holding Company for Water & Wastewater) flash flood pattern. Extremely front-loaded arid burst with 70% in first 15% of duration. Used for Cairo and Nile Delta drainage.',
    category: 'african',
  },
  // Latin American Design Storms
  {
    id: 'brazil_ana',
    name: 'Brazil ANA',
    icon: '🇧🇷',
    description: 'ANA (Agência Nacional de Águas) tropical convective storm. Center-peaked pattern based on DAEE/Cetesb methodology. Used for São Paulo, Rio de Janeiro urban drainage design.',
    category: 'latam',
  },
  {
    id: 'mexico_conagua',
    name: 'Mexico CONAGUA',
    icon: '🇲🇽',
    description: 'CONAGUA (Comisión Nacional del Agua) design storm. Front-loaded tropical convective pattern based on SCT highway drainage manual. Used for Mexico City and central Mexico.',
    category: 'latam',
  },
  {
    id: 'colombia_ideam',
    name: 'Colombia IDEAM',
    icon: '🇨🇴',
    description: 'IDEAM tropical Andean convective pattern. Center-peaked with sustained intensity for inter-Andean valleys. Used for Bogotá and Medellín drainage design.',
    category: 'latam',
  },
  {
    id: 'chile_dga',
    name: 'Chile DGA',
    icon: '🇨🇱',
    description: 'DGA (Dirección General de Aguas) frontal/orographic pattern. Broad center peak for central Chile winter storms. Based on Manual de Cálculo de Crecidas.',
    category: 'latam',
  },
  {
    id: 'nz_tp108',
    name: 'Auckland TP108',
    icon: '🇳🇿',
    description: 'Auckland Council TP108 design storm. Maritime convective pattern with center-peaked distribution for Auckland region drainage design.',
    category: 'oceania',
  },
  {
    id: 'nz_wellington',
    name: 'Wellington Regional',
    icon: '🇳🇿',
    description: 'Wellington Regional Council design storm. Front-loaded frontal pattern with orographic uplift.',
    category: 'oceania',
  },
  {
    id: 'nz_christchurch',
    name: 'Christchurch Canterbury',
    icon: '🇳🇿',
    description: 'Christchurch/Canterbury design storm. Broader symmetric distribution for eastern rain-shadow plains.',
    category: 'oceania',
  },
  {
    id: 'hirds_nz',
    name: 'HIRDS NZ',
    icon: '🇳🇿',
    description: 'HIRDS v4 asymmetric hyperbolic tangent temporal pattern. Six-region NZ-wide design storm system from NIWA.',
    category: 'oceania',
  },
  {
    id: 'pilgrim_cordery',
    name: 'Pilgrim-Cordery',
    icon: '🇦🇺',
    description: 'Pilgrim & Cordery (1975) historical Australian empirical dimensionless ordinate method. Pre-ARR2016 standard.',
    category: 'oceania',
  },
  {
    id: 'fiji_fms',
    name: 'Fiji FMS',
    icon: '🇫🇯',
    description: 'Fiji Meteorological Service tropical cyclone and convective storm pattern. Short intense tropical storms with early peak.',
    category: 'oceania',
  },
  // Scandinavian patterns
  {
    id: 'danish_svk',
    name: 'Denmark SVK',
    icon: '🇩🇰',
    description: 'Danish Water Pollution Committee (Spildevandskomiteen) Chicago-type storm with r=0.375 and Danish IDF parameters.',
    category: 'scandinavian',
  },
  {
    id: 'swedish_smhi',
    name: 'Sweden SMHI',
    icon: '🇸🇪',
    description: 'Swedish SMHI / Svenskt Vatten P110 Chicago-type storm with r=0.35 based on Gothenburg data (Arnell 1982).',
    category: 'scandinavian',
  },
  {
    id: 'norwegian_nve',
    name: 'Norway NVE',
    icon: '🇳🇴',
    description: 'Norwegian Water Resources and Energy Directorate Chicago variant with r=0.33 and local intensity tables.',
    category: 'scandinavian',
  },
  {
    id: 'finnish_fmi',
    name: 'Finland FMI',
    icon: '🇫🇮',
    description: 'Finnish Meteorological Institute Chicago variant with r=0.35 for Finnish climate conditions.',
    category: 'scandinavian',
  },
  // Additional European patterns
  {
    id: 'sifalda',
    name: 'Sifalda (Czech)',
    icon: '🇨🇿',
    description: 'Sifalda (1973) three-part storm from Czech city analysis. 14% depth in 0-34%, 56% in 34-51%, 30% in 51-100%.',
    category: 'european',
  },
  {
    id: 'swiss_idf',
    name: 'Swiss IDF',
    icon: '🇨🇭',
    description: 'Swiss cantonal IDF Chicago variant with r=0.40. Uses various cantonal IDF curves.',
    category: 'european',
  },
  {
    id: 'spanish_cedex',
    name: 'Spain CEDEX',
    icon: '🇪🇸',
    description: 'CEDEX dimensionless hyetograph from Centro de Estudios y Experimentación de Obras Públicas. Alternating block with regional IDF ratios.',
    category: 'european',
  },
  {
    id: 'belgian_irm',
    name: 'Belgium IRM',
    icon: '🇧🇪',
    description: 'Royal Meteorological Institute (IRM/KMI) center-peaked storm with r=0.50, commonly used in Flanders.',
    category: 'european',
  },
  {
    id: 'watts_curve',
    name: "Watt's Curve (UK)",
    icon: '🇬🇧',
    description: "Historical UK method (pre-FEH). Symmetrical bell-shaped profile approximated as beta distribution (α=β=2.5).",
    category: 'icm',
  },
  // Additional Asian patterns
  {
    id: 'hong_kong_hko',
    name: 'Hong Kong HKO',
    icon: '🇭🇰',
    description: 'Hong Kong Observatory design rainstorm. Front-loaded typhoon-driven mass curve. Peak intensity in first 4 hours of 24-hour event.',
    category: 'asian',
  },
  {
    id: 'taiwan_cwa',
    name: 'Taiwan CWA',
    icon: '🇹🇼',
    description: 'Central Weather Administration typhoon/frontal design storm. Chicago-type with r=0.45, regional variants for Taipei, Taichung, Kaohsiung.',
    category: 'asian',
  },
  {
    id: 'bangladesh_bmd',
    name: 'Bangladesh BMD',
    icon: '🇧🇩',
    description: 'Bangladesh Meteorological Department monsoon design storm. Rear-loaded sustained high intensity reflecting intense monsoon rainfall.',
    category: 'asian',
  },
  {
    id: 'pakistan_pmd',
    name: 'Pakistan PMD',
    icon: '🇵🇰',
    description: 'Pakistan Meteorological Department monsoon pattern. Beta-distribution with peak at ~45% of storm duration.',
    category: 'asian',
  },
  {
    id: 'sri_lanka',
    name: 'Sri Lanka',
    icon: '🇱🇰',
    description: 'Sri Lankan monsoon pattern. Beta-distribution with peak at ~40% of storm duration for SW/NE monsoon seasons.',
    category: 'asian',
  },
  // Additional Americas patterns
  {
    id: 'argentina_smn',
    name: 'Argentina SMN',
    icon: '🇦🇷',
    description: 'Servicio Meteorológico Nacional Sherman IDF storm. Chicago-type with r=0.33 (Buenos Aires, Papadakis 1973).',
    category: 'americas',
  },
  {
    id: 'peru_senamhi',
    name: 'Peru SENAMHI',
    icon: '🇵🇪',
    description: 'SENAMHI Andean convective storm. Chicago-type with r=0.40 for tropical Andean conditions.',
    category: 'americas',
  },
  {
    id: 'ecuador_inamhi',
    name: 'Ecuador INAMHI',
    icon: '🇪🇨',
    description: 'INAMHI Andean storm. Chicago-type with r=0.40 for equatorial Andean climate.',
    category: 'americas',
  },
  {
    id: 'venezuela_inameh',
    name: 'Venezuela INAMEH',
    icon: '🇻🇪',
    description: 'INAMEH tropical Andean/Caribbean storm. Chicago-type with r=0.40.',
    category: 'americas',
  },
  {
    id: 'puerto_rico',
    name: 'Puerto Rico',
    icon: '🇵🇷',
    description: 'Modified SCS Type II with tropical adjustment. Peak shifted to 48% of duration per NOAA Atlas 14 Vol. 3.',
    category: 'americas',
  },
  // Additional African patterns
  {
    id: 'morocco_dmn',
    name: 'Morocco DMN',
    icon: '🇲🇦',
    description: 'Direction de la Météorologie Nationale Mediterranean pattern. Chicago-type with r=0.38.',
    category: 'african',
  },
  {
    id: 'ethiopia_nma',
    name: 'Ethiopia NMA',
    icon: '🇪🇹',
    description: 'National Meteorological Agency East African monsoon. Chicago-type with r=0.42.',
    category: 'african',
  },
  {
    id: 'ghana_gmet',
    name: 'Ghana GMet',
    icon: '🇬🇭',
    description: 'Ghana Meteorological Agency West African convective squall. Front-loaded Chicago-type with r=0.32.',
    category: 'african',
  },
  {
    id: 'tanzania_tma',
    name: 'Tanzania TMA',
    icon: '🇹🇿',
    description: 'Tanzania Meteorological Authority East African pattern. Chicago-type with r=0.44.',
    category: 'african',
  },
  {
    id: 'mozambique_inam',
    name: 'Mozambique INAM',
    icon: '🇲🇿',
    description: 'INAM SE African coastal pattern. Chicago-type with r=0.40 for coastal cyclone influence.',
    category: 'african',
  },
  // Middle East extension
  {
    id: 'arid_flash_flood',
    name: 'Arid Flash Flood',
    icon: '⚡',
    description: 'Arid zone flash flood design storm. Exponential decay with 70% of rain in first 30% of duration. For wadi flood analysis.',
    category: 'middle_east',
  },
  // ─── NEW PATTERNS (v2) ───
  {
    id: 'aes_30',
    name: 'AES Canada 30%',
    icon: '🍁',
    description: 'Atmospheric Environment Service (now ECCC) 30% distribution. Peak at 30% of duration. Standard for Ontario urban drainage design (Hogg 1980).',
    category: 'international',
  },
  {
    id: 'aes_40',
    name: 'AES Canada 40%',
    icon: '🍁',
    description: 'AES/ECCC 40% distribution. Peak at 40% of duration. Used in British Columbia and prairie provinces for moderate-duration storms.',
    category: 'international',
  },
  {
    id: 'kostra_dwd',
    name: 'KOSTRA-DWD',
    icon: '🇩🇪',
    description: 'KOSTRA-DWD regionalized heavy precipitation design storm. Euler Type II variant with steeper peak per DWA-A 118. Standard for all German drainage engineering.',
    category: 'european',
  },
  {
    id: 'dubai_dm',
    name: 'Dubai Municipality',
    icon: '🇦🇪',
    description: 'Dubai Municipality (DM) Modified FEH 90th percentile summer profile (2024/2025 guidelines). Extreme needle peak at 50% of duration for desert convective flash floods.',
    category: 'middle_east',
  },
  {
    id: 'abu_dhabi_adm',
    name: 'Abu Dhabi ADM',
    icon: '🇦🇪',
    description: 'Abu Dhabi Municipality (ADM) Modified FEH 75th percentile profile (2024 update). Peaked at 50% of duration, slightly less extreme than Dubai DM.',
    category: 'middle_east',
  },
  {
    id: 'montana_caquot',
    name: 'Montana/Caquot (FR)',
    icon: '🇫🇷',
    description: 'French Montana/Caquot power-law synthetic hyetograph. Decreasing intensity i(t)∝t^(-0.66) per Instruction Technique IT77. Standard for French urban drainage.',
    category: 'european',
  },
  {
    id: 'm5_60_fsr',
    name: 'M5-60 (UK/Ireland)',
    icon: '🇬🇧',
    description: 'FSR M5-60 short-duration variant. More peaked than standard FSR profile for durations ≤2 hours. Part of Flood Studies Report methodology for UK/Ireland.',
    category: 'icm',
  },
  {
    id: 'arr2019',
    name: 'ARR 2019 Ensemble',
    icon: '🇦🇺',
    description: 'Australian Rainfall & Runoff 2019 median ensemble burst pattern. Representative of 10 temporal patterns per duration. Modern successor to pre-2016 ARR.',
    category: 'oceania',
  },
  {
    id: 'upm_plata',
    name: 'UPM Río de la Plata',
    icon: '🇺🇾',
    description: 'Uruguay/Paraguay regional pattern for Río de la Plata basin. Center-peaked design storm derived from Paysandú/Asunción gauge records.',
    category: 'americas',
  },
  // ─── v3 PATTERNS ───
  {
    id: 'feh22_refh2',
    name: 'FEH22/ReFH2',
    icon: '🇬🇧',
    description: 'Current UK-wide FEH22 DDF model (supersedes FEH13/FEH99) with ReFH2 design hyetograph. Standard for UK flood/drainage workflows.',
    category: 'icm',
  },
  {
    id: 'noaa_a15',
    name: 'NOAA Atlas 15',
    icon: '📡',
    description: 'Next-generation NOAA precipitation frequency atlas (pilot releases). Will supersede Atlas 14 for US-wide design rainfall.',
    category: 'us_agency',
  },
  {
    id: 'eccc_idf',
    name: 'ECCC IDF',
    icon: '🇨🇦',
    description: 'Environment and Climate Change Canada engineering climate datasets. Official IDF tables/graphs for Canadian design rainfall.',
    category: 'international',
  },
  {
    id: 'shyreg_fr',
    name: 'SHYREG (FR)',
    icon: '🇫🇷',
    description: 'SHYREG stochastic rainfall generator (IRSTEA/INRAE). French regionalized hourly rainfall model used in hydrology contexts.',
    category: 'european',
  },
  {
    id: 'ireland_met',
    name: 'Ireland Met Éireann',
    icon: '🇮🇪',
    description: 'Met Éireann rainfall return-period service. Irish national IDF/DDF products for drainage and flood estimation.',
    category: 'european',
  },
  {
    id: 'arr87_legacy',
    name: 'ARR87 Legacy',
    icon: '🇦🇺',
    description: 'Legacy Australian Rainfall & Runoff 1987 IFD design rainfalls (BoM). For backward compatibility with pre-2016 projects.',
    category: 'oceania',
  },
  {
    id: 'hk_dsd_2018',
    name: 'HK DSD 2018',
    icon: '🇭🇰',
    description: 'Hong Kong Drainage Services Department Stormwater Drainage Manual (5th ed., 2018). Official DSD design rainstorm IDF profiles.',
    category: 'asian',
  },
  {
    id: 'malaysia_hp1',
    name: 'Malaysia HP1',
    icon: '🇲🇾',
    description: 'Hydrological Procedure No. 1 (HP1, revised 2015). Malaysian design rainstorm estimation tables/formulae, complementary to MSMA.',
    category: 'asian',
  },
  {
    id: 'austria_okostra',
    name: 'Austria ÖKOSTRA',
    icon: '🇦🇹',
    description: 'ÖKOSTRA Austrian coordinated design rainfall for sewer/drainage design. Euler Type II variant with Austrian IDF regionalization.',
    category: 'european',
  },
  // ─── v4 PATTERNS ───
  {
    id: 'france_shypre',
    name: 'France SHYPRE',
    icon: '🇫🇷',
    description: 'SHYPRE (Standard Hyetographs for Rainfall Events) — France\'s standard temporal distribution model for urban drainage design. Regionalized convective pattern from Météo-France.',
    category: 'european',
  },
  {
    id: 'poland_panda',
    name: 'Poland PANDa',
    icon: '🇵🇱',
    description: 'Polish National Precipitation Atlas (PANDa). Modern cluster-based design storm replacing legacy Błaszczyk (1954) formula. Center-peaked moderate distribution.',
    category: 'european',
  },
  {
    id: 'turkey_mgm',
    name: 'Turkey MGM',
    icon: '🇹🇷',
    description: 'Turkish State Meteorological Service (MGM) IDF-based design storm. Chicago-type with r=0.38 for Anatolian and Mediterranean climate zones.',
    category: 'middle_east',
  },
  {
    id: 'israel_ims',
    name: 'Israel IMS',
    icon: '🇮🇱',
    description: 'Israel Meteorological Service arid/semi-arid convective design storm. Front-loaded with 60% in first 30%. Calibrated for Negev and coastal Mediterranean zones.',
    category: 'middle_east',
  },
  {
    id: 'iran_irimo',
    name: 'Iran IRIMO',
    icon: '🇮🇷',
    description: 'Iran Meteorological Organization (IRIMO) IDF-based design storm. Chicago-type with r=0.35 for Iranian semi-arid and mountainous climate.',
    category: 'middle_east',
  },
  {
    id: 'iraq_mos',
    name: 'Iraq MoS',
    icon: '🇮🇶',
    description: 'Iraqi Ministry of Science design storm for Tigris-Euphrates basin hydrology. Front-loaded arid convective pattern with rapid decay.',
    category: 'middle_east',
  },
  {
    id: 'kazakhstan_kazhydromet',
    name: 'Kazakhstan Kazhydromet',
    icon: '🇰🇿',
    description: 'Kazhydromet Central Asian continental IDF design storm. Chicago-type with r=0.42 for steppe and mountain climate zones.',
    category: 'asian',
  },
  {
    id: 'russia_roshydromet',
    name: 'Russia Roshydromet',
    icon: '🇷🇺',
    description: 'Roshydromet Russian continental IDF standards. Chicago-type with r=0.40. Used across Russian Federation for drainage and flood control design.',
    category: 'european',
  },
  {
    id: 'portugal_ipma',
    name: 'Portugal IPMA',
    icon: '🇵🇹',
    description: 'Portuguese IPMA (Instituto Português do Mar e da Atmosfera) Mediterranean IDF design storm. Chicago-type with r=0.40.',
    category: 'european',
  },
  {
    id: 'nz_niwa',
    name: 'NZ NIWA',
    icon: '🇳🇿',
    description: 'NIWA (National Institute of Water and Atmospheric Research) national standard. NZ-wide calibrated temporal pattern complementing regional council methods.',
    category: 'oceania',
  },
  {
    id: 'csa_w231',
    name: 'CSA W231 (Canada)',
    icon: '🍁',
    description: 'Canadian Standards Association W231 climate-adjusted IDF standard (2024). Non-stationary rainfall accounting for future climate intensification.',
    category: 'international',
  },
  {
    id: 'sa_wrc',
    name: 'South Africa WRC',
    icon: '🇿🇦',
    description: 'Water Research Commission (WRC) design storm. Modified Huff with regional calibration for South African catchments. Broader peak than SANRAL.',
    category: 'african',
  },
  {
    id: 'west_africa_cilss',
    name: 'West Africa CILSS',
    icon: '🌍',
    description: 'CILSS/AGRHYMET Sahel convective squall line pattern (Burkina Faso, Mali, Niger). Very front-loaded — 65% in first 25% of duration.',
    category: 'african',
  },
  {
    id: 'noaa_a16',
    name: 'NOAA Atlas 16',
    icon: '📡',
    description: 'Next-generation NOAA Atlas 16 for western US (in development). Updated partial-duration series and statistical treatment superseding Atlas 14.',
    category: 'us_agency',
  },
  {
    id: 'euro_cordex',
    name: 'EURO-CORDEX',
    icon: '🇪🇺',
    description: 'EURO-CORDEX climate-downscaled ensemble temporal pattern. Future IDF estimation incorporating RCP/SSP climate scenarios for European design.',
    category: 'european',
  },
  {
    id: 'mongolia_namem',
    name: 'Mongolia NAMEM',
    icon: '🇲🇳',
    description: 'National Agency for Meteorology and Environmental Monitoring. High-altitude cold-arid continental design storm with front-loaded convective burst.',
    category: 'asian',
  },
  {
    id: 'pacific_sprep',
    name: 'Pacific SPREP',
    icon: '🌊',
    description: 'SPREP (Secretariat of the Pacific Regional Environment Programme) tropical cyclone pattern for small island developing states (Samoa, Tonga, Vanuatu).',
    category: 'oceania',
  },
  {
    id: 'czech_chmu',
    name: 'Czech ČHMÚ',
    icon: '🇨🇿',
    description: 'Czech Hydrometeorological Institute (ČHMÚ) modern standards. Chicago-type with r=0.38, replacing legacy Sifalda for current practice.',
    category: 'european',
  },
  // ─── v5 PATTERNS ───
  {
    id: 'barbados_bms',
    name: 'Barbados BMS',
    icon: '🇧🇧',
    description: 'Barbados Meteorological Service design storm using modified Hershfield PMP. Intense tropical maritime convective pattern for Caribbean island drainage.',
    category: 'international',
  },
  {
    id: 'oecs_caribbean',
    name: 'OECS Caribbean',
    icon: '🌴',
    description: 'Organization of Eastern Caribbean States (OECS) guidelines based on Bell\'s method with tropical cyclone adjustment factor. For St. Lucia, Grenada, Dominica, etc.',
    category: 'international',
  },
  {
    id: 'cyprus_wdd',
    name: 'Cyprus WDD',
    icon: '🇨🇾',
    description: 'Cyprus Water Development Department double-triangular storm. Two-peak Mediterranean convective profile with primary peak at 25% and secondary at 65% of duration.',
    category: 'european',
  },
  {
    id: 'malta_mra',
    name: 'Malta MRA',
    icon: '🇲🇹',
    description: 'Malta Resources Authority composite Chicago-Huff method. Peak intensity position (r=0.32) determined by local quartile analysis of historical Mediterranean storms.',
    category: 'european',
  },
  {
    id: 'bolivia_altiplano',
    name: 'Bolivia Altiplano',
    icon: '🇧🇴',
    description: 'SENAMHI Bolivia Altiplano pattern — modified SCS Type I with reduced peak factor (0.25 vs 0.375) for high-altitude convective regimes above 3,500m.',
    category: 'latam',
  },
  {
    id: 'fourier_multipeak',
    name: 'Fourier Multi-Peak',
    icon: '〰️',
    description: 'Modified Fourier Series storm for academic/research use. Generates multi-peaked hyetographs via harmonic superposition for complex basin response studies.',
    category: 'international',
  },
  {
    id: 'cc_idf_scaled',
    name: 'CC-IDF Scaled',
    icon: '🌡️',
    description: 'Climate Change IDF-Scaled storm. Applies SSP2-4.5 ~20% uplift factor to SCS Type II base pattern (i_future = i_historical × [1 + ΔP%]) for future design scenarios.',
    category: 'international',
  },
];

interface PatternSelectorProps {
  selectedPattern: PatternType;
  onPatternChange: (pattern: PatternType) => void;
}

export function PatternSelector({ selectedPattern, onPatternChange }: PatternSelectorProps) {
  const selectedPatternInfo = patterns.find(p => p.id === selectedPattern);
  const swmmPatterns = patterns.filter(p => p.category === 'swmm');
  const usAgencyPatterns = patterns.filter(p => p.category === 'us_agency');
  const icmPatterns = patterns.filter(p => p.category === 'icm');
  const europeanPatterns = patterns.filter(p => p.category === 'european');
  const scandinavianPatterns = patterns.filter(p => p.category === 'scandinavian');
  const asianPatterns = patterns.filter(p => p.category === 'asian');
  const middleEastPatterns = patterns.filter(p => p.category === 'middle_east');
  const africanPatterns = patterns.filter(p => p.category === 'african');
  const latamPatterns = patterns.filter(p => p.category === 'latam');
  const americasPatterns = patterns.filter(p => p.category === 'americas');
  const oceaniaPatterns = patterns.filter(p => p.category === 'oceania');
  const internationalPatterns = patterns.filter(p => p.category === 'international');

  const PatternGrid = ({ patterns }: { patterns: PatternOption[] }) => (
    <div className="grid grid-cols-2 gap-3">
      {patterns.map((pattern) => (
        <button
          key={pattern.id}
          onClick={() => onPatternChange(pattern.id)}
          className={`
            p-4 rounded-lg border-2 transition-all duration-300
            flex flex-col items-center gap-2 text-center
            hover:scale-105 hover:shadow-md
            ${
              selectedPattern === pattern.id
                ? 'border-primary bg-accent shadow-md'
                : 'border-border bg-card hover:border-primary/50'
            }
          `}
        >
          <div className="text-3xl" aria-hidden="true">{pattern.icon}</div>
          <div className="text-sm font-medium">{pattern.name}</div>
        </button>
      ))}
    </div>
  );

  return (
    <Card className="shadow-card hover:shadow-hover transition-all duration-300">
      <CardHeader>
        <CardTitle>Pattern Type</CardTitle>
        <CardDescription>Select a rainfall distribution pattern ({patterns.length} available)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="swmm" className="w-full">
          <TabsList className="flex w-full flex-wrap h-auto gap-1">
            <TabsTrigger value="swmm">SWMM</TabsTrigger>
            <TabsTrigger value="us_agency">US</TabsTrigger>
            <TabsTrigger value="asian">Asia</TabsTrigger>
            <TabsTrigger value="middle_east">GCC</TabsTrigger>
            <TabsTrigger value="african">Africa</TabsTrigger>
            <TabsTrigger value="latam">LatAm</TabsTrigger>
            <TabsTrigger value="americas">Americas</TabsTrigger>
            <TabsTrigger value="icm">UK/ICM</TabsTrigger>
            <TabsTrigger value="european">Europe</TabsTrigger>
            <TabsTrigger value="scandinavian">Nordic</TabsTrigger>
            <TabsTrigger value="oceania">Oceania</TabsTrigger>
            <TabsTrigger value="international">Int'l</TabsTrigger>
          </TabsList>
          <TabsContent value="swmm" className="mt-4">
            <PatternGrid patterns={swmmPatterns} />
          </TabsContent>
          <TabsContent value="us_agency" className="mt-4">
            <PatternGrid patterns={usAgencyPatterns} />
          </TabsContent>
          <TabsContent value="asian" className="mt-4">
            <PatternGrid patterns={asianPatterns} />
          </TabsContent>
          <TabsContent value="middle_east" className="mt-4">
            <PatternGrid patterns={middleEastPatterns} />
          </TabsContent>
          <TabsContent value="african" className="mt-4">
            <PatternGrid patterns={africanPatterns} />
          </TabsContent>
          <TabsContent value="latam" className="mt-4">
            <PatternGrid patterns={latamPatterns} />
          </TabsContent>
          <TabsContent value="americas" className="mt-4">
            <PatternGrid patterns={americasPatterns} />
          </TabsContent>
          <TabsContent value="icm" className="mt-4">
            <PatternGrid patterns={icmPatterns} />
          </TabsContent>
          <TabsContent value="european" className="mt-4">
            <PatternGrid patterns={europeanPatterns} />
          </TabsContent>
          <TabsContent value="scandinavian" className="mt-4">
            <PatternGrid patterns={scandinavianPatterns} />
          </TabsContent>
          <TabsContent value="oceania" className="mt-4">
            <PatternGrid patterns={oceaniaPatterns} />
          </TabsContent>
          <TabsContent value="international" className="mt-4">
            <PatternGrid patterns={internationalPatterns} />
          </TabsContent>
        </Tabs>
        
        {selectedPatternInfo && (
          <div className="rounded-lg bg-accent/50 p-4 border-l-4 border-primary">
            <p className="text-sm">
              <strong>{selectedPatternInfo.name}:</strong> {selectedPatternInfo.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
