'use strict';

// Terms that regex extraction commonly pulls but are too vague to geocode.
const VAGUE_TERMS = new Set([
  // Articles / pronouns
  'a', 'an', 'the', 'it', 'this', 'that', 'here', 'there', 'me', 'us', 'you',
  // Relative location / directions (not "downtown" — covered by KNOWN_PLACES_MAP)
  'home', 'work', 'school', 'uptown', 'out', 'outside',
  'north', 'south', 'east', 'west', 'left', 'right', 'centre', 'center',
  // Time words regex sometimes captures
  'every', 'today', 'tonight', 'morning', 'evening', 'night', 'weekend',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  // Too-large geography
  'north america', 'south america', 'canada', 'united states', 'the world',
  'the city', 'the area', 'the block', 'the corner', 'the end', 'the park',
  'the beach', 'the mall', 'the store', 'the office', 'the station',
  // Common false positives from tweet text
  'last night', 'right now', 'all day', 'all night', 'my place', 'your place',
  // US states often appearing in political / news tweets
  'washington state', 'washington dc', 'new york', 'new jersey', 'new mexico',
  'new hampshire', 'north carolina', 'south carolina', 'north dakota', 'south dakota',
  'west virginia', 'rhode island', 'los angeles', 'san francisco', 'las vegas',
  'california', 'texas', 'florida', 'illinois', 'ohio', 'georgia', 'virginia',
  'michigan', 'arizona', 'colorado', 'oregon', 'nevada', 'utah', 'iowa',
  // Non-Vancouver Canadian cities
  'ottawa ontario', 'toronto ontario', 'calgary alberta', 'edmonton alberta',
  'winnipeg manitoba', 'montreal quebec', 'ottawa canada',
]);

/**
 * Canonical place name map — keys are lowercase (alias or canonical), values are display names.
 * MUST be ordered longest-key-first so more specific names win over substrings.
 * e.g. "Downtown Vancouver" must appear before "Downtown" so the former wins.
 *
 * Three categories of keys:
 *   1. Normal multi-word phrases ("granville island")
 *   2. Street abbreviations ("hastings st")
 *   3. Compact hashtag forms ("northvan", "bcplace") — no spaces, lowercase.
 *      These let the exact-keyword scan catch hashtags like #NorthVan, #BCPlace
 *      because tweet text lowercased contains "northvan" inside "#northvan".
 */
