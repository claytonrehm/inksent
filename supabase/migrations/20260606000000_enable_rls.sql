-- =====================================================================
-- SECURITY: Enable Row Level Security on all tables.
--
-- The server now talks to the database with the SERVICE-ROLE key, which
-- bypasses RLS. Enabling RLS with NO policies means the public anon key
-- (embedded in the website's JavaScript) can no longer read or write ANY
-- table — closing the PII exposure. Service-role (server) access is
-- unaffected.
--
-- Run this in the Supabase SQL editor AFTER the service-role deploy is live.
-- =====================================================================

alter table orders                enable row level security;
alter table notaries              enable row level security;
alter table notary_cancellations  enable row level security;

-- Force RLS even for the table owner role, for defense in depth.
alter table orders                force row level security;
alter table notaries              force row level security;
alter table notary_cancellations  force row level security;

-- No policies are created on purpose: with RLS enabled and zero policies,
-- the anon and authenticated roles are denied all access. Only the
-- service_role (used exclusively by our trusted server) can read/write.

-- Belt-and-suspenders: explicitly revoke table privileges from the public
-- API roles so a future stray policy can't accidentally widen access.
revoke all on orders               from anon, authenticated;
revoke all on notaries             from anon, authenticated;
revoke all on notary_cancellations from anon, authenticated;
