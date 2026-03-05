import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, X, ChevronRight, Zap } from "lucide-react";
import { type PatternType } from "@/lib/rainfallPatterns";

export interface RegionInfo {
  id: string;
  name: string;
  description: string;
  patterns: { id: PatternType; name: string; recommended?: boolean }[];
  color: string;
  hoverColor: string;
}

const REGIONS: Record<string, RegionInfo> = {
  us_east: {
    id: "us_east",
    name: "Eastern US",
    description: "Northeast, Southeast & Midwest — convective/frontal storms",
    color: "hsl(210, 60%, 45%)",
    hoverColor: "hsl(210, 70%, 55%)",
    patterns: [
      { id: "scs2", name: "SCS Type II", recommended: true },
      { id: "scs3", name: "SCS Type III" },
      { id: "chicago", name: "Chicago Storm" },
      { id: "huff1", name: "Huff 1st Quartile" },
      { id: "huff2", name: "Huff 2nd Quartile", recommended: true },
      { id: "huff3", name: "Huff 3rd Quartile" },
      { id: "huff4", name: "Huff 4th Quartile" },
      { id: "noaa_a14", name: "NOAA Atlas 14" },
      { id: "noaa_a15", name: "NOAA Atlas 15" },
      { id: "noaa_a16", name: "NOAA Atlas 16" },
      { id: "nyc_dep", name: "NYC DEP" },
      { id: "philadelphia_pwd", name: "Philadelphia PWD" },
      { id: "illinois_b75", name: "Illinois SWS B75" },
      { id: "harris_county_fcd", name: "Harris County FCD" },
    ],
  },
  us_west: {
    id: "us_west",
    name: "Western US",
    description: "Pacific NW, California, Mountain West — maritime & orographic storms",
    color: "hsl(190, 55%, 42%)",
    hoverColor: "hsl(190, 65%, 52%)",
    patterns: [
      { id: "scs1a", name: "SCS Type IA", recommended: true },
      { id: "scs1", name: "SCS Type I", recommended: true },
      { id: "scs2", name: "SCS Type II" },
      { id: "noaa_a14", name: "NOAA Atlas 14" },
      { id: "caltrans", name: "Caltrans CA" },
      { id: "udfcd", name: "UDFCD Denver" },
      { id: "la_county", name: "LA County LACDPW" },
      { id: "clark_county_nv", name: "Clark County NV" },
      { id: "maricopa_fcd", name: "Maricopa FCD" },
      { id: "atmospheric_river", name: "Atmospheric River" },
    ],
  },
  us_gulf: {
    id: "us_gulf",
    name: "Gulf Coast & Florida",
    description: "Tropical influence — sustained rainfall, hurricane risk",
    color: "hsl(170, 50%, 40%)",
    hoverColor: "hsl(170, 60%, 50%)",
    patterns: [
      { id: "scs3", name: "SCS Type III", recommended: true },
      { id: "scs2", name: "SCS Type II" },
      { id: "fdot1", name: "FDOT Zone 1 (NW FL)" },
      { id: "fdot2", name: "FDOT Zone 2 (NE FL)" },
      { id: "fdot3", name: "FDOT Zone 3 (Central FL)" },
      { id: "fdot4", name: "FDOT Zone 4 (SE FL)" },
      { id: "fdot5", name: "FDOT Zone 5 (SW FL)" },
      { id: "txdot", name: "TxDOT" },
      { id: "harris_county_fcd", name: "Harris County FCD" },
      { id: "tropical_cyclone", name: "Tropical Cyclone Rainband" },
    ],
  },
  canada: {
    id: "canada",
    name: "Canada",
    description: "CDA, AES & provincial standards — mixed precipitation",
    color: "hsl(220, 50%, 50%)",
    hoverColor: "hsl(220, 60%, 60%)",
    patterns: [
      { id: "canadian", name: "Canadian CDA", recommended: true },
      { id: "aes_30", name: "AES Canada 30%" },
      { id: "aes_40", name: "AES Canada 40%" },
      { id: "eccc_idf", name: "ECCC IDF", recommended: true },
      { id: "csa_w231", name: "CSA W231" },
      { id: "chicago", name: "Chicago Storm" },
      { id: "scs2", name: "SCS Type II" },
    ],
  },
  western_europe: {
    id: "western_europe",
    name: "Western Europe",
    description: "UK, France, Benelux, Germany, Switzerland — maritime & continental",
    color: "hsl(230, 55%, 52%)",
    hoverColor: "hsl(230, 65%, 62%)",
    patterns: [
      { id: "euler1", name: "Euler Type I", recommended: true },
      { id: "euler2", name: "Euler Type II", recommended: true },
      { id: "feh", name: "FEH (UK)" },
      { id: "feh22_refh2", name: "FEH22/ReFH2" },
      { id: "fsr", name: "FSR Profile" },
      { id: "m5_60_fsr", name: "M5-60 (UK/Ireland)" },
      { id: "desbordes", name: "Desbordes (France)" },
      { id: "desbordes_double", name: "Double Triangle" },
      { id: "shyreg_fr", name: "SHYREG (FR)" },
      { id: "montana_caquot", name: "Montana/Caquot (FR)" },
      { id: "dwa", name: "German DWA" },
      { id: "kostra_dwd", name: "KOSTRA-DWD" },
      { id: "belgian_irm", name: "Belgium IRM" },
      { id: "swiss_idf", name: "Swiss IDF" },
      { id: "dutch", name: "Dutch KNMI" },
      { id: "ireland_met", name: "Ireland Met Éireann" },
      { id: "watts_curve", name: "Watt's Curve (UK)" },
    ],
  },
  eastern_europe: {
    id: "eastern_europe",
    name: "Eastern Europe",
    description: "Poland, Czech, Hungary, Balkans, Baltics — continental climate",
    color: "hsl(250, 45%, 48%)",
    hoverColor: "hsl(250, 55%, 58%)",
    patterns: [
      { id: "sifalda", name: "Sifalda (Czech)", recommended: true },
      { id: "polish_panda" as PatternType, name: "Poland PANDA" },
      { id: "trupl", name: "Trupl (Czech)" },
      { id: "samaj_valovic", name: "Šamaj-Valovič" },
      { id: "hungarian_msz", name: "Hungarian MSZ" },
      { id: "budapest_convective", name: "Budapest Convective" },
      { id: "czech_chmu", name: "Czech CHMU" },
      { id: "croatian_dhmz", name: "Croatian DHMZ" },
      { id: "serbian_rhmz", name: "Serbian RHMZ" },
      { id: "bulgarian_nimh", name: "Bulgarian NIMH" },
      { id: "slovenian_arso", name: "Slovenian ARSO" },
      { id: "romanian_stas" as PatternType, name: "Romania STAS" },
      { id: "georgian_nea", name: "Georgia NEA" },
      { id: "albanian_igewe", name: "Albanian IGEWE" },
    ],
  },
  nordic: {
    id: "nordic",
    name: "Nordic & Baltic",
    description: "Scandinavia, Finland, Iceland — maritime Atlantic influence",
    color: "hsl(205, 50%, 55%)",
    hoverColor: "hsl(205, 60%, 65%)",
    patterns: [
      { id: "danish_svk" as PatternType, name: "Denmark SVK", recommended: true },
      { id: "swedish_smhi" as PatternType, name: "Sweden SMHI" },
      { id: "norwegian_nve" as PatternType, name: "Norway NVE" },
      { id: "finnish_fmi" as PatternType, name: "Finland FMI" },
      { id: "icelandic_imo", name: "Icelandic IMO" },
      { id: "lithuanian_hms", name: "Lithuanian HMS" },
      { id: "latvian_lvgmc", name: "Latvian LVGMC" },
      { id: "estonian_emhi", name: "Estonian EMHI" },
      { id: "arnell_sweden" as PatternType, name: "Arnell (Sweden)" },
    ],
  },
  mediterranean: {
    id: "mediterranean",
    name: "Mediterranean",
    description: "Spain, Italy, Greece, Turkey, Cyprus, Malta — intense convective storms",
    color: "hsl(30, 60%, 50%)",
    hoverColor: "hsl(30, 70%, 60%)",
    patterns: [
      { id: "spanish_cedex", name: "Spain CEDEX", recommended: true },
      { id: "italian", name: "Italian (LSPP)", recommended: true },
      { id: "temez_spain", name: "Témez (Spain)" },
      { id: "greece_hellenic" as PatternType, name: "Greece Hellenic" },
      { id: "cyprus_wdd", name: "Cyprus WDD" },
      { id: "malta_mra", name: "Malta MRA" },
      { id: "portugal_ipma", name: "Portugal IPMA" },
      { id: "portugal_lnec", name: "Portugal LNEC" },
      { id: "turkey_mgm", name: "Turkey MGM" },
      { id: "turkey_dsi", name: "Turkey DSI" },
      { id: "medicane", name: "Medicane" },
    ],
  },
  middle_east: {
    id: "middle_east",
    name: "Middle East",
    description: "Arabian Peninsula, Levant, Iran — arid flash flood risk",
    color: "hsl(40, 55%, 48%)",
    hoverColor: "hsl(40, 65%, 58%)",
    patterns: [
      { id: "saudi_pme", name: "Saudi Arabia PME", recommended: true },
      { id: "uae_ncms", name: "UAE NCMS" },
      { id: "qatar_kahramaa", name: "Qatar Kahramaa" },
      { id: "oman_dgman", name: "Oman DGMAN" },
      { id: "dubai_dm", name: "Dubai Municipality" },
      { id: "dubai_dm_combined", name: "Dubai DM Combined" },
      { id: "abu_dhabi_adm", name: "Abu Dhabi ADM" },
      { id: "israel_ims", name: "Israel IMS" },
      { id: "iran_irimo", name: "Iran IRIMO" },
      { id: "iraq_mos", name: "Iraq MoS" },
      { id: "jordan_jmd", name: "Jordan JMD" },
      { id: "lebanon_cav", name: "Lebanon Civil Aviation" },
      { id: "kuwait_mew", name: "Kuwait MEW" },
      { id: "bahrain_met", name: "Bahrain MET" },
      { id: "yemen_cama", name: "Yemen CAMA" },
      { id: "arid_flash_flood", name: "Arid Flash Flood" },
    ],
  },
  east_asia: {
    id: "east_asia",
    name: "East Asia",
    description: "Japan, Korea, China, Taiwan, Hong Kong — monsoon & typhoon storms",
    color: "hsl(350, 55%, 50%)",
    hoverColor: "hsl(350, 65%, 60%)",
    patterns: [
      { id: "jma", name: "Japan JMA", recommended: true },
      { id: "japan_amedas", name: "Japan AMeDAS" },
      { id: "japan_baiu", name: "Japan Baiu (梅雨)" },
      { id: "japan_typhoon", name: "Japan Typhoon" },
      { id: "mononobe", name: "Mononobe (Japan)" },
      { id: "china", name: "China Design Storm" },
      { id: "china_gb50014", name: "China GB 50014", recommended: true },
      { id: "china_prd", name: "China PRD (Typhoon)" },
      { id: "korea_kma", name: "Korea KMA" },
      { id: "korea_molit", name: "Korea MOLIT" },
      { id: "taiwan_cwa", name: "Taiwan CWA" },
      { id: "hong_kong_hko", name: "Hong Kong HKO" },
      { id: "hk_dsd_2018", name: "HK DSD 2018" },
      { id: "mongolia_namem", name: "Mongolia NAMEM" },
    ],
  },
  southeast_asia: {
    id: "southeast_asia",
    name: "Southeast Asia",
    description: "Tropical maritime — high-intensity monsoon & convective rainfall",
    color: "hsl(160, 50%, 42%)",
    hoverColor: "hsl(160, 60%, 52%)",
    patterns: [
      { id: "singapore_pub", name: "Singapore PUB", recommended: true },
      { id: "malaysia_msma", name: "Malaysia MSMA", recommended: true },
      { id: "malaysia_hp1", name: "Malaysia HP1" },
      { id: "indonesia_bmkg", name: "Indonesia BMKG" },
      { id: "philippines_pagasa", name: "Philippines PAGASA" },
      { id: "vietnam_imhen", name: "Vietnam IMHEN" },
      { id: "thailand_tmd", name: "Thailand TMD" },
      { id: "myanmar_dmh", name: "Myanmar DMH" },
      { id: "mekong_mrc", name: "Mekong MRC" },
    ],
  },
  south_asia: {
    id: "south_asia",
    name: "South Asia",
    description: "India, Pakistan, Bangladesh, Sri Lanka — monsoon-dominated",
    color: "hsl(15, 55%, 48%)",
    hoverColor: "hsl(15, 65%, 58%)",
    patterns: [
      { id: "india_imd", name: "India IMD (Monsoon)", recommended: true },
      { id: "india_coastal", name: "India Coastal" },
      { id: "bangladesh_bmd", name: "Bangladesh BMD" },
      { id: "pakistan_pmd", name: "Pakistan PMD" },
      { id: "sri_lanka", name: "Sri Lanka" },
      { id: "nepal_dhm", name: "Nepal DHM" },
      { id: "monsoon_burst", name: "Monsoon Burst" },
    ],
  },
  north_africa: {
    id: "north_africa",
    name: "North & West Africa",
    description: "Sahel, Mediterranean coast, tropical West Africa",
    color: "hsl(45, 50%, 45%)",
    hoverColor: "hsl(45, 60%, 55%)",
    patterns: [
      { id: "morocco_dmn", name: "Morocco DMN", recommended: true },
      { id: "algeria_anrh", name: "Algeria ANRH" },
      { id: "tunisia_inm", name: "Tunisia INM" },
      { id: "egypt_hcww", name: "Egypt HCWW" },
      { id: "nigeria_nimet", name: "Nigeria NiMet" },
      { id: "ghana_gmet", name: "Ghana GMet" },
      { id: "west_africa_cilss", name: "West Africa CILSS" },
      { id: "west_africa_cieh", name: "West Africa CIEH" },
      { id: "cote_ivoire", name: "Côte d'Ivoire SODEXAM" },
      { id: "cameroon_ird", name: "Cameroon IRD" },
    ],
  },
  east_africa: {
    id: "east_africa",
    name: "East & Southern Africa",
    description: "Tropical highlands, savanna — bimodal rainy seasons",
    color: "hsl(25, 50%, 42%)",
    hoverColor: "hsl(25, 60%, 52%)",
    patterns: [
      { id: "sa_sanral", name: "SA SANRAL", recommended: true },
      { id: "kenya_kmd", name: "Kenya KMD" },
      { id: "ethiopia_nma", name: "Ethiopia NMA" },
      { id: "tanzania_tma", name: "Tanzania TMA" },
      { id: "uganda_unma", name: "Uganda UNMA" },
      { id: "mozambique_inam", name: "Mozambique INAM" },
      { id: "madagascar_dgm", name: "Madagascar DGM" },
      { id: "mauritius_mms", name: "Mauritius MMS" },
      { id: "namibia_nms", name: "Namibia NMS" },
      { id: "sudan_sma", name: "Sudan SMA" },
      { id: "sa_wrc", name: "SA WRC" },
      { id: "sa_scs1", name: "SA SCS Type 1" },
      { id: "sa_scs2", name: "SA SCS Type 2" },
    ],
  },
  south_america: {
    id: "south_america",
    name: "South America",
    description: "Tropical to temperate — diverse orographic & convective patterns",
    color: "hsl(140, 45%, 42%)",
    hoverColor: "hsl(140, 55%, 52%)",
    patterns: [
      { id: "brazil_ana", name: "Brazil ANA", recommended: true },
      { id: "sao_paulo_daee", name: "São Paulo DAEE" },
      { id: "colombia_ideam", name: "Colombia IDEAM" },
      { id: "bogota_eaab", name: "Bogotá EAAB" },
      { id: "chile_dga", name: "Chile DGA" },
      { id: "argentina_smn", name: "Argentina SMN" },
      { id: "peru_senamhi", name: "Peru SENAMHI" },
      { id: "lima_senamhi", name: "Lima SENAMHI" },
      { id: "ecuador_inamhi", name: "Ecuador INAMHI" },
      { id: "venezuela_inameh", name: "Venezuela INAMEH" },
      { id: "bolivia_altiplano", name: "Bolivia Altiplano" },
      { id: "upm_plata", name: "UPM Río de la Plata" },
      { id: "paraguay_dmh", name: "Paraguay DMH" },
      { id: "uruguay_inumet", name: "Uruguay INUMET" },
    ],
  },
  central_america: {
    id: "central_america",
    name: "Central America & Caribbean",
    description: "Tropical storms, hurricanes — intense short-duration rainfall",
    color: "hsl(155, 45%, 40%)",
    hoverColor: "hsl(155, 55%, 50%)",
    patterns: [
      { id: "mexico_conagua", name: "Mexico CONAGUA", recommended: true },
      { id: "costa_rica_imn", name: "Costa Rica IMN" },
      { id: "guatemala_insivumeh", name: "Guatemala INSIVUMEH" },
      { id: "panama_etesa", name: "Panama ETESA" },
      { id: "honduras_smn", name: "Honduras SMN" },
      { id: "cuba_insmet", name: "Cuba INSMET" },
      { id: "dominican_onamet", name: "Dominican ONAMET" },
      { id: "jamaica_msj", name: "Jamaica MSJ" },
      { id: "trinidad_tobago", name: "Trinidad & Tobago" },
      { id: "puerto_rico", name: "Puerto Rico" },
      { id: "barbados_bms", name: "Barbados BMS" },
      { id: "oecs_caribbean", name: "OECS Caribbean" },
    ],
  },
  oceania: {
    id: "oceania",
    name: "Oceania & Pacific",
    description: "Australia, New Zealand, Pacific Islands — varied maritime climates",
    color: "hsl(195, 50%, 45%)",
    hoverColor: "hsl(195, 60%, 55%)",
    patterns: [
      { id: "arr", name: "Australian ARR", recommended: true },
      { id: "arr2019", name: "ARR 2019 Ensemble" },
      { id: "arr87_legacy", name: "ARR87 Legacy" },
      { id: "pilgrim_cordery", name: "Pilgrim-Cordery" },
      { id: "nz_tp108", name: "Auckland TP108" },
      { id: "nz_wellington", name: "Wellington Regional" },
      { id: "nz_christchurch", name: "Christchurch Canterbury" },
      { id: "nz_niwa", name: "NZ NIWA" },
      { id: "hirds_nz", name: "HIRDS NZ", recommended: true },
      { id: "fiji_fms", name: "Fiji FMS" },
      { id: "samoa_met", name: "Samoa MET" },
      { id: "png_nws", name: "Papua New Guinea NWS" },
      { id: "pacific_sprep", name: "Pacific SPREP" },
      { id: "hawaii_distinct", name: "Hawaii Distinct" },
    ],
  },
  russia_ca: {
    id: "russia_ca",
    name: "Russia & Central Asia",
    description: "Continental extremes — Soviet-era & modern standards",
    color: "hsl(270, 40%, 48%)",
    hoverColor: "hsl(270, 50%, 58%)",
    patterns: [
      { id: "russia_roshydromet", name: "Russia Roshydromet", recommended: true },
      { id: "russia_snip", name: "Russia SNiP" },
      { id: "soviet_snip_legacy", name: "Soviet SNiP Legacy" },
      { id: "belarusian_tkp", name: "Belarusian TKP" },
      { id: "ukrainian_dbn", name: "Ukrainian DBN" },
      { id: "kazakhstan_kazhydromet", name: "Kazakhstan Kazhydromet" },
      { id: "uzbekistan_uhm", name: "Uzbekistan UHM" },
    ],
  },
};

