-- Credential lifecycle: track NNA certification renewal and throttle the combined
-- credential-renewal reminders the cron sends to notaries.
alter table notaries add column if not exists nna_cert_expiry  date;
alter table notaries add column if not exists cred_reminder_at  timestamptz;
