import { useState, useCallback, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, X, ChevronRight, Zap, AlertTriangle } from "lucide-react";
import { type PatternType } from "@/lib/rainfallPatterns";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { COUNTRY_TO_REGION } from "@/lib/countryRegionMapping";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ── Region definitions (data only) ──────────────────────────────────

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
    id: "us_east", name: "Eastern US",
    description: "Northeast, Southeast & Midwest — convective/frontal storms",
    color: "hsl(210, 60%, 45%)", hoverColor: "hsl(210, 70%, 55%)",
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
    id: "us_west", name: "Western US",
    description: "Pacific NW, California, Mountain West — maritime & orographic storms",
    color: "hsl(190, 55%, 42%)", hoverColor: "hsl(190, 65%, 52%)",
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
    id: "us_gulf", name: "Gulf Coast & Florida",
    description: "Tropical influence — sustained rainfall, hurricane risk",
    color: "hsl(170, 50%, 40%)", hoverColor: "hsl(170, 60%, 50%)",
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
    id: "canada", name: "Canada",
    description: "CDA, AES & provincial standards — mixed precipitation",
    color: "hsl(220, 50%, 50%)", hoverColor: "hsl(220, 60%, 60%)",
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
    id: "western_europe", name: "Western Europe",
    description: "UK, France, Benelux, Germany, Switzerland — maritime & continental",
    color: "hsl(230, 55%, 52%)", hoverColor: "hsl(230, 65%, 62%)",
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
    id: "eastern_europe", name: "Eastern Europe",
    description: "Poland, Czech, Hungary, Balkans, Baltics — continental climate",
    color: "hsl(250, 45%, 48%)", hoverColor: "hsl(250, 55%, 58%)",
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
    id: "nordic", name: "Nordic & Baltic",
    description: "Scandinavia, Finland, Iceland — maritime Atlantic influence",
    color: "hsl(205, 50%, 55%)", hoverColor: "hsl(205, 60%, 65%)",
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
    id: "mediterranean", name: "Mediterranean",
    description: "Spain, Italy, Greece, Turkey, Cyprus, Malta — intense convective storms",
    color: "hsl(30, 60%, 50%)", hoverColor: "hsl(30, 70%, 60%)",
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
    id: "middle_east", name: "Middle East",
    description: "Arabian Peninsula, Levant, Iran — arid flash flood risk",
    color: "hsl(40, 55%, 48%)", hoverColor: "hsl(40, 65%, 58%)",
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
    id: "east_asia", name: "East Asia",
    description: "Japan, Korea, China, Taiwan, Hong Kong — monsoon & typhoon storms",
    color: "hsl(350, 55%, 50%)", hoverColor: "hsl(350, 65%, 60%)",
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
    id: "southeast_asia", name: "Southeast Asia",
    description: "Tropical maritime — high-intensity monsoon & convective rainfall",
    color: "hsl(160, 50%, 42%)", hoverColor: "hsl(160, 60%, 52%)",
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
    id: "south_asia", name: "South Asia",
    description: "India, Pakistan, Bangladesh, Sri Lanka — monsoon-dominated",
    color: "hsl(15, 55%, 48%)", hoverColor: "hsl(15, 65%, 58%)",
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
    id: "north_africa", name: "North & West Africa",
    description: "Sahel, Mediterranean coast, tropical West Africa",
    color: "hsl(45, 50%, 45%)", hoverColor: "hsl(45, 60%, 55%)",
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
    id: "east_africa", name: "East & Southern Africa",
    description: "Tropical highlands, savanna — bimodal rainy seasons",
    color: "hsl(25, 50%, 42%)", hoverColor: "hsl(25, 60%, 52%)",
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
    id: "south_america", name: "South America",
    description: "Tropical to temperate — diverse orographic & convective patterns",
    color: "hsl(140, 45%, 42%)", hoverColor: "hsl(140, 55%, 52%)",
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
    id: "central_america", name: "Central America & Caribbean",
    description: "Tropical storms, hurricanes — intense short-duration rainfall",
    color: "hsl(155, 45%, 40%)", hoverColor: "hsl(155, 55%, 50%)",
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
    id: "oceania", name: "Oceania & Pacific",
    description: "Australia, New Zealand, Pacific Islands — varied maritime climates",
    color: "hsl(195, 50%, 45%)", hoverColor: "hsl(195, 60%, 55%)",
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
    id: "russia_ca", name: "Russia & Central Asia",
    description: "Continental extremes — Soviet-era & modern standards",
    color: "hsl(270, 40%, 48%)", hoverColor: "hsl(270, 50%, 58%)",
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