// ── Realistic continent silhouettes (Robinson-style projection) ──────
// viewBox: 80 40 660 330 → x: 80–740, y: 40–370
// Mapping: x = 80 + (lon+180)*1.833, y = 40 + (90-lat)*2.2

const CONTINENT_OUTLINES: { id: string; d: string }[] = [
  // North America (Alaska → Pacific coast → Mexico → Gulf → Florida → East coast → Canada → Arctic)
  {
    id: "north_america",
    d: "M 102 90 L 110 84 L 126 88 L 135 95 L 140 88 L 155 82 L 163 80 L 172 78 L 182 80 L 190 84 L 200 82 L 210 84 L 218 82 L 230 86 L 242 90 L 255 88 L 265 92 L 275 98 L 282 105 L 290 110 L 298 118 L 305 125 L 310 122 L 305 117 L 298 110 L 290 105 L 280 100 L 270 96 L 265 100 L 260 106 L 255 112 L 250 108 L 245 110 L 240 105 L 235 108 L 232 112 L 228 108 L 225 104 L 220 100 L 215 98 L 210 100 L 205 98 L 200 100 L 195 105 L 192 110 L 190 115 L 188 120 L 186 125 L 183 130 L 180 138 L 178 145 L 176 150 L 178 155 L 182 152 L 186 155 L 190 160 L 194 163 L 197 168 L 200 172 L 205 178 L 210 184 L 215 190 L 220 194 L 225 198 L 230 200 L 238 204 L 244 207 L 248 204 L 245 198 L 242 194 L 240 188 L 242 184 L 245 180 L 248 175 L 252 172 L 258 172 L 262 175 L 266 180 L 268 184 L 268 180 L 266 175 L 264 170 L 262 165 L 264 160 L 268 155 L 272 150 L 276 148 L 280 145 L 285 140 L 290 136 L 295 134 L 300 132 L 305 128 Z",
  },
  // Greenland
  {
    id: "greenland",
    d: "M 310 72 L 320 68 L 335 62 L 348 58 L 360 55 L 370 58 L 375 65 L 372 72 L 365 78 L 355 82 L 340 84 L 325 82 L 315 78 Z",
  },
  // South America
  {
    id: "south_america",
    d: "M 260 218 L 265 222 L 268 228 L 270 235 L 274 240 L 280 242 L 288 240 L 296 238 L 305 240 L 315 242 L 325 244 L 335 246 L 342 248 L 345 252 L 344 258 L 342 265 L 340 272 L 338 278 L 335 284 L 332 290 L 328 296 L 324 302 L 318 308 L 312 312 L 306 316 L 300 320 L 294 325 L 288 332 L 284 338 L 280 345 L 278 350 L 275 355 L 272 350 L 270 342 L 268 335 L 270 328 L 272 320 L 271 312 L 268 305 L 266 298 L 264 290 L 262 282 L 260 274 L 258 265 L 256 258 L 255 250 L 256 242 L 258 234 L 260 226 Z",
  },
  // Central America & Caribbean
  {
    id: "central_america_land",
    d: "M 215 194 L 220 196 L 225 198 L 230 200 L 238 204 L 244 207 L 248 210 L 252 214 L 256 216 L 258 218 L 260 218 L 258 215 L 255 212 L 252 210 L 248 207 L 244 205 L 240 202 L 235 200 L 230 198 L 225 196 L 220 194 Z",
  },
  // Europe (Iberia → France → Scandinavia → Baltic → Balkans → back)
  {
    id: "europe",
    d: "M 388 155 L 390 160 L 395 158 L 400 160 L 406 155 L 410 150 L 414 148 L 418 145 L 420 142 L 425 140 L 428 142 L 432 146 L 435 150 L 438 154 L 440 158 L 438 162 L 435 158 L 432 155 L 430 158 L 433 162 L 436 165 L 440 162 L 444 158 L 448 155 L 452 152 L 456 148 L 460 145 L 465 142 L 470 138 L 475 132 L 478 128 L 475 122 L 470 118 L 465 112 L 460 108 L 455 102 L 450 96 L 445 92 L 440 88 L 435 85 L 430 82 L 425 84 L 420 88 L 415 92 L 412 98 L 408 105 L 404 110 L 400 112 L 396 108 L 392 112 L 390 118 L 388 122 L 392 125 L 396 128 L 400 130 L 404 132 L 406 135 L 404 138 L 400 140 L 396 142 L 392 145 L 390 148 L 388 152 Z",
  },
  // British Isles
  {
    id: "british_isles",
    d: "M 392 108 L 396 105 L 400 102 L 403 105 L 404 110 L 400 112 L 396 108 Z M 386 112 L 390 108 L 392 112 L 390 118 L 386 115 Z",
  },
  // Africa
  {
    id: "africa",
    d: "M 390 190 L 395 188 L 400 186 L 408 185 L 415 184 L 422 184 L 430 185 L 438 186 L 445 188 L 452 190 L 458 192 L 465 194 L 470 196 L 475 200 L 478 205 L 480 210 L 482 216 L 484 222 L 486 228 L 488 235 L 490 242 L 490 248 L 488 255 L 486 262 L 482 268 L 478 274 L 474 280 L 470 286 L 466 292 L 462 298 L 458 302 L 454 308 L 450 312 L 446 316 L 442 318 L 438 316 L 436 312 L 434 306 L 432 300 L 430 294 L 428 288 L 425 282 L 422 276 L 418 270 L 415 264 L 412 258 L 408 252 L 405 246 L 402 240 L 400 234 L 398 228 L 396 222 L 394 216 L 392 210 L 390 204 L 389 198 Z",
  },
  // Asia (massive - Turkey → Middle East → India → SE Asia → China → Siberia → Urals)
  {
    id: "asia",
    d: "M 475 132 L 480 128 L 488 120 L 496 112 L 505 105 L 515 98 L 525 92 L 535 86 L 548 80 L 560 75 L 575 70 L 590 66 L 605 64 L 620 62 L 635 62 L 650 65 L 660 70 L 668 78 L 672 86 L 675 95 L 676 105 L 672 115 L 668 122 L 665 128 L 660 135 L 655 142 L 650 148 L 648 155 L 652 158 L 658 160 L 662 165 L 660 170 L 655 172 L 650 168 L 645 170 L 642 175 L 640 180 L 636 185 L 632 190 L 628 195 L 625 200 L 622 205 L 618 210 L 614 215 L 610 220 L 605 222 L 600 225 L 596 228 L 592 232 L 588 235 L 585 230 L 580 225 L 575 228 L 570 232 L 565 228 L 560 225 L 555 222 L 550 220 L 545 222 L 540 225 L 535 228 L 530 225 L 526 220 L 524 215 L 522 210 L 520 205 L 518 200 L 520 195 L 524 190 L 528 185 L 532 182 L 536 178 L 540 175 L 545 172 L 548 168 L 545 164 L 540 162 L 535 165 L 530 168 L 525 170 L 520 172 L 515 175 L 510 178 L 505 180 L 500 182 L 496 184 L 492 186 L 488 188 L 485 185 L 482 180 L 480 175 L 478 170 L 476 165 L 475 160 L 474 155 L 472 148 L 470 142 L 472 138 L 475 135 Z",
  },
  // Indian subcontinent
  {
    id: "india",
    d: "M 530 175 L 535 172 L 540 168 L 545 165 L 550 168 L 552 172 L 548 178 L 545 185 L 540 192 L 535 200 L 530 208 L 528 215 L 530 222 L 525 225 L 520 220 L 518 212 L 520 205 L 522 198 L 524 190 L 528 185 L 530 180 Z",
  },
  // Arabian Peninsula
  {
    id: "arabia",
    d: "M 475 200 L 480 196 L 488 192 L 495 190 L 500 192 L 506 195 L 510 198 L 515 202 L 518 208 L 515 215 L 510 218 L 505 220 L 498 218 L 492 215 L 486 212 L 480 208 L 476 205 Z",
  },
  // Japan
  {
    id: "japan",
    d: "M 662 130 L 665 125 L 668 128 L 672 135 L 670 142 L 666 148 L 662 145 L 660 140 L 661 135 Z M 656 148 L 660 145 L 662 150 L 660 155 L 656 152 Z",
  },
  // Southeast Asian islands (Indonesia, Philippines, etc.)
  {
    id: "se_asia_islands",
    d: "M 618 225 L 625 222 L 632 225 L 638 228 L 645 232 L 650 235 L 655 232 L 660 235 L 665 240 L 660 244 L 654 242 L 648 240 L 642 242 L 635 245 L 628 248 L 622 250 L 618 246 L 615 240 L 616 232 Z M 640 248 L 648 246 L 655 250 L 662 255 L 665 260 L 660 262 L 652 260 L 645 258 L 640 254 Z M 668 248 L 675 245 L 680 250 L 682 258 L 678 262 L 672 260 L 668 255 Z",
  },
  // Australia
  {
    id: "australia",
    d: "M 638 285 L 650 278 L 662 275 L 674 278 L 685 282 L 694 288 L 700 296 L 702 305 L 700 315 L 695 322 L 688 328 L 680 330 L 672 328 L 665 325 L 658 322 L 652 318 L 648 312 L 645 305 L 642 298 L 640 292 Z",
  },
  // New Zealand
  {
    id: "new_zealand",
    d: "M 712 318 L 716 314 L 720 318 L 718 325 L 714 328 L 712 324 Z M 714 330 L 718 328 L 720 332 L 718 338 L 714 335 Z",
  },
];

