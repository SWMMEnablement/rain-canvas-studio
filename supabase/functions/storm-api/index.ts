import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ── All 265 pattern IDs ─────────────────────────────────────────────────

const VALID_PATTERNS = [
  // Core / US
  'block','scs1','scs1a','scs2','scs3','double','triangular','trapezoidal',
  'fsr','chicago','huff1','huff2','huff3','huff4','desbordes','arr','jma',
  'china','sa_huff','dwa','dutch','italian','balanced','fdot1','fdot2',
  'fdot3','fdot4','fdot5','txdot','yen_chow','noaa_a14','udfcd','usace_sps',
  'feh','euler1','euler2','desbordes_double','canadian','pmp_hmr','singapore_pub',
  'china_gb50014','china_prd','india_imd','india_coastal','japan_amedas',
  'japan_baiu','japan_typhoon','korea_kma','malaysia_msma','indonesia_bmkg',
  'philippines_pagasa','vietnam_imhen','thailand_tmd','saudi_pme','uae_ncms',
  'qatar_kahramaa','oman_dgman','sa_sanral','kenya_kmd','nigeria_nimet',
  'egypt_hcww','brazil_ana','mexico_conagua','colombia_ideam','chile_dga',
  'nz_tp108','nz_wellington','nz_christchurch',
  // Design Storm Equations Reference
  'sifalda','danish_svk','swedish_smhi','norwegian_nve','finnish_fmi','swiss_idf',
  'spanish_cedex','belgian_irm','pilgrim_cordery','watts_curve',
  'hong_kong_hko','taiwan_cwa','bangladesh_bmd','pakistan_pmd','sri_lanka','fiji_fms',
  'argentina_smn','peru_senamhi','ecuador_inamhi','venezuela_inameh','puerto_rico',
  'morocco_dmn','ethiopia_nma','ghana_gmet','tanzania_tma','mozambique_inam',
  'hirds_nz','arid_flash_flood',
  // v2
  'aes_30','aes_40','kostra_dwd','dubai_dm','abu_dhabi_adm',
  'montana_caquot','m5_60_fsr','arr2019','upm_plata',
  // v3
  'feh22_refh2','noaa_a15','eccc_idf','shyreg_fr','ireland_met',
  'arr87_legacy','hk_dsd_2018','malaysia_hp1','austria_okostra',
  // v4
  'france_shypre','poland_panda','turkey_mgm','israel_ims',
  'iran_irimo','iraq_mos','kazakhstan_kazhydromet','russia_roshydromet',
  'portugal_ipma','nz_niwa','csa_w231','sa_wrc',
  'west_africa_cilss','noaa_a16','euro_cordex','mongolia_namem',
  'pacific_sprep','czech_chmu',
  // v5
  'barbados_bms','oecs_caribbean','cyprus_wdd','malta_mra',
  'bolivia_altiplano','fourier_multipeak','cc_idf_scaled',
  // v6
  'g2p_gamma','poland_bs','belgium_willems','russia_snip',
  'turkey_dsi','korea_molit','greece_hellenic','romania_stas',
  'pmp_wmo','nested_envelope',
  // v7
  'arnell_sweden','tenax_cds','avm',
  // v8
  'sa_scs1','sa_scs2','sa_scs3','sa_scs4',
  // v9
  'dubai_dm_combined',
  // v10
  'atv_a121','dwa_a118','blaszczyk','imgw_cluster1','imgw_cluster2','imgw_cluster3','imgw_cluster4','imgw_cluster5',
  'wroclaw_2050','trupl','samaj_valovic','hungarian_msz','budapest_convective','owav_rb11',
  // v11
  'croatian_dhmz','beta_distribution','cc_clausius','bartlett_lewis',
  'tropical_cyclone','atmospheric_river','algeria_anrh','west_africa_cieh',
  'portugal_lnec','costa_rica_imn','nepal_dhm','nyc_dep',
  'post_wildfire','bimodal_gaussian',
  // v12
  'serbian_rhmz','bulgarian_nimh','slovenian_arso','ukrainian_dbn',
  'lithuanian_hms','latvian_lvgmc','estonian_emhi','soviet_snip_legacy','belarusian_tkp',
  'icelandic_imo','svensson_jones','reunion_mf','azores_ipma',
  'jordan_jmd','lebanon_cav','kuwait_mew','bahrain_met','yemen_cama',
  'myanmar_dmh','mekong_mrc','mononobe','uzbekistan_uhm',
  'tunisia_inm','uganda_unma','cameroon_ird','madagascar_dgm',
  'mauritius_mms','cote_ivoire','namibia_nms','sudan_sma',
  'guatemala_insivumeh','cuba_insmet','dominican_onamet','jamaica_msj',
  'trinidad_tobago','panama_etesa','honduras_smn',
  'paraguay_dmh','uruguay_inumet','sao_paulo_daee','bogota_eaab','lima_senamhi',
  'png_nws','samoa_met','hawaii_distinct',
  'caltrans','harris_county_fcd','maricopa_fcd','la_county','clark_county_nv',
  'philadelphia_pwd','illinois_b75',
  'parabolic','cosine_storm','lognormal_temporal','exponential_decay_storm',
  'power_curve_storm','weibull_temporal','instantaneous_burst','sigmoid_mass',
  'medicane','polar_low','cutoff_low','mcs_storm','supercell',
  'orographic_enhanced','urban_heat_island','monsoon_burst','squall_line',
  'sea_breeze','nocturnal_mcs','rain_on_snow','derecho',
  'ukcp18_enhanced','super_cc','neyman_scott','temez_spain','bonta_usda',
  'georgian_nea','albanian_igewe',
  // v13 — Canadian expansion
  'aes_50','ontario_mto_4hr','marsalek_1978','quebec_melccfp',
  'alberta_transportation','prairie_short','bc_moe_coastal','pilgrim_cordery_ca',
  // v14 — Adamowski-Alila + Winnipeg
  'adamowski_pacific','adamowski_prairie','adamowski_greatlakes','adamowski_stlawrence',
  'adamowski_atlantic','adamowski_northern','winnipeg_maclaren',
] as const;

type PatternType = typeof VALID_PATTERNS[number];

// ── Pattern metadata ────────────────────────────────────────────────────

