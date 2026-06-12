'use strict';

const fs = require('fs');
const path = require('path');

const candidates = [
  path.resolve('x-cookies.json'),
  path.resolve('.x-cookies.json'),
  path.resolve(process.env.HOME || '', '.x-cookies.json'),
];

const cookiePath = candidates.find((p) => fs.existsSync(p));

if (!cookiePath) {
  console.error('No cookie file found. Expected one of:');
  for (const candidate of candidates) console.error(`- ${candidate}`);
  process.exit(1);
}

const envPath = path.resolve('.env');

let cookies;

try {
  cookies = JSON.parse(fs.readFileSync(cookiePath, 'utf8'));
} catch (err) {
  console.error(`Invalid cookie JSON: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(cookies)) {
  console.error('Cookie file must be a JSON array.');
  process.exit(1);
}

const names = cookies.map((cookie) => cookie.name);
const required = ['auth_token', 'ct0', 'twid', 'guest_id'];
const missing = required.filter((name) => !names.includes(name));

if (missing.length > 0) {
  console.error(`Missing required cookies: ${missing.join(', ')}`);
  process.exit(1);
}

const compactCookies = JSON.stringify(cookies);

let env = '';

if (fs.existsSync(envPath)) {
  env = fs.readFileSync(envPath, 'utf8');
}

const lines = env
  .split('\n')
  .filter((line) => !line.startsWith('X_COOKIE_JSON='))
  .filter((line) => line.trim() !== '');

lines.push(`X_COOKIE_JSON=${compactCookies}`);

fs.writeFileSync(envPath, `${lines.join('\n')}\n`, { mode: 0o600 });

console.log(`Synced cookies from: ${cookiePath}`);
console.log(`Cookie count: ${cookies.length}`);
console.log(`Has auth_token: ${names.includes('auth_token')}`);
console.log(`Has ct0: ${names.includes('ct0')}`);
console.log(`Has twid: ${names.includes('twid')}`);
console.log(`Has guest_id: ${names.includes('guest_id')}`);
console.log('.env updated with fresh X_COOKIE_JSON');
