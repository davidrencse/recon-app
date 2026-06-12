'use strict';

require('dotenv').config();
require('./src/lib/proxyBootstrap');
const { fetchCategory, DEFAULT_MAX_PER_CATEGORY } = require('./src/searchRunner');

(async () => {
  const category = process.argv[2] || 'weather';
  const runId    = `test-${Date.now()}`;
  const limit    = 5;

  console.log(`\nSmoke test: category=${category} run_id=${runId}\n`);

  try {
    const context = {
      runId,
      seenIds:        new Set(),
      deadlineAt:     Date.now() + 30_000, // 30s for test run
      maxPerCategory: limit,
    };

    const { posts, fetched, accepted, rejected, duplicates, partial } =
      await fetchCategory(category, context);

    console.log(`\nResult: fetched=${fetched} accepted=${accepted} rejected=${rejected} duplicates=${duplicates} partial=${partial}\n`);

    if (!posts.length) {
      console.log('No posts returned — posts may have been filtered out.');
    } else {
      posts.forEach((post, i) => {
        console.log(`--- Post ${i + 1} ---`);
        console.log(`  id:         ${post.source_post_id}`);
        console.log(`  handle:     @${post.creator_handle}`);
        console.log(`  place_hint: ${post.place_hint}`);
        console.log(`  category:   ${post.category}`);
        console.log(`  raw_geo:    ${post.raw_geo ? JSON.stringify(post.raw_geo) : 'none'}`);
        console.log(`  created_at: ${post.source_created_at}`);
        console.log(`  method:     ${post.raw_source?.extraction_method ?? 'n/a'} (${post.raw_source?.extraction_confidence ?? '?'})`);
        console.log(`  text:       ${post.text.slice(0, 100)}...`);
        console.log();
      });
    }

    console.log(`Done. ${posts.length} post(s) ready to send to Recon ingest.`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
