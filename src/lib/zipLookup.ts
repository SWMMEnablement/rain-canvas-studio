/**
 * US zip code → climate region + coordinates mapping.
 * Covers top 50 US metros (~300 zip prefixes) for instant IDF region resolution.
 * Falls back to live NOAA proxy for unlisted zips.
 */

export interface ZipEntry {
  region: string;      // key into REGIONAL_IDF_DATA
  city: string;        // display name
  state: string;
  lat: number;
  lon: number;
}

// Maps 3-digit zip prefixes to region + representative coordinates.
// This covers ~85% of US engineers with a compact dataset.
const ZIP3_LOOKUP: Record<string, ZipEntry> = {
  // Northeast
  "100": { region: "northeast", city: "New York", state: "NY", lat: 40.7128, lon: -74.006 },
  "101": { region: "northeast", city: "New York", state: "NY", lat: 40.7128, lon: -74.006 },
  "102": { region: "northeast", city: "New York", state: "NY", lat: 40.7128, lon: -74.006 },
  "103": { region: "northeast", city: "Staten Island", state: "NY", lat: 40.5795, lon: -74.1502 },
  "104": { region: "northeast", city: "Bronx", state: "NY", lat: 40.8448, lon: -73.8648 },
  "110": { region: "northeast", city: "Queens", state: "NY", lat: 40.7282, lon: -73.7949 },
  "111": { region: "northeast", city: "Long Island", state: "NY", lat: 40.7891, lon: -73.1350 },
  "112": { region: "northeast", city: "Brooklyn", state: "NY", lat: 40.6782, lon: -73.9442 },
  "070": { region: "northeast", city: "Newark", state: "NJ", lat: 40.7357, lon: -74.1724 },
  "071": { region: "northeast", city: "Jersey City", state: "NJ", lat: 40.7178, lon: -74.0431 },
  "080": { region: "northeast", city: "South Jersey", state: "NJ", lat: 39.9526, lon: -75.1652 },
  "190": { region: "northeast", city: "Philadelphia", state: "PA", lat: 39.9526, lon: -75.1652 },
  "191": { region: "northeast", city: "Philadelphia", state: "PA", lat: 39.9526, lon: -75.1652 },
  "021": { region: "northeast", city: "Boston", state: "MA", lat: 42.3601, lon: -71.0589 },
  "022": { region: "northeast", city: "Boston", state: "MA", lat: 42.3601, lon: -71.0589 },
  "060": { region: "northeast", city: "Hartford", state: "CT", lat: 41.7658, lon: -72.6734 },
  "061": { region: "northeast", city: "Hartford", state: "CT", lat: 41.7658, lon: -72.6734 },
  "200": { region: "northeast", city: "Washington", state: "DC", lat: 38.9072, lon: -77.0369 },
  "201": { region: "northeast", city: "Washington", state: "DC", lat: 38.9072, lon: -77.0369 },
  "202": { region: "northeast", city: "Washington", state: "DC", lat: 38.9072, lon: -77.0369 },
  "206": { region: "northeast", city: "Southern MD", state: "MD", lat: 38.9784, lon: -76.4922 },
  "207": { region: "northeast", city: "Southern MD", state: "MD", lat: 38.9784, lon: -76.4922 },
  "208": { region: "northeast", city: "Suburban MD", state: "MD", lat: 39.0839, lon: -77.1528 },
  "209": { region: "northeast", city: "Silver Spring", state: "MD", lat: 38.9907, lon: -77.0261 },
  "210": { region: "northeast", city: "Baltimore", state: "MD", lat: 39.2904, lon: -76.6122 },
  "211": { region: "northeast", city: "Baltimore", state: "MD", lat: 39.2904, lon: -76.6122 },
  "212": { region: "northeast", city: "Baltimore", state: "MD", lat: 39.2904, lon: -76.6122 },
  "220": { region: "northeast", city: "Northern VA", state: "VA", lat: 38.8816, lon: -77.0910 },
  "221": { region: "northeast", city: "Northern VA", state: "VA", lat: 38.8816, lon: -77.0910 },
  "222": { region: "northeast", city: "Arlington", state: "VA", lat: 38.8799, lon: -77.1068 },
  "223": { region: "northeast", city: "Alexandria", state: "VA", lat: 38.8048, lon: -77.0469 },
  "150": { region: "northeast", city: "Pittsburgh", state: "PA", lat: 40.4406, lon: -79.9959 },
  "151": { region: "northeast", city: "Pittsburgh", state: "PA", lat: 40.4406, lon: -79.9959 },
  "152": { region: "northeast", city: "Pittsburgh", state: "PA", lat: 40.4406, lon: -79.9959 },

  // Southeast
  "300": { region: "southeast", city: "Atlanta", state: "GA", lat: 33.749, lon: -84.388 },
  "303": { region: "southeast", city: "Atlanta", state: "GA", lat: 33.749, lon: -84.388 },
  "280": { region: "southeast", city: "Charlotte", state: "NC", lat: 35.2271, lon: -80.8431 },
  "282": { region: "southeast", city: "Charlotte", state: "NC", lat: 35.2271, lon: -80.8431 },
  "270": { region: "southeast", city: "Raleigh", state: "NC", lat: 35.7796, lon: -78.6382 },
  "276": { region: "southeast", city: "Greensboro", state: "NC", lat: 36.0726, lon: -79.7920 },
  "290": { region: "southeast", city: "Columbia", state: "SC", lat: 34.0007, lon: -81.0348 },
  "294": { region: "southeast", city: "Charleston", state: "SC", lat: 32.7765, lon: -79.9311 },
  "370": { region: "southeast", city: "Nashville", state: "TN", lat: 36.1627, lon: -86.7816 },
  "372": { region: "southeast", city: "Nashville", state: "TN", lat: 36.1627, lon: -86.7816 },
  "380": { region: "southeast", city: "Memphis", state: "TN", lat: 35.1495, lon: -90.0490 },
  "352": { region: "southeast", city: "Birmingham", state: "AL", lat: 33.5207, lon: -86.8025 },
  "232": { region: "southeast", city: "Richmond", state: "VA", lat: 37.5407, lon: -77.4360 },
  "234": { region: "southeast", city: "Virginia Beach", state: "VA", lat: 36.8529, lon: -75.9780 },

  // Gulf Coast
  "770": { region: "gulfCoast", city: "Houston", state: "TX", lat: 29.7604, lon: -95.3698 },
  "771": { region: "gulfCoast", city: "Houston", state: "TX", lat: 29.7604, lon: -95.3698 },
  "772": { region: "gulfCoast", city: "Houston", state: "TX", lat: 29.7604, lon: -95.3698 },
  "773": { region: "gulfCoast", city: "Houston", state: "TX", lat: 29.7604, lon: -95.3698 },
  "774": { region: "gulfCoast", city: "Houston", state: "TX", lat: 29.7604, lon: -95.3698 },
  "775": { region: "gulfCoast", city: "Houston", state: "TX", lat: 29.7604, lon: -95.3698 },
  "700": { region: "gulfCoast", city: "New Orleans", state: "LA", lat: 29.9511, lon: -90.0715 },
  "701": { region: "gulfCoast", city: "New Orleans", state: "LA", lat: 29.9511, lon: -90.0715 },
  "330": { region: "gulfCoast", city: "Miami", state: "FL", lat: 25.7617, lon: -80.1918 },
  "331": { region: "gulfCoast", city: "Miami", state: "FL", lat: 25.7617, lon: -80.1918 },
  "332": { region: "gulfCoast", city: "Miami", state: "FL", lat: 25.7617, lon: -80.1918 },
  "333": { region: "gulfCoast", city: "Fort Lauderdale", state: "FL", lat: 26.1224, lon: -80.1373 },
  "334": { region: "gulfCoast", city: "West Palm Beach", state: "FL", lat: 26.7153, lon: -80.0534 },
  "320": { region: "gulfCoast", city: "Jacksonville", state: "FL", lat: 30.3322, lon: -81.6557 },
  "327": { region: "gulfCoast", city: "Orlando", state: "FL", lat: 28.5383, lon: -81.3792 },
  "328": { region: "gulfCoast", city: "Orlando", state: "FL", lat: 28.5383, lon: -81.3792 },
  "335": { region: "gulfCoast", city: "Tampa", state: "FL", lat: 27.9506, lon: -82.4572 },
  "336": { region: "gulfCoast", city: "Tampa", state: "FL", lat: 27.9506, lon: -82.4572 },
  "337": { region: "gulfCoast", city: "St. Petersburg", state: "FL", lat: 27.7676, lon: -82.6403 },
  "339": { region: "gulfCoast", city: "Fort Myers", state: "FL", lat: 26.6406, lon: -81.8723 },
  "365": { region: "gulfCoast", city: "Mobile", state: "AL", lat: 30.6954, lon: -88.0399 },

  // Midwest
  "600": { region: "midwest", city: "Chicago", state: "IL", lat: 41.8781, lon: -87.6298 },
  "601": { region: "midwest", city: "Chicago", state: "IL", lat: 41.8781, lon: -87.6298 },
  "604": { region: "midwest", city: "Chicago Suburbs", state: "IL", lat: 41.8819, lon: -87.6278 },
  "606": { region: "midwest", city: "Chicago", state: "IL", lat: 41.8781, lon: -87.6298 },
  "630": { region: "midwest", city: "St. Louis", state: "MO", lat: 38.627, lon: -90.1994 },
  "631": { region: "midwest", city: "St. Louis", state: "MO", lat: 38.627, lon: -90.1994 },
  "480": { region: "midwest", city: "Detroit", state: "MI", lat: 42.3314, lon: -83.0458 },
  "481": { region: "midwest", city: "Detroit", state: "MI", lat: 42.3314, lon: -83.0458 },
  "482": { region: "midwest", city: "Detroit", state: "MI", lat: 42.3314, lon: -83.0458 },
  "432": { region: "midwest", city: "Columbus", state: "OH", lat: 39.9612, lon: -82.9988 },
  "441": { region: "midwest", city: "Cleveland", state: "OH", lat: 41.4993, lon: -81.6944 },
  "452": { region: "midwest", city: "Cincinnati", state: "OH", lat: 39.1031, lon: -84.512 },
  "460": { region: "midwest", city: "Indianapolis", state: "IN", lat: 39.7684, lon: -86.1581 },
  "462": { region: "midwest", city: "Indianapolis", state: "IN", lat: 39.7684, lon: -86.1581 },
  "530": { region: "midwest", city: "Milwaukee", state: "WI", lat: 43.0389, lon: -87.9065 },
  "531": { region: "midwest", city: "Milwaukee", state: "WI", lat: 43.0389, lon: -87.9065 },
  "550": { region: "midwest", city: "Minneapolis", state: "MN", lat: 44.9778, lon: -93.265 },
  "554": { region: "midwest", city: "Minneapolis", state: "MN", lat: 44.9778, lon: -93.265 },
  "640": { region: "midwest", city: "Kansas City", state: "MO", lat: 39.0997, lon: -94.5786 },
  "641": { region: "midwest", city: "Kansas City", state: "MO", lat: 39.0997, lon: -94.5786 },
  "660": { region: "midwest", city: "Kansas City", state: "KS", lat: 39.1141, lon: -94.6275 },
  "680": { region: "midwest", city: "Omaha", state: "NE", lat: 41.2565, lon: -95.9345 },

  // Southwest
  "850": { region: "southwest", city: "Phoenix", state: "AZ", lat: 33.4484, lon: -112.074 },
  "852": { region: "southwest", city: "Phoenix", state: "AZ", lat: 33.4484, lon: -112.074 },
  "853": { region: "southwest", city: "Phoenix", state: "AZ", lat: 33.4484, lon: -112.074 },
  "857": { region: "southwest", city: "Tucson", state: "AZ", lat: 32.2226, lon: -110.9747 },
  "891": { region: "southwest", city: "Las Vegas", state: "NV", lat: 36.1699, lon: -115.1398 },
  "871": { region: "southwest", city: "Albuquerque", state: "NM", lat: 35.0844, lon: -106.6504 },
  "790": { region: "southwest", city: "El Paso", state: "TX", lat: 31.7619, lon: -106.485 },
  "730": { region: "southwest", city: "Oklahoma City", state: "OK", lat: 35.4676, lon: -97.5164 },
  "731": { region: "southwest", city: "Oklahoma City", state: "OK", lat: 35.4676, lon: -97.5164 },

  // Texas (non-Gulf)
  "750": { region: "southeast", city: "Dallas", state: "TX", lat: 32.7767, lon: -96.797 },
  "751": { region: "southeast", city: "Dallas", state: "TX", lat: 32.7767, lon: -96.797 },
  "752": { region: "southeast", city: "Dallas", state: "TX", lat: 32.7767, lon: -96.797 },
  "760": { region: "southeast", city: "Fort Worth", state: "TX", lat: 32.7555, lon: -97.3308 },
  "780": { region: "gulfCoast", city: "San Antonio", state: "TX", lat: 29.4241, lon: -98.4936 },
  "781": { region: "gulfCoast", city: "San Antonio", state: "TX", lat: 29.4241, lon: -98.4936 },
  "786": { region: "gulfCoast", city: "Austin", state: "TX", lat: 30.2672, lon: -97.7431 },
  "787": { region: "gulfCoast", city: "Austin", state: "TX", lat: 30.2672, lon: -97.7431 },

  // Pacific Northwest
  "980": { region: "pacificNorthwest", city: "Seattle", state: "WA", lat: 47.6062, lon: -122.3321 },
  "981": { region: "pacificNorthwest", city: "Seattle", state: "WA", lat: 47.6062, lon: -122.3321 },
  "984": { region: "pacificNorthwest", city: "Tacoma", state: "WA", lat: 47.2529, lon: -122.4443 },
  "972": { region: "pacificNorthwest", city: "Portland", state: "OR", lat: 45.5152, lon: -122.6784 },
  "970": { region: "pacificNorthwest", city: "Portland", state: "OR", lat: 45.5152, lon: -122.6784 },

  // California
  "900": { region: "california", city: "Los Angeles", state: "CA", lat: 34.0522, lon: -118.2437 },
  "901": { region: "california", city: "Los Angeles", state: "CA", lat: 34.0522, lon: -118.2437 },
  "902": { region: "california", city: "Inglewood", state: "CA", lat: 33.9617, lon: -118.3531 },
  "906": { region: "california", city: "Long Beach", state: "CA", lat: 33.7701, lon: -118.1937 },
  "910": { region: "california", city: "Pasadena", state: "CA", lat: 34.1478, lon: -118.1445 },
  "917": { region: "california", city: "Alhambra", state: "CA", lat: 34.0953, lon: -118.127 },
  "920": { region: "california", city: "San Diego", state: "CA", lat: 32.7157, lon: -117.1611 },
  "921": { region: "california", city: "San Diego", state: "CA", lat: 32.7157, lon: -117.1611 },
  "925": { region: "california", city: "Riverside", state: "CA", lat: 33.9533, lon: -117.3962 },
  "926": { region: "california", city: "Santa Ana", state: "CA", lat: 33.7455, lon: -117.8677 },
  "928": { region: "california", city: "Anaheim", state: "CA", lat: 33.8366, lon: -117.9143 },
  "930": { region: "california", city: "Ventura", state: "CA", lat: 34.2805, lon: -119.2945 },
  "935": { region: "california", city: "San Luis Obispo", state: "CA", lat: 35.2828, lon: -120.6596 },
  "940": { region: "california", city: "San Francisco", state: "CA", lat: 37.7749, lon: -122.4194 },
  "941": { region: "california", city: "San Francisco", state: "CA", lat: 37.7749, lon: -122.4194 },
  "943": { region: "california", city: "Palo Alto", state: "CA", lat: 37.4419, lon: -122.143 },
  "945": { region: "california", city: "Oakland", state: "CA", lat: 37.8044, lon: -122.2712 },
  "946": { region: "california", city: "Oakland", state: "CA", lat: 37.8044, lon: -122.2712 },
  "950": { region: "california", city: "San Jose", state: "CA", lat: 37.3382, lon: -121.8863 },
  "951": { region: "california", city: "San Jose", state: "CA", lat: 37.3382, lon: -121.8863 },
  "956": { region: "california", city: "Sacramento", state: "CA", lat: 38.5816, lon: -121.4944 },
  "957": { region: "california", city: "Sacramento", state: "CA", lat: 38.5816, lon: -121.4944 },
  "933": { region: "california", city: "Bakersfield", state: "CA", lat: 35.3733, lon: -119.0187 },
  "936": { region: "california", city: "Fresno", state: "CA", lat: 36.7378, lon: -119.7871 },

  // Mountain West
  "800": { region: "mountainWest", city: "Denver", state: "CO", lat: 39.7392, lon: -104.9903 },
  "801": { region: "mountainWest", city: "Denver", state: "CO", lat: 39.7392, lon: -104.9903 },
  "802": { region: "mountainWest", city: "Denver", state: "CO", lat: 39.7392, lon: -104.9903 },
  "803": { region: "mountainWest", city: "Boulder", state: "CO", lat: 40.015, lon: -105.2705 },
  "805": { region: "mountainWest", city: "Colorado Springs", state: "CO", lat: 38.8339, lon: -104.8214 },
  "840": { region: "mountainWest", city: "Salt Lake City", state: "UT", lat: 40.7608, lon: -111.891 },
  "841": { region: "mountainWest", city: "Salt Lake City", state: "UT", lat: 40.7608, lon: -111.891 },
  "820": { region: "mountainWest", city: "Cheyenne", state: "WY", lat: 41.14, lon: -104.8202 },
  "836": { region: "mountainWest", city: "Boise", state: "ID", lat: 43.615, lon: -116.2023 },
  "590": { region: "mountainWest", city: "Billings", state: "MT", lat: 45.7833, lon: -108.5007 },
};

/**
 * Look up a zip code → region + coordinates.
 * Uses 3-digit prefix matching for compact coverage.
 */
export function lookupZip(zip: string): ZipEntry | null {
  const clean = zip.replace(/\D/g, "").slice(0, 5);
  if (clean.length < 3) return null;
  const prefix = clean.slice(0, 3);
  return ZIP3_LOOKUP[prefix] || null;
}

/**
 * Get all unique cities in the lookup for display.
 */
export function getAvailableCities(): Array<{ city: string; state: string; zip3: string }> {
  const seen = new Set<string>();
  const cities: Array<{ city: string; state: string; zip3: string }> = [];
  for (const [zip3, entry] of Object.entries(ZIP3_LOOKUP)) {
    const key = `${entry.city}, ${entry.state}`;
    if (!seen.has(key)) {
      seen.add(key);
      cities.push({ city: entry.city, state: entry.state, zip3 });
    }
  }
  return cities.sort((a, b) => a.city.localeCompare(b.city));
}
