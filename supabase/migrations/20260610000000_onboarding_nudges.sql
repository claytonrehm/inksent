-- Recover the biggest mid-funnel leak: notaries who get approved but never finish
-- their profile. We stamp when they're approved, then the escalate cron sends a
-- gentle "finish your profile" nudge (SMS + email) a couple of times, spaced out.
alter table notaries add column if not exists approved_at timestamptz;
alter table notaries add column if not exists nudged_at   timestamptz;
alter table notaries add column if not exists nudge_count int not null default 0;

-- Backfill: anyone already approved (active) but with no approved_at — treat their
-- created_at as the approval time so the nudge cadence has a starting point.
update notaries
   set approved_at = coalesce(approved_at, created_at)
 where active = true
   and approved_at is null;
