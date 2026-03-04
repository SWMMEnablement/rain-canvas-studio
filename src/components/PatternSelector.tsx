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
    id: 'dubai_dm_combined',
    name: 'Dubai DM Combined',
    icon: '🇦🇪',
    description: 'Dubai Municipality Modified FEH for DXB Combined profile. Center-peaked alternating-block derived from official DDF cumulative ratios. Symmetric peak at 50% of duration.',
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
  // ══════════ v6 — Missing Design Storms Analysis ══════════
  {
    id: 'g2p_gamma',
    name: 'G2P Gamma',
    icon: 'Γ',
    description: 'Gamma 2-Parameter (G2P) design storm from Balbastre-Soldevila et al. (2019). Uses f(t)=(t/tp)^φ·exp(φ·(1−t/tp)) with shape parameter φ controlling peakedness.',
    category: 'international',
  },
  {
    id: 'poland_bs',
    name: 'Poland Bogdanowicz-Stachy',
    icon: '🇵🇱',
    description: 'Polish Bogdanowicz-Stachy standard design storm (P(t,p)=1.42·t^0.33+α(p)·(−ln p)^0.584). Widely used in Polish urban drainage design.',
    category: 'european',
  },
  {
    id: 'belgium_willems',
    name: 'Belgium Willems',
    icon: '🇧🇪',
    description: 'Willems (2000) composite storm method used in Flanders. Nested IDF intensities with Belgian rainfall statistics, distinct from IRM standard.',
    category: 'european',
  },
  {
    id: 'russia_snip',
    name: 'Russia SNiP',
    icon: '🇷🇺',
    description: 'Russian SNiP/SP 32.13330 building code storm. q=A·(1+C·ln Tr)/t^n with regional parameters. Standard for Russian urban drainage design.',
    category: 'european',
  },
  {
    id: 'turkey_dsi',
    name: 'Turkey DSİ',
    icon: '🇹🇷',
    description: 'Turkish DSİ (State Hydraulic Works) regional design storm. Uses i=A/(t+B)^C with region-specific parameters. Distinct from MGM meteorological method.',
    category: 'european',
  },
  {
    id: 'korea_molit',
    name: 'Korea MOLIT',
    icon: '🇰🇷',
    description: 'South Korea MOLIT (Ministry of Land, Infrastructure and Transport) Huff-type design storm. More front-loaded than KMA standard, calibrated for urbanized basins.',
    category: 'asian',
  },
  {
    id: 'greece_hellenic',
    name: 'Greece Hellenic',
    icon: '🇬🇷',
    description: 'Greek Hellenic method using Koutsoyiannis-Baloutsos formulation i=a/(t+θ)^η. Regional IDF parameters for Greek basins.',
    category: 'european',
  },
  {
    id: 'romania_stas',
    name: 'Romania STAS',
    icon: '🇷🇴',
    description: 'Romanian STAS/Andrei method. Uses i=a·Tr^b/t^c for urban drainage design. Standard in Romanian stormwater practice.',
    category: 'european',
  },
  {
    id: 'pmp_wmo',
    name: 'PMP WMO Generalized',
    icon: '🌐',
    description: 'WMO generalized PMP (Hershfield method, WMO-No. 1045). PMP=X̄n+Km·Sn. Broader global applicability than US-specific HMR 51/52.',
    category: 'international',
  },
  {
    id: 'nested_envelope',
    name: 'Nested Envelope',
    icon: '📦',
    description: 'Nested/Envelope design storm used by USACE for dam safety. Creates worst-case nesting where sub-duration depths match IDF values for all durations ≤ D.',
    category: 'us_agency',
  },
  {
    id: 'arnell_sweden',
    name: 'Arnell (Sweden)',
    icon: '🇸🇪',
    description: 'Arnell (1982) historical Swedish design storm. Predecessor to modern SMHI, Chicago-type with r=0.33 and broader peak. Still referenced in older Swedish drainage designs.',
    category: 'european',
  },
  {
    id: 'tenax_cds',
    name: 'TENAX-CDS',
    icon: '🌡️',
    description: 'TENAX Climate-adapted Chicago Design Storm (2024). From Zurich/EPFL research using temperature-conditioned extreme value statistics with super-Clausius-Clapeyron scaling at peak.',
    category: 'european',
  },
  {
    id: 'avm',
    name: 'Average Variability',
    icon: '📊',
    description: 'Average Variability Method (AVM). Creates design storms by averaging temporal patterns of observed storms at each time step. Produces smoother, less peaked distributions than single-storm methods.',
    category: 'international',
  },
  // South African SCS Types
  {
    id: 'sa_scs1',
    name: 'SA SCS Type 1',
    icon: '🇿🇦',
    description: 'South African SCS Type 1 (Schulze 1984, Weddepohl 1988). Adapted from US SCS for South Africa. Lowest rainfall concentration — coastal and orographic regions. Fixed 24-hour duration, 5-min intervals, symmetrical about center.',
    category: 'african',
  },
  {
    id: 'sa_scs2',
    name: 'SA SCS Type 2',
    icon: '🇿🇦',
    description: 'South African SCS Type 2 (Schulze 1984, Weddepohl 1988). Moderate rainfall concentration — inland transitional areas. Fixed 24-hour duration, 5-min intervals, symmetrical about center.',
    category: 'african',
  },
  {
    id: 'sa_scs3',
    name: 'SA SCS Type 3',
    icon: '🇿🇦',
    description: 'South African SCS Type 3 (Schulze 1984, Weddepohl 1988). Higher rainfall concentration — inland convective regions. Fixed 24-hour duration, 5-min intervals, symmetrical about center.',
    category: 'african',
  },
  {
    id: 'sa_scs4',
    name: 'SA SCS Type 4',
    icon: '🇿🇦',
    description: 'South African SCS Type 4 (Schulze 1984, Weddepohl 1988). Highest rainfall concentration — extreme convective Highveld. Fixed 24-hour duration, 5-min intervals, symmetrical about center.',
    category: 'african',
  },
  // v10 — Poland & Eastern Europe
  {
    id: 'atv_a121',
    name: 'ATV-A 121',
    icon: '🇩🇪',
    description: 'German ATV-A 121 (now DWA-A 118) sewer design rainfall. 12-interval distribution with peak at ~45-50%. Extensively adopted in Polish practice.',
    category: 'european',
  },
  {
    id: 'dwa_a118',
    name: 'DWA-A 118 Symmetric',
    icon: '🇩🇪',
    description: 'DWA-A 118 (2006) updated symmetric model rain. 40% rising, 20% peak, 40% falling. Peak ratio 2.5×. Standard for modern German/Polish sewer design.',
    category: 'european',
  },
  {
    id: 'blaszczyk',
    name: 'Błaszczyk',
    icon: '🇵🇱',
    description: 'Traditional Polish design storm (Błaszczyk method). 4-quarter distribution: 15/45/25/15%. Still referenced in older municipal sewer standards.',
    category: 'european',
  },
  {
    id: 'imgw_cluster1',
    name: 'IMGW Cluster 1',
    icon: '🇵🇱',
    description: 'IMGW (2024) front-loaded rapid onset storm. Peak at 0-20% of duration. Represents 18% of 31,646 analyzed Polish heavy rainfall events.',
    category: 'european',
  },
  {
    id: 'imgw_cluster2',
    name: 'IMGW Cluster 2',
    icon: '🇵🇱',
    description: 'IMGW (2024) early-peak storm. Peak at 20-35% of duration. Represents 25% of Polish heavy rainfall events from 100 gauges over 30 years.',
    category: 'european',
  },
  {
    id: 'imgw_cluster3',
    name: 'IMGW Cluster 3',
    icon: '🇵🇱',
    description: 'IMGW (2024) central peak (DVWK-like). Peak at 35-50%. Most common type — 28% of Polish heavy storms. Published in Ambio (2024).',
    category: 'european',
  },
  {
    id: 'imgw_cluster4',
    name: 'IMGW Cluster 4',
    icon: '🇵🇱',
    description: 'IMGW (2024) late peak storm. Peak at 50-70% of duration. Represents 17% of Polish heavy rainfall events.',
    category: 'european',
  },
  {
    id: 'imgw_cluster5',
    name: 'IMGW Cluster 5',
    icon: '🇵🇱',
    description: 'IMGW (2024) end-loaded delayed peak. Peak at 70-90% of duration. Represents 12% of Polish heavy storms — least common cluster.',
    category: 'european',
  },
  {
    id: 'wroclaw_2050',
    name: 'Wrocław 2050',
    icon: '🇵🇱',
    description: 'Climate-adjusted design storm for Wrocław projected to 2050 (Mikołajewski et al., 2020, Atmosphere). Earlier peak (30%), sharper (2.8×), +15-20% depth increase.',
    category: 'european',
  },
  {
    id: 'trupl',
    name: 'Trupl (Czech)',
    icon: '🇨🇿',
    description: 'Standard Czech design storm from Trupl (1958). Sharper peak than DVWK (3.1× ratio). Still widely used in Czech Republic and Slovakia.',
    category: 'european',
  },
  {
    id: 'samaj_valovic',
    name: 'Šamaj-Valovič',
    icon: '🇸🇰',
    description: 'Slovak design storm distribution from Bratislava and Košice records. Peak at 35-50%, peak ratio 3.0×.',
    category: 'european',
  },
  {
    id: 'hungarian_msz',
    name: 'Hungarian MSZ',
    icon: '🇭🇺',
    description: 'Hungarian MSZ standard design storm. 5-segment distribution (10/20/40/20/10%). Peak ratio 2.7×. Also referenced in Romania and Serbia.',
    category: 'european',
  },
  {
    id: 'budapest_convective',
    name: 'Budapest Convective',
    icon: '🇭🇺',
    description: 'Derived from long-term Budapest pluviograph records. Very sharp convective peak (3.5× ratio) at 30-40% of duration.',
    category: 'european',
  },
  {
    id: 'owav_rb11',
    name: 'ÖWAV Regelblatt 11',
    icon: '🇦🇹',
    description: 'Austrian ÖWAV Regelblatt 11 design storm. Later peak (50-58%) than DVWK — characteristic of orographic rainfall in Alpine/Carpathian regions. Peak ratio 3.2×.',
    category: 'european',
  },
  // ══════════ v11 — High-value additions ══════════
  {
    id: 'croatian_dhmz',
    name: 'Croatian DHMZ',
    icon: '🇭🇷',
    description: 'Croatian DHMZ (Državni hidrometeorološki zavod) Adriatic coastal convective design storm. Peak at 30-40% of duration. EU member with growing infrastructure investment.',
    category: 'european',
  },
  {
    id: 'beta_distribution',
    name: 'Beta Distribution',
    icon: 'β',
    description: 'Flexible Beta distribution storm (α=3, β=4). One mathematical form that can replicate many named distributions by adjusting shape parameters. Peak at ~40% of duration.',
    category: 'international',
  },
  {
    id: 'cc_clausius',
    name: 'Clausius-Clapeyron',
    icon: '🌡️',
    description: 'Clausius-Clapeyron 7%/°C scaled storm. Applies thermodynamic scaling to intensify ANY base storm for climate change (+3°C = +21% depth with sharper peak). Universal climate adaptation tool.',
    category: 'international',
  },
  {
    id: 'bartlett_lewis',
    name: 'Bartlett-Lewis',
    icon: '🎲',
    description: 'Bartlett-Lewis Rectangular Pulse stochastic rainfall model. Generates irregular multi-burst patterns for continuous simulation. Standard in UK/European research hydrology.',
    category: 'international',
  },
  {
    id: 'tropical_cyclone',
    name: 'Tropical Cyclone',
    icon: '🌀',
    description: 'Tropical Cyclone Rainband pattern with spiral-band structure. Broad sustained rainfall with embedded intensity peaks. Critical for hurricane/typhoon-prone regions worldwide.',
    category: 'international',
  },
  {
    id: 'atmospheric_river',
    name: 'Atmospheric River',
    icon: '🌊',
    description: 'Atmospheric River (AR) sustained frontal pattern. Gradual ramp with late broad peak at 60-70% of duration. Increasingly important for California, UK, Japan, and western coastlines.',
    category: 'international',
  },
  {
    id: 'algeria_anrh',
    name: 'Algeria ANRH',
    icon: '🇩🇿',
    description: 'Algeria ANRH (Agence Nationale des Ressources Hydrauliques) design storm. Front-loaded Mediterranean/semi-arid convective pattern. Largest African country by area.',
    category: 'african',
  },
  {
    id: 'west_africa_cieh',
    name: 'West Africa CIEH',
    icon: '🌍',
    description: 'CIEH (Comité Inter-Africain d\'Études Hydrauliques) Sahelian squall line pattern. Extremely front-loaded — covers 14 ECOWAS countries (Senegal, Mali, Niger, Burkina Faso, etc.).',
    category: 'african',
  },
  {
    id: 'portugal_lnec',
    name: 'Portugal LNEC',
    icon: '🇵🇹',
    description: 'Portuguese LNEC (Laboratório Nacional de Engenharia Civil) Mediterranean convective design storm. EU member, distinct from IPMA meteorological method. Peak at 40% of duration.',
    category: 'european',
  },
  {
    id: 'costa_rica_imn',
    name: 'Costa Rica IMN',
    icon: '🇨🇷',
    description: 'Costa Rica IMN (Instituto Meteorológico Nacional) tropical convective design storm. Best-documented Central American method. Pacific slope orographic enhancement.',
    category: 'latam',
  },
  {
    id: 'nepal_dhm',
    name: 'Nepal DHM',
    icon: '🇳🇵',
    description: 'Nepal DHM (Department of Hydrology and Meteorology) extreme orographic monsoon storm. Intense mid-storm peak driven by Himalayan topographic forcing. Critical for flood design.',
    category: 'asian',
  },
  {
    id: 'nyc_dep',
    name: 'NYC DEP',
    icon: '🗽',
    description: 'NYC DEP (Department of Environmental Protection) modified SCS Type III for combined sewer design. Largest US city-specific standard. Peak at ~48% of duration.',
    category: 'us_agency',
  },
  {
    id: 'post_wildfire',
    name: 'Post-Wildfire',
    icon: '🔥',
    description: 'Post-Wildfire Design Storm for burned watersheds. Extremely front-loaded to model debris flow triggering rainfall. Increasingly critical worldwide due to wildfire-climate nexus.',
    category: 'international',
  },
  {
    id: 'bimodal_gaussian',
    name: 'Bimodal Gaussian',
    icon: '⩗',
    description: 'Bimodal Gaussian double-peak storm. Two Gaussian peaks at 30% and 70% of duration. Captures double-peak storm systems simply and mathematically for sensitivity analysis.',
    category: 'international',
  },
  // ══════════ v12 — Massive expansion ══════════
  // Eastern Europe
  { id: 'serbian_rhmz', name: 'Serbian RHMZ', icon: '🇷🇸', description: 'Republic Hydrometeorological Service. Belgrade and Novi Sad records. Continental Pannonian climate.', category: 'european' },
  { id: 'bulgarian_nimh', name: 'Bulgarian NIMH', icon: '🇧🇬', description: 'National Institute of Meteorology & Hydrology. Sofia, Plovdiv, Black Sea coast variants.', category: 'european' },
  { id: 'slovenian_arso', name: 'Slovenian ARSO', icon: '🇸🇮', description: 'Agency for Environment. Modified Euler for Alpine/Mediterranean transition zone. Ljubljana, Maribor.', category: 'european' },
  { id: 'ukrainian_dbn', name: 'Ukrainian DBN', icon: '🇺🇦', description: 'State Building Norms (ДБН В.2.5-75). Updated Soviet SNiP for Kyiv, Odesa, Lviv. Continental climate.', category: 'european' },
  { id: 'lithuanian_hms', name: 'Lithuanian HMS', icon: '🇱🇹', description: 'Hydrometeorological Service. Baltic maritime climate. Vilnius, Kaunas records.', category: 'european' },
  { id: 'latvian_lvgmc', name: 'Latvian LVĢMC', icon: '🇱🇻', description: 'Latvian Environment, Geology and Meteorology Centre. Riga records. Baltic maritime.', category: 'european' },
  { id: 'estonian_emhi', name: 'Estonian EMHI', icon: '🇪🇪', description: 'Estonian Weather Service. Tallinn records. Nordic/Baltic transition climate.', category: 'european' },
  { id: 'soviet_snip_legacy', name: 'Soviet SNiP Legacy', icon: '☭', description: 'Original Soviet SNiP 2.04.03 sewer design standard. Still referenced in Central Asia, Belarus, Moldova. 5 climatic zones.', category: 'european' },
  { id: 'belarusian_tkp', name: 'Belarusian TKP', icon: '🇧🇾', description: 'Technical Code of Practice (ТКП). Updated SNiP for Minsk, Brest, Gomel.', category: 'european' },
  // Western & Northern Europe
  { id: 'icelandic_imo', name: 'Icelandic IMO', icon: '🇮🇸', description: 'Subarctic maritime. Low intensity, long duration. Reykjavík, Akureyri. Frontal-dominated.', category: 'european' },
  { id: 'svensson_jones', name: 'Svensson-Jones', icon: '🇬🇧', description: 'CEH seasonal design storm derivation. Winter frontal vs. summer convective profiles. Distinct from FEH.', category: 'european' },
  { id: 'reunion_mf', name: 'Réunion Météo-France', icon: '🇷🇪', description: 'World record holder for short-duration rainfall (1,825 mm in 24h). Tropical cyclone + orographic. Extreme design storms.', category: 'international' },
  { id: 'azores_ipma', name: 'Azores/Madeira IPMA', icon: '🇵🇹', description: 'Atlantic subtropical islands. Distinct from mainland Portuguese LNEC. Orographic + subtropical frontal.', category: 'european' },
  // Middle East
  { id: 'jordan_jmd', name: 'Jordan JMD', icon: '🇯🇴', description: 'Arid wadi flood design storms. Amman records. Flash flood focus for Jordan.', category: 'middle_east' },
  { id: 'lebanon_cav', name: 'Lebanon Civil Aviation', icon: '🇱🇧', description: 'Mountain (2500+ mm/yr) vs. coastal (700 mm/yr). Extreme orographic gradient over 30 km.', category: 'middle_east' },
  { id: 'kuwait_mew', name: 'Kuwait MEW', icon: '🇰🇼', description: 'Ministry of Electricity & Water. Hyper-arid (<120 mm/yr). Extreme flash flood design storms.', category: 'middle_east' },
  { id: 'bahrain_met', name: 'Bahrain MET', icon: '🇧🇭', description: 'Island microclimate. Intense convective cells. Total annual ~70 mm but individual storms extreme.', category: 'middle_east' },
  { id: 'yemen_cama', name: 'Yemen CAMA', icon: '🇾🇪', description: 'Civil Aviation & Meteorological Authority. Monsoonal south coast vs. arid interior.', category: 'middle_east' },
  // Asia
  { id: 'myanmar_dmh', name: 'Myanmar DMH', icon: '🇲🇲', description: 'Monsoon + Cyclone Nargis patterns. Yangon (2500+ mm/yr), Mandalay (850 mm/yr).', category: 'asian' },
  { id: 'mekong_mrc', name: 'Mekong MRC', icon: '🇰🇭', description: 'Mekong River Commission regional standard. Monsoon tropical. Phnom Penh, Siem Reap.', category: 'asian' },
  { id: 'mononobe', name: 'Mononobe Formula', icon: '🇯🇵', description: 'Classical Japanese IDF formula: i=(a/n)·(d/n)^(n-1). Historically distinct from modern JMA. Still used in textbooks.', category: 'asian' },
  { id: 'uzbekistan_uhm', name: 'Uzbekistan UHM', icon: '🇺🇿', description: 'Central Asian arid. Tashkent records. Short convective storms in summer.', category: 'asian' },
  // Africa
  { id: 'tunisia_inm', name: 'Tunisia INM', icon: '🇹🇳', description: 'Institut National de la Météorologie. Mediterranean north vs. Saharan south.', category: 'african' },
  { id: 'uganda_unma', name: 'Uganda UNMA', icon: '🇺🇬', description: 'Bimodal tropical (two rainy seasons). Kampala equatorial convective patterns.', category: 'african' },
  { id: 'cameroon_ird', name: 'Cameroon IRD', icon: '🇨🇲', description: 'Includes Debundscha (~10,000 mm/yr — one of wettest places on Earth). French ORSTOM research.', category: 'african' },
  { id: 'madagascar_dgm', name: 'Madagascar DGM', icon: '🇲🇬', description: 'Tropical cyclone + monsoon + orographic. Antananarivo, Toamasina. 3 distinct climate zones.', category: 'african' },
  { id: 'mauritius_mms', name: 'Mauritius MMS', icon: '🇲🇺', description: 'Tropical cyclone design storms. Small island hydrology. Short time of concentration.', category: 'african' },
  { id: 'cote_ivoire', name: "Côte d'Ivoire SODEXAM", icon: '🇨🇮', description: 'Abidjan IDF. Best-documented West African records (French colonial-era + modern).', category: 'african' },
  { id: 'namibia_nms', name: 'Namibia NMS', icon: '🇳🇦', description: 'Hyper-arid. Windhoek flash flood patterns. Ephemeral river design storms.', category: 'african' },
  { id: 'sudan_sma', name: 'Sudan SMA', icon: '🇸🇩', description: 'Saharan north to tropical south gradient. Khartoum. Haboob + rain events.', category: 'african' },
  // Central America & Caribbean
  { id: 'guatemala_insivumeh', name: 'Guatemala INSIVUMEH', icon: '🇬🇹', description: 'Volcanic highland + Pacific/Caribbean coasts. 3 distinct climate zones in 100 km.', category: 'latam' },
  { id: 'cuba_insmet', name: 'Cuba INSMET', icon: '🇨🇺', description: 'Instituto de Meteorología. Hurricane-influenced. Havana urban drainage standards.', category: 'latam' },
  { id: 'dominican_onamet', name: 'Dominican ONAMET', icon: '🇩🇴', description: 'Caribbean hurricane + trade wind orographic. Santo Domingo design storms.', category: 'latam' },
  { id: 'jamaica_msj', name: 'Jamaica MSJ', icon: '🇯🇲', description: 'Blue Mountains orographic (5000+ mm/yr) vs. south coast (750 mm/yr).', category: 'latam' },
  { id: 'trinidad_tobago', name: 'Trinidad & Tobago', icon: '🇹🇹', description: 'ITCZ-influenced equatorial. Port of Spain. Intense tropical convection.', category: 'latam' },
  { id: 'panama_etesa', name: 'Panama ETESA', icon: '🇵🇦', description: 'Pacific (dry season) vs. Caribbean (wet year-round). Canal zone specific standards.', category: 'latam' },
  { id: 'honduras_smn', name: 'Honduras SMN', icon: '🇭🇳', description: 'Hurricane Mitch (1998) legacy — extreme design storms. Tegucigalpa flood standards.', category: 'latam' },
  // South America
  { id: 'paraguay_dmh', name: 'Paraguay DMH', icon: '🇵🇾', description: 'Subtropical. Asunción. South American monsoon system (SAMS).', category: 'latam' },
  { id: 'uruguay_inumet', name: 'Uruguay INUMET', icon: '🇺🇾', description: 'Instituto Uruguayo de Meteorología. Montevideo. Temperate subtropical.', category: 'latam' },
  { id: 'sao_paulo_daee', name: 'São Paulo DAEE', icon: '🇧🇷', description: 'São Paulo state-specific — distinct from national ANA. 20M+ people metro area.', category: 'latam' },
  { id: 'bogota_eaab', name: 'Bogotá EAAB', icon: '🇨🇴', description: 'Bogotá-specific (2600m elevation). Distinct from national IDEAM. Bimodal tropical highland.', category: 'latam' },
  { id: 'lima_senamhi', name: 'Lima SENAMHI', icon: '🇵🇪', description: 'Coastal desert (<10 mm/yr) but El Niño events produce catastrophic rainfall. Extreme rare events.', category: 'latam' },
  // Pacific Islands
  { id: 'png_nws', name: 'Papua New Guinea NWS', icon: '🇵🇬', description: 'Some of world\'s highest rainfall. Port Moresby vs. highland. Tropical maritime.', category: 'oceania' },
  { id: 'samoa_met', name: 'Samoa MET', icon: '🇼🇸', description: 'Pacific tropical cyclone design storms. Apia. 3000+ mm/yr.', category: 'oceania' },
  { id: 'hawaii_distinct', name: 'Hawaii (Distinct)', icon: '🌺', description: 'Trade wind showers vs. Kona storms vs. hurricane. Mt. Waialeale (~11,000 mm/yr). Fundamentally different from mainland.', category: 'oceania' },
  // US State & Municipal
  { id: 'caltrans', name: 'Caltrans', icon: '🌉', description: 'California DOT. Mediterranean climate. Atmospheric river events. 6-hr and 24-hr design storms.', category: 'us_agency' },
  { id: 'harris_county_fcd', name: 'Harris County FCD', icon: '🤠', description: 'Houston. Gulf Coast tropical. Post-Harvey (2017) updated standards. Distinct from TxDOT.', category: 'us_agency' },
  { id: 'maricopa_fcd', name: 'Maricopa County FCD', icon: '🌵', description: 'Phoenix. Monsoon (July-Sept) vs. frontal (Dec-Mar) — two different design storms.', category: 'us_agency' },
  { id: 'la_county', name: 'LA County LACDPW', icon: '🎬', description: 'Los Angeles County Hydrology Manual. Burn area + debris flow variants.', category: 'us_agency' },
  { id: 'clark_county_nv', name: 'Clark County (Las Vegas)', icon: '🎰', description: 'Desert Southwest monsoon flash flood. Clark County Regional Flood Control District.', category: 'us_agency' },
  { id: 'philadelphia_pwd', name: 'Philadelphia PWD', icon: '🔔', description: 'Philadelphia Water Dept. Green infrastructure design storms. Distinct from PennDOT.', category: 'us_agency' },
  { id: 'illinois_b75', name: 'Illinois SWS B75', icon: '🌽', description: 'State Water Survey Bulletin 75. Extended Huff quartile methodology for Illinois.', category: 'us_agency' },
  // Theoretical & Mathematical
  { id: 'parabolic', name: 'Parabolic', icon: '∩', description: 'i(t)=6·P/D²·t·(D-t). Symmetric peaked, zero at start and end. Smooth and simple.', category: 'international' },
  { id: 'cosine_storm', name: 'Raised Cosine', icon: '∿', description: 'i(t)=P/D·[1+cos(2π(t-tp)/D)]. Smooth, no discontinuities. Adjustable peak position.', category: 'international' },
  { id: 'lognormal_temporal', name: 'Log-Normal Temporal', icon: '📈', description: 'Right-skewed peak via log-normal distribution. Realistic for convective storms. 2 parameters control shape.', category: 'international' },
  { id: 'exponential_decay_storm', name: 'Exponential Decay', icon: '📉', description: 'i(t)=i₀·e^(-kt). Front-loaded burst + exponential tail. Models intense onset storms.', category: 'international' },
  { id: 'power_curve_storm', name: 'Power Curve', icon: '⌒', description: 'i(t)=a·t^n·(D-t)^m. Generalized asymmetric peak. n and m control skewness independently.', category: 'international' },
  { id: 'weibull_temporal', name: 'Weibull Temporal', icon: 'W', description: 'Weibull CDF: F(t)=1-exp(-(t/λ)^k). k=1→exponential, k=3.6→near-normal. Flexible.', category: 'international' },
  { id: 'instantaneous_burst', name: 'Instantaneous Burst', icon: '⚡', description: 'All depth in one Δt. Theoretical worst-case for pipe surcharging. Impulse response testing.', category: 'international' },
  { id: 'sigmoid_mass', name: 'Sigmoid / Logistic', icon: 'S', description: 'M(t)=P/(1+e^(-k(t-t₀))). S-curve cumulative distribution. Smooth peak at inflection point.', category: 'international' },
  // Specialized Storm Scenarios
  { id: 'medicane', name: 'Medicane', icon: '🌀', description: 'Mediterranean hurricane. 6-18 hr, multiple intensity peaks. Greece, Italy, North Africa.', category: 'international' },
  { id: 'polar_low', name: 'Polar Low', icon: '❄️', description: 'Arctic/subarctic intense short-duration. Northern Norway, Iceland, Barents Sea coast.', category: 'international' },
  { id: 'cutoff_low', name: 'Cut-Off Low', icon: '🔄', description: 'Slow-moving upper-level low. Multi-day. South Africa, Mediterranean, Southern Australia.', category: 'international' },
  { id: 'mcs_storm', name: 'MCS Storm', icon: '⛈️', description: 'Mesoscale Convective System. 6-18 hr organized convection. US Great Plains, Sahel, Amazon.', category: 'international' },
  { id: 'supercell', name: 'Supercell', icon: '🌪️', description: 'Supercell thunderstorm. 30-90 min extreme intensity single peak. Worst case for small catchments.', category: 'international' },
  { id: 'orographic_enhanced', name: 'Orographic Enhanced', icon: '⛰️', description: 'Prolonged moderate + mountain uplift intensification. Windward vs. leeward asymmetry.', category: 'international' },
  { id: 'urban_heat_island', name: 'Urban Heat Island', icon: '🏙️', description: 'City-intensified convection. 10-30% rainfall enhancement over urban areas vs. rural.', category: 'international' },
  { id: 'monsoon_burst', name: 'Monsoon Burst', icon: '🌧️', description: 'Active monsoon phase. 6-24 hr heavy rainfall with fluctuating intensity bands.', category: 'international' },
  { id: 'squall_line', name: 'Squall Line', icon: '⚡', description: 'Narrow intense band (30-60 min) preceded by gust front. Tropics, US Midwest.', category: 'international' },
  { id: 'sea_breeze', name: 'Sea Breeze', icon: '🏖️', description: 'Afternoon convective triggered by coastal sea breeze. Florida, tropical coasts. Very late peak.', category: 'international' },
  { id: 'nocturnal_mcs', name: 'Nocturnal MCS', icon: '🌙', description: 'Night-time organized convection. US Great Plains, Sahel. Late/overnight peak.', category: 'international' },
  { id: 'rain_on_snow', name: 'Rain-on-Snow', icon: '🌨️', description: 'Combined rainfall + rapid snowmelt compound event. Pacific NW, Alps, Scandinavia.', category: 'international' },
  { id: 'derecho', name: 'Derecho', icon: '💨', description: 'Fast-moving destructive wind + intense rain. 1-3 hr events. US Midwest/East.', category: 'international' },
  // Climate Change
  { id: 'ukcp18_enhanced', name: 'UKCP18 Enhanced', icon: '🌡️', description: 'UK Climate Projections 2018. FEH storms adjusted for +4°C warming scenarios.', category: 'international' },
  { id: 'super_cc', name: 'Super-CC 14%/°C', icon: '🌡️', description: 'Super-Clausius-Clapeyron: some storms exceed 7%/°C — evidence of 14%/°C for short-duration extremes.', category: 'international' },
  // Stochastic
  { id: 'neyman_scott', name: 'Neyman-Scott', icon: '🎲', description: 'Neyman-Scott Rectangular Pulse stochastic model. Different clustering from Bartlett-Lewis. Australian/European research.', category: 'international' },
  // Historical/Classical
  { id: 'temez_spain', name: 'Témez (Spain)', icon: '🇪🇸', description: 'Classical Spanish Témez method. May differ from modern CEDEX. Historical importance.', category: 'european' },
  { id: 'bonta_usda', name: 'Bonta (USDA)', icon: '🌾', description: 'USDA ARS synthetic dimensionless hyetographs from 6,000+ Midwest storms. Agricultural Research Service.', category: 'us_agency' },
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
