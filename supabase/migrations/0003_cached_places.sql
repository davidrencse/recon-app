-- Geocode cache. Stores resolved lat/lng for place name queries.
-- Keyed by normalized place_query string. manual_override rows are never evicted.

create table if not exists cached_places (
  id                    uuid          primary key default gen_random_uuid(),
  place_query           text          not null unique,
  normalized_place_name text,
  display_name          text,
  lat                   double precision not null,
  lng                   double precision not null,
  -- 'nominatim' | 'manual' | 'dictionary'
  provider              text          not null default 'nominatim',
  confidence            numeric(4, 3),
  manual_override       boolean       not null default false,
  created_at            timestamptz   not null default now(),
  updated_at            timestamptz   not null default now(),
  last_used_at          timestamptz
);

create index if not exists idx_cached_places_query  on cached_places (place_query);
create index if not exists idx_cached_places_manual on cached_places (manual_override) where manual_override = true;
