# Storm API Documentation — v3.0.0

> Public REST API for generating synthetic rainfall hyetographs and analyzing storm data.
> Supports **265 rainfall distribution patterns** spanning global standards, regional codes, climate-adjusted variants, and specialized storm scenarios.
>
> **Base URL:** `https://psbaxqgkhunxkdrecknh.supabase.co/functions/v1/storm-api`

---

## Authentication

No authentication is required. All endpoints are publicly accessible.

---

## Endpoints

### 1. Health Check

```
GET /storm-api
```

Returns API info and available endpoints.

**Example:**

```bash
curl https://psbaxqgkhunxkdrecknh.supabase.co/functions/v1/storm-api
```

---

### 2. List Patterns

```
GET /storm-api/patterns
```

Returns all 265 available rainfall distribution patterns with metadata.

**Response:**

```json
{
  "patterns": [
    {
      "id": "scs2",
      "name": "SCS Type II",
      "region": "US General",
      "description": "Most of US (moderate climate)"
    }
  ],
  "count": 265
}
```

**Example:**

```bash
curl https://psbaxqgkhunxkdrecknh.supabase.co/functions/v1/storm-api/patterns
```

---

### 3. Generate Hyetograph

```
POST /storm-api/generate
```

Generate a design-storm hyetograph from a synthetic rainfall pattern.

**Request Body:**

| Field           | Type   | Required | Description                        | Constraints    |
|-----------------|--------|----------|------------------------------------|----------------|
| `pattern`       | string | Yes      | Pattern ID (see `/patterns`)       | Must be valid  |
| `total_depth`   | number | Yes      | Total rainfall depth (inches)      | 0–100          |
| `duration_hr`   | number | Yes      | Storm duration (hours)             | 0–72           |
| `time_step_min` | number | No       | Time step interval (minutes)       | 1–360 (default: 15) |

**Example Request:**

```bash
curl -X POST https://psbaxqgkhunxkdrecknh.supabase.co/functions/v1/storm-api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "scs2",
    "total_depth": 4,
    "duration_hr": 6,
    "time_step_min": 15
  }'
```

**Example Response:**

```json
{
  "pattern": "scs2",
  "total_depth": 4,
  "duration_hr": 6,
  "time_step_min": 15,
  "data_points": 24,
  "data": [
    { "time_min": 0,  "intensity": 0.1234, "cumulative": 0.0309 },
    { "time_min": 15, "intensity": 0.1567, "cumulative": 0.07   },
    { "time_min": 30, "intensity": 0.2012, "cumulative": 0.1203 }
  ]
}
```

**Response Fields:**

| Field         | Description                              |
|---------------|------------------------------------------|
| `time_min`    | Time from storm start (minutes)          |
| `intensity`   | Rainfall intensity (inches/hour)         |
| `cumulative`  | Cumulative rainfall depth (inches)       |

---

### 4. Analyze Storm Data

```
POST /storm-api/analyze
```

Analyze a raw rainfall timeseries and compute storm statistics.

**Request Body:**

| Field  | Type  | Required | Description                                     |
|--------|-------|----------|-------------------------------------------------|
| `data` | array | Yes      | Array of `{time_min, intensity}` objects (min 2) |

**Example Request:**

```bash
curl -X POST https://psbaxqgkhunxkdrecknh.supabase.co/functions/v1/storm-api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "data": [
      { "time_min": 0,  "intensity": 0.1 },
      { "time_min": 15, "intensity": 0.5 },
      { "time_min": 30, "intensity": 2.8 },
      { "time_min": 45, "intensity": 4.5 },
      { "time_min": 60, "intensity": 3.2 },
      { "time_min": 75, "intensity": 1.4 },
      { "time_min": 90, "intensity": 0.4 }
    ]
  }'
```

**Example Response:**

```json
{
  "analysis": {
    "total_depth": 1.55,
    "duration_min": 90,
    "peak_intensity": 4.5,
    "peak_time_min": 45,
    "peak_position": 0.5,
    "centroid": 0.467,
    "quartile_fractions_pct": {
      "q1": 3.2,
      "q2": 39.4,
      "q3": 41.9,
      "q4": 15.5
    },
    "dominant_quartile": 3
  }
}
```

**Analysis Fields:**

| Field                     | Description                                          |
|---------------------------|------------------------------------------------------|
| `total_depth`             | Total rainfall depth (inches)                        |
| `duration_min`            | Storm duration (minutes)                             |
| `peak_intensity`          | Maximum intensity (inches/hour)                      |
| `peak_time_min`           | Time of peak intensity (minutes from start)          |
| `peak_position`           | Normalized peak position (0 = start, 1 = end)        |
| `centroid`                | Intensity-weighted temporal centroid (0–1)            |
| `quartile_fractions_pct`  | Percentage of total depth in each temporal quartile   |
| `dominant_quartile`       | Which quartile contains the most rainfall (1–4)       |

