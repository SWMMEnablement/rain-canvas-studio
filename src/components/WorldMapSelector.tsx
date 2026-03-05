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

// Simplified SVG paths for world regions — Robinson-style projection
const REGION_PATHS: Record<string, string> = {
  us_east: "M 170 155 L 195 148 L 210 155 L 215 170 L 210 190 L 195 195 L 180 192 L 170 180 Z",
  us_west: "M 115 150 L 145 140 L 170 155 L 170 180 L 155 190 L 130 185 L 115 170 Z",
  us_gulf: "M 155 190 L 180 192 L 195 195 L 200 205 L 185 210 L 165 208 L 150 200 Z",
  canada: "M 115 100 L 210 95 L 230 110 L 225 140 L 210 155 L 170 155 L 145 140 L 115 150 L 105 130 Z",
  western_europe: "M 380 125 L 410 120 L 425 130 L 420 155 L 400 165 L 385 160 L 375 145 Z",
  eastern_europe: "M 420 115 L 455 110 L 470 125 L 465 155 L 445 165 L 425 160 L 420 140 Z",
  nordic: "M 385 85 L 425 75 L 445 90 L 440 115 L 420 115 L 400 120 L 385 110 Z",
  mediterranean: "M 375 160 L 420 155 L 445 165 L 460 175 L 440 185 L 400 185 L 380 175 Z",
  middle_east: "M 460 170 L 500 160 L 530 175 L 525 200 L 500 210 L 475 205 L 460 190 Z",
  east_asia: "M 590 120 L 640 110 L 665 130 L 660 165 L 635 175 L 610 170 L 590 150 Z",
  southeast_asia: "M 590 195 L 630 185 L 660 195 L 665 225 L 640 240 L 610 235 L 590 220 Z",
  south_asia: "M 530 175 L 565 165 L 590 180 L 590 210 L 570 225 L 545 218 L 530 200 Z",
  north_africa: "M 360 190 L 420 185 L 460 190 L 460 220 L 430 240 L 390 240 L 360 225 Z",
  east_africa: "M 430 240 L 470 230 L 490 245 L 490 290 L 470 310 L 445 305 L 430 280 Z",
  south_america: "M 210 240 L 250 225 L 280 240 L 290 300 L 270 355 L 245 365 L 225 340 L 210 290 Z",
  central_america: "M 150 205 L 190 210 L 210 220 L 210 240 L 190 245 L 165 240 L 150 225 Z",
  oceania: "M 620 260 L 670 250 L 700 270 L 700 310 L 680 325 L 640 320 L 620 295 Z",
  russia_ca: "M 455 70 L 590 60 L 640 80 L 640 120 L 590 130 L 530 135 L 470 125 L 455 100 Z",
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
          <div className="relative bg-[hsl(215,25%,12%)] overflow-hidden rounded-b-lg">
            <svg
              viewBox="80 40 660 330"
              className="w-full h-auto"
              style={{ minHeight: 280 }}
            >
              {/* Ocean background */}
              <rect x="80" y="40" width="660" height="330" fill="hsl(215, 25%, 12%)" />

              {/* Grid lines */}
              {[100, 140, 180, 220, 260, 300, 340].map(y => (
                <line key={`h${y}`} x1="80" y1={y} x2="740" y2={y} stroke="hsl(215, 20%, 18%)" strokeWidth="0.5" />
              ))}
              {[120, 200, 280, 360, 440, 520, 600, 680].map(x => (
                <line key={`v${x}`} x1={x} y1="40" x2={x} y2="370" stroke="hsl(215, 20%, 18%)" strokeWidth="0.5" />
              ))}

              {/* Equator */}
              <line x1="80" y1="210" x2="740" y2="210" stroke="hsl(215, 20%, 22%)" strokeWidth="1" strokeDasharray="4 4" />
              <text x="745" y="213" fill="hsl(215, 20%, 30%)" fontSize="8" fontFamily="monospace">0°</text>

              {/* Region shapes */}
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
                      fillOpacity={isSelected ? 0.95 : isHovered ? 0.85 : 0.6}
                      stroke={isSelected ? "hsl(0, 0%, 100%)" : isHovered ? "hsl(0, 0%, 90%)" : "hsl(215, 15%, 25%)"}
                      strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.8}
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => handleRegionClick(id)}
                      onMouseEnter={() => setHoveredRegion(id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      style={{ filter: isSelected ? "drop-shadow(0 0 8px rgba(255,255,255,0.3))" : undefined }}
                    />
                    {/* Region label */}
                    {(isHovered || isSelected) && (
                      <text
                        x={getRegionCenter(path).x}
                        y={getRegionCenter(path).y}
                        textAnchor="middle"
                        fill="white"
                        fontSize="9"
                        fontWeight="600"
                        className="pointer-events-none select-none"
                        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                      >
                        {regionData.name}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Legend dot for selected region */}
              {selectedRegion && region && (
                <g>
                  <circle
                    cx={getRegionCenter(REGION_PATHS[selectedRegion]).x}
                    cy={getRegionCenter(REGION_PATHS[selectedRegion]).y - 14}
                    r="4"
                    fill="white"
                    className="animate-pulse"
                  />
                </g>
              )}
            </svg>

            {/* Floating region count badges */}
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