const patternMeta: Record<string, { name: string; region: string; description: string }> = {
  block:             { name: "Uniform Block",              region: "Universal",        description: "Constant intensity throughout" },
  scs1:              { name: "SCS Type I",                 region: "US Pacific",       description: "Pacific maritime climate" },
  scs1a:             { name: "SCS Type IA",                region: "US Pacific NW",    description: "Pacific Northwest coastal" },
  scs2:              { name: "SCS Type II",                region: "US General",       description: "Most of US (moderate climate)" },
  scs3:              { name: "SCS Type III",               region: "US Gulf Coast",    description: "Gulf Coast high rainfall" },
  double:            { name: "Double Peak",                region: "Universal",        description: "Bimodal storm pattern" },
  triangular:        { name: "Triangular",                 region: "UK",               description: "UK practice standard" },
  trapezoidal:       { name: "Trapezoidal",                region: "Universal",        description: "Sustained peak pattern" },
  fsr:               { name: "FSR (UK)",                   region: "UK",               description: "Flood Studies Report" },
  chicago:           { name: "Chicago",                    region: "US Urban",         description: "Alternating block IDF method" },
  huff1:             { name: "Huff Q1",                    region: "US Midwest",       description: "Peak in first quartile" },
  huff2:             { name: "Huff Q2",                    region: "US Midwest",       description: "Peak in second quartile" },
  huff3:             { name: "Huff Q3",                    region: "US Midwest",       description: "Peak in third quartile" },
  huff4:             { name: "Huff Q4",                    region: "US Midwest",       description: "Peak in fourth quartile" },
  desbordes:         { name: "Desbordes (IT77)",           region: "France",           description: "French double-triangle per IT77" },
  arr:               { name: "ARR (Australia)",            region: "Australia",        description: "Australian Rainfall & Runoff" },
  jma:               { name: "JMA",                        region: "Japan",            description: "Japan Meteorological Agency standard" },
  china:             { name: "China Standard",             region: "China",            description: "Chinese national design storm" },
  sa_huff:           { name: "South Africa Huff",          region: "South Africa",     description: "Huff-type distribution for South Africa" },
  dwa:               { name: "DWA (Germany)",              region: "Germany",          description: "German Water Association standard" },
  dutch:             { name: "Dutch Standard",             region: "Netherlands",      description: "Netherlands design storm" },
  italian:           { name: "Italian Standard",           region: "Italy",            description: "Italian hydrological practice" },
  balanced:          { name: "Balanced Storm",             region: "Universal",        description: "IDF-derived alternating block" },
  fdot1:             { name: "FDOT Zone 1",                region: "US Florida",       description: "Florida DOT Zone 1 (NW Panhandle)" },
  fdot2:             { name: "FDOT Zone 2",                region: "US Florida",       description: "Florida DOT Zone 2 (NE/North Central)" },
  fdot3:             { name: "FDOT Zone 3",                region: "US Florida",       description: "Florida DOT Zone 3 (Central)" },
  fdot4:             { name: "FDOT Zone 4",                region: "US Florida",       description: "Florida DOT Zone 4 (SW Coast)" },
  fdot5:             { name: "FDOT Zone 5",                region: "US Florida",       description: "Florida DOT Zone 5 (SE Coast/Keys)" },
  txdot:             { name: "TxDOT",                      region: "US Texas",         description: "Texas DOT design storm" },
  yen_chow:          { name: "Yen & Chow",                 region: "Universal",        description: "Yen–Chow triangular hyetograph" },
  noaa_a14:          { name: "NOAA Atlas 14",              region: "US",               description: "NOAA Atlas 14 precipitation frequency" },
  udfcd:             { name: "UDFCD",                      region: "US Colorado",      description: "Urban Drainage & Flood Control District" },
  usace_sps:         { name: "USACE SPS",                  region: "US",               description: "US Army Corps standard project storm" },
  feh:               { name: "FEH (UK)",                   region: "UK",               description: "Flood Estimation Handbook" },
  euler1:            { name: "Euler Type I",               region: "Europe",           description: "Euler Type I – peak at start (r≈0)" },
  euler2:            { name: "Euler Type II",              region: "Europe",           description: "Euler Type II – peak at r=0.30 per DWA-A 118" },
  desbordes_double:  { name: "Desbordes Double Peak",      region: "France",           description: "Mediterranean double-peak variant (IT77)" },
  canadian:          { name: "Canadian Standard",          region: "Canada",           description: "Environment Canada design storm" },
  pmp_hmr:           { name: "PMP (HMR)",                  region: "US",               description: "Probable Maximum Precipitation per HMR" },
  singapore_pub:     { name: "Singapore PUB",              region: "Singapore",        description: "Public Utilities Board design storm" },
  china_gb50014:     { name: "China GB 50014",             region: "China",            description: "National outdoor drainage standard" },
  china_prd:         { name: "China PRD",                  region: "China",            description: "Pearl River Delta regional pattern" },
  india_imd:         { name: "India IMD",                  region: "India",            description: "India Meteorological Department standard" },
  india_coastal:     { name: "India Coastal",              region: "India",            description: "Indian coastal monsoon pattern" },
  japan_amedas:      { name: "Japan AMeDAS",               region: "Japan",            description: "Automated Meteorological Data network" },
  japan_baiu:        { name: "Japan Baiu",                 region: "Japan",            description: "Baiu (plum rain) frontal pattern" },
  japan_typhoon:     { name: "Japan Typhoon",              region: "Japan",            description: "Typhoon bimodal rainfall pattern" },
  korea_kma:         { name: "Korea KMA",                  region: "South Korea",      description: "Korea Meteorological Administration" },
  malaysia_msma:     { name: "Malaysia MSMA",              region: "Malaysia",         description: "Manual Saliran Mesra Alam design storm" },
  indonesia_bmkg:    { name: "Indonesia BMKG",             region: "Indonesia",        description: "BMKG tropical convective pattern" },
  philippines_pagasa:{ name: "Philippines PAGASA",         region: "Philippines",      description: "PAGASA typhoon belt design storm" },
  vietnam_imhen:     { name: "Vietnam IMHEN",              region: "Vietnam",          description: "Institute of Meteorology design storm" },
  thailand_tmd:      { name: "Thailand TMD",               region: "Thailand",         description: "Thai Meteorological Department standard" },
  saudi_pme:         { name: "Saudi PME",                  region: "Saudi Arabia",     description: "Presidency of Meteorology arid climate" },
  uae_ncms:          { name: "UAE NCMS",                   region: "UAE",              description: "National Center of Meteorology design storm" },
  qatar_kahramaa:    { name: "Qatar Kahramaa",             region: "Qatar",            description: "Kahramaa burst-type arid storm" },
  oman_dgman:        { name: "Oman DGMAN",                 region: "Oman",             description: "Directorate General of Meteorology" },
  sa_sanral:         { name: "South Africa SANRAL",        region: "South Africa",     description: "SANRAL road drainage design storm" },
  kenya_kmd:         { name: "Kenya KMD",                  region: "Kenya",            description: "Kenya Meteorological Department" },
  nigeria_nimet:     { name: "Nigeria NiMet",              region: "Nigeria",          description: "Nigerian Meteorological Agency" },
  egypt_hcww:        { name: "Egypt HCWW",                 region: "Egypt",            description: "Holding Company for Water & Wastewater" },
  brazil_ana:        { name: "Brazil ANA",                 region: "Brazil",           description: "Agência Nacional de Águas standard" },
  mexico_conagua:    { name: "Mexico CONAGUA",             region: "Mexico",           description: "Comisión Nacional del Agua design storm" },
  colombia_ideam:    { name: "Colombia IDEAM",             region: "Colombia",         description: "IDEAM tropical Andean pattern" },
  chile_dga:         { name: "Chile DGA",                  region: "Chile",            description: "Dirección General de Aguas standard" },
  nz_tp108:          { name: "Auckland TP108",              region: "New Zealand",      description: "Auckland Council TP108 design storm" },
  nz_wellington:     { name: "Wellington Regional",         region: "New Zealand",      description: "Wellington Regional Council frontal/orographic" },
  nz_christchurch:   { name: "Christchurch Canterbury",     region: "New Zealand",      description: "Canterbury rain-shadow plains design storm" },
  // Design Storm Equations Reference
  sifalda:           { name: "Sifalda",                    region: "Czech Republic",   description: "Three-block intensity pattern" },
  danish_svk:        { name: "Danish SVK",                 region: "Denmark",          description: "Spildevandskomiteen standard" },
  swedish_smhi:      { name: "Swedish SMHI",               region: "Sweden",           description: "SMHI IDF-based design storm" },
  norwegian_nve:     { name: "Norwegian NVE",              region: "Norway",           description: "Norwegian Water Resources standard" },
  finnish_fmi:       { name: "Finnish FMI",                region: "Finland",          description: "Finnish Meteorological Institute" },
  swiss_idf:         { name: "Swiss IDF",                  region: "Switzerland",      description: "MeteoSwiss IDF standard" },
  spanish_cedex:     { name: "Spanish CEDEX",              region: "Spain",            description: "CEDEX design storm" },
  belgian_irm:       { name: "Belgian IRM",                region: "Belgium",          description: "Royal Meteorological Institute" },
  pilgrim_cordery:   { name: "Pilgrim & Cordery",          region: "Australia",        description: "Australian temporal pattern" },
  watts_curve:       { name: "Watts Curve",                region: "Universal",        description: "Watts dimensionless curve" },
  hong_kong_hko:     { name: "Hong Kong HKO",              region: "Hong Kong",        description: "Hong Kong Observatory design storm" },
  taiwan_cwa:        { name: "Taiwan CWA",                 region: "Taiwan",           description: "Central Weather Administration" },
  bangladesh_bmd:    { name: "Bangladesh BMD",             region: "Bangladesh",       description: "Bangladesh Meteorological Department" },
  pakistan_pmd:       { name: "Pakistan PMD",               region: "Pakistan",         description: "Pakistan Meteorological Department" },
  sri_lanka:         { name: "Sri Lanka",                  region: "Sri Lanka",        description: "Sri Lankan monsoon design storm" },
  fiji_fms:          { name: "Fiji FMS",                   region: "Fiji",             description: "Fiji Meteorological Service" },
  argentina_smn:     { name: "Argentina SMN",              region: "Argentina",        description: "Servicio Meteorológico Nacional" },
  peru_senamhi:      { name: "Peru SENAMHI",               region: "Peru",             description: "SENAMHI Andean design storm" },
  ecuador_inamhi:    { name: "Ecuador INAMHI",             region: "Ecuador",          description: "INAMHI tropical/Andean pattern" },
  venezuela_inameh:  { name: "Venezuela INAMEH",           region: "Venezuela",        description: "INAMEH tropical coastal pattern" },
  puerto_rico:       { name: "Puerto Rico",                region: "Puerto Rico",      description: "Caribbean tropical design storm" },
  morocco_dmn:       { name: "Morocco DMN",                region: "Morocco",          description: "Direction de la Météorologie Nationale" },
  ethiopia_nma:      { name: "Ethiopia NMA",               region: "Ethiopia",         description: "National Meteorological Agency" },
  ghana_gmet:        { name: "Ghana GMet",                 region: "Ghana",            description: "Ghana Meteorological Agency" },
  tanzania_tma:      { name: "Tanzania TMA",               region: "Tanzania",         description: "Tanzania Meteorological Authority" },
  mozambique_inam:   { name: "Mozambique INAM",            region: "Mozambique",       description: "Instituto Nacional de Meteorologia" },
  hirds_nz:          { name: "HIRDS (NZ)",                 region: "New Zealand",      description: "High Intensity Rainfall Design System" },
  arid_flash_flood:  { name: "Arid Flash Flood",           region: "Universal",        description: "Generic arid region flash flood" },
  // v2
  aes_30:            { name: "AES 30%",                    region: "Canada",           description: "Canadian AES 30% advancement" },
  aes_40:            { name: "AES 40%",                    region: "Canada",           description: "Canadian AES 40% advancement" },
  kostra_dwd:        { name: "KOSTRA-DWD",                 region: "Germany",          description: "German DWD KOSTRA atlas" },
  dubai_dm:          { name: "Dubai DM",                   region: "UAE",              description: "Dubai Municipality design storm" },
  abu_dhabi_adm:     { name: "Abu Dhabi ADM",              region: "UAE",              description: "Abu Dhabi Municipality design storm" },
  montana_caquot:    { name: "Montana/Caquot",             region: "France",           description: "French power-law hyetograph" },
  m5_60_fsr:         { name: "M5-60 FSR",                  region: "UK/Ireland",       description: "FSR short-duration variant" },
  arr2019:           { name: "ARR 2019",                   region: "Australia",        description: "ARR 2019 median ensemble pattern" },
  upm_plata:         { name: "UPM Plata",                  region: "Uruguay/Paraguay", description: "Río de la Plata basin design storm" },
  // v3
  feh22_refh2:       { name: "FEH22/ReFH2",               region: "UK",               description: "FEH22 + ReFH2 design hyetograph" },
  noaa_a15:          { name: "NOAA Atlas 15",              region: "US",               description: "Next-gen US precipitation frequency" },
  eccc_idf:          { name: "ECCC IDF",                   region: "Canada",           description: "Environment Canada IDF datasets" },
  shyreg_fr:         { name: "SHYREG (France)",            region: "France",           description: "IRSTEA/INRAE stochastic rainfall" },
  ireland_met:       { name: "Ireland Met Éireann",        region: "Ireland",          description: "Irish rainfall IDF service" },
  arr87_legacy:      { name: "ARR87 Legacy",               region: "Australia",        description: "Pre-2016 Australian IFD" },
  hk_dsd_2018:       { name: "HK DSD 2018",               region: "Hong Kong",        description: "DSD Stormwater Drainage Manual 5th ed." },
  malaysia_hp1:      { name: "Malaysia HP1",               region: "Malaysia",         description: "Hydrological Procedure No.1" },
  austria_okostra:   { name: "Austria ÖKOSTRA",            region: "Austria",          description: "Austrian design rainfall" },
  // v4
  france_shypre:     { name: "France SHYPRE",              region: "France",           description: "Standard Hyetographs for Rainfall Events" },
  poland_panda:      { name: "Poland PANDa",               region: "Poland",           description: "Polish National Precipitation Atlas" },
  turkey_mgm:        { name: "Turkey MGM",                 region: "Turkey",           description: "Turkish State Meteorological Service" },
  israel_ims:        { name: "Israel IMS",                 region: "Israel",           description: "Israel Meteorological Service" },
  iran_irimo:        { name: "Iran IRIMO",                 region: "Iran",             description: "Iranian Meteorological Organization" },
  iraq_mos:          { name: "Iraq MoS",                   region: "Iraq",             description: "Ministry of Science, Tigris-Euphrates" },
  kazakhstan_kazhydromet: { name: "Kazakhstan Kazhydromet", region: "Kazakhstan",     description: "Central Asian continental IDF" },
  russia_roshydromet:{ name: "Russia Roshydromet",         region: "Russia",           description: "Russian continental IDF standards" },
  portugal_ipma:     { name: "Portugal IPMA",              region: "Portugal",         description: "Portuguese Mediterranean IDF" },
  nz_niwa:           { name: "NZ NIWA",                    region: "New Zealand",      description: "NIWA national standard" },
  csa_w231:          { name: "CSA W231",                   region: "Canada",           description: "Climate-adjusted IDF (2024)" },
  sa_wrc:            { name: "South Africa WRC",           region: "South Africa",     description: "Water Research Commission" },
  west_africa_cilss: { name: "West Africa CILSS",          region: "West Africa",      description: "Sahel convective squall line" },
  noaa_a16:          { name: "NOAA Atlas 16",              region: "US West",          description: "Next-gen western US precipitation" },
  euro_cordex:       { name: "EURO-CORDEX",                region: "Europe",           description: "Climate-downscaled ensemble pattern" },
  mongolia_namem:    { name: "Mongolia NAMEM",             region: "Mongolia",         description: "National Agency for Meteorology" },
  pacific_sprep:     { name: "Pacific SPREP",              region: "Pacific Islands",  description: "Pacific SIDS tropical cyclone" },
  czech_chmu:        { name: "Czech ČHMÚ",                 region: "Czech Republic",   description: "Modern Czech Hydrometeorological" },
  // v5
  barbados_bms:      { name: "Barbados BMS",               region: "Barbados",         description: "Modified Hershfield PMP" },
  oecs_caribbean:    { name: "OECS Caribbean",             region: "Eastern Caribbean",description: "Bell's method with TC adjustment" },
  cyprus_wdd:        { name: "Cyprus WDD",                 region: "Cyprus",           description: "Double-triangular Mediterranean" },
  malta_mra:         { name: "Malta MRA",                  region: "Malta",            description: "Chicago-Huff hybrid method" },
  bolivia_altiplano: { name: "Bolivia Altiplano",          region: "Bolivia",          description: "High-altitude convective" },
  fourier_multipeak: { name: "Fourier Multi-Peak",         region: "Universal",        description: "Fourier-series multi-peak storm" },
  cc_idf_scaled:     { name: "CC IDF Scaled",              region: "Universal",        description: "Climate-change scaled IDF" },
  // v6
  g2p_gamma:         { name: "G2P Gamma",                  region: "Universal",        description: "Gamma distribution rainfall" },
  poland_bs:         { name: "Poland BS",                  region: "Poland",           description: "Polish Building Standard" },
  belgium_willems:   { name: "Belgium Willems",            region: "Belgium",          description: "Willems composite storm" },
  russia_snip:       { name: "Russia SNiP",                region: "Russia",           description: "Soviet-era SNiP drainage standard" },
  turkey_dsi:        { name: "Turkey DSI",                 region: "Turkey",           description: "State Hydraulic Works" },
  korea_molit:       { name: "Korea MOLIT",                region: "South Korea",      description: "Ministry of Land design storm" },
  greece_hellenic:   { name: "Greece Hellenic",            region: "Greece",           description: "Hellenic National Met Service" },
  romania_stas:      { name: "Romania STAS",               region: "Romania",          description: "Romanian national standard" },
  pmp_wmo:           { name: "PMP WMO",                    region: "Universal",        description: "WMO PMP estimation method" },
  nested_envelope:   { name: "Nested Envelope",            region: "Universal",        description: "Nested IDF envelope pattern" },
  // v7
  arnell_sweden:     { name: "Arnell (Sweden)",            region: "Sweden",           description: "Arnell Swedish design storm" },
  tenax_cds:         { name: "Tenax CDS",                  region: "Universal",        description: "Tenax Critical Duration Storm" },
  avm:               { name: "AVM",                        region: "Universal",        description: "Alternating Variable Method" },
  // v8
  sa_scs1:           { name: "SA SCS Type 1",              region: "South Africa",     description: "South African SCS Type 1" },
  sa_scs2:           { name: "SA SCS Type 2",              region: "South Africa",     description: "South African SCS Type 2" },
  sa_scs3:           { name: "SA SCS Type 3",              region: "South Africa",     description: "South African SCS Type 3" },
  sa_scs4:           { name: "SA SCS Type 4",              region: "South Africa",     description: "South African SCS Type 4" },
  // v9
  dubai_dm_combined: { name: "Dubai DM Combined",          region: "UAE",              description: "Dubai Municipality DDF combined profile" },
  // v10
  atv_a121:          { name: "ATV-A 121",                  region: "Germany",          description: "German ATV-DVWK-A 121 standard" },
  dwa_a118:          { name: "DWA-A 118",                  region: "Germany",          description: "German DWA-A 118 model rain" },
  blaszczyk:         { name: "Błaszczyk",                  region: "Poland",           description: "Traditional Polish 4-quarter method" },
  imgw_cluster1:     { name: "IMGW Cluster 1",             region: "Poland",           description: "Front-loaded rapid onset" },
  imgw_cluster2:     { name: "IMGW Cluster 2",             region: "Poland",           description: "Early-peak 20-35%" },
  imgw_cluster3:     { name: "IMGW Cluster 3",             region: "Poland",           description: "Central peak DVWK-like" },
  imgw_cluster4:     { name: "IMGW Cluster 4",             region: "Poland",           description: "Late peak 50-70%" },
  imgw_cluster5:     { name: "IMGW Cluster 5",             region: "Poland",           description: "End-loaded delayed peak" },
  wroclaw_2050:      { name: "Wrocław 2050",               region: "Poland",           description: "Climate-adjusted Wrocław pattern" },
  trupl:             { name: "Trupl",                      region: "Czech Republic",   description: "Trupl 1958 Czech standard" },
  samaj_valovic:     { name: "Šamaj-Valovič",              region: "Slovakia",         description: "Slovak peak-centered pattern" },
  hungarian_msz:     { name: "Hungarian MSZ",              region: "Hungary",          description: "Hungarian national standard" },
  budapest_convective:{ name: "Budapest Convective",       region: "Hungary",          description: "Budapest sharp convective peak" },
  owav_rb11:         { name: "ÖWAV RB11",                  region: "Austria",          description: "Austrian ÖWAV Regelblatt 11" },
  // v11
  croatian_dhmz:     { name: "Croatian DHMZ",              region: "Croatia",          description: "Adriatic coastal convective" },
  beta_distribution: { name: "Beta Distribution",          region: "Universal",        description: "Flexible β(3,4) shape" },
  cc_clausius:       { name: "Clausius-Clapeyron",         region: "Universal",        description: "7%/°C climate scaling" },
  bartlett_lewis:    { name: "Bartlett-Lewis",             region: "Universal",        description: "Stochastic rectangular pulse model" },
  tropical_cyclone:  { name: "Tropical Cyclone",           region: "Universal",        description: "Broad sustained rainband pattern" },
  atmospheric_river: { name: "Atmospheric River",          region: "Universal",        description: "Sustained long-duration frontal" },
  algeria_anrh:      { name: "Algeria ANRH",               region: "Algeria",          description: "North African Mediterranean/semi-arid" },
  west_africa_cieh:  { name: "West Africa CIEH",           region: "West Africa",      description: "Sahelian squall line ECOWAS" },
  portugal_lnec:     { name: "Portugal LNEC",              region: "Portugal",         description: "Lisbon/Algarve Mediterranean" },
  costa_rica_imn:    { name: "Costa Rica IMN",             region: "Costa Rica",       description: "Central American tropical" },
  nepal_dhm:         { name: "Nepal DHM",                  region: "Nepal",            description: "Extreme orographic monsoon" },
  nyc_dep:           { name: "NYC DEP",                    region: "US New York",      description: "NYC combined sewer design" },
  post_wildfire:     { name: "Post-Wildfire",              region: "Universal",        description: "Debris flow triggering rainfall" },
  bimodal_gaussian:  { name: "Bimodal Gaussian",           region: "Universal",        description: "Two equal Gaussian peaks" },
  // v12 — Eastern Europe
  serbian_rhmz:      { name: "Serbian RHMZ",               region: "Serbia",           description: "Republic Hydrometeorological Service" },
  bulgarian_nimh:    { name: "Bulgarian NIMH",             region: "Bulgaria",         description: "National Institute of Meteorology" },
  slovenian_arso:    { name: "Slovenian ARSO",             region: "Slovenia",         description: "Agency for the Environment" },
  ukrainian_dbn:     { name: "Ukrainian DBN",              region: "Ukraine",          description: "Ukrainian building norms" },
  lithuanian_hms:    { name: "Lithuanian HMS",             region: "Lithuania",        description: "Hydrometeorology Service" },
  latvian_lvgmc:     { name: "Latvian LVGMC",              region: "Latvia",           description: "Latvian meteorological centre" },
  estonian_emhi:     { name: "Estonian EMHI",              region: "Estonia",          description: "Estonian meteorological institute" },
  soviet_snip_legacy:{ name: "Soviet SNiP Legacy",         region: "Former USSR",      description: "Legacy SNiP drainage norms" },
  belarusian_tkp:    { name: "Belarusian TKP",             region: "Belarus",          description: "Belarusian technical code" },
  // v12 — Western & Northern Europe
  icelandic_imo:     { name: "Icelandic IMO",              region: "Iceland",          description: "Icelandic Meteorological Office" },
  svensson_jones:    { name: "Svensson-Jones",             region: "UK",               description: "Svensson & Jones UK temporal" },
  reunion_mf:        { name: "Réunion MF",                 region: "Réunion",          description: "World record short-duration rainfall" },
  azores_ipma:       { name: "Azores IPMA",                region: "Azores",           description: "Portuguese Atlantic islands" },
  // v12 — Middle East
  jordan_jmd:        { name: "Jordan JMD",                 region: "Jordan",           description: "Jordan Meteorological Department" },
  lebanon_cav:       { name: "Lebanon CAV",                region: "Lebanon",          description: "Lebanese coastal Mediterranean" },
  kuwait_mew:        { name: "Kuwait MEW",                 region: "Kuwait",           description: "Ministry of Electricity & Water" },
  bahrain_met:       { name: "Bahrain Met",                region: "Bahrain",          description: "Bahrain meteorological service" },
  yemen_cama:        { name: "Yemen CAMA",                 region: "Yemen",            description: "Civil Aviation & Meteorology" },
  // v12 — Asia
  myanmar_dmh:       { name: "Myanmar DMH",                region: "Myanmar",          description: "Department of Meteorology" },
  mekong_mrc:        { name: "Mekong MRC",                 region: "Mekong Basin",     description: "Mekong River Commission" },
  mononobe:          { name: "Mononobe",                   region: "Japan",            description: "Classical Japanese IDF" },
  uzbekistan_uhm:    { name: "Uzbekistan UHM",             region: "Uzbekistan",       description: "Uzbek Hydrometeorological Service" },
  // v12 — Africa
  tunisia_inm:       { name: "Tunisia INM",                region: "Tunisia",          description: "Institut National de Météorologie" },
  uganda_unma:       { name: "Uganda UNMA",                region: "Uganda",           description: "Uganda National Met Authority" },
  cameroon_ird:      { name: "Cameroon IRD",               region: "Cameroon",         description: "IRD tropical convective" },
  madagascar_dgm:    { name: "Madagascar DGM",             region: "Madagascar",       description: "Direction de la Météorologie" },
  mauritius_mms:     { name: "Mauritius MMS",              region: "Mauritius",        description: "Mauritius Met Service" },
  cote_ivoire:       { name: "Côte d'Ivoire",              region: "Côte d'Ivoire",    description: "SODEXAM tropical convective" },
  namibia_nms:       { name: "Namibia NMS",                region: "Namibia",          description: "Namibia Met Service" },
  sudan_sma:         { name: "Sudan SMA",                  region: "Sudan",            description: "Sudan Met Authority" },
  // v12 — Central America & Caribbean
  guatemala_insivumeh:{ name: "Guatemala INSIVUMEH",       region: "Guatemala",        description: "INSIVUMEH tropical convective" },
  cuba_insmet:       { name: "Cuba INSMET",                region: "Cuba",             description: "Instituto de Meteorología" },
  dominican_onamet:  { name: "Dominican ONAMET",           region: "Dominican Republic",description: "Oficina Nacional de Meteorología" },
  jamaica_msj:       { name: "Jamaica MSJ",                region: "Jamaica",          description: "Met Service Jamaica" },
  trinidad_tobago:   { name: "Trinidad & Tobago",          region: "Trinidad & Tobago",description: "Caribbean tropical design storm" },
  panama_etesa:      { name: "Panama ETESA",               region: "Panama",           description: "ETESA hydrometeorological" },
  honduras_smn:      { name: "Honduras SMN",               region: "Honduras",         description: "Servicio Meteorológico Nacional" },
  // v12 — South America
  paraguay_dmh:      { name: "Paraguay DMH",               region: "Paraguay",         description: "Dirección de Meteorología" },
  uruguay_inumet:    { name: "Uruguay INUMET",             region: "Uruguay",          description: "Instituto de Meteorología" },
  sao_paulo_daee:    { name: "São Paulo DAEE",             region: "Brazil",           description: "DAEE São Paulo state design storm" },
  bogota_eaab:       { name: "Bogotá EAAB",                region: "Colombia",         description: "Empresa de Acueducto" },
  lima_senamhi:      { name: "Lima SENAMHI",               region: "Peru",             description: "Lima coastal desert El Niño" },
  // v12 — Pacific
  png_nws:           { name: "PNG NWS",                    region: "Papua New Guinea", description: "National Weather Service" },
  samoa_met:         { name: "Samoa Met",                  region: "Samoa",            description: "Samoa Meteorology Division" },
  hawaii_distinct:   { name: "Hawaii",                     region: "US Hawaii",        description: "Trade wind + Kona storm blend" },
  // v12 — US State & Municipal
  caltrans:          { name: "Caltrans",                   region: "US California",    description: "California atmospheric river" },
  harris_county_fcd: { name: "Harris County FCD",          region: "US Texas",         description: "Houston post-Harvey Gulf Coast" },
  maricopa_fcd:      { name: "Maricopa FCD",               region: "US Arizona",       description: "Phoenix monsoon flash flood" },
  la_county:         { name: "LA County",                  region: "US California",    description: "LA County burn area + debris flow" },
  clark_county_nv:   { name: "Clark County NV",            region: "US Nevada",        description: "Las Vegas desert monsoon" },
  philadelphia_pwd:  { name: "Philadelphia PWD",           region: "US Pennsylvania",  description: "Green infrastructure design storm" },
  illinois_b75:      { name: "Illinois B75",               region: "US Illinois",      description: "State Water Survey Bulletin 75" },
  // v12 — Theoretical & Mathematical
  parabolic:         { name: "Parabolic",                  region: "Universal",        description: "Quadratic i(t) = 6·P/D²·t·(D-t)" },
  cosine_storm:      { name: "Cosine Storm",               region: "Universal",        description: "Raised cosine distribution" },
  lognormal_temporal:{ name: "Log-Normal",                 region: "Universal",        description: "Log-normal temporal (μ=-0.5, σ=0.7)" },
  exponential_decay_storm:{ name: "Exponential Decay",     region: "Universal",        description: "Front-loaded e^(-3t) burst" },
  power_curve_storm: { name: "Power Curve",                region: "Universal",        description: "t²·(1-t)³ asymmetric peak" },
  weibull_temporal:  { name: "Weibull Temporal",            region: "Universal",        description: "Weibull k=3.6, λ=0.55" },
  instantaneous_burst:{ name: "Instantaneous Burst",       region: "Universal",        description: "All depth in center step" },
  sigmoid_mass:      { name: "Sigmoid Mass",               region: "Universal",        description: "Logistic S-curve mass function" },
  // v12 — Storm Scenarios
  medicane:          { name: "Medicane",                   region: "Mediterranean",    description: "Mediterranean hurricane dual peaks" },
  polar_low:         { name: "Polar Low",                  region: "Arctic/Sub-Arctic",description: "Polar low compact convective" },
  cutoff_low:        { name: "Cutoff Low",                 region: "Universal",        description: "Slow-moving sustained late peak" },
  mcs_storm:         { name: "MCS Storm",                  region: "Universal",        description: "Mesoscale Convective System" },
  supercell:         { name: "Supercell",                  region: "Universal",        description: "Extreme single-peak front-loaded" },
  orographic_enhanced:{ name: "Orographic Enhanced",       region: "Universal",        description: "Uplift intensification late peak" },
  urban_heat_island: { name: "Urban Heat Island",          region: "Universal",        description: "City-enhanced earlier sharper peak" },
  monsoon_burst:     { name: "Monsoon Burst",              region: "Universal",        description: "Active monsoon phase broad peak" },
  squall_line:       { name: "Squall Line",                region: "Universal",        description: "Narrow intense band front-loaded" },
  sea_breeze:        { name: "Sea Breeze",                 region: "Universal",        description: "Late afternoon convective" },
  nocturnal_mcs:     { name: "Nocturnal MCS",              region: "Universal",        description: "Night-time organized convection" },
  rain_on_snow:      { name: "Rain on Snow",               region: "Universal",        description: "Compound sustained event" },
  derecho:           { name: "Derecho",                    region: "Universal",        description: "Fast-moving destructive burst" },
  // v12 — Climate Change & Stochastic
  ukcp18_enhanced:   { name: "UKCP18 Enhanced",            region: "UK",               description: "UK +4°C scenario sharper peak" },
  super_cc:          { name: "Super-CC",                   region: "Universal",        description: "14%/°C double scaling" },
  neyman_scott:      { name: "Neyman-Scott",               region: "Universal",        description: "Neyman-Scott Rectangular Pulse" },
  temez_spain:       { name: "Temez (Spain)",              region: "Spain",            description: "Temez Spanish design storm" },
  bonta_usda:        { name: "Bonta USDA",                 region: "US Midwest",       description: "USDA ARS dimensionless hyetographs" },
  georgian_nea:      { name: "Georgian NEA",               region: "Georgia",          description: "Caucasus convective front-loaded" },
  albanian_igewe:    { name: "Albanian IGEWE",             region: "Albania",          description: "Adriatic coastal Mediterranean" },
  // v13 — Canadian expansion
  aes_50:            { name: "AES Canada 50%",             region: "Canada",           description: "AES/ECCC 50% center-peaked (Hogg 1980)" },
  ontario_mto_4hr:   { name: "Ontario MTO 4-hr",           region: "Canada Ontario",   description: "Ontario Ministry of Transportation highway" },
  marsalek_1978:     { name: "Marsalek (1978)",             region: "Canada",           description: "NRC Canada urban drainage design storm" },
  quebec_melccfp:    { name: "Quebec MELCCFP",              region: "Canada Quebec",    description: "Quebec provincial design storm" },
  alberta_transportation: { name: "Alberta Transportation", region: "Canada Alberta",   description: "Prairie highway drainage design" },
  prairie_short:     { name: "Prairie Short-Duration",      region: "Canada Prairies",  description: "Convective thunderstorm burst" },
  bc_moe_coastal:    { name: "BC MOE Coastal",              region: "Canada BC",        description: "Pacific coast orographic/frontal" },
  pilgrim_cordery_ca:{ name: "Pilgrim-Cordery (Canada)",    region: "Canada",           description: "Australian method Canadian adaptation" },
};

