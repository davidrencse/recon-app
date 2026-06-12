'use strict';

const fs   = require('fs');
const path = require('path');
const { Scraper } = require('@the-convocation/twitter-scraper');
const { tlsFetch, warmTLS } = require('./tlsFetch');

let _scraper  = null;
let _loggedIn = false;

// On a real server (Oracle), fresh cookies are saved here after each re-login
// so the next cold start reuses them without hitting X's login rate limits.
const LOCAL_COOKIE_FILE = path.resolve(__dirname, '../../x-cookies.json');

/**
 * Returns an authenticated Scraper singleton.
 *
 * Auth priority:
 *   1. X_COOKIE_JSON env var  (Vercel / first deploy)
 *   2. x-cookies.json file    (Oracle server, refreshed automatically)
 *   3. Username + password    (fallback; re-saves cookies after success)
 *
 * After a successful cookie load, checks auth_token expiry. If < 24 h remain,
 * proactively re-logs in and saves fresh cookies before they go stale.
 */
async function getClient() {
  if (_scraper && _loggedIn) {
    // Verify session is still alive (cheap GraphQL profile check)
    const still = await _scraper.isLoggedIn().catch(() => false);
    if (still) return _scraper;
    // Session died — force re-login below
    _loggedIn = false;
    console.warn('[xClient] session expired, re-logging in…');
  }

  // Warm TLS session before first scraper call — avoids cold-start on first request
  await warmTLS();
  _scraper = new Scraper({ fetch: tlsFetch });

  // 1. Try env-var cookies (Vercel / CI)
  if (process.env.X_COOKIE_JSON && !_loggedIn) {
    try {
      const envCookies = JSON.parse(process.env.X_COOKIE_JSON);
      _loggedIn = await _tryCookies(envCookies);
      if (_loggedIn && _isCookieExpiringSoon(envCookies)) {
        console.warn('[xClient] X_COOKIE_JSON auth_token expires < 24 h — refreshing…');
        await _loginWithCredentials();
      }
    } catch {
      _loggedIn = false;
    }
  }

  // 2. Try local cookie file (Oracle server)
  if (!_loggedIn && fs.existsSync(LOCAL_COOKIE_FILE)) {
    try {
      const saved = JSON.parse(fs.readFileSync(LOCAL_COOKIE_FILE, 'utf8'));
      _loggedIn = await _tryCookies(saved);
      if (_loggedIn && _isCookieExpiringSoon(saved)) {
        console.warn('[xClient] x-cookies.json auth_token expires < 24 h — refreshing…');
        await _loginWithCredentials();
      }
    } catch {
      _loggedIn = false;
    }
  }

  // 3. Full username/password login
  if (!_loggedIn) {
    await _loginWithCredentials();
  }

  return _scraper;
}

async function _tryCookies(cookies) {
  try {
    await _scraper.setCookies(_normalizeCookies(cookies));
    return await _scraper.isLoggedIn();
  } catch {
    return false;
  }
}

/**
 * Convert browser-extension cookie format (name/expirationDate) to cookie strings
 * that tough-cookie v4 accepts. Passes through strings and tough-cookie objects untouched.
 */
function _normalizeCookies(cookies) {
  return cookies.map(c => {
    if (typeof c === 'string') return c;
    if (c.key) return c; // already tough-cookie format
    // Browser extension format → Set-Cookie string
    let str = `${c.name}=${c.value}`;
    if (c.domain) str += `; Domain=${c.domain}`;
    if (c.path)   str += `; Path=${c.path ?? '/'}`;
    if (c.secure)   str += '; Secure';
    if (c.httpOnly) str += '; HttpOnly';
    if (c.expirationDate) {
      str += `; Expires=${new Date(c.expirationDate * 1000).toUTCString()}`;
    }
    return str;
  });
}

async function _loginWithCredentials() {
  const username = process.env.X_USERNAME;
  const password = process.env.X_PASSWORD;
  const email    = process.env.X_EMAIL || undefined;

  if (!username || !password) {
    throw new Error('X_USERNAME and X_PASSWORD must be set in env');
  }

  await _scraper.login(username, password, email);
  _loggedIn = await _scraper.isLoggedIn();

  if (!_loggedIn) throw new Error('X login failed — check credentials');

  // Persist fresh cookies to local file so next restart skips re-login
  try {
    const cookies = await _scraper.getCookies();
    fs.writeFileSync(LOCAL_COOKIE_FILE, JSON.stringify(cookies), 'utf8');
    console.log('[xClient] fresh cookies saved to x-cookies.json');
  } catch (err) {
    console.warn('[xClient] could not save cookies:', err.message);
  }
}

/**
 * Returns true if auth_token expires within `thresholdMs` milliseconds.
 * Handles both tough-cookie format (expires: Date|"Infinity")
 * and browser-extension format (expirationDate: Unix timestamp float).
 */
function _isCookieExpiringSoon(cookies, thresholdMs = 24 * 60 * 60 * 1000) {
  if (!Array.isArray(cookies) || cookies.length === 0) return true;

  const auth = cookies.find(c => (c.key || c.name) === 'auth_token');
  if (!auth) return true;

  const raw = auth.expires ?? auth.expirationDate;

  // Session cookie or explicitly no expiry — treat as long-lived
  if (!raw || raw === 'Infinity') return false;

  let expiryMs;
  if (typeof raw === 'number') {
    expiryMs = raw * 1000; // Unix timestamp (browser-extension format)
  } else if (raw instanceof Date) {
    expiryMs = raw.getTime();
  } else {
    expiryMs = new Date(raw).getTime(); // ISO string (tough-cookie format)
  }

  if (isNaN(expiryMs)) return false; // unparseable — don't block

  const msRemaining = expiryMs - Date.now();
  if (msRemaining > 0) {
    const hRemaining = Math.floor(msRemaining / 3_600_000);
    console.log(`[xClient] auth_token expires in ~${hRemaining}h`);
  }
  return msRemaining < thresholdMs;
}

/**
 * Proactive cookie refresh for scheduled use (scripts/refreshCookies.js).
 *
 * @param {number} thresholdMs  Refresh if auth_token expires within this window (default 24 h)
 * @returns {Promise<boolean>}  true if a refresh was performed, false if cookies are still fresh
 */
async function refreshIfNeeded(thresholdMs = 24 * 60 * 60 * 1000) {
  // Load current cookies from file (or env) without triggering full getClient()
  let cookies = null;

  if (fs.existsSync(LOCAL_COOKIE_FILE)) {
    try {
      cookies = JSON.parse(fs.readFileSync(LOCAL_COOKIE_FILE, 'utf8'));
    } catch { /* fall through */ }
  }

  if (!cookies && process.env.X_COOKIE_JSON) {
    try {
      cookies = JSON.parse(process.env.X_COOKIE_JSON);
    } catch { /* fall through */ }
  }

  const needsRefresh = !cookies || _isCookieExpiringSoon(cookies, thresholdMs);

  if (!needsRefresh) return false;

  // Force a fresh login cycle
  _scraper  = null;
  _loggedIn = false;
  await getClient();
  return true;
}

/**
 * Returns current session cookies as a JSON string.
 * Use output as X_COOKIE_JSON in .env / Vercel env vars.
 */
async function exportCookies() {
  const scraper = await getClient();
  const cookies = await scraper.getCookies();
  return JSON.stringify(cookies);
}

module.exports = { getClient, exportCookies, refreshIfNeeded };
