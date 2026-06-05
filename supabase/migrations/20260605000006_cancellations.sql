-- Track notary cancellations (accepted then bailed) with timing, to spot repeat offenders
create table if not exists notary_cancellations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  notary_id uuid references notaries(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  hours_before_signing numeric,
  signer_name text,
  confirmation_number text
);

create index if not exists notary_cancellations_notary_idx on notary_cancellations(notary_id);

alter table notaries add column if not exists times_cancelled integer default 0;