// ── Utility helpers ─────────────────────────────────────────────────────

function lerpCum(t: number, pts: [number, number][]): number {
  if (t <= pts[0][0]) return pts[0][1];
  if (t >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      const f = (t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]);
      return pts[i - 1][1] + f * (pts[i][1] - pts[i - 1][1]);
    }
  }
  return pts[pts.length - 1][1];
}

function fromCumulative(
  cumFn: (t: number) => number, numSteps: number, totalDepth: number,
  _durationHr: number, timeStepMin: number,
): number[] {
  const intensities: number[] = [];
  for (let s = 0; s < numSteps; s++) {
    const t0 = s / numSteps;
    const t1 = Math.min((s + 1) / numSteps, 1);
    const depthFrac = cumFn(t1) - cumFn(t0);
    intensities.push((depthFrac * totalDepth) / (timeStepMin / 60));
  }
  return intensities;
}

function fromShape(
  shapeFn: (t: number) => number, numSteps: number, totalDepth: number, timeStepMin: number,
): number[] {
  const raw: number[] = [];
  for (let s = 0; s < numSteps; s++) {
    const t = (s + 0.5) / numSteps;
    raw.push(shapeFn(t));
  }
  const sum = raw.reduce((a, b) => a + b, 0) * (timeStepMin / 60);
  const scale = sum > 0 ? totalDepth / sum : 0;
  return raw.map(v => v * scale);
}

