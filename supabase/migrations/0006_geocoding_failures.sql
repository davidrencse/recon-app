-- Persistent cooldown tracking for failed Nominatim geocoding queries.
-- Prevents hammering Nominatim for queries that consistently fail.

create table if not exists geocoding_failures (
  normalized_query  text        primary key,
  original_query    text        not null,
  reason            text        not null,
  failure_count     integer     not null default 1,
  last_failed_at    timestamptz not null default now(),
  cooldown_until    timestamptz not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_geocoding_failures_cooldown
  on geocoding_failures (cooldown_until)
  where cooldown_until > now();