---

## Error Handling

All errors return a JSON object with an `error` field:

```json
{
  "error": "Invalid pattern. Use GET /patterns for the list."
}
```

| Status | Meaning                  |
|--------|--------------------------|
| 200    | Success                  |
| 400    | Invalid request / input  |
| 404    | Unknown endpoint         |

---

## Pattern Categories

The 265 patterns are organized into the following categories:

### US Standards (SCS/NRCS)
`scs1`, `scs1a`, `scs2`, `scs3`, `scs2a`

### Chicago / Alternating Block Variants
`chicago`, `chicago_sym`, `sifalda`, `danish_svk`, `temez_spain`, `desbordes`, `santa_barbara`, `turkey_dsi`, `iran_irimet`, `hong_kong_dsd`, `malaysia_msma`, `colombia_ideam`, `indonesia_bmkg`

### Euler Types
`euler1`, `euler2`

### Huff Quartile Distributions
`huff1`, `huff2`, `huff3`, `huff4`

### UK / Europe
`fsr`, `feh`, `wallingford`, `uk_feh_winter`, `uk_feh_summer`, `netherlands_knmi`, `belgium_willems`, `poland_bs`, `blaszczyk`, `italy_vapi`, `greece_ntua`, `portugal_lnec`, `romania_inmh`, `czech_chmi`, `hungary_omsz`, `austria_ehyd`, `switzerland_idf`, `norway_met`, `sweden_smhi`, `finland_fmi`, `denmark_dmi`, `iceland_imo`, `ireland_opw`, `scotland_sepa`, `balkan_composite`, `baltic_composite`, `iberian_composite`, `alpine_composite`, `nordic_composite`, `france_montana`, `germany_kostra`

### Australia / Oceania
`arr`, `australia_bom`, `arr_arid`, `new_zealand_hirds`, `pacific_island`

### Asia
`japan_mlit`, `korea_molit`, `india_imd`, `india_imd_sw_monsoon`, `taiwan_wra`, `philippines_pagasa`, `thailand_tmd`, `vietnam_monre`, `nepal_dhm`, `bangladesh_bmd`, `sri_lanka_dom`, `myanmar_dmh`, `pakistan_pmd`, `singapore_pub`, `japan_mlit_typhoon`

### Middle East / Africa
`dubai_municipality`, `dubai_dm_combined`, `saudi_mewa`, `qatar_kahramaa`, `oman_mhews`, `bahrain_mow`, `kuwait_mpw`, `egypt_nwrc`, `ethiopia_nmsa`, `kenya_kmd`, `nigeria_nimet`, `south_africa_saws`, `morocco_dmn`, `tunisia_inm`, `israel_ims`, `jordan_jmd`, `lebanon_beirut_aub`, `iraq_imo`, `iran_irimo_tehran`, `uae_ncm`, `gcc_composite`

### Americas
`brazil_cetesb`, `argentina_ina`, `chile_dga`, `mexico_conagua`, `peru_senamhi`, `venezuela_inameh`, `ecuador_inamhi`, `uruguay_dinagua`, `paraguay_dinac`, `bolivia_altiplano`, `canada_scs2_mod`

### Climate-Adjusted
`rcp45_mid`, `rcp85_late`, `ssp245_2050`, `ssp585_2100`, `super_cc_plus20`, `super_cc_plus30`, `cc_idf_scaled`

### Specialized Storm Scenarios
`medicane`, `derecho`, `atmospheric_river`, `pineapple_express`, `bomb_cyclone`, `lake_effect`, `nor_easter`, `mesoscale_convective`, `supercell`, `tropical_band`, `post_wildfire`, `urban_heat_island`, `orographic_enhanced`

### Mathematical / Theoretical
`block`, `triangular`, `balanced`, `alternating_block`, `ietd`, `double_triangle`, `exponential_decay`, `beta_sym`, `cosine_storm`, `parabolic`, `bimodal_tropical`, `lognormal`, `weibull`, `pearson3`, `gev_storm`, `composite_design`, `fourier_multipeak`, `g2p_gamma`, `copula_bivariate`, `stochastic_bartlett_lewis`

### Former Soviet / Central Asia
`russia_snip`, `caucasus_nea`, `central_asia_kazhydromet`, `albania_igewe`, `former_soviet_snip`

For the complete list with descriptions, call `GET /storm-api/patterns`.

---

## Rate Limits

There are no rate limits currently enforced. Please use responsibly.

---

## Volume Conservation

All patterns are verified to conserve total rainfall depth within a 2% tolerance. The sum of `intensity × time_step` across all data points equals the requested `total_depth`. All intensities are non-negative and cumulative values are monotonically non-decreasing.

---

## Interactive Playground

Try the API interactively at [rain-canvas-studio.lovable.app](https://rain-canvas-studio.lovable.app) — navigate to the **API Playground** tab to send requests from your browser and visualize results.