function gaussian(t: number, peakPos: number, sigma: number): number {
  const d = t - peakPos;
  return Math.exp(-0.5 * (d / sigma) * (d / sigma));
}

function triShape(t: number, peakPos: number): number {
  if (t <= peakPos) return peakPos > 0 ? t / peakPos : 1;
  return (1 - peakPos) > 0 ? (1 - t) / (1 - peakPos) : 1;
}

/** Chicago-type (Keifer-Chu) alternating block with advancement coefficient r */
function chicagoVariant(
  totalDepth: number, numSteps: number, timeStepMin: number, durationHr: number, r: number,
): number[] {
  const peakPosition = Math.floor(numSteps * r);
  const blocks: { intensity: number }[] = [];
  for (let i = 0; i < numSteps; i++) {
    const durationHrs = ((i + 1) * timeStepMin) / 60;
    const intensity = totalDepth / (durationHr * Math.pow(durationHrs / durationHr, 0.6));
    blocks.push({ intensity });
  }
  blocks.sort((a, b) => b.intensity - a.intensity);
  const orderedData: number[] = new Array(numSteps).fill(0);
  orderedData[peakPosition] = blocks[0].intensity;
  let leftIdx = peakPosition - 1;
  let rightIdx = peakPosition + 1;
  for (let i = 1; i < blocks.length; i++) {
    if (i % 2 === 1 && leftIdx >= 0) {
      orderedData[leftIdx] = blocks[i].intensity;
      leftIdx--;
    } else if (rightIdx < numSteps) {
      orderedData[rightIdx] = blocks[i].intensity;
      rightIdx++;
    } else if (leftIdx >= 0) {
      orderedData[leftIdx] = blocks[i].intensity;
      leftIdx--;
    }
  }
  const dt = timeStepMin / 60;
  const vol = orderedData.reduce((s, v) => s + v * dt, 0);
  if (vol > 0) {
    const scale = totalDepth / vol;
    for (let i = 0; i < orderedData.length; i++) orderedData[i] *= scale;
  }
  return orderedData;
}

/** Shorthand: cumulative from array of [t, P] pairs */
function cumCurve(pts: [number, number][], numSteps: number, totalDepth: number, durationHr: number, timeStepMin: number): number[] {
  return fromCumulative(t => lerpCum(t, pts), numSteps, totalDepth, durationHr, timeStepMin);
}

// ── SCS cumulative curves ───────────────────────────────────────────────

const SCS1_CUM: [number, number][] = [
  [0,0],[0.083,0.035],[0.167,0.076],[0.25,0.125],[0.333,0.194],
  [0.375,0.250],[0.417,0.425],[0.458,0.520],[0.5,0.577],[0.542,0.601],
  [0.583,0.624],[0.667,0.664],[0.75,0.735],[0.833,0.811],[0.917,0.886],[1,1]
];

const SCS1A_CUM: [number, number][] = [
  [0,0],[0.083,0.050],[0.167,0.116],[0.25,0.206],[0.292,0.268],
  [0.333,0.425],[0.375,0.480],[0.417,0.520],[0.458,0.550],[0.5,0.577],
  [0.583,0.624],[0.667,0.664],[0.75,0.735],[0.833,0.811],[0.917,0.886],[1,1]
];

function scs2Cum(t: number): number {
  if (t <= 0.4) return 0.20 * Math.pow(t / 0.4, 0.75);
  if (t <= 0.5) return 0.20 + 0.51 * ((t - 0.4) / 0.1);
  if (t <= 0.6) return 0.71 + 0.13 * ((t - 0.5) / 0.1);
  return 0.84 + 0.16 * ((t - 0.6) / 0.4);
}

const SCS3_CUM: [number, number][] = [
  [0,0],[0.083,0.020],[0.167,0.048],[0.25,0.080],[0.333,0.120],
  [0.417,0.180],[0.458,0.298],[0.5,0.500],[0.542,0.702],[0.583,0.751],
  [0.667,0.811],[0.75,0.886],[0.833,0.940],[0.917,0.972],[1,1]
];

const HUFF1_CUM: [number, number][] = [
  [0,0],[0.05,0.063],[0.1,0.178],[0.15,0.333],[0.2,0.488],[0.25,0.600],
  [0.3,0.650],[0.4,0.725],[0.5,0.780],[0.6,0.830],[0.7,0.870],[0.8,0.920],[0.9,0.960],[1,1]
];
const HUFF2_CUM: [number, number][] = [
  [0,0],[0.1,0.020],[0.2,0.080],[0.25,0.150],[0.3,0.260],[0.35,0.420],
  [0.4,0.520],[0.45,0.580],[0.5,0.640],[0.6,0.750],[0.7,0.830],[0.8,0.900],[0.9,0.955],[1,1]
];
const HUFF3_CUM: [number, number][] = [
  [0,0],[0.1,0.020],[0.2,0.050],[0.3,0.100],[0.4,0.180],[0.45,0.260],
  [0.5,0.380],[0.55,0.520],[0.6,0.640],[0.65,0.720],[0.7,0.780],[0.8,0.880],[0.9,0.945],[1,1]
];
const HUFF4_CUM: [number, number][] = [
  [0,0],[0.1,0.010],[0.2,0.030],[0.3,0.060],[0.4,0.100],[0.5,0.160],
  [0.6,0.260],[0.7,0.420],[0.75,0.520],[0.8,0.640],[0.85,0.760],[0.9,0.880],[0.95,0.940],[1,1]
];

const FDOT1_CUM: [number, number][] = [
  [0,0],[0.083,0.035],[0.167,0.085],[0.25,0.150],[0.333,0.240],
  [0.417,0.500],[0.5,0.700],[0.583,0.800],[0.667,0.865],[0.75,0.910],[0.833,0.950],[0.917,0.978],[1,1]
];
const FDOT2_CUM: [number, number][] = [
  [0,0],[0.083,0.030],[0.167,0.075],[0.25,0.140],[0.333,0.230],
  [0.417,0.480],[0.5,0.680],[0.583,0.790],[0.667,0.855],[0.75,0.905],[0.833,0.945],[0.917,0.975],[1,1]
];
const FDOT3_CUM: [number, number][] = [
  [0,0],[0.083,0.025],[0.167,0.065],[0.25,0.130],[0.333,0.220],
  [0.417,0.460],[0.5,0.660],[0.583,0.780],[0.667,0.850],[0.75,0.900],[0.833,0.940],[0.917,0.973],[1,1]
];
const FDOT4_CUM: [number, number][] = [
  [0,0],[0.083,0.020],[0.167,0.055],[0.25,0.120],[0.333,0.200],
  [0.417,0.440],[0.5,0.640],[0.583,0.770],[0.667,0.840],[0.75,0.895],[0.833,0.935],[0.917,0.970],[1,1]
];
const FDOT5_CUM: [number, number][] = [
  [0,0],[0.083,0.015],[0.167,0.045],[0.25,0.100],[0.333,0.185],
  [0.417,0.420],[0.5,0.620],[0.583,0.760],[0.667,0.835],[0.75,0.890],[0.833,0.932],[0.917,0.968],[1,1]
];

// ── Hyetograph generator ────────────────────────────────────────────────