// Interactive region overlay paths — positioned to match continent geography
const REGION_PATHS: Record<string, string> = {
  us_east: "M 262 100 L 275 98 L 285 105 L 290 115 L 298 118 L 305 125 L 300 132 L 290 136 L 280 145 L 272 150 L 268 155 L 264 165 L 262 170 L 258 172 L 254 172 L 248 175 L 245 180 L 245 172 L 252 165 L 258 155 L 260 145 L 258 135 L 255 125 L 255 112 L 258 105 Z",
  us_west: "M 176 100 L 192 98 L 200 100 L 210 100 L 220 100 L 232 104 L 242 108 L 255 112 L 255 125 L 258 135 L 258 145 L 252 155 L 248 160 L 242 165 L 235 170 L 228 175 L 220 180 L 215 185 L 210 184 L 205 178 L 200 172 L 194 163 L 186 155 L 182 145 L 180 138 L 178 130 L 176 120 L 175 110 Z",
  us_gulf: "M 215 185 L 225 190 L 235 196 L 242 194 L 245 188 L 245 180 L 248 175 L 252 172 L 258 172 L 262 175 L 266 180 L 268 184 L 266 188 L 260 190 L 255 192 L 248 195 L 240 200 L 235 200 L 228 198 L 220 194 Z",
  canada: "M 105 82 L 135 72 L 165 68 L 190 70 L 210 72 L 230 76 L 250 82 L 265 88 L 275 95 L 262 100 L 255 105 L 242 100 L 232 98 L 220 96 L 210 95 L 200 96 L 190 95 L 176 100 L 175 110 L 170 105 L 160 98 L 148 92 L 135 88 L 120 85 L 108 84 Z",
  western_europe: "M 386 98 L 396 95 L 404 98 L 408 105 L 412 110 L 415 118 L 418 125 L 420 132 L 418 138 L 414 142 L 410 148 L 406 155 L 400 160 L 395 158 L 390 155 L 388 148 L 390 142 L 392 135 L 396 130 L 400 125 L 398 118 L 394 112 L 390 108 L 386 105 Z",
  eastern_europe: "M 420 88 L 435 85 L 445 92 L 455 102 L 460 108 L 465 118 L 468 128 L 470 138 L 465 142 L 460 148 L 455 152 L 448 155 L 440 158 L 435 155 L 432 148 L 428 142 L 425 138 L 420 135 L 418 128 L 416 120 L 418 112 L 420 98 Z",
  nordic: "M 400 78 L 415 72 L 428 75 L 435 80 L 440 85 L 445 90 L 450 96 L 445 98 L 440 95 L 435 92 L 428 90 L 420 88 L 415 92 L 410 98 L 404 102 L 400 95 L 398 88 Z",
  mediterranean: "M 388 155 L 400 160 L 410 155 L 418 152 L 425 155 L 432 158 L 438 162 L 444 165 L 450 162 L 456 158 L 462 155 L 468 160 L 475 165 L 478 170 L 475 175 L 468 178 L 460 180 L 450 178 L 440 175 L 430 172 L 420 170 L 410 168 L 402 165 L 395 162 L 390 160 Z",
  middle_east: "M 468 178 L 478 175 L 485 180 L 492 186 L 498 190 L 505 195 L 510 200 L 515 208 L 510 215 L 505 218 L 498 215 L 492 210 L 486 205 L 480 200 L 476 195 L 472 190 L 468 185 Z",
  east_asia: "M 610 70 L 625 68 L 640 70 L 655 75 L 665 82 L 672 92 L 675 102 L 672 115 L 668 125 L 665 132 L 660 140 L 655 148 L 650 155 L 645 162 L 640 168 L 635 172 L 628 175 L 620 172 L 612 168 L 605 162 L 600 155 L 596 148 L 594 140 L 592 132 L 590 122 L 592 112 L 595 102 L 600 92 L 605 82 Z",
  southeast_asia: "M 590 195 L 600 190 L 610 192 L 618 198 L 625 205 L 630 212 L 635 220 L 640 228 L 648 235 L 658 238 L 668 240 L 675 245 L 678 252 L 672 258 L 662 260 L 650 255 L 640 250 L 630 248 L 620 248 L 612 245 L 608 238 L 602 230 L 596 222 L 592 215 L 590 205 Z",
  south_asia: "M 520 172 L 530 168 L 540 165 L 550 168 L 555 175 L 548 185 L 540 195 L 535 205 L 530 215 L 525 222 L 518 218 L 515 210 L 518 200 L 522 192 L 525 185 L 522 178 Z",
  north_africa: "M 388 190 L 400 186 L 415 184 L 430 185 L 445 188 L 458 192 L 468 196 L 468 205 L 465 215 L 460 225 L 450 235 L 440 240 L 430 242 L 420 240 L 410 235 L 402 228 L 396 220 L 392 212 L 390 202 Z",
  east_africa: "M 440 240 L 455 235 L 468 240 L 478 248 L 485 258 L 488 268 L 486 278 L 482 288 L 475 296 L 468 302 L 458 308 L 450 312 L 442 316 L 436 312 L 432 302 L 430 292 L 428 282 L 430 272 L 432 262 L 435 252 Z",
  south_america: "M 258 218 L 268 222 L 274 230 L 280 240 L 300 238 L 320 242 L 340 248 L 345 255 L 342 268 L 338 280 L 332 292 L 324 304 L 312 314 L 300 322 L 290 332 L 282 342 L 276 352 L 270 345 L 268 335 L 270 325 L 268 315 L 265 305 L 262 295 L 260 282 L 258 268 L 256 255 L 255 242 L 256 230 Z",
  central_america: "M 200 195 L 212 198 L 220 202 L 230 206 L 240 210 L 248 214 L 255 218 L 258 218 L 256 222 L 248 220 L 240 216 L 232 212 L 222 208 L 212 204 L 204 200 Z",
  oceania: "M 636 278 L 652 274 L 668 276 L 682 282 L 694 290 L 702 302 L 700 315 L 692 325 L 682 330 L 670 328 L 658 322 L 648 314 L 642 305 L 640 295 L 638 285 Z",
  russia_ca: "M 475 68 L 500 62 L 530 58 L 560 56 L 590 58 L 610 62 L 605 72 L 600 82 L 595 92 L 592 102 L 590 112 L 588 120 L 580 128 L 570 132 L 558 135 L 545 135 L 530 132 L 518 128 L 508 122 L 498 115 L 490 108 L 484 100 L 480 92 L 476 82 Z",
};

