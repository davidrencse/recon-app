'use strict';

// Strong single-word terms that unambiguously mean Vancouver
const STRONG_TERMS = [
  'vancouver', 'vancouver bc', 'yvr', 'kitsilano', 'gastown',
  'downtown vancouver', 'granville island', 'stanley park',
  'ubc', 'yaletown', 'false creek', 'coal harbour',
  'kits beach', 'kitsilano beach', 'bc place', 'rogers arena',
  'commodore ballroom', 'waterfront station', 'vancouver art gallery',
  'science world', 'queen elizabeth theatre', 'english bay',
  'granville street', 'robson street',
];

// Weaker terms that only count when paired with a strong term
const WEAK_TERMS = [
  'mount pleasant', 'west end', 'davie', 'hastings',
  'main street', 'commercial drive', 'broadway', 'burrard',
  'sunset beach', 'jericho beach', 'pacific centre',
  'metrotown', 'burnaby', 'north van', 'north vancouver',
  'surrey', 'richmond bc',
];

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

  if (STRONG_TERMS.some(t => haystack.includes(t))) return true;

  const weakHits = WEAK_TERMS.filter(t => haystack.includes(t));
  return weakHits.length >= 2;
}

/**
 * Returns true if the post has at least one media attachment.
 */
function hasMedia(rawPost) {
  return rawPost.hasMedia;
}

/**
 * Returns true if the post has enough text to be useful (strips URLs first).
 */
function hasUsefulText(rawPost) {
  const stripped = rawPost.text.replace(/https?:\/\/\S+/g, '').trim();
  return stripped.length >= 10;
}

/**
 * Runs all cheap pre-geocoding filters.
 * Returns { pass: bool, reason: string }
 */
function applyFilters(rawPost) {
  // Retweets inherit original author's URL and handle — reject to avoid misattribution
  if (rawPost.isRetweet) {
    return { pass: false, reason: 'rejected_retweet' };
  }
  if (!hasUsefulText(rawPost)) {
    return { pass: false, reason: 'rejected_no_useful_text' };
  }
  if (!isVancouverRelevant(rawPost)) {
    return { pass: false, reason: 'rejected_not_vancouver' };
  }
  return { pass: true, reason: null };
}

module.exports = { applyFilters, isVancouverRelevant };
