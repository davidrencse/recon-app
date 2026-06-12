'use strict';

require('dotenv').config();
require('./src/lib/proxyBootstrap'); // must load before scraper

/**
 * Standalone Express server for Oracle Cloud Free Tier.
 *
 * Routes:
 *   GET  /health              — liveness probe
 *   POST /fetch-x             — run X ingestion (requires X-Cron-Secret header)
 *   GET  /fetch-x?secret=...  — same, for crontab curl one-liners
 *
 * Deploy:
 *   npm install && node server.js
 *
 * Oracle crontab (every 15 minutes):
 *   *\/15 * * * * cd /home/ubuntu/x-search && node server.js --once >> /var/log/x-search.log 2>&1
 *
 * Or keep it running with PM2:
 *   pm2 start server.js --name x-search
 *   pm2 save && pm2 startup
 */

const http    = require('http');
const { handleFetchX } = require('./src/fetchX');

const PORT = parseInt(process.env.PORT || '3001', 10);

// ── ONE-SHOT MODE ──────────────────────────────────────────────────────────
// `node server.js --once` runs ingestion immediately and exits.
// Useful with crontab instead of keeping a persistent process.
if (process.argv.includes('--once')) {
  (async () => {
    const isDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';
    console.log(`[${new Date().toISOString()}] running ingestion (--once, dry_run=${isDryRun})`);
    const fakeReq = {
      headers: { 'x-cron-secret': process.env.CRON_SECRET },
      query:   {},
    };
    const result = await handleFetchX(fakeReq, { dryRun: isDryRun });
    if (result.status === 200) {
      const { run_id, sent, would_send, partial, dry_run, stats } = result.body;
      if (dry_run) {
        console.log(`dry run done — run_id=${run_id} would_send=${would_send}`);
      } else {
        console.log(`done — run_id=${run_id} sent=${sent} partial=${partial}`);
      }
      console.log('stats:', JSON.stringify(stats, null, 2));
    } else {
      console.error('ingestion failed:', JSON.stringify(result.body));
      process.exit(1);
    }
    process.exit(0);
  })();
  return; // prevent server startup
}

// ── SERVER MODE ────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost`);

  // Health check
  if (req.method === 'GET' && url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, ts: new Date().toISOString() }));
    return;
  }

  // Ingestion route
  if ((req.method === 'POST' || req.method === 'GET') && url.pathname === '/fetch-x') {
    const fakeReq = {
      headers: req.headers,
      query:   Object.fromEntries(url.searchParams),
    };

    try {
      const result = await handleFetchX(fakeReq);
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result.body));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: err.message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`[x-search] listening on :${PORT}`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/fetch-x  (X-Cron-Secret: <secret>)`);
});
