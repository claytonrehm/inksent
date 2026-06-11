-- Security & accountability: a single append-only audit trail of who did what.
-- Covers admin actions (logins, refunds, payouts, approvals/denials, deactivations,
-- credential edits) and sensitive document access. One generic table keeps it simple
-- and queryable; `meta` holds action-specific detail.
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  actor       text,          -- admin email, notary id, 'system', or 'cron'
  actor_type  text,          -- 'admin' | 'system' | 'notary' | 'client'
  action      text not null, -- 'admin_login' | 'refund' | 'pay_notary' | 'approve_notary' | ...
  entity_type text,          -- 'order' | 'notary' | 'auth' | 'document'
  entity_id   text,
  ip          text,
  success     boolean default true,
  meta        jsonb
);
create index if not exists audit_log_created_idx on audit_log (created_at desc);
create index if not exists audit_log_entity_idx  on audit_log (entity_type, entity_id);
create index if not exists audit_log_action_idx  on audit_log (action);
alter table audit_log enable row level security;
