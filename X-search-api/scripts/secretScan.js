#!/usr/bin/env node
'use strict';

/**
 * h45: Secret scan — checks JS/JSON/env source files for hardcoded credential patterns.
 * Run before committing: npm run secrets:check
 * Exits non-zero if any suspicious patterns are found.
 */

const fs   = require('fs');
const path = require('path');

// Patterns that should never appear as literals in source code
const PATTERNS = [
  // Generic secret/token assignments with non-empty values
  { re: /(?:password|secret|token|key|cookie)\s*[:=]\s*['"`][^'"`\s]{8,}/gi, label: 'hardcoded credential value' },
  // Bearer tokens
  { re: /Bearer\s+[A-Za-z0-9\-._~+/]{20,}/g, label: 'Bearer token literal' },
  // Base64-encoded blobs that look like cookie JSON
  { re: /eyJ[A-Za-z0-9+/=]{40,}/g, label: 'possible base64 JWT/cookie' },
  // Supabase service role key prefix
  { re: /sb_secret_[A-Za-z0-9]{10,}/g, label: 'Supabase service role key' },
  // Proxy credential in URL (exclude obvious placeholders like user:pass, user:password)
  { re: /https?:\/\/(?!user:pass(?:word)?@)[^@\s]{3,}:[^@\s]{4,}@/g, label: 'proxy credentials in URL' },
];

// File extensions to scan
const EXTENSIONS = new Set(['.js', '.json', '.ts', '.env', '.md']);
// Paths to skip
const SKIP = new Set([
  'node_modules', '.git', '.agents', '.claude',
  'package-lock.json', 'secretScan.js',
]);

function shouldScan(filePath) {
  const parts = filePath.split(path.sep);
  if (parts.some(p => SKIP.has(p))) return false;
  const ext = path.extname(filePath);
  // Always skip .env.example (names only, no values)
  if (path.basename(filePath) === '.env.example') return false;
  // Skip .env files from scanning (they're expected to have values locally, not in repo)
  if (path.basename(filePath).startsWith('.env')) return false;
  return EXTENSIONS.has(ext) || path.basename(filePath) === 'Makefile';
}

function collectFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (SKIP.has(entry.name)) continue;
    if (entry.isDirectory()) {
      collectFiles(full, results);
    } else if (shouldScan(full)) {
      results.push(full);
    }
  }
  return results;
}

const root    = path.resolve(__dirname, '..');
const files   = collectFiles(root);
let   found   = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const rel     = path.relative(root, file);

  for (const { re, label } of PATTERNS) {
    re.lastIndex = 0;
    const match = re.exec(content);
    if (match) {
      // Show only first 30 chars of match to avoid printing real secrets in CI output
      const preview = match[0].slice(0, 30) + (match[0].length > 30 ? '…' : '');
      console.error(`FAIL [${label}] ${rel}: "${preview}"`);
      found++;
    }
  }
}

if (found > 0) {
  console.error(`\n${found} potential secret(s) found. Remove before committing.`);
  process.exit(1);
} else {
  console.log('Secret scan passed — no hardcoded credentials found.');
  process.exit(0);
}
