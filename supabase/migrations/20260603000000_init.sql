-- Notaries table
create table notaries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null unique,
  phone text not null,
  zip_codes text[] not null default '{}',
  commission_state text not null default 'CA',
  nna_certified boolean not null default false,
  active boolean not null default true
);

-- Orders table
create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  status text not null default 'pending'
    check (status in ('pending','dispatching','assigned','confirmed','completed','cancelled')),
  signing_type text not null
    check (signing_type in ('purchase','refinance','heloc','reverse_mortgage','loan_mod','other')),
  signing_date date not null,
  signing_time time not null,
  -- Property
  property_address text not null,
  property_city text not null,
  property_state text not null default 'CA',
  property_zip text not null,
  -- Signer (borrower)
  signer_name text not null,
  signer_phone text not null,
  signer_email text,
  -- Client (title/escrow)
  client_company text not null,
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  -- Assignment
  notary_id uuid references notaries(id),
  -- Fees (stored in cents)
  client_fee integer not null default 19500,
  notary_fee integer not null default 10000,
  -- Meta
  special_instructions text,
  invoice_id text,
  confirmation_number text unique default 'ND-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(gen_random_uuid()::text, 1, 6))
);

-- Index for dispatch queries (find notaries by zip)
create index notaries_zip_codes_idx on notaries using gin(zip_codes);
create index orders_status_idx on orders(status);
create index orders_signing_date_idx on orders(signing_date);
