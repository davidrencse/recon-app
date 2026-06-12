'use strict';

require('dotenv').config();
const { runIngestion } = require('./searchRunner');

const SOURCE           = 'x';
const REGION           = 'metro_vancouver';
const RETRY_ATTEMPTS   = 2;
const RETRY_BASE_MS    = 2000;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * POST batch to Recon with capped retry for temporary failures (h39, h40).
 * Handles 401, 400, 429, 5xx, and network errors.
 * Never sends cookies/auth tokens/proxy creds in the payload (h43).
 *
 * @returns {{ ok: boolean, status: number, body: object }}
 */
async function postToRecon(url, secret, batch, attempt = 1) {
  let res;
  try {
    res = await fetch(`${url}/api/ingest/source-batch`, {
      method:  'POST',
      headers: {
        'Content-Type':   'application/json',
        'x-ingest-secret': secret,
      },
      body: JSON.stringify(batch),
    });
  } catch (err) {
    if (attempt <= RETRY_ATTEMPTS) {
      const delay = RETRY_BASE_MS * attempt;
      console.warn(`[fetchX] network error (attempt ${attempt}/${RETRY_ATTEMPTS}), retry in ${delay}ms: ${err.message}`);
      await sleep(delay);
      return postToRecon(url, secret, batch, attempt + 1);
    }
    console.error(`[fetchX] network error, exhausted retries: ${err.message}`);
    return { ok: false, status: 0, body: { error: 'network_error', detail: err.message } };
  }

  const body = await res.json().catch(() => ({ error: 'non_json_response' }));

  if (res.status === 401) {
    console.error('[fetchX] Recon 401 — check RECON_INGEST_SECRET matches Recon INGEST_SECRET');
    return { ok: false, status: 401, body };
  }

  if (res.status === 400) {
    console.error('[fetchX] Recon 400 — bad payload:', JSON.stringify(body));
    return { ok: false, status: 400, body }; // do not retry — bad payload won't improve
  }

  if (res.status === 429) {
    if (attempt <= RETRY_ATTEMPTS) {
      const retryAfter = parseInt(res.headers.get('Retry-After') || '5', 10);
      console.warn(`[fetchX] Recon 429 — retry after ${retryAfter}s (attempt ${attempt}/${RETRY_ATTEMPTS})`);
      await sleep(retryAfter * 1000);
      return postToRecon(url, secret, batch, attempt + 1);
    }
    console.error('[fetchX] Recon 429 — exhausted retries');
    return { ok: false, status: 429, body };
  }

  if (res.status >= 500) {
    if (attempt <= RETRY_ATTEMPTS) {
      const delay = RETRY_BASE_MS * attempt;
      console.warn(`[fetchX] Recon ${res.status} — retry in ${delay}ms (attempt ${attempt}/${RETRY_ATTEMPTS})`);
      await sleep(delay);
      return postToRecon(url, secret, batch, attempt + 1);
    }
    console.error(`[fetchX] Recon ${res.status} — exhausted retries`);
    return { ok: false, status: res.status, body };
  }

  return { ok: res.ok, status: res.status, body };
}

/**
 * Main entry point for POST /fetch-x.
 *
 * h33: POSTs to Recon /api/ingest/source-batch
 * h34: Never writes to Supabase
 * h35: Never logs credentials
 * h38: dry_run=true fetches + validates without posting
 * h42: Sends exact payload shape: source, region, run_id, posts
 *
 * @param {object} req
 * @param {{
 *   dryRun?:         boolean,
 *   seenIds?:        Set,
 *   deadlineAt?:     number,
 *   maxPerCategory?: number,
 * }} options
 */
async function handleFetchX(req, options = {}) {
  const cronSecret   = process.env.CRON_SECRET;
  const ingestUrl    = process.env.RECON_INGEST_URL;
  const ingestSecret = process.env.RECON_INGEST_SECRET;
  const isDryRun     = options.dryRun ?? (process.env.DRY_RUN === 'true');

  // Auth check
  const secret = req.headers?.['x-cron-secret'] || req.query?.secret;
  if (secret !== cronSecret) {
    return { status: 401, body: { error: 'Unauthorized' } };
  }

  // Config guard (non-dry-run only)
  if (!isDryRun && !ingestUrl) {
    return { status: 500, body: { error: 'RECON_INGEST_URL not configured' } };
  }
  if (!isDryRun && !ingestSecret) {
    return { status: 500, body: { error: 'RECON_INGEST_SECRET not configured' } };
  }

  const runId = `x-${Date.now()}`;
  console.log(`[fetchX] run_id=${runId} dry_run=${isDryRun}`);

  const { posts, stats } = await runIngestion({
    runId,
    seenIds:        options.seenIds,
    deadlineAt:     options.deadlineAt,
    maxPerCategory: options.maxPerCategory,
  }).catch(err => {
    console.error(`[fetchX] runIngestion failed: ${err.message}`);
    return { posts: [], stats: { run_id: runId, partial: true, error: err.message, categories: {} } };
  });

  // h42: exact payload shape Recon expects
  const batch = {
    source:     SOURCE,
    run_id:     runId,
    fetched_at: new Date().toISOString(),
    region:     REGION,
    categories: Object.keys(stats.categories),
    posts,
  };

  if (isDryRun) {
    // h38: validate payload shape without posting
    console.log(`[fetchX] DRY RUN — ${posts.length} posts would be sent to ${ingestUrl ?? '(no RECON_INGEST_URL)'}/api/ingest/source-batch`);
    console.log('[fetchX] stats:', JSON.stringify(stats, null, 2));
    return {
      status: 200,
      body: { ok: true, run_id: runId, dry_run: true, would_send: posts.length, stats },
    };
  }

  const { ok, status, body: ingestBody } = await postToRecon(ingestUrl, ingestSecret, batch);

  if (!ok) {
    console.error(`[fetchX] run_id=${runId} ingest failed (status=${status})`);
    return { status, body: { ok: false, run_id: runId, error: ingestBody, stats } };
  }

  console.log(`[fetchX] run_id=${runId} sent=${posts.length} partial=${stats.partial}`);

  return {
    status: 200,
    body: {
      ok:      true,
      run_id:  runId,
      sent:    posts.length,
      partial: stats.partial ?? false,
      stats,
      ingest:  ingestBody,
    },
  };
}

module.exports = { handleFetchX };
