'use strict';
/**
 * Proactive cookie health-check and refresh.
 *
 * Checks whether the X session's auth_token expires within REFRESH_THRESHOLD_H hours.
 * If so (or if the session is already dead), re-logs in and saves fresh cookies
 * to x-cookies.json, then syncs them into .env as X_COOKIE_JSON.
 *
 * Crontab (every 12 hours on Oracle server):
 *   0 *\/12 * * * cd /home/ubuntu/x-search && node scripts/refreshCookies.js >> /var/log/x-search-cookies.log 2>&1
 *
 * Or run manually:
 *   node scripts/refreshCookies.js
 *   npm run cookies:refresh
 */
require('dotenv').config();
const { spawnSync }      = require('child_process');
const { refreshIfNeeded } = require('../src/lib/xClient');

const REFRESH_THRESHOLD_H = parseInt(process.env.COOKIE_REFRESH_THRESHOLD_H || '24', 10);

(async () => {
  const ts = () => new Date().toISOString();
  try {
    console.log(`[${ts()}] checking cookie health (threshold: ${REFRESH_THRESHOLD_H}h)…`);
    const refreshed = await refreshIfNeeded(REFRESH_THRESHOLD_H * 60 * 60 * 1000);

    if (refreshed) {
      console.log(`[${ts()}] cookies refreshed and saved to x-cookies.json`);

      // Sync fresh cookies from x-cookies.json back into .env as X_COOKIE_JSON
      console.log(`[${ts()}] syncing cookies into .env…`);
      const result = spawnSync('node', ['scripts/syncCookieEnv.js'], {
        stdio: 'inherit',
        cwd:   process.cwd(),
      });

      if (result.status !== 0) {
        throw new Error(`syncCookieEnv.js exited with code ${result.status}`);
      }

      console.log(`[${ts()}] refresh complete — x-cookies.json and .env are in sync`);
    } else {
      console.log(`[${ts()}] cookies still valid — no refresh needed`);
    }

    process.exit(0);
  } catch (err) {
    console.error(`[${ts()}] cookie refresh failed: ${err.message}`);
    process.exit(1);
  }
})();
