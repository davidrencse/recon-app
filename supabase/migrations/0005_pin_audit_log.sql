-- Immutable audit trail for pin lifecycle events.
-- pin_id nullable: log entry may be created before the pin row exists (e.g. on rejection).
-- event_type: 'inserted' | 'expired' | 'hidden' | 'deleted' | 'restored' | 'score_updated'

create table if not exists pin_audit_log (
  id              uuid        primary key default gen_random_uuid(),
  pin_id          uuid        references pins(id) on delete set null,
  post_id         text,
  event_type      text        not null,
  previous_status text,
  new_status      text,
  reason          text,
  source          text,
  metadata        jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists idx_pin_audit_pin_id     on pin_audit_log (pin_id);
create index if not exists idx_pin_audit_post_id    on pin_audit_log (post_id);
create index if not exists idx_pin_audit_event_type on pin_audit_log (event_type);
create index if not exists idx_pin_audit_created    on pin_audit_log (created_at desc);
