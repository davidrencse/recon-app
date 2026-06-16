'use strict';

require('dotenv').config();
require('./src/lib/proxyBootstrap');
const { fetchCategory, ACTIVE_CATEGORIES } = require('./src/searchRunner');
const { applyFilters }   = require('./src/pipeline/filter');
const { extractPlace }   = require('./src/pipeline/placeExtractor');
const { normalizePost }  = require('./src/lib/normalizer');

const RAW_LIMIT    = 20;   // tweets fetched per category in test mode
const TEST_TIMEOUT = 45_000;

async function runCategory(category, verbose = false) {
  const runId = `test-${category}-${Date.now()}`;
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`Category: ${category.toUpperCase()}  run_id=${runId}`);
  console.log('─'.repeat(60));

  const context = {
    runId,
    seenIds:        new Set(),
    seenAuthors:    new Map(),
    deadlineAt:     Date.now() + TEST_TIMEOUT,
    maxPerCategory: RAW_LIMIT,
  };

  const { posts, fetched, accepted, rejected, duplicates, partial } =
    await fetchCategory(category, context);

  console.log(`\nStats: fetched=${fetched} accepted=${accepted} rejected=${rejected} duplicates=${duplicates}${partial ? ' [PARTIAL]' : ''}\n`);

  if (!posts.length) {
    console.log('  No posts accepted — all filtered out.\n');
    return { category, fetched, accepted, rejected, posts: [] };
  }

  posts.forEach((post, i) => {
    const method = post.raw_source?.extraction_method ?? 'n/a';
    const conf   = post.raw_source?.extraction_confidence ?? '?';
    console.log(`  [${i + 1}] from : @${post.creator_handle}`);
    console.log(`      place: ${post.place_hint}  (${method}, conf=${conf})`);
    console.log(`      link : ${post.source_url ?? 'n/a'}`);
    console.log(`      text : ${post.text.replace(/\s+/g, ' ').slice(0, 200)}`);
    console.log();
  });

  return { category, fetched, accepted, rejected, posts };
}

async function runAll() {
  const summary = [];
  for (const cat of ACTIVE_CATEGORIES) {
    try {
      const r = await runCategory(cat);
      summary.push(r);
    } catch (err) {
      console.error(`[${cat}] FAILED:`, err.message);
      summary.push({ category: cat, fetched: 0, accepted: 0, rejected: 0, posts: [] });
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('ALL CATEGORIES SUMMARY');
  console.log('═'.repeat(60));
  summary.forEach(r => {
    const rate = r.fetched ? Math.round((r.accepted / r.fetched) * 100) : 0;
    console.log(`  ${r.category.padEnd(14)} fetched=${r.fetched} accepted=${r.accepted} (${rate}%) rejected=${r.rejected}`);
  });
  console.log();
}

// ── Local unit tests for filter + place extractor ────────────────────────────

function unitTests() {
  const { isVancouverRelevant } = require('./src/pipeline/filter');
  console.log('\n── Unit Tests ──────────────────────────────────────');

  const filterCases = [
    // [text, shouldPass, label]
    ['Great brunch in Kitsilano today!',                               true,  'kitsilano → PASS'],
    ['Heading to Gastown for the market',                              true,  'gastown → PASS'],
    ['SkyTrain is packed right now',                                   true,  'skytrain → PASS'],
    ['Crowd at Kits Beach!',                                           true,  'kits beach → PASS'],
    ['Downtown Vancouver is buzzing',                                  true,  'downtown vancouver → PASS'],
    ['Random tweet with no location',                                  false, 'no location → FAIL'],
    ['heading downtown for coffee',                                    false, 'downtown alone → FAIL'],
    ['Mount Pleasant Baptist Church in Herndon VA',                    false, 'mount pleasant alone → FAIL'],
    ['Great event at Mount Pleasant in Vancouver today',               true,  'mount pleasant + vancouver → PASS'],
    ['Olympic village ceremony tonight in Paris',                      false, 'olympic village alone → FAIL'],
    ['Caribbean Carnival in downtown Victoria at Ship Point',          false, 'downtown victoria → FAIL'],
    ['Fun times in Victoria BC at the harbour festival',               false, 'victoria bc → FAIL'],
  ];

  filterCases.forEach(([text, expected, label]) => {
    const rawPost = { text, authorProfileLocation: null, geoPlace: null };
    const got = isVancouverRelevant(rawPost);
    const ok  = got === expected;
    console.log(`  ${ok ? '✓' : '✗'} ${label}`);
    if (!ok) console.log(`    expected=${expected} got=${got} text="${text}"`);
  });

  const placeCases = [
    ['Amazing coffee near Kits Beach in Vancouver',           'Kitsilano Beach'],
    ['Heading to the drive for dinner',                       'Commercial Drive'],
    ['Packed at Rogers Arena tonight',                        'Rogers Arena'],
    ['Police activity on Hastings St',                        'Hastings Street'],
    ['Great views from North Van',                            'North Vancouver'],
    ['Busy at Metrotown right now',                           'Metrotown'],
    ['Strathcona street market today',                        'Strathcona'],
    ['At Stanley Park watching the sunset',                   'Stanley Park'],
  ];

  console.log('\n── Place Extractor Tests ───────────────────────────');
  placeCases.forEach(([text, expected]) => {
    const rawPost = { text, geoPlace: null, authorProfileLocation: null };
    const result  = extractPlace(rawPost);
    const got     = result?.placeName ?? 'NULL';
    const ok      = got === expected;
    console.log(`  ${ok ? '✓' : '✗'} "${text.slice(0, 50)}" → ${got}`);
    if (!ok) console.log(`    expected: ${expected}`);
  });

  const mojibakeCases = [
    // [text, shouldPassFilter, label]
    ['ðŸ‡¹ðŸ‡· Turkish content in Vancouver',              false, 'emoji mojibake → FAIL'],
    ['Ã‡aÄŸlar SÃ¶yÃ¼ncÃ¼ in Vancouver',                 false, 'Latin-1 mojibake → FAIL'],
    ['5ï¸âƒ£ Invictus Games Vancouver BC Place',           false, 'keycap mojibake → FAIL'],
    ['Great time at Gastown tonight! 🍺',                  true,  'valid emoji → PASS'],
    ['Days on the market in Vancouver - 200',              false, 'real estate noise → FAIL'],
    ['Just listed! Open house Saturday in Vancouver',      false, 'open house noise → FAIL'],
  ];

  console.log('\n── Mojibake + Noise Filter Tests ───────────────────');
  const { applyFilters: af } = require('./src/pipeline/filter');
  mojibakeCases.forEach(([text, expected, label]) => {
    const rawPost = { text, isRetweet: false, authorProfileLocation: null, geoPlace: null };
    const { pass } = af(rawPost);
    const ok = pass === expected;
    console.log(`  ${ok ? '✓' : '✗'} ${label}`);
    if (!ok) console.log(`    expected=${expected} got=${pass} text="${text.slice(0,60)}"`);
  });

  console.log();
}

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  const arg = process.argv[2] || 'trending';

  if (arg === 'unit') {
    unitTests();
    return;
  }

  // Always run unit tests first for a quick sanity check
  unitTests();

  if (arg === 'all') {
    await runAll();
  } else {
    try {
      await runCategory(arg);
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  }
})();
