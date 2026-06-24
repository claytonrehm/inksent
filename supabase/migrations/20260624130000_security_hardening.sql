-- Security hardening: force RLS everywhere + lock down the rate-limit function.

-- Force RLS + revoke public access on EVERY public table (defense in depth).
-- Covers tables created after the earlier global backfill (hub_users, hub_jobs,
-- audit_log, partner_applications, rate_limits, stripe_events, sales_*). Safe to
-- re-run. With RLS forced + no policies, only the service_role (our server) can
-- read/write — anon/authenticated are denied even if a stray policy appears.
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security;', r.tablename);
    execute format('alter table public.%I force row level security;', r.tablename);
    execute format('revoke all on public.%I from anon, authenticated;', r.tablename);
  end loop;
end $$;

-- The rate limiter is only ever called by the server (service_role). Make it run
-- as definer and revoke it from the public API roles so anon/authenticated can't
-- invoke it to probe or contend on the lock table.
alter function check_rate_limit(text, integer, integer) security definer;
revoke all on function check_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function check_rate_limit(text, integer, integer) to service_role;
