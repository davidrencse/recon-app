'use strict';

// Terms that regex extraction commonly pulls but are too vague to geocode usefully.
// Single-word pronouns, directions, and common English nouns that aren't place names.
const VAGUE_TERMS = new Set([
  // articles / pronouns
  'a', 'an', 'the', 'it', 'this', 'that', 'here', 'there', 'me', 'us', 'you',
  // directions / relative location (not "downtown" — covered by KNOWN_PLACES_MAP)
  'home', 'work', 'school', 'uptown', 'out', 'outside',
  'north', 'south', 'east', 'west', 'left', 'right', 'centre', 'center',
  // time words regex sometimes captures
  'every', 'today', 'tonight', 'morning', 'evening', 'night', 'weekend',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  // too-large geography
  'north america', 'south america', 'canada', 'united states', 'the world',
  'the city', 'the area', 'the block', 'the corner', 'the end', 'the park',
  'the beach', 'the mall', 'the store', 'the office', 'the station',
  // common false positives from tweet text
  'last night', 'right now', 'all day', 'all night', 'my place', 'your place',
  // US states — regex sometimes captures these from political / news tweets
  'washington state', 'washington dc', 'new york', 'new jersey', 'new mexico',
  'new hampshire', 'north carolina', 'south carolina', 'north dakota', 'south dakota',
  'west virginia', 'rhode island', 'los angeles', 'san francisco', 'las vegas',
  'california', 'texas', 'florida', 'illinois', 'ohio', 'georgia', 'virginia',
  'michigan', 'arizona', 'colorado', 'oregon', 'nevada', 'utah', 'iowa',
  // Other non-Vancouver cities commonly appearing in Canadian political tweets
  'ottawa ontario', 'toronto ontario', 'calgary alberta', 'edmonton alberta',
  'winnipeg manitoba', 'montreal quebec', 'ottawa canada',
]);

