'use strict';

// Strong terms that unambiguously point to Metro Vancouver.
// Checked against main tweet text (non-hashtag) for full +3 score,
// or against hashtags for reduced +2 score.
const STRONG_TERMS = [
  'vancouver', 'vancouver bc', 'yvr',
  'kitsilano', 'gastown', 'yaletown', 'chinatown', 'strathcona',
  'downtown vancouver', 'east van', 'davie village', 'fairview slopes',
  'kits', 'kits beach', 'kitsilano beach', 'the drive',
  'granville island', 'stanley park', 'false creek', 'coal harbour',
  'english bay', 'bc place', 'rogers arena', 'commodore ballroom',
  'waterfront station', 'vancouver art gallery', 'science world',
  'queen elizabeth theatre', 'robson square', 'canada place',
  'granville street', 'robson street', 'davie street', 'commercial drive',
  'hastings street', 'denman street',
  'ubc', 'sfu burnaby',
  'north van', 'north vancouver', 'west vancouver', 'burnaby',
  'metrotown', 'new westminster', 'richmond bc',
  'skytrain', 'translink', 'compass card', 'burrard station',
];

// Weaker terms — need 2+ hits to contribute meaningfully to score.
// NOTE: 'mount pleasant', 'grandview', 'olympic village' demoted here —
// all exist as neighborhood names in other cities.
const WEAK_TERMS = [
  'west end', 'davie', 'hastings', 'main street',
  'broadway', 'burrard', 'cambie',
  'sunset beach', 'jericho beach', 'pacific centre',
  'surrey', 'coquitlam', 'langley bc',
  'kerrisdale', 'dunbar', 'shaughnessy', 'marpole',
  'mount pleasant', 'grandview', 'olympic village',
];

// Hard-fail terms — explicit signals this is NOT Metro Vancouver.
// Override even a matching STRONG_TERM.
const NOT_VANCOUVER_TERMS = [
  // US Pacific Northwest / Vancouver WA
  'vancouver wa', 'vancouver washington', 'clark county',
  'portland or', 'portland oregon',
  // Victoria BC — different city on Vancouver Island
  'downtown victoria', 'victoria bc', 'victoria canada',
  'in victoria', 'at victoria',
  // Philippine cities — appear in event-ticket resale tweets targeting Vancouver events
  'metro manila', 'quezon city', 'makati', 'pasig city',
];

// Hashtags identifying other cities/regions (not Metro Vancouver).
// If a tweet has 2+ of these, it is multi-city hashtag spam.
// Deliberately excludes 'richmond', 'surrey', 'victoria' (ambiguous with local usage).
const MULTI_CITY_HASHTAGS = new Set([
  // Other Canadian cities / provinces (not BC)
  'ottawa', 'toronto', 'calgary', 'edmonton', 'montreal', 'winnipeg',
  'halifax', 'saskatoon', 'regina', 'kelowna',
  'ontario', 'alberta', 'quebec', 'manitoba', 'saskatchewan',
  // US cities / regions
  'nyc', 'newyork', 'losangeles', 'la', 'chicago', 'houston',
  'miami', 'boston', 'seattle', 'sanfrancisco', 'sf',
  'lasvegas', 'washington', 'atlanta', 'denver', 'phoenix', 'dallas',
  'portland',
  // International
  'london', 'paris', 'dubai', 'tokyo', 'sydney', 'amsterdam',
  'berlin', 'madrid', 'rome', 'singapore',
  // Generic region flags
  'usa', 'us', 'uk', 'australia', 'europe',
]);

// Compact (no-space) hashtag forms that map to MULTI_CITY_HASHTAGS entries.
// Catches #NewYork, #LosAngeles, #SanFrancisco written in CamelCase.
const MULTI_CITY_COMPACT = new Set([
  'newyork', 'losangeles', 'sanfrancisco', 'lasvegas',
  'northcarolina', 'southcarolina',
]);

// Non-event content patterns — clear spam or off-topic.
const NOISE_PHRASES = [
  // Real estate listings
  'days on the market', 'on the market', 'price reduced', 'listing price',
  'square feet', 'sq ft', 'sqft', 'motivated seller',
  'mortgage rate', 'per month', 'monthly payment', 'down payment',
  'just listed', 'open house', 'asking price', 'beds baths',
  // Crypto / generic self-promo
  'crypto', 'bitcoin', 'nft', 'blockchain', 'investment opportunity',
  'follow back', 'follow me', 'dm me', 'link in bio',
  // Ticket resale / buy-sell transactions — person isn't in Vancouver
  'wtb/', 'lfs for', 'looking for ticket', 'want to buy ticket',
  'selling ticket', 'selling my ticket', 'ticket for sale',
  'prefer meet up', 'meet up around',
];

// Mojibake detection: UTF-8 bytes decoded as Latin-1 produce chars in U+0080–U+00BF.
// Fast regex catches specific high-confidence garbled sequences:
//   ðŸ  = garbled U+1F??? emoji
//   â€  = garbled curly quote / dash
//   ï¸  = garbled U+FE0F variation selector-16 (keycap/flag combos)
//   âƒ  = garbled U+20E3 combining enclosing keycap
const MOJIBAKE_LEAD_RE = /ðŸ|â€[^\s]|ï¸|âƒ/;

function countMojibakeChars(text) {
  let n = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c >= 0x0080 && c <= 0x00BF) n++;
    if (c >= 0x2020 && c <= 0x2022) n++;
  }
  return n;
}

// ── Hashtag spam detection ────────────────────────────────────────────────────

