import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateRainfallData, type PatternType as EnginePattern } from "../_shared/rainfallPatterns.ts";
import { PATTERN_IDS, PATTERN_NAMES, CANONICAL_PATTERN_IDS, canonicalPatternId, aliasesOf } from "../_shared/patternCatalog.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ── Pattern catalogue (shared with the web app) ──────────────────────────
// Every id the app knows is accepted; merged duplicates resolve to their canonical pattern.
const VALID_PATTERNS: readonly string[] = PATTERN_IDS;
type PatternType = string;

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
  adamowski_pacific: { name: "Adamowski-Alila Pacific",    region: "Canada BC/Yukon",  description: "Frontal/orographic prolonged rainfall" },
  adamowski_prairie: { name: "Adamowski-Alila Prairie",    region: "Canada Prairies",  description: "Sharp convective peak distribution" },
  adamowski_greatlakes:{ name: "Adamowski-Alila Great Lakes", region: "Canada Ontario", description: "Frontal/convective mix" },
  adamowski_stlawrence:{ name: "Adamowski-Alila St. Lawrence", region: "Canada Quebec", description: "Moderate central peak" },
  adamowski_atlantic:{ name: "Adamowski-Alila Atlantic",   region: "Canada Maritimes", description: "Maritime frontal gradual rainfall" },
  adamowski_northern:{ name: "Adamowski-Alila Northern",   region: "Canada North",     description: "Low intensity uniform spread" },
  winnipeg_maclaren: { name: "Winnipeg MacLaren",          region: "Canada Manitoba",  description: "Modified Chicago r=0.40 for Winnipeg" },
};

// ── Utility helpers ─────────────────────────────────────────────────────

// ── Hyetograph generator ────────────────────────────────────────────────
// Uses the same calculator as the web app, so results match exactly.

function generateHyetograph(
  pattern: PatternType, totalDepth: number, durationHr: number, timeStepMin: number,
): { time_min: number; intensity: number; cumulative: number }[] {
  const intensities = generateRainfallData(canonicalPatternId(pattern) as EnginePattern, totalDepth, durationHr, timeStepMin);
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

  // Each intensity applies over the interval that STARTS at its time stamp (SWMM/HEC convention).
  // The last point is assumed to span the same interval as the one before it.
  const stepOf = (i: number) =>
    i < data.length - 1 ? (data[i + 1].time_min - data[i].time_min) / 60
                        : (data[i].time_min - data[i - 1].time_min) / 60;
  const totalDepth = data.reduce((sum, d, i) => sum + d.intensity * stepOf(i), 0);
  const duration = data[data.length - 1].time_min - data[0].time_min + stepOf(data.length - 1) * 60;
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
    quarters[q] += d.intensity * stepOf(i);
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
      const patterns = CANONICAL_PATTERN_IDS.map(p => ({
        id: p,
        ...(patternMeta[p] || { name: PATTERN_NAMES[p] ?? p, region: 'Various', description: '' }),
        aliases: aliasesOf(p),
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
        pattern: canonicalPatternId(pattern),
        requested_pattern: pattern,
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
        patterns_count: CANONICAL_PATTERN_IDS.length,
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
