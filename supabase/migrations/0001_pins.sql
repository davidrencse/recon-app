-- Core pins table. Each row is one map pin derived from a social post.
-- status: active (visible), expired (past expires_at), hidden (manual), rejected, deleted

create table if not exists pins (
  id              uuid        primary key default gen_random_uuid(),
  post_id         text        not null,
  source          text        not null,
  post_url        text,
  creator_handle  text,
  text            text        not null,
  category        text        not null,
  place_name      text        not null,
  neighborhood    text,
  lat             float8      not null,
  lng             float8      not null,
  created_at      timestamptz not null default now(),
  fetched_at      timestamptz not null default now(),
  expires_at      timestamptz not null,
  status          text        not null default 'active',
  activity_score  integer,
  crowd_level     text,
  tags            text[]      not null default '{}',

  constraint pins_category_check
    check (category in ('trending', 'cafes', 'nightlife', 'pop', 'crime_safety')),
  constraint pins_status_check
    check (status in ('active', 'expired', 'hidden', 'rejected', 'deleted')),
  constraint pins_crowd_level_check
    check (crowd_level in ('low', 'medium', 'high') or crowd_level is null),
  constraint pins_source_post_unique
    unique (source, post_id)
);

create index if not exists idx_pins_status_expires
  on pins (status, expires_at)
  where status = 'active';

create index if not exists idx_pins_category
  on pins (category)
  where status = 'active';

create index if not exists idx_pins_created_at
  on pins (created_at desc);

create index if not exists idx_pins_location
  on pins using gist (point(lng, lat))
  where status = 'active';