const KNOWN_PLACES_MAP = new Map([

  // === Major landmarks & venues (longest names first) ===
  ['metropolis at metrotown',             'Metropolis at Metrotown'],
  ['capilano suspension bridge',          'Capilano Suspension Bridge'],
  ['vancouver convention centre',         'Vancouver Convention Centre'],
  ['vancouver convention center',         'Vancouver Convention Centre'],
  ['pacific spirit regional park',        'Pacific Spirit Regional Park'],
  ['vandusen botanical garden',           'VanDusen Botanical Garden'],
  ['queen elizabeth theatre',             'Queen Elizabeth Theatre'],
  ['commodore ballroom',                  'Commodore Ballroom'],
  ['vancouver art gallery',               'Vancouver Art Gallery'],
  ['waterfront station',                  'Waterfront Station'],
  ['vancouver city hall',                 'Vancouver City Hall'],
  ['city hall vancouver',                 'Vancouver City Hall'],
  ['richmond night market',               'Richmond Night Market'],
  ['nat bailey stadium',                  'Nat Bailey Stadium'],
  ['swangard stadium',                    'Swangard Stadium'],
  ['brentwood town centre',               'Brentwood Town Centre'],
  ['pacific national exhibition',         'PNE'],
  ['fortune sound club',                  'Fortune Sound Club'],
  ['biltmore cabaret',                    'Biltmore Cabaret'],
  ['celebrities nightclub',               'Celebrities Nightclub'],
  ['venue nightclub',                     'Venue Nightclub'],
  ['caprice nightclub',                   'Caprice Nightclub'],
  ['rickshaw theatre',                    'Rickshaw Theatre'],
  ['vogue theatre',                       'Vogue Theatre'],
  ['orpheum theatre',                     'Orpheum Theatre'],
  ['fairmont hotel vancouver',            'Fairmont Hotel Vancouver'],
  ['fairmont waterfront',                 'Fairmont Waterfront'],
  ['sheraton wall centre',                'Sheraton Wall Centre'],
  ['hyatt regency vancouver',             'Hyatt Regency Vancouver'],
  ['pan pacific hotel',                   'Pan Pacific Hotel'],
  ['new westminster',                     'New Westminster'],
  ['north vancouver',                     'North Vancouver'],
  ['west vancouver',                      'West Vancouver'],
  ['port coquitlam',                      'Port Coquitlam'],
  ['port moody',                          'Port Moody'],
  ['maple ridge',                         'Maple Ridge'],
  ['pitt meadows',                        'Pitt Meadows'],
  ['white rock',                          'White Rock'],
  ['deep cove',                           'Deep Cove'],
  ['horseshoe bay',                       'Horseshoe Bay'],
  ['lighthouse park',                     'Lighthouse Park'],
  ['lynn canyon',                         'Lynn Canyon'],
  ['grouse mountain',                     'Grouse Mountain'],
  ['cypress mountain',                    'Cypress Mountain'],
  ['burnaby mountain',                    'Burnaby Mountain'],
  ['gastown steam clock',                 'Gastown Steam Clock'],
  ['park royal',                          'Park Royal'],
  ['marine gateway',                      'Marine Gateway'],
  ['metrotown',                           'Metrotown'],
  ['burrard bridge',                      'Burrard Bridge'],
  ['lions gate bridge',                   'Lions Gate Bridge'],
  ['cambie bridge',                       'Cambie Bridge'],
  ['robson square',                       'Robson Square'],
  ['canada place',                        'Canada Place'],
  ['rogers arena',                        'Rogers Arena'],
  ['science world',                       'Science World'],
  ['bc place stadium',                    'BC Place'],
  ['bc place',                            'BC Place'],
  ['pacific centre',                      'Pacific Centre'],
  ['granville island',                    'Granville Island'],
  ['stanley park',                        'Stanley Park'],
  ['the roxy',                            'The Roxy'],
  ['the imperial',                        'The Imperial'],
  ['malkin bowl',                         'Malkin Bowl'],
  ['david lam park',                      'David Lam Park'],
  ['andy livingstone park',               'Andy Livingstone Park'],
  ['fraser foreshore',                    'Fraser Foreshore Park'],
  ['crab park',                           'CRAB Park'],
  ['pne',                                 'PNE'],

  // === Parks & beaches ===
  ['queen elizabeth park',                'Queen Elizabeth Park'],
  ['pacific spirit park',                 'Pacific Spirit Park'],
  ['john hendry park',                    'John Hendry Park'],
  ['hastings park',                       'Hastings Park'],
  ['trout lake park',                     'Trout Lake'],
  ['trout lake',                          'Trout Lake'],
  ['central park',                        'Central Park'],
  ['kitsilano beach',                     'Kitsilano Beach'],
  ['kits beach',                          'Kitsilano Beach'],
  ['spanish banks',                       'Spanish Banks'],
  ['jericho beach',                       'Jericho Beach'],
  ['sunset beach',                        'Sunset Beach'],
  ['english bay',                         'English Bay'],
  ['second beach',                        'Second Beach'],
  ['third beach',                         'Third Beach'],
  ['wreck beach',                         'Wreck Beach'],
  ['locarno beach',                       'Locarno Beach'],

  // === Vancouver neighborhoods (longest first to avoid substring shadowing) ===
  ['downtown vancouver',                  'Downtown Vancouver'],
  ['false creek flats',                   'False Creek Flats'],
  ['hastings sunrise',                    'Hastings-Sunrise'],
  ['davie village',                       'Davie Village'],
  ['south granville',                     'South Granville'],
  ['punjabi market',                      'Punjabi Market'],
  ['olympic village',                     'Olympic Village'],
  ['mount pleasant',                      'Mount Pleasant'],
  ['commercial drive',                    'Commercial Drive'],
  ['coal harbour',                        'Coal Harbour'],
  ['false creek',                         'False Creek'],
  ['little india',                        'Little India'],
  ['little italy',                        'Little Italy'],
  ['fairview slopes',                     'Fairview Slopes'],
  ['riley park',                          'Riley Park'],
  ['grandview',                           'Grandview'],
  ['shaughnessy',                         'Shaughnessy'],
  ['kerrisdale',                          'Kerrisdale'],
  ['strathcona',                          'Strathcona'],
  ['fairview',                            'Fairview'],
  ['kitsilano',                           'Kitsilano'],
  ['chinatown',                           'Chinatown'],
  ['yaletown',                            'Yaletown'],
  ['gastown',                             'Gastown'],
  ['dunbar',                              'Dunbar'],
  ['marpole',                             'Marpole'],
  ['railtown',                            'Railtown'],
  ['west end',                            'West End'],
  ['east van',                            'East Van'],
  ['downtown',                            'Downtown Vancouver'],
  ['kits',                                'Kitsilano'],
  ['ubc',                                 'UBC'],

  // === Street aliases & shorthands ===
  ['the drive',                           'Commercial Drive'],
  ['davie st',                            'Davie Street'],
  ['robson st',                           'Robson Street'],
  ['hastings st',                         'Hastings Street'],
  ['granville st',                        'Granville Street'],
  ['cambie st',                           'Cambie Street'],
  ['main st',                             'Main Street'],

  // === Streets ===
  ['robson street',                       'Robson Street'],
  ['granville street',                    'Granville Street'],
  ['hastings street',                     'Hastings Street'],
  ['cambie street',                       'Cambie Street'],
  ['burrard street',                      'Burrard Street'],
  ['denman street',                       'Denman Street'],
  ['davie street',                        'Davie Street'],
  ['fraser street',                       'Fraser Street'],
  ['main street',                         'Main Street'],
  ['broadway',                            'Broadway'],
  ['seawall',                             'Seawall'],

  // === Metro municipalities ===
  ['coquitlam',                           'Coquitlam'],
  ['tsawwassen',                          'Tsawwassen'],
  ['abbotsford',                          'Abbotsford'],
  ['burnaby',                             'Burnaby'],
  ['richmond',                            'Richmond'],
  ['langley',                             'Langley'],
  ['surrey',                              'Surrey'],
  ['north van',                           'North Vancouver'],
  ['west van',                            'West Vancouver'],

  // === Compact hashtag forms (no spaces, lowercase) ===
  // These let the exact-keyword scan catch #NorthVan, #BCPlace, etc.
  // The text "...#NorthVan..." lowercased becomes "...#northvan..."
  // and `lower.includes('northvan')` returns true.
  ['northvancouver',                      'North Vancouver'],
  ['westvancouver',                       'West Vancouver'],
  ['eastvancouver',                       'East Van'],
  ['downtownvancouver',                   'Downtown Vancouver'],
  ['northvan',                            'North Vancouver'],
  ['westvan',                             'West Vancouver'],
  ['eastvan',                             'East Van'],
  ['vancity',                             'Downtown Vancouver'],
  ['yvr',                                 'Vancouver'],
  ['bcplace',                             'BC Place'],
  ['rogersarena',                         'Rogers Arena'],
  ['granvilleisland',                     'Granville Island'],
  ['stanleypark',                         'Stanley Park'],
  ['mountpleasant',                       'Mount Pleasant'],
  ['commercialdrive',                     'Commercial Drive'],
  ['davievillage',                        'Davie Village'],
  ['southgranville',                      'South Granville'],
  ['falsecreek',                          'False Creek'],
  ['coalharbour',                         'Coal Harbour'],
  ['englishbay',                          'English Bay'],
  ['kitsbeach',                           'Kitsilano Beach'],
  ['scienceworld',                        'Science World'],
  ['canadaplace',                         'Canada Place'],
  ['robsonsquare',                        'Robson Square'],
  ['spanishbanks',                        'Spanish Banks'],
  ['jerichobeach',                        'Jericho Beach'],
  ['sunsetbeach',                         'Sunset Beach'],
  ['wreckbeach',                          'Wreck Beach'],
  ['lionsgatebridge',                     'Lions Gate Bridge'],
  ['waterfrontstation',                   'Waterfront Station'],
  ['commodoreballroom',                   'Commodore Ballroom'],
  ['burrardstation',                      'Burrard Station'],
  ['vancouverartgallery',                 'Vancouver Art Gallery'],
  ['queenelizabethpark',                  'Queen Elizabeth Park'],
  ['queenelizabeththeatre',               'Queen Elizabeth Theatre'],
  ['pacificcentre',                       'Pacific Centre'],
  ['pacificspirit',                       'Pacific Spirit Park'],
  ['grousemountain',                      'Grouse Mountain'],
  ['cypressmountain',                     'Cypress Mountain'],
  ['burnabymc',                           'Burnaby'],
  ['newwestminster',                      'New Westminster'],
  ['newwest',                             'New Westminster'],
  ['portcoquitlam',                       'Port Coquitlam'],
  ['portmoody',                           'Port Moody'],
  ['whiterock',                           'White Rock'],
  ['mapleridge',                          'Maple Ridge'],
  ['pittmeadows',                         'Pitt Meadows'],
  ['horseshoebay',                        'Horseshoe Bay'],
  ['deepcove',                            'Deep Cove'],
  ['lighthousepark',                      'Lighthouse Park'],
  ['lynncanyons',                         'Lynn Canyon'],
  ['lynncanyon',                          'Lynn Canyon'],
  ['grousemtn',                           'Grouse Mountain'],
  ['richmondbc',                          'Richmond'],
  ['surreync',                            'Surrey'],
  ['burrardbridge',                       'Burrard Bridge'],
  ['cambiebridge',                        'Cambie Bridge'],
  ['natbaileystadium',                    'Nat Bailey Stadium'],
  ['richmondnightmarket',                 'Richmond Night Market'],
  ['vangallery',                          'Vancouver Art Gallery'],
  ['fortunesoundclub',                    'Fortune Sound Club'],
  ['biltmorecabaret',                     'Biltmore Cabaret'],
  ['ricksawtheatre',                      'Rickshaw Theatre'],
  ['rickshawtheatre',                     'Rickshaw Theatre'],
  ['voguetheatre',                        'Vogue Theatre'],
  ['orpheumtheatre',                      'Orpheum Theatre'],
  ['tinyatlas',                           'Vancouver'],
]);

