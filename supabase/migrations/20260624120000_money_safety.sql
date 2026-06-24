-- Money-safety: webhook event idempotency + payout reversibility.

-- Dedup Stripe webhook deliveries (Stripe sends events at-least-once and retries).
create table if not exists stripe_events (
  id           text primary key,
  type         text,
  processed_at timestamptz not null default now()
);
alter table stripe_events enable row level security;
alter table stripe_events force row level security;
revoke all on stripe_events from anon, authenticated;

-- Store the Stripe transfer id of a notary payout so a refund can reverse it.
alter table orders add column if not exists notary_transfer_id text;
