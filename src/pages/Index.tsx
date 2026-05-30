import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { COUNTRIES } from "@/lib/globalIdfData";
import { canadaIdfDatabase } from "@/lib/canadaIdfData";
import { chinaRainstormDatabase } from "@/lib/chinaRainstormData";
import { useSearchParams } from "react-router-dom";
import { StormWizard, decodeStormParams } from "@/components/StormWizard";
import { patterns } from "@/components/PatternSelector";
import { AdvancedTools } from "@/components/AdvancedTools";
import { Documentation } from "@/components/Documentation";
import { RealDataHub } from "@/components/RealDataHub";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RainParticles } from "@/components/RainParticles";
import { HeroHyetograph, getHeroPatternLabel } from "@/components/HeroHyetograph";
import { StormChatbot } from "@/components/StormChatbot";
import { HeroGifExport } from "@/components/HeroGifExport";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Droplets, CloudRain, BookOpen, Wrench, Database, Code2 } from "lucide-react";
import { ApiPlayground } from "@/components/ApiPlayground";
import { toast } from "sonner";

const PATTERN_BADGES = [
  "AES Canada 30%",
  "AES Canada 40%",
  "AES Canada 50%",
  "ARR 2019 Ensemble",
  "ARR 2019 Project 3 Regional",
  "ARR87 Legacy",
  "ATV A-121",
  "Abu Dhabi ADM",
  "Abu Dhabi Climate-Adjusted",
  "Abu Dhabi UPC/DM Combined",
  "Adamowski-Alila Atlantic",
  "Adamowski-Alila Great Lakes",
  "Adamowski-Alila Northern",
  "Adamowski-Alila Pacific",
  "Adamowski-Alila Prairie",
  "Adamowski-Alila St. Lawrence",
  "Afghanistan MOMP",
  "Alabama ALDOT",
  "Alaska DOT&PF",
  "Albanian IGEWE",
  "Alberta ESRD",
  "Alberta Transportation",
  "Algeria ANRH",
  "Algeria ANRH Urban",
  "Alternating Block",
  "Angola DNA",
  "Argentina ADT",
  "Argentina INA",
  "Argentina SMN",
  "Arid Flash Flood",
  "Arizona ADOT",
  "Arkansas ArDOT",
  "Armenia Hydromet",
  "Arnell (Sweden)",
  "Atmospheric River",
  "Auckland TP108",
  "Australian ACT EPSDD",
  "Australian ARR",
  "Australian NSW OEH",
  "Australian NT DEPWS",
  "Australian QLD DNRME",
  "Australian SA EPA",
  "Australian TAS DPIWE",
  "Australian VIC DELWP",
  "Australian WA DWER",
  "Austria ÖKOSTRA",
  "Average Variability",
  "Azerbaijan NHMS",
  "Azores/Madeira IPMA",
  "BC MOE Coastal",
  "BC MOE Interior",
  "BC MOE Northern",
  "Bahrain MET",
  "Balanced Storm",
  "Bangladesh BMD",
  "Bangladesh DWASA",
  "Barbados BMS",
  "Bartlett-Lewis",
  "Belarusian TKP",
  "Belgium IRM",
  "Belgium Willems",
  "Belize Flood Hazard",
  "Bemposta (Portugal)",
  "Beta Distribution",
  "Bhutan SCS Design Storm",
  "Bimodal Gaussian",
  "Blaszczyk",
  "Block Pattern",
  "Bogotá EAAB",
  "Bolivia Altiplano",
  "Bolivia SEPSA",
  "Bonta USDA",
  "Bosnia & Herzegovina FHMZ",
  "Botswana DMS",
  "Brazil ANA",
  "Budapest Convective",
  "Bulgarian NIMH",
  "Bulgarian NIMH Urban",
  "Burundi IGEBU",
  "CC-IDF Scaled",
  "CMIP6 Derived IDF",
  "CSA W231",
  "Caltrans CA",
  "Cambodia MOWRAM",
  "Cameroon IRD",
  "Canadian CDA",
  "Canadian ECCC Climate-Adjusted",
  "Cape Verde INMG",
  "Caribbean CDEMA",
  "Cascading Failure Storm",
  "Chen (1976)",
  "Chicago Storm",
  "Chile DGA",
  "Chile IDIC",
  "China Beijing",
  "China Design Storm",
  "China GB 50014",
  "China Guangzhou",
  "China MOHURD",
  "China PRD",
  "China Shanghai",
  "China Shenzhen",
  "Chinese P&C Method",
  "Chocat (1997)",
  "Chow (1964)",
  "Christchurch Canterbury",
  "City of Austin Zone 1",
  "City of Austin Zone 2",
  "Clark County NV",
  "Clausius-Clapeyron",
  "Cloudburst",
  "Colombia IDEAM",
  "Colombia INVIAS",
  "Comoros Post-Kenneth",
  "Compound Flood Storm",
  "Connecticut CTDOT",
  "Cosine Storm",
  "Costa Rica IMN",
  "Costa Rica MOPT",
  "Croatian DHMZ",
  "Croatian HRVATSKE VODE",
  "Cuba INSMET",
  "Custom",
  "Cut-Off Low",
  "Cyprus WDD",
  "Czech CHMU",
  "Czech DIA",
  "Côte d'Ivoire SODEXAM",
  "DWA A-118",
  "Danish DKCIP",
  "Danish SVK Urban",
  "Delta Change Method",
  "Denmark SVK",
  "Derecho",
  "Desbordes",
  "Desbordes (1978)",
  "Dominica CHaRIM",
  "Dominican ONAMET",
  "Double Peak",
  "Double Triangle",
  "Dubai DM Combined",
  "Dubai Municipality",
  "Dutch KNMI'14",
  "Dutch KNMI'23",
  "Dutch NEERSLAG",
  "ECCC IDF",
  "EPA SWMM-CAT",
  "Ecuador EMAAP-Q",
  "Ecuador INAMHI",
  "Egypt CAPW",
  "Egypt HCWW",
  "El Salvador MOP",
  "Eritrea DME",
  "Estonian EMHI",
  "Ethiopia Addis Ababa",
  "Ethiopia NMA",
  "Euler Type I",
  "Euler Type II",
  "Euro CORDEX",
  "Exponential Decay",
  "FAA Standard (Airport)",
  "FDOT Zone 1",
  "FDOT Zone 2",
  "FDOT Zone 3",
  "FDOT Zone 4",
  "FDOT Zone 5",
  "FEH (UK)",
  "FEH22/ReFH2",
  "FSR Profile",
  "Fiji FMS",
  "Fiji NDMO",
  "Finland FMI",
  "Finnish ELY",
  "Fourier Multipeak",
  "France SHYPRE",
  "French DRIAS 2020",
  "G2P Gamma",
  "Gabon Francophone",
  "Gambia RNA",
  "Gaussian Storm",
  "Gauteng WRC",
  "Georgia GDOT",
  "Georgia NEA",
  "German DVWK",
  "German DWA",
  "German DWD-EXTREM",
  "Ghana Accra AMA",
  "Ghana GMet",
  "Greece Hellenic",
  "Greek YE",
  "Grenada CHaRIM",
  "Guatemala CIV",
  "Guatemala INSIVUMEH",
  "Guo (2001)",
  "Guyana Drainage Design",
  "HEC-HMS Area-Dependent",
  "HEC-HMS Frequency 25%",
  "HEC-HMS Frequency 50%",
  "HEC-HMS Frequency 75%",
  "HIRDS NZ",
  "HK DSD 2018",
  "HK DSD 2023",
  "Haiti MARNDR",
  "Harris County FCD",
  "Hawaii Distinct",
  "Heat-Enhanced Convective",
  "Hendrick (1973)",
  "Hershfield (1961)",
  "Honduras SMN",
  "Honduras SOPTRAVI",
  "Hong Kong HKO",
  "Huff 1st Quartile",
  "Huff 2nd Quartile",
  "Huff 3rd Quartile",
  "Huff 4th Quartile",
  "Hungarian KÖVÍZIG",
  "Hungarian MSZ",
  "IMGW Cluster 1",
  "IMGW Cluster 2",
  "IMGW Cluster 3",
  "IMGW Cluster 4",
  "IMGW Cluster 5",
  "Icelandic IMO",
  "Icelandic LHF",
  "Idaho ITD",
  "Illinois SWS B75",
  "India Coastal",
  "India IMD",
  "Indonesia BMKG",
  "Indonesia DKI Jakarta",
  "Instantaneous Burst",
  "Iran IRIMO",
  "Iran IRIMO Regional",
  "Iraq MoS",
  "Iraq Mosul",
  "Ireland Met Éireann",
  "Israel IMS",
  "Italian IPCC-AR6",
  "Italian Pattern",
  "Italian VAPI",
  "Jamaica JIE Guidelines",
  "Jamaica MSJ",
  "Japan AMeDAS",
  "Japan Baiu",
  "Japan JMA",
  "Japan MLIT Urban",
  "Japan Osaka City",
  "Japan Typhoon",
  "Johnson SB Caribbean",
  "Jordan JMD",
  "KOSTRA-DWD",
  "Kansas KDOT",
  "Kazakhstan Kazhydromet",
  "Keifer (1940)",
  "Keifer-Chu (1957)",
  "Kenya KMD",
  "Kenya Nairobi City",
  "Korea KMA",
  "Korea MOE Urban",
  "Korea MOLIT",
  "Kosovo NOTHAS",
  "Kuwait MEW",
  "Kyrgyzstan Hydromet",
  "LA County LACDPW",
  "Laos JICA",
  "Latvian LVGMC",
  "Lebanon Civil Aviation",
  "Liberia Regional",
  "Lima SENAMHI",
  "Lithuanian HMS",
  "LogNormal Temporal",
  "Louisiana DOTD",
  "M5-60 (UK/Ireland)",
  "MCS Storm",
  "Madagascar DGM",
  "Maine MaineDOT",
  "Malaysia DID",
  "Malaysia HP1",
  "Malaysia MSMA",
  "Malaysia MSMA 2nd Ed.",
  "Maldives MMS",
  "Mali L-moments",
  "Malta MRA",
  "Manitoba MI",
  "Maricopa FCD",
  "Marsalek (1978)",
  "Marshall Islands Ebeye",
  "Maryland SHA",
  "Massachusetts MassDOT",
  "Mauritania Regional",
  "Mauritius MMS",
  "Medicane",
  "Mekong MRC",
  "Mexico CONAGUA",
  "Micronesia FSM",
  "Mississippi MDOT",
  "Moldova SHS",
  "Moldova Urban Drainage",
  "Mongolia NAMEM",
  "Mongolia Ulaanbaatar",
  "Mononobe (Japan)",
  "Monsoon Burst",
  "Montana MDT",
  "Montana/Caquot (FR)",
  "Montenegro IHMS",
  "Montenegro Regional",
  "Morocco DMN",
  "Morocco ORMVAT",
  "Mozambique INAM",
  "Mozambique Maputo",
  "Myanmar DMH",
  "Myanmar Yangon IDF",
  "Myanmar Yangon YCDC",
  "NAIAD Enhanced",
  "NEOM Design Storm",
  "NJDEP WQ 2-Hour",
  "NOAA A14 Type A",
  "NOAA A14 Type B",
  "NOAA A14 Type C",
  "NOAA A14 Type D",
  "NOAA Atlas 14",
  "NOAA Atlas 15",
  "NOAA Atlas 16",
  "NOAA CA Region 1",
  "NOAA CA Region 2",
  "NOAA CA Region 3",
  "NOAA CA Region 4",
  "NOAA CA Region 5",
  "NOAA CA Region 6",
  "NRCC Type A",
  "NRCC Type B",
  "NRCC Type C",
  "NRCC Type D",
  "NRCS MSE 1",
  "NRCS MSE 2",
  "NRCS MSE 3",
  "NRCS MSE 4",
  "NRCS MSE 5",
  "NRCS MSE 6",
  "NYC DEP",
  "NZ NIWA",
  "Namibia NMS",
  "Nauru Regional",
  "Nebraska NDOT",
  "Nepal DHM",
  "Nepal Kathmandu KUKL",
  "Nested Envelope",
  "Netherlands RIONED",
  "New Hampshire NHDOT",
  "New Jersey NJDOT",
  "New Mexico NMDOT",
  "New York NYSDOT",
  "New Zealand Auckland AC",
  "New Zealand Christchurch CCC",
  "New Zealand Wellington GWRC",
  "Neyman-Scott",
  "Nicaragua INETER",
  "Niger Regional",
  "Nigeria Abuja FCDA",
  "Nigeria Lagos LSWB",
  "Nigeria NiMet",
  "Nocturnal MCS",
  "Non-stationary GEV IDF",
  "North Carolina NCDOT",
  "North Dakota NDDOT",
  "North Macedonia HMS",
  "North Macedonia Regional",
  "Northwest Territories ENR",
  "Norway NVE",
  "Norwegian NCCS",
  "Norwegian NVE Urban",
  "Nunavut CWS",
  "OECS Caribbean",
  "Oklahoma ODOT",
  "Oman DGMAN",
  "Ontario MOECP",
  "Ontario MTO 12-hr",
  "Ontario MTO 2-hr",
  "Ontario MTO 4-hr",
  "Orographic Enhanced",
  "PMP (HMR 51/52)",
  "PMP HMR 49",
  "PMP HMR 50",
  "PMP HMR 52",
  "PMP HMR 53",
  "PMP HMR 55",
  "PMP HMR 57",
  "PMP HMR 58",
  "PMP HMR 59",
  "PMP HMR 60",
  "PMP WMO Generalized",
  "PNG NCD",
  "Pacific SPREP",
  "Pakistan CDA Islamabad",
  "Pakistan LDA",
  "Pakistan PMD",
  "Palau USACE",
  "Panama ETESA",
  "Panama MOP",
  "Papua New Guinea NWS",
  "Parabolic",
  "Paraguay DMH",
  "Paraguay DNP",
  "Partial Duration Series",
  "Pennsylvania PennDOT",
  "Peru PROVÍAS",
  "Peru SENAMHI",
  "Philadelphia PWD",
  "Philippines MMDA",
  "Philippines PAGASA",
  "Pilgrim (1977)",
  "Pilgrim-Cordery",
  "Pilgrim-Cordery (Canada)",
  "Poland Bogdanowicz-Stachy",
  "Poland IMGW Urban",
  "Poland PANDA",
  "Polar Low",
  "Portugal IPMA",
  "Portugal LNEC",
  "Post-Wildfire",
  "Power Curve",
  "Prairie Short-Duration",
  "Puerto Rico",
  "Qatar Kahramaa",
  "Qatar Kahramaa Enhanced",
  "Qatar QRRC",
  "Quantile Delta Mapping",
  "Quebec MELCCFP",
  "Quebec MTQ",
  "Rain on Snow",
  "Rhode Island RIDOT",
  "Romania STAS",
  "Romanian ANAR",
  "Russia Roshydromet",
  "Russia SNiP",
  "Russian SP",
  "Rwanda Regionalized IDF",
  "Réunion Météo-France",
  "SA SCS Type 1",
  "SA SCS Type 2",
  "SA SCS Type 3",
  "SA SCS Type 4",
  "SA WRC",
  "SCS Standard 6-Hour",
  "SCS Type I",
  "SCS Type IA",
  "SCS Type II",
  "SCS Type III",
  "SFWMD 72-Hour",
  "SHYREG (FR)",
  "Saharan Dust Storm",
  "Saint Lucia CHaRIM",
  "Saint Vincent CHaRIM",
  "Samoa MET",
  "Samoa SOPAC",
  "Saskatchewan WSA",
  "Saudi Arabia PME",
  "Saudi Aramco",
  "Saudi MoMRAH",
  "Sea Breeze",
  "Serbian RHMZ",
  "Seychelles SCS Type 3",
  "Seychelles SMA",
  "Sharjah SEWA",
  "Sierra Leone Roads Authority",
  "Sifalda (Czech)",
  "Sigmoid Logistic",
  "Silva (Brazil)",
  "Singapore PUB",
  "Singapore PUB Urban",
  "Slovak SHMU",
  "Slovenian ARSO",
  "Slovenian MOP",
  "Snowmelt-Enhanced",
  "Solomon Islands Honiara",
  "South Africa Cape Town",
  "South Africa Johannesburg",
  "South Africa SANRAL",
  "South African Huff",
  "South Carolina SCDOT",
  "South Dakota SDDOT",
  "Soviet SNiP Legacy",
  "Spain CEDEX",
  "Spanish AEMET-ADAPTA",
  "Squall Line",
  "Sri Lanka",
  "Sri Lanka NBRO",
  "Stochastic Storm Transposition",
  "Sudan SMA",
  "Super CC",
  "Supercell",
  "Suriname Paramaribo",
  "Svensson-Jones",
  "Sweden SMHI",
  "Swedish SMHI Urban",
  "Swiss IDF",
  "Swiss IDF CH2018",
  "São Paulo DAEE",
  "TENAX-CDS",
  "Taiwan CWA",
  "Taiwan MOIWR",
  "Taiwan WRA",
  "Tajikistan Hydromet",
  "Tank Model (Laos/Myanmar)",
  "Tanzania DAWASA",
  "Tanzania TMA",
  "Thailand BMA",
  "Thailand TMD",
  "Timor-Leste DNMG",
  "Trapezoidal",
  "Triangular",
  "Trinidad & Tobago",
  "Tropical Cyclone Rainband",
  "Trupl (Czech)",
  "Tunisia ANPE",
  "Tunisia INM",
  "Turkey DSİ",
  "Turkey MGM",
  "Turkmenistan Turkmenhydromet",
  "Tuvalu TCAP/UNDP",
  "TxDOT",
  "Type II FL-Modified",
  "Témez (Spain)",
  "UAE NCMS",
  "UDFCD Denver",
  "UKCP09 Legacy",
  "UKCP18 Enhanced",
  "UPM Río de la Plata",
  "US NOAA Climate-Adjusted",
  "USACE SPS",
  "Uganda NWSC",
  "Uganda UNMA",
  "Ukrainian DBN",
  "Ukrainian DSTU",
  "Urban Heat Island",
  "Urban Pluvial Flood",
  "Uruguay INUMET",
  "Uzbekistan UHM",
  "Vanuatu Van-KIRAP",
  "Venezuela INAMEH",
  "Vermont VTrans",
  "Vietnam HCMC",
  "Vietnam Hanoi",
  "Vietnam IMHEN",
  "Virginia VDOT",
  "Volcanic Ash-Enhanced",
  "Watt's Curve (UK)",
  "Weibull Temporal",
  "Wellington Regional",
  "West Africa CIEH",
  "West Africa CILSS",
  "Winnipeg MacLaren",
  "Wrocław 2050",
  "Wyoming WYDOT",
  "XGBoost Storm Prediction",
  "Yemen CAMA",
  "Yemen Sana'a",
  "Yen & Chow",
  "Yukon Highways",
  "Zambia WARMA",
  "Zimbabwe Sala Manuals",
  "Zimbabwe ZINWA",
  "ÖWAV Rb 11",
  "Šamaj-Valovič",
];

