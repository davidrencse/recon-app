'use strict';

/**
 * Chrome TLS-impersonating fetch() replacement.
 *
 * Node.js native fetch has a different JA3/JA4 TLS fingerprint than Chrome.
 * Cloudflare detects this and returns 403 even for valid sessions.
 * node-tls-client wraps a Go TLS library that replicates Chrome's exact
 * ClientHello, bypassing Cloudflare's fingerprint check.
 *
 * Drop-in for global fetch: tlsFetch(url, init) → Promise<Response>
 */

const { Session, initTLS } = require('node-tls-client');

let _initialized = false;
let _session     = null;

async function _ensureInit() {
  if (!_initialized) {
    await initTLS();
    _initialized = true;
  }
  if (!_session) {
    _session = new Session({ clientIdentifier: 'chrome_124' });
  }
  return _session;
}

/**
 * fetch()-compatible wrapper using node-tls-client.
 * Handles GET/POST/PUT/DELETE/PATCH. Returns a native Response object.
 */
async function tlsFetch(input, init = {}) {
  const session = await _ensureInit();
  const url     = typeof input === 'string' ? input : (input.url ?? String(input));
  const method  = (init.method || 'GET').toUpperCase();

  // Normalize headers to plain key→string object
  const headers = {};
  if (init.headers) {
    if (typeof init.headers.entries === 'function') {
      for (const [k, v] of init.headers.entries()) headers[k] = v;
    } else {
      Object.assign(headers, init.headers);
    }
  }

  const opts = { headers };
  if (init.body != null) opts.body = String(init.body);

  let tlsRes;
  switch (method) {
    case 'POST':   tlsRes = await session.post(url, opts);   break;
    case 'PUT':    tlsRes = await session.put(url, opts);    break;
    case 'DELETE': tlsRes = await session.delete(url, opts); break;
    case 'PATCH':  tlsRes = await session.patch(url, opts);  break;
    default:       tlsRes = await session.get(url, opts);
  }

  // tls-client returns headers as { key: [values] } — flatten to string
  const flatHeaders = {};
  for (const [k, v] of Object.entries(tlsRes.headers ?? {})) {
    flatHeaders[k] = Array.isArray(v) ? v.join(', ') : String(v);
  }

  return new Response(tlsRes.body ?? '', {
    status:  tlsRes.status,
    headers: flatHeaders,
  });
}

/**
 * Warms up initTLS() + session ahead of first scraper call.
 * Call once at startup to avoid cold-start delay on first request.
 */
async function warmTLS() {
  await _ensureInit();
}

module.exports = { tlsFetch, warmTLS };
