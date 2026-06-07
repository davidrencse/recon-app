-- One row per cron-triggered ingestion run. Used for monitoring and debugging.
-- status: 'running' | 'completed' | 'failed' | 'partial'

create table if not exists ingestion_jobs (
  id                 uuid        primary key default gen_random_uuid(),
  source             text        not null,
  status             text        not null,
  started_at         timestamptz not null default now(),
  finished_at        timestamptz,
  category           text,
  query_used         text,
  posts_fetched      integer     not null default 0,
  posts_rejected     integer     not null default 0,
  posts_accepted     integer     not null default 0,
  pins_inserted      integer     not null default 0,
  geocode_calls_made integer     not null default 0,
  error_message      text,
  metadata           jsonb,
  created_at         timestamptz not null default now()
);

create index if not exists idx_ingestion_jobs_started  on ingestion_jobs (started_at desc);
create index if not exists idx_ingestion_jobs_status   on ingestion_jobs (status);
create index if not exists idx_ingestion_jobs_source   on ingestion_jobs (source);
