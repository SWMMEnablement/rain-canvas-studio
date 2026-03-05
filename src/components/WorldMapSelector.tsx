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
  // North America — detailed with Florida peninsula, Great Lakes indent, Baja California
  {
    id: "north_america",
    d: `M 98 100 L 107 106 L 120 104 L 135 102 L 153 104 L 162 110 L 172 117
        L 181 130 L 183 137 L 183 143 L 186 154 L 190 161 L 196 165
        L 199 172 L 205 179 L 208 187 L 205 179 L 212 179 L 216 172
        L 217 183 L 227 194 L 234 200 L 236 203
        L 243 196 L 250 192 L 249 198 L 247 203
        L 241 200 L 234 196 L 232 190 L 232 181 L 234 176 L 236 174
        L 245 174 L 249 172 L 252 172
        L 254 172 L 256 174 L 258 176 L 258 172 L 261 172
        L 263 176 L 264 179 L 263 183
        L 261 185 L 260 181 L 258 178 L 256 176
        L 254 174 L 252 173 L 250 172
        L 249 172 L 252 172
        L 260 172 L 263 168 L 265 165 L 268 161 L 271 157
        L 274 152 L 274 148 L 280 146 L 282 144
        L 286 142 L 290 140 L 296 139
        L 300 141 L 306 138 L 313 135 L 309 132
        L 300 119 L 290 112 L 280 108 L 270 102 L 260 98
        L 250 92 L 240 88 L 230 84 L 220 82 L 210 80
        L 195 78 L 180 78 L 165 76 L 150 78 L 135 80
        L 120 84 L 108 88 L 100 94 Z`,
  },
  // Greenland
  {
    id: "greenland",
    d: "M 312 72 L 322 66 L 336 60 L 350 56 L 362 54 L 372 56 L 378 62 L 376 70 L 370 76 L 360 80 L 348 83 L 335 84 L 322 82 L 314 78 Z",
  },
  // South America — with Brazilian bulge, Patagonia
  {
    id: "south_america",
    d: `M 258 218 L 265 222 L 270 228 L 276 232 L 282 235
        L 290 236 L 300 235 L 312 237 L 322 238 L 330 240
        L 338 244 L 342 248 L 344 254 L 342 260
        L 338 268 L 335 275 L 332 282 L 328 290
        L 324 296 L 318 304 L 312 310 L 306 315
        L 298 320 L 292 326 L 286 334
        L 282 342 L 280 348 L 276 354
        L 273 350 L 272 344 L 270 338 L 269 330
        L 270 322 L 272 316 L 271 310
        L 268 302 L 266 294 L 264 286
        L 262 278 L 260 270 L 258 262
        L 256 254 L 256 246 L 256 238
        L 257 230 L 258 224 Z`,
  },
  // Central America & Caribbean bridge
  {
    id: "central_america_land",
    d: "M 234 200 L 240 202 L 245 206 L 250 210 L 254 214 L 257 217 L 258 218 L 256 220 L 253 216 L 248 212 L 243 208 L 238 204 L 234 202 Z",
  },
  // Europe — with Iberian peninsula, Brittany, Italy boot, Scandinavia, Greece
  {
    id: "europe",
    d: `M 388 158 L 391 162 L 394 160 L 398 158 L 402 162
        L 406 158 L 410 154 L 414 150 L 418 148
        L 422 145 L 425 142 L 428 140
        L 430 138 L 432 140 L 434 143 L 435 146
        L 434 149 L 432 152
        L 434 155 L 437 152 L 439 154
        L 440 157 L 438 160 L 436 158
        L 434 156 L 432 158
        L 434 162 L 436 164 L 440 162
        L 444 158 L 448 155 L 452 152
        L 454 154 L 452 158 L 450 162
        L 448 165 L 450 168 L 454 164
        L 458 160 L 462 156 L 465 152
        L 468 148 L 470 142 L 472 138
        L 475 132 L 478 128
        L 475 122 L 470 116 L 465 110
        L 460 104 L 456 98 L 452 94
        L 448 90 L 444 86 L 440 84
        L 436 82 L 432 80 L 428 82
        L 424 86 L 420 90 L 416 96
        L 413 102 L 410 108
        L 408 112 L 405 116 L 403 120
        L 400 125 L 398 128 L 400 132
        L 403 134 L 406 136 L 404 138
        L 400 140 L 396 143 L 393 146
        L 390 150 L 388 154 Z`,
  },
  // British Isles — Great Britain + Ireland
  {
    id: "british_isles",
    d: `M 394 106 L 398 102 L 401 104 L 404 108 L 405 112 L 403 116 L 400 114 L 397 110 Z
        M 388 110 L 392 106 L 394 110 L 393 115 L 390 118 L 387 115 Z`,
  },
  // Italy — detailed boot shape with heel, toe, and Sicily
  {
    id: "italy",
    d: `M 426 141 L 429 138 L 432 140 L 434 143 L 435 146
        L 434 149 L 436 152 L 438 155
        L 440 157 L 439 160 L 437 158 L 436 156
        L 435 158 L 436 160 L 438 161
        L 439 158 L 440 156 L 441 158
        L 439 161 L 437 163
        L 434 162 L 432 160 L 430 157
        L 428 154 L 426 150 L 425 146 L 426 143 Z
        M 432 162 L 436 160 L 440 162 L 438 166 L 434 165 Z`,
  },
  // Scandinavian Peninsula — Norway/Sweden/Finland
  {
    id: "scandinavia",
    d: `M 413 102 L 416 96 L 420 90 L 424 86 L 428 82
        L 432 78 L 438 76 L 444 78 L 448 82
        L 452 88 L 455 94 L 456 100
        L 454 96 L 450 92 L 446 88
        L 442 86 L 438 84 L 435 86
        L 432 90 L 428 96 L 424 102
        L 420 108 L 416 106 Z`,
  },
  // Africa — with Horn of Africa, Gulf of Guinea bulge
  {
    id: "africa",
    d: `M 390 190 L 396 188 L 402 186 L 410 185 L 418 184
        L 426 184 L 434 186 L 442 188 L 450 190
        L 456 192 L 462 194 L 466 196
        L 470 200 L 474 206 L 478 212
        L 484 216 L 488 218 L 490 222
        L 488 218 L 486 214 L 484 210
        L 482 214 L 480 220 L 480 228
        L 482 236 L 486 244 L 490 250
        L 490 256 L 488 262 L 484 268
        L 480 274 L 476 280 L 472 286
        L 468 292 L 464 298 L 460 304
        L 456 308 L 452 312 L 448 316
        L 444 318 L 440 316 L 438 312
        L 436 306 L 434 300 L 432 294
        L 430 288 L 428 282 L 426 276
        L 422 270 L 418 264 L 416 258
        L 414 252 L 412 246 L 410 240
        L 408 236 L 406 232 L 404 228
        L 400 224 L 396 218 L 394 212
        L 392 206 L 390 200 L 389 195 Z`,
  },
  // Horn of Africa (Somalia)
  {
    id: "horn_of_africa",
    d: "M 490 222 L 494 218 L 498 216 L 502 218 L 504 222 L 500 226 L 496 228 L 492 226 Z",
  },
  // Madagascar
  {
    id: "madagascar",
    d: "M 478 296 L 482 292 L 486 296 L 488 304 L 486 312 L 482 316 L 478 312 L 476 304 Z",
  },
  // Asia — massive continent with Arabian Peninsula, India, Indochina, Korea
  {
    id: "asia",
    d: `M 475 132 L 480 128 L 488 120 L 496 112 L 505 105
        L 515 98 L 525 92 L 538 86 L 550 80
        L 565 74 L 580 70 L 595 66 L 610 64
        L 625 62 L 640 63 L 652 66 L 662 72
        L 668 80 L 672 88 L 675 98
        L 676 108 L 674 116 L 670 124
        L 666 130 L 662 136 L 658 142
        L 654 148 L 652 154 L 656 158
        L 660 162 L 660 168 L 656 172
        L 650 170 L 646 172 L 642 178
        L 638 184 L 634 190 L 630 196
        L 626 202 L 622 208 L 618 214
        L 614 218 L 610 222 L 605 224
        L 600 226 L 596 228 L 592 232
        L 588 234 L 584 230 L 580 226
        L 576 228 L 572 232 L 568 230
        L 564 226 L 558 224 L 554 222
        L 548 224 L 542 228 L 536 226
        L 530 222 L 526 218 L 524 212
        L 520 206 L 518 200 L 520 194
        L 524 188 L 528 184 L 532 180
        L 536 178 L 540 175 L 544 172
        L 548 168 L 544 164 L 540 162
        L 535 164 L 530 168 L 525 170
        L 520 172 L 515 175 L 510 178
        L 505 180 L 500 182 L 496 184
        L 492 186 L 488 184 L 485 180
        L 482 176 L 480 170 L 478 164
        L 476 158 L 475 152 L 474 146
        L 472 140 L 472 136 L 475 134 Z`,
  },
  // Indian Subcontinent — clear triangular peninsula with Sri Lanka
  {
    id: "india",
    d: `M 524 168 L 530 166 L 536 164 L 542 162 L 548 164
        L 554 168 L 558 172 L 560 178
        L 558 184 L 554 190 L 550 196
        L 546 202 L 542 208 L 540 214
        L 538 218 L 536 222 L 534 218
        L 530 212 L 526 206 L 524 200
        L 522 194 L 520 188 L 520 182
        L 522 176 L 524 172 Z`,
  },
  // Sri Lanka
  {
    id: "sri_lanka",
    d: "M 540 226 L 544 224 L 546 228 L 544 232 L 540 230 Z",
  },
  // Arabian Peninsula — detailed
  {
    id: "arabia",
    d: `M 475 195 L 480 192 L 486 190 L 492 188 L 498 190
        L 504 194 L 510 198 L 514 204 L 516 210
        L 514 216 L 510 220 L 504 222
        L 498 220 L 492 216 L 486 212
        L 480 206 L 476 200 Z`,
  },
  // Korean Peninsula
  {
    id: "korea",
    d: "M 652 132 L 656 128 L 660 132 L 660 140 L 658 146 L 654 150 L 650 148 L 650 142 L 652 136 Z",
  },
  // Japan — Hokkaido, Honshu, Shikoku, Kyushu
  {
    id: "japan",
    d: `M 668 118 L 672 114 L 676 118 L 674 124 L 670 126 L 668 122 Z
        M 664 128 L 668 124 L 672 128 L 674 136 L 672 142
        L 668 148 L 664 150 L 662 146 L 662 140 L 664 134 Z
        M 658 150 L 662 148 L 664 152 L 662 156 L 658 154 Z
        M 654 152 L 658 150 L 660 155 L 657 158 L 654 156 Z`,
  },
  // Southeast Asian islands (Indonesia, Philippines)
  {
    id: "se_asia_islands",
    d: `M 614 226 L 622 224 L 630 226 L 638 230 L 646 234
        L 654 236 L 660 238 L 665 242 L 660 246
        L 652 244 L 644 242 L 636 244 L 628 248
        L 620 250 L 616 246 L 614 238 Z
        M 638 250 L 648 248 L 656 252 L 664 258
        L 668 264 L 662 266 L 654 262 L 646 258 L 640 254 Z
        M 670 250 L 678 248 L 682 254 L 684 262 L 680 266 L 674 264 L 670 256 Z
        M 610 228 L 616 224 L 620 228 L 618 234 L 614 236 L 610 232 Z`,
  },
  // Australia — with Gulf of Carpentaria indent
  {
    id: "australia",
    d: `M 640 282 L 648 278 L 658 275 L 668 274 L 678 276
        L 686 280 L 692 286 L 696 292 L 700 300
        L 702 308 L 700 316 L 696 322
        L 690 328 L 682 332 L 674 332
        L 666 330 L 660 326 L 654 320
        L 650 314 L 646 308 L 644 300
        L 642 292 L 640 286 Z`,
  },
  // Tasmania
  {
    id: "tasmania",
    d: "M 688 338 L 694 336 L 698 340 L 696 344 L 690 344 L 688 340 Z",
  },
  // New Zealand — North Island + South Island
  {
    id: "new_zealand",
    d: `M 714 316 L 718 312 L 722 316 L 720 322 L 716 326 L 714 322 Z
        M 714 328 L 718 326 L 722 330 L 720 338 L 716 342 L 712 338 L 714 332 Z`,
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
