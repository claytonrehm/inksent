-- Stripe Connect: each notary links a payout account so we can auto-pay them
alter table notaries add column if not exists stripe_account_id text;
alter table notaries add column if not exists payouts_enabled boolean not null default false;
