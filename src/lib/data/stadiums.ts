/** Stadium metadata for knockout venues */
export const STADIUM_INFO: Record<string, { city: string; capacity: number }> = {
  "SoFi Stadium, Inglewood": { city: "Los Angeles", capacity: 70240 },
  "NRG Stadium, Houston": { city: "Houston", capacity: 72220 },
  "Gillette Stadium, Foxborough": { city: "Boston", capacity: 65878 },
  "Estadio BBVA, Guadalupe": { city: "Monterrey", capacity: 53500 },
  "AT&T Stadium, Arlington": { city: "Dallas", capacity: 92000 },
  "MetLife Stadium, New Jersey": { city: "New York", capacity: 82500 },
  "Estadio Azteca, Mexico City": { city: "Mexico City", capacity: 87523 },
  "Mercedes-Benz Stadium, Atlanta": { city: "Atlanta", capacity: 71000 },
  "Lumen Field, Seattle": { city: "Seattle", capacity: 69000 },
  "Levi's Stadium, Santa Clara": { city: "San Francisco", capacity: 68500 },
  "BMO Field, Toronto": { city: "Toronto", capacity: 45736 },
  "BC Place, Vancouver": { city: "Vancouver", capacity: 54500 },
  "Hard Rock Stadium, Miami Gardens": { city: "Miami", capacity: 65326 },
  "Arrowhead Stadium, Kansas City": { city: "Kansas City", capacity: 76416 },
  "Lincoln Financial Field, Philadelphia": { city: "Philadelphia", capacity: 69596 },
};

export function getStadiumMeta(venue?: string) {
  if (!venue) return null;
  return STADIUM_INFO[venue] ?? null;
}