/**
 * Splits tweet text into prose (hashtags removed) and a list of lowercase hashtag strings.
 * Example: "Lunch at Gastown! #Vancouver #Food" →
 *   { mainText: "Lunch at Gastown!", hashtags: ["vancouver", "food"] }
 */
function splitHashtags(text) {
  const hashtags = [];
  const mainText = text
    .replace(/#(\w+)/g, (_, tag) => {
      hashtags.push(tag.toLowerCase());
      return ' ';
    })
    .replace(/\s{2,}/g, ' ')
    .trim();
  return { mainText, hashtags };
}

/**
 * Returns true when a tweet carries 2+ hashtags from other cities/regions.
 * This pattern — #YVR #Ottawa #USA #Alberta — is the signature of accounts
 * that spray city hashtags on unrelated content to gain local reach.
 */
function isHashtagSpam(hashtags) {
  let otherCityCount = 0;
  for (const tag of hashtags) {
    if (MULTI_CITY_HASHTAGS.has(tag) || MULTI_CITY_COMPACT.has(tag)) {
      otherCityCount++;
      if (otherCityCount >= 2) return true;
    }
  }
  return false;
}

// ── Vancouver relevance scoring ───────────────────────────────────────────────

/**
 * Computes a numeric Vancouver-relevance score for a post.
 * Returns -Infinity for hard rejects; score >= 2 means pass.
 *
 * Scoring breakdown:
 *   STRONG_TERM in main text (prose, non-hashtag):  +3
 *   STRONG_TERM in hashtags (compact or exact):     +2  (capped at +2 total)
 *   WEAK_TERM in main text:                         +1 each, max +2
 *   X geo field tagged to Metro Vancouver:          +3
 *   NOT_VANCOUVER_TERM anywhere:                    -Infinity
 *   2+ non-Vancouver-region city hashtags:          -Infinity
 *
 * Separating prose from hashtags is the key improvement over the old binary
 * check: a tweet with only #YVR in the hashtag now scores +2 (borderline) rather
 * than auto-passing, while multi-city hashtag spammers are hard-rejected.
 */
function scoreVancouverRelevance(rawPost) {
  const { mainText, hashtags } = splitHashtags(rawPost.text || '');
  const geoFullName = (rawPost.geoPlace?.fullName || '').toLowerCase();

  const mainLower = mainText.toLowerCase();
  const allContext = [mainLower, geoFullName].join(' ');

  // Hard fail: explicit non-Vancouver signal
  if (NOT_VANCOUVER_TERMS.some(t => allContext.includes(t))) return -Infinity;

  // Hard fail: multi-city hashtag spam
  if (isHashtagSpam(hashtags)) return -Infinity;

  let score = 0;

  // X geo field (strongest signal — user explicitly tagged a Vancouver location)
  if (geoFullName && STRONG_TERMS.some(t => geoFullName.includes(t))) score += 3;

  // STRONG_TERM in prose (high confidence — content explicitly references Vancouver)
  if (STRONG_TERMS.some(t => mainLower.includes(t))) score += 3;

  // STRONG_TERM in hashtags (medium confidence — intentional tagging, but can be spray)
  // Cap hashtag contribution at +2 regardless of how many Vancouver hashtags are present.
  const hashtagBonus = STRONG_TERMS.some(t => {
    const compact = t.replace(/\s+/g, '');
    return hashtags.includes(compact) || hashtags.includes(t);
  }) ? 2 : 0;
  score += hashtagBonus;

  // WEAK_TERM in prose (supporting evidence, max +2)
  let weakHits = 0;
  for (const term of WEAK_TERMS) {
    if (mainLower.includes(term)) weakHits++;
  }
  score += Math.min(weakHits, 2);

  return score;
}

/**
 * Returns true if the post is relevant to Metro Vancouver.
 * Threshold: score >= 2.
 * - Prose mention of any STRONG_TERM alone (score=3) → pass.
 * - Any single Vancouver hashtag alone (score=2) → pass.
 * - Pure hashtag spam → hard-fail before scoring.
 */
function isVancouverRelevant(rawPost) {
  return scoreVancouverRelevance(rawPost) >= 2;
}

// ── Other pre-geocoding filters ───────────────────────────────────────────────

function hasUsefulText(rawPost) {
  const stripped = rawPost.text.replace(/https?:\/\/\S+/g, '').trim();
  return stripped.length >= 15;
}

function isMojibake(rawPost) {
  const text = rawPost.text;
  if (MOJIBAKE_LEAD_RE.test(text)) return true;
  return countMojibakeChars(text) >= 3;
}

function isNoise(rawPost) {
  const lower = rawPost.text.toLowerCase();
  return NOISE_PHRASES.some(p => lower.includes(p));
}

/**
 * Runs all cheap pre-geocoding filters in order.
 * Returns { pass: bool, reason: string }
 */
function applyFilters(rawPost) {
  if (rawPost.isRetweet) return { pass: false, reason: 'rejected_retweet' };
  if (!hasUsefulText(rawPost)) return { pass: false, reason: 'rejected_no_useful_text' };
  if (isMojibake(rawPost)) return { pass: false, reason: 'rejected_garbled_text' };
  if (isNoise(rawPost)) return { pass: false, reason: 'rejected_noise' };

  const score = scoreVancouverRelevance(rawPost);
  if (!isFinite(score)) return { pass: false, reason: 'rejected_not_vancouver' };
  if (score < 2) return { pass: false, reason: 'rejected_not_vancouver' };

  return { pass: true, reason: null };
}

module.exports = { applyFilters, isVancouverRelevant, scoreVancouverRelevance };
