-- ───────────────────────────────────────────────────────────────────────────
-- Notary Business Hub — external subscribers
--
-- The Hub is FREE for Inksent's approved agents (rows in `notaries`), whose data
-- comes straight from `orders`. This migration adds the paid, standalone product
-- for notaries who are NOT on our roster: they subscribe (Stripe) and enter their
-- own jobs manually (`hub_jobs`), reusing the exact same dashboard + metrics.
--
-- Both tables: RLS ON, no policies → locked to the public anon key, reachable only
-- by trusted service-role server code (same model as the rest of the schema).
-- ───────────────────────────────────────────────────────────────────────────

create table if not exists hub_users (
  id                     uuid primary key default gen_random_uuid(),
  created_at             timestamptz not null default now(),
  -- Matched to the Supabase Auth user by email (stored lowercased).
  email                  text not null unique,
  name                   text,
  base_zip               text,
  -- Billing
  stripe_customer_id     text,
  stripe_subscription_id text,
  -- none | trialing | active | past_due | canceled
  subscription_status    text not null default 'none',
  plan                   text,           -- 'monthly' | 'annual'
  current_period_end     timestamptz
);

alter table hub_users enable row level security;

create index if not exists hub_users_email_idx on hub_users (lower(email));

-- Manually-entered signings for a subscriber. Shaped to map cleanly onto the
-- same NotaryOrder used by the Inksent-roster dashboard (fees in integer cents).
create table if not exists hub_jobs (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  hub_user_id    uuid not null references hub_users(id) on delete cascade,
  signing_date   date not null,
  signing_time   time not null default '12:00:00',
  signing_type   text not null default 'other'
    check (signing_type in ('purchase','refinance','heloc','reverse_mortgage','loan_mod','other')),
  signer_name    text not null default 'Signing',
  company        text,                    -- which signing service / title co. (their own AR tracking)
  property_city  text not null default '',
  property_state text not null default 'CA',
  property_zip   text not null,
  fee            integer not null default 0,   -- cents
  status         text not null default 'completed'
    check (status in ('assigned','confirmed','completed','cancelled')),
  completed_at   timestamptz,
  paid_at        timestamptz               -- null = still owed to them (A/R)
);

alter table hub_jobs enable row level security;

create index if not exists hub_jobs_user_idx on hub_jobs (hub_user_id);
create index if not exists hub_jobs_date_idx on hub_jobs (signing_date);
