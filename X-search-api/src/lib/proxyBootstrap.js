'use strict';

/**
 * Optional residential proxy support.
 *
 * Set HTTPS_PROXY in .env to route all fetch calls through a proxy:
 *   HTTPS_PROXY=http://user:pass@proxy-host:port
 *
 * Must be required BEFORE any scraper code is loaded (done in server.js / test.js).
 * No-op when HTTPS_PROXY is not set.
 *
 * Uses undici ProxyAgent which patches Node.js native fetch globally.
 * Works with @the-convocation/twitter-scraper because it uses Node 18+ native fetch.
 */
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;

if (proxy) {
  try {
    const { setGlobalDispatcher, ProxyAgent } = require('undici');
    setGlobalDispatcher(new ProxyAgent(proxy));
    // Log proxy host only — never log credentials
    const safeProxy = proxy.replace(/\/\/[^@]*@/, '//***:***@');
    console.log(`[proxy] routing requests via ${safeProxy}`);
  } catch (err) {
    console.error('[proxy] failed to set proxy dispatcher:', err.message);
    console.error('[proxy] make sure undici is available (ships with Node 18+)');
    process.exit(1);
  }
} else {
  // No proxy configured — Oracle IP may be blocked by Cloudflare/X
  // Set HTTPS_PROXY to a residential proxy to fix 403 errors
}

module.exports = {};
