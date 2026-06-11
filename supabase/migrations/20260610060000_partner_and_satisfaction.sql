-- Title-company enrollment leads.
create table if not exists partner_applications (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  company            text not null,
  contact_name       text not null,
  email              text not null,
  phone              text,
  role               text,
  monthly_volume     text,
  billing_preference text,
  message            text,
  status             text not null default 'new'
);
alter table partner_applications enable row level security;

-- One-click client satisfaction on a completed signing (folded into the existing
-- completion email — no extra message). 'up' | 'down'.
alter table orders add column if not exists client_satisfaction text;
alter table orders add column if not exists client_feedback_at  timestamptz;
