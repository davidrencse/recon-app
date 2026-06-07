-- Deduplication memory. Tracks every source post seen by the ingestion pipeline.
-- Before inserting a pin, check processed_posts to avoid re-processing duplicates.

create table if not exists processed_posts (
  id                uuid        primary key default gen_random_uuid(),
  source            text        not null,
  post_id           text        not null,
  post_url          text,
  creator_handle    text,
  category          text,
  text              text,
  first_seen_at     timestamptz not null default now(),
  last_seen_at      timestamptz not null default now(),
  -- 'accepted' | 'rejected' | 'duplicate' | 'error'
  processing_status text        not null,
  rejection_reason  text,
  raw_source        jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint processed_posts_source_post_id_key unique (source, post_id)
);

create index if not exists idx_processed_posts_lookup   on processed_posts (source, post_id);
create index if not exists idx_processed_posts_created  on processed_posts (created_at desc);
create index if not exists idx_processed_posts_status   on processed_posts (processing_status);
