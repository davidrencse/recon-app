'use strict';

/**
 * The scraper uses the same X advanced search operators as the web UI.
 * point_radius / bounding_box are API-only — not available via scraper.
 * We rely on text-based Vancouver terms + place:"Vancouver" as the geo signal.
 *
 * Categories match the DB exactly: trending, cafes, nightlife, pop, crime_safety.
 */

const GEO_TERMS = '(Vancouver OR "Vancouver BC" OR YVR OR Kitsilano OR Gastown OR "Mount Pleasant" OR "Stanley Park" OR UBC OR Granville OR "Commercial Drive" OR Robson OR Yaletown OR "False Creek" OR "Coal Harbour" OR Burnaby OR "North Van")';

const CATEGORY_KEYWORDS = {
  trending: `(viral OR trending OR packed OR lineup OR crowded OR vibes OR "just opened" OR "now open" OR "so good" OR "sold out" OR "wait list" OR "hidden gem" OR "must visit" OR "check this out" OR "look at this" OR "can't believe") ${GEO_TERMS}`,

  cafes: `(coffee OR cafe OR espresso OR latte OR brunch OR breakfast OR lunch OR "food truck" OR restaurant OR "great food" OR "best coffee" OR boba OR matcha OR bakery OR foodie OR "must try" OR "hidden gem" OR "new spot" OR "just tried") ${GEO_TERMS}`,

  nightlife: `(bar OR pub OR club OR drinks OR cocktails OR "happy hour" OR party OR nightclub OR lounge OR "live music" OR DJ OR nightlife OR "open late" OR "after hours" OR "ladies night" OR "dance floor") ${GEO_TERMS}`,

  pop: `(popup OR "pop-up" OR "pop up" OR market OR festival OR concert OR show OR event OR opening OR launch OR exhibition OR "one night only" OR parade OR performance OR fair OR "limited time" OR "last chance") ${GEO_TERMS}`,

  // NOTE: X scraper silently returns 0 results at ~510+ chars. Keep this under ~480.
  // Removed: "road closure", "structure fire", evacuation (lower value; saves 44 chars)
  crime_safety: `(police OR crime OR arrest OR shooting OR stabbing OR robbery OR assault OR emergency OR "police activity" OR incident OR "house fire" OR "building fire" OR crash OR collision OR "hit and run" OR "car theft") ${GEO_TERMS}`,
};

/**
 * Builds a complete search query string for a given category.
 * Compatible with the @the-convocation/twitter-scraper searchTweets() method.
 * Excludes retweets; media filter is applied post-fetch (scraper doesn't support has:media).
 */
const QUERY_CHAR_LIMIT = 480;

function buildGeoQuery(category) {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords) throw new Error(`Unknown category: ${category}`);
  const query = `(${keywords}) -is:retweet lang:en`;
  if (query.length > QUERY_CHAR_LIMIT) {
    throw new Error(
      `[queryBuilder] ${category} query is ${query.length} chars — exceeds ${QUERY_CHAR_LIMIT} limit. ` +
      `X scraper silently returns 0 results above ~510 chars.`
    );
  }
  return query;
}

module.exports = { buildGeoQuery, CATEGORY_KEYWORDS };
