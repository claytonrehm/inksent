-- Post-signing flow
alter table orders add column if not exists completed_at timestamptz;
alter table orders add column if not exists scan_backs jsonb not null default '[]'::jsonb;
-- Escalation timing + spam gate
alter table orders add column if not exists dispatched_at timestamptz;
alter table orders add column if not exists escalated_at timestamptz;
alter table orders add column if not exists hold_for_review boolean not null default false;
-- Bilingual
alter table orders add column if not exists language_needed text;
alter table notaries add column if not exists languages text[] not null default '{}';
-- Borrower heads-up
alter table orders add column if not exists borrower_notified_at timestamptz;
