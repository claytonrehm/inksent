-- Sales rep recruiting funnel: applications + onboarding fields on sales_reps.

create table if not exists sales_rep_applications (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  name                text not null,
  email               text not null,
  phone               text not null,
  location            text,   -- city, state (role is remote)
  years_sales         text,   -- bucket
  b2b_experience      text,   -- extensive / some / none
  industry_experience text,   -- title/escrow/RE: current / past / none
  title_relationships text,   -- many / some / none (the rolodex)
  linkedin_url        text,
  pitch               text,   -- why they're a fit
  heard_from          text,
  sms_consent_at      timestamptz,
  status              text not null default 'new' check (status in ('new','approved','rejected')),
  reviewed_at         timestamptz,
  notes               text
);
create index if not exists sales_rep_applications_status_idx on sales_rep_applications(status);
create unique index if not exists sales_rep_applications_email_key on sales_rep_applications(lower(email));

alter table sales_rep_applications enable row level security;
alter table sales_rep_applications force row level security;
revoke all on sales_rep_applications from anon, authenticated;

-- Onboarding tracking on the rep record (filled after an applicant is approved).
alter table sales_reps add column if not exists application_id uuid references sales_rep_applications(id);
alter table sales_reps add column if not exists agreement_accepted_at timestamptz;
alter table sales_reps add column if not exists w9_received boolean not null default false;
alter table sales_reps add column if not exists payment_method text;   -- e.g. ACH, Zelle
alter table sales_reps add column if not exists payment_details text;  -- where to send it
alter table sales_reps add column if not exists onboarded_at timestamptz;