// ── City markers with IDF station data ──────────────────────────────
interface CityMarker {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  regionId: string;
  idfSource: string;
  designRainfall: string;
  returnPeriods: string;
  notes: string;
}

const CITY_MARKERS: CityMarker[] = [
  { id: "nyc", name: "New York", country: "USA", lat: 40.7128, lon: -74.0060, regionId: "us_east", idfSource: "NOAA Atlas 14", designRainfall: "76 mm/hr (100yr-1hr)", returnPeriods: "2–1000 yr", notes: "Northeast coastal; tropical remnants possible" },
  { id: "houston", name: "Houston", country: "USA", lat: 29.7604, lon: -95.3698, regionId: "us_gulf", idfSource: "NOAA Atlas 14", designRainfall: "112 mm/hr (100yr-1hr)", returnPeriods: "2–1000 yr", notes: "Gulf Coast; extreme convective & tropical storms" },
  { id: "denver", name: "Denver", country: "USA", lat: 39.7392, lon: -104.9903, regionId: "us_west", idfSource: "NOAA Atlas 14", designRainfall: "64 mm/hr (100yr-1hr)", returnPeriods: "2–1000 yr", notes: "Semi-arid; intense short-duration storms" },
  { id: "toronto", name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832, regionId: "canada", idfSource: "ECCC IDF v3.5", designRainfall: "58 mm/hr (100yr-1hr)", returnPeriods: "2–100 yr", notes: "Great Lakes influence; mixed precipitation" },
  { id: "mexico_city", name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332, regionId: "central_america", idfSource: "CONAGUA", designRainfall: "72 mm/hr (100yr-1hr)", returnPeriods: "2–500 yr", notes: "High altitude; afternoon convective bursts" },
  { id: "sao_paulo", name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333, regionId: "south_america", idfSource: "DAEE/CETESB", designRainfall: "86 mm/hr (100yr-1hr)", returnPeriods: "2–500 yr", notes: "Tropical; intense mesoscale convective systems" },
  { id: "bogota", name: "Bogotá", country: "Colombia", lat: 4.7110, lon: -74.0721, regionId: "south_america", idfSource: "IDEAM", designRainfall: "48 mm/hr (100yr-1hr)", returnPeriods: "2–100 yr", notes: "Andean highland; bimodal rainfall" },
  { id: "london", name: "London", country: "UK", lat: 51.5074, lon: -0.1278, regionId: "western_europe", idfSource: "FEH22 / ReFH2", designRainfall: "42 mm/hr (100yr-1hr)", returnPeriods: "2–1000 yr", notes: "Maritime temperate; low intensity, long duration" },
  { id: "paris", name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, regionId: "western_europe", idfSource: "Météo-France SHYREG", designRainfall: "48 mm/hr (100yr-1hr)", returnPeriods: "2–1000 yr", notes: "Continental maritime; moderate intensities" },
  { id: "berlin", name: "Berlin", country: "Germany", lat: 52.5200, lon: 13.4050, regionId: "western_europe", idfSource: "KOSTRA-DWD", designRainfall: "52 mm/hr (100yr-1hr)", returnPeriods: "1–100 yr", notes: "Continental; summer convective dominance" },
  { id: "rome", name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964, regionId: "mediterranean", idfSource: "LSPP / VAPI", designRainfall: "68 mm/hr (100yr-1hr)", returnPeriods: "2–500 yr", notes: "Mediterranean; intense autumn storms" },
  { id: "madrid", name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038, regionId: "mediterranean", idfSource: "CEDEX / AEMET", designRainfall: "44 mm/hr (100yr-1hr)", returnPeriods: "2–500 yr", notes: "Semi-arid continental; DANA cold drops" },
  { id: "stockholm", name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686, regionId: "nordic", idfSource: "SMHI", designRainfall: "38 mm/hr (100yr-1hr)", returnPeriods: "2–100 yr", notes: "Subarctic maritime; mixed precipitation" },
  { id: "moscow", name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173, regionId: "russia_ca", idfSource: "Roshydromet SNiP", designRainfall: "45 mm/hr (100yr-1hr)", returnPeriods: "1–100 yr", notes: "Continental; short intense summer storms" },
  { id: "cairo", name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, regionId: "north_africa", idfSource: "HCWW / EMA", designRainfall: "28 mm/hr (100yr-1hr)", returnPeriods: "2–100 yr", notes: "Hyper-arid; rare but catastrophic flash floods" },
  { id: "lagos", name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792, regionId: "north_africa", idfSource: "NiMet / CIEH", designRainfall: "95 mm/hr (100yr-1hr)", returnPeriods: "2–100 yr", notes: "Tropical; intense monsoon & squall lines" },
  { id: "nairobi", name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219, regionId: "east_africa", idfSource: "KMD", designRainfall: "62 mm/hr (100yr-1hr)", returnPeriods: "2–100 yr", notes: "Tropical highland; bimodal rainy seasons" },
  { id: "johannesburg", name: "Joburg", country: "South Africa", lat: -26.2041, lon: 28.0473, regionId: "east_africa", idfSource: "SANRAL / WRC", designRainfall: "72 mm/hr (100yr-1hr)", returnPeriods: "2–200 yr", notes: "Subtropical highland; intense thunderstorms" },
  { id: "dubai", name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708, regionId: "middle_east", idfSource: "Dubai Municipality DM", designRainfall: "36 mm/hr (100yr-1hr)", returnPeriods: "2–100 yr", notes: "Hyper-arid; rare intense convective events" },
  { id: "mumbai", name: "Mumbai", country: "India", lat: 19.0760, lon: 72.8777, regionId: "south_asia", idfSource: "IMD", designRainfall: "120 mm/hr (100yr-1hr)", returnPeriods: "2–200 yr", notes: "Monsoon-dominated; extreme tropical rainfall" },
  { id: "beijing", name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074, regionId: "east_asia", idfSource: "GB 50014 / CMA", designRainfall: "78 mm/hr (100yr-1hr)", returnPeriods: "2–100 yr", notes: "Continental monsoon; summer rainstorm season" },
  { id: "tokyo", name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, regionId: "east_asia", idfSource: "JMA AMeDAS", designRainfall: "85 mm/hr (100yr-1hr)", returnPeriods: "2–200 yr", notes: "Typhoon & Baiu front; high-intensity events" },
  { id: "seoul", name: "Seoul", country: "S. Korea", lat: 37.5665, lon: 126.9780, regionId: "east_asia", idfSource: "KMA / MOLIT", designRainfall: "82 mm/hr (100yr-1hr)", returnPeriods: "2–200 yr", notes: "East Asian monsoon; concentrated summer rainfall" },
  { id: "singapore", name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, regionId: "southeast_asia", idfSource: "PUB", designRainfall: "130 mm/hr (100yr-1hr)", returnPeriods: "2–200 yr", notes: "Equatorial; year-round intense convection" },
  { id: "jakarta", name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456, regionId: "southeast_asia", idfSource: "BMKG", designRainfall: "110 mm/hr (100yr-1hr)", returnPeriods: "2–100 yr", notes: "Tropical maritime; extreme monsoon flooding" },
  { id: "hong_kong", name: "Hong Kong", country: "China", lat: 22.3193, lon: 114.1694, regionId: "east_asia", idfSource: "HKO DSD 2018", designRainfall: "105 mm/hr (100yr-1hr)", returnPeriods: "2–1000 yr", notes: "Subtropical; typhoon & rainstorm warnings" },
  { id: "sydney", name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, regionId: "oceania", idfSource: "ARR 2019 / BoM", designRainfall: "75 mm/hr (100yr-1hr)", returnPeriods: "2–2000 yr", notes: "Maritime subtropical; east coast lows" },
];

