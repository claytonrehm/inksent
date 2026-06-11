-- Site features pass: invoice pay links, client cancel/reschedule, decline reasons,
-- and abuse rate-limiting on public forms.

-- Persisted Stripe pay link so the portal can show a "Pay" button without minting a
-- new payment link on every page view.
alter table orders add column if not exists pay_url text;

-- Client-initiated lifecycle.
alter table orders add column if not exists cancelled_at   timestamptz;
alter table orders add column if not exists rescheduled_at timestamptz;

-- Why a notary passed/cancelled — improves future matching + admin visibility.
alter table notary_cancellations add column if not exists reason text;

-- ─── Rate limiting ────────────────────────────────────────────────────────────
-- Atomic fixed-window limiter. Returns TRUE if the request is allowed, FALSE if the
-- key has exceeded p_limit within the last p_window_seconds. Server calls this via
-- RPC with the service-role client, so RLS is bypassed; we still enable RLS with no
-- policies so the table is never publicly readable.
create table if not exists rate_limits (
  key          text primary key,
  window_start timestamptz not null default now(),
  count        integer     not null default 0
);
alter table rate_limits enable row level security;

create or replace function check_rate_limit(p_key text, p_limit int, p_window_seconds int)
returns boolean
language plpgsql
as $$
declare
  v_now timestamptz := now();
  v_row rate_limits;
begin
  select * into v_row from rate_limits where key = p_key for update;
  if not found then
    insert into rate_limits(key, window_start, count) values (p_key, v_now, 1);
    return true;
  end if;
  -- Window expired → reset.
  if v_row.window_start < v_now - make_interval(secs => p_window_seconds) then
    update rate_limits set window_start = v_now, count = 1 where key = p_key;
    return true;
  end if;
  -- Within window and at/over the cap → reject.
  if v_row.count >= p_limit then
    return false;
  end if;
  update rate_limits set count = count + 1 where key = p_key;
  return true;
end;
$$;
