-- Self-service availability: notaries can now set/update their coarse availability
-- windows after apply, via a no-login one-tap link (/availability/[id]). This column
-- records when we last prompted a notary who had no availability on file, so the
-- nudge can be throttled / audited (mirrors `nudged_at` for onboarding).
alter table notaries add column if not exists availability_nudged_at timestamptz;
