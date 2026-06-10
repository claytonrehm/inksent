-- =====================================================================
-- SECURITY FIX: enable RLS on notary_ratings (and any other table that
-- slipped through). The original RLS migration missed notary_ratings,
-- which was created directly in the dashboard — Supabase flagged it as
-- "Table publicly accessible (rls_disabled_in_public)".
--
-- The server uses the SERVICE-ROLE key (bypasses RLS), so enabling RLS
-- with no policies simply denies the public anon/authenticated roles —
-- closing the hole without breaking the app.
-- =====================================================================

alter table notary_ratings enable row level security;
alter table notary_ratings force row level security;
revoke all on notary_ratings from anon, authenticated;

-- Belt-and-suspenders: enable RLS + force + revoke on EVERY table in the
-- public schema, so nothing is ever left publicly accessible again.
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security;', r.tablename);
    execute format('alter table public.%I force row level security;', r.tablename);
    execute format('revoke all on public.%I from anon, authenticated;', r.tablename);
  end loop;
end $$;