// ── Helper: get country name from geo properties ──
function getCountryISO(geo: any): string {
  // TopoJSON from world-atlas uses ISO_A3 or similar
  return geo.properties?.ISO_A3 || geo.properties?.iso_a3 || geo.id || "";
}

function getCountryName(geo: any): string {
  return geo.properties?.name || geo.properties?.NAME || "";
}

// ── Memoized Geography component for performance ──
const CountryShape = memo(function CountryShape({
  geo,
  regionId,
  regionData,
  isRegionSelected,
  isRegionHovered,
  isCountryHovered,
  onRegionClick,
  onCountryEnter,
  onCountryLeave,
}: {
  geo: any;
  regionId: string | undefined;
  regionData: RegionInfo | undefined;
  isRegionSelected: boolean;
  isRegionHovered: boolean;
  isCountryHovered: boolean;
  onRegionClick: (regionId: string) => void;
  onCountryEnter: (countryName: string, regionId: string | undefined) => void;
  onCountryLeave: () => void;
}) {
  const countryName = getCountryName(geo);
  
  const fillColor = useMemo(() => {
    if (!regionId || !regionData) return "hsl(215, 12%, 16%)"; // unmapped: dark land
    if (isRegionSelected) return regionData.hoverColor;
    if (isRegionHovered || isCountryHovered) return regionData.hoverColor;
    return regionData.color;
  }, [regionId, regionData, isRegionSelected, isRegionHovered, isCountryHovered]);

  const fillOpacity = useMemo(() => {
    if (!regionId) return 0.6;
    if (isRegionSelected) return 0.85;
    if (isCountryHovered) return 0.9;
    if (isRegionHovered) return 0.7;
    return 0.55;
  }, [regionId, isRegionSelected, isRegionHovered, isCountryHovered]);

  const strokeColor = useMemo(() => {
    if (isCountryHovered || isRegionSelected) return "hsl(0, 0%, 90%)";
    if (isRegionHovered) return "hsl(0, 0%, 70%)";
    return "hsl(215, 15%, 22%)";
  }, [isCountryHovered, isRegionSelected, isRegionHovered]);

  return (
    <Geography
      geography={geo}
      fill={fillColor}
      fillOpacity={fillOpacity}
      stroke={strokeColor}
      strokeWidth={isCountryHovered ? 1.2 : isRegionSelected ? 0.8 : 0.3}
      style={{
        default: { outline: "none", transition: "all 200ms ease" },
        hover: { outline: "none" },
        pressed: { outline: "none" },
      }}
      onMouseEnter={() => onCountryEnter(countryName, regionId)}
      onMouseLeave={onCountryLeave}
      onClick={() => regionId && onRegionClick(regionId)}
      className={regionId ? "cursor-pointer" : "cursor-default"}
    />
  );
});

