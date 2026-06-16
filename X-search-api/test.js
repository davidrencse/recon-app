'use strict';

require('dotenv').config();
require('./src/lib/proxyBootstrap');
const { fetchCategory, ACTIVE_CATEGORIES } = require('./src/searchRunner');
const { applyFilters }   = require('./src/pipeline/filter');
const { extractPlace }   = require('./src/pipeline/placeExtractor');
const { normalizePost }  = require('./src/lib/normalizer');

const RAW_LIMIT    = 20;
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

// ── Unit tests ────────────────────────────────────────────────────────────────

function unitTests() {
  const { isVancouverRelevant, scoreVancouverRelevance } = require('./src/pipeline/filter');
  console.log('\n── Vancouver Relevance Filter Tests ────────────────────');

  const filterCases = [
    // [text, shouldPass, label]

    // ── Strong-term in prose → PASS ──
    ['Great brunch in Kitsilano today!',                                true,  'kitsilano in prose → PASS'],
    ['Heading to Gastown for the market',                               true,  'gastown in prose → PASS'],
    ['SkyTrain is packed right now',                                    true,  'skytrain in prose → PASS'],
    ['Crowd at Kits Beach!',                                            true,  'kits beach in prose → PASS'],
    ['Downtown Vancouver is buzzing',                                   true,  'downtown vancouver in prose → PASS'],
    ['Just saw a show at the Commodore Ballroom!',                      true,  'commodore ballroom in prose → PASS'],

    // ── Hashtag-only Vancouver (threshold 2 via hashtag bonus) → PASS ──
    ['Amazing sunset tonight! #YVR',                                    true,  '#YVR hashtag only → PASS'],
    ['Great food! #Vancouver',                                          true,  '#Vancouver hashtag only → PASS'],
    ['Party time! #Gastown #Vancouver',                                 true,  '#Gastown #Vancouver → PASS'],

    // ── No Vancouver signal → FAIL ──
    ['Random tweet with no location',                                   false, 'no location → FAIL'],
    ['heading downtown for coffee',                                     false, 'downtown alone → FAIL'],

    // ── Multi-city hashtag spam → FAIL (hard reject) ──
    ['eats #Yvr #Ottawa #USA #Alberta',                                 false, 'multi-city hashtag spam → FAIL'],
    ['Photos! #Vancouver #Toronto #London #Paris',                      false, 'four non-Vancouver cities → FAIL'],

    // ── Demoted weak terms (need 2+ or strong companion) ──
    ['Mount Pleasant Baptist Church in Herndon VA',                     false, 'mount pleasant alone → FAIL'],
    ['Great event at Mount Pleasant in Vancouver today',                true,  'mount pleasant + vancouver → PASS'],
    ['Olympic village ceremony tonight in Paris',                       false, 'olympic village alone → FAIL'],

    // ── NOT_VANCOUVER_TERMS hard-fail ──
    ['Caribbean Carnival in downtown Victoria at Ship Point',           false, 'downtown victoria → FAIL'],
    ['Fun times in Victoria BC at the harbour festival',                false, 'victoria bc → FAIL'],
  ];

  let pass = 0; let fail = 0;
  filterCases.forEach(([text, expected, label]) => {
    const rawPost = { text, authorProfileLocation: null, geoPlace: null };
    const got = isVancouverRelevant(rawPost);
    const ok  = got === expected;
    if (ok) pass++; else fail++;
    console.log(`  ${ok ? '✓' : '✗'} ${label}`);
    if (!ok) {
      const score = scoreVancouverRelevance(rawPost);
      console.log(`    expected=${expected} got=${got} score=${score} text="${text}"`);
    }
  });

  console.log(`\n── Place Extractor Tests ────────────────────────────────`);
  const placeCases = [
    // [text, expectedPlace]
    ['Amazing coffee near Kits Beach in Vancouver',            'Kitsilano Beach'],
    ['Heading to the drive for dinner',                        'Commercial Drive'],
    ['Packed at Rogers Arena tonight',                         'Rogers Arena'],
    ['Police activity on Hastings St',                        'Hastings Street'],
    ['Great views from North Van',                             'North Vancouver'],
    ['Busy at Metrotown right now',                            'Metrotown'],
    ['Strathcona street market today',                         'Strathcona'],
    ['At Stanley Park watching the sunset',                    'Stanley Park'],
    // Hashtag-based extraction (compact key lookup)
    ['Match day! #BCPlace #Vancouver',                         'BC Place'],
    ['Late night out #Gastown #Vancouver',                     'Gastown'],
    ['Hiking today! #NorthVan',                                'North Vancouver'],
    ['Just left the Commodore Ballroom — what a show',          'Commodore Ballroom'],
    // Leading-article strip in regex
    ['Just arrived at the Biltmore Cabaret',                   'Biltmore Cabaret'],
    ['Over at the Vogue Theatre right now',                    'Vogue Theatre'],
    // New venue entries
    ['Show at Orpheum Theatre was incredible',                 'Orpheum Theatre'],
    ['Chilling at Deep Cove today',                            'Deep Cove'],
  ];

  placeCases.forEach(([text, expected]) => {
    const rawPost = { text, geoPlace: null, authorProfileLocation: null };
    const result  = extractPlace(rawPost);
    const got     = result?.placeName ?? 'NULL';
    const ok      = got === expected;
    if (ok) pass++; else fail++;
    console.log(`  ${ok ? '✓' : '✗'} "${text.slice(0, 55)}" → ${got}`);
    if (!ok) console.log(`    expected: ${expected}`);
  });

  console.log(`\n── Mojibake + Noise Filter Tests ────────────────────────`);
  const { applyFilters: af } = require('./src/pipeline/filter');
  const mojibakeCases = [
    ['ðŸ‡¹ðŸ‡· Turkish content in Vancouver',              false, 'emoji mojibake → FAIL'],
    ['Ã‡aÄŸlar SÃ¶yÃ¼ncÃ¼ in Vancouver',                 false, 'Latin-1 mojibake → FAIL'],
    ['5ï¸âƒ£ Invictus Games Vancouver BC Place',           false, 'keycap mojibake → FAIL'],
    ['Great time at Gastown tonight! 🍺',                  true,  'valid emoji → PASS'],
    ['Days on the market in Vancouver - 200',              false, 'real estate noise → FAIL'],
    ['Just listed! Open house Saturday in Vancouver',      false, 'open house noise → FAIL'],
  ];

  mojibakeCases.forEach(([text, expected, label]) => {
    const rawPost = { text, isRetweet: false, authorProfileLocation: null, geoPlace: null };
    const { pass: p } = af(rawPost);
    const ok = p === expected;
    if (ok) pass++; else fail++;
    console.log(`  ${ok ? '✓' : '✗'} ${label}`);
    if (!ok) console.log(`    expected=${expected} got=${p} text="${text.slice(0, 60)}"`);
  });

  console.log(`\n  Result: ${pass} passed, ${fail} failed\n`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  const arg = process.argv[2] || 'trending';

  if (arg === 'unit') {
    unitTests();
    return;
  }

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