// Canonical place names sorted longest-first so more specific names match first.
// Each entry is [alias_or_canonical_lowercase, canonical_display_name].
// Multiple entries can map to the same canonical (e.g. "kits" → "Kitsilano").
const KNOWN_PLACES_MAP = new Map([
  // === Landmarks & major venues ===
  ['metropolis at metrotown',       'Metropolis at Metrotown'],
  ['capilano suspension bridge',    'Capilano Suspension Bridge'],
  ['vancouver convention centre',   'Vancouver Convention Centre'],
  ['vancouver city hall',           'Vancouver City Hall'],
  ['city hall vancouver',           'Vancouver City Hall'],
  ['pacific spirit regional park',  'Pacific Spirit Regional Park'],
  ['vandusen botanical garden',     'VanDusen Botanical Garden'],
  ['queen elizabeth theatre',       'Queen Elizabeth Theatre'],
  ['commodore ballroom',            'Commodore Ballroom'],
  ['vancouver art gallery',         'Vancouver Art Gallery'],
  ['waterfront station',            'Waterfront Station'],
  ['burrard bridge',                'Burrard Bridge'],
  ['lions gate bridge',             'Lions Gate Bridge'],
  ['cambie bridge',                 'Cambie Bridge'],
  ['robson square',                 'Robson Square'],
  ['canada place',                  'Canada Place'],
  ['rogers arena',                  'Rogers Arena'],
  ['science world',                 'Science World'],
  ['bc place stadium',              'BC Place'],
  ['bc place',                      'BC Place'],
  ['pacific centre',                'Pacific Centre'],
  ['brentwood town centre',         'Brentwood Town Centre'],
  ['grouse mountain',               'Grouse Mountain'],
  ['cypress mountain',              'Cypress Mountain'],
  ['burnaby mountain',              'Burnaby Mountain'],
  ['gastown steam clock',           'Gastown Steam Clock'],
  ['park royal',                    'Park Royal'],
  ['marine gateway',                'Marine Gateway'],
  ['metrotown',                     'Metrotown'],

  // === Parks & beaches ===
  ['queen elizabeth park',          'Queen Elizabeth Park'],
  ['granville island',              'Granville Island'],
  ['stanley park',                  'Stanley Park'],
  ['john hendry park',              'John Hendry Park'],
  ['hastings park',                 'Hastings Park'],
  ['pacific spirit park',           'Pacific Spirit Park'],
  ['trout lake park',               'Trout Lake'],
  ['trout lake',                    'Trout Lake'],
  ['central park',                  'Central Park'],
  ['kitsilano beach',               'Kitsilano Beach'],
  ['kits beach',                    'Kitsilano Beach'],
  ['spanish banks',                 'Spanish Banks'],
  ['jericho beach',                 'Jericho Beach'],
  ['sunset beach',                  'Sunset Beach'],
  ['english bay',                   'English Bay'],
  ['second beach',                  'Second Beach'],
  ['third beach',                   'Third Beach'],
  ['wreck beach',                   'Wreck Beach'],
  ['locarno beach',                 'Locarno Beach'],

  // === Vancouver neighborhoods (longest first) ===
  ['davie village',                 'Davie Village'],
  ['south granville',               'South Granville'],
  ['punjabi market',                'Punjabi Market'],
  ['olympic village',               'Olympic Village'],
  ['false creek flats',             'False Creek Flats'],
  ['mount pleasant',                'Mount Pleasant'],
  ['commercial drive',              'Commercial Drive'],
  ['coal harbour',                  'Coal Harbour'],
  ['false creek',                   'False Creek'],
  ['little india',                  'Little India'],
  ['little italy',                  'Little Italy'],
  ['downtown vancouver',            'Downtown Vancouver'],
  ['hastings sunrise',              'Hastings-Sunrise'],
  ['riley park',                    'Riley Park'],
  ['grandview',                     'Grandview'],
  ['shaughnessy',                   'Shaughnessy'],
  ['kerrisdale',                    'Kerrisdale'],
  ['strathcona',                    'Strathcona'],
  ['fairview',                      'Fairview'],
  ['kitsilano',                     'Kitsilano'],
  ['chinatown',                     'Chinatown'],
  ['yaletown',                      'Yaletown'],
  ['gastown',                       'Gastown'],
  ['dunbar',                        'Dunbar'],
  ['marpole',                       'Marpole'],
  ['railtown',                      'Railtown'],
  ['west end',                      'West End'],
  ['east van',                      'East Van'],
  ['downtown',                      'Downtown Vancouver'],
  ['kits',                          'Kitsilano'],
  ['ubc',                           'UBC'],

  // === Aliases / shorthands ===
  ['the drive',                     'Commercial Drive'],
  ['davie st',                      'Davie Street'],
  ['robson st',                     'Robson Street'],
  ['hastings st',                   'Hastings Street'],
  ['granville st',                  'Granville Street'],
  ['cambie st',                     'Cambie Street'],
  ['main st',                       'Main Street'],

  // === Streets ===
  ['robson street',                 'Robson Street'],
  ['granville street',              'Granville Street'],
  ['hastings street',               'Hastings Street'],
  ['cambie street',                 'Cambie Street'],
  ['burrard street',                'Burrard Street'],
  ['denman street',                 'Denman Street'],
  ['davie street',                  'Davie Street'],
  ['fraser street',                 'Fraser Street'],
  ['main street',                   'Main Street'],
  ['broadway',                      'Broadway'],
  ['seawall',                       'Seawall'],

  // === Metro municipalities ===
  ['new westminster',               'New Westminster'],
  ['north vancouver',               'North Vancouver'],
  ['west vancouver',                'West Vancouver'],
  ['port coquitlam',                'Port Coquitlam'],
  ['port moody',                    'Port Moody'],
  ['coquitlam',                     'Coquitlam'],
  ['maple ridge',                   'Maple Ridge'],
  ['pitt meadows',                  'Pitt Meadows'],
  ['white rock',                    'White Rock'],
  ['tsawwassen',                    'Tsawwassen'],
  ['abbotsford',                    'Abbotsford'],
  ['burnaby',                       'Burnaby'],
  ['richmond',                      'Richmond'],
  ['langley',                       'Langley'],
  ['surrey',                        'Surrey'],
  ['north van',                     'North Vancouver'],
  ['west van',                      'West Vancouver'],
]);

// Legacy flat list for backward compat — not used in matching, only exported.
const KNOWN_PLACES = [...new Set(KNOWN_PLACES_MAP.values())];

