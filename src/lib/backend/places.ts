// Sorted longest-first so more specific names match before shorter substrings.
export const METRO_VANCOUVER_PLACES: readonly string[] = [
  // Malls & shopping
  "Metropolis at Metrotown",
  "Capilano Suspension Bridge",
  "Vancouver Convention Centre",
  "VanDusen Botanical Garden",
  "Pacific Spirit Regional Park",
  "Brentwood Town Centre",
  "Lougheed Town Centre",
  "Guildford Town Centre",
  "Vancouver Art Gallery",
  "BC Place Stadium",
  "Oakridge Centre",
  "Pacific Centre",
  "Marine Gateway",
  "Park Royal",
  "Metrotown",

  // Landmarks & venues
  "Rogers Arena",
  "Science World",
  "Canada Place",
  "Granville Island",
  "Stanley Park",
  "Queen Elizabeth Park",
  "Burnaby Mountain",
  "Cypress Mountain",
  "Grouse Mountain",
  "Gastown Steam Clock",
  "Robson Square",
  "Burrard Bridge",
  "Lions Gate Bridge",
  "Cambie Bridge",

  // Beaches & parks
  "Spanish Banks",
  "Jericho Beach",
  "Kitsilano Beach",
  "Sunset Beach",
  "English Bay",
  "Second Beach",
  "Third Beach",
  "Wreck Beach",
  "Locarno Beach",
  "John Hendry Park",
  "Hastings Park",
  "Trout Lake Park",
  "Central Park",
  "Trout Lake",

  // Vancouver neighborhoods
  "Mount Pleasant",
  "Commercial Drive",
  "South Granville",
  "Coal Harbour",
  "False Creek",
  "Davie Village",
  "Punjabi Market",
  "Little India",
  "Little Italy",
  "Chinatown",
  "Gastown",
  "Yaletown",
  "Kitsilano",
  "Fairview",
  "Strathcona",
  "Grandview",
  "Shaughnessy",
  "Kerrisdale",
  "Marpole",
  "Dunbar",
  "Riley Park",
  "West End",
  "East Van",
  "Downtown",
  "UBC",

  // Metro Vancouver cities/municipalities
  "New Westminster",
  "North Vancouver",
  "West Vancouver",
  "Port Coquitlam",
  "Port Moody",
  "Coquitlam",
  "Maple Ridge",
  "Pitt Meadows",
  "White Rock",
  "Tsawwassen",
  "Abbotsford",
  "Burnaby",
  "Richmond",
  "Langley",
  "Mission",
  "Surrey",
  "Delta",
  "North Van",
  "West Van",

  // Major streets
  "Robson Street",
  "Granville Street",
  "Hastings Street",
  "Cambie Street",
  "Burrard Street",
  "Denman Street",
  "Davie Street",
  "Fraser Street",
  "Main Street",
  "Broadway",
  "Seawall",
  "Waterfront",
];

// Matches prepositions followed by a potential place name.
const PREP_RE =
  /\b(?:near|at|outside|on|by|in)\s+([A-Za-z][A-Za-z0-9 ]{1,49}?)(?=[,!?.\n"']|$|\s+(?:and|but|or|is|was|has|have|the|a|an|with|for|to|of)\b)/gi;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractPlaceName(text: string): string | null {
  for (const place of METRO_VANCOUVER_PLACES) {
    const re = new RegExp(`\\b${escapeRegex(place)}\\b`, "i");
    if (re.test(text)) return place;
  }

  PREP_RE.lastIndex = 0;
  const match = PREP_RE.exec(text);
  if (match) return match[1].trim();

  return null;
}