interface WorldMapSelectorProps {
  onPatternSelect?: (patternId: PatternType) => void;
}

export function WorldMapSelector({ onPatternSelect }: WorldMapSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const handleRegionClick = useCallback((regionId: string) => {
    setSelectedRegion(prev => prev === regionId ? null : regionId);
  }, []);

  const region = selectedRegion ? REGIONS[selectedRegion] : null;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-primary" />
            World Rainfall Pattern Map
          </CardTitle>
          <CardDescription>
            Click a region to see recommended rainfall distributions for that area
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* SVG Map */}
          <div className="relative bg-[hsl(215,30%,10%)] overflow-hidden rounded-b-lg">
            <svg
              viewBox="80 40 660 330"
              className="w-full h-auto"
              style={{ minHeight: 300 }}
            >
              {/* Deep ocean */}
              <defs>
                <radialGradient id="ocean-glow" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="hsl(215, 35%, 14%)" />
                  <stop offset="100%" stopColor="hsl(215, 30%, 8%)" />
                </radialGradient>
              </defs>
              <rect x="80" y="40" width="660" height="330" fill="url(#ocean-glow)" />

              {/* Subtle latitude / longitude grid */}
              {[90, 120, 150, 180, 210, 240, 270, 300, 330, 360].map(y => (
                <line key={`h${y}`} x1="80" y1={y} x2="740" y2={y} stroke="hsl(215, 20%, 14%)" strokeWidth="0.4" />
              ))}
              {[120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720].map(x => (
                <line key={`v${x}`} x1={x} y1="40" x2={x} y2="370" stroke="hsl(215, 20%, 14%)" strokeWidth="0.4" />
              ))}

              {/* Equator & Tropics */}
              <line x1="80" y1="238" x2="740" y2="238" stroke="hsl(215, 15%, 20%)" strokeWidth="0.8" strokeDasharray="6 3" />
              <line x1="80" y1="188" x2="740" y2="188" stroke="hsl(215, 15%, 16%)" strokeWidth="0.4" strokeDasharray="3 4" opacity="0.5" />
              <line x1="80" y1="288" x2="740" y2="288" stroke="hsl(215, 15%, 16%)" strokeWidth="0.4" strokeDasharray="3 4" opacity="0.5" />
              <text x="744" y="241" fill="hsl(215, 15%, 25%)" fontSize="7" fontFamily="monospace">0°</text>
              <text x="744" y="191" fill="hsl(215, 15%, 20%)" fontSize="6" fontFamily="monospace">23°N</text>
              <text x="744" y="291" fill="hsl(215, 15%, 20%)" fontSize="6" fontFamily="monospace">23°S</text>

              {/* ── Continent silhouettes (background land) ── */}
              {CONTINENT_OUTLINES.map(c => (
                <path
                  key={c.id}
                  d={c.d}
                  fill="hsl(215, 12%, 18%)"
                  stroke="hsl(215, 12%, 22%)"
                  strokeWidth="0.6"
                  className="pointer-events-none"
                />
              ))}

              {/* ── Interactive region overlays ── */}
              {Object.entries(REGION_PATHS).map(([id, path]) => {
                const regionData = REGIONS[id];
                if (!regionData) return null;
                const isSelected = selectedRegion === id;
                const isHovered = hoveredRegion === id;
                const fillColor = isSelected
                  ? regionData.hoverColor
                  : isHovered
                  ? regionData.hoverColor
                  : regionData.color;

                return (
                  <g key={id}>
                    <path
                      d={path}
                      fill={fillColor}
                      fillOpacity={isSelected ? 0.85 : isHovered ? 0.7 : 0.35}
                      stroke={isSelected ? "hsl(0, 0%, 95%)" : isHovered ? "hsl(0, 0%, 80%)" : "hsl(215, 12%, 28%)"}
                      strokeWidth={isSelected ? 1.8 : isHovered ? 1.2 : 0.5}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => handleRegionClick(id)}
                      onMouseEnter={() => setHoveredRegion(id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      style={{ filter: isSelected ? "drop-shadow(0 0 6px rgba(255,255,255,0.2))" : undefined }}
                    />
                    {/* Region label on hover/select */}
                    {(isHovered || isSelected) && (
                      <text
                        x={getRegionCenter(path).x}
                        y={getRegionCenter(path).y}
                        textAnchor="middle"
                        fill="white"
                        fontSize="8"
                        fontWeight="600"
                        className="pointer-events-none select-none"
                        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
                      >
                        {regionData.name}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Pulsing dot on selected region */}
              {selectedRegion && region && (
                <circle
                  cx={getRegionCenter(REGION_PATHS[selectedRegion]).x}
                  cy={getRegionCenter(REGION_PATHS[selectedRegion]).y - 12}
                  r="3.5"
                  fill="white"
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* Badges */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                {Object.keys(REGIONS).length} regions
              </Badge>
              <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                {Object.values(REGIONS).reduce((acc, r) => acc + r.patterns.length, 0)} patterns mapped
              </Badge>
            </div>

            {/* Hover tooltip */}
            {hoveredRegion && !selectedRegion && REGIONS[hoveredRegion] && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium text-sm">{REGIONS[hoveredRegion].name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {REGIONS[hoveredRegion].patterns.length} patterns
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{REGIONS[hoveredRegion].description}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Selected region detail panel */}
      {region && (
        <Card className="animate-in slide-in-from-top-2 duration-300 border-primary/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5" style={{ color: region.hoverColor }} />
                  {region.name}
                </CardTitle>
                <CardDescription>{region.description}</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedRegion(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recommended */}
            {region.patterns.some(p => p.recommended) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold">Recommended</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {region.patterns.filter(p => p.recommended).map(p => (
                    <button
                      key={p.id}
                      onClick={() => onPatternSelect?.(p.id)}
                      className="flex items-center justify-between p-3 rounded-lg border-2 border-primary/40 bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-sm font-medium">{p.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All patterns */}
            <div className="space-y-2">
              <span className="text-sm font-semibold text-muted-foreground">
                All {region.patterns.length} patterns for this region
              </span>
              <div className="flex flex-wrap gap-1.5">
                {region.patterns.map(p => (
                  <Badge
                    key={p.id}
                    variant={p.recommended ? "default" : "secondary"}
                    className="cursor-pointer hover:opacity-80 transition-opacity text-xs"
                    onClick={() => onPatternSelect?.(p.id)}
                  >
                    {p.name}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/** Compute centroid of an SVG path string (simple polygon) */
function getRegionCenter(path: string): { x: number; y: number } {
  const nums = path.match(/[\d.]+/g);
  if (!nums) return { x: 0, y: 0 };
  let sumX = 0, sumY = 0, count = 0;
  for (let i = 0; i < nums.length; i += 2) {
    sumX += parseFloat(nums[i]);
    sumY += parseFloat(nums[i + 1]);
    count++;
  }
  return { x: sumX / count, y: sumY / count };
}
