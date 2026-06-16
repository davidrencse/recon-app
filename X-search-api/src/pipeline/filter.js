'use strict';

// Strong terms that unambiguously point to Metro Vancouver
const STRONG_TERMS = [
  // City name / airport code
  'vancouver', 'vancouver bc', 'yvr',
  // Iconic neighborhoods & districts — only names unambiguous to Metro Vancouver
  'kitsilano', 'gastown', 'yaletown', 'chinatown', 'strathcona',
  'downtown vancouver', 'east van', 'davie village', 'fairview slopes',
  // NOTE: 'mount pleasant', 'grandview', 'olympic village' demoted to WEAK_TERMS —
  // all three exist as neighborhood names in many other cities.
  // Colloquial shorthands
  'kits', 'kits beach', 'kitsilano beach', 'the drive',
  // Landmarks
  'granville island', 'stanley park', 'false creek', 'coal harbour',
  'english bay', 'bc place', 'rogers arena', 'commodore ballroom',
  'waterfront station', 'vancouver art gallery', 'science world',
  'queen elizabeth theatre', 'robson square', 'canada place',
  // Streets specific to Vancouver
  'granville street', 'robson street', 'davie street', 'commercial drive',
  'hastings street', 'denman street',
  // Universities
  'ubc', 'sfu burnaby',
  // Metro municipalities
  'north van', 'north vancouver', 'west vancouver', 'burnaby',
  'metrotown', 'new westminster', 'richmond bc',
  // Transit unique to Metro Vancouver
  'skytrain', 'translink', 'compass card', 'burrard station',
];

// Weaker terms — require two hits to count as Vancouver-relevant
const WEAK_TERMS = [
  'west end', 'davie', 'hastings', 'main street',
  'broadway', 'burrard', 'cambie',
  'sunset beach', 'jericho beach', 'pacific centre',
  'surrey', 'coquitlam', 'langley bc',
  'kerrisdale', 'dunbar', 'shaughnessy', 'marpole',
  // Demoted from STRONG: exist as neighborhood names in many non-Vancouver cities
  'mount pleasant', 'grandview', 'olympic village',
];

// Terms that explicitly indicate a DIFFERENT Vancouver (not BC).
// These override even a "vancouver" STRONG_TERMS hit.
const NOT_VANCOUVER_TERMS = [
  // US Pacific Northwest (same regional searches often bleed in)
  'vancouver wa', 'vancouver washington', 'clark county',
  'portland or', 'portland oregon',
  // Victoria, BC — on Vancouver Island, not Metro Vancouver
  'downtown victoria', 'victoria bc', 'victoria canada',
  'in victoria', 'at victoria',
];

// Phrases that indicate clearly non-local, non-event content
const NOISE_PHRASES = [
  // Real estate
  'days on the market', 'on the market', 'price reduced', 'listing price',
  'square feet', 'sq ft', 'sqft', 'motivated seller',
  'mortgage rate', 'per month', 'monthly payment', 'down payment',
  'just listed', 'open house', 'asking price', 'beds baths',
  // Generic global content
  'crypto', 'bitcoin', 'nft', 'blockchain', 'investment opportunity',
  'follow back', 'follow me', 'dm me', 'link in bio',
];

// Mojibake detection: counts characters in the C1 / Latin-1 Supplement non-letter
// range (U+0080–U+00BF) that appear when UTF-8 bytes are decoded as Latin-1/
// Windows-1252. In correct UTF-8 strings these characters essentially never appear;
// in garbled text they show up as ¶, ¼, ‡, •, † etc.
//
// Fast regex catches specific high-confidence garbled sequences before the counter:
//   ðŸ  = garbled U+1F??? emoji (flag, face, etc.)
//   â€  = garbled U+201x/U+203x punctuation (curly quotes, dashes)
//   ï¸  = garbled U+FE0F variation selector-16 (appears in keycap/flag combos)
//   âƒ  = garbled U+20E3 combining enclosing keycap
// These sequences essentially never appear in correct UTF-8 text.
const MOJIBAKE_LEAD_RE = /ðŸ|â€[^\s]|ï¸|âƒ/;

function countMojibakeChars(text) {
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    // U+0080–U+00BF: C1 controls + non-letter Latin-1 supplement
    if (c >= 0x0080 && c <= 0x00BF) n++;
    // U+2020–U+2022: †, ‡, • — appear via Windows-1252 mojibake
    if (c >= 0x2020 && c <= 0x2022) n++;
  }
  return n;
}

/**
 * Returns true if the post is clearly about Vancouver.
 * Requires at least one STRONG term, OR two or more WEAK terms.
 */
function isVancouverRelevant(rawPost) {
  const haystack = [
    rawPost.text,
    rawPost.authorProfileLocation,
    rawPost.geoPlace?.fullName,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Explicit non-Vancouver signals override everything
  if (NOT_VANCOUVER_TERMS.some(t => haystack.includes(t))) return false;

  if (STRONG_TERMS.some(t => haystack.includes(t))) return true;

  const weakHits = WEAK_TERMS.filter(t => haystack.includes(t));
  return weakHits.length >= 2;
}

/**
 * Returns true if the post has enough meaningful text (strips URLs first).
 */
function hasUsefulText(rawPost) {
  const stripped = rawPost.text.replace(/https?:\/\/\S+/g, '').trim();
  return stripped.length >= 15;
}

/**
 * Returns true if the post text appears to be mojibake (garbled encoding).
 * Catches UTF-8 bytes decoded as Latin-1/Windows-1252.
 * 3+ suspicious chars = garbled (a single ¶ or ° can appear in normal text).
 */
function isMojibake(rawPost) {
  const text = rawPost.text;
  if (MOJIBAKE_LEAD_RE.test(text)) return true;
  return countMojibakeChars(text) >= 3;
}

/**
 * Returns true if the post matches known non-event noise patterns.
 */
function isNoise(rawPost) {
  const lower = rawPost.text.toLowerCase();
  return NOISE_PHRASES.some(p => lower.includes(p));
}

/**
 * Runs all cheap pre-geocoding filters.
 * Returns { pass: bool, reason: string }
 */
function applyFilters(rawPost) {
  if (rawPost.isRetweet) {
    return { pass: false, reason: 'rejected_retweet' };
  }
  if (!hasUsefulText(rawPost)) {
    return { pass: false, reason: 'rejected_no_useful_text' };
  }
  if (isMojibake(rawPost)) {
    return { pass: false, reason: 'rejected_garbled_text' };
  }
  if (isNoise(rawPost)) {
    return { pass: false, reason: 'rejected_noise' };
  }
  if (!isVancouverRelevant(rawPost)) {
    return { pass: false, reason: 'rejected_not_vancouver' };
  }
  return { pass: true, reason: null };
}

module.exports = { applyFilters, isVancouverRelevant };
