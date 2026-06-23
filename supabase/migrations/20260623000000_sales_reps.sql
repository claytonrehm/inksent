-- Sales rep commission tracking.
-- Model: a rep "lands" a title-company account; we pay a residual on every
-- COLLECTED signing that account sends us (client_paid_at set, not refunded),
-- for the life of the account, plus a one-time producer bonus per account once
-- it crosses a signing threshold. Every dollar paid comes out of revenue we've
-- already collected, so the business is never out of pocket.

-- Ensure the payment-collected marker exists (set by the Stripe webhook). It is
-- referenced by app code but was never in a migration; add it idempotently.
alter table orders add column if not exists client_paid_at timestamptz;
create index if not exists orders_client_paid_idx on orders(client_paid_at);

-- The sales reps (1099 contractors).
create table if not exists sales_reps (
  id                         uuid primary key default gen_random_uuid(),
  created_at                 timestamptz not null default now(),
  name                       text not null,
  email                      text not null,
  phone                      text,
  status                     text not null default 'active' check (status in ('active','inactive')),
  -- Commission terms, per rep so you can offer different deals later.
  residual_per_signing_cents integer not null default 1500,   -- $15 per collected signing
  producer_bonus_cents       integer not null default 20000,  -- $200 once an account hits the threshold
  bonus_threshold            integer not null default 25,     -- collected signings to earn the producer bonus
  notes                      text
);

-- Title-company accounts a rep landed. Orders store the title company as free
-- text (client_company) with no FK, so we match an account to its orders by a
-- normalized key: company_key = lower(trim(collapsed-whitespace)). One rep per
-- account (unique key) prevents double-crediting.
create table if not exists sales_accounts (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  sales_rep_id  uuid not null references sales_reps(id) on delete cascade,
  company_name  text not null,          -- display name as entered
  company_key   text not null unique,   -- normalized match key
  status        text not null default 'active' check (status in ('active','dormant')),
  landed_at     date,
  notes         text
);
create index if not exists sales_accounts_rep_idx on sales_accounts(sales_rep_id);

-- Money actually paid out to a rep, so we can track earned vs paid vs owed.
create table if not exists sales_payouts (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  sales_rep_id  uuid not null references sales_reps(id) on delete cascade,
  amount_cents  integer not null check (amount_cents > 0),
  paid_at       date,
  period_label  text,    -- e.g. "June 2026"
  note          text
);
create index if not exists sales_payouts_rep_idx on sales_payouts(sales_rep_id);

-- Admin-only tables: RLS on + forced, no policies, revoked from public roles.
-- Only the service_role (our server) can touch them.
alter table sales_reps     enable row level security;
alter table sales_accounts enable row level security;
alter table sales_payouts  enable row level security;
alter table sales_reps     force row level security;
alter table sales_accounts force row level security;
alter table sales_payouts  force row level security;
revoke all on sales_reps     from anon, authenticated;
revoke all on sales_accounts from anon, authenticated;
revoke all on sales_payouts  from anon, authenticated;
