'use strict';

/**
 * The scraper uses the same X advanced search operators as the web UI.
 * point_radius / bounding_box are API-only — not available via scraper.
 * We rely on text-based Vancouver terms + place:"Vancouver" as the geo signal.
 */

const GEO_TERMS = '(Vancouver OR "Vancouver BC" OR YVR OR Kitsilano OR Gastown OR "Mount Pleasant" OR "Stanley Park" OR UBC OR Granville OR "Commercial Drive" OR Robson OR Yaletown OR "False Creek" OR "Coal Harbour")';

const CATEGORY_KEYWORDS = {
  weather: `(rain OR snow OR flood OR storm OR fog OR wind OR hail OR flooding OR "black ice" OR weather) ${GEO_TERMS}`,
  crime_safety: `(police OR crime OR arrest OR shooting OR stabbing OR robbery OR assault OR "road closure" OR emergency OR evacuation OR "police activity" OR incident) ${GEO_TERMS}`,
  daily_life: `(lineup OR "line up" OR busy OR packed OR crowded OR vibes OR "open late" OR brunch OR "pop up" OR "pop-up" OR market OR festival OR "food truck") ${GEO_TERMS}`,
  locations: `(📍 OR patio OR rooftop OR "sunset view" OR "great view" OR "photo spot" OR "new spot" OR "love this place" OR "beautiful view" OR "worth the visit") ${GEO_TERMS}`,
  special_events: `(concert OR show OR event OR festival OR game OR "sold out" OR tonight OR opening OR launch OR parade) ${GEO_TERMS}`,
};

/**
 * Builds a complete search query string for a given category.
 * Compatible with the @the-convocation/twitter-scraper searchTweets() method.
 * Excludes retweets; media filter is applied post-fetch (scraper doesn't support has:media).
 */
function buildGeoQuery(category) {
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords) throw new Error(`Unknown category: ${category}`);
  return `(${keywords}) -is:retweet lang:en`;
}

module.exports = { buildGeoQuery, CATEGORY_KEYWORDS };
