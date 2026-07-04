/** Expanded stadium metadata for host cities guide */
export interface StadiumMeta {
  id: string;
  name: string;
  city: string;
  country: "USA" | "Mexico" | "Canada";
  capacity: number;
  surface: string;
  climate: string;
  gettingThere: string;
  lat: number;
  lng: number;
}

export const STADIUMS: StadiumMeta[] = [
  { id: "sofi", name: "SoFi Stadium", city: "Los Angeles", country: "USA", capacity: 70240, surface: "Natural grass", climate: "Warm, dry summers", gettingThere: "Metro E Line to Downtown Inglewood; rideshare drop-off at Lot P", lat: 33.953, lng: -118.339 },
  { id: "nrg", name: "NRG Stadium", city: "Houston", country: "USA", capacity: 72220, surface: "Natural grass", climate: "Hot & humid", gettingThere: "METRORail Red Line to NRG Park", lat: 29.685, lng: -95.411 },
  { id: "gillette", name: "Gillette Stadium", city: "Boston", country: "USA", capacity: 65878, surface: "FieldTurf", climate: "Mild summer evenings", gettingThere: "Patriot Place shuttle from Foxborough MBTA", lat: 42.091, lng: -71.264 },
  { id: "bbva", name: "Estadio BBVA", city: "Monterrey", country: "Mexico", capacity: 53500, surface: "Natural grass", climate: "Semi-arid, warm", gettingThere: "Metrorrey Line 1 to Universidad", lat: 25.669, lng: -100.244 },
  { id: "att", name: "AT&T Stadium", city: "Dallas", country: "USA", capacity: 92000, surface: "Artificial turf", climate: "Hot; climate-controlled dome", gettingThere: "Arlington Xpress from CentrePort DART", lat: 32.748, lng: -97.093 },
  { id: "metlife", name: "MetLife Stadium", city: "New York", country: "USA", capacity: 82500, surface: "FieldTurf", climate: "Humid subtropical", gettingThere: "NJ Transit to Meadowlands Rail", lat: 40.813, lng: -74.074 },
  { id: "azteca", name: "Estadio Azteca", city: "Mexico City", country: "Mexico", capacity: 87523, surface: "Natural grass", climate: "High altitude, mild", gettingThere: "Metro Line 2 to Tasqueña + light rail", lat: 19.303, lng: -99.15 },
  { id: "mercedes", name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", capacity: 71000, surface: "FieldTurf", climate: "Hot & humid", gettingThere: "MARTA Green/Blue to Vine City", lat: 33.755, lng: -84.401 },
  { id: "lumen", name: "Lumen Field", city: "Seattle", country: "USA", capacity: 69000, surface: "FieldTurf", climate: "Cool, dry summers", gettingThere: "Link Light Rail to Stadium station", lat: 47.595, lng: -122.332 },
  { id: "levis", name: "Levi's Stadium", city: "San Francisco", country: "USA", capacity: 68500, surface: "Natural grass", climate: "Mild Bay Area", gettingThere: "VTA Light Rail to Great America", lat: 37.403, lng: -121.97 },
  { id: "bmo", name: "BMO Field", city: "Toronto", country: "Canada", capacity: 45736, surface: "Natural grass", climate: "Warm summers on the lake", gettingThere: "TTC Exhibition GO/streetcar 509", lat: 43.633, lng: -79.419 },
  { id: "bcplace", name: "BC Place", city: "Vancouver", country: "Canada", capacity: 54500, surface: "FieldTurf", climate: "Mild, rainy possible", gettingThere: "SkyTrain to Stadium–Chinatown", lat: 49.277, lng: -123.108 },
  { id: "hardrock", name: "Hard Rock Stadium", city: "Miami", country: "USA", capacity: 65326, surface: "Natural grass", climate: "Tropical heat & storms", gettingThere: "Rideshare; limited Metrorail + shuttle", lat: 25.958, lng: -80.239 },
  { id: "arrowhead", name: "Arrowhead Stadium", city: "Kansas City", country: "USA", capacity: 76416, surface: "Natural grass", climate: "Hot Midwest summers", gettingThere: "KC Streetcar + game-day shuttle", lat: 39.049, lng: -94.484 },
  { id: "lincoln", name: "Lincoln Financial Field", city: "Philadelphia", country: "USA", capacity: 69596, surface: "Natural grass", climate: "Humid continental", gettingThere: "Broad Street Line to AT&T", lat: 39.901, lng: -75.168 },
];

/** Legacy venue string keys from tournament data */
export const STADIUM_INFO: Record<string, { city: string; capacity: number }> = Object.fromEntries(
  STADIUMS.map((s) => [`${s.name}, ${s.city === "Los Angeles" ? "Inglewood" : s.city === "Miami" ? "Miami Gardens" : s.city === "Boston" ? "Foxborough" : s.city === "Dallas" ? "Arlington" : s.city === "New York" ? "New Jersey" : s.city === "Mexico City" ? "Mexico City" : s.city === "Monterrey" ? "Guadalupe" : s.city === "San Francisco" ? "Santa Clara" : s.city}`, { city: s.city, capacity: s.capacity }])
);

// Fix exact keys used in tournament.ts
STADIUM_INFO["SoFi Stadium, Inglewood"] = { city: "Los Angeles", capacity: 70240 };
STADIUM_INFO["NRG Stadium, Houston"] = { city: "Houston", capacity: 72220 };
STADIUM_INFO["Gillette Stadium, Foxborough"] = { city: "Boston", capacity: 65878 };
STADIUM_INFO["Estadio BBVA, Guadalupe"] = { city: "Monterrey", capacity: 53500 };
STADIUM_INFO["AT&T Stadium, Arlington"] = { city: "Dallas", capacity: 92000 };
STADIUM_INFO["MetLife Stadium, New Jersey"] = { city: "New York", capacity: 82500 };
STADIUM_INFO["Estadio Azteca, Mexico City"] = { city: "Mexico City", capacity: 87523 };
STADIUM_INFO["Mercedes-Benz Stadium, Atlanta"] = { city: "Atlanta", capacity: 71000 };
STADIUM_INFO["Lumen Field, Seattle"] = { city: "Seattle", capacity: 69000 };
STADIUM_INFO["Levi's Stadium, Santa Clara"] = { city: "San Francisco", capacity: 68500 };
STADIUM_INFO["BMO Field, Toronto"] = { city: "Toronto", capacity: 45736 };
STADIUM_INFO["BC Place, Vancouver"] = { city: "Vancouver", capacity: 54500 };
STADIUM_INFO["Hard Rock Stadium, Miami Gardens"] = { city: "Miami", capacity: 65326 };
STADIUM_INFO["Arrowhead Stadium, Kansas City"] = { city: "Kansas City", capacity: 76416 };
STADIUM_INFO["Lincoln Financial Field, Philadelphia"] = { city: "Philadelphia", capacity: 69596 };

export function getStadiumMeta(venue?: string) {
  if (!venue) return null;
  return STADIUM_INFO[venue] ?? null;
}

export function getStadiumByVenue(venue?: string): StadiumMeta | null {
  if (!venue) return null;
  const meta = getStadiumMeta(venue);
  if (!meta) return null;
  return STADIUMS.find((s) => s.city === meta.city && venue.includes(s.name.split(" ")[0])) ?? STADIUMS.find((s) => venue.includes(s.name)) ?? null;
}

export function getStadiumById(id: string): StadiumMeta | undefined {
  return STADIUMS.find((s) => s.id === id);
}

export function matchesAtVenue(venue: string, allVenues: string[]): string[] {
  const meta = getStadiumMeta(venue);
  if (!meta) return [venue];
  return allVenues.filter((v) => getStadiumMeta(v)?.city === meta.city);
}