const Index = () => {
  const [searchParams] = useSearchParams();
  const sharedStorm = useMemo(() => {
    const stormParam = searchParams.get('storm');
    if (stormParam) {
      return decodeStormParams(stormParam) || null;
    }
    return null;
  }, []);

  useEffect(() => {
    if (sharedStorm) {
      toast.info("Shared storm loaded! Review the configuration below.");
    }
  }, [sharedStorm]);

  const [activeTab, setActiveTab] = useState("generator");
  const [externalStormParams, setExternalStormParams] = useState<{ depth: number; duration: number } | null>(null);
  const [idfCityData, setIdfCityData] = useState<{ name: string; lat: string; lon: string } | null>(null);
  const [heroPattern, setHeroPattern] = useState<string | undefined>(undefined);
  const [stormContext, setStormContext] = useState<string>("");
  const heroRef = useRef<HTMLDivElement>(null);

  const handleSendToGenerator = useCallback((depthInches: number, durationHours: number) => {
    setExternalStormParams({ depth: depthInches, duration: durationHours });
    setActiveTab("generator");
    toast.success(`Storm parameters sent: ${(depthInches * 25.4).toFixed(1)} mm / ${(durationHours * 60).toFixed(0)} min`);
  }, []);

  const handleViewIdf = useCallback((city: { name: string; lat: number; lon: number }) => {
    setIdfCityData({ name: city.name, lat: city.lat.toFixed(4), lon: city.lon.toFixed(4) });
    setActiveTab("docs");
    toast.success(`Loading IDF data for ${city.name}…`);
    // Scroll to IDF calculator after tab switch
    setTimeout(() => {
      document.getElementById("calc-idf")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-rain text-white shadow-lg relative overflow-hidden">
        <RainParticles />
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="container mx-auto px-4 py-12 text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Droplets className="w-12 h-12" />
            <h1 className="text-5xl font-bold">World Rainfall Pattern Painter</h1>
          </div>
          <p className="text-lg max-w-3xl mx-auto opacity-95">
            Generate and visualize synthetic rainfall patterns for stormwater modeling. 
            Create SWMM5 and ICM-ready timeseries with custom parameters.
          </p>

          {/* Hero Hyetograph Preview */}
          <div ref={heroRef} className="mt-8 mb-4 inline-block px-4 pb-4 pt-2">
            <HeroHyetograph patternName={heroPattern} />
            <p className="text-sm font-medium tracking-wide text-cyan-200/90 mt-3 text-center transition-all duration-300">
              {getHeroPatternLabel(heroPattern)}
            </p>
          </div>

          {/* Pattern Badges */}
          <div className="relative mt-4 max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-center gap-1.5 max-h-[200px] sm:max-h-[300px] lg:max-h-none overflow-y-auto px-2 py-1 scrollbar-thin">
              {PATTERN_BADGES.map((name) => (
                <Badge
                  key={name}
                  variant="secondary"
                  className={`text-xs backdrop-blur-sm cursor-pointer transition-all duration-200 ${
                    heroPattern === name
                      ? "bg-white/60 text-blue-900 border-white/80 shadow-md scale-105"
                      : "bg-white/30 text-white border-white/40 hover:bg-white/50 hover:scale-105"
                  }`}
                  onClick={() => setHeroPattern(heroPattern === name ? undefined : name)}
                >
                  {name}
                </Badge>
              ))}
            </div>
            <div className="lg:hidden pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[hsl(220,70%,35%)] to-transparent" />
          </div>

          {/* GIF Export */}
          <HeroGifExport
            patternNames={PATTERN_BADGES}
            onPatternChange={(name) => setHeroPattern(name || undefined)}
            captureRef={heroRef}
          />

          {/* Statistics Counters */}
          {(() => {
            const globalCities = Object.values(COUNTRIES).reduce((sum, c) => sum + Object.keys(c.cities).length, 0);
            const globalCountries = Object.keys(COUNTRIES).length;
            const totalIdfCities = globalCities + canadaIdfDatabase.length + chinaRainstormDatabase.length + 8;
            const idfCountries = globalCountries + 2; // +Canada, +China (Gulf states already in COUNTRIES)
            const totalIdfDataPoints = totalIdfCities * 6 * 15; // 6 return periods × 15 durations
            return (
              <div className="flex flex-wrap justify-center gap-6 mt-6">
                <div className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{patterns.length}</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">Storm Patterns</p>
                </div>
                <div className="w-px bg-primary-foreground/20 hidden sm:block" />
                <div className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{idfCountries}+</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">IDF Countries</p>
                </div>
                <div className="w-px bg-primary-foreground/20 hidden sm:block" />
                <div className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{totalIdfCities}+</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">IDF Cities</p>
                </div>
                <div className="w-px bg-primary-foreground/20 hidden sm:block" />
                <div className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{(totalIdfDataPoints / 1000).toFixed(0)}k+</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">IDF Data Points</p>
                </div>
                <div className="w-px bg-primary-foreground/20 hidden sm:block" />
                <div className="text-center px-4">
                  <p className="text-2xl md:text-3xl font-bold text-primary-foreground">{idfCountries}+</p>
                  <p className="text-xs opacity-80 uppercase tracking-wider">Storm Countries</p>
                </div>
              </div>
            );
          })()}

          {/* Social Proof / Compatibility */}
          <p className="text-xs mt-4 opacity-80">
            Compatible with EPA SWMM · HEC-HMS · InfoWorks ICM · InfoDrainage · PCSWMM · XP-SWMM · HydroCAD
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full mb-8 overflow-x-auto scrollbar-thin sm:grid sm:grid-cols-5">
            <TabsTrigger value="generator" className="flex items-center gap-2 min-w-max">
              <CloudRain className="w-4 h-4" />
              <span className="hidden sm:inline">Storm Generator</span>
              <span className="sm:hidden">Generator</span>
            </TabsTrigger>
            <TabsTrigger value="realdata" className="flex items-center gap-2 min-w-max">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Real Data Hub</span>
              <span className="sm:hidden">Real Data</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2 min-w-max">
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">Advanced Tools</span>
              <span className="sm:hidden">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2 min-w-max">
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">API Playground</span>
              <span className="sm:hidden">API</span>
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2 min-w-max">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Documentation</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-8">
            {/* Introduction */}
            <section className="bg-card p-6 rounded-xl shadow-card border border-border">
              <h2 className="text-2xl font-semibold mb-3 text-foreground">Create Synthetic Storms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Follow the 4-step workflow below to define your storm parameters,
                select a rainfall pattern, review &amp; export data for your stormwater models,
                and optionally test all patterns. For pattern comparisons and advanced analysis,
                visit the <strong>Advanced Tools</strong> tab.
              </p>
            </section>

            {/* Wizard */}
            <StormWizard
              externalStormParams={externalStormParams}
              onExternalParamsConsumed={() => setExternalStormParams(null)}
              initialShareParams={sharedStorm}
              onStormContextChange={setStormContext}
            />
          </TabsContent>

          <TabsContent value="realdata">
            <RealDataHub />
          </TabsContent>

          <TabsContent value="advanced">
            <AdvancedTools onSendToGenerator={handleSendToGenerator} onViewIdf={handleViewIdf} />
          </TabsContent>

          <TabsContent value="api">
            <ApiPlayground />
          </TabsContent>

          <TabsContent value="docs">
            <Documentation idfCity={idfCityData} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p className="font-medium mb-2">World Rainfall Pattern Painter – Synthetic Rainfall Patterns for Stormwater Modeling</p>
          <p className="text-sm">Designed for hydrologists and engineers worldwide</p>
        </div>
      </footer>

      {/* AI Storm Assistant */}
      <StormChatbot stormContext={stormContext} />
    </div>
  );
};

export default Index;