// Regex patterns: captures place names after common prepositions.
// Ordered from most to least specific.
const LOCATION_PATTERNS = [
  /\bnear\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\boutside\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\baround\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\bat\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\bin\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\bon\s+([\w\s]{3,30}?)\s+(?:street|st|ave|avenue|blvd|boulevard|road|rd|drive|dr)(?=[,!?.#@\s]|$)/gi,
  /\bby\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\bheading\s+to\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\bgoing\s+to\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
];

/**
 * Tries to extract a place name from post text.
 * Returns an ExtractedPlace or null.
 *
 * @typedef {{ placeName: string, extractionMethod: 'exact_keyword'|'regex'|'geo_field', confidence: number }} ExtractedPlace
 */
function extractPlace(rawPost) {
  // 1. Highest confidence: X geo/place field
  if (rawPost.geoPlace?.fullName) {
    return {
      placeName: rawPost.geoPlace.fullName,
      extractionMethod: 'geo_field',
      confidence: 0.95,
    };
  }

  const textToSearch = [rawPost.text, rawPost.authorProfileLocation]
    .filter(Boolean)
    .join(' ');

  // 2. Exact known-place / alias dictionary match (Map preserves insertion order
  //    which is longest-first, so more specific names win over substrings)
  const lower = textToSearch.toLowerCase();
  for (const [key, canonical] of KNOWN_PLACES_MAP) {
    if (lower.includes(key)) {
      return {
        placeName: canonical,
        extractionMethod: 'exact_keyword',
        confidence: 0.85,
      };
    }
  }

  // 3. Regex extraction — try all patterns, take first non-vague match.
  //
  // Quality gates on the captured candidate:
  //   a) At least 3 chars, not in VAGUE_TERMS
  //   b) At most 4 words (real place names are concise)
  //   c) No English function words (with, the, an, a, of, for...) — these
  //      indicate the regex captured prose, not a place name
  // Single-word candidates are never returned from regex:
  // every single-word Vancouver place is already in KNOWN_PLACES_MAP and would have been
  // caught at step 2. A single word reaching regex is always a generic noun or a
  // non-Vancouver location ("Vegas", "Banff", "happen", "market").
  //
  // Multi-word candidates must:
  //   - Not exceed 4 words (real place names are concise)
  //   - Contain no English function words (catches "his restaurant in Vegas",
  //     "the biggest city in the country", "others with an open mind")
  const FUNC_WORD_RE = /\b(with|the|an|a\b|of|for|to\b|into|and|or|but|is|was|are|were|be|his|her|its|their|my|your|our|this|that|these|those)\b/i;

  for (const pattern of LOCATION_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(textToSearch)) !== null) {
      const candidate = match[1].trim();
      const words = candidate.split(/\s+/);
      // All words must start with a capital letter (proper noun / title case).
      // Real venue/place names are Title Case ("Rogers Arena", "BC Place").
      // Non-place phrases like "SF sits empty" or "area looks busy" have lowercase
      // mid-words and are rejected here. Single-word candidates are also rejected
      // (every single-word Vancouver place is in KNOWN_PLACES_MAP — step 2).
      // Every word must start with uppercase AND be at least 2 chars.
      // Blocks single-letter suffixes like "Craig T" or "Dr T".
      const allWordsCapital = words.every(w => /^[A-Z0-9]/.test(w) && w.length >= 2);
      const lower = candidate.toLowerCase();
      // Reject if the candidate IS a vague term, or CONTAINS one as a sub-phrase.
      // Catches "Washington State Vancouver" when "washington state" is in VAGUE_TERMS.
      const isVague =
        VAGUE_TERMS.has(lower) ||
        [...VAGUE_TERMS].some(t => t.includes(' ') && lower.includes(t));
      if (
        words.length >= 2 &&
        words.length <= 4 &&
        candidate.length >= 5 &&
        allWordsCapital &&
        !isVague &&
        !FUNC_WORD_RE.test(candidate)
      ) {
        return {
          placeName: candidate,
          extractionMethod: 'regex',
          confidence: 0.5,
        };
      }
    }
  }

  return null;
}

module.exports = { extractPlace, KNOWN_PLACES };