// ── Main Component ──────────────────────────────────────────────────

interface WorldMapSelectorProps {
  onPatternSelect?: (patternId: PatternType) => void;
  onViewIdf?: (city: { name: string; lat: number; lon: number }) => void;
}

export function WorldMapSelector({ onPatternSelect, onViewIdf }: WorldMapSelectorProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredCountryRegion, setHoveredCountryRegion] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityMarker | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [showCities, setShowCities] = useState(true);

  const handleRegionClick = useCallback((regionId: string) => {
    setSelectedRegion(prev => prev === regionId ? null : regionId);
  }, []);

  const handleCountryEnter = useCallback((countryName: string, regionId: string | undefined) => {
    setHoveredCountry(countryName);
    setHoveredCountryRegion(regionId || null);
  }, []);

  const handleCountryLeave = useCallback(() => {
    setHoveredCountry(null);
    setHoveredCountryRegion(null);
  }, []);

  const region = selectedRegion ? REGIONS[selectedRegion] : null;

  const totalPatterns = useMemo(() => {
    return Object.values(REGIONS).reduce((acc, r) => acc + r.patterns.length, 0);
  }, []);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5 text-primary" />
            World Rainfall Pattern Map
          </CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription>
              Click any country to see recommended rainfall distributions for that region
            </CardDescription>
            <button
              onClick={() => { setShowCities(prev => !prev); if (showCities) setSelectedCity(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showCities
                  ? "bg-accent text-accent-foreground hover:bg-accent/80"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full ${showCities ? "bg-primary" : "bg-muted-foreground"}`} />
              {showCities ? "Cities On" : "Cities Off"}
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Map Container */}
          <div className="relative bg-[hsl(215,30%,8%)] overflow-hidden rounded-b-lg">
            <ComposableMap
              projection="geoNaturalEarth1"
              projectionConfig={{ scale: 155, center: [10, 5] }}
              width={800}
              height={420}
              style={{ width: "100%", height: "auto" }}
            >
              {/* Ocean background */}
              <rect x={0} y={0} width={800} height={420} fill="hsl(215, 30%, 8%)" />

              {/* Country polygons */}
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const iso = getCountryISO(geo);
                    const regionId = COUNTRY_TO_REGION[iso];
                    const regionData = regionId ? REGIONS[regionId] : undefined;
                    const isRegionSelected = selectedRegion === regionId;
                    const isRegionHovered = hoveredCountryRegion === regionId;
                    const countryName = getCountryName(geo);
                    const isCountryHovered = hoveredCountry === countryName;

                    return (
                      <CountryShape
                        key={geo.rsmKey}
                        geo={geo}
                        regionId={regionId}
                        regionData={regionData}
                        isRegionSelected={isRegionSelected}
                        isRegionHovered={isRegionHovered}
                        isCountryHovered={isCountryHovered}
                        onRegionClick={handleRegionClick}
                        onCountryEnter={handleCountryEnter}
                        onCountryLeave={handleCountryLeave}
                      />
                    );
                  })
                }
              </Geographies>

              {/* City markers */}
              {showCities && CITY_MARKERS.map(city => {
                const isHovered = hoveredCity === city.id;
                const isSelected = selectedCity?.id === city.id;
                return (
                  <Marker
                    key={city.id}
                    coordinates={[city.lon, city.lat]}
                    onMouseEnter={() => setHoveredCity(city.id)}
                    onMouseLeave={() => setHoveredCity(null)}
                    onClick={() => setSelectedCity(prev => prev?.id === city.id ? null : city)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Pulse ring */}
                    {(isHovered || isSelected) && (
                      <circle r={8} fill="none" stroke="hsl(45, 90%, 65%)" strokeWidth={1.2} opacity={0.6} className="animate-pulse" />
                    )}
                    {/* Marker dot */}
                    <circle
                      r={isSelected ? 4.5 : isHovered ? 4 : 3}
                      fill={isSelected ? "hsl(45, 90%, 65%)" : isHovered ? "hsl(45, 80%, 70%)" : "hsl(45, 70%, 60%)"}
                      stroke="hsl(215, 30%, 10%)"
                      strokeWidth={1}
                    />
                    {/* Name label on hover */}
                    {isHovered && !isSelected && (
                      <text
                        textAnchor="start"
                        x={8}
                        y={-2}
                        style={{
                          fill: "hsl(45, 70%, 80%)",
                          fontSize: "10px",
                          fontWeight: 500,
                          textShadow: "0 0 4px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.9)",
                          pointerEvents: "none",
                        }}
                      >
                        {city.name}
                      </text>
                    )}
                  </Marker>
                );
              })}
            </ComposableMap>

            {/* Badges */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                {Object.keys(REGIONS).length} regions
              </Badge>
              <Badge variant="secondary" className="text-xs bg-background/80 backdrop-blur-sm">
                {totalPatterns} patterns mapped
              </Badge>
            </div>

            {/* Country hover tooltip */}
            {hoveredCountry && !selectedRegion && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 border shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium text-sm">{hoveredCountry}</span>
                      {hoveredCountryRegion && REGIONS[hoveredCountryRegion] && (
                        <Badge variant="outline" className="text-xs">
                          {REGIONS[hoveredCountryRegion].name}
                        </Badge>
                      )}
                    </div>
                    {hoveredCountryRegion && REGIONS[hoveredCountryRegion] && (
                      <span className="text-xs text-muted-foreground">
                        {REGIONS[hoveredCountryRegion].patterns.length} patterns
                      </span>
                    )}
                  </div>
                  {hoveredCountryRegion && REGIONS[hoveredCountryRegion] && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {REGIONS[hoveredCountryRegion].description}
                    </p>
                  )}
                  {!hoveredCountryRegion && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      No rainfall pattern data mapped for this country yet
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* City IDF popup */}
            {selectedCity && (
              <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80">
                <div className="bg-background/95 backdrop-blur-sm rounded-lg border shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b bg-accent/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span className="font-semibold text-sm">{selectedCity.name}</span>
                      <span className="text-xs text-muted-foreground">{selectedCity.country}</span>
                    </div>
                    <button onClick={() => setSelectedCity(null)} className="text-muted-foreground hover:text-foreground">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                      <span className="text-muted-foreground font-medium">IDF Source</span>
                      <span className="font-semibold text-primary">{selectedCity.idfSource}</span>
                      <span className="text-muted-foreground font-medium">Design Rain</span>
                      <span className="font-mono">{selectedCity.designRainfall}</span>
                      <span className="text-muted-foreground font-medium">Return Periods</span>
                      <span>{selectedCity.returnPeriods}</span>
                    </div>
                    <p className="text-xs text-muted-foreground italic border-t pt-1.5 mt-1.5">{selectedCity.notes}</p>
                    {selectedCity.country !== "USA" && (
                      <p className="text-xs text-amber-500 dark:text-amber-400 flex items-center gap-1 border-t pt-1.5 mt-1.5">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        NOAA Atlas 14 covers US only — IDF lookup may return no data for {selectedCity.country}
                      </p>
                    )}
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        variant={selectedCity.country === "USA" ? "default" : "outline"}
                        className="flex-1 text-xs h-7"
                        onClick={() => {
                          if (onViewIdf) {
                            onViewIdf({ name: `${selectedCity.name}, ${selectedCity.country}`, lat: selectedCity.lat, lon: selectedCity.lon });
                          }
                        }}
                        disabled={!onViewIdf}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {selectedCity.country === "USA" ? "View IDF Curves" : "Try IDF Lookup"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs h-7"
                        onClick={() => {
                          const regionId = selectedCity.regionId;
                          setSelectedCity(null);
                          setSelectedRegion(regionId);
                        }}
                      >
                        <ChevronRight className="w-3 h-3 mr-1" />
                        Patterns
                      </Button>
                    </div>
                  </div>
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