// Legacy flat list — exported for backward compat, not used in matching.
const KNOWN_PLACES = [...new Set(KNOWN_PLACES_MAP.values())];

// Patterns capture place names after spatial / directional prepositions.
// Ordered most-to-least specific.
const LOCATION_PATTERNS = [
  /\bjust\s+(?:arrived?|got)\s+(?:at|to|in)\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bover\s+at\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bposted\s+up\s+(?:at|in)\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bchilling\s+(?:at|in)\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\barriving?\s+(?:at|in)\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bheading\s+to\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bgoing\s+to\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bwalking\s+(?:through|around|along|down|up)\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bnear\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\boutside\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\baround\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bat\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bin\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bby\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bfrom\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
  /\bon\s+([\w\s]{3,30}?)\s+(?:street|st|ave|avenue|blvd|boulevard|road|rd|drive|dr)(?=[,!?.#@\s]|$)/gi,
  /\bvibes?\s+(?:at|in)\s+([\w\s]{3,40}?)(?=[,!?.#@\n]|$)/gi,
];

// Function words that indicate the regex captured prose, not a place name.
const FUNC_WORD_RE =
  /\b(with|the|an|a\b|of|for|to\b|into|and|or|but|is|was|are|were|be|his|her|its|their|my|your|our|this|that|these|those|been|being|do|did|has|have|had|will|would|could|should|may|might|just|very|really|also|too|so|if|when|where|who|what|which|how)\b/i;

// Leading articles to strip from regex captures before quality-gating.
const LEADING_ARTICLE_RE = /^(?:the|a|an)\s+/i;

/**
 * Tries to extract a place name from a post.
 * Returns an ExtractedPlace or null.
 *
 * @typedef {{ placeName: string, extractionMethod: 'exact_keyword'|'hashtag'|'regex'|'geo_field', confidence: number }} ExtractedPlace
 *
 * Pipeline:
 *   1. X geo/place field         → confidence 0.95
 *   2. KNOWN_PLACES_MAP scan     → confidence 0.85
 *      (includes compact hashtag keys, so #NorthVan, #BCPlace etc. are caught here)
 *   3. LOCATION_PATTERNS regex   → confidence 0.50
 */
function extractPlace(rawPost) {

  // Step 1 — X geo tag (highest confidence)
  if (rawPost.geoPlace?.fullName) {
    return {
      placeName:         rawPost.geoPlace.fullName,
      extractionMethod:  'geo_field',
      confidence:        0.95,
    };
  }

  const textToSearch = [rawPost.text, rawPost.authorProfileLocation]
    .filter(Boolean)
    .join(' ');
  const lower = textToSearch.toLowerCase();

  // Step 2 — Exact known-place / alias / compact-hashtag scan.
  // Map is ordered longest-key-first, so longer (more specific) names win.
  // Compact hashtag keys (e.g. 'northvan') match inside text like "#northvan"
  // because lower.includes('northvan') is true for the string "...#northvan...".
  for (const [key, canonical] of KNOWN_PLACES_MAP) {
    if (lower.includes(key)) {
      return {
        placeName:         canonical,
        extractionMethod:  'exact_keyword',
        confidence:        0.85,
      };
    }
  }

  // Step 3 — Regex extraction: prepositional patterns.
  //
  // Quality gates on each candidate:
  //   a) Strip leading article ("the", "a", "an") before checking.
  //   b) 2–4 words (single-word Vancouver places are in KNOWN_PLACES_MAP).
  //   c) Every word starts with uppercase AND is >= 2 chars (proper noun signal).
  //      Blocks "SF sits empty" (lowercase mid-words) and "Craig T" (1-char word).
  //   d) Not in VAGUE_TERMS or containing a vague sub-phrase.
  //   e) No English function words (catches "in his restaurant", "at the biggest mall").
  for (const pattern of LOCATION_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(textToSearch)) !== null) {
      // Strip leading article
      const raw = match[1].trim();
      const candidate = raw.replace(LEADING_ARTICLE_RE, '').trim();

      const words = candidate.split(/\s+/);
      const candLower = candidate.toLowerCase();

      // Reject if the candidate IS a vague term or CONTAINS one as a sub-phrase.
      const isVague =
        VAGUE_TERMS.has(candLower) ||
        [...VAGUE_TERMS].some(t => t.includes(' ') && candLower.includes(t));

      const allWordsCapital =
        words.every(w => /^[A-Z0-9]/.test(w) && w.length >= 2);

      if (
        words.length >= 2 &&
        words.length <= 4 &&
        candidate.length >= 5 &&
        allWordsCapital &&
        !isVague &&
        !FUNC_WORD_RE.test(candidate)
      ) {
        return {
          placeName:         candidate,
          extractionMethod:  'regex',
          confidence:        0.5,
        };
      }
    }
  }

  return null;
}

module.exports = { extractPlace, KNOWN_PLACES };
