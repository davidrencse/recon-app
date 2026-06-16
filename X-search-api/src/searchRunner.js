'use strict';

const { SearchMode }    = require('@the-convocation/twitter-scraper');
const { getClient }     = require('./lib/xClient');
const { buildGeoQuery } = require('./lib/queryBuilder');
const { normalizePost } = require('./lib/normalizer');
const { applyFilters }  = require('./pipeline/filter');
const { extractPlace }  = require('./pipeline/placeExtractor');

const ACTIVE_CATEGORIES = [
  'trending',
  'cafes',
  'nightlife',
  'pop',
  'crime_safety',
];

const DEFAULT_MAX_PER_CATEGORY = 20;
const DEFAULT_DEADLINE_MS      = 50_000; // 50s — leaves buffer before 60s timeout

const MAX_POSTS_PER_AUTHOR = 2; // per-run cap — prevents hashtag-spam floods from single accounts

/**
 * Fetches + filters posts for one category.
 * Returns IngestPost objects — no geocoding (Recon handles it, h34).
 *
 * @param {string} category
 * @param {{ runId: string, seenIds: Set, seenAuthors: Map, deadlineAt: number, maxPerCategory: number }} context
 */
async function fetchCategory(category, context) {
  const { runId, seenIds, seenAuthors, deadlineAt, maxPerCategory } = context;
  const scraper = await getClient();
  const query   = buildGeoQuery(category);

  const posts    = [];
  let fetched    = 0;
  let rejected   = 0;
  let duplicates = 0;
  let partial    = false;

  const tweetStream = scraper.searchTweets(query, maxPerCategory, SearchMode.Latest);

  for await (const tweet of tweetStream) {
    if (Date.now() >= deadlineAt) {
      partial = true;
      console.warn(`[${runId}] [${category}] deadline reached — stopping early (fetched=${fetched})`);
      break;
    }

    fetched++;

    if (seenIds.has(tweet.id)) {
      duplicates++;
      continue;
    }
    seenIds.add(tweet.id);

    const rawPost = normalizePost(tweet, category);

    const { pass, reason } = applyFilters(rawPost);
    if (!pass) {
      rejected++;
      console.debug(`[${runId}] [${category}] skip ${tweet.id}: ${reason}`);
      continue;
    }

    // Per-author cap: skip if this author already contributed MAX_POSTS_PER_AUTHOR this run.
    const handle = rawPost.creatorHandle ?? '__unknown__';
    const authorCount = seenAuthors.get(handle) ?? 0;
    if (authorCount >= MAX_POSTS_PER_AUTHOR) {
      rejected++;
      console.debug(`[${runId}] [${category}] skip ${tweet.id}: author_cap(@${handle})`);
      continue;
    }

    const extracted = extractPlace(rawPost);
    if (!extracted) {
      rejected++;
      console.debug(`[${runId}] [${category}] skip ${tweet.id}: no_place`);
      continue;
    }

    // raw_geo: pass X geo field if present; Recon geocodes from place_hint regardless
    const rawGeo = rawPost.geoPlace
      ? { lat: null, lng: null, place_name: rawPost.geoPlace.fullName || null }
      : null;

    seenAuthors.set(handle, authorCount + 1);

    // h43: raw_source contains only engagement/media metadata — no auth state or proxy creds
    posts.push({
      source_post_id:   rawPost.postId,
      source_url:       rawPost.postUrl,
      text:             rawPost.text,
      category,
      source_created_at: rawPost.createdAt
        ? new Date(rawPost.createdAt).toISOString()
        : new Date().toISOString(),
      creator_handle: rawPost.creatorHandle ?? null,
      place_hint:     extracted.placeName,
      raw_geo:        rawGeo,
      raw_source: {
        engagement:            rawPost.engagementMetrics,
        has_media:             rawPost.hasMedia,
        extraction_method:     extracted.extractionMethod,
        extraction_confidence: extracted.confidence,
      },
    });
  }

  // h37: per-category log with all counts
  console.log(
    `[${runId}] [${category}] ` +
    `fetched=${fetched} accepted=${posts.length} rejected=${rejected} duplicates=${duplicates}` +
    (partial ? ' [PARTIAL]' : '')
  );

  return { posts, fetched, accepted: posts.length, rejected, duplicates, partial };
}

/**
 * Runs ingestion across all active categories.
 *
 * @param {{
 *   runId?:          string,
 *   seenIds?:        Set,
 *   deadlineAt?:     number,
 *   maxPerCategory?: number,
 * }} options
 * @returns {{ posts: object[], stats: object }}
 */
async function runIngestion(options = {}) {
  const runId          = options.runId          ?? `x-${Date.now()}`;
  const deadlineAt     = options.deadlineAt     ?? (Date.now() + DEFAULT_DEADLINE_MS);
  const maxPerCategory = options.maxPerCategory ?? DEFAULT_MAX_PER_CATEGORY;

  const context = {
    runId,
    seenIds:     options.seenIds     ?? new Set(),
    seenAuthors: options.seenAuthors ?? new Map(),
    deadlineAt,
    maxPerCategory,
  };

  const stats = {
    run_id:          runId,
    categories:      {},
    totalFetched:    0,
    totalAccepted:   0,
    totalRejected:   0,
    totalDuplicates: 0,
    partial:         false,
    startedAt:       new Date().toISOString(),
    finishedAt:      null,
  };

  const allPosts = [];

  for (const category of ACTIVE_CATEGORIES) {
    if (Date.now() >= deadlineAt) {
      console.warn(`[${runId}] deadline before ${category} — skipping remaining categories`);
      stats.partial = true;
      break;
    }

    try {
      const result = await fetchCategory(category, context);
      allPosts.push(...result.posts);
      stats.categories[category] = {
        fetched:    result.fetched,
        accepted:   result.accepted,
        rejected:   result.rejected,
        duplicates: result.duplicates,
      };
      stats.totalFetched    += result.fetched;
      stats.totalAccepted   += result.accepted;
      stats.totalRejected   += result.rejected;
      stats.totalDuplicates += result.duplicates;
      if (result.partial) stats.partial = true;
    } catch (err) {
      console.error(`[${runId}] [${category}] error: ${err.message}`);
      stats.categories[category] = { error: err.message, fetched: 0, accepted: 0, rejected: 0, duplicates: 0 };
    }
  }

  stats.finishedAt = new Date().toISOString();

  // h37: run-level summary with partial warning
  const summary =
    `[${runId}] run_id=${runId} ` +
    `fetched=${stats.totalFetched} accepted=${stats.totalAccepted} ` +
    `rejected=${stats.totalRejected} duplicates=${stats.totalDuplicates}`;

  if (stats.partial) {
    console.warn(`[${runId}] PARTIAL RUN — ${summary}`);
  } else {
    console.log(`[${runId}] COMPLETE — ${summary}`);
  }

  return { posts: allPosts, stats };
}

module.exports = { runIngestion, fetchCategory, ACTIVE_CATEGORIES, DEFAULT_MAX_PER_CATEGORY };
