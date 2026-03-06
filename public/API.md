# Storm API Documentation

> Public REST API for generating synthetic rainfall hyetographs and analyzing storm data.
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

Returns all 65+ available rainfall distribution patterns with metadata.

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
  "count": 65
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

## Common Patterns Quick Reference

| ID          | Name             | Region       |
|-------------|------------------|--------------|
| `scs2`      | SCS Type II      | US General   |
| `scs1`      | SCS Type I       | US Pacific   |
| `scs3`      | SCS Type III     | US Gulf Coast|
| `chicago`   | Chicago          | US Urban     |
| `block`     | Uniform Block    | Universal    |
| `triangular`| Triangular       | UK           |
| `huff1`     | Huff Q1          | US Midwest   |
| `huff2`     | Huff Q2          | US Midwest   |
| `fsr`       | FSR (UK)         | UK           |
| `arr`       | ARR (Australia)  | Australia    |
| `balanced`  | Balanced Storm   | Universal    |

For the full list of 65+ patterns, call `GET /storm-api/patterns`.

---

## Rate Limits

There are no rate limits currently enforced. Please use responsibly.

---

## Interactive Playground

Try the API interactively at [rain-canvas-studio.lovable.app](https://rain-canvas-studio.lovable.app) — navigate to the **API Playground** tab to send requests from your browser and visualize results.