function generateHyetograph(
  pattern: PatternType, totalDepth: number, durationHr: number, timeStepMin: number,
): { time_min: number; intensity: number; cumulative: number }[] {
  const numSteps = Math.ceil((durationHr * 60) / timeStepMin);
  let intensities: number[];

  switch (pattern) {
    // ── Universal / US patterns ────────────────────────────────────────
    case 'block': {
      const i = totalDepth / durationHr;
      intensities = Array(numSteps).fill(i);
      break;
    }
    case 'scs1':
      intensities = cumCurve(SCS1_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'scs1a':
      intensities = cumCurve(SCS1A_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'scs2':
      intensities = fromCumulative(scs2Cum, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'scs3':
      intensities = cumCurve(SCS3_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'double':
      intensities = fromShape(t => gaussian(t, 0.3, 0.08) + 0.7 * gaussian(t, 0.7, 0.08), numSteps, totalDepth, timeStepMin); break;
    case 'triangular':
      intensities = fromShape(t => triShape(t, 0.33), numSteps, totalDepth, timeStepMin); break;
    case 'trapezoidal':
      intensities = fromShape(t => t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1, numSteps, totalDepth, timeStepMin); break;
    case 'fsr':
      intensities = fromShape(t => triShape(t, 0.42), numSteps, totalDepth, timeStepMin); break;
    case 'chicago':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.4); break;

    // ── Huff quartile distributions ────────────────────────────────────
    case 'huff1':
      intensities = cumCurve(HUFF1_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'huff2':
      intensities = cumCurve(HUFF2_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'huff3':
      intensities = cumCurve(HUFF3_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'huff4':
      intensities = cumCurve(HUFF4_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── France ─────────────────────────────────────────────────────────
    case 'desbordes':
      intensities = fromShape(t => {
        if (t <= 0.3) return t / 0.3;
        if (t <= 0.5) return 1 - 0.3 * ((t - 0.3) / 0.2);
        return 0.7 * (1 - t) / 0.5;
      }, numSteps, totalDepth, timeStepMin); break;
    case 'desbordes_double':
      intensities = fromShape(t => gaussian(t, 0.25, 0.07) + 0.6 * gaussian(t, 0.65, 0.10), numSteps, totalDepth, timeStepMin); break;

    // ── Australia ──────────────────────────────────────────────────────
    case 'arr':
      intensities = fromShape(t => gaussian(t, 0.5, 0.12), numSteps, totalDepth, timeStepMin); break;

    // ── Japan ──────────────────────────────────────────────────────────
    case 'jma':
      intensities = fromShape(t => gaussian(t, 0.5, 0.15), numSteps, totalDepth, timeStepMin); break;
    case 'japan_amedas':
      intensities = fromShape(t => gaussian(t, 0.45, 0.10), numSteps, totalDepth, timeStepMin); break;
    case 'japan_baiu':
      intensities = fromShape(t => {
        if (t < 0.2) return 0.3 * t / 0.2;
        if (t < 0.6) return 0.3 + 0.7 * gaussian(t, 0.5, 0.12);
        return gaussian(t, 0.5, 0.18);
      }, numSteps, totalDepth, timeStepMin); break;
    case 'japan_typhoon':
      intensities = fromShape(t => gaussian(t, 0.3, 0.08) + 1.5 * gaussian(t, 0.7, 0.06), numSteps, totalDepth, timeStepMin); break;

    // ── China ──────────────────────────────────────────────────────────
    case 'china':
      intensities = fromShape(t => gaussian(t, 0.40, 0.11), numSteps, totalDepth, timeStepMin); break;
    case 'china_gb50014':
      intensities = fromShape(t => gaussian(t, 0.40, 0.09), numSteps, totalDepth, timeStepMin); break;
    case 'china_prd':
      intensities = fromShape(t => gaussian(t, 0.35, 0.10), numSteps, totalDepth, timeStepMin); break;

    // ── South Africa ──────────────────────────────────────────────────
    case 'sa_huff':
      intensities = cumCurve(HUFF2_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'sa_sanral':
      intensities = fromShape(t => gaussian(t, 0.42, 0.10), numSteps, totalDepth, timeStepMin); break;

    // ── Germany / Europe ──────────────────────────────────────────────
    case 'dwa':
      intensities = fromShape(t => gaussian(t, 0.30, 0.09), numSteps, totalDepth, timeStepMin); break;
    case 'euler1':
      intensities = fromShape(t => Math.exp(-3 * t), numSteps, totalDepth, timeStepMin); break;
    case 'euler2':
      intensities = fromShape(t => {
        if (t <= 0.30) return Math.exp(-4 * (0.30 - t));
        return Math.exp(-3 * (t - 0.30));
      }, numSteps, totalDepth, timeStepMin); break;

    // ── Netherlands ───────────────────────────────────────────────────
    case 'dutch':
      intensities = fromShape(t => 0.6 + 0.4 * gaussian(t, 0.5, 0.20), numSteps, totalDepth, timeStepMin); break;

    // ── Italy ─────────────────────────────────────────────────────────
    case 'italian':
      intensities = fromShape(t => Math.exp(-2.5 * t), numSteps, totalDepth, timeStepMin); break;

    // ── Balanced / Alternating Block ──────────────────────────────────
    case 'balanced':
      intensities = fromShape(t => gaussian(t, 0.5, 0.10), numSteps, totalDepth, timeStepMin); break;
    case 'noaa_a14':
      intensities = fromShape(t => gaussian(t, 0.5, 0.11), numSteps, totalDepth, timeStepMin); break;

    // ── Florida DOT zones ─────────────────────────────────────────────
    case 'fdot1':
      intensities = cumCurve(FDOT1_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'fdot2':
      intensities = cumCurve(FDOT2_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'fdot3':
      intensities = cumCurve(FDOT3_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'fdot4':
      intensities = cumCurve(FDOT4_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'fdot5':
      intensities = cumCurve(FDOT5_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── Texas ─────────────────────────────────────────────────────────
    case 'txdot':
      intensities = fromShape(t => gaussian(t, 0.5, 0.12), numSteps, totalDepth, timeStepMin); break;

    // ── Universal simple shapes ───────────────────────────────────────
    case 'yen_chow':
      intensities = fromShape(t => triShape(t, 0.5), numSteps, totalDepth, timeStepMin); break;

    // ── US regional ───────────────────────────────────────────────────
    case 'udfcd':
      intensities = fromShape(t => gaussian(t, 0.33, 0.08), numSteps, totalDepth, timeStepMin); break;
    case 'usace_sps':
      intensities = fromShape(t => gaussian(t, 0.5, 0.13), numSteps, totalDepth, timeStepMin); break;

    // ── UK ─────────────────────────────────────────────────────────────
    case 'feh':
      intensities = fromShape(t => triShape(t, 0.50), numSteps, totalDepth, timeStepMin); break;

    // ── Canada ─────────────────────────────────────────────────────────
    case 'canadian':
      intensities = fromShape(t => gaussian(t, 0.30, 0.10), numSteps, totalDepth, timeStepMin); break;

    // ── PMP ────────────────────────────────────────────────────────────
    case 'pmp_hmr':
      intensities = fromShape(t => gaussian(t, 0.5, 0.07), numSteps, totalDepth, timeStepMin); break;

    // ── Southeast Asia ────────────────────────────────────────────────
    case 'singapore_pub':
      intensities = fromShape(t => gaussian(t, 0.35, 0.08), numSteps, totalDepth, timeStepMin); break;
    case 'malaysia_msma':
      intensities = fromShape(t => gaussian(t, 0.33, 0.09), numSteps, totalDepth, timeStepMin); break;
    case 'indonesia_bmkg':
      intensities = fromShape(t => gaussian(t, 0.30, 0.07), numSteps, totalDepth, timeStepMin); break;
    case 'philippines_pagasa':
      intensities = fromShape(t => gaussian(t, 0.45, 0.12) + 0.3 * gaussian(t, 0.75, 0.10), numSteps, totalDepth, timeStepMin); break;
    case 'vietnam_imhen':
      intensities = fromShape(t => gaussian(t, 0.45, 0.11), numSteps, totalDepth, timeStepMin); break;
    case 'thailand_tmd':
      intensities = fromShape(t => gaussian(t, 0.38, 0.10), numSteps, totalDepth, timeStepMin); break;

    // ── South Asia ────────────────────────────────────────────────────
    case 'india_imd':
      intensities = fromShape(t => gaussian(t, 0.35, 0.10), numSteps, totalDepth, timeStepMin); break;
    case 'india_coastal':
      intensities = fromShape(t => gaussian(t, 0.35, 0.10) + 0.4 * gaussian(t, 0.70, 0.08), numSteps, totalDepth, timeStepMin); break;

    // ── South Korea ───────────────────────────────────────────────────
    case 'korea_kma':
      intensities = cumCurve(HUFF3_CUM, numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── Middle East / Arid ────────────────────────────────────────────
    case 'saudi_pme':
      intensities = fromShape(t => gaussian(t, 0.25, 0.06), numSteps, totalDepth, timeStepMin); break;
    case 'uae_ncms':
      intensities = fromShape(t => gaussian(t, 0.30, 0.06), numSteps, totalDepth, timeStepMin); break;
    case 'qatar_kahramaa':
      intensities = fromShape(t => gaussian(t, 0.20, 0.05), numSteps, totalDepth, timeStepMin); break;
    case 'oman_dgman':
      intensities = fromShape(t => gaussian(t, 0.22, 0.06), numSteps, totalDepth, timeStepMin); break;

    // ── Africa ─────────────────────────────────────────────────────────
    case 'kenya_kmd':
      intensities = fromShape(t => gaussian(t, 0.40, 0.11), numSteps, totalDepth, timeStepMin); break;
    case 'nigeria_nimet':
      intensities = fromShape(t => gaussian(t, 0.28, 0.08), numSteps, totalDepth, timeStepMin); break;
    case 'egypt_hcww':
      intensities = fromShape(t => gaussian(t, 0.25, 0.07), numSteps, totalDepth, timeStepMin); break;

    // ── Latin America ─────────────────────────────────────────────────
    case 'brazil_ana':
      intensities = fromShape(t => gaussian(t, 0.35, 0.09), numSteps, totalDepth, timeStepMin); break;
    case 'mexico_conagua':
      intensities = fromShape(t => gaussian(t, 0.40, 0.10), numSteps, totalDepth, timeStepMin); break;
    case 'colombia_ideam':
      intensities = fromShape(t => gaussian(t, 0.35, 0.08) + 0.5 * gaussian(t, 0.70, 0.08), numSteps, totalDepth, timeStepMin); break;
    case 'chile_dga':
      intensities = fromShape(t => {
        if (t < 0.3) return 0.2 * t / 0.3;
        return 0.2 + 0.8 * gaussian(t, 0.60, 0.12);
      }, numSteps, totalDepth, timeStepMin); break;

    // ── New Zealand ───────────────────────────────────────────────────
    case 'nz_tp108':
      intensities = fromShape(t => gaussian(t, 0.50, 0.11), numSteps, totalDepth, timeStepMin); break;
    case 'nz_wellington':
      intensities = fromShape(t => {
        if (t < 0.2) return 0.3 * t / 0.2;
        return 0.3 + 0.7 * gaussian(t, 0.55, 0.12);
      }, numSteps, totalDepth, timeStepMin); break;
    case 'nz_christchurch':
      intensities = fromShape(t => gaussian(t, 0.50, 0.15), numSteps, totalDepth, timeStepMin); break;

    // ══════════════════════════════════════════════════════════════════
    // NEW PATTERNS — Design Storm Equations Reference + v2-v12
    // ══════════════════════════════════════════════════════════════════

    // ── European standards ─────────────────────────────────────────────
    case 'sifalda': {
      // Czech 3-block: 14% in 0-34%, 56% in 34-51%, 30% in 51-100%
      const t1End = 0.34, t2End = 0.51;
      intensities = fromShape(t => {
        if (t <= t1End) return 0.14 / t1End;
        if (t <= t2End) return 0.56 / (t2End - t1End);
        return 0.30 / (1 - t2End);
      }, numSteps, totalDepth, timeStepMin); break;
    }
    case 'danish_svk':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.33); break;
    case 'swedish_smhi':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.35); break;
    case 'norwegian_nve':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.40); break;
    case 'finnish_fmi':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.38); break;
    case 'swiss_idf':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.40); break;
    case 'spanish_cedex':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.42); break;
    case 'belgian_irm':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.35); break;

    case 'pilgrim_cordery':
      intensities = cumCurve([[0,0],[0.1,0.04],[0.2,0.10],[0.3,0.20],[0.4,0.38],[0.5,0.60],[0.6,0.76],[0.7,0.86],[0.8,0.93],[0.9,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'watts_curve':
      intensities = cumCurve([[0,0],[0.1,0.03],[0.2,0.08],[0.3,0.18],[0.4,0.35],[0.5,0.55],[0.6,0.72],[0.7,0.84],[0.8,0.92],[0.9,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── Asian standards ───────────────────────────────────────────────
    case 'hong_kong_hko':
      intensities = cumCurve([[0,0],[0.05,0.10],[0.10,0.25],[0.15,0.40],[0.20,0.55],[0.30,0.72],[0.40,0.82],[0.50,0.89],[0.60,0.94],[0.75,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'taiwan_cwa':
      intensities = cumCurve([[0,0],[0.05,0.08],[0.10,0.20],[0.20,0.42],[0.30,0.60],[0.40,0.74],[0.50,0.83],[0.60,0.90],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'bangladesh_bmd':
      intensities = fromShape(t => gaussian(t, 0.40, 0.12), numSteps, totalDepth, timeStepMin); break;
    case 'pakistan_pmd':
      intensities = fromShape(t => gaussian(t, 0.35, 0.10), numSteps, totalDepth, timeStepMin); break;
    case 'sri_lanka':
      intensities = fromShape(t => gaussian(t, 0.38, 0.11), numSteps, totalDepth, timeStepMin); break;
    case 'fiji_fms':
      intensities = fromShape(t => gaussian(t, 0.35, 0.09), numSteps, totalDepth, timeStepMin); break;

    // ── Latin America additional ──────────────────────────────────────
    case 'argentina_smn':
      intensities = fromShape(t => gaussian(t, 0.40, 0.11), numSteps, totalDepth, timeStepMin); break;
    case 'peru_senamhi':
      intensities = fromShape(t => gaussian(t, 0.35, 0.10), numSteps, totalDepth, timeStepMin); break;
    case 'ecuador_inamhi':
      intensities = fromShape(t => gaussian(t, 0.38, 0.10), numSteps, totalDepth, timeStepMin); break;
    case 'venezuela_inameh':
      intensities = fromShape(t => gaussian(t, 0.35, 0.09), numSteps, totalDepth, timeStepMin); break;
    case 'puerto_rico':
      intensities = fromShape(t => gaussian(t, 0.35, 0.08), numSteps, totalDepth, timeStepMin); break;

    // ── Africa additional ─────────────────────────────────────────────
    case 'morocco_dmn':
      intensities = fromShape(t => gaussian(t, 0.30, 0.08), numSteps, totalDepth, timeStepMin); break;
    case 'ethiopia_nma':
      intensities = fromShape(t => gaussian(t, 0.40, 0.11), numSteps, totalDepth, timeStepMin); break;
    case 'ghana_gmet':
      intensities = fromShape(t => gaussian(t, 0.32, 0.09), numSteps, totalDepth, timeStepMin); break;
    case 'tanzania_tma':
      intensities = fromShape(t => gaussian(t, 0.38, 0.10), numSteps, totalDepth, timeStepMin); break;
    case 'mozambique_inam':
      intensities = fromShape(t => gaussian(t, 0.35, 0.10), numSteps, totalDepth, timeStepMin); break;

    // ── NZ / Arid ─────────────────────────────────────────────────────
    case 'hirds_nz':
      intensities = fromShape(t => gaussian(t, 0.50, 0.13), numSteps, totalDepth, timeStepMin); break;
    case 'arid_flash_flood':
      intensities = fromShape(t => gaussian(t, 0.20, 0.05), numSteps, totalDepth, timeStepMin); break;

    // ── v2 patterns ───────────────────────────────────────────────────
    case 'aes_30':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.30); break;
    case 'aes_40':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.40); break;
    case 'kostra_dwd':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.33); break;
    case 'dubai_dm':
      intensities = fromShape(t => gaussian(t, 0.25, 0.06), numSteps, totalDepth, timeStepMin); break;
    case 'abu_dhabi_adm':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.07],[0.30,0.14],[0.40,0.22],[0.45,0.32],[0.50,0.72],[0.55,0.82],[0.60,0.88],[0.70,0.93],[0.80,0.96],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'montana_caquot': {
      // Power-law i(t) = a·t^(-0.66)
      intensities = fromShape(t => {
        const v = Math.pow(Math.max(t, 0.001), -0.66);
        return isFinite(v) ? v : 0;
      }, numSteps, totalDepth, timeStepMin); break;
    }
    case 'm5_60_fsr':
      intensities = cumCurve([[0,0],[0.05,0.02],[0.10,0.05],[0.20,0.14],[0.30,0.28],[0.40,0.55],[0.50,0.78],[0.55,0.86],[0.60,0.90],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'arr2019':
      intensities = cumCurve([[0,0],[0.05,0.03],[0.10,0.07],[0.15,0.13],[0.20,0.22],[0.30,0.40],[0.40,0.58],[0.50,0.72],[0.60,0.82],[0.70,0.90],[0.80,0.95],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'upm_plata':
      intensities = cumCurve([[0,0],[0.05,0.03],[0.10,0.08],[0.20,0.18],[0.30,0.38],[0.35,0.58],[0.40,0.72],[0.50,0.83],[0.60,0.90],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v3 patterns ───────────────────────────────────────────────────
    case 'feh22_refh2':
      intensities = cumCurve([[0,0],[0.10,0.02],[0.20,0.06],[0.30,0.12],[0.40,0.22],[0.45,0.35],[0.50,0.55],[0.55,0.72],[0.60,0.82],[0.70,0.90],[0.80,0.95],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'noaa_a15':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.08],[0.30,0.15],[0.40,0.28],[0.50,0.50],[0.55,0.65],[0.60,0.76],[0.70,0.86],[0.80,0.93],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'eccc_idf':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.10],[0.30,0.18],[0.40,0.30],[0.50,0.52],[0.60,0.70],[0.70,0.82],[0.80,0.91],[0.90,0.96],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'shyreg_fr':
      intensities = cumCurve([[0,0],[0.05,0.02],[0.15,0.08],[0.25,0.22],[0.35,0.45],[0.45,0.65],[0.55,0.78],[0.65,0.87],[0.75,0.93],[0.85,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'ireland_met':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.08],[0.30,0.16],[0.40,0.28],[0.50,0.50],[0.60,0.68],[0.70,0.80],[0.80,0.90],[0.90,0.96],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'arr87_legacy':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.10],[0.30,0.18],[0.40,0.30],[0.50,0.50],[0.60,0.68],[0.70,0.80],[0.80,0.90],[0.90,0.96],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'hk_dsd_2018':
      intensities = cumCurve([[0,0],[0.05,0.10],[0.10,0.25],[0.15,0.40],[0.20,0.55],[0.30,0.72],[0.40,0.82],[0.50,0.89],[0.60,0.94],[0.75,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'malaysia_hp1':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.10],[0.30,0.22],[0.40,0.42],[0.50,0.62],[0.60,0.76],[0.70,0.86],[0.80,0.93],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'austria_okostra':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.33); break;

    // ── v4 patterns ───────────────────────────────────────────────────
    case 'france_shypre':
      intensities = cumCurve([[0,0],[0.05,0.04],[0.10,0.12],[0.20,0.30],[0.30,0.50],[0.40,0.66],[0.50,0.78],[0.60,0.86],[0.70,0.92],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'poland_panda':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.10],[0.30,0.20],[0.40,0.38],[0.50,0.58],[0.60,0.74],[0.70,0.85],[0.80,0.93],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'turkey_mgm':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.38); break;
    case 'israel_ims':
      intensities = cumCurve([[0,0],[0.05,0.08],[0.10,0.18],[0.20,0.42],[0.30,0.60],[0.40,0.72],[0.50,0.81],[0.60,0.88],[0.70,0.93],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'iran_irimo':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.35); break;
    case 'iraq_mos':
      intensities = cumCurve([[0,0],[0.05,0.06],[0.10,0.15],[0.20,0.38],[0.30,0.56],[0.40,0.69],[0.50,0.79],[0.60,0.87],[0.70,0.92],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'kazakhstan_kazhydromet':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.42); break;
    case 'russia_roshydromet':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.40); break;
    case 'portugal_ipma':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.40); break;
    case 'nz_niwa':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.09],[0.30,0.18],[0.40,0.32],[0.50,0.54],[0.60,0.72],[0.70,0.84],[0.80,0.92],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'csa_w231':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.08],[0.30,0.16],[0.40,0.28],[0.45,0.38],[0.50,0.56],[0.55,0.70],[0.60,0.80],[0.70,0.89],[0.80,0.95],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'sa_wrc':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.12],[0.30,0.22],[0.40,0.38],[0.50,0.55],[0.60,0.70],[0.70,0.82],[0.80,0.91],[0.90,0.96],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'west_africa_cilss':
      intensities = cumCurve([[0,0],[0.05,0.10],[0.10,0.25],[0.15,0.40],[0.20,0.55],[0.25,0.65],[0.35,0.78],[0.50,0.88],[0.65,0.94],[0.80,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'noaa_a16':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.08],[0.30,0.16],[0.40,0.28],[0.48,0.48],[0.52,0.62],[0.60,0.76],[0.70,0.86],[0.80,0.93],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'euro_cordex':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.07],[0.30,0.14],[0.40,0.26],[0.48,0.44],[0.52,0.60],[0.60,0.74],[0.70,0.85],[0.80,0.93],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'mongolia_namem':
      intensities = cumCurve([[0,0],[0.05,0.05],[0.10,0.14],[0.20,0.32],[0.30,0.50],[0.40,0.64],[0.50,0.76],[0.60,0.85],[0.70,0.91],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'pacific_sprep':
      intensities = cumCurve([[0,0],[0.05,0.12],[0.10,0.28],[0.15,0.44],[0.20,0.58],[0.30,0.74],[0.40,0.84],[0.50,0.90],[0.60,0.94],[0.75,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'czech_chmu':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.38); break;

    // ── v5 patterns ───────────────────────────────────────────────────
    case 'barbados_bms':
      intensities = cumCurve([[0,0],[0.05,0.09],[0.10,0.22],[0.15,0.38],[0.25,0.58],[0.35,0.72],[0.45,0.82],[0.55,0.89],[0.70,0.95],[0.85,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'oecs_caribbean':
      intensities = cumCurve([[0,0],[0.05,0.07],[0.10,0.18],[0.20,0.38],[0.30,0.55],[0.40,0.68],[0.50,0.79],[0.60,0.87],[0.70,0.93],[0.85,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'cyprus_wdd':
      // Double-triangular Mediterranean: peaks at 25% and 65%
      intensities = fromShape(t => gaussian(t, 0.25, 0.08) + 0.7 * gaussian(t, 0.65, 0.08), numSteps, totalDepth, timeStepMin); break;
    case 'malta_mra':
      intensities = cumCurve([[0,0],[0.05,0.06],[0.10,0.16],[0.18,0.34],[0.28,0.54],[0.32,0.64],[0.40,0.76],[0.50,0.84],[0.60,0.90],[0.75,0.95],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'bolivia_altiplano':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.28],[0.40,0.48],[0.50,0.66],[0.60,0.80],[0.70,0.89],[0.80,0.95],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'fourier_multipeak':
      // Fourier multi-peak: 3 harmonics (clamped to avoid negatives)
      intensities = fromShape(t => Math.max(0.01, 1 + 0.8 * Math.sin(2 * Math.PI * t) + 0.4 * Math.sin(4 * Math.PI * t) + 0.2 * Math.sin(6 * Math.PI * t)), numSteps, totalDepth, timeStepMin); break;
    case 'cc_idf_scaled':
      // Climate-change scaled IDF — intensified peak at 40%
      intensities = fromShape(t => gaussian(t, 0.40, 0.08), numSteps, totalDepth, timeStepMin); break;

    // ── v6 patterns ───────────────────────────────────────────────────
    case 'g2p_gamma':
      // Gamma distribution α=4, β=2
      intensities = fromShape(t => Math.pow(t, 3) * Math.exp(-2 * t) + 0.01, numSteps, totalDepth, timeStepMin); break;
    case 'poland_bs':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.12],[0.30,0.24],[0.40,0.42],[0.50,0.62],[0.60,0.78],[0.70,0.88],[0.80,0.94],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'belgium_willems':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.10],[0.30,0.20],[0.40,0.36],[0.50,0.56],[0.60,0.72],[0.70,0.84],[0.80,0.92],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'russia_snip':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.18],[0.30,0.38],[0.40,0.58],[0.50,0.74],[0.60,0.84],[0.70,0.91],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'turkey_dsi':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.40); break;
    case 'korea_molit':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.10],[0.30,0.20],[0.40,0.38],[0.50,0.60],[0.60,0.76],[0.70,0.86],[0.80,0.93],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'greece_hellenic':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.16],[0.30,0.32],[0.40,0.52],[0.50,0.70],[0.60,0.82],[0.70,0.90],[0.80,0.95],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'romania_stas':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.28],[0.40,0.48],[0.50,0.66],[0.60,0.80],[0.70,0.89],[0.80,0.95],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'pmp_wmo':
      intensities = fromShape(t => gaussian(t, 0.45, 0.06), numSteps, totalDepth, timeStepMin); break;
    case 'nested_envelope':
      intensities = fromShape(t => gaussian(t, 0.50, 0.08), numSteps, totalDepth, timeStepMin); break;

    // ── v7 patterns ───────────────────────────────────────────────────
    case 'arnell_sweden':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.37); break;
    case 'tenax_cds':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.50); break;
    case 'avm':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.45); break;

    // ── v8 — SA SCS Types ─────────────────────────────────────────────
    case 'sa_scs1':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.08],[0.30,0.16],[0.40,0.28],[0.50,0.50],[0.60,0.68],[0.70,0.80],[0.80,0.90],[0.90,0.96],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'sa_scs2':
      intensities = cumCurve([[0,0],[0.10,0.02],[0.20,0.06],[0.30,0.12],[0.40,0.22],[0.50,0.55],[0.60,0.75],[0.70,0.86],[0.80,0.93],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'sa_scs3':
      intensities = cumCurve([[0,0],[0.10,0.02],[0.20,0.05],[0.30,0.10],[0.40,0.18],[0.50,0.45],[0.60,0.72],[0.70,0.85],[0.80,0.93],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'sa_scs4':
      intensities = cumCurve([[0,0],[0.10,0.01],[0.20,0.04],[0.30,0.08],[0.40,0.14],[0.50,0.22],[0.60,0.38],[0.70,0.62],[0.80,0.82],[0.90,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v9 — Dubai DM Combined ────────────────────────────────────────
    case 'dubai_dm_combined': {
      const dxbT = Array.from({length: 101}, (_, i) => i / 100);
      const dxbD = [
        0, 0.0028, 0.0057, 0.0086, 0.0116, 0.0147, 0.0179, 0.0212, 0.0245, 0.0280, 0.0316,
        0.0353, 0.0390, 0.0429, 0.0470, 0.0511, 0.0554, 0.0598, 0.0644, 0.0691, 0.0740,
        0.0791, 0.0843, 0.0898, 0.0954, 0.1013, 0.1074, 0.1137, 0.1203, 0.1272, 0.1344,
        0.1419, 0.1498, 0.1581, 0.1668, 0.1759, 0.1855, 0.1957, 0.2066, 0.2181, 0.2304,
        0.2436, 0.2579, 0.2734, 0.2905, 0.3093, 0.3306, 0.3551, 0.3845, 0.4226, 0.5000,
        0.5774, 0.6155, 0.6449, 0.6694, 0.6907, 0.7095, 0.7266, 0.7421, 0.7564, 0.7696,
        0.7819, 0.7934, 0.8043, 0.8145, 0.8241, 0.8332, 0.8419, 0.8502, 0.8581, 0.8656,
        0.8728, 0.8797, 0.8863, 0.8926, 0.8987, 0.9046, 0.9102, 0.9157, 0.9209, 0.9260,
        0.9309, 0.9356, 0.9402, 0.9446, 0.9489, 0.9530, 0.9571, 0.9610, 0.9647, 0.9684,
        0.9720, 0.9755, 0.9788, 0.9821, 0.9853, 0.9884, 0.9914, 0.9943, 0.9972, 1.0
      ];
      const pts: [number, number][] = dxbT.map((t, i) => [t, dxbD[i]]);
      intensities = cumCurve(pts, numSteps, totalDepth, durationHr, timeStepMin); break;
    }

    // ── v10 — Poland & Eastern Europe ─────────────────────────────────
    case 'atv_a121':
      intensities = cumCurve([[0,0],[1/12,0.02],[2/12,0.05],[3/12,0.09],[4/12,0.15],[5/12,0.24],[6/12,0.34],[7/12,0.62],[8/12,0.78],[9/12,0.87],[10/12,0.93],[11/12,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'dwa_a118':
      intensities = cumCurve([[0,0],[1/12,0.02],[2/12,0.05],[3/12,0.10],[4/12,0.17],[5/12,0.30],[6/12,0.60],[7/12,0.77],[8/12,0.86],[9/12,0.92],[10/12,0.96],[11/12,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'blaszczyk':
      intensities = cumCurve([[0,0],[0.25,0.15],[0.50,0.60],[0.75,0.85],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'imgw_cluster1':
      intensities = cumCurve([[0,0],[0.10,0.22],[0.20,0.52],[0.30,0.68],[0.40,0.78],[0.50,0.85],[0.60,0.90],[0.70,0.93],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'imgw_cluster2':
      intensities = cumCurve([[0,0],[0.10,0.08],[0.20,0.25],[0.30,0.55],[0.40,0.72],[0.50,0.82],[0.60,0.89],[0.70,0.93],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'imgw_cluster3':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.10],[0.30,0.22],[0.40,0.45],[0.50,0.70],[0.60,0.84],[0.70,0.92],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'imgw_cluster4':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.07],[0.30,0.13],[0.40,0.22],[0.50,0.35],[0.60,0.58],[0.70,0.80],[0.80,0.92],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'imgw_cluster5':
      intensities = cumCurve([[0,0],[0.10,0.02],[0.20,0.05],[0.30,0.09],[0.40,0.14],[0.50,0.21],[0.60,0.30],[0.70,0.42],[0.80,0.65],[0.90,0.88],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'wroclaw_2050':
      intensities = cumCurve([[0,0],[0.10,0.08],[0.20,0.28],[0.30,0.60],[0.40,0.78],[0.50,0.87],[0.60,0.92],[0.70,0.95],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'trupl':
      intensities = cumCurve([[0,0],[5/60,0.03],[10/60,0.07],[15/60,0.14],[20/60,0.24],[25/60,0.42],[30/60,0.68],[35/60,0.82],[40/60,0.89],[45/60,0.93],[50/60,0.96],[55/60,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'samaj_valovic':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.12],[0.35,0.20],[0.50,0.65],[0.65,0.90],[0.75,0.95],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'hungarian_msz':
      intensities = cumCurve([[0,0],[0.20,0.10],[0.35,0.30],[0.50,0.70],[0.70,0.90],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'budapest_convective':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.15,0.08],[0.30,0.35],[0.40,0.70],[0.60,0.90],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'owav_rb11':
      intensities = cumCurve([[0,0],[1/12,0.025],[2/12,0.055],[3/12,0.095],[4/12,0.150],[5/12,0.235],[6/12,0.335],[7/12,0.605],[8/12,0.775],[9/12,0.855],[10/12,0.915],[11/12,0.955],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v11 — High-value additions ────────────────────────────────────
    case 'croatian_dhmz':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.32],[0.40,0.62],[0.50,0.80],[0.60,0.89],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'beta_distribution':
      intensities = cumCurve([[0,0],[0.05,0.002],[0.10,0.013],[0.15,0.039],[0.20,0.083],[0.25,0.148],[0.30,0.227],[0.35,0.317],[0.40,0.414],[0.45,0.513],[0.50,0.609],[0.55,0.699],[0.60,0.780],[0.65,0.849],[0.70,0.906],[0.75,0.947],[0.80,0.975],[0.85,0.991],[0.90,0.998],[0.95,1.0],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'cc_clausius': {
      const baseT: [number, number][] = [[0,0],[0.10,0.04],[0.20,0.12],[0.30,0.28],[0.40,0.58],[0.50,0.78],[0.60,0.88],[0.70,0.93],[0.80,0.96],[0.90,0.98],[1,1]];
      // Apply CC scaling: intensify peak region
      const scaledP = baseT.map(([t, p], i) => {
        if (i === 0) return [t, 0] as [number, number];
        if (i === baseT.length - 1) return [t, 1] as [number, number];
        const increment = p - baseT[i - 1][1];
        const peakProximity = 1 + 0.5 * Math.exp(-Math.pow((t - 0.35) / 0.15, 2));
        const newP = baseT[i - 1][1] + increment * peakProximity;
        return [t, newP] as [number, number];
      });
      const maxP = scaledP[scaledP.length - 1][1];
      const normP: [number, number][] = scaledP.map(([t, p]) => [t, p / maxP]);
      intensities = cumCurve(normP, numSteps, totalDepth, durationHr, timeStepMin); break;
    }
    case 'bartlett_lewis':
      intensities = cumCurve([[0,0],[0.05,0.02],[0.10,0.06],[0.15,0.08],[0.20,0.12],[0.25,0.20],[0.30,0.32],[0.35,0.38],[0.40,0.42],[0.45,0.48],[0.50,0.56],[0.55,0.64],[0.60,0.72],[0.65,0.78],[0.70,0.84],[0.75,0.89],[0.80,0.93],[0.85,0.96],[0.90,0.98],[0.95,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'tropical_cyclone':
      intensities = cumCurve([[0,0],[0.05,0.01],[0.10,0.03],[0.15,0.06],[0.20,0.10],[0.25,0.16],[0.30,0.24],[0.35,0.34],[0.40,0.46],[0.45,0.58],[0.50,0.68],[0.55,0.75],[0.60,0.81],[0.65,0.86],[0.70,0.90],[0.75,0.93],[0.80,0.95],[0.85,0.97],[0.90,0.98],[0.95,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'atmospheric_river':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.08],[0.30,0.15],[0.40,0.24],[0.50,0.36],[0.60,0.50],[0.70,0.66],[0.80,0.82],[0.90,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'algeria_anrh':
      intensities = cumCurve([[0,0],[0.10,0.08],[0.20,0.25],[0.30,0.50],[0.40,0.68],[0.50,0.80],[0.60,0.88],[0.70,0.93],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'west_africa_cieh':
      intensities = cumCurve([[0,0],[0.05,0.10],[0.10,0.28],[0.15,0.48],[0.20,0.65],[0.25,0.76],[0.30,0.84],[0.40,0.91],[0.50,0.95],[0.60,0.97],[0.70,0.98],[0.80,0.99],[0.90,1.00],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'portugal_lnec':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.13],[0.30,0.28],[0.40,0.52],[0.50,0.72],[0.60,0.85],[0.70,0.92],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'costa_rica_imn':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.18],[0.30,0.38],[0.40,0.62],[0.50,0.78],[0.60,0.88],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'nepal_dhm':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.12],[0.30,0.25],[0.40,0.48],[0.50,0.72],[0.60,0.86],[0.70,0.93],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'nyc_dep':
      intensities = cumCurve([[0,0],[0.05,0.01],[0.10,0.03],[0.15,0.05],[0.20,0.08],[0.25,0.12],[0.30,0.17],[0.35,0.24],[0.40,0.33],[0.45,0.46],[0.50,0.62],[0.55,0.74],[0.60,0.83],[0.65,0.89],[0.70,0.93],[0.75,0.95],[0.80,0.97],[0.85,0.98],[0.90,0.99],[0.95,1.00],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'post_wildfire':
      intensities = cumCurve([[0,0],[0.05,0.15],[0.10,0.38],[0.15,0.58],[0.20,0.72],[0.25,0.82],[0.30,0.88],[0.40,0.93],[0.50,0.96],[0.60,0.97],[0.70,0.98],[0.80,0.99],[0.90,1.00],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'bimodal_gaussian':
      intensities = fromShape(t => gaussian(t, 0.30, 0.10) + gaussian(t, 0.70, 0.10), numSteps, totalDepth, timeStepMin); break;

    // ── v12 — Eastern Europe ──────────────────────────────────────────
    case 'serbian_rhmz':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.35,0.32],[0.50,0.65],[0.65,0.85],[0.80,0.95],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'bulgarian_nimh':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.13],[0.30,0.28],[0.45,0.58],[0.60,0.78],[0.75,0.90],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'slovenian_arso':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.11],[0.35,0.28],[0.50,0.60],[0.65,0.82],[0.80,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'ukrainian_dbn':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.16],[0.30,0.35],[0.45,0.62],[0.60,0.80],[0.75,0.92],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'lithuanian_hms':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.12],[0.35,0.30],[0.50,0.62],[0.65,0.83],[0.80,0.95],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'latvian_lvgmc':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.12],[0.35,0.30],[0.50,0.62],[0.65,0.83],[0.80,0.95],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'estonian_emhi':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.11],[0.35,0.28],[0.50,0.60],[0.65,0.82],[0.80,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'soviet_snip_legacy':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.18],[0.30,0.38],[0.40,0.60],[0.50,0.76],[0.60,0.86],[0.70,0.92],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'belarusian_tkp':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.16],[0.30,0.34],[0.45,0.62],[0.60,0.80],[0.75,0.92],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v12 — Western & Northern Europe ───────────────────────────────
    case 'icelandic_imo':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.10],[0.30,0.18],[0.40,0.28],[0.50,0.42],[0.60,0.58],[0.70,0.72],[0.80,0.85],[0.90,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'svensson_jones':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.08],[0.30,0.16],[0.40,0.28],[0.50,0.48],[0.60,0.68],[0.70,0.82],[0.80,0.92],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'reunion_mf':
      intensities = cumCurve([[0,0],[0.05,0.03],[0.10,0.08],[0.15,0.16],[0.20,0.28],[0.30,0.50],[0.40,0.66],[0.50,0.78],[0.60,0.87],[0.70,0.93],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'azores_ipma':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.13],[0.35,0.30],[0.50,0.58],[0.65,0.80],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v12 — Middle East ─────────────────────────────────────────────
    case 'jordan_jmd':
      intensities = cumCurve([[0,0],[0.10,0.10],[0.20,0.30],[0.30,0.55],[0.40,0.72],[0.50,0.83],[0.60,0.90],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'lebanon_cav':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.30],[0.40,0.54],[0.50,0.72],[0.60,0.84],[0.70,0.92],[0.80,0.96],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'kuwait_mew':
      intensities = cumCurve([[0,0],[0.05,0.12],[0.10,0.32],[0.15,0.55],[0.25,0.75],[0.35,0.86],[0.50,0.93],[0.70,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'bahrain_met':
      intensities = cumCurve([[0,0],[0.05,0.14],[0.10,0.35],[0.15,0.56],[0.25,0.74],[0.35,0.85],[0.50,0.92],[0.70,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'yemen_cama':
      intensities = cumCurve([[0,0],[0.10,0.12],[0.20,0.30],[0.30,0.52],[0.40,0.70],[0.50,0.82],[0.60,0.90],[0.70,0.95],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v12 — Asia ────────────────────────────────────────────────────
    case 'myanmar_dmh':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.30],[0.50,0.62],[0.65,0.80],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'mekong_mrc':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.12],[0.35,0.28],[0.50,0.55],[0.65,0.78],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'mononobe':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.5); break;
    case 'uzbekistan_uhm':
      intensities = cumCurve([[0,0],[0.10,0.08],[0.20,0.22],[0.30,0.42],[0.40,0.62],[0.50,0.78],[0.60,0.88],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v12 — Africa ──────────────────────────────────────────────────
    case 'tunisia_inm':
      intensities = cumCurve([[0,0],[0.10,0.08],[0.20,0.24],[0.30,0.48],[0.40,0.66],[0.50,0.80],[0.60,0.89],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'uganda_unma':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.12],[0.35,0.30],[0.50,0.60],[0.65,0.82],[0.80,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'cameroon_ird':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.12],[0.35,0.28],[0.50,0.55],[0.65,0.78],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'madagascar_dgm':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.30],[0.50,0.60],[0.65,0.80],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'mauritius_mms':
      intensities = cumCurve([[0,0],[0.10,0.08],[0.20,0.22],[0.30,0.42],[0.40,0.62],[0.55,0.80],[0.70,0.91],[0.85,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'cote_ivoire':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.15],[0.30,0.32],[0.50,0.62],[0.65,0.82],[0.80,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'namibia_nms':
      intensities = cumCurve([[0,0],[0.05,0.12],[0.10,0.30],[0.20,0.55],[0.30,0.72],[0.40,0.83],[0.55,0.91],[0.70,0.96],[0.85,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'sudan_sma':
      intensities = cumCurve([[0,0],[0.10,0.10],[0.20,0.28],[0.30,0.50],[0.40,0.68],[0.50,0.80],[0.60,0.88],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v12 — Central America & Caribbean ─────────────────────────────
    case 'guatemala_insivumeh':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.15],[0.30,0.32],[0.50,0.62],[0.65,0.82],[0.80,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'cuba_insmet':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.30],[0.50,0.60],[0.65,0.80],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'dominican_onamet':
      intensities = cumCurve([[0,0],[0.10,0.07],[0.20,0.18],[0.30,0.36],[0.45,0.62],[0.60,0.80],[0.75,0.92],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'jamaica_msj':
      intensities = cumCurve([[0,0],[0.10,0.07],[0.20,0.20],[0.30,0.40],[0.45,0.64],[0.60,0.82],[0.75,0.93],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'trinidad_tobago':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.30],[0.50,0.60],[0.65,0.80],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'panama_etesa':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.11],[0.35,0.26],[0.50,0.52],[0.65,0.76],[0.80,0.92],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'honduras_smn':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.16],[0.30,0.34],[0.50,0.62],[0.65,0.82],[0.80,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v12 — South America ───────────────────────────────────────────
    case 'paraguay_dmh':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.30],[0.50,0.60],[0.65,0.80],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'uruguay_inumet':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.12],[0.35,0.28],[0.50,0.56],[0.65,0.78],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'sao_paulo_daee':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.16],[0.30,0.34],[0.45,0.62],[0.60,0.80],[0.75,0.92],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'bogota_eaab':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.11],[0.35,0.26],[0.50,0.52],[0.65,0.76],[0.80,0.92],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'lima_senamhi':
      intensities = cumCurve([[0,0],[0.05,0.15],[0.10,0.38],[0.15,0.58],[0.20,0.72],[0.30,0.85],[0.40,0.92],[0.50,0.95],[0.70,0.98],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v12 — Pacific ─────────────────────────────────────────────────
    case 'png_nws':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.12],[0.35,0.28],[0.50,0.55],[0.65,0.78],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'samoa_met':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.30],[0.50,0.60],[0.65,0.80],[0.80,0.93],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'hawaii_distinct':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.11],[0.35,0.26],[0.50,0.52],[0.65,0.76],[0.80,0.92],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v12 — US State & Municipal ────────────────────────────────────
    case 'caltrans':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.09],[0.30,0.18],[0.40,0.32],[0.50,0.52],[0.60,0.70],[0.70,0.84],[0.80,0.93],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'harris_county_fcd':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.12],[0.30,0.25],[0.40,0.45],[0.50,0.68],[0.60,0.82],[0.70,0.91],[0.80,0.96],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'maricopa_fcd':
      intensities = cumCurve([[0,0],[0.05,0.10],[0.10,0.28],[0.20,0.52],[0.30,0.70],[0.40,0.82],[0.55,0.91],[0.70,0.96],[0.85,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'la_county':
      intensities = cumCurve([[0,0],[0.05,0.08],[0.10,0.22],[0.15,0.40],[0.25,0.62],[0.35,0.78],[0.50,0.89],[0.65,0.95],[0.80,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'clark_county_nv':
      intensities = cumCurve([[0,0],[0.05,0.12],[0.10,0.30],[0.20,0.54],[0.30,0.72],[0.40,0.84],[0.55,0.92],[0.70,0.97],[0.85,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'philadelphia_pwd':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.11],[0.30,0.22],[0.40,0.40],[0.50,0.62],[0.60,0.78],[0.70,0.89],[0.80,0.95],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'illinois_b75':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.28],[0.40,0.50],[0.50,0.70],[0.60,0.84],[0.70,0.92],[0.80,0.96],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v12 — Theoretical & Mathematical ──────────────────────────────
    case 'parabolic':
      intensities = fromShape(t => 6 * t * (1 - t), numSteps, totalDepth, timeStepMin); break;
    case 'cosine_storm':
      intensities = fromShape(t => 0.5 * (1 + Math.cos(2 * Math.PI * (t - 0.5))), numSteps, totalDepth, timeStepMin); break;
    case 'lognormal_temporal':
      intensities = fromShape(t => {
        const x = Math.max(0.001, t);
        return (1 / (x * 0.7 * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(Math.log(x) + 0.5, 2) / (2 * 0.49));
      }, numSteps, totalDepth, timeStepMin); break;
    case 'exponential_decay_storm':
      intensities = fromShape(t => Math.exp(-3 * t), numSteps, totalDepth, timeStepMin); break;
    case 'power_curve_storm':
      intensities = fromShape(t => Math.pow(t, 2) * Math.pow(1 - t, 3), numSteps, totalDepth, timeStepMin); break;
    case 'weibull_temporal': {
      const k = 3.6, lam = 0.55;
      intensities = fromShape(t => (k / lam) * Math.pow(t / lam, k - 1) * Math.exp(-Math.pow(t / lam, k)), numSteps, totalDepth, timeStepMin); break;
    }
    case 'instantaneous_burst': {
      intensities = new Array(numSteps).fill(0);
      const peakIdx = Math.floor(numSteps / 2);
      intensities[peakIdx] = totalDepth / (timeStepMin / 60);
      break;
    }
    case 'sigmoid_mass': {
      const sigPts: [number, number][] = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const raw = 1 / (1 + Math.exp(-12 * (t - 0.5)));
        sigPts.push([t, raw]);
      }
      const sigMin = sigPts[0][1], sigMax = sigPts[sigPts.length - 1][1];
      const normSig: [number, number][] = sigPts.map(([t, p]) => [t, (p - sigMin) / (sigMax - sigMin)]);
      intensities = cumCurve(normSig, numSteps, totalDepth, durationHr, timeStepMin); break;
    }

    // ── v12 — Storm Scenarios ─────────────────────────────────────────
    case 'medicane':
      intensities = fromShape(t => gaussian(t, 0.30, 0.12) + 0.7 * gaussian(t, 0.65, 0.10) + 0.15, numSteps, totalDepth, timeStepMin); break;
    case 'polar_low':
      intensities = cumCurve([[0,0],[0.05,0.08],[0.10,0.22],[0.20,0.48],[0.35,0.72],[0.50,0.85],[0.65,0.93],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'cutoff_low':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.10],[0.30,0.18],[0.40,0.28],[0.50,0.40],[0.60,0.55],[0.70,0.72],[0.80,0.86],[0.90,0.95],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'mcs_storm':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.30],[0.50,0.62],[0.65,0.82],[0.80,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'supercell':
      intensities = cumCurve([[0,0],[0.05,0.12],[0.10,0.32],[0.15,0.55],[0.25,0.76],[0.35,0.88],[0.50,0.94],[0.70,0.98],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'orographic_enhanced':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.08],[0.30,0.15],[0.40,0.24],[0.50,0.36],[0.60,0.52],[0.70,0.70],[0.80,0.85],[0.90,0.95],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'urban_heat_island':
      intensities = cumCurve([[0,0],[0.10,0.07],[0.20,0.22],[0.30,0.46],[0.40,0.66],[0.50,0.80],[0.60,0.89],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'monsoon_burst':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.14],[0.30,0.30],[0.55,0.65],[0.70,0.82],[0.85,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'squall_line':
      intensities = cumCurve([[0,0],[0.05,0.15],[0.10,0.38],[0.15,0.58],[0.20,0.72],[0.30,0.84],[0.40,0.91],[0.55,0.95],[0.70,0.98],[0.85,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'sea_breeze':
      intensities = cumCurve([[0,0],[0.10,0.02],[0.20,0.05],[0.30,0.10],[0.40,0.17],[0.50,0.27],[0.60,0.42],[0.70,0.62],[0.80,0.82],[0.90,0.95],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'nocturnal_mcs':
      intensities = cumCurve([[0,0],[0.10,0.02],[0.20,0.06],[0.30,0.12],[0.40,0.20],[0.50,0.32],[0.60,0.50],[0.70,0.70],[0.80,0.86],[0.90,0.96],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'rain_on_snow':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.14],[0.30,0.24],[0.40,0.36],[0.50,0.50],[0.60,0.64],[0.70,0.76],[0.80,0.87],[0.90,0.95],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'derecho':
      intensities = cumCurve([[0,0],[0.05,0.18],[0.10,0.42],[0.15,0.62],[0.20,0.76],[0.30,0.86],[0.40,0.92],[0.55,0.96],[0.70,0.98],[0.85,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    // ── v12 — Climate Change & Stochastic ─────────────────────────────
    case 'ukcp18_enhanced':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.18],[0.30,0.40],[0.40,0.64],[0.50,0.80],[0.60,0.89],[0.70,0.94],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'super_cc':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.16],[0.30,0.38],[0.40,0.66],[0.50,0.82],[0.60,0.90],[0.70,0.95],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'neyman_scott':
      intensities = cumCurve([[0,0],[0.05,0.03],[0.10,0.08],[0.15,0.12],[0.20,0.18],[0.30,0.32],[0.40,0.48],[0.50,0.62],[0.60,0.74],[0.70,0.84],[0.80,0.92],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'temez_spain':
      intensities = chicagoVariant(totalDepth, numSteps, timeStepMin, durationHr, 0.50); break;
    case 'bonta_usda':
      intensities = cumCurve([[0,0],[0.05,0.02],[0.10,0.06],[0.15,0.12],[0.20,0.20],[0.30,0.40],[0.40,0.60],[0.50,0.76],[0.60,0.87],[0.70,0.93],[0.80,0.97],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'georgian_nea':
      intensities = cumCurve([[0,0],[0.05,0.08],[0.10,0.22],[0.15,0.38],[0.20,0.52],[0.30,0.70],[0.40,0.82],[0.50,0.89],[0.60,0.93],[0.70,0.96],[0.80,0.98],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'albanian_igewe':
      intensities = cumCurve([[0,0],[0.05,0.07],[0.10,0.19],[0.15,0.34],[0.20,0.48],[0.30,0.66],[0.40,0.78],[0.50,0.86],[0.60,0.91],[0.70,0.95],[0.80,0.98],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    // v13 — Canadian expansion
    case 'aes_50':
      intensities = cumCurve([[0,0],[0.10,0.03],[0.20,0.07],[0.30,0.14],[0.40,0.26],[0.50,0.55],[0.60,0.74],[0.70,0.86],[0.80,0.93],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'ontario_mto_4hr':
      intensities = cumCurve([[0,0],[0.05,0.04],[0.10,0.10],[0.15,0.20],[0.20,0.38],[0.25,0.58],[0.30,0.72],[0.40,0.83],[0.50,0.89],[0.60,0.93],[0.70,0.96],[0.80,0.98],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'marsalek_1978':
      intensities = cumCurve([[0,0],[0.0625,0.01],[0.125,0.03],[0.1875,0.05],[0.25,0.08],[0.3125,0.12],[0.375,0.18],[0.4375,0.30],[0.50,0.54],[0.5625,0.72],[0.625,0.82],[0.6875,0.88],[0.75,0.92],[0.8125,0.95],[0.875,0.97],[0.9375,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'quebec_melccfp':
      intensities = cumCurve([[0,0],[0.10,0.04],[0.20,0.09],[0.30,0.17],[0.40,0.28],[0.45,0.37],[0.50,0.52],[0.55,0.66],[0.60,0.76],[0.70,0.87],[0.80,0.94],[0.90,0.98],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'alberta_transportation':
      intensities = cumCurve([[0,0],[0.05,0.02],[0.10,0.06],[0.15,0.12],[0.20,0.22],[0.30,0.42],[0.35,0.58],[0.40,0.72],[0.50,0.84],[0.60,0.91],[0.70,0.95],[0.80,0.98],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'prairie_short':
      intensities = cumCurve([[0,0],[0.05,0.06],[0.10,0.18],[0.15,0.35],[0.20,0.52],[0.25,0.65],[0.30,0.75],[0.40,0.85],[0.50,0.91],[0.60,0.94],[0.70,0.96],[0.80,0.98],[0.90,0.99],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'bc_moe_coastal':
      intensities = cumCurve([[0,0],[0.10,0.06],[0.20,0.14],[0.30,0.24],[0.40,0.36],[0.50,0.50],[0.60,0.64],[0.70,0.76],[0.80,0.86],[0.90,0.94],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;
    case 'pilgrim_cordery_ca':
      intensities = cumCurve([[0,0],[0.10,0.05],[0.20,0.13],[0.30,0.25],[0.40,0.42],[0.50,0.60],[0.60,0.74],[0.70,0.85],[0.80,0.92],[0.90,0.97],[1,1]], numSteps, totalDepth, durationHr, timeStepMin); break;

    default: {
      intensities = fromShape(t => gaussian(t, 0.4, 0.12), numSteps, totalDepth, timeStepMin);
      break;
    }
  }

  // Build output with cumulative
  let cumulative = 0;
  return intensities.map((intensity, i) => {
    cumulative += intensity * (timeStepMin / 60);
    return {
      time_min: i * timeStepMin,
      intensity: Math.round(intensity * 10000) / 10000,
      cumulative: Math.round(cumulative * 10000) / 10000,
    };
  });
}

// ── Storm statistics from raw timeseries ────────────────────────────────

function analyzeTimeseries(data: { time_min: number; intensity: number }[]) {
  if (data.length < 2) return null;

  const totalDepth = data.reduce((sum, d, i) => {
    const dt = i > 0 ? (d.time_min - data[i - 1].time_min) / 60 : 0;
    return sum + d.intensity * dt;
  }, 0);
  const duration = data[data.length - 1].time_min - data[0].time_min;
  const peakIntensity = Math.max(...data.map(d => d.intensity));
  const peakIdx = data.findIndex(d => d.intensity === peakIntensity);
  const peakTime = data[peakIdx].time_min;
  const peakPosition = duration > 0 ? (peakTime - data[0].time_min) / duration : 0.5;

  let weightedSum = 0, totalWeight = 0;
  data.forEach((d) => {
    const t = duration > 0 ? (d.time_min - data[0].time_min) / duration : 0;
    weightedSum += t * d.intensity;
    totalWeight += d.intensity;
  });
  const centroid = totalWeight > 0 ? weightedSum / totalWeight : 0.5;

  const quarters = [0, 0, 0, 0];
  data.forEach((d, i) => {
    const t = duration > 0 ? (d.time_min - data[0].time_min) / duration : 0;
    const q = Math.min(Math.floor(t * 4), 3);
    const dt = i > 0 ? (d.time_min - data[i - 1].time_min) / 60 : 0;
    quarters[q] += d.intensity * dt;
  });
  const qTotal = quarters.reduce((a, b) => a + b, 0) || 1;
  const qFractions = quarters.map(q => Math.round((q / qTotal) * 1000) / 10);

  return {
    total_depth: Math.round(totalDepth * 1000) / 1000,
    duration_min: duration,
    peak_intensity: Math.round(peakIntensity * 1000) / 1000,
    peak_time_min: peakTime,
    peak_position: Math.round(peakPosition * 1000) / 1000,
    centroid: Math.round(centroid * 1000) / 1000,
    quartile_fractions_pct: { q1: qFractions[0], q2: qFractions[1], q3: qFractions[2], q4: qFractions[3] },
    dominant_quartile: qFractions.indexOf(Math.max(...qFractions)) + 1,
  };
}

// ── Request router ──────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean).pop() || '';

  try {
    if (path === 'patterns' && req.method === 'GET') {
      const patterns = VALID_PATTERNS.map(p => ({
        id: p,
        ...(patternMeta[p] || { name: p, region: 'Various', description: '' }),
      }));
      return json({ patterns, count: patterns.length });
    }

    if (path === 'generate' && req.method === 'POST') {
      const body = await req.json();
      const { pattern, total_depth, duration_hr, time_step_min } = body;

      if (!pattern || !VALID_PATTERNS.includes(pattern)) {
        return json({ error: `Invalid pattern. Use GET /patterns for the list.` }, 400);
      }
      const depth = Number(total_depth);
      const dur = Number(duration_hr);
      const ts = Number(time_step_min) || 15;

      if (!depth || depth <= 0 || depth > 100) return json({ error: 'total_depth must be 0-100' }, 400);
      if (!dur || dur <= 0 || dur > 72) return json({ error: 'duration_hr must be 0-72' }, 400);
      if (ts < 1 || ts > 360) return json({ error: 'time_step_min must be 1-360' }, 400);

      const data = generateHyetograph(pattern, depth, dur, ts);
      return json({
        pattern,
        total_depth: depth,
        duration_hr: dur,
        time_step_min: ts,
        data_points: data.length,
        data,
      });
    }

    if (path === 'analyze' && req.method === 'POST') {
      const body = await req.json();
      const { data } = body;

      if (!Array.isArray(data) || data.length < 2) {
        return json({ error: 'Provide an array "data" with [{time_min, intensity}, ...] (min 2 points)' }, 400);
      }

      const validated = data.map((d: any) => ({
        time_min: Number(d.time_min),
        intensity: Number(d.intensity),
      }));

      if (validated.some((d: any) => isNaN(d.time_min) || isNaN(d.intensity))) {
        return json({ error: 'Each data point must have numeric time_min and intensity' }, 400);
      }

      const stats = analyzeTimeseries(validated);
      if (!stats) return json({ error: 'Could not analyze data' }, 400);

      return json({ analysis: stats });
    }

    if (!path || path === 'storm-api') {
      return json({
        name: 'Storm API',
        version: '3.0.0',
        patterns_count: VALID_PATTERNS.length,
        endpoints: [
          { method: 'GET',  path: '/storm-api/patterns', description: 'List all available rainfall distribution patterns' },
          { method: 'POST', path: '/storm-api/generate',  description: 'Generate a design-storm hyetograph', body: { pattern: 'scs2', total_depth: 4, duration_hr: 6, time_step_min: 15 } },
          { method: 'POST', path: '/storm-api/analyze',   description: 'Analyze a rainfall timeseries', body: { data: [{ time_min: 0, intensity: 0.5 }, { time_min: 15, intensity: 1.2 }] } },
        ],
      });
    }

    return json({ error: 'Not found. GET /storm-api for docs.' }, 404);
  } catch (err) {
    console.error('Storm API error:', err);
    return json({ error: err instanceof Error ? err.message : 'Internal error' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
