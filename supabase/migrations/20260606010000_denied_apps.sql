-- Denied notary applications: retain instead of delete, so we can revisit later.
alter table notaries add column if not exists denied_at timestamptz;
alter table notaries add column if not exists denial_reason text;

create index if not exists idx_notaries_denied_at on notaries (denied_at);
