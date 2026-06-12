-- Notary referral program: who referred whom + whether the referral bounty paid.
alter table notaries add column if not exists referred_by uuid references notaries(id);
alter table notaries add column if not exists referral_bounty_paid_at timestamptz;
create index if not exists idx_notaries_referred_by on notaries(referred_by);
