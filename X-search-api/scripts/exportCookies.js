'use strict';
/**
 * One-shot script: log in to X and print session cookies as JSON.
 *
 * Usage:
 *   node scripts/exportCookies.js
 *   npm run cookies
 *
 * Output goes to stdout (pipe-safe); progress messages go to stderr.
 * Paste the output into X_COOKIE_JSON in .env or Vercel env vars.
 *
 * On the Oracle server, x-cookies.json is auto-refreshed by xClient —
 * run this only when you need to populate X_COOKIE_JSON elsewhere.
 */
require('dotenv').config();
const { exportCookies } = require('../src/lib/xClient');

(async () => {
  try {
    console.error(`[${new Date().toISOString()}] logging in to X…`);
    const json = await exportCookies();
    // Validate we got real cookies before printing
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('getCookies() returned empty array — login may have failed');
    }
    const hasAuth = parsed.some(c => (c.key || c.name) === 'auth_token');
    if (!hasAuth) {
      throw new Error('auth_token not found in cookies — session not authenticated');
    }
    console.log(json);
    console.error(`[${new Date().toISOString()}] exported ${parsed.length} cookie(s). Copy JSON above into X_COOKIE_JSON.`);
    process.exit(0);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] failed:`, err.message);
    process.exit(1);
  }
})();
